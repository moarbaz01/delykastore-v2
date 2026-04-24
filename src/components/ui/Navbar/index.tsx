"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { useSession, signOut } from "next-auth/react";
import {
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProducts, setFilterProducts] = useState(products);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const temp = products;
    const filteredProducts = temp?.filter((product: any) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilterProducts(filteredProducts);
  }, [searchQuery, products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/product");
        if (res.status === 200) {
          setProducts(res.data);
          setFilterProducts(res.data);
        }
      } catch (error) {
        console.log("Error");
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const closeSearch = () => {
    setSearchQuery("");
    setShow(false);
  };

  useEffect(() => {
    setSearchQuery("");
    setShow(false);
    setIsDropdownOpen(false); // also close dropdown on navigation
  }, [pathname]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [show]);

  if (["dashboard", "not-found", "notfound", "login", "signup", "forgot-password"].includes(pathname.split("/")[1] || "")) {
    return null;
  }
  return (
    <>
      <div className="py-4  bg-gradient-to-b border-b-[0.2px] border-b-primary/50     from-primary/40  to-transaparent  sticky top-0 z-[999] h-[70px] flex items-center px-4 justify-center backdrop-blur-xl">
        <div className="max-w-screen-xl w-full   flex items-center gap-4 justify-between ">
          <Link href="/" className="flex items-center  ">
            <Image
              src="/images/WINWINTOPUP.png"
              alt="Win Win Topup"
              width={200}
              height={120}
              className=" h-[120px] w-full"
              priority={true}
            />
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl transition-all duration-300 border border-white/10 px-2 py-1 bg-white/5 hover:bg-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase transition-colors">
                    {session.user?.name?.[0] || session.user?.email?.[0] || (
                      <UserIcon size={16} />
                    )}
                  </div>
                  {isDropdownOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-secondary border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg uppercase shadow-sm shrink-0">
                        {session.user?.name?.[0] ||
                          session.user?.email?.[0] || <UserIcon size={20} />}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-white text-sm truncate">
                          {session.user?.name || "User"}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {session.user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link
                        href="/order-history"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm font-medium text-gray-200"
                      >
                        <ClipboardList size={18} className="text-gray-400" />
                        Order History
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm font-medium text-gray-200"
                      >
                        <UserIcon size={18} className="text-gray-400" />
                        Account
                      </Link>

                      <div className="h-px bg-white/10 my-2"></div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors text-sm font-medium"
                      >
                        <LogOut size={18} />
                        ចាកចេញ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-8 py-2 bg-primary hover:bg-primary/80 text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
