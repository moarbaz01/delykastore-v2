import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { getHomeProducts } from "@/lib/getHomeProducts";
import { MdOutlineDevices } from "react-icons/md";

const DigitalServices = async () => {
  const products = await getHomeProducts("digital-service");

  if (products.length === 0) return null;

  return (
    <section className="mx-4 md:mx-auto max-w-7xl mt-8 mb-6">
      <div className="rounded-2xl md:p-6">
        <SectionHeader
          title="DIGITAL SERVICES"
          icon={<MdOutlineDevices size={16} />}
        />

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map((item) => (
            <GameCard
              key={item._id}
              _id={item._id}
              name={item.name}
              image={item.image}
              stock={item.stock}
              type="digital-service"
              isLink={item.isLink}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DigitalServices;
