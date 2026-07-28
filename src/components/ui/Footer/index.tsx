"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTelegram, FaFacebook } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  const hiddenRoutes = [
    "dashboard", "not-found", "notfound", "login", "signup", "forgot-password", "product",
  ];
  if (hiddenRoutes.includes(pathname.split("/")[1] || "")) {
    return null;
  }

  return (
    <footer 
      className="relative z-0 overflow-hidden border-t border-purple-500/10"
      style={{ background: "#0D0B1A" }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          
          {/* Left: Contact Us */}
          <div className="flex flex-col items-center md:items-start flex-1">
            <h4 className="text-sm font-bold text-purple-400 mb-3 tracking-wide">Contact Us</h4>
            <div className="flex gap-3">
              <Link
                href="https://t.me/Delyy_kaa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-300 transition-all duration-200 shadow-sm shadow-purple-500/10"
              >
                <FaTelegram size={20} />
              </Link>
              <Link
                href="https://www.facebook.com/share/18FUJ1LddM/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-300 transition-all duration-200 shadow-sm shadow-purple-500/10"
              >
                <FaFacebook size={20} />
              </Link>
            </div>
          </div>

          {/* Center: Payments */}
          <div className="flex flex-col md:flex-row items-center gap-3 flex-1 justify-center">
            <span className="text-sm text-gray-400">We accept:</span>
            <div className="flex gap-2">
              <div className="bg-[#1A1730] border border-purple-500/10 rounded px-2 py-1 flex items-center justify-center shadow-sm">
                <Image
                  src="/images/abalogo.png"
                  alt="ABA"
                  width={36}
                  height={18}
                  className="h-5 w-auto object-contain"
                />
              </div>
              <div className="bg-[#1A1730] border border-purple-500/10 rounded px-2 py-1 flex items-center justify-center shadow-sm">
                <Image
                  src="/images/KHQR.svg"
                  alt="KHQR"
                  width={36}
                  height={18}
                  className="h-5 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right: Links & Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
              <Link href="/privacy-policy" className="hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms-and-conditions" className="hover:text-purple-400 transition-colors">
                Terms and Conditions
              </Link>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Copyright © {currentYear} • Delykastore. All Rights Reserved.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
