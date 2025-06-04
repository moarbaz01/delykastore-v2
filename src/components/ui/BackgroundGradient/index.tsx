"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  // Same mixed radial gradient
  const gradientClass =
    "bg-[radial-gradient(circle_farthest-side_at_0_100%,#ff4d4d,transparent),radial-gradient(circle_farthest-side_at_100%_0,#4b0082,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#1e3a8a,transparent),radial-gradient(circle_farthest-side_at_0_0,#990000,#0f172a)]";

  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500",
          gradientClass
        )}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-3xl z-[1]",
          gradientClass
        )}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
