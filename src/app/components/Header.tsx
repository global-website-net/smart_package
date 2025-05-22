'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-black text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16 items-center relative">
          <div className="flex flex-1 items-center justify-start gap-6">
            <Link className="px-2 py-1 text-lg font-bold" href="/">الرئيسية</Link>
            <Link className="px-2 py-1 text-lg font-bold" href="/how-it-works">من نحن</Link>
            <Link className="px-2 py-1 text-lg font-bold" href="/prices">اسعارنا</Link>
            <Link className="px-2 py-1 text-lg font-bold" href="/contact">التواصل</Link>
          </div>
          <div className="absolute left-[55%] md:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <Link className="flex items-center gap-2" href="/">
              <Image 
                src="/images/smart_package_logo_upper_banner.png"
                alt="SMART PACKAGE"
                width={180}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end gap-6">
            <Link className="px-2 py-1 text-lg font-bold" href="/campaigns">حملات</Link>
            <Link className="px-2 py-1 text-lg font-bold" href="/blog">بلوج</Link>
            <div className="flex items-center gap-4">
              <Link className="px-2 py-1 text-lg font-bold" href="/faq">
                الأسئلة المتكررة
              </Link>
              <Link className="px-4 py-1.5 bg-green-600 rounded text-white text-base font-bold hover:bg-green-700 transition-colors" href="/auth/login">
                تسجيل دخول
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="hidden md:hidden bg-black text-white shadow-md">
        <div className="px-2 pt-2 pb-3 space-y-1 flex flex-col gap-2">
          <Link className="block px-3 py-2 text-lg font-bold" href="/">الرئيسية</Link>
          <Link className="block px-3 py-2 text-lg font-bold" href="/how-it-works">من نحن</Link>
          <Link className="block px-3 py-2 text-lg font-bold" href="/prices">اسعارنا</Link>
          <Link className="block px-3 py-2 text-lg font-bold" href="/contact">التواصل</Link>
          <div className="flex items-center justify-center px-3 py-2">
            <Image 
              src="/images/smart_package_logo_upper_banner.png"
              alt="SMART PACKAGE"
              width={180}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <Link className="block px-3 py-2 text-lg font-bold" href="/campaigns">حملات</Link>
          <Link className="block px-3 py-2 text-lg font-bold" href="/blog">بلوج</Link>
          <div className="flex items-center gap-4 px-3 py-2">
            <Link className="text-lg font-bold" href="/faq">الأسئلة المتكررة</Link>
            <Link className="px-4 py-1.5 bg-green-600 rounded text-white text-base font-bold hover:bg-green-700 transition-colors" href="/auth/login">
              تسجيل دخول
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 