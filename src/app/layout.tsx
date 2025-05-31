import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Toaster } from "react-hot-toast";
import Provider from "@/components/Provider";
import LogoButton from "@/components/ui/LogoButton";

export const metadata: Metadata = {
  title: "Win Win Top-Up",
  description: "Top-up your favorite games by using Geto Top-Up",
};

const popins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${popins.variable} antialiased `}>
        <Provider>
          <NextTopLoader color="red" />
          <Toaster />
          <Navbar /> {/* Conditionally render Navbar */}
          {children}
          <Footer />
          <LogoButton />
        </Provider>
      </body>
    </html>
  );
}
