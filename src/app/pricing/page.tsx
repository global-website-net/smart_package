'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '../components/Header'

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Basic',
      price: '$9.99',
      period: 'per month',
      features: [
        'Track up to 5 packages',
        'Basic notifications',
        'Email support',
        '7-day history'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19.99',
      period: 'per month',
      features: [
        'Track up to 20 packages',
        'Advanced notifications',
        'Priority email support',
        '30-day history',
        'Basic analytics'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$49.99',
      period: 'per month',
      features: [
        'Unlimited package tracking',
        'Custom notifications',
        '24/7 phone support',
        'Unlimited history',
        'Advanced analytics',
        'API access'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">الباقات والأسعار</h1>
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="w-96 h-0.5 bg-green-500"></div>
                <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border border-green-500 rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  tier.popular ? 'ring-2 ring-blue-500' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                {tier.popular && (
                  <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600">/{tier.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-600">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.name === 'Enterprise' ? '/contact' : '/auth/signup'}
                    className={`block w-full text-center py-3 px-4 rounded-lg font-medium ${
                      tier.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <motion.p
              className="text-gray-600 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              All plans include a 14-day free trial. No credit card required.
            </motion.p>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Need a custom plan? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link>
            </motion.p>
          </div>
        </div>
      </main>
    </div>
  )
} 