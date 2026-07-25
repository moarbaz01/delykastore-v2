import Banner from "@/components/Home/Banner";
import Marquee from "@/components/Home/Marquee";
import TrendingGames from "@/components/Home/TrendingGames";
import AccountProducts from "@/components/Home/AccountProducts";

export default function Home() {
  return (
    <>
      <div className="pt-2 px-4 md:pt-4">
        <Banner />
      </div>
      <TrendingGames />
      <AccountProducts />
    </>
  );
}
