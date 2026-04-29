import { checkAluuAccount } from "@/utils/aluu";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { game, userId, zoneId } = await req.json();
    if (!game || !userId) {
      return NextResponse.json(
        { message: "Missing game_path or userId" },
        { status: 400 },
      );
    }

    let game_path;

    if (game === "pubg") {
      game_path = "pubgm";
    } else if (game === "freefire") {
      game_path = "freefire_br";
    } else if (game === "honorofkings") {
      game_path = "hok";
    } else if (game === "mobilelegends") {
      game_path = "mlbb";
    } else if (game === "genshinimpact") {
      game_path = "genshin";
    } else if (game === "bloodstrike") {
      game_path = "bloodstrike";
    } else {
      return NextResponse.json({ error: "Invalid game" }, { status: 400 });
    }

    const res = await checkAluuAccount({ game_path, userId, zoneId });

    if (res.error) {
      // 400 = user error (invalid ID, daily limit, etc.) — shows message on frontend
      return NextResponse.json({ error: res.message }, { status: 400 });
    }
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
