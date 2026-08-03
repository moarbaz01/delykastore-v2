"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, ChevronLeft } from "lucide-react";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";

declare global {
  interface Window {
    TelegramLoginCallback: (data: any) => void;
  }
}

const inputBaseStyle = {
  background: "rgba(13,11,26,0.8)",
  border: "1px solid rgba(168,85,247,0.2)",
};

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTgLoading, setIsTgLoading] = useState(false);
  const tgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!botUsername || !tgRef.current) return;

    window.TelegramLoginCallback = async (data: any) => {
      setIsTgLoading(true);
      try {
        const result = await signIn("telegram", { ...data, redirect: false });
        if (result?.error) {
          toast.error("Telegram login failed. Please try again.");
        } else {
          toast.success("Logged in successfully!");
          const updatedSession = await getSession();
          if (updatedSession?.user?.role === "admin") {
            router.replace("/dashboard");
          } else {
            router.replace("/");
          }
        }
      } catch {
        toast.error("Something went wrong.");
      } finally {
        setIsTgLoading(false);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "TelegramLoginCallback(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    tgRef.current.innerHTML = "";
    tgRef.current.appendChild(script);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        setIsLoading(false);
        return;
      }

      toast.success("Logged in successfully!");
      const updatedSession = await getSession();
      if (updatedSession?.user?.role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    } catch {
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full relative bg-[#0D0B1A]">
      
      {/* Unified Header - Mobile only */}
      <div className="w-full flex md:hidden items-center justify-between p-4 pt-6 relative z-30">
        <Link href="/" className="text-white p-2 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ChevronLeft size={24} />
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <Image
            src="/images/logo-animated.gif"
            alt="DELYKASTORE"
            width={120}
            height={50}
            className="h-9 w-auto object-contain drop-shadow-md"
            priority
          />
        </div>
        <div className="w-8" />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col md:flex-row w-full relative">
        


        {/* Login Card Section */}
        <div className="flex-1 flex items-center justify-center px-4 -mt-12 md:mt-0 relative z-20 pb-8 md:py-8">
        <div
          className="w-full max-w-md rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl transition-all"
          style={{
            background: "rgba(18,16,42,0.85)",
            border: "1px solid rgba(168,85,247,0.2)",
            boxShadow: "0 0 40px rgba(168,85,247,0.1), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6 md:mb-8">
            Claim Your Player Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Email */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-purple-500"
              style={inputBaseStyle}
            >
              <Mail size={18} className="text-gray-400 shrink-0" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-purple-500"
                style={inputBaseStyle}
              >
                <Lock size={18} className="text-gray-400 shrink-0" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2 md:mt-3">
                <Link
                  href="/forgot-password"
                  className="text-xs transition-colors hover:text-white"
                  style={{ color: "#A855F7" }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 mt-2 md:mt-4 disabled:opacity-60 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #A855F7 100%)" }}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 md:my-8">
            <div className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.15)" }} />
            <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.15)" }} />
          </div>

          {/* Telegram Login */}
          <div className="flex flex-col items-center gap-2">
            {isTgLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                <Loader2 size={16} className="animate-spin" />
                Connecting to Telegram...
              </div>
            ) : (
              <div ref={tgRef} className="flex justify-center w-full" />
            )}

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-gray-200 transition-all duration-300 hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
            >
              <FaGoogle size={18} className="text-red-500" />
              Continue with Google
            </button>

            <p className="text-[10px] text-gray-500 text-center mt-4 max-w-[280px]">
              We only use your account to match your orders and rewards.
            </p>
          </div>

          {/* Sign up link */}
          <div className="mt-6 md:mt-8 text-center text-xs text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold transition-colors hover:text-white" style={{ color: "#A855F7" }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
