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
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      {/* Animated border gradient */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl z-[1]",
          "will-change-transform",
          "animate-gradient bg-[length:200%_200%]",
          "bg-gradient-to-br from-red-500 via-purple-800 to-blue-800"
        )}
      />
      {/* Glow effect (optional, only on larger screens) */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl z-[0]",
          "will-change-transform",
          "hidden md:block blur-xl opacity-40",
          "animate-gradient bg-[length:200%_200%]",
          "bg-gradient-to-br from-red-500 via-purple-800 to-blue-800"
        )}
      />
      {/* Content with background */}
      <div 
        className={cn(
          "relative z-10 rounded-3xl bg-black/90 backdrop-blur-sm",
          "m-[2px]", // Creates the border effect
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};