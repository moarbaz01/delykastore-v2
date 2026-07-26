"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, CheckCircle2, ArrowLeft, ChevronLeft } from "lucide-react";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import axios from "axios";
import { FaGoogle } from "react-icons/fa";

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
        
        {/* Hero Image Section */}
        <div className="relative w-full h-[35vh] md:flex-1 md:h-auto shrink-0">
          <Image
            src="/images/login_hero.png"
            alt="Signup Hero"
            fill
            className="object-cover object-top md:object-center"
            priority
          />
          <div 
            className="absolute inset-0 z-10 pointer-events-none md:hidden" 
            style={{ background: "linear-gradient(to bottom, rgba(13,11,26,0) 50%, rgba(13,11,26,1) 100%)" }}
          />
          <div 
            className="hidden md:block absolute inset-0 z-10 pointer-events-none" 
            style={{ background: "linear-gradient(to right, rgba(13,11,26,0) 60%, rgba(13,11,26,1) 100%)" }}
          />
        </div>

        {/* Signup Card Section */}
        <div className="flex-1 flex items-center justify-center px-4 -mt-12 md:mt-0 relative z-20 pb-8 md:py-8">
        <div
          className="w-full max-w-md rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl transition-all"
          style={{
            background: "rgba(18,16,42,0.85)",
            border: "1px solid rgba(168,85,247,0.2)",
            boxShadow: "0 0 40px rgba(168,85,247,0.1), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          {step === "details" ? (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6 md:mb-8">
                Create Account
              </h2>

              <form onSubmit={handleRequestOtp} className="space-y-4 md:space-y-5">
                {/* Full Name */}
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-purple-500"
                  style={{ background: "rgba(13,11,26,0.8)", border: "1px solid rgba(168,85,247,0.2)" }}
                >
                  <UserIcon size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
                  />
                </div>

                {/* Email */}
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-purple-500"
                  style={{ background: "rgba(13,11,26,0.8)", border: "1px solid rgba(168,85,247,0.2)" }}
                >
                  <Mail size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
                  />
                </div>

                {/* Password */}
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-purple-500"
                  style={{ background: "rgba(13,11,26,0.8)", border: "1px solid rgba(168,85,247,0.2)" }}
                >
                  <Lock size={18} className="text-gray-400 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-white transition-colors shrink-0">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-purple-500"
                  style={{ background: "rgba(13,11,26,0.8)", border: "1px solid rgba(168,85,247,0.2)" }}
                >
                  <Lock size={18} className="text-gray-400 shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-white transition-colors shrink-0">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 mt-2 md:mt-4 disabled:opacity-60 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #A855F7 100%)" }}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? "Validating..." : "Create Account"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6 md:my-8">
                <div className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.15)" }} />
                <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.15)" }} />
              </div>

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
                  Sign up with Google
                </button>

                <p className="text-[10px] text-gray-500 text-center mt-4 max-w-[280px]">
                  We only use your account to match your orders and rewards.
                </p>
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
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                  style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
                >
                  <Mail size={28} style={{ color: "#A855F7" }} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Verify Email</h2>
                <p className="text-gray-400 text-sm">
                  We&apos;ve sent a 6-digit code to <br />
                  <span className="text-gray-200 font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-xl px-4 py-3.5 text-center text-2xl font-bold tracking-[1em] text-white outline-none transition-all"
                  style={{
                    background: "rgba(13,11,26,0.8)",
                    border: "1px solid rgba(168,85,247,0.2)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(168,85,247,0.6)"; e.target.style.boxShadow = "0 0 0 2px rgba(168,85,247,0.2)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(168,85,247,0.2)"; e.target.style.boxShadow = "none"; }}
                />

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-60 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] mt-4"
                  style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #A855F7 100%)" }}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? "Verifying..." : "Verify & Activate"}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="font-semibold transition-colors hover:text-white"
                    style={{ color: "#A855F7" }}
                  >
                    Resend
                  </button>
                </p>
              </form>
            </div>
          )}

          <div className="mt-6 md:mt-8 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold transition-colors hover:text-white" style={{ color: "#A855F7" }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
