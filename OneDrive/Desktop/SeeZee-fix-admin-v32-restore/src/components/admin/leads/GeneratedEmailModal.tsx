'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/Input';
import { Copy, Mail, RefreshCw } from 'lucide-react';

interface GeneratedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
}

export function GeneratedEmailModal({ 
  isOpen, 
  onClose, 
  leadId,
  leadName 
}: GeneratedEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateEmail = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/leads/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      });

      const data = await res.json();

      if (data.success) {
        setSubject(data.subject);
        setBody(data.body);
      } else {
        alert(data.error || 'Failed to generate email');
      }
    } catch (error) {
      alert('Failed to generate email');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullEmail);
    alert('Copied to clipboard!');
  };

  const openInGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  // Auto-generate on open
  useEffect(() => {
    if (isOpen && !subject && !body) {
      generateEmail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Generated Outreach Email - ${leadName}`}
      size="xl"
    >
      <div className="space-y-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mb-3" />
            <span className="text-lg text-white">Generating personalized email...</span>
            <span className="text-sm text-gray-400 mt-2">This may take a few seconds</span>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Subject Line</label>
              <Input 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="font-semibold bg-slate-800 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Email Body</label>
              <Textarea
                value={body}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                rows={12}
                className="font-mono text-sm bg-slate-800 border-white/10 text-white"
                placeholder="Email content..."
              />
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/10">
              <Button onClick={generateEmail} variant="outline" className="border-white/10">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={copyToClipboard} variant="outline" className="border-white/10">
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button onClick={openInGmail} className="bg-cyan-500 hover:bg-cyan-600">
                <Mail className="w-4 h-4 mr-2" />
                Open in Gmail
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
