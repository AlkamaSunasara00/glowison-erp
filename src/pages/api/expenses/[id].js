import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await prisma.expense.findUnique({ 
        where: { id },
        include: { supplier: true }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(200).json({ success: true, data: item });
    }

    if (req.method === 'PUT') {
      const {
        category,
        categoryOther,
        paidToType,
        paidToName,
        supplierId,
        amount,
        paidAmount,
        paymentMethod,
        status,
        referenceNumber,
        receiptUrl,
        spentOn,
        note,
      } = req.body;

      const totalAmt = parseFloat(amount || 0);
      let pAmount = 0;
      let dAmount = totalAmt;

      if (status === 'PAID') {
        pAmount = totalAmt;
        dAmount = 0;
      } else if (status === 'PARTIALLY_PAID') {
        pAmount = parseFloat(paidAmount || 0);
        dAmount = totalAmt - pAmount;
      } else {
        pAmount = 0;
        dAmount = totalAmt;
      }

      const item = await prisma.expense.update({
        where: { id },
        data: {
          category,
          categoryOther,
          paidToType,
          paidToName,
          supplierId: supplierId || null,
          amount: totalAmt,
          paidAmount: pAmount,
          dueAmount: dAmount,
          paymentMethod,
          status,
          referenceNumber,
          receiptUrl,
          spentOn: new Date(spentOn),
          note,
        }
      });
      return res.status(200).json({ success: true, message: 'Updated successfully', data: item });
    }

    if (req.method === 'DELETE') {
      await prisma.expense.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
