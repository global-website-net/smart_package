'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

interface User {
  id: string
  fullName: string
  email: string
}

interface Shop {
  id: string
  name: string
  email: string
}

interface CreatePackageFormProps {
  onSuccess: (newPackage: any) => void
  onCancel: () => void
}

export default function CreatePackageForm({ onSuccess, onCancel }: CreatePackageFormProps) {
  const [shops, setShops] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: 'AWAITING_PAYMENT',
    shopId: '',
    description: '',
    userId: ''
  })
  const [errors, setErrors] = useState({
    shopId: false,
    userId: false,
    status: false
  })

  useEffect(() => {
    console.log('Component mounted, fetching shops and users...')
    fetchShops()
    fetchUsers()
  }, [])

  const fetchShops = async () => {
    try {
      console.log('Starting to fetch SHOP users from API...')
      const response = await fetch('/api/users/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }
      const data = await response.json()
      console.log('Fetched SHOP users data:', data)
      if (!data || data.length === 0) {
        console.log('No SHOP users found')
        setShops([])
        toast.error('لا توجد متاجر متاحة حالياً')
      } else {
        console.log(`Found ${data.length} SHOP users`)
        setShops(data)
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
      setShops([])
      toast.error('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchUsers = async () => {
    try {
      console.log('Starting to fetch REGULAR users from API...')
      const response = await fetch('/api/users/regular')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      console.log('Fetched REGULAR users data:', data)
      if (!data || data.length === 0) {
        console.log('No REGULAR users found')
        setUsers([])
        toast.error('لا يوجد مستخدمين متاحين حالياً')
      } else {
        console.log(`Found ${data.length} REGULAR users`)
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
      toast.error('حدث خطأ أثناء جلب المستخدمين')
    }
  }

  const validateForm = () => {
    const newErrors = {
      shopId: !formData.shopId,
      userId: !formData.userId,
      status: !formData.status
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      if (!validateForm()) {
        toast.error('الرجاء ملء جميع الحقول المطلوبة')
        return
      }

      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          shopId: formData.shopId,
          description: formData.description,
          userId: formData.userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'حدث خطأ أثناء إضافة الطرد')
      }

      const data = await response.json()

      // Find the selected user and shop from their respective arrays
      const selectedUser = users.find(user => user.id === formData.userId)
      const selectedShop = shops.find(shop => shop.id === formData.shopId)
      
      // Add user and shop information to the new package
      const packageWithDetails = {
        ...data,
        user: selectedUser ? {
          id: selectedUser.id,
          email: selectedUser.email
        } : { id: '', email: '' },
        shop: selectedShop ? {
          id: selectedShop.id,
          email: selectedShop.email
        } : { id: '', email: '' }
      }

      toast.success('تم إضافة الطرد بنجاح')
      onSuccess(packageWithDetails)
      onCancel()
    } catch (error) {
      console.error('Error creating package:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الطرد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="create-package-description">
        <DialogHeader className="flex flex-col items-center justify-center">
          <DialogTitle className="text-xl font-bold text-center w-full">إنشاء طرد جديد</DialogTitle>
        </DialogHeader>
        <p id="create-package-description" className="sr-only">
          نموذج إنشاء طرد جديد
        </p>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right">
              الحالة <span className="text-red-500">*</span>
            </label>
            <div className="col-span-3">
              <Select
                value={formData.status}
                onValueChange={(value) => {
                  setFormData({ ...formData, status: value })
                  setErrors({ ...errors, status: false })
                }}
              >
                <SelectTrigger className={`text-right ${errors.status ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="اختر الحالة" className="text-right" />
                </SelectTrigger>
                <SelectContent className="text-right" align="end">
                  <SelectItem value="AWAITING_PAYMENT" className="text-right">في انتظار الدفع</SelectItem>
                  <SelectItem value="PREPARING" className="text-right">قيد التحضير</SelectItem>
                  <SelectItem value="DELIVERING_TO_SHOP" className="text-right">قيد التوصيل للمتجر</SelectItem>
                  <SelectItem value="IN_SHOP" className="text-right">في المتجر</SelectItem>
                  <SelectItem value="RECEIVED" className="text-right">تم الاستلام</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1 text-right">الحالة مطلوبة</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">
              الوصف
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3"
              placeholder="أدخل وصف الطرد"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="shopId" className="text-right">
              المتجر <span className="text-red-500">*</span>
            </label>
            <div className="col-span-3">
              <Select
                value={formData.shopId}
                onValueChange={(value) => {
                  setFormData({ ...formData, shopId: value })
                  setErrors({ ...errors, shopId: false })
                }}
              >
                <SelectTrigger className={`text-right ${errors.shopId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="اختر المتجر" className="text-right" dir="rtl" />
                </SelectTrigger>
                <SelectContent className="text-right" align="end">
                  {shops.length === 0 ? (
                    <SelectItem value="no-shops" disabled className="text-right">
                      لا توجد متاجر متاحة
                    </SelectItem>
                  ) : (
                    shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id} className="text-right">
                        {shop.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.shopId && (
                <p className="text-red-500 text-sm mt-1 text-right">المتجر مطلوب</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="userId" className="text-right">
              المستخدم <span className="text-red-500">*</span>
            </label>
            <div className="col-span-3">
              <Select
                value={formData.userId}
                onValueChange={(value) => {
                  setFormData({ ...formData, userId: value })
                  setErrors({ ...errors, userId: false })
                }}
              >
                <SelectTrigger className={`text-right ${errors.userId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="اختر المستخدم" className="text-right" dir="rtl" />
                </SelectTrigger>
                <SelectContent className="text-right" align="end">
                  {users.length === 0 ? (
                    <SelectItem value="no-users" disabled className="text-right">
                      لا يوجد مستخدمين متاحين
                    </SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-right">
                        {user.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-red-500 text-sm mt-1 text-right">المستخدم مطلوب</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 