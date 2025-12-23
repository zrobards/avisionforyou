'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateCampaignFormProps {
  templates: Array<{ id: string; name: string; category: string }>;
  leadStats: Array<{ status: string; _count: number }>;
}

export default function CreateCampaignForm({ templates, leadStats }: CreateCampaignFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    targetStatus: 'ALL',
    targetCategory: '',
    minScore: 0,
    scheduleType: 'NOW',
    scheduleDate: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert('Campaign created successfully!');
        router.push('/admin/marketing/campaigns');
      } else {
        alert(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      alert('Failed to create campaign');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-white">Campaign Details</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Nonprofit Outreach - January 2025"
              required
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="template" className="text-white">Email Template *</Label>
            <Select 
              value={formData.templateId}
              onValueChange={(value: string) => setFormData({ ...formData, templateId: value })}
            >
              <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                <SelectValue placeholder="Select template..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id} className="text-white">
                    {template.name} ({template.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes" className="text-white">Campaign Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes about this campaign..."
              rows={3}
              className="bg-slate-900 border-white/10 text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-white">Target Audience</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="targetStatus" className="text-white">Lead Status</Label>
            <Select 
              value={formData.targetStatus}
              onValueChange={(value: string) => setFormData({ ...formData, targetStatus: value })}
            >
              <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="ALL" className="text-white">All Leads</SelectItem>
                <SelectItem value="NEW" className="text-white">New Leads Only</SelectItem>
                <SelectItem value="CONTACTED" className="text-white">Contacted</SelectItem>
                <SelectItem value="RESPONDED" className="text-white">Responded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="minScore" className="text-white">Minimum Lead Score</Label>
            <Select 
              value={formData.minScore.toString()}
              onValueChange={(value: string) => setFormData({ ...formData, minScore: parseInt(value) })}
            >
              <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="0" className="text-white">All Scores</SelectItem>
                <SelectItem value="40" className="text-white">40+ (Skip cold leads)</SelectItem>
                <SelectItem value="60" className="text-white">60+ (Warm and Hot)</SelectItem>
                <SelectItem value="80" className="text-white">80+ (Hot Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-white">Schedule</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="scheduleType" className="text-white">When to Send</Label>
            <Select 
              value={formData.scheduleType}
              onValueChange={(value: string) => setFormData({ ...formData, scheduleType: value })}
            >
              <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="NOW" className="text-white">Send Immediately</SelectItem>
                <SelectItem value="SCHEDULED" className="text-white">Schedule for Later</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.scheduleType === 'SCHEDULED' && (
            <div>
              <Label htmlFor="scheduleDate" className="text-white">Schedule Date & Time</Label>
              <Input
                id="scheduleDate"
                type="datetime-local"
                value={formData.scheduleDate}
                onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                className="bg-slate-900 border-white/10 text-white"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
          className="border-white/10"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting || !formData.name || !formData.templateId}
          className="bg-cyan-500 hover:bg-cyan-600"
        >
          {isSubmitting ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
}
