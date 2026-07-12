import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import ImageUpload from "@/common/ImageUpload";

const unitOptions = [
  { label: "Piece", value: "piece" },
  { label: "Inch", value: "inch" },
  { label: "Sq Ft", value: "sqft" },
  { label: "Feet", value: "feet" },
];

const EditCatalogItem = ({ open, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    size: initialData?.size || "",
    color: initialData?.color || "",
    unit: initialData?.unit || "piece",
    retailPrice: initialData?.retailPrice || "",
    dealerPrice: initialData?.dealerPrice || "",
    taxPercent: initialData?.taxPercent || "",
    imageUrl: initialData?.imageUrl || "",
    description: initialData?.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

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
        sku: formData.sku || null,
        size: formData.size || null,
        color: formData.color || null,
        unit: formData.unit,
        retailPrice: Number(formData.retailPrice),
        dealerPrice: Number(formData.dealerPrice),
        taxPercent: formData.taxPercent ? Number(formData.taxPercent) : null,
        imageUrl: formData.imageUrl || null,
        description: formData.description || null,
      };

      await api.put(`/catalog/${initialData.id}`, payload);
      toast.success('Product updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update product');
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
              <h2 className="text-base font-semibold text-gray-900">Edit Product</h2>
              <p className="mt-1 text-sm text-gray-500">Update catalogue item details.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Product Name <span className="required">*</span></label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">SKU</label>
                <Input name="sku" value={formData.sku} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <label className="label">Unit <span className="required">*</span></label>
                <Input type="select" name="unit" value={formData.unit} onChange={handleChange} options={unitOptions} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Retail Price <span className="required">*</span></label>
                <Input name="retailPrice" type="number" min="0" step="0.01" value={formData.retailPrice} onChange={handleChange} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Dealer Price <span className="required">*</span></label>
                <Input name="dealerPrice" type="number" min="0" step="0.01" value={formData.dealerPrice} onChange={handleChange} required />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">Tax Rate (%)</label>
                <Input name="taxPercent" type="number" min="0" step="0.1" value={formData.taxPercent} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <label className="label">Size</label>
                <Input name="size" value={formData.size} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <label className="label">Color</label>
                <Input name="color" value={formData.color} onChange={handleChange} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Product Image</label>
                <ImageUpload 
                  value={formData.imageUrl} 
                  onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} 
                  onUploadStateChange={setUploadingImage}
                  folder="erp/catalog"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Description</label>
                <Input type="textarea" name="description" value={formData.description} onChange={handleChange} className="min-h-[80px]" />
              </div>

            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting || uploadingImage}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting || uploadingImage}>Update Product</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCatalogItem;
