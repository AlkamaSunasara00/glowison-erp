import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Loader from "@/common/Loader";
import dayjs from "dayjs";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import DeleteConfirmModal from '@/common/DeleteConfirmModal';
import { AddAssociateToProjectModal, AddExpenseModal, EditProjectModal, EditExpenseModal } from "./ProjectModals";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs: associates, expenses, payments
  const [activeTab, setActiveTab] = useState("associates");

  const [isAddAssociateOpen, setIsAddAssociateOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  
  const [editExpense, setEditExpense] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);

  const totalCost = project?.costItems?.reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0) || 0;

  const handleDeleteExpense = async () => {
    try {
      await api.delete(`/projects/${id}/costs/${deleteExpense.id}`);
      toast.success('Expense deleted');
      fetchProject(true);
    } catch (error) {
      toast.error('Failed to delete expensex');
    }
    setDeleteExpense(null);
  };

  const fetchProject = async (silent = false) => {
    if (!id) return;
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader text="Loading Project..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Icons name="FolderX" size={48} className="mb-4 text-gray-300" />
        <p>Project not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/associates')}>Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.push('/associates')} className="mt-1 p-1 hover:bg-gray-100 rounded-sm text-gray-500 transition-colors">
            <Icons name="ArrowLeft" size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {project.customerName ? `Customer: ${project.customerName} • ` : ''} 
              {dayjs(project.date).format("DD MMM YYYY")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => setIsEditProjectOpen(true)} leftIcon={(props) => <Icons name="Pencil" {...props} />}>
             Edit Project
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-sm p-4 border border-gray-100 shadow-sm flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Cost</p>
          <h4 className="text-xl font-black text-gray-900">₹{totalCost.toLocaleString()}</h4>
        </div>
        <div className="bg-white rounded-sm p-4 border border-gray-100 shadow-sm flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Paid</p>
          <h4 className="text-xl font-black text-emerald-600">₹{parseFloat(project.paidAmount || 0).toLocaleString()}</h4>
        </div>
        <div className="bg-white rounded-sm p-4 border border-gray-100 shadow-sm flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Due</p>
          <h4 className="text-xl font-black text-rose-600">₹{parseFloat(project.dueAmount || 0).toLocaleString()}</h4>
        </div>
        <div className="bg-white rounded-sm p-4 border border-gray-100 shadow-sm flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Associates Assigned</p>
          <h4 className="text-xl font-black text-sky-600">{project.associates?.length || 0}</h4>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        {['associates', 'expenses'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-sm border border-gray-100 shadow-sm min-h-[400px]">
        {activeTab === 'associates' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-900">Assigned Associates</h3>
               <Button variant="solid" size="sm" onClick={() => setIsAddAssociateOpen(true)} leftIcon={(props) => <Icons name="UserPlus" color="white" {...props} />}>
                 Add Associate
               </Button>
            </div>
            {project.associates?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-y border-gray-200 text-xs font-semibold text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Associate</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-right">Work Cut</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Due</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {project.associates.map(pa => (
                      <tr key={pa.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/associates/project/${pa.id}`)}>
                        <td className="px-4 py-3 font-semibold text-gray-900">{pa.associate?.name}</td>
                        <td className="px-4 py-3 text-gray-500">{pa.associate?.category}</td>
                        <td className="px-4 py-3 text-gray-500">{pa.role || '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{parseFloat(pa.totalAmount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">₹{parseFloat(pa.paidAmount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium text-rose-600">₹{parseFloat(pa.dueAmount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p>No associates assigned to this project yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="p-4 flex flex-col gap-4">
             <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-900">General Project Expenses</h3>
               <Button variant="solid" size="sm" onClick={() => setIsAddExpenseOpen(true)} leftIcon={(props) => <Icons name="Plus" color="white" {...props} />}>
                 Add Expense
               </Button>
            </div>
            {project.costItems?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-y border-gray-200 text-xs font-semibold text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {project.costItems.filter(c => !c.associateId).map(cost => (
                      <tr key={cost.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-700">{cost.type}</td>
                        <td className="px-4 py-3 text-gray-600">{cost.description || '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{parseFloat(cost.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setEditExpense(cost)} className="p-1 text-gray-400 hover:text-primary transition-colors">
                              <Icons name="Pencil" size={14} />
                            </button>
                            <button onClick={() => setDeleteExpense(cost)} className="p-1 text-gray-400 hover:text-rose-500 transition-colors">
                              <Icons name="Trash2" size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
               <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p>No general expenses recorded.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AddAssociateToProjectModal 
        open={isAddAssociateOpen} 
        onClose={() => setIsAddAssociateOpen(false)} 
        projectId={id} 
        onUpdated={() => fetchProject(true)} 
      />
      <AddExpenseModal 
        open={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        projectId={id}
        onUpdated={() => fetchProject(true)}
      />
      <EditProjectModal
        open={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        project={project}
        onUpdated={() => fetchProject(true)}
      />
      <EditExpenseModal
        open={!!editExpense}
        onClose={() => setEditExpense(null)}
        projectId={id}
        expense={editExpense}
        onUpdated={() => fetchProject(true)}
      />
      {deleteExpense && (
        <DeleteConfirmModal
          open={!!deleteExpense}
          onClose={() => setDeleteExpense(null)}
          entityName={`expense "${deleteExpense.description || deleteExpense.type}"`}
          onConfirm={handleDeleteExpense}
        />
      )}
    </div>
  );
}
