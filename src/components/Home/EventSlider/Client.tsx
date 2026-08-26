"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ChevronRight, ChevronLeft } from "lucide-react";import GlowBorder from "@/components/GlowBorder";

export default function EventSliderClient({ events }: { events: any[] }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="  rounded-xl">
            <Sparkles className="text-primary w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-wider font-heading">
            Exclusive Events
          </h2>
        </div>
      </div>

      <div className="relative group">
        <button className="event-prev absolute -top-[44px] md:-top-[50px] right-10 md:right-12 lg:right-14 z-20 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10 rounded-full border border-white/10 bg-black/50 text-white hover:bg-primary transition-all disabled:opacity-30 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button className="event-next absolute -top-[44px] md:-top-[50px] right-0 z-20 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10 rounded-full border border-white/10 bg-black/50 text-white hover:bg-primary transition-all disabled:opacity-30 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={10}
          slidesPerView={1.8}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={{
            prevEl: ".event-prev",
            nextEl: ".event-next",
          }}
          breakpoints={{
            480: { slidesPerView: 2.4, spaceBetween: 16 },
            768: { slidesPerView: 3.2, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 16 },
          }}
          watchOverflow={false}
          className="-mx-4 px-4 pt-5 pb-10 event-swiper"
        >
        {events.map((event) => (
          <SwiperSlide key={event._id} className={`py-1.5 px-1 ${events.length === 1 ? "max-w-[280px] md:max-w-[320px]" : ""}`}>
            <Link href={`/product/${event.productId}`} className="block h-full group hover:-translate-y-1 transition-transform duration-300">
              <GlowBorder borderRadius={16} className="h-full block">
                <div className="relative text-white transition-colors duration-300 bg-[#1A1730]/80 border border-white/5 backdrop-blur-md h-full rounded-[inherit] overflow-hidden group-hover:bg-primary/20 flex flex-row items-center p-2 md:p-4 min-h-[80px] md:min-h-[130px] w-full">
                  {/* Background Image (blurred product main image) */}
                  <Image
                    src={event.image || "/placeholder.jpg"}
                    alt={event.name}
                    fill
                    className="object-cover opacity-20 blur-md scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D0B1A]/90 via-primary/20 to-transparent z-0" />

                  {/* Left Side Content */}
                  <div className="relative z-10 flex flex-col items-start justify-center flex-1 pr-2 w-full max-w-[60%]">
                    <h3 className="text-white font-extrabold text-xs md:text-lg truncate w-full drop-shadow-md">
                      {event.name}
                    </h3>
                    {event.eventPrice && (
                      <div className="mt-0.5 md:mt-1 border border-[#F5C754]/50 bg-[#F5C754]/20 text-[#F5C754] font-black px-1.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm shadow-sm w-fit">
                        {event.eventPrice}
                      </div>
                    )}
                    <button className="mt-1 md:mt-3 bg-primary hover:bg-primary/90 text-white font-black text-[9px] md:text-xs py-1 px-2.5 md:px-4 rounded-full shadow-md shadow-primary/40 transition-all flex items-center gap-1">
                      BUY NOW{" "}
                      <ChevronRight className="w-2.5 h-2.5 md:w-4 md:h-4" />
                    </button>
                  </div>

                  {/* Right Side Image (Main Image) */}
                  <div className="relative z-10 w-[56px] h-[56px] md:w-[110px] md:h-[110px] shrink-0 ml-auto">
                    <Image
                      src={
                        event.eventBanner || event.image || "/placeholder.jpg"
                      }
                      alt={event.name}
                      fill
                      className="object-contain drop-shadow-2xl scale-110 group-hover:scale-125 transition-transform duration-500"
                    />
                  </div>
                </div>
              </GlowBorder>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      </div>

      <style jsx global>{`
        .event-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
        }
        .event-swiper .swiper-pagination-bullet-active {
          background: var(--primary);
          width: 24px;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}
