"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    TelegramLoginCallback: (data: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTgLoading, setIsTgLoading] = useState(false);
  const tgRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [status, session, router]);

  // Telegram widget
  useEffect(() => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!botUsername || !tgRef.current) return;

    window.TelegramLoginCallback = async (data: any) => {
      setIsTgLoading(true);
      try {
        const result = await signIn("telegram", {
          ...data,
          redirect: false,
        });
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div
        className="rounded-2xl p-8 shadow-2xl border border-white/10"
        style={{ background: "rgba(37, 47, 69, 0.6)", backdropFilter: "blur(16px)" }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image
              src="/images/WINWINTOPUP.png"
              alt="Win Win Top-Up"
              width={180}
              height={60}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">Welcome Back</h1>
        <p className="text-gray-400 text-sm text-center mb-7">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Email address</label>
            <div className="flex items-center gap-2 bg-[#1a1f2e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
              <Mail size={16} className="text-gray-500 shrink-0" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-600"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-gray-300 text-sm font-medium">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1f2e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
              <Lock size={16} className="text-gray-500 shrink-0" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-600"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #ff962d 0%, #ff7a00 100%)", color: "#fff" }}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-xs">or continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Telegram */}
        <div className="flex justify-center">
          {isTgLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Connecting to Telegram...
            </div>
          ) : (
            <div ref={tgRef} className="flex justify-center" />
          )}
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>

      {/* Back to home */}
      <p className="text-center text-xs text-gray-600 mt-4">
        <Link href="/" className="hover:text-gray-400 transition-colors">
          ← Back to Win Win Top-Up
        </Link>
      </p>
    </div>
  );
}
