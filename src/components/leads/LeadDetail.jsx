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
      className={isPage ? "flex flex-col w-full min-h-screen bg-transparent animate-fade-in" : `relative flex h-full w-full max-w-full flex-col bg-gray-50 shadow-2xl md:w-[95%] md:max-w-6xl md:h-[95vh] md:rounded-sm md:my-auto mx-auto overflow-hidden ${
        open ? "animate-slide-in-right" : "animate-slide-out-right"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className={`relative shrink-0 z-10 ${isPage ? 'mb-4' : 'bg-white border-b border-gray-100 px-6 py-4'}`}>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="mt-1 sm:mt-0 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all shrink-0"
            title="Go back"
          >
            <Icons name="ArrowLeft" size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-sm bg-gradient-to-br from-primary to-indigo-600 text-white font-bold text-xl shadow-md shadow-primary/20 shrink-0 overflow-hidden bg-white border border-gray-100">
               {(data.name || "UN").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {data.name || "Unknown Lead"}
                </h2>
                <StatusBadge status={(data.status || data.stage || "NEW").replace('_', ' ')} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                {data.phone}
              </div>
            </div>
          </div>
        </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-start sm:justify-end">
            {data.status === 'CLOSED_WON' && (
              <Button
                variant="solid"
                size="sm"
                rightIcon={(props) => <LeadActionIcon name="ArrowRight" color="white" {...props} />}
                className="rounded-sm px-3 py-2 text-xs font-semibold shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all"
              >
                Convert to customer
              </Button>
            )}
          </div>
        </div>
        </div>

        {/* ── STAGE PROGRESS ─────────────────────────────────── */}
        {!isLost && (
          <div className={isPage ? "px-6 py-5 mb-4 bg-white border border-gray-100/80 rounded-sm shadow-sm" : "px-7 py-5 bg-gray-50/60 border-b border-gray-100"}>
            <div className="flex items-start w-full">
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
                      <div className="flex-1 mx-2 relative top-[15px]">
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
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPage ? 'pb-10' : 'p-6'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">

            {/* ── LEFT ── */}
            <div className="lg:col-span-8 flex flex-col gap-4">

              {/* Lead Information */}
              <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2">
                    <Icons name="User" size={16} className="text-primary"/> Lead Information
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Icons name="Pencil" size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {Object.entries(detailInfo).map(([key, value]) => (
                    <div key={key} className="flex flex-col w-fit gap-0.5">
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
            <div className="lg:col-span-4 flex flex-col gap-4">

              {/* Quick Actions */}
              <section className="bg-white rounded-sm p-5 shadow-sm border border-gray-100/80">
                <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-2 mb-4">
                  <Icons name="Zap" size={16} className="text-primary"/> Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={(props) => <LeadActionIcon name="MessageCircle" {...props} />}
                    className="w-full justify-center rounded-sm px-3 py-2 text-xs font-semibold shadow-sm border-gray-200 hover:bg-gray-50 bg-white"
                    onClick={() => data.phone && window.open(`https://wa.me/${data.phone.length === 10 ? '91' + data.phone : data.phone.replace(/\D/g, '')}`, '_blank')}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={(props) => <LeadActionIcon name="Phone" {...props} />}
                    className="w-full justify-center rounded-sm px-3 py-2 text-xs font-semibold shadow-sm border-gray-200 hover:bg-gray-50 bg-white"
                    onClick={() => data.phone && (window.location.href = `tel:${data.phone}`)}
                  >
                    Call
                  </Button>
                </div>
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
        className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm ${
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
