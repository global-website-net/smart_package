'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { useSession, signOut } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@prisma/client'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

interface UserProfile {
  id: string
  email: string
  fullName: string
  role: string
  governorate: string
  town: string
  phonePrefix: string
  phoneNumber: string
  createdAt: string
}

// Extended session user type to include user_metadata
interface ExtendedSessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  user_metadata?: {
    full_name?: string
    governorate?: string
    town?: string
    phone_prefix?: string
    phone_number?: string
  }
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shops, setShops] = useState<Array<{ id: string; name: string }>>([])
  const [formData, setFormData] = useState({
    fullName: '',
    governorate: '',
    town: '',
    phonePrefix: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    shopId: ''
  })
  const [updateSuccess, setUpdateSuccess] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  const isAdminOrOwner = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'
  const isRegularUser = session?.user?.role === 'REGULAR'

  const governorates = [
    'محافظة قلقيلية',
    'محافظة نابلس',
    'محافظة طولكرم',
    'محافظة طوباس',
    'محافظة جنين',
    'محافظة القدس',
    'محافظة سلفيت',
    'محافظة بيت لحم',
    'محافظة الخليل',
    'محافظة اريحا',
    'محافظة رام الله والبيرة'
  ]

  const phonePrefixes = [
    '+972',
    '+970'
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      const fetchProfile = async () => {
        try {
          setIsLoading(true)
          setError('')

          const response = await fetch('/api/user/profile')
          if (!response.ok) {
            throw new Error('Failed to fetch profile')
          }

          const userData = await response.json()

          if (userData) {
            setProfile({
              id: userData.id,
              email: userData.email,
              fullName: userData.fullName || '',
              role: userData.role,
              governorate: userData.governorate || '',
              town: userData.town || '',
              phonePrefix: userData.phonePrefix || '',
              phoneNumber: userData.phoneNumber || '',
              createdAt: userData.createdAt
            })

            setFormData(prev => ({
              ...prev,
              fullName: userData.fullName || '',
              governorate: userData.governorate || '',
              town: userData.town || '',
              phonePrefix: userData.phonePrefix || '',
              phoneNumber: userData.phoneNumber || '',
              shopId: userData.shopId || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }))
          }

          // Fetch shops if user is REGULAR
          if (session.user.role === 'REGULAR') {
            const shopsResponse = await fetch('/api/shops')
            if (shopsResponse.ok) {
              const shopsData = await shopsResponse.json()
              setShops(shopsData)
            }
          }
        } catch (err) {
          console.error('Error in fetchProfile:', err)
          setError('حدث خطأ أثناء تحميل بيانات الملف الشخصي')
        } finally {
          setIsLoading(false)
        }
      }

      fetchProfile()
    }

    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER') {
      setIsAdmin(true)
    }
  }, [status, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setUpdateError('')
    setUpdateSuccess('')
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    // Prevent the default form submission
    e.preventDefault()
    e.stopPropagation()
    
    setIsEditing(false)
    setUpdateError('')
    setUpdateSuccess('')
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        ...formData,
        fullName: profile.fullName || '',
        governorate: profile.governorate || '',
        town: profile.town || '',
        phonePrefix: profile.phonePrefix || '',
        phoneNumber: profile.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUpdateSuccess('')
    setUpdateError('')
    setIsSubmitting(true)

    // Validate current password if we're submitting changes
    if (formData.currentPassword === '') {
      setUpdateError('كلمة المرور الحالية مطلوبة للتعديل')
      setIsSubmitting(false)
      return
    }

    // Validate passwords if changing password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setUpdateError('كلمات المرور الجديدة غير متطابقة')
        setIsSubmitting(false)
        return
      }
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          governorate: isAdminOrOwner ? undefined : formData.governorate,
          town: isAdminOrOwner ? undefined : formData.town,
          phonePrefix: formData.phonePrefix,
          phoneNumber: formData.phoneNumber,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error === 'Invalid password' || errorData.error === 'كلمة المرور الحالية غير صحيحة') {
          setUpdateError('كلمة المرور غير صحيحة')
          setIsSubmitting(false)
          return
        }
        throw new Error(errorData.error || 'حدث خطأ أثناء تحديث الملف الشخصي')
      }

      const data = await response.json()
      setProfile(data)
      setUpdateSuccess('تم تحديث الملف الشخصي بنجاح')
      setIsEditing(false)
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الملف الشخصي'
      setUpdateError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch('/api/auth/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'حدث خطأ أثناء حذف الحساب')
      }

      // Sign out after successful deletion
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الحساب')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header Title */}
      <div className="w-full text-center mt-8">
        <h1 className="text-3xl font-bold">الحساب الشخصي</h1>
        <div className="mx-auto w-1/2 h-0.5 bg-green-500 mt-2 mb-8"></div>
      </div>
      {/* Profile & Navigation Section */}
      <div className="flex flex-row justify-center items-center w-full max-w-2xl mb-8">
        {/* Left: Navigation Icons */}
        <div className="flex flex-col items-center mr-8">
          <Link href="/tracking_packages_user" className="group mb-6">
            <div className="w-12 h-12 mb-1">
              <Image src="/images/package_hex_icon.png" alt="تتبع الرزم" width={48} height={48} />
            </div>
            <span className="text-sm text-gray-700">تتبع الرزم</span>
          </Link>
          <Link href="/wallet" className="group mb-6">
            <div className="w-12 h-12 mb-1">
              <Image src="/images/wallet_hex_icon.png" alt="المحفظة" width={48} height={48} />
            </div>
            <span className="text-sm text-gray-700">المحفظة</span>
          </Link>
          <Link href="/tracking_orders_regular" className="group">
            <div className="w-12 h-12 mb-1">
              <Image src="/images/shopping_bag_hex_icon.png" alt="تتبع الطلبات" width={48} height={48} />
            </div>
            <span className="text-sm text-gray-700">تتبع الطلبات</span>
          </Link>
        </div>
        {/* Vertical Line */}
        <div className="h-40 w-0.5 bg-gray-300 mx-8"></div>
        {/* Right: Profile Icon */}
        <div className="flex-1 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center">
            <Image src="/images/profile_hex_icon.png" alt="الملف الشخصي" width={80} height={80} />
          </div>
        </div>
      </div>
      {/* Green Divider */}
      <div className="w-full h-0.5 bg-green-500 mb-8"></div>
      {/* Form Section */}
      <form className="w-full max-w-lg flex flex-col gap-6 items-end">
        <div className="w-full">
          <label className="block text-gray-700 mb-1 pr-2">الاسم</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right" />
        </div>
        <div className="w-full">
          <label className="block text-gray-700 mb-1 pr-2">رقم المشترك</label>
          <input type="text" name="id" value={profile?.id || ''} disabled className="w-full border-0 border-b-2 border-gray-300 bg-gray-100 text-right" />
        </div>
        <div className="w-full">
          <label className="block text-gray-700 mb-1 pr-2">المحافظة</label>
          <input type="text" name="governorate" value={formData.governorate} onChange={handleInputChange} className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right" />
        </div>
        <div className="w-full">
          <label className="block text-gray-700 mb-1 pr-2">رقم الهاتف</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right" />
        </div>
        <div className="w-full">
          <label className="block text-gray-700 mb-1 pr-2">البريد الإلكتروني</label>
          <input type="email" name="email" value={profile?.email || ''} disabled className="w-full border-0 border-b-2 border-gray-300 bg-gray-100 text-right" />
        </div>
        <div className="w-full">
          <label className="block text-gray-700 mb-1 pr-2">كلمة المرور</label>
          <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right" />
        </div>
        <div className="w-full">
          <label className="block text-gray-700 mb-1 pr-2">اختيار المتجر</label>
          <select name="shopId" value={formData.shopId} onChange={handleInputChange} className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right">
            <option value="">اختر المتجر</option>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
        </div>
        {/* Call to Action Button */}
        <button type="submit" className="mx-auto mt-8 px-8 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">Call To Action</button>
      </form>
    </div>
  )
} 