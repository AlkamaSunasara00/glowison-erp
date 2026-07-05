import React, { useState } from "react";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddInventory from "./inventoryModal/AddInventory";
import EditInventory from "./inventoryModal/EditInventory";
import AdjustStock from "./inventoryModal/AdjustStock";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";

export const inventoryData = [
  { id: "INV-001", sku: "MDF-6MM", name: "MDF Sheet 6mm", type: "Raw Material", category: "Boards", stock: 150, minStock: 50, price: 120 },
  { id: "INV-002", sku: "ACR-2MM-CLR", name: "Clear Acrylic 2mm", type: "Raw Material", category: "Sheets", stock: 20, minStock: 30, price: 450 },
  { id: "INV-003", sku: "WC-001", name: "Custom Wall Clock", type: "Finished Good", category: "Decor", stock: 5, minStock: 10, price: 1200 },
  { id: "INV-004", sku: "LED-W", name: "LED Strip - Warm White", type: "Raw Material", category: "Lighting", stock: 500, minStock: 100, price: 45 },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "Raw Material", label: "Raw Material" },
  { value: "Finished Good", label: "Finished Good" },
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Boards", label: "Boards" },
  { value: "Sheets", label: "Sheets" },
  { value: "Decor", label: "Decor" },
  { value: "Lighting", label: "Lighting" },
];

export const Inventory = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [items, setItems] = useState(inventoryData);

  // Filters
  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all";
  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || item.sku.toLowerCase().includes(query) || item.name.toLowerCase().includes(query);
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // KPIs
  const totalItems = items.length;
  const lowStockCount = items.filter(item => item.stock <= item.minStock).length;
  const totalValue = items.reduce((sum, item) => sum + (item.stock * item.price), 0);

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Manage raw materials and finished goods stock levels.
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
              Add Item
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Items</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalItems}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
            <p className={`mt-1 text-2xl font-bold ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{lowStockCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">Rs. {totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU or Name..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-48">
            <Input
              type="select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
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
        </div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Items"
            entityIcon="Package"
            onClearSearch={() => {
              setSearch("");
              setTypeFilter("all");
              setCategoryFilter("all");
            }}
            addLabel="Add Item"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">SKU & Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Stock Level</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredItems.map(item => {
                     const isLowStock = item.stock <= item.minStock;
                     return (
                      <tr 
                        key={item.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.sku}</div>
                        </td>
                        <td className="px-4 py-3">
                           <StatusBadge status={item.type === "Raw Material" ? "Pending" : "Delivered"} label={item.type} />
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-medium text-gray-900">{item.stock}</div>
                          {isLowStock && <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Low Stock (Min {item.minStock})</div>}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          Rs. {item.price}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <Button variant="outline" size="sm" onClick={() => setAdjustItem(item)}>Adjust</Button>
                             <Button variant="ghost" size="sm" onClick={() => setEditItem(item)} className="px-2!">
                               <Icons name="Pencil" size={16} className="text-gray-500 hover:text-primary" />
                             </Button>
                             <Button variant="ghost" size="sm" onClick={() => setDeleteItem(item)} className="px-2!">
                               <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                             </Button>
                          </div>
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

      {isAddOpen && <AddInventory open={isAddOpen} onClose={() => setIsAddOpen(false)} />}
      {editItem && <EditInventory open={!!editItem} onClose={() => setEditItem(null)} initialData={editItem} />}
      {adjustItem && <AdjustStock open={!!adjustItem} onClose={() => setAdjustItem(null)} item={adjustItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={() => {
            setItems(items.filter(i => i.id !== deleteItem.id));
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
