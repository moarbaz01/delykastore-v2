"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";
import Image from "next/image";

const SliderComponent = ({
  banners,
  slides,
}: {
  slides?: string[];
  banners?: {
    images: {
      url: string;
    }[];
  }[];
}) => {
  return (
    <div className="relative z-0 w-full">
      <div className="max-w-screen-xl mx-auto">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          navigation={false}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          effect="fade"
          modules={[Pagination, Autoplay, Navigation, EffectFade]}
          pagination={{
            clickable: true,
          }}
          className="rounded-2xl overflow-hidden"
        >
          {banners &&
            banners[0]?.images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full">
                  <Image
                    src={image.url}
                    alt="DELYKASTORE Banner"
                    priority={true}
                    width={1600}
                    height={600}
                    className="w-full max-h-[75vh] object-cover"
                  />
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1A] via-transparent to-transparent opacity-60 pointer-events-none" />
                  {/* Purple edge glow */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-purple-500/30 pointer-events-none" />
                </div>
              </SwiperSlide>
            ))}
          {slides &&
            slides?.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full">
                  <Image
                    src={image}
                    alt="DELYKASTORE Slide"
                    priority={true}
                    width={1600}
                    height={600}
                    className="w-full max-h-[75vh] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1A] via-transparent to-transparent opacity-60 pointer-events-none" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-purple-500/30 pointer-events-none" />
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SliderComponent;
