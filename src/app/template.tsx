"use client";

import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not animate dashboard or admin routes
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin-winwintopup")) {
    return <>{children}</>;
  }

  return (
    <div key={pathname} className="animate-fade-in" style={{ animationDuration: "400ms" }}>
      {children}
    </div>
  );
}
