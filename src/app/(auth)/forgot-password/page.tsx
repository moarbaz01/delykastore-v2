"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'w-10 bg-primary' : 'w-4 bg-gray-600'}`} />
          <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'w-10 bg-primary' : 'w-4 bg-gray-600'}`} />
          <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'w-10 bg-primary' : 'w-4 bg-gray-600'}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-2xl font-bold text-white text-center mb-1">Forgot Password</h1>
            <p className="text-gray-400 text-sm text-center mb-7">Enter your email to receive an OTP</p>

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

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ff962d 0%, #ff7a00 100%)", color: "#fff" }}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Sending..." : "Send OTP"} <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold text-white text-center mb-1">Verify OTP</h1>
              <p className="text-gray-400 text-sm text-center">Enter the 6-digit code sent to</p>
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
                  className="w-12 h-14 bg-[#1a1f2e] border border-white/10 focus:border-primary rounded-xl text-center text-xl text-white font-bold outline-none transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join("").length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ff962d 0%, #ff7a00 100%)", color: "#fff" }}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Didn&apos;t receive code? </span>
              {timer > 0 ? (
                <span className="text-gray-400">Resend in {timer}s</span>
              ) : (
                <button type="button" onClick={handleSendOtp} disabled={isLoading} className="text-primary hover:underline">
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-2xl font-bold text-white text-center mb-1">New Password</h1>
            <p className="text-gray-400 text-sm text-center mb-7">Create a new secure password</p>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">New Password</label>
              <div className="flex items-center gap-2 bg-[#1a1f2e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                <Lock size={16} className="text-gray-500 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-600"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Confirm New Password</label>
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
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 hover:text-gray-300">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ff962d 0%, #ff7a00 100%)", color: "#fff" }}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Resetting..." : "Reset Password"} <KeyRound size={16} />
            </button>
          </form>
        )}

      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
