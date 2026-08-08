"use client";
import { useState } from "react";
import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { MdExplore } from "react-icons/md";

interface ProductType {
  _id: string;
  name: string;
  image: string;
  stock?: boolean;
  type?: string;
  isLink?: boolean;
  link?: string;
}

export default function ExploreTabs({ products }: { products: ProductType[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "topup" | "account" | "digital-service">("all");

  const filteredProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    const pType = product.type || "topup"; // default to topup if type is missing
    return pType === activeTab;
  });

  return (
    <section id="explore" className="mx-4 md:mx-auto max-w-7xl mt-8 mb-6">
      <div className="rounded-2xl md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <SectionHeader
            title="EXPLORE"
            icon={<MdExplore size={16} />}
          />
          
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "all" ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("topup")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "topup" ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Top-Up
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "account" ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Premium Accounts
            </button>
            <button
              onClick={() => setActiveTab("digital-service")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "digital-service" ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Digital Services
            </button>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.map((item) => (
              <GameCard
                key={item._id.toString()}
                _id={item._id.toString()}
                name={item.name}
                image={item.image}
                stock={item.stock}
                type={(item.type || "topup") as any}
                isLink={item.isLink}
                link={item.link}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 text-sm">
            No products found
          </div>
        )}
      </div>
    </section>
  );
}
