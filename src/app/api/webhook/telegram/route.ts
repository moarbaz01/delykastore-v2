import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import { editTelegramMessage } from "@/utils/telegramNotifier";
import axios from "axios";

// ─── Answer callback query (removes loading spinner in Telegram) ──────────────
const answerCallbackQuery = async (callbackQueryId: string, text: string) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    });
  } catch (err) {
    console.error("answerCallbackQuery error:", err);
  }
};

export async function POST(req: NextRequest) {
  try {
    console.log("[TG-WEBHOOK] 📥 Request received");
    const body = await req.json();
    console.log("[TG-WEBHOOK] Body type:", Object.keys(body || {}).join(", "));

    // Only handle callback_query (button taps)
    const callbackQuery = body?.callback_query;
    if (!callbackQuery) {
      console.log("[TG-WEBHOOK] ⏭️ Not a callback_query — ignored");
      return NextResponse.json({ ok: true });
    }

    const callbackQueryId: string = callbackQuery.id;
    const data: string = callbackQuery?.data ?? "";

    // Parse action and orderId from callback_data e.g. "complete:6719abc..."
    const colonIdx = data.indexOf(":");
    if (colonIdx === -1) {
      await answerCallbackQuery(callbackQueryId, "⚠️ Invalid data.");
      return NextResponse.json({ ok: true });
    }
    const action = data.slice(0, colonIdx);
    const orderId = data.slice(colonIdx + 1);
    console.log(`[TG-WEBHOOK] 🎯 Action: ${action} | OrderId: ${orderId}`);

    if (!orderId || !["complete", "cancel"].includes(action)) {
      console.warn(`[TG-WEBHOOK] ⚠️ Unknown action: ${action}`);
      await answerCallbackQuery(callbackQueryId, "⚠️ Unknown action.");
      return NextResponse.json({ ok: true });
    }

    console.log("[TG-WEBHOOK] 🔌 Connecting to DB...");
    await dbConnect();

    const order = await Order.findById(orderId).populate("product");
    if (!order) {
      console.error(`[TG-WEBHOOK] ❌ Order not found: ${orderId}`);
      await answerCallbackQuery(callbackQueryId, "❌ Order not found.");
      return NextResponse.json({ ok: true });
    }
    console.log(`[TG-WEBHOOK] 📋 Order found — current status: ${order.status}`);

    // Prevent double-action if already processed
    if (order.status !== "pending") {
      console.warn(`[TG-WEBHOOK] ⚠️ Already processed — status: ${order.status}`);
      await answerCallbackQuery(
        callbackQueryId,
        `⚠️ Order already marked as ${order.status}.`
      );
      return NextResponse.json({ ok: true });
    }

    // ─── Update DB status ─────────────────────────────────────────────────────
    const newStatus = action === "complete" ? "success" : "failed";
    console.log(`[TG-WEBHOOK] 💾 Updating order status to: ${newStatus}`);
    order.status = newStatus;
    await order.save();
    console.log(`[TG-WEBHOOK] ✅ DB updated successfully`);

    // ─── Build updated message ────────────────────────────────────────────────
    const productName = (order.product as any)?.name || "Unknown Product";
    const { gameCredentials, amount, orderType, transactionId } = order;
    const shortId = transactionId || orderId.slice(-6);

    let updatedMsg = action === "complete"
      ? `✅ <b>Order #${shortId} — COMPLETED</b>\n`
      : `❌ <b>Order #${shortId} — CANCELLED</b>\n`;

    updatedMsg += `━━━━━━━━━━━━━━━━━━\n`;
    updatedMsg += `📦 <b>Service:</b> ${productName}\n`;
    if (gameCredentials?.urlLink) updatedMsg += `🔗 <b>Link:</b> ${gameCredentials.urlLink}\n`;
    if (gameCredentials?.userId) updatedMsg += `🪪 <b>User ID:</b> ${gameCredentials.userId}\n`;
    if (gameCredentials?.zoneId) updatedMsg += `🌐 <b>Zone ID:</b> ${gameCredentials.zoneId}\n`;
    updatedMsg += `💰 <b>Amount:</b> $${Number(amount).toFixed(2)}\n`;
    updatedMsg += `⚙️ <b>Mode:</b> ${orderType}\n`;
    updatedMsg += `━━━━━━━━━━━━━━━━━━\n`;
    updatedMsg += `🆔 <b>Order ID:</b> <code>${orderId}</code>\n`;
    updatedMsg += action === "complete"
      ? `✅ <b>Status:</b> Completed`
      : `❌ <b>Status:</b> Cancelled`;
    updatedMsg += `\n🕐 <i>Updated by admin</i>`;

    // ─── Edit the stored Telegram message ────────────────────────────────────
    const chatId = order.telegramChatId;
    const messageId = order.telegramMessageId;
    console.log(`[TG-WEBHOOK] ✏️ Editing message — chatId: ${chatId}, messageId: ${messageId}`);

    if (chatId && messageId) {
      await editTelegramMessage(chatId, messageId, updatedMsg, true);
      console.log("[TG-WEBHOOK] ✅ Telegram message edited successfully");
    } else {
      console.warn("[TG-WEBHOOK] ⚠️ No telegramChatId/messageId stored — cannot edit message");
    }

    // ─── Toast notification to admin ──────────────────────────────────────────
    const toastMsg =
      action === "complete"
        ? "✅ Order marked as Complete!"
        : "❌ Order marked as Cancelled!";
    await answerCallbackQuery(callbackQueryId, toastMsg);

    console.log(`[TG-WEBHOOK] 🎉 Done — action: ${action}, orderId: ${orderId}`);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[TG-WEBHOOK] ❌ Unexpected error:", error?.message || error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
