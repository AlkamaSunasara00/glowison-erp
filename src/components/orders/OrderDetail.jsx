import React, { useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import StatusBadge from "@/common/StatusBadge";
import EditOrder from "./ordersModal/EditOrder";

const ActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

const mockLineItems = [
  { id: 1, name: "MDF Sheet", size: "6mm", color: "Natural", qty: 10, price: 120, total: 1200 },
];

const OrderDetail = ({ open, onClose, order, isPage = false }) => {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const data = order || {};

  const handleBack = () => {
    if (isPage) {
      router.push("/orders");
    } else {
      onClose?.();
    }
  };

  const detailInfo = {
    "Order ID": data.id || "—",
    "Customer": data.customer || "—",
    "Phone": data.phone || "—",
    "Order Type": data.type || "—",
    "Source": data.type === 'Online' ? data.source || "—" : "N/A",
    "Order Date": data.date || "—",
  };

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col gap-4 w-full animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:w-[90%] md:h-screen ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className={isPage ? "flex items-center justify-between py-2" : "flex items-center justify-between px-7 py-4 border-b border-gray-100 bg-white"}>
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
              {data.id || "Order Details"}
              <StatusBadge status={data.status} />
              <StatusBadge status={data.paymentStatus} />
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Customer: {data.customer}</p>
          </div>
        </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsEditOpen(true)}
              leftIcon={(props) => <ActionIcon name="Pencil" {...props} />}
              className="hidden sm:flex rounded-lg px-3! py-1.5! text-xs font-medium"
            >
              Edit Order
            </Button>
            <Button
              variant="solid"
              size="md"
              leftIcon={(props) => <ActionIcon name="FileText" color="white" {...props} />}
              className="rounded-lg px-3! py-1.5! text-xs font-semibold"
            >
              Generate Invoice
            </Button>
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className={isPage ? "" : "flex-1 overflow-hidden"}>
          <div className={isPage ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4" : "grid h-full grid-cols-1 lg:grid-cols-[1fr_340px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100"}>

            {/* ── LEFT (Line items & Details) ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-7 py-6 space-y-7 bg-gray-50/40"}>

              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                  {Object.entries(detailInfo).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {key}
                      </span>
                      <span className="text-sm text-gray-800 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                 <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
                  Line Items
                </h3>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Details</th>
                          <th className="px-4 py-3 text-right">Qty</th>
                          <th className="px-4 py-3 text-right">Unit Price</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {mockLineItems.map(item => (
                          <tr key={item.id} className="border-b border-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">Size: {item.size} | Color: {item.color}</td>
                            <td className="px-4 py-3 text-right">{item.qty}</td>
                            <td className="px-4 py-3 text-right">Rs. {item.price}</td>
                            <td className="px-4 py-3 text-right font-semibold">Rs. {item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex flex-col items-end gap-2 text-sm">
                      <div className="flex justify-between w-48 text-gray-500">
                        <span>Subtotal</span>
                        <span>Rs. 1,200</span>
                      </div>
                      <div className="flex justify-between w-48 text-gray-500">
                        <span>Tax (18%)</span>
                        <span>Rs. 216</span>
                      </div>
                      <div className="flex justify-between w-48 text-gray-900 font-bold border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>Rs. 1,416</span>
                      </div>
                   </div>
                </div>
              </section>

            </div>

            {/* ── RIGHT (Customer link & Status) ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-6 py-6 space-y-6"}>
              
              {data.type !== 'Online' && (
                <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                    Customer Details
                  </h3>
                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => router.push('/customers/1')}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {data.customer ? data.customer.charAt(0) : 'C'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">{data.customer}</div>
                      <div className="text-xs text-gray-500">{data.phone}</div>
                    </div>
                    <Icons name="ChevronRight" size={16} className="text-gray-400" />
                  </div>
                </section>
              )}

               <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                 <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                    Status Updates
                  </h3>
                  <div className="flex flex-col gap-3">
                     <Button variant="outline" size="sm" className="justify-start">Mark as Processing</Button>
                     <Button variant="outline" size="sm" className="justify-start">Mark as Shipped</Button>
                     <Button variant="outline" size="sm" className="justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mark as Delivered</Button>
                     <div className="my-2 h-px bg-gray-100" />
                     <Button variant="outline" size="sm" className="justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mark as Paid</Button>
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
        {isEditOpen && <EditOrder open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
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
      {isEditOpen && <EditOrder open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
    </>
  );
};

export default OrderDetail;
