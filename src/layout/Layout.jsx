import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white transition-colors duration-300 relative">
            {/* Mobile Header - Visible only on mobile/tablet */}
            <header className="lg:hidden absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-[155] transition-all duration-300"
                style={{
                    background: `linear-gradient(to right, var(--color-two), var(--color-three))`,
                }}
            >
                <div className="flex items-center gap-3">
                    <button onClick={toggleSidebar} className="p-1.5 rounded-sm bg-white/15 hover:bg-white/25 transition-all duration-300 relative overflow-hidden">
                        <div className={`transition-all duration-500 transform ${isSidebarOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`}>
                            <Menu size={20} className="text-white" />
                        </div>
                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${isSidebarOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`}>
                            <X size={20} className="text-white" />
                        </div>
                    </button>
                    {/* Simplified logo/text for mobile header */}
                    <span className="text-base font-semibold tracking-wide text-white">
                        Skool ERP
                    </span>
                </div>
            </header>

            {/* Sidebar Backdrop - Mobile Only */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1999] lg:hidden transition-opacity duration-300 animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed on mobile, relative on desktop */}
            <div className={`
                fixed lg:relative top-0 left-0 h-full z-[2000] lg:z-auto
                w-[280px] lg:w-[250px] flex-shrink-0 border-r border-gray-100
                transition-transform duration-300 ease-in-out lg:translate-x-0
                ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
            `}>
                <Sidebar setMobileOpen={setIsSidebarOpen} isMobileOpen={isSidebarOpen} />
            </div>

            {/* Main Content - Dynamic Width */}
            <main className={`
                flex-1 min-w-0 h-full overflow-y-auto bg-secondary-light p-3 
                transition-all duration-300 
                pt-20 lg:pt-3
            `}>
                {children}
            </main>
        </div>
    );
};

export default Layout;




