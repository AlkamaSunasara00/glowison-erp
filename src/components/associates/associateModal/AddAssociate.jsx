import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const categoryOptions = [
  { value: "INSTALLER", label: "Installer" },
  { value: "FABRICATOR", label: "Fabricator" },
  { value: "ELECTRICIAN", label: "Electrician" },
  { value: "HELPER", label: "Helper" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const AddAssociate = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    category: "INSTALLER",
    status: "ACTIVE",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await api.post('/associates', formData);
      toast.success('Associate added successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add associate');
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
              <h2 className="text-base font-semibold text-gray-900">Add Associate</h2>
              <p className="mt-1 text-sm text-gray-500">Add a new contract worker or partner.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              
              <div className="space-y-1.5">
                <label className="label">Associate Name <span className="required">*</span></label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Full name" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Mobile Number</label>
                <Input name="phone" value={formData.phone} onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if(val.length <= 10) handleChange({ target: { name: 'phone', value: val } });
                }} placeholder="10 digit mobile number" pattern="\d{10}" title="Must be exactly 10 digits" maxLength={10} />
              </div>

              <div className="space-y-1.5">
                <label className="label">Category <span className="required">*</span></label>
                <Input type="select" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Status <span className="required">*</span></label>
                <Input type="select" name="status" value={formData.status} onChange={handleChange} options={statusOptions} required />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Address</label>
                <Input type="textarea" name="address" value={formData.address} onChange={handleChange} placeholder="Street, City, State" className="min-h-[60px]" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Notes</label>
                <Input type="textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional info..." className="min-h-[60px]" />
              </div>
              
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Associate</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssociate;
