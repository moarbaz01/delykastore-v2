
import Link from "next/link";

const NotFound = () => {
  return (
    <div
      className="flex items-center justify-center fixed top-0 left-0 h-full w-full z-[999]"
      style={{ background: "#FDFDFD" }}
    >
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(123,47,190,0.2)" }} />
      <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(255,117,151,0.15)" }} />

      <div className="relative text-center text-white px-8 py-12">
        {/* 404 Number */}
        <div
          className="text-8xl font-black mb-4 leading-none"
          style={{
            background: "linear-gradient(135deg, #C084FC 0%, #FF7597 50%, #E55577 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Oops! Page not found
        </h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
          We couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,117,151,0.5)] hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, #E55577 0%, #FF7597 100%)" }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
