import Banner from "@/components/Home/Banner";
import AnnouncementBar from "@/components/Home/AnnouncementBar";
import EventSlider from "@/components/Home/EventSlider";
import TrendingGames from "@/components/Home/TrendingGames";
import AccountProducts from "@/components/Home/AccountProducts";
import DigitalServices from "@/components/Home/DigitalServices";

export default function Home() {
  return (
    <>
      <div className="pt-2 px-4 md:pt-4">
        <Banner />
      </div>
      <AnnouncementBar />
      <div className="pt-6">
        <EventSlider />
      </div>
      <TrendingGames />
      <AccountProducts />
      <DigitalServices />
    </>
  );
}