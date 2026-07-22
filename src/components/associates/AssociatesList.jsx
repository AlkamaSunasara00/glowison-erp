import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddAssociate from "./associateModal/AddAssociate";
import EditAssociate from "./associateModal/EditAssociate";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "INSTALLER", label: "Installer" },
  { value: "FABRICATOR", label: "Fabricator" },
  { value: "ELECTRICIAN", label: "Electrician" },
  { value: "HELPER", label: "Helper" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const Associates = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalAssociates: 0,
    activeAssociates: 0,
    totalPendingAmount: 0,
    totalWorkValue: 0
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [associates, setAssociates] = useState([]);
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

  const fetchAssociates = async (silent = false) => {
    try {
      if (!silent && associates.length === 0) setLoading(true);
      const res = await api.get('/associates', {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          includeStats: true
        }
      });
      setAssociates(res.data.data);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch associates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchAssociates();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;
    if (categoryFilter !== 'all') query.category = categoryFilter;
    if (statusFilter !== 'all') query.status = statusFilter;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, categoryFilter, statusFilter, isInitialized]);

  const hasActiveFilters = categoryFilter !== 'all' || statusFilter !== 'all' || debouncedSearch !== '';

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/associates/${deleteItem.id}`);
      toast.success('Associate deleted successfully');
      setDeleteItem(null);
      fetchAssociates(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete associate');
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Associates</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Manage contract workers, installers, fabricators, and project-based partners.
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
              Add Associate
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="Users" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Associates</p>
              <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{stats.totalAssociates}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center justify-center shrink-0 border">
              <Icons name="CheckCircle" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Active Associates</p>
              <h4 className="text-xl font-black text-emerald-600 tracking-tight truncate">{stats.activeAssociates}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Icons name="AlertCircle" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Pending Amount</p>
              <h4 className="text-xl font-black text-rose-600 tracking-tight truncate">₹{stats.totalPendingAmount.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Icons name="TrendingUp" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Work Value</p>
              <h4 className="text-xl font-black text-sky-600 tracking-tight truncate">₹{stats.totalWorkValue.toLocaleString()}</h4>
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
              placeholder="Search by name, phone..."
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
                <Loader text="Loading Associates..." />
              </div>
            )}
            <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
              <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Associate</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3 text-center">Projects</th>
                  <th className="px-4 py-3 text-right">Work Amount</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {!loading && associates.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-0">
                      <EmptyState
                        search={hasActiveFilters ? "active filters" : ""}
                        entityName="Associates"
                        entityIcon="Users"
                        onClearSearch={() => {
                          setSearch("");
                          setCategoryFilter("all");
                          setStatusFilter("all");
                          setPage(1);
                        }}
                        addLabel="Add Associate"
                        onAdd={() => setIsAddOpen(true)}
                      />
                    </td>
                  </tr>
                ) : (
                  associates.map(associate => {
                     return (
                      <tr 
                        key={associate.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/associates/${associate.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0 border border-gray-200 text-xs">
                               {(associate.name || "N/A").substring(0, 2).toUpperCase()}
                             </div>
                             <span className="font-semibold text-gray-900">{associate.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 border border-gray-100 text-gray-700">
                            {associate.category?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{associate.phone || '—'}</td>
                        <td className="px-4 py-3 text-center font-semibold text-gray-900">{associate.totalProjects}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{associate.totalWorkAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">₹{associate.totalPaid.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium text-rose-600">₹{associate.totalDue.toLocaleString()}</td>
                        <td className="px-4 py-3">
                           <StatusBadge status={associate.status} />
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(associate)} className="px-2!">
                            <Icons name="Pencil" size={16} className="text-gray-500 hover:text-primary" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(associate)} className="px-2!">
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

      {isAddOpen && (
        <AddAssociate 
          open={isAddOpen} 
          onClose={() => setIsAddOpen(false)} 
          onSuccess={() => fetchAssociates(true)} 
        />
      )}
      {editItem && (
        <EditAssociate 
          open={!!editItem} 
          onClose={() => setEditItem(null)} 
          associate={editItem} 
          onSuccess={() => fetchAssociates(true)} 
        />
      )}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default Associates;
