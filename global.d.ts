import { Components } from "@mui/material/styles/components";
import "@mui/material/styles";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      telegramId?: string | null;
      authProvider?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    telegramId?: string;
    authProvider?: string;
  }

  interface JWT {
    id: string;
    role: string;
    telegramId?: string;
    authProvider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    telegramId?: string;
    authProvider?: string;
  }
}

declare module "@mui/material/styles" {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: Components["MuiDataGrid"]["styleOverrides"];
    };
  }
}

export {};

