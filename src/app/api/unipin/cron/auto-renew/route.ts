import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const authResponse = await fetch(
      "https://api.apighor.com/unipin/kira/auth.php?renew",
      {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.NEXT_PUBLIC_GHOR_API_KEY!,
        },
        cache: "no-store",
      }
    );

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    console.log("Auth data:", authData);

    // Fixed this comparison (was assignment)
    if (authData.error === true) {
      return NextResponse.json(
        { error: "Failed to renew token", details: authData.msg },
        { status: 500 }
      );
    }

    // Store auth data in cookies for subsequent requests
    const authCookies = authData.data.cookies;
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    cookies().set("unipin_session", authCookies.unipin_session, cookieOptions);
    cookies().set("XSRF-TOKEN", authCookies["XSRF-TOKEN"], cookieOptions);
    cookies().set("region", authCookies.region || "PH", cookieOptions);

    console.log("auth cookies", authCookies);

    return NextResponse.json({
      success: true,
      message: "Token renewed successfully",
      pin: authData.data.pin, // Include the PIN if needed
    });
  } catch (error: any) {
    console.error("Token renewal error:", error);
    return NextResponse.json(
      {
        error: "Failed to renew token",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
