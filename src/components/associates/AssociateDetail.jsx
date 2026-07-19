import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Button from '@/common/Button';
import Icons from '@/common/Icons';
import StatusBadge from '@/common/StatusBadge';
import EditAssociate from './associateModal/EditAssociate';
import AddProject from './associateModal/AddProject';
import EditProject from './associateModal/EditProject';
import DeleteConfirmModal from '@/common/DeleteConfirmModal';
import Loader from '@/common/Loader';

const AssociateDetail = ({ open, itemId, onClose, onUpdated, isPage = false }) => {
  const router = useRouter();
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  const fetchAssociate = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/associates/${itemId}`);
      setAssociate(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load associate details");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (open && itemId) {
      fetchAssociate();
    }
  }, [open, itemId]);

  useEffect(() => {
    if (!isPage) {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [open, isPage]);

  if (!open && !isPage) return null;

  const handleClose = () => {
    if (isPage) {
      router.push("/associates");
    } else {
      if (onClose) onClose();
    }
  };

  const handleUpdated = () => {
    fetchAssociate();
    if (onUpdated) onUpdated();
  };

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col w-full min-h-screen bg-transparent animate-fade-in pb-10" : `relative flex h-full w-full max-w-full flex-col bg-gray-50 shadow-2xl md:w-[95%] md:max-w-6xl md:h-[95vh] md:rounded-sm md:my-auto mx-auto overflow-hidden ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {loading || !associate ? (
        <div className="flex flex-1 w-full h-full min-h-[400px] items-center justify-center bg-transparent">
          <Loader text="Loading associate details..." />
        </div>
      ) : (
        <>
          {/* ── HEADER ─────────────────────────────── */}
          <div className="shrink-0 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <Icons name="ArrowLeft" size={18} />
                <span>{isPage ? "Back to Associates" : "Close"}</span>
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-50 to-white text-3xl font-black text-indigo-600 shadow-sm border border-indigo-100/50 relative overflow-hidden">
                   <span>{(associate.name || 'A').substring(0, 2).toUpperCase()}</span>
                   <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    {associate.name}
                    <StatusBadge status={associate.status} />
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      <Icons name="Wrench" size={12}/> {associate.category?.replace('_', ' ')}
                    </span>
                    {associate.phone && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          <Icons name="Phone" size={12}/> {associate.phone}
                        </span>
                        <a href={`tel:${associate.phone}`} className="w-7 h-7 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-100" title="Call">
                          <Icons name="Phone" size={12} />
                        </a>
                        <a href={`https://wa.me/${associate.phone.replace(/\\D/g,'')}`} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors border border-emerald-100" title="WhatsApp">
                          <Icons name="MessageCircle" size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={(props) => <Icons name="Pencil" {...props} />}
                  className="rounded-sm px-3 py-2 text-xs font-semibold"
                  onClick={() => setIsEditOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="solid"
                  size="sm"
                  leftIcon={(props) => <Icons name="Plus" color="white" {...props} />}
                  className="rounded-sm px-3 py-2 text-xs font-semibold shadow-sm shadow-primary/20"
                  onClick={() => setIsAddProjectOpen(true)}
                >
                  Add Project
                </Button>
              </div>
            </div>
          </div>

          {/* ── BODY ───────────────────────────────── */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPage ? '' : 'p-6'}`}>
            <div className={`flex flex-col gap-4 w-full h-full ${isPage ? 'mt-4' : ''}`}>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{associate.totalProjects}</p>
                </div>
                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Work Amount</p>
                  <p className="text-2xl font-bold text-gray-900"><span className="text-sm opacity-70 mr-1">₹</span>{associate.totalWorkAmount?.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-emerald-600"><span className="text-sm opacity-70 mr-1">₹</span>{associate.totalPaid?.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Total Due</p>
                  <p className="text-2xl font-bold text-rose-600"><span className="text-sm opacity-70 mr-1">₹</span>{associate.totalDue?.toLocaleString()}</p>
                </div>
              </div>

              {/* Projects Table */}
              <section className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2">
                    <Icons name="FolderOpen" size={16} className="text-primary"/> Projects
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">{associate.projects?.length || 0} entries</span>
                </div>

                {(!associate.projects || associate.projects.length === 0) ? (
                  <div className="p-12 text-center">
                    <Icons name="FolderOpen" size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No projects yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create a project to start tracking work.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Project</th>
                          <th className="px-4 py-3">Order #</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-right">Paid</th>
                          <th className="px-4 py-3 text-right">Due</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {associate.projects.map(project => (
                          <tr 
                            key={project.id} 
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/associates/project/${project.id}`)}
                          >
                            <td className="px-4 py-3 text-gray-500">
                              <div className="flex items-center gap-1 text-xs"><Icons name="Calendar" size={10} /> {new Date(project.date).toLocaleDateString('en-CA')}</div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{project.projectName}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {project.order ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 border border-blue-100 text-blue-700">
                                  ORD-{String(project.order.orderNumber).padStart(6, '0')}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{parseFloat(project.totalAmount).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-semibold">₹{parseFloat(project.paidAmount).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-rose-600 font-semibold">₹{parseFloat(project.dueAmount).toLocaleString()}</td>
                            <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setEditProject(project)} className="px-2!">
                                  <Icons name="Pencil" size={16} className="text-gray-400 hover:text-primary transition-colors" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteProject(project)} className="px-2!">
                                  <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Info Sidebar */}
              {associate.address && (
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-3">
                    <Icons name="MapPin" size={16} className="text-primary"/> Address
                  </h3>
                  <p className="text-sm text-gray-600">{associate.address}</p>
                </section>
              )}
              {associate.notes && (
                <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-3">
                    <Icons name="FileText" size={16} className="text-primary"/> Notes
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{associate.notes}</p>
                </section>
              )}
            </div>
          </div>
        </>
      )}

      {isEditOpen && (
        <EditAssociate
          open={isEditOpen}
          onClose={() => { setIsEditOpen(false); fetchAssociate(true); }}
          initialData={associate}
        />
      )}
      {isAddProjectOpen && (
        <AddProject
          open={isAddProjectOpen}
          onClose={() => { setIsAddProjectOpen(false); fetchAssociate(true); }}
          associateId={itemId}
          associateName={associate?.name}
        />
      )}
      {editProject && (
        <EditProject
          open={!!editProject}
          onClose={() => { setEditProject(null); fetchAssociate(true); }}
          project={editProject}
        />
      )}
      {deleteProject && (
        <DeleteConfirmModal
          open={!!deleteProject}
          onClose={() => setDeleteProject(null)}
          entityName={deleteProject.projectName}
          onConfirm={async () => {
            try {
              await api.delete(`/associates/projects/${deleteProject.id}`);
              toast.success("Project deleted");
              handleUpdated();
            } catch (err) {
              toast.error("Failed to delete project");
            }
            setDeleteProject(null);
          }}
        />
      )}
    </div>
  );

  if (isPage) return detailPanelContent;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] ${
          open ? "animate-overlay-in" : "animate-overlay-out"
        }`}
        onClick={handleClose}
      />
      {detailPanelContent}
    </div>
  );
};

export default AssociateDetail;
