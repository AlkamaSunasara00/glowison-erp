import React, { useEffect, useRef, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const COLUMNS = [
  {
    key: "new",
    label: "New",
    color: "bg-sky-400",
    light: "bg-sky-50/100",
    border: "border-sky-100",
    pipeline: "Rs. 0 pipeline",
  },
  {
    key: "contacted",
    label: "Contacted",
    color: "bg-indigo-400",
    light: "bg-indigo-50/100",
    border: "border-indigo-100",
    pipeline: "Rs. 3.2L pipeline",
  },
  {
    key: "demo",
    label: "Demo",
    color: "bg-amber-400",
    light: "bg-amber-50/100",
    border: "border-amber-100",
    pipeline: "Rs. 6.1L pipeline",
  },
  {
    key: "negotiation",
    label: "Negotiation",
    color: "bg-violet-400",
    light: "bg-violet-50/100",
    border: "border-violet-100",
    pipeline: "Rs. 5.8L pipeline",
  },
  {
    key: "won",
    label: "Won",
    color: "bg-emerald-400",
    light: "bg-emerald-50/100",
    border: "border-emerald-100",
    pipeline: "Rs. 8.4L won",
  },
  {
    key: "lost",
    label: "Lost",
    color: "bg-rose-400",
    light: "bg-rose-50/100",
    border: "border-rose-100",
    pipeline: "Rs. 1.1L lost",
  },
  {
    key: "not-interested",
    label: "Not interested",
    color: "bg-slate-400",
    light: "bg-slate-50/100",
    border: "border-slate-100",
    pipeline: "",
  },
];

const ASSIGNEE_OPTIONS = [
  { label: "Arjun Patel", value: "AP" },
  { label: "Sneha Mehta", value: "SM" },
  { label: "Rohit Shah", value: "RS" },
  { label: "Neel Joshi", value: "NJ" },
];

const ASSIGNEE_LABELS = {
  AP: "Arjun Patel",
  SM: "Sneha Mehta",
  RS: "Rohit Shah",
  NJ: "Neel Joshi",
};

// Simplified tag color helper to keep styles premium and cohesive
const getTagStyles = (tag) => {
  if (!tag) return "";
  const t = tag.toLowerCase();
  if (t.includes("overdue") || t.includes("urgent") || t.includes("budget") || t.includes("lost")) {
    return "bg-rose-50 text-rose-700 border border-rose-100/80";
  }
  if (t.includes("won") || t.includes("success") || t.includes("quotation")) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-100/80";
  }
  if (t.includes("pending") || t.includes("meeting") || t.includes("demo")) {
    return "bg-amber-50 text-amber-700 border border-amber-100/80";
  }
  return "bg-slate-100 text-slate-700 border border-slate-200/60";
};

const INITIAL_LEADS = [
  {
    id: 1,
    col: "new",
    doctor: "Dr. Neel Joshi",
    clinic: "NJ Aesthetics, Surat",
    tag: "WhatsApp",
    tagCls: "bg-blue-50 text-blue-700",
    initials: "SM",
    cost: "Rs. 0",
    days: "2d",
  },
  {
    id: 2,
    col: "new",
    doctor: "Dr. Foram Desai",
    clinic: "Skin Lab, Gandhinagar",
    tag: null,
    tagCls: "",
    initials: "AP",
    cost: "Rs. 200",
    days: "3d",
  },
  {
    id: 3,
    col: "contacted",
    doctor: "Dr. Ritu Patel",
    clinic: "Patel Skin Centre, Gandhinagar",
    tag: "Meeting Jun 4",
    tagCls: "bg-teal-50 text-teal-700",
    initials: "SM",
    cost: "Rs. 1,100",
    days: "6d",
  },
  {
    id: 4,
    col: "contacted",
    doctor: "Dr. Hiren Shah",
    clinic: "Shah Derm, Rajkot",
    tag: null,
    tagCls: "",
    initials: "RS",
    cost: "Rs. 850",
    days: "4d",
  },
  {
    id: 5,
    col: "contacted",
    doctor: "Dr. Anita Desai",
    clinic: "Glow Skin Clinic, Baroda",
    tag: "Intro overdue",
    tagCls: "bg-red-50 text-red-600",
    initials: "RS",
    cost: "Rs. 0",
    days: "1d",
  },
  {
    id: 6,
    col: "demo",
    doctor: "Dr. Priya Sharma",
    clinic: "Sharma Skin Clinic, Ahmedabad",
    tag: "HydraFacial",
    tagCls: "bg-amber-50 text-amber-700",
    initials: "AP",
    cost: "Rs. 2,925",
    days: "9d",
    tag2: "Joint",
  },
  {
    id: 7,
    col: "demo",
    doctor: "Dr. Payal Modi",
    clinic: "Modi Wellness, Anand",
    tag: "HIFU",
    tagCls: "bg-orange-50 text-orange-700",
    initials: "RS",
    cost: "Rs. 1,600",
    days: "7d",
  },
  {
    id: 8,
    col: "negotiation",
    doctor: "Dr. Karan Mehta",
    clinic: "Mehta Dermatology, Surat",
    tag: "Follow-up call",
    tagCls: "bg-violet-50 text-violet-700",
    initials: "SM",
    cost: "Rs. 6,800",
    days: "14d",
  },
  {
    id: 9,
    col: "negotiation",
    doctor: "Dr. Sonal Trivedi",
    clinic: "Trivedi Clinics, Vadodara",
    tag: null,
    tagCls: "",
    initials: "AP",
    cost: "Rs. 4,200",
    days: "11d",
  },
  {
    id: 10,
    col: "won",
    doctor: "Dr. Vikas Joshi",
    clinic: "Joshi Aesthetics, Rajkot",
    tag: "Quotation sent",
    tagCls: "bg-emerald-50 text-emerald-700",
    initials: "AP",
    cost: "Rs. 9,500",
    days: "23d",
  },
  {
    id: 11,
    col: "won",
    doctor: "Dr. Mona Kapoor",
    clinic: "Kapoor Skin Studio, Ahmedabad",
    tag: "Payment pending",
    tagCls: "bg-amber-50 text-amber-700",
    initials: "SM",
    cost: "Rs. 7,200",
    days: "18d",
  },
  {
    id: 12,
    col: "lost",
    doctor: "Dr. Raj Agarwal",
    clinic: "Agarwal Clinic, Surat",
    tag: "Budget issue",
    tagCls: "bg-red-50 text-red-600",
    initials: "RS",
    cost: "Rs. 3,100",
    days: "30d",
  },
  {
    id: 13,
    col: "not-interested",
    doctor: "Dr. Bharat Lal",
    clinic: "BL Clinic, Mehsana",
    tag: "Re-engage later",
    tagCls: "bg-gray-100 text-gray-500",
    initials: "RS",
    cost: "Rs. 800",
    days: "45d",
  },
];

const LeadCard = ({ lead, column, onDragStart, onDragEnd, isDragging, onMoveLead }) => (
  <article
    draggable
    onDragStart={(event) => onDragStart(event, lead)}
    onDragEnd={onDragEnd}
    className={`group relative rounded-sm border border-slate-200/60 bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-200 select-none ${
      isDragging
        ? "scale-[0.98] cursor-grabbing opacity-40"
        : "cursor-grab hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(15,23,42,0.06)] hover:border-slate-300/80"
    }`}
  >
    {/* Thin status strip on top */}
    <div className={`absolute inset-x-0 top-0 h-[2.5px] rounded-t-xl ${column.color}`} />

    <div className="pt-1">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {(lead.tag || lead.tag2) && (
            <div className="mb-1.5 flex flex-wrap gap-1">
              {lead.tag && (
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold border ${getTagStyles(lead.tag)}`}
                >
                  {lead.tag}
                </span>
              )}
              {lead.tag2 && (
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold border ${getTagStyles(lead.tag2)}`}>
                  {lead.tag2}
                </span>
              )}
            </div>
          )}
          <p className="truncate text-sm font-semibold text-slate-800">
            {lead.doctor}
          </p>
        </div>

        {/* Quick move stage dropdown - Highly accessible and mobile friendly */}
        <div className="relative inline-flex items-center shrink-0 lg:hidden">
          <select
            value={lead.col}
            onChange={(e) => onMoveLead(lead.id, e.target.value)}
            className="appearance-none cursor-pointer rounded-md border border-slate-200 bg-slate-50/50 pl-2 pr-5 py-0.5 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:border-slate-400 focus:outline-none"
          >
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <Icons
            name="ChevronDown"
            size={10}
            className="absolute right-1.5 pointer-events-none text-slate-400"
          />
        </div>
      </div>

      <p className="mt-1 truncate text-xs text-slate-500">{lead.clinic}</p>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100/85 pt-2.5">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200/50 text-[9px] font-semibold text-slate-600"
          title={ASSIGNEE_LABELS[lead.initials] || lead.initials}
        >
          {lead.initials}
        </div>
        <span className="min-w-0 truncate text-[11px] font-medium text-slate-500">
          {ASSIGNEE_LABELS[lead.initials] || lead.initials}
        </span>
        <span className="ml-auto text-xs font-bold text-slate-800">
          {lead.cost}
        </span>
        <span className="rounded-full bg-slate-50 border border-slate-150 px-2 py-0.5 text-[10px] font-medium text-slate-500 shrink-0">
          {lead.days}
        </span>
      </div>
    </div>
  </article>
);

const KanbanColumn = ({
  col,
  leads,
  onDragStart,
  onDragEnd,
  draggingId,
  onDrop,
  onDragOver,
  onDragLeave,
  isOver,
  onMoveLead,
}) => (
  <section className="flex h-full min-h-0 w-full sm:w-auto shrink-0 flex-col rounded-xl bg-slate-50/80 border border-slate-200/50 p-2.5 sm:min-w-[260px] lg:min-w-[280px]">
    <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${col.color}`} />
          <h3 className="truncate text-sm font-semibold text-slate-800">
            {col.label}
          </h3>
        </div>
        {col.pipeline && (
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">{col.pipeline}</p>
        )}
      </div>

      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white border border-slate-200/60 px-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
        {leads.length}
      </span>
    </div>

    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      className={`flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden rounded-xl p-1.5 pr-1 custom-scrollbar transition-all duration-200 ${
        isOver ? `${col.light} ring-1 ring-black/5` : "bg-transparent"
      }`}
    >
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          column={col}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          isDragging={draggingId === lead.id}
          onMoveLead={onMoveLead}
        />
      ))}

      {leads.length === 0 && (
        <div className="flex flex-1 items-center justify-center rounded-xl bg-white border border-slate-100 px-3 py-6 text-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Drop lead here</p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Move cards to update stage.
            </p>
          </div>
        </div>
      )}
    </div>
  </section>
);

const KanbanModal = ({ open, onClose, onAddLead }) => {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [draggingLead, setDraggingLead] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(COLUMNS[0].key);
  const boardScrollRef = useRef(null);
  const autoScrollFrameRef = useRef(null);
  const autoScrollVelocityRef = useRef(0);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!draggingLead) {
      autoScrollVelocityRef.current = 0;
      if (autoScrollFrameRef.current) {
        cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      return undefined;
    }

    const tick = () => {
      const board = boardScrollRef.current;
      const velocity = autoScrollVelocityRef.current;

      if (board && velocity !== 0) {
        board.scrollLeft += velocity;
      }

      autoScrollFrameRef.current = requestAnimationFrame(tick);
    };

    autoScrollFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (autoScrollFrameRef.current) {
        cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      autoScrollVelocityRef.current = 0;
    };
  }, [draggingLead]);

  const updateBoardAutoScroll = (clientX) => {
    const board = boardScrollRef.current;
    if (!board) {
      return;
    }

    const rect = board.getBoundingClientRect();
    const edgeThreshold = Math.min(120, rect.width * 0.22);
    const maxVelocity = 18;

    const distanceFromLeft = clientX - rect.left;
    const distanceFromRight = rect.right - clientX;

    if (distanceFromLeft < edgeThreshold) {
      const intensity = (edgeThreshold - distanceFromLeft) / edgeThreshold;
      autoScrollVelocityRef.current = -Math.max(4, intensity * maxVelocity);
      return;
    }

    if (distanceFromRight < edgeThreshold) {
      const intensity = (edgeThreshold - distanceFromRight) / edgeThreshold;
      autoScrollVelocityRef.current = Math.max(4, intensity * maxVelocity);
      return;
    }

    autoScrollVelocityRef.current = 0;
  };

  const handleDragStart = (event, lead) => {
    setDraggingLead(lead);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingLead(null);
    setOverCol(null);
    autoScrollVelocityRef.current = 0;
  };

  const handleDragOver = (event, colKey) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOverCol(colKey);
    updateBoardAutoScroll(event.clientX);
  };

  const handleDragLeave = () => {
    setOverCol(null);
    autoScrollVelocityRef.current = 0;
  };

  const handleDrop = (event, colKey) => {
    event.preventDefault();

    if (!draggingLead || draggingLead.col === colKey) {
      setDraggingLead(null);
      setOverCol(null);
      autoScrollVelocityRef.current = 0;
      return;
    }

    setLeads((prev) =>
      prev.map((item) =>
        item.id === draggingLead.id ? { ...item, col: colKey } : item
      )
    );
    setDraggingLead(null);
    setOverCol(null);
    autoScrollVelocityRef.current = 0;
  };

  const handleMoveLead = (leadId, targetColKey) => {
    setLeads((prev) =>
      prev.map((item) =>
        item.id === leadId ? { ...item, col: targetColKey } : item
      )
    );
  };

  const visibleLeads = leads.filter((lead) => {
    const query = search.trim().toLowerCase();
    const matchesAssignee =
      !assigneeFilter || lead.initials === assigneeFilter;
    const matchesSearch =
      query.length === 0 ||
      lead.doctor.toLowerCase().includes(query) ||
      lead.clinic.toLowerCase().includes(query);

    return matchesAssignee && matchesSearch;
  });

  const totalLeads = leads.length;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-16 z-[1000] flex justify-end md:inset-0 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] ${
          open ? "animate-overlay-in" : "animate-overlay-out"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative flex h-full w-full max-w-full flex-col overflow-hidden bg-[#f8fafc] shadow-2xl md:h-screen ${
          open ? "animate-slide-in-right" : "animate-slide-out-right"
        } sm:w-[100vw] md:w-[100vw] md:max-w-[1480px]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-black/5 bg-white px-4 py-3 sm:px-5 md:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Lead pipeline
                </h2>
                <span className="rounded-full bg-gray-150 border border-gray-250 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  {totalLeads} leads
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Drag cards between stages or use the quick switcher menus.
              </p>
            </div>

            <Button
              onClick={onClose}
              variant="danger"
              size="square"
              icon={(props) => <Icons name="X" {...props} />}
              className="shrink-0 rounded-lg text-gray-500 hover:bg-gray-100"
            />
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <Input
              id="kanban-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              label="Search by doctor or clinic"
              endIcon={
                <Icons name="Search" size={16} className="text-gray-400" />
              }
              className="rounded-lg border-gray-200 bg-gray-50 shadow-none"
            />

            <Input
              type="select"
              id="kanban-assignee"
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              label="All reps"
              options={ASSIGNEE_OPTIONS}
              className="rounded-lg border-gray-200 bg-gray-50 shadow-none"
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:justify-end">
              <Button
                variant="outline"
                className="justify-center rounded-lg"
                leftIcon={(props) => <Icons name="List" {...props} />}
                onClick={onClose}
              >
                List view
              </Button>
              <Button
                variant="solid"
                className="justify-center rounded-lg"
                leftIcon={(props) => (
                  <Icons name="Plus" color="white" {...props} />
                )}
                onClick={onAddLead}
              >
                Add lead
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {assigneeFilter && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-600">
                Rep: {ASSIGNEE_LABELS[assigneeFilter]}
              </span>
            )}
            {draggingLead && (
              <span className="rounded-full bg-white px-2.5 py-1 font-medium text-gray-600">
                Moving: {draggingLead.doctor}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Column Tabs Switcher (Visible only on mobile screen widths) */}
          <div className="flex sm:hidden overflow-x-auto gap-2 pb-2.5 px-4 pt-2 border-b border-black/5 bg-white no-scrollbar select-none shrink-0">
            {COLUMNS.map((col) => {
              const colLeads = visibleLeads.filter((lead) => lead.col === col.key);
              const isActive = activeTab === col.key;
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => setActiveTab(col.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                  <span>{col.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-500"
                  }`}>
                    {colLeads.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            ref={boardScrollRef}
            onDragOver={(event) => {
              event.preventDefault();
              updateBoardAutoScroll(event.clientX);
            }}
            onDragLeave={() => {
              autoScrollVelocityRef.current = 0;
            }}
            className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-3 custom-scrollbar sm:px-4 md:px-5 md:py-4"
          >
            {/* Desktop View (Side-by-Side Grid Layout) */}
            <div className="hidden sm:flex h-full min-w-max items-stretch gap-3 pb-1">
              {COLUMNS.map((col) => {
                const colLeads = visibleLeads.filter((lead) => lead.col === col.key);

                return (
                  <KanbanColumn
                    key={col.key}
                    col={col}
                    leads={colLeads}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    draggingId={draggingLead?.id}
                    onDrop={(event) => handleDrop(event, col.key)}
                    onDragOver={(event) => handleDragOver(event, col.key)}
                    onDragLeave={handleDragLeave}
                    isOver={overCol === col.key}
                    onMoveLead={handleMoveLead}
                  />
                );
              })}
            </div>

            {/* Mobile View (Single Active Column View based on tab selection) */}
            <div className="flex sm:hidden h-full flex-col">
              {COLUMNS.filter((col) => col.key === activeTab).map((col) => {
                const colLeads = visibleLeads.filter((lead) => lead.col === col.key);
                return (
                  <KanbanColumn
                    key={col.key}
                    col={col}
                    leads={colLeads}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    draggingId={draggingLead?.id}
                    onDrop={(event) => handleDrop(event, col.key)}
                    onDragOver={(event) => handleDragOver(event, col.key)}
                    onDragLeave={handleDragLeave}
                    isOver={overCol === col.key}
                    onMoveLead={handleMoveLead}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanModal;
