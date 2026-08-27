"use client";

import { useState } from "react";
import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { IoLogoGameControllerB } from "react-icons/io";
import { Search } from "lucide-react";

interface ProductType {
  _id: string;
  name: string;
  image: string;
  stock?: boolean;
  type?: string;
  isLink?: boolean;
  link?: string;
}

export default function GamesClient({ products }: { products: ProductType[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "topup" | "account" | "digital-service">("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const pType = product.type || "topup";
    const matchesTab = activeTab === "all" || pType === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <main className="min-h-screen pt-6 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <section className="mt-2 mb-6">
        <div className="rounded-2xl md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <SectionHeader
              title="EXPLORE"
              icon={<Search size={16} />}
            />

            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-pink-500/50" />
              </div>
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FFFFFF]/80 border border-pink-500/20 text-white text-sm rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent block pl-10 p-2.5 transition-all outline-none placeholder-gray-500 shadow-[0_0_15px_rgba(255,117,151,0.1)]"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "all" ? "bg-primary text-white" : "bg-pink-50 text-gray-600 hover:text-gray-900 hover:bg-pink-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("topup")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "topup" ? "bg-primary text-white" : "bg-pink-50 text-gray-600 hover:text-gray-900 hover:bg-pink-100"
              }`}
            >
              Top-Up
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "account" ? "bg-primary text-white" : "bg-pink-50 text-gray-600 hover:text-gray-900 hover:bg-pink-100"
              }`}
            >
              Premium Accounts
            </button>
            <button
              onClick={() => setActiveTab("digital-service")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "digital-service" ? "bg-primary text-white" : "bg-pink-50 text-gray-600 hover:text-gray-900 hover:bg-pink-100"
              }`}
            >
              Digital Services
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mt-6">
              {filteredProducts.map((item) => (
                <GameCard
                  key={item._id.toString()}
                  _id={item._id.toString()}
                  name={item.name}
                  image={item.image}
                  stock={item.stock}
                  type={(item.type as "topup") || "topup"}
                  isLink={item.isLink}
                  link={item.link}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Search size={48} className="text-pink-500/20 mb-4" />
              <p className="text-gray-600 font-medium">No games found matching &quot;{searchTerm}&quot;</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
