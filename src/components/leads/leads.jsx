import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddLead from "./leadsModal/AddLead";
import EditLead from "./leadsModal/EditLead";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import LeadDetail from "./LeadDetail";
import toast from "react-hot-toast";
import { formatDate } from "@/utils/formatters";

export const STAGES = [
  { key: "NEW", label: "New", color: "bg-sky-50 border-sky-200 text-sky-800" },
  { key: "CONTACTED", label: "Contacted", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  { key: "NEGOTIATION", label: "Negotiation", color: "bg-violet-50 border-violet-200 text-violet-800" },
  { key: "CLOSED_WON", label: "Won", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { key: "CLOSED_LOST", label: "Lost", color: "bg-rose-50 border-rose-200 text-rose-800" },
];



const sourceOptions = [
  { value: "all", label: "All sources" },
  { value: "INDIAMART", label: "IndiaMart" },
  { value: "JUSTDIAL", label: "JustDial" },
  { value: "WEBSITE", label: "Website" },
  { value: "GOOGLE_ADS", label: "Google Ads" },
  { value: "FACEBOOK_INSTAGRAM", label: "Facebook/Instagram" },
  { value: "REFERENCE", label: "Reference" },
  { value: "COLD_CALL", label: "Cold Call" },
  { value: "OTHER", label: "Other" },
];

const productInterestOptions = [
  { label: "Card Design", value: "CARD_DESIGN" },
  { label: "Flex Design", value: "FLEX_DESIGN" },
  { label: "Banner", value: "BANNER" },
  { label: "Sticker", value: "STICKER" },
  { label: "Signage Board", value: "SIGNAGE_BOARD" },
  { label: "Other", value: "OTHER" },
];

export const Leads = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("kanban"); // kanban or table
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [draggedLead, setDraggedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads?limit=100'); // simple all fetch for kanban
      setLeads(res.data.data.map(l => ({
        ...l, 
        stage: l.status,
        created: formatDate(l.createdAt)
      })));
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filters
  const hasActiveFilters = sourceFilter !== "all" || statusFilter !== "all";
  const filteredLeads = leads.filter((lead) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query.length === 0 || lead.name.toLowerCase().includes(query) || lead.phone.includes(query);
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesStatus = statusFilter === "all" || lead.stage === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  // KPIs
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.stage === "NEW").length;
  const wonLeads = leads.filter(l => l.stage === "CLOSED_WON").length;
  const conversionRate = totalLeads === 0 ? 0 : Math.round((wonLeads / totalLeads) * 100);
  const lostLeads = leads.filter(l => l.stage === "CLOSED_LOST").length;
  const openLeads = leads.filter(l => !["CLOSED_WON", "CLOSED_LOST"].includes(l.stage)).length;

  const handleRowClick = (lead) => {
    router.push(`/leads/${lead.id}`);
  };

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.setData("text/plain", lead.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    if (!draggedLead) return;
    
    if (draggedLead.stage !== targetStage) {
      // Optimistic update
      setLeads(prev => prev.map(l => 
        l.id === draggedLead.id ? { ...l, stage: targetStage } : l
      ));
      try {
        await api.put(`/leads/${draggedLead.id}`, {
          status: targetStage
        });
        toast.success("Stage updated");
      } catch (error) {
        toast.error("Failed to update stage");
        fetchLeads(); // revert
      }
    }
    setDraggedLead(null);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Track pipeline stages, convert prospects into customers, and manage follow-ups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
              leftIcon={(props) => <Icons name={viewMode === 'kanban' ? "List" : "LayoutGrid"} {...props} />}
            >
              {viewMode === 'kanban' ? 'List view' : 'Kanban view'}
            </Button>
            <Button
              variant="solid"
              onClick={() => setIsAddLeadOpen(true)}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
            >
              Add lead
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Leads</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalLeads}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">New Leads</p>
            <p className="mt-1 text-2xl font-bold text-sky-600">{newLeads}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{conversionRate}%</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{openLeads}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Leads Lost</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">{lostLeads}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-48">
            <Input
              type="select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              options={sourceOptions}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                ...STAGES.map(s => ({ value: s.key, label: s.label }))
              ]}
            />
          </div>
        </div>

        {/* Content */}
        {filteredLeads.length === 0 ? (
          <EmptyState
            search={search || (hasActiveFilters ? "active filters" : "")}
            entityName="Leads"
            entityIcon="Users"
            onClearSearch={() => {
              setSearch("");
              setSourceFilter("all");
              setStatusFilter("all");
            }}
            addLabel="Add lead"
          />
        ) : viewMode === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-320px)] min-h-[400px]">
            {STAGES.map(stage => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
              return (
                <div 
                  key={stage.key} 
                  className={`flex-shrink-0 w-72 rounded-lg border flex flex-col ${stage.color} bg-opacity-20`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.key)}
                >
                  <div className="p-3 font-semibold text-sm border-b border-white/40 flex justify-between items-center">
                    <span>{stage.label}</span>
                    <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{stageLeads.length}</span>
                  </div>
                  <div className="p-2 flex-1 overflow-y-auto flex flex-col gap-2">
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onClick={() => handleRowClick(lead)}
                        className="bg-white p-3 rounded shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="font-semibold text-sm text-gray-800">{lead.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Icons name="Phone" size={12} /> {lead.phone}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {lead.source === 'OTHER' ? lead.sourceOther : (sourceOptions.find(o => o.value === lead.source)?.label || lead.source)}
                          </span>
                          <span className="text-[10px] text-gray-400">{lead.created}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Lead Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Product Interest</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredLeads.map(lead => (
                    <tr 
                      key={lead.id} 
                      onClick={() => handleRowClick(lead)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <div>{lead.phone}</div>
                        <div className="text-xs">{lead.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lead.source === 'OTHER' ? lead.sourceOther : (sourceOptions.find(o => o.value === lead.source)?.label || lead.source)}</td>
                      <td className="px-4 py-3 text-gray-700">{lead.interest === 'OTHER' ? lead.interestOther : (productInterestOptions.find(o => o.value === lead.interest)?.label || lead.interest)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.stage} label={STAGES.find(s => s.key === lead.stage)?.label} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{lead.created}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(lead)} className="px-2!">
                            <Icons name="Pencil" size={16} className="text-gray-400 hover:text-indigo-600 transition-colors" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(lead)} className="px-2!">
                            <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isAddLeadOpen && <AddLead open={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} onSuccess={fetchLeads} />}
      {editItem && <EditLead open={!!editItem} onClose={() => { setEditItem(null); fetchLeads(); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/leads/${deleteItem.id}`);
              toast.success("Lead deleted");
              setLeads(leads.filter(l => l.id !== deleteItem.id));
            } catch (err) {
              toast.error("Failed to delete lead");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Leads;
