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
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices?limit=200');
      setInvoices(res.data.data.map(i => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        orderCode: i.order?.orderNumber ? `ORD-${String(i.order.orderNumber).padStart(6, '0')}` : null,
        customer: i.customer?.name || "Unknown",
        date: i.invoiceDate ? new Date(i.invoiceDate).toLocaleDateString('en-CA') : new Date(i.createdAt).toLocaleDateString('en-CA'),
        dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-CA') : "-",
        amount: Number(i.grandTotal),
        status: i.status
      })));
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

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
                    <th className="px-4 py-3">Invoice Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
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
                         <div className="font-semibold text-primary">{invoice.invoiceNumber}</div>
                         {invoice.orderCode && <div className="text-[10px] text-gray-400">Order: {invoice.orderCode}</div>}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{invoice.customer}</td>
                      <td className="px-4 py-3 text-gray-500">{invoice.date}</td>
                      <td className="px-4 py-3 text-gray-500">{invoice.dueDate}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        Rs. {invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                            <Icons name="Edit" size={16} className="text-gray-400 hover:text-primary transition-colors" />
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
              fetchInvoices();
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
