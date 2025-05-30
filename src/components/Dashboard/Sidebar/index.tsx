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
} from "react-icons/fa";
import { HiMenuAlt1 } from "react-icons/hi"; // Hamburger icon
import {
  CategoryOutlined,
  DiscountOutlined,
  Gamepad,
  Logout,
  Wallet,
} from "@mui/icons-material";
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
  const handleLogout = () => {
    toast.success("Successfully Logout");
    signOut();
    router.push("/login");
  };

  // Sidebar links data
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { href: "/dashboard/products", label: "Products", icon: FaBox },
    { href: "/dashboard/orders", label: "Orders", icon: FaShoppingCart },
    { href: "/dashboard/customers", label: "Customers", icon: FaUsers },
    { href: "/dashboard/banner", label: "Sliders", icon: FaList },
    {
      href: "/dashboard/game-list",
      label: "Api Game List",
      icon: Gamepad,
    },
    {
      href: "/dashboard/categories",
      label: "Categories",
      icon: CategoryOutlined,
    },
    {
      href: "/dashboard/balance",
      label: "Balance",
      icon: Wallet,
    },
    { href: "/dashboard/coupons", label: "Coupons", icon: DiscountOutlined },
  ];

  return (
    <div className={`relative ${isOpen ? "block" : "hidden"} md:block`}>
      {/* Sidebar background overlay */}
      <div
        className={`fixed inset-0 bg-black opacity-50 z-10 md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-20 w-64 h-full overflow-y-auto bg-gradient-to-br bg-gray-800 shadow-xl transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 bg-gray-800">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="">
                <Image
                  src="/images/logo.png"
                  alt="Kiragame Store"
                  width={60}
                  height={60}
                  className="  w-full h-full drop-shadow-[0px_0px_2px_red]  "
                />
              </div>
              <h1 className="text-white font-extrabold text-xl drop-shadow-[0px_0px_4px_red]">
                GETO TOPUP
              </h1>
            </Link>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white p-2 hover:bg-gray-700 rounded-full"
          >
            <span>&#10005;</span> {/* Close button */}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4">
          <ul>
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href} className="mt-2">
                <Link
                  prefetch
                  href={href}
                  className={`flex items-center p-4 rounded-lg transition-colors ${
                    pathname === href
                      ? "bg-gray-700 text-primary"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <Icon className="mr-4 text-lg" />
                  <span className="text-lg">{label}</span>
                </Link>
              </li>
            ))}
            <li className="mt-2 cursor-pointer">
              <div
                onClick={handleLogout}
                className={`flex items-center p-4 rounded-lg transition-colors hover:bg-gray-700`}
              >
                <Logout className="mr-4 text-lg" />
                <span className="text-lg">Logout</span>
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
