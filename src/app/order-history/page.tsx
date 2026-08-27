"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { useProfileOrders } from "@/hooks/useProfileOrders";
import {
  Package as PackageIcon,
  Search as SearchIcon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Clock,
  XCircle,
  Copy,
  Check,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import Loader from "@/components/ui/Loader";

function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative w-full sm:w-40 z-20" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#FFFFFF] border border-pink-500/15 rounded-xl px-4 py-2.5 text-sm text-white flex items-center justify-between hover:border-primary/50 transition-colors"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[#FFFFFF] border border-pink-500/15 rounded-xl shadow-xl overflow-hidden py-1 animate-fade-in-up">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === option.value
                ? "bg-primary/20 text-white font-medium"
                : "text-gray-600 hover:bg-white/5"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderHistoryContent() {
  const { status } = useSession();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );

  const { data, isLoading: queryLoading } = useProfileOrders(
    page,
    filterStatus,
    search,
  );

  const orders = data?.orders || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };
  const loading = queryLoading;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);



  const filterOptions = [
    { value: "all", label: "All Orders" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <div className="min-h-screen text-gray-100 py-6 px-4 pb-28 md:pb-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header & Controls */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">Order History</h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                size={16}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-pink-500/15 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:border-primary outline-none text-white transition-all shadow-sm"
              />
            </div>

            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={filterOptions}
            />
          </div>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order: any, index: number) => (
              <Reveal key={order._id} width="100%" delay={(index % 10) * 0.05}>
                <div
                  className="bg-[#FFFFFF] border border-pink-500/10 rounded-[16px] p-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-14 h-14 rounded-xl bg-[#FFFFFF] border border-pink-500/20 flex-shrink-0 overflow-hidden flex justify-center items-center">
                      {order.product?.image ? (
                        <Image
                          src={order.product.image}
                          alt=""
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <PackageIcon size={20} className="text-primary/50" />
                      )}
                    </div>

                    {/* Top Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-white text-[15px] truncate pr-2">
                          {order.product?.name || "Product Name"}
                        </h3>
                        <p className="text-[15px] font-bold text-primary shrink-0">
                          ${Number(order.amount).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${order.status === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : order.status === "failed"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Simple Details Section */}
                      <div className="mt-3 bg-[#FFFFFF]/50 rounded-lg p-3 border border-pink-500/5">
                        {order.product?.type === "account" ? (
                          order.accountDetails ? (
                            <div className="space-y-2">
                              {/* Email */}
                              <div className="flex items-center justify-between text-[13px]">
                                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                  <Mail size={14} className="text-gray-600 shrink-0" />
                                  <span className="truncate">{order.accountDetails.email}</span>
                                </div>
                                <button
                                  onClick={() => handleCopy(order.accountDetails.email, order._id + "e")}
                                  className="text-gray-600 hover:text-primary transition-colors p-1"
                                >
                                  {copiedId === order._id + "e" ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                              </div>

                              {/* Password */}
                              <div className="flex items-center justify-between text-[13px]">
                                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                  <Lock size={14} className="text-gray-600 shrink-0" />
                                  <span className="truncate font-mono">
                                    {showPasswords[order._id] ? order.accountDetails.password : "••••••••"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setShowPasswords(prev => ({ ...prev, [order._id]: !prev[order._id] }))}
                                    className="text-gray-600 hover:text-primary transition-colors p-1"
                                  >
                                    {showPasswords[order._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                  <button
                                    onClick={() => handleCopy(order.accountDetails.password, order._id + "p")}
                                    className="text-gray-600 hover:text-primary transition-colors p-1"
                                  >
                                    {copiedId === order._id + "p" ? <Check size={14} /> : <Copy size={14} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-rose-400">
                              {new Date(order.expiresAt!) < new Date()
                                ? "Details expired"
                                : "Details not available"}
                            </div>
                          )
                        ) : (
                          // Game Topup Details
                          <div className="flex flex-wrap gap-4 text-[13px] text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">ID:</span>
                              <span className="font-medium text-white">{order.gameCredentials?.userId || order.playerId || "N/A"}</span>
                            </div>
                            {order.gameCredentials?.zoneId && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Zone:</span>
                                <span className="font-medium text-white">{order.gameCredentials.zoneId}</span>
                              </div>
                            )}
                            {order.gameCredentials?.urlLink && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">URL/Link:</span>
                                <span className="font-medium text-white truncate max-w-[200px]" title={order.gameCredentials.urlLink}>
                                  {order.gameCredentials.urlLink}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Expiry Alert for accounts */}
                  {order.expiresAt && (
                    <div className="mt-3 pt-3 border-t border-pink-500/10 flex items-center gap-1.5 text-[11px] text-gray-600">
                      {new Date(order.expiresAt) < new Date() ? (
                        <><XCircle size={12} className="text-rose-500" /> Expired</>
                      ) : (
                        <><Clock size={12} className="text-emerald-500" /> Active until {new Date(order.expiresAt).toLocaleDateString()}</>
                      )}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-pink-500/10 rounded-[20px] py-16 text-center shadow-sm">
            <PackageIcon size={32} className="mx-auto text-primary/40 mb-3" />
            <p className="text-white font-medium mb-1">No orders found</p>
            <p className="text-gray-600 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-[#FFFFFF] border border-pink-500/20 text-white disabled:opacity-40 hover:bg-primary/10 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-gray-600">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-2 rounded-xl bg-[#FFFFFF] border border-pink-500/20 text-white disabled:opacity-40 hover:bg-primary/10 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense fallback={<Loader />}>
      <OrderHistoryContent />
    </Suspense>
  );
}
