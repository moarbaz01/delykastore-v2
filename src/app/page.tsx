import Banner from "@/components/Home/Banner";
import TrendingGames from "@/components/Home/TrendingGames";

export default function Home() {
  return (
    <>
      <div className="px-4 md:px-0">
        <Banner />
      </div>
      <TrendingGames />
    </>
  );
}
