"use client";

import { useState, useEffect } from "react";
import Prizes from "@/components/Dashboard/Prizes";
import axios from "axios";

const Page = ({ params }) => {
  const [allPrizes, setAllPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const id = params.id;

  console.log("id", id);

  const fetchProduct = async () => {
    const res = await axios.get(`/api/product?id=${params.id}`);
    console.log("product data", res.data);
    setProduct(res.data);
  };

  useEffect(() => {
    fetchData();
    fetchProduct();
  }, []);

  // Fetch Data
  const fetchData = async () => {
    try {
      // Fetch prizes with populated product data
      const prizesResponse = await axios.get(
        `/api/prizes/admin?productId=${id}`
      );

      setAllPrizes(prizesResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Prizes allPrizes={allPrizes} id={id} />;
};

export default Page;
