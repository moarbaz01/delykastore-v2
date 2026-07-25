"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
}

export const Reveal = ({ children, width = "fit-content", delay = 0 }: RevealProps) => {
  return (
    <div style={{ position: "relative", width, zIndex: 1 }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 50, scale: 0.95 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: delay, ease: [0.25, 0.25, 0, 1] }}
        style={{ width: "100%" }}
      >
        {children}
      </motion.div>
    </div>
  );
};
