/**
 * Wired RequestsPanel Component
 * Manual request creation and navigation to AI Web Support
 */

"use client";

import { useState } from "react";
import { useProjectRequests, createRequest } from "@/hooks/useProject";
import { Loader2, Send, ChevronDown } from "lucide-react";
import { StatusPill } from "./StatusPill";

interface RequestsPanelProps {
  projectId: string;
}

export function RequestsPanel({ projectId }: RequestsPanelProps) {
  const { requests, isLoading, mutate } = useProjectRequests(projectId);
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;

    setSubmitting(true);
    try {
      await createRequest(projectId, {
        title: title.trim(),
        details: details.trim(),
        source: "MANUAL",
      });
      
      setTitle("");
      setDetails("");
      setShowForm(false);
      mutate(); // Refresh request list
    } catch (error) {
      console.error("Failed to create request:", error);
      alert("Failed to create request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Request Form */}
      <div className="glass-panel p-6 space-y-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold">Tell the team what you need</h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${showForm ? "rotate-180" : ""}`}
          />
        </button>

        {showForm && (
          <form onSubmit={handleCreateManual} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Share updated product photos"
                className="input-glass w-full px-4 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                What should we do?
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Give us a short description. Add links or bullet points if it helps."
                rows={4}
                className="input-glass w-full px-4 py-2 rounded-lg resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient w-full py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Request List */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-semibold">Recent requests</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p>No requests yet. Use the form above when you need something.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="glass-panel p-4 space-y-2 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{request.title}</p>
                    </div>
                    <p className="text-sm text-zinc-400">{request.details}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusPill status={request.state} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
