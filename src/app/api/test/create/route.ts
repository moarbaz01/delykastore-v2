import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import { Product } from "@/models/product.model";
import { Account } from "@/models/account.model";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId, costId, orderDetails, game, type, name } = await req.json();

    if (!productId || !costId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const costItem = product.cost.find((c: any) => c.id === costId);
    if (!costItem) {
      return NextResponse.json({ message: "Cost package not found" }, { status: 404 });
    }

    const req_time = Math.floor(Date.now() / 1000).toString();
    const tran_id = "TEST" + req_time;

    const order = new Order({
      orderDetails: orderDetails || costItem.amount || "Test Pack",
      orderType: type === "account" ? "Account Order" : "Test Order",
      gameCredentials: { 
        userId: "TEST_USER", 
        zoneId: "", 
        game: game || product.game 
      },
      transactionId: tran_id,
      product: productId,
      amount: costItem.price,
      costId: costId,
      status: "pending",
      user: token.id,
      method: "test_bypass"
    });

    // Handle account reservation if it's an account type
    if (product.type === "account") {
      // DEBUG: Log all active accounts for this product to see what costIds are available
      const allActiveAccounts = await Account.find({ productId: productId, isActive: true });
      console.log(`[Stock Debug] Total active accounts for product ${productId}: ${allActiveAccounts.length}`);
      console.log(`[Stock Debug] Current Server Time: ${new Date().toISOString()}`);

      if (allActiveAccounts.length > 0) {
        allActiveAccounts.forEach((acc, i) => {
          console.log(`[Stock Debug] Account ${i+1}: ID=${acc._id}, costId="${acc.costId}" (type: ${typeof acc.costId}), isReserved=${acc.isReserved}, expiry=${acc.reservedExpiry?.toISOString() || 'N/A'}`);
        });
        const availableCostIds = [...new Set(allActiveAccounts.map(a => a.costId))];
        console.log(`[Stock Debug] Available costIds in DB: [${availableCostIds.join(", ")}]`);
        console.log(`[Stock Debug] Requested costId: "${costId}"`);
      }

      console.log(`[Test Create] Searching for available account: productId=${productId}, costId=${costId}`);
      // Use a more flexible search for test mode
      const availableAccount = await Account.findOne({
        productId: productId,
        costId: costId.toString(), // Ensure string
        isActive: true,
        $or: [{ isReserved: false }, { reservedExpiry: { $lt: new Date() } }],
      });

      if (availableAccount) {
        console.log(`[Test Create] Found account for reservation: ${availableAccount._id}`);
        availableAccount.isReserved = true;
        availableAccount.reservedExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await availableAccount.save();
        order.account = availableAccount._id;
      } else {
        console.warn(`[Test Create] No available account found for reservation.`);
      }
    }

    await order.save();

    console.log(`[Test API] Created Test Order: ${order._id}`);

    return NextResponse.json({ 
      message: "Test order created", 
      orderId: order._id 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Test order creation error:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
