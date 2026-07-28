export const dynamic = "force-dynamic";
import Product from "@/components/Product";
import { dbConnect } from "@/lib/database";
import { Product as ProductModel } from "@/models/product.model";
import { Account } from "@/models/account.model";
import { Gift } from "@/models/gift.model";
import mongoose from "mongoose";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
  await dbConnect();
  const product = await ProductModel.findById(params.productId).lean() as any;
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} - Delykastore`,
    description: product.description,
  };
}

export default async function Page({ params }: { params: { productId: string } }) {
  await dbConnect();

  let products = await ProductModel.findById(params.productId).lean() as any;

  if (!products) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-gray-400">We couldn&apos;t find the product you&apos;re looking for.</p>
        </div>
      </div>
    );
  }

  let groupedCost: any[] = [];
  let categories: any[] = [];
  let giftData: any = null;

  if (products.cost) {
    categories = [
      ...new Set(
        products.cost.map((item: any) => item.category).filter(Boolean),
      ),
    ];
    groupedCost = categories.map((category) => ({
      category,
      items: products.cost
        .filter((item: any) => item.category === category)
        .sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price)),
    }));

    if (products.type === "account") {
      const slots = await Account.aggregate([
        {
          $match: {
            productId: new mongoose.Types.ObjectId(params.productId),
            isActive: true,
          },
        },
        { $group: { _id: "$costId", count: { $sum: 1 } } },
      ]);

      const slotsMap = slots.reduce((acc: any, slot: any) => {
        acc[slot._id] = slot.count;
        return acc;
      }, {});

      groupedCost.forEach((group: any) => {
        group.items.forEach((item: any) => {
          item.slots = slotsMap[item.id] || 0;
        });
      });

      products.cost.forEach((item: any) => {
        item.slots = slotsMap[item.id] || 0;
      });
    }

    const gift = await Gift.findOne({
      productId: params.productId,
      isActive: true,
    }).lean() as any;

    if (gift) {
      const newWageringLevels = gift.wageringLevels.map((level: any) => {
        const cost = products.cost.filter((c: any) =>
          level.costIds.includes(c.id),
        );
        return {
          ...level,
          cost,
        };
      });

      giftData = {
        ...gift,
        wagering: newWageringLevels,
        costs: newWageringLevels,
      };
    }
  }

  const productData = JSON.parse(
    JSON.stringify({
      ...products,
      groupedCost,
      categories,
      gift: giftData,
    })
  );

  return <Product {...productData} />;
}
