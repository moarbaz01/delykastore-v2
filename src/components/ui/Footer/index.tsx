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
    <footer className="relative z-0 overflow-hidden border-t border-purple-500/10"
      style={{ background: "#0D0B1A" }}>
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/">
              <Image
                src="/images/logo-animated.gif"
                alt="DELYKASTORE"
                width={140}
                height={80}
                className="h-10 w-auto mb-3"
              />
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your one-stop destination for fast, safe, and affordable game top-ups.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Order History", href: "/order-history" },
                { label: "Account", href: "/account" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Payment Methods</h4>
            <p className="text-xs text-gray-500 mb-3">We accept</p>
            <div className="flex items-center gap-3">
              <div className="bg-[#1A1730] border border-purple-500/10 rounded-lg p-1.5">
                <Image
                  src="/images/abalogo.png"
                  alt="ABA"
                  width={60}
                  height={30}
                  className="h-6 w-auto object-contain"
                />
              </div>
              <div className="bg-[#1A1730] border border-purple-500/10 rounded-lg p-1.5">
                <Image
                  src="/images/KHQR.svg"
                  alt="KHQR"
                  width={30}
                  height={30}
                  className="h-6 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact Us</h4>
            <div className="flex gap-3">
              <Link
                href="https://t.me/Delyy_kaa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-300 transition-all duration-200"
              >
                <FaTelegram size={16} />
              </Link>
              <Link
                href="https://www.facebook.com/share/18FUJ1LddM/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-300 transition-all duration-200"
              >
                <FaFacebook size={16} />
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Developed by{" "}
              <a href="https://t.me/bluetechink" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Bluetech.ink
              </a>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-purple-500/10 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            Copyright © {currentYear} DELYKASTORE. All Rights Reserved.
          </p>
          <Link href="/terms-and-conditions" className="text-xs text-gray-500 hover:text-purple-400 transition-colors">
            Terms and Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
