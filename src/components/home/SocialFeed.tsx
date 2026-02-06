"use client";

import Image from "next/image";

interface SocialFeedProps {
  instagramUrl?: string;
  facebookPageUrl?: string;
  tiktokUsername?: string;
}

export default function SocialFeed({ 
  instagramUrl = "https://www.instagram.com/avision_foryourecovery/",
  facebookPageUrl = "https://www.facebook.com/avisionforyourecovery",
  tiktokUsername = "avisionforyourecovery"
}: SocialFeedProps) {
  const instagramPosts = [
    { src: "/programs/surrender-gathering-1.png", alt: "Recovery community gathering" },
    { src: "/programs/mindbodysoul-group-1.png", alt: "MindBodySoul IOP group session" },
    { src: "/programs/surrender-facility.png", alt: "Surrender program facility" },
    { src: "/programs/mindbodysoul-education.png", alt: "Education session" },
    { src: "/programs/surrender-gathering-2.png", alt: "Peer support meeting" },
    { src: "/programs/mindbodysoul-teaching.png", alt: "Recovery teaching session" }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Stay Connected</h2>
          <p className="text-gray-600">Follow our journey on social media</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {instagramPosts.map((post, idx) => (
              <div key={idx} className="relative w-full aspect-square overflow-hidden rounded-lg">
                <Image
                  src={post.src}
                  alt={post.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 transition"
            >
              Follow us on Instagram →
            </a>
            <a 
              href={facebookPageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Like us on Facebook →
            </a>
            <a 
              href={`https://tiktok.com/@${tiktokUsername}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition"
            >
              Follow us on TikTok →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
