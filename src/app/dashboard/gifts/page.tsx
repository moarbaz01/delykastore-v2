import { Suspense } from "react";
import GiftsClientWrapper from "@/components/Dashboard/GiftsClientWrapper";
import Loader from "@/components/Loader";

export default function GiftsPage() {
    return (
        <Suspense fallback={<Loader />}>
            <GiftsClientWrapper />
        </Suspense>
    );
}
