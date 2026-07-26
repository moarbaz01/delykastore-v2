import { NextRequest, NextResponse } from "next/server";
import { aluuAxios } from "@/lib/aluuAxios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ALUU_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "ALUU_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { gameCode, userId, zoneId } = body;

    if (!gameCode || !userId) {
      return NextResponse.json(
        { message: "gameCode and userId are required" },
        { status: 400 }
      );
    }

    let url = `https://aluu.in/api/check/game-check?code=${gameCode}&characterId=${userId}`;
    if (zoneId) {
      url += `&server_code=${zoneId}`;
    }

    const response = await aluuAxios.get(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    const data = response.data;
    
    // Process response based on standard Aluu name checker format
    if (
      data &&
      (data.valid === "valid" ||
        data.name ||
        data.nickname ||
        data.fullname ||
        data.status === "success")
    ) {
      const playerName = data.name || data.nickname || data.fullname || "Player";
      if (playerName.toLowerCase() === "na") {
        return NextResponse.json({ success: false, message: "Invalid Player ID" });
      }
      return NextResponse.json({ success: true, name: playerName });
    }

    return NextResponse.json({ 
      success: false, 
      message: data?.message || "Invalid Player ID or Server" 
    });

  } catch (error: any) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 403 && data?.code === "FREE_DAILY_LIMIT_REACHED") {
      return NextResponse.json({
        success: false,
        message: "Daily verification limit reached.",
      });
    }

    console.error("Error fetching ALUU name check:", data || error.message);
    return NextResponse.json(
      { success: false, message: data?.message || "Failed to check name", error: error.message },
      { status: status || 500 }
    );
  }
}
