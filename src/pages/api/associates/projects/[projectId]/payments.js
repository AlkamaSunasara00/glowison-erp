import prisma from '@/lib/prisma';
import { assertServerEnv } from '@/lib/server-env';

export default async function handler(req, res) {
  assertServerEnv();
  const { projectId: projectAssociateId } = req.query;

  try {
    const pa = await prisma.projectAssociate.findUnique({
      where: { id: projectAssociateId }
    });
    if (!pa) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (req.method === 'POST') {
      const { amount, paymentMethod, date, notes } = req.body;
      const parsedAmount = parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Valid amount is required' });
      }

      await prisma.$transaction(async (tx) => {
        // Create payment
        await tx.projectPayment.create({
          data: {
            projectId: pa.projectId,
            associateId: pa.associateId,
            amount: parsedAmount,
            paymentMethod: paymentMethod || 'CASH',
            date: date ? new Date(date) : undefined,
            notes
          }
        });

        // Update PA balances
        const currentPa = await tx.projectAssociate.findUnique({ where: { id: projectAssociateId } });
        const newPaid = parseFloat(currentPa.paidAmount) + parsedAmount;
        const total = parseFloat(currentPa.totalAmount);
        const newDue = Math.max(0, total - newPaid);

        let paymentStatus = 'UNPAID';
        if (newPaid >= total && total > 0) paymentStatus = 'PAID';
        else if (newPaid > 0) paymentStatus = 'PARTIAL';

        await tx.projectAssociate.update({
          where: { id: projectAssociateId },
          data: { paidAmount: newPaid, dueAmount: newDue, paymentStatus }
        });

        // Also update master project balances
        const project = await tx.project.findUnique({ where: { id: pa.projectId } });
        if (project) {
          const projectPaid = parseFloat(project.paidAmount) + parsedAmount;
          const projectTotal = parseFloat(project.totalAmount);
          const projectDue = Math.max(0, projectTotal - projectPaid);
          let pStatus = 'UNPAID';
          if (projectPaid >= projectTotal && projectTotal > 0) pStatus = 'PAID';
          else if (projectPaid > 0) pStatus = 'PARTIAL';
          await tx.project.update({
            where: { id: pa.projectId },
            data: { paidAmount: projectPaid, dueAmount: projectDue, paymentStatus: pStatus }
          });
        }
      });

      return res.status(200).json({ success: true, message: 'Payment recorded' });
    }

    if (req.method === 'DELETE') {
      const { paymentId } = req.query;

      if (!paymentId) return res.status(400).json({ success: false, message: 'paymentId required' });

      const payment = await prisma.projectPayment.findUnique({ where: { id: paymentId } });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

      await prisma.$transaction(async (tx) => {
        await tx.projectPayment.delete({ where: { id: paymentId } });

        // Update PA balances
        const currentPa = await tx.projectAssociate.findUnique({ where: { id: projectAssociateId } });
        const newPaid = Math.max(0, parseFloat(currentPa.paidAmount) - parseFloat(payment.amount));
        const total = parseFloat(currentPa.totalAmount);
        const newDue = Math.max(0, total - newPaid);

        let paymentStatus = 'UNPAID';
        if (newPaid >= total && total > 0) paymentStatus = 'PAID';
        else if (newPaid > 0) paymentStatus = 'PARTIAL';

        await tx.projectAssociate.update({
          where: { id: projectAssociateId },
          data: { paidAmount: newPaid, dueAmount: newDue, paymentStatus }
        });
      });

      return res.status(200).json({ success: true, message: 'Payment deleted' });
    }

    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
