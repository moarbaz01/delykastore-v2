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
      href="https://t.me/bluetechink"
      target="_blank"
      className=" cursor-pointer px-4 py-2 bg-blue-500 flex items-center gap-2 hover:opacity-80 transition z-[50]  rounded-full fixed bottom-24 md:bottom-10 right-4 "
    >
      <FaTelegram />
      <span>តបឆាតលឿនតាម Telegram</span>
    </a>
  );
};

export default LogoButton;
