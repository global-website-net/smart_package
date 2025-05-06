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

  useEffect(() => {
    console.log('Component mounted, fetching shops and users...')
    fetchShops()
    fetchUsers()
  }, [])

  const fetchShops = async () => {
    try {
      console.log('Starting to fetch shops from User table...')
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'SHOP')
        .order('fullName', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched shops data from User table:', data)
      if (!data || data.length === 0) {
        console.log('No SHOP users found in the User table')
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
      console.log('Starting to fetch REGULAR users from User table...')
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'REGULAR')
        .order('fullName', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched REGULAR users data from User table:', data)
      if (!data || data.length === 0) {
        console.log('No REGULAR users found in the User table')
        setUsers([])
        toast.error('لا توجد مستخدمين متاحين حالياً')
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

  const handleSave = async () => {
    try {
      setLoading(true)

      if (!formData.shopId) {
        toast.error('الرجاء اختيار المتجر')
        return
      }

      if (!formData.userId) {
        toast.error('الرجاء اختيار المستخدم')
        return
      }

      const { data, error } = await supabase
        .from('package')
        .insert([{
          status: formData.status,
          shopId: formData.shopId,
          description: formData.description,
          userId: formData.userId
        }])
        .select()

      if (error) throw error

      // Find the selected user and shop from their respective arrays
      const selectedUser = users.find(user => user.id === formData.userId)
      const selectedShop = shops.find(shop => shop.id === formData.shopId)
      
      // Add user and shop information to the new package
      const packageWithDetails = {
        ...data[0],
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
      toast.error('حدث خطأ أثناء إضافة الطرد')
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
              الحالة
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="col-span-3 text-right">
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
              المتجر
            </label>
            <Select
              value={formData.shopId}
              onValueChange={(value) => setFormData({ ...formData, shopId: value })}
            >
              <SelectTrigger className="col-span-3 text-right">
                <SelectValue placeholder="اختر المتجر" className="text-right" />
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
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="userId" className="text-right">
              المستخدم
            </label>
            <Select
              value={formData.userId}
              onValueChange={(value) => setFormData({ ...formData, userId: value })}
            >
              <SelectTrigger className="col-span-3 text-right">
                <SelectValue placeholder="اختر المستخدم" className="text-right" />
              </SelectTrigger>
              <SelectContent className="text-right" align="end">
                {users.length === 0 ? (
                  <SelectItem value="no-users" disabled className="text-right">
                    لا توجد مستخدمين متاحين
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