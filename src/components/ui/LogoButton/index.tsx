"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

const LogoButton = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/product"))
    return null;
  return (
    <a
      href="https://www.facebook.com/share/16uiJM49XG/?mibextid=wwXIfr"
      target="_blank"
      className="bg-card-bg h-[60px] cursor-pointer hover:opacity-80 transition z-[50] w-[60px] aspect-square rounded-full fixed bottom-20 md:bottom-10 right-4 "
    >
      <Image
        width={100}
        height={100}
        alt="logo"
        className="h-full w-full rounded-full"
        src="/images/winwin-logo.png"
      />
    </a>
  );
};

export default LogoButton;
