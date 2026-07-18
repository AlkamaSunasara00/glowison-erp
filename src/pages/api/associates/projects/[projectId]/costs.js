import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { projectId } = req.query;

  try {
    if (req.method === 'POST') {
      const { items } = req.body; // Array of { id?, type, description, quantity, rate }

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Items array is required' });
      }

      // Delete all existing cost items, then recreate
      await prisma.projectCostItem.deleteMany({ where: { projectId } });

      const costItems = items.map(item => ({
        projectId,
        type: item.type || 'LABOUR',
        description: item.description || null,
        quantity: parseFloat(item.quantity || 1),
        rate: parseFloat(item.rate || 0),
        amount: parseFloat(item.quantity || 1) * parseFloat(item.rate || 0)
      }));

      if (costItems.length > 0) {
        await prisma.projectCostItem.createMany({ data: costItems });
      }

      // Recalculate project totals
      const totalAmount = costItems.reduce((sum, ci) => sum + ci.amount, 0);
      const project = await prisma.associateProject.findUnique({
        where: { id: projectId },
        select: { paidAmount: true }
      });

      const paidAmount = parseFloat(project?.paidAmount || 0);
      const dueAmount = Math.max(0, totalAmount - paidAmount);
      let paymentStatus = 'UNPAID';
      if (paidAmount >= totalAmount && totalAmount > 0) paymentStatus = 'PAID';
      else if (paidAmount > 0) paymentStatus = 'PARTIAL';

      await prisma.associateProject.update({
        where: { id: projectId },
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
};

export default withAuth(handler);
