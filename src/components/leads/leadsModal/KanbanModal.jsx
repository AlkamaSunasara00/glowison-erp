import React, { useEffect, useRef, useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";

const COLUMNS = [
  {
    key: "new",
    label: "New",
    color: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    pipeline: "Rs. 0 pipeline",
  },
  {
    key: "contacted",
    label: "Contacted",
    color: "bg-teal-500",
    light: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    pipeline: "Rs. 3.2L pipeline",
  },
  {
    key: "demo",
    label: "Demo",
    color: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    pipeline: "Rs. 6.1L pipeline",
  },
  {
    key: "negotiation",
    label: "Negotiation",
    color: "bg-violet-500",
    light: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    pipeline: "Rs. 5.8L pipeline",
  },
  {
    key: "won",
    label: "Won",
    color: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    pipeline: "Rs. 8.4L won",
  },
  {
    key: "lost",
    label: "Lost",
    color: "bg-red-500",
    light: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    pipeline: "Rs. 1.1L lost",
  },
  {
    key: "not-interested",
    label: "Not interested",
    color: "bg-gray-400",
    light: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
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

const avatarColors = {
  AP: "bg-violet-100 text-violet-700",
  SM: "bg-pink-100 text-pink-700",
  RS: "bg-sky-100 text-sky-700",
  NJ: "bg-amber-100 text-amber-700",
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

const LeadCard = ({ lead, column, onDragStart, onDragEnd, isDragging }) => (
  <article
    draggable
    onDragStart={(event) => onDragStart(event, lead)}
    onDragEnd={onDragEnd}
    className={`group relative rounded-xl bg-white p-3 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.22)] transition-all duration-200 select-none ${
      isDragging
        ? "scale-[0.98] cursor-grabbing opacity-40"
        : "cursor-grab hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-18px_rgba(15,23,42,0.28)]"
    }`}
  >
    <div className={`absolute inset-x-0 top-0 h-1 rounded-t-xl ${column.color}`} />

    <div className="pt-1.5">
      {(lead.tag || lead.tag2) && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {lead.tag && (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${lead.tagCls}`}
            >
              {lead.tag}
            </span>
          )}
          {lead.tag2 && (
            <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
              {lead.tag2}
            </span>
          )}
        </div>
      )}

      <p className="truncate text-sm font-semibold text-gray-900">
        {lead.doctor}
      </p>
      <p className="mt-1 truncate text-xs text-gray-500">{lead.clinic}</p>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${avatarColors[lead.initials] || "bg-gray-100 text-gray-600"}`}
        >
          {lead.initials}
        </div>
        <span className="min-w-0 truncate text-xs font-medium text-gray-700">
          {ASSIGNEE_LABELS[lead.initials] || lead.initials}
        </span>
        <span className="ml-auto text-sm font-semibold text-gray-800">
          {lead.cost}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
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
}) => (
  <section className="flex h-full min-h-0 min-w-[78vw] snap-start flex-col rounded-xl bg-white/50 p-2 sm:min-w-[260px] lg:min-w-[280px]">
    <div className="mb-2 flex items-start justify-between gap-2 px-1">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
          <h3 className="truncate text-sm font-semibold text-gray-800">
            {col.label}
          </h3>
        </div>
        {col.pipeline && (
          <p className={`mt-1 text-xs font-medium ${col.text}`}>{col.pipeline}</p>
        )}
      </div>

      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">
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
        />
      ))}

      {leads.length === 0 && (
        <div className="flex flex-1 items-center justify-center rounded-xl bg-white/70 px-3 py-6 text-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Drop lead here</p>
            <p className="mt-1 text-xs text-gray-400">
              Move cards to update the stage.
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

  if (!open) {
    return null;
  }

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
      className={`fixed inset-0 z-[1000] flex justify-end ${
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
        className={`relative flex h-[100dvh] w-full max-w-full flex-col overflow-hidden bg-[#f7f6fb] shadow-2xl ${
          open ? "animate-slide-in-right" : "animate-slide-out-right"
        } sm:w-[96vw] md:w-[92vw] md:max-w-[1280px]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-black/5 bg-white px-4 py-3 sm:px-5 md:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Lead pipeline
                </h2>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {totalLeads} leads
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Drag cards between stages and keep follow-ups moving.
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

        <div className="flex-1 overflow-hidden">
          <div
            ref={boardScrollRef}
            onDragOver={(event) => {
              event.preventDefault();
              updateBoardAutoScroll(event.clientX);
            }}
            onDragLeave={() => {
              autoScrollVelocityRef.current = 0;
            }}
            className="h-full overflow-x-auto overflow-y-hidden px-3 py-3 custom-scrollbar sm:px-4 md:px-5 md:py-4"
          >
            <div className="flex h-full min-w-max items-stretch gap-3 pb-1">
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
