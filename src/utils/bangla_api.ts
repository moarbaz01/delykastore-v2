import axios from "axios";
import { NextResponse } from "next/server";
import { createOrderLog } from "./orderLogs";

interface Params {
  playerid: string;
  pacakge: string;
  orderid: string;
}

export const makePurchase = async ({ playerid, pacakge, orderid }: Params) => {
  try {
    if (!playerid || !pacakge || !orderid) {
      return { message: "Invalid request", status: 400 };
    }
    const payload = {
      playerid,
      pacakge,
      code: "slshell",
      orderid,
      url: `${process.env.NEXT_PUBLIC_API_URL}/webhook/bangla`,
      username: process.env.BANGLA_USERNAME,
      password: process.env.BANGLA_PASSWORD,
      autocode: process.env.BANGLA_AUTOCODE,
    };

    console.log("payload bangla", payload);

    const res = await axios.post(process.env.BANGLA_PURCHASE_URL, payload);
    console.log("response bangla", res.status);

    await createOrderLog({
      transactionId: orderid,
      provider: "Bangla Api",
      requestPayload: payload,
      responsePayload: res.data,
      status: res.status === 200 ? "success" : "failed",
    });

    if (res.status === 200) {
      return {
        status: 200,
        data: res.data,
      };
    } else {
      return {
        status: 400,
        error: "Purchase Failed",
      };
    }
  } catch (error: any) {
    console.log("error bangla", error);

    const payload = {
      playerid,
      pacakge,
      code: "slshell",
      orderid,
      url: `${process.env.NEXT_PUBLIC_API_URL}/webhook/bangla`,
      username: process.env.BANGLA_USERNAME,
      password: process.env.BANGLA_PASSWORD,
      autocode: process.env.BANGLA_AUTOCODE,
    };

    await createOrderLog({
      transactionId: orderid,
      provider: "Bangla Api",
      requestPayload: payload,
      responsePayload: error.response?.data || error,
      status: "failed",
      errorMessage: error.response?.data?.message || error.message,
    });

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
