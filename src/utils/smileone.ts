import axios from "axios";
import { generateSign } from "./hash";
import { type GameOrder } from "@/types/main";
import { createOrderLog } from "./orderLogs";

export const gameOrderRequest = async (order: GameOrder) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const costIds = order?.costId?.split("&");
  // Prepare API URL based on the region
  const apiUrl =
    order.region === "brazil"
      ? "https://www.smile.one/smilecoin/api/createorder"
      : "https://www.smile.one/ph/smilecoin/api/createorder";

  const responses = await Promise.all(
    costIds.map(async (cost: string) => {
      const params = {
        uid: process.env.SMILE_ONE_UID!,
        email: process.env.SMILE_ONE_EMAIL!,
        userid: order.gameCredentials.userId,
        zoneid: order.gameCredentials.zoneId,
        product: order.gameCredentials.game,
        productid: cost.toString(),
        time: timestamp,
      };

      const sign = generateSign(params, process.env.SMILE_ONE_API_KEY);

      try {
        const res = await axios.post(
          apiUrl,
          { ...params, sign },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        );

        await createOrderLog({
          transactionId: order.transactionId,
          orderId: order._id,
          provider: "SmileOne",
          requestPayload: { apiUrl, params },
          responsePayload: res.data,
          status: res.data?.status === 200 ? "success" : "failed",
        });

        return { status: res.data.status, data: res.data }; // Success
      } catch (error: any) {
        await createOrderLog({
          transactionId: order.transactionId,
          orderId: order._id,
          provider: "SmileOne",
          requestPayload: { apiUrl, params },
          responsePayload: error.response?.data || error,
          status: "failed",
          errorMessage: error.response?.data?.message || error.message,
        });

        return { status: 500, error: error.message, cost }; // Failure
      }
    }),
  );

  // Find a successful response or handle failures
  const successResponse = responses.find((res) => res.status === 200);
  if (successResponse) {
    return successResponse;
  }

  // If all requests fail, return the first error
  return responses[0];
};

export const getSmileOneBalance = async () => {
  const timestamp = Math.floor(Date.now() / 1000);

  const params = {
    uid: process.env.SMILE_ONE_UID!,
    email: process.env.SMILE_ONE_EMAIL!,
    product: "mobilelegends",
    time: timestamp,
  };

  const sign = generateSign(params, process.env.SMILE_ONE_API_KEY);

  const formData = new URLSearchParams();
  Object.entries({ ...params, sign }).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });

  try {
    const phResponse = axios.post(
      "https://www.smile.one/ph/smilecoin/api/querypoints",
      formData,
    );

    const brResponse = axios.post(
      "https://www.smile.one/smilecoin/api/querypoints",
      formData,
    );

    const [ph, br] = await Promise.allSettled([phResponse, brResponse]);

    const phData = ph.status === "fulfilled" ? ph.value.data : null;
    const brData = br.status === "fulfilled" ? br.value.data : null;

    // Determine overall success if either succeeds
    const finalStatus = phData || brData ? 200 : 500;

    return {
      status: finalStatus,
      data: {
        name: "SmileOne",
        ph_points: phData?.smile_points || phData?.smile_point,
        br_points: brData?.smile_points || brData?.smile_point,
      },
      error: null,
    }; // Success
  } catch (error: any) {
    return { status: 500, error: error.message, data: null }; // Failure
  }
};

export const getGameList = async () => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const params = {
      uid: process.env.SMILE_ONE_UID!,
      email: process.env.SMILE_ONE_EMAIL!,
      product: "mobilelegends",
      time: timestamp,
    };

    const sign = generateSign(params, process.env.SMILE_ONE_API_KEY!);

    const formData = new URLSearchParams();
    Object.entries({ ...params, sign }).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    const phProducts = axios.post(
      "https://www.smile.one/ph/smilecoin/api/productlist",
      formData,
    );
    const brProducts = axios.post(
      "https://www.smile.one/smilecoin/api/productlist",
      formData,
    );

    const [phRes, brRes] = await Promise.allSettled([phProducts, brProducts]);

    const phData =
      phRes.status === "fulfilled" ? phRes.value.data.data.product : [];
    const brData =
      brRes.status === "fulfilled" ? brRes.value.data.data.product : [];

    // Flatten into a single array for easier frontend rendering
    // Return 200 if at least one request succeeded
    const finalStatus =
      phRes.status === "fulfilled" || brRes.status === "fulfilled" ? 200 : 500;

    return {
      status: finalStatus,
      data: {
        ph: phData,
        br: brData,
      },
      error: null,
    };
  } catch (error: any) {
    return { status: 500, error: error.message, data: null };
  }
};
