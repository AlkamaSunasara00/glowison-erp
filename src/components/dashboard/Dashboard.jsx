import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import StatusBadge from "@/common/StatusBadge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from "react-hot-toast";

export const Dashboard = () => {
  const router = useRouter();
  const [metrics, setMetrics] = useState({ totalRevenue: 0, activeOrders: 0, pendingInvoices: 0, newLeads: 0, lowStockCount: 0, lowStockItems: [] });
  const [loading, setLoading] = useState(true);

  // Chart states
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [revenueMonth, setRevenueMonth] = useState(currentMonthStr);
  const [statusMonth, setStatusMonth] = useState(currentMonthStr);
  
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

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
    { label: "New Order", icon: "ShoppingCart", path: "/orders", color: "bg-blue-50 text-blue-600" },
    { label: "Add Customer", icon: "Users", path: "/customers", color: "bg-emerald-50 text-emerald-600" },
    { label: "Create Invoice", icon: "FileText", path: "/invoice", color: "bg-indigo-50 text-indigo-600" },
    { label: "Log Expense", icon: "Receipt", path: "/expense", color: "bg-rose-50 text-rose-600" },
  ];
  const recentActivity = [
    { id: 1, title: "New Order Created", desc: "ORD-005 from Glow Signages", time: "2 hours ago", type: "order" },
    { id: 2, title: "Invoice Paid", desc: "INV-2023-001 amount Rs. 1,416", time: "5 hours ago", type: "invoice" },
    { id: 3, title: "New Lead Added", desc: "Dr. Priya Sharma (Clinic Signage)", time: "1 day ago", type: "lead" },
    { id: 5, title: "Expense Logged", desc: "Rs. 2,500 paid to Meta Ads", time: "2 days ago", type: "expense" },
  ];
  
  const displayActivities = [...recentActivity].slice(0, 5);


  const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-6">
      
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

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/reports")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Total Revenue</span>
             <span className="text-2xl font-bold text-gray-900">₹{metrics.totalRevenue.toLocaleString()}</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Icons name="IndianRupee" size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/invoice")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Outstanding Invoices</span>
             <span className="text-2xl font-bold text-amber-600">{metrics.pendingInvoices}</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Icons name="Clock" size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/orders")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Active Orders</span>
             <span className="text-2xl font-bold text-gray-900">{metrics.activeOrders}</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Icons name="ShoppingCart" size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/leads")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">New Leads</span>
             <span className="text-2xl font-bold text-gray-900">{metrics.newLeads}</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Icons name="Users" size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/inventory")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Low Stock Alerts</span>
             <span className={`text-2xl font-bold ${metrics.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{metrics.lowStockCount}</span>
           </div>
           <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${metrics.lowStockCount > 0 ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
              <Icons name="AlertTriangle" size={24} />
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 w-full">
         
         {/* Left Column (Now Full Width) */}
         <div className="flex flex-col gap-6 w-full min-w-0">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
               <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {quickActions.map((action, idx) => (
                    <button key={idx} onClick={() => router.push(action.path)} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition-all group bg-gray-50/50 hover:bg-white text-center">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                         <Icons name={action.icon} size={20} />
                       </div>
                       <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors">{action.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 mt-6">
              {/* Revenue & Profit Chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-base font-semibold text-gray-900">Revenue & Profit Overview</h3>
                   <input type="month" value={revenueMonth} onChange={(e) => setRevenueMonth(e.target.value)} className="text-sm border border-gray-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20" />
                 </div>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                         <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} tickFormatter={(val) => `₹${val/1000}k`} />
                         <RechartsTooltip 
                           contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                           formatter={(value, name) => [`₹${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                         />
                         <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                         <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                         <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Order Status Chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-base font-semibold text-gray-900">Orders by Status</h3>
                   <input type="month" value={statusMonth} onChange={(e) => setStatusMonth(e.target.value)} className="text-sm border border-gray-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20" />
                 </div>
                 <div className="h-[300px] w-full flex items-center justify-center">
                    {orderStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={orderStatusData}
                             cx="50%"
                             cy="50%"
                             innerRadius={80}
                             outerRadius={110}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {orderStatusData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <RechartsTooltip 
                             contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                           />
                           <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                         </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-gray-400 font-medium">No order data for this month.</div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Full Width Inventory Alerts */}
      <div className="w-full mt-2">
         <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
               <h3 className="text-base font-semibold text-rose-900 flex items-center gap-2">
                  <Icons name="AlertTriangle" size={20} className="text-rose-500"/> 
                  Low Stock Inventory Alerts
               </h3>
               <Button variant="outline" size="sm" onClick={() => router.push('/inventory')} className="bg-white hover:bg-rose-50 border-rose-200 text-rose-700">View All Inventory</Button>
            </div>
            
            {metrics.lowStockItems?.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-white text-xs font-semibold text-gray-500 border-b border-gray-100">
                     <tr>
                       <th className="px-6 py-3">Item Name</th>
                       <th className="px-6 py-3">SKU</th>
                       <th className="px-6 py-3 text-right">Current Stock</th>
                       <th className="px-6 py-3 text-right">Threshold</th>
                       <th className="px-6 py-3 text-center">Status</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm divide-y divide-gray-50">
                      {metrics.lowStockItems.map((item, i) => (
                         <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-3 text-gray-500">{item.sku || '-'}</td>
                            <td className="px-6 py-3 text-right">
                               <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                  {item.stockQty} {item.baseUnit}
                               </span>
                            </td>
                            <td className="px-6 py-3 text-right text-gray-500">{item.reorderThreshold} {item.baseUnit}</td>
                            <td className="px-6 py-3 text-center">
                               <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full">
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
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                     <Icons name="Check" size={24} />
                  </div>
                  <p className="text-gray-900 font-medium">Inventory is healthy!</p>
                  <p className="text-gray-500 text-sm mt-1">No items are currently below their reorder threshold.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
