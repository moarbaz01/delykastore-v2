import { dbConnect } from "@/lib/database";
import { Event } from "@/models/event.model";
import EventSliderClient from "./Client";
import mongoose from "mongoose";

export default async function EventSlider() {
  try {
    await dbConnect();

    // Ensure Product model is registered before population
    if (!mongoose.models.Product) {
      await import("@/models/product.model");
    }

    const eventDocs = await Event.find().populate("productId").lean();

    if (!eventDocs || eventDocs.length === 0) return null;

    // Map the events to the structure expected by the client component
    const mappedEvents = eventDocs.map((event: any) => {
      const product = event.productId;
      const costItem = product?.cost?.find((c: any) => c.id === event.costId);

      return {
        _id: event._id.toString(),
        productId: product?._id?.toString(),
        name: product?.name || "Unknown Product",
        image: product?.image,
        eventPrice: costItem?.price || "",
        eventBanner: costItem?.image || product?.image,
        cost: costItem ? [costItem] : [],
      };
    });

    const serializedEvents = JSON.parse(JSON.stringify(mappedEvents));

    return (
      <div className="relative w-full overflow-hidden mt-4 mb-2">
        <div className="relative z-10 mx-4 md:mx-auto max-w-7xl">
          <EventSliderClient events={serializedEvents} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("EventSlider DB error:", error);
    return null;
  }
}
