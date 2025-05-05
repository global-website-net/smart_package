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

interface NewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  userId: string
}

export default function NewOrderModal({ isOpen, onClose, onSave, userId }: NewOrderModalProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    orderNumber: '',
    status: 'PENDING_APPROVAL',
    description: '',
    shopId: '',
    userId: userId
  })

  useEffect(() => {
    if (isOpen) {
      fetchShops()
    }
  }, [isOpen])

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

  const handleSave = async () => {
    try {
      setLoading(true)

      if (!formData.shopId) {
        toast.error('الرجاء اختيار المتجر')
        return
      }

      const { data, error } = await supabase
        .from('order')
        .insert([{
          orderNumber: formData.orderNumber,
          status: formData.status,
          description: formData.description,
          shopId: formData.shopId,
          userId: formData.userId
        }])
        .select()

      if (error) throw error

      toast.success('تم إضافة الطلب بنجاح')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('حدث خطأ أثناء إضافة الطلب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة طلب جديد</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="orderNumber" className="text-right">
              رقم الطلب
            </label>
            <Input
              id="orderNumber"
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              className="col-span-3"
              placeholder="أدخل رقم الطلب"
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
            <label htmlFor="description" className="text-right">
              الوصف
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3"
              placeholder="أدخل وصف الطلب"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
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