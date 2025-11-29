'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export interface SimpleQuestionnaireData {
  projectGoals: string;
  targetAudience: string;
  keyFeatures: string;
  timeline: string;
  budget: string;
  additionalNotes: string;
}

interface SimpleQuestionnaireFormProps {
  taskId: string;
  projectId: string;
}

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP (2-3 weeks)' },
  { value: '1-month', label: '1 Month' },
  { value: '2-3-months', label: '2-3 Months' },
  { value: 'flexible', label: 'Flexible' },
];

const BUDGET_OPTIONS = [
  { value: 'under-2k', label: 'Under $2,000' },
  { value: '2k-5k', label: '$2,000 - $5,000' },
  { value: '5k-10k', label: '$5,000 - $10,000' },
  { value: '10k-20k', label: '$10,000 - $20,000' },
  { value: 'over-20k', label: 'Over $20,000' },
];

const QUESTIONS = [
  {
    id: 'projectGoals',
    label: 'What are your main goals for this project?',
    type: 'textarea',
    required: true,
    placeholder: 'e.g., Increase online sales, improve brand visibility, streamline customer communication...',
  },
  {
    id: 'targetAudience',
    label: 'Who is your target audience?',
    type: 'textarea',
    required: true,
    placeholder: 'e.g., Small business owners aged 25-45, tech-savvy entrepreneurs...',
  },
  {
    id: 'keyFeatures',
    label: 'What key features do you need?',
    type: 'textarea',
    required: false,
    placeholder: 'e.g., User login, payment processing, admin dashboard, blog...',
  },
  {
    id: 'timeline',
    label: "What's your ideal timeline?",
    type: 'select',
    required: true,
    options: TIMELINE_OPTIONS,
  },
  {
    id: 'budget',
    label: "What's your budget range?",
    type: 'select',
    required: true,
    options: BUDGET_OPTIONS,
  },
  {
    id: 'additionalNotes',
    label: 'Any additional notes or requirements?',
    type: 'textarea',
    required: false,
    placeholder: 'Tell us anything else that might help us understand your project better...',
  },
];

export function SimpleQuestionnaireForm({ taskId, projectId }: SimpleQuestionnaireFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<SimpleQuestionnaireData>({
    projectGoals: '',
    targetAudience: '',
    keyFeatures: '',
    timeline: '',
    budget: '',
    additionalNotes: '',
  });

  const currentQuestion = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const updateField = (field: keyof SimpleQuestionnaireData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const question = QUESTIONS[currentStep];
    if (question.required && !formData[question.id as keyof SimpleQuestionnaireData]?.trim()) {
      setErrors((prev) => ({
        ...prev,
        [question.id]: `${question.label} is required`,
      }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/client/questionnaire/detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          projectId,
          responses: formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit questionnaire');
      }

      router.push('/client');
    } catch (error: any) {
      console.error('Failed to submit questionnaire:', error);
      alert(error.message || 'Failed to submit questionnaire. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getCurrentValue = () => {
    return formData[currentQuestion.id as keyof SimpleQuestionnaireData] || '';
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentQuestion.label}
              {currentQuestion.required && <span className="text-red-500">*</span>}
            </h1>

            {currentQuestion.type === 'textarea' && (
              <div className="mt-6">
                <textarea
                  value={getCurrentValue()}
                  onChange={(e) => updateField(currentQuestion.id as keyof SimpleQuestionnaireData, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  rows={6}
                  className={`w-full text-lg text-gray-900 placeholder:text-gray-400 border-0 border-b-2 focus:outline-none focus:border-blue-600 resize-none ${
                    errors[currentQuestion.id] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ borderBottomWidth: '2px' }}
                />
                {errors[currentQuestion.id] && (
                  <p className="mt-2 text-sm text-red-500">{errors[currentQuestion.id]}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">Shift ⇧ + Enter ↵ to make a line break</p>
              </div>
            )}

            {currentQuestion.type === 'select' && (
              <div className="mt-6 space-y-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField(currentQuestion.id as keyof SimpleQuestionnaireData, option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      getCurrentValue() === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg text-gray-900">{option.label}</span>
                  </button>
                ))}
                {errors[currentQuestion.id] && (
                  <p className="mt-2 text-sm text-red-500">{errors[currentQuestion.id]}</p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {currentStep === 0 ? 'Back' : 'Previous'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-lg transition-all shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : isLastStep ? (
                  'Submit'
                ) : (
                  'OK'
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
