import React from "react";
import Image from "next/image";
import { Wrench } from "lucide-react";

interface MaintenanceScreenProps {
  message?: string;
}

export default function MaintenanceScreen({ message }: MaintenanceScreenProps) {
  return (
    <div className="min-h-screen bg-[#0D0B1A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background styling to match the site */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 10%, rgba(168, 85, 247, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 75% 55%, rgba(192, 132, 252, 0.1) 0%, transparent 35%)
          `
        }}
      ></div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center shadow-2xl">
        <div className="bg-primary/20 p-4 rounded-full mb-6 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          <Wrench className="w-12 h-12 text-primary relative z-10" />
        </div>
        
        <h1 className="text-3xl font-heading font-bold text-white mb-4 uppercase tracking-wider">
          Under Maintenance
        </h1>
        
        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
          {message || "We are currently undergoing scheduled maintenance to improve our services. Please check back later!"}
        </p>

        <div className="text-xl font-black italic text-gray-500 tracking-wider font-sans">DELYKASTORE</div>
      </div>
    </div>
  );
}
