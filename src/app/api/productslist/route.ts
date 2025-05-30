import { dbConnect } from "@/lib/database";
import { generateSign } from "@/utils/hash";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const timestamp = Math.floor(Date.now() / 1000);

    const params = {
      uid: process.env.SMILE_ONE_UID!,
      email: process.env.SMILE_ONE_EMAIL!,
      product: "mobilelegends",
      time: timestamp,
    };

    const sign = generateSign(params, process.env.SMILE_ONE_API_KEY!);
    const res = await axios.post(
      "https://www.smile.one/smilecoin/api/productlist",
      { ...params, sign },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return NextResponse.json({
      data: res.data.data.product,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
