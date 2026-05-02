import { getSmileOneBalance } from "@/utils/smileone";
import { GetTopUpGhorBalance } from "@/utils/topupghor";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let smileOneBalance = null;
    let ghorBalance = null;

    try {
      smileOneBalance = await getSmileOneBalance();
      console.log("smileOneBalance", smileOneBalance);
      if (!smileOneBalance?.data) {
        smileOneBalance = {
          data: { name: "SmileOne (Error)", br_points: 0, ph_points: 0 },
        };
      }
    } catch (error) {
      console.error("Error fetching SmileOne balance:", error);
      smileOneBalance = {
        data: { name: "SmileOne (Error)", br_points: 0, ph_points: 0 },
      };
    }

    try {
      ghorBalance = await GetTopUpGhorBalance();

      // Handle known topupghor error formats like ip_not_whitelisted
      if (ghorBalance && ghorBalance.code === "ip_not_whitelisted") {
        console.warn("TopUpGhor IP not whitelisted:", ghorBalance);
        ghorBalance = { data: { name: "TopUpGhor (IP Error)", balance: 0 } };
      } else if (ghorBalance && ghorBalance.status === false) {
        ghorBalance = { data: { name: "TopUpGhor (Error)", balance: 0 } };
      } else if (!ghorBalance?.data) {
        ghorBalance = { data: { name: "TopUpGhor (Error)", balance: 0 } };
      }
    } catch (error) {
      console.error("Error fetching TopUpGhor balance:", error);
      ghorBalance = { data: { name: "TopUpGhor (Error)", balance: 0 } };
    }

    return NextResponse.json({
      smileOneBalance,
      ghorBalance,
    });
  } catch (error) {
    console.error("Critical error in balance API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
