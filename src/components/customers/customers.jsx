import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddCustomer from "./customersModal/AddCustomer";
import EditCustomer from "./customersModal/EditCustomer";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import toast from "react-hot-toast";
import { formatDate } from "@/utils/formatters";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";

const customerTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Retail", label: "Retail" },
  { value: "Dealer", label: "Dealer" },
];

export const Customers = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customersViewMode') || 'table';
    }
    return 'table';
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalCustomers: 0, retailCount: 0, dealerCount: 0, newCustomers: 0 });

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
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
      if (router.query.type) setTypeFilter(router.query.type);
      if (router.query.location) {
        setLocationFilter(router.query.location);
        setDebouncedLocation(router.query.location);
      }
      setIsInitialized(true);
    }
  }, [router.isReady, isInitialized, router.query]);

  // Debounce search & location
  useEffect(() => {
    const handler = setTimeout(() => {
      let changed = false;
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        changed = true;
      }
      if (locationFilter !== debouncedLocation) {
        setDebouncedLocation(locationFilter);
        changed = true;
      }
      if (changed) setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch, locationFilter, debouncedLocation]);

  const fetchCustomers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // In a real app we'd pass location to API, but for now we'll pass search which matches name/company/phone
      const res = await api.get('/customers', {
        params: {
          page,
          limit: viewMode === 'card' ? 20 : 10,
          search: debouncedSearch,
          type: typeFilter
        }
      });
      const mapped = res.data.data.map(c => ({
        ...c,
        type: c.type.toLowerCase() === 'retail' ? 'Retail' : 'Dealer',
        created: formatDate(c.createdAt),
        address: typeof c.address === 'string' ? JSON.parse(c.address) : (c.address || { city: '', state: '' }),
        totalValue: c.totalOrderValue || "Rs. 0"
      }));
      setCustomers(mapped);
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchCustomers();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;
    if (typeFilter !== 'all') query.type = typeFilter;
    if (debouncedLocation) query.location = debouncedLocation;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, typeFilter, debouncedLocation, viewMode, isInitialized]);

  const hasActiveFilters = typeFilter !== "all" || debouncedSearch !== "";

  const handleRowClick = (customer) => {
    router.push(`/customers/${customer.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4 pb-10">
      <div className="flex flex-col gap-4 rounded-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Manage your retail and dealer customer base.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="solid"
              onClick={() => setIsAddCustomerOpen(true)}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
              className="rounded-sm px-4 py-2.5 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Add customer
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="Users" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Customers</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalCustomers}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Icons name="User" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Retail Customers</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.retailCount}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Icons name="Briefcase" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dealers</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.dealerCount}</h4>
            </div>
          </div>
          <div className="bg-white rounded-sm p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Icons name="UserPlus" size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">New (This Month)</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.newCustomers}</h4>
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
              placeholder="Search by name or phone..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-48">
            <Input
              type="select"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              options={customerTypeOptions}
            />
          </div>
          <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setViewMode("table");
                setPage(1);
                if (typeof window !== 'undefined') localStorage.setItem('customersViewMode', "table");
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
                if (typeof window !== 'undefined') localStorage.setItem('customersViewMode', "card");
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
                <Loader text="Loading Customers..." />
              </div>
            )}
            
            {viewMode === "table" ? (
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">Customer Info</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Total Order Value</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {!loading && customers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-0">
                        <EmptyState
                          search={search || (hasActiveFilters ? "active filters" : "")}
                          entityName="Customers"
                          entityIcon="Users"
                          onClearSearch={() => {
                            setSearch("");
                            setTypeFilter("all");
                            setLocationFilter("");
                            setPage(1);
                          }}
                          addLabel="Add customer"
                        />
                      </td>
                    </tr>
                  ) : (
                    customers.map(customer => (
                      <tr 
                        key={customer.id} 
                        onClick={() => handleRowClick(customer)}
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {customer.imageUrl ? (
                              <img src={customer.imageUrl} alt={customer.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm shrink-0 bg-gray-50" />
                            ) : (
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm border ${customer.type === "Retail" ? "bg-sky-100 text-sky-600 border-sky-200" : "bg-indigo-100 text-indigo-600 border-indigo-200"}`}>
                                {customer.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              {customer.gstin && <div className="text-[11px] text-gray-500 mt-0.5">GST: {customer.gstin}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          <div>{customer.phone}</div>
                          <div className="text-xs">{customer.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {customer.address.city}, {customer.address.state}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge 
                            status={customer.type} 
                            label={customer.type} 
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700">
                          {customer.totalValue}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditItem(customer)} className="px-2!">
                              <Icons name="Pencil" size={16} className="text-gray-400 hover:text-indigo-600 transition-colors" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteItem(customer)} className="px-2!">
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
                {!loading && customers.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      search={search || (hasActiveFilters ? "active filters" : "")}
                      entityName="Customers"
                      entityIcon="Users"
                      onClearSearch={() => {
                        setSearch("");
                        setTypeFilter("all");
                        setLocationFilter("");
                        setPage(1);
                      }}
                      addLabel="Add customer"
                    />
                  </div>
                ) : (
                  customers.map(customer => (
                    <div 
                      key={customer.id}
                      onClick={() => handleRowClick(customer)}
                      className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
                    >
                      {/* Header Area */}
                      <div className={`h-32 w-full rounded-sm border border-gray-200 overflow-hidden flex flex-col items-center justify-center relative mb-2 ${customer.type === "Retail" ? "bg-gradient-to-br from-sky-50 to-white" : "bg-gradient-to-br from-indigo-50 to-white"}`}>
                        
                        {customer.imageUrl ? (
                          <img src={customer.imageUrl} alt={customer.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl mb-2 shadow-sm ${customer.type === "Retail" ? "bg-sky-100 text-sky-600 border border-sky-200" : "bg-indigo-100 text-indigo-600 border border-indigo-200"}`}>
                            {customer.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        {!customer.imageUrl && <StatusBadge status={customer.type} label={customer.type} />}
                        
                        {/* Floating Action Buttons inside header */}
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                           <Button variant="outline" size="sm" onClick={() => setEditItem(customer)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Pencil" size={14} className="text-gray-600 hover:text-indigo-600" /></Button>
                           <Button variant="outline" size="sm" onClick={() => setDeleteItem(customer)} className="bg-white/90 backdrop-blur-sm px-2! py-1.5! border-gray-200 shadow-sm"><Icons name="Trash2" size={14} className="text-gray-600 hover:text-rose-500" /></Button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate" title={customer.name}>{customer.name}</h3>
                          {customer.gstin && <p className="text-[11px] text-gray-500 mt-0.5 truncate">GST: {customer.gstin}</p>}
                        </div>
                        {customer.imageUrl && <div className="shrink-0"><StatusBadge status={customer.type} label={customer.type} /></div>}
                      </div>

                      {/* Contact Badges */}
                      <div className="flex flex-col gap-1.5 mt-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Icons name="Phone" size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Icons name="Mail" size={12} className="text-gray-400 shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Icons name="MapPin" size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{customer.address.city}, {customer.address.state}</span>
                        </div>
                      </div>

                      {/* Footer with Quick Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                         <div className="flex flex-col">
                           <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total Value</span>
                           <span className="text-sm font-semibold text-emerald-600">{customer.totalValue}</span>
                         </div>
                         <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                           <a href={`tel:${customer.phone}`} className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Call">
                             <Icons name="Phone" size={12} />
                           </a>
                           <a href={`https://wa.me/${customer.phone.replace(/\\D/g,'')}`} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors" title="WhatsApp">
                             <Icons name="MessageCircle" size={12} />
                           </a>
                           {customer.email && (
                             <a href={`mailto:${customer.email}`} className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors" title="Email">
                               <Icons name="Mail" size={12} />
                             </a>
                           )}
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

      {isAddCustomerOpen && <AddCustomer open={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} onSuccess={() => fetchCustomers(true)} />}
      {editItem && <EditCustomer open={!!editItem} onClose={() => setEditItem(null)} onSuccess={() => fetchCustomers(true)} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/customers/${deleteItem.id}`);
              toast.success("Customer deleted");
              setCustomers(customers.filter(c => c.id !== deleteItem.id));
            } catch (err) {
              toast.error("Failed to delete customer");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Customers;
