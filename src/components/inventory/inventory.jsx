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
import Pagination from "@/common/Pagination";
import { useRouter } from "next/router";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "RAW_MATERIAL", label: "Raw Material" },
  { value: "CONSUMABLES", label: "Consumables" },
  { value: "HARDWARE", label: "Hardware" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "FINISHED_GOODS", label: "Finished Goods" },
];

export const Inventory = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('inventoryViewMode') || 'table';
    }
    return 'table';
  });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalItems: 0, lowStockCount: 0, totalValue: 0 });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [items, setItems] = useState([]);
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

  const fetchInventory = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/inventory', {
        params: {
          page,
          limit: viewMode === 'card' ? 20 : 10,
          search: debouncedSearch,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          includeStats: true
        }
      });
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
      setItems(mapped);
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchInventory();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;
    if (categoryFilter !== 'all') query.category = categoryFilter;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, categoryFilter, viewMode, isInitialized]);

  const hasActiveFilters = categoryFilter !== "all" || debouncedSearch !== "";

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
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalItems}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className={`w-14 h-14 rounded-sm flex items-center justify-center shrink-0 border ${stats.lowStockCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <Icons name="AlertTriangle" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Low Stock Alerts</p>
              <h4 className={`text-2xl font-black tracking-tight ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{stats.lowStockCount}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Icons name="IndianRupee" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Value</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">Rs. {Number(stats.totalValue).toLocaleString()}</h4>
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
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              options={categoryOptions}
            />
          </div>
          <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setViewMode("table");
                setPage(1);
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
                setPage(1);
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
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
          <div className={`flex-1 overflow-auto custom-scrollbar relative ${viewMode === 'card' ? 'p-4 bg-gray-50/30' : ''}`}>
            {loading && (
              <div className="absolute inset-0 top-[40px] z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <Loader text="Loading Inventory..." />
              </div>
            )}
            
            {viewMode === "table" ? (
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">SKU & Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Current Stock</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {!loading && items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-0">
                        <EmptyState
                          search={search || (hasActiveFilters ? "active filters" : "")}
                          entityName="Items"
                          entityIcon="Package"
                          onClearSearch={() => {
                            setSearch("");
                            setCategoryFilter("all");
                            setPage(1);
                          }}
                          addLabel="Add Item"
                        />
                      </td>
                    </tr>
                  ) : (
                    items.map(item => {
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 border border-gray-100 text-gray-700">
                              {item.displayCategory}
                            </span>
                            {item.subCategory !== '-' && <div className="text-xs text-gray-500 mt-0.5">{item.subCategory}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${isLowStock ? 'text-rose-600' : 'text-gray-900'}`}>{item.purchaseStock} {item.purchaseUnit}</span>
                                {isLowStock && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">₹{Number(item.price || 0).toFixed(2)}</div>
                          </td>
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setAdjustItem(item)} className="px-2! text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100" title="Adjust Stock">
                                <Icons name="TrendingUp" size={16} />
                              </Button>
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
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start relative min-h-[300px]">
                {!loading && items.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      search={search || (hasActiveFilters ? "active filters" : "")}
                      entityName="Items"
                      entityIcon="Package"
                      onClearSearch={() => {
                        setSearch("");
                        setCategoryFilter("all");
                        setPage(1);
                      }}
                      addLabel="Add Item"
                    />
                  </div>
                ) : (
                  items.map(item => {
                    const isLowStock = Number(item.purchaseStock) <= Number(item.minStock);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => router.push(`/inventory/${item.id}`)}
                        className={`bg-white rounded-sm border ${isLowStock ? 'border-rose-200 shadow-rose-100' : 'border-gray-100'} shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group`}
                      >
                        <div className={`h-36 w-full rounded-sm border ${isLowStock ? 'border-rose-100' : 'border-gray-200'} overflow-hidden flex flex-col items-center justify-center relative mb-2 bg-gradient-to-br ${isLowStock ? 'from-rose-50' : 'from-gray-50'} to-white`}>
                          {item.images && item.images.length > 0 ? (
                             <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-2 shadow-sm ${isLowStock ? 'bg-rose-100 text-rose-500 border border-rose-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                {item.name.substring(0, 2).toUpperCase()}
                             </div>
                          )}
                          
                          {isLowStock && <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">LOW STOCK</div>}
                          
                          {/* Floating Action Buttons */}
                          <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                             <Button variant="outline" size="sm" onClick={() => setAdjustItem(item)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="TrendingUp" size={14} className="text-emerald-600 hover:text-emerald-700" /></Button>
                             <Button variant="outline" size="sm" onClick={() => setEditItem(item)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Pencil" size={14} className="text-gray-600 hover:text-indigo-600" /></Button>
                             <Button variant="outline" size="sm" onClick={() => setDeleteItem(item)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Trash2" size={14} className="text-gray-600 hover:text-rose-500" /></Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 truncate" title={item.name}>{item.name}</h3>
                          <p className="text-[11px] text-gray-500 mt-0.5">SKU: {item.sku || 'N/A'}</p>
                        </div>

                        <div className="flex flex-col gap-1.5 mt-auto pt-3 border-t border-gray-50">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Stock</span>
                            <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-gray-900'}`}>{item.purchaseStock} {item.purchaseUnit}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Avg Cost</span>
                            <span className="font-semibold text-indigo-600">₹{Number(item.price || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
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

      {isAddOpen && <AddInventory open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchInventory(true); }} />}
      {editItem && <EditInventory open={!!editItem} onClose={() => { setEditItem(null); fetchInventory(true); }} initialData={editItem} />}
      {adjustItem && <AdjustStock open={!!adjustItem} onClose={() => { setAdjustItem(null); fetchInventory(true); }} item={adjustItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/inventory/${deleteItem.id}`);
              toast.success("Item deleted");
              setItems(items.filter(i => i.id !== deleteItem.id));
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
