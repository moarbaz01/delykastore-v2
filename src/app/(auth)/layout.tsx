"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Loader from "@/components/ui/Loader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [status, session, router]);

  if (status === "loading" || status === "authenticated") {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
