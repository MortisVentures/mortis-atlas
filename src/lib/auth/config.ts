import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

// Extend NextAuth types to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isActive?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Account has been deactivated");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // Google OAuth provider (optional - requires env vars)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Disabled for security - prevents account takeover via OAuth
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : []),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Handle session updates (e.g., role changes)
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      // Check if user is still active on each request (prevents zombie sessions)
      // Only check on existing tokens, not during initial sign-in
      if (token.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, role: true },
          });

          if (!dbUser?.isActive) {
            // Return empty object to invalidate the token
            return { ...token, isActive: false };
          }

          // Sync role in case it changed (e.g., admin promoted/demoted user)
          if (dbUser.role !== token.role) {
            token.role = dbUser.role;
          }
        } catch {
          // If DB check fails, allow the request to proceed
          // (fail open to prevent lockouts during DB issues)
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Check if user was deactivated (token marked inactive)
      if (token.isActive === false) {
        // Return minimal session that will trigger re-auth
        return { expires: new Date(0).toISOString() } as typeof session;
      }

      // Add user id and role to session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },

    async signIn({ user, account }) {
      // For OAuth providers, ensure user has a role
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser && !existingUser.isActive) {
          return false; // Block deactivated users
        }

        // Update last login for OAuth users
        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLoginAt: new Date() },
          });
        }
      }

      return true;
    },
  },

  events: {
    async signIn({ user }) {
      // Log successful login (basic audit)
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            entityType: "User",
            entityId: user.id,
            description: "User logged in",
          },
        });
      } catch (error) {
        // Don't block login if audit fails
        console.error("Failed to create audit log:", error);
      }
    },

    async signOut({ token }) {
      // Log logout
      if (token?.id) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: token.id as string,
              action: "LOGOUT",
              entityType: "User",
              entityId: token.id as string,
              description: "User logged out",
            },
          });
        } catch (error) {
          console.error("Failed to create audit log:", error);
        }
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
};
