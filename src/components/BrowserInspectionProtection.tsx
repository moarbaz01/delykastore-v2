"use client";

import { useEffect, useState } from "react";

const BlockScreen = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white text-center px-6">
    <h2 className="text-2xl font-semibold mb-4">⚠️ Developer Tools Detected</h2>
    <p className="text-base opacity-80">
      Please close developer tools to continue using this application.
    </p>
  </div>
);

export default function DevToolsDeterrent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // ✅ Do nothing in development
    if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
      return;
    }

    const threshold = 160;

    const detectDevTools = () => {
      // Method 1: Size-based detection (works for Chrome/Firefox)
      const sizeBasedDetection =
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;

      // Method 2: Console-based detection (more reliable across browsers)
      let consoleBasedDetection = false;
      const devtools = /./;
      devtools.toString = function () {
        consoleBasedDetection = true;
        return "";
      };

      // Method 3: Element-based detection
      let elementBasedDetection = false;
      const element = new Image();
      Object.defineProperty(element, "id", {
        get: function () {
          elementBasedDetection = true;
        },
      });

      // Trigger detection methods
      console.log(devtools);
      console.clear();

      const isOpen =
        sizeBasedDetection || consoleBasedDetection || elementBasedDetection;
      setBlocked(isOpen);
    };

    const interval = setInterval(detectDevTools, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Return early after hooks
  if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
    return <>{children}</>;
  }

  return blocked ? <BlockScreen /> : <>{children}</>;
}
