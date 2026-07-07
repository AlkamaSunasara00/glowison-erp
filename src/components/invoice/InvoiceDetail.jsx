import React, { useState, useEffect } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import StatusBadge from "@/common/StatusBadge";
import EditInvoice from "./invoiceModal/EditInvoice";
import api from "@/lib/api";
import toast from "react-hot-toast";

const ActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

const InvoiceDetail = ({ open, onClose, invoice, isPage = false, onSuccess }) => {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const data = invoice || {};

  const [selectedTemplate, setSelectedTemplate] = useState(data.template || "classic");

  useEffect(() => {
    if (data.template) {
      setSelectedTemplate(data.template);
    }
  }, [data.template]);

  const handleBack = () => {
    if (isPage) {
      router.push("/invoice");
    } else {
      onClose?.();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      await api.put(`/invoices/${data.id}`, { status: newStatus });
      toast.success("Status updated");
      if (onSuccess) onSuccess();
      if (isPage) {
        router.replace(router.asPath);
      } else {
        onClose();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const detailInfo = {
    "Invoice Number": data.invoiceNumber || "—",
    "Customer": data.customer?.name || data.customer || "—",
    "Order Ref": data.order?.orderNumber ? `ORD-${String(data.order.orderNumber).padStart(6, '0')}` : "—",
    "Invoice Date": data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString('en-CA') : "—",
    "Due Date": data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-CA') : "—",
    "Payment Status": data.paymentStatus || "—",
    "Payment Method": data.paymentMethod || "—",
  };

  const items = data.items || [];

  // Template Renderers
  const renderClassic = () => (
    <div className="print-area bg-white p-8 max-w-4xl mx-auto border border-gray-200">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-sm text-gray-500 mt-1"># {data.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-800">Glowison ERP</h2>
          <p className="text-sm text-gray-500">123 Business Road</p>
          <p className="text-sm text-gray-500">City, State 12345</p>
        </div>
      </div>
      <div className="flex justify-between mb-8">
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Bill To:</p>
          <p className="text-base font-medium text-gray-800">{data.customer?.name || data.customer}</p>
          <p className="text-sm text-gray-500">{data.customer?.email}</p>
          <p className="text-sm text-gray-500">{data.customer?.phone}</p>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-gray-500">Date:</span>
            <span className="text-gray-800">{detailInfo["Invoice Date"]}</span>
            <span className="text-gray-500">Due Date:</span>
            <span className="text-gray-800">{detailInfo["Due Date"]}</span>
          </div>
        </div>
      </div>
      <table className="w-full text-left border-collapse mb-8">
        <thead className="bg-gray-100 text-gray-800 text-sm font-semibold">
          <tr>
            <th className="py-2 px-3 border-b">Item</th>
            <th className="py-2 px-3 border-b text-right">Qty</th>
            <th className="py-2 px-3 border-b text-right">Price</th>
            <th className="py-2 px-3 border-b text-right">Total</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {items.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-3 px-3">
                <p className="font-medium">{item.product}</p>
                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
              </td>
              <td className="py-3 px-3 text-right">{item.quantity} {item.unit}</td>
              <td className="py-3 px-3 text-right">Rs. {Number(item.unitPrice).toFixed(2)}</td>
              <td className="py-3 px-3 text-right">Rs. {Number(item.lineTotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>Rs. {Number(data.subtotal || 0).toFixed(2)}</span>
          </div>
          {Number(data.discount) > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Discount:</span>
              <span>- Rs. {Number(data.discount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Tax:</span>
            <span>+ Rs. {Number(data.tax || 0).toFixed(2)}</span>
          </div>
          {Number(data.shippingCharges) > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span>+ Rs. {Number(data.shippingCharges || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2 mt-2">
            <span>Grand Total:</span>
            <span>Rs. {Number(data.grandTotal || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      {data.notes && (
        <div className="mt-8 border-t pt-4">
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Notes / Terms</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.notes}</p>
        </div>
      )}
    </div>
  );

  const renderModern = () => (
    <div className="print-area bg-white max-w-4xl mx-auto shadow-sm overflow-hidden border border-gray-100 rounded-lg">
      <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-wider">INVOICE</h1>
          <p className="text-blue-200 mt-2 font-medium">#{data.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">Glowison ERP</h2>
          <p className="text-sm text-blue-200">contact@glowison.com</p>
        </div>
      </div>
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs text-blue-600 uppercase font-bold mb-2">Invoice To</p>
            <p className="text-lg font-bold text-gray-800">{data.customer?.name || data.customer}</p>
            <p className="text-sm text-gray-500 mt-1">{data.customer?.phone}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg w-64">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Invoice Date:</span>
              <span className="font-semibold">{detailInfo["Invoice Date"]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Due Date:</span>
              <span className="font-semibold">{detailInfo["Due Date"]}</span>
            </div>
          </div>
        </div>
        <div className="mb-8 rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="py-3 px-4 border-b">Item & Description</th>
                <th className="py-3 px-4 border-b text-center">Qty</th>
                <th className="py-3 px-4 border-b text-right">Price</th>
                <th className="py-3 px-4 border-b text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {items.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">{item.product}</p>
                    {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                  </td>
                  <td className="py-4 px-4 text-center bg-gray-50/50">{item.quantity} {item.unit}</td>
                  <td className="py-4 px-4 text-right">Rs. {Number(item.unitPrice).toFixed(2)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900 bg-gray-50/50">Rs. {Number(item.lineTotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-start">
          <div className="w-1/2 pr-8">
            {data.notes && (
              <>
                <p className="text-xs text-blue-600 uppercase font-bold mb-2">Terms & Conditions</p>
                <p className="text-sm text-gray-600 bg-blue-50/50 p-4 rounded-lg border border-blue-100 whitespace-pre-wrap">{data.notes}</p>
              </>
            )}
          </div>
          <div className="w-1/2">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">Rs. {Number(data.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span className="font-medium">Rs. {Number(data.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-blue-600 border-t border-gray-200 pt-3 mt-3">
                <span>Total:</span>
                <span>Rs. {Number(data.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="print-area bg-white p-6 max-w-4xl mx-auto border-t-8 border-gray-900 shadow-sm">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Glowison ERP</h2>
          <p className="text-sm text-gray-500">GSTIN: 24XXXXX0000X1Z5</p>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-light text-gray-400 uppercase tracking-widest">Tax Invoice</h1>
          <p className="text-sm text-gray-900 font-medium mt-1">{data.invoiceNumber}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Billed To:</p>
          <p className="font-bold text-gray-900">{data.customer?.name || data.customer}</p>
          <p className="text-gray-600">{data.customer?.address || "Address not provided"}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 mb-1">Invoice Details:</p>
          <p className="text-gray-900">Date: <span className="font-medium">{detailInfo["Invoice Date"]}</span></p>
          <p className="text-gray-900">Due: <span className="font-medium">{detailInfo["Due Date"]}</span></p>
        </div>
      </div>
      <table className="w-full text-sm text-left mb-8">
        <thead className="border-y-2 border-gray-900 text-gray-900">
          <tr>
            <th className="py-2 px-1">Description</th>
            <th className="py-2 px-1 text-center">HSN/SAC</th>
            <th className="py-2 px-1 text-right">Qty</th>
            <th className="py-2 px-1 text-right">Rate</th>
            <th className="py-2 px-1 text-right">GST %</th>
            <th className="py-2 px-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-gray-800 divide-y divide-gray-100">
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-3 px-1">{item.product}</td>
              <td className="py-3 px-1 text-center text-gray-500">—</td>
              <td className="py-3 px-1 text-right">{item.quantity} {item.unit}</td>
              <td className="py-3 px-1 text-right">{Number(item.unitPrice).toFixed(2)}</td>
              <td className="py-3 px-1 text-right">{item.taxRate}%</td>
              <td className="py-3 px-1 text-right font-medium">{Number(item.lineTotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-gray-900 font-bold text-gray-900">
          <tr>
            <td colSpan="5" className="py-3 px-1 text-right">Total</td>
            <td className="py-3 px-1 text-right">Rs. {Number(data.grandTotal || 0).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern': return renderModern();
      case 'minimal': return renderMinimal();
      case 'classic':
      default: return renderClassic();
    }
  };

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col gap-4 w-full animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:w-[90%] md:h-screen ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className={`print-hidden ${isPage ? "flex items-center justify-between py-2" : "flex items-center justify-between px-7 py-4 border-b border-gray-100 bg-white"}`}>
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
              {data.invoiceNumber || "Invoice Details"}
              <StatusBadge status={data.status} />
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Customer: {data.customer?.name || data.customer}</p>
          </div>
        </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedTemplate} 
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-hidden hidden sm:block"
            >
              <option value="classic">Classic Professional</option>
              <option value="modern">Modern Blue</option>
              <option value="minimal">Minimal GST</option>
            </select>

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
              onClick={handlePrint}
              leftIcon={(props) => <ActionIcon name="Download" color="white" {...props} />}
              className="rounded-lg px-3! py-1.5! text-xs font-semibold"
            >
              Print / PDF
            </Button>
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className={isPage ? "" : "flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8"}>
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .print-area, .print-area * { visibility: visible; }
              .print-area { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; margin: 0; padding: 0; }
              .print-hidden { display: none !important; }
            }
          `}</style>
          
          <div className="grid h-full grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
            
            {/* ── LEFT (Template Preview) ── */}
            <div className="flex-1 w-full overflow-x-auto print-area-container">
              {renderTemplate()}
            </div>

            {/* ── RIGHT (Actions & Details) ── */}
            <div className="flex flex-col gap-6 print-hidden">
               <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Invoice Summary
                 </h3>
                 <div className="flex flex-col gap-3 text-sm">
                    {Object.entries(detailInfo).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500">{key}</span>
                        <span className="font-medium text-gray-900 text-right">{value}</span>
                      </div>
                    ))}
                 </div>
               </section>

               <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Status Actions
                  </h3>
                  <div className="flex flex-col gap-2">
                     <Button variant="outline" size="sm" onClick={() => handleChangeStatus('SENT')} className="justify-center w-full">Mark as Sent</Button>
                     <Button variant="outline" size="sm" onClick={() => handleChangeStatus('PAID')} className="justify-center w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mark as Paid</Button>
                     <Button variant="outline" size="sm" onClick={() => handleChangeStatus('CANCELLED')} className="justify-center w-full text-rose-600 border-rose-200 hover:bg-rose-50">Cancel Invoice</Button>
                  </div>
               </section>
               
               {data.orderId && (
                <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Linked Order
                  </h3>
                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => router.push(`/orders/${data.orderId}`)}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icons name="ShoppingCart" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors truncate">ORD-{String(data.order?.orderNumber).padStart(6, '0')}</div>
                      <div className="text-xs text-gray-500 truncate">View source order</div>
                    </div>
                    <Icons name="ChevronRight" size={16} className="text-gray-400 shrink-0" />
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );

  if (isPage) {
    return (
      <>
        {detailPanelContent}
        {isEditOpen && <EditInvoice open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} onSuccess={onSuccess} />}
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
      {isEditOpen && <EditInvoice open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} onSuccess={onSuccess} />}
    </>
  );
};

export default InvoiceDetail;
