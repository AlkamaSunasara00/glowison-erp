import React, { useState, useEffect } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import StatusBadge from "@/common/StatusBadge";
import EditInvoice from "./invoiceModal/EditInvoice";
import api from "@/lib/api";
import toast from "react-hot-toast";
import TemplateSelectModal from "./invoiceModal/TemplateSelectModal";
import Template1 from "./templates/Template1";
import Template2 from "./templates/Template2";
import Template3 from "./templates/Template3";
import Template4 from "./templates/Template4";

const ActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

const InvoiceDetail = ({ open, onClose, invoice, isPage = false, onSuccess }) => {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const data = invoice || {};

  const [selectedTemplate, setSelectedTemplate] = useState(data.template || "template1");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings/company').then(res => {
      setSettings(res.data.data);
    }).catch(err => console.error(err));
  }, []);

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

  const renderTemplate = () => {
    const props = { data, detailInfo, settings, items };
    switch (selectedTemplate) {
      case 'template4': return <Template4 {...props} />;
      case 'template2': return <Template2 {...props} />;
      case 'template3': return <Template3 {...props} />;
      case 'template1':
      default: return <Template1 {...props} />;
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
        <div className={`print-hidden ${isPage ? "flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4" : "flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-7 py-4 border-b border-gray-100 bg-white gap-4"}`}>
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
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsTemplateModalOpen(true)}
              leftIcon={(props) => <ActionIcon name="Layout" {...props} />}
              className="flex rounded-lg px-2 sm:px-3! py-1.5! text-xs font-medium max-sm:w-10 max-sm:h-10 max-sm:justify-center overflow-hidden"
            >
              <span className="hidden sm:inline">Select Template</span>
            </Button>

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
              className="rounded-lg px-2 sm:px-3! py-1.5! text-xs font-semibold max-sm:w-10 max-sm:h-10 max-sm:justify-center overflow-hidden"
            >
              <span className="hidden sm:inline">Print / PDF</span>
            </Button>
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className={isPage ? "" : "flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8"}>
          <style>{`
            @media print {
              @page {
                margin: 0mm;
              }
              html, body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                margin: 0 !important;
              }
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
        <TemplateSelectModal open={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} selected={selectedTemplate} onSelect={setSelectedTemplate} />
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
      <TemplateSelectModal open={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} selected={selectedTemplate} onSelect={setSelectedTemplate} />
    </>
  );
};

export default InvoiceDetail;
