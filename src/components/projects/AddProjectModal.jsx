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

export default function AddProjectModal({ open, onClose, onUpdated }) {
  const [linkOrder, setLinkOrder] = useState(false);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
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
          label: `${String(o.orderNumber).startsWith('ORD-') ? o.orderNumber : `ORD-${String(o.orderNumber).padStart(6, '0')}`} — ${o.customer?.name || o.buyerName || 'N/A'}`,
          customerName: o.customer?.name || o.buyerName || 'N/A'
        }));
        setOrders(orderList);
      }).catch(console.error);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-fill project name and customer name if an order is selected
    if (name === "orderId" && value) {
      const selectedOrder = orders.find(o => o.value === value);
      if (selectedOrder && selectedOrder.customerName !== 'N/A') {
        setFormData((prev) => ({
          ...prev,
          name: selectedOrder.customerName,
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

      if (!payload.name?.trim()) {
        toast.error('Project name is required');
        setIsSubmitting(false);
        return;
      }

      await api.post(`/projects`, payload);
      toast.success('Project created successfully');
      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 md:items-center md:p-6 pointer-events-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-overlay-in" onClick={onClose} />
      
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg animate-modal-in">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Create New Project</h2>
              <p className="mt-1 text-sm text-gray-500">Create a standalone project. You can assign associates later.</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Kitchen Installation - Juhu" required />
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

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
