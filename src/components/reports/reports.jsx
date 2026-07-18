import React, { useState, useEffect } from "react";
import Icons from "@/common/Icons";
import api from "@/lib/api";

import OverviewReport from "./tabs/OverviewReport";
import SalesReport from "./tabs/SalesReport";
import LeadsReport from "./tabs/LeadsReport";
import InventoryReport from "./tabs/InventoryReport";
import ExpenseReport from "./tabs/ExpenseReport";
import AssociateReport from "./tabs/AssociateReport";
import Loader from "@/common/Loader";

const reportTabs = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "sales", label: "Sales & Orders", icon: "TrendingUp" },
  { id: "leads", label: "Leads", icon: "Users" },
  { id: "inventory", label: "Inventory", icon: "Package" },
  { id: "associates", label: "Associates", icon: "Briefcase" },
  { id: "expenses", label: "Expenses", icon: "CreditCard" },
];

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
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Gain comprehensive insights into your business performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2 rounded-sm border border-gray-100 shadow-sm shrink-0">
             <div className="flex items-center gap-3 px-2">
                 <Icons name="Calendar" size={16} className="text-gray-400" />
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</span>
                   <input 
                     type="date" 
                     value={startDate} 
                     onChange={(e) => setStartDate(e.target.value)}
                     className="bg-transparent text-gray-800 text-sm font-semibold focus:ring-0 focus:outline-none cursor-pointer"
                   />
                 </div>
             </div>
             <div className="hidden sm:block w-px h-5 bg-gray-200"></div>
             <div className="flex items-center gap-3 px-2">
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To</span>
                   <input 
                     type="date" 
                     value={endDate} 
                     onChange={(e) => setEndDate(e.target.value)}
                     className="bg-transparent text-gray-800 text-sm font-semibold focus:ring-0 focus:outline-none cursor-pointer"
                   />
                 </div>
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {reportTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold transition-colors
                  ${isActive 
                    ? "bg-primary text-white shadow-sm" 
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                `}
              >
                <Icons name={tab.icon} size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="w-full min-w-0">
          {loading ? (
             <div className="flex-1 bg-white rounded-sm border border-gray-100 shadow-sm min-h-[400px] flex items-center justify-center">
               <Loader text="Generating Report..." />
             </div>
          ) : !reportData ? (
             <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-sm border border-gray-100 shadow-sm">
               <Icons name="Inbox" size={40} className="text-gray-300 mx-auto mb-3" />
               <div className="text-sm font-medium text-gray-500">No data available</div>
               <p className="text-xs text-gray-400 mt-1">Try adjusting the date range.</p>
             </div>
          ) : (
            <div className="animate-fade-in-up">
              {activeTab === "overview" && <OverviewReport data={reportData} />}
              {activeTab === "sales" && <SalesReport data={reportData.sales} overview={reportData.overview} />}
              {activeTab === "leads" && <LeadsReport data={reportData.leads} overview={reportData.overview} />}
              {activeTab === "inventory" && <InventoryReport data={reportData.inventory} />}
              {activeTab === "associates" && <AssociateReport data={reportData.associates} />}
              {activeTab === "expenses" && <ExpenseReport data={reportData.expenses} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
