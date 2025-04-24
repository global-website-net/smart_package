import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

          <div className="hidden md:flex items-center space-x-24 rtl:space-x-reverse">
            <Link href="/blog" className="text-white hover:text-green-400 transition-colors">
              المدونة
            </Link>
            <Link href="/packages" className="text-white hover:text-green-400 transition-colors">
              الباقات
            </Link>
            <Link href="/contact" className="text-white hover:text-green-400 transition-colors">
              اتصل بنا
            </Link>
            <Link href="/faq" className="text-white hover:text-green-400 transition-colors">
              الأسئلة الشائعة
            </Link>
          </div> 