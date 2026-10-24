import axios from "axios";
import { IOrder } from "@/models/order.model";

interface TelegramSendResult {
  messageId: number;
  chatId: string;
}

export const sendTelegramNotification = async (
  order: IOrder,
  productName: string,
  packageName?: string
): Promise<TelegramSendResult | null> => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = process.env.TELEGRAM_CHAT_ID?.split(",").map((id) => id.trim()).filter(Boolean);

    if (!botToken || !chatIds || chatIds.length === 0) {
      console.warn("Telegram bot token or chat ID is missing");
      return null;
    }

    const { gameCredentials, amount, orderType, transactionId, user } = order;
    const orderId = order._id.toString();
    const shortId = transactionId || orderId.slice(-6);

    // ─── Build message text ───────────────────────────────────────────────────
    let message = `🆕 <b>New Order #${shortId}</b>\n`;
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `📦 <b>Service:</b> ${productName}\n`;
    if (packageName) message += `🎁 <b>Package:</b> ${packageName}\n`;
    if (gameCredentials?.urlLink) message += `🔗 <b>Link:</b> ${gameCredentials.urlLink}\n`;
    if (gameCredentials?.userId) message += `🪪 <b>User ID:</b> ${gameCredentials.userId}\n`;
    if (gameCredentials?.zoneId) message += `🌐 <b>Zone ID:</b> ${gameCredentials.zoneId}\n`;
    message += `💰 <b>Amount:</b> $${Number(amount).toFixed(2)}\n`;
    if (user) message += `👤 <b>Buyer:</b> ${user}\n`;
    message += `⚙️ <b>Mode:</b> ${orderType}\n`;
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `🆔 <b>Order ID:</b> <code>${orderId}</code>\n`;
    message += `⏳ <b>Status:</b> Pending`;

    // ─── Inline keyboard buttons ──────────────────────────────────────────────
    const inline_keyboard = [
      [
        {
          text: "✅ Complete",
          callback_data: `complete:${orderId}`,
        },
        {
          text: "❌ Cancel",
          callback_data: `cancel:${orderId}`,
        },
      ],
    ];

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    let firstResult: TelegramSendResult | null = null;

    for (const id of chatIds) {
      try {
        const res = await axios.post(url, {
          chat_id: id,
          text: message,
          parse_mode: "HTML",
          reply_markup: { inline_keyboard },
        });

        // Save first chat's messageId for editing later
        if (!firstResult && res.data?.result?.message_id) {
          firstResult = {
            messageId: res.data.result.message_id,
            chatId: id,
          };
        }
      } catch (err) {
        console.error(`Failed to send Telegram notification to ${id}:`, err);
      }
    }

    console.log("✅ Telegram notification sent:", firstResult);
    return firstResult;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return null;
  }
};

// ─── Edit existing Telegram message (e.g., after Complete/Cancel) ─────────────
export const editTelegramMessage = async (
  chatId: string,
  messageId: number,
  newText: string,
  removeButtons = true
) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return;

    await axios.post(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      chat_id: chatId,
      message_id: messageId,
      text: newText,
      parse_mode: "HTML",
      ...(removeButtons ? { reply_markup: { inline_keyboard: [] } } : {}),
    });
  } catch (err) {
    console.error("Failed to edit Telegram message:", err);
  }
};


