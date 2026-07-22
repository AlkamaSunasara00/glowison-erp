import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Button from '@/common/Button';
import Icons from '@/common/Icons';
import StatusBadge from '@/common/StatusBadge';
import Input from '@/common/Input';
import Loader from '@/common/Loader';
import DeleteConfirmModal from '@/common/DeleteConfirmModal';
import EditProject from './associateModal/EditProject';

const costTypeOptions = [
  { value: "LABOUR", label: "Labour" },
  { value: "MATERIAL", label: "Material" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "CRANE", label: "Crane" },
  { value: "HELPER", label: "Helper" },
  { value: "FOOD", label: "Food" },
  { value: "ACCOMMODATION", label: "Accommodation" },
  { value: "OTHER", label: "Other" },
];

const paymentMethodOptions = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const ProjectDetail = ({ projectId }) => {
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cost breakdown state
  const [costItems, setCostItems] = useState([]);
  const [savingCosts, setSavingCosts] = useState(false);

  // Payment state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'CASH', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [savingPayment, setSavingPayment] = useState(false);
  const [deletePayment, setDeletePayment] = useState(null);

  // Edit project state
  const [showEditProject, setShowEditProject] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchProject = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/associates/projects/${projectId}`);
      setProject(res.data.data);
      const items = res.data.data.costItems?.map(ci => ({
        id: ci.id,
        type: ci.type,
        description: ci.description || '',
        quantity: parseFloat(ci.quantity),
        rate: parseFloat(ci.rate),
        amount: parseFloat(ci.amount)
      })) || [];
      setCostItems(items);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId]);

  // ── Cost Breakdown Handlers ──
  const addCostRow = () => {
    setCostItems(prev => [...prev, { type: 'LABOUR', description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeCostRow = (index) => {
    setCostItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateCostRow = (index, field, value) => {
    setCostItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'rate') {
        const qty = parseFloat(field === 'quantity' ? value : updated[index].quantity) || 0;
        const rate = parseFloat(field === 'rate' ? value : updated[index].rate) || 0;
        updated[index].amount = qty * rate;
      }
      return updated;
    });
  };

  const costTotal = costItems.reduce((sum, ci) => sum + (ci.amount || 0), 0);

  const saveCosts = async () => {
    try {
      setSavingCosts(true);
      await api.post(`/associates/projects/${projectId}/costs`, { items: costItems });
      toast.success('Cost breakdown saved');
      fetchProject(true);
    } catch (error) {
      toast.error('Failed to save costs');
    } finally {
      setSavingCosts(false);
    }
  };

  // ── Payment Handlers ──
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount);
    
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    
    const dueAmount = parseFloat(project.dueAmount || 0);
    if (amount > dueAmount) {
      toast.error(`Cannot pay more than the due amount (₹${dueAmount.toLocaleString()}). Add cost items first to increase the due amount.`);
      return;
    }

    try {
      setSavingPayment(true);
      await api.post(`/associates/projects/${projectId}/payments`, paymentForm);
      toast.success('Payment recorded');
      setPaymentForm({ amount: '', paymentMethod: 'CASH', date: new Date().toISOString().slice(0, 10), notes: '' });
      setShowPaymentForm(false);
      fetchProject(true);
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async () => {
    try {
      await api.delete(`/associates/projects/${projectId}/payments?paymentId=${deletePayment.id}`);
      toast.success('Payment deleted');
      fetchProject(true);
    } catch (error) {
      toast.error('Failed to delete payment');
    }
    setDeletePayment(null);
  };

  // ── Status Update ──
  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/associates/projects/${projectId}`, { status: newStatus });
      toast.success('Status updated');
      fetchProject(true);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openEditProject = () => {
    setShowEditProject(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center bg-transparent">
        <Loader text="Loading project details..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
        <h3 className="text-base font-bold text-gray-950">Project not found</h3>
        <button onClick={() => router.back()} className="mt-4 rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/95">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-transparent animate-fade-in pb-10">
      {/* ── HEADER ─────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <Icons name="ArrowLeft" size={18} />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 sm:px-6 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-violet-50 to-white text-violet-600 shadow-sm border border-violet-100/50">
               <Icons name="FolderOpen" size={28} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex flex-wrap items-center gap-2">
                {project.projectName}
                <StatusBadge status={project.status} />
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                  <Icons name="Calendar" size={12}/> {new Date(project.date).toLocaleDateString('en-IN')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                  <Icons name="User" size={12}/> {project.associate?.name}
                </span>
                {project.order && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                    <Icons name="Package" size={12}/> Order {String(project.order.orderNumber).startsWith('ORD-') ? project.order.orderNumber : `ORD-${String(project.order.orderNumber).padStart(6, '0')}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={(props) => <Icons name="Pencil" {...props} />}
              className="rounded-sm px-3 py-2 text-xs font-semibold"
              onClick={openEditProject}
            >
              Edit Project
            </Button>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="text-xs font-bold rounded-sm border border-gray-200 bg-white px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer uppercase tracking-wider"
            >
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────── */}
      <div className="flex-1 mt-4 px-4 sm:px-0">
        <div className="flex flex-col gap-4 w-full">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900"><span className="text-sm opacity-70 mr-0.5">₹</span>{parseFloat(project.totalAmount).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Paid</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600"><span className="text-sm opacity-70 mr-0.5">₹</span>{parseFloat(project.paidAmount).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Due</p>
              <p className="text-xl sm:text-2xl font-black text-rose-600"><span className="text-sm opacity-70 mr-0.5">₹</span>{parseFloat(project.dueAmount).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Status</p>
              <StatusBadge status={project.paymentStatus} />
            </div>
          </div>

          {/* Project Info */}
          {(project.customerName || project.location || project.description) && (
            <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2 mb-4">
                <Icons name="Info" size={14} className="text-primary"/> Project Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {project.customerName && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-semibold text-gray-900">{project.customerName}</p>
                  </div>
                )}
                {project.location && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{project.location}</p>
                  </div>
                )}
                {project.description && (
                  <div className="sm:col-span-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── COST BREAKDOWN ──────────────────────── */}
          <section className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2">
                <Icons name="Calculator" size={14} className="text-primary"/> Cost Breakdown
              </h3>
              <span className="text-sm font-black text-gray-900">Total: ₹{costTotal.toLocaleString()}</span>
            </div>

            {costItems.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                  <Icons name="Calculator" size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-3">No cost items yet</p>
                <Button variant="outline" size="sm" onClick={addCostRow} className="mt-3 text-xs" leftIcon={(props) => <Icons name="Plus" {...props} />}>
                  Add First Item
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile: card-based cost view */}
                <div className="sm:hidden divide-y divide-gray-50">
                  {costItems.map((item, idx) => (
                    <div key={idx} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <select value={item.type} onChange={(e) => updateCostRow(idx, 'type', e.target.value)} className="text-xs border border-gray-200 rounded-sm px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30">
                          {costTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button type="button" onClick={() => removeCostRow(idx)} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
                          <Icons name="Trash2" size={14} />
                        </button>
                      </div>
                      <input value={item.description} onChange={(e) => updateCostRow(idx, 'description', e.target.value)} className="w-full text-xs border border-gray-200 rounded-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Description..." />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Qty</p>
                          <input type="number" value={item.quantity} onChange={(e) => updateCostRow(idx, 'quantity', e.target.value)} min="0" step="0.01" className="w-full text-xs border border-gray-200 rounded-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Rate</p>
                          <input type="number" value={item.rate} onChange={(e) => updateCostRow(idx, 'rate', e.target.value)} min="0" step="0.01" className="w-full text-xs border border-gray-200 rounded-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Amount</p>
                          <p className="text-sm font-bold text-gray-900 py-1.5">₹{(item.amount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px] whitespace-nowrap">
                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-40">Type</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 w-24 text-right">Qty</th>
                        <th className="px-4 py-3 w-28 text-right">Rate (₹)</th>
                        <th className="px-4 py-3 w-28 text-right">Amount (₹)</th>
                        <th className="px-4 py-3 w-14 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {costItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                          <td className="px-4 py-2">
                            <select value={item.type} onChange={(e) => updateCostRow(idx, 'type', e.target.value)} className="w-full text-xs border border-gray-200 rounded-sm px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30">
                              {costTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input value={item.description} onChange={(e) => updateCostRow(idx, 'description', e.target.value)} className="w-full text-xs border border-gray-200 rounded-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Details..." />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={item.quantity} onChange={(e) => updateCostRow(idx, 'quantity', e.target.value)} min="0" step="0.01" className="w-full text-xs border border-gray-200 rounded-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-primary/30" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={item.rate} onChange={(e) => updateCostRow(idx, 'rate', e.target.value)} min="0" step="0.01" className="w-full text-xs border border-gray-200 rounded-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-primary/30" />
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-gray-900">
                            ₹{(item.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button type="button" onClick={() => removeCostRow(idx)} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
                              <Icons name="Trash2" size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Row button BELOW the table, Save on right */}
                <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                  <Button variant="outline" size="sm" onClick={addCostRow} className="text-xs" leftIcon={(props) => <Icons name="Plus" {...props} />}>
                  Add Row
                </Button>
                  <Button variant="solid" size="sm" onClick={saveCosts} isLoading={savingCosts} className="text-xs">
                    Save Cost Breakdown
                  </Button>
                </div>
              </>
            )}
          </section>

          {/* ── PAYMENT SECTION ─────────────────────── */}
          <section className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2">
                <Icons name="IndianRupee" size={14} className="text-primary"/> Payment History
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowPaymentForm(!showPaymentForm)} className="text-xs" leftIcon={(props) => <Icons name={showPaymentForm ? "X" : "Plus"} {...props} />}>
                {showPaymentForm ? 'Cancel' : 'Add Payment'}
              </Button>
            </div>

            {/* Add Payment Form */}
            {showPaymentForm && (
              <form onSubmit={handlePaymentSubmit} className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="label">Amount (₹) <span className="required">*</span></label>
                    <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))} min="0" step="0.01" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Method</label>
                    <Input type="select" value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))} options={paymentMethodOptions} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Date</label>
                    <Input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Notes</label>
                    <Input value={paymentForm.notes} onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Optional" />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="solid" size="sm" type="submit" isLoading={savingPayment} className="text-xs">
                    Record Payment
                  </Button>
                </div>
              </form>
            )}

            {/* Payment History Table */}
            {(!project.payments || project.payments.length === 0) ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                  <Icons name="IndianRupee" size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No payments recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px] whitespace-nowrap">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 sm:px-5 py-3">Date</th>
                      <th className="px-4 sm:px-5 py-3 text-right">Amount</th>
                      <th className="px-4 sm:px-5 py-3">Method</th>
                      <th className="px-4 sm:px-5 py-3">Notes</th>
                      <th className="px-4 sm:px-5 py-3 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {project.payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 sm:px-5 py-3 text-gray-600">
                          <div className="flex items-center gap-1 text-xs font-medium"><Icons name="Calendar" size={10} /> {new Date(payment.date).toLocaleDateString('en-IN')}</div>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-right font-bold text-emerald-600">₹{parseFloat(payment.amount).toLocaleString()}</td>
                        <td className="px-4 sm:px-5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-gray-50 border border-gray-100 text-gray-700">
                            {payment.paymentMethod?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-gray-500 text-xs">{payment.notes || '—'}</td>
                        <td className="px-4 sm:px-5 py-3 text-center">
                          <button
                            onClick={() => setDeletePayment(payment)}
                            className="w-7 h-7 rounded-sm bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors mx-auto"
                            title="Delete payment"
                          >
                            <Icons name="Trash2" size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditProject && (
        <EditProject 
          open={showEditProject} 
          onClose={() => { setShowEditProject(false); fetchProject(true); }} 
          project={project} 
        />
      )}

      {/* Delete Payment Confirm */}
      {deletePayment && (
        <DeleteConfirmModal
          open={!!deletePayment}
          onClose={() => setDeletePayment(null)}
          entityName={`₹${parseFloat(deletePayment.amount).toLocaleString()} payment`}
          onConfirm={handleDeletePayment}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
