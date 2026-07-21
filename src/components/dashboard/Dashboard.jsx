import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const Dashboard = () => {
  const router = useRouter();
  const [metrics, setMetrics] = useState({ totalRevenue: 0, activeOrders: 0, pendingInvoices: 0, newLeads: 0, activeAssociates: 0, lowStockCount: 0, lowStockItems: [] });
  const [loading, setLoading] = useState(true);

  // Chart states
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [revenueMonth, setRevenueMonth] = useState(currentMonthStr);
  const [statusMonth, setStatusMonth] = useState(currentMonthStr);
  
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [associateProjectsData, setAssociateProjectsData] = useState([]);

  // Fetch top-level metrics once
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboard/metrics');
        setMetrics(res.data.data);
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Fetch Revenue/Profit chart data when its month changes
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const res = await api.get(`/dashboard/revenue-chart?month=${revenueMonth}`);
        setSalesData(res.data.data.chartData || []);
        setExpenseData(res.data.data.expenseData || []);
        setLeadsData(res.data.data.leadsData || []);
        setAssociateProjectsData(res.data.data.associateProjectsData || []);
      } catch (error) {
        console.error("Failed to load revenue data", error);
      }
    };
    fetchRevenueData();
  }, [revenueMonth]);

  // Fetch Order Status chart data when its month changes
  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const res = await api.get(`/dashboard/revenue-chart?month=${statusMonth}`);
        setOrderStatusData(res.data.data.orderStatusData || []);
      } catch (error) {
        console.error("Failed to load status data", error);
      }
    };
    fetchStatusData();
  }, [statusMonth]);

  const quickActions = [
    { label: "New Order", icon: "ShoppingCart", path: "/orders", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Add Customer", icon: "Users", path: "/customers", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { label: "Create Invoice", icon: "FileText", path: "/invoice", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { label: "Log Expense", icon: "Receipt", path: "/expense", color: "bg-rose-50 text-rose-600 border-rose-100" },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="page-header text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
            Welcome back to Glowison ERP. Here's what's happening today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="solid"
            onClick={() => router.push("/reports")}
            leftIcon={(props) => (
              <Icons name="BarChart2" color="white" {...props} />
            )}
          >
            View Full Reports
          </Button>
        </div>
      </div>

      {/* Top KPIs - 4 Columns Per Line */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => router.push("/reports")}>
          <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Icons name="IndianRupee" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Revenue</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">₹{metrics.totalRevenue.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => router.push("/invoice")}>
          <div className="w-12 h-12 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Icons name="FileText" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Pending Invoices</p>
            <h4 className="text-xl font-black text-amber-600 tracking-tight truncate">{metrics.pendingInvoices}</h4>
          </div>
        </div>

        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => router.push("/orders")}>
          <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Icons name="ShoppingCart" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Active Orders</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{metrics.activeOrders}</h4>
          </div>
        </div>

        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => router.push("/leads")}>
          <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Icons name="Users" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">New Leads</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{metrics.newLeads}</h4>
          </div>
        </div>

        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => router.push("/associates")}>
          <div className="w-12 h-12 rounded-sm bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Icons name="Briefcase" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Associates</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{metrics.activeAssociates || 0}</h4>
          </div>
        </div>

        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => router.push("/inventory")}>
          <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 border ${metrics.lowStockCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            <Icons name="AlertTriangle" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Low Stock Alerts</p>
            <h4 className={`text-xl font-black tracking-tight truncate ${metrics.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{metrics.lowStockCount} Items</h4>
          </div>
        </div>
      </div>

      {/* Row 1: Quick Actions & Orders By Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
         
         {/* Quick Actions */}
         <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 h-full flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Icons name="Zap" size={16} className="text-primary"/> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
               {quickActions.map((action, idx) => (
                 <button key={idx} onClick={() => router.push(action.path)} className="flex flex-col items-center justify-center gap-3 p-5 rounded-sm border border-gray-100 hover:border-primary hover:shadow-sm transition-all group bg-gray-50/50 hover:bg-white text-center">
                    <div className={`w-12 h-12 rounded-sm border flex items-center justify-center ${action.color} group-hover:scale-105 transition-transform`}>
                      <Icons name={action.icon} size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider group-hover:text-primary transition-colors">{action.label}</span>
                 </button>
               ))}
            </div>
         </div>

         {/* Order Status Chart */}
         <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <Icons name="PieChart" size={16} className="text-amber-500" /> Orders by Status
              </h3>
              <input type="month" value={statusMonth} onChange={(e) => setStatusMonth(e.target.value)} className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-200 rounded-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <div className="h-[250px] w-full min-h-[250px]">
               {orderStatusData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af' }} />
                    </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider">No order data for this month.</div>
                )}
             </div>
          </div>
      </div>

      {/* Row 2: Full Width Revenue & Profit Chart */}
      <div className="w-full">
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Icons name="TrendingUp" size={16} className="text-emerald-500" /> Revenue & Profit Overview
             </h3>
             <input type="month" value={revenueMonth} onChange={(e) => setRevenueMonth(e.target.value)} className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-200 rounded-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary/50" />
           </div>
           <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af', fontWeight: 'bold'}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af', fontWeight: 'bold'}} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
                   <RechartsTooltip 
                     contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', fontSize: '13px', fontWeight: 'bold' }}
                     formatter={(value, name) => [`₹${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                   />
                   <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af' }} />
                   <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                   <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

    {/* Row 3: Analytics Row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
         {/* Expenses by Category Chart */}
         <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <Icons name="CreditCard" size={16} className="text-rose-500" /> Expenses Breakdown
              </h3>
            </div>
            <div className="h-[250px] w-full min-h-[250px]">
               {expenseData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', fontSize: '12px' }}
                        formatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af' }} />
                    </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider">No expense data for this month.</div>
                )}
             </div>
          </div>

          {/* Leads by Source Chart */}
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <Icons name="Users" size={16} className="text-indigo-500" /> Leads by Source
              </h3>
            </div>
            <div className="h-[250px] w-full min-h-[250px]">
               {leadsData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {leadsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af' }} />
                    </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider">No leads data for this month.</div>
                )}
             </div>
          </div>

          {/* Associate Projects Chart */}
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                 <Icons name="Briefcase" size={16} className="text-purple-500" /> Associate Projects
              </h3>
            </div>
            <div className="h-[250px] w-full min-h-[250px]">
               {associateProjectsData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={associateProjectsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {associateProjectsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af' }} />
                    </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider">No project data for this month.</div>
                )}
             </div>
          </div>
      </div>

      {/* Full Width Inventory Alerts */}
      <div className="w-full">
         <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
               <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Icons name="AlertTriangle" size={14} className="text-rose-500"/> 
                  Low Stock Inventory Alerts
               </h3>
               <Button variant="outline" size="sm" onClick={() => router.push('/inventory')} className="text-[10px] tracking-wider uppercase bg-white">View All</Button>
            </div>
            
            {metrics.lowStockItems?.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse whitespace-nowrap">
                   <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                     <tr>
                       <th className="px-5 py-3">Item Name</th>
                       <th className="px-5 py-3">SKU</th>
                       <th className="px-5 py-3 text-right">Current Stock</th>
                       <th className="px-5 py-3 text-right">Threshold</th>
                       <th className="px-5 py-3 text-center">Status</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm divide-y divide-gray-50">
                      {metrics.lowStockItems.map((item, i) => (
                         <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3 font-medium text-gray-900">{item.name}</td>
                            <td className="px-5 py-3 text-gray-500 text-xs">{item.sku || '-'}</td>
                            <td className="px-5 py-3 text-right">
                               <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm text-xs border border-rose-100">
                                  {item.stockQty} {item.baseUnit}
                               </span>
                            </td>
                            <td className="px-5 py-3 text-right text-gray-500 text-xs">{item.reorderThreshold} {item.baseUnit}</td>
                            <td className="px-5 py-3 text-center">
                               <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-sm">
                                  Action Needed
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            ) : (
               <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-sm flex items-center justify-center mb-3">
                     <Icons name="Check" size={20} />
                  </div>
                  <p className="text-gray-900 font-bold text-sm">Inventory is healthy!</p>
                  <p className="text-gray-500 text-xs mt-1">No items are currently below their reorder threshold.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
