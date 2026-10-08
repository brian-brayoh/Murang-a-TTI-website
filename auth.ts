import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { adminUsers } from "@/lib/repo";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Needed when self-hosting (VPS, Docker, `next start`): Auth.js otherwise
  // rejects the request host in production.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await adminUsers.findByEmail(email);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name || "", role: user.role } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; name?: string | null; role?: string };
        token.uid = u.id;
        token.name = u.name || "";
        token.role = u.role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      const u = session.user as unknown as { id?: string; role?: string; name?: string | null };
      u.id = (token.uid as string) || (token.sub as string) || "";
      u.role = (token.role as string) || "admin";
      u.name = (token.name as string) || "";
      return session;
    },
  },
});
