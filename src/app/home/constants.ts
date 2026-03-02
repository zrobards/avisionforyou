import { HandHeart, Brain, Home, Users, Utensils, Briefcase } from 'lucide-react'

export const HERO_VIDEO_SRC = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/videos/cloud-background.mp4"

export const TESTIMONIALS = [
  {
    name: "Josh J.",
    role: "Client / Intern",
    quote: "A Vision for You is the best treatment center I have ever been to. It is the longest amount of sobriety in my life. I struggle with mental illness, and I am allowed to take my medication, and the staff is very accommodating.",
    initials: "JJ",
  },
  {
    name: "Laura F.",
    role: "Alumni / Staff",
    quote: "I moved here from Georgia seeking help with my addiction. After trying many facilities, AVFY has succeeded in showing me a new way to live. They've given me hope and I'm now employed and a full-time student.",
    initials: "LF",
  },
  {
    name: "Johnny M.",
    role: "Alumni / Staff",
    quote: "14 months ago, I was hopeless, jobless, and homeless. AVFY took me in with open arms. I now work there helping others. AVFY has given me my life back, and I am eternally grateful.",
    initials: "JM",
  },
  {
    name: "Marcus T.",
    role: "Surrender Program Graduate",
    quote: "The Surrender Program saved my life. Having housing, meals, and a supportive community while I got back on my feet made all the difference. I now have my own apartment and a steady job.",
    initials: "MT",
  },
  {
    name: "Sarah K.",
    role: "Family Member",
    quote: "Watching my brother transform through AVFY's programs has been incredible. The staff truly cares and the holistic approach to recovery is unlike anything we'd found before.",
    initials: "SK",
  },
]

export const PROGRAMS = [
  { title: "Surrender Program", description: "Voluntary, self-help, social model recovery grounded in 12-step principles", icon: HandHeart, href: "/programs/surrender-program", badge: "100% FREE", badgeColor: "bg-green-500" },
  { title: "MindBodySoul IOP", description: "Intensive Outpatient combining therapy, psychiatry, and evidence-based practices", icon: Brain, href: "/programs/mindbodysoul-iop", badge: "Insurance Accepted", badgeColor: "bg-blue-500" },
  { title: "Housing & Shelter", description: "Safe, supportive residential recovery spaces with community living", icon: Home, href: "/programs/housing", badge: "7 Residences", badgeColor: "bg-purple-500" },
  { title: "Meetings & Groups", description: "Peer-driven recovery meetings, support groups, and community building", icon: Users, href: "/programs/self-help", badge: "Open to All", badgeColor: "bg-amber-500" },
  { title: "Food & Nutrition", description: "Nutritious meals and dietary support as part of holistic recovery", icon: Utensils, href: "/programs/food", badge: "Daily Meals", badgeColor: "bg-orange-500" },
  { title: "Career Reentry", description: "Job training, placement assistance, and employment support", icon: Briefcase, href: "/programs/career", badge: "Job Placement", badgeColor: "bg-teal-500" },
]

export const SOCIAL_IMAGES = [
  { src: "/programs/surrender-gathering-1.png", alt: "Recovery community gathering" },
  { src: "/programs/mindbodysoul-group-1.png", alt: "MindBodySoul IOP group session" },
  { src: "/programs/surrender-facility.png", alt: "Surrender program facility" },
  { src: "/programs/mindbodysoul-education.png", alt: "Education session" },
  { src: "/programs/surrender-gathering-2.png", alt: "Peer support meeting" },
  { src: "/programs/mindbodysoul-teaching.png", alt: "Recovery teaching session" },
]

export const SOCIAL_CHANNELS = [
  { name: "Facebook", followers: "869", url: "https://www.facebook.com/avisionforyourecovery", color: "from-blue-600 to-blue-700", hoverColor: "hover:from-blue-700 hover:to-blue-800" },
  { name: "Instagram", followers: "112", url: "https://www.instagram.com/avision_foryourecovery/", color: "from-pink-500 to-purple-600", hoverColor: "hover:from-pink-600 hover:to-purple-700" },
  { name: "TikTok", followers: "41", url: "https://www.tiktok.com/@avisionforyourecovery", color: "from-gray-900 to-gray-800", hoverColor: "hover:from-gray-800 hover:to-gray-700" },
  { name: "LinkedIn", followers: "23", url: "https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/", color: "from-blue-700 to-blue-800", hoverColor: "hover:from-blue-800 hover:to-blue-900" },
]
