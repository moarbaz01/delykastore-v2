export const dynamic = "force-dynamic";
import { dbConnect } from "@/lib/database";
import { Gift } from "@/models/gift.model";
import { GiftTransaction } from "@/models/gift.transaction.model";
import { Order } from "@/models/order.model";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for validation
const giftTransactionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  zoneId: z.string().optional(),
  cost: z.string().min(1, "Cost is required"),
  productId: z.string().min(1, "Product ID is required"),
  status: z.string().min(1, "Status is required").optional(),
});

// **POST**: Create a new gift transaction
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Validate inputs
    const result = giftTransactionSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Validated Data
    const validatedData = result.data;

    // Got User Wagering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

    const userWagering = await Order.aggregate([
      {
        $match: {
          "gameCredentials.userId": validatedData.userId,
          status: "success",
          createdAt: {
            $gte: startOfMonth, // Start of current month
            $lte: endOfMonth, // End of current month
          },
        },
      },
      {
        $group: {
          _id: null,
          totalWagered: {
            $sum: {
              $toDouble: "$amount", // 🔥 convert string → number
            },
          },
        },
      },
    ]);

    if (userWagering.length === 0) {
      return NextResponse.json(
        { error: "User not topup yet" },
        { status: 404 },
      );
    }

    // Check if this gift has already been claimed (database-level protection)
    const existingTransaction = await GiftTransaction.findOne({
      userId: validatedData.userId,
      productId: validatedData.productId,
      cost: validatedData.cost,
      status: { $in: ["pending", "success"] },
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Gift already claimed or pending" },
        { status: 409 },
      );
    }

    // Get the gift details to check the level
    let gift: any;
    let cost: any;
    if (validatedData.cost) {
      gift = await Gift.findOne({
        productId: validatedData.productId,
      });

      if (!gift) {
        return NextResponse.json({ error: "Gift not found" }, { status: 404 });
      }

      cost = gift.wageringLevels.find((item) => {
        return item.costIds.includes(validatedData.cost);
      });

      if (!cost) {
        return NextResponse.json({ error: "Cost not found" }, { status: 404 });
      }

      // Check if user has already claimed this level
      const existingLevelTransaction = await GiftTransaction.findOne({
        userId: validatedData.userId,
        productId: validatedData.productId,
        level: cost.level,
        status: { $in: ["pending", "success"] },
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });

      if (existingLevelTransaction) {
        return NextResponse.json(
          { error: `Level ${cost.level} already claimed or pending` },
          { status: 409 },
        );
      }

      if (userWagering[0].totalWagered < cost.wagering) {
        return NextResponse.json(
          { error: "User not reach wagering level" },
          { status: 400 },
        );
      }
    }

    // Create gift transaction
    const giftTransaction = await GiftTransaction.create({
      userId: validatedData.userId,
      zoneId: validatedData.zoneId || "",
      cost: validatedData.cost,
      level: cost.level,
      wagering: cost.wagering,
      giftId: gift._id,
      productId: validatedData.productId,
      userWagering: userWagering[0].totalWagered,
      status: "pending",
    });

    if (!giftTransaction) {
      return NextResponse.json(
        { error: "Failed to create gift transaction" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Entry Created Successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create gift transaction" },
      { status: 400 },
    );
  }
}

// **GET**: Retrieve gift transactions
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    const giftId = searchParams.get("giftId");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    const query: any = {};

    // Build query based on parameters
    if (id) {
      query._id = id;
    }
    if (userId) {
      query.userId = userId;
    }
    if (giftId) {
      query.giftId = giftId;
    }
    if (status) {
      query.status = status;
    }

    // Pagination
    const limitNum = limit ? parseInt(limit) : 10;
    const pageNum = page ? parseInt(page) : 1;
    const skip = (pageNum - 1) * limitNum;

    let giftTransactions;

    if (id) {
      // Single transaction lookup
      giftTransactions = await GiftTransaction.findById(id)
        .populate("productId", "name image cost")
        .lean();

      if (!giftTransactions) {
        return NextResponse.json(
          { error: "Gift transaction not found" },
          { status: 404 },
        );
      }
    } else {
      // Multiple transactions with filtering and pagination
      giftTransactions = await GiftTransaction.find(query)
        .populate("productId", "name image cost")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Get total count for pagination
      const total = await GiftTransaction.countDocuments(query);

      // Process transactions to include cost details
      const processedTransactions = giftTransactions.map((transaction) => {
        const costDetails = transaction.productId?.cost?.find(
          (cost: any) => cost.id === transaction.cost,
        );
        return {
          ...transaction,
          costDetails: costDetails || null,
        };
      });

      return NextResponse.json(
        {
          transactions: processedTransactions,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        },
        { status: 200 },
      );
    }

    // Process single transaction to include cost details
    const costDetails = giftTransactions.productId?.cost?.find(
      (cost: any) => cost.id === giftTransactions.cost,
    );
    const processedTransaction = {
      ...giftTransactions,
      costDetails: costDetails || null,
    };

    return NextResponse.json(processedTransaction, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve gift transactions" },
      { status: 500 },
    );
  }
}

// **PUT**: Update a gift transaction by ID
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 },
      );
    }

    // Validate update data
    const result = giftTransactionSchema.partial().safeParse(updateData);
    if (!result.success) {
      const errors = result.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const validatedData = result.data;

    // Update gift transaction
    const updatedTransaction = await GiftTransaction.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true },
    ).populate("productId", "name image");

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: "Gift transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gift transaction" },
      { status: 400 },
    );
  }
}

// **DELETE**: Delete a gift transaction by ID
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 },
      );
    }

    const giftTransaction = await GiftTransaction.findByIdAndDelete(id);

    if (!giftTransaction) {
      return NextResponse.json(
        { error: "Gift transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Gift transaction deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete gift transaction" },
      { status: 500 },
    );
  }
}
