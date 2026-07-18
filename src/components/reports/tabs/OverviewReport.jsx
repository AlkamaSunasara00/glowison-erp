import React from "react";
import Icons from "@/common/Icons";

const OverviewReport = ({ data }) => {
  const { overview } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <Icons name="IndianRupee" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Revenue</p>
          <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">₹{overview.totalSales?.toLocaleString()}</h4>
        </div>
      </div>

      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Icons name="ShoppingCart" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Orders</p>
          <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{overview.totalOrders}</h4>
        </div>
      </div>

      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
          <Icons name="Users" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Leads</p>
          <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{overview.totalLeads}</h4>
        </div>
      </div>

      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
          <Icons name="TrendingDown" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Expenses</p>
          <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">₹{overview.totalExpenses?.toLocaleString()}</h4>
        </div>
      </div>

      <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
          <Icons name="TrendingUp" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Profit</p>
          <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">₹{(overview.totalSales - overview.totalExpenses)?.toLocaleString()}</h4>
        </div>
      </div>
    </div>
  );
};

export default OverviewReport;
