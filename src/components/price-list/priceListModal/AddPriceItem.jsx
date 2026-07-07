import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import { UploadCloud, X } from "lucide-react";

const categoryOptions = [
  { label: "Card Design", value: "CARD_DESIGN" },
  { label: "Flex Design", value: "FLEX_DESIGN" },
  { label: "Banner", value: "BANNER" },
  { label: "Sticker", value: "STICKER" },
  { label: "Signage Board", value: "SIGNAGE_BOARD" },
  { label: "Other", value: "OTHER" },
];

const sizeOptions = [
  { label: "Standard", value: "STANDARD" },
  { label: "8x4 ft", value: "EIGHT_BY_FOUR" },
  { label: "6x4 ft", value: "SIX_BY_FOUR" },
  { label: "3x2 ft", value: "THREE_BY_TWO" },
  { label: "Custom", value: "CUSTOM" },
];

const unitOptions = [
  { label: "Per Piece", value: "PER_PIECE" },
  { label: "Per Sq Ft", value: "PER_SQ_FT" },
  { label: "Per Set", value: "PER_SET" },
  { label: "Custom", value: "CUSTOM" },
];

const initialFormData = {
  name: "",
  category: "CARD_DESIGN",
  otherLabel: "",
  size: "STANDARD",
  sizeOther: "",
  price: "",
  priceUnit: "PER_PIECE",
  unitOther: "",
  note: "",
  imageUrl: "",
};

const AddPriceItem = ({ open, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('images', file);
    fd.append('folder', 'erp/price-list');

    try {
      setUploadingImage(true);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, imageUrl: res.data.urls[0] }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        category: formData.category,
        otherLabel: formData.category === "OTHER" ? formData.otherLabel : null,
        size: formData.size,
        sizeOther: formData.size === "CUSTOM" ? formData.sizeOther : null,
        price: Number(formData.price),
        priceUnit: formData.priceUnit,
        unitOther: formData.priceUnit === "CUSTOM" ? formData.unitOther : null,
        note: formData.note,
        imageUrl: formData.imageUrl
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

              {formData.category === "OTHER" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="label">Specify Category <span className="required">*</span></label>
                  <Input name="otherLabel" value={formData.otherLabel} onChange={handleChange} required />
                </div>
              )}
              {formData.category !== "OTHER" && <div className="hidden md:block"></div>}

              <div className="space-y-1.5">
                <label className="label">Size</label>
                <Input type="select" name="size" value={formData.size} onChange={handleChange} options={sizeOptions} />
              </div>

              {formData.size === "CUSTOM" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="label">Specify Size <span className="required">*</span></label>
                  <Input name="sizeOther" value={formData.sizeOther} onChange={handleChange} required />
                </div>
              )}
              {formData.size !== "CUSTOM" && <div className="hidden md:block"></div>}

              <div className="space-y-1.5">
                <label className="label">Price (Rs.) <span className="required">*</span></label>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="any" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Unit <span className="required">*</span></label>
                <Input type="select" name="priceUnit" value={formData.priceUnit} onChange={handleChange} options={unitOptions} required />
              </div>

              {formData.priceUnit === "CUSTOM" && (
                <div className="space-y-1.5 animate-fade-in md:col-span-2">
                  <label className="label">Specify Unit <span className="required">*</span></label>
                  <Input name="unitOther" value={formData.unitOther} onChange={handleChange} required />
                </div>
              )}

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Notes</label>
                <Input type="textarea" name="note" value={formData.note} onChange={handleChange} className="min-h-[60px]" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                 <label className="label">Reference Image (Optional)</label>
                 
                 {formData.imageUrl ? (
                    <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-gray-200">
                      <img src={formData.imageUrl} alt="Reference Preview" className="w-full h-auto object-cover" />
                      <button 
                        type="button" 
                        onClick={removeImage} 
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                        title="Remove Image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                 ) : (
                    <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-primary overflow-hidden group">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mb-2"></div>
                          <span className="text-sm font-medium text-primary">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud size={24} className="mb-2 text-gray-400 group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">Click to upload or drag and drop</span>
                          <span className="text-xs mt-1 text-gray-400">PNG, JPG, JPEG up to 5MB</span>
                        </>
                      )}
                    </div>
                 )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting || uploadingImage}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting || uploadingImage}>Save Item</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPriceItem;

