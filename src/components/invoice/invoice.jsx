import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddInvoice from "./invoiceModal/AddInvoice";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";

export const invoiceData = [
  { id: "INV-2023-001", orderId: "ORD-001", customer: "Rahul Sharma", date: "2023-10-15", dueDate: "2023-10-25", amount: 1416, tax: 216, status: "Paid" },
  { id: "INV-2023-002", orderId: "ORD-003", customer: "Glow Signages", date: "2023-10-18", dueDate: "2023-11-02", amount: 53100, tax: 8100, status: "Overdue" },
  { id: "INV-2023-003", orderId: "ORD-004", customer: "Amit Kumar", date: "2023-10-20", dueDate: "2023-10-20", amount: 944, tax: 144, status: "Sent" },
  { id: "INV-2023-004", orderId: null, customer: "New Retail Client", date: "2023-10-22", dueDate: "2023-10-22", amount: 500, tax: 76, status: "Draft" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Sent", label: "Sent" },
  { value: "Paid", label: "Paid" },
  { value: "Overdue", label: "Overdue" },
];

export const Invoice = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [invoices, setInvoices] = useState(invoiceData);
  const [deleteItem, setDeleteItem] = useState(null);

  // Filters
  const hasActiveFilters = statusFilter !== "all";
  const filteredInvoices = invoices.filter((invoice) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || invoice.id.toLowerCase().includes(query) || invoice.customer.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const collected = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "Overdue").reduce((sum, i) => sum + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === "Sent" || i.status === "Overdue").reduce((sum, i) => sum + i.amount, 0);

  const handleRowClick = (invoice) => {
    router.push(`/invoice/${invoice.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Create and manage customer invoices, track payments and overdue bills.
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
              Create Invoice
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Invoiced</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">Rs. {totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Collected</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">Rs. {collected.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">Rs. {outstanding.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Overdue</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">Rs. {overdue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Invoice # or Customer..."
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
        {filteredInvoices.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Invoices"
            entityIcon="FileText"
            onClearSearch={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            addLabel="Create Invoice"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Invoice Number</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredInvoices.map(invoice => (
                    <tr 
                      key={invoice.id} 
                      onClick={() => handleRowClick(invoice)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                         <div className="font-semibold text-primary">{invoice.id}</div>
                         {invoice.orderId && <div className="text-[10px] text-gray-400">Order: {invoice.orderId}</div>}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{invoice.customer}</td>
                      <td className="px-4 py-3 text-gray-500">{invoice.date}</td>
                      <td className="px-4 py-3 text-gray-500">{invoice.dueDate}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        Rs. {invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                         <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(invoice)} className="px-2!">
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

      {isAddOpen && <AddInvoice open={isAddOpen} onClose={() => setIsAddOpen(false)} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.id}
          onConfirm={() => {
            setInvoices(invoices.filter(i => i.id !== deleteItem.id));
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Invoice;
