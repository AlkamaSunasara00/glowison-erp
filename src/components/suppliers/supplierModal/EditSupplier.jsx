import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const paymentTermOptions = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CREDIT", label: "Credit" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const EditSupplier = ({ open, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    contactPerson: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    gstNumber: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    paymentTerms: "CASH",
    openingBalance: "0",
    status: "ACTIVE",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        companyName: initialData.companyName || "",
        contactPerson: initialData.contactPerson || "",
        mobile: initialData.mobile || "",
        alternateMobile: initialData.alternateMobile || "",
        email: initialData.email || "",
        gstNumber: initialData.gstNumber || "",
        panNumber: initialData.panNumber || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "India",
        pincode: initialData.pincode || "",
        paymentTerms: initialData.paymentTerms || "CASH",
        openingBalance: initialData.openingBalance || "0",
        status: initialData.status || "ACTIVE",
        notes: initialData.notes || ""
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await api.put(`/suppliers/${initialData.id}`, formData);
      toast.success('Supplier updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update supplier');
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
              <h2 className="text-base font-semibold text-gray-900">Edit Supplier</h2>
              <p className="mt-1 text-sm text-gray-500">Update vendor details.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              
              <div className="space-y-1.5 md:col-span-2 border-b pb-4 mb-2">
                <h3 className="font-semibold text-gray-800">Basic Details</h3>
              </div>

              <div className="space-y-1.5">
                <label className="label">Supplier Name <span className="required">*</span></label>
                <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Acme Corp" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Company Name</label>
                <Input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Corporation Ltd." />
              </div>

              <div className="space-y-1.5">
                <label className="label">Contact Person <span className="required">*</span></label>
                <Input name="contactPerson" value={formData.contactPerson} onChange={handleChange} required placeholder="John Doe" />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">Mobile Number <span className="required">*</span></label>
                <Input name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="9876543210" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Alternate Mobile</label>
                <Input name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} placeholder="9876543211" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Email Address <span className="required">*</span></label>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@acme.com" />
              </div>

              <div className="space-y-1.5 md:col-span-2 border-b pb-4 mt-2 mb-2">
                <h3 className="font-semibold text-gray-800">Address & Taxation</h3>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Address <span className="required">*</span></label>
                <Input name="address" value={formData.address} onChange={handleChange} required placeholder="123 Industrial Estate" />
              </div>

              <div className="space-y-1.5">
                <label className="label">City <span className="required">*</span></label>
                <Input name="city" value={formData.city} onChange={handleChange} required placeholder="Mumbai" />
              </div>

              <div className="space-y-1.5">
                <label className="label">State <span className="required">*</span></label>
                <Input name="state" value={formData.state} onChange={handleChange} required placeholder="Maharashtra" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Country <span className="required">*</span></label>
                <Input name="country" value={formData.country} onChange={handleChange} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Pincode <span className="required">*</span></label>
                <Input name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="400001" />
              </div>

              <div className="space-y-1.5">
                <label className="label">GST Number</label>
                <Input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="27XXXXX1234X1X1" />
              </div>

              <div className="space-y-1.5">
                <label className="label">PAN Number</label>
                <Input name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="ABCDE1234F" />
              </div>

              <div className="space-y-1.5 md:col-span-2 border-b pb-4 mt-2 mb-2">
                <h3 className="font-semibold text-gray-800">Financials & Settings</h3>
              </div>

              <div className="space-y-1.5">
                <label className="label">Payment Terms <span className="required">*</span></label>
                <Input type="select" name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} options={paymentTermOptions} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Opening Balance</label>
                <Input type="number" name="openingBalance" value={formData.openingBalance} onChange={handleChange} step="0.01" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Status</label>
                <Input type="select" name="status" value={formData.status} onChange={handleChange} options={statusOptions} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Notes</label>
                <Input 
                  type="textarea"
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Any additional information..."
                />
              </div>

            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplier;
