'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, CheckCircle, AlertCircle } from 'lucide-react'
import { trackAssessmentComplete } from '@/components/analytics/GoogleAnalytics'

const ASSESSMENT_QUESTIONS = [
  {
    id: 'substanceFreeDays',
    question: 'How many days have you been substance-free?',
    type: 'number',
    options: [
      { value: 0, label: 'Less than 7 days' },
      { value: 1, label: '1-2 weeks' },
      { value: 2, label: '2-4 weeks' },
      { value: 3, label: '1-3 months' },
      { value: 4, label: '3-6 months' },
      { value: 5, label: '6+ months' }
    ]
  },
  {
    id: 'mentalHealthConcerns',
    question: 'Do you have mental health concerns?',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  {
    id: 'needsHousing',
    question: 'Do you need housing/shelter?',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  {
    id: 'spiritualInterest',
    question: 'Are you interested in faith-based recovery?',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  {
    id: 'priorTreatment',
    question: 'Have you received addiction treatment before?',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  {
    id: 'employment',
    question: 'Are you currently employed?',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  }
]

const PROGRAM_DESCRIPTIONS = {
  SURRENDER_PROGRAM: {
    name: "Surrender Program",
    description: "6-9 month residential recovery community",
    details: "Immerse yourself in a peer-driven recovery community with 24/7 support, daily classes, meals, and structured activities."
  },
  MINDBODYSOUL_IOP: {
    name: "MindBodySoul IOP",
    description: "Intensive Outpatient Treatment",
    details: "Clinical treatment combining therapy, psychiatry, and holistic wellness while maintaining your current living situation."
  },
  MOVING_MOUNTAINS: {
    name: "Moving Mountains Ministry",
    description: "Faith-based recovery program",
    details: "Christian-centered recovery focusing on spiritual transformation and building a relationship with Christ."
  },
  DUI_CLASSES: {
    name: "DUI Education & Supervision",
    description: "Court-ordered DUI education program",
    details: "Court-approved DUI/DWAI education and supervision program for individuals with driving-related violations."
  }
}

export default function Assessment() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recommendedProgram, setRecommendedProgram] = useState('')
  const [showResult, setShowResult] = useState(false)

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = async () => {
    if (currentStep === ASSESSMENT_QUESTIONS.length - 1) {
      // Submit assessment
      setLoading(true)
      setError('')
      try {
        const response = await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers })
        })

        if (!response.ok) {
          throw new Error('Failed to save assessment')
        }

        const data = await response.json()
        setRecommendedProgram(data.recommendedProgram)
        trackAssessmentComplete(data.recommendedProgram)
        setShowResult(true)
      } catch (err) {
        setError('Failed to save your assessment. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  if (showResult) {
    const program = PROGRAM_DESCRIPTIONS[recommendedProgram as keyof typeof PROGRAM_DESCRIPTIONS]

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>

            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Recommended Program:</h2>
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{program?.name}</h3>
              <p className="text-gray-600 mb-4">{program?.description}</p>
              <p className="text-gray-700 leading-relaxed">{program?.details}</p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">Ready to take the next step? Our team will help you get started.</p>
              <div className="flex gap-4 flex-col">
                <Link href="/admission" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  Continue to Admission
                </Link>
                <Link href="/dashboard" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const question = ASSESSMENT_QUESTIONS[currentStep]
  const progress = ((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-blue-600 font-semibold mb-8 inline-block hover:text-blue-700">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Application for Services</h1>
              <span className="text-sm text-gray-600">{currentStep + 1} of {ASSESSMENT_QUESTIONS.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h2>

            {question.type === 'number' && (
              <div className="space-y-3">
                {question.options?.map((option: any) => (
                  <label key={option.value} className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition" style={{borderColor: answers[question.id] === option.value ? '#2563eb' : '#e5e7eb'}}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={() => handleAnswer(question.id, option.value)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-4 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'boolean' && (
              <div className="grid grid-cols-2 gap-4">
                {question.options?.map((option: any) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className={`p-4 sm:p-6 rounded-lg font-semibold transition ${
                      answers[question.id] === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={answers[question.id] === undefined || loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Saving...' : currentStep === ASSESSMENT_QUESTIONS.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
