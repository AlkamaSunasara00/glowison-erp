import React from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import { useRouter } from "next/router";
import { useState } from "react";
import EditLead from "./leadsModal/EditLead";
import StatusBadge from "@/common/StatusBadge";
import { formatDate } from "@/utils/formatters";

const stages = ["NEW", "CONTACTED", "NEGOTIATION", "CLOSED_WON"];

const LeadActionIcon = ({ name, color = "currentColor", ...props }) => (
  <Icons name={name} color={color} {...props} />
);

const LeadDetail = ({ open, onClose, lead, isPage = false, onLeadUpdated }) => {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const data = lead || {};

  const handleBack = () => {
    if (isPage) {
      router.push("/leads");
    } else {
      onClose?.();
    }
  };

  const detailInfo = {
    "Name": data.name || "—",
    "Phone": data.phone || "—",
    "Email": data.email || "—",
    "Product Interest": data.interest === 'OTHER' ? data.interestOther : data.interest || "—",
    "Source": data.source === 'OTHER' ? data.sourceOther : data.source || "—",
    "Stage": data.status || "NEW",
    "Notes": data.notes || "—",
  };


  const timeline = [
    { label: "Lead created", date: data.createdAt ? formatDate(data.createdAt) : "May 19", by: "System", dot: "bg-gray-300" },
    { label: `Stage set to ${data.stage || 'new'}`, date: data.updatedAt ? formatDate(data.updatedAt) : "May 19", by: "Admin", dot: "bg-blue-500" },
  ];

  const stageIndex = stages.findIndex(
    (s) => s === data.status || s === data.stage
  );
  
  const isLost = data.status === 'CLOSED_LOST' || data.stage === 'lost';
  const currentStageIndex = isLost ? -1 : (stageIndex >= 0 ? stageIndex : 0);

  const detailPanelContent = (
    <div
      className={isPage ? "flex flex-col gap-4 w-full animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:w-[90%] md:h-screen ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className={isPage ? "flex items-center justify-between py-2" : "flex items-center justify-between px-7 py-4 border-b border-gray-100 bg-white"}>
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
              {data.name || "Unknown Lead"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{data.phone}</p>
          </div>
          <StatusBadge status={(data.status || data.stage || "NEW").replace('_', ' ')} />
        </div>

          <div className="flex items-center gap-2">
            {data.status === 'CLOSED_WON' && (
              <Button
                variant="solid"
                size="md"
                rightIcon={(props) => <LeadActionIcon name="ArrowRight" color="white" {...props} />}
                className="rounded-lg px-3! py-1.5! text-xs font-semibold"
              >
                Convert to customer
              </Button>
            )}
          </div>
        </div>

        {/* ── STAGE PROGRESS ─────────────────────────────────── */}
        {!isLost && (
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
                      className={`text-[10px] font-semibold tracking-wider mt-1.5 
                        ${
                          isActive || isCompleted
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {stage.replace('_', ' ')}
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
        )}

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
                    onClick={() => setIsEditOpen(true)}
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
                        <StatusBadge status={value} />
                      ) : (
                        <span className="text-sm text-gray-800 font-medium">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
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
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={(props) => <LeadActionIcon name="MessageCircle" {...props} />}
                    className="w-full justify-start rounded-lg px-3! py-2! text-xs font-medium"
                    onClick={() => data.phone && window.open(`https://wa.me/${data.phone.length === 10 ? '91' + data.phone : data.phone.replace(/\D/g, '')}`, '_blank')}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={(props) => <LeadActionIcon name="Phone" {...props} />}
                    className="w-full justify-start rounded-lg px-3! py-2! text-xs font-medium"
                    onClick={() => data.phone && (window.location.href = `tel:${data.phone}`)}
                  >
                    Call
                  </Button>
                </div>
              </section>

              {!isPage && <div className="h-px bg-gray-200" />}

              {/* Activity Timeline */}
              <section className={isPage ? "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm" : ""}>
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3">
                  Activity Timeline
                </h3>
                <div className="relative">
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
    return (
      <>
        {detailPanelContent}
        {isEditOpen && (
          <EditLead
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            initialData={data}
            onSuccess={() => {
              if (onLeadUpdated) onLeadUpdated();
              setIsEditOpen(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
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
          onClick={handleBack}
        />
        {detailPanelContent}
      </div>
      {isEditOpen && <EditLead open={isEditOpen} onClose={() => setIsEditOpen(false)} initialData={data} />}
    </>
  );
};

export default LeadDetail;
