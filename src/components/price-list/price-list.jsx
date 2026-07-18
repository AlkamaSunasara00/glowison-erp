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

let globalPriceListCache = null;



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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("priceListViewMode") || "table";
    }
    return "table";
  });
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [items, setItems] = useState(globalPriceListCache || []);
  const [loading, setLoading] = useState(!globalPriceListCache);

  const fetchPriceList = async (silent = false) => {
    try {
      if (!silent && !globalPriceListCache) setLoading(true);
      const res = await api.get('/price-list?limit=200');
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
      globalPriceListCache = data;
      setItems(data);
    } catch (error) {
      toast.error('Failed to load price list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceList(!!globalPriceListCache);
  }, []);

  // Filters
  const hasActiveFilters = categoryFilter !== "all";

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleRowClick = (item) => {
    router.push(`/price-list/${item.id}`);
  };
  const totalItems = items.length;
  const uniqueCategories = new Set(items.map(i => i.category)).size;
  const avgClientPrice = totalItems > 0 ? items.reduce((acc, curr) => acc + Number(curr.clientPrice || 0), 0) / totalItems : 0;
  const avgB2BPrice = totalItems > 0 ? items.reduce((acc, curr) => acc + Number(curr.b2bPrice || 0), 0) / totalItems : 0;

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
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
              <h4 className="text-xl font-black text-gray-900 tracking-tight truncate">{totalItems}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Icons name="Layers" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Categories</p>
              <h4 className="text-xl font-black text-purple-600 tracking-tight truncate">{uniqueCategories}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Icons name="TrendingUp" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Avg Client Price</p>
              <h4 className="text-xl font-black text-emerald-600 tracking-tight truncate">₹{avgClientPrice.toFixed(2)}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-sm bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Icons name="Briefcase" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">Avg B2B Price</p>
              <h4 className="text-xl font-black text-sky-600 tracking-tight truncate">₹{avgB2BPrice.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-3 rounded-sm border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons name="Search" size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
            />
          </div>
          
          <div className="w-full md:w-64">
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
        {loading ? (
          <div className="flex-1 bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
            <Loader text="Loading Price List..." />
          </div>
        ) : filteredItems.length === 0 ? (
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
              if (!hasActiveFilters) setIsAddOpen(true);
            }}
          />
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Item Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Size & Unit</th>
                    <th className="px-4 py-3 text-right">Client Price</th>
                    <th className="px-4 py-3 text-right">B2B Price</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredItems.map(item => (
                    <tr 
                      key={item.id} 
                      onClick={() => router.push(`/price-list/${item.id}`)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-sm bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-100/50 text-xs">
                            {item.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="font-semibold text-gray-900">{item.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 border border-gray-100 text-gray-700">
                          {item.category === 'OTHER' ? item.otherLabel : formatEnum(item.category, categoryOptions)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="font-medium">{item.size === 'CUSTOM' ? item.sizeOther : formatEnum(item.size, sizeOptions)}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">per {item.priceUnit === 'CUSTOM' ? item.unitOther : formatEnum(item.priceUnit, unitOptions)}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        ₹{Number(item.clientPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ₹{Number(item.b2bPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                           <Button variant="ghost" size="sm" onClick={() => setEditItem(item)} className="px-2!">
                             <Icons name="Pencil" size={16} className="text-gray-500 hover:text-primary" />
                           </Button>
                           <Button variant="ghost" size="sm" onClick={() => setDeleteItem(item)} className="px-2!">
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
            {filteredItems.map(item => (
              <div 
                key={item.id}
                onClick={() => router.push(`/price-list/${item.id}`)}
                className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
              >
                <div className="flex justify-between items-start mb-1">
                   <div className="w-10 h-10 rounded-sm bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-100 text-lg">
                     {item.name.substring(0, 2).toUpperCase()}
                   </div>
                </div>
                
                <div className="min-w-0 mb-1">
                   <h3 className="text-base font-bold text-gray-900 truncate" title={item.name}>{item.name}</h3>
                   <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 border border-gray-100 text-gray-700">
                     {item.category === 'OTHER' ? item.otherLabel : formatEnum(item.category, categoryOptions)}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Client Price</span>
                    <span className="text-sm font-bold text-gray-900 mt-0.5 truncate">₹{Number(item.clientPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col bg-emerald-50 p-2 rounded border border-emerald-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">B2B Price</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 truncate">₹{Number(item.b2bPrice).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-auto text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-50">
                  <span className="truncate">{item.size === 'CUSTOM' ? item.sizeOther : formatEnum(item.size, sizeOptions)}</span>
                  <span>/ {item.priceUnit === 'CUSTOM' ? item.unitOther : formatEnum(item.priceUnit, unitOptions)}</span>
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                   <Button variant="solid" size="sm" onClick={() => setEditItem(item)} className="rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-md"><Icons name="Pencil" size={14} /></Button>
                   <Button variant="solid" size="sm" onClick={() => setDeleteItem(item)} className="rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-md bg-rose-600 hover:bg-rose-700 border-none"><Icons name="Trash2" size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddOpen && <AddPriceItem open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchPriceList(); }} />}
      {editItem && <EditPriceItem open={!!editItem} onClose={() => { setEditItem(null); fetchPriceList(); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/price-list/${deleteItem.id}`);
              toast.success("Item deleted");
              const updated = items.filter(i => i.id !== deleteItem.id);
              globalPriceListCache = updated;
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

export default PriceList;
