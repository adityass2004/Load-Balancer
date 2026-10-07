import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { AdminRole } from "@/src/generated/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      if (!profile) return false;

      // 1. Email verification requirement
      const isVerified =
        profile.email_verified === true ||
        (profile as any).verified_email === true;
      if (!isVerified) {
        return false;
      }

      // 2. Normalize email
      const rawEmail = profile.email;
      if (!rawEmail) return false;
      const normalizedEmail = rawEmail.toLowerCase().trim();

      // 3. Check existing allowlist user
      let adminUser = await prisma.adminUser.findUnique({
        where: { email: normalizedEmail },
      });

      if (adminUser) {
        return true;
      }

      // 4. First-owner bootstrap (safe atomic transaction to handle concurrency)
      const initialOwner = (process.env.INITIAL_OWNER_EMAIL || "")
        .toLowerCase()
        .trim();

      if (initialOwner && normalizedEmail === initialOwner) {
        try {
          await prisma.$transaction(async (tx) => {
            const count = await tx.adminUser.count();
            if (count === 0) {
              await tx.adminUser.create({
                data: {
                  email: normalizedEmail,
                  role: AdminRole.OWNER,
                  addedBy: "system-bootstrap",
                },
              });
            }
          });

          // Re-verify after transaction
          adminUser = await prisma.adminUser.findUnique({
            where: { email: normalizedEmail },
          });

          if (adminUser) {
            return true;
          }
        } catch {
          // In case of unique collision or race condition, re-check if user was created
          adminUser = await prisma.adminUser.findUnique({
            where: { email: normalizedEmail },
          });
          if (adminUser) {
            return true;
          }
        }
      }

      // 5. Unknown Google user -> reject login
      return false;
    },

    async jwt({ token, user, profile }) {
      const email = (token.email || user?.email || profile?.email || "")
        .toLowerCase()
        .trim();

      if (email) {
        // Query the database to ensure we have the live, current role
        try {
          const adminUser = await prisma.adminUser.findUnique({
            where: { email },
            select: { id: true, role: true },
          });
          if (adminUser) {
            token.role = adminUser.role;
            token.sub = adminUser.id;
          }
        } catch {
          // Keep existing token properties if database is temporarily unreachable
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        if (token.role) {
          (session.user as any).role = token.role;
        }
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
});
