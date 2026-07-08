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
      <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
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

        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 w-full sm:w-auto">
          {reportTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${isActive 
                    ? "bg-primary text-white shadow-sm" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
                `}
              >
                <Icons name={tab.icon} size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full min-w-0">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Revenue Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
         <div className="flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Revenue</span>
           <span className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalSales)}</span>
         </div>
         <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Icons name="IndianRupee" size={24} />
         </div>
      </div>

      {/* Orders Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
         <div className="flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Orders</span>
           <span className="text-2xl font-bold text-gray-900">{overview.totalOrders}</span>
         </div>
         <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icons name="ShoppingCart" size={24} />
         </div>
      </div>

      {/* Leads Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
         <div className="flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Leads</span>
           <span className="text-2xl font-bold text-gray-900">{overview.totalLeads}</span>
         </div>
         <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Icons name="Users" size={24} />
         </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
         <div className="flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Expenses</span>
           <span className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalExpenses)}</span>
         </div>
         <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <Icons name="TrendingDown" size={24} />
         </div>
      </div>

      {/* Profit Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
         <div className="flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Profit</span>
           <span className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalSales - overview.totalExpenses)}</span>
         </div>
         <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icons name="TrendingUp" size={24} />
         </div>
      </div>
    </div>
  );
};

const SalesReport = ({ data, overview }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 gap-6 w-full">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm min-w-0">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-base font-semibold text-gray-900">Revenue & Profit Trend</h3>
             <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">{data.trend.length} days</span>
           </div>
           <div className="h-[300px] w-full">
              {data.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                         formatter={(value, name) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                         contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                      <Line 
                         type="monotone" 
                         dataKey="revenue" 
                         name="Revenue"
                         stroke="#10b981" 
                         strokeWidth={3} 
                         dot={{r: 3, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2}} 
                         activeDot={{r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2}} 
                      />
                      <Line 
                         type="monotone" 
                         dataKey="profit"
                         name="Profit" 
                         stroke="#3b82f6" 
                         strokeWidth={3} 
                         dot={{r: 3, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 2}} 
                         activeDot={{r: 5, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2}} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">No revenue data for this period.</div>
              )}
           </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm min-w-0">
           <h3 className="text-base font-semibold text-gray-900 mb-4">Sales by Source</h3>
           <div className="h-[300px] w-full">
              {data.bySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.bySource}
                        cx="50%"
                        cy="45%"
                        innerRadius={80}
                        outerRadius={110}
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
                         contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <Legend 
                         layout="horizontal" 
                         verticalAlign="bottom" 
                         align="center" 
                         iconType="circle"
                         wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">No source data available.</div>
              )}
           </div>
        </div>
    </div>
  );
};

const LeadsReport = ({ data, overview }) => {
  return (
    <div className="grid grid-cols-1 gap-6 w-full">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm min-w-0">
           <h3 className="text-base font-semibold text-gray-900 mb-4">Leads by Source</h3>
           <div className="h-[300px] w-full">
              {data.bySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bySource} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dx={-10} width={100} />
                      <Tooltip 
                         cursor={{fill: '#f9fafb'}}
                         contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">No leads source data available.</div>
              )}
           </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm min-w-0">
           <h3 className="text-base font-semibold text-gray-900 mb-4">Pipeline Status</h3>
           <div className="h-[300px] w-full">
              {data.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.byStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={50}
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
                         contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">No leads status data available.</div>
              )}
           </div>
        </div>
    </div>
  );
};

const InventoryReport = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Total Inventory Value</span>
             <span className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalValue)}</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icons name="Package" size={24} />
           </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Low Stock Alerts</span>
             <span className="text-2xl font-bold text-rose-600">{data.lowStockCount} Items</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Icons name="AlertTriangle" size={24} />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden min-w-0">
         <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-rose-900 flex items-center gap-2">
               <Icons name="AlertTriangle" size={20} className="text-rose-500"/> Low Stock Items Details
            </h3>
         </div>
         
         {data.lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="bg-white text-xs font-semibold text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Item Name</th>
                      <th className="px-6 py-3 text-right">Current Stock</th>
                      <th className="px-6 py-3 text-right">Threshold</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                     {data.lowStockItems.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                           <td className="px-6 py-3 text-right">
                              <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                 {item.stockQty}
                              </span>
                           </td>
                           <td className="px-6 py-3 text-right text-gray-500">{item.threshold}</td>
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
  );
};

const ExpenseReport = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 gap-6 w-full">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
           <div className="flex flex-col gap-1">
             <span className="text-sm font-medium text-gray-500">Total Expenses</span>
             <span className="text-2xl font-bold text-gray-900">{formatCurrency(data.total)}</span>
           </div>
           <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Icons name="CreditCard" size={24} />
           </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm min-w-0">
           <h3 className="text-base font-semibold text-gray-900 mb-4">Expenses Breakdown</h3>
           <div className="h-[300px] w-full">
              {data.byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.byCategory} margin={{top: 20, right: 0, left: 0, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dy={10} width={100} />
                      <YAxis tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                         formatter={(value) => formatCurrency(value)} 
                         cursor={{fill: '#f9fafb'}} 
                         contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                         dataKey="value" 
                         fill="#f43f5e" 
                         radius={[4, 4, 0, 0]} 
                         barSize={40}
                      >
                         {data.byCategory.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">No expense data available.</div>
              )}
           </div>
        </div>
    </div>
  );
};

export default Reports;
