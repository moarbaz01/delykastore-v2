import { axiosWithProxy } from "@/lib/axiosWithProxy";
import { type GameOrder } from "@/types/main";
import { sendEmail } from "./nodemailer";

export const GetTopUpGhorBalance = async () => {
  try {
    const res = await axiosWithProxy.post(
      "https://topupghorbd.com/wp-json/v1/user/balance",
      {
        path: "user/balance",
      } // Empty object as the request body (if required, update accordingly)
    );

    const data = res.data;
    console.log("BALANCE", data);
    return {
      error: false,
      data: { name: "Api Balance", ...data },
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      error: true,
      message: "Something went wrong",
    };
  }
};
export const GhorTopUp = async (order: GameOrder, productId: string) => {
  const costIds = order?.costId?.split("&");
  console.log("costIds", costIds);
  const game = order?.gameCredentials?.game;

  const responses = await Promise.all(
    costIds.map(async (cost: string) => {
      const uniqueId = new Date().getTime().toString();
      const params = {
        path: "order/create_order",
        data: [
          {
            product_id: productId,
            variation_id: cost,
            quantity: "1",
            addon_fields: {},
          },
        ],
        partnerOrderId: uniqueId,
      };

      if (game === "pubg") {
        params.data[0].addon_fields = {
          "Character ID": order.gameCredentials.userId,
        };
      } else if (game === "honorofkings") {
        params.data[0].addon_fields = {
          "Player ID": order.gameCredentials.userId,
        };
      } else if (game === "magicchess") {
        params.data[0].addon_fields = {
          "Player ID": order.gameCredentials.userId,
          "Server ID": order.gameCredentials.zoneId,
        };
      } else if (game === "mobilelegends") {
        params.data[0].addon_fields = {
          "User ID": order.gameCredentials.userId,
          "Server ID": order.gameCredentials.zoneId,
        };
      } else if (game === "bloodstrike") {
        params.data[0].addon_fields = {
          "User ID": order.gameCredentials.userId,
        };
      } else if (game === "genshinimpact") {
        params.data[0].addon_fields = {
          "User ID": order.gameCredentials.userId,
          Server: order.gameCredentials.zoneId,
        };
      } else {
        params.data[0].addon_fields = {
          "Player ID": order.gameCredentials.userId,
        };
      }

      // Logs Params
      console.log("params", params);

      try {
        const res = await axiosWithProxy.post(
          "https://topupghorbd.com/wp-json/v1/order/create_order",
          params // Empty object as the request body (if required, update accordingly)
        );

        const data = res.data;
        console.log("Top Up Ghor Response", data);
        if (data?.success === "false") {
          await sendEmail(
            "Kira Store",
            process.env.YOUR_EMAIL,
            "Failed to create order",
            `
            <pre>
            Failed to create order for cost ID ${cost} 
            Error : ${data?.message || "Order Failed"}
            Transaction ID: ${order?.transactionId}
            Game: ${game}
            Partner Order ID: ${uniqueId}
            </pre>
            `
          );
          return { status: 500, error: data.message, cost };
        }
        return { status: 200, data }; // Success
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

export const getProductList = async () => {
  try {
    const params = {
      path: "product/product_list",
      category_id: 283,
    };
    const res = await axiosWithProxy.post(
      "https://topupghorbd.com/wp-json/v1/product/product_list",
      params
    );

    const data = res.data;
    return {
      error: false,
      data: data,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      error: true,
      data: null,
      message: "Something went wrong",
    };
  }
};

export const getProductDetails = async (productId: string) => {
  try {
    const params = {
      path: "product/product_details",
      product_id: productId,
    };
    const res = await axiosWithProxy.post(
      "https://topupghorbd.com/wp-json/v1/product/product_detail",
      params
    );

    const data = res.data;
    console.log("Product Details", data);
    if (data.err_code && data.err_code === "403") {
      return {
        error: true,
        data: null,
        message: data?.err_message || "",
      };
    }
    return {
      error: false,
      data: data,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      error: true,
      message: "Something went wrong",
    };
  }
};

export const checkAccount = async ({
  game_path,
  userId,
  zoneId,
}: {
  game_path: string;
  userId: string;
  zoneId?: string;
}) => {
  try {
    if (!game_path || !userId) {
      return {
        error: true,
        message: "Missing game_path or userId",
      };
    }
    let url = `https://api.apighor.com/id-checker/${game_path}/${userId?.trim()}`;
    if (zoneId) {
      url = `${url}/${zoneId?.trim()}`;
    }

    console.log(url);

    const res = await axiosWithProxy.get(url, {
      headers: {
        "X-Api-Key": process.env.GHOR_API_KEY!,
      },
    });

    const data = res.data;
    console.log("checkAccount", data);
    if (data?.status === "success" && data?.msg === "id_found") {
      return {
        error: false,
        username: data?.data?.nickname,
        message: "Account is verified",
      };
    }
    return {
      error: true,
      username: null,
      message: data?.msg,
    };
  } catch (err) {
    console.error("Error:", err.message);
    return {
      error: true,
      username: null,
      message: "Something went wrong",
    };
  }
};
