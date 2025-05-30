// pages/404.tsx
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center fixed top-0 left-0 h-full w-full z-[999] bg-black ">
      <div className="text-center text-white p-8">
        <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl mb-4">Oops! Customer Not Found</h2>
        <p className="mb-6 text-gray-300">
          We couldn&apos; t find the customer you&apos; re looking for. It might
          have been moved or deleted.
        </p>
        <Link
          href="/dashboard/customers"
          className="inline-block px-8 py-3 bg-white text-black rounded-full font-semibold text-lg shadow-md hover:bg-gray-200"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
