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
    
    const activeAssociates = await prisma.associate.count({
      where: { status: 'ACTIVE' }
    });
    
    const allInventory = await prisma.inventoryItem.findMany({
      select: { id: true, name: true, sku: true, currentPurchaseStock: true, minimumStock: true, purchaseUnit: true }
    });
    
    const lowStockItems = allInventory
      .filter(item => Number(item.currentPurchaseStock) <= Number(item.minimumStock))
      .slice(0, 5); // Limit to top 5 for alerts
      
    const lowStockCount = allInventory.filter(item => Number(item.currentPurchaseStock) <= Number(item.minimumStock)).length;

    
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenueAgg._sum.total || 0,
        activeOrders,
        pendingInvoices,
        newLeads,
        activeAssociates,
        lowStockCount,
        lowStockItems: lowStockItems.map(item => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            stockQty: item.currentPurchaseStock,
            reorderThreshold: item.minimumStock,
            baseUnit: item.purchaseUnit
        }))
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
