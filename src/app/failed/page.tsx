"use client";
import Loader from "@/components/Loader";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const MyComponent = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  if (!message) {
    notFound();
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className="min-h-screen flex items-center  justify-center m-2">
        <div className="text-center max-w-lg p-8 shadow-lg bg-secondary rounded-lg">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg text-white mb-6">
            Unfortunately, the payment process has failed. Please try again
            later or contact support.
          </p>
          <p className="text-lg text-white mb-6">{message}</p>
          <Link href={"/"} className="flex justify-center">
            <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 transition duration-300">
              Retry Payment
            </button>
          </Link>
        </div>
      </div>
    </Suspense>
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
