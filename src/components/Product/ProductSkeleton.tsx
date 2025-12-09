const ProductSkeleton = () => {
  return (
    <div className="grid grid-cols-1  lg:grid-cols-3 max-w-screen-xl mx-auto gap-4 py-6 sm:px-6 px-4">
      {/* Banner Skeleton */}
      <div className="">
        <div className="w-full aspect-video bg-secondary animate-pulse rounded-lg" />
        <div className="w-full h-48 bg-secondary animate-pulse rounded-lg mt-4" />
      </div>

      {/* Checkout Section Skeleton */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* User ID Section */}
        <div className="bg-secondary rounded-lg p-6 shadow-sm">
          <div className="h-6 w-32 bg-card-bg animate-pulse rounded mb-4" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-10 bg-card-bg animate-pulse rounded" />
            <div className="h-10 bg-card-bg animate-pulse rounded" />
          </div>
          <div className="h-10 w-full bg-card-bg animate-pulse rounded" />
        </div>

        {/* Package Section */}
        <div className="bg-secondary rounded-lg p-6 shadow-sm">
          <div className="h-6 w-40 bg-card-bg animate-pulse rounded-lg mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[70px] bg-card-bg animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-secondary rounded-lg p-6 shadow-sm">
          <div className="h-6 w-36 bg-card-bg animate-pulse rounded mb-4" />
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-card-bg animate-pulse rounded" />
            <div className="h-10 w-24 bg-card-bg animate-pulse rounded" />
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-secondary rounded-lg p-6 shadow-sm">
          <div className="h-6 w-44 bg-card-bg animate-pulse rounded mb-4" />
          <div className="h-4 w-full bg-card-bg animate-pulse rounded" />
        </div>

        {/* Payment Summary */}
        <div className="bg-secondary rounded-lg p-6 shadow-sm">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-card-bg animate-pulse rounded" />
              <div className="h-4 w-20 bg-card-bg animate-pulse rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-5 w-28 bg-card-bg animate-pulse rounded" />
              <div className="h-5 w-24 bg-card-bg animate-pulse rounded" />
            </div>
          </div>
          <div className="h-12 w-full bg-card-bg animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
