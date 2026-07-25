import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Battambang, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BottomNav from "@/components/ui/BottomNav";
import { Toaster } from "react-hot-toast";
import Provider from "@/components/Provider";
import LogoButton from "@/components/ui/LogoButton";
import PaywayScript from "@/components/PaywayScript";

export const metadata: Metadata = {
  title: "DELYKASTORE",
  description: "Top-up your favorite games by using DELYKASTORE",
};

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

const battambang = Battambang({
  subsets: ["khmer"],
  weight: ["400", "700"],
  variable: "--font-battambang",
});

export const viewport: Viewport = {
  themeColor: "#1A1730",
  interactiveWidget: "overlays-content",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${battambang.variable} font-sans antialiased relative min-h-screen`}
      >
        {/* Global Blurry Gradient Background */}
        <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-[#0D0B1A]">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/30 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-primary-light/20 blur-[100px]" />
        </div>
        <div className="relative z-0">
          <Provider>
            <NextTopLoader color="#A855F7" showSpinner={false} />
            <Toaster
              toastOptions={{
                style: {
                  background: "#1A1730",
                  color: "#F5F3FF",
                  border: "1px solid rgba(168,85,247,0.2)",
                },
              }}
            />
            <Navbar />
            {children}
            <Footer />
            <BottomNav />
            <LogoButton />
          </Provider>
          <PaywayScript />
        </div>
      </body>
    </html>
  );
}
