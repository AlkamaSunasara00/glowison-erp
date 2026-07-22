import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();
  const { id: projectId } = req.query;

  if (req.method === 'GET') {
    try {
      const costs = await prisma.projectCostItem.findMany({
        where: { projectId },
        include: { associate: true }
      });
      return res.status(200).json({ success: true, data: costs });
    } catch (error) {
      console.error('Fetch costs error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch costs' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { associateId, type, description, quantity, rate, amount } = req.body;
      
      const newCost = await prisma.projectCostItem.create({
        data: {
          projectId,
          associateId: associateId || null,
          type,
          description,
          quantity: quantity || 1,
          rate: rate || 0,
          amount: amount || 0,
        }
      });
      return res.status(201).json({ success: true, data: newCost });
    } catch (error) {
      console.error('Add cost error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add project cost' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
