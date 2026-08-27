"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resetToken, setResetToken] = useState("");
  const [timer, setTimer] = useState(0);

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { action: "send-otp", email });
      toast.success("OTP sent to your email!");
      setStep(2);
      setTimer(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    // Pasting logic
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(index + pasted.length, 5);
      otpRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password", {
        action: "verify-otp",
        email,
        otp: otpValue
      });
      setResetToken(res.data.resetToken);
      setStep(3);
      toast.success("OTP verified");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", {
        action: "reset-password",
        email,
        token: resetToken,
        newPassword
      });
      toast.success("Password reset successfully! Please login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

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
        


        {/* Forgot Password Card Section */}
        <div className="flex-1 flex items-center justify-center px-4 -mt-12 md:mt-0 relative z-20 pb-8 md:py-8">
          <div
            className="w-full max-w-md rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(255,117,151,0.2)",
              boxShadow: "0 0 40px rgba(255,117,151,0.1), 0 25px 50px rgba(0,0,0,0.1)",
            }}
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'w-10 bg-pink-500' : 'w-4 bg-gray-600'}`} />
              <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'w-10 bg-pink-500' : 'w-4 bg-gray-600'}`} />
              <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'w-10 bg-pink-500' : 'w-4 bg-gray-600'}`} />
            </div>

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-1">Forgot Password</h1>
                <p className="text-gray-600 text-sm text-center mb-7">Enter your email to receive an OTP</p>

                <div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-pink-500"
                    style={{ background: "#FFFFFF", border: "1px solid rgba(255,117,151,0.2)" }}>
                    <Mail size={18} className="text-gray-600 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="bg-transparent text-gray-800 text-sm w-full outline-none placeholder-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-60 hover:shadow-[0_0_20px_rgba(255,117,151,0.4)]"
                  style={{ background: "linear-gradient(135deg, #E55577 0%, #FF7597 100%)" }}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? "Sending..." : "Send OTP"} <ArrowRight size={16} />
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-1">Verify OTP</h1>
                  <p className="text-gray-600 text-sm text-center">Enter the 6-digit code sent to</p>
                  <p className="text-primary font-medium text-sm text-center mb-7">{email}</p>
                </div>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el }}
                      type="text"
                      maxLength={6} // allow pasting
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 md:w-12 md:h-14 bg-[#FFFFFF] border border-[rgba(255,117,151,0.2)] focus:border-pink-500 focus:shadow-[0_0_0_2px_rgba(255,117,151,0.2)] rounded-xl text-center text-xl text-gray-900 font-bold outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join("").length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-60 hover:shadow-[0_0_20px_rgba(255,117,151,0.4)]"
                  style={{ background: "linear-gradient(135deg, #E55577 0%, #FF7597 100%)" }}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>

                <div className="text-center text-sm">
                  <span className="text-gray-500">Didn&apos;t receive code? </span>
                  {timer > 0 ? (
                    <span className="text-gray-600">Resend in {timer}s</span>
                  ) : (
                    <button type="button" onClick={handleSendOtp} disabled={isLoading} className="text-primary hover:text-primary hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-1">New Password</h1>
                <p className="text-gray-600 text-sm text-center mb-7">Create a new secure password</p>

                <div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-pink-500"
                    style={{ background: "#FFFFFF", border: "1px solid rgba(255,117,151,0.2)" }}>
                    <Lock size={18} className="text-gray-600 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="bg-transparent text-gray-800 text-sm w-full outline-none placeholder-gray-400"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-600 hover:text-white shrink-0 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-pink-500"
                    style={{ background: "#FFFFFF", border: "1px solid rgba(255,117,151,0.2)" }}>
                    <Lock size={18} className="text-gray-600 shrink-0" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      className="bg-transparent text-gray-800 text-sm w-full outline-none placeholder-gray-400"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-600 hover:text-white shrink-0 transition-colors">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-60 hover:shadow-[0_0_20px_rgba(255,117,151,0.4)]"
                  style={{ background: "linear-gradient(135deg, #E55577 0%, #FF7597 100%)" }}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? "Resetting..." : "Reset Password"} <KeyRound size={16} />
                </button>
              </form>
            )}

            <div className="mt-6 md:mt-8 text-center text-xs text-gray-600">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold transition-colors hover:text-white" style={{ color: "#FF7597" }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
