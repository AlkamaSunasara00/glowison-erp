import React, { useState, useEffect } from "react";
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



const paymentOptions = [
  { value: "all", label: "All Payments" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
];

const deliveryOptions = [
  { value: "all", label: "All Deliveries" },
  { value: "delivered", label: "Delivered" },
  { value: "pending", label: "Pending" },
];

export const Purchase = () => {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchases?limit=200');
      setPurchases(res.data.data.map(p => ({
        id: p.poNumber,
        originalId: p.id,
        vendor: p.vendorName,
        date: new Date(p.orderDate).toLocaleDateString('en-CA'),
        items: p.items.map(i => i.itemName).join(', '),
        itemsData: p.items,
        total: p.totalAmount,
        paymentStatus: p.paymentStatus.toLowerCase().replace('_', ' '),
        deliveryStatus: p.deliveryStatus.toLowerCase()
      })));
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
  const hasActiveFilters = paymentFilter !== "all" || deliveryFilter !== "all";
  const filteredPurchases = purchases.filter((purchase) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || purchase.id.toLowerCase().includes(query) || purchase.vendor.toLowerCase().includes(query);
    const matchesPayment = paymentFilter === "all" || purchase.paymentStatus === paymentFilter;
    const matchesDelivery = deliveryFilter === "all" || purchase.deliveryStatus === deliveryFilter;
    const matchesMonth = !monthFilter || purchase.date.startsWith(monthFilter);

    return matchesSearch && matchesPayment && matchesDelivery && matchesMonth;
  });

  // KPIs
  const totalPurchases = purchases.length;
  const totalPaid = purchases.filter(p => p.paymentStatus === "paid").reduce((sum, p) => sum + p.total, 0);
  const totalOutstanding = purchases.filter(p => p.paymentStatus === "pending").reduce((sum, p) => sum + p.total, 0);
  const pendingDeliveries = purchases.filter(p => p.deliveryStatus === "pending").length;

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
            >
              Record Purchase
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total POs</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalPurchases}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Paid</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">Rs. {totalPaid.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">Rs. {totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Pending Deliveries</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{pendingDeliveries}</p>
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
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              options={deliveryOptions}
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
        {filteredPurchases.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Purchases"
            entityIcon="ShoppingCart"
            onClearSearch={() => {
              setSearch("");
              setPaymentFilter("all");
              setDeliveryFilter("all");
              setMonthFilter("");
            }}
            addLabel="Record Purchase"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">PO Number</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Items Summary</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Delivery</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredPurchases.map(purchase => {
                     return (
                      <tr 
                        key={purchase.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-primary">{purchase.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{purchase.vendor}</td>
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
                           <StatusBadge status={purchase.deliveryStatus} />
                        </td>
                        <td className="px-4 py-3 text-center">
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

      {isAddOpen && <AddPurchase open={isAddOpen} onClose={() => { setIsAddOpen(false); fetchPurchases(); }} />}
      {editItem && <EditPurchase open={!!editItem} onClose={() => { setEditItem(null); fetchPurchases(); }} initialData={editItem} />}
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
