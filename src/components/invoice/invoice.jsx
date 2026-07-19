import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddInvoice from "./invoiceModal/AddInvoice";
import EditInvoice from "./invoiceModal/EditInvoice";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import Loader from "@/common/Loader";

let globalInvoiceCache = null;

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const Invoice = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("invoiceViewMode") || "table";
    }
    return "table";
  });

  const [invoices, setInvoices] = useState(globalInvoiceCache || []);
  const [loading, setLoading] = useState(!globalInvoiceCache);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchInvoices = async (silent = false) => {
    try {
      if (!silent && !globalInvoiceCache) setLoading(true);
      const res = await api.get('/invoices?limit=200');
      const data = res.data.data.map(i => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        orderCode: i.order?.orderNumber ? `ORD-${String(i.order.orderNumber).padStart(6, '0')}` : null,
        customer: i.customer?.name || "Unknown",
        date: i.invoiceDate ? new Date(i.invoiceDate).toLocaleDateString('en-CA') : new Date(i.createdAt).toLocaleDateString('en-CA'),
        dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-CA') : "-",
        amount: Number(i.grandTotal),
        status: i.status
      }));
      globalInvoiceCache = data;
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(!!globalInvoiceCache);
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.create === 'true') {
      setIsAddOpen(true);
      const { create, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.create]);

  // Filters
  const hasActiveFilters = statusFilter !== "all";
  const filteredInvoices = invoices.filter((invoice) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || 
      (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(query)) || 
      invoice.customer.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const collected = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "OVERDUE").reduce((sum, i) => sum + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === "SENT" || i.status === "OVERDUE" || i.status === "DRAFT").reduce((sum, i) => sum + i.amount, 0);

  const handleRowClick = (invoiceId) => {
    router.push(`/invoice/${invoiceId}`);
  };

  const handleDuplicate = async (invoiceId) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}`);
      const original = res.data.data;
      const { id, invoiceNumber, createdAt, updatedAt, ...copyData } = original;
      await api.post('/invoices', { ...copyData, status: 'DRAFT' });
      toast.success("Invoice duplicated successfully");
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to duplicate invoice");
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="FileText" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Invoiced</p>
              <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">₹{totalInvoiced.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Icons name="CheckCircle" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Collected</p>
              <h4 className="text-xl font-black text-emerald-600 tracking-tight truncate">₹{collected.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Icons name="Clock" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Outstanding</p>
              <h4 className="text-xl font-black text-amber-600 tracking-tight truncate">₹{outstanding.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Icons name="AlertTriangle" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Overdue</p>
              <h4 className="text-xl font-black text-rose-600 tracking-tight truncate">₹{overdue.toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-sm border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
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
          <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setViewMode("table");
                if (typeof window !== "undefined") localStorage.setItem("invoiceViewMode", "table");
              }}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "table" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Table View"
            >
              <Icons name="List" size={18} />
            </button>
            <button
              onClick={() => {
                setViewMode("card");
                if (typeof window !== "undefined") localStorage.setItem("invoiceViewMode", "card");
              }}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "card" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Card View"
            >
              <Icons name="Grid" size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {/* Content */}
        {loading ? (
          <div className="flex-1 bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
            <Loader text="Loading Invoices..." />
          </div>
        ) : filteredInvoices.length === 0 ? (
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
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Invoice Number</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Invoice Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredInvoices.map(invoice => (
                    <tr 
                      key={invoice.id} 
                      onClick={() => handleRowClick(invoice.id)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                         <div className="font-semibold text-gray-900">{invoice.invoiceNumber}</div>
                         {invoice.orderCode && <div className="text-[10px] text-gray-400">Order: {invoice.orderCode}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-100/50 text-xs">
                             {invoice.customer.substring(0, 2).toUpperCase()}
                           </div>
                           <span className="font-semibold text-gray-900">{invoice.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{invoice.date}</td>
                      <td className="px-4 py-3 text-gray-600">{invoice.dueDate}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        ₹{invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-4 py-3 text-center">
                         <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleRowClick(invoice.id)} className="px-2!" title="View / Print">
                            <Icons name="Eye" size={16} className="text-gray-400 hover:text-blue-500 transition-colors" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={async () => {
                              const res = await api.get(`/invoices/${invoice.id}`);
                              setEditItem(res.data.data);
                          }} className="px-2!" title="Edit">
                            <Icons name="Pencil" size={16} className="text-gray-400 hover:text-primary transition-colors" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDuplicate(invoice.id)} className="px-2!" title="Duplicate">
                            <Icons name="Copy" size={16} className="text-gray-400 hover:text-green-500 transition-colors" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(invoice)} className="px-2!" title="Delete">
                            <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
            {filteredInvoices.map(invoice => (
              <div 
                key={invoice.id}
                onClick={() => handleRowClick(invoice.id)}
                className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
              >
                <div className="flex justify-between items-start mb-1">
                   <span className="font-bold text-gray-900">{invoice.invoiceNumber}</span>
                   <StatusBadge status={invoice.status} />
                </div>
                
                <div className="flex items-center gap-3 py-2 border-y border-gray-50">
                   <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-100 text-sm">
                     {invoice.customer.substring(0, 2).toUpperCase()}
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Customer</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{invoice.customer}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Invoice Date</span>
                    <span className="text-xs font-bold text-gray-900 mt-0.5 truncate flex items-center gap-1"><Icons name="Calendar" size={10}/> {invoice.date}</span>
                  </div>
                  <div className="flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Due Date</span>
                    <span className="text-xs font-bold text-gray-900 mt-0.5 truncate flex items-center gap-1"><Icons name="Clock" size={10}/> {invoice.dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-auto">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Amount</span>
                  <span className="text-lg font-black text-gray-900">₹{invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                   <Button variant="solid" size="sm" onClick={() => handleDuplicate(invoice.id)} className="rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-md bg-green-600 hover:bg-green-700 border-none"><Icons name="Copy" size={14} /></Button>
                   <Button variant="solid" size="sm" onClick={async () => {
                       const res = await api.get(`/invoices/${invoice.id}`);
                       setEditItem(res.data.data);
                   }} className="rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-md"><Icons name="Pencil" size={14} /></Button>
                   <Button variant="solid" size="sm" onClick={() => setDeleteItem(invoice)} className="rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-md bg-rose-600 hover:bg-rose-700 border-none"><Icons name="Trash2" size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddOpen && <AddInvoice open={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchInvoices} />}
      {editItem && <EditInvoice open={!!editItem} initialData={editItem} onClose={() => setEditItem(null)} onSuccess={fetchInvoices} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.invoiceNumber}
          onConfirm={async () => {
            try {
              await api.delete(`/invoices/${deleteItem.id}`);
              toast.success("Invoice deleted");
              const updated = invoices.filter(i => i.id !== deleteItem.id);
              globalInvoiceCache = updated;
              setInvoices(updated);
            } catch (err) {
              toast.error("Failed to delete invoice");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Invoice;
