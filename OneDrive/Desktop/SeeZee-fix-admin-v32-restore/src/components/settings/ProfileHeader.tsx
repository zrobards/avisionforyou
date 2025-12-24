"use client";

import { useState, useEffect } from "react";
import { Camera, CheckCircle, Mail, MapPin, Calendar } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface ProfileData {
  name: string;
  email: string;
  image?: string;
  bio?: string;
  location?: string;
  joinedAt?: Date | string;
  role?: string;
}

interface ProfileHeaderProps {
  profile: ProfileData;
  completionPercentage?: number;
  onImageClick?: () => void;
  isVerified?: boolean;
}

// Animated SVG ring showing completion
function CompletionRing({ 
  percentage, 
  size = 120, 
  strokeWidth = 4 
}: { 
  percentage: number; 
  size?: number; 
  strokeWidth?: number;
}) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    // Animate the ring on mount
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <svg
      width={size}
      height={size}
      className="absolute -inset-1 -rotate-90"
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring with gradient */}
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        style={{
          filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))",
        }}
      />
    </svg>
  );
}

export function ProfileHeader({
  profile,
  completionPercentage = 100,
  onImageClick,
  isVerified = true,
}: ProfileHeaderProps) {
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const formattedDate = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <GlassCard variant="elevated" glow="accent" padding="none" className="overflow-visible">
      {/* Background gradient strip */}
      <div className="h-24 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-t-2xl relative overflow-hidden">
        {/* Animated shimmer */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
        <style jsx>{`
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
        `}</style>
      </div>

      <div className="px-6 pb-6 -mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar with completion ring */}
          <div className="relative">
            <div className="relative w-[112px] h-[112px]">
              {/* Completion ring */}
              <CompletionRing percentage={completionPercentage} size={120} strokeWidth={3} />
              
              {/* Avatar container */}
              <div className="absolute inset-2 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-900">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>

              {/* Camera button */}
              {onImageClick && (
                <button
                  onClick={onImageClick}
                  className="
                    absolute bottom-1 right-1 z-10
                    w-8 h-8 rounded-full
                    bg-slate-800 border-2 border-slate-700
                    flex items-center justify-center
                    text-slate-300 hover:text-white hover:bg-slate-700
                    transition-all duration-200
                    hover:scale-110 active:scale-95
                  "
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Completion badge */}
            {completionPercentage < 100 && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded-full text-xs font-medium text-violet-300 whitespace-nowrap">
                {completionPercentage}% complete
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="flex-1 pt-2 sm:pt-0 sm:pb-2">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              {isVerified && (
                <CheckCircle className="w-5 h-5 text-violet-400" />
              )}
              {profile.role && (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full capitalize">
                  {profile.role.toLowerCase()}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-slate-400 text-sm mb-3 max-w-md">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              {profile.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formattedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Compact version for sidebar or smaller spaces
export function ProfileHeaderCompact({
  profile,
  isVerified = true,
}: {
  profile: ProfileData;
  isVerified?: boolean;
}) {
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
        {profile.image ? (
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-bold">
            {initials}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white truncate">{profile.name}</span>
          {isVerified && <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />}
        </div>
        <p className="text-sm text-slate-400 truncate">{profile.email}</p>
      </div>
    </div>
  );
}








