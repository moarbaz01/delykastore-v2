"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import {
  User as UserIcon,
  LogOut,
  Loader2,
  Edit,
  Lock,
  ChevronRight,
  ClipboardList,
  Settings,
  ArrowLeft,
  HelpCircle,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaTelegram } from "react-icons/fa";
import Loader from "@/components/ui/Loader";

const inputStyle = {
  background: "#0D0B1A",
  border: "1px solid rgba(168,85,247,0.2)",
};

function AccountContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Mode: "menu" | "settings"
  const [viewMode, setViewMode] = useState<"menu" | "settings">("menu");
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user && !isInitialized) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setIsInitialized(true);
    }
  }, [session, isInitialized]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await axios.put("/api/profile", { name, email });
      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        await update({ name, email });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await axios.post("/api/profile/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.status === 200) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (status === "loading" || !session) {
    return <Loader fullScreen />;
  }

  const orderCount = (session?.user as any)?.order?.length || 0;

  if (viewMode === "settings") {
    return (
      <div className="min-h-screen bg-[#0D0B1A] pb-20">
        {/* Top App Bar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-purple-500/10 sticky top-0 bg-[#0D0B1A] z-10">
          <button onClick={() => setViewMode("menu")} className="p-2 -ml-2 text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white">Account Settings</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <div className="p-4 space-y-6 max-w-md mx-auto animate-fade-in">
          {/* Edit Profile */}
          <div className="bg-[#12102A] border border-purple-500/15 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 flex items-center gap-2.5 border-b border-purple-500/10">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/15">
                <Edit size={14} className="text-purple-500" />
              </div>
              <h2 className="font-bold text-white">Edit Profile</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  style={inputStyle}
                />
              </div>
              <div className="space-y-1.5 opacity-50 cursor-not-allowed">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 bg-gradient-to-r from-[#7B2FBE] to-[#A855F7]"
              >
                {isUpdatingProfile ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="bg-[#12102A] border border-purple-500/15 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 flex items-center gap-2.5 border-b border-purple-500/10">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/15">
                <Lock size={14} className="text-purple-500" />
              </div>
              <h2 className="font-bold text-white">Security</h2>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {[
                { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
                { label: "New Password", value: newPassword, setter: setNewPassword },
                { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword },
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{field.label}</label>
                  <input
                    type="password"
                    required
                    minLength={field.label !== "Current Password" ? 8 : undefined}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    style={inputStyle}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 bg-gradient-to-r from-[#7B2FBE] to-[#A855F7]"
              >
                {isChangingPassword ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0B1A] pb-24">
      {/* Top App Bar */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#0D0B1A] z-10">
        <button onClick={() => router.push("/")} className="p-2 -ml-2 text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">Profile</h1>
        <button onClick={() => setViewMode("settings")} className="p-2 -mr-2 text-white">
          <Settings size={22} />
        </button>
      </div>

      <div className="px-4 max-w-3xl mx-auto space-y-5 mt-2 animate-fade-in">
        {/* Profile Card */}
        <div className="bg-[#12102A] rounded-[24px] p-5 flex items-center gap-4 relative overflow-hidden shadow-lg border border-purple-500/10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl uppercase overflow-hidden shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.5)] border-2 border-purple-500/30"
               style={{ background: "linear-gradient(135deg, #7B2FBE, #A855F7)" }}>
            {session.user.image ? (
              <Image src={session.user.image} alt="Avatar" width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              session.user?.name?.[0] || <UserIcon size={28} />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white leading-tight mb-1">{session.user.name || "User Account"}</h2>
            {session.user.email && (
              <p className="text-xs text-gray-300">{session.user.email}</p>
            )}
          </div>
        </div>

        {/* Orders Stat Card */}
        <div className="bg-[#12102A] rounded-2xl p-4 flex flex-col items-center justify-center shadow-md border border-purple-500/5">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Orders</p>
          <p className="text-lg font-bold text-white">{orderCount}</p>
        </div>

        {/* Menu List */}
        <div className="bg-[#12102A] rounded-[24px] overflow-hidden shadow-md border border-purple-500/5 py-2">
          <Link href="/order-history" className="flex items-center px-5 py-3.5 hover:bg-white/5 transition-colors">
            <div className="w-8 flex justify-start">
              <ClipboardList size={20} className="text-gray-300" />
            </div>
            <span className="flex-1 text-sm font-medium text-white">My Orders</span>
            <ChevronRight size={18} className="text-gray-500" />
          </Link>

          <button onClick={() => setViewMode("settings")} className="w-full flex items-center px-5 py-3.5 hover:bg-white/5 transition-colors">
            <div className="w-8 flex justify-start">
              <Settings size={20} className="text-gray-300" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-white">Account Settings</span>
            <ChevronRight size={18} className="text-gray-500" />
          </button>

          <button onClick={() => setIsSupportModalOpen(true)} className="w-full flex items-center px-5 py-3.5 hover:bg-white/5 transition-colors">
            <div className="w-8 flex justify-start">
              <HelpCircle size={20} className="text-gray-300" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-white">Help & Support</span>
            <ChevronRight size={18} className="text-gray-500" />
          </button>

          <Link href="/about" className="flex items-center px-5 py-3.5 hover:bg-white/5 transition-colors">
            <div className="w-8 flex justify-start">
              <Info size={20} className="text-gray-300" />
            </div>
            <span className="flex-1 text-sm font-medium text-white">About Us</span>
            <ChevronRight size={18} className="text-gray-500" />
          </Link>
        </div>

        {/* Logout Button */}
        <div className="bg-[#12102A] rounded-2xl overflow-hidden shadow-md border border-red-500/10">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center px-5 py-4 hover:bg-red-500/5 transition-colors"
          >
            <div className="w-8 flex justify-start">
              <LogOut size={20} className="text-red-500" />
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-red-500">Logout</span>
            <ChevronRight size={18} className="text-red-500/50" />
          </button>
        </div>

        <div className="text-center pt-6 pb-4 opacity-50">
          <p className="text-[10px] text-gray-400 mb-2">Your one-stop store for all your gaming needs</p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-4 h-4 bg-purple-600 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-xs font-bold tracking-wider text-white">DELYKASTORE</span>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12102A] rounded-2xl w-full max-w-sm border border-purple-500/20 overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Need Help?</h3>
              <p className="text-sm text-gray-400 mb-6">Reach out to our support team through your preferred channel.</p>
              
              <div className="flex justify-center gap-4">
                <a href="https://www.facebook.com/share/18FUJ1LddM/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors w-24">
                  <FaFacebook size={32} className="text-[#1877F2]" />
                  <span className="text-xs text-gray-300 font-medium">Facebook</span>
                </a>
                <a href="https://t.me/Delyy_kaa" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors w-24">
                  <FaTelegram size={32} className="text-[#229ED9]" />
                  <span className="text-xs text-gray-300 font-medium">Telegram</span>
                </a>
              </div>
            </div>
            <div className="p-3 border-t border-white/5">
              <button 
                onClick={() => setIsSupportModalOpen(false)}
                className="w-full py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <AccountContent />
    </Suspense>
  );
}
