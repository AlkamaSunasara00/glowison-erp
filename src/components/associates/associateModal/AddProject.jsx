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

const AddProject = ({ open, onClose, associateId, associateName }) => {
  const [linkOrder, setLinkOrder] = useState(false);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    projectName: "",
    orderId: "",
    customerName: "",
    location: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    status: "PENDING",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      api.get('/orders', { params: { limit: 200 } }).then(res => {
        const orderList = (res.data.data || []).map(o => ({
          value: o.id,
          label: `ORD-${String(o.orderNumber).padStart(6, '0')} — ${o.customer?.name || o.buyerName || 'N/A'}`,
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
          projectName: prev.projectName || selectedOrder.customerName,
          customerName: prev.customerName || selectedOrder.customerName
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

      await api.post(`/associates/${associateId}/projects`, payload);
      toast.success('Project created successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
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
              <h2 className="text-base font-semibold text-gray-900">Create Project</h2>
              <p className="mt-1 text-sm text-gray-500">New work entry for <span className="font-semibold text-gray-900">{associateName}</span></p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Link with existing Order?</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input type="radio" name="linkType" checked={!linkOrder} onChange={() => setLinkOrder(false)} className="accent-primary" />
                    No — Enter manually
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input type="radio" name="linkType" checked={linkOrder} onChange={() => setLinkOrder(true)} className="accent-primary" />
                    Yes — Select Order
                  </label>
                </div>
              </div>

              {linkOrder && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="label">Select Order <span className="required">*</span></label>
                  <Input type="select" name="orderId" value={formData.orderId} onChange={handleChange} options={[{ value: "", label: "Select an order" }, ...orders]} required />
                </div>
              )}

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
                <label className="label">Date <span className="required">*</span></label>
                <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Project Status</label>
                <Input type="select" name="status" value={formData.status} onChange={handleChange} options={statusOptions} />
              </div>

              <div className="space-y-1.5">
                <label className="label">Customer Name</label>
                <Input name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Client or company name" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Location</label>
                <Input name="location" value={formData.location} onChange={handleChange} placeholder="City or address" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="label">Description</label>
                <Input type="textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Work details, scope, materials needed..." className="min-h-[60px]" />
              </div>
              
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProject;
