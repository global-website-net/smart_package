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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Prevent submission if current password is empty
    if (!formData.currentPassword) {
      setPasswordError('يجب إدخال كلمة المرور الحالية');
      setIsSubmitting(false);
      return;
    }

    try {
      // First verify the current password
      const verifyResponse = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
        }),
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        setPasswordError(verifyData.error || 'كلمة المرور الحالية غير صحيحة');
        setIsSubmitting(false);
        return;
      }

      // If password is correct, proceed with profile update
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
          newPassword: formData.newPassword || undefined,
          shopId: formData.shopId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء تحديث الملف الشخصي');
      }

      setProfile(data);
      setUpdateSuccess('تم تحديث الملف الشخصي بنجاح');
      setIsEditing(false);
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الملف الشخصي';
      setUpdateError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="relative w-56 sm:w-64 md:w-80">
              <div className="w-full h-0.5 bg-green-500"></div>
              <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
            </div>
          </div>
        </div>
        {/* Profile & Navigation Section */}
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="flex flex-row items-center justify-center mb-8 gap-4">
            {/* Navigation Icons (left side, vertical, right-aligned) */}
            <div className="flex flex-col items-end gap-4 min-w-[120px]">
              <Link className="group flex flex-row-reverse items-center gap-2" href="/tracking_packages_user">
                <div className="w-14 h-14 flex items-center justify-center">
                  <Image alt="تتبع الرزم" width={56} height={56} src="/images/package_hex_icon.png" />
                </div>
                <span className="text-lg text-gray-800">تتبع الرزم</span>
              </Link>
              <Link className="group flex flex-row-reverse items-center gap-2" href="/wallet">
                <div className="w-14 h-14 flex items-center justify-center">
                  <Image alt="المحفظة" width={56} height={56} src="/images/wallet_hex_icon.png" />
                </div>
                <span className="text-lg text-gray-800">المحفظة</span>
              </Link>
              <Link className="group flex flex-row-reverse items-center gap-2" href="/tracking_orders_regular">
                <div className="w-14 h-14 flex items-center justify-center">
                  <Image alt="تتبع الطلبات" width={56} height={56} src="/images/shopping_bag_hex_icon.png" />
                </div>
                <span className="text-lg text-gray-800">تتبع الطلبات</span>
              </Link>
            </div>
            {/* Vertical divider with bold style */}
            <div className="h-40 w-1 bg-black mx-2"></div>
            {/* Profile Icon (right side) */}
            <div className="flex justify-end">
              <div className="w-48 h-48 rounded-full bg-gray-300 flex items-center justify-center">
                <img src="/images/profile_icon.png" alt="الملف الشخصي" width={160} height={160} style={{borderRadius: '50%'}} />
              </div>
            </div>
          </div>
          {/* Green Divider */}
          <div className="h-0.5 bg-green-500 mb-8" />
        </div>
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-6 items-end">
          <div className="w-full">
            <label className="block text-gray-700 font-bold mb-1 pr-2">الاسم</label>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleInputChange} 
              disabled={!isEditing}
              className={`w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none text-right ${
                !isEditing ? 'bg-gray-100 text-gray-500' : 'bg-transparent'
              }`} 
            />
          </div>
          <div className="w-full">
            <label className="block text-gray-700 font-bold mb-1 pr-2">رقم المشترك</label>
            <input 
              type="text" 
              name="id" 
              value={profile?.id || ''} 
              disabled 
              className="w-full border-0 border-b-2 border-gray-300 bg-gray-100 text-gray-500 text-right" 
            />
          </div>
          <div className="w-full">
            <label className="block text-gray-700 font-bold mb-1 pr-2">المحافظة</label>
            <select 
              name="governorate" 
              value={formData.governorate} 
              onChange={handleInputChange} 
              disabled={!isEditing}
              className={`w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none text-right ${
                !isEditing ? 'bg-gray-100 text-gray-500' : 'bg-transparent'
              }`}
            >
              {governorates.map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-gray-700 font-bold mb-1 pr-2">رقم الهاتف</label>
            <input 
              type="text" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleInputChange} 
              disabled={!isEditing}
              className={`w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none text-right ${
                !isEditing ? 'bg-gray-100 text-gray-500' : 'bg-transparent'
              }`} 
            />
          </div>
          <div className="w-full">
            <label className="block text-gray-700 font-bold mb-1 pr-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              name="email" 
              value={profile?.email || ''} 
              disabled 
              className="w-full border-0 border-b-2 border-gray-300 bg-gray-100 text-gray-500 text-right" 
            />
          </div>
          {isEditing && (
            <>
              <div className="w-full relative">
                <label className="block text-gray-700 font-bold mb-1 pr-2">كلمة المرور الحالية</label>
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword" 
                  value={formData.currentPassword} 
                  onChange={handleInputChange} 
                  className={`w-full border-0 border-b-2 ${passwordError ? 'border-red-500' : 'border-gray-300'} focus:border-green-500 outline-none bg-transparent text-right pr-10`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute left-2 top-9 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  aria-label={showCurrentPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showCurrentPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.636-1.364M3 3l18 18" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.25 2.25A9.956 9.956 0 0022 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 1.657.403 3.22 1.125 4.575" /></svg>
                  )}
                </button>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1 text-right">{passwordError}</p>
                )}
              </div>
              <div className="w-full relative">
                <label className="block text-gray-700 font-bold mb-1 pr-2">كلمة المرور الجديدة (اختياري)</label>
                <input 
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleInputChange} 
                  className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right pr-10" 
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute left-2 top-9 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowNewPassword((v) => !v)}
                  aria-label={showNewPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.636-1.364M3 3l18 18" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.25 2.25A9.956 9.956 0 0022 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 1.657.403 3.22 1.125 4.575" /></svg>
                  )}
                </button>
              </div>
              <div className="w-full relative">
                <label className="block text-gray-700 font-bold mb-1 pr-2">تأكيد كلمة المرور الجديدة</label>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange} 
                  className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right pr-10" 
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute left-2 top-9 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.636-1.364M3 3l18 18" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.25 2.25A9.956 9.956 0 0022 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 1.657.403 3.22 1.125 4.575" /></svg>
                  )}
                </button>
              </div>
            </>
          )}
          {isRegularUser && (
            <div className="w-full">
              <label className="block text-gray-700 font-bold mb-1 pr-2">اختيار المتجر</label>
              <select 
                name="shopId" 
                value={formData.shopId} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                className={`w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none text-right ${
                  !isEditing ? 'bg-gray-100 text-gray-500' : 'bg-transparent'
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