import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    LayoutDashboard,
    Target,
    Users,
    ShoppingCart,
    Boxes,
    Library,
    Truck,
    ShoppingBag,
    Wallet,
    UserCog,
    Tags,
    FileText,
    BarChart,
    Brush,
    Settings,
    X,
    LogOut,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useInstall } from "@/context/InstallContext";
import { Download } from "lucide-react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Leads", icon: Target, path: "/leads" },
    { name: "Customers", icon: Users, path: "/customers" },
    { name: "Orders", icon: ShoppingCart, path: "/orders" },
    { name: "Inventory", icon: Boxes, path: "/inventory" },
    { name: "Catalogue", icon: Library, path: "/catalog" },
    { name: "Suppliers", icon: Truck, path: "/suppliers" },
    { name: "Purchase", icon: ShoppingBag, path: "/purchase" },
    { name: "Expense", icon: Wallet, path: "/expense" },
    { name: "Associates", icon: UserCog, path: "/associates" },
    { name: "Price List", icon: Tags, path: "/price-list" },
    { name: "Invoice", icon: FileText, path: "/invoice" },
    { name: "Reports", icon: BarChart, path: "/reports" },
    { name: "Appearance", icon: Brush, path: "/appearance" },
    { name: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = ({ setMobileOpen, isMobileOpen, isDesktopCollapsed, setDesktopCollapsed, isMobile }) => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { deferredPrompt, isAppInstalled, installApp } = useInstall();
    const [openMenus, setOpenMenus] = useState([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [hoverStyle, setHoverStyle] = useState({});

    const handleMouseEnter = (e, item) => {
        if (!isDesktopCollapsed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverStyle({ top: rect.top + rect.height / 2, left: rect.right + 10 });
        setHoveredItem(item.name);
    };

    const handleMouseLeave = () => {
        if (!isDesktopCollapsed) return;
        setHoveredItem(null);
    };

    const collapsed = !isMobile && isDesktopCollapsed;

    useEffect(() => {
        const activeMenu = menuItems.find(item => {
            if (item.children && item.children.length > 0) {
                const firstSegment = router.pathname.split("/")[1];
                return item.children.some(child => child.path.split("/")[1] === firstSegment);
            }
            return false;
        });
        if (activeMenu && !openMenus.includes(activeMenu.name)) {
            setOpenMenus(prev => [...prev, activeMenu.name]);
        }
    }, [router.pathname]);

    const toggleMenu = (name) => {
        setOpenMenus(prev =>
            prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
        );
    };

    const isChildActive = (children) => {
        const firstSegment = router.pathname.split("/")[1];
        return children.some(child => child.path.split("/")[1] === firstSegment);
    };

    const isItemActive = (item) => {
        const hasChildren = item.children && item.children.length > 0;
        return item.path === "/"
            ? router.pathname === "/"
            : (item.path && router.pathname.split("/")[1] === item.path.split("/")[1]) ||
              (hasChildren && isChildActive(item.children));
    };

    /* ── MOBILE SIDEBAR (existing full gradient style) ──────── */
    if (isMobile) {
        return (
            <div
                className="w-[330px] h-screen text-white flex flex-col py-4 pl-2 pr-0 overflow-hidden"
                style={{ background: `linear-gradient(135deg, var(--color-one) 0%, var(--color-primary) 60%, var(--color-one) 100%)` }}
            >
                {/* Logo & Close */}
                <div className="mb-4 pb-5 pr-4 flex-shrink-0 border-b border-white/10 flex items-center justify-between gap-4">
                    <Image src="/image/logo2.png" alt="Logo" width={150} height={50} priority className="h-auto w-auto max-h-fit object-contain" />
                    <button onClick={() => setMobileOpen && setMobileOpen(false)} className="p-1 rounded-sm bg-white/10 hover:bg-white/20 transition-colors mr-2">
                        <X size={18} className="text-white" />
                    </button>
                </div>

                {/* Menu */}
                <div className="flex-1 overflow-y-auto sidebar-scrollbar pr-2 flex flex-col gap-1">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item);
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openMenus.includes(item.name);

                        if (hasChildren) {
                            return (
                                <div key={index} className="flex flex-col gap-1">
                                    <div
                                        onClick={() => toggleMenu(item.name)}
                                        className={`flex items-center justify-between px-3 py-3 rounded-sm cursor-pointer transition-all ${isActive ? "bg-white text-primary shadow-sm" : isOpen ? "bg-white/10 text-white" : "hover:bg-white/10 text-white"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-6 flex justify-center">
                                                <Icon size={18} className={isActive ? "text-primary" : "text-white"} />
                                            </div>
                                            <span className={`text-sm tracking-wide whitespace-nowrap ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>
                                        </div>
                                        <ChevronRight size={16} className={`transition-all duration-300 ${isOpen ? "rotate-90" : ""} ${isActive ? "text-primary" : "text-white"}`} />
                                    </div>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                        <div className="relative ml-5 pl-6 border-l border-white/20 flex flex-col gap-1 py-1">
                                            {item.children.map((child, childIdx) => {
                                                const childActive = router.pathname === child.path;
                                                return (
                                                    <Link key={childIdx} href={child.path} onClick={() => setMobileOpen && setMobileOpen(false)} className="relative flex items-center group">
                                                        <div className={`absolute -left-[29px] w-[10px] h-[10px] rounded-full border-2 transition-all ${childActive ? "bg-white border-white ring-4 ring-white/10" : "bg-primary border-white/30 group-hover:border-white/60"}`} />
                                                        <span className={`text-sm py-2 px-1 rounded-sm w-full transition-all whitespace-nowrap duration-300 ${childActive ? "text-white font-medium" : "text-white/70 hover:text-white font-medium"}`}>{child.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link key={index} href={item.path} onClick={() => { setMobileOpen && setMobileOpen(false); setOpenMenus([]); }}
                                className={`flex items-center gap-3 px-3 py-3 rounded-sm cursor-pointer transition-all ${isActive ? "bg-white text-primary font-medium" : "hover:bg-white/10 font-medium"}`}>
                                <div className="flex-shrink-0 w-6 flex justify-center">
                                    <Icon size={18} />
                                </div>
                                <span className="text-sm tracking-wide whitespace-nowrap">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User & Install */}
                <div className="mt-3 pt-3 pr-2 flex-shrink-0 border-t border-white/10 flex flex-col gap-2">
                    {!isAppInstalled && deferredPrompt && (
                        <button
                            onClick={installApp}
                            className="flex items-center gap-2 justify-center bg-primary/40 hover:bg-primary/60 border border-white/20 p-2 rounded-sm transition-all"
                        >
                            <Download size={16} className="text-white" />
                            <span className="text-sm font-semibold text-white">Install App</span>
                        </button>
                    )}
                    <div className="flex items-center justify-between bg-secondary/10 p-2 rounded-sm border border-secondary/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-secondary/20 text-white flex items-center justify-center text-sm font-semibold border border-white/10 uppercase">
                                {user?.name ? user.name.substring(0, 2) : "AD"}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white truncate max-w-[120px] capitalize">{user?.name || "Admin"}</p>
                                <p className="text-[10px] text-white/50 tracking-wider">Administrator</p>
                            </div>
                        </div>
                        <button onClick={() => setShowLogoutModal(true)} title="Logout" className="p-2 rounded-md hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-all">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Logout Modal */}
                {showLogoutModal && typeof window !== "undefined" && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4"><LogOut size={24} /></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                                <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                                    <button onClick={() => { setShowLogoutModal(false); logout(); }} className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors">Logout</button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    }

    /* ── DESKTOP SIDEBAR (floating card style) ──────────────── */
    return (
        <div
            className="h-full w-full rounded-r-xl flex flex-col overflow-visible shadow-lg shadow-black/10 border-r border-t border-b border-white/30 relative"
            style={{ background: `linear-gradient(160deg, var(--color-one) 0%, var(--color-primary) 55%, var(--color-one) 100%)` }}
        >
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-r-2xl pointer-events-none overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, rgba(255,255,255,0.12) 0%, transparent 60%)" }} />
            </div>

            {/* ── LOGO HEADER ────────────────────────── */}
            <div className={`relative flex-shrink-0 flex items-center border-b border-white/10 transition-all duration-300 z-10 ${collapsed ? "justify-center px-0 py-4 h-[72px]" : "px-4 py-4 h-[72px]"}`}>
                {collapsed ? (
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/15 flex items-center justify-center ring-2 ring-white/20 shadow-lg">
                        <Image src="/image/logo3.png" alt="Logo" width={32} height={32} className="object-contain w-full h-full" />
                    </div>
                ) : (
                    <Image src="/image/logo2.png" alt="Glowison ERP" width={130} height={42} priority className="h-auto object-contain" />
                )}
                
                {/* Collapse / Expand Button (Half in / Half out) */}
                <button
                    onClick={() => setDesktopCollapsed(!collapsed)}
                    className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white text-primary hover:bg-gray-100 shadow-md border border-gray-200 flex items-center justify-center transition-all z-50 hover:scale-110"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={16} /> : <PanelLeftClose size={14} />}
                </button>
            </div>

            {/* ── MENU ──────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto sidebar-scrollbar py-3 flex flex-col gap-0.5 px-2">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item);
                    const hasChildren = item.children && item.children.length > 0;
                    const isOpen = openMenus.includes(item.name);

                    if (hasChildren) {
                        return (
                            <div key={index} className="flex flex-col">
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                                    onMouseLeave={handleMouseLeave}
                                    className={`group flex items-center w-full transition-all duration-200 rounded-xl relative
                                        ${collapsed ? "justify-center px-0 py-3" : "justify-between px-3 py-3"}
                                        ${collapsed 
                                            ? (isActive || isOpen ? "text-white" : "text-white/70 hover:text-white") 
                                            : (isActive ? "bg-white/20 text-white shadow-sm" : isOpen ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/10")}`}
                                >
                                    <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                                        <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${isActive ? "bg-white/25 shadow-inner" : (collapsed ? "group-hover:bg-white/20" : "group-hover:bg-white/10")}`}>
                                            <Icon size={19} />
                                        </div>
                                        {!collapsed && <span className={`text-sm tracking-wide whitespace-nowrap ${isActive ? "font-bold" : "font-semibold"}`}>{item.name}</span>}
                                    </div>
                                    {!collapsed && <ChevronRight size={15} className={`transition-all duration-300 opacity-60 ${isOpen ? "rotate-90" : ""}`} />}
                                </button>
                                {!collapsed && (
                                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
                                        <div className="relative ml-7 pl-4 border-l border-white/20 flex flex-col gap-0.5 py-1">
                                            {item.children.map((child, childIdx) => {
                                                const childActive = router.pathname === child.path;
                                                return (
                                                    <Link key={childIdx} href={child.path} className="relative group flex items-center">
                                                        <div className={`absolute -left-[17px] w-2 h-2 rounded-full border transition-all ${childActive ? "bg-white border-white" : "bg-primary border-white/40 group-hover:border-white/70"}`} />
                                                        <span className={`text-[13px] py-1.5 px-1 rounded-lg w-full transition-all whitespace-nowrap ${childActive ? "text-white font-bold" : "text-white/65 hover:text-white font-semibold"}`}>{child.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={item.path}
                            onClick={() => { setOpenMenus([]); setHoveredItem(null); }}
                            onMouseEnter={(e) => handleMouseEnter(e, item)}
                            onMouseLeave={handleMouseLeave}
                            className={`group flex items-center transition-all duration-200 rounded-xl relative
                                ${collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"}
                                ${collapsed
                                    ? (isActive ? "text-white font-bold" : "text-white/70 hover:text-white font-semibold")
                                    : (isActive
                                        ? "bg-white/20 text-white font-bold shadow-sm"
                                        : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
                                    )}`}
                        >
                            {/* Active indicator bar */}
                            {isActive && !collapsed && (
                                <div className="absolute left-2 w-0.5 h-6 rounded-full bg-white opacity-80" />
                            )}
                            <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${isActive ? "bg-white/25 shadow-inner" : (collapsed ? "group-hover:bg-white/20" : "group-hover:bg-white/10")}`}>
                                <Icon size={19} />
                            </div>
                            {!collapsed && <span className="text-sm tracking-wide whitespace-nowrap">{item.name}</span>}
                        </Link>
                    );
                })}
            </div>

            {/* ── USER FOOTER ────────────────────────────── */}
            <div className="flex-shrink-0 px-2 pb-3 pt-2 border-t border-white/10">
                {collapsed ? (
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        title="Logout"
                        className="w-full flex items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-rose-500/25 text-white/60 hover:text-rose-300 transition-all"
                    >
                        <LogOut size={16} />
                    </button>
                ) : (
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-2.5 py-2 border border-white/10">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold uppercase border border-white/20 shadow-inner">
                            {user?.name ? user.name.substring(0, 2) : "AD"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-white truncate capitalize">{user?.name || "Admin"}</p>
                            <p className="text-[10px] text-white/50 tracking-wide">Administrator</p>
                        </div>
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            title="Logout"
                            className="p-1.5 rounded-lg hover:bg-rose-500/25 text-white/50 hover:text-rose-300 transition-all flex-shrink-0"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* ── LOGOUT MODAL ───────────────────────────── */}
            {showLogoutModal && typeof window !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4"><LogOut size={24} /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                            <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => { setShowLogoutModal(false); logout(); }} className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ── TOOLTIP PORTAL ───────────────────────────── */}
            {hoveredItem && typeof window !== "undefined" && createPortal(
                <div 
                    className="fixed z-[9999] px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md shadow-xl whitespace-nowrap border border-gray-700 pointer-events-none transform -translate-y-1/2 transition-opacity duration-200"
                    style={{ top: hoverStyle.top, left: hoverStyle.left }}
                >
                    {hoveredItem}
                </div>,
                document.body
            )}
        </div>
    );
};

export default Sidebar;