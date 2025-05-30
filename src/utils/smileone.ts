import axios from "axios";
import { generateSign } from "./hash";
import { type GameOrder } from "@/types/main";


export const gameOrderRequest = async (order: GameOrder) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const costIds = order?.costId?.split("&");
  console.log("costIds", costIds);
  // Prepare API URL based on the region
  const apiUrl =
    order.region === "brazil"
      ? "https://www.smile.one/smilecoin/api/createorder"
      : "https://www.smile.one/ph/smilecoin/api/createorder";

  console.log("apiUrl", apiUrl);

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

      console.log("params", params);

      const sign = generateSign(params, process.env.SMILE_ONE_API_KEY);

      try {
        const res = await axios.post(
          apiUrl,
          { ...params, sign },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        console.log("SmileOne Response", res.data);
        return { status: res.data.status, data: res.data }; // Success
      } catch (error: any) {
        console.error(
          `Failed to create order for cost ID ${cost}:`,
          error.message
        );
        return { status: 500, error: error.message, cost }; // Failure
      }
    })
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
  // Prepare API URL based on the region
  const apiUrl = "https://www.smile.one/smilecoin/api/querypoints";

  const params = {
    uid: process.env.SMILE_ONE_UID!,
    email: process.env.SMILE_ONE_EMAIL!,
    product: "mobilelegends",
    time: timestamp,
  };


  const sign = generateSign(params, process.env.SMILE_ONE_API_KEY);

  try {
    const res = await axios.post(
      apiUrl,
      { ...params, sign },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("SmileOne Response", res.data);
    return {
      status: res.data.status,
      data: { name: "SmileOne", ...res.data },
      error: null,
    }; // Success
  } catch (error: any) {
    console.error(`Failed to get balance:`, error.message);
    return { status: 500, error: error.message, data: null }; // Failure
  }
};
