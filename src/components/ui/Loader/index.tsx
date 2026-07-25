import Image from "next/image";

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader = ({ fullScreen = false }: LoaderProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="custom-loader"></div>
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
    <div className="w-full flex-1 flex justify-center items-center min-h-[40vh] py-12">
      {content}
    </div>
  );
};

export default Loader;
