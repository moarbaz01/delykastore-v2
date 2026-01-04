import { Suspense } from "react";
import SpinHistoryClientWrapper from "@/components/Dashboard/SpinHistoryClientWrapper";
import Loader from "@/components/Loader";

export default function SpinHistoryPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SpinHistoryClientWrapper />
    </Suspense>
  );
}