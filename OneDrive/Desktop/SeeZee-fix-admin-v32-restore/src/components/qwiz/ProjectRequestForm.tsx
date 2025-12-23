'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import type { PackageTier } from '@/lib/qwiz/packages';
import { getPackage, calculateTotals } from '@/lib/qwiz/pricing';
import { formatPhoneNumber } from '@/lib/phone-format';

interface ProjectRequestFormProps {
  selectedPackage: PackageTier;
  onClose: () => void;
  onSubmit: (data: ProjectRequestData) => Promise<void>;
}

export interface ProjectRequestData {
  name: string;
  email: string;
  phone: string;
  company: string;
  referralSource: string;
  stage: string;
  outreachProgram: string;
  projectType: string[];
  projectGoals: string;
  timeline: string;
  specialRequirements: string;
  package: PackageTier;
}

const REFERRAL_SOURCES = [
  'Instagram',
  'TikTok',
  'Friend/Referral',
  'Google',
  'Outreach Contact',
  'Other',
];

const STAGE_OPTIONS = [
  'Just exploring ideas',
  'Ready to start this month',
  'Already have a design / content ready',
];

const OUTREACH_OPTIONS = [
  "Yes, I'm a nonprofit / community project / startup with limited funds",
  "No, I'm a standard client",
];

const PROJECT_TYPE_OPTIONS = [
  'Website',
  'Web App',
  'Mobile App',
  'Branding',
  'Dashboard',
  'AI Integration',
  'Other',
];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-2-weeks', label: '1-2 weeks' },
  { value: '1-month', label: 'Within 1 month' },
  { value: '2-3-months', label: '2-3 months' },
  { value: 'flexible', label: 'Flexible / No rush' },
];

export function ProjectRequestForm({ selectedPackage, onClose, onSubmit }: ProjectRequestFormProps) {
  const { data: session } = useSession();

  const [formData, setFormData] = useState<ProjectRequestData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    company: '',
    referralSource: '',
    stage: '',
    outreachProgram: '',
    projectType: [],
    projectGoals: '',
    timeline: '',
    specialRequirements: '',
    package: selectedPackage,
  });

  // Update form data when session loads
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
    }
  }, [session]);

  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pricingInfo, setPricingInfo] = useState<{ total: number; deposit: number } | null>(null);

  // Calculate pricing when component mounts
  useEffect(() => {
    const pkg = getPackage(selectedPackage);
    const totals = calculateTotals({
      package: selectedPackage,
      selectedFeatures: pkg.baseIncludedFeatures,
      rush: false,
    });
    setPricingInfo({
      total: totals.total,
      deposit: totals.deposit,
    });
  }, [selectedPackage]);

  const QUESTIONS = [
    {
      id: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'John Doe',
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'john@example.com',
      readOnly: true,
    },
    {
      id: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: false,
      placeholder: '(555) 123-4567',
    },
    {
      id: 'company',
      label: 'Company Name',
      type: 'text',
      required: false,
      placeholder: 'Acme Inc.',
    },
    {
      id: 'referralSource',
      label: 'How did you hear about SeeZee?',
      type: 'select',
      required: false,
      options: REFERRAL_SOURCES,
    },
    {
      id: 'stage',
      label: 'What stage are you at?',
      type: 'radio',
      required: false,
      options: STAGE_OPTIONS,
    },
    {
      id: 'outreachProgram',
      label: 'Do you want to be considered for our Outreach Program?',
      type: 'radio',
      required: false,
      options: OUTREACH_OPTIONS,
    },
    {
      id: 'projectType',
      label: 'Type of Project',
      type: 'multiselect',
      required: true,
      options: PROJECT_TYPE_OPTIONS,
    },
    {
      id: 'projectGoals',
      label: 'What are your main goals for this project?',
      type: 'textarea',
      required: true,
      placeholder: 'e.g., Increase online sales, improve brand visibility, streamline customer communication...',
    },
    {
      id: 'timeline',
      label: "What's your ideal timeline?",
      type: 'select-timeline',
      required: true,
      options: TIMELINE_OPTIONS,
    },
    {
      id: 'specialRequirements',
      label: 'Any special requirements or notes?',
      type: 'textarea',
      required: false,
      placeholder: 'e.g., Need integration with existing systems, specific design preferences, accessibility requirements...',
    },
  ];

  const totalSteps = QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateField = (field: keyof ProjectRequestData, value: any) => {
    // Format phone number as user types
    const formattedValue = field === 'phone' ? formatPhoneNumber(value) : value;
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleProjectType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      projectType: prev.projectType.includes(type)
        ? prev.projectType.filter((t) => t !== type)
        : [...prev.projectType, type],
    }));
    if (errors.projectType) {
      setErrors((prev) => ({ ...prev, projectType: '' }));
    }
  };

  const getCurrentValue = () => {
    const value = formData[currentQuestion.id as keyof ProjectRequestData];
    if (currentQuestion.id === 'projectType') {
      return Array.isArray(value) ? value : [];
    }
    return value || '';
  };

  const validateCurrentStep = (): boolean => {
    if (currentQuestion.required) {
      const value = getCurrentValue();
      if (currentQuestion.id === 'projectType') {
        if (!Array.isArray(value) || value.length === 0) {
          setErrors((prev) => ({
            ...prev,
            [currentQuestion.id]: `${currentQuestion.label} is required`,
          }));
          return false;
        }
      } else if (!value || (typeof value === 'string' && !value.trim())) {
        setErrors((prev) => ({
          ...prev,
          [currentQuestion.id]: `${currentQuestion.label} is required`,
        }));
        return false;
      }
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
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create lead via API (single submission point)
      const leadResponse = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          company: formData.company,
          referralSource: formData.referralSource,
          stage: formData.stage,
          outreachProgram: formData.outreachProgram,
          projectType: formData.projectType,
          projectGoals: formData.projectGoals,
          timeline: formData.timeline,
          specialRequirements: formData.specialRequirements,
        }),
      });

      if (!leadResponse.ok) {
        const error = await leadResponse.json();
        
        // Handle specific error cases
        if (error.error?.includes('active project request')) {
          router.push('/client?message=active-request');
          return;
        }
        
        throw new Error(error.error || 'Failed to create lead');
      }

      const leadData = await leadResponse.json();
      
      // Call onSubmit callback if provided (for any additional processing)
      if (onSubmit) {
        try {
          await onSubmit(formData);
        } catch (onSubmitError) {
          // Log but don't fail if onSubmit has issues
          console.warn('onSubmit callback error:', onSubmitError);
        }
      }
      
      // If a maintenance plan was created, redirect to dashboard to show updated hours
      if (leadData.maintenancePlanId || leadData.projectId) {
        // Force a hard navigation to ensure fresh data is loaded
        window.location.href = '/client?refresh=hours';
        return;
      }
      
      // Redirect to success page with leadId
      if (leadData.leadId) {
        router.push(`/start/questionnaire/success?leadId=${leadData.leadId}`);
      } else {
        router.push('/start/questionnaire/success');
      }
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      setErrors({ submit: error.message || 'Failed to submit request. Please try again.' });
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-8 max-w-3xl mx-auto">
        {/* Back/Close Button */}
        <div className="w-full mb-8 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Return to Projects</span>
          </button>
          <div className="text-sm text-white/60">
            Question {currentStep + 1} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-12">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-trinity-red"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 w-full bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg"
          >
            <p className="font-semibold mb-1">Submission Error</p>
            <p>{errors.submit}</p>
          </motion.div>
        )}

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full glass-effect rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 p-4 sm:p-6 lg:p-8 shadow-medium hover:shadow-large"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold gradient-text mb-4 sm:mb-6">
              {currentQuestion.label}
              {currentQuestion.required && <span className="text-trinity-red">*</span>}
            </h1>

            {currentQuestion.type === 'text' && (
              <div className="mt-6">
                <input
                  type="text"
                  value={getCurrentValue() as string}
                  onChange={(e) => updateField(currentQuestion.id as keyof ProjectRequestData, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  readOnly={currentQuestion.readOnly}
                  disabled={currentQuestion.readOnly}
                  className={`w-full text-base sm:text-lg text-white placeholder:text-white/40 bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-trinity-red transition-all ${
                    errors[currentQuestion.id] ? 'border-red-500' : ''
                  } ${currentQuestion.readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                />
                {errors[currentQuestion.id] && (
                  <p className="mt-2 text-sm text-red-400">{errors[currentQuestion.id]}</p>
                )}
              </div>
            )}

            {currentQuestion.type === 'email' && (
              <div className="mt-6">
                <input
                  type="email"
                  value={getCurrentValue() as string}
                  readOnly
                  disabled
                  className="w-full text-lg text-white placeholder:text-white/40 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 cursor-not-allowed opacity-70"
                />
                <p className="mt-2 text-sm text-white/60">(from Google account)</p>
              </div>
            )}

            {currentQuestion.type === 'textarea' && (
              <div className="mt-6">
                <textarea
                  value={getCurrentValue() as string}
                  onChange={(e) => updateField(currentQuestion.id as keyof ProjectRequestData, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  rows={6}
                  className={`w-full text-lg text-white placeholder:text-white/40 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-trinity-red resize-none transition-all ${
                    errors[currentQuestion.id] ? 'border-red-500' : ''
                  }`}
                />
                {errors[currentQuestion.id] && (
                  <p className="mt-2 text-sm text-red-400">{errors[currentQuestion.id]}</p>
                )}
                <p className="mt-2 text-sm text-white/60">Shift ⇧ + Enter ↵ to make a line break</p>
              </div>
            )}

            {currentQuestion.type === 'select' && (
              <div className="mt-6">
                <select
                  value={getCurrentValue() as string}
                  onChange={(e) => updateField(currentQuestion.id as keyof ProjectRequestData, e.target.value)}
                  className={`w-full text-lg text-white bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-trinity-red transition-all cursor-pointer ${
                    errors[currentQuestion.id] ? 'border-red-500' : ''
                  }`}
                >
                  <option value="" className="bg-gray-900">Select an option...</option>
                  {(currentQuestion.options as string[])?.map((option: string) => (
                    <option key={option} value={option} className="bg-gray-900">
                      {option}
                    </option>
                  ))}
                </select>
                {errors[currentQuestion.id] && (
                  <p className="mt-2 text-sm text-red-400">{errors[currentQuestion.id]}</p>
                )}
              </div>
            )}

            {currentQuestion.type === 'select-timeline' && (
              <div className="mt-6 space-y-3">
                {(currentQuestion.options as typeof TIMELINE_OPTIONS)?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField(currentQuestion.id as keyof ProjectRequestData, option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      getCurrentValue() === option.value
                        ? 'border-trinity-red bg-trinity-red/20 text-trinity-red shadow-lg shadow-trinity-red/25'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <span className="text-lg">{option.label}</span>
                  </button>
                ))}
                {errors[currentQuestion.id] && (
                  <p className="mt-2 text-sm text-red-400">{errors[currentQuestion.id]}</p>
                )}
              </div>
            )}

            {currentQuestion.type === 'radio' && (
              <div className="mt-6 space-y-3">
                {(currentQuestion.options as string[])?.map((option: string) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField(currentQuestion.id as keyof ProjectRequestData, option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      getCurrentValue() === option
                        ? 'border-trinity-red bg-trinity-red/20 text-trinity-red shadow-lg shadow-trinity-red/25'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <span className="text-lg">{option}</span>
                  </button>
                ))}
                {errors[currentQuestion.id] && (
                  <p className="mt-2 text-sm text-red-400">{errors[currentQuestion.id]}</p>
                )}
              </div>
            )}

            {currentQuestion.type === 'multiselect' && (
              <div className="mt-6 space-y-3">
                {(currentQuestion.options as string[])?.map((option: string) => {
                  const selected = (getCurrentValue() as string[]).includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleProjectType(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selected
                          ? 'border-trinity-red bg-trinity-red/20 text-trinity-red shadow-lg shadow-trinity-red/25'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selected ? 'bg-trinity-red border-trinity-red' : 'border-gray-600'
                        }`}>
                          {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-lg">{option}</span>
                      </div>
                    </button>
                  );
                })}
                {errors[currentQuestion.id] && (
                  <p className="mt-2 text-sm text-red-400">{errors[currentQuestion.id]}</p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 text-white/70 hover:text-white font-medium transition-colors flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg"
              >
                {currentStep > 0 && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                )}
                {currentStep === 0 ? 'Back' : 'Previous'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-8 py-4 bg-trinity-red hover:bg-trinity-maroon disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-lg transition-all duration-200 shadow-medium transform hover:-translate-y-1 glow-on-hover disabled:hover:translate-y-0"
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

