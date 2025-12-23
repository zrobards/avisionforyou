import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/server/db';
import CreateCampaignForm from '@/components/admin/marketing/CreateCampaignForm';

export default async function NewCampaignPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'CEO') {
    redirect('/login');
  }

  // Get templates for dropdown
  const templates = await db.emailTemplate.findMany({
    select: {
      id: true,
      name: true,
      category: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get lead stats for targeting
  const leadStats = await db.lead.groupBy({
    by: ['status'],
    _count: true
  });

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Email Campaign</h1>
        <p className="text-gray-400 mt-2">Send personalized emails to your leads</p>
      </div>

      <CreateCampaignForm templates={templates} leadStats={leadStats} />
    </div>
  );
}
