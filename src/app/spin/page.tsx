"use client";

import Loader from "@/components/Loader";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useRef, useEffect, Suspense } from "react";
import toast from "react-hot-toast";
import { FaTrophy, FaGift } from "react-icons/fa";

interface Prize {
  id: number;
  name: string;
  color: string;
  winRate: number;
}

interface SpinResult {
  time: string;
  result: string;
}

const SpinWheelContent: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [remainingSpins, setRemainingSpins] = useState(0);
  const [currentPrize, setCurrentPrize] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [recentSpins, setRecentSpins] = useState<SpinResult[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const searchParams = useSearchParams();
  const productId = searchParams.get("productid");
  const transactionId = searchParams.get("transactionid");

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [spinResult, setSpinResult] = useState<Prize | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- API ---------------- */

  const fetchPrizes = async () => {
    try {
      const res = await axios.get(`/api/prizes?productId=${productId}`);
      setPrizes(Array.isArray(res.data) ? res.data : []);
      checkSpin();
      setLoading(false);
    } catch {
      toast.error("Failed to fetch prizes");
    }
  };

  const checkSpin = async () => {
    try {
      const res = await axios.get(`/api/spin?transactionId=${transactionId}`);
      setRemainingSpins(res.data.spins || 0);
    } catch {
      toast.error("Failed to check spins");
    }
  };

  const fetchSpinResult = async () => {
    if (isSpinning || remainingSpins <= 0) return;
    try {
      const res = await axios.post("/api/spin", { transactionId });
      setSpinResult(res.data.prize);
    } catch {
      toast.error("Spin failed");
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  useEffect(() => {
    if (spinResult && prizes.length) {
      spinWheel(spinResult);
    }
  }, [spinResult, prizes]);

  /* ---------------- SPIN LOGIC ---------------- */

  const segmentAngle = prizes.length ? 360 / prizes.length : 0;

  const spinWheel = (winningPrize: Prize) => {
    if (isSpinning || remainingSpins <= 0) return;

    const winningIndex = prizes.findIndex(p => p.id === winningPrize.id);
    if (winningIndex === -1) return;

    setIsSpinning(true);
    setShowResult(false);

    const fullSpins = 5;
    const centerAngle = winningIndex * segmentAngle + segmentAngle / 2;
    const targetRotation =
      rotation + fullSpins * 360 + (270 - centerAngle) - (rotation % 360);

    setRotation(targetRotation);
    setRemainingSpins(prev => Math.max(prev - 1, 0));

    setTimeout(() => {
      setIsSpinning(false);
      setCurrentPrize(winningPrize.name);
      setShowResult(true);

      const time = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setRecentSpins(prev => [
        { time, result: winningPrize.name },
        ...prev.slice(0, 9),
      ]);

      setSpinResult(null);
    }, 4000);
  };

  /* ---------------- SVG SEGMENTS ---------------- */

  const createWheelSegment = (prize: Prize, index: number, mobile = false) => {
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;

    const center = mobile ? 150 : 175;
    const radius = mobile ? 140 : 165;
    const textRadius = mobile ? 70 : 85;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const textAngle = startAngle + segmentAngle / 2;
    const textX = center + textRadius * Math.cos((textAngle * Math.PI) / 180);
    const textY = center + textRadius * Math.sin((textAngle * Math.PI) / 180);

    return (
      <g key={prize.id}>
        <path
          d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
          fill={prize.color}
          stroke="#252F45"
          strokeWidth="2"
        />
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          fontSize={mobile ? 12 : 14}
          fontWeight="bold"
        >
          {prize.name}
        </text>
      </g>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-wide">
            <span className="text-primary">Lucky</span>{" "}
            <span className="text-white">Spin</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Spin the wheel & unlock rewards
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Wheel */}
          <div className="lg:col-span-2 bg-secondary/80 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10">
            <div className="relative flex justify-center mb-6">

              {/* Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-primary drop-shadow-lg" />
              </div>

              <div
                ref={wheelRef}
                className="transition-transform duration-[4000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg width="350" height="350" className="drop-shadow-xl">
                  <circle
                    cx="175"
                    cy="175"
                    r="160"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="6"
                  />
                  {prizes.map((p, i) => createWheelSegment(p, i))}
                  <circle cx="175" cy="175" r="26" fill="#111827" />
                  <circle cx="175" cy="175" r="20" fill="#252F45" stroke="#ff962d" strokeWidth="3" />
                  <text x="175" y="180" textAnchor="middle" fontSize="10" fill="#ff962d" fontWeight="bold">
                    SPIN
                  </text>
                </svg>
              </div>
            </div>

            <div className="text-center space-y-3">
              <button
                onClick={fetchSpinResult}
                disabled={isSpinning || remainingSpins <= 0}
                className="px-8 py-4 bg-primary rounded-xl font-bold tracking-wide shadow-[0_10px_30px_rgba(255,150,45,0.35)] hover:shadow-[0_15px_40px_rgba(255,150,45,0.5)] transition active:scale-95 disabled:bg-gray-600"
              >
                {isSpinning ? "Good luck..." : "TRY YOUR LUCK"}
              </button>

              <p className="text-sm text-gray-400">
                Remaining Spins: {remainingSpins}
              </p>
            </div>
          </div>

          {/* Prizes */}
          <div className="bg-secondary rounded-2xl p-6 border border-gray-700">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
              <FaGift /> Prizes
            </h2>
            <div className="space-y-3">
              {prizes.map(p => (
                <div key={p.id} className="relative flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                  <span className="text-xs text-gray-400">{p.winRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result Modal */}
        {showResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-secondary rounded-2xl p-6 shadow-[0_0_60px_rgba(255,150,45,0.25)] animate-[scaleIn_0.25s_ease-out]">
              <FaTrophy className="text-primary text-6xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-center">You Won!</h3>
              <p className="text-center mt-2">{currentPrize}</p>
              <button onClick={() => setShowResult(false)} className="mt-4 w-full bg-primary py-2 rounded-lg">
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const SpinWheel = () => (
  <Suspense fallback={<Loader />}>
    <SpinWheelContent />
  </Suspense>
);

export default SpinWheel;
