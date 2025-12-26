import type { Metadata } from "next";
// import localFont from "next/font/local"; // customized fonts if needed
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";
import DemoBanner from "@/components/DemoBanner";
import GroguWidget from "@/components/GroguWidget";

export const metadata: Metadata = {
  title: "Empalombia",
  description: "Auténtico sabor colombiano",
  icons: {
    icon: '/img/logo2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Fallback for material icons if they were used via CDN in index.html, 
             based on Header usage of 'material-symbols-outlined' */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <CartProvider>
            <DemoBanner />
            <GroguWidget />
            <LayoutWrapper>{children}</LayoutWrapper>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
