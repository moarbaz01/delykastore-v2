import { NextResponse } from "next/server";
import { Product } from "@/models/product.model";
import { dbConnect } from "@/lib/database";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ isDeleted: false });
    if (!products) {
      return NextResponse.json({ error: "No products found" }, { status: 404 });
    }
    return NextResponse.json(products);
  } catch (error) {
    console.log("Error :", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
