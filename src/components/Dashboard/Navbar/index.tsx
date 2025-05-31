"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Drawer } from "@mui/material";
import {
  FaBox,
  FaList,
  FaShoppingCart,
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";
import Link from "next/link";
import { RxCross2 } from "react-icons/rx";
import { IoMenu } from "react-icons/io5";
import {
  CategoryOutlined,
  DiscountOutlined,
  Gamepad,
  Logout,
  Wallet,
} from "@mui/icons-material";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

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
      <div className="w-full py-4 md:px-6 px-4 fixed top-0 left-0 z-[999] md:hidden bg-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-white font-extrabold text-3xl drop-shadow-[0px_0px_4px_red]">
            WinWin TOPUP
          </h1>
          <div onClick={() => setIsOpen(true)}>
            <IoMenu className="text-3xl text-primary" />
          </div>
        </div>
      </div>

      {isOpen && (
        <Drawer anchor="left" open={isOpen} onClose={() => setIsOpen(false)}>
          <div className="w-[300px] h-full bg-gray-700">
            <div className="flex justify-between items-center px-4 py-6">
              <Link href="/dashboard" className="text-white font-bold text-xl">
                <h1 className="text-white font-extrabold text-2xl drop-shadow-[0px_0px_4px_red]">
                  WinWin TOPUP
                </h1>
              </Link>
              <div onClick={() => setIsOpen(false)}>
                <RxCross2 className="text-2xl" />
              </div>
            </div>
            <nav className="mt-4">
              <ul>
                {links.map(({ href, label, icon: Icon }) => (
                  <li key={href} className="mt-2">
                    <Link
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
        </Drawer>
      )}
    </>
  );
};

export default Navbar;
