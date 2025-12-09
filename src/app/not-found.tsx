export const runtime = "edge";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center fixed top-0 left-0 h-full w-full z-[999] bg-black ">
      <div className="text-center text-white p-8">
        <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl mb-4">អូ! រកមិនឃើញទំព័រ</h2>
        <p className="mb-6 text-gray-300">
          យើងរកមិនឃើញទំព័រដែលអ្នកកំពុងស្វែងរក។ វាប្រហែលជាត្រូវបានផ្លាស់ទី
          ឬលុបចោល។
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-white text-black rounded-full font-semibold text-lg shadow-md hover:bg-gray-200"
        >
          ត្រឡប់ទៅទំព័រដើម
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
