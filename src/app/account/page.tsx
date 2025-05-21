'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
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
      const verifyResponse = await fetch('/api/user/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.currentPassword,
        }),
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        setPasswordError('كلمة المرور الحالية غير صحيحة');
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
          currentPassword: formData.currentPassword,
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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Dubai, sans-serif' }}>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-2">الحساب الشخصي</h1>
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-56 sm:w-64 md:w-80">
            <div className="w-full h-0.5 bg-green-500"></div>
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
          </div>
        </div>
        {/* Profile and Navigation Icons Section */}
        <div className="flex flex-row items-center justify-center mb-8 gap-8">
          {/* Right: Profile Image */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <img alt="الملف الشخصي" className="w-40 h-40 rounded-full object-cover" src="/images/profile_icon.png" />
          </div>
          {/* Divider */}
          <div className="h-32 w-px bg-gray-400 mx-6" />
          {/* Left: Navigation Icons */}
          <div className="flex flex-col gap-8">
            <Link href="/tracking_packages_user" className="flex items-center gap-4">
              <img src="/images/package_hex_icon.png" alt="تتبع الرزم" className="w-10 h-10" />
              <span className="text-base font-medium">تتبع الرزم</span>
            </Link>
            <Link href="/wallet" className="flex items-center gap-4">
              <img src="/images/wallet_hex_icon.png" alt="المحفظة" className="w-10 h-10" />
              <span className="text-base font-medium">المحفظة</span>
            </Link>
            <Link href="/tracking_orders_regular" className="flex items-center gap-4">
              <img src="/images/shopping_bag_hex_icon.png" alt="تتبع الطلبات" className="w-10 h-10" />
              <span className="text-base font-medium">تتبع الطلبات</span>
            </Link>
          </div>
        </div>
        {/* Green Line */}
        <div className="flex justify-center items-center mb-8">
          <div className="w-full max-w-[600px] h-0.5 bg-green-500" />
        </div>
        {/* Profile & Navigation Section */}
        <div className="flex justify-center items-center min-h-[60vh] w-full">
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
                    type="password"
                    name="currentPassword" 
                    value={formData.currentPassword} 
                    onChange={handleInputChange} 
                    className={`w-full border-0 border-b-2 ${passwordError ? 'border-red-500' : 'border-gray-300'} focus:border-green-500 outline-none bg-transparent text-right`}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1 text-right">{passwordError}</p>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-gray-700 font-bold mb-1 pr-2">كلمة المرور الجديدة (اختياري)</label>
                  <input 
                    type="password"
                    name="newPassword" 
                    value={formData.newPassword} 
                    onChange={handleInputChange} 
                    className="w-full border-0 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent text-right" 
                  />
                </div>
                <div className="w-full">
                  <label className="block text-gray-700 font-bold mb-1 pr-2">تأكيد كلمة المرور الجديدة</label>
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
        </div>
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