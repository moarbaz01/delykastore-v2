import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import { Account } from "@/models/account.model";
import { Coupon } from "@/models/coupon.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

// Separate logic for test fulfillment to avoid touching production payment flow
async function fulfillTestOrder(order: any) {
  console.log(`[Test Fulfill] Starting fulfillment for Order: ${order._id} (Type: ${(order.product as any)?.type})`);
  
  if ((order.product as any)?.type === "account") {
    let availableAccount = null;

    // 1. Try to find the account that was reserved for this order
    if (order.account) {
      console.log(`[Test Fulfill] Order has reserved account ID: ${order.account}. Verifying in DB...`);
      availableAccount = await Account.findOne({
        _id: order.account,
        isActive: true,
      });
      if (availableAccount) {
        console.log(`[Test Fulfill] Reserved account verified and found.`);
      } else {
        console.warn(`[Test Fulfill] Reserved account ${order.account} not found or inactive.`);
      }
    }

    // 2. Fallback: Find any available account for this specific product and cost package
    if (!availableAccount) {
      const searchPid = (order.product as any)?._id || order.product;
      console.log(`[Test Fulfill] Fallback search: productId=${searchPid}, costId=${order.costId}`);
      availableAccount = await Account.findOne({
        productId: searchPid,
        costId: order.costId,
        isActive: true,
        $or: [{ isReserved: false }, { reservedExpiry: { $lt: new Date() } }],
      });
    }

    if (availableAccount) {
      console.log(`[Test Fulfill] Account found: ${availableAccount._id}. Marking as sold...`);
      // Mark account as sold
      availableAccount.isActive = false;
      availableAccount.isReserved = false;
      availableAccount.reservedExpiry = undefined;
      await availableAccount.save();

      // Link account to order
      order.account = availableAccount._id;
      order.accountDetails = {
        email: availableAccount.email,
        password: availableAccount.password,
        additionalInfo: availableAccount.additionalInfo,
      };

      // Calculate expiration
      const costItem = (order.product as any)?.cost?.find(
        (c: any) => c.id === order.costId,
      );
      const durationDays = parseInt(costItem?.durationDays?.toString() || "0");
      if (durationDays > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        order.expiresAt = expiryDate;
      }

      order.status = "success";
      console.log(`[Test Fulfill] Fulfillment successful with real account.`);
    } else {
      console.log(`[Test Fulfill] No stock available. Assigning dummy credentials for testing...`);
      // For test mode, use DUMMY credentials if no stock is available
      order.accountDetails = {
        email: "test-dummy@winwin.com",
        password: "DUMMY_PASSWORD_123",
        additionalInfo: "TEST MODE: No real account was found in stock.",
      };
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      order.expiresAt = expiryDate;
      order.status = "success";
    }
  } else {
    order.status = "success";
  }

  if (order.isCouponApplied) {
    await Coupon.findOneAndUpdate(
      { coupon: order.couponCode },
      { $inc: { timesUsed: 1 } },
      { new: true },
    );
  }

  console.log(`[Test Fulfill] Saving order ${order._id} with status: ${order.status}`);
  await order.save();
  return order;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Security check: Only authenticated users can trigger test fulfillment
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    console.log(`[Test API] POST /api/test/fulfill - Order ID: ${orderId}`);

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID required" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId).populate("product");
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Verify order belongs to the user (or user is admin)
    if (order.user.toString() !== session.user.id && session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized order access" },
        { status: 403 },
      );
    }

    if (order.status === "success") {
      return NextResponse.json(
        { message: "Order already success", order },
        { status: 200 },
      );
    }

    await fulfillTestOrder(order);

    return NextResponse.json(
      { message: "Test Fulfillment Successful", order },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Test fulfillment error:", error);
    return NextResponse.json(
      { message: "Test failed", error: error.message },
      { status: 500 },
    );
  }
}
