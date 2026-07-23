import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z') // End of the day
      };
    } else if (startDate) {
       dateFilter.createdAt = { gte: new Date(startDate) };
    } else if (endDate) {
       dateFilter.createdAt = { lte: new Date(endDate + 'T23:59:59.999Z') };
    }

    // Fetch all report datasets in parallel
    const [
      orders,
      expensesForTrend,
      purchasesForTrend,
      paymentsForTrend,
      leads,
      customersCount,
      inventoryItems,
      expenses,
      totalPurchasesAgg,
      associatesCount,
      projectsInRange
    ] = await Promise.all([
      prisma.order.findMany({
        where: dateFilter,
        select: { total: true, amountPaid: true, type: true, onlineSource: true, createdAt: true, status: true }
      }),
      prisma.expense.findMany({
        where: dateFilter,
        select: { amount: true, spentOn: true }
      }),
      prisma.purchase.findMany({
        where: { purchaseDate: dateFilter.createdAt },
        select: { grandTotal: true, purchaseDate: true }
      }),
      prisma.projectPayment.findMany({
        where: { date: dateFilter.createdAt },
        select: { amount: true, date: true }
      }),
      prisma.lead.findMany({
        where: dateFilter,
        select: { source: true, status: true }
      }),
      prisma.customer.count({ where: dateFilter }),
      prisma.inventoryItem.findMany({
        select: { name: true, currentPurchaseStock: true, averageCost: true, minimumStock: true }
      }),
      prisma.expense.findMany({
        where: { spentOn: { ...dateFilter.createdAt } },
        select: { amount: true, category: true, status: true }
      }),
      prisma.purchase.aggregate({
        where: { purchaseDate: dateFilter.createdAt },
        _sum: { grandTotal: true }
      }),
      prisma.associate.count({ where: { status: 'ACTIVE' } }),
      prisma.project.findMany({
        where: { date: dateFilter.createdAt },
        select: { id: true, status: true }
      })
    ]);

    const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = orders.length;
    
    const salesBySource = {
        WEBSITE: 0, MEESHO: 0, AMAZON: 0, INSTAGRAM: 0, RETAIL_DEALER: 0, OTHER: 0
    };
    const salesTrend = {};

    orders.forEach(order => {
        if (order.type === 'RETAIL_DEALER') {
            salesBySource.RETAIL_DEALER += Number(order.total);
        } else if (order.type === 'ONLINE' && order.onlineSource) {
             salesBySource[order.onlineSource] = (salesBySource[order.onlineSource] || 0) + Number(order.total);
        } else {
             salesBySource.OTHER += Number(order.total);
        }
        const dateString = order.createdAt.toISOString().split('T')[0];
        if (!salesTrend[dateString]) salesTrend[dateString] = 0;
        salesTrend[dateString] += Number(order.total);
    });

    const expenseTrend = {};
    expensesForTrend.forEach(exp => {
      const dateString = exp.spentOn.toISOString().split('T')[0];
      if (!expenseTrend[dateString]) expenseTrend[dateString] = 0;
      expenseTrend[dateString] += Number(exp.amount);
    });

    const purchaseTrend = {};
    purchasesForTrend.forEach(pur => {
      const dateString = pur.purchaseDate.toISOString().split('T')[0];
      if (!purchaseTrend[dateString]) purchaseTrend[dateString] = 0;
      purchaseTrend[dateString] += Number(pur.grandTotal);
    });

    const associatePaidTrend = {};
    paymentsForTrend.forEach(pay => {
      const dateString = pay.date.toISOString().split('T')[0];
      if (!associatePaidTrend[dateString]) associatePaidTrend[dateString] = 0;
      associatePaidTrend[dateString] += Number(pay.amount);
    });

    const allDates = new Set([
      ...Object.keys(salesTrend), 
      ...Object.keys(expenseTrend),
      ...Object.keys(purchaseTrend),
      ...Object.keys(associatePaidTrend)
    ]);

    const salesTrendData = Array.from(allDates).sort().map(date => {
        const revenue = salesTrend[date] || 0;
        const expense = expenseTrend[date] || 0;
        const purchase = purchaseTrend[date] || 0;
        const associatePaid = associatePaidTrend[date] || 0;
        const totalExpense = expense + purchase + associatePaid;
        return { date, revenue, expense: totalExpense, profit: revenue - totalExpense };
    });

    const totalLeads = leads.length;
    const leadsBySource = {};
    const leadsByStatus = {};
    leads.forEach(lead => {
        if (lead.source) leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
        leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
    });

    let totalInventoryValue = 0;
    let lowStockItemsCount = 0;
    const lowStockItems = [];
    inventoryItems.forEach(item => {
        const qty = Number(item.currentPurchaseStock);
        const cost = Number(item.averageCost);
        totalInventoryValue += qty * cost;
        if (qty <= Number(item.minimumStock)) {
            lowStockItemsCount++;
            lowStockItems.push({ name: item.name, stockQty: qty, threshold: Number(item.minimumStock) });
        }
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const expensesByCategory = {};
    expenses.forEach(exp => {
        expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + Number(exp.amount);
    });

    const totalPurchases = Number(totalPurchasesAgg._sum.grandTotal) || 0;

    const projectIdsInRange = projectsInRange.map(p => p.id);
    let completedProjectsCount = projectsInRange.filter(p => p.status === 'COMPLETED').length;

    // Get associate-level financials from ProjectAssociate for these projects
    // This is where the actual work amounts (totalAmount) are stored
    const associateEntries = await prisma.projectAssociate.findMany({
        where: {
            projectId: { in: projectIdsInRange }
        },
        select: {
            totalAmount: true,
            paidAmount: true,
            dueAmount: true,
        }
    });

    let totalAssociateProjectAmount = 0;
    let totalAssociatePaidAmount = 0;
    let totalAssociateDueAmount = 0;
    
    associateEntries.forEach(pa => {
        totalAssociateProjectAmount += Number(pa.totalAmount);
        totalAssociatePaidAmount += Number(pa.paidAmount);
        totalAssociateDueAmount += Math.max(0, Number(pa.dueAmount));
    });

    return res.status(200).json({
      success: true,
      data: {
         overview: {
             totalSales,
             totalOrders,
             totalLeads,
             newCustomers: customersCount,
             totalExpenses,
             totalPurchases,
             totalAssociatePaid: totalAssociatePaidAmount,
             totalInventoryValue,
         },
         sales: {
             trend: salesTrendData,
             bySource: Object.keys(salesBySource).map(key => ({ name: key, value: salesBySource[key] })).filter(item => item.value > 0),
         },
         leads: {
             bySource: Object.keys(leadsBySource).map(key => ({ name: key, value: leadsBySource[key] })),
             byStatus: Object.keys(leadsByStatus).map(key => ({ name: key, value: leadsByStatus[key] })),
         },
         inventory: {
             totalValue: totalInventoryValue,
             lowStockCount: lowStockItemsCount,
             lowStockItems: lowStockItems.slice(0, 10),
         },
         expenses: {
             total: totalExpenses,
             byCategory: Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] })),
         },
         associates: {
             totalCount: associatesCount,
             projectsCount: projectsInRange.length,
             completedProjectsCount,
             totalProjectAmount: totalAssociateProjectAmount,
             totalPaidAmount: totalAssociatePaidAmount,
             dueAmount: totalAssociateDueAmount
         }
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
