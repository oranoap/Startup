export { default } from "next-auth/middleware";

export const config = {
  // Everything requires a session except sign-in, NextAuth routes and assets.
  matcher: [
    "/((?!signin|api/auth|_next/static|_next/image|favicon.ico|pdf.worker).*)",
  ],
};
