import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import api from "@/lib/api";
import toast from "react-hot-toast";
import ImageUpload from "@/common/ImageUpload";

const categoryOptions = [
  { label: "Raw Material", value: "RAW_MATERIAL" },
  { label: "Consumables", value: "CONSUMABLES" },
  { label: "Hardware", value: "HARDWARE" },
  { label: "Packaging", value: "PACKAGING" },
  { label: "Finished Goods", value: "FINISHED_GOODS" },
];

const unitOptions = [
  { label: "Piece", value: "Piece" },
  { label: "Sq Ft", value: "Sq Ft" },
  { label: "Roll", value: "Roll" },
  { label: "Liters", value: "Liters" },
  { label: "Other", value: "OTHER" },
];

const EditInventory = ({ open, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "RAW_MATERIAL",
    subCategory: "",
    brand: "",
    description: "",
    
    // Material Details
    material: "",
    color: "",
    thickness: "",
    length: "",
    width: "",
    size: "",
    finish: "",
    
    // Units
    purchaseUnit: "Piece",
    purchaseUnitOther: "",
    usageUnit: "Piece",
    usageUnitOther: "",
    conversionFactor: 1,
    lastPurchasePrice: 0,
    
    openingStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    reorderLevel: 0,
    
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        sku: initialData.sku || "",
        barcode: initialData.barcode || "",
        category: initialData.category || "RAW_MATERIAL",
        subCategory: initialData.subCategory || "",
        brand: initialData.brand || "",
        description: initialData.description || "",
        
        material: initialData.material || "",
        color: initialData.color || "",
        thickness: initialData.thickness || "",
        length: initialData.length || "",
        width: initialData.width || "",
        size: initialData.size || "",
        finish: initialData.finish || "",
        
        purchaseUnit: unitOptions.some(o => o.value === initialData.purchaseUnit) ? (initialData.purchaseUnit || "Piece") : "OTHER",
        purchaseUnitOther: !unitOptions.some(o => o.value === initialData.purchaseUnit) ? initialData.purchaseUnit : "",
        usageUnit: unitOptions.some(o => o.value === initialData.usageUnit) ? (initialData.usageUnit || "Piece") : "OTHER",
        usageUnitOther: !unitOptions.some(o => o.value === initialData.usageUnit) ? initialData.usageUnit : "",
        conversionFactor: initialData.conversionFactor || 1,
        lastPurchasePrice: initialData.lastPurchasePrice || 0,
        
        openingStock: initialData.currentUsageStock || 0,
        minimumStock: initialData.minimumStock || 0,
        maximumStock: initialData.maximumStock || 0,
        reorderLevel: initialData.reorderLevel || 0,
        
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
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        category: formData.category,
        subCategory: formData.subCategory || null,
        brand: formData.brand || null,
        description: formData.description || null,
        
        material: formData.material || null,
        color: formData.color || null,
        thickness: formData.thickness || null,
        length: formData.length || null,
        width: formData.width || null,
        size: formData.size || null,
        finish: formData.finish || null,

        purchaseUnit: formData.purchaseUnit === "OTHER" ? formData.purchaseUnitOther : formData.purchaseUnit,
        usageUnit: formData.usageUnit === "OTHER" ? formData.usageUnitOther : formData.usageUnit,
        conversionFactor: formData.conversionFactor ? Number(formData.conversionFactor) : 1,
        lastPurchasePrice: formData.lastPurchasePrice ? Number(formData.lastPurchasePrice) : 0,
        
        currentPurchaseStock: formData.openingStock ? Number(formData.openingStock) / (Number(formData.conversionFactor) || 1) : 0,
        currentUsageStock: formData.openingStock ? Number(formData.openingStock) : 0,
        minimumStock: formData.minimumStock ? Number(formData.minimumStock) : 0,
        maximumStock: formData.maximumStock ? Number(formData.maximumStock) : 0,
        reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : 0,
        
        lastPurchasePrice: formData.lastPurchasePrice ? Number(formData.lastPurchasePrice) : 0,
        
        warehouse: formData.warehouse || null,
        rack: formData.rack || null,
        shelf: formData.shelf || null,
        bin: formData.bin || null,
        
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
              {/* Basic Info */}
              <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-900 border-b pb-2 mt-2">Basic Information</div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Item Name <span className="required">*</span></label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-1.5">
                <label className="label">Category <span className="required">*</span></label>
                <Input type="select" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} required />
              </div>
              <div className="space-y-1.5">
                <label className="label">Sub Category</label>
                <Input name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="e.g. MDF, Acrylic" />
              </div>
              <div className="space-y-1.5">
                <label className="label">SKU</label>
                <Input name="sku" value={formData.sku} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <label className="label">Brand</label>
                <Input name="brand" value={formData.brand} onChange={handleChange} />
              </div>
              
              {/* Dynamic Material Details based on Subcategory (Simplified example) */}
              <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-900 border-b pb-2 mt-4">Material Details</div>
              <div className="space-y-1.5">
                <label className="label">Material</label>
                <Input name="material" value={formData.material} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <label className="label">Thickness</label>
                <Input name="thickness" value={formData.thickness} onChange={handleChange} placeholder="e.g. 2mm, 5mm" />
              </div>
              <div className="space-y-1.5">
                <label className="label">Size / Dimensions</label>
                <Input name="size" value={formData.size} onChange={handleChange} placeholder="e.g. 8x4 ft" />
              </div>
              <div className="space-y-1.5">
                <label className="label">Color / Finish</label>
                <Input name="color" value={formData.color} onChange={handleChange} />
              </div>

              {/* Unit Conversions */}
              <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-900 border-b pb-2 mt-4">Units & Costing</div>
              <div className="space-y-1.5">
                <label className="label">Purchase Unit <span className="required">*</span></label>
                <Input type="select" name="purchaseUnit" value={formData.purchaseUnit} onChange={handleChange} options={unitOptions} required />
              </div>
              {formData.purchaseUnit === "OTHER" && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                  <label className="label">Specify Purchase Unit <span className="required">*</span></label>
                  <Input name="purchaseUnitOther" value={formData.purchaseUnitOther} onChange={handleChange} required />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="label">Usage Unit <span className="required">*</span></label>
                <Input type="select" name="usageUnit" value={formData.usageUnit} onChange={handleChange} options={unitOptions} required />
              </div>
              {formData.usageUnit === "OTHER" && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                  <label className="label">Specify Usage Unit <span className="required">*</span></label>
                  <Input name="usageUnitOther" value={formData.usageUnitOther} onChange={handleChange} required />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="label">Conversion Factor <span className="required">*</span></label>
                <div className="flex flex-col gap-1">
                  <Input type="number" name="conversionFactor" value={formData.conversionFactor} onChange={handleChange} min="0.01" step="0.01" required />
                  <span className="text-[10px] text-gray-500">1 {formData.purchaseUnit === "OTHER" ? (formData.purchaseUnitOther || "Unit") : formData.purchaseUnit} = {formData.conversionFactor || 1} {formData.usageUnit === "OTHER" ? (formData.usageUnitOther || "Unit") : formData.usageUnit}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label">Purchase Price (per {formData.purchaseUnit === "OTHER" ? (formData.purchaseUnitOther || "Unit") : formData.purchaseUnit})</label>
                <div className="flex flex-col gap-1">
                  <Input type="number" name="lastPurchasePrice" value={formData.lastPurchasePrice} onChange={handleChange} min="0" step="0.01" />
                </div>
              </div>

              {/* Stock Tracking */}
              <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-900 border-b pb-2 mt-4">Stock Levels</div>
              <div className="space-y-1.5">
                <label className="label">Opening Stock (in {formData.usageUnit})</label>
                <Input type="number" name="openingStock" value={formData.openingStock} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div className="space-y-1.5">
                <label className="label">Minimum Stock Alert Level</label>
                <Input type="number" name="minimumStock" value={formData.minimumStock} onChange={handleChange} min="0" step="0.01" />
              </div>

              {/* Media */}
              <div className="col-span-1 md:col-span-2 text-sm font-semibold text-gray-900 border-b pb-2 mt-4">Media</div>
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
