"use client";
import { usePathname } from "next/navigation";
import { FaTelegram } from "react-icons/fa";
import { useState } from "react";

const LogoButton = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (
    [
      "/login",
      "/signup",
      "/forgot-password",
      "/product",
    ].includes(pathname) ||
    pathname.startsWith("/dashboard")
  )
    return null;
    
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer w-14 h-14 bg-primary flex items-center justify-center text-white hover:bg-primary-light shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all duration-300 z-[50] rounded-full fixed bottom-24 lg:bottom-10 right-4"
        aria-label="Contact Telegram"
      >
        <FaTelegram size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12102A] rounded-2xl w-full max-w-sm border border-purple-500/20 overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Connect with us</h3>
              <p className="text-sm text-gray-400 mb-6">Join our channel or reach out for support.</p>

              <div className="flex justify-center gap-4">
                <a href="https://t.me/delykstore" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors w-28 h-28">
                  <FaTelegram size={36} className="text-[#229ED9]" />
                  <span className="text-xs text-gray-300 font-medium text-center leading-tight">Telegram Channel</span>
                </a>
                <a href="https://t.me/Delyy_kaa" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors w-28 h-28">
                  <FaTelegram size={36} className="text-[#229ED9]" />
                  <span className="text-xs text-gray-300 font-medium text-center leading-tight">Customer Support</span>
                </a>
              </div>
            </div>
            <div className="p-3 border-t border-white/5">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoButton;
