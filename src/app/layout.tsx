import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import RightSideBanner from './components/RightSideBanner'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Package",
  description: "Your trusted shipping partner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <Providers>
          <div className="relative min-h-screen flex bg-gray-50">
            <RightSideBanner />
            <div className="flex-1 md:mr-[120px]">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
