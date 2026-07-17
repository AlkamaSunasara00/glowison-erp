import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import Loader from "@/common/Loader";

const leadSourceOptions = [
  { label: "IndiaMart", value: "INDIAMART" },
  { label: "JustDial", value: "JUSTDIAL" },
  { label: "Website", value: "WEBSITE" },
  { label: "Google Ads", value: "GOOGLE_ADS" },
  { label: "Facebook/Instagram", value: "FACEBOOK_INSTAGRAM" },
  { label: "Reference", value: "REFERENCE" },
  { label: "Cold Call", value: "COLD_CALL" },
  { label: "Other", value: "OTHER" },
];

const productInterestOptions = [
  { label: "Card Design", value: "CARD_DESIGN" },
  { label: "Flex Design", value: "FLEX_DESIGN" },
  { label: "Banner", value: "BANNER" },
  { label: "Sticker", value: "STICKER" },
  { label: "Signage Board", value: "SIGNAGE_BOARD" },
  { label: "Other", value: "OTHER" },
];

const stageOptions = [
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Negotiation", value: "NEGOTIATION" },
  { label: "Closed Won", value: "CLOSED_WON" },
  { label: "Closed Lost", value: "CLOSED_LOST" },
];

const EditLead = ({ open, onClose, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    source: "WEBSITE",
    otherSource: "",
    productInterest: "FLEX_DESIGN",
    otherProductInterest: "",
    stage: "NEW",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      let productInterest = initialData.productInterest || initialData.interest || "FLEX_DESIGN";
      let otherProductInterest = initialData.interestOther || "";
      if (productInterest && !productInterestOptions.find(o => o.value === productInterest)) {
        productInterest = "OTHER";
        otherProductInterest = initialData.productInterest || initialData.interest;
      }

      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        source: initialData.source || "WEBSITE",
        otherSource: initialData.otherSource || initialData.sourceOther || "",
        productInterest: productInterest,
        otherProductInterest: otherProductInterest,
        stage: initialData.status || initialData.stage || "NEW",
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        phone: formData.phone || "",
        email: formData.email || null,
        source: formData.source,
        sourceOther: formData.source === "OTHER" ? formData.otherSource : undefined,
        interest: formData.productInterest,
        interestOther: formData.productInterest === "OTHER" ? formData.otherProductInterest : undefined,
        status: formData.stage,
        notes: formData.notes || undefined,
      };
      
      await api.put(`/leads/${initialData.id}`, payload);
      toast.success("Lead updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update lead");
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
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className={`relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-sm border border-gray-100 bg-white shadow-2xl md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        {isSubmitting && <Loader fullScreen text="Saving Changes..." />}
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-gray-100/80 px-7 py-5 flex items-center justify-between bg-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Edit lead</h2>
              <p className="mt-1 text-xs font-medium text-gray-500">Update details for this prospect.</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="label">
                  Name <span className="required">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter prospect name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digit number"
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  Email
                </label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  type="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  Lead source <span className="required">*</span>
                </label>
                <Input
                  name="source"
                  type="select"
                  value={formData.source}
                  onChange={handleChange}
                  options={leadSourceOptions}
                  required
                />
              </div>
              
              {formData.source === "OTHER" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="label">
                    Specify Other Source
                  </label>
                  <Input
                    name="otherSource"
                    value={formData.otherSource}
                    onChange={handleChange}
                    placeholder="Enter source"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="label">
                  Product interest
                </label>
                <Input
                  name="productInterest"
                  type="select"
                  value={formData.productInterest}
                  onChange={handleChange}
                  options={productInterestOptions}
                />
              </div>

              {formData.productInterest === "OTHER" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="label">
                    Specify Product Interest
                  </label>
                  <Input
                    name="otherProductInterest"
                    value={formData.otherProductInterest}
                    onChange={handleChange}
                    placeholder="Enter product interest"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="label">
                  Stage <span className="required">*</span>
                </label>
                <Input
                  name="stage"
                  type="select"
                  value={formData.stage}
                  onChange={handleChange}
                  options={stageOptions}
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">
                  Notes
                </label>
                <Input
                  type="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional details..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-7 py-5 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting} className="rounded-sm shadow-sm bg-white border-gray-200 hover:bg-gray-50 px-4 py-2 font-semibold">
              Cancel
            </Button>
            <Button variant="solid" type="submit" disabled={isSubmitting} className="rounded-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 px-5 py-2 font-semibold">
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLead;
