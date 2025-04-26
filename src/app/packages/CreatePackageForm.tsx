import React, { useState } from 'react';

interface FormData {
  trackingNumber: string;
  status: string;
  shopId: string;
  currentLocation: string;
  userId: string;
  scannerCode: string;
}

const [formData, setFormData] = useState<FormData>({
  trackingNumber: '',
  status: 'PENDING',
  shopId: '',
  currentLocation: '',
  userId: '',
  scannerCode: '',
});

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prevData => ({
    ...prevData,
    [name]: value
  }));
};

<div className="space-y-4">
  <div>
    <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">
      رقم التتبع
    </label>
    <input
      type="text"
      id="trackingNumber"
      name="trackingNumber"
      value={formData.trackingNumber}
      onChange={handleInputChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
      required
    />
  </div>

  <div>
    <label htmlFor="scannerCode" className="block text-sm font-medium text-gray-700">
      رمز الماسح
    </label>
    <input
      type="text"
      id="scannerCode"
      name="scannerCode"
      value={formData.scannerCode}
      onChange={handleInputChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
      placeholder="أدخل رمز الماسح (اختياري)"
    />
  </div>
</div> 