import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const categoryOptions = [
  { label: "Card Design", value: "Card Design" },
  { label: "Flex Design", value: "Flex Design" },
  { label: "Banner", value: "Banner" },
  { label: "Sticker", value: "Sticker" },
  { label: "Signage Board", value: "Signage Board" },
  { label: "Other", value: "Other" },
];

const sizeOptions = [
  { label: "Standard", value: "Standard" },
  { label: "8x4 ft", value: "8x4 ft" },
  { label: "6x4 ft", value: "6x4 ft" },
  { label: "3x2 ft", value: "3x2 ft" },
  { label: "Custom", value: "Custom" },
];

const unitOptions = [
  { label: "Per Piece", value: "Per Piece" },
  { label: "Per Sq Ft", value: "Per Sq Ft" },
  { label: "Per Set", value: "Per Set" },
  { label: "Custom", value: "Custom" },
];

const initialFormData = {
  name: "",
  category: "Card Design",
  otherCategory: "",
  size: "Standard",
  otherSize: "",
  price: "",
  unit: "Per Piece",
  otherUnit: "",
  notes: "",
  image: "",
};

const AddPriceItem = ({ open, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);

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
        category: formData.category === "Other" ? formData.otherCategory : formData.category,
        size: formData.size === "Custom" ? formData.otherSize : formData.size,
        price: Number(formData.price),
        unit: formData.unit === "Custom" ? formData.otherUnit : formData.unit,
        notes: formData.notes
      };

      await api.post('/price-list', payload);
      toast.success('Price item added successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to add price item');
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
              <h2 className="text-base font-semibold text-gray-900">Add Price Item</h2>
              <p className="mt-1 text-sm text-gray-500">Create a new printing or design rate entry.</p>
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
                <label className="label">Category <span className="required">*</span></label>
                <Input type="select" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} required />
              </div>

              {formData.category === "Other" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="label">Specify Category <span className="required">*</span></label>
                  <Input name="otherCategory" value={formData.otherCategory} onChange={handleChange} required />
                </div>
              )}
              {formData.category !== "Other" && <div className="hidden md:block"></div>}

              <div className="space-y-1.5">
                <label className="label">Size</label>
                <Input type="select" name="size" value={formData.size} onChange={handleChange} options={sizeOptions} />
              </div>

              {formData.size === "Custom" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="label">Specify Size <span className="required">*</span></label>
                  <Input name="otherSize" value={formData.otherSize} onChange={handleChange} required />
                </div>
              )}
              {formData.size !== "Custom" && <div className="hidden md:block"></div>}

              <div className="space-y-1.5">
                <label className="label">Price (Rs.) <span className="required">*</span></label>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Unit <span className="required">*</span></label>
                <Input type="select" name="unit" value={formData.unit} onChange={handleChange} options={unitOptions} required />
              </div>

              {formData.unit === "Custom" && (
                <div className="space-y-1.5 animate-fade-in md:col-span-2">
                  <label className="label">Specify Unit <span className="required">*</span></label>
                  <Input name="otherUnit" value={formData.otherUnit} onChange={handleChange} required />
                </div>
              )}

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Notes</label>
                <Input type="textarea" name="notes" value={formData.notes} onChange={handleChange} className="min-h-[60px]" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                 <label className="label">Reference Image Upload (Optional)</label>
                 <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-gray-700">
                    <Icons name="UploadCloud" size={24} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs mt-1">PNG, JPG, JPEG up to 5MB</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Item</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPriceItem;
