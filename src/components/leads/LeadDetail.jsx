import React from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";

const stages = ["New", "Contacted", "Demo", "Negotiation", "Won"];

const LeadActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

const leadData = {
  name: "Dr. Priya Sharma",
  clinic: "Sharma Skin Clinic, Ahmedabad",
  currentStage: 2,
  info: {
    "Doctor / clinic": "Dr. Priya Sharma, Sharma Skin Clinic",
    Location: "Vastrapur, Ahmedabad",
    Phone: "+91 98765 43210",
    "Product interest": "HydraFacial MD + HIFU",
    Source: "Field visit — Arjun Patel",
    "Assigned to": "Arjun Patel",
    Stage: "Demo",
  },
  incentives: [
    { initials: "AP", name: "Arjun Patel", amount: "₹2,000", color: "bg-violet-100 text-violet-700" },
    { initials: "SM", name: "Sneha Mehta", amount: "₹800", color: "bg-pink-100 text-pink-700" },
  ],
  tasks: [
    { id: 1, title: "Initial phone call", assignee: "Arjun Patel", duration: "18 min", date: "May 19", status: "Done", color: "bg-emerald-500" },
    { id: 2, title: "Clinic visit — product walkthrough", assignee: "Arjun Patel", duration: "45 min", extra: "GPS logged", status: "Done", color: "bg-emerald-500" },
    { id: 3, title: "HydraFacial MD demo — machine to be taken", assignee: "Arjun Patel", joint: "Sneha Mehta (joint)", date: "Jun 2, 11am", status: "Scheduled", color: "bg-blue-400" },
    { id: 4, title: "Send follow-up quotation", assignee: "Arjun Patel", date: "Jun 5", status: "Pending", color: "bg-amber-400" },
  ],
  costs: [
    { label: "Travel — Arjun Patel (May 19)", amount: "₹640" },
    { label: "Travel — Arjun Patel (May 21)", amount: "₹890" },
    { label: "Call time — 18 min", amount: "₹270" },
    { label: "Meeting time — 45 min", amount: "₹1,125" },
  ],
  totalCost: "₹2,925",
  timeline: [
    { label: "Call recording uploaded + AI summary", date: "May 19", by: "Arjun Patel", dot: "bg-gray-300" },
    { label: "Stage changed → Demo", date: "May 21", by: "Admin", dot: "bg-amber-400" },
    { label: "Clinic visit logged · GPS captured", date: "May 21", by: "Arjun Patel · 45 min", dot: "bg-gray-300" },
    { label: "Demo scheduled with HydraFacial MD", date: "May 22", by: "Arjun Patel", dot: "bg-emerald-500" },
    { label: "Incentive assigned to Arjun Patel", date: "May 22", by: "Admin", dot: "bg-blue-500" },
  ],
};

const statusConfig = {
  Done:      { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: "CheckCircle" },
  Scheduled: { cls: "bg-blue-50 text-blue-700 border border-blue-200",          icon: "Clock" },
  Pending:   { cls: "bg-amber-50 text-amber-700 border border-amber-200",        icon: "AlertCircle" },
};

const LeadDetail = ({ open, onClose, lead, isPage = false }) => {
  const router = useRouter();
  const data = lead || leadData;

  const handleBack = () => {
    if (isPage) {
      router.push("/leads");
    } else {
      onClose?.();
    }
  };

  const detailInfo = data.info || {
    "Doctor / clinic": `${data.name || data.doctor || "—"}${data.clinic ? `, ${data.clinic}` : ""}`,
    Location: data.location || "—",
    Phone: data.phone || "—",
    "Product interest": data.productInterest || "—",
    Source: data.source ? `${data.source}${data.assignedTo ? ` — ${data.assignedTo}` : ""}` : "—",
    "Assigned to": data.assignedTo || "—",
    Stage: data.stageLabel || data.stage || "Demo",
  };
  const tasks = data.tasks || leadData.tasks;
  const incentives = data.incentives || leadData.incentives;
  const costs = data.costs || leadData.costs;
  const timeline = data.timeline || leadData.timeline;
  const totalCost = data.totalCost || data.costSpent || leadData.totalCost;

  const stageIndex = stages.findIndex(
    (s) => s.toLowerCase() === (data.stageLabel || "Demo").toLowerCase()
  );
  const currentStageIndex = stageIndex >= 0 ? stageIndex : data.currentStage ?? 2;

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col gap-4 w-full animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:w-[90%] md:h-screen ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className={isPage ? "flex items-center justify-between py-2" : "flex items-center justify-between px-7 py-4 border-b border-gray-100 bg-white"}>
        {/* Left: identity with back navigation arrow */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 transition-colors shrink-0"
            title="Go back"
          >
            <Icons name="ArrowLeft" size={20} />
          </button>
          <div>
            <h2 className="page-header">
              {data.name || data.doctor}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{data.clinic}</p>
          </div>
          <span className="ml-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {data.stageLabel || "Demo"}
          </span>
        </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={(props) => <LeadActionIcon name="Calendar" {...props} />}
              className="hidden sm:flex rounded-lg px-3! py-1.5! text-xs font-medium"
            >
              Schedule demo
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={(props) => <LeadActionIcon name="Plus" {...props} />}
              className="hidden sm:flex rounded-lg px-3! py-1.5! text-xs font-medium"
            >
              Add task
            </Button>
            <Button
              variant="solid"
              size="md"
              rightIcon={(props) => <LeadActionIcon name="ArrowRight" color="white" {...props} />}
              className="rounded-lg px-3! py-1.5! text-xs font-semibold"
            >
              Convert to customer
            </Button>
          </div>
        </div>

        {/* ── STAGE PROGRESS ─────────────────────────────────── */}
        <div className={isPage ? "px-4 py-3 bg-white border border-slate-200/60 rounded-xl shadow-sm" : "px-7 py-4 bg-gray-50/60 border-b border-gray-100"}>
          <div className="flex items-center">
            {stages.map((stage, i) => {
              const isCompleted = i < currentStageIndex;
              const isActive    = i === currentStageIndex;
              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-200
                        ${isCompleted ? "bg-primary border-primary text-white shadow-sm" : ""}
                        ${isActive    ? "bg-primary border-primary text-white shadow-md ring-4 ring-primary/15" : ""}
                        ${!isCompleted && !isActive ? "bg-white border-gray-200 text-gray-400" : ""}
                      `}
                    >
                      {isCompleted ? <Icons name="Check" size={13} /> : i + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold whitespace-nowrap tracking-wide ${
                        isActive    ? "text-primary" :
                        isCompleted ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                  {i < stages.length - 1 && (
                    <div className="flex-1 mx-2 mb-5">
                      <div className="relative h-0.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                            i < currentStageIndex ? "w-full bg-primary" : "w-0"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className={isPage ? "" : "flex-1 overflow-hidden"}>
          <div className={isPage ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4" : "grid h-full grid-cols-1 lg:grid-cols-[1fr_340px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100"}>

            {/* ── LEFT ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-7 py-6 space-y-7"}>

              {/* Lead Information */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
                    Lead Information
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={(props) => <LeadActionIcon name="Pencil" {...props} />}
                    className="h-auto px-0 text-xs text-primary hover:bg-transparent hover:text-primary/70"
                  >
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {Object.entries(detailInfo).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {key}
                      </span>
                      {key === "Stage" ? (
                        <span className="inline-flex w-fit text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {value}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-800 font-medium">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {!isPage && <div className="h-px bg-gray-100" />}

              {/* Tasks */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Tasks</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={(props) => <LeadActionIcon name="Plus" {...props} />}
                    className="h-auto px-0 text-xs text-primary hover:bg-transparent hover:text-primary/70"
                  >
                    Add task
                  </Button>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const sc = statusConfig[task.status] || { cls: "bg-gray-100 text-gray-500 border border-gray-200", icon: "Circle" };
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${task.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {task.assignee}
                            {task.joint    && ` · ${task.joint}`}
                            {task.duration && ` · ${task.duration}`}
                            {task.extra    && ` · ${task.extra}`}
                            {task.date     && ` · ${task.date}`}
                          </p>
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${sc.cls}`}>
                          {task.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {!isPage && <div className="h-px bg-gray-100" />}

              {/* Cost & Time Tracker */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
                    Cost &amp; Time Tracker
                  </h3>
                </div>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {costs.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors"
                    >
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-semibold text-gray-800">{item.amount}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-t border-primary/10">
                    <span className="text-sm font-bold text-gray-800">Total lead cost</span>
                    <span className="text-sm font-bold text-primary">{totalCost}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={(props) => <LeadActionIcon name="ArrowUpRight" {...props} />}
                  className="mt-2.5 h-auto px-0 text-xs text-primary hover:bg-transparent hover:text-primary/70"
                >
                  See full breakdown
                </Button>
              </section>
            </div>

            {/* ── RIGHT ── */}
            <div className={isPage ? "flex flex-col gap-4" : "h-full overflow-y-auto px-6 py-6 space-y-6 bg-gray-50/40"}>

              {/* Quick Actions */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "MessageCircle", label: "WhatsApp",  variant: "secondary" },
                    { icon: "Phone",         label: "Log call",  variant: "secondary" },
                    { icon: "Plus",          label: "Add task",  variant: "secondary" },
                    { icon: "FileText",      label: "Quotation", variant: "secondary", arrow: true },
                  ].map(({ icon: iconName, label, variant, arrow }) => (
                    <Button
                      key={label}
                      variant={variant === "secondary" ? "outline" : variant}
                      size="md"
                      leftIcon={(props) => <LeadActionIcon name={iconName} {...props} />}
                      rightIcon={arrow ? ((props) => <LeadActionIcon name="ArrowUpRight" {...props} />) : undefined}
                      className="w-full justify-start rounded-lg px-3! py-2! text-xs font-medium"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </section>

              {!isPage && <div className="h-px bg-gray-200" />}

              {/* Incentives */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                  Incentives
                </h3>
                <div className="space-y-2">
                  {incentives.map((person) => (
                    <div
                      key={person.name}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-gray-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${person.color}`}>
                          {person.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{person.name}</p>
                          <p className="text-[11px] text-gray-400">On conversion: {person.amount}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg px-2.5! py-1! text-xs font-medium">
                        Set
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={(props) => <LeadActionIcon name="Plus" {...props} />}
                  className="mt-2.5 h-auto px-0 text-xs text-primary hover:bg-transparent hover:text-primary/70"
                >
                  Add incentive
                </Button>
              </section>

              {!isPage && <div className="h-px bg-gray-200" />}

              {/* Activity Timeline */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                  Activity Timeline
                </h3>
                <div className="relative">
                  {/* vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                  <div className="space-y-4 pl-6">
                    {timeline.map((item, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${item.dot}`} />
                        <p className="text-xs font-semibold text-gray-700 leading-snug">{item.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{item.date} · {item.by}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={(props) => <LeadActionIcon name="ArrowUpRight" {...props} />}
                  className="mt-3 h-auto px-0 text-xs text-primary hover:bg-transparent hover:text-primary/70"
                >
                  Full log
                </Button>
              </section>
            </div>
          </div>
        </div>
      </div>
    );

  if (isPage) {
    return detailPanelContent;
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-16 z-[1000] flex justify-end md:inset-0 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] ${
          open ? "animate-overlay-in" : "animate-overlay-out"
        }`}
        onClick={handleBack}
      />
      {detailPanelContent}
    </div>
  );
};

export default LeadDetail;
