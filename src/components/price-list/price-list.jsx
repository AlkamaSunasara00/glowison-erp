import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddPriceItem from "./priceListModal/AddPriceItem";
import EditPriceItem from "./priceListModal/EditPriceItem";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import { useRouter } from "next/router";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "CARD_DESIGN", label: "Card Design" },
  { value: "FLEX_DESIGN", label: "Flex Design" },
  { value: "BANNER", label: "Banner" },
  { value: "STICKER", label: "Sticker" },
  { value: "SIGNAGE_BOARD", label: "Signage Board" },
  { value: "OTHER", label: "Other" },
];

const sizeOptions = [
  { value: "STANDARD", label: "Standard" },
  { value: "EIGHT_BY_FOUR", label: "8x4 ft" },
  { value: "SIX_BY_FOUR", label: "6x4 ft" },
  { value: "THREE_BY_TWO", label: "3x2 ft" },
  { value: "CUSTOM", label: "Custom" },
];

const unitOptions = [
  { value: "PER_PIECE", label: "Per Piece" },
  { value: "PER_SQ_FT", label: "Per Sq Ft" },
  { value: "PER_SET", label: "Per Set" },
  { value: "CUSTOM", label: "Custom" },
];

const formatEnum = (value, options) => {
  if (!value) return "—";
  const option = options?.find(o => o.value === value);
  if (option) return option.label;
  return value.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

const PriceList = () => {
  const router = useRouter();
  
  // State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("priceListViewMode") || "table";
    }
    return "table";
  });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalItems: 0, uniqueCategories: 0, avgClientPrice: 0, avgB2BPrice: 0 });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
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

  const fetchPriceList = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/price-list', {
        params: {
          page,
          limit: viewMode === 'card' ? 20 : 10,
          search: debouncedSearch,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          includeStats: true
        }
      });
      const data = res.data.data.map(i => ({
        id: i.id,
        name: i.name,
        category: i.category,
        otherLabel: i.otherLabel,
        size: i.size,
        sizeOther: i.sizeOther,
        clientPrice: i.clientPrice || i.price,
        b2bPrice: i.b2bPrice,
        priceUnit: i.priceUnit,
        unitOther: i.unitOther,
        note: i.note || '',
        imageUrl: i.imageUrl || ''
      }));
      setItems(data);
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load price list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchPriceList();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;
    if (categoryFilter !== 'all') query.category = categoryFilter;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, categoryFilter, viewMode, isInitialized]);

  // Filters
  const hasActiveFilters = categoryFilter !== "all" || debouncedSearch !== "";

  const handleRowClick = (item) => {
    router.push(`/price-list/${item.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4 pb-10">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Price List</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Manage printing product prices, sizes, and B2B vs Client rates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button variant="solid" onClick={() => setIsAddOpen(true)} leftIcon={(props) => <Icons name="Plus" color="white" {...props} />}>
              Add Item
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="List" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Total Items</p>
              <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{stats.totalItems}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Icons name="Layers" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Categories</p>
              <h4 className="text-xl font-black text-purple-600 tracking-tight truncate">{stats.uniqueCategories}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Icons name="TrendingUp" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Avg Client Price</p>
              <h4 className="text-xl font-black text-emerald-600 tracking-tight truncate">₹{Number(stats.avgClientPrice).toFixed(2)}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Icons name="Briefcase" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Avg B2B Price</p>
              <h4 className="text-xl font-black text-sky-600 tracking-tight truncate">₹{Number(stats.avgB2BPrice).toFixed(2)}</h4>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-3 rounded-sm border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
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
                if (typeof window !== "undefined") localStorage.setItem("priceListViewMode", "table");
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
                if (typeof window !== "undefined") localStorage.setItem("priceListViewMode", "card");
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
                <Loader text="Loading Price List..." />
              </div>
            )}
            
            {viewMode === "table" ? (
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Item</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Size & Unit</th>
                    <th className="px-4 py-3">Client Price</th>
                    <th className="px-4 py-3">B2B Price</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {!loading && items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-0">
                        <EmptyState
                          icon="List"
                          title="No price items found"
                          description={
                            hasActiveFilters 
                              ? "No items match your current filters. Try adjusting them."
                              : "Get started by adding your first price list item."
                          }
                          action={hasActiveFilters ? "Clear filters" : "Add item"}
                          onAction={() => {
                            setSearch("");
                            setCategoryFilter("all");
                            setPage(1);
                            if (!hasActiveFilters) setIsAddOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr 
                        key={item.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(item)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Icons name="Image" size={16} className="text-gray-300" />
                              )}
                            </div>
                            <div className="font-semibold text-gray-900">{item.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.category === "OTHER" ? item.otherLabel : formatEnum(item.category, categoryOptions)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{item.size === "CUSTOM" ? item.sizeOther : formatEnum(item.size, sizeOptions)}</div>
                          <div className="text-[11px] text-gray-500">{item.priceUnit === "CUSTOM" ? item.unitOther : formatEnum(item.priceUnit, unitOptions)}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₹{Number(item.clientPrice).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-600">
                          {item.b2bPrice ? `₹${Number(item.b2bPrice).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditItem(item)} className="px-2!">
                              <Icons name="Pencil" size={16} className="text-gray-400 hover:text-indigo-600 transition-colors" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteItem(item)} className="px-2!">
                              <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start relative min-h-[300px]">
                {!loading && items.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon="List"
                      title="No price items found"
                      description={
                        hasActiveFilters 
                          ? "No items match your current filters. Try adjusting them."
                          : "Get started by adding your first price list item."
                      }
                      action={hasActiveFilters ? "Clear filters" : "Add item"}
                      onAction={() => {
                        setSearch("");
                        setCategoryFilter("all");
                        setPage(1);
                        if (!hasActiveFilters) setIsAddOpen(true);
                      }}
                    />
                  </div>
                ) : (
                  items.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
                    >
                      <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                         <Button variant="outline" size="sm" onClick={() => setEditItem(item)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Pencil" size={14} className="text-gray-600 hover:text-indigo-600" /></Button>
                         <Button variant="outline" size="sm" onClick={() => setDeleteItem(item)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Trash2" size={14} className="text-gray-600 hover:text-rose-500" /></Button>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <Icons name="Image" size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <h3 className="font-semibold text-gray-900 truncate" title={item.name}>{item.name}</h3>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {item.category === "OTHER" ? item.otherLabel : formatEnum(item.category, categoryOptions)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded text-xs mt-2 border border-gray-100">
                        <div>
                          <span className="text-gray-500 block mb-0.5">Size</span>
                          <span className="font-medium text-gray-900 truncate block">{item.size === "CUSTOM" ? item.sizeOther : formatEnum(item.size, sizeOptions)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">Unit</span>
                          <span className="font-medium text-gray-900 truncate block">{item.priceUnit === "CUSTOM" ? item.unitOther : formatEnum(item.priceUnit, unitOptions)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Client Price</span>
                          <span className="font-semibold text-gray-900">₹{Number(item.clientPrice).toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">B2B Price</span>
                          <span className="font-semibold text-indigo-600">{item.b2bPrice ? `₹${Number(item.b2bPrice).toLocaleString()}` : '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))
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

      {isAddOpen && <AddPriceItem open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchPriceList(true); }} />}
      {editItem && <EditPriceItem open={!!editItem} onClose={() => { setEditItem(null); fetchPriceList(true); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/price-list/${deleteItem.id}`);
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

export default PriceList;
