import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import api from "@/lib/api";
import StatusBadge from "@/common/StatusBadge";
import EditSupplier from "./supplierModal/EditSupplier";
import { formatDate } from "@/utils/formatters";
import Loader from "@/common/Loader";

const SupplierDetail = ({ open, onClose, itemId, onUpdated, isPage = false }) => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/suppliers/${itemId}`);
      setData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && itemId) {
      fetchItem();
    }
  }, [open, itemId]);

  useEffect(() => {
    if (!isPage) {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [open, isPage]);

  if (!open && !isPage) return null;

  const handleClose = () => {
    if (isPage) {
      router.push("/suppliers");
    } else {
      if (onClose) onClose();
    }
  };

  const handleUpdated = () => {
    fetchItem();
    if (onUpdated) onUpdated();
  };

  const totalSpent = data?.purchases?.reduce((sum, p) => sum + Number(p.grandTotal), 0) || 0;
  const totalPaid = data?.purchases?.reduce((sum, p) => sum + Number(p.paidAmount), 0) || 0;
  const totalDue = data?.purchases?.reduce((sum, p) => sum + Number(p.dueAmount), 0) || 0;

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col w-full min-h-screen bg-transparent animate-fade-in pb-10" : `relative flex h-full w-full max-w-full flex-col bg-gray-50 shadow-2xl md:w-[95%] md:max-w-6xl md:h-[95vh] md:rounded-sm md:my-auto mx-auto overflow-hidden ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {loading || !data ? (
        <div className="flex flex-1 w-full h-full min-h-[400px] items-center justify-center bg-transparent">
          <Loader text="Loading supplier details..." />
        </div>
      ) : (
        <>
          {/* ── HEADER (Sleek Gradient & Info) ─────────────────────────────── */}
          <div className="shrink-0 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <Icons name="ArrowLeft" size={18} />
                <span>{isPage ? "Back to Suppliers" : "Close"}</span>
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-start md:justify-between">
              {/* Left Side: Avatar & Titles */}
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-50 to-white text-3xl font-black text-indigo-600 shadow-sm border border-indigo-100/50 relative overflow-hidden">
                   {data.name.substring(0, 2).toUpperCase()}
                   <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    {data.name}
                    <StatusBadge status={data.status} />
                  </h1>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      <Icons name="Building" size={12}/> {data.companyName || "No Company"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex shrink-0 items-center gap-3">
                <Button
                  variant="solid"
                  size="sm"
                  leftIcon={(props) => <Icons name="Pencil" color="white" {...props} />}
                  className="rounded-sm px-3 py-2 text-xs font-semibold shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all"
                  onClick={() => setIsEditOpen(true)}
                >
                  Edit Supplier
                </Button>
              </div>
            </div>
          </div>

          {/* ── BODY ───────────────────────────────────────────── */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPage ? '' : 'p-6'}`}>
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 w-full h-full ${isPage ? 'mt-4' : ''}`}>

              {/* ── LEFT COL ── */}
              <div className="lg:col-span-8 flex flex-col gap-4">

                {/* Financials Overview */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="IndianRupee" size={16} className="text-primary"/> Financial Overview
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50/80 rounded-md p-4 border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900"><span className="text-sm font-semibold opacity-70 mr-1">₹</span>{totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-md p-4 border border-emerald-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Total Paid</p>
                      <p className="text-2xl font-bold text-emerald-700"><span className="text-sm font-semibold opacity-70 mr-1">₹</span>{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-rose-50/50 rounded-md p-4 border border-rose-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                      <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2">Total Due</p>
                      <p className="text-2xl font-bold text-rose-700"><span className="text-sm font-semibold opacity-70 mr-1">₹</span>{totalDue.toLocaleString()}</p>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2">
                      <Icons name="User" size={16} className="text-primary"/> Contact Information
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contact Person</span>
                      <span className="text-sm text-gray-800 font-medium">{data.contactPerson || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Mobile</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-gray-800 font-medium">{data.mobile || "—"}</span>
                        {data.mobile && (
                          <div className="flex items-center gap-1.5 ml-2">
                            <a href={`tel:${data.mobile}`} className="text-gray-400 hover:text-primary transition-colors bg-gray-50 hover:bg-primary/10 p-1.5 rounded-sm border border-gray-100" title="Call">
                              <Icons name="Phone" size={12} />
                            </a>
                            <a href={`https://wa.me/${data.mobile.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-500 transition-colors bg-gray-50 hover:bg-emerald-50 p-1.5 rounded-sm border border-gray-100" title="WhatsApp">
                              <Icons name="MessageCircle" size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Alternate Mobile</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-gray-800 font-medium">{data.alternateMobile || "—"}</span>
                        {data.alternateMobile && (
                          <div className="flex items-center gap-1.5 ml-2">
                            <a href={`tel:${data.alternateMobile}`} className="text-gray-400 hover:text-primary transition-colors bg-gray-50 hover:bg-primary/10 p-1.5 rounded-sm border border-gray-100" title="Call">
                              <Icons name="Phone" size={12} />
                            </a>
                            <a href={`https://wa.me/${data.alternateMobile.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-500 transition-colors bg-gray-50 hover:bg-emerald-50 p-1.5 rounded-sm border border-gray-100" title="WhatsApp">
                              <Icons name="MessageCircle" size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Email</span>
                      <span className="text-sm text-gray-800 font-medium">{data.email || "—"}</span>
                    </div>
                  </div>
                </section>
                
                {/* Address & Taxation */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="MapPin" size={16} className="text-primary"/> Address & Taxation
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-0.5 sm:col-span-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Address</span>
                      <span className="text-sm text-gray-800 font-medium">
                        {data.address}, {data.city}, {data.state}, {data.country} - {data.pincode}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">GST Number</span>
                      <span className="text-sm text-gray-800 font-medium">{data.gstNumber || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">PAN Number</span>
                      <span className="text-sm text-gray-800 font-medium">{data.panNumber || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Payment Terms</span>
                      <span className="text-sm text-gray-800 font-medium">{data.paymentTerms || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Opening Balance</span>
                      <span className="text-sm text-gray-800 font-medium">₹{Number(data.openingBalance || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </section>

                {data.notes && (
                  <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                    <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-3">
                      <Icons name="FileText" size={16} className="text-gray-400"/> Notes
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50/50 p-4 rounded-sm border border-gray-100">{data.notes}</p>
                  </section>
                )}
              </div>

              {/* ── RIGHT COL ── */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                 
                 {/* Recent Purchases Timeline */}
                 <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 flex-1">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="ShoppingCart" size={16} className="text-primary"/> Recent Purchases
                  </h3>
                  
                  <div className="flex flex-col gap-3">
                    {data.purchases?.length === 0 ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center bg-gray-50 rounded-sm border border-gray-100 border-dashed">
                        <Icons name="ShoppingCart" size={32} className="text-gray-300 mb-2" />
                        <p className="text-sm font-medium text-gray-500">No purchases yet.</p>
                      </div>
                    ) : (
                      data.purchases?.map((purchase) => (
                        <div key={purchase.id} onClick={() => router.push(`/purchase/${purchase.id}`)} className="bg-white border border-gray-100 rounded-sm p-3.5 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors"></div>
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                              #{purchase.invoiceNumber}
                            </p>
                            <StatusBadge status={purchase.paymentStatus} />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                             <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                                <Icons name="Calendar" size={12} className="text-gray-400"/>
                                {formatDate(purchase.purchaseDate)}
                             </p>
                             <div className="text-sm font-black text-gray-900">
                               ₹{Number(purchase.grandTotal).toLocaleString()}
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

              </div>
            </div>
          </div>
        </>
      )}
      
      {isEditOpen && data && (
        <EditSupplier
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={data}
          onSuccess={handleUpdated}
        />
      )}
    </div>
  );

  if (isPage) {
    return detailPanelContent;
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-16 z-[100] flex items-end justify-center sm:top-16 md:inset-0 md:items-center ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      {detailPanelContent}
    </div>
  );
};

export default SupplierDetail;
