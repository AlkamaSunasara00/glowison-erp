import React from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import { useState } from "react";
import EditPriceItem from "./priceListModal/EditPriceItem";

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

const PriceListDetail = ({ open, onClose, item, isPage = false }) => {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const data = item || {};

  const handleBack = () => {
    if (isPage) {
      router.push("/price-list");
    } else {
      onClose?.();
    }
  };

  const detailInfo = {
    "Category": data.category === "OTHER" ? data.otherLabel : formatEnum(data.category, categoryOptions),
    "Size": data.size === "CUSTOM" ? data.sizeOther : formatEnum(data.size, sizeOptions),
    "Client Price": data.clientPrice || data.price ? `Rs. ${data.clientPrice || data.price}` : "—",
    "B2B Price": data.b2bPrice ? `Rs. ${data.b2bPrice}` : "—",
    "Unit": data.priceUnit === "CUSTOM" ? data.unitOther : formatEnum(data.priceUnit, unitOptions),
    "Notes": data.note || "—",
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
              {data.name || "Unknown Item"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{data.id}</p>
          </div>
          <span className="ml-1 text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-800">
            {data.category === "OTHER" ? data.otherLabel : formatEnum(data.category, categoryOptions)}
          </span>
        </div>

        <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={(props) => <Icons name="Pencil" {...props} />}
              className="rounded-lg px-3! py-1.5! text-xs font-medium"
              onClick={() => setIsEditOpen(true)}
            >
              Edit
            </Button>
            {!isPage && (
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors hidden md:block rounded-full hover:bg-gray-100 ml-2">
                 <Icons name="X" size={20} />
              </button>
            )}
        </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className={isPage ? "" : "flex-1 overflow-hidden"}>
          <div className={isPage ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4" : "grid h-full grid-cols-1 lg:grid-cols-[1fr_340px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100"}>

            {/* ── LEFT ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-7 py-6 space-y-7"}>

              {/* Item Information */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
                    Item Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
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

              {/* Reference Image */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
                    Reference Image
                  </h3>
                </div>
                {data.imageUrl ? (
                   <div className="rounded-lg overflow-hidden border border-gray-200 inline-block shadow-sm">
                      <a href={data.imageUrl} target="_blank" rel="noopener noreferrer">
                        <img src={data.imageUrl} alt={data.name} className="w-full max-w-md h-auto object-cover hover:opacity-90 transition-opacity cursor-pointer" />
                      </a>
                   </div>
                ) : (
                   <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-8 text-center w-full max-w-md">
                     <Icons name="Image" size={32} className="text-gray-400 mb-2" />
                     <p className="text-sm font-medium text-gray-600">No image available</p>
                     <p className="text-xs text-gray-400 mt-1">Upload a reference image in edit mode</p>
                   </div>
                )}
              </section>

            </div>

            {/* ── RIGHT ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-6 py-6 space-y-6 bg-gray-50/40"}>

              {/* Pricing Summary */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
                  Pricing Summary
                </h3>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
                   <div className="flex flex-col items-center justify-center text-center">
                     <span className="text-sm font-semibold text-primary/80 mb-1">Client Price ({data.priceUnit === "CUSTOM" ? data.unitOther : formatEnum(data.priceUnit, unitOptions)})</span>
                     <span className="text-3xl font-bold text-primary">Rs. {data.clientPrice || data.price}</span>
                   </div>
                   {data.b2bPrice && (
                     <div className="flex flex-col items-center justify-center text-center border-t border-primary/10 pt-4">
                       <span className="text-sm font-semibold text-primary/80 mb-1">B2B Price ({data.priceUnit === "CUSTOM" ? data.unitOther : formatEnum(data.priceUnit, unitOptions)})</span>
                       <span className="text-3xl font-bold text-primary">Rs. {data.b2bPrice}</span>
                     </div>
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
        {isEditOpen && <EditPriceItem open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
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
      {isEditOpen && <EditPriceItem open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
    </>
  );
};

export default PriceListDetail;

