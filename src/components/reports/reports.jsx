import React, { useState, useEffect } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/lib/api";

const reportTabs = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "sales", label: "Sales & Orders", icon: "TrendingUp" },
  { id: "leads", label: "Leads", icon: "Users" },
  { id: "inventory", label: "Inventory", icon: "Package" },
  { id: "expenses", label: "Expenses", icon: "CreditCard" },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);
      
      const res = await api.get(`/reports?${query.toString()}`);
      if (res.data && res.data.success) {
        setReportData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-6 p-4 md:p-6 lg:p-8 bg-gray-50/50">
      
      {/* Header & Filters */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm md:text-base text-gray-500 max-w-xl">
              Gain comprehensive insights into your business performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-50/80 p-2 rounded-xl border border-gray-100">
             <div className="flex items-center gap-3 px-2">
                 <Icons name="Calendar" size={18} className="text-gray-400" />
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</span>
                   <input 
                     type="date" 
                     value={startDate} 
                     onChange={(e) => setStartDate(e.target.value)}
                     className="bg-transparent text-gray-800 text-sm font-medium focus:ring-0 focus:outline-none cursor-pointer"
                   />
                 </div>
             </div>
             <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
             <div className="flex items-center gap-3 px-2">
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</span>
                   <input 
                     type="date" 
                     value={endDate} 
                     onChange={(e) => setEndDate(e.target.value)}
                     className="bg-transparent text-gray-800 text-sm font-medium focus:ring-0 focus:outline-none cursor-pointer"
                   />
                 </div>
             </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {reportTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? "bg-gray-900 text-white shadow-md hover:bg-gray-800 scale-105" 
                    : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
                `}
              >
                <Icons name={tab.icon} size={16} className={isActive ? "text-white" : "text-gray-500"} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full">
        {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="text-sm font-medium text-gray-500 animate-pulse">Generating Report...</span>
              </div>
            </div>
        ) : !reportData ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Icons name="Inbox" size={48} className="text-gray-300 mb-4" />
              <div className="text-lg font-medium text-gray-600">No data available</div>
              <p className="text-sm text-gray-400">Try adjusting the date range.</p>
            </div>
        ) : (
          <div className="animate-fade-in-up">
            {activeTab === "overview" && <OverviewReport data={reportData} />}
            {activeTab === "sales" && <SalesReport data={reportData.sales} overview={reportData.overview} />}
            {activeTab === "leads" && <LeadsReport data={reportData.leads} overview={reportData.overview} />}
            {activeTab === "inventory" && <InventoryReport data={reportData.inventory} />}
            {activeTab === "expenses" && <ExpenseReport data={reportData.expenses} />}
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Sub-components for Reports
// ----------------------------------------------------------------------

const OverviewReport = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const { overview } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100/50 shadow-[0_2px_10px_-3px_rgba(59,130,246,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(59,130,246,0.2)] transition-all duration-300 group flex flex-col justify-between">
         <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
               <Icons name="IndianRupee" size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Revenue</span>
         </div>
         <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(overview.totalSales)}</span>
         <span className="text-sm text-gray-500 mt-2 flex items-center gap-1">Total sales generated</span>
      </div>

      {/* Orders Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100/50 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.2)] transition-all duration-300 group flex flex-col justify-between">
         <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
               <Icons name="ShoppingCart" size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Orders</span>
         </div>
         <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{overview.totalOrders}</span>
         <span className="text-sm text-gray-500 mt-2 flex items-center gap-1">Orders processed</span>
      </div>

      {/* Leads Card */}
      <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border border-amber-100/50 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(245,158,11,0.2)] transition-all duration-300 group flex flex-col justify-between">
         <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
               <Icons name="Users" size={24} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Leads</span>
         </div>
         <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{overview.totalLeads}</span>
         <span className="text-sm text-gray-500 mt-2 flex items-center gap-1">New prospects added</span>
      </div>

      {/* Expenses Card */}
      <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100/50 shadow-[0_2px_10px_-3px_rgba(244,63,94,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(244,63,94,0.2)] transition-all duration-300 group flex flex-col justify-between">
         <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
               <Icons name="TrendingDown" size={24} />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Expenses</span>
         </div>
         <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(overview.totalExpenses)}</span>
         <span className="text-sm text-gray-500 mt-2 flex items-center gap-1">Total operating costs</span>
      </div>
    </div>
  );
};

const SalesReport = ({ data, overview }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Icons name="TrendingUp" size={20} className="text-blue-500"/> Revenue Trend</h3>
             <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{data.trend.length} days</span>
           </div>
           <div className="h-80">
              {data.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                         formatter={(value) => [formatCurrency(value), 'Revenue']}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      />
                      <Line 
                         type="monotone" 
                         dataKey="revenue" 
                         stroke="#3b82f6" 
                         strokeWidth={4} 
                         dot={{r: 4, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 2}} 
                         activeDot={{r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2}} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">No revenue data for this period.</div>
              )}
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Icons name="PieChart" size={20} className="text-emerald-500"/> Sales by Source</h3>
           <div className="flex-1 min-h-[300px]">
              {data.bySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.bySource}
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.bySource.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         formatter={(value) => formatCurrency(value)} 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      />
                      <Legend 
                         layout="horizontal" 
                         verticalAlign="bottom" 
                         align="center" 
                         iconType="circle"
                         wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500, color: '#475569' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">No source data available.</div>
              )}
           </div>
        </div>
    </div>
  );
};

const LeadsReport = ({ data, overview }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Icons name="Target" size={20} className="text-amber-500"/> Leads by Source</h3>
           <div className="h-[350px]">
              {data.bySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bySource} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{fontSize: 12, fill: '#475569', fontWeight: 500}} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                         cursor={{fill: '#f8fafc'}}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">No leads source data available.</div>
              )}
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Icons name="Filter" size={20} className="text-indigo-500"/> Pipeline Status</h3>
           <div className="h-[350px]">
              {data.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.byStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                      >
                        {data.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">No leads status data available.</div>
              )}
           </div>
        </div>
    </div>
  );
};

const InventoryReport = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
           <span className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-2 z-10">Total Inventory Value</span>
           <span className="text-5xl font-black text-white z-10">{formatCurrency(data.totalValue)}</span>
        </div>
        
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-8 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
           <Icons name="AlertTriangle" size={32} className="text-rose-200 mb-2 z-10" />
           <span className="text-4xl font-black text-white z-10">{data.lowStockCount} <span className="text-2xl font-semibold opacity-90">Items</span></span>
           <span className="text-sm text-rose-100 font-medium mt-1 z-10">Low stock / Reorder required</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
               <Icons name="PackageX" size={20} className="text-rose-500"/> Low Stock Items Details
            </h3>
         </div>
         
         {data.lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-100">Item Name</th>
                      <th className="px-6 py-4 border-b border-gray-100 text-right">Current Stock</th>
                      <th className="px-6 py-4 border-b border-gray-100 text-right">Threshold</th>
                      <th className="px-6 py-4 border-b border-gray-100 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                     {data.lowStockItems.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                           <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                                 {item.stockQty}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right font-medium text-gray-500">{item.threshold}</td>
                           <td className="px-6 py-4 text-center">
                              <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200">
                                 Action Needed
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
                </table>
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                   <Icons name="Check" size={32} />
                </div>
                <p className="text-lg font-bold text-gray-900">Inventory is healthy!</p>
                <p className="text-sm text-gray-500 mt-1">No items are below the reorder threshold.</p>
            </div>
         )}
      </div>
    </div>
  );
};

const ExpenseReport = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
           <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000 delay-100"></div>
           
           <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 shadow-inner z-10 border border-white/20">
              <Icons name="CreditCard" size={32} />
           </div>
           <span className="text-sm font-semibold text-purple-200 uppercase tracking-widest mb-2 z-10">Total Expenses</span>
           <span className="text-5xl lg:text-6xl font-black text-white tracking-tight z-10">{formatCurrency(data.total)}</span>
        </div>
        
        <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
           <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2"><Icons name="BarChart3" size={20} className="text-purple-600"/> Expenses Breakdown</h3>
           <div className="h-[350px]">
              {data.byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.byCategory} margin={{top: 20, right: 0, left: 0, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                         formatter={(value) => formatCurrency(value)} 
                         cursor={{fill: '#f8fafc'}} 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                         dataKey="value" 
                         fill="#8b5cf6" 
                         radius={[6, 6, 0, 0]} 
                         barSize={50}
                      >
                         {data.byCategory.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">No expense data available.</div>
              )}
           </div>
        </div>
    </div>
  );
};

export default Reports;
