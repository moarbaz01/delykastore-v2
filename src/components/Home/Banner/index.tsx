import { unstable_cache } from "next/cache";
import SliderComponent from "./Component";
import { dbConnect } from "@/lib/database";
import { Slider } from "@/models/slider.model";

const getSliders = unstable_cache(
  async () => {
    await dbConnect();
    const sliders = await Slider.find().populate("images").lean();
    return JSON.parse(JSON.stringify(sliders));
  },
  ["home-sliders"],
  { revalidate: 60, tags: ["sliders"] },
);

export default async function Banner() {
  const sliders = await getSliders();
  return <SliderComponent banners={sliders} />;
}
