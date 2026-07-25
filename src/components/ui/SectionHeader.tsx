import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  icon?: React.ReactNode;
}

const SectionHeader = ({
  title,
  viewAllHref,
  viewAllLabel = "View All",
  icon,
}: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
            {icon}
          </div>
        )}
        <div className="relative">
          <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
          <div className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-purple-500 to-violet-500" />
        </div>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group"
        >
          {viewAllLabel}
          <svg
            className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
