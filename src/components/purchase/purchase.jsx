import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddPurchase from "./purchaseModal/AddPurchase";
import EditPurchase from "./purchaseModal/EditPurchase";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import Loader from "@/common/Loader";



const paymentOptions = [
  { value: "all", label: "All Payments" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "RECEIVED", label: "Received" },
  { value: "PENDING", label: "Pending" },
  { value: "CANCELLED", label: "Cancelled" },
];

let globalPurchasesCache = null;

export const Purchase = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [purchases, setPurchases] = useState(globalPurchasesCache || []);
  const [loading, setLoading] = useState(!globalPurchasesCache);

  const fetchPurchases = async (silent = false) => {
    try {
      if (!silent && !globalPurchasesCache) setLoading(true);
      const res = await api.get('/purchases?limit=200');
      const mapped = res.data.data.map(p => ({
        ...p,
        id: p.purchaseNumber,
        originalId: p.id,
        vendor: p.supplier?.name || "-",
        type: p.purchaseType,
        date: new Date(p.purchaseDate).toLocaleDateString('en-CA'),
        items: p.items?.map(i => i.inventoryItem?.name).join(', ') || "",
        itemsData: p.items,
        total: p.grandTotal,
        paymentStatus: p.paymentStatus,
        status: p.status
      }));
      globalPurchasesCache = mapped;
      setPurchases(mapped);
    } catch (error) {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Filters
  const hasActiveFilters = paymentFilter !== "all" || statusFilter !== "all";
  const filteredPurchases = purchases.filter((purchase) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || purchase.id.toLowerCase().includes(query) || (purchase.vendor && purchase.vendor.toLowerCase().includes(query));
    const matchesPayment = paymentFilter === "all" || purchase.paymentStatus === paymentFilter;
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    const matchesMonth = !monthFilter || purchase.date.startsWith(monthFilter);

    return matchesSearch && matchesPayment && matchesStatus && matchesMonth;
  });

  // KPIs
  const totalPurchases = purchases.length;
  const totalPaid = purchases.filter(p => p.paymentStatus === "PAID").reduce((sum, p) => sum + parseFloat(p.total), 0);
  const totalOutstanding = purchases.filter(p => p.paymentStatus === "PENDING").reduce((sum, p) => sum + parseFloat(p.total), 0);
  const pendingDeliveries = purchases.filter(p => p.status === "PENDING").length;

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Purchases</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Track raw material purchases and vendor payments.
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
              Record Purchase
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
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total POs</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{totalPurchases}</h4>
            </div>
          </div>
          
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Icons name="TrendingUp" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Paid</p>
              <h4 className="text-2xl font-black text-emerald-600 tracking-tight">Rs. {totalPaid.toLocaleString()}</h4>
            </div>
          </div>

          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Icons name="Activity" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Outstanding</p>
              <h4 className="text-2xl font-black text-rose-600 tracking-tight">Rs. {totalOutstanding.toLocaleString()}</h4>
            </div>
          </div>

          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Icons name="Clock" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Deliveries</p>
              <h4 className="text-2xl font-black text-amber-600 tracking-tight">{pendingDeliveries}</h4>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PO or Vendor..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
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
             <Input
              type="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          <div className="w-full md:w-48">
             <Input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden flex-1 min-h-[400px] flex items-center justify-center">
            <Loader text="Loading Purchases..." />
          </div>
        ) : filteredPurchases.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Purchases"
            entityIcon="ShoppingCart"
            onClearSearch={() => {
              setSearch("");
              setPaymentFilter("all");
              setStatusFilter("all");
              setMonthFilter("");
            }}
            addLabel="Record Purchase"
          />
        ) : (
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-sm">Purchase Number</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Items Summary</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center rounded-tr-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredPurchases.map(purchase => {
                     return (
                      <tr 
                        key={purchase.id} 
                        onClick={() => router.push(`/purchase/${purchase.originalId}`)}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-semibold text-primary">{purchase.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{purchase.vendor}</td>
                        <td className="px-4 py-3 text-gray-600"><StatusBadge status={purchase.type} /></td>
                        <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[200px]" title={purchase.items}>
                          {purchase.items}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{purchase.date}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          Rs. {purchase.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                           <StatusBadge status={purchase.paymentStatus} />
                        </td>
                        <td className="px-4 py-3">
                           <StatusBadge status={purchase.status} />
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(purchase)} className="px-2!">
                            <Icons name="Pencil" size={16} className="text-gray-500 hover:text-primary" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(purchase)} className="px-2!">
                            <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                          </Button>
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isAddOpen && <AddPurchase open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchPurchases(true); }} />}
      {editItem && <EditPurchase open={!!editItem} onClose={() => { setEditItem(null); fetchPurchases(true); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.id}
          onConfirm={async () => {
            try {
              await api.delete(`/purchases/${deleteItem.originalId}`);
              toast.success("Purchase deleted");
              setPurchases(purchases.filter(p => p.originalId !== deleteItem.originalId));
            } catch (err) {
              toast.error("Failed to delete purchase");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Purchase;
