import { NextResponse } from "next/server";
import z from "zod";
import axios from "axios";
import { generateSign } from "@/utils/hash";
import { dbConnect } from "@/lib/database";
import { checkRateLimit, getCachedResult, setCachedResult } from "@/utils/apiCache";

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
    
    // 1. Rate Limiting: 10 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip, 10, 60)) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    // 2. Caching: Check if we recently fetched this exact ID
    const cacheKey = `smileone_${product}_${userId}_${zoneId}`;
    const cachedData = getCachedResult(cacheKey);
    if (cachedData) {
      console.log("Serving Smile.One check from memory cache:", cacheKey);
      return NextResponse.json(cachedData, { status: 200 });
    }

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

    // 3. Save successful result to cache for 10 minutes
    if (res.data && res.data.status === 200) {
      setCachedResult(cacheKey, res.data, 600); // 10 minutes
    }

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
}
