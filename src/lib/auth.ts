import "@/lib/server-error-bootstrap";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: string;
      emailVerificationStatus?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string | null;
    emailVerificationStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    emailVerificationStatus?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            avatar: true,
            isActive: true,
            emailVerificationStatus: true,
          },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const passwordMatch = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        if (!user.isActive) {
          throw new Error("This account is inactive");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
          emailVerificationStatus: user.emailVerificationStatus,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.emailVerificationStatus = user.emailVerificationStatus;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.role = session.user.role;
        token.picture = session.user.image;
        token.emailVerificationStatus = session.user.emailVerificationStatus;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.emailVerificationStatus = token.emailVerificationStatus as string | undefined;
      }
      return session;
    },

    async signIn({ user }) {
      if (!user) {
        return false;
      }
      return true;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
