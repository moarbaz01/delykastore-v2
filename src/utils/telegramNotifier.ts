import axios from "axios";
import { IOrder } from "@/models/order.model";

export const sendTelegramNotification = async (order: IOrder, productName: string) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("Telegram bot token or chat ID is missing");
      return;
    }

    const { gameCredentials, amount, orderType, transactionId, user } = order;

    let message = `🔔 Order #${transactionId || order._id.toString().slice(-6)} ✅ paid\n\n`;
    message += `Service: ${productName}\n`;
    
    if (gameCredentials?.urlLink) {
      message += `Link: ${gameCredentials.urlLink}\n`;
    }
    if (gameCredentials?.userId) {
      message += `ID: ${gameCredentials.userId}\n`;
    }
    if (gameCredentials?.zoneId) {
      message += `Zone: ${gameCredentials.zoneId}\n`;
    }

    message += `Price: $${Number(amount).toFixed(3)}\n`;
    if (user) {
      message += `Buyer: ${user}\n`;
    }
    message += `Mode: ${orderType}\n`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });
    
    console.log("Telegram notification sent successfully");
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
};
