import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const totalRevenueAgg = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { total: true }
    });
    
    const activeOrders = await prisma.order.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } }
    });
    
    const pendingInvoices = await prisma.invoice.count({
      where: { status: { in: ['SENT', 'DRAFT'] } }
    });
    
    const newLeads = await prisma.lead.count({
      where: { status: 'NEW' }
    });
    
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenueAgg._sum.total || 0,
        activeOrders,
        pendingInvoices,
        newLeads
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
