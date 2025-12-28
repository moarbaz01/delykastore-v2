import axios from "axios";
import { NextResponse } from "next/server";

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
  } catch (error) {
    console.log("error bangla", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
