import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { generateDocumentNumber } from '@/lib/generateNumber';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search, type, status, date, customerId } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [
          { id: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { buyerName: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (type && type !== 'all') where.type = type;
      if (status && status !== 'all') where.status = status;
      if (customerId) where.customerId = customerId;
      
      if (date) {
        const d = new Date(date);
        where.createdAt = {
          gte: new Date(d.setHours(0,0,0,0)),
          lt: new Date(d.setHours(23,59,59,999))
        };
      }
      
      const { paymentStatus } = req.query;
      if (paymentStatus && paymentStatus !== 'all') {
        if (paymentStatus === 'paid') where.paymentStatus = 'PAID';
        if (paymentStatus === 'partially paid') where.paymentStatus = 'PARTIALLY_PAID';
        if (paymentStatus === 'unpaid') where.paymentStatus = 'UNPAID';
      }

      // Stats calculation on the filtered dataset
      const [total, orders, statsAggr, pendingAggr] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: { customer: { select: { id: true, name: true, phone: true } }, items: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.order.aggregate({
          where,
          _sum: { total: true, amountPaid: true }
        }),
        prisma.order.count({
          where: { ...where, status: { in: ['PENDING', 'PROCESSING'] } }
        })
      ]);

      const totalValue = statsAggr._sum.total || 0;
      const amountPaid = statsAggr._sum.amountPaid || 0;
      const unpaidValue = Math.max(0, totalValue - amountPaid);

      return res.status(200).json({
        success: true,
        data: orders,
        stats: {
          totalOrders: total,
          totalValue,
          pendingCount: pendingAggr,
          unpaidValue
        },
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      const { items, ...orderData } = req.body;
      const orderNumber = await generateDocumentNumber(prisma.order, 'ORD');
      const order = await prisma.order.create({
        data: {
          ...orderData,
          orderNumber,
          items: {
            create: items
          }
        },
        include: { items: true, customer: true }
      });
      return res.status(201).json({ success: true, message: 'Order created successfully', data: order });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
