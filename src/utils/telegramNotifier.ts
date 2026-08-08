import axios from "axios";
import { IOrder } from "@/models/order.model";

export const sendTelegramNotification = async (order: IOrder, productName: string, packageName?: string) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = process.env.TELEGRAM_CHAT_ID?.split(",").map(id => id.trim()).filter(Boolean);

    if (!botToken || !chatIds || chatIds.length === 0) {
      console.warn("Telegram bot token or chat ID is missing");
      return;
    }

    const { gameCredentials, amount, orderType, transactionId, user } = order;

    let message = `🔔 Order #${transactionId || order._id.toString().slice(-6)} ✅ paid\n\n`;
    message += `Service: ${productName}\n`;
    if (packageName) {
      message += `Package: ${packageName}\n`;
    }
    
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
    
    for (const id of chatIds) {
      try {
        await axios.post(url, {
          chat_id: id,
          text: message,
        });
      } catch (err) {
        console.error(`Failed to send Telegram notification to ${id}:`, err);
      }
    }
    
    console.log("Telegram notification sent successfully");
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
};

export const sendAdminLoginAlert = async (email: string, name: string, provider: string) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = process.env.TELEGRAM_CHAT_ID?.split(",").map(id => id.trim()).filter(Boolean);

    if (!botToken || !chatIds || chatIds.length === 0) {
      return;
    }

    const message = `🚨 *Admin Login Alert* 🚨\n\n👤 *Name:* ${name}\n✉️ *Email:* ${email}\n🔑 *Method:* ${provider}\n⏰ *Time:* ${new Date().toISOString()}`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    for (const id of chatIds) {
      try {
        await axios.post(url, {
          chat_id: id,
          text: message,
          parse_mode: "Markdown",
        });
      } catch (err) {
        console.error(`Failed to send Admin Login Alert to ${id}:`, err);
      }
    }
    
  } catch (error) {
    console.error("Failed to send Admin Login Alert:", error);
  }
};
