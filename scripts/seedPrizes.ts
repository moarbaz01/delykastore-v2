import { dbConnect } from "../src/lib/database";
import Prize from "../src/models/prize.schema";

const seedPrizes = async () => {
  try {
    await dbConnect();

    // Clear existing prizes
    await Prize.deleteMany({});

    const initialPrizes = [
      { name: "10% Voucher", color: "#ff962d", winRate: 15 },
      { name: "Big Win: 500D", color: "#f59e0b", winRate: 5 },
      { name: "25 Diamonds", color: "#10b981", winRate: 20 },
      { name: "50 Diamonds", color: "#3b82f6", winRate: 15 },
      { name: "100 Diamonds", color: "#8b5cf6", winRate: 10 },
      { name: "150 Diamonds", color: "#ef4444", winRate: 8 },
      { name: "Monthly x 1", color: "#06b6d4", winRate: 2 },
      { name: "TECNO Slim", color: "#84cc16", winRate: 1 },
      { name: "Try Again", color: "#6b7280", winRate: 24 },
    ];

    const createdPrizes = await Prize.insertMany(initialPrizes);
    console.log("Successfully seeded prizes:", createdPrizes.length);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding prizes:", error);
    process.exit(1);
  }
};

seedPrizes();
