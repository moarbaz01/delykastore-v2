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

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(id, validatedData, {
      new: true,
    }).populate("product");

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    updatedOrder.status = validatedData.status;
    await updatedOrder.save();

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
