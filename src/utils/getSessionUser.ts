import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return session.user; // includes id, role, etc. if added in callbacks
}
