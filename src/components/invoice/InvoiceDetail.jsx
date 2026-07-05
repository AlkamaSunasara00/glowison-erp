import React, { useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import StatusBadge from "@/common/StatusBadge";
import EditInvoice from "./invoiceModal/EditInvoice";

const ActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

const mockInvoiceItems = [
  { id: 1, name: "MDF Sheet", qty: 10, rate: 120, amount: 1200 },
];

const InvoiceDetail = ({ open, onClose, invoice, isPage = false }) => {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const data = invoice || {};

  const handleBack = () => {
    if (isPage) {
      router.push("/invoice");
    } else {
      onClose?.();
    }
  };

  const detailInfo = {
    "Invoice ID": data.id || "—",
    "Customer": data.customer || "—",
    "Order Ref": data.orderId || "—",
    "Invoice Date": data.date || "—",
    "Due Date": data.dueDate || "—",
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
              {data.id || "Invoice Details"}
              <StatusBadge status={data.status} />
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
              Edit
            </Button>
            <Button
              variant="solid"
              size="md"
              leftIcon={(props) => <ActionIcon name="Download" color="white" {...props} />}
              className="rounded-lg px-3! py-1.5! text-xs font-semibold"
            >
              Download PDF
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
                  Invoice Information
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
                          <th className="px-4 py-3">Product/Service</th>
                          <th className="px-4 py-3 text-right">Qty</th>
                          <th className="px-4 py-3 text-right">Rate</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {mockInvoiceItems.map(item => (
                          <tr key={item.id} className="border-b border-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-right">{item.qty}</td>
                            <td className="px-4 py-3 text-right">Rs. {item.rate}</td>
                            <td className="px-4 py-3 text-right font-semibold">Rs. {item.amount}</td>
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
                        <span>CGST (9%)</span>
                        <span>Rs. 108</span>
                      </div>
                      <div className="flex justify-between w-48 text-gray-500">
                        <span>SGST (9%)</span>
                        <span>Rs. 108</span>
                      </div>
                      <div className="flex justify-between w-48 text-gray-900 font-bold border-t border-gray-200 pt-2">
                        <span>Total (Rs.)</span>
                        <span>Rs. 1,416</span>
                      </div>
                   </div>
                </div>
              </section>

            </div>

            {/* ── RIGHT (Actions & Links) ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-6 py-6 space-y-6"}>
              
               <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                 <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                    Quick Actions
                  </h3>
                  <div className="flex flex-col gap-3">
                     <Button variant="outline" size="sm" leftIcon={(props) => <ActionIcon name="Send" {...props} />} className="justify-start">Send via Email</Button>
                     <Button variant="outline" size="sm" leftIcon={(props) => <ActionIcon name="MessageCircle" {...props} />} className="justify-start">Share via WhatsApp</Button>
                     <div className="my-2 h-px bg-gray-100" />
                     <Button variant="outline" size="sm" className="justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">Record Payment</Button>
                  </div>
               </section>
               
               {data.orderId && (
                <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                    Linked Order
                  </h3>
                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => router.push(`/orders/${data.orderId}`)}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Icons name="ShoppingCart" size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">{data.orderId}</div>
                      <div className="text-xs text-gray-500">View source order</div>
                    </div>
                    <Icons name="ChevronRight" size={16} className="text-gray-400" />
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </div>
    );

  if (isPage) {
    return (
      <>
        {detailPanelContent}
        {isEditOpen && <EditInvoice open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
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
      {isEditOpen && <EditInvoice open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
    </>
  );
};

export default InvoiceDetail;
