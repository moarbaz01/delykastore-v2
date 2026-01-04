import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_GHOR_API_KEY) {
      return NextResponse.json(
        { error: "Ghor API key not found" },
        { status: 500 }
      );
    }
    // This will automatically send the stored cookies
    const productResponse = await axios.post(
      "https://api.apighor.com/unipin/kira/product.php",
      {},
      {
        headers: {
          "X-Api-Key": process.env.NEXT_PUBLIC_GHOR_API_KEY!,
        },
      }
    );

    return NextResponse.json(productResponse.data);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
