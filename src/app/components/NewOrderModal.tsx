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
  name: string
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
    purchaseSite: '',
    purchaseLink: '',
    phoneNumber: '',
    notes: '',
    additionalInfo: '',
    userId: userId
  })

  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, fetching shops...')
      fetchShops()
    }
  }, [isOpen])

  const fetchShops = async () => {
    try {
      console.log('Fetching shops...')
      const { data, error } = await supabase
        .from('shop')
        .select('id, name')

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Fetched shops:', data)
      setShops(data || [])
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      if (!formData.purchaseSite) {
        toast.error('الرجاء اختيار موقع الشراء')
        return
      }

      if (!formData.purchaseLink || !isValidUrl(formData.purchaseLink)) {
        toast.error('الرجاء إدخال رابط شراء صحيح')
        return
      }

      if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber)) {
        toast.error('الرجاء إدخال رقم هاتف صحيح')
        return
      }

      const { data, error } = await supabase
        .from('order')
        .insert([{
          purchaseSite: formData.purchaseSite,
          purchaseLink: formData.purchaseLink,
          phoneNumber: formData.phoneNumber,
          notes: formData.notes,
          additionalInfo: formData.additionalInfo,
          userId: formData.userId,
          status: 'PENDING_APPROVAL'
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

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidPhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">إضافة طلب جديد</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="purchaseSite" className="text-right">
              موقع الشراء
            </label>
            <Select
              value={formData.purchaseSite}
              onValueChange={(value) => setFormData({ ...formData, purchaseSite: value })}
            >
              <SelectTrigger className="col-span-3 text-right">
                <SelectValue placeholder="اختر موقع الشراء" className="text-right" dir="rtl" />
              </SelectTrigger>
              <SelectContent className="text-right" align="end">
                {shops.length === 0 ? (
                  <SelectItem value="" disabled className="text-right">
                    لا توجد متاجر متاحة
                  </SelectItem>
                ) : (
                  shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.name} className="text-right">
                      {shop.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="purchaseLink" className="text-right">
              رابط الشراء
            </label>
            <Input
              id="purchaseLink"
              value={formData.purchaseLink}
              onChange={(e) => setFormData({ ...formData, purchaseLink: e.target.value })}
              className="col-span-3"
              placeholder="أدخل رابط الشراء"
              type="url"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="phoneNumber" className="text-right">
              رقم الهاتف
            </label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="col-span-3 text-right"
              placeholder="أدخل رقم الهاتف"
              type="tel"
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="notes" className="text-right">
              ملاحظات
            </label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="col-span-3"
              placeholder="أدخل الملاحظات"
              rows={1}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="additionalInfo" className="text-right">
              معلومات إضافية
            </label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="col-span-3"
              placeholder="أدخل المعلومات الإضافية"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
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