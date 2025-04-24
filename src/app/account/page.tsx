'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { useSession } from 'next-auth/react'
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">حسابي</h1>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4 text-gray-600">جاري تحميل الملف الشخصي...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              {updateSuccess && (
                <div className="p-4 bg-green-50 text-green-800 rounded-md">
                  {updateSuccess}
                </div>
              )}
              {updateError && updateError !== 'كلمة المرور غير صحيحة' && updateError !== 'كلمات المرور الجديدة غير متطابقة' && (
                <div className="p-4 bg-red-50 text-red-800 rounded-md">
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
                
                <div className="flex justify-end space-x-24 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 