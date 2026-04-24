import { getProductList } from "@/utils/topupghor";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await getProductList();
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error fetching game list:", error);
    return NextResponse.json(
      { error: true, message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
}
