import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Button from '@/common/Button';
import Input from '@/common/Input';
import Icons from '@/common/Icons';

export function AddAssociateToProjectModal({ open, onClose, projectId, onUpdated }) {
  const [existingAssociates, setExistingAssociates] = useState([]);
  const [mode, setMode] = useState('select'); // 'select' or 'new'
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedAssociateId, setSelectedAssociateId] = useState('');
  const [role, setRole] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  
  // New associate form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('INSTALLER');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      fetchAssociates();
    }
  }, [open]);

  const fetchAssociates = async () => {
    try {
      const res = await api.get('/associates?limit=100');
      setExistingAssociates(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch associates');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let associateIdToLink = selectedAssociateId;

      if (mode === 'new') {
        if (!name.trim()) {
          toast.error('Name is required');
          setLoading(false);
          return;
        }
        const newAssocRes = await api.post('/associates', {
          name, phone, category, status, address, notes
        });
        if (!newAssocRes.data.success) throw new Error(newAssocRes.data.message);
        associateIdToLink = newAssocRes.data.data.id;
      } else {
        if (!associateIdToLink) {
          toast.error('Please select an associate');
          setLoading(false);
          return;
        }
      }

      const res = await api.post(`/projects/${projectId}/associates`, {
        associateId: associateIdToLink,
        role: role || undefined
      });
      
      // Update the total cut/amount for this associate
      if (totalAmount && parseFloat(totalAmount) > 0) {
        await api.put(`/projects/${projectId}/associates`, {
          associateId: associateIdToLink,
          totalAmount: parseFloat(totalAmount),
          paidAmount: 0,
          dueAmount: parseFloat(totalAmount),
          paymentStatus: 'UNPAID',
          role: role || undefined
        });
      }

      toast.success('Associate added to project successfully!');
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add associate');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-overlay-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Associate to Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icons name="X" size={20} /></button>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-md">
          <button 
            className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${mode === 'select' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setMode('select')}
          >
            Select Existing
          </button>
          <button 
            className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${mode === 'new' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setMode('new')}
          >
            Create New
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'select' ? (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Select Associate</label>
              <Input 
                type="select" 
                value={selectedAssociateId} 
                onChange={(e) => setSelectedAssociateId(e.target.value)}
                options={[
                  { value: '', label: '-- Select Associate --' },
                  ...existingAssociates.map(a => ({ value: a.id, label: `${a.name} (${a.category.replace('_', ' ')})` }))
                ]}
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Input 
                  type="select" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: "INSTALLER", label: "Installer" },
                    { value: "FABRICATOR", label: "Fabricator" },
                    { value: "ELECTRICIAN", label: "Electrician" },
                    { value: "HELPER", label: "Helper" },
                    { value: "TRANSPORT", label: "Transport" },
                    { value: "OTHER", label: "Other" },
                  ]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)} options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <Input type="textarea" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, State" className="min-h-[60px]" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <Input type="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional info..." className="min-h-[60px]" />
              </div>
            </div>
          )}

          <hr className="border-gray-100 my-4" />

          <div>
            <label className="text-sm font-medium text-gray-700">Role in this Project (Optional)</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Lead Installer" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Cut / Work Value (₹)</label>
            <Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" />
            <p className="text-xs text-gray-500 mt-1">This is how much this specific associate is owed for this project.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="solid" type="submit" disabled={loading} leftIcon={loading ? undefined : (props) => <Icons name="Check" color="white" {...props} />}>
              {loading ? 'Adding...' : 'Add to Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddExpenseModal({ open, onClose, projectId, onUpdated, associates }) {
  const [formData, setFormData] = useState({ type: 'LABOUR', description: '', amount: '', associateId: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/costs`, {
        ...formData,
        associateId: null,
        amount: parseFloat(formData.amount)
      });
      toast.success('Expense added');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-lg p-6 shadow-xl animate-scale-in">
        <h2 className="text-lg font-bold mb-4">Add Project Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Expense Type</label>
            <Input type="select" value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value}))} options={[
              { value: 'LABOUR', label: 'Labour' },
              { value: 'MATERIAL', label: 'Material' },
              { value: 'TRANSPORT', label: 'Transport' },
              { value: 'FOOD', label: 'Food' },
              { value: 'OTHER', label: 'Other' },
            ]} />
          </div>
          <div>
            <label className="label">Description</label>
            <Input value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="e.g. Travel tickets" />
          </div>
          <div>
            <label className="label">Amount (₹) *</label>
            <Input type="number" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} required />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={loading}>Add Expense</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddPaymentModal({ open, onClose, projectId, onUpdated, associates }) {
  const [formData, setFormData] = useState({ amount: '', paymentMethod: 'CASH', date: new Date().toISOString().slice(0, 10), associateId: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/payments`, {
        ...formData,
        associateId: formData.associateId || null,
        amount: parseFloat(formData.amount)
      });
      toast.success('Payment recorded');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-lg p-6 shadow-xl animate-scale-in">
        <h2 className="text-lg font-bold mb-4">Record Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Amount Paid (₹) *</label>
            <Input type="number" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} required />
          </div>
          <div>
            <label className="label">Date</label>
            <Input type="date" value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} required />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <Input type="select" value={formData.paymentMethod} onChange={e => setFormData(p => ({...p, paymentMethod: e.target.value}))} options={[
              { value: 'CASH', label: 'Cash' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { value: 'UPI', label: 'UPI' },
              { value: 'CHEQUE', label: 'Cheque' },
            ]} />
          </div>
          <div>
            <label className="label">Link to Associate (Optional)</label>
            <Input type="select" value={formData.associateId} onChange={e => setFormData(p => ({...p, associateId: e.target.value}))} options={[
              { value: '', label: '-- General Project Payment --' },
              ...associates.map(a => ({ value: a.associateId, label: a.associate?.name }))
            ]} />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={loading}>Record Payment</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditProjectModal({ open, onClose, project, onUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    customerName: '',
    location: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && project) {
      setFormData({
        name: project.name || '',
        customerName: project.customerName || '',
        location: project.location || '',
        description: project.description || '',
        date: project.date ? new Date(project.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        status: project.status || 'PENDING'
      });
    }
  }, [open, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/projects/${project.id}`, formData);
      toast.success('Project updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-lg p-6 shadow-xl animate-scale-in">
        <h2 className="text-lg font-bold mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Customer Name</label>
              <Input value={formData.customerName} onChange={e => setFormData(p => ({...p, customerName: e.target.value}))} />
            </div>
            <div>
              <label className="label">Location</label>
              <Input value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} />
            </div>
            <div>
              <label className="label">Status</label>
              <Input type="select" value={formData.status} onChange={e => setFormData(p => ({...p, status: e.target.value}))} options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
              ]} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <Input type="textarea" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={loading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditExpenseModal({ open, onClose, projectId, expense, onUpdated }) {
  const [formData, setFormData] = useState({ type: 'LABOUR', description: '', amount: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && expense) {
      setFormData({
        type: expense.type || 'LABOUR',
        description: expense.description || '',
        amount: expense.amount || ''
      });
    }
  }, [open, expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(/projects/ + projectId + /costs/ + expense.id, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Expense updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-lg p-6 shadow-xl animate-scale-in">
        <h2 className="text-lg font-bold mb-4">Edit Project Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Expense Type</label>
            <Input type="select" value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value}))} options={[
              { value: 'LABOUR', label: 'Labour' },
              { value: 'MATERIAL', label: 'Material' },
              { value: 'TRANSPORT', label: 'Transport' },
              { value: 'FOOD', label: 'Food' },
              { value: 'OTHER', label: 'Other' },
            ]} />
          </div>
          <div>
            <label className="label">Description</label>
            <Input value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="e.g. Travel tickets" />
          </div>
          <div>
            <label className="label">Amount (?) *</label>
            <Input type="number" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} required />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="solid" type="submit" isLoading={loading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
