import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { month } = req.query; // Expected format: 'YYYY-MM'
    
    let targetYear, targetMonth;
    if (month) {
      [targetYear, targetMonth] = month.split('-').map(Number);
      targetMonth -= 1; // JS months are 0-indexed
    } else {
      const now = new Date();
      targetYear = now.getFullYear();
      targetMonth = now.getMonth();
    }

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    const daysInMonth = endDate.getDate();

    // Fetch Orders (Revenue)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      },
      select: { total: true, createdAt: true }
    });

    // Fetch Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        spentOn: { gte: startDate, lte: endDate }
      },
      select: { amount: true, spentOn: true, category: true }
    });
    
    // Fetch Leads
    const leads = await prisma.lead.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { source: true }
    });

    // Fetch Associate Projects
    const associateProjects = await prisma.associateProject.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { status: true }
    });
    
    // Fetch Order Status for the dynamic pie chart
    const allOrdersInMonth = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { status: true }
    });

    // Aggregate daily data
    const dailyData = {};
    for (let i = 1; i <= daysInMonth; i++) {
      dailyData[i] = { revenue: 0, expense: 0, profit: 0 };
    }

    orders.forEach(order => {
      const day = order.createdAt.getDate();
      dailyData[day].revenue += Number(order.total) || 0;
    });

    expenses.forEach(expense => {
      const day = expense.spentOn.getDate();
      dailyData[day].expense += Number(expense.amount) || 0;
    });

    const chartData = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const revenue = dailyData[i].revenue;
      const expense = dailyData[i].expense;
      const profit = revenue - expense;
      chartData.push({
        name: `${i} ${startDate.toLocaleString('default', { month: 'short' })}`,
        revenue,
        expense,
        profit
      });
    }

    // Aggregate order status
    const statusCounts = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };
    allOrdersInMonth.forEach(order => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
    });

    const orderStatusData = [
      { name: 'Pending', value: statusCounts.PENDING },
      { name: 'Processing', value: statusCounts.PROCESSING },
      { name: 'Completed', value: statusCounts.COMPLETED },
      { name: 'Cancelled', value: statusCounts.CANCELLED }
    ].filter(item => item.value > 0);

    // Aggregate Expense by Category
    const expensesByCategory = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(exp.amount);
    });
    const expenseData = Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] }));

    // Aggregate Leads by Source
    const leadsBySource = {};
    leads.forEach(lead => {
        const src = lead.source || 'Other';
        leadsBySource[src] = (leadsBySource[src] || 0) + 1;
    });
    const leadsData = Object.keys(leadsBySource).map(key => ({ name: key, value: leadsBySource[key] }));

    // Aggregate Associate Projects by Status
    const projectCounts = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };
    associateProjects.forEach(project => {
      if (projectCounts[project.status] !== undefined) {
        projectCounts[project.status]++;
      }
    });

    const associateProjectsData = [
      { name: 'Pending', value: projectCounts.PENDING },
      { name: 'In Progress', value: projectCounts.IN_PROGRESS },
      { name: 'Completed', value: projectCounts.COMPLETED },
      { name: 'Cancelled', value: projectCounts.CANCELLED }
    ].filter(item => item.value > 0);

    return res.status(200).json({ 
      success: true, 
      data: {
        chartData,
        orderStatusData,
        expenseData,
        leadsData,
        associateProjectsData
      } 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export default withAuth(handler);
