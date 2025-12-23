'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RecordingStatusProps {
  recordingId: string;
  initialStatus: string;
}

export function RecordingStatus({ recordingId, initialStatus }: RecordingStatusProps) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (status === 'PENDING' || status === 'PROCESSING') {
      const interval = setInterval(async () => {
        const res = await fetch(`/api/recordings/${recordingId}`);
        const data = await res.json();
        
        if (data.recording) {
          setStatus(data.recording.status);
          
          // Stop polling when complete or failed
          if (data.recording.status === 'COMPLETED' || data.recording.status === 'FAILED') {
            clearInterval(interval);
            window.location.reload(); // Refresh to show results
          }
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [recordingId, status]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          text: 'Queued for Processing',
          color: 'text-yellow-500'
        };
      case 'PROCESSING':
        return {
          icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
          text: 'Transcribing...',
          color: 'text-blue-500'
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Complete',
          color: 'text-green-500'
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: 'Failed',
          color: 'text-red-500'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          text: status,
          color: 'text-gray-500'
        };
    }
  };

  const { icon, text, color } = getStatusDisplay();

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      {icon}
      <span className="font-medium">{text}</span>
    </div>
  );
}
