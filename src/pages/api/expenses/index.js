import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { generateDocumentNumber } from '@/lib/generateNumber';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 50, search, category, supplierId, status, dateFrom, dateTo, includeStats } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      
      if (search) {
        where.OR = [
          { expenseNumber: { contains: search, mode: 'insensitive' } },
          { paidToName: { contains: search, mode: 'insensitive' } },
          { note: { contains: search, mode: 'insensitive' } },
          { referenceNumber: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (category) where.category = category;
      if (supplierId) where.supplierId = supplierId;
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.spentOn = {};
        if (dateFrom) where.spentOn.gte = new Date(dateFrom);
        if (dateTo) {
          const dt = new Date(dateTo);
          dt.setHours(23, 59, 59, 999);
          where.spentOn.lte = dt;
        }
      }

      const [total, items] = await Promise.all([
        prisma.expense.count({ where }),
        prisma.expense.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { spentOn: 'desc' },
          include: { supplier: true }
        })
      ]);

      let stats = null;
      if (includeStats === 'true') {
        const allExpenses = await prisma.expense.findMany({
          where,
          select: { amount: true, status: true, category: true, paymentMethod: true, dueAmount: true, paidAmount: true }
        });
        
        let totalAmount = 0;
        let dueAmount = 0;
        let paidAmount = 0;
        
        const categoryBreakdown = {};
        const methodBreakdown = {};

        allExpenses.forEach(exp => {
          const amt = parseFloat(exp.amount || 0);
          totalAmount += amt;
          dueAmount += parseFloat(exp.dueAmount || 0);
          paidAmount += parseFloat(exp.paidAmount || 0);
          
          categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + amt;
          methodBreakdown[exp.paymentMethod] = (methodBreakdown[exp.paymentMethod] || 0) + amt;
        });

        stats = {
          totalAmount,
          dueAmount,
          paidAmount,
          categoryBreakdown,
          methodBreakdown
        };
      }

      return res.status(200).json({
        success: true,
        data: items,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
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

      const expenseNumber = await generateDocumentNumber(prisma.expense, 'EXP');

      const totalAmt = parseFloat(amount || 0);
      let pAmount = 0;
      let dAmount = totalAmt;

      if (status === 'PAID') {
        pAmount = totalAmt;
        dAmount = 0;
      } else if (status === 'PARTIALLY_PAID') {
        pAmount = parseFloat(paidAmount || 0);
        dAmount = totalAmt - pAmount;
      } else { // PENDING
        pAmount = 0;
        dAmount = totalAmt;
      }

      const item = await prisma.expense.create({
        data: {
          expenseNumber,
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
          createdBy: req.user?.id
        }
      });
      
      return res.status(201).json({ success: true, message: 'Created successfully', data: item });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
