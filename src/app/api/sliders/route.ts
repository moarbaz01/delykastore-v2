import { dbConnect } from "@/lib/database";
import { Slider } from "@/models/slider.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const slider = await Slider.findById(id);
      if (!slider) {
        return NextResponse.json(
          { message: "Slider not found", success: false },
          { status: 404 }
        );
      }
      return NextResponse.json({
        message: "Slider fetched successfully",
        success: true,
        slider,
      });
    }

    const sliders = await Slider.find();
    return NextResponse.json({
      message: "Sliders fetched successfully",
      success: true,
      sliders,
    });
  } catch (error) {
    console.error("GET /api/slider error:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    // If the user is not authenticated, return Unauthorized
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, images } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Invalid request body", success: false },
        { status: 400 }
      );
    }

    // Validate request body
    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        {
          message: "Invalid request body: 'slides' is required",
          success: false,
        },
        { status: 400 }
      );
    }

    const slider = await Slider.create({ title, description, images });
    return NextResponse.json(
      {
        message: "Slider created successfully",
        success: true,
        slider,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/slider error:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

// Put
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    // If the user is not authenticated, return Unauthorized
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { title, description, images } = await req.json();
    // Validate request body

    const slider = await Slider.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          description,
          images,
        },
      },
      { new: true } // Return the updated document
    );

    if (!slider) {
      return NextResponse.json(
        { message: "Slider not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Slider updated successfully",
      success: true,
      slider,
    });
  } catch (error) {
    console.error("PUT /api/slider error:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
// Delete
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    // If the user is not authenticated, return Unauthorized
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    // Validate request body
    if (!id) {
      return NextResponse.json(
        { message: "Invalid request body: 'id' is required", success: false },
        { status: 400 }
      );
    }

    const slider = await Slider.findByIdAndDelete(id);

    if (!slider) {
      return NextResponse.json(
        { message: "Slider not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Slider deleted successfully",
      success: true,
      slider,
    });
  } catch (error) {
    console.error("DELETE /api/slider error:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
