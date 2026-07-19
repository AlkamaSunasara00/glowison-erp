import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

const Layout = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f0f4f8] relative">

            {/* ── MOBILE HEADER ─────────────────────────────── */}
            <header className="lg:hidden absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-[155] transition-all duration-300"
                style={{ background: `linear-gradient(to right, var(--color-two), var(--color-three))` }}
            >
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-1.5 rounded-sm bg-white/15 hover:bg-white/25 transition-all duration-300 relative overflow-hidden">
                        <div className={`transition-all duration-500 transform ${isMobileOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`}>
                            <Menu size={20} className="text-white" />
                        </div>
                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${isMobileOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`}>
                            <X size={20} className="text-white" />
                        </div>
                    </button>
                    <span className="text-base font-semibold tracking-wide text-white">Glowison ERP</span>
                </div>
            </header>

            {/* ── MOBILE BACKDROP ───────────────────────────── */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1999] lg:hidden transition-opacity duration-300 animate-in fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* ── MOBILE SIDEBAR (drawer) ────────────────────── */}
            <div className={`
                fixed top-0 left-0 h-full z-[2000] lg:hidden
                w-[280px] flex-shrink-0
                transition-transform duration-300 ease-in-out
                ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}>
                <Sidebar
                    setMobileOpen={setIsMobileOpen}
                    isMobileOpen={isMobileOpen}
                    isDesktopCollapsed={false}
                    isMobile={true}
                />
            </div>

            {/* ── DESKTOP SIDEBAR ───────────── */}
            <div className={`
                hidden lg:flex flex-col h-full flex-shrink-0 z-[100]
                transition-all duration-300 ease-in-out
                ${isDesktopCollapsed ? "w-[76px]" : "w-[240px]"}
            `}>
                <Sidebar
                    setMobileOpen={setIsMobileOpen}
                    isMobileOpen={false}
                    isDesktopCollapsed={isDesktopCollapsed}
                    setDesktopCollapsed={setIsDesktopCollapsed}
                    isMobile={false}
                />
            </div>

            {/* ── MAIN CONTENT ──────────────────────────────── */}
            <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#f0f4f8] p-4 lg:p-6 pt-20 lg:pt-6 transition-all duration-300">
                {children}
            </main>
        </div>
    );
};

export default Layout;
