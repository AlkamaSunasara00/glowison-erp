import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const paymentOptions = [
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
];

const deliveryOptions = [
  { label: "Delivered", value: "delivered" },
  { label: "Pending", value: "pending" },
];

const AddPurchase = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    vendor: "",
    date: "",
    items: "",
    total: "",
    tax: "",
    paymentStatus: "pending",
    deliveryStatus: "pending",
  });

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        supplierName: formData.vendor,
        material: formData.items || "Multiple Items",
        quantity: 1, // Defaulting to 1 as UI doesn't have it
        amount: Number(formData.total),
        paymentStatus: formData.paymentStatus.toUpperCase(),
        deliveryStatus: formData.deliveryStatus.toUpperCase(),
        purchaseDate: formData.date
      };

      await api.post('/purchases', payload);
      toast.success('Purchase recorded successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to record purchase');
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
        className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Record Purchase</h2>
              <p className="mt-1 text-sm text-gray-500">Add a new raw material purchase order.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Vendor Name <span className="required">*</span></label>
                <Input name="vendor" value={formData.vendor} onChange={handleChange} required />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">Purchase Date <span className="required">*</span></label>
                <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Total Amount (Rs.) <span className="required">*</span></label>
                <Input type="number" name="total" value={formData.total} onChange={handleChange} min="0" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Tax (Rs.)</label>
                <Input type="number" name="tax" placeholder="e.g. 500" value={formData.tax} onChange={handleChange} min="0" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Items Description</label>
                <Input name="items" value={formData.items} onChange={handleChange} placeholder="e.g. MDF Sheet 6mm x 50, Glue x 5" className="min-h-[60px]" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Payment Status <span className="required">*</span></label>
                <Input type="select" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} options={paymentOptions} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Delivery Status <span className="required">*</span></label>
                <Input type="select" name="deliveryStatus" value={formData.deliveryStatus} onChange={handleChange} options={deliveryOptions} required />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                 <label className="label">Invoice / Receipt Upload</label>
                 <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-gray-700">
                    <Icons name="UploadCloud" size={24} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs mt-1">PDF, JPG, PNG up to 10MB</span>
                 </div>
              </div>
              
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Purchase</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchase;
