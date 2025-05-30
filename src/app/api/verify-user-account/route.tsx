import { checkAccount } from "@/utils/topupghor";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { game, userId, zoneId } = await req.json();
    if (!game || !userId) {
      return NextResponse.json(
        { message: "Missing game_path or userId" },
        { status: 400 }
      );
    }

    let game_path;

    if (game === "pubg") {
      game_path = "pubg";
    } else if (game === "freefire") {
      game_path = "ff/mysg";
    } else if (game === "honorofkings") {
      game_path = "hok";
    } else if (game === "mobilelegends") {
      game_path = "ml";
    } else if (game === "genshinimpact") {
      game_path = "gi";
    } else if (game === "bloodstrike") {
      game_path = "bst";
    } else {
      return NextResponse.json({ error: "Invalid game" }, { status: 400 });
    }

    const res = await checkAccount({ game_path, userId, zoneId });
    console.log(res);

    if (res.error) {
      return NextResponse.json({ error: res.message }, { status: 500 });
    }
    return NextResponse.json(res);
  } catch (error) {
    // console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
