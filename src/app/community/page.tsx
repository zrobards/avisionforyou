'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, MessageSquare, Heart, Share2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h1>
            <p className="text-gray-600 text-lg mb-8">
              Connect with others on their recovery journey, share experiences, and support one another in our private
              community platform.
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-indigo-900 mb-4">Community Benefits:</h2>
              <ul className="space-y-2 text-indigo-800">
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Share your story in a safe, supportive environment
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Connect with others and build meaningful relationships
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Access exclusive community resources and events
                </li>
                <li className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Participate in group discussions and support circles
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
            >
              Sign Up & Join Community
            </Link>
            <p className="text-gray-600 text-sm mt-6">Already have an account?</p>
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Recovery Community</h1>
          <p className="text-indigo-100">Connect, Support, Grow Together</p>
        </div>
      </div>

      {/* Community Overview */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Users className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Members</h3>
            <p className="text-3xl font-bold text-indigo-600">1,240+</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Daily Conversations</h3>
            <p className="text-3xl font-bold text-blue-600">500+</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Heart className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Support Stories</h3>
            <p className="text-3xl font-bold text-red-600">2,890+</p>
          </div>
        </div>

        {/* Community Features */}
        <div className="bg-white rounded-lg shadow p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's in the Community?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Support Groups</h3>
              <p className="text-gray-600 mb-4">
                Join virtual support groups facilitated by recovery specialists. Share your journey, listen to others,
                and find strength in community.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Daily check-in groups</li>
                <li>• Topic-specific circles</li>
                <li>• Expert-led discussions</li>
                <li>• Peer mentorship</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources & Learning</h3>
              <p className="text-gray-600 mb-4">
                Access recovery tools, educational materials, and success stories from our community members who are
                thriving in their recovery.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Recovery guides and articles</li>
                <li>• Video tutorials and webinars</li>
                <li>• Success stories and inspiration</li>
                <li>• Resource library</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Events & Activities</h3>
              <p className="text-gray-600 mb-4">
                Participate in community events, workshops, and social activities designed to build connections and
                celebrate milestones.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Monthly community gatherings</li>
                <li>• Wellness workshops</li>
                <li>• Milestone celebrations</li>
                <li>• Recreational activities</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Safe & Confidential</h3>
              <p className="text-gray-600 mb-4">
                Our community is moderated and designed to be a safe space where everyone is respected and
                confidentiality is protected.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Moderated discussions</li>
                <li>• Privacy-focused platform</li>
                <li>• Community guidelines</li>
                <li>• 24/7 community support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mighty Networks Embed Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-12">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Coming Soon: Full Community Platform</h3>
              <p className="text-blue-800 mb-3">
                We're integrating Mighty Networks to provide an even richer community experience with enhanced
                networking, events, and engagement features.
              </p>
              <p className="text-sm text-blue-700">
                To join the community now, download our companion app or contact support for access details.
              </p>
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Guidelines</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Be Respectful & Kind</h3>
                <p className="text-gray-600">Treat all members with dignity and compassion. Everyone's journey is valid.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Maintain Confidentiality</h3>
                <p className="text-gray-600">What's shared in the community stays in the community. Respect others' privacy.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Support Without Judgment</h3>
                <p className="text-gray-600">Offer support based on your experiences, not judgment. We're all learning.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Seek Professional Help When Needed</h3>
                <p className="text-gray-600">
                  Community support is valuable, but professional help is essential. Always consult professionals for
                  serious issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
