import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import { X, Plus } from "lucide-react";
import ImageUpload from "@/common/ImageUpload";
import Loader from "@/common/Loader";

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CREDIT", label: "Credit" }
];

const paymentStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "PARTIAL", label: "Partially Paid" },
  { value: "PAID", label: "Paid" }
];

const purchaseTypes = [
  { value: "CASH", label: "Walk-in / Cash" },
  { value: "SUPPLIER", label: "Supplier (Credit)" },
  { value: "MARKET", label: "Local Market" },
  { value: "ONLINE", label: "Online" }
];

const statuses = [
  { value: "PENDING", label: "Pending" },
  { value: "RECEIVED", label: "Received (Update Stock)" },
  { value: "CANCELLED", label: "Cancelled" }
];

const EditPurchase = ({ open, onClose, initialData }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const [formData, setFormData] = useState({
    purchaseNumber: "",
    referenceNumber: "",
    purchaseType: "LOCAL",
    supplierId: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
    status: "RECEIVED",
    notes: "",
    subtotal: 0,
    discount: 0,
    tax: 0,
    shippingCharges: 0,
    grandTotal: 0,
    paidAmount: 0,
    dueAmount: 0,
    paidBy: "Company",
    paymentMethodOther: "",
  });

  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitAmount, setSplitAmount] = useState("");
  
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [supRes, invRes] = await Promise.all([
            api.get('/suppliers'),
            api.get('/inventory?limit=500')
          ]);
          setSuppliers(supRes.data.data.map(s => ({ value: s.id, label: s.name })));
          setInventoryItems(invRes.data.data);
          
          if (initialData) {
            setFormData({
              purchaseNumber: initialData.purchaseNumber || "",
              referenceNumber: initialData.referenceNumber || "",
              purchaseType: initialData.purchaseType || "LOCAL",
              supplierId: initialData.supplierId || "",
              purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
              paymentMethod: initialData.paymentMethod || "CASH",
              paymentStatus: initialData.paymentStatus || "PENDING",
              status: initialData.status || "PENDING",
              notes: initialData.notes || "",
              subtotal: parseFloat(initialData.subtotal || 0),
              discount: parseFloat(initialData.discount || 0),
              tax: parseFloat(initialData.tax || 0),
              shippingCharges: parseFloat(initialData.shippingCharges || 0),
              grandTotal: parseFloat(initialData.grandTotal || 0),
              paidAmount: parseFloat(initialData.paidAmount || 0),
              dueAmount: parseFloat(initialData.dueAmount || 0),
              paidBy: initialData.paidBy || "Company",
              paymentMethodOther: initialData.paymentMethodOther || "",
            });
            setInvoiceUrl(initialData.invoiceUrl || "");
            
            const initialItems = Array.isArray(initialData.items) ? initialData.items : (initialData.itemsData || []);
            if (initialItems && initialItems.length > 0) {
              setItems(initialItems.map(item => ({
                id: item.id || Date.now() + Math.random(),
                inventoryItemId: item.inventoryItemId || 'MANUAL',
                itemName: item.itemName || "",
                purchaseUnit: item.purchaseUnit,
                purchaseQuantity: parseFloat(item.quantity || item.purchaseQuantity),
                purchasePrice: parseFloat(item.unitPrice || item.purchasePrice),
                unitCost: parseFloat(item.unitCost || item.unitPrice),
                discount: parseFloat(item.discount || 0),
                tax: parseFloat(item.tax || 0),
                total: parseFloat(item.total),
                selected: false
              })));
            }
          }
        } catch (error) {
          toast.error("Failed to load necessary data");
        } finally {
          setLoadingInitial(false);
        }
      };
      fetchData();
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'supplierId' && value) {
        newData.purchaseType = 'SUPPLIER';
      }
      return newData;
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = newItems[index];
    item[field] = value;

    if (field === 'inventoryItemId') {
      if (value === 'MANUAL') {
        item.purchaseUnit = "Nos";
        item.purchasePrice = 0;
        item.unitCost = 0;
      } else {
        const inv = inventoryItems.find(i => i.id === value);
        if (inv) {
          item.purchaseUnit = inv.purchaseUnit;
          item.purchasePrice = inv.lastPurchasePrice || 0;
          item.unitCost = item.purchasePrice;
        }
      }
    }

    if (['purchaseQuantity', 'purchasePrice', 'discount', 'tax', 'inventoryItemId'].includes(field)) {
      const q = parseFloat(item.purchaseQuantity) || 0;
      const up = parseFloat(item.purchasePrice) || 0;
      const d = parseFloat(item.discount) || 0;
      const t = parseFloat(item.tax) || 0;
      
      item.unitCost = up;
      
      const baseTotal = q * up;
      const afterDiscount = baseTotal - d;
      const taxAmount = (afterDiscount * t) / 100;
      item.total = afterDiscount + taxAmount;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), inventoryItemId: "", itemName: "", purchaseUnit: "Nos", purchaseQuantity: 1, purchasePrice: 0, unitCost: 0, discount: 0, tax: 0, total: 0, selected: false }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const d = parseFloat(formData.discount) || 0;
    const t = parseFloat(formData.tax) || 0; 
    const s = parseFloat(formData.shippingCharges) || 0;
    
    const gt = newSubtotal - d + t + s;
    let paid = parseFloat(formData.paidAmount) || 0;

    if (formData.paymentStatus === 'PAID') {
      paid = gt;
    } else if (formData.paymentStatus === 'PENDING') {
      paid = 0;
    }

    setFormData(prev => ({
      ...prev,
      subtotal: newSubtotal,
      grandTotal: gt,
      paidAmount: paid,
      dueAmount: gt - paid
    }));
  }, [items, formData.discount, formData.tax, formData.shippingCharges, formData.paidAmount, formData.paymentStatus]);

  const handleSplitTotal = () => {
    const amount = parseFloat(splitAmount);
    if (isNaN(amount) || amount <= 0) return toast.error("Enter a valid amount");
    const selectedItems = items.filter(i => i.selected);
    if (selectedItems.length < 2) return toast.error("Select at least 2 items to split");
    
    const totalQty = selectedItems.reduce((sum, item) => sum + (parseFloat(item.purchaseQuantity) || 0), 0);
    if (totalQty === 0) return toast.error("Selected items have no quantity");

    const newItems = [...items];
    newItems.forEach((item) => {
      if (item.selected) {
        const qty = parseFloat(item.purchaseQuantity) || 0;
        const proportion = qty / totalQty;
        const allocatedAmount = amount * proportion;
        const newPrice = qty > 0 ? (allocatedAmount / qty) : 0;
        
        item.purchasePrice = newPrice.toFixed(2);
        
        // Recalculate everything for this item
        const up = parseFloat(item.purchasePrice) || 0;
        const d = parseFloat(item.discount) || 0;
        const t = parseFloat(item.tax) || 0;
        item.unitCost = up;
        const baseTotal = qty * up;
        const afterDiscount = baseTotal - d;
        const taxAmount = (afterDiscount * t) / 100;
        item.total = afterDiscount + taxAmount;
      }
    });
    setItems(newItems);
    setShowSplitModal(false);
    setSplitAmount("");
    toast.success("Total distributed successfully");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (items.some(i => !i.inventoryItemId)) return toast.error("Please select an inventory item for all rows");

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        supplierId: formData.supplierId || undefined,
        paymentMethodOther: formData.paymentMethod === 'OTHER' ? formData.paymentMethodOther : undefined,
        invoiceUrl,
        items: items.map(i => ({
          inventoryItemId: i.inventoryItemId === 'MANUAL' ? null : i.inventoryItemId,
          itemName: i.inventoryItemId === 'MANUAL' ? i.itemName : null,
          purchaseQuantity: i.purchaseQuantity,
          purchaseUnit: i.purchaseUnit,
          usageQuantity: i.purchaseQuantity,
          usageUnit: i.purchaseUnit,
          conversionFactor: 1,
          purchasePrice: i.purchasePrice,
          unitCost: i.unitCost,
          discount: i.discount,
          tax: i.tax,
          total: i.total
        }))
      };

      await api.put(`/purchases/${initialData.id}`, payload);
      toast.success('Purchase updated successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update purchase');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 ${
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
        className={`relative flex flex-col w-full max-w-5xl bg-white shadow-xl rounded-xl h-[95vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Purchase</h2>
            <p className="text-xs text-gray-500 mt-0.5">Update invoice details.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        {isSubmitting && <Loader fullScreen text="Saving Changes..." />}

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8">
              
              {/* Top Section */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="label">Supplier</label>
                  <Input type="select" name="supplierId" value={formData.supplierId} onChange={handleChange} label="No Supplier (Cash/Walk-in)" options={suppliers} />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Purchase Type <span className="required">*</span></label>
                  <Input type="select" name="purchaseType" value={formData.purchaseType} onChange={handleChange} options={purchaseTypes} required />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Purchase Date <span className="required">*</span></label>
                  <Input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">Line Items</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowSplitModal(true)}>
                    Split Total Price
                  </Button>
                </div>
                <div className="space-y-3 mt-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="relative bg-gray-50/50 p-4 md:p-5 rounded-sm border border-gray-200 mb-4 group shadow-sm">
                      <div className="absolute -left-3 -top-3 bg-primary text-white border border-primary rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-sm">
                        {index + 1}
                      </div>
                      <button type="button" onClick={() => removeItem(index)} className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors" disabled={items.length === 1}>
                        <X size={16} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pr-6">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-semibold text-gray-600">Inventory Item <span className="text-red-500">*</span></label>
                          <div className="flex flex-col gap-1">
                            <select 
                              className="input text-sm py-1.5 px-2 w-full"
                              value={item.inventoryItemId}
                              onChange={(e) => handleItemChange(index, 'inventoryItemId', e.target.value)}
                              required
                            >
                              <option value="">Select Item</option>
                              <option value="MANUAL" className="font-semibold text-primary">+ Create New Inventory Item</option>
                              {inventoryItems.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.category})</option>
                              ))}
                            </select>
                            {item.inventoryItemId === 'MANUAL' && (
                              <Input 
                                value={item.itemName}
                                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                placeholder="Enter item name..."
                                required
                                className="text-sm py-1.5 px-2 bg-blue-50/50 mt-2"
                              />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-600">Unit</label>
                          <Input value={item.purchaseUnit} onChange={(e) => handleItemChange(index, 'purchaseUnit', e.target.value)} placeholder="e.g. Box, Roll" disabled={item.inventoryItemId !== 'MANUAL'} className={`text-sm py-1.5 px-2 ${item.inventoryItemId !== 'MANUAL' ? 'bg-gray-100' : ''}`} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-600">Qty <span className="text-red-500">*</span></label>
                          <Input type="number" step="0.01" min="0.01" value={item.purchaseQuantity} onChange={(e) => handleItemChange(index, 'purchaseQuantity', e.target.value)} required className="text-sm py-1.5 px-2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-600">Unit Price <span className="text-red-500">*</span></label>
                          <Input type="number" step="0.01" min="0" value={item.purchasePrice} onChange={(e) => handleItemChange(index, 'purchasePrice', e.target.value)} required className="text-sm py-1.5 px-2" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-600">Discount</label>
                          <Input type="number" step="0.01" min="0" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', e.target.value)} className="text-sm py-1.5 px-2" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-600">Tax (%)</label>
                          <Input type="number" step="0.01" min="0" value={item.tax} onChange={(e) => handleItemChange(index, 'tax', e.target.value)} className="text-sm py-1.5 px-2" />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <label className="text-xs font-semibold text-gray-600">Total Price</label>
                          <div className="text-base font-bold text-gray-800 py-1.5 flex items-center gap-2">
                             Rs. {item.total.toFixed(2)}
                             <input type="checkbox" className="ml-auto" title="Select for split total" checked={item.selected || false} onChange={(e) => handleItemChange(index, 'selected', e.target.checked)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem} leftIcon={(props) => <Icons name="Plus" {...props} size={14} />}>
                  Add Item
                </Button>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="label">Payment Method</label>
                      <Input type="select" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} options={paymentMethods} />
                    </div>
                    {formData.paymentMethod === 'OTHER' && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                        <label className="label">Specify Other Method</label>
                        <Input name="paymentMethodOther" value={formData.paymentMethodOther} onChange={handleChange} required />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="label">Payment Status</label>
                      <Input type="select" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} options={paymentStatuses} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Status (Receiving)</label>
                      <Input 
                        type="select" 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange} 
                        options={statuses}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Paid By</label>
                      <Input name="paidBy" value={formData.paidBy} onChange={handleChange} placeholder="e.g. Company, Owner Name" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2 mt-2">
                      <label className="label">Invoice Attachment</label>
                      <ImageUpload 
                        value={invoiceUrl}
                        onChange={setInvoiceUrl}
                        onUploadStateChange={setUploadingFile}
                        folder="erp/invoices"
                        accept="image/*,.pdf"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Notes / Terms</label>
                    <Input type="textarea" name="notes" value={formData.notes} onChange={handleChange} />
                  </div>
                </div>

                {/* Summary Totals */}
                <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 space-y-3 shadow-inner">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">Rs. {formData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 gap-4">
                    <span>Overall Discount (-)</span>
                    <Input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-24 text-right py-1 text-sm h-8" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 gap-4">
                    <span>Overall Tax (+)</span>
                    <Input type="number" name="tax" value={formData.tax} onChange={handleChange} className="w-24 text-right py-1 text-sm h-8" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 gap-4">
                    <span>Shipping (+)</span>
                    <Input type="number" name="shippingCharges" value={formData.shippingCharges} onChange={handleChange} className="w-24 text-right py-1 text-sm h-8" />
                  </div>
                  
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                    <span>Grand Total</span>
                    <span>Rs. {formData.grandTotal.toFixed(2)}</span>
                  </div>

                  {formData.paymentStatus === "PARTIAL" && (
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-800 pt-2 gap-4">
                      <span>Amount Paid</span>
                      <Input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleChange} className="w-32 text-right font-semibold text-primary py-1 h-9 bg-primary/5 border-primary/20" />
                    </div>
                  )}
                  {formData.paymentStatus === "PAID" && (
                    <div className="flex justify-between text-sm text-emerald-600 items-center pt-3 border-t border-gray-100">
                      <span className="font-semibold">Fully Paid Amount:</span>
                      <span className="font-bold text-lg">Rs. {formData.grandTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-medium text-rose-600 pt-1">
                    <span>Balance Due</span>
                    <span>Rs. {formData.dueAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="shrink-0 border-t border-gray-200 bg-gray-50/80 px-6 py-4 flex justify-end gap-3 backdrop-blur-sm">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting || uploadingFile}>Cancel</Button>
              <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting || uploadingFile}>
                Save Changes
              </Button>
            </div>
          </form>
      </div>

      {/* Split Total Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Split Total Price</h3>
              <p className="text-sm text-gray-500">Distributes lump sum across selected items proportionally by quantity.</p>
            </div>
            <div className="space-y-1.5">
              <label className="label">Lump Sum Total (Rs.)</label>
              <Input type="number" value={splitAmount} onChange={(e) => setSplitAmount(e.target.value)} placeholder="e.g. 5000" autoFocus />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowSplitModal(false); setSplitAmount(""); }}>Cancel</Button>
              <Button type="button" variant="solid" onClick={handleSplitTotal}>Apply Split</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPurchase;
