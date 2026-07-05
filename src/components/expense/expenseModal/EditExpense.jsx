import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const categoryOptions = [
  { label: "Rent", value: "Rent" },
  { label: "Salary", value: "Salary" },
  { label: "Marketing", value: "Marketing" },
  { label: "Utilities", value: "Utilities" },
  { label: "Misc", value: "Misc" },
];

const statusOptions = [
  { label: "Paid", value: "Paid" },
  { label: "Pending", value: "Pending" },
];

const EditExpense = ({ open, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    date: "",
    category: "Misc",
    amount: "",
    paidTo: "",
    notes: "",
    status: "Paid",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || "",
        category: initialData.category || "Misc",
        amount: initialData.amount || "",
        paidTo: initialData.paidTo || "",
        notes: initialData.notes || "",
        status: initialData.status || "Paid",
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
        className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Edit Expense</h2>
              <p className="mt-1 text-sm text-gray-500">Update expense details.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Paid To <span className="required">*</span></label>
                <Input name="paidTo" value={formData.paidTo} onChange={handleChange} placeholder="Vendor, Employee, or Entity name" required />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">Date <span className="required">*</span></label>
                <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Amount (Rs.) <span className="required">*</span></label>
                <Input type="number" name="amount" value={formData.amount} onChange={handleChange} min="0" required />
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
                <label className="label">Notes / Description</label>
                <Input type="textarea" name="notes" value={formData.notes} onChange={handleChange} placeholder="Reason or details of the expense" className="min-h-[60px]" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                 <label className="label">Receipt Upload</label>
                 <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-gray-700">
                    <Icons name="UploadCloud" size={24} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs mt-1">PDF, JPG, PNG up to 5MB</span>
                 </div>
              </div>
              
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="solid" type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpense;
