"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Footer() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  return (
    <footer
      className="w-full bg-cover bg-center text-white py-8 px-4"
      style={{ backgroundImage: "url('/images/bottom_banner.png')" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Side */}
        <div className="flex flex-col items-start gap-2 md:w-1/3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-[url('/images/phone_icon.png')] bg-contain bg-center bg-no-repeat" />
            <span className="text-lg font-bold">999-999-9999</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-[url('/images/email_icon.png')] bg-contain bg-center bg-no-repeat" />
            <span className="text-lg font-bold">someone@example.com</span>
          </div>
        </div>
        {/* Center */}
        <div className="flex flex-col items-center gap-2 md:w-1/3">
          <span className="text-xl font-bold">تسوق برياحة سهولة</span>
          {!isLoggedIn && (
            <Link href="/auth/signup">
              <button className="mt-2 bg-white text-green-700 font-bold px-6 py-2 rounded-full shadow hover:bg-green-100 transition">سجل الآن</button>
            </Link>
          )}
        </div>
        {/* Right Side */}
        <div className="flex flex-col items-end gap-2 md:w-1/3">
          <span className="text-lg font-bold">سياسة الخصوصية</span>
          <span className="text-lg font-bold">سياسة الترجيع</span>
        </div>
      </div>
    </footer>
  );
} 