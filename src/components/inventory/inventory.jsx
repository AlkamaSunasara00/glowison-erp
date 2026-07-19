import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddInventory from "./inventoryModal/AddInventory";
import EditInventory from "./inventoryModal/EditInventory";
import AdjustStock from "./inventoryModal/AdjustStock";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import Loader from "@/common/Loader";
import { useRouter } from "next/router";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "RAW_MATERIAL", label: "Raw Material" },
  { value: "CONSUMABLES", label: "Consumables" },
  { value: "HARDWARE", label: "Hardware" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "FINISHED_GOODS", label: "Finished Goods" },
];

let globalInventoryCache = null;

export const Inventory = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('inventoryViewMode') || 'table';
    }
    return 'table';
  });
  const router = useRouter();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [items, setItems] = useState(globalInventoryCache || []);
  const [loading, setLoading] = useState(!globalInventoryCache);

  const fetchInventory = async (silent = false) => {
    try {
      if (!silent && !globalInventoryCache) setLoading(true);
      const res = await api.get('/inventory?limit=200');
      const mapped = res.data.data.map(i => ({
        ...i,
        id: i.id,
        sku: i.sku || '-',
        name: i.name,
        type: i.category === 'FINISHED_GOODS' ? 'Finished Good' : 'Raw Material',
        displayCategory: categoryOptions.find(o => o.value === i.category)?.label || i.category,
        subCategory: i.subCategory || '-',
        purchaseStock: i.currentPurchaseStock || 0,
        usageStock: i.currentUsageStock || 0,
        minStock: i.minimumStock || 0,
        averageCost: i.averageCost || 0,
        price: i.lastPurchasePrice || 0,
        purchaseUnit: i.purchaseUnit || "-",
        usageUnit: i.usageUnit || "-",
        warehouse: i.warehouse || "-",
        rack: i.rack || "-",
        bin: i.bin || "-",
        images: i.images || [],
      }));
      globalInventoryCache = mapped;
      setItems(mapped);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(!!globalInventoryCache);
  }, []);

  // Filters
  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all";
  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || (item.sku && item.sku.toLowerCase().includes(query)) || item.name.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // KPIs
  const totalItems = items.length;
  const lowStockCount = items.filter(item => Number(item.purchaseStock) <= Number(item.minStock)).length;
  const totalValue = items.reduce((sum, item) => sum + (Number(item.purchaseStock) * Number(item.price || item.averageCost)), 0);

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4 pb-10">
      <div className="flex flex-col gap-4 rounded-sm">
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
              className="rounded-sm px-4 py-2.5 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Add Item
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="Package" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Items</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{totalItems}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className={`w-14 h-14 rounded-sm flex items-center justify-center shrink-0 border ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <Icons name="AlertTriangle" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Low Stock Alerts</p>
              <h4 className={`text-2xl font-black tracking-tight ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{lowStockCount}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Icons name="IndianRupee" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Value</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">Rs. {totalValue.toLocaleString()}</h4>
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
              placeholder="Search SKU or Name..."
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
          <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setViewMode("table");
                if (typeof window !== 'undefined') localStorage.setItem('inventoryViewMode', "table");
              }}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "table" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Table View"
            >
              <Icons name="List" size={18} />
            </button>
            <button
              onClick={() => {
                setViewMode("card");
                if (typeof window !== 'undefined') localStorage.setItem('inventoryViewMode', "card");
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
            <Loader text="Loading Inventory..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Items"
            entityIcon="Package"
            onClearSearch={() => {
              setSearch("");
              setCategoryFilter("all");
            }}
            addLabel="Add Item"
          />
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">SKU & Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Current Stock</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredItems.map(item => {
                    const isLowStock = Number(item.purchaseStock) <= Number(item.minStock);
                     return (
                      <tr 
                        key={item.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/inventory/${item.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              {item.images && item.images.length > 0 ? (
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">{item.name.substring(0,2)}</div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.sku || 'No SKU'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.category} label={item.displayCategory} />
                          {item.subCategory !== '-' && <div className="text-[11px] text-gray-500 mt-1">{item.subCategory}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-medium ${isLowStock ? 'text-rose-600' : 'text-gray-900'}`}>
                            {item.purchaseStock} <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{item.purchaseUnit}</span>
                          </div>
                          {isLowStock && <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Low Stock (Min {item.minStock})</div>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700">
                          Rs. {Number(item.price).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                             <Button variant="outline" size="sm" onClick={() => setAdjustItem(item)} className="px-2! py-1! text-xs font-semibold">Adjust</Button>
                             <Button variant="ghost" size="sm" onClick={() => setEditItem(item)} className="px-2!">
                               <Icons name="Pencil" size={16} className="text-gray-400 hover:text-indigo-600 transition-colors" />
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
            {filteredItems.map(item => {
              const isLowStock = Number(item.purchaseStock) <= Number(item.minStock);
              return (
                <div 
                  key={item.id}
                  onClick={() => router.push(`/inventory/${item.id}`)}
                  className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
                >
                  {/* Header Area */}
                  <div className={`h-36 w-full rounded-sm border border-gray-200 overflow-hidden flex flex-col items-center justify-center relative mb-2 bg-gradient-to-br from-gray-50 to-white`}>
                    
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-2 shadow-sm bg-gray-100 text-gray-500 border border-gray-200">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <StatusBadge status={item.category} label={item.displayCategory} />
                    </div>

                    {isLowStock && (
                       <div className="absolute bottom-2 left-2 bg-rose-100/90 backdrop-blur-sm text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-rose-200 flex items-center gap-1">
                          <Icons name="AlertTriangle" size={10} /> Low Stock
                       </div>
                    )}
                    
                    {/* Floating Action Buttons inside header */}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                       <Button variant="outline" size="sm" onClick={() => setAdjustItem(item)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm font-semibold text-xs text-gray-700 hover:text-primary"><Icons name="PlusMinus" size={14} className="mr-1" /> Adjust</Button>
                       <Button variant="outline" size="sm" onClick={() => setEditItem(item)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Pencil" size={14} className="text-gray-600 hover:text-indigo-600" /></Button>
                       <Button variant="outline" size="sm" onClick={() => setDeleteItem(item)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Trash2" size={14} className="text-gray-600 hover:text-rose-500" /></Button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate" title={item.name}>{item.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">SKU: {item.sku || 'No SKU'}</p>
                    </div>
                  </div>

                  {/* Stock Details */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Current Stock</span>
                      <span className={`text-sm font-bold mt-0.5 ${isLowStock ? 'text-rose-600' : 'text-gray-900'}`}>{item.purchaseStock} <span className="text-[10px] font-medium opacity-70">{item.purchaseUnit}</span></span>
                    </div>
                    <div className="flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Cost</span>
                      <span className="text-sm font-bold text-gray-900 mt-0.5"><span className="text-[10px] font-medium text-gray-500">Rs. </span>{Number(item.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isAddOpen && <AddInventory open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchInventory(); }} />}
      {editItem && <EditInventory open={!!editItem} onClose={() => { setEditItem(null); fetchInventory(); }} initialData={editItem} />}
      {adjustItem && <AdjustStock open={!!adjustItem} onClose={() => { setAdjustItem(null); fetchInventory(); }} item={adjustItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/inventory/${deleteItem.id}`);
              toast.success("Item deleted");
              const updated = items.filter(i => i.id !== deleteItem.id);
              globalInventoryCache = updated;
              setItems(updated);
            } catch (err) {
              toast.error("Failed to delete item");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;

