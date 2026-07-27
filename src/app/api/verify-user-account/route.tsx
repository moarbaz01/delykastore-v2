import { checkAluuAccount, getAluuGameCode } from "@/utils/aluu";
import { NextResponse } from "next/server";
import { checkRateLimit, getCachedResult, setCachedResult } from "@/utils/apiCache";

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

    // 1. Rate Limiting: 10 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip, 10, 60)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    // 2. Caching: Check memory cache first
    const cacheKey = `aluu_${game_path}_${userId}_${zoneId || "none"}`;
    const cachedData = getCachedResult(cacheKey);
    if (cachedData) {
      console.log("Serving ALUU check from memory cache:", cacheKey);
      return NextResponse.json(cachedData, { status: 200 });
    }

    const res = await checkAluuAccount({ game_path, userId, zoneId });

    if (res.error) {
      // 400 = user error (invalid ID, daily limit, etc.) — shows message on frontend
      return NextResponse.json({ error: res.message }, { status: 400 });
    }
    
    // 3. Save successful result to cache for 24 hours (86400 seconds)
    setCachedResult(cacheKey, res, 86400);
    
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
