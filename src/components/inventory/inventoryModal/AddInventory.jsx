import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const typeOptions = [
  { label: "Raw Material", value: "Raw Material" },
  { label: "Finished Good", value: "Finished Good" },
];

const categoryOptions = [
  { label: "Boards", value: "Boards" },
  { label: "Sheets", value: "Sheets" },
  { label: "Decor", value: "Decor" },
  { label: "Lighting", value: "Lighting" },
  { label: "Hardware", value: "Hardware" },
  { label: "Other", value: "Other" },
];

const AddInventory = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    type: "Raw Material",
    category: "Boards",
    otherCategory: "",
    minStock: "",
    currentStock: "",
    price: "",
  });

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
              <h2 className="text-base font-semibold text-gray-900">Add Inventory Item</h2>
              <p className="mt-1 text-sm text-gray-500">Create a new raw material or finished good.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Item Name <span className="required">*</span></label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">SKU / Code (Optional)</label>
                <Input name="sku" value={formData.sku} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <label className="label">Item Type <span className="required">*</span></label>
                <Input type="select" name="type" value={formData.type} onChange={handleChange} options={typeOptions} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Category <span className="required">*</span></label>
                <Input type="select" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} required />
              </div>

              {formData.category === "Other" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="label">Specify Category <span className="required">*</span></label>
                  <Input name="otherCategory" value={formData.otherCategory} onChange={handleChange} required />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="label">Unit Price (Rs.)</label>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} min="0" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Minimum Stock Alert Level</label>
                <Input type="number" name="minStock" value={formData.minStock} onChange={handleChange} min="0" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Current Stock</label>
                <Input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} min="0" />
              </div>
              
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="solid" type="submit">Save Item</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventory;
