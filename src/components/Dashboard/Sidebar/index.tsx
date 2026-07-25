"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaList,
  FaHistory,
  FaGift,
  FaTerminal,
} from "react-icons/fa";
import { HiMenuAlt1 } from "react-icons/hi"; // Hamburger icon
import { LayoutGrid, Tag, Gamepad2, LogOut, Wallet } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Initialize useRouter to get the current route
  const router = useRouter();
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Handle Logout
  const handleLogout = async () => {
    toast.success("Successfully Logout");
    await signOut({ callbackUrl: "/login", redirect: true });
  };

  // Sidebar links data
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
          icon: LayoutGrid,
        },
        { href: "/dashboard/coupons", label: "Coupons", icon: Tag },
        { href: "/dashboard/accounts", label: "Accounts", icon: FaUsers },
      ],
    },
    {
      title: "Configs",
      links: [
        { href: "/dashboard/game-list", label: "Api Game List", icon: Gamepad2 },
        { href: "/dashboard/balance", label: "Balance", icon: Wallet },
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

  return (
    <div className={`relative ${isOpen ? "block" : "hidden"} md:block`}>
      {/* Sidebar background overlay */}
      <div
        className={`fixed inset-0 bg-black opacity-50 z-10 md:hidden ${isOpen ? "block" : "hidden"
          }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-20 w-64 h-full overflow-y-auto bg-secondary border-r border-darkBlue transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 flex flex-col custom-scrollbar`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-3">
              <h1 className="text-white font-black text-lg tracking-tight uppercase">
                DELYKASTORE
              </h1>
            </Link>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-400 p-2 hover:bg-darkBlue hover:text-white rounded-lg transition-colors"
          >
            <span>&#10005;</span> {/* Close button */}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-2 px-4 pb-6">
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
                        prefetch
                        href={href}
                        className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold tracking-wide ${isActive
                          ? "bg-darkBlue text-white shadow-sm"
                          : "text-gray-300 hover:bg-darkBlue hover:text-white"
                          }`}
                      >
                        <Icon
                          className={`mr-3 ${isActive ? "text-primary" : "text-gray-400"
                            } text-[18px] shrink-0`}
                        />
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
                <LogOut className="mr-3 text-[18px] shrink-0 text-red-400" />
                <span>Logout</span>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      {/* Hamburger Button for Mobile */}
      <button
        className="md:hidden absolute top-4 left-4 z-20 text-white text-2xl"
        onClick={toggleSidebar}
      >
        <HiMenuAlt1 />
      </button>
    </div>
  );
};

export default Sidebar;
