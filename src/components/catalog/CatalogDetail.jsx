import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import Icons from "@/common/Icons";
import Button from "@/common/Button";
import Loader from "@/common/Loader";
import { formatDate } from "@/utils/formatters";
import EditCatalogItem from "./catalogModal/EditCatalogItem";
import { useRouter } from "next/router";

const CatalogDetail = ({ open, onClose, itemId, onUpdated, isPage = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const router = useRouter();

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/catalog/${itemId}`);
      setData(res.data.data);
    } catch (error) {
      console.error("Failed to load catalog details:", error);
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
      router.push("/catalog");
    } else {
      if (onClose) onClose();
    }
  };

  const handleUpdated = () => {
    fetchItem();
    if (onUpdated) onUpdated();
  };

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col w-full min-h-screen bg-transparent animate-fade-in pb-10" : `relative flex h-full w-full max-w-full flex-col bg-gray-50 shadow-2xl md:w-[95%] md:max-w-6xl md:h-[95vh] md:rounded-sm md:my-auto mx-auto overflow-hidden ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {loading || !data ? (
        <div className="flex flex-1 w-full h-full min-h-[400px] items-center justify-center bg-transparent">
          <Loader text="Loading product details..." />
        </div>
      ) : (
        <>
          {/* ── HEADER (Sleek Gradient & Info) ─────────────────────────────── */}
          <div className="shrink-0 bg-white border-b border-gray-200">
            {/* Top Bar for Desktop/Mobile with Back/Close */}
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <Icons name="ArrowLeft" size={18} />
                <span>{isPage ? "Back to Catalogue" : "Close"}</span>
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-start md:justify-between">
              {/* Left Side: Avatar/Image & Titles */}
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-50 to-white text-3xl font-black text-indigo-600 shadow-sm border border-indigo-100/50 overflow-hidden relative">
                  {data.imageUrl ? (
                    <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
                  ) : (
                    data.name?.substring(0, 2).toUpperCase()
                  )}
                  {data.imageUrl && <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div>}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">{data.name}</h1>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      SKU: {data.sku || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {data.category || "General"}
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
                  Edit Product
                </Button>
              </div>
            </div>
          </div>

          {/* ── BODY ───────────────────────────────────────────── */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPage ? '' : 'p-6'}`}>
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 w-full h-full ${isPage ? 'mt-4' : ''}`}>

              {/* ── LEFT COL ── */}
              <div className="lg:col-span-8 flex flex-col gap-4">

                {/* Pricing & Financials */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="IndianRupee" size={16} className="text-primary"/> Pricing Information
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50/80 rounded-md p-4 border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Retail Price</p>
                      <p className="text-2xl font-bold text-gray-900"><span className="text-sm font-semibold opacity-70 mr-1">₹</span>{Number(data.retailPrice || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-indigo-50/50 rounded-md p-4 border border-indigo-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Dealer Price</p>
                      <p className="text-2xl font-bold text-indigo-700"><span className="text-sm font-semibold opacity-70 mr-1">₹</span>{Number(data.dealerPrice || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50/80 rounded-md p-4 border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tax Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{data.taxRate || 0}<span className="text-sm font-semibold opacity-70 ml-1">%</span></p>
                    </div>
                  </div>
                </section>

                {/* Product Information */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2">
                      <Icons name="Info" size={16} className="text-primary"/> Product Information
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Category</span>
                      <span className="text-sm text-gray-800 font-medium">{data.category || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Brand</span>
                      <span className="text-sm text-gray-800 font-medium">{data.brand || "—"}</span>
                    </div>
                    {data.description && (
                      <div className="flex flex-col gap-0.5 sm:col-span-2 lg:col-span-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Description</span>
                        <span className="text-sm text-gray-800 font-medium whitespace-pre-wrap">{data.description}</span>
                      </div>
                    )}
                  </div>
                </section>
                
                {/* Variant & Material Details */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="Layers" size={16} className="text-primary"/> Variant & Material
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Size / Dimensions</span>
                      <span className="text-sm text-gray-800 font-medium">{data.size || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Color / Finish</span>
                      <span className="text-sm text-gray-800 font-medium">{data.color || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Material</span>
                      <span className="text-sm text-gray-800 font-medium">{data.material || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Unit</span>
                      <span className="text-sm text-gray-800 font-medium">{data.unit || "—"}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* ── RIGHT COL ── */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                 
                 {/* System Info */}
                 <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="Settings" size={16} className="text-gray-400"/> System Info
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Created At</span>
                      <span className="text-sm text-gray-800 font-medium">{formatDate(data.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Updated At</span>
                      <span className="text-sm text-gray-800 font-medium">{formatDate(data.updatedAt)}</span>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </>
      )}
      
      {isEditOpen && data && (
        <EditCatalogItem
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={data}
          onUpdated={handleUpdated}
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

export default CatalogDetail;
