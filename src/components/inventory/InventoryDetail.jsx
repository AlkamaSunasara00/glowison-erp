import React, { useState, useEffect } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import api from "@/lib/api";
import StatusBadge from "@/common/StatusBadge";
import EditInventory from "./inventoryModal/EditInventory";
import AdjustStock from "./inventoryModal/AdjustStock";
import { formatDateTime } from "@/utils/formatters";

const InventoryDetail = ({ open, onClose, itemId, onUpdated }) => {
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

  if (!open) return null;

  const handleBack = () => {
    onClose?.();
  };

  const handleActionComplete = () => {
    fetchItem();
    if (onUpdated) onUpdated();
  };

  const detailPanelContent = (
    <div
      className={`relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:w-[90%] md:h-screen ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {loading || !data ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* ── HEADER ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-7 py-4 border-b border-gray-100 bg-white shrink-0">
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
                  {data.name || "Unknown Item"}
                  <StatusBadge status={Number(data.stockQty) <= Number(data.reorderThreshold) ? "Low Stock" : "In Stock"} />
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{data.sku || "No SKU"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                leftIcon={(props) => <Icons name="PlusMinus" {...props} />}
                className="rounded-lg px-3! py-1.5! text-xs font-semibold"
                onClick={() => setIsAdjustOpen(true)}
              >
                Adjust Stock
              </Button>
            </div>
          </div>

          {/* ── BODY ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden">
            <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_400px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {/* ── LEFT ── */}
              <div className="h-full overflow-y-auto px-7 py-6 space-y-7">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
                      Item Information
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={(props) => <Icons name="Pencil" {...props} />}
                      className="h-auto px-0 text-xs text-primary hover:bg-transparent hover:text-primary/70"
                      onClick={() => setIsEditOpen(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Type</span>
                      <span className="text-sm text-gray-800 font-medium">{data.type === 'RAW_MATERIAL' ? 'Raw Material' : 'Finished Good'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Category</span>
                      <span className="text-sm text-gray-800 font-medium">{data.category === 'OTHERS' ? data.categoryOther : data.category}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Opening Stock</span>
                      <span className="text-sm text-gray-800 font-medium">{data.openingStock} {data.baseUnit}</span>
                    </div>
                    
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Base Unit</span>
                      <span className="text-sm text-gray-800 font-medium">{data.baseUnit}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Purchase Unit</span>
                      <span className="text-sm text-gray-800 font-medium">{data.purchaseUnit}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Units Per Purchase</span>
                      <span className="text-sm text-gray-800 font-medium">{data.unitsPerPurchase}</span>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-100" />

                <section>
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
                    Stock & Value
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">Current Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{data.stockQty} <span className="text-sm font-normal text-gray-500">{data.baseUnit}</span></p>
                    </div>
                    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">Avg Cost</p>
                      <p className="text-2xl font-bold text-gray-900"><span className="text-sm font-normal text-gray-500 mr-1">Rs.</span>{Number(data.averageCost).toLocaleString()}</p>
                    </div>
                    <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-xs font-medium text-indigo-500 mb-1">Total Value</p>
                      <p className="text-2xl font-bold text-indigo-700"><span className="text-sm font-normal text-indigo-500 mr-1">Rs.</span>{(data.stockQty * data.averageCost).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">Last Purchase Price</p>
                      <p className="text-2xl font-bold text-gray-900"><span className="text-sm font-normal text-gray-500 mr-1">Rs.</span>{Number(data.lastPurchasePrice).toLocaleString()}</p>
                    </div>
                  </div>
                </section>
                
                {data.images && data.images.length > 0 && (
                  <>
                    <div className="h-px bg-gray-100" />
                    <section>
                      <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
                        Images
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {data.images.map((url, idx) => (
                          <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img src={url} alt={`${data.name} ${idx + 1}`} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => window.open(url, '_blank')} />
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </div>

              {/* ── RIGHT ── */}
              <div className="h-full overflow-y-auto px-6 py-6 space-y-6 bg-gray-50/40">
                <section>
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                    Stock Transactions
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    {data.transactions?.length === 0 ? (
                      <p className="text-sm text-gray-500">No transactions yet.</p>
                    ) : (
                      data.transactions?.map((tx) => {
                        const isPositive = Number(tx.quantity) > 0;
                        return (
                          <div key={tx.id} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex items-start justify-between">
                            <div>
                              <p className="text-xs font-semibold text-gray-900 flex items-center gap-2">
                                {tx.type.replace('_', ' ')}
                                {tx.referenceId && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Ref: {tx.referenceId}</span>}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-1">{formatDateTime(tx.createdAt)}</p>
                              {tx.note && <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-1.5 rounded inline-block">{tx.note}</p>}
                            </div>
                            <div className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isPositive ? '+' : ''}{tx.quantity} <span className="text-[10px] font-medium opacity-70">{data.baseUnit}</span>
                            </div>
                          </div>
                        )
                      })
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
          item={{...data, stock: Number(data.stockQty)}} 
        />
      )}
    </>
  );
};

export default InventoryDetail;
