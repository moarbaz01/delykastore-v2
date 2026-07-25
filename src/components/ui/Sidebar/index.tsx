"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, ClipboardList, User, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Games", href: "/#games", icon: Gamepad2 },
    { label: "Profile", href: "/account", icon: User },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-[1001] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "#12102A",
          borderRight: "1px solid rgba(168, 85, 247, 0.2)",
          boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div className="flex items-center justify-between p-5 border-b border-purple-500/10">
          <Link href="/" onClick={onClose} className="text-xl font-black italic text-gray-200 tracking-wider font-sans">
            DELYKASTORE
          </Link>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col py-6 px-3 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("#")[0]));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-purple-500/10 text-[#A855F7] border border-purple-500/20" 
                    : "text-gray-300 hover:bg-purple-500/5 hover:text-white border border-transparent"
                }`}
              >
                <Icon size={20} />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Decorative glows */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-[50px] pointer-events-none"
             style={{ background: "rgba(168, 85, 247, 0.15)" }} />
      </div>
    </>
  );
};

export default Sidebar;
