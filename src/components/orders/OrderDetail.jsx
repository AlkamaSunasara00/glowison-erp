import React, { useState } from "react";
import Input from "@/common/Input";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import StatusBadge from "@/common/StatusBadge";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { formatDate } from "@/utils/formatters";

const ActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

const mockLineItems = [
  { id: 1, name: "MDF Sheet", size: "6mm", color: "Natural", qty: 10, price: 120, total: 1200 },
];

const OrderDetail = ({ open, onClose, order, isPage = false, onOrderUpdated }) => {
  const router = useRouter();
  const [showPartialInput, setShowPartialInput] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");
  const data = order || {};

  const handleBack = () => {
    if (isPage) {
      router.push("/orders");
    } else {
      onClose?.();
    }
  };

  const handleStatusUpdate = async (field, value, amount = null) => {
    try {
      const payload = { [field]: value };
      if (field === 'paymentStatus') {
        if (value === 'PAID') payload.amountPaid = Number(data.total || 0);
        else if (value === 'PARTIAL') payload.amountPaid = Number(amount || 0);
        else if (value === 'UNPAID') payload.amountPaid = 0;
      }
      
      await api.put(`/orders/${data.id}`, payload);
      toast.success(`Marked as ${value.charAt(0) + value.slice(1).toLowerCase()}`);
      if (onOrderUpdated) onOrderUpdated();
      else if (isPage) router.replace(router.asPath);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const detailInfo = {
    "Order ID": data.orderNumber ? `GLW-${data.orderNumber}` : (data.id || "—"),
    "Customer": data.customer ? (typeof data.customer === 'string' ? data.customer : data.customer.name) : (data.buyerName || "—"),
    "Phone": data.customer?.phone || data.buyerContact || "—",
    "Order Type": data.type === 'RETAIL_DEALER' ? 'Retail/Dealer' : (data.type || "—"),
    "Source": data.type === 'ONLINE' ? (data.onlineSource || "—") : "N/A",
    "Order Date": data.createdAt ? formatDate(data.createdAt) : "—",
  };

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col w-full min-h-screen bg-transparent animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:w-[90%] md:h-screen ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className={isPage ? "flex items-center justify-between pb-6" : "flex items-center justify-between px-7 py-4 border-b border-gray-100 bg-white"}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 transition-colors shrink-0"
            title="Go back"
          >
            <Icons name="ArrowLeft" size={20} />
          </button>
          <div>
            <h2 className="page-header flex items-center gap-2">
              {data.orderNumber ? `GLW-${data.orderNumber}` : (data.id || "Order Details")}
              <StatusBadge status={data.status} />
              <StatusBadge status={data.paymentStatus} />
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Customer: {data.customer ? data.customer.name || data.customer : "—"}</p>
          </div>
        </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push(`/orders/edit/${data.id}`)}
              leftIcon={(props) => <ActionIcon name="Pencil" {...props} />}
              className="hidden sm:flex rounded-lg px-3! py-1.5! text-xs font-medium"
            >
              Edit Order
            </Button>
            <Button
              variant="solid"
              size="md"
              onClick={() => router.push(`/invoice?orderId=${data.id}&create=true`)}
              leftIcon={(props) => <ActionIcon name="FileText" color="white" {...props} />}
              className="rounded-lg px-3! py-1.5! text-xs font-semibold"
            >
              Generate Invoice
            </Button>
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className={isPage ? "pb-10" : "flex-1 overflow-hidden"}>
          <div className={isPage ? "grid grid-cols-1 lg:grid-cols-12 gap-6" : "grid h-full grid-cols-1 lg:grid-cols-[1fr_340px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100"}>

            {/* ── LEFT SECTION (Details & Line Items) ── */}
            <div className={isPage ? "lg:col-span-8 flex flex-col gap-6" : "h-full overflow-y-auto px-7 py-6 space-y-7 bg-gray-50/40"}>

              <section className={isPage ? "bg-white border border-gray-100/80 rounded-sm p-6 shadow-sm relative overflow-hidden group" : ""}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                  {Object.entries(detailInfo).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">
                        {key}
                      </span>
                      <span className="text-sm text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── LINE ITEMS (Moved here) ── */}
              <section className={isPage ? "bg-white border border-gray-100/80 rounded-sm p-6 shadow-sm relative overflow-hidden group" : "mx-7 mb-7 bg-white border border-gray-200 rounded-sm p-6 shadow-sm"}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Line Items
                </h3>
                <div className="rounded-sm border border-gray-100 overflow-hidden">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white">
                        <tr>
                          <th className="px-4 py-3 w-16">Image</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Details</th>
                          <th className="px-4 py-3 text-right">Qty</th>
                          <th className="px-4 py-3 text-right">Unit Price</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-50">
                        {(data.items ? data.items : []).map(item => (
                          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              {item.imageUrl ? (
                                <a href={item.imageUrl} target="_blank" rel="noreferrer" className="block w-10 h-10 rounded-sm border border-gray-200 overflow-hidden hover:opacity-80 transition-opacity bg-white">
                                  <img src={item.imageUrl} alt={item.product} className="w-full h-full object-cover" />
                                </a>
                              ) : (
                                <div className="w-10 h-10 rounded-sm bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                  <Icons name="Image" size={16} />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{item.product || item.name}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs font-medium">Size: {item.size || "N/A"} | Color: {item.color || "N/A"}</td>
                            <td className="px-4 py-3 text-right">{item.qty}</td>
                            <td className="px-4 py-3 text-right">Rs. {item.unitPrice || item.price}</td>
                            <td className="px-4 py-3 text-right font-semibold">Rs. {(item.qty * (item.unitPrice || item.price)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                    <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex flex-col items-end gap-2 text-sm">
                      <div className="flex justify-between w-48 text-gray-900 font-bold border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>Rs. {Number(data.total || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between w-48 text-gray-600 text-sm mt-1">
                        <span>Amount Paid</span>
                        <span>Rs. {Number(data.amountPaid || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between w-48 text-rose-600 font-bold mt-1">
                        <span>Balance Due</span>
                        <span>Rs. {Math.max(0, Number(data.total || 0) - Number(data.amountPaid || 0)).toLocaleString()}</span>
                      </div>
                   </div>
                </div>
              </section>

            </div>

            {/* ── RIGHT (Customer link & Status) ── */}
            <div className={isPage ? "lg:col-span-4 flex flex-col gap-6" : "h-full overflow-y-auto px-6 py-6 space-y-6"}>
              
              {data.type !== 'ONLINE' && (
                <section className={isPage ? "bg-white border border-gray-100/80 rounded-sm p-6 shadow-sm relative overflow-hidden group" : ""}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <h3 className="text-base font-semibold text-gray-900 mb-3 relative">
                    Customer Details
                  </h3>
                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-sm hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer group/link relative" onClick={() => router.push(`/customers/${data.customer?.id || ''}`)}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-inner">
                      {data.customer ? (typeof data.customer === 'string' ? data.customer.charAt(0) : data.customer.name?.charAt(0) || 'C') : 'C'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm group-hover/link:text-primary transition-colors">{data.customer ? data.customer.name || data.customer : "—"}</div>
                      <div className="text-xs text-gray-500 font-medium">{data.customer?.phone || data.phone}</div>
                    </div>
                    <Icons name="ChevronRight" size={16} className="text-gray-400 group-hover/link:text-primary transition-colors" />
                  </div>
                </section>
              )}

               <section className={isPage ? "bg-white border border-gray-100/80 rounded-sm p-6 shadow-sm relative overflow-hidden group" : ""}>
                 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 <h3 className="text-base font-semibold text-gray-900 mb-3 relative">
                    Status Updates
                  </h3>
                  <div className="flex flex-col gap-3">
                     <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('status', 'PROCESSING')} className="justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">Mark as Processing</Button>
                     <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('status', 'COMPLETED')} className="justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mark as Completed</Button>
                     <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('status', 'CANCELLED')} className="justify-start text-red-600 border-red-200 hover:bg-red-50">Mark as Cancelled</Button>
                     <div className="my-2 h-px bg-gray-100" />
                     <Button variant="outline" size="sm" onClick={() => setShowPartialInput(!showPartialInput)} className="justify-start text-amber-600 border-amber-200 hover:bg-amber-50">Mark as Partially Paid</Button>
                     {showPartialInput && (
                       <div className="flex gap-2 animate-fade-in pl-1">
                         <Input type="number" min="0" placeholder="Amount (Rs)" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} className="w-full text-sm py-1 min-h-0" />
                         <Button size="sm" onClick={() => { handleStatusUpdate('paymentStatus', 'PARTIAL', partialAmount); setShowPartialInput(false); }} className="px-3">Save</Button>
                       </div>
                     )}
                     <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('paymentStatus', 'PAID')} className="justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mark as Fully Paid</Button>
                  </div>
               </section>

            </div>
          </div>

        </div>
      </div>
    );

  if (isPage) {
    return (
      <>
        {detailPanelContent}
      </>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 top-16 z-[1000] flex justify-end md:inset-0 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] ${
            open ? "animate-overlay-in" : "animate-overlay-out"
          }`}
          onClick={handleBack}
        />
        {detailPanelContent}
      </div>
    </>
  );
};

export default OrderDetail;
