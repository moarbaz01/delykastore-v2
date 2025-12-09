import { useCallback } from "react";
import axios from "axios";

export const useUserVerification = (
  setLoading: (value: boolean) => void,
  setPlayerAvailable: (value: boolean) => void,
  setMessage: (value: string) => void,
  setErrorMessage: (value: string) => void
) => {
  const checkUserAccount = useCallback(
    async (game: string, userId: string, zoneId: string) => {
      try {
        setLoading(true);
        const res = await axios.post("/api/verify-user-account", {
          game,
          userId,
          zoneId,
        });

        const { username, error } = res.data;
        if (username) {
          setPlayerAvailable(true);
          setMessage(username);
          setErrorMessage("");
        } else {
          setPlayerAvailable(false);
          setMessage("");
          setErrorMessage(error);
        }
      } catch (error: any) {
        setErrorMessage(
          error.response?.data?.error || "Error checking player information"
        );
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setPlayerAvailable, setMessage, setErrorMessage]
  );

  const fetchCheckRole = useCallback(
    async (
      userId: string,
      zoneId: string,
      game: string,
      region?: string
    ) => {
      if (!userId) {
        setErrorMessage("Please fill userId");
        return;
      }

      if (["mobilelegends", "magicchess", "genshinimpact"].includes(game)) {
        if (!zoneId) {
          setErrorMessage("Please fill zoneId");
          return;
        }
      }

      if (game === "magicchess") {
        setPlayerAvailable(true);
        setMessage("ត្រូវប្រាកដថាIDរបស់អ្នកត្រឹមត្រូវ");
        setErrorMessage("");
        return;
      }

      if (!region || region !== "brazil") {
        await checkUserAccount(game, userId, zoneId);
        return;
      }

      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch("/api/checkrole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            zoneId,
            productId: "13",
            product: "mobilelegends",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (data.status === 200) {
          setPlayerAvailable(true);
          setMessage(data.username);
          localStorage.setItem("getotopup-userId", userId);
          localStorage.setItem("getotopup-zoneId", zoneId);
          setErrorMessage("");
        } else {
          setErrorMessage(data.message);
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          setErrorMessage("Request timed out. Please try again.");
        } else {
          setErrorMessage("Error checking player information");
        }
      } finally {
        setLoading(false);
      }
    },
    [checkUserAccount, setLoading, setPlayerAvailable, setMessage, setErrorMessage]
  );

  return { checkUserAccount, fetchCheckRole };
};
