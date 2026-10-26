import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// ─── Test Telegram Notification with Inline Buttons ──────────────────────────
// GET /api/test-telegram → sends a fake order notification
export async function GET(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = process.env.TELEGRAM_CHAT_ID?.split(",").map((id) => id.trim()).filter(Boolean);

    if (!botToken || !chatIds || chatIds.length === 0) {
      console.error("[TEST-TELEGRAM] ❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
      return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }

    const fakeOrderId = "TEST" + Date.now().toString().slice(-8);

    const message =
      `🧪 <b>[TEST ORDER] New Order #${fakeOrderId}</b>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 <b>Service:</b> TikTok Likes\n` +
      `🎁 <b>Package:</b> 1000 Likes — $1.50\n` +
      `🔗 <b>Link:</b> https://tiktok.com/@testuser\n` +
      `🪪 <b>User ID:</b> 123456789\n` +
      `💰 <b>Amount:</b> $1.50\n` +
      `👤 <b>Buyer:</b> TestUser\n` +
      `⚙️ <b>Mode:</b> digital-service\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🆔 <b>Order ID:</b> <code>${fakeOrderId}</code>\n` +
      `⏳ <b>Status:</b> Pending\n\n` +
      `<i>⚠️ Yeh ek TEST notification hai — buttons kaam nahi karenge (fake orderId)</i>`;

    const inline_keyboard = [
      [
        { text: "✅ Complete", callback_data: `complete:${fakeOrderId}` },
        { text: "❌ Cancel",   callback_data: `cancel:${fakeOrderId}` },
      ],
    ];

    const results: any[] = [];

    for (const chatId of chatIds) {
      console.log(`[TEST-TELEGRAM] 📤 Sending test notification to chat: ${chatId}`);
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
        console.log(`[TEST-TELEGRAM] ✅ Sent to ${chatId} — messageId: ${res.data?.result?.message_id}`);
        results.push({ chatId, success: true, messageId: res.data?.result?.message_id });
      } catch (err: any) {
        console.error(`[TEST-TELEGRAM] ❌ Failed to send to ${chatId}:`, err?.response?.data || err.message);
        results.push({ chatId, success: false, error: err?.response?.data || err.message });
      }
    }

    return NextResponse.json({
      message: "Test notification sent",
      fakeOrderId,
      results,
    });
  } catch (error: any) {
    console.error("[TEST-TELEGRAM] ❌ Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
