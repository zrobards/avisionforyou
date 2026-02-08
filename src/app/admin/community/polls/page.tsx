"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Poll {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  closesAt: string | null;
  createdAt: string;
  _count: { votes: number };
  yesVotes: number;
  noVotes: number;
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    closesAt: "",
  });

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch("/api/admin/community/polls");
      if (!res.ok) throw new Error("Failed to fetch polls");
      const data = await res.json();
      setPolls(data);
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/community/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create poll");

      setForm({ title: "", description: "", closesAt: "" });
      setShowForm(false);
      fetchPolls();
    } catch (error) {
      alert("Failed to create poll");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/community/polls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (!res.ok) throw new Error("Failed to toggle poll");
      fetchPolls();
    } catch (error) {
      alert("Failed to toggle poll");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this poll? This will also delete all votes. This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/community/polls/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete poll");
      fetchPolls();
    } catch (error) {
      alert("Failed to delete poll");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading polls...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Polls</h1>
          <p className="text-gray-600 mt-1">Create and manage polls for alumni voting</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {showForm ? (
            <>Cancel</>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Poll
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poll Question *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Should AVFY expand to a new location?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Additional details about the poll..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closes At (optional)
            </label>
            <input
              type="datetime-local"
              value={form.closesAt}
              onChange={(e) => setForm({ ...form, closesAt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for no expiration date
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
          >
            {submitting ? "Creating..." : "Create Poll"}
          </button>
        </form>
      )}

      {polls.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No polls created yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click "Create Poll" to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
                  {poll.description && (
                    <p className="text-gray-600 text-sm mt-1">{poll.description}</p>
                  )}
                  
                  {/* Vote Results Bar */}
                  {poll._count.votes > 0 && (
                    <div className="mt-3 mb-2">
                      <div className="flex h-8 rounded-full overflow-hidden bg-gray-200">
                        <div 
                          className="bg-green-500 flex items-center justify-center text-white text-xs font-medium transition-all"
                          style={{ width: `${poll._count.votes > 0 ? (poll.yesVotes / poll._count.votes) * 100 : 0}%` }}
                        >
                          {poll._count.votes > 0 && (poll.yesVotes / poll._count.votes) * 100 > 15 && 
                            `${Math.round((poll.yesVotes / poll._count.votes) * 100)}%`
                          }
                        </div>
                        <div 
                          className="bg-red-500 flex items-center justify-center text-white text-xs font-medium transition-all"
                          style={{ width: `${poll._count.votes > 0 ? (poll.noVotes / poll._count.votes) * 100 : 0}%` }}
                        >
                          {poll._count.votes > 0 && (poll.noVotes / poll._count.votes) * 100 > 15 && 
                            `${Math.round((poll.noVotes / poll._count.votes) * 100)}%`
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{poll._count.votes}</span> total votes
                    </span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">👍 {poll.yesVotes} Yes</span>
                    <span>•</span>
                    <span className="text-red-600 font-medium">👎 {poll.noVotes} No</span>
                    <span>•</span>
                    <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
                    {poll.closesAt && (
                      <>
                        <span>•</span>
                        <span>Closes {new Date(poll.closesAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggle(poll.id, poll.active)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      poll.active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={poll.active ? "Click to close poll" : "Click to reopen poll"}
                  >
                    {poll.active ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        Closed
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(poll.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete poll"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
