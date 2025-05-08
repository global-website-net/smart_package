'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import AsyncSelect from 'react-select/async'
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

interface EditPackageModalProps {
  isOpen: boolean
  onClose: () => void
  pkg: {
    id: string
    trackingNumber: string
    status: string
    description: string | null
    shopId: string
    userId: string
  }
  onSave: (updatedPackage: {
    id: string
    trackingNumber: string
    status: string
    description: string | null
    shopId: string
    userId: string
  }) => void
  shops: Array<{ id: string; fullName: string; email: string }>
  users: Array<{ id: string; fullName: string; email: string }>
}

export default function EditPackageModal({ isOpen, onClose, pkg, onSave, shops, users }: EditPackageModalProps) {
  const [formData, setFormData] = useState({
    trackingNumber: pkg.trackingNumber,
    status: pkg.status,
    description: pkg.description || '',
    shopId: pkg.shopId,
    userId: pkg.userId
  })
  const [loading, setLoading] = useState(false)

  // Update form data when package changes
  useEffect(() => {
    if (pkg) {
      setFormData({
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        description: pkg.description || '',
        shopId: pkg.shopId,
        userId: pkg.userId
      })
    }
  }, [pkg])

  const handleSave = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: formData.trackingNumber,
          status: formData.status,
          description: formData.description || null,
          shopId: formData.shopId,
          userId: formData.userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'حدث خطأ أثناء حفظ التغييرات')
      }

      // Get the updated package data including user information
      const updatedPackage = await response.json()
      
      // Find the selected user and shop from their respective arrays
      const selectedUser = users.find(user => user.id === formData.userId)
      const selectedShop = shops.find(shop => shop.id === formData.shopId)
      
      // Add user and shop information to the updated package
      const packageWithDetails = {
        ...updatedPackage,
        user: selectedUser ? {
          id: selectedUser.id,
          fullName: selectedUser.fullName,
          email: selectedUser.email
        } : { id: '', fullName: 'غير معروف', email: '' },
        shop: selectedShop ? {
          id: selectedShop.id,
          fullName: selectedShop.fullName,
          email: selectedShop.email
        } : { id: '', fullName: 'غير معروف', email: '' }
      }

      onSave(packageWithDetails)
      onClose()
      toast.success('تم تحديث بيانات الطرد بنجاح')
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ التغييرات')
    } finally {
      setLoading(false)
    }
  }

  // Function to load shops with search
  const loadShops = async (inputValue: string) => {
    try {
      const response = await fetch('/api/users/shops')
      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }
      const data = await response.json()
      
      // Filter the shops based on input value
      const filteredShops = data.filter((shop: any) => 
        shop.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
        shop.email.toLowerCase().includes(inputValue.toLowerCase())
      )

      return filteredShops.map((shop: any) => ({
        value: shop.id,
        label: `${shop.fullName} (${shop.email})`,
        ...shop
      }))
    } catch (error) {
      console.error('Error loading shops:', error)
      return []
    }
  }

  // Function to load users with search
  const loadUsers = async (inputValue: string) => {
    try {
      const response = await fetch('/api/users/regular')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      
      // Filter the users based on input value
      const filteredUsers = data.filter((user: any) => 
        user.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
        user.email.toLowerCase().includes(inputValue.toLowerCase())
      )

      return filteredUsers.map((user: any) => ({
        value: user.id,
        label: `${user.fullName} (${user.email})`,
        ...user
      }))
    } catch (error) {
      console.error('Error loading users:', error)
      return []
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center">
          <DialogTitle className="text-xl font-bold text-center w-full">تعديل بيانات الطرد</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trackingNumber" className="text-right">
              رقم التتبع
            </Label>
            <Input
              id="trackingNumber"
              value={formData.trackingNumber}
              disabled
              className="col-span-3 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              الحالة
            </Label>
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
            <Label htmlFor="description" className="text-right">
              الوصف
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shop" className="text-right">
              المتجر
            </Label>
            <div className="col-span-3">
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={formData.shopId ? {
                  value: formData.shopId,
                  label: shops.find(shop => shop.id === formData.shopId) 
                    ? `${shops.find(shop => shop.id === formData.shopId)?.fullName} (${shops.find(shop => shop.id === formData.shopId)?.email})`
                    : 'جاري التحميل...'
                } : null}
                onChange={(selected: any) => setFormData({ ...formData, shopId: selected?.value || '' })}
                loadOptions={loadShops}
                placeholder="اختر المتجر..."
                className="w-full"
                classNamePrefix="select"
                isRtl
                noOptionsMessage={() => "لا توجد نتائج"}
                loadingMessage={() => "جاري التحميل..."}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user" className="text-right">
              المستخدم
            </Label>
            <div className="col-span-3">
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={formData.userId ? {
                  value: formData.userId,
                  label: users.find(user => user.id === formData.userId) 
                    ? `${users.find(user => user.id === formData.userId)?.fullName} (${users.find(user => user.id === formData.userId)?.email})`
                    : 'جاري التحميل...'
                } : null}
                onChange={(selected: any) => setFormData({ ...formData, userId: selected?.value || '' })}
                loadOptions={loadUsers}
                placeholder="اختر المستخدم..."
                className="w-full"
                classNamePrefix="select"
                isRtl
                noOptionsMessage={() => "لا توجد نتائج"}
                loadingMessage={() => "جاري التحميل..."}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 rtl:space-x-reverse">
        "حفظ"     <button
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
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 