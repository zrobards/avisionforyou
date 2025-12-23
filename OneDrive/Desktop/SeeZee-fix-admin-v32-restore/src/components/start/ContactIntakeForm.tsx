'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiAlertCircle } from 'react-icons/fi';
import { ServiceCategory } from '@prisma/client';
import { getServiceCategoryDisplayName } from '@/lib/service-mapping';
import { formatPhoneNumber } from '@/lib/phone-format';

interface ContactIntakeFormProps {
  serviceType: ServiceCategory;
  tier?: string | null;
}

interface FormData {
  // Organization Information
  organizationName: string;
  organizationType: string;
  currentWebsite: string;
  nonprofitStatus: string; // 'yes' | 'no' | 'not-sure'
  nonprofitEIN: string;
  
  // Contact Information
  name: string;
  role: string;
  email: string;
  phone: string;
  bestTimeToCall: string;
  
  // Project Details
  selectedTier: string;
  pricing: string;
  budget: string; // For non-nonprofit services
  pricingComfort: string; // 'yes' | 'discuss-discount' | 'custom-quote'
  goals: string;
  importantFeatures: string[];
  otherFeature: string;
  
  // Timeline & Content
  timeline: string;
  contentReadiness: string; // 'ready' | 'partial' | 'need-help'
  
  // Maintenance-specific
  maintenanceTier: string;
  maintenanceNeeds: string[];
  urgency: string;
  websiteUrl: string;
  websitePlatform: string;
  hasAccessCredentials: string;
  
  // Additional
  attachments: File[];
  additionalNotes: string;
}

// Tier information mapping
const TIER_INFO: Record<string, { name: string; buildPrice: string; monthlyPrice: string }> = {
  essentials: {
    name: 'Tier 1 - Nonprofit Essentials',
    buildPrice: '$6,000',
    monthlyPrice: '$500/month',
  },
  director: {
    name: 'Tier 2 - Digital Director Platform',
    buildPrice: '$7,500',
    monthlyPrice: '$750/month',
  },
  coo: {
    name: 'Tier 3 - Digital COO System',
    buildPrice: '$12,500',
    monthlyPrice: '$2,000/month',
  },
};

const ORGANIZATION_TYPES = [
  '501(c)(3) Nonprofit',
  'Support Group (AA, NA, Al-Anon, etc.)',
  'Mental Health Organization',
  'Recovery Program',
  'Community Group',
  'Faith-Based Organization',
  'Other',
];

const NONPROFIT_STATUS_OPTIONS = [
  'Yes (I have an EIN)',
  "No, but we're a community/support group",
  'Not sure',
];

const PRICING_COMFORT_OPTIONS = [
  'Yes, this fits our budget',
  'We need to discuss nonprofit discounts',
  'We need a custom quote',
];

const IMPORTANT_FEATURES = [
  'Donation system',
  'Event scheduling & RSVPs',
  'Email reminders',
  'Admin dashboard',
  'Volunteer management',
  'Blog/news updates',
  'Resource directory',
  'Member portal',
];

// Maintenance Plan Options - matches NONPROFIT_TIERS config
const MAINTENANCE_TIERS = [
  {
    id: 'essentials',
    name: 'Nonprofit Essentials',
    price: '$500/month',
    hours: '8 hours/month',
    features: [
      'Managed hosting & SSL certificate',
      'Security & plugin updates',
      'Daily automated backups',
      'Email support',
      'Performance monitoring',
      '8 hours of support work per month',
    ],
  },
  {
    id: 'director',
    name: 'Digital Director Platform',
    price: '$750/month',
    hours: '16 hours/month',
    features: [
      'Everything in Essentials',
      'Priority support',
      'Extended content updates',
      'Monthly analytics & SEO reports',
      'Up to 16 hours of support work per month',
    ],
  },
  {
    id: 'coo',
    name: 'Digital COO System',
    price: '$2,000/month',
    hours: 'Unlimited hours/month',
    features: [
      'Everything in Director',
      'Unlimited support hours',
      '24/7 emergency support',
      'Strategy consultation calls',
      'Dedicated support team',
      'Unlimited change requests',
    ],
  },
];

const MAINTENANCE_NEEDS = [
  'Bug fixes & troubleshooting',
  'Security updates',
  'Content updates',
  'Design changes',
  'New feature development',
  'Performance optimization',
  'SEO improvements',
  'Backup & recovery',
  'Hosting management',
  'Other',
];

const URGENCY_OPTIONS = [
  'Immediately - I have urgent issues',
  'This week',
  'Within 2 weeks',
  'Flexible / Planning ahead',
];

const BEST_TIME_TO_CALL = [
  'Morning (9am-12pm)',
  'Afternoon (12pm-5pm)',
  'Evening (5pm-7pm)',
  'Anytime',
];

const TIMELINE_OPTIONS = [
  'ASAP (1-2 weeks)',
  'Within 1 month',
  'Within 2-3 months',
  'Flexible / Planning ahead',
];

const CONTENT_READINESS_OPTIONS = [
  'Yes, ready to go',
  'Partially ready',
  'Need help creating content',
];

export default function ContactIntakeForm({ serviceType, tier }: ContactIntakeFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isNonprofit = serviceType === ServiceCategory.NONPROFIT_WEBSITE;
  const isMaintenance = serviceType === ServiceCategory.MAINTENANCE_PLAN;
  
  // Get tier information
  const tierInfo = tier ? TIER_INFO[tier] : null;
  const selectedTierName = tierInfo?.name || '';
  const pricingDisplay = tierInfo ? `${tierInfo.buildPrice} build + ${tierInfo.monthlyPrice} maintenance` : '';

  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    organizationType: '',
    currentWebsite: '',
    nonprofitStatus: '',
    nonprofitEIN: '',
    name: session?.user?.name || '',
    role: '',
    email: session?.user?.email || '',
    phone: '',
    bestTimeToCall: '',
    selectedTier: selectedTierName,
    pricing: pricingDisplay,
    budget: '',
    pricingComfort: '',
    goals: '',
    importantFeatures: [],
    otherFeature: '',
    timeline: '',
    contentReadiness: '',
    // Maintenance fields
    maintenanceTier: '',
    maintenanceNeeds: [],
    urgency: '',
    websiteUrl: '',
    websitePlatform: '',
    hasAccessCredentials: '',
    // Additional
    attachments: [],
    additionalNotes: '',
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

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Format phone number as user types
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleCheckboxChange = (feature: string, fieldName: 'importantFeatures' | 'maintenanceNeeds' = 'importantFeatures') => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].includes(feature)
        ? prev[fieldName].filter((f) => f !== feature)
        : [...prev[fieldName], feature],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalSize = [...files, ...newFiles].reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        setError('Total file size cannot exceed 10MB');
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (isNonprofit) {
      // Nonprofit-specific validation
      if (!formData.organizationName || !formData.organizationType || !formData.name || 
          !formData.email || !formData.phone || !formData.pricingComfort || 
          !formData.goals || formData.importantFeatures.length === 0 || 
          !formData.timeline || !formData.contentReadiness) {
        setError('Please fill in all required fields');
        return false;
      }
    } else if (isMaintenance) {
      // Maintenance-specific validation
      if (!formData.name || !formData.email || !formData.websiteUrl || 
          formData.maintenanceNeeds.length === 0 || !formData.urgency) {
        setError('Please fill in all required fields');
        return false;
      }
    } else {
      // Standard validation
      if (!formData.name || !formData.email || !formData.goals) {
        setError('Please fill in all required fields');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files if any
      let fileUrls: string[] = [];
      if (files.length > 0) {
        // TODO: Implement file upload to Vercel Blob
        console.log('File upload not yet implemented:', files);
      }

      // Prepare submission data
      const submissionData: any = {
        serviceType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        projectGoals: formData.goals,
        timeline: formData.timeline,
        attachments: fileUrls,
      };

      // Add nonprofit-specific fields
      if (isNonprofit) {
        submissionData.company = formData.organizationName;
        submissionData.organizationType = formData.organizationType;
        submissionData.currentWebsite = formData.currentWebsite;
        submissionData.nonprofitStatus = formData.nonprofitStatus;
        submissionData.nonprofitEIN = formData.nonprofitEIN;
        submissionData.role = formData.role;
        submissionData.bestTimeToCall = formData.bestTimeToCall;
        submissionData.selectedTier = formData.selectedTier;
        submissionData.pricing = formData.pricing;
        submissionData.pricingComfort = formData.pricingComfort;
        submissionData.importantFeatures = formData.importantFeatures;
        submissionData.otherFeature = formData.otherFeature;
        submissionData.contentReadiness = formData.contentReadiness;
        submissionData.additionalNotes = formData.additionalNotes;
        submissionData.tier = tier;
      } else if (isMaintenance) {
        // Maintenance-specific fields
        submissionData.projectGoals = `Maintenance needs: ${formData.maintenanceNeeds.join(', ')}\n\nDetails: ${formData.goals || 'Not specified'}`;
        submissionData.currentWebsite = formData.websiteUrl;
        submissionData.websiteUrl = formData.websiteUrl;
        submissionData.websitePlatform = formData.websitePlatform;
        submissionData.hasAccessCredentials = formData.hasAccessCredentials;
        submissionData.maintenanceNeeds = formData.maintenanceNeeds;
        submissionData.maintenanceTier = formData.maintenanceTier;
        submissionData.urgency = formData.urgency;
        submissionData.additionalNotes = formData.additionalNotes;
        submissionData.timeline = formData.urgency; // Use urgency as timeline for maintenance
      } else {
        // Standard form fields
        submissionData.company = formData.organizationName || '';
        submissionData.budget = formData.budget;
      }

      // Submit lead data
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit form');
      }

      // Redirect based on authentication
      if (session?.user) {
        router.push('/client');
      } else {
        router.push('/start/success?redirectTo=/client');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="glass-container rounded-2xl p-8 max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          {isNonprofit && tierInfo 
            ? `Nonprofit Website - ${tierInfo.name.split(' - ')[1]}` 
            : isMaintenance 
              ? 'Website Maintenance Plan'
              : getServiceCategoryDisplayName(serviceType)}
        </h2>
        <p className="text-gray-300">
          {isMaintenance 
            ? "Tell us about your website and what kind of support you need. We'll set you up with the perfect plan."
            : "Fill out this form and we'll contact you within 24 hours."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* SECTION: Maintenance Website Info (Maintenance only) */}
        {isMaintenance && (
          <div className="space-y-6 border-b border-gray-700 pb-8">
            <h3 className="text-xl font-semibold text-white">Your Website</h3>
            
            {/* Website URL */}
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Website URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                required
                value={formData.websiteUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Website Platform */}
            <div>
              <label htmlFor="websitePlatform" className="block text-sm font-medium text-gray-300 mb-2">
                What platform is your website built on?
              </label>
              <select
                id="websitePlatform"
                name="websitePlatform"
                value={formData.websitePlatform}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              >
                <option value="">Select platform...</option>
                <option value="wordpress" className="bg-gray-900">WordPress</option>
                <option value="shopify" className="bg-gray-900">Shopify</option>
                <option value="squarespace" className="bg-gray-900">Squarespace</option>
                <option value="wix" className="bg-gray-900">Wix</option>
                <option value="nextjs" className="bg-gray-900">Next.js / React</option>
                <option value="custom" className="bg-gray-900">Custom Built</option>
                <option value="unknown" className="bg-gray-900">I'm not sure</option>
                <option value="other" className="bg-gray-900">Other</option>
              </select>
            </div>

            {/* Access Credentials */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Do you have admin/login access to your website?
              </label>
              <div className="space-y-2">
                {['Yes, I have full access', 'Yes, but limited access', 'No, I need help getting access', "I'm not sure"].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="radio"
                      name="hasAccessCredentials"
                      value={option}
                      checked={formData.hasAccessCredentials === option}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-trinity-red focus:ring-trinity-red"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Maintenance Needs (Maintenance only) */}
        {isMaintenance && (
          <div className="space-y-6 border-b border-gray-700 pb-8">
            <h3 className="text-xl font-semibold text-white">What Do You Need Help With?</h3>
            
            {/* Maintenance Needs Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select all that apply <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MAINTENANCE_NEEDS.map((need) => (
                  <label
                    key={need}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.maintenanceNeeds.includes(need)}
                      onChange={() => handleCheckboxChange(need, 'maintenanceNeeds')}
                      className="w-4 h-4 text-trinity-red focus:ring-trinity-red rounded"
                    />
                    <span className="text-white text-sm">{need}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Describe Issues */}
            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-300 mb-2">
                Describe your needs in more detail
              </label>
              <textarea
                id="goals"
                name="goals"
                rows={4}
                value={formData.goals}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent resize-none"
                placeholder="Tell us more about the issues you're experiencing or changes you need..."
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                How soon do you need help? <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {URGENCY_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={option}
                      checked={formData.urgency === option}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-trinity-red focus:ring-trinity-red"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Maintenance Tier Selection (Maintenance only) */}
        {isMaintenance && (
          <div className="space-y-6 border-b border-gray-700 pb-8">
            <h3 className="text-xl font-semibold text-white">Choose Your Plan (Optional)</h3>
            <p className="text-gray-400 text-sm">Not sure? We'll recommend the best plan after reviewing your needs.</p>
            
            <div className="grid gap-4">
              {MAINTENANCE_TIERS.map((tierOption) => (
                <label
                  key={tierOption.id}
                  className={`block p-4 border rounded-xl cursor-pointer transition-all ${
                    formData.maintenanceTier === tierOption.id
                      ? 'border-trinity-red bg-trinity-red/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="maintenanceTier"
                      value={tierOption.id}
                      checked={formData.maintenanceTier === tierOption.id}
                      onChange={handleInputChange}
                      className="w-4 h-4 mt-1 text-trinity-red focus:ring-trinity-red"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{tierOption.name}</span>
                        <span className="text-trinity-red font-bold">{tierOption.price}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{tierOption.hours}</p>
                      <ul className="space-y-1">
                        {tierOption.features.map((feature, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                            <span className="text-green-400">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </label>
              ))}
              
              {/* Custom/Not sure option */}
              <label
                className={`block p-4 border rounded-xl cursor-pointer transition-all ${
                  formData.maintenanceTier === 'custom'
                    ? 'border-trinity-red bg-trinity-red/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="maintenanceTier"
                    value="custom"
                    checked={formData.maintenanceTier === 'custom'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-trinity-red focus:ring-trinity-red"
                  />
                  <div>
                    <span className="font-semibold text-white">I'm not sure / Need custom quote</span>
                    <p className="text-gray-400 text-sm">We'll recommend the best option for you</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* SECTION 1: Organization Information (Nonprofit only) */}
        {isNonprofit && (
          <div className="space-y-6 border-b border-gray-700 pb-8">
            <h3 className="text-xl font-semibold text-white">Organization Information</h3>
            
            {/* Organization Name */}
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300 mb-2">
                Organization Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                required
                value={formData.organizationName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                placeholder="Your Organization"
              />
            </div>

            {/* Organization Type */}
            <div>
              <label htmlFor="organizationType" className="block text-sm font-medium text-gray-300 mb-2">
                Organization Type <span className="text-red-400">*</span>
              </label>
              <select
                id="organizationType"
                name="organizationType"
                required
                value={formData.organizationType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              >
                <option value="">Select organization type...</option>
                {ORGANIZATION_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-gray-900">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Website */}
            <div>
              <label htmlFor="currentWebsite" className="block text-sm font-medium text-gray-300 mb-2">
                Current Website (if you have one)
              </label>
              <input
                type="url"
                id="currentWebsite"
                name="currentWebsite"
                value={formData.currentWebsite}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                placeholder="https://yourorg.org"
              />
            </div>

            {/* 501(c)(3) Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Are you a registered 501(c)(3) nonprofit? <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {NONPROFIT_STATUS_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="radio"
                      name="nonprofitStatus"
                      value={option}
                      checked={formData.nonprofitStatus === option}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-trinity-red focus:ring-trinity-red"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* EIN (conditional) */}
            {formData.nonprofitStatus === 'Yes (I have an EIN)' && (
              <div>
                <label htmlFor="nonprofitEIN" className="block text-sm font-medium text-gray-300 mb-2">
                  If yes, what's your EIN? (optional)
                </label>
                <input
                  type="text"
                  id="nonprofitEIN"
                  name="nonprofitEIN"
                  value={formData.nonprofitEIN}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                  placeholder="XX-XXXXXXX"
                />
                <p className="mt-1 text-xs text-gray-400">This helps us verify nonprofit discounts</p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: Contact Information */}
        <div className="space-y-6 border-b border-gray-700 pb-8">
          <h3 className="text-xl font-semibold text-white">Contact Information</h3>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          {/* Role (Nonprofit only) */}
          {isNonprofit && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Your Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                placeholder="e.g., Executive Director, Program Manager"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              readOnly={!!session?.user?.email}
              disabled={!!session?.user?.email}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="john@example.com"
            />
            {session?.user?.email && (
              <p className="mt-1 text-xs text-gray-400">(from your account)</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required={isNonprofit}
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Best Time to Call (Nonprofit only) */}
          {isNonprofit && (
            <div>
              <label htmlFor="bestTimeToCall" className="block text-sm font-medium text-gray-300 mb-2">
                Best Time to Call
              </label>
              <select
                id="bestTimeToCall"
                name="bestTimeToCall"
                value={formData.bestTimeToCall}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              >
                <option value="">Select best time...</option>
                {BEST_TIME_TO_CALL.map((time) => (
                  <option key={time} value={time} className="bg-gray-900">
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* SECTION 3: Project Details (Not for Maintenance) */}
        {!isMaintenance && (
        <div className="space-y-6 border-b border-gray-700 pb-8">
          <h3 className="text-xl font-semibold text-white">Project Details</h3>
          
          {/* Selected Tier & Pricing (Nonprofit only, read-only) */}
          {isNonprofit && tierInfo && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Selected Tier (read-only)
                </label>
                <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300">
                  {formData.selectedTier}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pricing (read-only)
                </label>
                <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300">
                  {formData.pricing}
                </div>
              </div>

              {/* Pricing Comfort */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Are you comfortable with this pricing? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {PRICING_COMFORT_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <input
                        type="radio"
                        name="pricingComfort"
                        value={option}
                        checked={formData.pricingComfort === option}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-trinity-red focus:ring-trinity-red"
                      />
                      <span className="text-white">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Project Goals / What are you trying to accomplish */}
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-gray-300 mb-2">
              {isNonprofit ? 'What are you trying to accomplish?' : 'Project Goals'} <span className="text-red-400">*</span>
            </label>
            <textarea
              id="goals"
              name="goals"
              required
              rows={5}
              value={formData.goals}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent resize-none"
              placeholder={isNonprofit 
                ? "Tell us about your organization and what you need. For example: We're a mental health support group that needs event scheduling and donation collection for our weekly meetings and annual fundraiser."
                : "Tell us what you're looking to achieve with this project..."
              }
            />
            {isNonprofit && (
              <p className="mt-1 text-xs text-gray-400">3-5 sentences</p>
            )}
          </div>

          {/* Important Features (Nonprofit only) */}
          {isNonprofit && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Which features are most important to you? <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {IMPORTANT_FEATURES.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.importantFeatures.includes(feature)}
                      onChange={() => handleCheckboxChange(feature)}
                      className="w-4 h-4 text-trinity-red focus:ring-trinity-red rounded"
                    />
                    <span className="text-white">{feature}</span>
                  </label>
                ))}
              </div>
              
              {/* Other Feature */}
              <div className="mt-4">
                <label htmlFor="otherFeature" className="block text-sm font-medium text-gray-300 mb-2">
                  Other:
                </label>
                <input
                  type="text"
                  id="otherFeature"
                  name="otherFeature"
                  value={formData.otherFeature}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                  placeholder="Specify other feature..."
                />
              </div>
            </div>
          )}

          {/* Budget Range (Non-profit only if no tier selected, otherwise hidden) */}
          {!isNonprofit && (
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                Budget Range
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              >
                <option value="">Select a range...</option>
                <option value="micro" className="bg-gray-900">Under $1,000</option>
                <option value="small" className="bg-gray-900">$1,000 - $5,000</option>
                <option value="medium" className="bg-gray-900">$5,000 - $20,000</option>
                <option value="large" className="bg-gray-900">$20,000+</option>
              </select>
            </div>
          )}
        </div>
        )}

        {/* SECTION 4: Timeline & Content (Not for Maintenance) */}
        {!isMaintenance && (
        <div className="space-y-6 border-b border-gray-700 pb-8">
          <h3 className="text-xl font-semibold text-white">Timeline & Content</h3>
          
          {/* Timeline */}
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">
              When do you need this launched? <span className="text-red-400">*</span>
            </label>
            <select
              id="timeline"
              name="timeline"
              required={isNonprofit}
              value={formData.timeline}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
            >
              <option value="">Select timeline...</option>
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-gray-900">
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Content Readiness (Nonprofit only) */}
          {isNonprofit && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Do you have existing content? (logo, photos, text) <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {CONTENT_READINESS_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="radio"
                      name="contentReadiness"
                      value={option}
                      checked={formData.contentReadiness === option}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 text-trinity-red focus:ring-trinity-red"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* SECTION 5: Additional Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Additional Information</h3>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attachments (optional)
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.zip"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 text-trinity-red hover:text-trinity-red/80 transition-colors"
              >
                <FiUpload className="w-5 h-5" />
                <span>Upload files (logos, assets, documents)</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">PDF, images, documents up to 10MB total</p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-sm text-gray-300 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-300 mb-2">
              Anything else we should know?
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows={4}
              value={formData.additionalNotes}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent resize-none"
              placeholder="Any additional information, requirements, or questions..."
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-4 bg-gradient-to-r from-trinity-red to-red-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? 'Submitting...' 
            : isMaintenance 
              ? 'Submit Maintenance Request' 
              : 'Submit Project Request'}
        </button>
        <p className="text-center text-sm text-gray-400 mt-4">
          {isMaintenance 
            ? "We'll review your website and get back to you within 24 hours with a plan recommendation"
            : "We'll review your request and contact you within 24 hours"}
        </p>
      </div>
    </motion.form>
  );
}
