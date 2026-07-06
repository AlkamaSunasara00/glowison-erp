import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const categoryOptions = [
  { value: "OFFICE_SUPPLIES", label: "Office Supplies" },
  { value: "TRAVEL", label: "Travel" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "SALARY", label: "Salary" },
  { value: "MARKETING", label: "Marketing" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" }
];

const paidToTypeOptions = [
  { value: "OTHER", label: "Other" },
  { value: "SUPPLIER", label: "Supplier" },
  { value: "EMPLOYEE", label: "Employee" },
];

const paymentMethodOptions = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CARD", label: "Card" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTHER", label: "Other" },
];

const AddExpense = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    spentOn: new Date().toISOString().slice(0, 10),
    category: "OFFICE_SUPPLIES",
    categoryOther: "",
    amount: "",
    paidAmount: "",
    paidToType: "OTHER",
    paidToName: "",
    supplierId: "",
    paymentMethod: "CASH",
    status: "PAID",
    referenceNumber: "",
    notes: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      api.get('/suppliers').then(res => {
        const activeSuppliers = res.data.data.filter(s => s.status === 'ACTIVE');
        setSuppliers(activeSuppliers.map(s => ({ value: s.id, label: s.name })));
      }).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadReceipt = async () => {
    if (!file) return null;
    const formDataFile = new FormData();
    formDataFile.append('images', file);
    const res = await api.post('/upload', formDataFile, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.urls[0];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      
      let receiptUrl = null;
      if (file) {
        receiptUrl = await uploadReceipt();
      }

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        receiptUrl
      };
      
      if (payload.paidToType !== 'OTHER') {
        payload.categoryOther = null;
      }
      if (payload.paidToType !== 'SUPPLIER') {
        payload.supplierId = null;
      }

      await api.post('/expenses', payload);
      toast.success('Expense logged successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to log expense');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className={`relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Log Expense</h2>
              <p className="mt-1 text-sm text-gray-500">Record a new business expense.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              
              <div className="space-y-1.5">
                <label className="label">Paid To Type <span className="required">*</span></label>
                <Input type="select" name="paidToType" value={formData.paidToType} onChange={handleChange} options={paidToTypeOptions} required />
              </div>

              {formData.paidToType === 'SUPPLIER' ? (
                <div className="space-y-1.5">
                  <label className="label">Select Supplier <span className="required">*</span></label>
                  <Input type="select" name="supplierId" value={formData.supplierId} onChange={handleChange} options={[{value: "", label: "Select Supplier"}, ...suppliers]} required />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="label">Paid To Name {formData.paidToType === 'EMPLOYEE' && <span className="required">*</span>}</label>
                  <Input name="paidToName" value={formData.paidToName} onChange={handleChange} placeholder={formData.paidToType === 'EMPLOYEE' ? "Employee name" : "Vendor or Entity name"} required={formData.paidToType === 'EMPLOYEE'} />
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="label">Amount (Rs.) <span className="required">*</span></label>
                <Input type="number" name="amount" value={formData.amount} onChange={handleChange} min="0" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Date <span className="required">*</span></label>
                <Input type="date" name="spentOn" value={formData.spentOn} onChange={handleChange} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Category <span className="required">*</span></label>
                <Input type="select" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} required />
              </div>

              {formData.category === 'OTHER' && (
                <div className="space-y-1.5">
                  <label className="label">Specify Category <span className="required">*</span></label>
                  <Input name="categoryOther" value={formData.categoryOther} onChange={handleChange} required />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="label">Payment Method <span className="required">*</span></label>
                <Input type="select" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} options={paymentMethodOptions} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Status <span className="required">*</span></label>
                <Input type="select" name="status" value={formData.status} onChange={handleChange} options={statusOptions} required />
              </div>

              {formData.status === 'PARTIALLY_PAID' && (
                <div className="space-y-1.5">
                  <label className="label">Amount Paid (Rs.) <span className="required">*</span></label>
                  <Input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleChange} min="0" max={formData.amount || undefined} required />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="label">Reference / Txn ID</label>
                <Input name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} placeholder="e.g. UPI ID or Cheque No" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Notes / Description</label>
                <Input type="textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Reason or details of the expense" className="min-h-[60px]" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                 <label className="label">Receipt Upload</label>
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-gray-700"
                 >
                    <Icons name="UploadCloud" size={24} className="mb-2" />
                    <span className="text-sm font-medium">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs mt-1">PDF, JPG, PNG up to 5MB</span>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" />
                 </div>
              </div>
              
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Expense</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
