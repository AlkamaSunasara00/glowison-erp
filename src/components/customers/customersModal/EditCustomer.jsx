import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import ImageUpload from "@/common/ImageUpload";

const customerTypeOptions = [
  { label: "Retail", value: "Retail" },
  { label: "Wholesale (Dealer)", value: "Wholesale" },
  { label: "Enterprise", value: "Enterprise" },
];

const EditCustomer = ({ open, onClose, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
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
  });
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const parsedAddress = typeof initialData.address === 'string' ? (() => { try { return JSON.parse(initialData.address); } catch { return {}; } })() : (initialData.address || {});
      // eslint-disable-next-line
      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        type: initialData.type ? (initialData.type.charAt(0).toUpperCase() + initialData.type.slice(1).toLowerCase()) : "Retail",
        gstin: initialData.gstin || "",
        addressLine1: parsedAddress.line1 || initialData.addressLine1 || "",
        addressLine2: parsedAddress.line2 || initialData.addressLine2 || "",
        city: parsedAddress.city || initialData.city || "",
        state: parsedAddress.state || initialData.state || "",
        pincode: parsedAddress.pincode || initialData.pincode || "",
        notes: initialData.notes || "",
      });
      setImageUrl(initialData.imageUrl || "");
    }
  }, [initialData]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
        gstin: formData.gstin || undefined,
        phone: formData.phone,
        email: formData.email || undefined,
        address: JSON.stringify({
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }),
        notes: formData.notes || undefined,
        imageUrl: imageUrl || null,
      };

      await api.put(`/customers/${initialData.id}`, payload);
      toast.success("Customer updated successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update customer");
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
              <h2 className="text-base font-semibold text-gray-900">Edit customer</h2>
              <p className="mt-1 text-sm text-gray-500">Update customer details.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Customer Profile Image</label>
                <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-200 bg-gray-50 mx-auto md:mx-0">
                   <ImageUpload 
                      value={imageUrl}
                      onChange={setImageUrl}
                      folder="erp/customers"
                   />
                </div>
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

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;
