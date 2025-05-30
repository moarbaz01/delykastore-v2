import axios from "axios";

export const fetchUser = async (userId: string) => {
  try {
    const res = await axios.get(`/api/user?id=${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
