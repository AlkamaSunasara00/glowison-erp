import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddSupplier from "./supplierModal/AddSupplier";
import EditSupplier from "./supplierModal/EditSupplier";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import toast from "react-hot-toast";
import Loader from "@/common/Loader";

let globalSuppliersCache = null;

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const Suppliers = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("supplierViewMode") || "table";
    }
    return "table";
  });
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [suppliers, setSuppliers] = useState(globalSuppliersCache || []);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(!globalSuppliersCache);

  const fetchSuppliers = async (silent = false) => {
    try {
      if (!silent && !globalSuppliersCache) setLoading(true);
      const res = await api.get('/suppliers');
      globalSuppliersCache = res.data.data;
      setSuppliers(res.data.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(!!globalSuppliersCache);
  }, []);

  // Filters
  const hasActiveFilters = statusFilter !== "all";
  const filteredSuppliers = suppliers.filter((supplier) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || 
      supplier.name.toLowerCase().includes(query) || 
      (supplier.companyName && supplier.companyName.toLowerCase().includes(query)) ||
      supplier.mobile.includes(query);
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalSuppliers = suppliers.length;
  const activeCount = suppliers.filter(s => s.status === "ACTIVE").length;
  const inactiveCount = suppliers.filter(s => s.status === "INACTIVE").length;

  const handleRowClick = (supplier) => {
    router.push(`/suppliers/${supplier.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Manage your suppliers and raw material vendors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="solid"
              onClick={() => setIsAddSupplierOpen(true)}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
            >
              Add Supplier
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="Users" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Suppliers</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{totalSuppliers}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center justify-center shrink-0 border">
              <Icons name="CheckCircle" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Suppliers</p>
              <h4 className="text-2xl font-black text-emerald-600 tracking-tight">{activeCount}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Icons name="XCircle" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inactive Suppliers</p>
              <h4 className="text-2xl font-black text-rose-600 tracking-tight">{inactiveCount}</h4>
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
              placeholder="Search by name, company or phone..."
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
                if (typeof window !== "undefined") localStorage.setItem("supplierViewMode", "table");
              }}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "table" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Table View"
            >
              <Icons name="List" size={18} />
            </button>
            <button
              onClick={() => {
                setViewMode("card");
                if (typeof window !== "undefined") localStorage.setItem("supplierViewMode", "card");
              }}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "card" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Card View"
            >
              <Icons name="Grid" size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
            <Loader text="Loading Suppliers..." />
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Suppliers"
            entityIcon="Truck"
            onClearSearch={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            addLabel="Add Supplier"
          />
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Supplier Details</th>
                    <th className="px-4 py-3">Contact Person</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredSuppliers.map(supplier => (
                    <tr 
                      key={supplier.id} 
                      onClick={() => handleRowClick(supplier)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-sm bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-100/50">
                            {supplier.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{supplier.name}</div>
                            {supplier.companyName && <div className="text-xs text-gray-500 mt-0.5">{supplier.companyName}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{supplier.contactPerson}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{supplier.mobile}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="font-medium">{supplier.city}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{supplier.state}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={supplier.status} 
                        />
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(supplier)} className="px-2!">
                            <Icons name="Pencil" size={16} className="text-gray-400 hover:text-indigo-600 transition-colors" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(supplier)} className="px-2!">
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
            {filteredSuppliers.map(supplier => (
              <div 
                key={supplier.id}
                onClick={() => handleRowClick(supplier)}
                className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
              >
                <div className={`h-24 w-full rounded-sm border border-gray-200 overflow-hidden flex items-center justify-center relative mb-2 bg-gradient-to-br from-gray-50 to-white`}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                    {supplier.name.substring(0, 2).toUpperCase()}
                  </div>
                  
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <StatusBadge status={supplier.status} />
                  </div>
                  
                  {/* Floating Action Buttons inside header */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                     <Button variant="outline" size="sm" onClick={() => setEditItem(supplier)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Pencil" size={14} className="text-gray-600 hover:text-indigo-600" /></Button>
                     <Button variant="outline" size="sm" onClick={() => setDeleteItem(supplier)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Trash2" size={14} className="text-gray-600 hover:text-rose-500" /></Button>
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate" title={supplier.name}>{supplier.name}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{supplier.companyName || 'No Company Name'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Contact</span>
                    <span className="text-xs font-bold text-gray-900 mt-0.5 truncate">{supplier.contactPerson}</span>
                  </div>
                  <div className="flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Mobile</span>
                    <span className="text-xs font-bold text-gray-900 mt-0.5 truncate">{supplier.mobile}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-gray-50 text-[11px] text-gray-500 font-medium">
                  <Icons name="MapPin" size={12} className="text-gray-400 shrink-0"/>
                  <span className="truncate">{supplier.city}, {supplier.state}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddSupplierOpen && <AddSupplier open={isAddSupplierOpen} onClose={() => { setIsAddSupplierOpen(false); fetchSuppliers(); }} />}
      {editItem && <EditSupplier open={!!editItem} onClose={() => { setEditItem(null); fetchSuppliers(); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/suppliers/${deleteItem.id}`);
              toast.success("Supplier deleted");
              const updated = suppliers.filter(s => s.id !== deleteItem.id);
              globalSuppliersCache = updated;
              setSuppliers(updated);
            } catch (err) {
              toast.error("Failed to delete supplier");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Suppliers;
