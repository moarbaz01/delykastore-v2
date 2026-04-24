"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useProfileOrders } from "@/hooks/useProfileOrders";
import {
  Package as PackageIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  ChevronRight,
  ChevronLeft,
  Clock,
  XCircle,
  Copy,
  Check,
  Mail,
  Lock,
  Calendar,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

function OrderHistoryContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("success");
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Order History
            </h1>
            <p className="text-gray-200">
              Track and manage your recent purchases.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-secondary border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none text-white w-full sm:w-64 transition-all"
              />
            </div>

            <div className="relative">
              <FilterIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                size={16}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-secondary border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-sm focus:border-primary outline-none text-white appearance-none cursor-pointer w-full"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order._id}
                className="bg-secondary border border-gray-600 rounded-lg p-5 hover:border-gray-500 transition-all group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Info */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded bg-background border border-gray-600 flex-shrink-0 overflow-hidden">
                      {order.product?.image ? (
                        <Image
                          src={order.product.image}
                          alt=""
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <PackageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${order.status === "success"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : order.status === "failed"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-gray-300 text-xs flex items-center gap-1">
                          <Calendar size={12} />{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg truncate mb-1">
                        {order.product?.name || "Product Name"}
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-gray-300 text-xs font-mono">
                          ID: #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-gray-400 text-[10px] font-mono">
                          TXN: {order.transactionId || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Credentials / Details */}
                  <div className="flex-1 lg:flex-[1.5] border-t lg:border-t-0 lg:border-l border-gray-600 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-center">
                    {order.product?.type === "account" ? (
                      <div className="space-y-2">
                        {order.accountDetails ? (
                          <>
                            <div className="flex items-center justify-between bg-background p-2 rounded border border-gray-600">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Mail
                                  size={14}
                                  className="text-primary flex-shrink-0"
                                />
                                <span className="text-sm text-gray-300 truncate">
                                  {order.accountDetails.email}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleCopy(
                                    order.accountDetails?.email || "",
                                    order._id + "e",
                                  )
                                }
                                className={`p-1 hover:text-primary transition-colors`}
                              >
                                {copiedId === order._id + "e" ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center justify-between bg-background p-2 rounded border border-gray-600">
                              <div className="flex items-center gap-2 overflow-hidden flex-1">
                                <Lock
                                  size={14}
                                  className="text-primary flex-shrink-0"
                                />
                                <span className="text-sm text-gray-300 truncate">
                                  {showPasswords[order._id]
                                    ? order.accountDetails.password
                                    : "••••••••"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setShowPasswords((prev) => ({
                                      ...prev,
                                      [order._id]: !prev[order._id],
                                    }))
                                  }
                                  className="p-1 hover:text-primary text-gray-400 transition-colors"
                                  title={
                                    showPasswords[order._id]
                                      ? "Hide Details"
                                      : "Show Details"
                                  }
                                >
                                  {showPasswords[order._id] ? (
                                    <EyeOff size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleCopy(
                                      order.accountDetails?.password || "",
                                      order._id + "p",
                                    )
                                  }
                                  className={`p-1 hover:text-primary transition-colors`}
                                >
                                  {copiedId === order._id + "p" ? (
                                    <Check size={14} />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-rose-400 font-bold bg-rose-500/10 p-3 rounded border border-rose-500/20">
                            {new Date(order.expiresAt!) < new Date()
                              ? "EXPIRED: DETAILS NO LONGER AVAILABLE"
                              : "DETAILS NOT FOUND"}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <div className="bg-background px-3 py-1.5 rounded border border-gray-600 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-300 uppercase">
                            User ID
                          </span>
                          <span className="text-sm text-white font-bold">
                            {order.gameCredentials?.userId ||
                              order.playerId ||
                              "N/A"}
                          </span>
                        </div>
                        {order.gameCredentials?.zoneId && (
                          <div className="bg-background px-3 py-1.5 rounded border border-gray-600 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-300 uppercase">
                              Zone
                            </span>
                            <span className="text-sm text-white font-bold">
                              {order.gameCredentials.zoneId}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Amount & Action */}
                  <div className="lg:w-32 border-t lg:border-t-0 lg:border-l border-gray-600 pt-4 lg:pt-0 lg:pl-6 flex lg:flex-col items-center justify-between lg:justify-center gap-2">
                    <div className="lg:text-right w-full">
                      <p className="text-xs text-gray-300 uppercase font-bold lg:hidden">
                        Price
                      </p>
                      <p className="text-xl font-bold text-white">
                        ${Number(order.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expiry Alert */}
                {order.expiresAt && (
                  <div className="mt-4 pt-4 border-t border-gray-600 flex items-center gap-2 text-xs font-bold uppercase">
                    {new Date(order.expiresAt) < new Date() ? (
                      <>
                        <XCircle size={14} className="text-rose-500" />{" "}
                        <span className="text-rose-500">
                          Expired on{" "}
                          {new Date(order.expiresAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock size={14} className="text-emerald-500" />{" "}
                        <span className="text-emerald-500">
                          Active until{" "}
                          {new Date(order.expiresAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary border border-gray-600 rounded-lg py-20 text-center">
            <PackageIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-300 mb-6 max-w-sm mx-auto">
              {search || filterStatus !== "all"
                ? "No orders match your current filters. Try resetting them."
                : "Your order history is empty. Start shopping to see your purchases here!"}
            </p>
            {(search || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterStatus("all");
                }}
                className="text-primary hover:underline text-sm font-bold"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-secondary border border-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-gray-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="p-2 rounded-lg bg-secondary border border-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="animate-spin text-primary" />
        </div>
      }
    >
      <OrderHistoryContent />
    </Suspense>
  );
}
