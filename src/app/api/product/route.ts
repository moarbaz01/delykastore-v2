export const dynamic = "force-dynamic";
import { dbConnect } from "@/lib/database";
import { Gift } from "@/models/gift.model";
import { Product } from "@/models/product.model";
import { cloudinaryDelete, cloudinaryUpload } from "@/utils/cloudinary";
import { encryptData } from "@/utils/encryption";
import { extractPublicId } from "@/utils/getPublicId";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for validation
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  region: z.string().optional(),
  apiName: z.string().optional(),
  cost: z.array(
    z.object({
      id: z.string(),
      price: z.string(),
      amount: z.string(),
      category: z.string().optional(),
      note: z.string().optional(),
      image: z.any().optional(),
    }),
  ),
  slides: z.array(z.string()).optional(),
  banner: z.any().optional(),
  game: z.string(),
  isApi: z.boolean().optional(),
  stock: z.boolean().optional(),
  spinActive: z.boolean().optional(),
  spinCostIds: z.array(z.string()).optional(),
  image: z.any(),
});

// Helper function to upload files to Cloudinary
async function uploadFiles(
  files: (File | string)[],
  folder: string,
): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    if (typeof file === "string") {
      return file; // Already a URL, return as is
    }
    const { url } = await cloudinaryUpload(file, folder);
    return url;
  });
  return Promise.all(uploadPromises);
}

// **POST**: Create a new product
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const rawData: Record<string, any> = {};

    // Parse FormData
    formData.forEach((value, key) => {
      if (key === "cost") {
        rawData[key] = JSON.parse(value.toString());
      } else if (key === "slides") {
        rawData[key] = JSON.parse(value.toString());
      } else if (key === "spinCostIds") {
        rawData[key] = JSON.parse(value.toString());
      } else if (value instanceof File) {
        rawData[key] = value;
      } else if (key === "isApi" || key === "stock" || key === "spinActive") {
        rawData[key] = value === "true";
      } else {
        rawData[key] = value;
      }
    });

    // Validate inputs
    const result = productSchema.safeParse(rawData);
    if (!result.success) {
      const errors = result.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }
    const validatedData = result.data;

    // Upload all images to Cloudinary
    const [imageUrl, bannerUrl, slidesUrls, costImages] = await Promise.all([
      validatedData.image instanceof File
        ? cloudinaryUpload(validatedData.image, "/products")
        : Promise.resolve({ url: validatedData.image }),
      validatedData.banner instanceof File
        ? cloudinaryUpload(validatedData.banner, "/banners")
        : Promise.resolve({ url: validatedData.banner || "" }),
      validatedData.slides && validatedData.slides.length > 0
        ? uploadFiles(validatedData.slides, "/slides")
        : Promise.resolve([]),
      Promise.all(
        validatedData.cost.map(async (costItem) => {
          if (costItem.image instanceof File) {
            const { url } = await cloudinaryUpload(
              costItem.image,
              "/costImages",
            );
            return { ...costItem, image: url };
          }
          return costItem;
        }),
      ),
    ]);

    // Prepare product data for database
    const productData = {
      ...validatedData,
      image: imageUrl.url,
      banner: bannerUrl.url,
      slides: slidesUrls,
      cost: costImages,
    };

    // Save product to the database
    const product = await Product.create(productData);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 400 },
    );
  }
}

// **GET**: Retrieve products
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const grouped = searchParams.get("grouped");

    let products;
    if (id) {
      products = await Product.findById(id).lean();
      if (!products) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      // If grouped=true, process costs on server
      if (grouped === "true" && products.cost) {
        const categories = [
          ...new Set(
            products.cost.map((item: any) => item.category).filter(Boolean),
          ),
        ];
        const groupedCost = categories.map((category) => ({
          category,
          items: products.cost
            .filter((item: any) => item.category === category)
            .sort(
              (a: any, b: any) => parseFloat(a.price) - parseFloat(b.price),
            ),
        }));

        const gift = (await Gift.findOne({
          productId: id,
          isActive: true,
        }).lean()) as any;

        let product;

        if (gift) {
          const newWageringLevels = gift.wageringLevels.map((level) => {
            const cost = products.cost.filter((cost: any) =>
              level.costIds.includes(cost.id),
            );
            return {
              ...level,
              cost,
            };
          });

          // Create a new object with costs included in the expected format
          const giftWithCosts = {
            ...gift,
            wagering: newWageringLevels, // Keep wagering for backward compatibility
            costs: newWageringLevels, // This matches what GiftModal expects
          };

          product = encryptData({
            ...products,
            groupedCost,
            categories,
            gift: giftWithCosts,
          });
        } else {
          product = encryptData({
            ...products,
            groupedCost,
            categories,
            gift: null,
          });
        }

        return NextResponse.json({ product }, { status: 200 });
      }
    } else {
      products = await Product.find({ isDeleted: false }).lean();
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve products" },
      { status: 500 },
    );
  }
}

// **PUT**: Update a product by ID
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id")?.toString();

    console.log(formData);
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const rawData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key === "cost") {
        rawData[key] = JSON.parse(value.toString());
      } else if (key === "slides") {
        rawData[key] = JSON.parse(value.toString());
      } else if (key === "spinCostIds") {
        rawData[key] = JSON.parse(value.toString());
      } else if (value instanceof File) {
        rawData[key] = value;
      } else if (key === "isApi" || key === "stock" || key === "spinActive") {
        rawData[key] = value === "true";
      } else {
        rawData[key] = value;
      }
    });

    // Validate inputs
    const result = productSchema.safeParse(rawData);
    if (!result.success) {
      const errors = result.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }
    const validatedData = result.data;
    console.log("validated data", validatedData);

    // Get existing product to handle image updates
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Upload new images and keep existing ones
    const [imageUrl, bannerUrl, slidesUrls, costImages] = await Promise.all([
      validatedData.image instanceof File
        ? cloudinaryUpload(validatedData.image, "/products")
        : Promise.resolve({
            url: validatedData.image || existingProduct.image,
          }),
      validatedData.banner instanceof File
        ? cloudinaryUpload(validatedData.banner, "/banners")
        : Promise.resolve({
            url: validatedData.banner || existingProduct.banner,
          }),
      validatedData.slides && validatedData.slides.length > 0
        ? uploadFiles(validatedData.slides, "/slides")
        : Promise.resolve(existingProduct.slides || []),
      Promise.all(
        validatedData.cost.map(async (costItem, index) => {
          if (costItem.image instanceof File) {
            const { url } = await cloudinaryUpload(
              costItem.image,
              "/costImages",
            );
            return { ...costItem, image: url };
          }
          // Keep existing image if not provided
          const existingCostItem = existingProduct.cost?.[index];
          return {
            ...costItem,
            image: costItem.image || existingCostItem?.image || null,
          };
        }),
      ),
    ]);

    // Prepare update data
    const updateData = {
      ...validatedData,
      image: imageUrl.url,
      banner: bannerUrl.url,
      slides: slidesUrls,
      cost: costImages,
    };

    // Handle image deletions
    if (validatedData.image instanceof File && existingProduct.image) {
      const publicId = extractPublicId(existingProduct.image);
      if (publicId) {
        await cloudinaryDelete(publicId);
      }
    }

    if (validatedData.banner instanceof File && existingProduct.banner) {
      const publicId = extractPublicId(existingProduct.banner);
      if (publicId) {
        await cloudinaryDelete(publicId);
      }
    }

    // Update product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 400 },
    );
  }
}

// **DELETE**: Soft delete a product by ID
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Valid product ID is required" },
        { status: 400 },
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Track deletion results
    const deletionResults = {
      coverImage: false,
      banner: false,
      slides: {
        total: 0,
        success: 0,
        failed: 0,
      },
      costImages: {
        total: 0,
        success: 0,
        failed: 0,
      },
    };

    // Delete cover image if exists
    if (product.image) {
      try {
        const publicId = extractPublicId(product.image);
        if (publicId) {
          const { success } = await cloudinaryDelete(publicId);
          deletionResults.coverImage = success;
        }
      } catch (error) {
        console.error("Error deleting cover image:", error);
      }
    }

    // Delete banner if exists
    if (product.banner) {
      try {
        const publicId = extractPublicId(product.banner);
        if (publicId) {
          const { success } = await cloudinaryDelete(publicId);
          deletionResults.banner = success;
        }
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }

    // Delete slides if exist
    if (product.slides?.length > 0) {
      deletionResults.slides.total = product.slides.length;
      const deletePromises = product.slides.map(async (slide) => {
        try {
          const publicId = extractPublicId(slide);
          if (!publicId) return false;

          const { success } = await cloudinaryDelete(publicId);
          return success;
        } catch (error) {
          console.error(`Error deleting slide: ${slide}`, error);
          return false;
        }
      });

      const results = await Promise.all(deletePromises);
      deletionResults.slides.success = results.filter(Boolean).length;
      deletionResults.slides.failed =
        results.length - deletionResults.slides.success;
    }

    // Delete cost images if exist
    if (product.cost?.length > 0) {
      const costImages = product.cost.filter((cost) => cost.image);
      deletionResults.costImages.total = costImages.length;

      if (costImages.length > 0) {
        const deletePromises = costImages.map(async (cost) => {
          try {
            const publicId = extractPublicId(cost.image);
            if (!publicId) return false;

            const { success } = await cloudinaryDelete(publicId);
            return success;
          } catch (error) {
            console.error(`Error deleting cost image: ${cost.image}`, error);
            return false;
          }
        });

        const results = await Promise.all(deletePromises);
        deletionResults.costImages.success = results.filter(Boolean).length;
        deletionResults.costImages.failed =
          results.length - deletionResults.costImages.success;
      }
    }

    // Soft delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Product deleted successfully",
        deletionResults,
        warnings: [
          deletionResults.slides.failed > 0
            ? `Failed to delete ${deletionResults.slides.failed} slides`
            : null,
          deletionResults.costImages.failed > 0
            ? `Failed to delete ${deletionResults.costImages.failed} cost images`
            : null,
        ].filter(Boolean),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
