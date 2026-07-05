import React, { useState, useEffect } from "react";
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
  { value: "all", label: "All Categories" },
  { value: "Rent", label: "Rent" },
  { value: "Salary", label: "Salary" },
  { value: "Marketing", label: "Marketing" },
  { value: "Utilities", label: "Utilities" },
  { value: "Misc", label: "Misc" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
];

export const Expense = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses?limit=200');
      setExpenses(res.data.data.map(e => ({
        id: e.id,
        date: new Date(e.spentOn).toLocaleDateString('en-CA'),
        category: e.category.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), // OFFICE_SUPPLIES -> Office Supplies
        amount: e.amount,
        paidTo: e.note || "N/A", // The schema didn't have a paidTo field, so using note if any, else N/A
        notes: e.note || "",
        status: e.status === "PAID" ? "Paid" : "Pending"
      })));
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filters
  const hasActiveFilters = categoryFilter !== "all" || statusFilter !== "all";
  const filteredExpenses = expenses.filter((expense) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || expense.paidTo.toLowerCase().includes(query) || expense.notes.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPIs
  const totalExpenses = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
  
  const expensesByCategory = expenses.filter(e => e.status === 'Paid').reduce((acc, e) => {
     acc[e.category] = (acc[e.category] || 0) + e.amount;
     return acc;
  }, {});
  
  const topCategory = Object.entries(expensesByCategory).sort((a,b) => b[1] - a[1])[0] || ["None", 0];

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Track business operating expenses and bills.
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Expenses (Paid)</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">Rs. {totalExpenses.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Pending Bills</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">Rs. {pendingExpenses.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Highest Category</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{topCategory[0]} <span className="text-sm font-medium text-gray-500">(Rs. {topCategory[1].toLocaleString()})</span></p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Paid To or Notes..."
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
        {filteredExpenses.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Expenses"
            entityIcon="Receipt"
            onClearSearch={() => {
              setSearch("");
              setCategoryFilter("all");
              setStatusFilter("all");
            }}
            addLabel="Log Expense"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Paid To</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredExpenses.map(expense => {
                     return (
                      <tr 
                        key={expense.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-500 font-medium">{expense.date}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{expense.paidTo}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {expense.category}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]" title={expense.notes}>
                          {expense.notes}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          Rs. {expense.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                           <StatusBadge status={expense.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
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
          entityName={deleteItem.id}
          onConfirm={async () => {
            try {
              await api.delete(`/expenses/${deleteItem.id}`);
              toast.success("Expense deleted");
              setExpenses(expenses.filter(e => e.id !== deleteItem.id));
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
