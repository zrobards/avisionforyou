'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ServiceCategory } from '@prisma/client';
import PageShell from '@/components/PageShell';
import FloatingShapes from '@/components/shared/FloatingShapes';
import ContactIntakeForm from '@/components/start/ContactIntakeForm';
import { urlParamToServiceCategory } from '@/lib/service-mapping';
import { FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';

function ContactPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [serviceType, setServiceType] = useState<ServiceCategory | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const tierParam = searchParams.get('tier');
    
    if (!serviceParam) {
      // No service parameter, redirect to start page
      router.push('/start');
      return;
    }

    const category = urlParamToServiceCategory(serviceParam);
    
    if (!category) {
      // Invalid service parameter
      setServiceType(null);
      setIsValidating(false);
      return;
    }

    setServiceType(category);
    setTier(tierParam);
    setIsValidating(false);
  }, [searchParams, router]);

  if (isValidating) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-trinity-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!serviceType) {
    return (
      <PageShell>
        <div className="relative overflow-hidden animated-gradient min-h-screen">
          <FloatingShapes />
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
          
          <section className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
            <div className="glass-container rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h1 className="text-3xl font-heading font-bold text-white mb-4">
                Invalid Service Type
              </h1>
              <p className="text-gray-300 mb-6">
                The service you selected is not valid. Please choose from our available services.
              </p>
              <Link
                href="/start"
                className="inline-block px-6 py-3 bg-trinity-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Back to Services
              </Link>
            </div>
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="relative overflow-hidden animated-gradient min-h-screen">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ContactIntakeForm serviceType={serviceType} tier={tier} />
        </section>
      </div>
    </PageShell>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-trinity-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </PageShell>
    }>
      <ContactPageContent />
    </Suspense>
  );
}
