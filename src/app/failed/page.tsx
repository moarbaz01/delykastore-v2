"use client";
import Loader from "@/components/Loader";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";

const MyComponent = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  if (!message) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#FDFDFD" }}>
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(239,68,68,0.07)" }} />

      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-3xl p-8 text-center"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(239,68,68,0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.1), 0 0 40px rgba(239,68,68,0.07)",
          }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.25)" }}
          >
            <XCircle size={40} className="text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-red-400 text-sm font-medium mb-4">
            Oops! Something went wrong
          </p>
          <p
            className="text-sm text-gray-600 mb-8 p-3 rounded-xl"
            style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <Link href="/" className="block">
              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,117,151,0.4)] hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #E55577 0%, #FF7597 100%)" }}
              >
                <RotateCcw size={15} /> Retry Payment
              </button>
            </Link>
            <Link href="/" className="block">
              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-600 text-sm font-medium transition-colors hover:text-gray-900 hover:bg-gray-50"
                style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <ArrowLeft size={15} /> Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FailedPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <MyComponent />
    </Suspense>
  );
};
export default FailedPage;
