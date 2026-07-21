import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import AddCatalogItem from "./catalogModal/AddCatalogItem";
import EditCatalogItem from "./catalogModal/EditCatalogItem";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import toast from "react-hot-toast";
import { formatDate } from "@/utils/formatters";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";
import { useRouter } from "next/router";

const Catalog = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("catalogViewMode") || "table";
    }
    return "table";
  });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalItems: 0, categoriesCount: 0, avgRetail: 0 });

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
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

  const fetchItems = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/catalog', {
        params: {
          page,
          limit: viewMode === 'card' ? 20 : 10,
          search: debouncedSearch
        }
      });
      const mapped = res.data.data.map(i => ({
        ...i,
        created: formatDate(i.createdAt),
      }));
      setItems(mapped);
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load catalog items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchItems();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, viewMode, isInitialized]);

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Catalogue</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Manage your products for quick order entry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="solid"
              onClick={() => setIsAddItemOpen(true)}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
            >
              Add Product
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
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Products</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalItems}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center justify-center shrink-0 border">
              <Icons name="Layers" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Categories</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.categoriesCount}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Icons name="IndianRupee" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Retail Price</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">₹{Number(stats.avgRetail).toFixed(0)}</h4>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-sm border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-80">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or sku..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setViewMode("table");
                setPage(1);
                if (typeof window !== "undefined") localStorage.setItem("catalogViewMode", "table");
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
                if (typeof window !== "undefined") localStorage.setItem("catalogViewMode", "card");
              }}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "card" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Card View"
            >
              <Icons name="Grid" size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
          <div className={`flex-1 overflow-auto custom-scrollbar relative ${viewMode === 'card' ? 'p-4 bg-gray-50/30' : ''}`}>
            {loading && (
              <div className="absolute inset-0 top-[40px] z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <Loader text="Loading Catalogue..." />
              </div>
            )}
            
            {viewMode === "table" ? (
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Image & Name</th>
                    <th className="px-4 py-3">Details (Size/Color)</th>
                    <th className="px-4 py-3">Retail Price</th>
                    <th className="px-4 py-3">Dealer Price</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {!loading && items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-0">
                        <EmptyState
                          search={search}
                          entityName="Products"
                          entityIcon="Package"
                          onClearSearch={() => {
                            setSearch("");
                            setPage(1);
                          }}
                          addLabel="Add Product"
                        />
                      </td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr 
                        key={item.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/catalog/${item.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
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
                        <td className="px-4 py-3 text-gray-700">
                          {item.size && <div className="text-[11px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded inline-block mb-1 mr-1">Size: {item.size}</div>}
                          {item.color && <div className="text-[11px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded inline-block mb-1 mr-1">Color: {item.color}</div>}
                          {item.unit && <div className="text-[11px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded inline-block mb-1 mr-1">Unit: {item.unit}</div>}
                          {!item.size && !item.color && !item.unit && <span className="text-gray-400 text-[11px]">-</span>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₹{Number(item.retailPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-600">
                          ₹{Number(item.dealerPrice || 0).toFixed(2)}
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
                      search={search}
                      entityName="Products"
                      entityIcon="Package"
                      onClearSearch={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      addLabel="Add Product"
                    />
                  </div>
                ) : (
                  items.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => router.push(`/catalog/${item.id}`)}
                      className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
                    >
                      <div className={`h-36 w-full rounded-sm border border-gray-200 overflow-hidden flex flex-col items-center justify-center relative mb-2 bg-gradient-to-br from-gray-50 to-white`}>
                        {item.imageUrl ? (
                           <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                           <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-2 shadow-sm bg-gray-100 text-gray-500 border border-gray-200">
                              {item.name.substring(0, 2).toUpperCase()}
                           </div>
                        )}
                        
                        {/* Floating Action Buttons inside image */}
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
                          <span className="text-gray-500">Retail</span>
                          <span className="font-semibold text-gray-900">₹{Number(item.retailPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Dealer</span>
                          <span className="font-semibold text-indigo-600">₹{Number(item.dealerPrice || 0).toFixed(2)}</span>
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

      {isAddItemOpen && <AddCatalogItem open={isAddItemOpen} onClose={() => { setIsAddItemOpen(false); fetchItems(true); }} />}
      {editItem && <EditCatalogItem open={!!editItem} onClose={() => { setEditItem(null); fetchItems(true); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/catalog/${deleteItem.id}`);
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

export default Catalog;
