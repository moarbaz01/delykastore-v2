import GameListClient from "@/components/Dashboard/GameList";
import { getProductList } from "@/utils/topupghor";

export default async function GameList() {
  try {
    const res = await getProductList();

    // Pass the data to a client component for interactivity
    return <GameListClient initialData={res} />;
  } catch (error) {
    return (
      <div className="md:pl-72 py-4 px-4">
        <h1>Game List</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}
