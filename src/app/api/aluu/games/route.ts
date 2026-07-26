import { NextResponse } from "next/server";
import { aluuAxios } from "@/lib/aluuAxios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export async function GET() {
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

    const response = await aluuAxios.get("https://aluu.in/api/v.1/games", {
      headers: {
        "x-api-key": apiKey,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching ALUU games:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch ALUU games", error: error.message },
      { status: 500 }
    );
  }
}
