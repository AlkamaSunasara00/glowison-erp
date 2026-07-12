import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import ImageUpload from "@/common/ImageUpload";

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

const EditPriceItem = ({ open, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "CARD_DESIGN",
    otherLabel: "",
    size: "STANDARD",
    sizeOther: "",
    clientPrice: "",
    b2bPrice: "",
    priceUnit: "PER_PIECE",
    unitOther: "",
    note: "",
    imageUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "CARD_DESIGN",
        otherLabel: initialData.otherLabel || "",
        size: initialData.size || "STANDARD",
        sizeOther: initialData.sizeOther || "",
        clientPrice: initialData.clientPrice || initialData.price || "",
        b2bPrice: initialData.b2bPrice || "",
        priceUnit: initialData.priceUnit || "PER_PIECE",
        unitOther: initialData.unitOther || "",
        note: initialData.note || "",
        imageUrl: initialData.imageUrl || initialData.image || "",
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
        category: formData.category,
        otherLabel: formData.category === "OTHER" ? formData.otherLabel : null,
        size: formData.size,
        sizeOther: formData.size === "CUSTOM" ? formData.sizeOther : null,
        clientPrice: Number(formData.clientPrice),
        b2bPrice: formData.b2bPrice ? Number(formData.b2bPrice) : null,
        priceUnit: formData.priceUnit,
        unitOther: formData.priceUnit === "CUSTOM" ? formData.unitOther : null,
        note: formData.note,
        imageUrl: formData.imageUrl
      };

      await api.put(`/price-list/${initialData.id}`, payload);
      toast.success('Price item updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update price item');
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
              <h2 className="text-base font-semibold text-gray-900">Edit Price Item</h2>
              <p className="mt-1 text-sm text-gray-500">Update printing or design rate entry.</p>
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
                <label className="label">Client Price (Rs.) <span className="required">*</span></label>
                <Input type="number" name="clientPrice" value={formData.clientPrice} onChange={handleChange} min="0" step="any" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">B2B Price (Rs.) (Optional)</label>
                <Input type="number" name="b2bPrice" value={formData.b2bPrice} onChange={handleChange} min="0" step="any" />
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
                 <ImageUpload 
                   value={formData.imageUrl} 
                   onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} 
                   onUploadStateChange={setUploadingImage}
                   folder="erp/price-list"
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

export default EditPriceItem;

