import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  providers: [
    // Email + Password login (for both users and admins)
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          console.log("Auth Status: DB Connected");

          const user = await User.findOne({
            email: credentials?.email,
          })
            .select("+password")
            .lean();

          if (!user) {
            console.log("Auth Status: User not found");
            throw new Error("User not found");
          }

          if (user.isBlocked) throw new Error("Account is blocked");
          if (user.isDeleted) throw new Error("Account has been deleted");
          if (!user.password) throw new Error("Please use Telegram to log in");

          const isValidPassword = await bcrypt.compare(
            credentials?.password || "",
            user.password || "",
          );

          if (!isValidPassword) {
            console.log("Auth Status: Invalid password");
            throw new Error("Invalid credentials");
          }

          if (user.authProvider === "email" && !user.isVerified) {
            console.log("Auth Status: Not verified");
            throw new Error("Please verify your account before logging in");
          }

          console.log("Auth Status: Success for", user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || "",
            role: user.role,
            authProvider: user.authProvider || "email",
            isVerified: !!user.isVerified,
            telegramId: user.telegramId || "",
          };
        } catch (error: any) {
          console.error("Auth Error:", error.message);
          throw error;
        }
      },
    }),

    // Telegram Login Widget
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { label: "Telegram ID", type: "text" },
        first_name: { label: "First Name", type: "text" },
        last_name: { label: "Last Name", type: "text" },
        username: { label: "Username", type: "text" },
        photo_url: { label: "Photo URL", type: "text" },
        auth_date: { label: "Auth Date", type: "text" },
        hash: { label: "Hash", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.hash || !credentials?.auth_date) {
          throw new Error("Invalid Telegram data");
        }

        // Verify Telegram hash
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          throw new Error("Telegram bot token not configured");
        }

        const secretKey = crypto.createHash("sha256").update(botToken).digest();

        const dataCheckString = Object.keys(credentials)
          .filter(
            (key) =>
              key !== "hash" &&
              key !== "callbackUrl" &&
              key !== "csrfToken" &&
              key !== "redirect" &&
              key !== "json" &&
              credentials[key],
          )
          .sort()
          .map((key) => `${key}=${credentials[key]}`)
          .join("\n");

        const hmac = crypto
          .createHmac("sha256", secretKey)
          .update(dataCheckString)
          .digest("hex");

        if (hmac !== credentials.hash) {
          throw new Error("Invalid Telegram authentication");
        }

        // Check auth_date isn't too old (within 1 day)
        const authDate = parseInt(credentials.auth_date);
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
          throw new Error("Telegram authentication expired");
        }

        await dbConnect();

        // Find or create user by telegramId
        let user = await User.findOne({ telegramId: credentials.id });

        if (!user) {
          const displayName = [credentials.first_name, credentials.last_name]
            .filter(Boolean)
            .join(" ");

          user = await User.create({
            telegramId: credentials.id,
            name: displayName || credentials.username || `TG_${credentials.id}`,
            authProvider: "telegram",
            role: "user",
          });
        }

        if (user.isBlocked) {
          throw new Error("Account is blocked");
        }

        if (user.isDeleted) {
          throw new Error("Account has been deleted");
        }

        return {
          id: user._id.toString(),
          email: user.email || "",
          name: user.name || "",
          role: user.role,
          authProvider: "telegram",
          telegramId: credentials.id,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 day in seconds
    updateAge: 2 * 60 * 60, // 2 hours in seconds
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async signIn({ user }: { user: any }): Promise<boolean> {
      if (!user) {
        throw new Error("Invalid credentials");
      }
      return true;
    },

    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: any;
      trigger?: string;
      session?: any;
    }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.authProvider = user.authProvider;
        token.telegramId = user.telegramId;
        token.isVerified = user.isVerified;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.image) token.picture = session.image;
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
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.authProvider = token.authProvider;
        session.user.telegramId = token.telegramId;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },

    redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};
