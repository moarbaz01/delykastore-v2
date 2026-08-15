import { NextResponse } from "next/server";
import { Order } from "@/models/order.model";
import { dbConnect } from "@/lib/database";
import { gameOrderRequest } from "@/utils/smileone";
import { Coupon } from "@/models/coupon.model";
import { Account } from "@/models/account.model";
import { GhorTopUp } from "@/utils/topupghor";
import { createHmac } from "crypto";
import "@/models/product.model";
import axios from "axios";
import { makePurchase } from "@/utils/bangla_api";
import { SpinTransaction } from "@/models/spin.transaction.model";
import { createOrderLog } from "@/utils/orderLogs";
import { sendTelegramNotification } from "@/utils/telegramNotifier";

const isValidTransaction = (trans) => {
  return (
    trans &&
    trans.status?.code !== 6 &&
    trans.data?.payment_status === "APPROVED"
  );
};

const checkTransaction = async (transactionId) => {
  const req_time = Math.floor(Date.now() / 1000).toString();
  const hash = createHmac("sha512", process.env.PAYWAY_PUBLIC_KEY!)
    .update(`${req_time}${process.env.PAYWAY_MERCHANT_KEY!}${transactionId}`)
    .digest("base64");

  const body = {
    merchant_id: process.env.PAYWAY_MERCHANT_KEY!,
    req_time,
    hash,
    tran_id: transactionId,
  };

  try {
    const res = await axios.post(process.env.PAYWAY_CHECK_URL!, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error checking transaction:", error.response.data, error);
    return null; // return null so you can handle it in the POST route
  }
};

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const { status, tran_id, apv } = data;

    if (status !== 0) {
      return NextResponse.json(
        { message: "Transaction not approved" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId).populate("product");

    // Invalid Order
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Invalid Transaction ID
    if (order.transactionId !== tran_id) {
      return NextResponse.json(
        { message: "Invalid transaction ID" },
        { status: 400 },
      );
    }

    let checkValidTrans = await checkTransaction(tran_id);
    
    // Bakong/Cross-bank transactions can take a few seconds to settle on ABA's side.
    // If it's PENDING, we wait and retry up to 5 times (15 seconds total).
    let attempts = 0;
    while (
      checkValidTrans &&
      checkValidTrans.data?.payment_status === "PENDING" &&
      attempts < 5
    ) {
      console.log(`Transaction ${tran_id} is PENDING. Retrying in 3 seconds... (Attempt ${attempts + 1}/5)`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      checkValidTrans = await checkTransaction(tran_id);
      attempts++;
    }
    
    console.log("valid", checkValidTrans);
    
    // Log the incoming ABA Webhook and validation result for debugging
    await createOrderLog({
      transactionId: tran_id,
      orderId: orderId,
      provider: "abapay_webhook",
      requestPayload: data,
      responsePayload: checkValidTrans || { error: "checkTransaction failed" },
      status: "pending", // This is just a debug log
    });
    if (!checkValidTrans) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 400 },
      );
    }

    if (!isValidTransaction(checkValidTrans)) {
      return NextResponse.json(
        { message: "Transaction not approved" },
        { status: 400 },
      );
    }

    

    if (order.status === "success") {
      return NextResponse.json(
        { message: "Order already placed" },
        { status: 200 },
      );
    }

    // ATOMIC LOCK: Prevent duplicate processing race conditions
    const lockedOrder = await Order.findOneAndUpdate(
      { _id: order._id, status: "pending", isProcessing: { $ne: true } },
      { $set: { isProcessing: true } },
      { new: true }
    ).populate("product");

    if (!lockedOrder) {
      console.log("Order is currently being processed by another webhook call.");
      return NextResponse.json(
        { message: "Order already processing or placed" },
        { status: 200 },
      );
    }

    // Handle API orders
    if (lockedOrder?.orderType === "API Order") {
      let orderResponse;
      const game = lockedOrder?.gameCredentials?.game;
      const apiName = (lockedOrder?.product as any)?.apiName;

      // Handle Aluu API
      if (apiName === "Aluu Api") {
        const { processAluuOrder } = await import("@/utils/aluu");
        orderResponse = await processAluuOrder(lockedOrder);
      }
      // If game is mobile legends
      else if (game === "mobilelegends") {
        if (lockedOrder.region === "brazil") {
          if ((lockedOrder?.product as any)?.apiName === "TopUp Ghor Api") {
            orderResponse = await GhorTopUp(lockedOrder as any, "86289");
          } else {
            orderResponse = await gameOrderRequest(lockedOrder as any);
          }
        } else if (lockedOrder.region === "philippines") {
          if ((lockedOrder?.product as any)?.apiName === "TopUp Ghor Api") {
            orderResponse = await GhorTopUp(lockedOrder as any, "86286");
          } else {
            orderResponse = await gameOrderRequest(lockedOrder as any);
          }
        } else if (lockedOrder.region === "indonesia") {
          orderResponse = await GhorTopUp(lockedOrder as any, "39365");
        } else if (lockedOrder.region === "malaysia") {
          orderResponse = await GhorTopUp(lockedOrder as any, "39347");
        }
      } else if (game === "freefire") {
        if ((lockedOrder?.product as any)?.apiName === "TopUp Ghor Api") {
          orderResponse = await GhorTopUp(lockedOrder as any, "582");
        } else if ((lockedOrder?.product as any)?.apiName === "Bangla Api") {
          orderResponse = await makePurchase({
            playerid: lockedOrder.gameCredentials.userId,
            orderid: lockedOrder.transactionId,
            pacakge: lockedOrder.costId,
          });
        }
      } else if (game === "pubg") {
        // If game is free fire
        orderResponse = await GhorTopUp(lockedOrder as any, "654");
      } else if (game === "honorofkings") {
        // If game is free fire
        orderResponse = await GhorTopUp(lockedOrder as any, "67607");
      } else if (game === "magicchess") {
        // If game is free fire
        orderResponse = await GhorTopUp(lockedOrder as any, "232990");
      } else if (game === "bloodstrike") {
        orderResponse = await GhorTopUp(lockedOrder as any, "213941");
      } else if (game === "genshinimpact") {
        orderResponse = await GhorTopUp(lockedOrder as any, "33221");
      }

      if (orderResponse?.status !== 200) {
        // If response is failes
        lockedOrder.status = "failed";
        await lockedOrder.save();

        return NextResponse.json(
          { message: "Order Failed", error: orderResponse?.error },
          { status: 500 },
        );
      }
    }

    // Save order and notify customer
    if ((lockedOrder.product as any)?.type === "account") {
      let availableAccount = null;

      if (lockedOrder.account) {
        // Always prefer the account that was reserved at transaction creation.
        // Never silently swap to a different account.
        availableAccount = await Account.findOne({
          _id: lockedOrder.account,
          isActive: true,
        });
      }

      if (availableAccount) {
        // Mark account as sold and clear reservation
        availableAccount.isActive = false;
        availableAccount.isReserved = false;
        availableAccount.reservedExpiry = undefined;
        await availableAccount.save();

        // Attach account details to order
        lockedOrder.account = availableAccount._id;
        lockedOrder.accountDetails = {
          email: availableAccount.email,
          password: availableAccount.password,
          additionalInfo: availableAccount.additionalInfo,
        };

        await createOrderLog({
          transactionId: lockedOrder.transactionId,
          orderId: lockedOrder._id?.toString(),
          provider: "Account Fulfillment",
          requestPayload: { accountId: availableAccount._id },
          responsePayload: {
            email: availableAccount.email,
            status: "assigned",
          },
          status: "success",
        });

        // Calculate expiration date
        const costItem = (lockedOrder.product as any)?.cost?.find(
          (c: any) => c.id === lockedOrder.costId,
        );
        const durationDays = parseInt(
          costItem?.durationDays?.toString() || "0",
        );
        if (durationDays > 0) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + durationDays);
          lockedOrder.expiresAt = expiryDate;
        }

        lockedOrder.status = "success";
      } else {
        // Reserved account is gone (e.g. reservation expired and was taken).
        // Payment was received but no account can be assigned — flag for admin.
        await createOrderLog({
          transactionId: lockedOrder.transactionId,
          orderId: lockedOrder._id?.toString(),
          provider: "Account Fulfillment",
          requestPayload: { accountId: lockedOrder.account },
          responsePayload: { error: "Reserved account no longer available" },
          status: "failed",
        });
        lockedOrder.status = "pending"; // Admin must manually fulfill
        lockedOrder.isProcessing = false;
      }
    } else if (lockedOrder.orderType === "API Order") {
      if ((lockedOrder.product as any)?.apiName === "Bangla Api") {
        lockedOrder.status = "pending";
      } else {
        lockedOrder.status = "success";
      }
    } else {
      lockedOrder.status = "pending";
    }

    if (lockedOrder.isCouponApplied) {
      const updateResult = await Coupon.findOneAndUpdate(
        { coupon: lockedOrder.couponCode },
        { $inc: { timesUsed: 1 } },
        { new: true },
      );

      if (!updateResult) {
        // Optionally handle the case where coupon doesn't exist
        lockedOrder.isCouponApplied = false;
        lockedOrder.couponCode = undefined;
        lockedOrder.couponDetails = undefined;
      }
    }
    await lockedOrder.save();

    if (lockedOrder.status === "success" || (lockedOrder.product as any)?.type === "digital-service") {
      const costItem = (lockedOrder.product as any)?.cost?.find((c: any) => c.id === lockedOrder.costId);
      const packageName = costItem ? (costItem.amount || costItem.note || "Selected Package") : undefined;
      await sendTelegramNotification(lockedOrder, (lockedOrder.product as any)?.name || "Unknown Product", packageName);
    }

    // Create spin transaction if costId is in spinCostIds and spinActive is true
    if (
      lockedOrder.costId &&
      (lockedOrder.product as any)?.spinActive &&
      (lockedOrder.product as any)?.spinCostIds?.includes(lockedOrder.costId)
    ) {
      try {
        const res = await SpinTransaction.create({
          transactionId: lockedOrder.transactionId,
          productId: (lockedOrder.product as any)?._id,
          userId: lockedOrder.gameCredentials.userId,
          zoneId: lockedOrder.gameCredentials.zoneId || null,
          costId: lockedOrder.costId,
          spin: 1,
          isUsed: false,
        });

        console.log("spin response", res);
      } catch (spinError) {
        console.error("Failed to create spin transaction:", spinError);
        // Don't fail the entire payment process for spin transaction errors
      }
    }

    return NextResponse.json(
      { message: "Order Placed", order },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error in payment callback:", error);
    return NextResponse.json(
      { message: "Error processing payment", error: error?.message },
      { status: 500 },
    );
  }
}
