"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Package, ShieldAlert, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useOrder } from "@/components/Product/hooks/useOrder";

export default function TestOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCost, setSelectedCost] = useState<any>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const { testOrder, isLoading: fulfilling } = useOrder(() => {});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get("/api/product?type=account");
        setProducts(res.data);
      } catch (error) {
        toast.error("Failed to fetch products");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleTestOrder = async () => {
    if (!selectedProduct || !selectedCost) {
      toast.error("Please select a product and package");
      return;
    }

    try {
      setCreating(true);
      const res = await axios.post("/api/test/create", {
        productId: selectedProduct._id,
        costId: selectedCost.id,
        orderDetails: selectedCost.amount || (selectedCost.durationDays ? `${selectedCost.durationDays} Days` : "Package"),
        game: selectedProduct.game,
        type: "account",
        name: selectedProduct.name
      });

      if (res.data.orderId) {
        toast.success("Test Order Created! Now fulfilling...");
        await testOrder(res.data.orderId);
      }
    } catch (error: any) {
      toast.error(`Creation Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const isLoading = creating || fulfilling;

  if (status === "loading" || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert size={12} /> Developer Sandbox
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Test Account Order</h1>
          <p className="text-gray-200 text-sm max-w-md mx-auto">
            Simulate a successful purchase of any premium account product to verify delivery logic and credential assignment.
          </p>
        </div>

        {/* Form */}
        <div className="bg-secondary rounded-lg border border-gray-600 overflow-hidden shadow-2xl">
          <div className="p-8 space-y-10">
            {/* Step 1: Select Product */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-300">
                <span className="w-6 h-6 rounded bg-primary text-black flex items-center justify-center text-xs">1</span>
                Select Premium Account
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setSelectedCost(null);
                    }}
                    className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                      selectedProduct?._id === p._id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-gray-600 bg-background/50 hover:border-gray-500"
                    }`}
                  >
                    <div className="w-16 h-16 rounded bg-background border border-gray-600 overflow-hidden mb-1">
                        <Image src={p.image} alt={p.name} width={64} height={64} className="object-cover w-full h-full" />
                    </div>
                    <span className="text-[11px] font-bold text-center truncate w-full text-white">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Cost */}
            {selectedProduct && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-300">
                  <span className="w-6 h-6 rounded bg-primary text-black flex items-center justify-center text-xs">2</span>
                  Choose Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProduct.cost.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCost(c)}
                      className={`p-4 rounded-lg border transition-all flex items-center justify-between gap-4 ${
                        selectedCost?.id === c.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-gray-600 bg-background/50 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-white">
                            {c.amount || (c.durationDays ? `${c.durationDays} Days Access` : "Standard Pack")}
                        </span>
                        {c.note && <span className="text-[10px] text-gray-300 mt-1">{c.note}</span>}
                      </div>
                      <span className="text-lg font-bold text-primary">${c.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Run Test */}
            <div className="pt-6 border-t border-gray-600">
              <button
                onClick={handleTestOrder}
                disabled={isLoading || !selectedProduct || !selectedCost}
                className="w-full bg-primary hover:opacity-90 disabled:opacity-50 py-4 rounded-lg text-black font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <CheckCircle2 size={20} /> Execute Test Order
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-background/40 p-4 border-t border-gray-600">
             <div className="flex items-start gap-3 text-xs text-gray-300 leading-relaxed">
                <ChevronRight size={14} className="mt-0.5 shrink-0 text-primary" />
                <p>Creating an order in sandbox mode will skip payment processing and instantly fulfill using available stock (or dummy credentials). Redirected to <span className="text-white font-bold">Order History</span> upon completion.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
