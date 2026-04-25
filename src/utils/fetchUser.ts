import axios from "axios";

export const fetchUser = async () => {
  try {
    const res = await axios.get(`/api/user?me=true`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
