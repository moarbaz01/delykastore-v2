import axios from "axios";
import { createOrderLog } from "./orderLogs";

export async function checkAluuAccount({
  game_path,
  userId,
  zoneId,
}: {
  game_path: string;
  userId: string;
  zoneId?: string;
}) {
  try {
    const apiKey = process.env.ALUU_API_KEY;
    if (!apiKey) {
      throw new Error("ALUU_API_KEY is missing in environment variables.");
    }

    const proxyHost = process.env.ALUU_PROXY_HOST;
    const proxyPort = process.env.ALUU_PROXY_PORT;
    const proxyUsername = process.env.ALUU_PROXY_USERNAME;
    const proxyPassword = process.env.ALUU_PROXY_PASSWORD;

    const proxyConfig =
      proxyHost && proxyPort
        ? {
            host: proxyHost,
            port: parseInt(proxyPort, 10),
            auth:
              proxyUsername && proxyPassword
                ? { username: proxyUsername, password: proxyPassword }
                : undefined,
            protocol: "http",
          }
        : undefined;

    let url = `https://aluu.in/api/check/game-check?code=${game_path}&characterId=${userId}`;
    if (zoneId) {
      url += `&server_code=${zoneId}`;
    }

    const response = await axios.get(url, {
      headers: {
        "x-api-key": apiKey,
      },
      proxy: proxyConfig,
    });

    const data = response.data;

    // Success: API returns player data directly
    if (
      data &&
      (data.valid === "valid" ||
        data.name ||
        data.nickname ||
        data.fullname ||
        data.status === "success")
    ) {
      const playerName =
        data.name || data.nickname || data.fullname || "Player";

      // "na" means the API couldn't find the player — treat as invalid ID
      if (playerName.toLowerCase() === "na") {
        return { error: true, message: "Invalid Player ID" };
      }

      return { name: playerName };
    }

    return {
      error: true,
      message: data?.message || "Invalid Player ID or Server",
    };
  } catch (error: any) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle known Aluu API error codes from the docs
    if (status === 401) {
      console.error("Aluu: Unauthorized - Invalid or missing API key");
      return { error: true, message: "API authentication failed" };
    }

    if (status === 403) {
      // Free daily limit reached
      if (data?.code === "FREE_DAILY_LIMIT_REACHED") {
        console.error(
          `Aluu: Daily limit reached. Resets at ${data?.resets_at} (${data?.reset_timezone})`,
        );
        return {
          error: true,
          message:
            "Daily verification limit reached. Please try again tomorrow.",
        };
      }
      return { error: true, message: data?.message || "Access forbidden" };
    }

    if (status === 429) {
      console.error("Aluu: Rate limited");
      return {
        error: true,
        message: "Too many requests. Please wait a moment and try again.",
      };
    }

    console.error("Aluu API Error:", data || error.message);
    return {
      error: true,
      message: data?.message || "Failed to verify ID",
    };
  }
}

export function getAluuGameCode(game: string): string | null {
  if (game === "pubg") return "pubgm";
  if (game === "freefire") return "freefire_br";
  if (game === "honorofkings") return "hok";
  if (game === "mobilelegends") return "mlbb";
  if (game === "genshinimpact") return "genshin";
  if (game === "bloodstrike") return "bloodstrike";
  return null;
}

export async function processAluuOrder(order: any) {
  let payload: any = null;
  try {
    const apiKey = process.env.ALUU_API_KEY;
    if (!apiKey) {
      throw new Error("ALUU_API_KEY is missing in environment variables.");
    }

    const gameCode = getAluuGameCode(order.gameCredentials?.game || "");
    if (!gameCode) {
      throw new Error(`Unsupported game for Aluu API: ${order.gameCredentials?.game}`);
    }

    const proxyHost = process.env.ALUU_PROXY_HOST;
    const proxyPort = process.env.ALUU_PROXY_PORT;
    const proxyUsername = process.env.ALUU_PROXY_USERNAME;
    const proxyPassword = process.env.ALUU_PROXY_PASSWORD;

    const proxyConfig =
      proxyHost && proxyPort
        ? {
            host: proxyHost,
            port: parseInt(proxyPort, 10),
            auth:
              proxyUsername && proxyPassword
                ? { username: proxyUsername, password: proxyPassword }
                : undefined,
            protocol: "http",
          }
        : undefined;

    // We use the base URL for the webhook callback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://delykastore.com";

    payload = {
      game: gameCode,
      denom: order.costId,
      userid: order.gameCredentials?.userId || "",
      serverid: order.gameCredentials?.zoneId || "",
      charname: "",
      partner_webhook_url: `${baseUrl}/api/webhook/partner`,
      partner_orderid: order.transactionId,
    };

    const response = await axios.post("https://aluu.in/api/v.1/create", payload, {
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      proxy: proxyConfig,
    });

    const data = response.data;
    if (data.success) {
      await createOrderLog({
        transactionId: order.transactionId,
        orderId: order._id?.toString(),
        provider: "Aluu API",
        requestPayload: payload,
        responsePayload: data,
        status: "success",
      });
      return { status: 200, data: data.data };
    } else {
      await createOrderLog({
        transactionId: order.transactionId,
        orderId: order._id?.toString(),
        provider: "Aluu API",
        requestPayload: payload,
        responsePayload: data,
        status: "failed",
        errorMessage: data.message || "Failed to create order on Aluu",
      });
      return { status: 400, error: data.message || "Failed to create order on Aluu" };
    }
  } catch (error: any) {
    console.error("Aluu Order Creation Error:", error.response?.data || error.message);
    
    await createOrderLog({
      transactionId: order.transactionId,
      orderId: order._id?.toString(),
      provider: "Aluu API",
      requestPayload: payload || { error: "Failed before payload creation" },
      responsePayload: error.response?.data || { message: error.message },
      status: "failed",
      errorMessage: error.response?.data?.message || error.message || "Failed to communicate with Aluu API",
    });

    return {
      status: error.response?.status || 500,
      error: error.response?.data?.message || "Failed to communicate with Aluu API",
    };
  }
}
