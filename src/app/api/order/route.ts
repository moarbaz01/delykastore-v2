import { dbConnect } from "@/lib/database";
import { Order } from "@/models/order.model";
import { gameOrderRequest } from "@/utils/smileone";
import { GhorTopUp } from "@/utils/topupghor";
import { freeFireTopup, ghorApiTopup } from "@/utils/unipin";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for validation
const orderSchema = z.object({
  user: z.string().min(1, "User is required"),
  email: z.string().email("Invalid email format"),
  costId: z.string().min(1, "Cost ID is required"),
  orderDetails: z.string(), // Accepts any object
  orderType: z.string(),
  region: z.string().optional(),
  gameCredentials: z
    .object({
      userId: z.string().optional(),
      zoneId: z.string().optional(),
      game: z.string().optional(),
    })
    .optional(),
  paymentId: z.string().nullable().optional(),
  product: z.string().optional(), // Product ID reference
  amount: z.string().min(1, "Amount is required"),
  status: z.enum(["pending", "success", "failed"]).optional(),
});

// **GET**: Retrieve orders
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let orders;
    if (id) {
      // Fetch a single order by ID
      orders = await Order.findById(id).populate("product");
      if (!orders) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    } else {
      // Fetch all orders
      orders = await Order.find().populate("product");
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve orders" },
      { status: 500 }
    );
  }
}

// **PUT**: Update an order by ID
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    if (token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const json = await req.json();

    console.log("json", json);
    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Validate the input (partial update allowed)
    const validatedData = orderSchema.partial().parse(json);
    console.log("validatedData", validatedData);
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(id, validatedData, {
      new: true,
    }).populate("product");

    console.log("updated order", updatedOrder);

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (validatedData?.status === "success") {
      let orderResponse;
      const game = updatedOrder?.gameCredentials?.game;

      // If game is mobile legends
      if (game === "mobilelegends") {
        if (updatedOrder.region === "brazil") {
          if (updatedOrder?.product?.apiName === "TopUp Ghor Api") {
            orderResponse = await GhorTopUp(updatedOrder, "86289");
          } else {
            orderResponse = await gameOrderRequest(updatedOrder);
          }
        } else if (updatedOrder.region === "philippines") {
          if (updatedOrder?.product?.apiName === "TopUp Ghor Api") {
            orderResponse = await GhorTopUp(updatedOrder, "86286");
          } else {
            orderResponse = await ghorApiTopup(updatedOrder);
          }
        } else if (updatedOrder.region === "indonesia") {
          orderResponse = await GhorTopUp(updatedOrder, "39365");
        } else if (updatedOrder.region === "malaysia") {
          orderResponse = await GhorTopUp(updatedOrder, "39347");
        }
      } else if (game === "freefire") {
        // If game is free fire
        if (updatedOrder?.product?.apiName === "TopUp Ghor Api") {
          orderResponse = await GhorTopUp(updatedOrder, "582");
        } else {
          orderResponse = await freeFireTopup(updatedOrder);
        }
      } else if (game === "pubg") {
        // If game is free fire
        orderResponse = await GhorTopUp(updatedOrder, "654");
      } else if (game === "honorofkings") {
        // If game is free fire
        orderResponse = await GhorTopUp(updatedOrder, "67607");
      } else if (game === "magicchess") {
        // If game is free fire
        orderResponse = await GhorTopUp(updatedOrder, "232990");
      } else if (game === "bloodstrike") {
        orderResponse = await GhorTopUp(updatedOrder, "213941");
      } else if (game === "genshinimpact") {
        orderResponse = await GhorTopUp(updatedOrder, "33221");
      }
      console.log("Order Response", orderResponse);
      if (orderResponse.status !== 200) {
        updatedOrder.status = "failed";
        await updatedOrder.save();

        return NextResponse.json(
          { message: "Order Failed", error: orderResponse?.error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 400 }
    );
  }
}

// **DELETE**: Delete an order by ID
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is not authenticated, return Unauthorized
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }
    if (token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Delete the order
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
