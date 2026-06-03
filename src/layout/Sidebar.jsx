import React, { useState, useEffect } from "react";
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
    X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Leads", icon: Users, path: "/leads" },
    // { name: "Enrollment", icon: FileText, path: "/enrollment" },
    {
        name: "Task",
        icon: ListChecks,
        children: [
            { name: "All Task", path: "/task/all-task" },
            { name: "GPS Tracker", path: "/task/gps-tracker" },
            { name: "Travel Claims", path: "/task/travel-claims" },
        ]
    },
    { name: "Attendance", icon: CalendarCheck, path: "/attendance" },
    // { name: "Content", icon: Folder, path: "/content" },
    // { name: "Task", icon: CheckSquare, path: "/task" },
    // { name: "Invoices", icon: FileText, path: "/invoices" },
    // { name: "Products", icon: Package, path: "/products" },
    // { name: "Campaigns", icon: Layers, path: "/campaigns" },
    // { name: "Template", icon: Layers, path: "/template" },
    // { name: "WhatsApp Bots", icon: MessageCircle, path: "/whatsapp-bots" },
    // { name: "Sales Targets", icon: BarChart, path: "/sales-targets" },
    // { name: "WABA Info", icon: ImageIcon, path: "/waba-info" },
    // { name: "Integration", icon: Settings, path: "/integration" },
    // { name: "Appearance", icon: Palette, path: "/appearance" },
];

const Sidebar = ({ setMobileOpen, isMobileOpen }) => {
    const router = useRouter();
    const [openMenus, setOpenMenus] = useState([]); // Default closed

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
            style={{ background: `linear-gradient(135deg, #4C2896 0%, #8038A1 60%, #9b45b2 100%)` }}
        >
            {/* Logo & Close Button Header */}
            <div className="mb-4 pb-5 pr-4 flex-shrink-0 border-b border-white/10 flex items-center justify-between gap-4">
                <div className={`transition-all duration-300 ${isMobileOpen ? "opacity-100 w-auto" : "opacity-0 w-0 lg:opacity-100 lg:w-auto overflow-hidden"}`}>
                    <Image
                        src="/image/white-logo.png"
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
                <div className="flex items-center justify-between bg-secondary/10 p-2 rounded-sm border border-secondary/20 cursor-pointer hover:bg-secondary/20 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-secondary/20 text-white flex items-center justify-center text-sm font-semibold border border-white/10">
                            JD
                        </div>
                        <div className={`transition-all duration-300 ${isMobileOpen ? "opacity-100 w-auto" : "opacity-0 w-0 lg:opacity-100 lg:w-auto overflow-hidden"}`}>
                            <p className="text-sm font-medium text-white truncate max-w-[120px]">John Doe..</p>
                            <p className="text-[10px] text-white/50 tracking-wider">Admin</p>
                        </div>
                    </div>
                    <div className={`transition-all duration-300 ${isMobileOpen ? "opacity-100" : "opacity-0 lg:opacity-100"}`}>
                        <ChevronDown size={16} className="text-white/60" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;