'use client'

import { useState } from 'react'
import { formatPhoneNumber, getPhoneDigits, isValidPhoneNumber } from '@/lib/phone-format'

interface ContactData {
  name: string
  email: string
  company?: string
  phone?: string
}

interface ContactStepProps {
  data: ContactData
  onUpdate: (data: ContactData) => void
  onNext: () => void
  onPrev: () => void
}

export function ContactStep({ data, onUpdate, onNext, onPrev }: ContactStepProps) {
  const [formData, setFormData] = useState<ContactData>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && formData.phone.trim()) {
      const digits = getPhoneDigits(formData.phone);
      if (digits.length > 0 && digits.length !== 10) {
        newErrors.phone = 'Please enter a valid 10-digit phone number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ContactData, value: string) => {
    // Format phone number as user types
    if (field === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formatted }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      onUpdate(formData)
      onNext()
    }
  }

  const canProceed = formData.name.trim() && formData.email.trim() && validateEmail(formData.email)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Let's get your contact information</h2>
        <p className="text-white/60">
          We'll use this information to send you the quote and get in touch about your project.
        </p>
      </div>

      {/* Contact Form */}
      <div className="space-y-6 mb-8">
        {/* Name */}
        <div>
          <label className="block text-white font-medium mb-2" htmlFor="name">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="John Doe"
            className={`
              w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 
              focus:outline-none transition-all duration-200
              ${errors.name 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-white/10 focus:border-blue-500'
              }
            `}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-white font-medium mb-2" htmlFor="email">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john@example.com"
            className={`
              w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 
              focus:outline-none transition-all duration-200
              ${errors.email 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-white/10 focus:border-blue-500'
              }
            `}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block text-white font-medium mb-2" htmlFor="company">
            Company Name (Optional)
          </label>
          <input
            id="company"
            type="text"
            value={formData.company || ''}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Your Company Inc."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-blue-500 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-white font-medium mb-2" htmlFor="phone">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={`
              w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 
              focus:outline-none transition-all duration-200
              ${errors.phone 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-white/10 focus:border-blue-500'
              }
            `}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-white font-semibold mb-2">🔒 Your Privacy Matters</h3>
        <div className="text-white/80 text-sm space-y-1">
          <p>• We'll only use your information to provide your quote and communicate about this project</p>
          <p>• We never share your contact information with third parties</p>
          <p>• You can unsubscribe from communications at any time</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-8 py-3 rounded-lg font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-200"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`
            px-8 py-3 rounded-lg font-semibold transition-all duration-200
            ${canProceed
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}