import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import axios from "axios";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Test Telegram Notification with Working Inline Buttons ──────────────────
// GET /api/test-telegram → creates a real pending order + sends telegram notification
export async function GET(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = process.env.TELEGRAM_CHAT_ID?.split(",").map((id) => id.trim()).filter(Boolean);

    if (!botToken || !chatIds || chatIds.length === 0) {
      console.error("[TEST-TELEGRAM] ❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
      return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }

    // ─── Create a real pending order in DB ────────────────────────────────────
    await dbConnect();
    console.log("[TEST-TELEGRAM] 📝 Creating test order in DB...");

    const testOrder = await Order.create({
      costId: "test-cost-id",
      orderDetails: "TEST ORDER — created via /api/test-telegram",
      gameCredentials: {
        userId: "123456789",
        urlLink: "https://tiktok.com/@testuser",
      },
      orderType: "digital-service",
      amount: "1.50",
      status: "pending",
      isCouponApplied: false,
    });

    const orderId = testOrder._id.toString();
    console.log(`[TEST-TELEGRAM] ✅ Test order created — ID: ${orderId}`);

    // ─── Build notification message ───────────────────────────────────────────
    const message =
      `🧪 <b>[TEST ORDER] New Order #${orderId.slice(-6)}</b>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 <b>Service:</b> TikTok Likes\n` +
      `🎁 <b>Package:</b> 1000 Likes — $1.50\n` +
      `🔗 <b>Link:</b> https://tiktok.com/@testuser\n` +
      `🪪 <b>User ID:</b> 123456789\n` +
      `💰 <b>Amount:</b> $1.50\n` +
      `👤 <b>Buyer:</b> TestUser\n` +
      `⚙️ <b>Mode:</b> digital-service\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🆔 <b>Order ID:</b> <code>${orderId}</code>\n` +
      `⏳ <b>Status:</b> Pending`;

    const inline_keyboard = [
      [
        { text: "✅ Complete", callback_data: `complete:${orderId}` },
        { text: "❌ Cancel",   callback_data: `cancel:${orderId}` },
      ],
    ];

    // ─── Send Telegram notification ───────────────────────────────────────────
    const results: any[] = [];
    let savedMessageId: number | null = null;
    let savedChatId: string | null = null;

    for (const chatId of chatIds) {
      console.log(`[TEST-TELEGRAM] 📤 Sending to chat: ${chatId}`);
      try {
        const res = await axios.post(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard },
          }
        );
        const msgId = res.data?.result?.message_id;
        console.log(`[TEST-TELEGRAM] ✅ Sent — messageId: ${msgId}`);
        results.push({ chatId, success: true, messageId: msgId });

        if (!savedMessageId && msgId) {
          savedMessageId = msgId;
          savedChatId = chatId;
        }
      } catch (err: any) {
        console.error(`[TEST-TELEGRAM] ❌ Failed for ${chatId}:`, err?.response?.data || err.message);
        results.push({ chatId, success: false, error: err?.response?.data || err.message });
      }
    }

    // ─── Save messageId back to order ─────────────────────────────────────────
    if (savedMessageId && savedChatId) {
      testOrder.telegramMessageId = savedMessageId;
      testOrder.telegramChatId = savedChatId;
      await testOrder.save();
      console.log(`[TEST-TELEGRAM] 💾 Saved messageId: ${savedMessageId} to order`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "✅ Test order created + Telegram notification sent. Buttons will work!",
        orderId,
        telegramMessageId: savedMessageId,
        results,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("[TEST-TELEGRAM] ❌ Unexpected error:", error);
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
