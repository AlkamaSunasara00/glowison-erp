import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Icons from "@/common/Icons";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SalesReport = ({ data, overview }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
        <div className="bg-white p-5 rounded-sm border border-gray-100 shadow-sm min-w-0">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Icons name="TrendingUp" size={14} className="text-primary"/> Revenue & Profit Trend
             </h3>
             <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-sm border border-gray-100">{data.trend.length} days</span>
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
                         contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
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
        
        <div className="bg-white p-5 rounded-sm border border-gray-100 shadow-sm min-w-0">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icons name="PieChart" size={14} className="text-primary"/> Sales by Source
           </h3>
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
                         contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
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

export default SalesReport;
