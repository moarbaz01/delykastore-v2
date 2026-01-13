import { Suspense } from "react";
import GiftForm from "@/components/Dashboard/GiftForm";
import Loader from "@/components/Loader";

export default function CreateGiftPage() {
    return (
        <Suspense fallback={<Loader />}>
            <GiftForm mode="create" />
        </Suspense>
    );
}
