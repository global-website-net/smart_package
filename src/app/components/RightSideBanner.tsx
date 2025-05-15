"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RightSideBanner() {
  const pathname = usePathname();
  return (
    <div
      className="hidden md:flex flex-col items-center fixed right-0 w-[160px] z-50 bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/images/green_seperator_menu_right_side.png')",
        top: '80px',
        height: 'calc(100vh - 80px)'
      }}
    >
      <div className="flex flex-col items-center mt-8 gap-4 w-full">
        <Link href="/" className={`flex items-center justify-center gap-2 py-2 px-4 w-full text-center rounded-md ${pathname === '/' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>
          <img src="/images/profile_icon.png" alt="Profile Icon" className="w-6 h-6 ml-2" />
          <span>الرئيسية</span>
        </Link>
        <Link href="/tracking_packages_user" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/tracking_packages_user' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>الرزم</Link>
        <Link href="/tracking_orders_regular" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/tracking_orders_regular' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>الطلبات</Link>
        <Link href="/account" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/account' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>حسابي</Link>
        <Link href="/wallet" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/wallet' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>المحفظة</Link>
        <Link href="/messages" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/messages' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>الرسائل</Link>
        <Link href="/packages" className={`py-2 px-4 w-full text-center rounded-md ${pathname === '/packages' ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}>أسعارنا</Link>
        <Link href="/auth/logout" className="py-2 px-4 w-full text-center rounded-md text-white hover:bg-red-700/80">تسجيل الخروج</Link>
      </div>
    </div>
  )
} 