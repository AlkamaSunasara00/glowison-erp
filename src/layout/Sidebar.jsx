import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    LayoutDashboard,
    Users,
    ListChecks,
    CalendarCheck,
    Folder,
    CheckSquare,
    FileText,
    Image as ImageIcon,
    Package,
    Settings,
    BookOpen,
    User,
    Layers,
    BarChart,
    MessageCircle,
    ChevronDown,
    ChevronRight,
    Clipboard,
    Palette,
    Brush,
    X,
    Truck,
    LogOut,
    Wrench
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Leads", icon: Users, path: "/leads" },
    { name: "Customers", icon: User, path: "/customers" },
    { name: "Orders", icon: ListChecks, path: "/orders" },
    { name: "Inventory", icon: Package, path: "/inventory" },
    { name: "Catalogue", icon: BookOpen, path: "/catalog" },
    { name: "Suppliers", icon: Truck, path: "/suppliers" },
    { name: "Purchase", icon: CheckSquare, path: "/purchase" },
    { name: "Expense", icon: Clipboard, path: "/expense" },
    { name: "Associates", icon: Wrench, path: "/associates" },
    { name: "Price List", icon: Palette, path: "/price-list" },
    { name: "Invoice", icon: FileText, path: "/invoice" },
    { name: "Reports", icon: BarChart, path: "/reports" },
    { name: "Appearance", icon: Brush, path: "/appearance" },
    { name: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = ({ setMobileOpen, isMobileOpen }) => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [openMenus, setOpenMenus] = useState([]); // Default closed
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        // Find which menu item has active child or segment and add it to openMenus
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
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    const isChildActive = (children) => {
        const firstSegment = router.pathname.split("/")[1];
        return children.some(child => child.path.split("/")[1] === firstSegment);
    };

    return (
        <div
            className="lg:w-[250px] w-[280px] h-screen text-white bg-primary  flex flex-col py-4 pl-2 pr-0 overflow-hidden transition-colors duration-500"
            style={{ background: `linear-gradient(135deg, var(--color-one) 0%, var(--color-primary) 60%, var(--color-one) 100%)` }}
        >
            {/* Logo & Close Button Header */}
            <div className="mb-4 pb-5 pr-4 flex-shrink-0 border-b border-white/10 flex items-center justify-between gap-4">
                <div className={`transition-all duration-300 ${isMobileOpen ? "opacity-100 w-auto" : "opacity-0 w-0 lg:opacity-100 lg:w-auto overflow-hidden"}`}>
                    <Image
                        src="/image/logo2.png"
                        alt="Logo"
                        width={150}
                        height={50}
                        priority
                        className="h-auto w-auto max-h-fit object-contain"
                    />
                </div>

                {/* Close button for mobile */}
                <button
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className="lg:hidden p-1 rounded-sm bg-white/10 hover:bg-white/20 transition-colors mr-2"
                >
                    <X size={18} className="text-white" />
                </button>
            </div>

            {/* Menu - Scrollable Middle */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-1">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const hasChildren = item.children && item.children.length > 0;
                    const isOpen = openMenus.includes(item.name);
                    const isActive = item.path === "/"
                        ? router.pathname === "/"
                        : (item.path && router.pathname.split("/")[1] === item.path.split("/")[1]) || (hasChildren && isChildActive(item.children));

                    if (hasChildren) {
                        return (
                            <div key={index} className="flex flex-col gap-1">
                                <div
                                    onClick={() => toggleMenu(item.name)}
                                    className={`flex items-center justify-between px-3 py-3 rounded-sm cursor-pointer transition-all
                                        ${isActive ? "bg-white text-primary shadow-sm" :
                                            isOpen ? "bg-white/10 text-white" : "hover:bg-white/10 text-white"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-6 flex justify-center">
                                            <Icon size={18} className={isActive ? "text-primary" : "text-white"} />
                                        </div>
                                        <span className={`text-sm tracking-wide transition-all duration-300 whitespace-nowrap ${isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 lg:opacity-100 lg:translate-x-0"} ${isActive ? "font-semibold" : "font-medium"}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <ChevronRight
                                        size={16}
                                        className={`transition-all duration-300 ${isOpen ? "rotate-90" : ""} ${isActive ? "text-primary" : "text-white"} ${isMobileOpen ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
                                    />
                                </div>

                                {/* Submenu with Stepper Line */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out
                                        ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                                >
                                    <div className="relative ml-5 pl-6 border-l border-white/20 flex flex-col gap-1 py-1">
                                        {item.children.map((child, childIdx) => {
                                            const isChildActive = router.pathname === child.path;
                                            return (
                                                <Link
                                                    key={childIdx}
                                                    href={child.path}
                                                    onClick={() => setMobileOpen && setMobileOpen(false)}
                                                    className="relative flex items-center group"
                                                >
                                                    {/* Stepper Dot */}
                                                    <div className={`absolute -left-[29px] w-[10px] h-[10px] rounded-full border-2 transition-all
                                                        ${isChildActive
                                                            ? "bg-white border-white ring-4 ring-white/10"
                                                            : "bg-primary border-white/30 group-hover:border-white/60"}`}
                                                    />

                                                    <span className={`text-sm py-2 px-1 rounded-sm w-full transition-all whitespace-nowrap duration-300
                                                        ${isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 lg:opacity-100 lg:translate-x-0"}
                                                        ${isChildActive
                                                            ? "text-white font-medium"
                                                            : "text-white/70 hover:text-white font-medium"}`}
                                                    >
                                                        {child.name}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={item.path}
                            onClick={() => {
                                setMobileOpen && setMobileOpen(false);
                                setOpenMenus([]);
                            }}
                            className={`flex items-center gap-3 px-3 py-3 rounded-sm cursor-pointer transition-all
                ${isActive
                                    ? "bg-white text-primary font-medium"
                                    : "hover:bg-white/10 font-medium"
                                }`}
                        >
                            <div className="flex-shrink-0 w-6 flex justify-center">
                                <Icon size={18} />
                            </div>
                            <span className={`text-sm tracking-wide transition-all duration-300 whitespace-nowrap ${isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 lg:opacity-100 lg:translate-x-0"}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom User - Sticky Bottom */}
            <div className="mt-3 pt-3 pr-2 flex-shrink-0 border-t border-white/10">
                <div className="flex items-center justify-between bg-secondary/10 p-2 rounded-sm border border-secondary/20 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-secondary/20 text-white flex items-center justify-center text-sm font-semibold border border-white/10 uppercase">
                            {user?.name ? user.name.substring(0,2) : "AD"}
                        </div>
                        <div className={`transition-all duration-300 ${isMobileOpen ? "opacity-100 w-auto" : "opacity-0 w-0 lg:opacity-100 lg:w-auto overflow-hidden"}`}>
                            <p className="text-sm font-medium text-white truncate max-w-[120px] capitalize">{user?.name || "Admin"}</p>
                            <p className="text-[10px] text-white/50 tracking-wider">Administrator</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowLogoutModal(true)}
                        title="Logout"
                        className={`p-2 rounded-md hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-all duration-300 ${isMobileOpen ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-sm transform transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                                <LogOut size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                            <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowLogoutModal(false);
                                        logout();
                                    }}
                                    className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Sidebar;