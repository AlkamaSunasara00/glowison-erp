import React from "react";
import Icons from "@/common/Icons";

const AssociateReport = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Associates */}
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Icons name="Users" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Associates</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{data.totalCount}</h4>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Icons name="Briefcase" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Assigned Projects</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{data.projectsCount}</h4>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Icons name="CheckCircle" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Completed Projects</p>
            <h4 className="text-xl font-black text-emerald-600 tracking-tight truncate">{data.completedProjectsCount}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Project Amount */}
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
            <Icons name="FileText" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Project Amount</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{formatCurrency(data.totalProjectAmount)}</h4>
          </div>
        </div>

        {/* Total Paid Amount */}
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <Icons name="Banknote" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Paid to Associates</p>
            <h4 className="text-xl font-black text-teal-600 tracking-tight truncate">{formatCurrency(data.totalPaidAmount)}</h4>
          </div>
        </div>

        {/* Total Due Amount */}
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Icons name="AlertCircle" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Pending Dues</p>
            <h4 className="text-xl font-black text-rose-600 tracking-tight truncate">{formatCurrency(data.dueAmount)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssociateReport;
