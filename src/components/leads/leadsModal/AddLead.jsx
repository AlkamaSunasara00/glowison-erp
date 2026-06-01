import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const leadSourceOptions = [
  { label: "Field visit", value: "field-visit" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Referral", value: "referral" },
  { label: "Website", value: "website" },
  { label: "Cold call", value: "cold-call" },
];

const productInterestOptions = [
  { label: "HydraFacial MD", value: "hydrafacial-md" },
  { label: "Skin Booster", value: "skin-booster" },
  { label: "Laser Treatment", value: "laser-treatment" },
  { label: "Derma Fillers", value: "derma-fillers" },
];

const assigneeOptions = [
  { label: "Arjun Patel", value: "arjun-patel" },
  { label: "Sneha Mehta", value: "sneha-mehta" },
  { label: "Rohit Shah", value: "rohit-shah" },
];

const stageOptions = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Demo", value: "demo" },
  { label: "Negotiation", value: "negotiation" },
];

const initialFormData = {
  doctorName: "",
  clinicName: "",
  phoneNumber: "",
  city: "",
  leadSource: "field-visit",
  referredBy: "",
  productInterest: "hydrafacial-md",
  assignTo: "arjun-patel",
  initialStage: "new",
  notes: "",
};

const AddLead = ({ open, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);

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
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/30"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-5xl rounded-md border border-gray-200 bg-white shadow-lg ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Add new lead
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Create a lead and assign the next task in one step.
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

          <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-800">
                Lead information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Capture the lead details exactly as shared by your field team.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="label">
                  Doctor / contact name <span className="required">*</span>
                </label>
                <Input
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  placeholder="Dr. First Last"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  Clinic / hospital name <span className="required">*</span>
                </label>
                <Input
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  placeholder="Clinic name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  Phone number <span className="required">*</span>
                </label>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  City / area <span className="required">*</span>
                </label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  Lead source <span className="required">*</span>
                </label>
                <Input
                  type="select"
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  options={leadSourceOptions}
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">Referred by (if referral)</label>
                <Input
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleChange}
                  placeholder="Customer name or lead name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  Product interest <span className="required">*</span>
                </label>
                <Input
                  type="select"
                  name="productInterest"
                  value={formData.productInterest}
                  onChange={handleChange}
                  options={productInterestOptions}
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">
                  Assign to <span className="required">*</span>
                </label>
                <Input
                  type="select"
                  name="assignTo"
                  value={formData.assignTo}
                  onChange={handleChange}
                  options={assigneeOptions}
                />
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label className="label">
                  Initial stage <span className="required">*</span>
                </label>
                <Input
                  type="select"
                  name="initialStage"
                  value={formData.initialStage}
                  onChange={handleChange}
                  options={stageOptions}
                />
              </div>

              <div className="hidden md:block" />

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Initial notes</label>
                <Input
                  type="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="First impression, context, any key info..."
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end shrink-0">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid"
              rightIcon={(props) => (
                <Icons name="ArrowUpRight" color="white" {...props} />
              )}
            >
              Create lead & assign task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLead;
