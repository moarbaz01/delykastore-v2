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
        {/* Global Gradient Background (Optimized for Safari Performance) */}
        <div 
          className="fixed inset-0 pointer-events-none -z-50"
          style={{
            backgroundColor: "#0D0B1A",
            backgroundImage: `
              radial-gradient(circle at 10% 10%, rgba(168, 85, 247, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.12) 0%, transparent 40%),
              radial-gradient(circle at 75% 55%, rgba(192, 132, 252, 0.1) 0%, transparent 35%)
            `
          }}
        >
        </div>
        <div className="relative z-0 flex flex-col min-h-screen">
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
            <main className="flex-1 flex flex-col w-full">
              {children}
            </main>
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
