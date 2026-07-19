import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const EditProject = ({ open, onClose, project }) => {
  const [linkOrder, setLinkOrder] = useState(!!project?.orderId);
  const [orders, setOrders] = useState([]);
  
  const [formData, setFormData] = useState({
    projectName: project?.projectName || "",
    orderId: project?.orderId || "",
    customerName: project?.customerName || "",
    location: project?.location || "",
    description: project?.description || "",
    date: project?.date ? new Date(project.date).toISOString().slice(0, 10) : "",
    totalAmount: project?.totalAmount || 0,
    status: project?.status || "PENDING",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      api.get('/orders', { params: { limit: 200 } }).then(res => {
        const orderList = (res.data.data || []).map(o => ({
          value: o.id,
          label: `${String(o.orderNumber).startsWith('ORD-') ? o.orderNumber : `ORD-${String(o.orderNumber).padStart(6, '0')}`} — ${o.customer?.name || o.buyerName || 'N/A'}`,
          customerName: o.customer?.name || o.buyerName || 'N/A'
        }));
        setOrders(orderList);
      }).catch(console.error);
    }
  }, [open]);

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
    
    // Auto-fill project name and customer name if an order is selected
    if (name === "orderId" && value) {
      const selectedOrder = orders.find(o => o.value === value);
      if (selectedOrder && selectedOrder.customerName !== 'N/A') {
        setFormData((prev) => ({
          ...prev,
          projectName: selectedOrder.customerName,
          customerName: selectedOrder.customerName
        }));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        orderId: linkOrder ? formData.orderId : null,
      };

      if (!payload.projectName?.trim()) {
        toast.error('Project name is required');
        setIsSubmitting(false);
        return;
      }

      await api.put(`/associates/projects/${project.id}`, payload);
      toast.success('Project updated successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 z-[1000] flex items-start justify-center p-4 md:inset-0 md:items-center md:p-6"
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-overlay-in"
        onClick={onClose}
      />
      
      <div className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg md:h-auto md:max-h-[90vh] animate-modal-in">
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Edit Project
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update the details for this project.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            >
              <Icons name="X" size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              
              <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-sm border border-blue-100/50">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input 
                    type="checkbox" 
                    checked={linkOrder} 
                    onChange={(e) => setLinkOrder(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-blue-900">Link to an Order</span>
                </label>
                
                {linkOrder && (
                  <div className="space-y-1.5 pl-6">
                    <label className="label">Select Order <span className="required">*</span></label>
                    <Input
                      type="select"
                      name="orderId"
                      value={formData.orderId}
                      onChange={handleChange}
                      options={[{ value: "", label: "Select an order..." }, ...orders]}
                      required={linkOrder}
                    />
                    <p className="text-[10px] text-gray-500 font-medium">
                      Project name will automatically sync with the selected order.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Project Name <span className="required">*</span></label>
                <Input
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g. Kitchen Installation - Juhu"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">Customer Name</label>
                <Input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Andheri West"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="label">Date</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">Total Amount (₹)</label>
                <Input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">Status</label>
                <Input
                  type="select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Description</label>
                <Input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional details about the work..."
                  className="min-h-[80px]"
                />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;
