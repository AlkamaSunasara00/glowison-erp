import React, { useState, useRef, useEffect } from "react";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import AddTask from "./AddTask";
import { useRouter } from "next/router";

const pageStats = [
  { title: "Total tasks", value: "64", helper: "this month" },
  {
    title: "Done on time",
    value: "47",
    helper: "74% rate",
    helperIcon: "ArrowUp",
  },
  {
    title: "Overdue",
    value: "3",
    helper: "action needed",
    valueClassName: "text-[#b14141]",
  },
  { title: "In progress", value: "8", helper: "today" },
];

const normalizeValue = (value) => value.toLowerCase().replace(/\s+/g, "-");

const taskTabs = [
  { key: "all", label: "All tasks", count: 64 },
  { key: "mine", label: "My tasks", count: 5 },
  { key: "field-visits", label: "Field visits", count: 2 },
  { key: "calls", label: "Calls", count: 3 },
  { key: "demos", label: "Demos", count: 1 },
];

const employeeOptions = [
  { value: "all", label: "All employees" },
  { value: "arjun-patel", label: "Arjun Patel" },
  { value: "sneha-mehta", label: "Sneha Mehta" },
  { value: "rohit-shah", label: "Rohit Shah" },
];

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "overdue", label: "Overdue" },
  { value: "in-progress", label: "In progress" },
  { value: "scheduled", label: "Scheduled" },
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
];

const typeOptions = [
  { value: "all", label: "All types" },
  { value: "call", label: "Calls" },
  { value: "field-visit", label: "Field visits" },
  { value: "demo", label: "Demos" },
  { value: "quotation", label: "Quotations" },
];

const tasksData = [
  {
    id: "intro-call",
    title: "Intro call",
    lead: "Dr. Anita Desai",
    owner: "Rohit Shah",
    assignees: ["RS"],
    assigneeNames: ["Rohit Shah"],
    isMine: false,
    type: "call",
    typeLabel: "Cold call",
    tab: "calls",
    status: "overdue",
    statusLabel: "Overdue",
    statusClass: "bg-rose-50 text-rose-600 border border-rose-100",
    icon: "AlertCircle",
    iconWrapClass: "border border-[#dba3a3] bg-[#fff7f7] text-[#a44c4c]",
    meta: [
      { icon: "User", text: "Rohit Shah" },
      { icon: "Phone", text: "Cold call" },
      { icon: "CalendarDays", text: "Due May 20 - 2 days overdue" },
    ],
    chips: [{ label: "Overdue", className: "bg-rose-50 text-rose-500" }],
    detailVariant: "overdue",
    detail: {
      type: "Cold call / intro",
      lead: "Dr. Anita Desai",
      assignedTo: "Rohit Shah",
      dueDate: "May 20, 2026",
      reasonLogged: "No reason provided",
      alertText: "This task is 2 days overdue. Admin has been notified.",
    },
  },
  {
    id: "clinic-visit",
    title: "Clinic visit",
    lead: "Dr. Priya Sharma",
    owner: "Arjun Patel",
    assignees: ["AP"],
    assigneeNames: ["Arjun Patel"],
    isMine: false,
    type: "field-visit",
    typeLabel: "Field visit",
    tab: "field-visits",
    status: "in-progress",
    statusLabel: "In progress",
    statusClass: "bg-amber-50 text-amber-700 border border-amber-100",
    icon: "MapPin",
    iconWrapClass: "border border-[#a97c29] bg-[#fff7e6] text-[#946200]",
    meta: [
      { icon: "User", text: "Arjun Patel" },
      { icon: "MapPin", text: "Field visit" },
      { icon: "Clock3", text: "Started 10:32 AM - 45 min" },
    ],
    chips: [
      { label: "Live GPS", className: "bg-emerald-50 text-emerald-600" },
      { label: "In progress", className: "bg-amber-50 text-amber-700" },
    ],
    detailVariant: "liveGps",
    detail: {
      type: "Field visit / meeting",
      lead: "Dr. Priya Sharma",
      assignedTo: "Arjun Patel",
      started: "10:32 AM today",
      duration: "45 min 12 sec",
      location: "Live - Vastrapur, Ahmedabad",
      distance: "12.4 km travelled",
      atLocation: "45 min at location",
      startPoint: "Unilog Office",
      startTime: "9:45 AM",
      currentPoint: "Vastrapur",
      currentTime: "10:32 AM",
    },
  },
  {
    id: "hydrafacial-demo",
    title: "HydraFacial MD demo",
    lead: "Dr. Priya Sharma",
    owner: "Arjun Patel",
    assignees: ["AP", "SM"],
    assigneeNames: ["Arjun Patel", "Sneha Mehta"],
    isMine: true,
    type: "demo",
    typeLabel: "Demo - device required",
    tab: "demos",
    status: "scheduled",
    statusLabel: "Scheduled",
    statusClass: "bg-violet-50 text-violet-700 border border-violet-100",
    icon: "Monitor",
    iconWrapClass: "border border-gray-300 bg-white text-gray-600",
    meta: [
      { icon: "User", text: "Arjun Patel + Sneha Mehta" },
      { icon: "Monitor", text: "Demo - device required" },
      { icon: "CalendarDays", text: "Jun 2, 11:00 AM" },
    ],
    chips: [{ label: "Scheduled", className: "bg-violet-50 text-violet-600" }],
    detailVariant: "demo",
    detail: {
      lead: "Dr. Priya Sharma",
      demoDevice: "HydraFacial MD - Unit 1",
      scheduled: "Jun 2, 11:00 AM",
      location: "Sharma Skin Clinic, Vastrapur",
      deviceOutDate: "Jun 1 (transported by Arjun)",
      deviceReturn: "Jun 2 EOD",
      team: [
        {
          initials: "AP",
          name: "Arjun Patel",
          role: "Primary - device transport + demo lead",
          badge: "Primary",
          badgeClass: "bg-violet-50 text-violet-700",
        },
        {
          initials: "SM",
          name: "Sneha Mehta",
          role: "Joint - product knowledge support",
          badge: "Joint",
          badgeClass: "bg-emerald-50 text-emerald-700",
        },
      ],
      notes:
        "Doctor is specifically interested in the facial rejuvenation protocol. Ensure machine is charged and demo kit (serums + tips) are packed the night before.",
    },
  },
  {
    id: "follow-up-call",
    title: "Follow-up call",
    lead: "Dr. Karan Mehta",
    owner: "Sneha Mehta",
    assignees: ["SM"],
    assigneeNames: ["Sneha Mehta"],
    isMine: true,
    type: "call",
    typeLabel: "Call",
    tab: "calls",
    status: "done",
    statusLabel: "Done",
    statusClass: "bg-lime-50 text-lime-700 border border-lime-100",
    icon: "Phone",
    iconWrapClass: "border border-[#7cb6e7] bg-[#f4fbff] text-[#2f77a8]",
    meta: [
      { icon: "User", text: "Sneha Mehta" },
      { icon: "Phone", text: "Call - 18 min" },
      { icon: "CalendarDays", text: "May 19" },
    ],
    chips: [
      { label: "Recording", className: "bg-sky-50 text-sky-600" },
      { label: "Done", className: "bg-lime-50 text-lime-700" },
    ],
    detailVariant: "callSummary",
    detail: {
      type: "Cold call / follow-up",
      lead: "Dr. Karan Mehta",
      doneBy: "Sneha Mehta",
      date: "May 19, 2:14 PM",
      duration: "18 min 04 sec",
      recordingPosition: "09:29 / 18:04",
      summary:
        "Sneha discussed pricing for the HydraFacial MD and HIFU combo with Dr. Mehta. Doctor expressed strong interest but raised concerns about the total cost and asked for an EMI option. Sneha committed to sending a revised quotation with financing terms by end of week.",
      bullets: [
        "Doctor is interested in HydraFacial MD + HIFU bundle",
        "Budget concern - asked for EMI / financing option",
        "Action: revised quotation with EMI terms due by May 22",
        "Tone: positive, likely to convert if financing is resolved",
      ],
    },
  },
  {
    id: "send-quotation",
    title: "Send quotation",
    lead: "Dr. Vikas Joshi",
    owner: "Arjun Patel",
    assignees: ["AP"],
    assigneeNames: ["Arjun Patel"],
    isMine: false,
    type: "quotation",
    typeLabel: "Quotation",
    tab: "all",
    status: "pending",
    statusLabel: "Pending",
    statusClass: "bg-sky-50 text-sky-700 border border-sky-100",
    icon: "FileText",
    iconWrapClass: "border border-gray-200 bg-white text-gray-500",
    meta: [
      { icon: "User", text: "Arjun Patel" },
      { icon: "FileText", text: "Quotation" },
      { icon: "CalendarDays", text: "Due Jun 5" },
    ],
    chips: [{ label: "Pending", className: "bg-sky-50 text-sky-700" }],
    detailVariant: "quotation",
    detail: {
      type: "Quotation follow-up",
      lead: "Dr. Vikas Joshi",
      assignedTo: "Arjun Patel",
      due: "Jun 5, 4:00 PM",
      quoteValue: "Rs. 9.8L",
      package: "HydraFacial MD + starter consumables",
      pendingFrom: "Finance team approval on pricing slab",
      nextAction: "Share revised PDF quote and payment milestones once approved",
    },
  },
  {
    id: "product-walkthrough",
    title: "Product walkthrough meeting",
    lead: "Dr. Ritu Patel",
    owner: "Sneha Mehta",
    assignees: ["SM"],
    assigneeNames: ["Sneha Mehta"],
    isMine: true,
    type: "field-visit",
    typeLabel: "Field visit",
    tab: "field-visits",
    status: "done",
    statusLabel: "Done",
    statusClass: "bg-lime-50 text-lime-700 border border-lime-100",
    icon: "CheckSquare",
    iconWrapClass: "border border-[#8ba95c] bg-[#f5fde8] text-[#577c1a]",
    meta: [
      { icon: "User", text: "Sneha Mehta" },
      { icon: "MapPin", text: "Field visit - 52 min" },
      { icon: "MapPin", text: "GPS logged" },
      { icon: "CalendarDays", text: "May 21" },
    ],
    chips: [{ label: "Done", className: "bg-lime-50 text-lime-700" }],
    detailVariant: "timeline",
    detail: {
      doneBy: "Sneha Mehta",
      date: "May 21",
      duration: "52 min",
      gps: "Logged",
      outcome: "Doctor agreed to a follow-up demo",
      timeline: [
        {
          title: "Checked in at clinic",
          time: "10:08 AM",
          helper: "GPS captured",
          icon: "CheckCircle2",
          iconClass: "text-lime-600",
        },
        {
          title: "Product walkthrough started",
          time: "10:14 AM",
          helper: "",
          icon: "Circle",
          iconClass: "text-violet-500",
        },
        {
          title: "Task marked complete",
          time: "11:00 AM",
          helper: "Sneha Mehta",
          icon: "CheckCircle2",
          iconClass: "text-lime-600",
        },
      ],
    },
  },
];

const chipBaseClass =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";

const StatCard = ({ stat }) => (
  <div className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-400">{stat.title}</p>
    <p
      className={`mt-1 text-xl font-bold text-gray-900 ${stat.valueClassName || ""}`}
    >
      {stat.value}
    </p>
    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-500">
      {stat.helperIcon && (
        <Icons name={stat.helperIcon} size={14} className="text-gray-400" />
      )}
      <span>{stat.helper}</span>
    </p>
  </div>
);

const TaskChip = ({ label, className }) => (
  <span className={`${chipBaseClass} ${className}`}>{label}</span>
);

const DetailField = ({ label, value, valueClassName = "" }) => (
  <div className="grid grid-cols-[minmax(96px,1fr)_minmax(0,1.35fr)] items-start gap-2 text-sm">
    <span className="text-[12px] text-gray-400">{label}</span>
    <span className={`text-right text-[13px] font-medium text-gray-800 ${valueClassName}`}>
      {value}
    </span>
  </div>
);

const TaskDetailCard = ({ task }) => {
  if (!task) {
    return null;
  }

  if (task.detailVariant === "overdue") {
    return (
      <div className="rounded-lg border border-rose-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${task.iconWrapClass}`}
            >
              <Icons name="Phone" size={13} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                {task.title} - {task.lead}
              </h2>
            </div>
          </div>
          <TaskChip
            label={task.statusLabel}
            className="bg-rose-50 text-rose-600 shrink-0"
          />
        </div>

        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3">
          <div className="flex items-start gap-2 text-xs text-rose-700">
            <Icons name="AlertTriangle" size={16} className="mt-0.5 shrink-0" />
            <p className="leading-snug">{task.detail.alertText}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <DetailField
            label="Lead"
            value={task.detail.lead}
            valueClassName="text-primary"
          />
          <DetailField label="Assigned to" value={task.detail.assignedTo} />
          <DetailField
            label="Due date"
            value={task.detail.dueDate}
            valueClassName="text-[#8f3f29]"
          />
          <DetailField label="Type" value={task.detail.type} />
          <DetailField label="Reason logged" value={task.detail.reasonLogged} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={(props) => <Icons name="Bell" {...props} />}
          >
            Notify employee
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={(props) => <Icons name="Users" {...props} />}
          >
            Reassign
          </Button>
          <Button
            size="sm"
            variant="solid"
            leftIcon={(props) => <Icons name="Check" color="white" {...props} />}
          >
            Mark done
          </Button>
        </div>
      </div>
    );
  }

  if (task.detailVariant === "timeline") {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${task.iconWrapClass}`}
            >
              <Icons name={task.icon} size={13} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                {task.title} - {task.lead}
              </h2>
            </div>
          </div>
          <TaskChip
            label={task.statusLabel}
            className="bg-lime-50 text-lime-700 shrink-0"
          />
        </div>

        <div className="mt-3 space-y-2">
          <DetailField label="Done by" value={task.detail.doneBy} />
          <DetailField label="Date" value={task.detail.date} />
          <DetailField label="Duration" value={task.detail.duration} />
          <DetailField
            label="GPS"
            value={`Logged`}
            valueClassName="text-emerald-700"
          />
          <DetailField label="Outcome" value={task.detail.outcome} />
        </div>

        <div className="mt-3 space-y-2">
          {task.detail.timeline.map((event, index) => (
            <div key={`${task.id}-${event.title}`} className="flex gap-2">
              <div className="flex flex-col items-center">
                <Icons
                  name={event.icon}
                  size={13}
                  className={event.iconClass}
                />
                {index !== task.detail.timeline.length - 1 && (
                  <div className="mt-0.5 h-6 w-px bg-gray-200" />
                )}
              </div>
              <div className="-mt-0.5">
                <p className="text-xs font-semibold text-gray-900">
                  {event.title}
                </p>
                <p className="text-xs text-gray-500">
                  {event.time}
                  {event.helper ? ` - ${event.helper}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (task.detailVariant === "callSummary") {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${task.iconWrapClass}`}
            >
              <Icons name={task.icon} size={13} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                {task.title} - {task.lead}
              </h2>
            </div>
          </div>
          <TaskChip
            label={task.statusLabel}
            className="bg-lime-50 text-lime-700 shrink-0"
          />
        </div>

        <div className="mt-3 space-y-2">
          <DetailField label="Type" value={task.detail.type} />
          <DetailField
            label="Lead"
            value={task.detail.lead}
            valueClassName="text-primary"
          />
          <DetailField label="Done by" value={task.detail.doneBy} />
          <DetailField label="Date" value={task.detail.date} />
          <DetailField label="Call duration" value={task.detail.duration} />
        </div>

        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
            <Icons name="Play" size={12} className="text-gray-500" />
            <span>Call recording</span>
          </div>

          <div className="mt-3 flex items-end gap-1">
            {[
              26, 34, 22, 40, 28, 32, 18, 36, 30, 25, 41, 23, 35, 19, 29, 31,
              17, 24, 33, 27, 20, 38, 22, 30,
            ].map((height, index) => (
              <span
                key={`${task.id}-wave-${index}`}
                className={`w-1 rounded-full ${index < 12 ? "bg-[#5a48c8]" : "bg-[#d8d3ff]"
                  }`}
                style={{ height }}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5a48c8] text-white"
            >
              <Icons name="Play" size={14} color="white" />
            </button>
            <div className="h-1 flex-1 rounded-full bg-[#ece9ff]">
              <div className="h-full w-[58%] rounded-full bg-[#5a48c8]" />
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">
              {task.detail.recordingPosition}
            </span>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-[#d9d2fb] bg-secondary p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Icons name="Sparkles" size={12} />
            <span>AI call summary</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-gray-700">
            {task.detail.summary}
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-gray-700">
            {task.detail.bullets.map((item) => (
              <li key={`${task.id}-${item}`} className="flex gap-1.5">
                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-[#7a68df]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (task.detailVariant === "demo") {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${task.iconWrapClass}`}
            >
              <Icons name={task.icon} size={13} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                {task.title}
              </h2>
            </div>
          </div>
          <TaskChip
            label={task.statusLabel}
            className="bg-violet-50 text-violet-700 shrink-0"
          />
        </div>

        <div className="mt-3 space-y-2">
          <DetailField
            label="Lead"
            value={task.detail.lead}
            valueClassName="text-primary"
          />
          <DetailField label="Demo device" value={task.detail.demoDevice} />
          <DetailField label="Scheduled" value={task.detail.scheduled} />
          <DetailField label="Location" value={task.detail.location} />
          <DetailField label="Device out date" value={task.detail.deviceOutDate} />
          <DetailField label="Device return" value={task.detail.deviceReturn} />
        </div>

        <div className="mt-3">
          <h3 className="text-xs font-semibold text-gray-900">
            Joint effort - assigned team
          </h3>

          <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
            {task.detail.team.map((member) => (
              <div
                key={`${task.id}-${member.name}`}
                className="flex items-center gap-2 px-3 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-light text-sm font-semibold text-primary">
                  {member.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                <TaskChip label={member.badge} className={member.badgeClass} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-[#fff3df] p-3 text-[#7a4a00]">
          <p className="text-xs font-semibold">Admin notes:</p>
          <p className="mt-1 text-xs leading-5">{task.detail.notes}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={(props) => <Icons name="CalendarDays" {...props} />}
          >
            Reschedule
          </Button>
          <Button
            variant="outline"
            leftIcon={(props) => <Icons name="MapPin" {...props} />}
          >
            View on map
          </Button>
          <Button
            variant="solid"
            leftIcon={(props) => <Icons name="Pencil" color="white" {...props} />}
          >
            Edit task
          </Button>
        </div>
      </div>
    );
  }

  if (task.detailVariant === "liveGps") {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${task.iconWrapClass}`}
            >
              <Icons name={task.icon} size={13} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                {task.title} - {task.lead}
              </h2>
            </div>
          </div>
          <TaskChip
            label={task.statusLabel}
            className="bg-amber-50 text-amber-700 shrink-0"
          />
        </div>

        <div className="mt-3 space-y-2">
          <DetailField label="Type" value={task.detail.type} />
          <DetailField
            label="Lead"
            value={task.detail.lead}
            valueClassName="text-primary"
          />
          <DetailField label="Assigned to" value={task.detail.assignedTo} />
          <DetailField label="Started" value={task.detail.started} />
          <DetailField label="Duration so far" value={task.detail.duration} />
          <DetailField
            label="Location (live)"
            value={`Live - ${task.detail.currentPoint}, Ahmedabad`}
            valueClassName="text-[#5d8b28]"
          />
        </div>

        <div className="mt-3">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Live GPS map</h3>

          <div className="mt-2 overflow-hidden rounded-lg border border-gray-100 bg-[linear-gradient(180deg,#ffffff_0%,#faf9ff_100%)]">
            <div className="relative h-40">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(76,40,150,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(76,40,150,0.06)_1px,transparent_1px)] bg-[size:54px_54px]" />

              <div className="absolute left-[12%] top-[72%] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <p className="text-xs font-semibold text-gray-900">
                  Start: {task.detail.startPoint}
                </p>
                <p className="text-xs text-gray-500">{task.detail.startTime}</p>
              </div>

              <div className="absolute left-[68%] top-[16%] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <p className="text-xs font-semibold text-[#5d8b28]">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#34c400]" />
                  Now: {task.detail.currentPoint}
                </p>
                <p className="text-xs text-gray-500">
                  {task.detail.currentTime}
                </p>
              </div>

              <div className="absolute left-[73%] top-[40%] h-5 w-5 rounded-full border-4 border-white bg-[#5d8b28] shadow" />
              <svg
                viewBox="0 0 420 220"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <path
                  d="M85 175 C 165 160, 250 60, 310 95"
                  fill="none"
                  stroke="#d9d2fb"
                  strokeWidth="3"
                  strokeDasharray="6 8"
                />
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Icons name="Navigation" size={13} className="text-gray-400" />
                {task.detail.distance}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icons name="Clock3" size={13} className="text-gray-400" />
                {task.detail.atLocation}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${task.iconWrapClass}`}
          >
            <Icons name={task.icon} size={13} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 leading-tight">
              {task.title} - {task.lead}
            </h2>
          </div>
        </div>
        <TaskChip label={task.statusLabel} className={task.statusClass + " shrink-0"} />
      </div>

      <div className="mt-3 space-y-2">
        <DetailField label="Type" value={task.detail.type} />
        <DetailField
          label="Lead"
          value={task.detail.lead}
          valueClassName="text-primary"
        />
        <DetailField label="Assigned to" value={task.detail.assignedTo} />
        <DetailField label="Due by" value={task.detail.due} />
        <DetailField label="Quote value" value={task.detail.quoteValue} />
        <DetailField label="Package" value={task.detail.package} />
      </div>

      <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50 p-3">
        <p className="text-xs font-semibold text-sky-800">Waiting on:</p>
        <p className="mt-1 text-xs text-sky-900">{task.detail.pendingFrom}</p>
      </div>

      <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
        <p className="text-xs font-semibold text-gray-800">Next action</p>
        <p className="mt-1 text-xs leading-5 text-gray-600">
          {task.detail.nextAction}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          leftIcon={(props) => <Icons name="Eye" {...props} />}
        >
          Preview quote
        </Button>
        <Button
          size="sm"
          variant="solid"
          leftIcon={(props) => <Icons name="Send" color="white" {...props} />}
        >
          Send now
        </Button>
      </div>
    </div>
  );
};

export const AllTask = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState("intro-call");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailMounted, setIsDetailMounted] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddTaskMounted, setIsAddTaskMounted] = useState(false);
  const addTaskCloseTimerRef = useRef(null);
  const detailCloseTimerRef = useRef(null);

  const clearCloseTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearCloseTimer(addTaskCloseTimerRef);
      clearCloseTimer(detailCloseTimerRef);
    };
  }, []);

  const handleOpenDetail = (taskId) => {
    setSelectedTaskId(taskId);
    clearCloseTimer(detailCloseTimerRef);
    setIsDetailMounted(true);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    clearCloseTimer(detailCloseTimerRef);
    detailCloseTimerRef.current = setTimeout(() => {
      setIsDetailMounted(false);
      detailCloseTimerRef.current = null;
    }, 300);
  };

  const handleOpenAddTask = () => {
    router.push("/task/add-task");
  };

  const handleCloseAddTask = () => {
    setIsAddTaskOpen(false);
    clearCloseTimer(addTaskCloseTimerRef);
    addTaskCloseTimerRef.current = setTimeout(() => {
      setIsAddTaskMounted(false);
      addTaskCloseTimerRef.current = null;
    }, 300);
  };

  const filteredTasks = tasksData.filter((task) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      task.title.toLowerCase().includes(query) ||
      task.lead.toLowerCase().includes(query) ||
      task.owner.toLowerCase().includes(query) ||
      task.assigneeNames.some((name) => name.toLowerCase().includes(query)) ||
      task.typeLabel.toLowerCase().includes(query);

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "mine" && task.isMine) ||
      task.tab === activeTab;

    const matchesEmployee =
      employeeFilter === "all" ||
      task.assigneeNames.some((name) => normalizeValue(name) === employeeFilter);

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    const matchesType = typeFilter === "all" || task.type === typeFilter;

    return (
      matchesSearch &&
      matchesTab &&
      matchesEmployee &&
      matchesStatus &&
      matchesType
    );
  });

  const hasActiveFilters =
    activeTab !== "all" ||
    employeeFilter !== "all" ||
    statusFilter !== "all" ||
    typeFilter !== "all";

  const selectedTask =
    filteredTasks.find((task) => task.id === selectedTaskId) ||
    filteredTasks[0] ||
    null;

  return (
    <div className="flex min-h-screen w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header">All tasks</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Track every pending, scheduled, and completed follow-up in one
              place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              leftIcon={(props) => <Icons name="Download" {...props} />}
            >
              Export
            </Button>
            <Button
              variant="solid"
              leftIcon={(props) => <Icons name="Plus" color="white" {...props} />}
              onClick={handleOpenAddTask}
            >
              Add task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pageStats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 md:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <Input
              id="search-tasks"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              label="Search tasks..."
              endIcon={
                <Icons name="Search" size={16} className="text-gray-400" />
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-fit">
            <Input
              type="select"
              value={employeeFilter}
              onChange={(event) => setEmployeeFilter(event.target.value)}
              options={employeeOptions}
              label="All employees"
            />

            <Input
              type="select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={statusOptions}
              label="All statuses"
            />

            <Input
              type="select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              options={typeOptions}
              label="All types"
            />
          </div>
        </div>

        <div className="border-b border-gray-100 px-4 py-3 md:px-5">
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex w-full min-w-full gap-1">
              {taskTabs.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${isActive
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`ml-2 text-xs font-semibold ${isActive ? "bg-white/20" : "bg-gray-200"
                      } px-2 py-1 rounded-full`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.85fr)_minmax(340px,0.9fr)] flex-1 overflow-hidden">
          <div className="flex flex-col overflow-hidden">
            {filteredTasks.length === 0 ? (
              <EmptyState
                search={search || (hasActiveFilters ? "active filters" : "")}
                entityName="Tasks"
                entityIcon="ListTodo"
                onClearSearch={() => {
                  setSearch("");
                  setActiveTab("all");
                  setEmployeeFilter("all");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 md:px-4 py-2 space-y-1.5">
                  {filteredTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        handleOpenDetail(task.id);
                      }}
                      className={`w-full rounded-lg border transition-all p-3 text-left ${selectedTask?.id === task.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${task.iconWrapClass}`}
                          >
                            <Icons name={task.icon} size={13} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-semibold text-gray-900 leading-tight">
                              {task.title} — {task.lead}
                            </div>
                            <p className="mt-0.5 text-[11px] text-gray-500">
                              {task.owner}
                            </p>
                          </div>
                        </div>

                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {task.assignees[0]}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        {task.meta.map((item) => (
                          <span
                            key={`${task.id}-${item.text}`}
                            className="inline-flex items-center gap-0.5 text-gray-500"
                          >
                            <Icons name={item.icon} size={11} className="text-gray-400" />
                            <span className="truncate">{item.text}</span>
                          </span>
                        ))}

                        {task.chips.map((chip) => (
                          <span
                            key={`${task.id}-${chip.label}`}
                            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${chip.className}`}
                          >
                            {chip.label}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between w-full shrink-0 md:px-5">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={(props) => <Icons name="ChevronLeft" {...props} />}
                  >
                    Previous
                  </Button>
                  <span className="text-[12px] text-gray-600">
                    1 to {filteredTasks.length} of {filteredTasks.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={(props) => (
                      <Icons name="ChevronRight" {...props} />
                    )}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="xl:sticky xl:top-0 xl:self-start hidden xl:block px-3 md:px-4 py-3 max-h-screen overflow-y-auto">
            {selectedTask ? (
              <TaskDetailCard task={selectedTask} />
            ) : (
              <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">
                  Select a task to view its details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddTaskMounted && (
        <AddTask
          open={isAddTaskOpen}
          onClose={handleCloseAddTask}
        />
      )}

      {/* Mobile/Tablet Task Detail Slide-over Drawer */}
      {isDetailMounted && (
        <div className={`fixed inset-0 z-[1000] flex justify-end xl:hidden ${isDetailOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] ${isDetailOpen ? "animate-overlay-in" : "animate-overlay-out"}`}
            onClick={handleCloseDetail}
          />
          {/* Drawer Content */}
          <div className={`relative flex h-full w-[280px] sm:w-[360px] md:w-[420px] max-w-full flex-col bg-white shadow-2xl ${isDetailOpen ? "animate-slide-in-right" : "animate-slide-out-right"} p-4 overflow-y-auto`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
                Task Details
              </h3>
              <button
                onClick={handleCloseDetail}
                className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors"
                title="Close details"
              >
                <Icons name="X" size={18} className="text-gray-500" />
              </button>
            </div>
            {selectedTask ? (
              <TaskDetailCard task={selectedTask} />
            ) : (
              <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">
                  Select a task to view its details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTask;
