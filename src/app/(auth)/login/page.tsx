"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, ChevronLeft } from "lucide-react";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { FaGoogle, FaTelegramPlane } from "react-icons/fa";

declare global {
  interface Window {
    TelegramLoginCallback: (data: any) => void;
  }
}

const inputBaseStyle = {
  background: "#FFFFFF",
  border: "1px solid rgba(255,117,151,0.2)",
};

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
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
      // same as before
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

  const handleTelegramLogin = () => {
    if ((window as any).Telegram && (window as any).Telegram.Login) {
      (window as any).Telegram.Login.auth(
        { bot_id: "8565003158", request_access: "write" },
        (data: any) => {
          if (!data) return;
          if ((window as any).TelegramLoginCallback) {
            (window as any).TelegramLoginCallback(data);
          }
        }
      );
    } else {
      toast.error("Telegram login is still loading, please try again in a moment.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        otp: showOtp ? otp : "",
      });

      if (result?.error) {
        if (result.error === "AdminOTPRequired") {
          setShowOtp(true);
          toast.success("OTP sent to your admin email!");
          setIsLoading(false);
          return;
        }
        toast.error(result.error || "Invalid email or password");
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
    <div className="min-h-screen flex flex-col w-full relative bg-[#FDFDFD]">
      
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
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(255,117,151,0.2)",
            boxShadow: "0 0 40px rgba(255,117,151,0.1), 0 25px 50px rgba(0,0,0,0.1)",
          }}
        >
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-6 md:mb-8">
            Claim Your Player Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Email */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-pink-500"
              style={inputBaseStyle}
            >
              <Mail size={18} className="text-gray-600 shrink-0" />
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
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-pink-500"
                style={inputBaseStyle}
              >
                <Lock size={18} className="text-gray-600 shrink-0" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-transparent text-gray-800 text-sm w-full outline-none placeholder-gray-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-600 hover:text-white transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2 md:mt-3">
                <Link
                  href="/forgot-password"
                  className="text-xs transition-colors hover:text-white"
                  style={{ color: "#FF7597" }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* OTP Input (Shown only if AdminOTPRequired) */}
            {showOtp && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-pink-500"
                style={inputBaseStyle}
              >
                <Lock size={18} className="text-gray-600 shrink-0" />
                <input
                  id="login-otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="bg-transparent text-gray-800 text-sm w-full outline-none placeholder-gray-400"
                  autoComplete="one-time-code"
                />
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 mt-2 md:mt-4 disabled:opacity-60 hover:shadow-[0_0_20px_rgba(255,117,151,0.4)]"
              style={{ background: "linear-gradient(135deg, #E55577 0%, #FF7597 100%)" }}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? (showOtp ? "Verifying..." : "Signing in...") : (showOtp ? "Verify & Login" : "Login")}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 md:my-8">
            <div className="flex-1 h-px" style={{ background: "rgba(255,117,151,0.15)" }} />
            <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,117,151,0.15)" }} />
          </div>

          {/* Telegram Login */}
          <div className="flex flex-col items-center gap-2">
            {isTgLoading ? (
              <div className="flex items-center gap-2 text-gray-600 text-sm py-2">
                <Loader2 size={16} className="animate-spin" />
                Connecting to Telegram...
              </div>
            ) : (
              <>
                <div ref={tgRef} className="absolute opacity-0 pointer-events-none" />
                <button
                  type="button"
                  onClick={handleTelegramLogin}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-gray-800 transition-all duration-300 hover:bg-gray-50"
                  style={{ border: "1px solid rgba(255,117,151,0.2)", background: "#FFFFFF" }}
                >
                  <FaTelegramPlane size={20} className="text-[#54A9EB]" />
                  Log in with Telegram
                </button>
              </>
            )}

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-gray-800 transition-all duration-300 hover:bg-gray-50"
              style={{ border: "1px solid rgba(255,117,151,0.2)", background: "#FFFFFF" }}
            >
              <FaGoogle size={18} className="text-red-500" />
              Continue with Google
            </button>

            <p className="text-[10px] text-gray-500 text-center mt-4 max-w-[280px]">
              We only use your account to match your orders and rewards.
            </p>
          </div>

          {/* Sign up link */}
          <div className="mt-6 md:mt-8 text-center text-xs text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold transition-colors hover:text-white" style={{ color: "#FF7597" }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
