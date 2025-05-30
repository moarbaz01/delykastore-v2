"use client";
import { useEffect, useState } from "react";
import Products from "@/components/Dashboard/Products";
import Loader from "@/components/Loader";
import axios from "axios";

const Page = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [ghorProductsList, setGhorProductsList] = useState([]);

  // Fetch products data on the client side using useEffect
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setAllProducts(data);
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    // app/actions/mlbb-topup.ts

    const getGhorProductList = async () => {
      try {
        const topupResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/unipin/fetch-products`
        );
        const topupData = await topupResponse.json();
        console.log(topupData.data[0]);
        setGhorProductsList(topupData.data[0]);
      } catch (error) {
        console.error("Error fetching topup data:", error);
        setGhorProductsList([]);
      }
    };

    const fetchProductsList = async () => {
      try {
        const res = await axios(
          `${process.env.NEXT_PUBLIC_API_URL}/productslist`
        );
        if (!res.data) {
          throw new Error("Failed to fetch products list");
        }
        setProductsList(res.data.data);
      } catch (error) {
        console.error(error);
        setProductsList([]);
      }
    };

    fetchProductsList();
    fetchProducts();
    getGhorProductList();
  }, []); // Empty dependency array to ensure it runs only once when the component mounts

  if (loading) {
    return <Loader />;
  }

  if (error || !allProducts) {
    return <div>Error loading products</div>;
  }

  return (
    <Products
      ghorProductlist={ghorProductsList}
      allProducts={allProducts}
      productsList={productsList}
    />
  );
};

export default Page;
