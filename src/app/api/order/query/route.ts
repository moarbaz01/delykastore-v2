import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import "@/models/product.model";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }
    const { searchParams } = new URL(req.url);

    // Pagination parameters
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    // Filter parameters
    const month = searchParams.get("month");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const orderType = searchParams.get("orderType");
    const search = searchParams.get("search");
    const transactionId = searchParams.get("transactionId");
    const game = searchParams.get("game");
    // Build the query object
    const query: any = {};

    if (month) {
      query.$expr = {
        $eq: [{ $month: "$createdAt" }, parseInt(month)],
      };
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (orderType) {
      query.orderType = orderType;
    }

    if (search) {
      query["gameCredentials.userId"] = { $regex: search, $options: "i" };
    }

    if (transactionId) {
      query.transactionId = { $regex: transactionId, $options: "i" };
    }

    if (game) {
      if (game.includes("-")) {
        const [name, region] = game.split("-");
        // Assuming the game is in the format "game-region"
        query["gameCredentials.game"] = { $regex: name, $options: "i" };
        query["region"] = { $regex: region, $options: "i" };
      } else {
        query["gameCredentials.game"] = { $regex: game, $options: "i" };
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("product")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Order.countDocuments(query), // Note: Changed to use the same query for accurate pagination
    ]);

    return NextResponse.json(
      {
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve orders" },
      { status: 500 }
    );
  }
}
