import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddExpense from "./expenseModal/AddExpense";
import EditExpense from "./expenseModal/EditExpense";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "OFFICE_SUPPLIES", label: "Office Supplies" },
  { value: "TRAVEL", label: "Travel" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "SALARY", label: "Salary" },
  { value: "MARKETING", label: "Marketing" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" }
];

export const Expense = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    dueAmount: 0,
    paidAmount: 0,
    categoryBreakdown: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses', {
        params: {
          limit: 200,
          search: search || undefined,
          category: categoryFilter || undefined,
          status: statusFilter || undefined,
          includeStats: true
        }
      });
      setExpenses(res.data.data);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExpenses();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, categoryFilter, statusFilter]);

  const hasActiveFilters = categoryFilter || statusFilter || search;
  
  const topCategory = Object.entries(stats.categoryBreakdown).sort((a,b) => b[1] - a[1])[0] || ["None", 0];

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Track business operating expenses, bills, and employee payments.
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
              Log Expense
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">Rs. {stats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Paid Amount</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">Rs. {stats.paidAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Due Amount</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">Rs. {stats.dueAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Highest Category</p>
            <p className="mt-1 text-xl font-bold text-indigo-600 truncate">{topCategory[0]} <span className="text-sm font-medium text-gray-500 block truncate">Rs. {topCategory[1].toLocaleString()}</span></p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Expense No, Name, Notes..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
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
        {loading ? (
           <div className="flex-1 flex items-center justify-center p-12">
             <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
           </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            search={hasActiveFilters ? "active filters" : ""}
            entityName="Expenses"
            entityIcon="Receipt"
            onClearSearch={() => {
              setSearch("");
              setCategoryFilter("");
              setStatusFilter("");
            }}
            addLabel="Log Expense"
            onAdd={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Expense No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Paid To</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {expenses.map(expense => {
                     return (
                      <tr 
                        key={expense.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/expense/${expense.id}`)}
                      >
                        <td className="px-4 py-3 font-medium text-primary">{expense.expenseNumber}</td>
                        <td className="px-4 py-3 text-gray-500 font-medium">
                          {new Date(expense.spentOn).toLocaleDateString('en-CA')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {expense.paidToType === 'SUPPLIER' && expense.supplier 
                            ? expense.supplier.name 
                            : (expense.paidToName || "N/A")}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {expense.category === 'OTHER' ? expense.categoryOther : expense.category.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          Rs. {parseFloat(expense.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                           <StatusBadge status={expense.status} />
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(expense)} className="px-2!">
                            <Icons name="Pencil" size={16} className="text-gray-500 hover:text-primary" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(expense)} className="px-2!">
                            <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                          </Button>
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isAddOpen && <AddExpense open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchExpenses(); }} />}
      {editItem && <EditExpense open={!!editItem} onClose={() => { setEditItem(null); fetchExpenses(); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.expenseNumber}
          onConfirm={async () => {
            try {
              await api.delete(`/expenses/${deleteItem.id}`);
              toast.success("Expense deleted");
              fetchExpenses();
            } catch (err) {
              toast.error("Failed to delete expense");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Expense;
