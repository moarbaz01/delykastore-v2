import { checkAluuAccount, getAluuGameCode } from "@/utils/aluu";
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

    const game_path = getAluuGameCode(game);
    
    if (!game_path) {
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
