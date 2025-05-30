import GameDetails from "@/components/Dashboard/GameDetails";
import { getProductDetails } from "@/utils/topupghor";

interface Variation {
  variation_name: string;
  variation_id: number;
  variation_price: number;
}

export default async function GameDetailsPage({
  params,
}: {
  params: { productId: string };
}) {
  try {
    const productDetails = await getProductDetails(params.productId);
    return <GameDetails productDetails={productDetails.data} />;
  } catch (error) {
    return (
      <div className="md:pl-72 p-4">
        <h1 className="text-2xl font-bold">Error Loading Game Details</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}
