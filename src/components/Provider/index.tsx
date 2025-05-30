"use client";
import { ThemeProvider } from "@mui/material";
import { SessionProvider, useSession } from "next-auth/react";
import theme from "../../../theme";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import store from "@/redux/store";
import { fetchUser } from "@/utils/fetchUser";
import { useEffect } from "react";
import { setUser } from "@/redux/userSlice";

const StoreUser = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      fetchUser(session.user.id!).then((userData) => {
        if (userData) {
          dispatch(setUser(userData));
        }
      });
    }
  }, [session?.user, dispatch]);
  return null;
};
const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <StoreUser />
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </ReduxProvider>
    </SessionProvider>
  );
};

export default Provider;
