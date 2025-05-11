'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import ShopEditWizard from '@/app/components/ShopEditWizard'
import { Card } from '@/components/ui/card'
import { Store } from 'lucide-react'

interface Shop {
  id: string
  fullName: string
  email: string
}

interface Package {
  id: string
  trackingNumber: string
  status: string
  shopId: string
  description: string | null
  userId: string
  createdAt: string
  updatedAt: string
  User: Shop
}

export default function UserPackagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [isShopEditWizardOpen, setIsShopEditWizardOpen] = useState(false)
  const [isShopEditOpen, setIsShopEditOpen] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

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
      // Fetch data only once when component mounts or session changes
      fetchPackages()
      fetchShops()
    }
  }, [status, session]) // Only depend on status and session changes

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
      const transformedPackages = packages.map((pkg: any) => {
        const shopData = Array.isArray(pkg.shop) ? pkg.shop[0] : pkg.shop
        return {
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          status: pkg.status,
          description: pkg.description,
          shopId: pkg.shopId,
          userId: pkg.userId,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
          User: shopData || { fullName: 'غير محدد', email: '' }
        }
      })

      console.log('Transformed packages:', transformedPackages)
      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error in fetchPackages:', error)
      setError('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const handleShopChange = async (shopId: string) => {
    if (!selectedPackageId) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('package')
        .update({ 
          shopId,
          updatedAt: new Date().toISOString()
        })
        .eq('id', selectedPackageId)

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      // Update the local state to reflect the change
      setPackages(prevPackages => 
        prevPackages.map(pkg => 
          pkg.id === selectedPackageId 
            ? { ...pkg, shopId } 
            : pkg
        )
      )

      toast.success('تم تحديث المتجر بنجاح')
      setIsShopEditOpen(false)
      setSelectedPackageId(null)
    } catch (error) {
      console.error('Error updating shop:', error)
      toast.error('حدث خطأ أثناء تحديث المتجر')
    } finally {
      setLoading(false)
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
        return 'bg-yellow-100 text-yellow-800'
      case 'DELIVERED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-yellow-100 text-yellow-800'
      case 'RETURNED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-6">تتبع الطرود</h1>
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-bold text-lg">رقم التتبع</TableHead>
                <TableHead className="text-center font-bold text-lg">المتجر</TableHead>
                <TableHead className="text-center font-bold text-lg">الحالة</TableHead>
                <TableHead className="text-center font-bold text-lg">الوصف</TableHead>
                <TableHead className="text-center font-bold text-lg">تاريخ الإنشاء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    لا توجد طرود
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="text-center">{pkg.trackingNumber}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span>{pkg.User?.fullName || 'غير محدد'}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPackageId(pkg.id)
                            setIsShopEditOpen(true)
                          }}
                          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          تعديل
                        </Button>
                      </div>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <ShopEditWizard
        isOpen={isShopEditOpen}
        onClose={() => {
          setIsShopEditOpen(false)
          setSelectedPackageId(null)
        }}
        currentShopId={selectedPackageId ? packages.find(p => p.id === selectedPackageId)?.shopId || '' : ''}
        shops={shops}
        onSave={handleShopChange}
      />
    </div>
  )
} 