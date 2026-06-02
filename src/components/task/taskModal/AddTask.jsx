import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const taskTypeOptions = [
  { label: "Demo (device required)", value: "demo" },
  { label: "Field visit", value: "field-visit" },
  { label: "Call", value: "call" },
  { label: "Follow-up", value: "follow-up" },
  { label: "Quotation", value: "quotation" },
];

const leadOptions = [
  { label: "Select lead", value: "" },
  { label: "Dr. Priya Sharma - Skin Clinic", value: "lead-1" },
  { label: "Dr. Rajesh Verma - Apollo", value: "lead-2" },
  { label: "Dr. Meera Singh - Max Health", value: "lead-3" },
];

const employeeOptions = [
  { label: "Select employee", value: "" },
  { label: "Arjun Patel", value: "arjun-patel" },
  { label: "Sneha Mehta", value: "sneha-mehta" },
  { label: "Rohit Shah", value: "rohit-shah" },
  { label: "Priya Nair", value: "priya-nair" },
];

const demoDeviceOptions = [
  { label: "HydraFacial MD — Unit 1", value: "hydrafacial-unit-1" },
  { label: "HydraFacial MD — Unit 2", value: "hydrafacial-unit-2" },
  { label: "Skin Booster — Unit 1", value: "skin-booster-unit-1" },
  { label: "Laser Treatment — Unit 1", value: "laser-unit-1" },
];

const estimatedDurationOptions = [
  { label: "Not set", value: "" },
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "1.5 hours", value: "90" },
  { label: "2 hours", value: "120" },
  { label: "Custom", value: "custom" },
];

const initialFormData = {
  taskTitle: "",
  taskType: "demo",
  dueDate: "",
  dueTime: "",
  linkedLead: "",
  primaryAssignee: "",
  jointEmployee: "",
  demoDevice: "hydrafacial-unit-1",
  estimatedDuration: "",
  instructions: "",
  completionBonus: "",
  conversionBonus: "",
};

const AddTask = ({ open, onClose }) => {
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

  const selectedTaskType = taskTypeOptions.find(
    (t) => t.value === formData.taskType
  )?.label;
  const selectedLead = leadOptions.find(
    (l) => l.value === formData.linkedLead
  )?.label;
  const selectedAssignee = employeeOptions.find(
    (e) => e.value === formData.primaryAssignee
  )?.label;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-16 z-[1000] flex justify-end md:inset-0 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] ${
          open ? "animate-overlay-in" : "animate-overlay-out"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:w-[90%] md:h-screen ${
          open ? "animate-slide-in-right" : "animate-slide-out-right"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          {/* ── HEADER ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
            {/* Left: Back button + Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icons name="ArrowLeft" size={20} />
              </button>
              <h2 className="text-base font-semibold text-gray-900">Add task</h2>
            </div>

            {/* Right: Close button */}
            <Button
              type="button"
              variant="danger"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>

          {/* ── MIDDLE CONTENT ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* Left: Form Fields */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 border-r border-gray-100">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="label">
                    Task title <span className="required">*</span>
                  </label>
                  <Input
                    name="taskTitle"
                    value={formData.taskTitle}
                    onChange={handleChange}
                    placeholder="e.g. Clinic visit with Dr. Priya Sharma"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label">
                      Task type <span className="required">*</span>
                    </label>
                    <Input
                      type="select"
                      name="taskType"
                      value={formData.taskType}
                      onChange={handleChange}
                      options={taskTypeOptions}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">
                      Linked lead <span className="required">*</span>
                    </label>
                    <Input
                      type="select"
                      name="linkedLead"
                      value={formData.linkedLead}
                      onChange={handleChange}
                      options={leadOptions}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="label">
                    Due date & time <span className="required">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      name="dueTime"
                      value={formData.dueTime}
                      onChange={handleChange}
                      className="w-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label">
                      Primary assignee <span className="required">*</span>
                    </label>
                    <Input
                      type="select"
                      name="primaryAssignee"
                      value={formData.primaryAssignee}
                      onChange={handleChange}
                      options={employeeOptions}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Joint employee (optional)</label>
                    <Input
                      type="select"
                      name="jointEmployee"
                      value={formData.jointEmployee}
                      onChange={handleChange}
                      options={employeeOptions}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label">Demo device</label>
                    <Input
                      type="select"
                      name="demoDevice"
                      value={formData.demoDevice}
                      onChange={handleChange}
                      options={demoDeviceOptions}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Estimated duration</label>
                    <Input
                      type="select"
                      name="estimatedDuration"
                      value={formData.estimatedDuration}
                      onChange={handleChange}
                      options={estimatedDurationOptions}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="label">Instructions / notes for employee</label>
                  <Input
                    type="textarea"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Any specific context or prep instructions..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Right: Incentive + Preview */}
            <div className="w-72 bg-gray-50 overflow-y-auto custom-scrollbar flex flex-col border-l border-gray-100">
              {/* Incentive Section */}
              <div className="px-4 py-5 border-b border-gray-100 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Incentive (optional)
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      On completion bonus
                    </label>
                    <Input
                      name="completionBonus"
                      value={formData.completionBonus}
                      onChange={handleChange}
                      placeholder="e.g. ₹500 on task done"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      On conversion bonus
                    </label>
                    <Input
                      name="conversionBonus"
                      value={formData.conversionBonus}
                      onChange={handleChange}
                      placeholder="e.g. ₹2,000 if lead converts"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="px-4 py-5 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Task preview
                </h3>
                <div className="space-y-3">
                  {/* Task Title */}
                  {formData.taskTitle && (
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        TITLE
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formData.taskTitle}
                      </p>
                    </div>
                  )}

                  {/* Task Details */}
                  {(selectedTaskType || selectedLead || selectedAssignee) && (
                    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-500">
                        DETAILS
                      </p>

                      {selectedTaskType && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium text-gray-900">
                            {selectedTaskType}
                          </span>
                        </div>
                      )}

                      {selectedLead && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Lead:</span>
                          <span className="font-medium text-gray-900 truncate">
                            {selectedLead}
                          </span>
                        </div>
                      )}

                      {selectedAssignee && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Assigned:</span>
                          <span className="font-medium text-gray-900">
                            {selectedAssignee}
                          </span>
                        </div>
                      )}

                      {formData.dueDate && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Due:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(formData.dueDate).toLocaleDateString(
                              "en-IN"
                            )}
                            {formData.dueTime && ` ${formData.dueTime}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Incentive Preview */}
                  {(formData.completionBonus || formData.conversionBonus) && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
                      <p className="text-xs font-semibold text-blue-900">
                        INCENTIVE
                      </p>
                      {formData.completionBonus && (
                        <div className="text-xs text-blue-800">
                          ✓ {formData.completionBonus}
                        </div>
                      )}
                      {formData.conversionBonus && (
                        <div className="text-xs text-blue-800">
                          ✓ {formData.conversionBonus}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER ─────────────────────────────────────────── */}
          <div className="border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-end gap-2 shrink-0">

            <Button
              type="button"
              variant="outline"
              leftIcon={(props) => <Icons name="Save" {...props} />}
            >
              Save as draft
            </Button>
            <Button
              type="submit"
              variant="solid"
              rightIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
            >
              Assign task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
