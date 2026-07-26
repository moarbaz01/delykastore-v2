import { NextRequest, NextResponse } from "next/server";
import { aluuAxios } from "@/lib/aluuAxios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export async function GET(req: NextRequest) {
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

    const url = new URL(req.url);
    const gameCode = url.searchParams.get("gameCode");

    if (!gameCode) {
      return NextResponse.json(
        { message: "gameCode parameter is required" },
        { status: 400 }
      );
    }

    const response = await aluuAxios.get(`https://aluu.in/api/v.1/products/${gameCode}`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching ALUU products:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch ALUU products", error: error.message },
      { status: 500 }
    );
  }
}
