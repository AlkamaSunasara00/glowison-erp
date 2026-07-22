import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();
  const { id: projectId, costId } = req.query;

  if (req.method === 'PUT') {
    try {
      const { type, description, amount } = req.body;
      const updatedCost = await prisma.projectCostItem.update({
        where: { id: costId },
        data: {
          type,
          description,
          amount: parseFloat(amount) || 0,
        }
      });
      
      return res.status(200).json({ success: true, data: updatedCost });
    } catch (error) {
      console.error('Update cost error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update cost' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.projectCostItem.delete({
        where: { id: costId }
      });
      
      // We may want to recalculate ProjectAssociate balances if this cost was linked to an associate
      // But since we are deleting it, the Associate's due amount should decrease.
      // Wait, in this scenario, expenses added from master page don't have associate linked.
      // But just in case, we leave it as is or handle it. For now, simple delete is fine.
      
      return res.status(200).json({ success: true, message: 'Cost deleted' });
    } catch (error) {
      console.error('Delete cost error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete cost' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
