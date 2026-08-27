"use client";
import React from 'react';

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string | number;
  color?: string; // default to primary color
}

export default function GlowBorder({
  children,
  className = "",
  borderRadius = "16px",
  color = "#FF7597",
}: GlowBorderProps) {
  const radius = typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;

  return (
    <div
      className={`relative group transition-all duration-300 ${className}`}
      style={{
        borderRadius: radius,
      }}
    >
      {/* Default State: Box Shadow Halo (avoids blur rendering bugs) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-500 rounded-[inherit] z-0"
        style={{
          boxShadow: `0 0 8px 0px ${color}40`,
        }}
      />
      {/* Hover State: Brighter Box Shadow Halo */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[inherit] z-0"
        style={{
          boxShadow: `0 0 12px 1px ${color}80`,
        }}
      />
      
      {/* Crisp Inner Border */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-500 rounded-[inherit] z-20"
        style={{
          border: `1px solid ${color}50`,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative h-full w-full rounded-[inherit] z-10">
        {children}
      </div>
    </div>
  );
}
