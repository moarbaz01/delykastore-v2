"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Drawer } from "@mui/material";
import {
  FaBox,
  FaGift,
  FaHistory,
  FaList,
  FaShoppingCart,
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";
import Link from "next/link";
import { RxCross2 } from "react-icons/rx";
import { HiMenuAlt1 } from "react-icons/hi";
import { FaGamepad, FaSignOutAlt, FaWallet, FaTags } from "react-icons/fa";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import { FaTerminal } from "react-icons/fa";

const menuGroups = [
  {
    title: "Management",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
      { href: "/dashboard/products", label: "Products", icon: FaBox },
      { href: "/dashboard/orders", label: "Orders", icon: FaShoppingCart },
      { href: "/dashboard/order-logs", label: "API Logs", icon: FaTerminal },
      { href: "/dashboard/customers", label: "Customers", icon: FaUsers },
      { href: "/dashboard/banner", label: "Sliders", icon: FaList },
      {
        href: "/dashboard/categories",
        label: "Categories",
        icon: FaList,
      },
      { href: "/dashboard/coupons", label: "Coupons", icon: FaTags },
      { href: "/dashboard/accounts", label: "Accounts", icon: FaUsers },
    ],
  },
  {
    title: "Configs",
    links: [
      { href: "/dashboard/game-list", label: "Api Game List", icon: FaGamepad },
      { href: "/dashboard/aluu-packages", label: "ALUU Packages", icon: FaGamepad },
      { href: "/dashboard/balance", label: "Balance", icon: FaWallet },
    ],
  },
  {
    title: "Gifts & Rewards",
    links: [
      { href: "/dashboard/gifts", label: "Gifts", icon: FaGift },
      {
        href: "/dashboard/gift-transactions",
        label: "Gift Transactions",
        icon: FaHistory,
      },
      {
        href: "/dashboard/spin-history",
        label: "Spin History",
        icon: FaHistory,
      },
    ],
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Handle Logout
  const handleLogout = () => {
    toast.success("Successfully Logout");
    signOut();
    router.push("/login");
  };

  if (!pathname.startsWith("/dashboard")) {
    return null;
  }
  return (
    <>
      <div className="w-full py-4 md:px-6 px-4 fixed top-0 left-0 z-[999] md:hidden bg-secondary border-b border-darkBlue">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-white font-black text-xl tracking-tight uppercase">
            DELYKASTORE
          </Link>
          <div onClick={() => setIsOpen(true)}>
            <HiMenuAlt1 className="text-3xl text-primary" />
          </div>
        </div>
      </div>

      {isOpen && (
        <Drawer anchor="left" open={isOpen} onClose={() => setIsOpen(false)}>
          <div className="w-[280px] h-full bg-secondary flex flex-col border-r border-darkBlue">
            <div className="flex justify-between items-center px-4 py-6 border-b border-darkBlue">
              <Link href="/dashboard" className="flex items-center gap-3">
                <h1 className="text-white font-black text-lg tracking-tight uppercase">
                  DELYKASTORE
                </h1>
              </Link>
              <div onClick={() => setIsOpen(false)}>
                <RxCross2 className="text-2xl" />
              </div>
            </div>
            <nav className="mt-2 px-4 pb-6 overflow-y-auto custom-scrollbar">
              {menuGroups.map((group) => (
                <div key={group.title} className="mb-6 last:mb-0">
                  <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.links.map(({ href, label, icon: Icon }) => {
                      const isActive = pathname === href;
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold tracking-wide ${
                              isActive
                                ? "bg-darkBlue text-white shadow-sm"
                                : "text-gray-300 hover:bg-darkBlue hover:text-white"
                            }`}
                          >
                            <Icon className={`mr-3 ${isActive ? "text-primary" : "text-gray-400"} text-[18px] shrink-0`} />
                            <span className="truncate">{label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <ul className="mt-6 pt-4 border-t border-darkBlue">
                <li className="cursor-pointer">
                  <div
                    onClick={handleLogout}
                    className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold tracking-wide text-red-400 hover:bg-darkBlue hover:text-red-300`}
                  >
                    <FaSignOutAlt className="mr-3 text-[18px] shrink-0 text-red-400" />
                    <span>Logout</span>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </Drawer>
      )}
    </>
  );
};

export default Navbar;
