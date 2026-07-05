import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddQuotation from "./quotationModal/AddQuotation";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";

export const quotationData = [
  { id: "QT-2023-001", type: "Lead", entityName: "Dr. Priya Sharma", date: "2023-10-15", validUntil: "2023-10-25", amount: 150000, status: "Sent" },
  { id: "QT-2023-002", type: "Customer", entityName: "Rahul Sharma", date: "2023-10-18", validUntil: "2023-11-02", amount: 1200, status: "Accepted" },
  { id: "QT-2023-003", type: "Customer", entityName: "Glow Signages", date: "2023-10-20", validUntil: "2023-11-20", amount: 45000, status: "Draft" },
  { id: "QT-2023-004", type: "Lead", entityName: "Ahmedabad Clinic", date: "2023-10-22", validUntil: "2023-10-29", amount: 85000, status: "Rejected" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Sent", label: "Sent" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
];

export const Quotation = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [quotations, setQuotations] = useState(quotationData);
  const [deleteItem, setDeleteItem] = useState(null);

  // Filters
  const hasActiveFilters = statusFilter !== "all";
  const filteredQuotations = quotations.filter((qt) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || qt.id.toLowerCase().includes(query) || qt.entityName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || qt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalSent = quotations.filter(q => q.status === "Sent" || q.status === "Accepted" || q.status === "Rejected").length;
  const acceptedCount = quotations.filter(q => q.status === "Accepted").length;
  const conversionRate = totalSent > 0 ? Math.round((acceptedCount / totalSent) * 100) : 0;
  const acceptedValue = quotations.filter(q => q.status === "Accepted").reduce((sum, q) => sum + q.amount, 0);

  const handleRowClick = (qt) => {
    router.push(`/quotation/${qt.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Quotations</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Create and manage estimates for leads and customers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="solid"
              onClick={() => setIsAddOpen(true)}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
            >
              Create Quotation
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Quotes Sent</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalSent}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Accepted Value</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">Rs. {acceptedValue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{conversionRate}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID or Name..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        {/* Content */}
        {filteredQuotations.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Quotations"
            entityIcon="FileText"
            onClearSearch={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            addLabel="Create Quotation"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Quote Number</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredQuotations.map(qt => (
                    <tr 
                      key={qt.id} 
                      onClick={() => handleRowClick(qt)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-primary">{qt.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{qt.entityName}</div>
                        <div className="text-[10px] text-gray-500 uppercase">{qt.type}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{qt.date}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        Rs. {qt.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                         <StatusBadge status={qt.status} />
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                         <Button variant="ghost" size="sm" onClick={() => setDeleteItem(qt)} className="px-2!">
                           <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                         </Button>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isAddOpen && <AddQuotation open={isAddOpen} onClose={() => setIsAddOpen(false)} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.id}
          onConfirm={() => {
            setQuotations(quotations.filter(q => q.id !== deleteItem.id));
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Quotation;
