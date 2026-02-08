"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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
  userVote: boolean | null;
}

export default function CommunityPollsPage() {
  const { data: session } = useSession();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch("/api/community/polls");
      if (!res.ok) throw new Error("Failed to fetch polls");
      const data = await res.json();
      setPolls(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, vote: boolean) => {
    try {
      const res = await fetch("/api/community/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, vote }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to vote");
      }

      fetchPolls(); // Refresh polls to show updated vote counts
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading polls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Community Polls</h1>
      <p className="text-gray-600 mb-8">
        Vote on initiatives and help shape AVFY's future! Your voice matters.
      </p>

      {polls.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No active polls at the moment.</p>
          <p className="text-gray-400 mt-2">Check back soon for new community votes!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const totalVotes = poll.yesVotes + poll.noVotes;
            const yesPercent = totalVotes > 0 ? Math.round((poll.yesVotes / totalVotes) * 100) : 0;
            const noPercent = totalVotes > 0 ? Math.round((poll.noVotes / totalVotes) * 100) : 0;
            const hasVoted = poll.userVote !== null;
            const isClosed = !poll.active || (poll.closesAt && new Date(poll.closesAt) < new Date());

            return (
              <div key={poll.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{poll.title}</h2>
                    {poll.description && (
                      <p className="text-gray-600 mt-2">{poll.description}</p>
                    )}
                  </div>
                  {isClosed && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium ml-4">
                      Closed
                    </span>
                  )}
                </div>

                {/* Vote Results Bar */}
                {(hasVoted || isClosed) && totalVotes > 0 && (
                  <div className="mb-4">
                    <div className="flex h-10 rounded-full overflow-hidden bg-gray-200">
                      <div 
                        className="bg-green-500 flex items-center justify-center text-white text-sm font-medium transition-all"
                        style={{ width: `${yesPercent}%` }}
                      >
                        {yesPercent > 15 && `${yesPercent}%`}
                      </div>
                      <div 
                        className="bg-red-500 flex items-center justify-center text-white text-sm font-medium transition-all"
                        style={{ width: `${noPercent}%` }}
                      >
                        {noPercent > 15 && `${noPercent}%`}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span className="font-medium">
                        👍 Yes: {poll.yesVotes} ({yesPercent}%)
                      </span>
                      <span className="font-medium">
                        👎 No: {poll.noVotes} ({noPercent}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* Voting Buttons */}
                {!isClosed && !hasVoted && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleVote(poll.id, true)}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">👍</span>
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => handleVote(poll.id, false)}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">👎</span>
                      <span>No</span>
                    </button>
                  </div>
                )}

                {hasVoted && !isClosed && (
                  <div className="text-center py-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">
                      You voted: {poll.userVote ? "Yes 👍" : "No 👎"}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {totalVotes} total {totalVotes === 1 ? "vote" : "votes"} • 
                    Created {new Date(poll.createdAt).toLocaleDateString()}
                    {poll.closesAt && ` • Closes ${new Date(poll.closesAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
