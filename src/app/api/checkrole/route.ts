import { NextResponse } from "next/server";
import z from "zod";
import axios from "axios";
import { generateSign } from "@/utils/hash";
import { dbConnect } from "@/lib/database";

const schema = z.object({
  zoneId: z.string(),
  userId: z.string(),
  product: z.string(),
  productId: z.string(),
});
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.errors },
        { status: 400 }
      );
    }

    const { zoneId, userId, product, productId } = result.data;
    console.log(zoneId, userId);
    const params = {
      uid: process.env.SMILE_ONE_UID!,
      email: process.env.SMILE_ONE_EMAIL!,
      userid: userId,
      zoneid: zoneId,
      product: product,
      productid: productId,
      time: Math.floor(Date.now() / 1000),
    };

    console.log("params", params);
    const sign = generateSign(params, process.env.SMILE_ONE_API_KEY);
    console.log(params, sign);
    const res = await axios.post(
      `${process.env.SMILE_ONE_API_URL!}/getrole`,
      {
        ...params,
        sign,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log(res.data);

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
}
