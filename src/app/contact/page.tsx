'use client'

import { useState } from 'react'
import Image from 'next/image'
import Header from '../components/Header'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">التواصل</h1>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-48 h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600">شرح قصير عن التواصل</p>
          </div>

          {/* Contact Info Icons */}
          <div className="flex justify-center items-center mb-12 rtl" dir="rtl">
            <div className="flex-1 flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Image
                  src="/images/clock-icon.svg"
                  alt="Working Hours"
                  width={32}
                  height={32}
                  className="invert"
                />
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Image
                  src="/images/email-icon.svg"
                  alt="Email"
                  width={32}
                  height={32}
                  className="invert"
                />
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Image
                  src="/images/phone-icon.svg"
                  alt="Phone"
                  width={32}
                  height={32}
                  className="invert"
                />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="الاسم"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="البريد الألكتروني"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                required
              />
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="رقم الهاتف"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="الموضوع"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="الرسالة"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-green-500 text-right"
                required
              />
            </div>

            <div className="text-center pt-6">
              <button
                type="submit"
                className="bg-green-500 text-white px-12 py-3 rounded-full hover:bg-green-600 transition-colors"
              >
                Call To Action
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 