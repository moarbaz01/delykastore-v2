"use client"; // Ensures that the component uses client-side rendering
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css"; // Make sure the Swiper CSS is imported
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
      <div className="max-w-screen-xl mx-auto mt-6 md:px-0">
        <Swiper
          spaceBetween={10} // Adjust space between slides
          slidesPerView={1} // Only one slide per view
          navigation={true} // Enable navigation buttons
          centeredSlides={true} // Center the active slide
          loop={true} // Loop through slides
          autoplay={{
            delay: 2000, // Auto play with 1 second delay
            disableOnInteraction: false, // Ensures autoplay continues after user interaction
          }}
          effect="fade" // Apply the fade effect
          modules={[Pagination, Autoplay, Navigation, EffectFade]} // Import the fade effect module
        >
          {banners &&
            banners[0]?.images.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={image.url}
                  alt="Zoland Store Banner 1"
                  layout="responsive"
                  priority={true}
                  width={1600} // Adjust for large screen resolution
                  height={600} // Adjust height proportionally
                  className="w-full max-h-[80vh] object-cover rounded-xl border-2 border-white" // Ensures image scaling with aspect ratio
                />
              </SwiperSlide>
            ))}
          {slides &&
            slides?.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={image}
                  alt="Zoland Store Banner 1"
                  layout="responsive"
                  priority={true}
                  width={1600} // Adjust for large screen resolution
                  height={600} // Adjust height proportionally
                  className="w-full max-h-[80vh] object-cover rounded-xl border-2 border-white" // Ensures image scaling with aspect ratio
                />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SliderComponent;
