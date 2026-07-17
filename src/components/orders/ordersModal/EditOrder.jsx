import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import CustomerPicker from "@/common/CustomerPicker";
import CatalogPicker from "@/common/CatalogPicker";
import api from "@/lib/api";
import toast from "react-hot-toast";
import ImageUpload from "@/common/ImageUpload";

const orderTypeOptions = [
  { label: "Retail/Dealer", value: "Retail/Dealer" },
  { label: "Online", value: "Online" },
];

const sourceOptions = [
  { label: "Walkin", value: "Walkin" },
  { label: "Website", value: "Website" },
  { label: "Meesho", value: "Meesho" },
  { label: "Amazon", value: "Amazon" },
  { label: "Instagram", value: "Instagram" },
  { label: "Other", value: "Other" },
];

const EditOrder = ({ open, onClose, initialData, isPage = false }) => {
  const router = useRouter();
  const [orderType, setOrderType] = useState("Retail/Dealer");
  const [customerId, setCustomerId] = useState("");
  const [onlineData, setOnlineData] = useState({ source: "Website", otherSource: "", name: "", phone: "" });
  const [lineItems, setLineItems] = useState([{ id: Date.now(), name: "", sku: "", qty: 1, price: 0, size: "", color: "", unit: "inch", taxPercent: "", imageUrl: "" }]);
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const typeStr = initialData.type || '';
      const isOnline = typeStr.toUpperCase() === 'ONLINE' || typeStr === 'Online';
      setOrderType(isOnline ? 'Online' : 'Retail/Dealer');
      
      if (isOnline) {
        setOnlineData({
          source: initialData.onlineSource || initialData.source || "Website",
          otherSource: initialData.onlineSourceOther || "",
          name: initialData.buyerName || initialData.customer || "",
          phone: initialData.buyerContact || initialData.phone || "",
        });
      } else {
        setCustomerId(initialData.customerId || (initialData.customer?.id) || ""); 
      }
      setNotes(initialData.note || "");
      
      let pStatus = (initialData.paymentStatus || "UNPAID").toUpperCase();
      if (pStatus.includes("PARTIAL")) pStatus = "PARTIAL";
      setPaymentStatus(pStatus);
      
      // Extract numeric amount paid
      let amtPaid = initialData.amountPaid || "";
      if (typeof amtPaid === 'string' && amtPaid.startsWith('Rs.')) {
        amtPaid = amtPaid.replace(/Rs.\s|,/g, '');
      }
      setAmountPaid(amtPaid);
      
      const itemsToLoad = initialData.itemsList || initialData.items;
      if (itemsToLoad && Array.isArray(itemsToLoad) && itemsToLoad.length > 0) {
        setLineItems(itemsToLoad.map(item => ({
          id: item.id || Date.now() + Math.random(),
          name: item.product || item.name || "",
          sku: item.sku || "",
          qty: item.qty !== undefined ? item.qty : 1,
          price: item.unitPrice !== undefined ? item.unitPrice : (item.price || 0),
          pricePerUnit: item.pricePerInch || "",
          size: item.size || "",
          color: item.color || "",
          unit: item.unit || "inch",
          taxPercent: item.taxRate !== undefined ? item.taxRate : (item.taxPercent || ""),
          imageUrl: item.imageUrl || "",
          priceType: "Custom",
          retailPrice: 0,
          dealerPrice: 0
        })));
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!open && !isPage) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, isPage]);

  const handleClose = () => {
    if (isPage) router.push('/orders');
    else onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        type: orderType === "Retail/Dealer" ? "RETAIL_DEALER" : "ONLINE",
        customerId: orderType === "Retail/Dealer" ? customerId : undefined,
        note: notes,
        total: calculateTotal(),
        paymentStatus,
        amountPaid: paymentStatus === "PAID" ? calculateTotal() : (paymentStatus === "PARTIAL" ? Number(amountPaid) : 0),
        onlineSource: orderType === "Online" ? (onlineData.source.toUpperCase() === "OTHER" ? "OTHER" : onlineData.source.toUpperCase()) : undefined,
        onlineSourceOther: orderType === "Online" && onlineData.source === "Other" ? onlineData.otherSource : undefined,
        buyerName: orderType === "Online" ? onlineData.name : undefined,
        buyerContact: orderType === "Online" ? onlineData.phone : undefined,
        items: lineItems.map(item => ({
          product: item.name,
          sku: item.sku || null,
          qty: Number(item.qty),
          unitPrice: Number(item.price),
          pricePerInch: item.pricePerUnit ? Number(item.pricePerUnit) : null,
          taxRate: item.taxPercent ? Number(item.taxPercent) : 0,
          unit: item.unit,
          size: item.size || null,
          color: item.color || null,
          imageUrl: item.imageUrl || null
        }))
      };

      await api.put(`/orders/${initialData.id}`, payload);
      toast.success('Order updated successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to update order');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), name: "", sku: "", size: "", color: "", qty: 1, price: 0, pricePerUnit: "", unit: "inch", taxPercent: "", imageUrl: "", priceType: "Custom", retailPrice: 0, dealerPrice: 0 }
    ]);
  };

  const handleRemoveLineItem = (id) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      if (field === 'priceType') {
         if (value === 'Retail' && updated.retailPrice) updated.price = updated.retailPrice;
         if (value === 'Dealer' && updated.dealerPrice) updated.price = updated.dealerPrice;
      }
      return updated;
    }));
  };

  const handleCatalogSelect = (id, value, data) => {
     if (!data || data.__isNew__) {
        setLineItems(prev => prev.map(item => item.id === id ? { ...item, name: value, priceType: "Custom", retailPrice: 0, dealerPrice: 0 } : item));
        return;
     }
     
     setLineItems(prev => prev.map(item => item.id === id ? { 
        ...item, 
        name: data.name,
        sku: data.sku || "",
        size: data.size || "",
        color: data.color || "",
        unit: data.unit || "piece",
        taxPercent: data.taxPercent || "",
        imageUrl: data.imageUrl || "",
        retailPrice: data.retailPrice || 0,
        dealerPrice: data.dealerPrice || 0,
        priceType: "Retail",
        price: data.retailPrice || 0
     } : item));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  };
  const calculateTax = () => {
    return lineItems.reduce((sum, item) => sum + ((Number(item.qty) * Number(item.price)) * (Number(item.taxPercent) / 100)), 0);
  };
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const formContent = (
        <form onSubmit={handleSubmit} className={isPage ? "flex flex-col w-full h-full" : "flex h-full min-h-0 flex-col"}>
          <div className={isPage ? "sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between" : "shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50"}>
            <div className={isPage ? "flex items-center gap-4" : ""}>
              {isPage && (
                <button type="button" onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors shrink-0">
                  <Icons name="ArrowLeft" size={20} />
                </button>
              )}
              <div>
                <h2 className={isPage ? "page-header text-xl" : "text-base font-semibold text-gray-900"}>Edit Order</h2>
                <p className={isPage ? "text-sm text-gray-500 mt-0.5" : "mt-1 text-sm text-gray-500"}>Update order details.</p>
              </div>
            </div>
            {isPage ? (
              <div className="flex items-center gap-3">
                <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
                <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Changes</Button>
              </div>
            ) : (
              <button type="button" onClick={handleClose}>
                <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>

          <div className={isPage ? "flex-1 w-full mx-auto px-4 py-8 md:px-8 bg-gray-50/50" : "min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar"}>
            <div className={isPage ? "max-w-5xl mx-auto space-y-6 lg:space-y-8" : ""}>

            {/* Customer Details */}
            <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50/30">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                   <div className="flex gap-4">
                      {orderTypeOptions.map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="orderType" value={opt.value} checked={orderType === opt.value} onChange={() => setOrderType(opt.value)} className="text-primary focus:ring-primary h-4 w-4" />
                          <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                   </div>
                </div>

                {orderType === "Retail/Dealer" ? (
                  <div className="md:col-span-2 space-y-1.5">
                    <CustomerPicker 
                      label="Select Customer"
                      value={customerId}
                      onChange={(val) => setCustomerId(val)}
                      required
                      size={isPage ? "lg" : "md"}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="label">Online Source <span className="required">*</span></label>
                      <Input size={isPage ? "lg" : "md"} type="select" options={sourceOptions} value={onlineData.source} onChange={(e) => setOnlineData({...onlineData, source: e.target.value})} required />
                    </div>
                    {onlineData.source === "Other" && (
                      <div className="space-y-1.5">
                        <label className="label">Specify Source <span className="required">*</span></label>
                        <Input size={isPage ? "lg" : "md"} value={onlineData.otherSource} onChange={(e) => setOnlineData({...onlineData, otherSource: e.target.value})} required />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="label">Buyer Name <span className="required">*</span></label>
                      <Input size={isPage ? "lg" : "md"} value={onlineData.name} onChange={(e) => setOnlineData({...onlineData, name: e.target.value})} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Buyer Phone</label>
                      <Input size={isPage ? "lg" : "md"} value={onlineData.phone} onChange={(e) => setOnlineData({...onlineData, phone: e.target.value})} />
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Line Items */}
            <div className="mb-6 p-4 rounded-xl border border-gray-100">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-semibold text-gray-800">Line Items</h3>
               </div>
               
               <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="relative bg-gray-50/50 p-4 md:p-5 rounded-sm border border-gray-200 mb-4 group shadow-sm">
                       <div className="absolute -left-3 -top-3 bg-primary text-white border border-primary rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-sm">
                         {index + 1}
                       </div>
                       <button type="button" onClick={() => handleRemoveLineItem(item.id)} className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors" disabled={lineItems.length === 1}>
                         <Icons name="X" size={16} />
                       </button>

                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pr-6">
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Product Name <span className="text-red-500">*</span></label>
                           <CatalogPicker size={isPage ? "lg" : "md"} value={item.name} onChange={(val, data) => handleCatalogSelect(item.id, val, data)} />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">SKU (Optional)</label>
                           <Input size={isPage ? "lg" : "md"} placeholder="E.g. SK-123" value={item.sku} onChange={(e) => handleLineItemChange(item.id, 'sku', e.target.value)} />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Size</label>
                           <Input size={isPage ? "lg" : "md"} placeholder="E.g. 6mm" value={item.size} onChange={(e) => handleLineItemChange(item.id, 'size', e.target.value)} />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Color</label>
                           <Input size={isPage ? "lg" : "md"} placeholder="E.g. Red" value={item.color} onChange={(e) => handleLineItemChange(item.id, 'color', e.target.value)} />
                         </div>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Pricing Unit</label>
                           <Input size="md" type="select" options={[{label: "Inch", value: "inch"}, {label: "Sq Ft", value: "sqft"}, {label: "Piece", value: "piece"}, {label: "Feet", value: "feet"}]} value={item.unit} onChange={(e) => handleLineItemChange(item.id, 'unit', e.target.value)} />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Price Type</label>
                           <Input size="md" type="select" options={[{label: "Retail", value: "Retail"}, {label: "Dealer", value: "Dealer"}, {label: "Custom", value: "Custom"}]} value={item.priceType} onChange={(e) => handleLineItemChange(item.id, 'priceType', e.target.value)} />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Price / {item.unit === 'sqft' ? 'Sq Ft' : item.unit === 'piece' ? 'Piece' : item.unit === 'feet' ? 'Feet' : 'Inch'} (Info)</label>
                           <Input size="md" type="number" min="0" placeholder="e.g. 15" value={item.pricePerUnit} onChange={(e) => handleLineItemChange(item.id, 'pricePerUnit', e.target.value)} />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Qty <span className="text-red-500">*</span></label>
                           <Input size="md" type="number" min="1" placeholder="1" value={item.qty} onChange={(e) => handleLineItemChange(item.id, 'qty', e.target.value)} required />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Unit Price <span className="text-red-500">*</span></label>
                           <Input size="md" type="number" min="0" placeholder="0.00" value={item.price} onChange={(e) => { handleLineItemChange(item.id, 'priceType', 'Custom'); handleLineItemChange(item.id, 'price', e.target.value); }} required />
                         </div>
                         <div className="w-full space-y-1.5">
                           <label className="text-xs font-semibold text-gray-600">Tax %</label>
                           <Input size="md" type="number" min="0" placeholder="e.g. 18" value={item.taxPercent} onChange={(e) => handleLineItemChange(item.id, 'taxPercent', e.target.value)} />
                         </div>
                       </div>
                       
                       <div className="mt-3 w-40">
                         <ImageUpload 
                           value={item.imageUrl} 
                           onChange={(url) => handleLineItemChange(item.id, 'imageUrl', url)} 
                           folder="erp/orders" 
                         />
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                 <Button type="button" variant="solid" onClick={handleAddLineItem} leftIcon={(props) => <Icons name="Plus" {...props} />}>Add Another Item</Button>
               </div>
            </div>

               {/* Summary */}
               <div className="mt-4 flex justify-end">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 min-w-[200px]">
                     <div className="flex justify-between text-sm font-semibold text-gray-800">
                         <span>Subtotal:</span>
                        <span>Rs. {calculateSubtotal().toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Total Tax:</span>
                        <span>Rs. {calculateTax().toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-base font-bold text-gray-900 mt-3 pt-3 border-t border-gray-200">
                        <span>Total:</span>
                        <span>Rs. {calculateTotal().toLocaleString()}</span>
                     </div>
                  </div>
               </div>

            {/* Payment Details */}
            <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50/30">
               <h3 className="text-sm font-semibold text-gray-800 mb-4">Payment</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-semibold text-gray-600">Payment Status</label>
                   <Input size="md" type="select" options={[{label: "Unpaid", value: "UNPAID"}, {label: "Partially Paid", value: "PARTIAL"}, {label: "Fully Paid", value: "PAID"}]} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} />
                 </div>
                 {paymentStatus === "PARTIAL" && (
                   <div className="space-y-1.5 animate-fade-in">
                     <label className="text-xs font-semibold text-gray-600">Amount Paid <span className="text-red-500">*</span></label>
                     <Input size="md" type="number" min="0" placeholder="e.g. 500" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} required />
                   </div>
                 )}
               </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="label">Order Notes</label>
              <Input size="md" type="textarea" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[80px]" placeholder="Add any special instructions..." />
            </div>

           </div>
          </div>

          {!isPage && (
            <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
              <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Changes</Button>
            </div>
          )}
        </form>
  );

  if (isPage) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gray-50/30 animate-fade-in">
        {formContent}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-16 z-[1000] flex items-start justify-center p-4 md:inset-0 md:items-center md:p-6 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] ${
          open ? "animate-overlay-in" : "animate-overlay-out"
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        {formContent}
      </div>
    </div>
  );
};

export default EditOrder;
