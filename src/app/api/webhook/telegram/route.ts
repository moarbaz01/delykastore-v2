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
    const body = await req.json();

    // Only handle callback_query (button taps)
    const callbackQuery = body?.callback_query;
    if (!callbackQuery) {
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

    if (!orderId || !["complete", "cancel"].includes(action)) {
      await answerCallbackQuery(callbackQueryId, "⚠️ Unknown action.");
      return NextResponse.json({ ok: true });
    }

    await dbConnect();

    const order = await Order.findById(orderId).populate("product");
    if (!order) {
      await answerCallbackQuery(callbackQueryId, "❌ Order not found.");
      return NextResponse.json({ ok: true });
    }

    // Prevent double-action if already processed
    if (order.status !== "pending") {
      await answerCallbackQuery(
        callbackQueryId,
        `⚠️ Order already marked as ${order.status}.`
      );
      return NextResponse.json({ ok: true });
    }

    // ─── Update DB status ─────────────────────────────────────────────────────
    const newStatus = action === "complete" ? "success" : "failed";
    order.status = newStatus;
    await order.save();

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

    if (chatId && messageId) {
      await editTelegramMessage(chatId, messageId, updatedMsg, true);
    }

    // ─── Toast notification to admin ──────────────────────────────────────────
    const toastMsg =
      action === "complete"
        ? "✅ Order marked as Complete!"
        : "❌ Order marked as Cancelled!";
    await answerCallbackQuery(callbackQueryId, toastMsg);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
