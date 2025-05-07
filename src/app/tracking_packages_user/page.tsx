'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Header from '@/app/components/Header'

interface Shop {
  id: string
  fullName: string
  email: string
}

interface Package {
  id: string
  trackingNumber: string
  description: string | null
  status: string
  userId: string
  createdAt: string
  updatedAt: string
  User: {
    id: string
    fullName: string
    email: string
  }
}

export default function UserPackagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session) {
      if (session.user.role !== 'REGULAR') {
        router.push('/')
        return
      }
      fetchPackages()
      fetchShops()
    }
  }, [status, session])

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/users/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }
      const data = await response.json()
      setShops(data)
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/packages')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }
      
      const packages = await response.json()
      console.log('Fetched packages:', packages)

      if (!packages || packages.length === 0) {
        console.log('No packages found for user')
        setPackages([])
        return
      }

      // Transform the data to match the Package interface
      const transformedPackages = packages.map((pkg: any) => ({
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        description: pkg.description,
        userId: pkg.userId,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        User: pkg.User
      }))

      console.log('Transformed packages:', transformedPackages)
      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error in fetchPackages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const handleShopChange = async (packageId: string, shopId: string) => {
    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: shopId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update package')
      }

      // Update the local state
      setPackages(packages.map(pkg => 
        pkg.id === packageId 
          ? { 
              ...pkg, 
              userId: shopId,
              User: shops.find(shop => shop.id === shopId) || pkg.User 
            }
          : pkg
      ))

      toast.success('تم تحديث المتجر بنجاح')
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error('حدث خطأ أثناء تحديث المتجر')
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'في انتظار الدفع'
      case 'PREPARING':
        return 'قيد التحضير'
      case 'DELIVERING_TO_SHOP':
        return 'قيد التوصيل للمتجر'
      case 'IN_SHOP':
        return 'في المتجر'
      case 'RECEIVED':
        return 'تم الاستلام'
      case 'PENDING':
        return 'قيد الانتظار'
      case 'IN_TRANSIT':
        return 'قيد الشحن'
      case 'DELIVERED':
        return 'تم التسليم'
      case 'CANCELLED':
        return 'ملغي'
      case 'RETURNED':
        return 'تم الإرجاع'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'RETURNED':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-right">تتبع الطرود</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">رقم التتبع</TableHead>
                <TableHead className="text-center">المتجر</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">الوصف</TableHead>
                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center">آخر تحديث</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    لا توجد طرود
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="text-center">{pkg.trackingNumber}</TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={pkg.userId}
                        onValueChange={(value) => handleShopChange(pkg.id, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="اختر المتجر">
                            {pkg.User?.fullName || 'غير محدد'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {shops.map((shop) => (
                            <SelectItem key={shop.id} value={shop.id}>
                              {shop.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                        {getStatusText(pkg.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{pkg.description || '-'}</TableCell>
                    <TableCell className="text-center">
                      {new Date(pkg.createdAt).toLocaleDateString('ar')}
                    </TableCell>
                    <TableCell className="text-center">
                      {new Date(pkg.updatedAt).toLocaleDateString('ar')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
} 