import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const totalOrders = await prisma.order.count();
    
    const aggregations = await prisma.order.aggregate({
      _sum: { total: true },
    });
    const totalValue = aggregations._sum.total || 0;

    const pendingCount = await prisma.order.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } }
    });

    const unpaidAgg = await prisma.order.aggregate({
      where: { paymentStatus: { in: ['UNPAID', 'PARTIAL'] } },
      _sum: { total: true }
    });
    const unpaidValue = unpaidAgg._sum.total || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalValue,
        pendingCount,
        unpaidValue
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
