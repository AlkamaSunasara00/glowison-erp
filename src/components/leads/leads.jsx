import React, { useEffect, useRef, useState } from "react";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import AddLead from "@/components/leads/leadsModal/AddLead";
import LeadDetail from "./leadsModal/LeadDetail";
import KanbanModal from "./leadsModal/KanbanModal";

const stageOptions = [
  { key: "all", label: "All", count: 47 },
  { key: "new", label: "New", count: 12 },
  { key: "contacted", label: "Contacted", count: 9 },
  { key: "demo", label: "Demo", count: 7 },
  { key: "negotiation", label: "Negotiation", count: 8 },
  { key: "won", label: "Won", count: 6 },
  { key: "lost", label: "Lost", count: 3 },
  { key: "not-interested", label: "Not interested", count: 2 },
];

const metricCards = [
  {
    title: "Total pipeline value",
    value: "Rs. 18.4L",
    helper: "47 active leads",
  },
  {
    title: "Avg. time to close",
    value: "14 days",
    helper: "last 30 days",
  },
  {
    title: "Conversion rate",
    value: "28%",
    helper: "leads won",
  },
  {
    title: "Total spend on leads",
    value: "Rs. 2.1L",
    helper: "travel + time cost",
  },
];

const leadsData = [
  {
    id: 1,
    doctor: "Dr. Priya Sharma",
    clinic: "Sharma Skin Clinic, Ahmedabad",
    source: "Field visit",
    stage: "demo",
    stageLabel: "Demo",
    stageClass: "bg-amber-50 text-amber-700 border border-amber-100",
    assignedTo: "Arjun Patel",
    initials: "AP",
    nextTask: "Demo - Jun 2",
    nextTaskClass: "text-gray-800",
    costSpent: "Rs. 4,200",
    created: "May 18",
  },
  {
    id: 2,
    doctor: "Dr. Karan Mehta",
    clinic: "Mehta Dermatology, Surat",
    source: "WhatsApp",
    stage: "negotiation",
    stageLabel: "Negotiation",
    stageClass: "bg-violet-50 text-violet-700 border border-violet-100",
    assignedTo: "Sneha Mehta",
    initials: "SM",
    nextTask: "Follow-up call",
    nextTaskClass: "text-gray-800",
    costSpent: "Rs. 6,800",
    created: "May 12",
  },
  {
    id: 3,
    doctor: "Dr. Anita Desai",
    clinic: "Glow Skin Clinic, Baroda",
    source: "Referral",
    stage: "new",
    stageLabel: "New",
    stageClass: "bg-teal-50 text-teal-700 border border-teal-100",
    assignedTo: "Rohit Shah",
    initials: "RS",
    nextTask: "Intro call overdue",
    nextTaskClass: "text-red-500",
    costSpent: "Rs. 0",
    created: "May 20",
  },
  {
    id: 4,
    doctor: "Dr. Vikas Joshi",
    clinic: "Joshi Aesthetics, Rajkot",
    source: "Cold call",
    stage: "won",
    stageLabel: "Won",
    stageClass: "bg-lime-50 text-lime-700 border border-lime-100",
    assignedTo: "Arjun Patel",
    initials: "AP",
    nextTask: "Quotation sent",
    nextTaskClass: "text-green-700",
    costSpent: "Rs. 9,500",
    created: "Apr 28",
  },
  {
    id: 5,
    doctor: "Dr. Ritu Patel",
    clinic: "Patel Skin Centre, Gandhinagar",
    source: "Website",
    stage: "contacted",
    stageLabel: "Contacted",
    stageClass: "bg-sky-50 text-sky-700 border border-sky-100",
    assignedTo: "Sneha Mehta",
    initials: "SM",
    nextTask: "Meeting - Jun 4",
    nextTaskClass: "text-gray-800",
    costSpent: "Rs. 1,100",
    created: "May 15",
  },
];

const sourceOptions = [
  { value: "all", label: "All sources" },
  { value: "field-visit", label: "Field visit" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referral", label: "Referral" },
  { value: "cold-call", label: "Cold call" },
  { value: "website", label: "Website" },
];

const employeeOptions = [
  { value: "all", label: "All employees" },
  { value: "arjun-patel", label: "Arjun Patel" },
  { value: "sneha-mehta", label: "Sneha Mehta" },
  { value: "rohit-shah", label: "Rohit Shah" },
];

const timeOptions = [
  { value: "all", label: "All time" },
  { value: "this-month", label: "This month" },
  { value: "last-30-days", label: "Last 30 days" },
  { value: "last-7-days", label: "Last 7 days" },
];

const normalize = (value) => value.toLowerCase().replace(/\s+/g, "-");

export const Leads = () => {
  const [search, setSearch] = useState("");
  const [activeStage, setActiveStage] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddLeadMounted, setIsAddLeadMounted] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);
  const [isLeadDetailMounted, setIsLeadDetailMounted] = useState(false);
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);
  const [isKanbanMounted, setIsKanbanMounted] = useState(false);
  const addLeadCloseTimerRef = useRef(null);
  const leadDetailCloseTimerRef = useRef(null);
  const kanbanCloseTimerRef = useRef(null);

  const clearCloseTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearCloseTimer(addLeadCloseTimerRef);
      clearCloseTimer(leadDetailCloseTimerRef);
      clearCloseTimer(kanbanCloseTimerRef);
    };
  }, []);

  const hasActiveFilters =
    activeStage !== "all" ||
    sourceFilter !== "all" ||
    employeeFilter !== "all" ||
    timeFilter !== "all";
  const emptyStateQuery = search || (hasActiveFilters ? "active filters" : "");

  const filteredLeads = leadsData.filter((lead) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      lead.doctor.toLowerCase().includes(query) ||
      lead.clinic.toLowerCase().includes(query) ||
      lead.source.toLowerCase().includes(query) ||
      lead.assignedTo.toLowerCase().includes(query);

    const matchesStage = activeStage === "all" || lead.stage === activeStage;
    const matchesSource =
      sourceFilter === "all" || normalize(lead.source) === sourceFilter;
    const matchesEmployee =
      employeeFilter === "all" || normalize(lead.assignedTo) === employeeFilter;

    const matchesTime =
      timeFilter === "all" ||
      (timeFilter === "this-month" && lead.created.startsWith("May")) ||
      (timeFilter === "last-30-days" &&
        ["May", "Jun"].some((month) => lead.created.startsWith(month))) ||
      (timeFilter === "last-7-days" &&
        ["May 18", "May 20"].includes(lead.created));

    return (
      matchesSearch &&
      matchesStage &&
      matchesSource &&
      matchesEmployee &&
      matchesTime
    );
  });

  const handleRowClick = (lead) => {
    clearCloseTimer(leadDetailCloseTimerRef);
    setSelectedLead(lead);
    setIsLeadDetailMounted(true);
    setIsLeadDetailOpen(true);
  };

  const handleOpenAddLead = () => {
    clearCloseTimer(addLeadCloseTimerRef);
    setIsAddLeadMounted(true);
    setIsAddLeadOpen(true);
  };

  const handleCloseAddLead = () => {
    setIsAddLeadOpen(false);
    clearCloseTimer(addLeadCloseTimerRef);
    addLeadCloseTimerRef.current = setTimeout(() => {
      setIsAddLeadMounted(false);
      addLeadCloseTimerRef.current = null;
    }, 300);
  };

  const handleCloseLeadDetail = () => {
    setIsLeadDetailOpen(false);
    clearCloseTimer(leadDetailCloseTimerRef);
    leadDetailCloseTimerRef.current = setTimeout(() => {
      setIsLeadDetailMounted(false);
      setSelectedLead(null);
      leadDetailCloseTimerRef.current = null;
    }, 300);
  };

  const handleOpenKanban = () => {
    clearCloseTimer(kanbanCloseTimerRef);
    setIsKanbanMounted(true);
    setIsKanbanOpen(true);
  };

  const handleCloseKanban = () => {
    setIsKanbanOpen(false);
    clearCloseTimer(kanbanCloseTimerRef);
    kanbanCloseTimerRef.current = setTimeout(() => {
      setIsKanbanMounted(false);
      kanbanCloseTimerRef.current = null;
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg ">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="page-header">Lead pipeline</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track pipeline stages, lead value, and follow-up momentum in one
              place.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="ghost"
              className="justify-start sm:justify-center"
              onClick={handleOpenKanban}
              rightIcon={(props) => <Icons name="ArrowUpRight" {...props} />}
            >
              Kanban view
            </Button>
            <Button
              variant="outline"
              className="justify-start sm:justify-center"
              leftIcon={(props) => <Icons name="Download" {...props} />}
            >
              Export
            </Button>
            <Button
              variant="solid"
              className="justify-start sm:justify-center"
              onClick={handleOpenAddLead}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
            >
              Add lead
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="flex w-full rounded-xl border border-white/70 bg-white/80 p-1 shadow-sm">
            {stageOptions.map((stage) => {
              const isActive = activeStage === stage.key;

              return (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => setActiveStage(stage.key)}
                  className={`relative flex-1 min-w-max rounded-xl px-3 py-2 transition-all duration-200 ${
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                    <p
                      className={`whitespace-nowrap text-[13px] font-medium transition-colors ${
                        isActive ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      {stage.label}
                    </p>

                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stage.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <div
              key={metric.title}
              className="rounded-xl border border-white/70 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">
                {metric.title}
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{metric.helper}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 md:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <Input
              id="search-leads"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              label="Search leads..."
              endIcon={
                <Icons name="Search" size={16} className="text-gray-400" />
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[560px]">
            <Input
              type="select"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              options={sourceOptions}
              label="All sources"
            />
            <Input
              type="select"
              value={employeeFilter}
              onChange={(event) => setEmployeeFilter(event.target.value)}
              options={employeeOptions}
              label="All employees"
            />
            <Input
              type="select"
              value={timeFilter}
              onChange={(event) => setTimeFilter(event.target.value)}
              options={timeOptions}
              label="All time"
            />
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <EmptyState
            search={emptyStateQuery}
            entityName="Leads"
            entityIcon="Users"
            onClearSearch={() => {
              setSearch("");
              setActiveStage("all");
              setSourceFilter("all");
              setEmployeeFilter("all");
              setTimeFilter("all");
            }}
            addLabel="Add lead"
          />
        ) : (
          <>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[980px]">
                <thead className="sticky top-0 z-5 bg-primary text-white text-[12px] font-medium">
                  <tr>
                    <th className="px-4 py-3.5">Lead</th>
                    <th className="px-4 py-3.5">Source</th>
                    <th className="px-4 py-3.5">Stage</th>
                    <th className="px-4 py-3.5">Assigned to</th>
                    <th className="px-4 py-3.5">Next task</th>
                    <th className="px-4 py-3.5">Cost spent</th>
                    <th className="px-4 py-3.5">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => handleRowClick(lead)}
                      className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4">
                        <div className="text-[13px] font-semibold text-gray-800">
                          {lead.doctor}
                        </div>
                        <p className="mt-1 text-[13px] text-gray-500">
                          {lead.clinic}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-[13px] text-gray-700">
                        {lead.source}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[13px] font-medium ${lead.stageClass}`}
                        >
                          {lead.stageLabel}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {lead.initials}
                          </div>
                          <span className="text-[13px] font-medium text-gray-800">
                            {lead.assignedTo}
                          </span>
                        </div>
                      </td>

                      <td
                        className={`px-4 py-4 text-sm font-medium ${lead.nextTaskClass}`}
                      >
                        {lead.nextTask}
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-gray-800">
                        {lead.costSpent}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {lead.created}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full shrink-0">
              <Button
                variant="outline"
                size="md"
                leftIcon={(props) => <Icons name="ChevronLeft" {...props} />}
              >
                Previous
              </Button>

              <div className="text-[13px] text-gray-700 text-center">
                1 to {filteredLeads.length} of {filteredLeads.length}
              </div>

              <Button
                variant="outline"
                size="md"
                rightIcon={(props) => <Icons name="ChevronRight" {...props} />}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      {isAddLeadMounted && (
        <AddLead open={isAddLeadOpen} onClose={handleCloseAddLead} />
      )}

      {isLeadDetailMounted && (
        <LeadDetail
          open={isLeadDetailOpen}
          onClose={handleCloseLeadDetail}
          lead={selectedLead}
        />
      )}
      {isKanbanMounted && (
        <KanbanModal
          open={isKanbanOpen}
          onClose={handleCloseKanban}
          onAddLead={() => {
            handleCloseKanban();
            handleOpenAddLead();
          }}
        />
      )}
    </div>
  );
};

export default Leads;
