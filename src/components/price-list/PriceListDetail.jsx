import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import EditPriceItem from "./priceListModal/EditPriceItem";
import Loader from "@/common/Loader";

const categoryOptions = [
  { value: "CARD_DESIGN", label: "Card Design" },
  { value: "FLEX_DESIGN", label: "Flex Design" },
  { value: "BANNER", label: "Banner" },
  { value: "STICKER", label: "Sticker" },
  { value: "SIGNAGE_BOARD", label: "Signage Board" },
  { value: "OTHER", label: "Other" },
];

const sizeOptions = [
  { value: "STANDARD", label: "Standard" },
  { value: "EIGHT_BY_FOUR", label: "8x4 ft" },
  { value: "SIX_BY_FOUR", label: "6x4 ft" },
  { value: "THREE_BY_TWO", label: "3x2 ft" },
  { value: "CUSTOM", label: "Custom" },
];

const unitOptions = [
  { value: "PER_PIECE", label: "Per Piece" },
  { value: "PER_SQ_FT", label: "Per Sq Ft" },
  { value: "PER_SET", label: "Per Set" },
  { value: "CUSTOM", label: "Custom" },
];

const formatEnum = (value, options) => {
  if (!value) return "—";
  const option = options?.find(o => o.value === value);
  if (option) return option.label;
  return value.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

const PriceListDetail = ({ open, onClose, itemId, onUpdated, isPage = false }) => {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/price-list/${itemId}`);
      setItem(res.data.data);
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
      router.push("/price-list");
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
      {loading || !item ? (
        <div className="flex flex-1 w-full h-full min-h-[400px] items-center justify-center bg-transparent">
          <Loader text="Loading price list details..." />
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
                <span>{isPage ? "Back to Price List" : "Close"}</span>
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-start md:justify-between">
              {/* Left Side: Avatar & Titles */}
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-50 to-white text-3xl font-black text-indigo-600 shadow-sm border border-indigo-100/50 relative overflow-hidden">
                   {item.name.substring(0, 2).toUpperCase()}
                   <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    {item.name}
                  </h1>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      <Icons name="Tag" size={12}/> {item.category === "OTHER" ? item.otherLabel : formatEnum(item.category, categoryOptions)}
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
                  Edit Item
                </Button>
              </div>
            </div>
          </div>

          {/* ── BODY ───────────────────────────────────────────── */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPage ? '' : 'p-6'}`}>
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 w-full h-full ${isPage ? 'mt-4' : ''}`}>

              {/* ── LEFT COL ── */}
              <div className="lg:col-span-8 flex flex-col gap-4">

                {/* Pricing Overview */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="IndianRupee" size={16} className="text-primary"/> Pricing Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/80 rounded-md p-4 border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-500/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Client Price</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-gray-900"><span className="text-sm font-semibold opacity-70 mr-1">₹</span>{Number(item.clientPrice || item.price).toLocaleString()}</p>
                        <p className="text-xs font-medium text-gray-400 mb-1">/ {item.priceUnit === "CUSTOM" ? item.unitOther : formatEnum(item.priceUnit, unitOptions)}</p>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50/50 rounded-md p-4 border border-emerald-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">B2B Price</p>
                      <div className="flex items-end gap-2">
                         {item.b2bPrice ? (
                           <>
                             <p className="text-2xl font-bold text-emerald-700"><span className="text-sm font-semibold opacity-70 mr-1">₹</span>{Number(item.b2bPrice).toLocaleString()}</p>
                             <p className="text-xs font-medium text-emerald-600/70 mb-1">/ {item.priceUnit === "CUSTOM" ? item.unitOther : formatEnum(item.priceUnit, unitOptions)}</p>
                           </>
                         ) : (
                           <p className="text-sm font-medium text-emerald-700">Not configured</p>
                         )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Specification Information */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2">
                      <Icons name="Info" size={16} className="text-primary"/> Item Specifications
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Dimensions / Size</span>
                      <span className="text-sm text-gray-800 font-medium">
                         {item.size === "CUSTOM" ? item.sizeOther : formatEnum(item.size, sizeOptions)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Notes / Description</span>
                      <span className="text-sm text-gray-800 font-medium whitespace-pre-wrap">{item.note || "No notes provided."}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* ── RIGHT COL ── */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                 
                 {/* Visual Reference */}
                 <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 flex-1">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="Image" size={16} className="text-primary"/> Visual Reference
                  </h3>
                  
                  {item.imageUrl ? (
                    <div className="flex flex-col gap-4">
                      <div className="aspect-[4/3] w-full bg-gray-50 rounded-sm border border-gray-200 flex items-center justify-center overflow-hidden p-2 relative group">
                         <img src={item.imageUrl} alt="Reference" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => window.open(item.imageUrl, '_blank')}
                        leftIcon={(props) => <Icons name="ExternalLink" {...props} />}
                      >
                        Open Full Image
                      </Button>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-sm border border-gray-100 border-dashed">
                      <Icons name="ImageOff" size={32} className="text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-500">No image attached.</p>
                    </div>
                  )}
                </section>

              </div>
            </div>
          </div>
        </>
      )}
      
      {isEditOpen && item && (
        <EditPriceItem 
          open={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          initialData={item}
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

export default PriceListDetail;
