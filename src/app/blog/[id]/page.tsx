'use client';

import Link from 'next/link';
import { ArrowLeft, Share2, Twitter, Facebook, Linkedin, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  readTimeMinutes: number
  views: number
  publishedAt: string
  imageUrl?: string
  author: {
    name: string
    image?: string
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = (platform: string) => {
    if (!post) return
    
    const text = post.title
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-blue-600 hover:text-blue-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center text-blue-200 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="text-gray-500">{post.readTimeMinutes} min read</span>
            <span className="flex items-center gap-1 text-gray-500">
              <Eye className="w-4 h-4" />
              {post.views} views
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {post.author.image && (
                <img 
                  src={post.author.image} 
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setSharing(!sharing)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>

              {sharing && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 flex gap-3 z-10">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 hover:bg-blue-50 rounded-lg transition"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 hover:bg-blue-50 rounded-lg transition"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-2 hover:bg-blue-50 rounded-lg transition"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Start Your Recovery Journey Today</h3>
          <p className="mb-6 text-blue-100">
            Connect with our supportive community and discover the programs that can help you thrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/programs"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Explore Programs
            </Link>
            <Link 
              href="/meetings"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition"
            >
              View Meetings
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
    date: 'Jun 5, 2025',
    readTime: '5 min read',
    category: 'Ethics',
    content: `One of the most complex challenges in recovery communities is navigating dual relationships—those that involve both professional and personal dimensions. The bond between peers in recovery can be incredibly powerful, but it requires careful attention to ethical boundaries.

Recovery communities thrive on authenticity and human connection. Yet, as these connections deepen, questions naturally arise: How do we maintain professional boundaries while honoring the genuine relationships we've developed? How do we ensure that our relationships support recovery rather than complicate it?

The concept of redemption through peer bonds is central to recovery communities. There's something uniquely healing about being understood by someone who has walked a similar path. This shared experience creates a bond that often transcends typical professional relationships.

However, this intensity also creates potential for boundary violations. Whether serving as a sponsor, mentor, or fellow group member, it's crucial to maintain clarity about the nature of relationships and the responsibilities they entail.

At A Vision For You, we teach our peer supporters to navigate these waters with wisdom and integrity. We recognize that the most powerful recovery communities are those that honor both connection and boundaries—that understand the peer bond as sacred precisely because it's carefully protected.

The path to ethical dual relationships in recovery requires ongoing education, self-reflection, and a commitment to putting recovery first.`,
  },
  {
    id: 3,
    title: 'The Power of Small Donations in Supporting Addiction Recovery Efforts in Louisville KY',
    excerpt: 'In Louisville, Kentucky, community donations play a vital role in supporting recovery programs and transforming lives.',
    author: 'Lucas Bennett',
    date: 'Jun 3, 2025',
    readTime: '4 min read',
    category: 'Community',
    content: `In Louisville, Kentucky, addiction recovery efforts depend on community support. While large grants and institutional funding are important, it's the consistent support of everyday donors that keeps recovery programs running and accessible to those who need them most.

Every dollar donated to recovery programs creates tangible change. A donation might fund:
- Access to professional counseling for someone who couldn't otherwise afford it
- Materials and resources for peer support groups
- Transportation assistance for people attending meetings
- Training programs for recovery coaches and peer specialists

What many people don't realize is that small donations, multiplied across many supporters, often sustain more community programs than large single contributions. A monthly gift of $25 from 50 community members creates a sustainable revenue stream that allows programs to plan long-term services.

In Louisville, the recovery community is strong precisely because people believe in their neighbors' capacity to transform their lives. Local businesses, faith communities, and individual donors work together to ensure that no one is turned away from recovery services due to lack of funds.

When you donate to recovery efforts, you're not just giving money—you're investing in lives, families, and the future of your community. You're saying that recovery matters, that people deserve second chances, and that communities are stronger when we support each other.

Whether you can give $5 or $500, your contribution counts. Join the Louisville recovery community in creating a culture where help is accessible, hope is real, and transformation is possible.`,
  },
  {
    id: 4,
    title: 'A.A.: Cult or Cure? Critical Analysis of Twelve-Step Fellowships in Addiction Recovery',
    excerpt: 'A comprehensive examination of Alcoholics Anonymous and twelve-step programs in the field of addiction treatment.',
    author: 'Lucas Bennett',
    date: 'May 16, 2025',
    readTime: '5 min read',
    category: 'Education',
    content: `The question "Is AA a cult or a cure?" has been asked for decades, and the answer requires nuance and understanding. Rather than viewing Twelve-Step programs as either/or, we should examine what they are: powerful mutual aid communities with both significant strengths and legitimate limitations.

Twelve-Step programs have helped millions of people achieve lasting recovery. The structure of the program—the steps, the meetings, the fellowship—provides a clear framework for change and a community of people committed to ongoing recovery.

However, critics have raised legitimate concerns:
- The emphasis on "higher power" can feel exclusionary to those with different spiritual beliefs
- The reliance on anonymity, while protective, can sometimes inhibit accountability
- The one-size-fits-all approach doesn't work for everyone
- Some meetings maintain traditions that feel outdated to contemporary participants

The honest assessment is this: AA and Twelve-Step programs are neither cults nor universal cures. They are what they are—powerful for some, less helpful for others, and often most effective when combined with professional treatment.

At A Vision For You, we support clients in finding the recovery pathway that works for them. For many, that includes Twelve-Step participation. For others, it's therapy-based recovery, medication-assisted treatment, or a combination of approaches.

The strength of the recovery field lies in offering multiple pathways to healing. The strength of the recovery community lies in recognizing that different approaches work for different people, and in supporting each person's unique journey.`,
  },
  {
    id: 5,
    title: 'From Crisis to Hope: How Your Support Fuels Addiction Recovery in Louisville',
    excerpt: 'Community volunteers and supporters make the difference in transforming crisis into hope for those in recovery.',
    author: 'Lucas Bennett',
    date: 'May 16, 2025',
    readTime: '2 min read',
    category: 'Stories',
    content: `Every day, people in Louisville face the crisis of addiction. But every day, community supporters transform that crisis into hope through their involvement in recovery programs.

Volunteers who serve as mentors, counselors, and peer supporters understand something essential: recovery isn't just about stopping drug use. It's about building a new life, reconnecting with family, finding work, and rediscovering purpose.

When someone in recovery tells their story of transformation, there's almost always a community behind it—people who believed in them when they didn't believe in themselves.

Your support matters. Whether volunteering time, making a donation, or simply showing compassion to someone in recovery, you're part of the community transformation that turns crisis into hope.`,
  },
  {
    id: 6,
    title: 'The Benefits of Behavior Modification Therapy for Addiction Recovery',
    excerpt: 'Exploring therapeutic community circles and behavior modification techniques in addiction treatment.',
    author: 'Lucas Bennett',
    date: 'Jan 6, 2025',
    readTime: '3 min read',
    category: 'Treatment',
    content: `Behavior modification therapy represents one of the most evidence-based approaches to addiction treatment. Unlike approaches that focus solely on stopping the problematic behavior, behavior modification therapy addresses the thoughts, emotions, and environmental factors that drive addiction.

The core principle is straightforward: our behaviors are learned, and therefore, new behaviors can be learned to replace them.

Key components of behavior modification therapy include:
- Identifying triggers and high-risk situations
- Developing coping strategies and alternative behaviors
- Rewarding progress and positive change
- Building new habits and routines
- Addressing underlying emotional patterns

In therapeutic community settings, behavior modification happens within the context of peer support. As people see others change and succeed, they're inspired and their confidence grows.

Research consistently shows that individuals who combine behavior modification therapy with peer support experience stronger recovery outcomes than those using either approach alone.`,
  },
  {
    id: 7,
    title: 'Navigating Addiction Recovery in Louisville, KY: A Comprehensive Guide',
    excerpt: 'A comprehensive guide to resources and support available for those seeking recovery in Louisville.',
    author: 'Lucas Bennett',
    date: 'Jan 6, 2025',
    readTime: '3 min read',
    category: 'Guide',
    content: `If you or a loved one is struggling with addiction in Louisville, Kentucky, you're not alone—and help is available. This guide provides an overview of recovery resources and pathways to healing.

Recovery comes in many forms:
- Professional treatment programs and counseling
- Twelve-Step and mutual aid groups
- Medication-assisted treatment
- Peer support and mentoring
- Community recovery centers
- Family counseling and support

The first step is reaching out. Whether calling a helpline, visiting a treatment center, or attending a recovery meeting, taking action is the beginning of change.

At A Vision For You, we provide comprehensive recovery support tailored to individual needs. Our team of professionals and peer specialists work together to help you find your path to lasting recovery.

Don't wait. Recovery is possible, and it starts today.`,
  },
  {
    id: 8,
    title: 'Addiction Treatment: Is Suboxone the gold standard?',
    excerpt: 'By Lucas Bennett, Evan Massey MD, Charles Wilbert APRN-CNP, Henry Fuqua CADC - A detailed discussion of narcotics and addiction treatment.',
    author: 'Lucas Bennett & Team',
    date: 'Dec 31, 2024',
    readTime: '5 min read',
    category: 'Medical',
    content: `Medication-assisted treatment (MAT) has revolutionized opioid addiction recovery. Suboxone (buprenorphine/naloxone combination) has become one of the most widely prescribed medications in MAT. But is it the "gold standard"? The answer is both yes and no.

Suboxone's Benefits:
- Reduces cravings and withdrawal symptoms
- Lower risk of overdose compared to other opioids
- Can be prescribed in office-based settings
- Relatively safe profile with medical supervision

Why "Gold Standard" May Overstate:
- Not all patients respond equally well to Suboxone
- Some individuals do better on methadone
- Individual factors like metabolism, co-occurring disorders, and social support affect outcomes
- Long-term use requires ongoing medical management

The reality is that effective addiction treatment is individualized. For some people, Suboxone is transformative. For others, methadone, naltrexone, or abstinence-based approaches prove more effective.

The future of addiction treatment lies in recognizing that different medications work for different people, and that medication should be combined with counseling, behavioral therapy, and peer support.

At A Vision For You, our medical team helps individuals find the medication and treatment approach that's right for them.`,
  },
];

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const postId = parseInt(params.id);
  const post = BLOG_POSTS.find((p) => p.id === postId);
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    );
  }

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/blog/${post.id}`;
    const title = post.title;
    const text = `Check out: ${title}`;

    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }

    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/blog/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 w-fit">
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </Link>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-blue-100">By {post.author}</p>
              <div className="flex items-center gap-4 text-blue-100 text-sm">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
            <span className="px-4 py-2 bg-blue-700 text-blue-100 rounded-full text-sm font-semibold">
              {post.category}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2">
            <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {post.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.trim().startsWith('-')) {
                  // Handle bullet points
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-2 my-4 text-gray-700">
                      {paragraph.split('\n').map((item, itemIdx) => (
                        item.trim().startsWith('-') && (
                          <li key={itemIdx} className="text-gray-700">
                            {item.replace('-', '').trim()}
                          </li>
                        )
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </article>

            {/* Call to Action */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start Your Recovery Journey?</h3>
              <p className="text-gray-700 mb-4">
                If you or someone you care about needs support, reach out to us today. Our team is here to help.
              </p>
              <Link href="/admission" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Share Section */}
            <div className="sticky top-24 bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share This Post
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-700">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                >
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  <span className="text-gray-700">LinkedIn</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition border border-gray-200"
                >
                  <span className="text-gray-700 text-sm">
                    {copied ? '✓ Link Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">About the Author</h3>
              <p className="text-gray-600 text-sm">{post.author}</p>
              <p className="text-gray-500 text-sm mt-3">
                Lucas Bennett is the founder of A Vision For You and a passionate advocate for addiction recovery and community support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.filter((p) => p.id !== post.id && p.category === post.category)
              .slice(0, 3)
              .map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`} className="group">
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden h-full">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase">{relatedPost.category}</span>
                        <span className="text-xs text-gray-500">{relatedPost.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">{relatedPost.author}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
