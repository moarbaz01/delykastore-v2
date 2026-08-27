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
import { headers } from "next/headers";
import { getAnnouncementSetting } from "@/lib/getAnnouncementSetting";
import MaintenanceScreen from "@/components/MaintenanceScreen";
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
  themeColor: "#FFFFFF",
  interactiveWidget: "overlays-content",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings from DB to check maintenance mode
  const settings = await getAnnouncementSetting();
  
  // Read pathname from the middleware header
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Exempt admin routes, APIs, and auth routes from maintenance block
  const isAdminOrApi = pathname.startsWith("/dashboard") || pathname.startsWith("/login") || pathname.startsWith("/api");
  const isMaintenanceMode = settings?.isMaintenanceMode && !isAdminOrApi;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${battambang.variable} font-sans antialiased relative min-h-screen`}
      >
        {isMaintenanceMode ? (
          <MaintenanceScreen message={settings?.maintenanceMessage} />
        ) : (
          <>
            {/* Global Background (Light Theme) */}
            <div 
              className="fixed inset-0 pointer-events-none -z-50 bg-[#FDFDFD]"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 10% 10%, rgba(255, 117, 151, 0.05) 0%, transparent 40%),
                  radial-gradient(circle at 90% 90%, rgba(255, 117, 151, 0.05) 0%, transparent 40%),
                  radial-gradient(circle at 75% 55%, rgba(229, 85, 119, 0.03) 0%, transparent 35%)
                `
              }}
            >
            </div>
            <div className="relative z-0 flex flex-col min-h-screen">
              <Provider>
                <NextTopLoader color="#FF7597" showSpinner={false} />
                <Toaster
                  toastOptions={{
                    style: {
                      background: "#FFFFFF",
                      color: "#1F2937",
                      border: "1px solid rgba(255,117,151,0.2)",
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
          </>
        )}
      </body>
    </html>
  );
}