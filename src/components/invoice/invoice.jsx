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
import Pagination from "@/common/Pagination";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("invoiceViewMode") || "table";
    }
    return "table";
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalInvoiced: 0, collected: 0, overdue: 0, outstanding: 0 });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Initialize from URL query
  useEffect(() => {
    if (router.isReady && !isInitialized) {
      if (router.query.page) setPage(parseInt(router.query.page) || 1);
      if (router.query.search) {
        setSearch(router.query.search);
        setDebouncedSearch(router.query.search);
      }
      if (router.query.status) setStatusFilter(router.query.status);
      if (router.query.create === 'true') {
        setIsAddOpen(true);
        const { create, ...rest } = router.query;
        router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
      }
      setIsInitialized(true);
    }
  }, [router.isReady, isInitialized, router.query]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  const fetchInvoices = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/invoices', {
        params: {
          page,
          limit: viewMode === 'card' ? 20 : 10,
          search: debouncedSearch,
          status: statusFilter === 'all' ? undefined : statusFilter,
          includeStats: true
        }
      });
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
      setInvoices(data);
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchInvoices();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;
    if (statusFilter !== 'all') query.status = statusFilter;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, statusFilter, viewMode, isInitialized]);

  // Filters
  const hasActiveFilters = statusFilter !== "all" || debouncedSearch !== "";

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
    <div className="flex flex-col min-h-screen w-full relative gap-4 pb-10">
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
              <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">₹{Number(stats.totalInvoiced).toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Icons name="CheckCircle" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Collected</p>
              <h4 className="text-xl font-black text-emerald-600 tracking-tight truncate">₹{Number(stats.collected).toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Icons name="Clock" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Outstanding</p>
              <h4 className="text-xl font-black text-amber-600 tracking-tight truncate">₹{Number(stats.outstanding).toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Icons name="AlertTriangle" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Overdue</p>
              <h4 className="text-xl font-black text-rose-600 tracking-tight truncate">₹{Number(stats.overdue).toLocaleString()}</h4>
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
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={statusOptions}
            />
          </div>
          <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setViewMode("table");
                setPage(1);
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
                setPage(1);
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
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
          <div className={`flex-1 overflow-auto custom-scrollbar relative ${viewMode === 'card' ? 'p-4 bg-gray-50/30' : ''}`}>
            {loading && (
              <div className="absolute inset-0 top-[40px] z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <Loader text="Loading Invoices..." />
              </div>
            )}
            
            {viewMode === "table" ? (
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
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
                  {!loading && invoices.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-0">
                        <EmptyState
                          search={search || (hasActiveFilters ? "active filters" : "")}
                          entityName="Invoices"
                          entityIcon="FileText"
                          onClearSearch={() => {
                            setSearch("");
                            setStatusFilter("all");
                            setPage(1);
                          }}
                          addLabel="Create Invoice"
                        />
                      </td>
                    </tr>
                  ) : (
                    invoices.map(invoice => (
                      <tr 
                        key={invoice.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(invoice.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-indigo-600">{invoice.invoiceNumber}</div>
                          {invoice.orderCode && <div className="text-[11px] text-gray-500 mt-0.5">Order: {invoice.orderCode}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{invoice.customer}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{invoice.date}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {invoice.dueDate !== "-" ? (
                            <span className={invoice.status === 'OVERDUE' ? 'text-rose-600 font-medium' : ''}>{invoice.dueDate}</span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          ₹{invoice.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDuplicate(invoice.id)} className="px-2!" title="Duplicate">
                              <Icons name="Copy" size={16} className="text-gray-400 hover:text-indigo-600 transition-colors" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteItem(invoice)} className="px-2!">
                              <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start relative min-h-[300px]">
                {!loading && invoices.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      search={search || (hasActiveFilters ? "active filters" : "")}
                      entityName="Invoices"
                      entityIcon="FileText"
                      onClearSearch={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setPage(1);
                      }}
                      addLabel="Create Invoice"
                    />
                  </div>
                ) : (
                  invoices.map(invoice => (
                    <div 
                      key={invoice.id}
                      onClick={() => handleRowClick(invoice.id)}
                      className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-indigo-600 text-lg truncate">{invoice.invoiceNumber}</h3>
                          <p className="text-sm font-medium text-gray-900 mt-1 truncate">{invoice.customer}</p>
                        </div>
                        <StatusBadge status={invoice.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Date</span>
                          <span className="text-sm text-gray-700">{invoice.date}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Due</span>
                          <span className={`text-sm ${invoice.status === 'OVERDUE' ? 'text-rose-600 font-medium' : 'text-gray-700'}`}>{invoice.dueDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                        <div>
                          <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Total</span>
                          <span className="font-bold text-gray-900">₹{invoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                           <Button variant="outline" size="sm" onClick={() => handleDuplicate(invoice.id)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm" title="Duplicate"><Icons name="Copy" size={14} className="text-gray-600 hover:text-indigo-600" /></Button>
                           <Button variant="outline" size="sm" onClick={() => setDeleteItem(invoice)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Trash2" size={14} className="text-gray-600 hover:text-rose-500" /></Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={(newPage) => setPage(newPage)} 
          />
        </div>
      </div>

      {isAddOpen && <AddInvoice open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchInvoices(true); }} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={`Invoice ${deleteItem.invoiceNumber}`}
          onConfirm={async () => {
            try {
              await api.delete(`/invoices/${deleteItem.id}`);
              toast.success("Invoice deleted");
              setInvoices(invoices.filter(i => i.id !== deleteItem.id));
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
