"use client";

import React from "react";

const Marquee = () => {
  // We repeat the word enough times to ensure it fills more than the screen width
  // so the scrolling effect is seamless.
  const words = Array(12).fill("DELYKASTORE");

  return (
    <div className="w-full overflow-hidden py-3 md:py-4 mt-6 relative" >
      <div className="flex w-[200%] animate-marquee items-center justify-around gap-8">
        <div className="flex flex-1 justify-around items-center gap-8 px-4 whitespace-nowrap">
          {words.map((word, i) => (
            <span key={`first-${i}`} className="text-xl md:text-2xl font-black italic text-primary/20 tracking-wider">
              {word}
            </span>
          ))}
        </div>
        <div className="flex flex-1 justify-around items-center gap-8 px-4 whitespace-nowrap">
          {words.map((word, i) => (
            <span key={`second-${i}`} className="text-xl md:text-2xl font-black italic text-primary/20 tracking-wider">
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
