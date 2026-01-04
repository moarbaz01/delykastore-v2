import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { SpinTransaction } from "@/models/spin.transaction.model";
import { Order } from "@/models/order.model";
import "@/models/product.model";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const month = searchParams.get("month");
    const date = searchParams.get("date");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { isUsed: true };

    if (status) {
      query.status = status;
    }

    if (month) {
      const year = new Date().getFullYear();
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    if (search) {
      query.transactionId = { $regex: search, $options: "i" };
    }

    // Get spin transactions with order details
    const spinTransactions = await SpinTransaction.find(query)
      .populate({
        path: "productId",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get order details for each transaction
    const enrichedTransactions = await Promise.all(
      spinTransactions.map(async (spin) => {
        const order = (await Order.findOne({
          transactionId: spin.transactionId,
        })
          .select("user gameCredentials amount")
          .lean()) as any;

        return {
          _id: spin._id,
          transactionId: spin.transactionId,
          prize: spin.prize,
          status: spin.status,
          createdAt: spin.createdAt,
          product: spin.productId,
          user: order?.user || null,
          gameCredentials: order?.gameCredentials || null,
          amount: order?.amount || 0,
        };
      })
    );

    const total = await SpinTransaction.countDocuments(query);

    return NextResponse.json({
      spins: enrichedTransactions,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("Spin history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch spin history", details: error.message },
      { status: 500 }
    );
  }
}
