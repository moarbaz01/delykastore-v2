export const fetchCategories = async (setCostCategories: (value: any) => void) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/categories`);
  const data = await res.json();
  const extractName = data.map((category: any) => category.name);
  setCostCategories(extractName);
};

export const calculateTotal = (
  amountSelected: { price: string },
  appliedCoupon: any
): string => {
  const basePrice = parseFloat(amountSelected.price) || 0;
  if (!appliedCoupon) return basePrice.toFixed(2);

  const discountedPrice = appliedCoupon.finalPrice
    ? parseFloat(appliedCoupon.finalPrice)
    : basePrice - basePrice * (appliedCoupon.discount / 100);

  return Math.max(0, discountedPrice).toFixed(2);
};

export const groupCostByCategory = (
  costCategories: string[],
  cost: Array<{
    id: string;
    amount: string;
    price: string;
    image?: string;
    note?: string;
    category?: string;
  }>
) => {
  return costCategories.map((category) => ({
    category,
    items: cost
      .filter((item) => item.category === category)
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
  }));
};
