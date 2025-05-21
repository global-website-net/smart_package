"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function RightSideBanner() {
  const pathname = usePathname();
  return (
    <div
      className="hidden md:flex flex-col items-center fixed right-0 w-[200px] z-[70] bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/images/green_seperator_menu_right_side.png')",
        top: '80px',
        height: 'calc(100vh - 80px)',
        right: '0'
      }}
    >
      <div className="flex flex-col items-center mt-8 gap-4 w-full">
        <img src="/images/profile_icon.png" alt="Profile Icon" className="w-24 h-24 mb-2" />
        <img src="/images/white_line_right_banner.png" alt="White Line" className="w-full h-2 mb-2" />
        <Link href="/" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>
          الرئيسية
        </Link>
        <Link href="/tracking_packages_user" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/tracking_packages_user' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>الرزم</Link>
        <Link href="/tracking_orders_regular" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/tracking_orders_regular' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>الطلبات</Link>
        <Link href="/wallet" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/wallet' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>المحفظة</Link>
        <Link href="/account" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/account' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>حسابي</Link>
        <Link href="/messages" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/messages' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>الرسائل</Link>
        <Link href="/packages_prices" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/packages_prices' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>أسعارنا</Link>
        <button onClick={() => signOut()} className="py-2 px-4 w-full text-center rounded-md text-white hover:bg-red-700/80">تسجيل الخروج</button>
      </div>
    </div>
  )
} 