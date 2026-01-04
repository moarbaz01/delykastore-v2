"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaTrophy, FaGift, FaRedo, FaHistory, FaTimes } from 'react-icons/fa';

interface Prize {
    _id: string;
    name: string;
    color: string;
    winRate: number;
    isActive: boolean;
}
interface SpinResult {
    time: string;
    result: string;
}

const SpinWheel: React.FC = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [remainingSpins, setRemainingSpins] = useState(1);
    const [currentPrize, setCurrentPrize] = useState<string>('');
    const [showResult, setShowResult] = useState(false);
    const [recentSpins, setRecentSpins] = useState<SpinResult[]>([]);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [loading, setLoading] = useState(true);
    const [productId, setProductId] = useState<string>('');
    const wheelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get productId from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const productIdFromUrl = urlParams.get('productId');
        const productIdFromStorage = localStorage.getItem('currentProductId');

        const finalProductId = productIdFromUrl || productIdFromStorage || '';
        setProductId(finalProductId);

        if (finalProductId) {
            localStorage.setItem('currentProductId', finalProductId);
        }

        fetchPrizes(finalProductId);
    }, []);

    const fetchPrizes = async (productId: string) => {
        try {
            const url = productId ? `/api/prizes?productId=${productId}` : '/api/prizes';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPrizes(data);
            }
        } catch (error) {
            console.error('Error fetching prizes:', error);
        } finally {
            setLoading(false);
        }
    };

    const segmentAngle = prizes.length > 0 ? 360 / prizes.length : 0;

    const spinWheel = () => {
        if (isSpinning || remainingSpins <= 0) return;

        setIsSpinning(true);
        setShowResult(false);

        // Calculate random spin result
        const randomAngle = Math.random() * 360;
        const spins = 5; // Number of full rotations
        const finalRotation = rotation + (spins * 360) + randomAngle;

        setRotation(finalRotation);
        setRemainingSpins(prev => prev - 1);

        // Determine winning prize
        const normalizedAngle = (360 - (randomAngle % 360) + 90) % 360;
        const winningIndex = Math.floor(normalizedAngle / segmentAngle);
        const winningPrize = prizes[winningIndex];

        setTimeout(() => {
            setIsSpinning(false);
            setCurrentPrize(winningPrize.name);
            setShowResult(true);

            // Add to recent spins
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            setRecentSpins(prev => [
                { time: timeString, result: winningPrize.name },
                ...prev.slice(0, 9) // Keep only last 10 spins
            ]);
        }, 4000);
    };

    const resetSpins = () => {
        setRemainingSpins(1);
        setCurrentPrize('');
        setShowResult(false);
    };

    const clearHistory = () => {
        setRecentSpins([]);
    };

    const createWheelSegment = (prize: Prize, index: number, isMobile: boolean = false) => {
        const startAngle = index * segmentAngle;
        const endAngle = (index + 1) * segmentAngle;
        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;

        const largeArcFlag = segmentAngle > 180 ? 1 : 0;

        const center = isMobile ? 150 : 175;
        const radius = isMobile ? 140 : 165;
        const textRadius = isMobile ? 70 : 85;

        const x1 = center + radius * Math.cos(startAngleRad);
        const y1 = center + radius * Math.sin(startAngleRad);
        const x2 = center + radius * Math.cos(endAngleRad);
        const y2 = center + radius * Math.sin(endAngleRad);

        const pathData = [
            `M ${center} ${center}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        const textAngle = startAngle + segmentAngle / 2;
        const textAngleRad = (textAngle * Math.PI) / 180;
        const textX = center + textRadius * Math.cos(textAngleRad);
        const textY = center + textRadius * Math.sin(textAngleRad);

        // Function to wrap text
        const wrapText = (text: string, maxLength: number) => {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength - 2) + '..';
        };

        const displayText = wrapText(prize.name, 16);

        return (
            <g key={prize._id}>
                <path
                    d={pathData}
                    fill={prize.color}
                    stroke="#252F45"
                    strokeWidth="2"
                />
                <text
                    x={textX}
                    y={textY}
                    fill="black"
                    fontSize={isMobile ? "10" : "14"}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    className="pointer-events-none "
                >
                    {displayText}
                </text>
            </g>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (prizes.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl mb-4">No prizes available</p>
                    <button
                        onClick={() => fetchPrizes(productId)}
                        className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
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
                                                {prizes.map((prize, index) => createWheelSegment(prize, index, true))}
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
                                                {prizes.map((prize, index) => createWheelSegment(prize, index, false))}
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
                                    onClick={spinWheel}
                                    disabled={isSpinning || remainingSpins <= 0}
                                    className="px-8 py-4 bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                                >
                                    {isSpinning ? 'Spinning...' : 'SPIN / បង្វិល'}
                                </button>

                                <div className="space-y-2">
                                    <p className="text-lg">
                                        {isSpinning ? 'Spinning the wheel...' : showResult ? `You won: ${currentPrize}!` : 'Ready to spin!'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Remaining Spins: {remainingSpins}
                                    </p>
                                </div>

                                <button
                                    onClick={resetSpins}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <FaRedo /> Reset Spins
                                </button>
                            </div>

                            {/* Result Modal */}
                            {showResult && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-secondary rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-primary/20">
                                        <FaTrophy className="text-6xl text-primary mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
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
                                <div key={prize._id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                            style={{ backgroundColor: prize.color }}
                                        >
                                            <FaGift />
                                            {/* {prize.icon} */}
                                        </div>
                                        <span className="text-sm font-medium">{prize.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Win Rate: {prize.winRate}%</span>
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
                                        onClick={clearHistory}
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

export default SpinWheel;
