import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddOrder from "./ordersModal/AddOrder";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";

export const ordersData = [
  { id: "ORD-001", type: "Retail", source: "", customer: "Rahul Sharma", phone: "9876543210", items: 3, itemsList: [{name: "MDF Sheet", qty: 2, price: 500}, {name: "Glue", qty: 1, price: 200}], total: "Rs. 1,200", status: "pending", paymentStatus: "unpaid", date: "2023-10-15" },
  { id: "ORD-002", type: "Online", source: "Amazon", customer: "Sneha Gupta", phone: "9876543212", items: 1, itemsList: [{name: "Wall Clock", qty: 1, price: 450}], total: "Rs. 450", status: "processing", paymentStatus: "paid", date: "2023-10-16" },
  { id: "ORD-003", type: "Dealer", source: "", customer: "Glow Signages", phone: "9988776655", items: 50, itemsList: [{name: "Glow Sign Board", qty: 50, price: 900}], total: "Rs. 45,000", status: "shipped/ready", paymentStatus: "partially paid", date: "2023-10-18" },
  { id: "ORD-004", type: "Online", source: "Website", customer: "Amit Kumar", phone: "9123456780", items: 2, itemsList: [{name: "Custom Name Plate", qty: 1, price: 500}, {name: "Desk Organizer", qty: 1, price: 300}], total: "Rs. 800", status: "delivered", paymentStatus: "paid", date: "2023-10-20" },
  { id: "ORD-005", type: "Retail", source: "", customer: "Priya Patel", phone: "9123456780", items: 1, itemsList: [{name: "Door Sign", qty: 1, price: 150}], total: "Rs. 150", status: "cancelled", paymentStatus: "unpaid", date: "2023-10-22" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "Retail", label: "Retail" },
  { value: "Dealer", label: "Dealer" },
  { value: "Online", label: "Online" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped/ready", label: "Shipped/Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const paymentOptions = [
  { value: "all", label: "All Payments" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partially paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
];

export const Orders = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [orders, setOrders] = useState(ordersData);
  const [deleteItem, setDeleteItem] = useState(null);

  // Filters
  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || paymentFilter !== "all";
  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || order.id.toLowerCase().includes(query) || order.customer.toLowerCase().includes(query);
    const matchesType = typeFilter === "all" || order.type === typeFilter;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter;
    const matchesMonth = !monthFilter || order.date.startsWith(monthFilter);

    return matchesSearch && matchesType && matchesStatus && matchesPayment && matchesMonth;
  });

  // KPIs
  const totalOrders = orders.length;
  // Calculate total value - parse numeric
  const totalValue = orders.reduce((sum, o) => {
      const val = parseFloat(o.total.replace(/Rs.\s|,/g, ''));
      return sum + (isNaN(val) ? 0 : val);
  }, 0);
  
  const pendingCount = orders.filter(o => o.status === "pending" || o.status === "processing").length;
  
  const unpaidValue = orders.filter(o => o.paymentStatus !== "paid").reduce((sum, o) => {
      const val = parseFloat(o.total.replace(/Rs.\s|,/g, ''));
      return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleRowClick = (order) => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Track retail, dealer, and online orders in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="solid"
              onClick={() => setIsAddOrderOpen(true)}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
            >
              Create Order
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Value</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">Rs. {totalValue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Pending/Processing</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Unpaid/Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">Rs. {unpaidValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID or Customer..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-40">
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              options={paymentOptions}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Orders"
            entityIcon="ListChecks"
            onClearSearch={() => {
              setSearch("");
              setTypeFilter("all");
              setStatusFilter("all");
              setPaymentFilter("all");
              setMonthFilter("");
            }}
            addLabel="Create Order"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredOrders.map(order => (
                    <tr 
                      key={order.id} 
                      onClick={() => handleRowClick(order)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-primary">{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{order.customer}</div>
                        <div className="text-xs text-gray-500">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                         <div className="font-medium text-gray-700">{order.type}</div>
                         {order.type === 'Online' && <div className="text-[10px] text-gray-500">{order.source}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{order.total}</div>
                        <div className="text-[11px] text-gray-500">{order.items} item(s)</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{order.date}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(order)} className="px-2!">
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

      {isAddOrderOpen && <AddOrder open={isAddOrderOpen} onClose={() => setIsAddOrderOpen(false)} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.id}
          onConfirm={() => {
            setOrders(orders.filter(o => o.id !== deleteItem.id));
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
