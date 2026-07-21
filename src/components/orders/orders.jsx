import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import EditOrder from "./ordersModal/EditOrder";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import toast from "react-hot-toast";
import { formatDate } from "@/utils/formatters";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalOrders: 0, totalValue: 0, pendingCount: 0, unpaidValue: 0 });

  const [orders, setOrders] = useState([]);
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
      if (router.query.status) setStatusFilter(router.query.status);
      if (router.query.payment) setPaymentFilter(router.query.payment);
      if (router.query.month) setMonthFilter(router.query.month);
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

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/orders', {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          type: typeFilter,
          status: statusFilter,
          paymentStatus: paymentFilter,
          date: monthFilter
        }
      });
      const mapped = res.data.data.map(o => ({
        ...o,
        id: String(o.orderNumber).startsWith('ORD-') ? o.orderNumber : `ORD-${String(o.orderNumber).padStart(6, '0')}`,
        originalId: o.id,
        type: o.type === 'ONLINE' ? 'Online' : (o.customer?.type === 'DEALER' ? 'Dealer' : 'Retail'),
        source: o.onlineSource || 'Website',
        customer: o.type === 'ONLINE' ? (o.buyerName || 'Unknown') : (o.customer?.name || 'Unknown'),
        phone: o.type === 'ONLINE' ? (o.buyerContact || '') : (o.customer?.phone || ''),
        itemsCount: o.items.length,
        items: o.items,
        total: `Rs. ${Number(o.totalAmount || o.total || 0).toLocaleString()}`,
        balance: `Rs. ${Math.max(0, Number(o.totalAmount || o.total || 0) - Number(o.amountPaid || 0)).toLocaleString()}`,
        status: o.status.toLowerCase(),
        paymentStatus: o.paymentStatus.toLowerCase().replace('_', ' '),
        date: formatDate(o.createdAt)
      }));
      setOrders(mapped);
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchOrders();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;
    if (typeFilter !== 'all') query.type = typeFilter;
    if (statusFilter !== 'all') query.status = statusFilter;
    if (paymentFilter !== 'all') query.payment = paymentFilter;
    if (monthFilter) query.month = monthFilter;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, typeFilter, statusFilter, paymentFilter, monthFilter, isInitialized]);

  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || paymentFilter !== "all" || debouncedSearch !== "" || monthFilter !== "";

  const handleRowClick = (order) => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-sm">
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
              onClick={() => router.push('/orders/add')}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
              className="rounded-sm px-4 py-2.5 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Create Order
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="ShoppingCart" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalOrders}</h4>
            </div>
          </div>
          
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Icons name="TrendingUp" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Value</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">Rs. {stats.totalValue.toLocaleString()}</h4>
            </div>
          </div>

          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Icons name="Activity" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pending/Processing</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.pendingCount}</h4>
            </div>
          </div>

          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Icons name="AlertCircle" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unpaid/Outstanding</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">Rs. {stats.unpaidValue.toLocaleString()}</h4>
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
              placeholder="Search ID or Customer..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-40">
            <Input
              type="select"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              options={typeOptions}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={statusOptions}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              options={paymentOptions}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="month"
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            {loading && (
              <div className="absolute inset-0 top-[40px] z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <Loader text="Loading Orders..." />
              </div>
            )}
            <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
              <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount & Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center rounded-tr-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {!loading && orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-0">
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
                          setPage(1);
                        }}
                        addLabel="Create Order"
                      />
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr 
                      key={order.id} 
                      onClick={() => handleRowClick(order)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-primary">{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{order.customer}</div>
                        <div className="text-xs text-gray-500 font-medium">{order.phone}</div>
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
                      <td className="px-4 py-3 text-xs text-gray-500 font-medium">{order.date}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/orders/edit/${order.id}`)} className="px-2! rounded-sm hover:bg-indigo-50">
                            <Icons name="Pencil" size={14} className="text-gray-400 hover:text-indigo-600 transition-colors" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(order)} className="px-2! rounded-sm hover:bg-rose-50">
                            <Icons name="Trash2" size={14} className="text-gray-400 hover:text-rose-500 transition-colors" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={(newPage) => setPage(newPage)} 
          />
        </div>
      </div>

      {editItem && <EditOrder open={!!editItem} onClose={() => { setEditItem(null); fetchOrders(true); }} initialData={editItem} />}
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
