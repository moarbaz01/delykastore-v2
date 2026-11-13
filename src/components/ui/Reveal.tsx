import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
}

// CSS-only fade so content is visible as soon as the HTML arrives, without
// waiting for JavaScript to hydrate on slow connections
export const Reveal = ({ children, width = "fit-content", delay = 0 }: RevealProps) => {
  return (
    <div style={{ position: "relative", width, zIndex: 1 }}>
      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          animationDelay: `${delay}s`,
          animationFillMode: "backwards",
        }}
      >
        {children}
      </div>
    </div>
  );
};
