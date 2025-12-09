"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full space-y-6 bg-secondary p-6 rounded-lg shadow-lg">
        <h2 className="text-center text-3xl font-bold text-white">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white text-sm">Email address</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring focus:ring-primary"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="text-white text-sm">Password</label>
            <div className="flex items-center border border-gray-600 rounded-md bg-gray-700">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-2 bg-transparent text-white focus:outline-none"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              className="h-4 w-4 text-primary focus:ring-yellow-400 border-gray-600 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-white">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 p-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/50 disabled:bg-background-400"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />} Sign
            in
          </button>
        </form>
      </div>
    </div>
  );
}
