import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const customerTypeOptions = [
  { label: "Retail", value: "Retail" },
  { label: "Dealer", value: "Dealer" },
];

const EditCustomer = ({ open, onClose, initialData }) => {
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        type: initialData.type || "Retail",
        gstin: initialData.gstin || "",
        addressLine1: initialData.address?.line1 || "",
        addressLine2: initialData.address?.line2 || "",
        city: initialData.address?.city || "",
        state: initialData.address?.state || "",
        pincode: initialData.address?.pincode || "",
        notes: initialData.notes || "",
      });
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

  const handleSubmit = (event) => {
    event.preventDefault();
    onClose();
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
                <label className="label">Customer Name <span className="required">*</span></label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">Customer Type <span className="required">*</span></label>
                <Input type="select" name="type" value={formData.type} onChange={handleChange} options={customerTypeOptions} required />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">GSTIN {formData.type === 'Retail' ? '(Optional)' : '<span className="required">*</span>'}</label>
                <Input name="gstin" value={formData.gstin} onChange={handleChange} required={formData.type === 'Dealer'} />
              </div>

              <div className="space-y-1.5">
                <label className="label">Phone <span className="required">*</span></label>
                <Input name="phone" value={formData.phone} onChange={handleChange} type="tel" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Email</label>
                <Input name="email" value={formData.email} onChange={handleChange} type="email" />
              </div>
              
              <div className="md:col-span-2 mt-2">
                <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-3">Address Information</h3>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Address Line 1</label>
                <Input type="textarea" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="min-h-[80px]" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Address Line 2</label>
                <Input name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <label className="label">City</label>
                <Input name="city" value={formData.city} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <label className="label">State</label>
                <Input name="state" value={formData.state} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <label className="label">Pincode</label>
                <Input name="pincode" value={formData.pincode} onChange={handleChange} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Notes</label>
                <Input type="textarea" name="notes" value={formData.notes} onChange={handleChange} className="min-h-[80px]" />
              </div>

            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="solid" type="submit">Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;
