import React from "react";
import Icons from "@/common/Icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ExpenseReport = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Icons name="TrendingDown" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Expenses</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{formatCurrency(data.total)}</h4>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-sm border border-gray-100 shadow-sm min-w-0">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icons name="PieChart" size={14} className="text-primary"/> Expenses Breakdown
           </h3>
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
                         contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
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

export default ExpenseReport;
