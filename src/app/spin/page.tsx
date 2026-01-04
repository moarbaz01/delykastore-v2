"use client";

import Loader from "@/components/Loader";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useRef, useEffect, Suspense } from "react";
import toast from "react-hot-toast";
import { FaTrophy, FaGift, FaHistory, FaTimes } from "react-icons/fa";

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
    } catch (error) {
      if (
        error.response?.data?.error === "Spin is not active for this product"
      ) {
        router.push("/");
        return;
      }
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
      setSpinResult(res.data.prize); // backend decides
    } catch {
      toast.error("Spin failed");
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  /* ---------------- SPIN WHEN RESULT ARRIVES ---------------- */

  useEffect(() => {
    if (spinResult && prizes.length) {
      spinWheel(spinResult);
    }
  }, [spinResult, prizes]);

  /* ---------------- SPIN LOGIC (FIXED) ---------------- */

  const segmentAngle = prizes.length ? 360 / prizes.length : 0;

  const spinWheel = (winningPrize: Prize) => {
    if (isSpinning || remainingSpins <= 0 || !prizes.length) return;

    const winningIndex = prizes.findIndex((p) => p.id === winningPrize.id);

    if (winningIndex === -1) {
      toast.error("Invalid prize");
      return;
    }

    setIsSpinning(true);
    setShowResult(false);

    const fullSpins = 5;
    const segmentAngle = 360 / prizes.length;
    
    // Calculate the exact angle needed to align winning segment center with pointer
    const segmentCenterAngle = winningIndex * segmentAngle + segmentAngle / 2;
    // Since SVG 0° is at 3 o'clock and pointer is at 12 o'clock (270°)
    const targetRotation = rotation + 360 * fullSpins + (270 - segmentCenterAngle) - (rotation % 360);

    setRotation(targetRotation);

    setRemainingSpins((prev) => Math.max(prev - 1, 0));

    setTimeout(() => {
      setIsSpinning(false);
      setCurrentPrize(winningPrize.name);
      setShowResult(true);

      const timeString = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setRecentSpins((prev) => [
        { time: timeString, result: winningPrize.name },
        ...prev.slice(0, 9),
      ]);

      setSpinResult(null);
    }, 4000);
  };

  /* ---------------- SVG SEGMENTS ---------------- */

  const createWheelSegment = (
    prize: Prize,
    index: number,
    isMobile = false
  ) => {
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const center = isMobile ? 150 : 175;
    const radius = isMobile ? 140 : 165;
    const textRadius = isMobile ? 70 : 85;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const pathData = `
      M ${center} ${center}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 0 1 ${x2} ${y2}
      Z
    `;

    const textAngle = startAngle + segmentAngle / 2;
    const textX = center + textRadius * Math.cos((textAngle * Math.PI) / 180);
    const textY = center + textRadius * Math.sin((textAngle * Math.PI) / 180);

    return (
      <g key={prize.id}>
        <path
          d={pathData}
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
          fontSize={isMobile ? 12 : 14}
          fontWeight="bold"
        >
          {prize.name}
        </text>
      </g>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2 text-primary">
            Lucky Spin / បង្វិលឱកាសឈ្នះរង្វាន់
          </h1>
          <div className="flex justify-center gap-2 lg:gap-4 mt-4 flex-wrap">
            <button className="px-3 lg:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors flex items-center gap-2 text-sm lg:text-base">
              <FaTimes /> Back to Home
            </button>
            <button className="px-3 lg:px-4 py-2 bg-card-bg hover:bg-card-bg/80 rounded-lg transition-colors flex items-center gap-2 text-sm lg:text-base">
              <FaGift /> Rules / ច្បាប់
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Wheel Section */}
          <div className="lg:col-span-2">
            <div className="bg-secondary rounded-2xl p-4 lg:p-6 shadow-2xl border border-gray-700">
              {/* Wheel Container */}
              <div className="relative flex justify-center mb-4 lg:mb-6">
                <div className="relative">
                  {/* Pointer */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
                    <div className="w-0 h-0 border-l-[12px] lg:border-l-[16px] border-l-transparent border-r-[12px] lg:border-r-[16px] border-r-transparent border-b-[24px] lg:border-b-[32px] border-b-primary"></div>
                  </div>

                  {/* Mobile Wheel */}
                  <div className="lg:hidden">
                    <div
                      ref={wheelRef}
                      className="relative w-[300px] h-[300px] transition-transform duration-[4000ms] ease-out"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <svg width="300" height="300" className="drop-shadow-lg">
                        {prizes.map((prize, index) =>
                          createWheelSegment(prize, index, true)
                        )}
                        <circle
                          cx="150"
                          cy="150"
                          r="20"
                          fill="#252F45"
                          stroke="#ff962d"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Desktop Wheel */}
                  <div className="hidden lg:block">
                    <div
                      ref={wheelRef}
                      className="relative w-[350px] h-[350px] transition-transform duration-[4000ms] ease-out"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <svg width="350" height="350" className="drop-shadow-lg">
                        {prizes.map((prize, index) =>
                          createWheelSegment(prize, index, false)
                        )}
                        <circle
                          cx="175"
                          cy="175"
                          r="20"
                          fill="#252F45"
                          stroke="#ff962d"
                          strokeWidth="4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spin Controls */}
              <div className="text-center space-y-4">
                <button
                  onClick={fetchSpinResult}
                  disabled={isSpinning || remainingSpins <= 0}
                  className="px-8 py-4 bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  {isSpinning ? "Spinning..." : "SPIN / បង្វិល"}
                </button>

                <div className="space-y-2">
                  <p className="text-lg">
                    {isSpinning
                      ? "Spinning the wheel..."
                      : showResult
                      ? `You won: ${currentPrize}!`
                      : "Ready to spin!"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Remaining Spins: {remainingSpins}
                  </p>
                </div>

                {/* <button
                  onClick={resetSpins}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <FaRedo /> Reset Spins
                </button> */}
              </div>

              {/* Result Modal */}
              {showResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-secondary rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-primary/20">
                    <FaTrophy className="text-6xl text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">
                      Congratulations!
                    </h3>
                    <p className="text-xl mb-4">You won: {currentPrize}</p>
                    <button
                      onClick={() => setShowResult(false)}
                      className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prizes List */}
          <div className="bg-secondary rounded-2xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaGift /> Prizes / រង្វាន់
            </h2>
            <div className="space-y-3  overflow-y-auto">
              {prizes.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: prize.color }}
                    ></div>
                    <span className="text-sm font-medium">{prize.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Win Rate: {prize.winRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Recent Spins */}
            <div className="bg-secondary rounded-2xl p-6 shadow-xl border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaHistory /> Recent Spins / ប្រវត្តិបង្វិល
                </h2>
                {recentSpins.length > 0 && (
                  <button
                    // onClick={clearHistory}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {recentSpins.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 text-sm text-gray-400 pb-2 border-b border-gray-700">
                    <span>Time</span>
                    <span>Result</span>
                  </div>
                  {recentSpins.map((spin, index) => (
                    <div key={index} className="grid grid-cols-2 text-sm py-1">
                      <span className="text-gray-300">{spin.time}</span>
                      <span className="text-primary">{spin.result}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No spins yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpinWheel: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SpinWheelContent />
    </Suspense>
  );
};

export default SpinWheel;
