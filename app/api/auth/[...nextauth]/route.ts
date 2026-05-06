import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

const ALLOWED_DOMAIN = "innovative.edu.my";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile, account }) {
      if (account?.provider === "google" && profile?.email) {
        // Restrict to institutional domain
        if (!profile.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          throw new Error(`Access denied: Only @${ALLOWED_DOMAIN} emails are allowed`);
        }

        // Find existing user by email OR googleId
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: profile.email },
              { googleId: profile.sub },
            ],
          },
        });

        // If no user exists, create one
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || profile.email.split("@")[0],
              googleId: profile.sub,
              role: "USER", // Default to USER role
            },
          });
        }

        // Update googleId if user existed but didn't have it
        if (!user.googleId && profile.sub) {
          await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.sub },
          });
        }

        // Create your custom session cookie
        await setSessionCookie({
          userId: user.id,
          role: user.role,
          name: user.name,
        });

        return true;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs to the same origin
      if (url.startsWith(baseUrl)) return url;
      
      // Check user role from session cookie to determine redirect
      // The session cookie was already set in signIn callback
      // Default redirect based on typical flow
      return `${baseUrl}/user/dashboard`;
    },
  },
  pages: {
    signIn: "/login/user",
  },
});

export { handler as GET, handler as POST };
