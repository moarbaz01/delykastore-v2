"use client";
import { usePathname } from "next/navigation";
import { FaTelegram } from "react-icons/fa";

const LogoButton = () => {
  const pathname = usePathname();
  if (
    [
      "/login",
      "/signup",
      "/forgot-password",
      "/product",
      "/dashboard",
    ].includes(pathname)
  )
    return null;
  return (
    <a
      href="https://t.me/Delyy_kaa"
      target="_blank"
      className="cursor-pointer w-14 h-14 bg-primary flex items-center justify-center text-white hover:bg-primary-light shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all duration-300 z-[50] rounded-full fixed bottom-24 lg:bottom-10 right-4"
      aria-label="Contact Telegram"
    >
      <FaTelegram size={28} />
    </a>
  );
};

export default LogoButton;
