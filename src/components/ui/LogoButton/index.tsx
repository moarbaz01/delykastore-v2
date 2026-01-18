"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaTelegram } from "react-icons/fa";

const LogoButton = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/product"))
    return null;
  return (
    <a
      href="https://t.me/bluetechink"
      target="_blank"
      className=" cursor-pointer px-4 py-2 bg-blue-500 flex items-center gap-2 hover:opacity-80 transition z-[50]  rounded-full fixed bottom-20 md:bottom-10 right-4 "
    >
      {/* <Image
        width={100}
        height={100}
        alt="logo"
        className="h-full w-full rounded-full"
        src="/images/winwin-logo.png"
      /> */}
      <FaTelegram />
      <span>តបឆាតលឿនតាម Telegram</span>
    </a>
  );
};

export default LogoButton;
