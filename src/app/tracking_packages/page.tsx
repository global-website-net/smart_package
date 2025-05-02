'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import CreatePackageForm from '@/components/CreatePackageForm'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface User {
  fullName: string
  email: string
}

interface Shop {
  name: string
}

interface Package {
  id: string
  trackingNumber: string
  description: string
  status: string
  userId: string
  shopId: string
  createdAt: string
  updatedAt: string
  user: User
  shop: Shop
}

type PackageWithRelations = Package & {
  user: User
  shop: Shop
}

export default function TrackingPackagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [packages, setPackages] = useState<PackageWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageWithRelations | null>(null)
  const [packageToDelete, setPackageToDelete] = useState<PackageWithRelations | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'OWNER')) {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchPackages()
    }
  }, [status, session])

  const fetchPackages = async () => {
    try {
      setLoading(true)

      // Get packages with user and shop information
      const { data: packages, error } = await supabase
        .from('Package')
        .select(`
          id,
          trackingNumber,
          description,
          status,
          userId,
          shopId,
          createdAt,
          updatedAt,
          user:User (
            fullName,
            email
          ),
          shop:Shop (
            name
          )
        `)
        .order('createdAt', { ascending: false })

      if (error) throw error

      if (packages) {
        setPackages(packages as unknown as PackageWithRelations[])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('حدث خطأ أثناء جلب الطرود')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('Package')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('تم حذف الطرد بنجاح')
      fetchPackages()
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error('حدث خطأ أثناء حذف الطرد')
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
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-6">إدارة الطرود</h1>
            <div className="flex justify-center items-center">
              <div className="relative w-48 sm:w-64 md:w-80">
                <div className="w-full h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button onClick={() => setShowCreateForm(true)}>
                إضافة طرد جديد
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم التتبع</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead>المتجر</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.trackingNumber}</TableCell>
                  <TableCell>{pkg.description}</TableCell>
                  <TableCell>{pkg.status}</TableCell>
                  <TableCell>{pkg.user.fullName}</TableCell>
                  <TableCell>{pkg.shop.name}</TableCell>
                  <TableCell>{new Date(pkg.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/packages/edit/${pkg.id}`)}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Package Modal */}
      {showCreateForm && (
        <CreatePackageForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={(newPackage) => {
            setPackages([newPackage, ...packages])
            setShowCreateForm(false)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف الطرد رقم {packageToDelete.trackingNumber}؟
            </p>
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <Button
                variant="outline"
                onClick={() => setPackageToDelete(null)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(packageToDelete.id)
                  setPackageToDelete(null)
                }}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 