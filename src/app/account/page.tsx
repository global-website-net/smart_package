'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { useSession, signOut } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@prisma/client'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

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
  const [formData, setFormData] = useState({
    fullName: '',
    governorate: '',
    town: '',
    phonePrefix: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
            // Update profile state
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

            // Update form data
            setFormData(prev => ({
              ...prev,
              fullName: userData.fullName || '',
              governorate: userData.governorate || '',
              town: userData.town || '',
              phonePrefix: userData.phonePrefix || '',
              phoneNumber: userData.phoneNumber || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }))
          } else {
            setError('لم يتم العثور على بيانات المستخدم')
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-center" />
      
      <main className="p-4 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">الحساب الشخصي</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-80 sm:w-80 md:w-96">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">الملف الشخصي</h1>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  تعديل الملف الشخصي
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {updateSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {updateSuccess}
              </div>
            )}

            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {updateError}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full p-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : ''}`}
                    />
                  </div>

                  {!isAdminOrOwner && (
                    <>
                      <div>
                        <label className="block text-gray-700 mb-2">المحافظة</label>
                        <select
                          name="governorate"
                          value={formData.governorate}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full p-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : ''}`}
                        >
                          {governorates.map((gov) => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">المدينة</label>
                        <input
                          type="text"
                          name="town"
                          value={formData.town}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full p-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-gray-700 mb-2">رقم الهاتف</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={isEditing ? formData.phoneNumber : profile?.phoneNumber || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full p-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">رمز الهاتف</label>
                    <select
                      name="phonePrefix"
                      value={isEditing ? formData.phonePrefix : profile?.phonePrefix || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full p-2 border border-gray-300 rounded-md ${!isEditing ? 'bg-gray-100' : ''}`}
                    >
                      {phonePrefixes.map((prefix) => (
                        <option key={prefix} value={prefix}>{prefix}</option>
                      ))}
                    </select>
                  </div>

                  {isEditing && (
                    <>
                      <div>
                        <label className="block text-gray-700 mb-2">كلمة المرور الحالية</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">كلمة المرور الجديدة (اختياري)</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-center items-center mt-6">
                    <div className="flex gap-4 rtl:space-x-reverse">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        disabled={isSubmitting}
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* Only show delete account section for REGULAR users */}
            {isRegularUser && !isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'جاري الحذف...' : 'حذف الحساب'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">تأكيد حذف الحساب</h2>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من رغبتك في حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-center space-x-4 rtl:space-x-reverse mt-6 gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors space-x-20"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors space-x-20"
                disabled={isDeleting}
              >
                {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 