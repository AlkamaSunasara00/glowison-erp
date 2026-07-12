import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import api from "@/lib/api";
import toast from "react-hot-toast";
import ImageUpload from "@/common/ImageUpload";

const typeOptions = [
  { label: "Raw Material", value: "Raw Material" },
  { label: "Finished Good", value: "Finished Good" },
];

const categoryOptions = [
  { label: "Board", value: "BOARD" },
  { label: "Vinyl", value: "VINYL" },
  { label: "Acrylic", value: "ACRYLIC" },
  { label: "Flex", value: "FLEX" },
  { label: "LED", value: "LED" },
  { label: "Ink", value: "INK" },
  { label: "Other", value: "OTHERS" },
];

const unitOptions = [
  { label: "Piece", value: "Piece" },
  { label: "Sq Ft", value: "Sq Ft" },
  { label: "Roll", value: "Roll" },
  { label: "Liters", value: "Liters" },
  { label: "Other", value: "Other" },
];

const EditInventory = ({ open, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    type: "Raw Material",
    category: "BOARD",
    otherCategory: "",
    baseUnit: "Piece",
    purchaseUnit: "Piece",
    unitsPerPurchase: "1",
    minStock: "0",
    lastPurchasePrice: "0",
    stockQty: "0",
    stockQty: "0",
    averageCost: "0",
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      let category = initialData.category || "BOARD";
      let otherCategory = "";
      if (category && !categoryOptions.find(o => o.value === category)) {
        category = "OTHERS";
        otherCategory = initialData.category;
      }

      setFormData({
        sku: initialData.sku || "",
        name: initialData.name || "",
        type: initialData.type || "Raw Material",
        category: category,
        otherCategory: otherCategory,
        baseUnit: initialData.baseUnit || "Piece",
        purchaseUnit: initialData.purchaseUnit || "Piece",
        unitsPerPurchase: initialData.unitsPerPurchase || "1",
        minStock: initialData.minStock || "0",
        lastPurchasePrice: initialData.lastPurchasePrice || "0",
        stockQty: initialData.stockQty || initialData.stock || "0",
        averageCost: initialData.averageCost || "0",
        images: initialData.images || [],
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

      const payload = {
        name: formData.name,
        sku: formData.sku || undefined,
        type: formData.type === "Raw Material" ? "RAW_MATERIAL" : "FINISHED_GOOD",
        category: formData.category === "OTHERS" ? "OTHERS" : formData.category,
        categoryOther: formData.category === "OTHERS" ? formData.otherCategory : undefined,
        baseUnit: formData.baseUnit,
        purchaseUnit: formData.purchaseUnit,
        unitsPerPurchase: formData.unitsPerPurchase ? Number(formData.unitsPerPurchase) : 1,
        lastPurchasePrice: formData.lastPurchasePrice ? Number(formData.lastPurchasePrice) : 0,
        reorderThreshold: formData.minStock ? Number(formData.minStock) : 0,
        images: formData.images || [],
      };

      await api.put(`/inventory/${initialData.id}`, payload);
      toast.success('Item updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update item');
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
              <h2 className="text-base font-semibold text-gray-900">Edit Inventory Item</h2>
              <p className="mt-1 text-sm text-gray-500">Update item details.</p>
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

              {formData.category === "OTHERS" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="label">Specify Category <span className="required">*</span></label>
                  <Input name="otherCategory" value={formData.otherCategory} onChange={handleChange} required />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="label">Base Unit (Display Unit) <span className="required">*</span></label>
                <Input type="select" name="baseUnit" value={formData.baseUnit} onChange={handleChange} options={unitOptions} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Purchase Unit <span className="required">*</span></label>
                <Input type="select" name="purchaseUnit" value={formData.purchaseUnit} onChange={handleChange} options={unitOptions} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Units Per Purchase</label>
                <Input type="number" name="unitsPerPurchase" value={formData.unitsPerPurchase} onChange={handleChange} min="1" step="0.01" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Current Stock (Read Only)</label>
                <Input type="number" name="stockQty" value={formData.stockQty} readOnly disabled className="bg-gray-50" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Last Purchase Price (Per Base Unit)</label>
                <Input type="number" name="lastPurchasePrice" value={formData.lastPurchasePrice} onChange={handleChange} min="0" step="0.01" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Minimum Stock Alert Level</label>
                <Input type="number" name="minStock" value={formData.minStock} onChange={handleChange} min="0" step="0.01" />
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Images</label>
                <ImageUpload 
                  multiple 
                  value={formData.images} 
                  onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))} 
                  onUploadStateChange={setUploadingImage}
                  folder="erp/inventory"
                />
              </div>
              
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting || uploadingImage}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting || uploadingImage}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInventory;
