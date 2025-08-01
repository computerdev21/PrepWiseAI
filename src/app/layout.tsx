import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/lib/auth/AuthContext";
import BrowserExtensionHandler from "@/components/BrowserExtensionHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TalentUnlock",
  description: "Unlock your potential in the Canadian job market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrowserExtensionHandler />

        <AuthProvider>
          <Navigation />
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
