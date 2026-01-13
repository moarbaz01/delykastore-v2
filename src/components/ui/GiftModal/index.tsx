import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    FaGift,
    FaTrophy,
    FaTicketAlt,
    FaStar,
    FaLock,
    FaUnlock,
} from "react-icons/fa";

export default function GiftModal({
    open,
    onClose,
    data,
}: {
    open: boolean;
    onClose: () => void;
    data: {
        bannerText: string;
        startDate?: string;
        productId: string;
        endDate?: string;
        userId: string;
        zoneId: string;
        userWagering: number;
        wagering: {
            level: number;
            wagering: number;
            costIds: string[];
        }[];
        costs: {
            level: string;
            wagering: number;
            costIds: string[];
            cost: {
                id: string;
                amount: string;
                note: string;
                price: string;
                image: string;
            }[];
        }[];
        features: {
            title: string;
            value: string;
        }[];
        claimedLevels?: number[];
    };
}) {
    const [selected, setSelected] = useState("weekly");
    const today = new Date();
    const [isLoading, setIsLoading] = useState(false);
    // First day of current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const filteredWagering = data.wagering.filter(
        (item) => !data.claimedLevels?.includes(item.level),
    );
    const router = useRouter();
    const firstWagering = filteredWagering[0]?.wagering || 0;
    const userWagering = data?.userWagering || 0;
    const progressPercent =
        firstWagering > 0 ? Math.min((userWagering / firstWagering) * 100, 100) : 0;

    // Last day of current month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const makeEntry = async () => {
        try {
            if (!data.userId) {
                toast("តម្រូវឱ្យមាន ID របស់អ្នកប្រើប្រាស់");
                return;
            }

            if (!data.productId) {
                toast("តម្រូវឱ្យមាន ID ផលិតផល");
                return;
            }

            if (!selected) {
                toast("សូមជ្រើសរើសរង្វាន់");
                return;
            }

            setIsLoading(true);

            const res = await axios.post("/api/gift-transaction", {
                userId: data.userId,
                zoneId: data.zoneId,
                cost: selected,
                productId: data.productId,
            });

            const response = res.data;
            if (!response.success) {
                toast.error(
                    response.message || "បរាជ័យក្នុងដំណើរការប្រតិបត្តិការណ៍រង្វាន់",
                );
                return;
            }
            toast.success("ដំណើរការប្រតិបត្តិការណ៍រង្វាន់បានជោគជ័យ");
            onClose();
            window.location.reload();
        } catch (error) {
            toast.error("បរាជ័យក្នុងដំណើរការប្រតិបត្តិការណ៍រង្វាន់");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex md:items-center items-end justify-center backdrop-blur-sm">
            <div className="bg-secondary w-full max-w-md h-fit md:rounded-2xl rounded-t-3xl p-3 border border-primary/20 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-20 h-20  rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16  rounded-full blur-lg"></div>

                {/* Header */}
                <div className="relative bg-card-bg text-white rounded-lg p-2 mb-3 border border-primary/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 bg-primary/30 rounded-md">
                            <FaGift className="text-sm text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-sm text-primary">
                                {data?.bannerText}
                            </h2>
                            <div className="flex items-center gap-2 text-xs opacity-90 ">
                                <FaTicketAlt className="text-primary" />
                                <span>ID: {data?.userId}</span>
                            </div>
                            {data?.zoneId && (
                                <div className="flex items-center gap-1.5 text-xs opacity-90 mt-0.5">
                                    <FaStar className="text-accent" />
                                    <span>Zone ID: {data?.zoneId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lottery Ticket Progress */}
                <div className="mb-3 relative">
                    <div className="bg-card-bg rounded-lg p-2 border border-gray-600/50">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <FaTicketAlt className="text-primary text-xs" />
                                <span className="text-xs font-semibold text-white">
                                    ដំណើរការភ្នាល់
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {userWagering >= firstWagering ? (
                                    <FaUnlock className="text-green-400" />
                                ) : (
                                    <FaLock className="text-yellow-400" />
                                )}
                                <span className="text-xs font-bold text-white">
                                    ${userWagering} / ${firstWagering}
                                </span>
                            </div>
                        </div>

                        {/* Progress bar with lottery ticket styling */}
                        <div className="relative">
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500 relative overflow-hidden"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>

                            <div className=" rounded-md p-1 mb-2 mt-2 ">
                                <div className="flex items-center justify-center gap-2 text-xs text-white">
                                    <div className="flex items-center gap-1">
                                        <FaTicketAlt className="text-primary" />
                                        <span>{firstDayOfMonth.toDateString()}</span>
                                    </div>
                                    <span className="text-primary">→</span>
                                    <div className="flex items-center gap-1">
                                        <FaGift className="text-primary" />
                                        <span>{lastDayOfMonth.toDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Level rewards */}
                        <div className="mt-2 space-y-1">
                            {data?.wagering
                                ?.filter(
                                    (requirement) =>
                                        !data.claimedLevels?.includes(requirement.level),
                                )
                                ?.map((requirement, index) => {
                                    const isCompleted = userWagering >= requirement.wagering;
                                    const currentRequirement = requirement;

                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-1.5 rounded-md border ${isCompleted
                                                ? "bg-primary/50 border-primary"
                                                : "bg-yellow-400/10 border-yellow-400/30"
                                                }`}
                                        >
                                            <div className="flex items-center gap-1">
                                                {isCompleted ? (
                                                    <FaTrophy className="text-primary text-xs" />
                                                ) : (
                                                    <FaLock className="text-yellow-400 text-xs" />
                                                )}
                                                <span className="text-xs text-white font-medium">
                                                    កម្រិត {requirement.level}
                                                </span>
                                            </div>
                                            <span
                                                className={`text-xs font-bold ${isCompleted ? "text-primary" : "text-yellow-400"
                                                    }`}
                                            >
                                                {isCompleted
                                                    ? `✓ $${currentRequirement.wagering}`
                                                    : `🎯 $${currentRequirement.wagering}`}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Date Period */}

                {/* Prize Selection Options */}
                <div className="space-y-1 mb-2 mt-2">
                    <div className="flex items-center gap-1 mb-2">
                        <FaTrophy className="text-primary text-xs" />
                        <span className="text-xs font-bold text-white">
                            ជ្រើសរើសរង្វាន់របស់អ្នក
                        </span>
                    </div>
                    <div className="space-y-2">
                        {data?.costs
                            ?.filter(
                                ({ level }) => !data.claimedLevels?.includes(parseInt(level)),
                            )
                            ?.map(({ cost, level, wagering }) =>
                                cost.map((c) => (
                                    <PrizeOption
                                        key={c.id}
                                        amount={c.amount}
                                        price={c.price}
                                        level={level}
                                        active={selected === c.id}
                                        disabled={userWagering < wagering}
                                        onClick={() => setSelected(c.id)}
                                    />
                                )),
                            )}
                    </div>
                </div>

                {/* Features Info */}
                {data?.features && data?.features.length > 0 && (
                    <div className="bg-gradient-to-r from-card-bg/50 to-secondary/50 rounded-md p-1.5 mb-2 border border-gray-600/30">
                        <div className="flex items-center gap-1 mb-1">
                            <FaStar className="text-accent text-xs" />
                            <span className="text-xs font-bold text-white">
                                លក្ខណៈពិសេសរង្វាន់
                            </span>
                        </div>
                        <ul className="text-xs text-gray-300 space-y-1">
                            {data?.features.map((feature) => (
                                <li key={feature.title} className="flex items-start gap-1">
                                    <div className="w-1 h-1 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                                    <div>
                                        <span className="font-semibold text-white">
                                            {feature.title}:
                                        </span>{" "}
                                        <span className="text-gray-400">{feature.value}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 relative mt-4 z-10">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg border-2 border-gray-600 font-semibold text-white hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                    >
                        បោះបង់
                    </button>
                    <button
                        onClick={makeEntry}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 relative overflow-hidden text-sm ${userWagering >= firstWagering
                            ? "bg-primary text-white hover:from-primary/90 hover:to-accent/90"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            }`}
                        disabled={userWagering < firstWagering || isLoading}
                    >
                        {userWagering >= firstWagering && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        )}
                        <span className="relative flex items-center gap-1">
                            {userWagering >= firstWagering ? (
                                <>
                                    {isLoading ? (
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FaUnlock className="text-xs" />
                                    )}
                                    {isLoading ? "កំពុងដំណើរការ..." : "ទទួលយករង្វាន់"}
                                </>
                            ) : (
                                <>
                                    <FaLock className="text-xs" />
                                    ចាក់សោ
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function PrizeOption({
    amount,
    level,
    price,
    active,
    onClick,
    disabled,
}: {
    amount: string;
    price: string;
    level: string;
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <div
            onClick={disabled ? undefined : onClick}
            className={`relative border-2 rounded-lg p-1.5 cursor-pointer transition-all duration-300 transform hover:scale-102 overflow-hidden ${active ? "border-primary bg-primary/80" : "border-primary bg-card-bg"
                }
                ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <div>
                        <span className="font-bold text-sm text-white block">{amount}</span>
                        <span className="font-bold text-sm text-white block">
                            កម្រិត : {level}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span
                        className={`font-bold text-sm ${active ? "text-white" : "text-gray-400"
                            }`}
                    >
                        ${price}
                    </span>
                </div>
            </div>
        </div>
    );
}
