import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import api from "@/lib/api";
import StatusBadge from "@/common/StatusBadge";
import EditPurchase from "./purchaseModal/EditPurchase";
import { formatDate } from "@/utils/formatters";

const PurchaseDetail = ({ itemId }) => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/purchases/${itemId}`);
      setData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const handleBack = () => {
    router.push('/purchase');
  };

  if (loading || !data) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4 pb-10">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors shrink-0"
            title="Go back"
          >
            <Icons name="ArrowLeft" size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Purchase {data.purchaseNumber ? `#${data.purchaseNumber}` : ''}
              <StatusBadge status={data.status} />
              <StatusBadge status={data.paymentStatus} />
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Purchased on {formatDate(data.purchaseDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={(props) => <Icons name="Pencil" {...props} />}
            onClick={() => setIsEditOpen(true)}
          >
            Edit Purchase
          </Button>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 items-start">
        {/* ── LEFT (Line Items) ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-5 border-b pb-2">
              Supplier & Terms
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Supplier</span>
                <span 
                  className="text-base text-primary font-medium cursor-pointer hover:underline truncate"
                  title={data.supplier?.name || "No Supplier (Cash/Walk-in)"}
                  onClick={() => data.supplierId && router.push(`/suppliers/${data.supplierId}`)}
                >
                  {data.supplier?.name || "Walk-in / Cash"}
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Purchase Type</span>
                <span className="text-base text-gray-800 font-medium truncate">{data.purchaseType}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Payment Method</span>
                <span className="text-base text-gray-800 font-medium truncate" title={data.paymentMethod === 'OTHER' ? data.paymentMethodOther : data.paymentMethod}>
                  {data.paymentMethod === 'OTHER' ? data.paymentMethodOther : data.paymentMethod}
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Paid By</span>
                <span className="text-base text-gray-800 font-medium truncate" title={data.paidBy || 'Company'}>{data.paidBy || 'Company'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 mt-6">
              {data.referenceNumber && (
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Reference / Bill #</span>
                  <span className="text-base text-gray-800 font-medium truncate" title={data.referenceNumber}>{data.referenceNumber}</span>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-5 border-b pb-2">
              Line Items
            </h3>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {data.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {item.inventoryItem ? item.inventoryItem.name : (
                          <span className="flex items-center gap-1">
                            {item.itemName} <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Manual</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-gray-900 font-medium">{Number(item.purchaseQuantity)} {item.purchaseUnit}</div>
                        <div className="text-xs text-gray-500">= {Number(item.usageQuantity)} {item.usageUnit}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-500">{item.purchaseUnit}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-gray-900 font-medium">Rs. {Number(item.purchasePrice).toLocaleString()}</div>
                        <div className="text-[10px] text-gray-500">Rs. {Number(item.unitCost).toLocaleString()} / {item.usageUnit}</div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">Rs. {Number(item.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {data.notes && (
            <section>
              <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3 border-b pb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{data.notes}</p>
            </section>
          )}
        </div>

        {/* ── RIGHT (Summary & Attachment) ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-8 h-full">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4 border-b pb-2">
              Invoice Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">Rs. {Number(data.subtotal).toLocaleString()}</span>
              </div>
              {Number(data.discount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>- Rs. {Number(data.discount).toLocaleString()}</span>
                </div>
              )}
              {Number(data.tax) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span className="text-gray-900">+ Rs. {Number(data.tax).toLocaleString()}</span>
                </div>
              )}
              {Number(data.shippingCharges) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-gray-900">+ Rs. {Number(data.shippingCharges).toLocaleString()}</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                <span>Grand Total</span>
                <span>Rs. {Number(data.grandTotal).toLocaleString()}</span>
              </div>

              <div className="pt-4 space-y-3 border-t border-gray-100 mt-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Paid Amount</span>
                  <span className="font-semibold text-emerald-600">Rs. {Number(data.paidAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Balance Due</span>
                  <span className="font-bold text-rose-600">Rs. {Number(data.dueAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </section>

          {data.invoiceUrl && (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4 border-b pb-2">
                Invoice Attachment
              </h3>
              {data.invoiceUrl.endsWith('.pdf') ? (
                <a href={data.invoiceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline text-sm font-medium p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Icons name="FileText" size={24} /> View PDF Invoice
                </a>
              ) : (
                <div className="relative w-full aspect-auto rounded-lg overflow-hidden border border-gray-200">
                  <a href={data.invoiceUrl} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={data.invoiceUrl} 
                      alt="Invoice Attachment" 
                      className="w-full h-auto object-contain hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
      
      {isEditOpen && data && (
        <EditPurchase
          open={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          initialData={data} 
        />
      )}
    </div>
  );
};

export default PurchaseDetail;
