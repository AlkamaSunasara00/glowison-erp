import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import ImageUpload from "@/common/ImageUpload";
import Loader from "@/common/Loader";

const customerTypeOptions = [
  { label: "Retail", value: "Retail" },
  { label: "Wholesale (Dealer)", value: "Wholesale" },
  { label: "Enterprise", value: "Enterprise" },
];

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  type: "Retail",
  gstin: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

const AddCustomer = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [imageUrl, setImageUrl] = useState("");

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
        name: formData.name,
        type: formData.type.toUpperCase(),
        phone: formData.phone,
        email: formData.email || undefined,
        gstin: formData.gstin || undefined,
        address: JSON.stringify({
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }),
        notes: formData.notes,
        imageUrl: imageUrl || undefined
      };

      await api.post('/customers', payload);
      toast.success('Customer added successfully');
      setFormData(initialFormData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to add customer');
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
        className={`relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-sm border border-gray-100 bg-white shadow-2xl md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        {isSubmitting && <Loader fullScreen text="Saving Customer..." />}
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-gray-100/80 px-7 py-5 flex items-center justify-between bg-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Add new customer</h2>
              <p className="mt-1 text-xs font-medium text-gray-500">Add a new retail or dealer customer.</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Customer Profile Image</label>
                <ImageUpload 
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="erp/customers"
                  variant="avatar"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Customer Name <span className="required">*</span></label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Acme Corporation or John Doe" required />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">Customer Type <span className="required">*</span></label>
                <Input type="select" name="type" value={formData.type} onChange={handleChange} options={customerTypeOptions} required />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">GSTIN (Optional)</label>
                <Input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="e.g. 22AAAAA0000A1Z5" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Phone <span className="required">*</span></label>
                <Input name="phone" value={formData.phone} onChange={handleChange} type="tel" pattern="[0-9]{10}" minLength={10} maxLength={10} title="Phone number must be exactly 10 digits" onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }} placeholder="e.g. 9876543210" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Email</label>
                <Input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="e.g. contact@example.com" />
              </div>
              
              <div className="md:col-span-2 mt-2">
                <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-3">Address Information</h3>
              </div>


              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Address Line 1</label>
                <Input type="textarea" name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="e.g. Shop No. 12, Main Street" className="min-h-[80px]" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Address Line 2</label>
                <Input name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="e.g. Near Landmark" />
              </div>

              <div className="space-y-1.5">
                <label className="label">City</label>
                <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" />
              </div>

              <div className="space-y-1.5">
                <label className="label">State</label>
                <Input name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Pincode</label>
                <Input name="pincode" value={formData.pincode} onChange={handleChange} pattern="[0-9]{6}" minLength={6} maxLength={6} onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }} placeholder="e.g. 400001" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Notes</label>
                <Input type="textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional information..." className="min-h-[80px]" />
              </div>

            </div>
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-7 py-5 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting} className="rounded-sm shadow-sm bg-white border-gray-200 hover:bg-gray-50 px-4 py-2 font-semibold">Cancel</Button>
            <Button variant="solid" type="submit" disabled={isSubmitting} className="rounded-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 px-5 py-2 font-semibold">Save customer</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
