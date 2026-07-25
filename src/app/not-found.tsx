export const runtime = "edge";
import Link from "next/link";

const NotFound = () => {
  return (
    <div
      className="flex items-center justify-center fixed top-0 left-0 h-full w-full z-[999]"
      style={{ background: "#0D0B1A" }}
    >
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(123,47,190,0.2)" }} />
      <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(168,85,247,0.15)" }} />

      <div className="relative text-center text-white px-8 py-12">
        {/* 404 Number */}
        <div
          className="text-8xl font-black mb-4 leading-none"
          style={{
            background: "linear-gradient(135deg, #C084FC 0%, #A855F7 50%, #7B2FBE 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          អូ! រកមិនឃើញទំព័រ
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
          យើងរកមិនឃើញទំព័រដែលអ្នកកំពុងស្វែងរក។ វាប្រហែលជាត្រូវបានផ្លាស់ទី ឬលុបចោល។
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #A855F7 100%)" }}
        >
          ← ត្រឡប់ទៅទំព័រដើម
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
