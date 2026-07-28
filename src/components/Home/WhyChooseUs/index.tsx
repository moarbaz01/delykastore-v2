import { FaShieldAlt, FaBolt, FaGift, FaTag, FaWallet } from "react-icons/fa";

const features = [
  {
    icon: FaTag,
    title: "Affordable Prices",
    description: "We always provide high-quality products at the lowest prices for all available games.",
    color: "#A855F7",
  },
  {
    icon: FaWallet,
    title: "Payment Options",
    description: "Multiple payment options available including KHQR, WING, ABA, ACLEDA...",
    color: "#8B5CF6",
  },
  {
    icon: FaGift,
    title: "Special Offers",
    description: "We always have special offers for our customers as well as monthly giveaways.",
    color: "#C084FC",
  },
  {
    icon: FaBolt,
    title: "Fast Service",
    description: "Fast delivery and service for all product purchases.",
    color: "#A855F7",
  },
  {
    icon: FaShieldAlt,
    title: "Security and Trust",
    description: "Maintaining high security and trust for your personal account.",
    color: "#7C3AED",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-purple-400 mb-4"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <span>⭐</span> Why Choose Us
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #C084FC 0%, #A855F7 50%, #7B2FBE 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Why Choose Us
          </h2>
          <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
            We offer the best gaming experience with unmatched features and benefits
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]"
                style={{
                  background: "#12102A",
                  border: "1px solid rgba(168, 85, 247, 0.15)",
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}20` }}
                >
                  <Icon className="text-xl" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover glow corner */}
                <div
                  className="absolute top-0 right-0 w-16 h-16 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at top right, ${feature.color}15, transparent)`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
