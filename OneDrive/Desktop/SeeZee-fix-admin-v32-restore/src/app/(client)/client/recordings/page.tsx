'use client';

import { useState, useEffect } from 'react';
import { Mic, Calendar, Clock, FileText, Play, FolderOpen, Sparkles } from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  status: string;
  category: string | null;
  duration: number | null;
  transcript: string | null;
  summary: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  'DISCOVERY_CALL': { label: '📞 Discovery Call', color: 'bg-blue-500/20 text-blue-400' },
  'DESIGN_REVIEW': { label: '🎨 Design Review', color: 'bg-purple-500/20 text-purple-400' },
  'TECHNICAL_DISCUSSION': { label: '💻 Technical Discussion', color: 'bg-cyan-500/20 text-cyan-400' },
  'PROJECT_UPDATE': { label: '📊 Project Update', color: 'bg-green-500/20 text-green-400' },
  'BRAINSTORMING': { label: '💡 Brainstorming', color: 'bg-yellow-500/20 text-yellow-400' },
  'TRAINING': { label: '📚 Training', color: 'bg-indigo-500/20 text-indigo-400' },
  'SUPPORT': { label: '🛠️ Support', color: 'bg-orange-500/20 text-orange-400' },
};

export default function ClientRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const res = await fetch('/api/client/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings || []);
      }
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecordings = recordings.filter(r => {
    if (categoryFilter && r.category !== categoryFilter) return false;
    return true;
  });

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCategoryInfo = (category: string | null) => {
    if (!category) return { label: 'Meeting', color: 'bg-slate-500/20 text-slate-400' };
    return CATEGORY_LABELS[category] || { label: category, color: 'bg-slate-500/20 text-slate-400' };
  };

  const uniqueCategories = [...new Set(recordings.map(r => r.category).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Mic className="w-7 h-7 text-pink-400" />
          Meeting Recordings
        </h1>
        <p className="text-slate-400 mt-1">
          Review transcripts and summaries from our project meetings
        </p>
      </div>

      {/* Filter Bar */}
      {uniqueCategories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !categoryFilter 
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50' 
                : 'bg-slate-800 text-slate-400 border border-white/10 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {uniqueCategories.map(cat => {
            const info = getCategoryInfo(cat);
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  categoryFilter === cat 
                    ? `${info.color} border border-current` 
                    : 'bg-slate-800 text-slate-400 border border-white/10 hover:bg-slate-700'
                }`}
              >
                {info.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recording list */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-8 text-center">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-slate-700 rounded-full mx-auto mb-4" />
                <div className="h-4 w-32 bg-slate-700 rounded mx-auto" />
              </div>
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-8 text-center">
              <Mic className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">
                No recordings yet
              </h3>
              <p className="text-slate-400 text-sm">
                Meeting recordings will appear here after our calls
              </p>
            </div>
          ) : (
            filteredRecordings.map((recording) => {
              const categoryInfo = getCategoryInfo(recording.category);
              const isSelected = selectedRecording?.id === recording.id;
              
              return (
                <button
                  key={recording.id}
                  onClick={() => setSelectedRecording(recording)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-pink-500/10 border-pink-500/50' 
                      : 'bg-slate-900/50 border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      recording.status === 'TRANSCRIBED' ? 'bg-green-500/20' : 'bg-slate-700/50'
                    }`}>
                      {recording.status === 'TRANSCRIBED' 
                        ? <FileText className="w-5 h-5 text-green-400" /> 
                        : <Play className="w-5 h-5 text-slate-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${isSelected ? 'text-pink-400' : 'text-white'}`}>
                        {recording.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(recording.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Recording detail */}
        <div className="lg:col-span-2">
          {selectedRecording ? (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedRecording.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedRecording.createdAt).toLocaleDateString()}
                      </span>
                      {selectedRecording.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(selectedRecording.duration)}
                        </span>
                      )}
                      {selectedRecording.project && (
                        <span className="flex items-center gap-1 text-pink-400">
                          <FolderOpen className="w-4 h-4" />
                          {selectedRecording.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryInfo(selectedRecording.category).color}`}>
                    {getCategoryInfo(selectedRecording.category).label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Summary */}
                {selectedRecording.summary && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      AI Summary
                    </h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-slate-300 text-sm leading-relaxed">
                      {selectedRecording.summary}
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {selectedRecording.transcript && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      Full Transcript
                    </h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedRecording.transcript}
                      </p>
                    </div>
                  </div>
                )}

                {/* Not yet transcribed */}
                {!selectedRecording.transcript && selectedRecording.status !== 'TRANSCRIBED' && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">
                      This recording is still being processed. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center">
              <Mic className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Select a recording
              </h3>
              <p className="text-slate-400 text-sm">
                Choose a meeting from the list to view the transcript and summary
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
