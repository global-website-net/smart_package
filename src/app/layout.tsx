import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import RightSideBanner from './components/RightSideBanner'
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/auth.config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Package",
  description: "Your trusted shipping partner",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <Providers>
          <div className="relative min-h-screen flex bg-gray-50">
            {isLoggedIn && <RightSideBanner />}
            <div className={isLoggedIn ? "flex-1 md:mr-[160px]" : "flex-1"}>
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
