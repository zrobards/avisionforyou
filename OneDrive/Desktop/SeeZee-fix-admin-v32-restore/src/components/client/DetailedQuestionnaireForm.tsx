'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Palette,
  FileText,
  Star,
  Globe,
  Hash,
  Share2,
  Server,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export interface DetailedQuestionnaireData {
  targetAudience: string;
  competitorWebsites: string;
  brandColors: string;
  brandStyle: string;
  contentReady: string;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  seoKeywords: string;
  socialMediaLinks: string;
  hostingPreference: string;
  domainStatus: string;
  additionalNotes: string;
}

interface DetailedQuestionnaireFormProps {
  taskId: string;
  projectId: string;
}

const FEATURE_OPTIONS = [
  'User Registration/Login',
  'Payment Processing',
  'Admin Dashboard',
  'Content Management',
  'Search Functionality',
  'Newsletter Signup',
  'Contact Form',
  'Live Chat',
  'Blog',
  'E-commerce',
  'Booking System',
  'Analytics',
];

const BRAND_STYLES = [
  { value: 'modern', label: 'Modern & Minimal' },
  { value: 'corporate', label: 'Corporate & Professional' },
  { value: 'creative', label: 'Creative & Bold' },
  { value: 'elegant', label: 'Elegant & Sophisticated' },
  { value: 'playful', label: 'Playful & Fun' },
  { value: 'tech', label: 'Tech & Futuristic' },
];

export function DetailedQuestionnaireForm({ taskId, projectId }: DetailedQuestionnaireFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DetailedQuestionnaireData, string>>>({});

  const [formData, setFormData] = useState<DetailedQuestionnaireData>({
    targetAudience: '',
    competitorWebsites: '',
    brandColors: '',
    brandStyle: '',
    contentReady: '',
    mustHaveFeatures: [],
    niceToHaveFeatures: [],
    seoKeywords: '',
    socialMediaLinks: '',
    hostingPreference: '',
    domainStatus: '',
    additionalNotes: '',
  });

  const updateField = <K extends keyof DetailedQuestionnaireData>(
    field: K,
    value: DetailedQuestionnaireData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleFeature = (feature: string, isMustHave: boolean) => {
    const field = isMustHave ? 'mustHaveFeatures' : 'niceToHaveFeatures';
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(feature)
        ? prev[field].filter((f) => f !== feature)
        : [...prev[field], feature],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DetailedQuestionnaireData, string>> = {};

    if (!formData.targetAudience.trim()) newErrors.targetAudience = 'Target audience is required';
    if (!formData.brandStyle) newErrors.brandStyle = 'Please select a brand style';
    if (!formData.contentReady) newErrors.contentReady = 'Please indicate content readiness';
    if (!formData.domainStatus) newErrors.domainStatus = 'Please indicate domain status';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
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

      // Redirect back to dashboard
      router.push('/client');
    } catch (error: any) {
      console.error('Failed to submit questionnaire:', error);
      alert(error.message || 'Failed to submit questionnaire. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Target Audience */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          Target Audience
        </h3>
        <label htmlFor="targetAudience" className="block text-white/80 mb-2">
          Who is your target audience? <span className="text-red-400">*</span>
        </label>
        <textarea
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => updateField('targetAudience', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.targetAudience ? 'border-red-500' : 'border-white/10'
          }`}
          placeholder="e.g., Small business owners aged 25-45, tech-savvy entrepreneurs..."
        />
        {errors.targetAudience && (
          <p className="mt-2 text-sm text-red-400">{errors.targetAudience}</p>
        )}
      </div>

      {/* Competitors */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-400" />
          Competition & Inspiration
        </h3>
        <label htmlFor="competitorWebsites" className="block text-white/80 mb-2">
          List competitor websites or sites you like (one per line)
        </label>
        <textarea
          id="competitorWebsites"
          value={formData.competitorWebsites}
          onChange={(e) => updateField('competitorWebsites', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="https://example.com&#10;https://another-example.com"
        />
      </div>

      {/* Brand & Style */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Palette className="w-6 h-6 text-blue-400" />
          Brand & Style
        </h3>

        <div>
          <label htmlFor="brandColors" className="block text-white/80 mb-2">
            Brand colors (if any)
          </label>
          <input
            id="brandColors"
            type="text"
            value={formData.brandColors}
            onChange={(e) => updateField('brandColors', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Blue (#0066CC), White (#FFFFFF)"
          />
        </div>

        <div>
          <label className="block text-white/80 mb-3">
            What style resonates with your brand? <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BRAND_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => updateField('brandStyle', style.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.brandStyle === style.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-slate-800 hover:border-white/20'
                }`}
              >
                <span className="text-white text-sm">{style.label}</span>
              </button>
            ))}
          </div>
          {errors.brandStyle && (
            <p className="mt-2 text-sm text-red-400">{errors.brandStyle}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          Content
        </h3>
        <label className="block text-white/80 mb-3">
          Do you have content ready (text, images)? <span className="text-red-400">*</span>
        </label>
        <div className="space-y-2">
          {[
            { value: 'yes', label: 'Yes, I have all content ready' },
            { value: 'partial', label: 'I have some content, need help with the rest' },
            { value: 'no', label: 'No, I need help creating content' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('contentReady', option.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                formData.contentReady === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 bg-slate-800 hover:border-white/20'
              }`}
            >
              <span className="text-white">{option.label}</span>
            </button>
          ))}
        </div>
        {errors.contentReady && (
          <p className="mt-2 text-sm text-red-400">{errors.contentReady}</p>
        )}
      </div>

      {/* Features */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-blue-400" />
          Features
        </h3>

        <div>
          <label className="block text-white/80 mb-3">Must-have features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FEATURE_OPTIONS.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature, true)}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  formData.mustHaveFeatures.includes(feature)
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-white/10 bg-slate-800 hover:border-white/20 text-white/80'
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 mb-3">Nice-to-have features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FEATURE_OPTIONS.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature, false)}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  formData.niceToHaveFeatures.includes(feature)
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-white/10 bg-slate-800 hover:border-white/20 text-white/80'
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SEO & Social */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Hash className="w-6 h-6 text-blue-400" />
          SEO & Social Media
        </h3>

        <div>
          <label htmlFor="seoKeywords" className="block text-white/80 mb-2">
            SEO Keywords (comma separated)
          </label>
          <input
            id="seoKeywords"
            type="text"
            value={formData.seoKeywords}
            onChange={(e) => updateField('seoKeywords', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., web design, startup, marketing"
          />
        </div>

        <div>
          <label htmlFor="socialMediaLinks" className="block text-white/80 mb-2">
            Social Media Links (one per line)
          </label>
          <textarea
            id="socialMediaLinks"
            value={formData.socialMediaLinks}
            onChange={(e) => updateField('socialMediaLinks', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="https://twitter.com/yourcompany&#10;https://facebook.com/yourcompany"
          />
        </div>
      </div>

      {/* Hosting & Domain */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Server className="w-6 h-6 text-blue-400" />
          Hosting & Domain
        </h3>

        <div>
          <label htmlFor="hostingPreference" className="block text-white/80 mb-2">
            Hosting preference
          </label>
          <input
            id="hostingPreference"
            type="text"
            value={formData.hostingPreference}
            onChange={(e) => updateField('hostingPreference', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Vercel, AWS, or let us decide"
          />
        </div>

        <div>
          <label className="block text-white/80 mb-3">
            Domain status <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: 'have', label: 'I already have a domain' },
              { value: 'need', label: 'I need help purchasing a domain' },
              { value: 'undecided', label: 'I haven\'t decided yet' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField('domainStatus', option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.domainStatus === option.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-slate-800 hover:border-white/20'
                }`}
              >
                <span className="text-white">{option.label}</span>
              </button>
            ))}
          </div>
          {errors.domainStatus && (
            <p className="mt-2 text-sm text-red-400">{errors.domainStatus}</p>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          Additional Notes
        </h3>
        <textarea
          id="additionalNotes"
          value={formData.additionalNotes}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Any additional information or special requirements..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all shadow-lg flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Submit Questionnaire
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

