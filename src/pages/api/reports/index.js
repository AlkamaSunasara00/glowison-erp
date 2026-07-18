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

    // 1. Orders (Sales) Data
    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: {
        total: true,
        amountPaid: true,
        type: true,
        onlineSource: true,
        createdAt: true,
        status: true,
      },
    });

    const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = orders.length;
    
    const salesBySource = {
        WEBSITE: 0,
        MEESHO: 0,
        AMAZON: 0,
        INSTAGRAM: 0,
        RETAIL_DEALER: 0,
        OTHER: 0
    };

    const salesTrend = {};

    orders.forEach(order => {
        // Group by Source
        if (order.type === 'RETAIL_DEALER') {
            salesBySource.RETAIL_DEALER += Number(order.total);
        } else if (order.type === 'ONLINE' && order.onlineSource) {
             salesBySource[order.onlineSource] = (salesBySource[order.onlineSource] || 0) + Number(order.total);
        } else {
             salesBySource.OTHER += Number(order.total);
        }

        // Group by Date for trend
        const dateString = order.createdAt.toISOString().split('T')[0];
        if (!salesTrend[dateString]) salesTrend[dateString] = 0;
        salesTrend[dateString] += Number(order.total);
    });

    // Aggregate Expenses by Date
    const expenseTrend = {};
    const expensesForTrend = await prisma.expense.findMany({
      where: dateFilter,
      select: { amount: true, spentOn: true }
    });

    expensesForTrend.forEach(exp => {
      const dateString = exp.spentOn.toISOString().split('T')[0];
      if (!expenseTrend[dateString]) expenseTrend[dateString] = 0;
      expenseTrend[dateString] += Number(exp.amount);
    });

    const allDates = new Set([...Object.keys(salesTrend), ...Object.keys(expenseTrend)]);

    const salesTrendData = Array.from(allDates).sort().map(date => {
        const revenue = salesTrend[date] || 0;
        const expense = expenseTrend[date] || 0;
        return {
          date,
          revenue,
          expense,
          profit: revenue - expense
        };
    });

    // 2. Leads Data
    const leads = await prisma.lead.findMany({
      where: dateFilter,
      select: {
        source: true,
        status: true,
      }
    });

    const totalLeads = leads.length;
    const leadsBySource = {};
    const leadsByStatus = {};

    leads.forEach(lead => {
        if (lead.source) {
           leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
        }
        leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
    });

    // 3. Customers Data
    const customersCount = await prisma.customer.count({
        where: dateFilter
    });
    
    // 4. Inventory Data
    const inventoryItems = await prisma.inventoryItem.findMany({
        select: {
            name: true,
            currentPurchaseStock: true,
            averageCost: true,
            minimumStock: true,
        }
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
            lowStockItems.push({
                name: item.name,
                stockQty: qty,
                threshold: Number(item.minimumStock)
            });
        }
    });

    // 5. Expenses Data
    const expenses = await prisma.expense.findMany({
        where: {
            spentOn: {
                ...dateFilter.createdAt
            }
        },
        select: {
            amount: true,
            category: true,
            status: true,
        }
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const expensesByCategory = {};
    expenses.forEach(exp => {
        expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + Number(exp.amount);
    });

    // 6. Associates Data
    const associatesCount = await prisma.associate.count({
        where: dateFilter
    });

    const associateProjects = await prisma.associateProject.findMany({
        where: {
            date: dateFilter.createdAt
        },
        select: {
            totalAmount: true,
            paidAmount: true,
            status: true
        }
    });

    let totalAssociateProjectAmount = 0;
    let totalAssociatePaidAmount = 0;
    let completedProjectsCount = 0;
    
    associateProjects.forEach(p => {
        totalAssociateProjectAmount += Number(p.totalAmount);
        totalAssociatePaidAmount += Number(p.paidAmount);
        if (p.status === 'COMPLETED') completedProjectsCount++;
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
             lowStockItems: lowStockItems.slice(0, 10), // Return top 10 low stock
         },
         expenses: {
             total: totalExpenses,
             byCategory: Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] })),
         },
         associates: {
             totalCount: associatesCount,
             projectsCount: associateProjects.length,
             completedProjectsCount,
             totalProjectAmount: totalAssociateProjectAmount,
             totalPaidAmount: totalAssociatePaidAmount,
             dueAmount: totalAssociateProjectAmount - totalAssociatePaidAmount
         }
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
