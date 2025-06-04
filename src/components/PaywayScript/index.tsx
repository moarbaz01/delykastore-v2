"use client";

import Script from "next/script";

const PaywayScript = () => {
  return (
    <Script
      src="https://checkout.payway.com.kh/plugins/checkout2-0.js"
      strategy="afterInteractive"
      onLoad={() => console.log("PayWay script loaded")}
      onError={() => console.error("Failed to load PayWay script")}
    />
  );
};

export default PaywayScript;

