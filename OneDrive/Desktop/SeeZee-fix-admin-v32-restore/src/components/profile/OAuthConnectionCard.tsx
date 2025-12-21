"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface OAuthConnectionCardProps {
  provider: "google" | "linkedin";
  connected: boolean;
  email?: string;
  onConnectionChange: () => void;
}

const PROVIDER_INFO = {
  google: {
    name: "Google",
    icon: "https://www.google.com/favicon.ico",
    color: "from-red-500 to-yellow-500",
  },
  linkedin: {
    name: "LinkedIn",
    icon: "https://www.linkedin.com/favicon.ico",
    color: "from-blue-600 to-blue-700",
  },
};

export function OAuthConnectionCard({
  provider,
  connected,
  email,
  onConnectionChange,
}: OAuthConnectionCardProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const info = PROVIDER_INFO[provider];

  const handleConnect = async () => {
    setLoading(true);
    try {
      window.location.href = `/api/auth/oauth/connect/${provider}`;
    } catch (error) {
      showToast(`Failed to connect ${info.name}`, "error");
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect ${info.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/oauth/disconnect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect");
      }

      showToast(`${info.name} disconnected`, "success");
      onConnectionChange();
    } catch (error: any) {
      showToast(error.message || `Failed to disconnect ${info.name}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${info.color} flex items-center justify-center`}>
          <img src={info.icon} alt={info.name} className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-medium text-slate-200">{info.name}</h4>
          {connected && email && (
            <p className="text-sm text-slate-400">{email}</p>
          )}
          {!connected && (
            <p className="text-sm text-slate-500">Not connected</p>
          )}
        </div>
      </div>

      {connected ? (
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/50 hover:border-red-400 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Disconnecting..." : "Disconnect"}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
      )}
    </div>
  );
}




