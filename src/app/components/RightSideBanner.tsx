"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export default function RightSideBanner() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isShopUser = session?.user?.role === 'SHOP';

  const navigationItems = isShopUser ? [
    { href: '/', label: 'الرئيسية' },
    { href: '/shop/packages', label: 'تتبع الرزم' },
    { href: '/wallet', label: 'المحفظة' },
    { href: '/account', label: 'حسابي' },
  ] : [
    { href: '/', label: 'الرئيسية' },
    { href: '/tracking_packages_user', label: 'الرزم' },
    { href: '/tracking_orders_regular', label: 'الطلبات' },
    { href: '/wallet', label: 'المحفظة' },
    { href: '/account', label: 'حسابي' },
    { href: '/messages', label: 'الرسائل' },
    { href: '/packages_prices', label: 'أسعارنا' },
  ];

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
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`py-2 px-4 w-full text-center rounded-md ${pathname === item.href ? 'bg-black text-white' : 'text-white hover:bg-green-900/40'}`}
          >
            {item.label}
          </Link>
        ))}
        <button onClick={() => signOut()} className="py-2 px-4 w-full text-center rounded-md text-white hover:bg-red-700/80">تسجيل الخروج</button>
      </div>
    </div>
  )
} 