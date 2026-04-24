"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

type SignupStep = "details" | "otp";

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState<SignupStep>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isTgLoading, setIsTgLoading] = useState(false);
  const tgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(session?.user?.role === "admin" ? "/dashboard" : "/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!botUsername || !tgRef.current || step !== "details") return;

    window.TelegramLoginCallback = async (data: any) => {
      setIsTgLoading(true);
      try {
        const result = await signIn("telegram", { ...data, redirect: false });
        if (result?.error) {
          toast.error("Telegram signup failed. Please try again.");
        } else {
          toast.success("Signed up successfully!");
          router.push("/");
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
  }, [router, step]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/auth/signup", {
        action: "request-otp",
        name,
        email,
        password,
        confirmPassword,
      });

      if (res.status === 200) {
        toast.success(res.data.message || "OTP sent to your email");
        setStep("otp");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/auth/signup", {
        action: "verify-otp",
        email,
        otp,
      });

      if (res.status === 200) {
        toast.success("Account verified successfully! Please log in.");
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid or expired code");
    } finally {
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
      <div
        className="rounded-2xl p-8 shadow-2xl border border-white/10"
        style={{ background: "rgba(37, 47, 69, 0.6)", backdropFilter: "blur(16px)" }}
      >
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

        {step === "details" ? (
          <>
            <h1 className="text-2xl font-bold text-white text-center mb-1">Create Account</h1>
            <p className="text-gray-400 text-sm text-center mb-7">Join us and start topping up</p>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1 block">Full Name</label>
                <div className="flex items-center gap-2 bg-[#1a1f2e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                  <UserIcon size={16} className="text-gray-500 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium mb-1 block">Email address</label>
                <div className="flex items-center gap-2 bg-[#1a1f2e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                  <Mail size={16} className="text-gray-500 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium mb-1 block">Password</label>
                <div className="flex items-center gap-2 bg-[#1a1f2e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                  <Lock size={16} className="text-gray-500 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-600"
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

              <div>
                <label className="text-gray-300 text-sm font-medium mb-1 block">Confirm Password</label>
                <div className="flex items-center gap-2 bg-[#1a1f2e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                  <Lock size={16} className="text-gray-500 shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #ff962d 0%, #ff7a00 100%)", color: "#fff" }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? "Validating Email..." : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

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
          </>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setStep("details")}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-sm transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Mail size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Verify Email</h1>
              <p className="text-gray-400 text-sm">
                We&apos;ve sent a 6-digit code to <br />
                <span className="text-gray-200 font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[1em] text-white outline-none focus:border-primary transition-colors placeholder-gray-700"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #ff962d 0%, #ff7a00 100%)", color: "#fff" }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? "Verifying..." : "Verify & Activate"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Resend
                </button>
              </p>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-600 mt-4">
        <Link href="/" className="hover:text-gray-400 transition-colors">
          ← Back to Win Win Top-Up
        </Link>
      </p>
    </div>
  );
}

