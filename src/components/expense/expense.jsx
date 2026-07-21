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
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "OFFICE_SUPPLIES", label: "Office Supplies" },
  { value: "TRAVEL", label: "Travel" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "SALARY", label: "Salary" },
  { value: "MARKETING", label: "Marketing" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" }
];

export const Expense = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalAmount: 0,
    dueAmount: 0,
    paidAmount: 0,
    categoryBreakdown: {}
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from URL query
  useEffect(() => {
    if (router.isReady && !isInitialized) {
      if (router.query.page) setPage(parseInt(router.query.page) || 1);
      if (router.query.search) {
        setSearch(router.query.search);
        setDebouncedSearch(router.query.search);
      }
      if (router.query.category) setCategoryFilter(router.query.category);
      if (router.query.status) setStatusFilter(router.query.status);
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

  const fetchExpenses = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/expenses', {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          includeStats: true
        }
      });
      setExpenses(res.data.data);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchExpenses();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;
    if (categoryFilter !== 'all') query.category = categoryFilter;
    if (statusFilter !== 'all') query.status = statusFilter;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, categoryFilter, statusFilter, isInitialized]);

  const hasActiveFilters = categoryFilter !== 'all' || statusFilter !== 'all' || debouncedSearch !== '';
  
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="TrendingDown" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Expenses</p>
              <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">₹{stats.totalAmount.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center justify-center shrink-0 border">
              <Icons name="CheckCircle" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Paid Amount</p>
              <h4 className="text-xl font-black text-emerald-600 tracking-tight truncate">₹{stats.paidAmount.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Icons name="AlertCircle" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Due Amount</p>
              <h4 className="text-xl font-black text-rose-600 tracking-tight truncate">₹{stats.dueAmount.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Icons name="PieChart" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Highest: {topCategory[0]}</p>
              <h4 className="text-xl font-black text-sky-600 tracking-tight truncate">₹{topCategory[1].toLocaleString()}</h4>
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
              placeholder="Search Expense No, Name, Notes..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              options={categoryOptions}
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
        </div>

        {/* Content */}
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            {loading && (
              <div className="absolute inset-0 top-[40px] z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <Loader text="Loading Expenses..." />
              </div>
            )}
            <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
              <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Expense No & Date</th>
                  <th className="px-4 py-3">Paid To</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {!loading && expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-0">
                      <EmptyState
                        search={hasActiveFilters ? "active filters" : ""}
                        entityName="Expenses"
                        entityIcon="Receipt"
                        onClearSearch={() => {
                          setSearch("");
                          setCategoryFilter("all");
                          setStatusFilter("all");
                          setPage(1);
                        }}
                        addLabel="Log Expense"
                        onAdd={() => setIsAddOpen(true)}
                      />
                    </td>
                  </tr>
                ) : (
                  expenses.map(expense => {
                     return (
                      <tr 
                        key={expense.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/expense/${expense.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{expense.expenseNumber}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Icons name="Calendar" size={10} /> {new Date(expense.spentOn).toLocaleDateString('en-CA')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0 border border-gray-200 text-xs">
                               {(expense.paidToType === 'SUPPLIER' && expense.supplier ? expense.supplier.name : (expense.paidToName || "N/A")).substring(0, 2).toUpperCase()}
                             </div>
                             <span className="font-medium text-gray-900">
                               {expense.paidToType === 'SUPPLIER' && expense.supplier 
                                 ? expense.supplier.name 
                                 : (expense.paidToName || "N/A")}
                             </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 border border-gray-100 text-gray-700">
                            {expense.category === 'OTHER' ? expense.categoryOther : expense.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₹{parseFloat(expense.amount).toLocaleString()}
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
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={(newPage) => setPage(newPage)} 
          />
        </div>
      </div>

      {isAddOpen && <AddExpense open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchExpenses(true); }} />}
      {editItem && <EditExpense open={!!editItem} onClose={() => { setEditItem(null); fetchExpenses(true); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.expenseNumber}
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
