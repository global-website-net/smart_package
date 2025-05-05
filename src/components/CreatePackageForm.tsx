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

interface Shop {
  id: string
  fullName: string
  email: string
}

interface User {
  id: string
  fullName: string
  email: string
}

interface CreatePackageFormProps {
  onSuccess: (newPackage: any) => void
  onCancel: () => void
}

export default function CreatePackageForm({ onSuccess, onCancel }: CreatePackageFormProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    trackingNumber: '',
    status: 'AWAITING_PAYMENT',
    description: '',
    shopId: '',
    userId: ''
  })

  useEffect(() => {
    fetchShops()
    fetchUsers()
  }, [])

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'SHOP')

      if (error) throw error
      setShops(data || [])
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, fullName, email')
        .eq('role', 'REGULAR')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('حدث خطأ أثناء جلب المستخدمين')
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      if (!formData.shopId || !formData.userId) {
        toast.error('الرجاء اختيار المتجر والمستخدم')
        return
      }

      const { data, error } = await supabase
        .from('package')
        .insert([{
          trackingNumber: formData.trackingNumber,
          status: formData.status,
          description: formData.description,
          shopId: formData.shopId,
          userId: formData.userId
        }])
        .select()

      if (error) throw error

      toast.success('تم إضافة الطرد بنجاح')
      onSuccess(data[0])
    } catch (error) {
      console.error('Error creating package:', error)
      toast.error('حدث خطأ أثناء إضافة الطرد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إنشاء طرد جديد</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="trackingNumber" className="text-right">
              رقم التتبع
            </label>
            <Input
              id="trackingNumber"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              className="col-span-3"
              placeholder="أدخل رقم التتبع"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right">
              الحالة
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AWAITING_PAYMENT">في انتظار الدفع</SelectItem>
                <SelectItem value="PREPARING">قيد التحضير</SelectItem>
                <SelectItem value="DELIVERING_TO_SHOP">قيد التوصيل للمتجر</SelectItem>
                <SelectItem value="IN_SHOP">في المتجر</SelectItem>
                <SelectItem value="RECEIVED">تم الاستلام</SelectItem>
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
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر المتجر" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.fullName}
                  </SelectItem>
                ))}
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
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر المستخدم" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 