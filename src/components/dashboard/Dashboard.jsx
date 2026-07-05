import React from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import StatusBadge from "@/common/StatusBadge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const Dashboard = () => {
  const router = useRouter();

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
    { id: 4, title: "Low Stock Alert", desc: "MDF Sheet 6mm is below minimum", time: "1 day ago", type: "inventory" },
    { id: 5, title: "Expense Logged", desc: "Rs. 2,500 paid to Meta Ads", time: "2 days ago", type: "expense" },
  ];

  const salesData = [
    { name: 'Jan', revenue: 40000 },
    { name: 'Feb', revenue: 30000 },
    { name: 'Mar', revenue: 50000 },
    { name: 'Apr', revenue: 45000 },
    { name: 'May', revenue: 60000 },
    { name: 'Jun', revenue: 55000 },
  ];

  const orderStatusData = [
    { name: 'Pending', value: 15 },
    { name: 'Processing', value: 25 },
    { name: 'Shipped', value: 10 },
    { name: 'Delivered', value: 50 },
  ];
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/reports")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Total Revenue (Month)</span>
             <span className="text-2xl font-bold text-gray-900">Rs. 4.5L</span>
             <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-1"><Icons name="TrendingUp" size={10} /> +12% from last month</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Icons name="IndianRupee" size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/invoice")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Outstanding Invoices</span>
             <span className="text-2xl font-bold text-amber-600">Rs. 54K</span>
             <span className="text-[10px] font-medium text-gray-500 mt-1">From 3 invoices</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Icons name="Clock" size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/expense")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Total Expenses (Month)</span>
             <span className="text-2xl font-bold text-gray-900">Rs. 1.1L</span>
             <span className="text-[10px] font-medium text-gray-500 mt-1">4 pending payments</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <Icons name="CreditCard" size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors cursor-pointer" onClick={() => router.push("/leads")}>
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Active Leads</span>
             <span className="text-2xl font-bold text-gray-900">24</span>
             <span className="text-[10px] font-medium text-gray-500 mt-1">8 new this week</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Icons name="Users" size={24} />
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Column */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                 <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8038A1" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#8038A1" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                         <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} tickFormatter={(val) => `₹${val/1000}k`} />
                         <RechartsTooltip 
                           contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                           formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                         />
                         <Area type="monotone" dataKey="revenue" stroke="#8038A1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Order Status Chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                 <h3 className="text-base font-semibold text-gray-900 mb-4">Orders by Status</h3>
                 <div className="h-[250px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={orderStatusData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
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
                 </div>
              </div>
            </div>

         </div>

         {/* Right Column */}
         <div className="flex flex-col gap-6">
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex-1 flex flex-col">
               <h3 className="text-base font-semibold text-gray-900 mb-6">Recent Activity</h3>
               <div className="flex-1 relative">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200"></div>
                  <div className="space-y-6 relative z-10">
                     {recentActivity.map((activity, idx) => {
                       let iconName = "Activity";
                       let colorClass = "bg-gray-100 text-gray-500 border-white";
                       if(activity.type === 'order') { iconName = "ShoppingCart"; colorClass = "bg-blue-100 text-blue-600 border-white"; }
                       if(activity.type === 'invoice') { iconName = "FileText"; colorClass = "bg-emerald-100 text-emerald-600 border-white"; }
                       if(activity.type === 'lead') { iconName = "UserPlus"; colorClass = "bg-indigo-100 text-indigo-600 border-white"; }
                       if(activity.type === 'inventory') { iconName = "AlertTriangle"; colorClass = "bg-rose-100 text-rose-600 border-white"; }
                       if(activity.type === 'expense') { iconName = "Receipt"; colorClass = "bg-amber-100 text-amber-600 border-white"; }

                       return (
                         <div key={idx} className="flex gap-4 items-start">
                            <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center shrink-0 ${colorClass}`}>
                               <Icons name={iconName} size={14} />
                            </div>
                            <div className="flex flex-col pt-1">
                               <span className="text-sm font-semibold text-gray-900">{activity.title}</span>
                               <span className="text-xs text-gray-500 mt-0.5">{activity.desc}</span>
                               <span className="text-[10px] text-gray-400 mt-1">{activity.time}</span>
                            </div>
                         </div>
                       )
                     })}
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default Dashboard;
