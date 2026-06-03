import React from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";

export const GpsTracker = () => {
  const router = useRouter();

  // Employee status list (from top row of image)
  const employeeStatuses = [
    {
      name: "Arjun Patel",
      status: "Live",
      details: "Vastrapur, Ahmedabad · 10:32 AM",
      isLive: true,
      color: "emerald",
    },
    {
      name: "Sneha Mehta",
      status: "Live",
      details: "Navrangpura · 10:18 AM",
      isLive: true,
      color: "emerald",
    },
    {
      name: "Rohit Shah",
      status: "Idle",
      details: "Last seen 9:15 AM",
      isLive: false,
      color: "slate",
    },
  ];

  // Daily field logs list (from right column of image)
  const fieldLogs = [
    {
      name: "Arjun Patel",
      initials: "AP",
      stats: "3 visits · 12.4 km · 2h 18m field time",
      status: "Live",
      progress: 75,
      theme: {
        bg: "bg-violet-100 text-violet-700",
        bar: "bg-violet-600",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
    },
    {
      name: "Sneha Mehta",
      initials: "SM",
      stats: "2 visits · 8.1 km · 1h 44m field time",
      status: "Live",
      progress: 50,
      theme: {
        bg: "bg-emerald-50 text-emerald-700",
        bar: "bg-emerald-600",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
    },
    {
      name: "Rohit Shah",
      initials: "RS",
      stats: "1 visit · 3.2 km · 42m field time",
      status: "Idle",
      progress: 25,
      theme: {
        bg: "bg-amber-100 text-amber-700",
        bar: "bg-amber-500",
        badge: "bg-slate-50 text-slate-600 border-slate-200",
      },
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col gap-4">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between py-2">
        <div>
          <h1 className="page-header">GPS tracker</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor real-time locations and daily activity logs of field employees.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            leftIcon={(props) => <Icons name="Plus" color="white" {...props} />}
            onClick={() => router.push("/task/add-task")}
          >
            Add task
          </Button>
        </div>
      </div>

      {/* ── TOP STATS ROW ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employeeStatuses.map((emp, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  emp.isLive ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                  {emp.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{emp.details}</p>
              </div>
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                emp.isLive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {emp.status}
            </span>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Left Column: Live Map */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-md font-semibold text-gray-900">
            Live map — all field employees
          </h2>

          {/* Styled Map Container */}
          <div
            className="w-full h-[450px] bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          >
            {/* Map Decorative Terrain features for realistic SaaS appearance */}
            <div className="absolute top-[25%] left-0 w-[45%] h-8 bg-blue-100/30 transform rotate-12 blur-[4px] pointer-events-none" />
            <div className="absolute top-[60%] right-[10%] w-36 h-24 bg-emerald-50/50 rounded-full blur-[8px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[40%] w-48 h-12 bg-slate-200/20 rounded-lg blur-[2px] pointer-events-none" />

            {/* SVG Path lines representing live routes */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Route to Sneha Mehta */}
              <path
                d="M 15 80 Q 20 50, 32 35"
                fill="none"
                stroke="#0d9488"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                style={{ vectorEffect: "non-scaling-stroke" }}
              />
              {/* Route to Arjun Patel */}
              <path
                d="M 15 80 Q 30 75, 52 45"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                style={{ vectorEffect: "non-scaling-stroke" }}
              />
            </svg>

            {/* 1. Unilog Office Marker (bottom-left) */}
            <div className="absolute bottom-[16%] left-[12%] flex flex-col items-center z-10">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-700 border-2 border-white shadow-md flex items-center justify-center shrink-0" />
              <div className="mt-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <Icons name="Building" size={12} className="text-slate-500 shrink-0" />
                Unilog Office
              </div>
            </div>

            {/* 2. Sneha Mehta Marker (top-middle-left) */}
            <div className="absolute top-[32%] left-[29%] flex flex-col items-center z-20">
              <div className="w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white shadow-md relative z-10 shrink-0" />
              
              {/* Speech bubble label */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 p-2 rounded-xl text-left shadow-md min-w-[130px] z-30">
                <p className="text-[10px] font-bold text-teal-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  SM — Sneha Mehta
                </p>
                <p className="text-[9px] text-gray-500 font-medium mt-0.5">
                  Navrangpura · 8.1 km
                </p>
                {/* Small indicator arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45" />
              </div>
            </div>

            {/* 3. Arjun Patel Marker (top-middle-right) */}
            <div className="absolute top-[42%] left-[49%] flex flex-col items-center z-20">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow-md relative z-10 shrink-0" />
              
              {/* Speech bubble label */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 p-2 rounded-xl text-left shadow-md min-w-[130px] z-30">
                <p className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  AP — Arjun Patel
                </p>
                <p className="text-[9px] text-gray-500 font-medium mt-0.5">
                  Vastrapur · 12.4 km
                </p>
                {/* Small indicator arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Field Log */}
        <div className="bg-white h-fit border border-slate-200/60 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-900">
            Today's field log
          </h2>

          <div className="flex flex-col divide-y divide-gray-100">
            {fieldLogs.map((log, index) => (
              <div key={index} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Circle initials badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${log.theme.bg}`}>
                      {log.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {log.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {log.stats}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${log.theme.badge}`}>
                    {log.status}
                  </span>
                </div>

                {/* Custom Colored Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${log.theme.bar}`}
                    style={{ width: `${log.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpsTracker;