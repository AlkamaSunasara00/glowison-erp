import React, { useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import StatusBadge from "@/common/StatusBadge";
import EditQuotation from "./quotationModal/EditQuotation";

const ActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

const mockQuotationItems = [
  { id: 1, name: "HydraFacial MD Machine", qty: 1, rate: 150000, amount: 150000 },
];

const QuotationDetail = ({ open, onClose, quotation, isPage = false }) => {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const data = quotation || {};

  const handleBack = () => {
    if (isPage) {
      router.push("/quotation");
    } else {
      onClose?.();
    }
  };

  const detailInfo = {
    "Quotation ID": data.id || "—",
    "Client / Lead": data.entityName || "—",
    "Client Type": data.type || "—",
    "Date Created": data.date || "—",

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
              {data.id || "Quotation Details"}
              <StatusBadge status={data.status} />
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">For: {data.entityName}</p>
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
                  Quotation Information
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
                  Estimated Items
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
                        {mockQuotationItems.map(item => (
                          <tr key={item.id} className="border-b border-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-right">{item.qty}</td>
                            <td className="px-4 py-3 text-right">Rs. {item.rate.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-semibold">Rs. {item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex flex-col items-end gap-2 text-sm">
                      <div className="flex justify-between w-48 text-gray-900 font-bold">
                        <span>Total (Estimated)</span>
                        <span>Rs. 150,000</span>
                      </div>
                   </div>
                </div>
              </section>

            </div>

            {/* ── RIGHT (Actions) ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-6 py-6 space-y-6"}>
              
               <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                 <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                    Quick Actions
                  </h3>
                  <div className="flex flex-col gap-3">
                     <Button variant="outline" size="sm" leftIcon={(props) => <ActionIcon name="Send" {...props} />} className="justify-start">Send to Client</Button>
                     <div className="my-2 h-px bg-gray-100" />
                     <Button variant="outline" size="sm" className="justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mark as Accepted</Button>
                     <Button variant="outline" size="sm" className="justify-start text-rose-600 border-rose-200 hover:bg-rose-50">Mark as Rejected</Button>
                     <div className="my-2 h-px bg-gray-100" />
                     <Button variant="solid" size="sm" className="justify-start">Convert to Order</Button>
                     <Button variant="outline" size="sm" className="justify-start border-primary text-primary hover:bg-primary/5">Convert to Invoice</Button>
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
        {isEditOpen && <EditQuotation open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
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
      {isEditOpen && <EditQuotation open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
    </>
  );
};

export default QuotationDetail;
