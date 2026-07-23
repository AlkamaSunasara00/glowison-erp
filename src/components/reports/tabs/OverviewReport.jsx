import React from "react";
import Icons from "@/common/Icons";

const OverviewReport = ({ data }) => {
  const { overview } = data;

  const totalRevenue = overview.totalSales || 0;
  const totalExpenseAll = (overview.totalExpenses || 0) + (overview.totalPurchases || 0) + (overview.totalAssociatePaid || 0);
  const netProfit = totalRevenue - totalExpenseAll;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Revenue */}
      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <Icons name="IndianRupee" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <h4 className="text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">₹{totalRevenue.toLocaleString()}</h4>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
          <Icons name="TrendingDown" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Expenses</p>
          <h4 className="text-2xl font-black text-rose-600 tracking-tight whitespace-nowrap">₹{totalExpenseAll.toLocaleString()}</h4>
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Icons name="TrendingUp" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Net Profit</p>
          <h4 className={`text-2xl font-black tracking-tight whitespace-nowrap ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ₹{netProfit.toLocaleString()}
          </h4>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Icons name="ShoppingCart" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
          <h4 className="text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">{overview.totalOrders || 0}</h4>
        </div>
      </div>

      {/* Leads */}
      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
          <Icons name="Users" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Leads</p>
          <h4 className="text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">{overview.totalLeads || 0}</h4>
        </div>
      </div>

      {/* New Customers */}
      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
          <Icons name="UserPlus" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">New Customers</p>
          <h4 className="text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">{overview.newCustomers || 0}</h4>
        </div>
      </div>
    </div>
  );
};

export default OverviewReport;
