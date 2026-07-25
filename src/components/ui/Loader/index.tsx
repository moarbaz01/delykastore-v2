import Image from "next/image";

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader = ({ fullScreen = false }: LoaderProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Glow wrapper */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full w-16 h-16 animate-pulse" />
        <Image
          src="/images/logo-animated.gif"
          alt="Loading..."
          width={64}
          height={64}
          className="relative z-10 w-16 h-16 object-contain"
        />
      </div>
      {/* Loading dots */}
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0B1A]/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-center min-h-[40vh] md:min-h-[50vh]">
      {content}
    </div>
  );
};

export default Loader;
