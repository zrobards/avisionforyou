/**
 * COMPREHENSIVE SEEZEE BUSINESS KNOWLEDGE BASE
 * 
 * This file contains ALL information about SeeZee Studio extracted from
 * the website, client dashboard, admin system, and codebase.
 * 
 * Updated automatically to keep AI responses accurate and contextual.
 */

export const SEEZEE_COMPREHENSIVE_KNOWLEDGE = {
  // ============================================================================
  // TEAM & FOUNDERS
  // ============================================================================
  team: {
    founders: [
      {
        name: "Sean McCulloch",
        role: "Co-Founder & Technical Director",
        age: 18,
        location: "Louisville, KY",
        background: "Lead Engineer focused on backend infrastructure and full-stack development. Trinity High School graduate with FBLA experience in business applications. Passionate about Raspberry Pi projects, AI automation, and building scalable systems with modern technologies.",
        specializations: [
          "Frontend & backend development",
          "Database architecture",
          "Admin dashboard design",
          "Payment & donation integrations",
          "Performance optimization",
          "Accessible UI/UX design"
        ],
        contact: {
          email: "sean@see-zee.com",
          phone: "(502) 435-2986",
          github: "https://github.com/SeanSpon",
          linkedin: "https://www.linkedin.com/in/sean-mcculloch-58a3761a9/",
          instagram: "https://www.instagram.com/sean.mcculloch7/?hl=en"
        },
        philosophy: "Builds technology that lifts people up — not locks them out. Every system designed follows one principle: 'If someone can't use it easily, it's not done.'"
      },
      {
        name: "Zach Robards",
        role: "Co-Founder & Client Experience Director",
        age: 18,
        location: "Louisville, KY",
        background: "Product Designer and Frontend Lead specializing in user experience and interface design. Focuses on client experience, presentation polish, and ensuring every project not only works perfectly but looks amazing. Trinity High School graduate with strong FBLA background.",
        specializations: [
          "Client communication & onboarding",
          "Project planning & timelines",
          "Content strategy & copywriting",
          "Community partnerships",
          "Nonprofit discount coordination",
          "Long-term client relationships"
        ],
        contact: {
          email: "Contact via Sean",
          github: "https://github.com/zrobards",
          linkedin: "https://www.linkedin.com/in/zachary-robards-b51457337/",
          instagram: "https://www.instagram.com/zachrobards/?hl=en"
        },
        philosophy: "Makes every client feel capable — even if they've never touched a computer before."
      }
    ],
    additionalTeam: [
      {
        name: "Gabe",
        role: "Team Member",
        description: "Brings hands-on problem-solving when projects get complicated. Handles the heavy lifting when projects need extra hands.",
        note: "Not a founder, but part of the team helping with complex projects."
      }
    ]
  },

  // ============================================================================
  // PRICING & TIERS
  // ============================================================================
  pricing: {
    nonprofitTiers: [
      {
        id: "ESSENTIALS",
        name: "Tier 1: Essentials",
        buildPrice: "$6,000",
        buildPriceRange: "Starting at $6,000",
        monthlyPrice: 500, // $500/month
        nonprofitBuildPrice: "$3,600", // 40% off
        description: "Website + donations + basic events",
        features: [
          "Modern website",
          "Donation system (Stripe)",
          "Event scheduling",
          "Basic admin dashboard",
          "Monthly maintenance"
        ],
        maintenanceHours: 8, // hours per month included (doubled from 4)
        changeRequests: 3, // per month
        subscriptions: 2, // max 3
        rollover: {
          maxHours: 16, // 2x monthly hours
          expiryDays: 60
        },
        monthlyPriceDollars: 500, // $500/month
        buildPriceDollars: 6000 // $6,000 build price
      },
      {
        id: "DIRECTOR",
        name: "Tier 2: Digital Director",
        buildPrice: "$7,500",
        buildPriceRange: "$7,500",
        monthlyPrice: 750, // $750/month
        nonprofitBuildPrice: "$4,500", // 40% off
        description: "Full platform + RSVPs + email automation",
        popular: true, // Most popular badge
        features: [
          "Everything in Tier 1",
          "RSVP system",
          "Email automation",
          "Attendance tracking",
          "Advanced dashboard"
        ],
        maintenanceHours: 16, // hours per month included
        changeRequests: 5, // per month
        subscriptions: 3, // max 6
        rollover: {
          maxHours: 32, // 2x monthly hours
          expiryDays: 90
        },
        monthlyPriceDollars: 750, // $750/month
        buildPriceDollars: 7500 // $7,500 build price
      },
      {
        id: "COO",
        name: "Tier 3: Digital COO",
        buildPrice: "$12,500+",
        buildPriceRange: "$12,500+",
        monthlyPrice: 2000, // $2,000/month
        nonprofitBuildPrice: "$7,500+", // 40% off
        description: "CRM + grant tracking + advanced automation",
        features: [
          "Everything in Tier 2",
          "CRM integration",
          "Grant reporting",
          "Advanced automation",
          "Custom integrations"
        ],
        maintenanceHours: -1, // unlimited
        changeRequests: -1, // unlimited
        subscriptions: -1, // unlimited
        rollover: {
          maxHours: -1, // unlimited (rollover disabled)
          expiryDays: 0
        },
        monthlyPriceDollars: 2000, // $2,000/month
        buildPriceDollars: 12500 // $12,500 build price
      }
    ],
    nonprofitDiscount: {
      percentage: 40,
      appliesTo: "Verified 501(c)(3) organizations",
      note: "40% off build prices and monthly maintenance"
    },
    otherServices: {
      business: {
        description: "Modern, professional websites for small businesses and local teams",
        pricing: "Custom pricing • Share your budget range",
        features: [
          "5-10 pages",
          "Contact forms",
          "Service showcases",
          "Mobile responsive",
          "Basic SEO"
        ]
      },
      personal: {
        description: "Portfolio, resume, or personal brand platform",
        pricing: "Custom pricing • Typically $1,500-$3,000",
        features: [
          "Clean, modern design",
          "About & contact pages",
          "Portfolio/work showcase",
          "Blog (optional)",
          "Simple admin tools"
        ]
      },
      maintenance: {
        description: "Ongoing support for your existing website",
        pricing: "$79-$149/month • Nonprofit discounts available",
        features: [
          "Updates & bug fixes",
          "Security monitoring",
          "Content changes",
          "Performance optimization",
          "Priority support"
        ]
      }
    }
  },

  // ============================================================================
  // HOUR PACKS (CLIENT DASHBOARD)
  // ============================================================================
  hourPacks: [
    {
      id: "SMALL",
      name: "Quick Boost",
      hours: 5,
      price: 350, // $350
      pricePerHour: 70, // $70/hour
      expiryDays: 60,
      neverExpires: false,
      popular: false,
      description: "Perfect for quick updates and minor fixes"
    },
    {
      id: "MEDIUM",
      name: "Power Pack",
      hours: 10,
      price: 650, // $650
      pricePerHour: 65, // $65/hour
      expiryDays: 90,
      neverExpires: false,
      popular: true, // Most Popular badge
      savings: 50, // Save $50
      description: "Ideal for ongoing improvements and enhancements"
    },
    {
      id: "LARGE",
      name: "Mega Pack",
      hours: 20,
      price: 1200, // $1,200
      pricePerHour: 60, // $60/hour
      expiryDays: 120,
      neverExpires: false,
      popular: false,
      savings: 200, // Save $200
      description: "Best value for major projects and redesigns"
    },
    {
      id: "PREMIUM",
      name: "Never Expire Pack",
      hours: 10,
      price: 850, // $850
      pricePerHour: 85, // $85/hour (premium for no expiry)
      expiryDays: 0,
      neverExpires: true,
      popular: false,
      description: "10 hours that never expire - premium option"
    }
  ],

  // ============================================================================
  // CLIENT DASHBOARD FEATURES
  // ============================================================================
  clientDashboard: {
    overview: "Each tier includes an admin dashboard where clients can manage their site content, view donations, track events, etc. The complexity varies by tier.",
    features: [
      "Track project progress",
      "View invoices and billing",
      "Request changes",
      "Submit change requests",
      "View hours balance (monthly + hour packs)",
      "Purchase hour packs",
      "Manage subscriptions",
      "View deployment status",
      "Access project files",
      "View tasks and milestones",
      "Calendar integration",
      "Activity feed",
      "Messages with team",
      "Support portal"
    ],
    hourTracking: {
      monthlyIncluded: "Hours included in monthly maintenance plan",
      hourPacks: "Additional hours purchased as packs",
      rollover: "Unused monthly hours can rollover (varies by tier)",
      changeRequests: "Unlimited change requests for Tier 2 & 3, 3/month for Tier 1"
    },
    access: "Clients get their own login at /client with full dashboard access"
  },

  // ============================================================================
  // BACKGROUND & ROOTS
  // ============================================================================
  background: {
    school: {
      name: "Trinity High School",
      location: "Louisville, KY",
      significance: "Where Sean and Zach first discovered their passion for building technology that serves others. SeeZee was born from projects built for FBLA competitions and community service initiatives."
    },
    organizations: [
      {
        name: "FBLA",
        fullName: "Future Business Leaders of America",
        significance: "Taught the importance of leadership, community engagement, and using skills to make a real difference. Through FBLA, Sean and Zach learned that business and service go hand in hand. They continue to partner with FBLA chapters, offering students real-world experience by working on projects for nonprofits."
      },
      {
        name: "Beta Club",
        significance: "Part of community service and academic excellence program"
      }
    ],
    originStory: "SeeZee started with two high school friends building websites for FBLA competitions and community projects. What began as school projects quickly became something more serious: a mission to build technology that's calm, accessible, and actually works for people who struggle with typical websites."
  },

  // ============================================================================
  // CASE STUDIES & PROJECTS
  // ============================================================================
  projects: [
    {
      name: "A Vision For You (AVFY)",
      type: "Recovery Nonprofit Platform",
      client: "Louisville 501(c)(3) recovery center",
      launchDate: "December 20, 2024",
      tier: "Tier 3: Digital COO",
      description: "Full recovery center platform serving 500+ people annually",
      features: [
        "Stripe-integrated donation system",
        "Impact-based donations ($25-$500 tiers)",
        "Real-time impact calculator",
        "One-time and monthly recurring donations",
        "Multi-channel contact system",
        "Meeting & RSVP automation",
        "Email workflows via Resend API",
        "Algorithm-based program matching",
        "4 recovery programs with descriptions",
        "500+ clients served",
        "24/7 donation processing"
      ],
      techStack: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "Resend"],
      significance: "Flagship project demonstrating full platform capabilities, Stripe integration, and nonprofit expertise"
    },
    {
      name: "Big Red Bus",
      type: "Mental Health Platform",
      description: "Early project that taught how to build accessible technology that feels simple and human"
    }
  ],

  // ============================================================================
  // SERVICES & CAPABILITIES
  // ============================================================================
  services: {
    primary: [
      "Website Design & Development",
      "Web Applications & Platforms",
      "Mobile Apps (iOS, Android, cross-platform)",
      "Custom Software Solutions",
      "API Development & Integrations",
      "Database Design & Architecture",
      "Accessibility Consulting (WCAG AA+ compliance)"
    ],
    specializations: [
      "Nonprofit organizations",
      "Mental health & recovery centers",
      "Community-focused businesses",
      "Healthcare providers",
      "Educational institutions",
      "Local Louisville businesses",
      "Organizations with missions we believe in"
    ],
    differentiators: [
      "Versatile - web, mobile, custom software - we build whatever you need",
      "Local - Louisville-based, we understand our community",
      "Accessible - WCAG AA+ standards on everything we build",
      "Affordable - student rates, nonprofit discounts, flexible pricing",
      "Passionate - we only take projects we believe in",
      "Hungry - we're building our business and eager for work",
      "Responsive - fast replies, quick turnaround, always available"
    ]
  },

  // ============================================================================
  // PROCESS & TIMELINE
  // ============================================================================
  process: {
    steps: [
      {
        step: 1,
        name: "Discovery Call",
        duration: "Free, 30 minutes",
        description: "We learn about your organization and mission. You tell us what you need and what challenges you face. We discuss whether we're a good fit. No pressure, no sales pitch - just a conversation."
      },
      {
        step: 2,
        name: "Proposal & Quote",
        description: "We send a detailed proposal outlining scope, timeline, pricing. You review and ask questions. We revise until it feels right. Contract signed, deposit paid."
      },
      {
        step: 3,
        name: "Design & Development",
        description: "We create mockups/wireframes for your approval. Weekly check-ins to show progress. You can request changes along the way. We build with your feedback."
      },
      {
        step: 4,
        name: "Testing & Launch",
        description: "We test everything thoroughly. You do final review and approval. We launch your site/app. Training on how to manage it."
      },
      {
        step: 5,
        name: "Ongoing Support",
        description: "Free bug fixes for 30 days post-launch. Optional maintenance plans available. We're here if you need updates or help. Long-term partnership, not a one-time gig."
      }
    ],
    timelines: {
      essentials: "2-4 weeks",
      director: "4-8 weeks",
      coo: "8-12 weeks",
      custom: "Depends on scope (we'll estimate)",
      note: "We're students, so we're FAST and HUNGRY. We often deliver ahead of schedule."
    }
  },

  // ============================================================================
  // VALUES & PHILOSOPHY
  // ============================================================================
  values: [
    "Technology Should Be Accessible — Cognitively, Not Just Structurally",
    "People Deserve Dignity Online — Even If They Struggle With Tech",
    "We Build for the People Big Agencies Overlook",
    "Support Doesn't Disappear After Launch",
    "Relationships Matter More Than Contracts",
    "We Give Back Through Community & Education"
  ],

  mission: "SeeZee exists because we believe the internet should include everyone. We build accessible platforms, simple admin tools, affordable solutions for nonprofits, and long-term partnerships that don't end after launch. We're building access. We're building dignity. We're building community.",

  whoWeServe: [
    "Mental Health Organizations",
    "Neuro-Inclusive Communities",
    "Senior & Community Groups",
    "Nonprofits & Small Teams",
    "Student & Youth Programs",
    "Support & Recovery Groups"
  ],

  // ============================================================================
  // CONTACT & LOCATION
  // ============================================================================
  contact: {
    primary: {
      email: "sean@see-zee.com",
      phone: "(502) 435-2986"
    },
    location: "Louisville, KY",
    website: "https://see-zee.com",
    note: "We're local to Louisville but serve clients anywhere."
  },

  // ============================================================================
  // COMMON QUESTIONS & ANSWERS
  // ============================================================================
  faqs: [
    {
      q: "How long does it take?",
      a: "Most nonprofit projects are completed in 2-3 weeks, depending on tier complexity. Tier 1: 2-4 weeks, Tier 2: 4-8 weeks, Tier 3: 8-12 weeks."
    },
    {
      q: "What if I don't know what tier we need?",
      a: "Book a free audit and we'll review your current systems and recommend the right tier for your nonprofit's stage."
    },
    {
      q: "Do you only work with nonprofits?",
      a: "No! While we specialize in nonprofit infrastructure, we also build websites for small businesses and personal projects."
    },
    {
      q: "What's included in maintenance?",
      a: "Hosting, security updates, backups, content updates (varies by tier), and access to your admin dashboard. Tier 1: 2 hours/month, Tier 2: 4 hours/month, Tier 3: 8 hours/month (unlimited for COO)."
    },
    {
      q: "Can we upgrade tiers later?",
      a: "Absolutely! Start with Tier 1 and upgrade as your nonprofit grows and needs more features."
    },
    {
      q: "What if we need changes after launch?",
      a: "All tiers include monthly maintenance hours for updates and changes. Additional hours can be purchased as hour packs if needed."
    },
    {
      q: "Do we own the platform?",
      a: "Yes! You own all content and data. We maintain the hosting and technical infrastructure."
    },
    {
      q: "What payment methods do you accept?",
      a: "We use Stripe for secure payment processing. Credit cards, debit cards, and ACH transfers accepted."
    }
  ]
};

/**
 * Helper function to format pricing for display
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Helper function to get tier by ID
 */
export function getTierById(tierId: string) {
  return SEEZEE_COMPREHENSIVE_KNOWLEDGE.pricing.nonprofitTiers.find(
    t => t.id === tierId.toUpperCase()
  );
}

