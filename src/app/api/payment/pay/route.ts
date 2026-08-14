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

    const checkValidTrans = await checkTransaction(tran_id);
    console.log("valid", checkValidTrans);
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

    // Handle API orders
    if (order?.orderType === "API Order") {
      let orderResponse;
      const game = order?.gameCredentials?.game;
      const apiName = (order?.product as any)?.apiName;

      // Handle Aluu API
      if (apiName === "Aluu Api") {
        const { processAluuOrder } = await import("@/utils/aluu");
        orderResponse = await processAluuOrder(order);
      }
      // If game is mobile legends
      else if (game === "mobilelegends") {
        if (order.region === "brazil") {
          if ((order?.product as any)?.apiName === "TopUp Ghor Api") {
            orderResponse = await GhorTopUp(order as any, "86289");
          } else {
            orderResponse = await gameOrderRequest(order as any);
          }
        } else if (order.region === "philippines") {
          if ((order?.product as any)?.apiName === "TopUp Ghor Api") {
            orderResponse = await GhorTopUp(order as any, "86286");
          } else {
            orderResponse = await gameOrderRequest(order as any);
          }
        } else if (order.region === "indonesia") {
          orderResponse = await GhorTopUp(order as any, "39365");
        } else if (order.region === "malaysia") {
          orderResponse = await GhorTopUp(order as any, "39347");
        }
      } else if (game === "freefire") {
        if ((order?.product as any)?.apiName === "TopUp Ghor Api") {
          orderResponse = await GhorTopUp(order as any, "582");
        } else if ((order?.product as any)?.apiName === "Bangla Api") {
          orderResponse = await makePurchase({
            playerid: order.gameCredentials.userId,
            orderid: order.transactionId,
            pacakge: order.costId,
          });
        }
      } else if (game === "pubg") {
        // If game is free fire
        orderResponse = await GhorTopUp(order as any, "654");
      } else if (game === "honorofkings") {
        // If game is free fire
        orderResponse = await GhorTopUp(order as any, "67607");
      } else if (game === "magicchess") {
        // If game is free fire
        orderResponse = await GhorTopUp(order as any, "232990");
      } else if (game === "bloodstrike") {
        orderResponse = await GhorTopUp(order as any, "213941");
      } else if (game === "genshinimpact") {
        orderResponse = await GhorTopUp(order as any, "33221");
      }

      if (orderResponse?.status !== 200) {
        // If response is failes
        order.status = "failed";
        await order.save();

        return NextResponse.json(
          { message: "Order Failed", error: orderResponse?.error },
          { status: 500 },
        );
      }
    }

    // Save order and notify customer
    if ((order.product as any)?.type === "account") {
      let availableAccount = null;

      if (order.account) {
        // Always prefer the account that was reserved at transaction creation.
        // Never silently swap to a different account.
        availableAccount = await Account.findOne({
          _id: order.account,
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
        order.account = availableAccount._id;
        order.accountDetails = {
          email: availableAccount.email,
          password: availableAccount.password,
          additionalInfo: availableAccount.additionalInfo,
        };

        await createOrderLog({
          transactionId: order.transactionId,
          orderId: order._id?.toString(),
          provider: "Account Fulfillment",
          requestPayload: { accountId: availableAccount._id },
          responsePayload: {
            email: availableAccount.email,
            status: "assigned",
          },
          status: "success",
        });

        // Calculate expiration date
        const costItem = (order.product as any)?.cost?.find(
          (c: any) => c.id === order.costId,
        );
        const durationDays = parseInt(
          costItem?.durationDays?.toString() || "0",
        );
        if (durationDays > 0) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + durationDays);
          order.expiresAt = expiryDate;
        }

        order.status = "success";
      } else {
        // Reserved account is gone (e.g. reservation expired and was taken).
        // Payment was received but no account can be assigned — flag for admin.
        await createOrderLog({
          transactionId: order.transactionId,
          orderId: order._id?.toString(),
          provider: "Account Fulfillment",
          requestPayload: { accountId: order.account },
          responsePayload: { error: "Reserved account no longer available" },
          status: "failed",
        });
        order.status = "pending"; // Admin must manually fulfill
      }
    } else if (order.orderType === "API Order") {
      if ((order.product as any)?.apiName === "Bangla Api") {
        order.status = "pending";
      } else {
        order.status = "success";
      }
    } else {
      order.status = "pending";
    }

    if (order.isCouponApplied) {
      const updateResult = await Coupon.findOneAndUpdate(
        { coupon: order.couponCode },
        { $inc: { timesUsed: 1 } },
        { new: true },
      );

      if (!updateResult) {
        // Optionally handle the case where coupon doesn't exist
        order.isCouponApplied = false;
        order.couponCode = undefined;
        order.couponDetails = undefined;
      }
    }
    await order.save();

    if (order.status === "success" || (order.product as any)?.type === "digital-service") {
      const costItem = (order.product as any)?.cost?.find((c: any) => c.id === order.costId);
      const packageName = costItem ? (costItem.amount || costItem.note || "Selected Package") : undefined;
      await sendTelegramNotification(order, (order.product as any)?.name || "Unknown Product", packageName);
    }

    // Create spin transaction if costId is in spinCostIds and spinActive is true
    if (
      order.costId &&
      (order.product as any)?.spinActive &&
      (order.product as any)?.spinCostIds?.includes(order.costId)
    ) {
      try {
        const res = await SpinTransaction.create({
          transactionId: order.transactionId,
          productId: (order.product as any)?._id,
          userId: order.gameCredentials.userId,
          zoneId: order.gameCredentials.zoneId || null,
          costId: order.costId,
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
