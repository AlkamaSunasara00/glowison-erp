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
import toast from "react-hot-toast";
import { formatDate } from "@/utils/formatters";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";

const STAGES = [
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('leadsViewMode') || 'kanban';
    }
    return 'kanban';
  });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalLeads: 0, newLeads: 0, wonLeads: 0, lostLeads: 0, openLeads: 0 });

  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [draggedLead, setDraggedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from URL query
  useEffect(() => {
    if (router.isReady && !isInitialized) {
      if (router.query.page) setPage(parseInt(router.query.page) || 1);
      if (router.query.search) {
        setSearch(router.query.search);
        setDebouncedSearch(router.query.search);
      }
      if (router.query.source) setSourceFilter(router.query.source);
      if (router.query.status) setStatusFilter(router.query.status);
      setIsInitialized(true);
    }
  }, [router.isReady, isInitialized, router.query]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  const fetchLeads = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/leads', {
        params: {
          page,
          limit: viewMode === 'kanban' ? 100 : 10,
          search: debouncedSearch,
          source: sourceFilter,
          status: statusFilter
        }
      });
      const mapped = res.data.data.map(l => ({
        ...l, 
        stage: l.status,
        created: formatDate(l.createdAt)
      }));
      setLeads(mapped);
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    fetchLeads();

    const query = {};
    if (page > 1) query.page = page;
    if (debouncedSearch) query.search = debouncedSearch;
    if (sourceFilter !== 'all') query.source = sourceFilter;
    if (statusFilter !== 'all') query.status = statusFilter;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [page, debouncedSearch, sourceFilter, statusFilter, viewMode, isInitialized]);

  const hasActiveFilters = sourceFilter !== "all" || statusFilter !== "all" || debouncedSearch !== "";

  // KPIs
  const conversionRate = stats.totalLeads === 0 ? 0 : Math.round((stats.wonLeads / stats.totalLeads) * 100);

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
    <div className="flex flex-col min-h-screen w-full relative gap-4 pb-10">
      <div className="flex flex-col gap-4 rounded-sm">
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
              onClick={() => {
                const newMode = viewMode === 'kanban' ? 'table' : 'kanban';
                setViewMode(newMode);
                setPage(1); // Reset page on view switch
                if (typeof window !== 'undefined') localStorage.setItem('leadsViewMode', newMode);
              }}
              leftIcon={(props) => <Icons name={viewMode === 'kanban' ? "List" : "LayoutGrid"} {...props} />}
              className="rounded-sm"
            >
              {viewMode === 'kanban' ? 'List view' : 'Kanban view'}
            </Button>
            <Button
              variant="solid"
              onClick={() => setIsAddLeadOpen(true)}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
              className="rounded-sm px-4 py-2.5 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Add lead
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icons name="Users" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Leads</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalLeads}</h4>
            </div>
          </div>
          
          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Icons name="UserPlus" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">New Leads</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.newLeads}</h4>
            </div>
          </div>

          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Icons name="TrendingUp" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Conversion</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{conversionRate}%</h4>
            </div>
          </div>

          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
              <Icons name="Activity" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">In Progress</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.openLeads}</h4>
            </div>
          </div>

          <div className="bg-white rounded-sm p-5 shadow-sm border border-gray-100 flex flex-col justify-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Icons name="UserMinus" size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Leads Lost</p>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{stats.lostLeads}</h4>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-sm border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
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
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              options={sourceOptions}
            />
          </div>
          <div className="w-full md:w-48">
             <Input
              type="select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={[
                { value: "all", label: "All Statuses" },
                ...STAGES.map(s => ({ value: s.key, label: s.label }))
              ]}
            />
          </div>
        </div>

        {/* Content */}
        {viewMode === 'kanban' ? (
          <div className="flex flex-col flex-1 relative">
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-320px)] min-h-[400px]">
              {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
                  <Loader text="Loading Leads..." />
                </div>
              )}
              {STAGES.map(stage => {
                const stageLeads = leads.filter(l => l.stage === stage.key);
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
                      {!loading && stageLeads.length === 0 && (
                        <div className="text-xs text-center text-gray-400 p-4 opacity-50">Drop leads here</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {totalPages > 1 && (
               <Pagination 
                 currentPage={page} 
                 totalPages={totalPages} 
                 onPageChange={(newPage) => setPage(newPage)} 
               />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              {loading && (
                <div className="absolute inset-0 top-[40px] z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <Loader text="Loading Leads..." />
                </div>
              )}
              <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                <thead className="bg-primary border-b border-primary/20 text-xs font-semibold text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">Lead Info</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Product Interest</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-center rounded-tr-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {!loading && leads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-0">
                        <EmptyState
                          search={search || (hasActiveFilters ? "active filters" : "")}
                          entityName="Leads"
                          entityIcon="Users"
                          onClearSearch={() => {
                            setSearch("");
                            setSourceFilter("all");
                            setStatusFilter("all");
                            setPage(1);
                          }}
                          addLabel="Add lead"
                        />
                      </td>
                    </tr>
                  ) : (
                    leads.map(lead => (
                      <tr 
                        key={lead.id} 
                        onClick={() => handleRowClick(lead)}
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{lead.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 font-medium">{lead.phone}</span>
                            {lead.email && <span className="text-[10px] text-gray-400">· {lead.email}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                            {lead.source === 'OTHER' ? lead.sourceOther : (sourceOptions.find(o => o.value === lead.source)?.label || lead.source)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600">
                            {lead.interest === 'OTHER' ? lead.interestOther : (productInterestOptions.find(o => o.value === lead.interest)?.label || lead.interest)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.stage} label={STAGES.find(s => s.key === lead.stage)?.label} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">{lead.created}</td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditItem(lead)} className="px-2! rounded-sm hover:bg-indigo-50">
                              <Icons name="Pencil" size={14} className="text-gray-400 hover:text-indigo-600 transition-colors" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteItem(lead)} className="px-2! rounded-sm hover:bg-rose-50">
                              <Icons name="Trash2" size={14} className="text-gray-400 hover:text-rose-500 transition-colors" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={(newPage) => setPage(newPage)} 
            />
          </div>
        )}
      </div>

      {isAddLeadOpen && <AddLead open={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} onSuccess={() => fetchLeads(true)} />}
      {editItem && <EditLead open={!!editItem} onClose={() => setEditItem(null)} onSuccess={() => fetchLeads(true)} initialData={editItem} />}
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
