"use client";

import { useState } from "react";

interface SocialFeedProps {
  instagramUrl?: string;
  facebookPageUrl?: string;
  tiktokUsername?: string;
}

export default function SocialFeed({ 
  instagramUrl = "https://www.instagram.com/avfyorg",
  facebookPageUrl = "https://www.facebook.com/AVFYorg",
  tiktokUsername = "avfyorg"
}: SocialFeedProps) {
  const [activeTab, setActiveTab] = useState<"instagram" | "facebook" | "tiktok">("instagram");
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Stay Connected</h2>
          <p className="text-gray-600">Follow our journey on social media</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => { setActiveTab("instagram"); setLoaded(false); }}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === "instagram" 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => { setActiveTab("facebook"); setLoaded(false); }}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === "facebook" 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Facebook
          </button>
          <button
            onClick={() => { setActiveTab("tiktok"); setLoaded(false); }}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === "tiktok" 
                ? "bg-black text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            TikTok
          </button>
        </div>

        {/* Embed Container */}
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[400px]">
          {!loaded && (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <p className="text-gray-500 mb-4">Click to load {activeTab} feed</p>
              <button
                onClick={() => setLoaded(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Load Feed
              </button>
            </div>
          )}

          {loaded && activeTab === "instagram" && (
            <InstagramEmbed url={instagramUrl} />
          )}

          {loaded && activeTab === "facebook" && (
            <FacebookEmbed pageUrl={facebookPageUrl} />
          )}

          {loaded && activeTab === "tiktok" && (
            <TikTokEmbed username={tiktokUsername} />
          )}
        </div>

        {/* Direct Links */}
        <div className="flex justify-center gap-6 mt-8">
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition"
          >
            Follow on Instagram →
          </a>
          <a 
            href={facebookPageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Like on Facebook →
          </a>
          <a 
            href={`https://tiktok.com/@${tiktokUsername}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition"
          >
            Follow on TikTok →
          </a>
        </div>
      </div>
    </section>
  );
}

// Instagram Embed using official embed or SnapWidget
function InstagramEmbed({ url }: { url: string }) {
  return (
    <div className="flex justify-center">
      {/* Option 1: Use SnapWidget (free, easy setup) */}
      {/* Sign up at snapwidget.com, get your widget ID, replace below */}
      <iframe
        src="https://snapwidget.com/embed/YOUR_WIDGET_ID"
        className="w-full max-w-[800px] h-[400px] border-0 overflow-hidden"
        title="Instagram Feed"
        loading="lazy"
      />
      
      {/* Option 2: Simple link grid fallback */}
      {/* 
      <div className="text-center">
        <p className="text-gray-600 mb-4">View our latest posts on Instagram</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
        >
          Open Instagram
        </a>
      </div>
      */}
    </div>
  );
}

// Facebook Page Plugin
function FacebookEmbed({ pageUrl }: { pageUrl: string }) {
  return (
    <div className="flex justify-center">
      <iframe
        src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=500&height=400&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
        width="500"
        height="400"
        style={{ border: "none", overflow: "hidden" }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen={true}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        title="Facebook Feed"
        loading="lazy"
      />
    </div>
  );
}

// TikTok Embed
function TikTokEmbed({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-600 mb-4">Check out our latest TikTok videos!</p>
      
      {/* TikTok doesn't have a feed widget, so we link to profile */}
      {/* For specific videos, you can use TikTok's embed code */}
      <a
        href={`https://tiktok.com/@${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
        @{username} on TikTok
      </a>
      
      {/* If you have specific video IDs to embed: */}
      {/* 
      <blockquote 
        className="tiktok-embed" 
        cite={`https://www.tiktok.com/@${username}/video/VIDEO_ID`}
        data-video-id="VIDEO_ID"
      >
        <script async src="https://www.tiktok.com/embed.js"></script>
      </blockquote>
      */}
    </div>
  );
}
