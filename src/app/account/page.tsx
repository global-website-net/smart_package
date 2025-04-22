'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'

interface UserProfile {
  id: string
  email: string
  fullName: string
  role: string
  createdAt: string
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [updateSuccess, setUpdateSuccess] = useState('')
  const [updateError, setUpdateError] = useState('')
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch profile')
        }

        const data = await response.json()
        setProfile(data)
        setFormData(prev => ({ ...prev, fullName: data.fullName }))
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching your profile'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUpdateSuccess('')
    setUpdateError('')

    // Validate passwords if changing password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setUpdateError('كلمات المرور الجديدة غير متطابقة')
        return
      }
      if (!formData.currentPassword) {
        setUpdateError('كلمة المرور الحالية مطلوبة لتغيير كلمة المرور')
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
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating your profile'
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
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                  {updateSuccess}
                </div>
              )}
              
              {updateError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
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
                
                {isEditing && (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-medium mb-4">تغيير كلمة المرور</h3>
                      
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end space-x-4 space-x-reverse">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        حفظ التغييرات
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      تعديل الملف الشخصي
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 