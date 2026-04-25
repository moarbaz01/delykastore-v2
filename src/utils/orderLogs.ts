import { dbConnect } from "@/lib/database";
import { OrderLog } from "@/models/orderlog.model";

interface CreateOrderLogParams {
  transactionId?: string;
  orderId?: string;
  provider: string;
  requestPayload?: any;
  responsePayload?: any;
  status: "success" | "failed" | "pending";
  errorMessage?: string;
}

export const createOrderLog = async (params: CreateOrderLogParams) => {
  try {
    await dbConnect();
    const log = await OrderLog.create(params);
    return log;
  } catch (error) {
    return null;
  }
};
