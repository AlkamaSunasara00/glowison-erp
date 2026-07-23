import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const [
      totalRevenueAgg,
      totalExpenseAgg,
      totalPurchaseAgg,
      totalAssociatePaidAgg,
      activeOrders,
      pendingInvoices,
      newLeads,
      activeAssociates,
      allInventory
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { total: true }
      }),
      prisma.expense.aggregate({
        _sum: { amount: true }
      }),
      prisma.purchase.aggregate({
        _sum: { grandTotal: true }
      }),
      prisma.projectPayment.aggregate({
        _sum: { amount: true }
      }),
      prisma.order.count({
        where: { status: { in: ['PENDING', 'PROCESSING'] } }
      }),
      prisma.invoice.count({
        where: { status: { in: ['SENT', 'DRAFT'] } }
      }),
      prisma.lead.count({
        where: { status: 'NEW' }
      }),
      prisma.associate.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.inventoryItem.findMany({
        select: { id: true, name: true, sku: true, currentPurchaseStock: true, minimumStock: true, purchaseUnit: true }
      })
    ]);

    const totalRevenue = Number(totalRevenueAgg._sum.total) || 0;
    const expenseOnly = Number(totalExpenseAgg._sum.amount) || 0;
    const purchaseOnly = Number(totalPurchaseAgg._sum.grandTotal) || 0;
    const associatePaidOnly = Number(totalAssociatePaidAgg._sum.amount) || 0;

    const totalExpense = expenseOnly + purchaseOnly + associatePaidOnly;
    const totalProfit = totalRevenue - totalExpense;

    const lowStockItems = allInventory
      .filter(item => Number(item.currentPurchaseStock) <= Number(item.minimumStock))
      .slice(0, 5); // Limit to top 5 for alerts
      
    const lowStockCount = allInventory.filter(item => Number(item.currentPurchaseStock) <= Number(item.minimumStock)).length;

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalProfit,
        totalExpense,
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
