"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, ClipboardList, User } from "lucide-react";

const BottomNav = () => {
  const pathname = usePathname();

  // Hide on specific routes like admin/dashboard
  const hiddenRoutes = ["dashboard", "not-found", "notfound", "login", "signup", "forgot-password", "product"];
  if (hiddenRoutes.includes(pathname.split("/")[1] || "")) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home, matchExact: true },
    { label: "Games", href: "/games", icon: Gamepad2 },
    { label: "Orders", href: "/order-history", icon: ClipboardList },
    { label: "Profile", href: "/account", icon: User },
  ];

  return (
    <>
      {/* Spacer for mobile so content isn't hidden behind the fixed bar */}
      <div className="h-20 md:hidden" />

      {/* Bottom Nav */}
      <div
        className="fixed bottom-0 left-0 w-full z-[998] md:hidden backdrop-blur-xl transition-all duration-300"
        style={{
          background: "rgba(13, 11, 26, 0.95)",
          borderTop: "1px solid rgba(168,85,247,0.15)",
          paddingBottom: "env(safe-area-inset-bottom)", // For iOS home indicator
        }}
      >
        <div className="flex items-center justify-around px-2 py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Handle active state
            let isActive = false;
            if (item.matchExact) {
              isActive = pathname === item.href;
            } else {
              // #games will show active if on home but we usually just highlight home
              // Let's just highlight games when we click it, or rely on URL hash (but Next.js pathname doesn't include hash)
              // For Games, we'll only highlight if pathname is specifically /games, which it isn't.
              // So for now, we just match by pathname.
              isActive = pathname.startsWith(item.href.split("#")[0]) && pathname !== "/";
              if (item.href === "/#games") {
                isActive = false; // It's hard to track hash in pathname, we'll keep it simple
              }
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 min-w-[64px]"
              >
                <div
                  className={`transition-colors duration-200 ${
                    isActive ? "text-[#A855F7]" : "text-gray-400"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-[#A855F7]" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BottomNav;
