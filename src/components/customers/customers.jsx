import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddCustomer from "./customersModal/AddCustomer";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import toast from "react-hot-toast";



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
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers?limit=100');
      setCustomers(res.data.data.map(c => ({
        ...c,
        type: c.type.toLowerCase() === 'retail' ? 'Retail' : 'Dealer',
        created: new Date(c.createdAt).toLocaleDateString(),
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
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Customer Info</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Total Order Value</th>
                    <th className="px-4 py-3 text-center">Actions</th>
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
                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(customer)} className="px-2!">
                          <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isAddCustomerOpen && <AddCustomer open={isAddCustomerOpen} onClose={() => { setIsAddCustomerOpen(false); fetchCustomers(); }} />}
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
