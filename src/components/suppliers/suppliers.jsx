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

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const Suppliers = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Suppliers</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalSuppliers}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Active Suppliers</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Inactive Suppliers</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">{inactiveCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
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
        </div>

        {/* Content */}
        {filteredSuppliers.length === 0 ? (
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
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Contact Person</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">City / State</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
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
                        <div className="font-medium text-gray-900">{supplier.name}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {supplier.companyName || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {supplier.contactPerson}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div>{supplier.mobile}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {supplier.city}, {supplier.state}
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
              setSuppliers(suppliers.filter(s => s.id !== deleteItem.id));
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
