'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { useSession, signOut } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const isAdminOrOwner = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      const fetchProfile = async () => {
        try {
          const { data: userData, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', session.user.email)
            .single()

          if (error) throw error
          if (userData) {
            setProfile(userData)
            setFormData({
              ...formData,
              fullName: userData.fullName || '',
              governorate: userData.governorate || '',
              town: userData.town || '',
              phonePrefix: userData.phonePrefix || '',
              phoneNumber: userData.phoneNumber || '',
            })
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
          setError('حدث خطأ أثناء جلب بيانات الملف الشخصي')
        } finally {
          setIsLoading(false)
        }
      }

      fetchProfile()
    }
  }, [status, session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUpdateSuccess('')
    setUpdateError('')

    // Validate current password if editing
    if (isEditing && !formData.currentPassword) {
      setUpdateError('كلمة المرور الحالية مطلوبة للتعديل')
      return
    }

    // Validate passwords if changing password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setUpdateError('كلمات المرور الجديدة غير متطابقة')
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
        if (errorData.error === 'Invalid password') {
          setUpdateError('كلمة المرور غير صحيحة')
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
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Sign out the user
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Error deleting account:', error)
      setError('حدث خطأ أثناء حذف الحساب')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">الملف الشخصي</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  تعديل الملف الشخصي
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            {updateSuccess && (
              <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
                {updateSuccess}
              </div>
            )}

            {updateError && updateError !== 'كلمة المرور غير صحيحة' && updateError !== 'كلمات المرور الجديدة غير متطابقة' && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
                {updateError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">لا يمكن تغيير البريد الإلكتروني</p>
              </div>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                />
              </div>

              {!isAdminOrOwner && (
                <>
                  <div>
                    <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-1">
                      المحافظة
                    </label>
                    {isEditing ? (
                      <select
                        id="governorate"
                        name="governorate"
                        value={formData.governorate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="القدس">القدس</option>
                        <option value="رام الله والبيرة">رام الله والبيرة</option>
                        <option value="بيت لحم">بيت لحم</option>
                        <option value="الخليل">الخليل</option>
                        <option value="أريحا">أريحا</option>
                        <option value="نابلس">نابلس</option>
                        <option value="طولكرم">طولكرم</option>
                        <option value="قلقيلية">قلقيلية</option>
                        <option value="سلفيت">سلفيت</option>
                        <option value="جنين">جنين</option>
                        <option value="طوباس">طوباس</option>
                        <option value="غزة">غزة</option>
                        <option value="شمال غزة">شمال غزة</option>
                        <option value="دير البلح">دير البلح</option>
                        <option value="خان يونس">خان يونس</option>
                        <option value="رفح">رفح</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="governorate"
                        value={formData.governorate || 'لم يتم تحديد المحافظة'}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-1">
                      المدينة
                    </label>
                    <input
                      type="text"
                      id="town"
                      name="town"
                      value={formData.town}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="phonePrefix" className="block text-sm font-medium text-gray-700 mb-1">
                    رمز الهاتف
                  </label>
                  <select
                    id="phonePrefix"
                    name="phonePrefix"
                    value={formData.phonePrefix}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  >
                    <option value="+972">+972</option>
                    <option value="+970">+970</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium mb-4">تأكيد التعديلات</h3>
                    
                    <div className="mb-4">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        كلمة المرور الحالية
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          updateError === 'كلمة المرور غير صحيحة' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="أدخل كلمة المرور الحالية للتأكيد"
                      />
                      {updateError === 'كلمة المرور غير صحيحة' && (
                        <p className="mt-2 text-sm text-red-600">
                          كلمة المرور غير صحيحة
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium mb-4">تغيير كلمة المرور (اختياري)</h3>
                    
                    <div className="mb-4">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          updateError === 'كلمات المرور الجديدة غير متطابقة' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="كلمة المرور الجديدة"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          updateError === 'كلمات المرور الجديدة غير متطابقة' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="تأكيد كلمة المرور الجديدة"
                      />
                      {updateError === 'كلمات المرور الجديدة غير متطابقة' && (
                        <p className="mt-2 text-sm text-red-600">
                          {updateError}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {isEditing && (
                <div className="flex justify-end space-x-16 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-red-600 mb-4">حذف الحساب</h2>
            <p className="text-gray-600 mb-4">
              حذف حسابك سيمحي جميع بياناتك بشكل نهائي ولا يمكن استعادتها.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              حذف الحساب
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-red-600 mb-4">تأكيد حذف الحساب</h3>
                <p className="text-gray-600 mb-6">
                  هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء سيمحي حسابك بشكل نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك وستفقد الوصول إلى جميع الخدمات المرتبطة بحسابك.
                </p>
                <div className="flex justify-center space-x-16 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    نعم، احذف حسابي
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 