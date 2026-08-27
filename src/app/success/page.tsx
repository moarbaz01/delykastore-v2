"use client";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Download, ArrowLeft, Gift } from "lucide-react";

const MyComponent = () => {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const pack = searchParams.get("pack");
  const price = searchParams.get("price");
  const userId = searchParams.get("userId");
  const zoneId = searchParams.get("zoneId");
  const productId = searchParams.get("productId");

  const handleDownloadReceipt = () => {
    const receiptContent = `
      Transaction ID: ${transactionId}
      Pack: ${decodeURI(pack || "")}
      Price: ${price}
      User ID: ${userId}
      Zone ID: ${zoneId}
    `;
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt_${transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#FDFDFD" }}>
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(34,197,94,0.08)" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Success card */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(34,197,94,0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.1), 0 0 40px rgba(34,197,94,0.08)",
          }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)" }}
          >
            <CheckCircle size={40} className="text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-green-400 text-sm font-medium mb-6">
            Your order was successful
          </p>

          {/* Details */}
          <div
            className="rounded-2xl overflow-hidden text-left mb-6"
            style={{ background: "#FDFDFD", border: "1px solid rgba(255,117,151,0.1)" }}
          >
            {[
              { label: "Payment Method", value: "ABA KHQR" },
              { label: "Package", value: decodeURI(pack || "") },
              { label: "Price", value: `$${price}` },
              {
                label: "User ID",
                value: `${userId || ""}${zoneId ? ` (${zoneId})` : ""}`,
              },
              { label: "Transaction ID", value: transactionId },
            ].map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-4 py-3"
                style={{
                  borderBottom: i < 4 ? "1px solid rgba(255,117,151,0.08)" : "none",
                }}
              >
                <span className="text-xs text-gray-500 font-medium">{row.label}</span>
                <span className="text-xs text-gray-700 font-semibold text-right max-w-[60%] truncate">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleDownloadReceipt}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,117,151,0.4)] hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #E55577 0%, #FF7597 100%)" }}
            >
              <Download size={15} /> Download Receipt
            </button>

            {productId && transactionId && (
              <Link href={`/spin?productid=${productId}&transactionid=${transactionId}`} className="block">
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-pink-600 text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,117,151,0.3)] hover:bg-pink-500/20"
                  style={{ background: "rgba(255,117,151,0.15)", border: "1px solid rgba(255,117,151,0.3)" }}
                >
                  <Gift size={15} /> Spin for Bonus
                </button>
              </Link>
            )}

            <Link href="/" className="block">
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-600 text-sm font-medium transition-all duration-200 hover:text-gray-900 hover:bg-gray-50"
                  style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.1)" }}
                >
                <ArrowLeft size={15} /> Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <MyComponent />
    </Suspense>
  );
};

export default SuccessPage;
