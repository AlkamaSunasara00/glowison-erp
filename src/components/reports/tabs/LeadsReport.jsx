import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Icons from "@/common/Icons";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const LeadsReport = ({ data, overview }) => {
  return (
    <div className="grid grid-cols-1 gap-4 w-full">
        <div className="bg-white p-5 rounded-sm border border-gray-100 shadow-sm min-w-0">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icons name="BarChart2" size={14} className="text-primary"/> Leads by Source
           </h3>
           <div className="h-[300px] w-full">
              {data.bySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bySource} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dx={-10} width={100} />
                      <Tooltip 
                         cursor={{fill: '#f9fafb'}}
                         contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">No leads source data available.</div>
              )}
           </div>
        </div>
        <div className="bg-white p-5 rounded-sm border border-gray-100 shadow-sm min-w-0">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icons name="PieChart" size={14} className="text-primary"/> Pipeline Status
           </h3>
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
                         contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
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

export default LeadsReport;
