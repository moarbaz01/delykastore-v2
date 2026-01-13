import { Suspense } from "react";
import GiftForm from "@/components/Dashboard/GiftForm";
import Loader from "@/components/Loader";

export default function EditGiftPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<Loader />}>
            <GiftForm mode="edit" giftId={params.id} />
        </Suspense>
    );
}
