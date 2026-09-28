import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLoginRoute = request.nextUrl.pathname === "/admin/login";

      if (!isAdminRoute || isLoginRoute) {
        return true;
      }

      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
