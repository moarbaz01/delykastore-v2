import Balance from "@/components/Dashboard/Balance";
import { getSmileOneBalance } from "@/utils/smileone";
import { GetTopUpGhorBalance } from "@/utils/topupghor";
import { unstable_noStore } from "next/cache";

export default async function BalancePage() {
  unstable_noStore();
  try {
    const smileOneBalance = await getSmileOneBalance();
    const ghorBalance = await GetTopUpGhorBalance();

    return (
      <Balance smileOneBalance={smileOneBalance} ghorBalance={ghorBalance} />
    );
  } catch (error) {
    console.error("Error fetching balance:", error);
    return <div className="md:pl-72 px-4">Error fetching balance</div>;
  }
}
