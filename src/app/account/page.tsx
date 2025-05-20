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
import { Dialog } from '@headlessui/react'

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
  shopId: string
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
  const [shops, setShops] = useState<Array<{ id: string; fullName: string }>>([])
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
  const [deleteRequested, setDeleteRequested] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [passwordError, setPasswordError] = useState('')
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
              createdAt: userData.createdAt,
              shopId: userData.shopId || '',
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
            const shopsResponse = await fetch('/api/users/shops')
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
    setPasswordError('')
    setIsSubmitting(true)

    // Validate current password if we're submitting changes
    if (formData.currentPassword === '') {
      setPasswordError('كلمة المرور الحالية مطلوبة للتعديل')
      setIsSubmitting(false)
      return
    }

    // Validate passwords if changing password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError('كلمات المرور الجديدة غير متطابقة')
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
          shopId: formData.shopId,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (data.error === 'Invalid password' || data.error === 'كلمة المرور الحالية غير صحيحة') {
          setPasswordError('كلمة المرور غير صحيحة')
          setIsSubmitting(false)
          return
        }
        setUpdateError(data.error || 'حدث خطأ أثناء تحديث الملف الشخصي')
        setIsSubmitting(false)
        return
      }

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

  const handleConfirmDelete = async () => {
    // Placeholder for sending email to admin
    await fetch('/api/send-admin-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: profile?.email, adminEmail: 'someone@example.com' })
    });
    setDeleteRequested(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center" style={{ fontFamily: 'Dubai, sans-serif' }}>
      <Header />
      <main className="w-full flex flex-col items-center pt-24">
        {/* Header Title */}
        <div className="w-full text-center mt-8">
          <h1 className="text-3xl font-bold text-center mb-4 mt-0">الحساب الشخصي</h1>
          <div className="flex justify-center items-center mb-8">
            <div className="relative w-full">
              <div className="w-full h-0.5 bg-green-500"></div>
              <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
            </div>
          </div>
        </div>
        {/* Profile & Navigation Section */}
        <div className="flex flex-row justify-center items-center w-full max-w-2xl mb-8">
          {/* Profile Icon (right side) */}
          <div className="flex-1 flex justify-center">
            <div className="w-48 h-48 rounded-full flex items-center justify-center">
              <img src="/images/profile_icon.png" alt="الملف الشخصي" width={160} height={160} style={{borderRadius: '50%'}} />
            </div>
          </div>
          {/* Move vertical divider here, close to profile icon */}
          <div className="h-48 w-px bg-black mx-4"></div>
          {/* Navigation Icons (left side, vertical, right-aligned) */}
          <div className="flex flex-col items-end gap-6">
            <a className="group flex flex-row items-center gap-3" href="/tracking_packages_user">
              <span className="text-lg text-gray-800">تتبع الرزم</span>
              <div className="w-14 h-14 flex items-center justify-center">
                <img alt="تتبع الرزم" loading="lazy" width="56" height="56" decoding="async" data-nimg="1" srcSet="/_next/image?url=%2Fimages%2Fpackage_hex_icon.png&w=64&q=75 1x, /_next/image?url=%2Fimages%2Fpackage_hex_icon.png&w=128&q=75 2x" src="/_next/image?url=%2Fimages%2Fpackage_hex_icon.png&w=128&q=75" style={{color: 'transparent'}} />
              </div>
            </a>
            <a className="group flex flex-row items-center gap-3" href="/wallet">
              <span className="text-lg text-gray-800">المحفظة</span>
              <div className="w-14 h-14 flex items-center justify-center">
                <img alt="المحفظة" loading="lazy" width="56" height="56" decoding="async" data-nimg="1" srcSet="/_next/image?url=%2Fimages%2Fwallet_hex_icon.png&w=64&q=75 1x, /_next/image?url=%2Fimages%2Fwallet_hex_icon.png&w=128&q=75 2x" src="/_next/image?url=%2Fimages%2Fwallet_hex_icon.png&w=128&q=75" style={{color: 'transparent'}} />
              </div>
            </a>
            <a className="group flex flex-row items-center gap-3" href="/tracking_orders_regular">
              <span className="text-lg text-gray-800">تتبع الطلبات</span>
              <div className="w-14 h-14 flex items-center justify-center">
                <img alt="تتبع الطلبات" loading="lazy" width="56" height="56" decoding="async" data-nimg="1" srcSet="/_next/image?url=%2Fimages%2Fshopping_bag_hex_icon.png&w=64&q=75 1x, /_next/image?url=%2Fimages%2Fshopping_bag_hex_icon.png&w=128&q=75 2x" src="/_next/image?url=%2Fimages%2Fshopping_bag_hex_icon.png&w=128&q=75" style={{color: 'transparent'}} />
              </div>
            </a>
          </div>
        </div>
        {/* Green Divider */}
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
          </div>
        </div>
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-6 items-end">
          <div className="w-full">
            <label className="block text-gray-700 mb-1 pr-2">الاسم</label>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleInputChange} 
              disabled={!isEditing}
              className={`w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none text-right ${
                !isEditing ? 'bg-gray-100' : 'bg-transparent'
              }`} 
            />
          </div>
          <div className="w-full">
            <label className="block text-gray-700 mb-1 pr-2">رقم المشترك</label>
            <input 
              type="text" 
              name="id" 
              value={profile?.id || ''} 
              disabled 
              className="w-full border-0 border-b-2 border-gray-300 bg-gray-100 text-right" 
            />
          </div>
          <div className="w-full">
            <label className="block text-gray-700 mb-1 pr-2">المحافظة</label>
            <select 
              name="governorate" 
              value={formData.governorate} 
              onChange={handleInputChange} 
              disabled={!isEditing}
              className={`w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none text-right ${
                !isEditing ? 'bg-gray-100' : 'bg-transparent'
              }`}
            >
              {governorates.map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-gray-700 mb-1 pr-2">رقم الهاتف</label>
            <input 
              type="text" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleInputChange} 
              disabled={!isEditing}
              className={`w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none text-right ${
                !isEditing ? 'bg-gray-100' : 'bg-transparent'
              }`} 
            />
          </div>
          <div className="w-full">
            <label className="block text-gray-700 mb-1 pr-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              name="email" 
              value={profile?.email || ''} 
              disabled 
              className="w-full border-0 border-b-2 border-gray-300 bg-gray-100 text-right" 
            />
          </div>
          {isEditing && (
            <>
              <div className="w-full">
                <label className="block text-gray-700 mb-1 pr-2">كلمة المرور الحالية</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={formData.currentPassword} 
                  onChange={handleInputChange} 
                  className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right" 
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>
              <div className="w-full">
                <label className="block text-gray-700 mb-1 pr-2">كلمة المرور الجديدة (اختياري)</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleInputChange} 
                  className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right" 
                />
              </div>
              <div className="w-full">
                <label className="block text-gray-700 mb-1 pr-2">تأكيد كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange} 
                  className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right" 
                />
              </div>
            </>
          )}
          {isRegularUser && (
            <div className="w-full">
              <label className="block text-gray-700 mb-1 pr-2">اختيار المتجر</label>
              <select 
                name="shopId" 
                value={formData.shopId} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                className={`w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none text-right ${
                  !isEditing ? 'bg-gray-100' : 'bg-transparent'
                }`}
              >
                <option value="">اختر المتجر</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.fullName}</option>
                ))}
              </select>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 mb-16 justify-center items-center w-full">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  تعديل التفاصيل
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  حذف الحساب
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </>
            )}
          </div>
        </form>
        {/* Delete Account Confirmation Modal */}
        <Dialog open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteRequested(false); }} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" />
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-auto p-6 z-10">
              {!deleteRequested ? (
                <>
                  <Dialog.Title className="text-lg font-bold mb-4 text-center">تأكيد حذف الحساب</Dialog.Title>
                  <p className="mb-6 text-center text-gray-700">هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      حذف الحساب
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Dialog.Title className="text-lg font-bold mb-4">تم إرسال الطلب</Dialog.Title>
                  <p className="mb-6 text-green-700">سيتم التواصل معك من قبل الإدارة قريباً لمعالجة طلبك</p>
                  <button
                    onClick={() => { setShowDeleteModal(false); setDeleteRequested(false); }}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    حسناً
                  </button>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      </main>
    </div>
  )
} 