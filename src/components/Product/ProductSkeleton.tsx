const ProductSkeleton = () => {
  return (
    <div className="grid max-w-screen-xl relative mx-auto gap-6 md:py-6 sm:px-4 px-4 items-start grid-cols-1 lg:grid-cols-3">
      {/* Banner Section Skeleton */}
      <div className="flex flex-col gap-4 md:sticky md:mt-0 mt-4 md:top-20">
        <div className="w-full aspect-[2/1] md:aspect-auto md:h-48 bg-[#FFFFFF] border border-pink-500/15 rounded-2xl animate-pulse overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-pink-500/5 to-transparent skeleton-shimmer" />
        </div>
      </div>

      {/* Checkout Section Skeleton */}
      <div className="flex flex-col gap-4 lg:col-span-2 md:mt-2 mt-4">
        
        {/* User ID Section */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-pink-500/15">
          <div className="h-5 w-32 bg-pink-500/10 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-11 bg-pink-500/5 rounded-xl animate-pulse" />
            <div className="h-11 bg-pink-500/5 rounded-xl animate-pulse" />
          </div>
          <div className="h-11 w-full bg-primary/10 rounded-xl animate-pulse" />
        </div>

        {/* Package Section */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-pink-500/15">
          <div className="h-5 w-40 bg-pink-500/10 rounded mb-4 animate-pulse" />
          <div className="flex items-center gap-2 mt-2 mb-3">
            <div className="h-px flex-1 bg-pink-500/10" />
            <div className="h-7 w-24 bg-pink-500/10 rounded-full animate-pulse" />
            <div className="h-px flex-1 bg-pink-500/10" />
          </div>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-3 md:gap-4 mt-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[80px] bg-pink-500/5 border border-pink-500/10 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Coupon Section */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-pink-500/15">
          <div className="h-5 w-36 bg-pink-500/10 rounded mb-4 animate-pulse" />
          <div className="flex gap-2">
            <div className="flex-1 h-11 bg-pink-500/5 rounded-xl animate-pulse" />
            <div className="h-11 w-24 bg-primary/10 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Payment Section */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-pink-500/15">
          <div className="h-5 w-44 bg-pink-500/10 rounded mb-4 animate-pulse" />
          <div className="h-5 w-full bg-pink-500/5 rounded-lg animate-pulse mb-2" />
        </div>

        {/* Payment Summary */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-pink-500/20 shadow-lg">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-pink-500/10 rounded animate-pulse" />
              <div className="h-4 w-20 bg-pink-500/10 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-6 w-28 bg-pink-500/20 rounded animate-pulse" />
              <div className="h-6 w-24 bg-primary/20 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-12 w-full bg-primary/20 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
