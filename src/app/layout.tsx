import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Koulen, Battambang } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Toaster } from "react-hot-toast";
import Provider from "@/components/Provider";
import LogoButton from "@/components/ui/LogoButton";
import PaywayScript from "@/components/PaywayScript";

export const metadata: Metadata = {
  title: "Win Win Top-Up",
  description: "Top-up your favorite games by using Geto Top-Up",
};

const koulen = Koulen({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-koulen",
});

const battambang = Battambang({
  subsets: ["khmer"],
  weight: ["400", "700"],
  variable: "--font-battambang",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${koulen.variable} ${battambang.variable} font-sans antialiased `}>
        <Provider>
          <NextTopLoader color="#ff962d" />
          <Toaster />
          <Navbar /> {/* Conditionally render Navbar */}
          {children}
          <Footer />
          <LogoButton />
        </Provider>
        <PaywayScript />
      </body>
    </html>
  );
}
