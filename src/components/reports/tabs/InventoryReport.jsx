import React from "react";
import Icons from "@/common/Icons";

const InventoryReport = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Icons name="Package" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Inventory Value</p>
            <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{formatCurrency(data.totalValue)}</h4>
          </div>
        </div>
        
        <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Icons name="AlertTriangle" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Low Stock Alerts</p>
            <h4 className="text-xl font-black text-rose-600 tracking-tight truncate">{data.lowStockCount} Items</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden min-w-0">
         <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
               <Icons name="AlertTriangle" size={14} className="text-rose-500"/> Low Stock Items Details
            </h3>
         </div>
         
         {data.lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Item Name</th>
                      <th className="px-4 py-3 text-right">Current Stock</th>
                      <th className="px-4 py-3 text-right">Threshold</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                     {data.lowStockItems.map((item, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                           <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                           <td className="px-4 py-3 text-right">
                              <span className="font-bold text-rose-600">
                                 {item.stockQty}
                              </span>
                           </td>
                           <td className="px-4 py-3 text-right text-gray-500 font-semibold">{item.threshold}</td>
                           <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 border border-rose-100 text-rose-700">
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
                <Icons name="CheckCircle" size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">Inventory is healthy!</p>
                <p className="text-xs text-gray-400 mt-1">No items are currently below their reorder threshold.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default InventoryReport;
