# A Vision For You — Complete Website Guide

**For Staff, Board Members, and Volunteers**
*avisionforyourecovery.org*

---

## What This Website Does

The A Vision For You website is the digital home of our 501(c)(3) nonprofit (EIN: 87-1066569). It serves as a public-facing information hub, a donation platform, a community space for alumni, a management portal for board members, and an administration system for staff — all in one place.

This guide explains every feature of the website so you can use it to its fullest potential.

---

## Table of Contents

**Getting Started**
1. [Creating an Account & Signing In](#1-creating-an-account--signing-in)
2. [Understanding User Roles](#2-understanding-user-roles)
3. [Your Dashboard](#3-your-dashboard)

**Public-Facing Website**
4. [Homepage & Navigation](#4-homepage--navigation)
5. [Programs Directory](#5-programs-directory)
6. [Blog & Recovery Stories](#6-blog--recovery-stories)
7. [Donations](#7-donations)
8. [DUI Education Classes](#8-dui-education-classes)
9. [Newsletter](#9-newsletter)
10. [Contact & Admission Inquiries](#10-contact--admission-inquiries)
11. [Impact Dashboard](#11-impact-dashboard)
12. [Social Media Integration](#12-social-media-integration)
13. [About, Team & Legal Pages](#13-about-team--legal-pages)

**Community Hub (Alumni, Board, Admin)**
14. [Community Announcements](#14-community-announcements)
15. [Community Polls & Voting](#15-community-polls--voting)
16. [Community Resources](#16-community-resources)
17. [Meetings & RSVPs](#17-meetings--rsvps)

**Board Member Portal**
18. [Board Dashboard & Metrics](#18-board-dashboard--metrics)
19. [Fundraising Campaigns](#19-fundraising-campaigns)
20. [Board Documents & Governance](#20-board-documents--governance)
21. [Meeting Minutes](#21-meeting-minutes)
22. [Donation Reports & Exports](#22-donation-reports--exports)

**Admin Panel**
23. [Admin Dashboard Overview](#23-admin-dashboard-overview)
24. [User Management](#24-user-management)
25. [Blog Management](#25-blog-management)
26. [Meeting & Event Scheduling](#26-meeting--event-scheduling)
27. [Newsletter Management & Subscribers](#27-newsletter-management--subscribers)
28. [Media Library](#28-media-library)
29. [Team Member Profiles](#29-team-member-profiles)
30. [Contact & Admission Inquiry Tracking](#30-contact--admission-inquiry-tracking)
31. [Donation Administration](#31-donation-administration)
32. [DUI Class Administration](#32-dui-class-administration)
33. [Community Management](#33-community-management)
34. [Board Content Management](#34-board-content-management)
35. [Analytics & Reporting](#35-analytics--reporting)
36. [Site Settings & Social Configuration](#36-site-settings--social-configuration)

**Reference**
37. [Notifications](#37-notifications)
38. [Security & Privacy Features](#38-security--privacy-features)
39. [Quick Reference: All URLs](#39-quick-reference-all-urls)
40. [Troubleshooting](#40-troubleshooting)
41. [Glossary](#41-glossary)

---

# Getting Started

---

## 1. Creating an Account & Signing In

### Website URL
**https://avisionforyourecovery.org/login**

### Three Ways to Sign In

| Method | Best For | How It Works |
|--------|----------|--------------|
| **Google Sign-In** | Staff & Board Members | Click "Sign in with Google" — uses your Google account. Recommended for staff because it's fast and secure. |
| **Email & Password** | Community Members | Create an account at `/signup` with your email and a password. You must verify your email before you can sign in. |
| **Email Magic Link** | Anyone | Enter your email and receive a one-click sign-in link. No password needed. |

### Email Verification (New Accounts)

When someone creates an account with email and password:

1. They fill out the signup form at `/signup`
2. A **verification email** is sent to their inbox
3. They click the link in the email to verify
4. Only then can they sign in

This prevents fake accounts from accessing the site. If someone doesn't receive the email, they can request a new one from the login page.

### Forgot Password

1. Go to `/forgot-password`
2. Enter your email
3. Check your inbox for a reset link (expires in 1 hour)
4. Click the link and choose a new password

### Password Requirements

- At least 8 characters
- At least 1 number
- At least 1 special character (e.g., !@#$%)

---

## 2. Understanding User Roles

Every account has one of four roles. Your role determines what parts of the website you can access.

| Role | What You Can Access | Who Gets This Role |
|------|--------------------|--------------------|
| **User** | Public pages, personal dashboard, donation history | Anyone who signs up |
| **Alumni** | Everything above + Community Hub (announcements, polls, resources, meetings) | Program graduates and active community members |
| **Board** | Everything above + Board Portal (campaigns, documents, minutes, metrics, donation reports) | Board members |
| **Admin** | Everything — full control of the entire website | Staff and administrators |

**How roles are assigned:** An Admin promotes users from the Admin Panel at `/admin/users`. The admin email set in the system (`lucasbennett@avisionforyourecovery.org`) is automatically promoted to Admin when signing in with Google.

---

## 3. Your Dashboard

**URL:** `/dashboard`
**Who can access:** Any signed-in user

Your personal dashboard shows:

- **Welcome message** with your name and role
- **Upcoming meetings** you've RSVP'd to
- **Your donation history** and recurring donation status
- **Quick links** to sections you have access to based on your role
- **Notifications** — the bell icon in the top navigation shows unread alerts

---

# Public-Facing Website

*These pages are visible to everyone, no login required.*

---

## 4. Homepage & Navigation

**URL:** `/` (the main page)

The homepage is the first thing visitors see. It includes:

- **Hero Section** — A welcoming banner with a call to action
- **Programs Overview** — Cards highlighting our six core programs
- **Statistics Banner** — Real-time numbers showing our impact (people helped, meals served, etc.)
- **Testimonials Carousel** — Rotating recovery stories from community members
- **Donation Call-to-Action** — Prominent section encouraging financial support
- **Facebook Feed** — Live embedded feed from our Facebook page
- **Community Section** — Overview of what the community hub offers
- **Newsletter Signup** — Email capture for our mailing list

### Navigation Bar

The top navigation bar appears on every page and includes links to:

| Link | Where It Goes |
|------|--------------|
| Home | `/` |
| About | `/about` |
| Programs | `/programs` |
| Blog | `/blog` |
| Donate | `/donate` |
| Contact | `/contact` |
| Sign In / Dashboard | `/login` or `/dashboard` |

A **sticky "Donate" button** appears on the side of the screen as visitors scroll, making it easy to give at any time.

---

## 5. Programs Directory

**URL:** `/programs`

This page showcases all of our programs:

| Program | Description |
|---------|-------------|
| **IOP (Intensive Outpatient)** | Structured recovery program with scheduled sessions |
| **Shelter** | Safe housing support for individuals in recovery |
| **Self-Help** | Peer-led support groups and meetings |
| **Food** | Meal programs and food assistance |
| **Housing** | Long-term housing stability support |

Each program has its own detail page at `/programs/[program-name]` with:
- Full description
- Schedule and session information
- How to get involved
- Link to the admission inquiry form

### Program Assessment

**URL:** `/assessment`

Visitors can take a **recovery program matching questionnaire** that helps them identify which of our programs is the best fit for their situation. The results are stored securely with encryption for HIPAA compliance.

---

## 6. Blog & Recovery Stories

**URL:** `/blog`

The blog is our content hub for sharing news, educational content, recovery stories, and community updates.

### What Visitors See

- **Blog listing** with featured images, titles, excerpts, and publication dates
- **Individual posts** with full content, author info, view counts, and social share buttons
- **Categories** for filtering: Recovery, Community, Education, Stories, Ethics
- **Tags** for more specific filtering

### Why the Blog Matters

- **SEO:** Blog posts help the website appear in Google searches, bringing more people to our programs
- **Storytelling:** Recovery stories inspire others and build trust
- **Education:** Posts about addiction, recovery, and mental health establish us as a trusted resource
- **Engagement:** Regular content gives people a reason to return to the site

---

## 7. Donations

**URL:** `/donate`

The donation system is one of the most important features of the website. It allows anyone to contribute financially to our mission.

### How Donations Work

1. Visitor goes to `/donate`
2. They choose an amount (preset options or custom)
3. They select a frequency:
   - **One-Time** — A single gift
   - **Monthly** — Automatic recurring donation every month
   - **Yearly** — Automatic recurring donation every year
4. They enter payment info through **Square** (our payment processor)
5. They receive a **confirmation email** with a tax-deductible receipt

### Donation Features

- **Secure payments** processed by Square with encrypted card data
- **Recurring donations** managed automatically — donors can cancel from their dashboard
- **Tax receipts** sent via email (we're a 501(c)(3), EIN: 87-1066569)
- **Webhook verification** ensures all payment confirmations are authentic
- **Donation tracking** in the admin panel with export to CSV

### Why Recurring Donations Matter

Monthly donors provide **predictable revenue** that lets us plan programs with confidence. A $50/month donor contributes $600/year — and monthly donors tend to give for an average of 2+ years.

---

## 8. DUI Education Classes

**URL:** `/programs/dui-classes`

We offer state-required DUI education classes as a revenue stream that also serves the community.

### How It Works for Students

1. Visit the DUI classes page
2. View available classes with dates, times, locations, and prices
3. Click "Register" on the class they want
4. Complete payment through Square
5. Receive confirmation email with class details

### How It Works for Admins

Admins schedule classes, set pricing and capacity, and track registrations from `/admin/dui-classes`. Each registration tracks payment status and attendance.

---

## 9. Newsletter

**URL:** `/newsletter`

### For Visitors (Subscribing)

- A signup form appears on the homepage and at `/newsletter`
- Enter your email to subscribe
- Receive periodic newsletters about programs, events, stories, and news
- Unsubscribe anytime with the link at the bottom of each email

### For Admins (Creating & Sending)

See [Section 27: Newsletter Management](#27-newsletter-management--subscribers) for full details on creating, managing subscribers, and sending newsletters.

### The Value of the Newsletter

- **Direct communication** with supporters — no algorithm filtering your content
- **Donor retention** — regular updates keep donors engaged and more likely to give again
- **Event promotion** — drive attendance to meetings and programs
- **Community building** — share stories and celebrate milestones

---

## 10. Contact & Admission Inquiries

### Contact Form
**URL:** `/contact`

Anyone can submit a general inquiry. The form collects name, email, and message. Submissions appear in the admin panel at `/admin/contact` where staff can track status (New → In Progress → Responded → Resolved → Archived).

### Admission Inquiries
**URL:** `/admission`

People interested in joining a program can submit an admission inquiry. This collects more detailed information and sends two emails:
1. **To the applicant** — A confirmation that their inquiry was received, with next steps
2. **To the admin** — A notification (HIPAA-compliant, no personal details in the email) to check the admin panel

Admins manage admission inquiries at `/admin/admissions`.

---

## 11. Impact Dashboard

**URL:** `/impact`

A public-facing page that showcases our organization's impact with real data:

- **Program outcomes** — Completion rates, employment stats, housing stability
- **Total donations raised**
- **People served**
- **Community growth metrics**

This page is valuable for:
- **Grant applications** — Show funders our measurable impact
- **Donor confidence** — Transparency builds trust
- **Community pride** — Celebrate what we've accomplished together

---

## 12. Social Media Integration

**URL:** `/social`

The website integrates with our social media presence:

- **Facebook Feed** — Embedded live feed from our Facebook page, visible on the homepage and social page
- **Instagram Feed** — Embedded Instagram content
- **Social Media Stats** — Follower counts displayed publicly at `/social`
- **Share Buttons** — Every blog post and page has social share buttons for Facebook, Twitter, LinkedIn, and email

Admins can configure social media links and embed settings from `/admin/settings/social`.

---

## 13. About, Team & Legal Pages

| Page | URL | What It Contains |
|------|-----|-----------------|
| **About** | `/about` | Our mission, history, and values |
| **Team** | `/team` | Staff and leadership directory with photos and bios |
| **Privacy Policy** | `/privacy` | How we handle visitor data |
| **Terms of Service** | `/terms` | Website terms and conditions |

---

# Community Hub

*Available to Alumni, Board Members, and Admins*

---

## 14. Community Announcements

**URL:** `/community/announcements`

This is the internal announcement board for our community. Admins post updates that are visible only to authenticated community members (Alumni, Board, Admin).

**What you'll see:**
- Organization news and updates
- Program changes and schedule updates
- Celebration of milestones and achievements
- Important reminders

---

## 15. Community Polls & Voting

**URL:** `/community/polls`

Polls let the community have a voice in decisions.

### How Voting Works

1. An admin creates a poll with a question
2. Community members see the poll in the Community Hub
3. Click **"Yes"** or **"No"** to cast your vote
4. Results are shown immediately after voting
5. Each person can only vote once per poll

### Use Cases

- Should we add a new meeting time on Saturdays?
- Do you support the proposed community garden project?
- Which event theme should we choose for the annual celebration?

---

## 16. Community Resources

**URL:** `/community/resources`

A curated collection of helpful links and resources for community members:

- Job boards and employment resources
- Recovery support tools
- Housing assistance links
- Health and wellness resources
- Educational opportunities

Admins manage resources from `/admin/community/resources`.

---

## 17. Meetings & RSVPs

**URL:** `/community/meetings`

Community members can:
1. Browse upcoming program sessions and meetings
2. **RSVP** to confirm attendance
3. View their RSVPs from their dashboard
4. Receive **automatic email reminders**:
   - 24 hours before the meeting
   - 1 hour before the meeting

The meeting scheduler supports both **in-person** and **online** formats, with location details or meeting links as appropriate.

---

# Board Member Portal

*Available to Board Members and Admins*

---

## 18. Board Dashboard & Metrics

**URL:** `/board`

The board portal provides a high-level view of organizational health:

- **Key Performance Indicators (KPIs)** — Donation totals, member growth, program participation
- **Recent activity feed** — What's happening across the organization
- **Quick access** to campaigns, documents, minutes, and reports

---

## 19. Fundraising Campaigns

**URL:** `/board/campaigns`

Board members can view and manage fundraising campaigns:

- **Campaign tracking** — See goal amount vs. amount raised with progress bars
- **Campaign notes** — Add discussion notes and planning comments
- **Status management** — Draft → Active → Completed → Cancelled
- **Social sharing** — Share campaigns on Facebook, LinkedIn, or via email with one click
- **Copy link** — Get a shareable link to send to potential donors

---

## 20. Board Documents & Governance

**URL:** `/board/documents`

A secure repository for board-level documents:

| Document Type | Examples |
|--------------|---------|
| **Executive Directives** | Strategic decisions, policy changes |
| **Board Updates** | Monthly/quarterly reports |
| **Financial Summaries** | Budget reports, financial statements |
| **Governance** | Bylaws, meeting agendas, organizational charts |

Documents are uploaded by admins and accessible to all board members. Files are stored securely on Vercel Blob storage.

---

## 21. Meeting Minutes

**URL:** `/board/minutes`

After each board meeting, minutes are uploaded here for the record:

- Date and title of the meeting
- List of attendees
- Downloadable document file
- Chronological archive of all past minutes

---

## 22. Donation Reports & Exports

**URL:** `/board/donations`

Board members can:
- View all donation records with amounts, dates, and frequencies
- Filter by date range, status, or type
- **Export to CSV** for use in spreadsheets, grant applications, or financial reporting

---

# Admin Panel

*Available to Admins only*

---

## 23. Admin Dashboard Overview

**URL:** `/admin`

The admin dashboard is the command center for running the website. It shows quick-access cards for every management function and a summary of recent activity.

### Admin Navigation

| Section | URL | Purpose |
|---------|-----|---------|
| Users | `/admin/users` | Manage accounts and roles |
| Blog | `/admin/blog` | Create and manage blog posts |
| Meetings | `/admin/meetings` | Schedule sessions and events |
| Media | `/admin/media` | Upload and organize photos/videos |
| Newsletter | `/admin/newsletter` | Create newsletters, manage subscribers, send campaigns |
| Team | `/admin/team` | Manage staff/leadership profiles |
| Contact Forms | `/admin/contact` | View and respond to inquiries |
| Admissions | `/admin/admissions` | Track program applications |
| Donations | `/admin/donations` | View and export donation data |
| DUI Classes | `/admin/dui-classes` | Schedule classes, track registrations |
| Analytics | `/admin/analytics` | Website traffic and conversion data |
| Social Stats | `/admin/social-stats` | Social media follower metrics |
| Community | `/admin/community` | Manage announcements, polls, resources |
| Board | `/admin/board` | Manage board updates and documents |
| Settings | `/admin/settings` | Site-wide configuration |

---

## 24. User Management

**URL:** `/admin/users`

This is where you control who has access to what.

### What You Can Do

- **Search users** by name or email
- **Filter by role** (Admin, Board, Alumni, User)
- **Change a user's role** — Use the dropdown next to their name to promote or demote
- **Delete a user** — Removes their account permanently (with confirmation)
- **View user activity** — See RSVP count and donation history per user

### Common Tasks

| Task | How |
|------|-----|
| Promote a graduate to Alumni | Find them → change role dropdown to "Alumni" |
| Add a new board member | Find them → change role to "Board" |
| Make someone an admin | Find them → change role to "Admin" |
| Remove a spam account | Find them → click Delete → confirm |

---

## 25. Blog Management

**URL:** `/admin/blog`

### Creating a Post

1. Click **"Create New Post"**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | The headline — keep it clear and compelling |
| Content | Yes | Full article body. Uses a rich text editor with formatting, links, images, headings, lists, and more. |
| Excerpt | No | Short summary for blog listing cards and email previews |
| Category | Yes | Recovery, Community, Education, Stories, or Ethics |
| Tags | No | Comma-separated keywords for filtering |
| Featured Image | No | Upload directly or drag-and-drop |
| Status | Yes | Draft (hidden) or Published (live) |

3. Click **Save**

### Tips for Great Blog Content

- **Post regularly** — Even once a week keeps the site fresh and helps SEO
- **Use images** — Posts with photos get 2x more engagement
- **Tell stories** — Personal recovery narratives are the most-shared content type for nonprofits
- **Include calls to action** — End posts with "Donate," "Attend a Meeting," or "Share This Story"
- **Use categories and tags** — Helps visitors find content and improves search engine ranking

---

## 26. Meeting & Event Scheduling

**URL:** `/admin/meetings`

### Creating a Meeting

1. Click **"Schedule Meeting"**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Meeting or event name |
| Description | Yes | What the meeting is about |
| Program | No | Link to a specific program (IOP, Shelter, etc.) |
| Start Time | Yes | Date and time |
| End Time | Yes | Must be after start time |
| Format | Yes | In-Person or Online |
| Location | If in-person | Physical address |
| Meeting Link | If online | Zoom, Google Meet URL, etc. |
| Capacity | No | Maximum attendees (leave blank for unlimited) |

3. Click **"Create"**

### Automatic Reminders

The system automatically sends email reminders to everyone who RSVPs:
- **24 hours before** the meeting
- **1 hour before** the meeting

This runs automatically every 10 minutes — no action needed from staff.

---

## 27. Newsletter Management & Subscribers

**URL:** `/admin/newsletter`

### Managing Subscribers

Click the **"Subscribers"** button in the header to open the subscriber panel:

- **View all subscribers** with their email and subscription date
- **Add a subscriber** manually by entering their email
- **Remove a subscriber** by clicking the Remove button next to their name
- See the **total subscriber count** at a glance

People can also subscribe themselves from the public newsletter signup form on the homepage and at `/newsletter`.

### Creating a Newsletter

1. Click **"New Newsletter"**
2. Fill in:
   - **Title** — This becomes the email subject line
   - **Excerpt** — Preview text shown in email clients before opening
   - **Content** — The full newsletter body (rich text editor with formatting)
   - **Image** — Optional featured image (drag-and-drop or click to upload)
   - **Status** — Draft or Published
3. Click **"Create Newsletter"**

### Sending a Newsletter

1. Find the newsletter in your list
2. Click the **"Send"** button
3. Confirm in the popup dialog
4. Emails are sent to all active subscribers with a 600ms delay between each to avoid rate limits
5. The send count updates automatically

**Important:** Sending cannot be undone. Always preview your content before clicking Send.

### What Subscribers Receive

Each newsletter email includes:
- Your title and content in a branded template
- Featured image (if added)
- A "Read More on Our Website" button
- Organization contact info
- An **unsubscribe link** (legally required)

---

## 28. Media Library

**URL:** `/admin/media`

### Uploading Files

1. Click **"Upload"**
2. Drag and drop or click to browse
3. Tag each file:
   - **Tags:** event, recovery, donor, program, facility, community, celebration
   - **Usage:** website, Facebook, Instagram, Twitter, grants, newsletter, marketing
4. Click **"Upload"**

### Supported Files

| Type | Formats | Max Size |
|------|---------|----------|
| Images | JPG, PNG, WebP, GIF | 10 MB |
| Videos | MP4 | 10 MB |

### Managing Your Library

- **Search** by filename or tags
- **Filter** by tag category
- **Preview** thumbnails
- **Download** individual files
- **Delete** files you no longer need

### Using Media Elsewhere

- Blog posts: Select from library or upload new images as featured images
- Newsletter: Upload images directly in the newsletter editor
- Board documents: Upload PDFs and documents for the board portal

---

## 29. Team Member Profiles

**URL:** `/admin/team`

Manage the staff and leadership directory shown on the `/team` page.

### Adding or Editing a Team Member

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | Full name |
| Title | Yes | Job title or role |
| Bio | No | Short biography (up to 5,000 characters) |
| Email | No | Contact email |
| Phone | No | Contact phone |
| Photo | No | Profile picture — upload or enter URL |

---

## 30. Contact & Admission Inquiry Tracking

### Contact Inquiries
**URL:** `/admin/contact`

Every submission from the `/contact` form appears here. Each inquiry has a status:

| Status | Meaning |
|--------|---------|
| **New** | Just received, nobody has looked at it yet |
| **In Progress** | Someone is working on a response |
| **Responded** | A reply has been sent |
| **Resolved** | The issue is fully handled |
| **Archived** | Stored for records, no longer active |

### Admission Inquiries
**URL:** `/admin/admissions`

Program admission requests appear here with the applicant's details. Follow up within 24 hours to maintain engagement. The system automatically sends HIPAA-compliant notifications.

---

## 31. Donation Administration

**URL:** `/admin/donations`

### Dashboard Metrics

| Metric | What It Shows |
|--------|--------------|
| Total Raised | All-time donation total |
| Average Donation | Mean donation amount |
| Monthly Recurring | Revenue from recurring donors |
| Success Rate | % of completed vs. attempted donations |
| One-Time Count | Number of single gifts |
| Recurring Count | Number of active subscriptions |
| Pending | Donations being processed |
| Failed | Donations that didn't complete |

### Filtering & Search

- Search by donor name or email
- Filter by status: Completed, Pending, Failed
- Filter by type: One-Time, Monthly, Yearly

### Exporting

Click **"Export CSV"** to download a spreadsheet for:
- Financial reporting
- Grant applications
- Tax records
- Board presentations

---

## 32. DUI Class Administration

**URL:** `/admin/dui-classes`

### Scheduling a Class

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Class name |
| Description | No | Details about the class |
| Date | Yes | When the class takes place |
| Start/End Time | Yes | Session hours |
| Location | Yes | Physical address |
| Price | Yes | Cost in dollars |
| Capacity | Yes | Maximum students |
| Instructor | No | Who's teaching |
| Active | Yes | Whether registration is open |

### Tracking Registrations

Each class shows a list of registered students with:
- Name and email
- Payment status (Pending, Completed, Failed, Refunded)
- Registration status (Pending, Confirmed, Cancelled, Attended, No-Show)

---

## 33. Community Management

**URL:** `/admin/community`

Manage the three sections of the Community Hub:

### Announcements (`/admin/community/announcements`)
- Create, edit, publish, unpublish, and delete announcements
- Toggle visibility with the Published switch

### Polls (`/admin/community/polls`)
- Create polls with a question and optional description
- Set an optional closing date
- Toggle polls open/closed
- View real-time results with vote counts and percentages
- Delete polls when no longer needed

### Resources (`/admin/community/resources`)
- Add helpful links and resources for community members
- Categorize and describe each resource
- Edit or remove outdated resources

---

## 34. Board Content Management

### Board Updates (`/admin/board/updates`)
- Create strategic updates and directives
- Set **High Priority** for urgent items (displays as an alert banner in the board portal)
- Categorize: Executive Directive, Board Update, Financial Summary, Governance

### Board Documents (`/admin/board/documents`)
- Upload documents (PDF, etc.) to the secure board portal
- Categorize by type for easy filtering
- Board members can access and download from `/board/documents`

---

## 35. Analytics & Reporting

**URL:** `/admin/analytics`

The analytics dashboard connects to **Google Analytics 4** and shows:

- **Page views** — Which pages get the most traffic
- **Visitor sources** — Where people are coming from (Google, social media, direct)
- **Top content** — Most-read blog posts and most-visited pages
- **Conversion data** — How many visitors take actions (donate, sign up, RSVP)
- **Device breakdown** — Desktop vs. mobile vs. tablet

### Social Stats (`/admin/social-stats`)

Track follower counts across platforms:
- Facebook
- Instagram
- Twitter/X
- YouTube

---

## 36. Site Settings & Social Configuration

**URL:** `/admin/settings`

### Social Media Settings (`/admin/settings/social`)

Configure the social media links and embed widgets that appear across the site:
- Facebook page URL and embedded feed settings
- Instagram handle
- LinkedIn page
- TikTok account
- Widget and embed IDs for live feeds

---

# Reference

---

## 37. Notifications

The **notification bell** in the top navigation bar shows real-time alerts. Notifications are generated when:

- A new user registers
- A donation is received
- An RSVP is submitted
- An inquiry comes in
- A board update is posted

Click the bell to see all notifications. Notifications are filtered by your role — you only see what's relevant to you.

**URL:** `/notifications` for the full notification center.

---

## 38. Security & Privacy Features

The website has robust security built in:

| Feature | What It Does |
|---------|-------------|
| **Email Verification** | New accounts must verify their email before signing in |
| **Role-Based Access** | Each page and API checks your role before showing content |
| **Encrypted Data** | Sensitive data (like assessment answers) is encrypted with AES-256-GCM |
| **Rate Limiting** | Prevents spam and abuse on all forms and API endpoints |
| **CSRF Protection** | Blocks malicious cross-site requests |
| **Security Headers** | HSTS, Content Security Policy, X-Frame-Options, and more |
| **Webhook Verification** | Payment confirmations are verified with HMAC signatures |
| **Audit Logging** | All admin actions are logged for accountability |
| **Password Requirements** | Minimum 8 characters with numbers and special characters |
| **Input Sanitization** | All user input is cleaned to prevent injection attacks |
| **Cookie Consent** | Visitors are informed about cookie usage |

---

## 39. Quick Reference: All URLs

### Public Pages (No Login Required)

| Page | URL |
|------|-----|
| Homepage | `/` |
| About | `/about` |
| Programs | `/programs` |
| Program Detail | `/programs/[program-name]` |
| Blog | `/blog` |
| Blog Post | `/blog/[post-id]` |
| Donate | `/donate` |
| DUI Classes | `/programs/dui-classes` |
| Newsletter | `/newsletter` |
| Contact | `/contact` |
| Admission Inquiry | `/admission` |
| Program Assessment | `/assessment` |
| Impact Dashboard | `/impact` |
| Social Media | `/social` |
| Team | `/team` |
| Privacy Policy | `/privacy` |
| Terms of Service | `/terms` |
| Sign Up | `/signup` |
| Sign In | `/login` |
| Forgot Password | `/forgot-password` |
| Reset Password | `/reset-password` |
| Verify Email | `/verify-email` |

### Authenticated Pages (Login Required)

| Page | URL | Minimum Role |
|------|-----|-------------|
| Dashboard | `/dashboard` | User |
| My Donations | `/donations/my-donations` | User |
| Notifications | `/notifications` | User |

### Community Hub

| Page | URL | Minimum Role |
|------|-----|-------------|
| Community Home | `/community` | Alumni |
| Announcements | `/community/announcements` | Alumni |
| Polls | `/community/polls` | Alumni |
| Resources | `/community/resources` | Alumni |
| Meetings | `/community/meetings` | Alumni |

### Board Portal

| Page | URL | Minimum Role |
|------|-----|-------------|
| Board Home | `/board` | Board |
| Campaigns | `/board/campaigns` | Board |
| Documents | `/board/documents` | Board |
| Minutes | `/board/minutes` | Board |
| Donations | `/board/donations` | Board |
| Updates | `/board/updates` | Board |
| Media | `/board/media` | Board |
| Team | `/board/team` | Board |

### Admin Panel

| Page | URL |
|------|-----|
| Admin Home | `/admin` |
| Users | `/admin/users` |
| Blog | `/admin/blog` |
| Meetings | `/admin/meetings` |
| Media | `/admin/media` |
| Newsletter | `/admin/newsletter` |
| Team | `/admin/team` |
| Contact Forms | `/admin/contact` |
| Admissions | `/admin/admissions` |
| Donations | `/admin/donations` |
| DUI Classes | `/admin/dui-classes` |
| Analytics | `/admin/analytics` |
| Social Stats | `/admin/social-stats` |
| Community Management | `/admin/community` |
| Board Management | `/admin/board` |
| Settings | `/admin/settings` |
| Social Settings | `/admin/settings/social` |

---

## 40. Troubleshooting

### "Unauthorized" or Redirected to Login
- Your session may have expired (sessions last 7 days). Sign out and sign back in.
- Your role might not have access. Ask an admin to check your role at `/admin/users`.

### "Please verify your email"
- Check your inbox (and spam folder) for the verification email
- Click "Resend verification email" on the login page to get a new link
- The verification link expires after 24 hours

### Can't Sign In with Google
- Make sure you're using a Google account that's been authorized
- Clear your browser cookies and try again
- Try an incognito/private window

### Images Not Uploading
- File must be under 10 MB
- Supported formats: JPG, PNG, WebP, GIF
- Try refreshing the page and uploading again

### Newsletter Not Sending
- Emails are sent one at a time with a slight delay to avoid rate limits
- For 10+ subscribers, it may take 10-15 seconds to complete
- Check the admin panel to confirm the send count updated

### Donation Page Not Working
- Payment processing requires an active internet connection
- If the payment form doesn't load, try clearing your cache
- Contact the admin if the issue persists

### "Failed to Create" or "Failed to Save" Errors
- Check that all required fields are filled in
- Make sure text doesn't exceed character limits
- If setting a date, make sure it's valid and in the future
- Check your internet connection

### Still Need Help?

Contact the site administrator at **lucasbennett@avisionforyourecovery.org** or call **(502) 749-6344**.

---

## 41. Glossary

| Term | Definition |
|------|-----------|
| **Admin** | A user with full access to manage all aspects of the website |
| **Alumni** | A community member who has graduated from or participated in our programs |
| **Board Member** | A member of the organization's board of directors |
| **CTA** | Call to Action — a button or link that prompts visitors to take an action (donate, sign up, etc.) |
| **CSV** | Comma-Separated Values — a spreadsheet file format for exporting data |
| **Dashboard** | A personal overview page showing your activity, RSVPs, and donations |
| **DKIM** | Email authentication that proves emails are really from our domain |
| **EIN** | Employer Identification Number — our nonprofit tax ID (87-1066569) |
| **HIPAA** | Federal law protecting sensitive health information — our assessment data is encrypted accordingly |
| **IOP** | Intensive Outpatient Program — a structured recovery program |
| **Magic Link** | A one-time-use sign-in link sent to your email — no password needed |
| **RSVP** | A confirmation that you plan to attend a meeting or event |
| **SEO** | Search Engine Optimization — making the website appear higher in Google results |
| **Square** | Our payment processing service for donations and DUI class payments |
| **Webhook** | An automatic notification from Square when a payment is processed |

---

*A Vision For You Recovery*
*1675 Story Ave, Louisville, KY 40206*
*(502) 749-6344*
*avisionforyourecovery.org*

*Last updated: March 2026*
