import React from "react";
import { useTheme, PRESETS } from "@/context/ThemeContext";
import { Check, Eye } from "lucide-react";

// ─── Preset Swatch ──────────────────────────────────────────────────
const PresetSwatch = ({ preset, active, onClick }) => (
    <button
        onClick={() => onClick(preset.name)}
        className={`
            relative flex items-center gap-3.5 px-4 py-3.5 rounded-lg cursor-pointer
            transition-all duration-300 border-2 group
            ${active
                ? "border-primary bg-secondary/50 shadow-md scale-[1.01]"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:scale-[1.01]"
            }
        `}
    >
        {/* Gradient orb */}
        <div
            className="relative w-10 h-10 rounded-full flex-shrink-0 shadow-inner ring-2 ring-white"
            style={{
                background: `linear-gradient(135deg, ${preset.one} 0%, ${preset.two} 50%, ${preset.three} 100%)`,
            }}
        >
            {active && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/20">
                    <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                </div>
            )}
        </div>
        <span className={`text-sm font-medium ${active ? "text-primary" : "text-gray-700"}`}>
            {preset.name}
        </span>
    </button>
);

// ─── Live Preview Mini ──────────────────────────────────────────────
const LivePreview = ({ palette }) => (
    <div className="rounded-lg overflow-hidden shadow-xl border border-gray-200 flex h-[220px]">
        {/* Mini sidebar */}
        <div
            className="w-[90px] flex flex-col items-center py-4 gap-3"
            style={{ background: `linear-gradient(to top, ${palette.one}, ${palette.two}, ${palette.three})` }}
        >
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm" />
            <div className="flex flex-col gap-2 w-full px-3 mt-2">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-2.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/30"}`}
                        style={{ width: i === 0 ? "100%" : `${70 - i * 10}%` }}
                    />
                ))}
            </div>
            <div className="mt-auto w-7 h-7 rounded-full bg-white/20 ring-1 ring-white/30" />
        </div>
        {/* Mini content */}
        <div className="flex-1 p-4 flex flex-col gap-3 bg-gray-50">
            <div className="h-3 w-3/4 rounded-full bg-gray-300" />
            <div className="h-2.5 w-1/2 rounded-full bg-gray-200" />
            <div className="flex gap-2 mt-2">
                <div className="h-8 px-4 rounded-lg text-white text-xs flex items-center font-medium" style={{ background: palette.primary }}>
                    Button
                </div>
                <div className="h-8 px-4 rounded-lg text-xs flex items-center font-medium border border-gray-300 text-gray-500">
                    Cancel
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-2 mt-1">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: palette.primary, opacity: 0.6 + i * 0.15 }} />
                        <div className="h-2 rounded-full flex-1 bg-gray-200" style={{ width: `${90 - i * 15}%` }} />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─── Main Appearance Component ──────────────────────────────────────
export const Appearance = () => {
    const {
        accentPreset,
        setAccent,
        activePalette,
    } = useTheme();

    const singleColors = PRESETS.slice(0, 8);
    const visionAssistive = PRESETS.slice(8);

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Header Bar - matches Leads top bar pattern */}
            <div className="flex items-center justify-between bg-secondary px-4 py-2.5 rounded-t-md border-b border-gray-100">
                <div>
                    <h1 className="text-base font-semibold text-gray-800">Appearance</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Customize how the dashboard looks. Changes are saved automatically.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-b-md">
                <div className="p-5 space-y-8">

                    {/* ─── Section 2: Theme Colors ─── */}
                    <section className="space-y-5">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800">Theme Colors</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Pick a preset or create your own custom theme.
                            </p>
                        </div>

                        <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
                            {/* Single color */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                                    Single color
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {singleColors.map((preset) => (
                                        <PresetSwatch
                                            key={preset.name}
                                            preset={preset}
                                            active={accentPreset === preset.name}
                                            onClick={setAccent}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Vision assistive */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                                    Vision assistive
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {visionAssistive.map((preset) => (
                                        <PresetSwatch
                                            key={preset.name}
                                            preset={preset}
                                            active={accentPreset === preset.name}
                                            onClick={setAccent}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── Divider ─── */}
                    <hr className="border-gray-100" />

                    {/* ─── Section 3: Live Preview ─── */}
                    <section className="space-y-4 pb-4">
                        <div className="flex items-center gap-2">
                            <Eye size={16} className="text-gray-500" />
                            <h2 className="text-sm font-semibold text-gray-800">Live Preview</h2>
                        </div>
                        <p className="text-xs text-gray-500">
                            See how your current selections will look across the interface.
                        </p>
                        <LivePreview palette={activePalette} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Appearance;
