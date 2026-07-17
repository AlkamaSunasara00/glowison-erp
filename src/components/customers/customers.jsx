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



const customerTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Retail", label: "Retail" },
  { value: "Dealer", label: "Dealer" },
];

export const Customers = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers?limit=100');
      setCustomers(res.data.data.map(c => ({
        ...c,
        type: c.type.toLowerCase() === 'retail' ? 'Retail' : 'Dealer',
        created: formatDate(c.createdAt),
        address: typeof c.address === 'string' ? JSON.parse(c.address) : (c.address || { city: '', state: '' }),
        totalValue: c.totalOrderValue || "Rs. 0"
      })));
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filters
  const hasActiveFilters = typeFilter !== "all" || locationFilter.trim().length > 0;
  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || customer.name.toLowerCase().includes(query) || customer.phone.includes(query);
    const matchesType = typeFilter === "all" || customer.type === typeFilter;
    
    const locQuery = locationFilter.trim().toLowerCase();
    const matchesLocation = locQuery.length === 0 || 
      customer.address.city.toLowerCase().includes(locQuery) || 
      customer.address.state.toLowerCase().includes(locQuery);

    return matchesSearch && matchesType && matchesLocation;
  });

  // KPIs
  const totalCustomers = customers.length;
  const retailCount = customers.filter(c => c.type === "Retail").length;
  const dealerCount = customers.filter(c => c.type === "Dealer").length;
  const newCustomers = customers.filter(c => c.created.startsWith("2023-10")).length; // Naive for mock

  const handleRowClick = (customer) => {
    router.push(`/customers/${customer.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
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
            >
              Add customer
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalCustomers}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Retail Customers</p>
            <p className="mt-1 text-2xl font-bold text-sky-600">{retailCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Dealers</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{dealerCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">New (This Month)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{newCustomers}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
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
              onChange={(e) => setTypeFilter(e.target.value)}
              options={customerTypeOptions}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              id="location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Filter by City/State..."
            />
          </div>
          <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "table" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Table View"
            >
              <Icons name="List" size={18} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "card" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Card View"
            >
              <Icons name="Grid" size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {filteredCustomers.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Customers"
            entityIcon="Users"
            onClearSearch={() => {
              setSearch("");
              setTypeFilter("all");
              setLocationFilter("");
            }}
            addLabel="Add customer"
          />
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Customer Info</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Total Order Value</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredCustomers.map(customer => (
                    <tr 
                      key={customer.id} 
                      onClick={() => handleRowClick(customer)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.gstin && <div className="text-[11px] text-gray-500 mt-0.5">GST: {customer.gstin}</div>}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id}
                onClick={() => handleRowClick(customer)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col gap-3 relative group"
              >
                {/* Header Area */}
                <div className={`h-32 w-full rounded-lg border border-gray-200 overflow-hidden flex flex-col items-center justify-center relative mb-2 ${customer.type === "Retail" ? "bg-gradient-to-br from-sky-50 to-white" : "bg-gradient-to-br from-indigo-50 to-white"}`}>
                  
                  {customer.imageUrl ? (
                    <img src={customer.imageUrl} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl mb-2 shadow-sm ${customer.type === "Retail" ? "bg-sky-100 text-sky-600 border border-sky-200" : "bg-indigo-100 text-indigo-600 border border-indigo-200"}`}>
                      {customer.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {!customer.imageUrl && <StatusBadge status={customer.type} label={customer.type} />}
                  
                  {/* Floating Action Buttons inside header */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                     <button onClick={() => setEditItem(customer)} className="bg-white/90 backdrop-blur-sm p-1.5 text-gray-600 hover:text-indigo-600 rounded-md shadow-sm transition-colors border border-gray-200"><Icons name="Pencil" size={14}/></button>
                     <button onClick={() => setDeleteItem(customer)} className="bg-white/90 backdrop-blur-sm p-1.5 text-gray-600 hover:text-rose-500 rounded-md shadow-sm transition-colors border border-gray-200"><Icons name="Trash2" size={14}/></button>
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

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total Value</span>
                     <span className="text-sm font-semibold text-emerald-600">{customer.totalValue}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddCustomerOpen && <AddCustomer open={isAddCustomerOpen} onClose={() => { setIsAddCustomerOpen(false); fetchCustomers(); }} />}
      {editItem && <EditCustomer open={!!editItem} onClose={() => { setEditItem(null); fetchCustomers(); }} initialData={editItem} />}
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
