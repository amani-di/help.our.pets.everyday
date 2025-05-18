import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { authOptions } from "./app/api/auth/[...nextauth]/route.js";

// Partie 1: Middleware pour les routes protégées
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const userType = req.nextauth?.token?.userType; // Adapté à votre structure

    // Redirection pour les routes API signalement
    if (pathname.startsWith("/api/reports")) {
      if (!req.nextauth?.token) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Authentification requise" },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // Vos règles existantes
    if (pathname.startsWith("/my-shelters") && userType !== "association") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    
    if (pathname.startsWith("/my-services") && userType !== "veterinaire") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// Partie 2: Configuration des routes protégées
export const config = {
  matcher: [
    "/profile",
    "/my-animals",
    "/my-donations", 
    "/my-shelters",
    "/manage-adoptions",
    "/my-services",
    "/api/reports/:path*" // Protection des routes API
  ]
};