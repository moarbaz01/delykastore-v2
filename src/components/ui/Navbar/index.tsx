"use client";
import Image from "next/image";
import FallbackImage from "@/components/ui/FallbackImage";
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
  Search,
  Menu,
  ShoppingCart,
  X,
  Home,
  Gamepad2,
} from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProducts, setFilterProducts] = useState(products);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShow(false);
      }
      const navDropdown = document.getElementById("nav-dropdown");
      if (navDropdown && !navDropdown.contains(event.target as Node)) {
        setIsNavDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      } catch {
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
    setIsDropdownOpen(false);
    setIsNavDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
  }, [show]);

  const hiddenRoutes = ["dashboard", "not-found", "notfound", "login", "signup", "forgot-password"];
  if (hiddenRoutes.includes(pathname.split("/")[1] || "")) {
    return null;
  }

  return (
    <>

      {/* Main Navbar */}
      <div
        className={`sticky top-0 z-[999] h-[68px] flex items-center transition-all duration-300 ${
          scrolled
            ? "bg-[#0D0B1A]/95 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            : "bg-[#0D0B1A]/80 backdrop-blur-md border-b border-purple-500/10"
        }`}
      >
        <div className="max-w-screen-xl w-full mx-auto px-4">
          {/* Mobile Layout */}
          <div className="flex md:hidden items-center justify-between w-full h-full py-3">


            <Link href="/" className="flex items-center">
              <Image src="/images/logo-animated.gif" alt="DELYKASTORE" width={120} height={40} className="h-8 md:h-10 w-auto" />
            </Link>

            <div className="flex items-center gap-4">
              <button onClick={() => setShow(!show)} className="text-gray-300 hover:text-white">
                <Search size={22} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between w-full h-full py-2">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-6 relative" id="nav-dropdown">
              <button 
                onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                className="text-gray-300 hover:text-white p-1 transition-colors flex items-center gap-1"
              >
                <Menu size={28} strokeWidth={2} />
              </button>

              {isNavDropdownOpen && (
                <div className="absolute left-0 top-full mt-4 w-56 animate-slide-down rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50"
                  style={{ background: "#12102A", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <div className="p-2 space-y-1">
                    {[
                      { label: "Home", href: "/", icon: Home },
                      { label: "Games", href: "/games", icon: Gamepad2 },
                      { label: "Profile", href: "/account", icon: UserIcon },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = item.href === "/" 
                        ? pathname === "/" 
                        : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setIsNavDropdownOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                            isActive 
                              ? "bg-purple-500/10 text-purple-400" 
                              : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
                          }`}
                        >
                          <Icon size={18} />
                          <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <Link href="/" className="flex items-center">
                <Image src="/images/logo-animated.gif" alt="DELYKASTORE" width={140} height={48} className="h-10 w-auto" />
              </Link>
            </div>

            {/* Right: Search + User */}
            <div className="flex items-center gap-3">
              {/* Search Toggle */}
              <button
                onClick={() => setShow(!show)}
                className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
              >
                <Search size={16} />
              </button>

              {/* User Section */}
              {session ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 rounded-xl transition-all duration-200 border border-purple-500/20 px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/40"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold uppercase text-sm"
                      style={{ background: "linear-gradient(135deg, #7B2FBE, #A855F7)" }}>
                      {session.user?.name?.[0] || session.user?.email?.[0] || <UserIcon size={14} />}
                    </div>
                    {isDropdownOpen ? (
                      <ChevronUp size={14} className="text-purple-300" />
                    ) : (
                      <ChevronDown size={14} className="text-purple-300" />
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 animate-slide-down rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50"
                      style={{ background: "#12102A", border: "1px solid rgba(168,85,247,0.2)" }}>
                      {/* User Info */}
                      <div className="p-4 border-b border-purple-500/10 flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg uppercase shadow-sm shrink-0"
                          style={{ background: "linear-gradient(135deg, #7B2FBE, #A855F7)" }}
                        >
                          {session.user?.name?.[0] || session.user?.email?.[0] || <UserIcon size={20} />}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-semibold text-white text-sm truncate">
                            {session.user?.name || "User"}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {session.user?.email}
                          </div>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="p-2 space-y-0.5">
                        <Link
                          href="/account"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-purple-500/10 rounded-xl transition-colors text-sm font-medium text-gray-200 group"
                        >
                          <UserIcon size={16} className="text-purple-400 group-hover:text-purple-300" />
                          Account
                        </Link>

                        <div className="h-px bg-purple-500/10 my-1" />

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl transition-colors text-sm font-medium"
                        >
                          <LogOut size={16} />
                          ចាកចេញ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #A855F7 100%)" }}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {show && (
        <div className="fixed inset-0 z-[998] flex flex-col animate-fade-in" ref={searchRef}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeSearch} />

          {/* Search panel */}
          <div className="relative z-10 mx-auto w-full max-w-2xl mt-24 px-4">
            <div
              className="rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.8)]"
              style={{ background: "#12102A", border: "1px solid rgba(168,85,247,0.3)" }}
            >
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-500/10">
                <Search size={18} className="text-purple-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search games or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                />
                <button onClick={closeSearch} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Results */}
              {filterProducts.length > 0 ? (
                <div className="max-h-80 overflow-y-auto p-2">
                  {filterProducts.slice(0, 8).map((product: any) => (
                    <Link
                      key={product._id}
                      href={`/product/${product._id}`}
                      onClick={closeSearch}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/10 transition-colors group"
                    >
                      <FallbackImage
                        src={product.image}
                        alt={product.name}
                        width={36}
                        height={36}
                        fallbackIconSize={16}
                        className="rounded-lg object-cover aspect-square shrink-0"
                      />
                      <span className="text-sm text-gray-200 group-hover:text-white transition-colors font-medium">
                        {product.name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No products found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Type to search games or products
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
