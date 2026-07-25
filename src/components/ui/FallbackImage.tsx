"use client";
import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Gamepad2 } from "lucide-react";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackIconSize?: number;
}

export default function FallbackImage({
  src,
  alt,
  className,
  fallbackIconSize = 20,
  ...rest
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-purple-500/10 text-purple-400 ${className}`}
        style={{ width: rest.width, height: rest.height }}
      >
        <Gamepad2 size={fallbackIconSize} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Image"}
      onError={() => setError(true)}
      className={className}
      {...(rest as any)}
    />
  );
}
