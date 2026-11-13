import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { getHomeProducts } from "@/lib/getHomeProducts";
import { IoLogoGameControllerB } from "react-icons/io";

const TrendingGames = async () => {
  const products = await getHomeProducts("topup");

  return (
    <section id="games" className="mx-4 md:mx-auto max-w-7xl mt-8 mb-6">
      <div
        className="rounded-2xl md:p-6"

      >
        <SectionHeader
          title="GAME TOP UP"
          icon={<IoLogoGameControllerB size={16} />}
        />

        {products.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {products.map((item) => (
              <GameCard
                key={item._id}
                _id={item._id}
                name={item.name}
                image={item.image}
                stock={item.stock}
                type={item.type}
                isLink={item.isLink}
                link={item.link}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 text-sm">
            No games found
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingGames;
