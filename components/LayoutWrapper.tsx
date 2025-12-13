"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Admin, Login, and Register pages often have their own layout or no header/footer
  const isSpecialPage = ["/admin", "/login", "/register"].some((path) =>
    pathname?.startsWith(path)
  );

  if (isSpecialPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
