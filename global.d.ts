import { Components } from "@mui/material/styles/components";
import "@mui/material/styles";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null; // Optional fields from DefaultSession
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
  }

  interface JWT {
    id: string;
    role: string;
  }
}


declare module "@mui/material/styles" {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: Components["MuiDataGrid"]["styleOverrides"];
    };
  }
}


// Declare the Payway checkout global object
declare global {
  interface Window {
    AbaPayway: any
  }
}

export { };
