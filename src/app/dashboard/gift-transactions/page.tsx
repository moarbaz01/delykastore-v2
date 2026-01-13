import { Suspense } from "react";
import GiftTransactionsClientWrapper from "@/components/Dashboard/GiftTransactionsClientWrapper";
import Loader from "@/components/Loader";

export default function GiftTransactionsPage() {
    return (
        <Suspense fallback={<Loader />}>
            <GiftTransactionsClientWrapper />
        </Suspense>
    );
}
