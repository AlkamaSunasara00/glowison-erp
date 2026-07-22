import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();
  // Here projectId is the ProjectAssociate ID
  const { projectId: projectAssociateId } = req.query;

  try {
    if (req.method === 'POST') {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Items array is required' });
      }

      const pa = await prisma.projectAssociate.findUnique({
        where: { id: projectAssociateId }
      });
      if (!pa) return res.status(404).json({ success: false, message: 'Assignment not found' });

      // Delete all existing cost items for THIS associate on THIS project
      await prisma.projectCostItem.deleteMany({ 
        where: { projectId: pa.projectId, associateId: pa.associateId } 
      });

      const costItems = items.map(item => ({
        projectId: pa.projectId,
        associateId: pa.associateId,
        type: item.type || 'LABOUR',
        description: item.description || null,
        quantity: parseFloat(item.quantity || 1),
        rate: parseFloat(item.rate || 0),
        amount: parseFloat(item.quantity || 1) * parseFloat(item.rate || 0)
      }));

      if (costItems.length > 0) {
        await prisma.projectCostItem.createMany({ data: costItems });
      }

      // Recalculate associate's cut
      const totalAmount = costItems.reduce((sum, ci) => sum + ci.amount, 0);
      const paidAmount = parseFloat(pa.paidAmount || 0);
      const dueAmount = Math.max(0, totalAmount - paidAmount);
      
      let paymentStatus = 'UNPAID';
      if (paidAmount >= totalAmount && totalAmount > 0) paymentStatus = 'PAID';
      else if (paidAmount > 0) paymentStatus = 'PARTIAL';

      await prisma.projectAssociate.update({
        where: { id: projectAssociateId },
        data: { totalAmount, dueAmount, paymentStatus }
      });

      return res.status(200).json({
        success: true,
        message: 'Cost breakdown saved',
        data: { totalAmount, paidAmount, dueAmount, paymentStatus }
      });
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
