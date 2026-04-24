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
  Mail,
  Shield,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

function AccountContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Profile editing state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Account Settings</h1>
          <p className="text-gray-200">Manage your profile and security preferences.</p>
        </div>

        {/* User Stats/Preview Card */}
        <div className="bg-secondary p-6 rounded-lg border border-gray-600 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${session.user.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-gray-300 border-white/5'}`}>
              {session.user.role}
            </span>
          </div>

          <div className="w-24 h-24 rounded-lg bg-background flex items-center justify-center border border-gray-600 text-primary overflow-hidden">
            {session.user.image ? (
              <Image src={session.user.image} alt="Avatar" width={96} height={96} className="object-cover" />
            ) : (
              <UserIcon size={40} />
            )}
          </div>

          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold text-white">{session.user.name || "User Account"}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-300">
              {session.user.email && (
                <span className="flex items-center gap-2">
                  <Mail size={14} className="text-primary" /> {session.user.email}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Shield size={14} className="text-primary" /> {session.user.authProvider}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Edit Profile Section */}
          <div className="bg-secondary rounded-lg border border-gray-600 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-600 flex items-center gap-2">
              <Edit size={18} className="text-primary" />
              <h3 className="font-bold text-lg text-white">Edit Profile</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-background border border-gray-600 rounded px-4 py-2 text-sm focus:border-primary outline-none text-white transition-colors"
                />
              </div>
              <div className="space-y-1 opacity-60 cursor-not-allowed">
                <label className="text-xs font-bold text-gray-300 uppercase">Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-background border border-gray-600 rounded px-4 py-2 text-sm outline-none text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-primary py-2 rounded text-white font-bold hover:opacity-90 transition-opacity"
                >
                  {isUpdatingProfile ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Security Settings Section */}
          <div className="bg-secondary rounded-lg border border-gray-600 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-600 flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              <h3 className="font-bold text-lg text-white">Security</h3>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-background border border-gray-600 rounded px-4 py-2 text-sm focus:border-primary outline-none text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-gray-600 rounded px-4 py-2 text-sm focus:border-primary outline-none text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-gray-600 rounded px-4 py-2 text-sm focus:border-primary outline-none text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-primary py-2 rounded text-white font-bold hover:opacity-90 transition-opacity"
                >
                  {isChangingPassword ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-8 flex justify-center">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-4 py-2 rounded border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-bold uppercase hover:bg-rose-500 hover:text-white transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>}>
      <AccountContent />
    </Suspense>
  );
}
