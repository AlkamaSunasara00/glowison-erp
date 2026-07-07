import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import CustomerPicker from "@/common/CustomerPicker";

const statusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Sent", value: "SENT" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Cancelled", value: "CANCELLED" },
];

const paymentStatusOptions = [
  { label: "Pending", value: "UNPAID" },
  { label: "Partially Paid", value: "PARTIAL" },
  { label: "Paid", value: "PAID" },
];

const paymentMethodOptions = [
  { label: "None", value: "" },
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Card", value: "CARD" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Other", value: "OTHER" },
];

const AddInvoice = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    status: "DRAFT",
    paymentStatus: "UNPAID",
    paymentMethod: "",
    notes: "",
    shippingCharges: 0,
    paidAmount: 0,
  });
  
  const [customerId, setCustomerId] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [lineItems, setLineItems] = useState([{ id: Date.now(), product: "", description: "", quantity: 1, unit: "Piece", unitPrice: 0, discount: 0, taxRate: 0 }]);

  const [availableOrders, setAvailableOrders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customerId) {
      api.get(`/orders?customerId=${customerId}`).then(res => {
        setAvailableOrders(res.data.data || []);
      }).catch(console.error);
    } else {
      setAvailableOrders([]);
    }
  }, [customerId]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (formData.paymentStatus === "UNPAID") {
      setFormData(prev => ({ ...prev, paidAmount: 0 }));
    }
  }, [formData.paymentStatus]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    const calculatedItems = lineItems.map(item => {
      const subtotal = (Number(item.quantity) * Number(item.unitPrice)) - Number(item.discount);
      const taxAmount = subtotal * (Number(item.taxRate) / 100);
      return {
        ...item,
        taxAmount,
        lineTotal: subtotal + taxAmount
      };
    });

    try {
      setIsSubmitting(true);
      
      let finalPaidAmount = Number(formData.paidAmount || 0);
      const grandTotal = calculateGrandTotal();
      
      if (formData.paymentStatus === "PAID") {
        finalPaidAmount = grandTotal;
      }

      const payload = {
        ...formData,
        paidAmount: finalPaidAmount,
        template: "classic", // Default template assigned here silently
        customerId,
        orderId: selectedOrders[0] || null,
        items: calculatedItems,
        subtotal: calculateSubtotal(),
        discount: calculateTotalDiscount(),
        tax: calculateTotalTax(),
        grandTotal: grandTotal,
        dueAmount: grandTotal - finalPaidAmount,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        paymentMethod: formData.paymentMethod || null
      };
      
      await api.post('/invoices', payload);
      toast.success('Invoice created successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create invoice');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, { id: Date.now(), product: "", description: "", quantity: 1, unit: "Piece", unitPrice: 0, discount: 0, taxRate: 0 }]);
  };

  const handleRemoveLineItem = (id) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const calculateTotalDiscount = () => lineItems.reduce((sum, item) => sum + Number(item.discount), 0);
  const calculateTotalTax = () => lineItems.reduce((sum, item) => {
    const sub = (Number(item.quantity) * Number(item.unitPrice)) - Number(item.discount);
    return sum + (sub * (Number(item.taxRate) / 100));
  }, 0);
  const calculateGrandTotal = () => (calculateSubtotal() - calculateTotalDiscount()) + calculateTotalTax() + Number(formData.shippingCharges || 0);

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
        onClick={onClose}
      />

      <div
        className={`relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Create Invoice</h2>
              <p className="mt-1 text-sm text-gray-500">Generate a professional ERP invoice.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            
            <div className="mb-8 p-5 rounded-xl border border-gray-100 bg-gray-50/30">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-3">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5 md:col-span-3">
                  <CustomerPicker 
                    label="Select Customer *"
                    value={customerId}
                    onChange={(val) => {
                      setCustomerId(val);
                      setSelectedOrders([]);
                      setLineItems([{ id: Date.now(), product: "", description: "", quantity: 1, unit: "Piece", unitPrice: 0, discount: 0, taxRate: 0 }]);
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-3">
                  <label className="label">Link Orders (Optional)</label>
                  <div className="flex flex-col gap-2 max-h-[140px] overflow-auto border border-gray-200 rounded-lg p-3 bg-white">
                    {availableOrders.length === 0 ? (
                      <span className="text-sm text-gray-400 py-2">No pending orders for this customer</span>
                    ) : (
                      availableOrders.map(order => (
                        <label key={order.id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer p-2 hover:bg-primary/5 rounded-md border border-transparent hover:border-primary/20 transition-all">
                          <input 
                            type="checkbox" 
                            checked={selectedOrders.includes(order.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedOrders(prev => {
                                const newOrders = checked ? [...prev, order.id] : prev.filter(id => id !== order.id);
                                if (checked) {
                                  const orderItems = order.items && order.items.length > 0
                                    ? order.items.map(it => ({ 
                                        id: Date.now() + Math.random(), 
                                        orderId: order.id, 
                                        product: it.product,
                                        description: "",
                                        quantity: it.qty, 
                                        unit: it.unit || "Piece",
                                        unitPrice: Number(it.unitPrice), 
                                        discount: 0,
                                        taxRate: Number(it.taxRate) || 0 
                                      }))
                                    : [{ 
                                        id: Date.now() + Math.random(), 
                                        orderId: order.id, 
                                        product: `Order ORD-${String(order.orderNumber).padStart(6, '0')}`,
                                        description: "", 
                                        quantity: 1, 
                                        unit: "Piece",
                                        unitPrice: Number(order.total) || 0,
                                        discount: 0, 
                                        taxRate: 0 
                                      }];
                                  
                                  setLineItems(currentItems => {
                                    const cleanItems = (currentItems.length === 1 && !currentItems[0].product) 
                                      ? [] 
                                      : currentItems;
                                    
                                    const existingOrderItems = cleanItems.filter(i => i.orderId === order.id);
                                    if (existingOrderItems.length > 0) return cleanItems;

                                    return [...cleanItems, ...orderItems];
                                  });
                                } else {
                                  setLineItems(currentItems => currentItems.filter(item => item.orderId !== order.id));
                                }
                                return newOrders;
                              });
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                          />
                          <span className="font-semibold text-gray-900">ORD-{String(order.orderNumber).padStart(6, '0')}</span>
                          <span className="text-gray-500">— Rs. {order.total}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="label">Invoice Date <span className="required">*</span></label>
                  <Input type="date" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} required />
                </div>

                <div className="space-y-1.5">
                  <label className="label">Due Date</label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="label">Invoice Status <span className="required">*</span></label>
                  <Input type="select" options={statusOptions} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required />
                </div>

                <div className="space-y-1.5">
                  <label className="label">Payment Status</label>
                  <Input type="select" options={paymentStatusOptions} value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="label">Payment Method</label>
                  <Input type="select" options={paymentMethodOptions} value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Line Items - Card Style */}
            <div className="mb-8 p-5 rounded-xl border border-gray-200">
               <div className="flex items-center justify-between mb-5">
                 <h3 className="text-sm font-semibold text-gray-800">Invoice Items</h3>
                 <Button type="button" variant="solid" size="sm" onClick={handleAddLineItem} leftIcon={(props) => <Icons name="Plus" color="white" {...props} />} className="text-white">Add Item</Button>
               </div>
               
               <div className="space-y-3">
                  {lineItems.map((item, index) => {
                    const lineSub = (Number(item.quantity) * Number(item.unitPrice)) - Number(item.discount);
                    const lineTax = lineSub * (Number(item.taxRate) / 100);
                    const lineTotal = lineSub + lineTax;
                    
                    return (
                      <div key={item.id} className="relative bg-gray-50/50 p-4 md:p-5 rounded-xl border border-gray-200 mb-4 group shadow-sm">
                         <div className="absolute -left-3 -top-3 bg-white text-gray-500 border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-sm">
                           {index + 1}
                         </div>
                         <button type="button" onClick={() => handleRemoveLineItem(item.id)} className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors" disabled={lineItems.length === 1}>
                           <Icons name="X" size={16} />
                         </button>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-6">
                           <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-600">Product / Service <span className="text-red-500">*</span></label>
                             <Input placeholder="Product name" value={item.product} onChange={(e) => handleLineItemChange(item.id, 'product', e.target.value)} required />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-600">Description</label>
                             <Input placeholder="Description (Optional)" value={item.description} onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)} />
                           </div>
                         </div>

                         <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                           <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-600">Qty <span className="text-red-500">*</span></label>
                             <Input type="number" min="1" step="any" value={item.quantity} onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)} required />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-600">Unit <span className="text-red-500">*</span></label>
                             <Input placeholder="e.g. Pc, Kg" value={item.unit} onChange={(e) => handleLineItemChange(item.id, 'unit', e.target.value)} required />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-600">Price (Rs.) <span className="text-red-500">*</span></label>
                             <Input type="number" min="0" step="any" value={item.unitPrice} onChange={(e) => handleLineItemChange(item.id, 'unitPrice', e.target.value)} required />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-600">Discount</label>
                             <Input type="number" min="0" step="any" value={item.discount} onChange={(e) => handleLineItemChange(item.id, 'discount', e.target.value)} />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-600">Tax %</label>
                             <Input type="number" min="0" step="any" placeholder="18" value={item.taxRate} onChange={(e) => handleLineItemChange(item.id, 'taxRate', e.target.value)} />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-gray-600">Total (Rs.)</label>
                             <div className="h-9 px-3 flex items-center justify-end bg-gray-100 rounded-lg border border-gray-200 text-gray-800 font-semibold text-sm">
                               {lineTotal.toFixed(2)}
                             </div>
                           </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="label text-sm font-semibold text-gray-800">Notes / Terms</label>
                  <Input type="textarea" name="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="min-h-[140px]" placeholder="Add any terms and conditions, bank details, or notes to the customer..." />
                </div>
              </div>
              
              <div className="flex flex-col lg:items-end">
                <div className="bg-white px-6 py-5 rounded-xl border border-gray-200 min-w-full lg:min-w-[320px] shadow-sm space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-medium text-gray-800">Rs. {calculateSubtotal().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Total Discount:</span>
                      <span>- Rs. {calculateTotalDiscount().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Tax:</span>
                      <span className="font-medium text-gray-800">+ Rs. {calculateTotalTax().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 items-center">
                      <span>Shipping Charge:</span>
                      <div className="w-28">
                        <Input type="number" min="0" step="any" className="!h-8 text-sm !py-1 text-right" value={formData.shippingCharges} onChange={(e) => setFormData({...formData, shippingCharges: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-4 mt-2">
                      <span>Grand Total:</span>
                      <span>Rs. {calculateGrandTotal().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>

                    {/* Conditional Amount Paid Input */}
                    {formData.paymentStatus === "PARTIAL" && (
                      <div className="flex justify-between text-sm text-primary items-center pt-3 mt-2 border-t border-gray-100">
                        <span className="font-semibold">Partially Paid Amount:</span>
                        <div className="w-28">
                          <Input type="number" min="0" step="any" className="!h-8 text-sm !py-1 text-right text-primary font-bold bg-primary/5" value={formData.paidAmount} onChange={(e) => setFormData({...formData, paidAmount: e.target.value})} />
                        </div>
                      </div>
                    )}
                    {formData.paymentStatus === "PAID" && (
                      <div className="flex justify-between text-sm text-emerald-600 items-center pt-3 mt-2 border-t border-gray-100">
                        <span className="font-semibold">Fully Paid Amount:</span>
                        <span className="font-bold text-lg">Rs. {calculateGrandTotal().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-semibold text-gray-800 border-t border-gray-200 pt-3">
                      <span>Balance Due:</span>
                      <span>Rs. {(calculateGrandTotal() - (formData.paymentStatus === "PAID" ? calculateGrandTotal() : Number(formData.paidAmount || 0))).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                </div>
              </div>
            </div>

          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Invoice</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvoice;
