import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddOrder from "./ordersModal/AddOrder";
import EditOrder from "./ordersModal/EditOrder";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import toast from "react-hot-toast";



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
  const [orders, setOrders] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders?limit=100');
      setOrders(res.data.data.map(o => ({
        ...o,
        id: `GLW-${o.orderNumber}`,
        originalId: o.id,
        type: o.customer?.type === 'RETAIL' ? 'Retail' : o.customer?.type === 'DEALER' ? 'Dealer' : 'Online',
        source: 'Website',
        customer: o.customer?.name || 'Unknown',
        phone: o.customer?.phone || '',
        items: o.items.length,
        itemsList: o.items,
        total: `Rs. ${Number(o.totalAmount || o.total || 0).toLocaleString()}`,
        balance: `Rs. ${Math.max(0, Number(o.total || 0) - Number(o.amountPaid || 0)).toLocaleString()}`,
        status: o.status.toLowerCase(),
        paymentStatus: o.paymentStatus.toLowerCase().replace('_', ' '),
        date: new Date(o.createdAt).toLocaleDateString('en-CA')
      })));
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
  
  const unpaidValue = orders.reduce((sum, o) => {
      const val = parseFloat(o.balance.replace(/Rs.\s|,/g, ''));
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
                    <th className="px-4 py-3">Amount & Balance</th>
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
                        {order.balance !== "Rs. 0" && (
                           <div className="text-[11px] font-semibold text-rose-500 mt-0.5">Bal: {order.balance}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{order.date}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(order)} className="px-2!">
                            <Icons name="Pencil" size={16} className="text-gray-400 hover:text-indigo-600 transition-colors" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(order)} className="px-2!">
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
        )}
      </div>

      {isAddOrderOpen && <AddOrder open={isAddOrderOpen} onClose={() => { setIsAddOrderOpen(false); fetchOrders(); }} />}
      {editItem && <EditOrder open={!!editItem} onClose={() => { setEditItem(null); fetchOrders(); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.id}
          onConfirm={async () => {
            try {
              await api.delete(`/orders/${deleteItem.originalId}`);
              toast.success("Order deleted");
              setOrders(orders.filter(o => o.originalId !== deleteItem.originalId));
            } catch (err) {
              toast.error("Failed to delete order");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
