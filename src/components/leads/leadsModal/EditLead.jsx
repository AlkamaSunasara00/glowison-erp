import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const leadSourceOptions = [
  { label: "Website", value: "Website" },
  { label: "Instagram", value: "Instagram" },
  { label: "Referral", value: "Referral" },
  { label: "Walk-in", value: "Walk-in" },
  { label: "Amazon", value: "Amazon" },
  { label: "Meesho", value: "Meesho" },
  { label: "Other", value: "Other" },
];

const productInterestOptions = [
  { label: "MDF Sheet", value: "MDF Sheet" },
  { label: "Acrylic Sheet", value: "Acrylic Sheet" },
  { label: "LED Strip Lights", value: "LED Strip Lights" },
  { label: "Wire", value: "Wire" },
  { label: "Hooks", value: "Hooks" },
  { label: "Boards", value: "Boards" },
  { label: "Other", value: "Other" },
];

const stageOptions = [
  { label: "New", value: "new" },
  { label: "In Progress", value: "in progress" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

const EditLead = ({ open, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    source: "Website",
    otherSource: "",
    productInterest: "MDF Sheet",
    otherProductInterest: "",
    stage: "new",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      let productInterest = initialData.productInterest || "MDF Sheet";
      let otherProductInterest = "";
      if (productInterest && !productInterestOptions.find(o => o.value === productInterest)) {
        productInterest = "Other";
        otherProductInterest = initialData.productInterest;
      }

      setFormData({
        name: initialData.name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        source: initialData.source || "Website",
        otherSource: initialData.otherSource || "",
        productInterest: productInterest,
        otherProductInterest: otherProductInterest,
        stage: initialData.stage || "new",
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
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className={`relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Edit lead
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update details for this prospect.
                </p>
              </div>

              <button type="button" onClick={onClose}>
                <Icons
                  name="X"
                  size={18}
                  className="text-gray-500 hover:text-gray-700"
                />
              </button>
            </div>
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
                  placeholder="+91"
                  type="tel"
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
              
              {formData.source === "Other" && (
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

              {formData.productInterest === "Other" && (
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

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="solid" type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLead;
