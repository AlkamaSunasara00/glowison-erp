import React, { useState, useEffect } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import api from "@/lib/api";
import StatusBadge from "@/common/StatusBadge";
import EditInventory from "./inventoryModal/EditInventory";
import AdjustStock from "./inventoryModal/AdjustStock";
import { formatDateTime } from "@/utils/formatters";
import Loader from "@/common/Loader";
import { useRouter } from "next/router";

const InventoryDetail = ({ open, onClose, itemId, onUpdated, isPage = false }) => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/${itemId}`);
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

  if (!open && !isPage) return null;

  const handleBack = () => {
    if (isPage) {
      router.push("/inventory");
    } else {
      onClose?.();
    }
  };

  const handleActionComplete = () => {
    fetchItem();
    if (onUpdated) onUpdated();
  };

  const isLowStock = data ? Number(data.currentPurchaseStock) <= Number(data.minimumStock) : false;

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col w-full min-h-screen bg-transparent animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-gray-50 shadow-2xl md:w-[95%] md:max-w-6xl md:h-[95vh] md:rounded-sm md:my-auto mx-auto overflow-hidden ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {loading || !data ? (
        <div className="flex flex-1 w-full h-full min-h-[400px] items-center justify-center bg-transparent">
          <Loader text="Loading item details..." />
        </div>
      ) : (
        <>
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
                  {data.images && data.images.length > 0 ? (
                    <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-sm shadow-md shadow-primary/10 shrink-0 overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={data.images[0]} alt={data.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-sm bg-gradient-to-br from-indigo-500 to-primary text-white font-bold text-2xl shadow-md shadow-primary/20 shrink-0 overflow-hidden border border-primary/50">
                      {(data.name || "UN").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        {data.name || "Unknown Item"}
                      </h2>
                      <StatusBadge status={data.category} label={data.category.replace('_', ' ')} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span>SKU: {data.sku || "No SKU"}</span>
                      {data.barcode && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>Barcode: {data.barcode}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-start sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={(props) => <Icons name="PlusMinus" {...props} />}
                  className="rounded-sm px-3 py-2 text-xs font-semibold bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
                  onClick={() => setIsAdjustOpen(true)}
                >
                  Adjust Stock
                </Button>
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

          {/* ── ALERTS (Like Stage Progress) ─────────────────────────────────── */}
          {isLowStock && (
            <div className={isPage ? "px-6 py-4 mb-4 bg-rose-50 border border-rose-100 rounded-sm shadow-sm" : "px-7 py-4 bg-rose-50 border-b border-rose-100"}>
               <div className="flex items-center gap-3 text-rose-700">
                  <Icons name="AlertTriangle" size={20} className="shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Low Stock Alert</p>
                    <p className="text-xs font-medium opacity-80 mt-0.5">The current stock ({data.currentPurchaseStock} {data.purchaseUnit}) is below the minimum required ({data.minimumStock} {data.purchaseUnit}).</p>
                  </div>
               </div>
            </div>
          )}

          {/* ── BODY ───────────────────────────────────────────── */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPage ? 'pb-10' : 'p-6'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full h-full">

              {/* ── LEFT COL ── */}
              <div className="lg:col-span-8 flex flex-col gap-4">

                {/* Stock & Value */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                    <Icons name="BarChart2" size={16} className="text-primary"/> Stock & Value
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50/80 rounded-md p-4 border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Stock</p>
                      <p className={`text-2xl font-bold ${isLowStock ? 'text-rose-600' : 'text-gray-900'}`}>{data.currentPurchaseStock} <span className="text-sm font-semibold opacity-70">{data.purchaseUnit}</span></p>
                    </div>
                    <div className="bg-gray-50/80 rounded-md p-4 border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cost</p>
                      <p className="text-2xl font-bold text-gray-900"><span className="text-sm font-semibold opacity-70 mr-1">Rs.</span>{Number(data.lastPurchasePrice || data.averageCost).toLocaleString()}</p>
                    </div>
                    <div className="bg-indigo-50/50 rounded-md p-4 border border-indigo-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Total Value</p>
                      <p className="text-2xl font-bold text-indigo-700"><span className="text-sm font-semibold opacity-70 mr-1">Rs.</span>{(data.currentPurchaseStock * (data.lastPurchasePrice || data.averageCost)).toLocaleString()}</p>
                    </div>
                  </div>
                </section>

                {/* Item Information */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2">
                      <Icons name="Info" size={16} className="text-primary"/> Item Information
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Category</span>
                      <span className="text-sm text-gray-800 font-medium">{data.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Sub Category</span>
                      <span className="text-sm text-gray-800 font-medium">{data.subCategory || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Brand</span>
                      <span className="text-sm text-gray-800 font-medium">{data.brand || "—"}</span>
                    </div>
                    
                    {data.material && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Material</span>
                        <span className="text-sm text-gray-800 font-medium">{data.material} {data.thickness ? `(${data.thickness})` : ""}</span>
                      </div>
                    )}
                    {data.size && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Size</span>
                        <span className="text-sm text-gray-800 font-medium">{data.size}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Unit</span>
                      <span className="text-sm text-gray-800 font-medium">{data.purchaseUnit}</span>
                    </div>
                  </div>
                </section>
                
                {/* Images */}
                {data.images && data.images.length > 0 && (
                  <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                    <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-5">
                      <Icons name="Image" size={16} className="text-primary"/> Item Images
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {data.images.map((url, idx) => (
                        <div key={idx} className="relative w-full aspect-square rounded-sm overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                          <img src={url} alt={`${data.name} ${idx + 1}`} className="object-contain w-full h-full hover:scale-110 transition-transform duration-300 cursor-pointer" onClick={() => window.open(url, '_blank')} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>

              {/* ── RIGHT COL ── */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Stock Transactions */}
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 flex-1 flex flex-col h-full max-h-[800px]">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-4 shrink-0">
                    <Icons name="Activity" size={16} className="text-primary"/> Stock Transactions
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {data.transactions?.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-sm border border-dashed border-gray-200">
                         <Icons name="Inbox" size={24} className="mx-auto text-gray-400 mb-2" />
                         <p className="text-sm text-gray-500 font-medium">No transactions yet.</p>
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-4">
                        {data.transactions?.map((tx, idx) => {
                          const isPositive = tx.type === 'IN';
                          return (
                            <div key={tx.id} className="relative pl-6">
                              <span className={`absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                              </span>
                              <div className="flex flex-col gap-1 bg-gray-50 p-3 rounded-sm border border-gray-100 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-xs font-bold text-gray-900">
                                    {tx.reason.replace('_', ' ')}
                                  </p>
                                  <div className={`text-sm font-black whitespace-nowrap ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isPositive ? '+' : '-'}{Math.abs(tx.usageQuantity)} <span className="text-[10px] uppercase font-bold opacity-70">{tx.usageUnit}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                                  <p>{formatDateTime(tx.createdAt)}</p>
                                  {tx.referenceId && <span className="bg-gray-200/60 text-gray-600 px-1.5 py-0.5 rounded">Ref: {tx.referenceId}</span>}
                                </div>
                                {tx.note && <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded-sm border border-gray-100 shadow-sm inline-block">{tx.note}</p>}
                                <div className="text-[10px] text-gray-400 mt-1 text-right font-medium">
                                  {isPositive ? '+' : '-'}{Math.abs(tx.purchaseQuantity)} {tx.purchaseUnit}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );

  if (isPage) {
    return (
      <>
        {detailPanelContent}
        {isEditOpen && data && (
          <EditInventory 
            open={isEditOpen} 
            onClose={() => setIsEditOpen(false)} 
            initialData={data} 
            onSuccess={() => { setIsEditOpen(false); handleActionComplete(); }}
          />
        )}
        {isAdjustOpen && data && (
          <AdjustStock 
            open={isAdjustOpen} 
            onClose={() => { setIsAdjustOpen(false); handleActionComplete(); }} 
            item={{...data, stock: Number(data.currentUsageStock)}} 
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
      
      {isEditOpen && data && (
        <EditInventory 
          open={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          initialData={data} 
          onSuccess={() => { setIsEditOpen(false); handleActionComplete(); }}
        />
      )}
      
      {isAdjustOpen && data && (
        <AdjustStock 
          open={isAdjustOpen} 
          onClose={() => { setIsAdjustOpen(false); handleActionComplete(); }} 
          item={{...data, stock: Number(data.currentUsageStock)}} 
        />
      )}
    </>
  );
};

export default InventoryDetail;
