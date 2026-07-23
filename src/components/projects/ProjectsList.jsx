import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";
import AddProjectModal from "./AddProjectModal";
import dayjs from "dayjs";

export default function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchProjects = async (silent = false) => {
    try {
      if (!silent && projects.length === 0) setLoading(true);
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 max-w-md">
            Manage your standalone projects, assign multiple associates, and track project-wide expenses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="solid" onClick={() => setIsAddOpen(true)} leftIcon={(props) => <Icons name="Plus" color="white" {...props} />}>
            New Project
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Projects</p>
          <h4 className="text-2xl font-black text-gray-900 tracking-tight">{projects.length}</h4>
        </div>
        <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Cost</p>
          <h4 className="text-2xl font-black text-gray-900 tracking-tight">₹{projects.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0).toLocaleString()}</h4>
        </div>
        <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Paid</p>
          <h4 className="text-2xl font-black text-emerald-600 tracking-tight">₹{projects.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0).toLocaleString()}</h4>
        </div>
        <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Due</p>
          <h4 className="text-2xl font-black text-rose-600 tracking-tight">₹{projects.reduce((sum, p) => sum + Number(p.dueAmount || 0), 0).toLocaleString()}</h4>
        </div>
      </div>

      <div className="bg-white p-3 rounded-sm border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-64">
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
          />
        </div>
      </div>

      <div className="bg-white rounded-sm border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader text="Loading Projects..." />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <EmptyState
              entityName="Projects"
              entityIcon="Folder"
              addLabel="Create Project"
              onAdd={() => setIsAddOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
              <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Project Name</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Associates</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Due</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredProjects.map((p) => (
                  <tr 
                    key={p.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/projects/${p.id}`)}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.customerName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{dayjs(p.date).format("DD MMM YYYY")}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">
                      <div className="flex -space-x-2 overflow-hidden justify-center">
                        {p.associates?.length > 0 ? p.associates.map(pa => (
                          <div key={pa.id} title={pa.associate?.name} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {(pa.associate?.name || "N").substring(0, 2).toUpperCase()}
                          </div>
                        )) : <span className="text-gray-400 font-normal">None</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{parseFloat(p.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">₹{parseFloat(p.paidAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-600">₹{parseFloat(p.dueAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <AddProjectModal 
        open={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onUpdated={() => fetchProjects(true)} 
      />
    </div>
  );
}
