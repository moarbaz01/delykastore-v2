import { NextResponse } from "next/server";
import { Product } from "@/models/product.model";
import { dbConnect } from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";
    
    const filter = isAdmin 
      ? { isDeleted: false } 
      : { isDeleted: false, isTesting: { $ne: true } };
      
    const products = await Product.find(filter);
    
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
