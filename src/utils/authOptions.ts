import { dbConnect } from "@/lib/database";
import { User } from "@/models/user.model";
import { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
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

          const user = await User.findOne({
            email: credentials?.email,
          })
            .select("+password")
            .lean();

          if (!user) {
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
            throw new Error("Invalid credentials");
          }

          if (user.authProvider === "email" && !user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || "",
            role: user.role,
            authProvider: user.authProvider || "email",
            isVerified: !!user.isVerified,
            telegramId: user.telegramId || "",
            image: user.image || "",
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
            image: credentials.photo_url || "",
            authProvider: "telegram",
            role: "user",
          });
        } else if (credentials.photo_url && user.image !== credentials.photo_url) {
          user.image = credentials.photo_url;
          await user.save();
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
          image: user.image || "",
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
    async signIn({ user, account, profile }: any): Promise<boolean> {
      if (account?.provider === "google") {
        await dbConnect();
        try {
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            existingUser = await User.create({
              name: user.name || "Google User",
              email: user.email,
              image: user.image || "",
              authProvider: "google",
              isVerified: true,
              role: "user",
            });
          } else if (existingUser.isBlocked) {
            throw new Error("Account is blocked");
          } else if (existingUser.isDeleted) {
            throw new Error("Account has been deleted");
          } else if (user.image && existingUser.image !== user.image) {
            existingUser.image = user.image;
            await existingUser.save();
          }

          // Mutate the user object so the jwt callback receives our DB values
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.authProvider = existingUser.authProvider;
          user.isVerified = existingUser.isVerified;
          user.telegramId = existingUser.telegramId || "";
          user.image = existingUser.image || user.image || "";
          return true;
        } catch (error: any) {
          console.error("Google Auth Error:", error);
          return false;
        }
      }

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
        token.image = user.image;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.image) token.image = session.image;
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
        session.user.image = token.image;
      }
      return session;
    },

    redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};
