import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import CustomerPicker from "@/common/CustomerPicker";

const statusOptions = [
  { label: "Draft", value: "Draft" },
  { label: "Sent", value: "Sent" },
  { label: "Accepted", value: "Accepted" },
  { label: "Rejected", value: "Rejected" },
];

const typeOptions = [
  { label: "Customer", value: "Customer" },
  { label: "Lead", value: "Lead" },
];

const AddQuotation = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    type: "Customer",
    date: "",
    status: "Draft",
    notes: "",
  });
  const [entityId, setEntityId] = useState("");
  const [lineItems, setLineItems] = useState([{ id: Date.now(), name: "", qty: 1, rate: 0, unit: "inch", taxPercent: "" }]);
  const [leads, setLeads] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch leads for the picker
    api.get('/leads?limit=200').then(res => {
      setLeads(res.data.data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!entityId) {
      toast.error(`Please select a ${formData.type}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        type: formData.type.toUpperCase(),
        entityId: entityId,
        productName: lineItems[0]?.name || "Quotation",
        items: lineItems,
        estimatedPrice: calculateTotal(),
        status: formData.status.toUpperCase()
      };

      await api.post('/quotations', payload);
      toast.success('Quotation created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create quotation');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, { id: Date.now(), name: "", qty: 1, rate: 0, unit: "inch", taxPercent: "" }]);
  };

  const handleRemoveLineItem = (id) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.rate)), 0);
  const calculateTax = () => lineItems.reduce((sum, item) => sum + ((Number(item.qty) * Number(item.rate)) * (Number(item.taxPercent) / 100)), 0);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

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
              <h2 className="text-base font-semibold text-gray-900">Create Quotation</h2>
              <p className="mt-1 text-sm text-gray-500">Generate a new estimate.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            
            <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="label">Quotation For <span className="required">*</span></label>
                  <Input type="select" options={typeOptions} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} required />
                </div>

                <div className="space-y-1.5">
                  {formData.type === "Customer" ? (
                    <CustomerPicker 
                      label="Select Customer *"
                      value={entityId}
                      onChange={(val) => setEntityId(val)}
                      required
                    />
                  ) : (
                    <>
                      <label className="label">Select Lead <span className="required">*</span></label>
                      <Input type="select" options={[{label: "Select a lead...", value: ""}, ...leads.map(l => ({label: `${l.name} - ${l.phone}`, value: l.id}))]} value={entityId} onChange={(e) => setEntityId(e.target.value)} required />
                    </>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="label">Status <span className="required">*</span></label>
                  <Input type="select" options={statusOptions} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required />
                </div>

                <div className="space-y-1.5">
                  <label className="label">Date <span className="required">*</span></label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6 p-4 rounded-xl border border-gray-100">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-semibold text-gray-800">Estimated Items</h3>
                 <Button type="button" variant="ghost" size="sm" onClick={handleAddLineItem} leftIcon={(props) => <Icons name="Plus" {...props} />} className="text-primary">Add Item</Button>
               </div>
               
               <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                       <div className="flex-1 w-full space-y-1.5">
                         {index === 0 && <label className="text-xs font-semibold text-gray-600">Product / Service Description</label>}
                         <Input placeholder="Description" value={item.name} onChange={(e) => handleLineItemChange(item.id, 'name', e.target.value)} required />
                       </div>
                       <div className="w-full md:w-20 space-y-1.5">
                         {index === 0 && <label className="text-xs font-semibold text-gray-600">Qty</label>}
                         <Input type="number" min="1" value={item.qty} onChange={(e) => handleLineItemChange(item.id, 'qty', e.target.value)} required />
                       </div>
                       <div className="w-full md:w-24 space-y-1.5">
                         {index === 0 && <label className="text-xs font-semibold text-gray-600">Unit Type</label>}
                         <Input type="select" options={[{label: "Inch", value: "inch"}, {label: "Sq Ft", value: "sqft"}, {label: "Piece", value: "piece"}]} value={item.unit} onChange={(e) => handleLineItemChange(item.id, 'unit', e.target.value)} />
                       </div>
                       <div className="w-full md:w-28 space-y-1.5">
                         {index === 0 && <label className="text-xs font-semibold text-gray-600">Price / Unit</label>}
                         <Input type="number" min="0" value={item.rate} onChange={(e) => handleLineItemChange(item.id, 'rate', e.target.value)} required />
                       </div>
                       <div className="w-full md:w-20 space-y-1.5">
                         {index === 0 && <label className="text-xs font-semibold text-gray-600">Tax %</label>}
                         <Input type="number" min="0" placeholder="e.g. 18" value={item.taxPercent} onChange={(e) => handleLineItemChange(item.id, 'taxPercent', e.target.value)} />
                       </div>
                       <div className="pb-1">
                          <button type="button" onClick={() => handleRemoveLineItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded bg-white border border-gray-200 shadow-sm transition-colors" disabled={lineItems.length === 1}>
                            <Icons name="Trash2" size={16} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-4 flex justify-end">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 min-w-[250px] space-y-2">
                     <div className="flex justify-between text-base font-bold text-gray-900">
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
            </div>

            <div className="space-y-1.5">
              <label className="label">Notes / Terms</label>
              <Input type="textarea" name="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="min-h-[80px]" placeholder="Add any terms and conditions..." />
            </div>

          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Create Quotation</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuotation;
