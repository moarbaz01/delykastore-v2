"use client";
import Gifts from "@/components/Dashboard/Gifts";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface Gift {
    _id: string;
    productId: {
        _id: string;
        name: string;
    };
    bannerText?: string;
    startDate?: string;
    endDate?: string;
    costs?: Array<{
        amount: string;
        price: number;
    }>;
    features?: Array<{
        title: string;
        value: string;
    }>;
    wagering: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Product {
    _id: string;
    name: string;
}

const GiftsClientWrapper = () => {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();

    const fetchGifts = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get("/api/gifts");
            setGifts(res.data);
        } catch (error) {
            toast.error("Failed to fetch gifts");
            console.error("Failed to fetch gifts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/products");
            setProducts(res.data);
        } catch (error) {
            toast.error("Failed to fetch products");
            console.error("Failed to fetch products:", error);
        }
    };

    useEffect(() => {
        fetchGifts();
        fetchProducts();
    }, []);

    const handleCreateGift = async (giftData: any) => {
        try {
            await axios.post("/api/gifts", giftData);
            toast.success("Gift created successfully");
            fetchGifts();
        } catch (error) {
            toast.error("Failed to create gift");
            console.error("Failed to create gift:", error);
        }
    };

    const handleUpdateGift = async (id: string, giftData: any) => {
        try {
            await axios.put(`/api/gifts?id=${id}`, giftData);
            toast.success("Gift updated successfully");
            fetchGifts();
        } catch (error) {
            toast.error("Failed to update gift");
            console.error("Failed to update gift:", error);
        }
    };

    const handleDeleteGift = async (id: string) => {
        try {
            await axios.delete(`/api/gifts?id=${id}`);
            toast.success("Gift deleted successfully");
            fetchGifts();
        } catch (error) {
            toast.error("Failed to delete gift");
            console.error("Failed to delete gift:", error);
        }
    };

    return (
        <Gifts
            gifts={gifts}
            products={products}
            isLoading={isLoading}
            onCreateGift={handleCreateGift}
            onUpdateGift={handleUpdateGift}
            onDeleteGift={handleDeleteGift}
        />
    );
};

export default GiftsClientWrapper;
