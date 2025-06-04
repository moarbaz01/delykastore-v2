"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTelegram, FaFacebook, FaTiktok } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname.includes("dashboard")) {
    return null;
  }
  return (
    <footer className="  py-6  border-t border-white/20 relative z-0 overflow-hidden ">
      <div className="max-w-screen-xl mx-auto px-4  md:flex md:justify-between gap-8   ">
        <div className="flex flex-col md:flex-row justify-between md:w-full items-center space-y-4 md:space-y-0">
          {/* Contact and Social Media Section */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-3">Contact Us</h3>
            <div className="flex space-x-4 text-4xl">
              <Link href="" className="hover:text-blue-400 transition-colors">
                <FaTelegram />
              </Link>
              <Link href="" className="hover:text-blue-600 transition-colors">
                <FaFacebook />
              </Link>
              <Link href="" className="hover:text-pink-500 transition-colors">
                <FaTiktok />
              </Link>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="flex flex-col md:flex-row md:gap-2  items-center">
            <p className="text-sm">We accpet with</p>
            <div className="flex items-center space-x-3">
              <div className=" ">
                <Image
                  src="/images/abalogo.png"
                  alt="KHQR Payment"
                  width={80}
                  height={80}
                  className=""
                />
              </div>
              <div className="h-14 w-14 ">
                <Image
                  src="/images/KHQR.svg"
                  alt="KHQR Payment"
                  width={80}
                  height={80}
                  className="aspect-square"
                />
              </div>
            </div>
          </div>

          {/* Legal Links Section */}
          <div className="flex flex-col items-center md:items-end text-sm">
            <div className="space-x-3">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <span>|</span>
              <Link href="/terms" className="hover:underline">
                Terms and Conditions
              </Link>
            </div>
            <p className="mt-2">
              Copyright © {currentYear} - Win Win Topup. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
