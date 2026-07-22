import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();
  const { id: projectId } = req.query;

  if (req.method === 'GET') {
    try {
      const payments = await prisma.projectPayment.findMany({
        where: { projectId },
        include: { associate: true }
      });
      return res.status(200).json({ success: true, data: payments });
    } catch (error) {
      console.error('Fetch payments error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { associateId, amount, paymentMethod, date, notes } = req.body;
      
      const newPayment = await prisma.projectPayment.create({
        data: {
          projectId,
          associateId: associateId || null,
          amount,
          paymentMethod,
          date: date ? new Date(date) : new Date(),
          notes,
        }
      });
      return res.status(201).json({ success: true, data: newPayment });
    } catch (error) {
      console.error('Add payment error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add project payment' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
