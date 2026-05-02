import { dbConnect } from "@/lib/database";
import { getGameList } from "@/utils/smileone";
import { NextResponse } from "next/server";

export const revalidate = 259200; // Cache for 3 days (in seconds)

export async function GET() {
  try {
    await dbConnect();

    const data = await getGameList();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
