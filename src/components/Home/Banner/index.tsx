import SliderComponent from "./Component";
import { dbConnect } from "@/lib/database";
import { Slider } from "@/models/slider.model";
export const dynamic = "force-dynamic";
export default async function Banner() {
  await dbConnect();
  const sliders = await Slider.find().populate("images").lean();
  return <SliderComponent banners={JSON.parse(JSON.stringify(sliders))} />; // ✅ Pass as a named prop
}
