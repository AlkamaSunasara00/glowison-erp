import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import StatusBadge from "@/common/StatusBadge";
import EditInvoice from "./invoiceModal/EditInvoice";
import TemplateSelectModal from "./invoiceModal/TemplateSelectModal";
import Loader from "@/common/Loader";

import Template1 from "./templates/Template1";
import Template2 from "./templates/Template2";
import Template3 from "./templates/Template3";
import Template4 from "./templates/Template4";

const InvoiceDetail = ({ open, onClose, invoiceId, onUpdated, isPage = false }) => {
  const router = useRouter();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings/company').then(res => {
      setSettings(res.data.data);
    }).catch(err => console.error(err));
  }, []);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invoices/${invoiceId}`);
      setInvoice(res.data.data);
      if (res.data.data.template) {
        setSelectedTemplate(res.data.data.template);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && invoiceId) {
      fetchInvoice();
    }
  }, [open, invoiceId]);

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
      router.push("/invoice");
    } else {
      if (onClose) onClose();
    }
  };

  const handleUpdated = () => {
    fetchInvoice();
    if (onUpdated) onUpdated();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      let paymentStatus = invoice?.paymentStatus;
      if (newStatus === 'PAID') paymentStatus = 'PAID';
      else if (newStatus === 'CANCELLED') paymentStatus = 'CANCELLED';
      else if (newStatus === 'SENT' || newStatus === 'OVERDUE') paymentStatus = 'UNPAID';

      await api.put(`/invoices/${invoiceId}`, { status: newStatus, paymentStatus });
      toast.success("Status updated");
      handleUpdated();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const renderTemplate = () => {
    if (!invoice) return null;
    
    const detailInfo = {
      "Invoice Number": invoice.invoiceNumber || "—",
      "Customer": invoice.customer?.name || invoice.customer || "—",
      "Order Ref": invoice.order?.orderNumber ? `ORD-${String(invoice.order.orderNumber).padStart(6, '0')}` : "—",
      "Invoice Date": invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-CA') : "—",
      "Due Date": invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-CA') : "—",
      "Payment Status": invoice.paymentStatus || "—",
      "Payment Method": invoice.paymentMethod || "—",
    };
    
    const items = invoice.items || [];
    const props = { data: invoice, detailInfo, settings, items };

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
      className={isPage ? "flex flex-col w-full min-h-screen bg-gray-50/50 animate-fade-in pb-10" : `relative flex h-full w-full max-w-full flex-col bg-gray-50 shadow-2xl md:w-[95%] md:max-w-6xl md:h-[95vh] md:rounded-sm md:my-auto mx-auto overflow-hidden ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {loading || !invoice ? (
        <div className="flex flex-1 w-full h-full min-h-[400px] items-center justify-center bg-transparent">
          <Loader text="Loading invoice details..." />
        </div>
      ) : (
        <>
          {/* ── HEADER (Sleek Info) - Hidden on Print ── */}
          <div className={`print-hidden ${isPage ? "flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4 px-4 sm:px-8" : "flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-7 py-4 border-b border-gray-100 bg-transparent gap-4"}`}>
             <div className="flex items-center gap-4">
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                >
                  <Icons name="ArrowLeft" size={18} />
                  <span>{isPage ? "Back" : "Close"}</span>
                </button>
             </div>
          </div>

          <div className={`flex flex-col gap-6 md:flex-row md:items-start md:justify-between print-hidden ${isPage ? "px-4 sm:px-8 py-2" : "px-6 py-4"}`}>
              {/* Left Side: Avatar & Titles */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-50 to-white text-indigo-600 shadow-sm border border-indigo-100/50">
                   <Icons name="FileText" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    {invoice.invoiceNumber}
                    <StatusBadge status={invoice.status} />
                  </h1>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      <Icons name="User" size={12}/> {invoice.customer?.name || invoice.customer || "Unknown"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      <Icons name="Calendar" size={12}/> {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-CA') : new Date(invoice.createdAt).toLocaleDateString('en-CA')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex shrink-0 items-center gap-3 flex-wrap">
                 {/* Status Dropdown Native */}
                 <div className="relative">
                    <select 
                       className="appearance-none bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-sm px-3 py-1.5 pr-8 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                       value={invoice.status}
                       onChange={(e) => handleChangeStatus(e.target.value)}
                    >
                       <option value="DRAFT">Draft</option>
                       <option value="SENT">Sent</option>
                       <option value="PAID">Paid</option>
                       <option value="OVERDUE">Overdue</option>
                       <option value="CANCELLED">Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                       <Icons name="ChevronDown" size={14} />
                    </div>
                 </div>

                 <Button
                   variant="outline"
                   size="sm"
                   leftIcon={(props) => <Icons name="Layout" {...props} />}
                   className="rounded-sm border-gray-200 font-semibold"
                   onClick={() => setIsTemplateModalOpen(true)}
                 >
                   Template
                 </Button>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={(props) => <Icons name="Pencil" {...props} />}
                  className="rounded-sm border-gray-200 font-semibold"
                  onClick={() => setIsEditOpen(true)}
                >
                  Edit
                </Button>

                <Button
                  variant="solid"
                  size="sm"
                  leftIcon={(props) => <Icons name="Printer" color="white" {...props} />}
                  className="rounded-sm px-4 shadow-sm shadow-primary/20 hover:shadow-md transition-all font-semibold"
                  onClick={handlePrint}
                >
                  Print / PDF
                </Button>
              </div>
            </div>

          {/* ── BODY (Invoice Information & Template) ───────────────────────────────────────────── */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 print:bg-white print:overflow-visible ${isPage ? 'p-4 sm:p-8' : 'p-6'}`}>
            <div className="max-w-5xl mx-auto space-y-6 print:space-y-0">
               
               {/* Invoice Info Grid - Hidden on Print */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print-hidden">
                  <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex flex-col gap-1">
                     <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Order Ref</span>
                     <span className="text-sm font-bold text-gray-900">{invoice.order?.orderNumber ? `ORD-${String(invoice.order.orderNumber).padStart(6, '0')}` : "—"}</span>
                  </div>
                  <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex flex-col gap-1">
                     <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Due Date</span>
                     <span className="text-sm font-bold text-gray-900">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-CA') : "—"}</span>
                  </div>
                  <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex flex-col gap-1">
                     <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Payment Method</span>
                     <span className="text-sm font-bold text-gray-900">{invoice.paymentMethod || "—"}</span>
                  </div>
                  <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex flex-col gap-1 relative">
                     <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment Status</span>
                     <div className="relative">
                       <select 
                         className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 font-bold text-sm rounded-sm px-3 py-1.5 pr-8 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer w-full"
                         value={invoice.paymentStatus}
                         onChange={async (e) => {
                           try {
                             await api.put(`/invoices/${invoiceId}`, { paymentStatus: e.target.value });
                             toast.success("Payment Status updated");
                             handleUpdated();
                           } catch (err) {
                             toast.error("Failed to update payment status");
                           }
                         }}
                       >
                         <option value="UNPAID">UNPAID</option>
                         <option value="PARTIAL">PARTIAL</option>
                         <option value="PAID">PAID</option>
                       </select>
                       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <Icons name="ChevronDown" size={14} />
                       </div>
                     </div>
                  </div>
               </div>

               {/* Template Viewer */}
               <div className="bg-white shadow-sm border border-gray-200/60 rounded-sm print:shadow-none print:border-none print:m-0 print:max-w-none w-full max-w-4xl mx-auto overflow-x-auto">
                  <div className="min-w-[800px] print:min-w-full">
                    {renderTemplate()}
                  </div>
               </div>
            </div>
          </div>
        </>
      )}
      
      {isEditOpen && invoice && (
        <EditInvoice 
          open={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          initialData={invoice}
          onSuccess={handleUpdated}
        />
      )}

      {isTemplateModalOpen && (
        <TemplateSelectModal
          open={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          currentTemplate={selectedTemplate}
          onSelect={async (newTemplate) => {
            setSelectedTemplate(newTemplate);
            setIsTemplateModalOpen(false);
            if (invoice) {
               try {
                  await api.put(`/invoices/${invoice.id}`, { template: newTemplate });
                  handleUpdated();
               } catch (e) {
                  console.error(e);
               }
            }
          }}
        />
      )}
    </div>
  );

  if (isPage) {
    return detailPanelContent;
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-16 z-[100] flex items-end justify-center sm:top-16 md:inset-0 md:items-center print-hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      {detailPanelContent}
    </div>
  );
};

export default InvoiceDetail;
