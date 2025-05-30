import Customers from "@/components/Dashboard/Customers";
import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import { unstable_noStore } from "next/cache";

const Page = async () => {
  unstable_noStore();

  try {
    await dbConnect();
    const customers = await User.find().lean();

    return <Customers allCustomers={JSON.parse(JSON.stringify(customers))} />;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return <div>Failed to load customers. Please try again later.</div>;
  }
};

export default Page;
