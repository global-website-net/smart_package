'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import AsyncSelect from 'react-select/async'

interface Shop {
  id: string
  fullName: string
  email: string
}

interface ShopEditWizardProps {
  isOpen: boolean
  onClose: () => void
  currentShopId: string
  shops: Shop[]
  onSave: (shopId: string) => void
}

export default function ShopEditWizard({
  isOpen,
  onClose,
  currentShopId,
  shops,
  onSave
}: ShopEditWizardProps) {
  const [selectedShopId, setSelectedShopId] = useState(currentShopId)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!selectedShopId) {
      toast.error('الرجاء اختيار المتجر')
      return
    }

    try {
      setLoading(true)
      onSave(selectedShopId)
    } catch (error) {
      console.error('Error saving shop:', error)
      toast.error('حدث خطأ أثناء حفظ المتجر')
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center">
          <DialogTitle className="text-xl font-bold text-center w-full">تعديل المتجر</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">اختر المتجر</label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={selectedShopId ? {
                  value: selectedShopId,
                  label: shops.find(shop => shop.id === selectedShopId) 
                    ? `${shops.find(shop => shop.id === selectedShopId)?.fullName} (${shops.find(shop => shop.id === selectedShopId)?.email})`
                    : 'جاري التحميل...'
                } : null}
                onChange={(selected: any) => setSelectedShopId(selected?.value || '')}
                loadOptions={loadShops}
                placeholder="اختر المتجر..."
                className="w-full"
                classNamePrefix="select"
                isRtl
                noOptionsMessage={() => "لا توجد نتائج"}
                loadingMessage={() => "جاري التحميل..."}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={onClose}
                disabled={loading}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 