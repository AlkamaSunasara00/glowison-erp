import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { projectId } = req.query;

  try {
    if (req.method === 'GET') {
      const payments = await prisma.projectPayment.findMany({
        where: { projectId },
        orderBy: { date: 'desc' }
      });
      return res.status(200).json({ success: true, data: payments });
    }

    if (req.method === 'POST') {
      const { amount, paymentMethod, date, notes } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
      }

      // Create payment record
      const payment = await prisma.projectPayment.create({
        data: {
          projectId,
          amount: parseFloat(amount),
          paymentMethod: paymentMethod || 'CASH',
          date: date ? new Date(date) : new Date(),
          notes: notes || null
        }
      });

      // Recalculate project payment totals
      const allPayments = await prisma.projectPayment.findMany({
        where: { projectId },
        select: { amount: true }
      });

      const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const project = await prisma.associateProject.findUnique({
        where: { id: projectId },
        select: { totalAmount: true }
      });

      const totalAmount = parseFloat(project?.totalAmount || 0);
      const dueAmount = Math.max(0, totalAmount - totalPaid);
      let paymentStatus = 'UNPAID';
      if (totalPaid >= totalAmount && totalAmount > 0) paymentStatus = 'PAID';
      else if (totalPaid > 0) paymentStatus = 'PARTIAL';

      await prisma.associateProject.update({
        where: { id: projectId },
        data: { paidAmount: totalPaid, dueAmount, paymentStatus }
      });

      return res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: { payment, paidAmount: totalPaid, dueAmount, paymentStatus }
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
