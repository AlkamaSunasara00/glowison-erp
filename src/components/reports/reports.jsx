import React, { useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";

const reportTabs = [
  { id: "sales", label: "Sales Report" },
  { id: "inventory", label: "Inventory Report" },
  { id: "expenses", label: "Expense Report" },
];

export const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState("This Month");

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              View comprehensive business performance summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
             <select 
               value={dateRange} 
               onChange={(e) => setDateRange(e.target.value)}
               className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none shadow-sm"
             >
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="This Year">This Year</option>
                <option value="All Time">All Time</option>
             </select>
            <Button
              variant="outline"
              leftIcon={(props) => (
                <Icons name="Download" {...props} />
              )}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mt-2">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-2">
          {activeTab === "sales" && <SalesReport />}
          {activeTab === "inventory" && <InventoryReport />}
          {activeTab === "expenses" && <ExpenseReport />}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Sub-components for Reports
// ----------------------------------------------------------------------

const SalesReport = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Total Sales Revenue</span>
           <span className="text-3xl font-bold text-gray-900">Rs. 4,50,000</span>
           <span className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1"><Icons name="TrendingUp" size={12} /> +12% from last month</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Total Orders</span>
           <span className="text-3xl font-bold text-gray-900">145</span>
           <span className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1"><Icons name="TrendingUp" size={12} /> +5% from last month</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Avg. Order Value</span>
           <span className="text-3xl font-bold text-gray-900">Rs. 3,103</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Sales by Source</h3>
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">Website</span><span className="text-gray-900 font-semibold">45%</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">Retail/Dealers</span><span className="text-gray-900 font-semibold">30%</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-primary/80 h-2 rounded-full" style={{ width: '30%' }}></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">Instagram</span><span className="text-gray-900 font-semibold">15%</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-primary/60 h-2 rounded-full" style={{ width: '15%' }}></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">Amazon/Meesho</span><span className="text-gray-900 font-semibold">10%</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-primary/40 h-2 rounded-full" style={{ width: '10%' }}></div></div>
               </div>
            </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Top Selling Categories</h3>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2 text-right">Revenue (Rs.)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                 <tr className="border-b border-gray-50"><td className="px-4 py-3 font-medium text-gray-900">Signage Boards</td><td className="px-4 py-3 text-right">1,80,000</td></tr>
                 <tr className="border-b border-gray-50"><td className="px-4 py-3 font-medium text-gray-900">Custom Wall Clocks</td><td className="px-4 py-3 text-right">1,20,000</td></tr>
                 <tr className="border-b border-gray-50"><td className="px-4 py-3 font-medium text-gray-900">Corporate Gifts</td><td className="px-4 py-3 text-right">95,000</td></tr>
                 <tr><td className="px-4 py-3 font-medium text-gray-900">MDF Decor Items</td><td className="px-4 py-3 text-right">55,000</td></tr>
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const InventoryReport = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Total Inventory Value</span>
           <span className="text-3xl font-bold text-gray-900">Rs. 8,25,000</span>
           <div className="flex gap-4 mt-2">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-xs text-gray-600">Raw Materials: 60%</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-xs text-gray-600">Finished Goods: 40%</span></div>
           </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1 justify-center items-start border-l-4 border-l-rose-500">
           <span className="text-sm font-semibold text-rose-600 flex items-center gap-1"><Icons name="AlertTriangle" size={16} /> Attention Required</span>
           <span className="text-2xl font-bold text-gray-900 mt-1">12 Items</span>
           <span className="text-sm text-gray-500 mt-0.5">are currently below minimum stock levels.</span>
        </div>
      </div>
    </div>
  );
};

const ExpenseReport = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Total Operating Expenses</span>
           <span className="text-3xl font-bold text-gray-900">Rs. 1,12,000</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
           <span className="text-sm font-medium text-gray-500">Pending Payments</span>
           <span className="text-3xl font-bold text-amber-600">Rs. 24,500</span>
        </div>
      </div>

       <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm max-w-3xl">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          <div className="space-y-4">
             <div>
               <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">Rent & Utilities</span><span className="text-gray-900 font-semibold">40%</span></div>
               <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '40%' }}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">Salary / Wages</span><span className="text-gray-900 font-semibold">35%</span></div>
               <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-indigo-400 h-2.5 rounded-full" style={{ width: '35%' }}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">Marketing / Ads</span><span className="text-gray-900 font-semibold">15%</span></div>
               <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-indigo-300 h-2.5 rounded-full" style={{ width: '15%' }}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">Miscellaneous</span><span className="text-gray-900 font-semibold">10%</span></div>
               <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-indigo-200 h-2.5 rounded-full" style={{ width: '10%' }}></div></div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Reports;
