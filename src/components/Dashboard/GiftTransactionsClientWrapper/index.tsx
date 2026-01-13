"use client";
import GiftTransactions from "@/components/Dashboard/GiftTransactions";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const GiftTransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            // Pass all query parameters to the API
            const queryString = searchParams.toString();
            const res = await axios.get(`/api/gift-transaction?${queryString}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(res.data);
            setTransactions(res.data.transactions || []);
            setTotalTransactions(res.data.pagination?.total || 0);
        } catch (error) {
            toast.error("Failed to fetch gift transactions");
            console.error("Failed to fetch gift transactions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [searchParams]);

    return (
        <GiftTransactions
            allTransactions={transactions}
            totalTransactions={totalTransactions}
            isLoading={isLoading}
        />
    );
};

export default GiftTransactionsPage;
