import React, { useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import StatusBadge from "@/common/StatusBadge";
import EditCustomer from "./customersModal/EditCustomer";
import { formatDate } from "@/utils/formatters";

const ActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

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

  const parsedAddress = typeof data.address === 'string' ? (() => { try { return JSON.parse(data.address); } catch { return {}; } })() : (data.address || {});
  
  // Calculate Totals
  const totalOrders = data.orders?.length || 0;
  const totalSpend = (data.orders || []).reduce((sum, o) => sum + parseFloat(o.total || 0), 0).toFixed(2);
  const initials = (data.name || "UN").substring(0, 2).toUpperCase();

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col w-full min-h-screen bg-transparent animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-gray-50 shadow-2xl md:w-[95%] md:max-w-6xl md:h-[95vh] md:rounded-sm md:my-auto mx-auto overflow-hidden ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className={`relative shrink-0 z-10 ${isPage ? 'mb-4' : 'bg-white border-b border-gray-100 px-6 py-4'}`}>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="mt-1 sm:mt-0 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all shrink-0"
                title="Go back"
              >
                <Icons name="ArrowLeft" size={20} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-sm bg-gradient-to-br from-primary to-indigo-600 text-white font-bold text-xl shadow-md shadow-primary/20 shrink-0 overflow-hidden bg-white border border-gray-100">
                  {data.imageUrl ? (
                    <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
                  ) : initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      {data.name || "Unknown Customer"}
                    </h2>
                    <StatusBadge status={data.type} label={data.type} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    {parsedAddress.city && (
                      <span className="flex items-center gap-1.5"><Icons name="MapPin" size={14} className="text-gray-400"/> {parsedAddress.city}, {parsedAddress.state}</span>
                    )}
                    {data.gstin && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-semibold text-gray-600">GST: {data.gstin}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-start sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/orders')}
                leftIcon={(props) => <ActionIcon name="Plus" {...props} />}
                className="rounded-sm border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors px-3 py-2 text-xs font-semibold shadow-sm bg-white"
              >
                New Order
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={() => router.push('/invoice')}
                leftIcon={(props) => <ActionIcon name="FileText" color="white" {...props} />}
                className="rounded-sm px-3 py-2 text-xs font-semibold shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all"
              >
                Generate Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPage ? 'pb-10' : 'p-6'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">

            {/* ── LEFT COLUMN (Profile & Contact) ── */}
            <div className="lg:col-span-4 space-y-4">
              
              <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2">
                    <Icons name="User" size={16} className="text-primary"/> Contact Details
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditOpen(true)}
                    className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Icons name="Pencil" size={14} />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50/80 border border-gray-100 rounded-sm text-gray-500 shrink-0"><Icons name="Phone" size={16} /></div>
                    <div className="mt-0.5 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-900">{data.phone || "—"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50/80 border border-gray-100 rounded-sm text-gray-500 shrink-0"><Icons name="Mail" size={16} /></div>
                    <div className="mt-0.5 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Email Address</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{data.email || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50/80 border border-gray-100 rounded-sm text-gray-500 shrink-0"><Icons name="MapPin" size={16} /></div>
                    <div className="mt-0.5 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Full Address</p>
                      <p className="text-sm font-medium text-gray-800 leading-relaxed">
                        {data.address ? [parsedAddress.line1, parsedAddress.line2, parsedAddress.city, parsedAddress.state, parsedAddress.pincode].filter(Boolean).join(', ') : "—"}
                      </p>
                    </div>
                  </div>
                  
                  {data.notes && (
                    <div className="pt-6 mt-2 border-t border-gray-100/80">
                       <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Notes</p>
                       <div className="text-sm text-gray-700 bg-amber-50/50 border border-amber-100/50 p-4 rounded-sm italic leading-relaxed">
                         {data.notes}
                       </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN (KPIs & Tables) ── */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Icons name="ShoppingCart" size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Orders</p>
                    <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{totalOrders}</h4>
                  </div>
                </div>
                
                <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Icons name="TrendingUp" size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Spend</p>
                    <h4 className="text-2xl font-bold text-gray-900 tracking-tight flex items-baseline">
                      <span className="text-base text-gray-400 mr-1.5 font-semibold">Rs.</span>
                      {totalSpend}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Data Tables Card */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[450px]">
                {/* Custom Tabs */}
                <div className="flex items-center gap-8 px-8 pt-6 pb-0 border-b border-gray-100/80 bg-white">
                  {["Orders", "Invoices"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative pb-4 text-sm font-bold tracking-wide transition-colors ${
                        activeTab === tab 
                          ? "text-primary" 
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.4)] animate-fade-in" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto custom-scrollbar p-0">
                  {activeTab === "Orders" && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="bg-primary text-[11px] font-bold text-white uppercase tracking-wider sticky top-0 z-10 shadow-sm shadow-primary/10">
                        <tr>
                          <th className="px-8 py-4">Order ID</th>
                          <th className="px-8 py-4">Date</th>
                          <th className="px-8 py-4">Amount</th>
                          <th className="px-8 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-50/80">
                        {(data.orders || []).length === 0 ? (
                          <tr><td colSpan="4" className="text-center py-16 text-gray-400 font-medium">No orders found for this customer.</td></tr>
                        ) : (data.orders || []).map(item => (
                          <tr key={item.id} onClick={() => router.push(`/orders/GLW-${item.orderNumber}`)} className="group hover:bg-gray-50/60 cursor-pointer transition-colors">
                            <td className="px-8 py-4.5">
                              <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">GLW-{item.orderNumber}</span>
                            </td>
                            <td className="px-8 py-4.5 text-gray-500 font-medium">{formatDate(item.createdAt)}</td>
                            <td className="px-8 py-4.5 font-bold text-gray-800">Rs. {item.total}</td>
                            <td className="px-8 py-4.5"><StatusBadge status={item.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "Invoices" && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="bg-primary text-[11px] font-bold text-white uppercase tracking-wider sticky top-0 z-10 shadow-sm shadow-primary/10">
                        <tr>
                          <th className="px-8 py-4">Invoice ID</th>
                          <th className="px-8 py-4">Date</th>
                          <th className="px-8 py-4">Amount</th>
                          <th className="px-8 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-50/80">
                        {(data.invoices || []).length === 0 ? (
                          <tr><td colSpan="4" className="text-center py-16 text-gray-400 font-medium">No invoices found for this customer.</td></tr>
                        ) : (data.invoices || []).map(item => (
                          <tr key={item.id} onClick={() => router.push(`/invoice/${item.id}`)} className="group hover:bg-gray-50/60 cursor-pointer transition-colors">
                            <td className="px-8 py-4.5">
                              <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.invoiceNumber || item.id.slice(0, 8)}</span>
                            </td>
                            <td className="px-8 py-4.5 text-gray-500 font-medium">{formatDate(item.createdAt)}</td>
                            <td className="px-8 py-4.5 font-bold text-gray-800">Rs. {item.grandTotal || item.total || 0}</td>
                            <td className="px-8 py-4.5"><StatusBadge status={item.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

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
        className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm ${
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

