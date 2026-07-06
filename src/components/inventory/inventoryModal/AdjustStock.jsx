import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const AdjustStock = ({ open, onClose, item }) => {
  const [formData, setFormData] = useState({
    action: "add",
    qty: "",
    reason: "",
  });

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const qty = Number(formData.qty);
      const adjustmentQuantity = formData.action === "add" ? qty : -qty;
      
      if (item.stock + adjustmentQuantity < 0) {
        toast.error("Stock cannot be negative");
        setIsSubmitting(false);
        return;
      }

      await api.post(`/inventory/${item.id}/adjust`, { quantity: adjustmentQuantity, note: formData.reason });
      toast.success('Stock adjusted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to adjust stock');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

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
        className={`relative flex h-full w-full max-w-md flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg md:h-auto md:max-h-[90vh] ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Adjust Stock</h2>
              <p className="mt-1 text-xs text-gray-500">{item.name} ({item.sku})</p>
            </div>
            <button type="button" onClick={onClose}>
              <Icons name="X" size={18} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            
            <div className="mb-5 flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-sm font-medium text-gray-700">Current Stock</span>
              <span className="text-lg font-bold text-gray-900">{item.stock}</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="action" value="add" checked={formData.action === 'add'} onChange={handleChange} className="text-emerald-600 focus:ring-emerald-600 h-4 w-4" />
                    <span className="text-sm font-medium text-gray-700">Add Stock</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="action" value="remove" checked={formData.action === 'remove'} onChange={handleChange} className="text-rose-600 focus:ring-rose-600 h-4 w-4" />
                    <span className="text-sm font-medium text-gray-700">Remove Stock</span>
                 </label>
              </div>

              <div className="space-y-1.5">
                <label className="label">Quantity <span className="required">*</span></label>
                <Input type="number" name="qty" value={formData.qty} onChange={handleChange} min="1" required />
              </div>

              <div className="space-y-1.5">
                <label className="label">Reason (Optional)</label>
                <Input name="reason" value={formData.reason} onChange={handleChange} placeholder="e.g. New purchase, Damage, etc." />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={isSubmitting} disabled={isSubmitting} className={formData.action === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}>
              {formData.action === 'add' ? 'Add' : 'Remove'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStock;
