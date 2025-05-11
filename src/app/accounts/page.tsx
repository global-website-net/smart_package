'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  fullName: string
  email: string
  governorate: string | null
  town: string | null
  phonePrefix: string | null
  phoneNumber: string | null
  role: string
  createdAt: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AccountsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 30,
    totalPages: 1
  })
  const [fullNameFilter, setFullNameFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      // Check if user is ADMIN or OWNER
      if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'OWNER') {
        router.push('/')
        return
      }

      fetchUsers(currentPage)
    }
  }, [status, currentPage])

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/users?page=${page}`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('حدث خطأ أثناء جلب الحسابات')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // Filtered users based on filters
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(fullNameFilter.toLowerCase()) &&
    user.email.toLowerCase().includes(emailFilter.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">جميع الحسابات</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-32 sm:w-48 md:w-64">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {users.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">لا توجد حسابات حتى الآن</p>
            </div>
          ) : (
            <>
              {/* Filter Inputs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-center">
                <input
                  type="text"
                  placeholder="فلتر حسب الاسم الكامل"
                  value={fullNameFilter}
                  onChange={e => setFullNameFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 w-64 text-right"
                />
                <input
                  type="text"
                  placeholder="فلتر حسب البريد الإلكتروني"
                  value={emailFilter}
                  onChange={e => setEmailFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 w-64 text-right"
                />
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          الاسم الكامل
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          البريد الإلكتروني
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          المحافظة
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          المدينة
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          رقم الهاتف
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          الدور
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                          تاريخ التسجيل
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {user.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {user.governorate || 'غير متوفر'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {user.town || 'غير متوفر'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {user.phonePrefix && user.phoneNumber 
                              ? `${user.phonePrefix.substring(1)}-${user.phoneNumber}`
                              : 'غير متوفر'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {user.role === 'ADMIN' ? 'مدير' : 
                             user.role === 'OWNER' ? 'مالك' : 
                             user.role === 'REGULAR' ? 'مستخدم' : 
                             user.role === 'SHOP' ? 'متجر' : user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="mt-4 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  السابق
                </Button>
                <div className="min-w-[120px] text-center">
                  <span className="text-sm font-bold text-gray-600">
                    الصفحة {currentPage} من {pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPages}
                  className="flex items-center"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 