import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        await dbConnect();

        const user = await User.findOne({
          email: credentials?.email,
        }).select("+password");

        if (!user) {
          throw new Error("User not found");
        }

        const isValidPassword = await user.comparePassword(
          credentials?.password
        );
        console.log("Hello", isValidPassword);
        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        // 🚨 Restrict login to only admins
        if (user.role !== "admin") {
          throw new Error("Access Denied: Admins Only");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin-getotopup/login",
  },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async signIn({ user }: { user: any }): Promise<boolean> {
      if (!user) {
        throw new Error("Invalid credentials");
      }
      return true;
    },

    async jwt({ token, user }: { token: JWT; user?: any }): Promise<JWT> {
      if (user) {
        console.log("🛠️ Assigning JWT Token:", {
          id: user._id.toString(),
          role: user.role,
        });

        token.id = user._id.toString(); // ✅ Convert `_id` to string
        token.role = user.role;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: any;
      token: JWT;
    }): Promise<Session> {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },

    redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};
