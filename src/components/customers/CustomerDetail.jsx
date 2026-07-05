import React, { useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import StatusBadge from "@/common/StatusBadge";
import EditCustomer from "./customersModal/EditCustomer";

const ActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

// Mock linked data for display
const mockOrders = [
  { id: "O-1001", date: "Oct 15, 2023", amount: "Rs. 1,200", status: "Delivered" },
  { id: "O-1005", date: "Oct 20, 2023", amount: "Rs. 3,500", status: "Processing" },
];

const mockInvoices = [
  { id: "INV-201", date: "Oct 16, 2023", amount: "Rs. 1,200", status: "Paid" },
];

const mockQuotations = [
  { id: "QT-501", date: "Oct 10, 2023", amount: "Rs. 4,500", status: "Accepted" },
];

const CustomerDetail = ({ open, onClose, customer, isPage = false, onCustomerUpdated }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Orders");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const data = customer || {};

  const handleBack = () => {
    if (isPage) {
      router.push("/customers");
    } else {
      onClose?.();
    }
  };

  const detailInfo = {
    "Name": data.name || "—",
    "Phone": data.phone || "—",
    "Email": data.email || "—",
    "Customer Type": data.type || "—",
    "GSTIN": data.gstin || "—",
    "Address": data.address ? `${data.address.line1}, ${data.address.city}, ${data.address.state} - ${data.address.pincode}` : "—",
    "Notes": data.notes || "—",
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
            <h2 className="page-header">
              {data.name || "Unknown Customer"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{data.address?.city || 'No Location'}</p>
          </div>
          <span className="ml-1">
            <StatusBadge status={data.type} label={data.type} />
          </span>
        </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={(props) => <ActionIcon name="Plus" {...props} />}
              className="hidden sm:flex rounded-lg px-3! py-1.5! text-xs font-medium"
            >
              New Order
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
          <div className={isPage ? "grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4" : "grid h-full grid-cols-1 lg:grid-cols-[340px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-100"}>

            {/* ── LEFT (Profile) ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-7 py-6 space-y-7 bg-gray-50/40"}>

              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
                    Profile
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditOpen(true)}
                    leftIcon={(props) => <ActionIcon name="Pencil" {...props} />}
                    className="h-auto px-0 text-xs text-primary hover:bg-transparent hover:text-primary/70"
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex flex-col gap-y-4">
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
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                  Summary
                </h3>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                      <span className="text-gray-500">Total Orders</span>
                      <span className="font-semibold text-gray-800">2</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                      <span className="text-gray-500">Total Spend</span>
                      <span className="font-semibold text-primary">{data.totalValue || 'Rs. 0'}</span>
                    </div>
                </div>
              </section>

            </div>

            {/* ── RIGHT (Linked Data) ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-6 py-6 space-y-6"}>
              
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm h-full" : "h-full flex flex-col"}>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  {["Orders", "Invoices", "Quotations"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab 
                          ? "border-primary text-primary" 
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {activeTab === "Orders" && (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                        <tr>
                          <th className="px-4 py-3">Order ID</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {mockOrders.map(item => (
                          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                            <td className="px-4 py-3 font-medium text-primary">{item.id}</td>
                            <td className="px-4 py-3 text-gray-500">{item.date}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{item.amount}</td>
                            <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "Invoices" && (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                        <tr>
                          <th className="px-4 py-3">Invoice ID</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {mockInvoices.map(item => (
                          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                            <td className="px-4 py-3 font-medium text-primary">{item.id}</td>
                            <td className="px-4 py-3 text-gray-500">{item.date}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{item.amount}</td>
                            <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "Quotations" && (
                     <table className="w-full text-left border-collapse">
                     <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                       <tr>
                         <th className="px-4 py-3">Quotation ID</th>
                         <th className="px-4 py-3">Date</th>
                         <th className="px-4 py-3">Est. Amount</th>
                         <th className="px-4 py-3">Status</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm">
                       {mockQuotations.map(item => (
                         <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                           <td className="px-4 py-3 font-medium text-primary">{item.id}</td>
                           <td className="px-4 py-3 text-gray-500">{item.date}</td>
                           <td className="px-4 py-3 font-medium text-gray-900">{item.amount}</td>
                           <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                  )}
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
        {isEditOpen && (
          <EditCustomer
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            initialData={data}
            onSuccess={() => {
              if (onCustomerUpdated) onCustomerUpdated();
              setIsEditOpen(false);
            }}
          />
        )}
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
      {isEditOpen && <EditCustomer open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
    </>
  );
};

export default CustomerDetail;
