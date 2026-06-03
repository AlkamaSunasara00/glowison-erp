import React, { useEffect, useState, useCallback } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import { useRouter } from "next/router";

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

const AddTask = ({ open, onClose, isPage = false }) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);

  const handleBack = useCallback(() => {
    if (isPage) {
      router.push("/task/all-task");
    } else {
      onClose?.();
    }
  }, [isPage, router, onClose]);

  useEffect(() => {
    if (!open && !isPage) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, isPage, handleBack]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleBack();
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
  const selectedJointEmployee = employeeOptions.find(
    (e) => e.value === formData.jointEmployee
  )?.label;
  const selectedDemoDevice = demoDeviceOptions.find(
    (d) => d.value === formData.demoDevice
  )?.label;
  const selectedDuration = estimatedDurationOptions.find(
    (d) => d.value === formData.estimatedDuration
  )?.label;

  const formContent = (
    <div
      className={isPage ? "flex flex-col gap-4 w-full animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:w-[90%] md:h-screen ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className={isPage ? "flex flex-col gap-4 w-full" : "flex h-full min-h-0 flex-col"}>
        <div className={isPage ? "flex items-center justify-between py-2" : "flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0"}>
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Icons name="ArrowLeft" size={20} />
            </button>
            <h2 className="page-header">Add task</h2>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              leftIcon={(props) => <Icons name="Save" {...props} />}
              onClick={handleBack}
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
        </div>

          {/* ── MIDDLE CONTENT ─────────────────────────────────────────── */}
          <div className={isPage ? "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4" : "flex-1 overflow-hidden flex min-h-0"}>
            {/* Left: Form Fields */}
            <div className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : "flex-1 overflow-y-auto custom-scrollbar px-6 py-5 border-r border-gray-100"}>
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

                <div className={formData.taskType === "demo" ? "grid grid-cols-2 gap-4 animate-fade-in" : "space-y-1.5"}>
                  {formData.taskType === "demo" && (
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
                  )}

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
            <div className={isPage ? "flex flex-col gap-4" : "w-72 bg-gray-50 overflow-y-auto custom-scrollbar flex flex-col border-l border-gray-100"}>
              {/* Incentive Section */}
              <div className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm" : "px-4 py-5 border-b border-gray-100 bg-white"}>
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
              <div className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm" : "px-4 py-5 flex-1"}>
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
                  {(selectedTaskType || selectedLead || selectedAssignee || selectedJointEmployee || (formData.taskType === "demo" && selectedDemoDevice) || selectedDuration || formData.dueDate) && (
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
                          <span className="font-medium text-gray-900 truncate max-w-[150px]" title={selectedLead}>
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

                      {selectedJointEmployee && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Joint:</span>
                          <span className="font-medium text-gray-900">
                            {selectedJointEmployee}
                          </span>
                        </div>
                      )}

                      {formData.taskType === "demo" && selectedDemoDevice && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Device:</span>
                          <span className="font-medium text-gray-900 truncate max-w-[150px]" title={selectedDemoDevice}>
                            {selectedDemoDevice}
                          </span>
                        </div>
                      )}

                      {selectedDuration && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">
                            {selectedDuration}
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

                  {/* Instructions Preview */}
                  {formData.instructions && (
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        INSTRUCTIONS / NOTES
                      </p>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {formData.instructions}
                      </p>
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


      </form>
    </div>
  );

  if (isPage) {
    return formContent;
  }

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
        onClick={handleBack}
        aria-hidden="true"
      />
      {formContent}
    </div>
  );
};

export default AddTask;
