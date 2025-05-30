import axios from "axios";
import { sendEmail } from "./nodemailer";
import { type GameOrder } from "@/types/main";

export const ghorApiTopup = async (order: GameOrder) => {
  // Extract Costids if array
  const costIds = order?.costId?.split("&");
  console.log("costIds", costIds);
  const responses = await Promise.all(
    costIds.map(async (cost: string) => {
      try {
        const res = await axios.post(
          "https://api.apighor.com/unipin/kira/top-up",
          {
            player_id: order?.gameCredentials?.userId,
            zone_id: order?.gameCredentials?.zoneId,
            product_id: cost.toString(),
            region: "PH",
            game: "mobile-legends",
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": process.env.GHOR_API_KEY!,
            },
          }
        );

        const data = await res.data;

        return { status: 200, data, error: false };
      } catch (error) {
        console.error(`Failed to topup:`, error.message);
        return { status: 500, error: error?.message, data: null }; // Failure
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

export const freeFireTopup = async (order: GameOrder) => {
  // Extract Costids if array
  const costIds = order?.costId?.split("&");
  console.log("costIds", costIds);
  const responses = await Promise.all(
    costIds.map(async (cost: string) => {
      try {
        const res = await axios.post(
          "https://api.apighor.com/garena/my/kira/top-up",
          {
            player_id: order?.gameCredentials?.userId,
            product_id: parseInt(cost),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": process.env.GHOR_API_KEY!,
            },
          }
        );

        const data = await res.data;

        console.log("free_fire_topup_data", data);
        if (data?.error) {
          await sendEmail(
            "Kira Store",
            process.env.YOUR_EMAIL,
            "Failed to create order",
            `
<pre>
Failed to create order for cost ID ${cost} 
Error : ${data?.msg}
Transaction ID: ${order?.transactionId}
User Id : ${order?.gameCredentials?.userId}
Game: ${order?.gameCredentials?.game}
</pre>
`
          );
          return { status: 500, error: data?.msg, data: null };
        }
        return { status: 200, data, error: false };
      } catch (error) {
        console.error(`Failed to topup free fire:`, error?.message);
        return { status: 500, error: error?.message, data: null }; // Failure
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
