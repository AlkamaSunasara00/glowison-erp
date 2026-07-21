import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10, search, type } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (type && type !== 'all') where.type = type;

      const [total, customers, statsAggr, newAggr] = await Promise.all([
        prisma.customer.count({ where }),
        prisma.customer.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            orders: {
              where: { status: 'COMPLETED' },
              select: { total: true }
            }
          }
        }),
        prisma.customer.groupBy({
          by: ['type'],
          where,
          _count: { _all: true }
        }),
        prisma.customer.count({
          where: {
            ...where,
            createdAt: { gte: new Date(new Date().setDate(1)) } // beginning of month
          }
        })
      ]);
      
      const retailCount = statsAggr.find(s => s.type === 'RETAIL')?._count._all || 0;
      const dealerCount = statsAggr.find(s => s.type === 'DEALER')?._count._all || 0;

      const customersWithTotals = customers.map(c => {
        const totalValue = c.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const { orders, ...customerData } = c;
        return {
          ...customerData,
          totalOrderValue: `Rs. ${totalValue.toLocaleString()}`
        };
      });

      return res.status(200).json({
        success: true,
        data: customersWithTotals,
        stats: {
          totalCustomers: total,
          retailCount,
          dealerCount,
          newCustomers: newAggr
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
      const customer = await prisma.customer.create({ data: req.body });
      return res.status(201).json({ success: true, message: 'Customer added successfully', data: customer });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
