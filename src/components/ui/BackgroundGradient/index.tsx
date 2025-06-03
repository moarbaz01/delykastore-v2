"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion"; // Correct import

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  // 💡 Mixed gradient with red, dark blue, and purple
  const gradientClass =
    "bg-[radial-gradient(circle_farthest-side_at_0_100%,#ff4d4d,transparent),radial-gradient(circle_farthest-side_at_100%_0,#4b0082,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#1e3a8a,transparent),radial-gradient(circle_farthest-side_at_0_0,#990000,#0f172a)]";

  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
          gradientClass
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] will-change-transform",
          gradientClass
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
