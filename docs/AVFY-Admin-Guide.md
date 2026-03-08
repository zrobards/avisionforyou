# AVFY Website Admin Guide

A comprehensive guide for employees, board members, and administrators of the A Vision For You Recovery website.

---

## Table of Contents

1. [Logging Into the Site](#1-logging-into-the-site)
2. [Admin Dashboard Overview](#2-admin-dashboard-overview)
3. [Creating Blog Posts](#3-creating-blog-posts)
4. [Adding Events & Meetings](#4-adding-events--meetings)
5. [Updating Success Stories](#5-updating-success-stories)
6. [Managing the Community Hub](#6-managing-the-community-hub)
7. [Using Board Voting & Polls](#7-using-board-voting--polls)
8. [Updating Donation Campaigns](#8-updating-donation-campaigns)
9. [Uploading Media](#9-uploading-media)
10. [Editing Page Content](#10-editing-page-content)

---

## 1. Logging Into the Site

### How to Access the Login Page

Navigate to **[avisionforyou.org/login](https://avisionforyou.org/login)** in your browser.

### Authentication Methods

| Method | How It Works |
|--------|-------------|
| **Google Sign-In** | Click "Sign in with Google" and use your authorized Google account. This is the recommended method for board members and staff. |
| **Email & Password** | Enter the email and password provided by your administrator. |
| **Email Magic Link** | Enter your email to receive a one-time sign-in link (if enabled). |

### User Roles

Your role determines what you can access:

| Role | Access Level |
|------|-------------|
| **Admin** | Full access to everything: admin panel, board portal, community hub, all settings |
| **Board** | Board portal, community hub, dashboard |
| **Alumni** | Community hub, dashboard |
| **User** | Dashboard, public pages |

### After Logging In

You will be redirected to your **Dashboard** at `/dashboard`. From there, you'll see:
- A welcome message with your role
- Quick links to sections you have access to
- Upcoming sessions you've RSVP'd to
- Recent donation history (if applicable)

---

## 2. Admin Dashboard Overview

**URL:** `/admin`
**Required Role:** Admin

The Admin Dashboard is the central hub for managing the entire website. It displays quick-access cards for every admin function.

### Admin Navigation Sidebar

The left sidebar provides links to all admin sections:

| Section | Path | Description |
|---------|------|-------------|
| **Users** | `/admin/users` | Manage user accounts and roles |
| **Blog** | `/admin/blog` | Create and manage blog posts |
| **Meetings** | `/admin/meetings` | Schedule sessions and events |
| **Media** | `/admin/media` | Upload and organize photos/videos |
| **Newsletter** | `/admin/newsletter` | Create and send email newsletters |
| **Team** | `/admin/team` | Manage staff/team member profiles |
| **Contact Forms** | `/admin/contact` | View submitted contact form inquiries |
| **Donations** | `/admin/donations` | Track and export donation records |
| **DUI Classes** | `/admin/dui-classes` | Manage DUI education class schedules |
| **Admissions** | `/admin/admissions` | Track program applications |
| **Analytics** | `/admin/analytics` | View website traffic and conversion data |
| **Social Stats** | `/admin/social-stats` | Monitor social media metrics |
| **Community** | `/admin/community` | Manage announcements, polls, and resources |
| **Board** | `/admin/board` | Manage board updates and documents |
| **Settings** | `/admin/settings` | Configure site-wide settings |

### User Management

At `/admin/users`, you can:

1. **Search** users by name or email
2. **Filter** by role (Admin, Board, Alumni, User)
3. **Change roles** using the dropdown next to each user
4. **Delete** users (with confirmation prompt)
5. **View activity** metrics per user (RSVP count, donation count)

---

## 3. Creating Blog Posts

**URL:** `/admin/blog`
**Required Role:** Admin

### Creating a New Post

1. Navigate to **Admin > Blog**
2. Click the **"Create New Post"** button
3. Fill in the following fields:

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | Yes | The headline of your blog post |
| **Content** | Yes | The full article body (supports rich text/markdown) |
| **Excerpt** | No | A short summary shown in blog listings |
| **Category** | Yes | Choose from: Recovery, Community, Education, Stories, Ethics |
| **Tags** | No | Comma-separated keywords for filtering |
| **Featured Image** | No | Upload or select from media library |
| **Status** | Yes | **Draft** (not visible publicly) or **Published** (live on site) |

4. Click **"Save"** to save as draft, or **"Publish"** to make it live immediately

### Editing an Existing Post

1. Go to **Admin > Blog**
2. Click on the post you want to edit
3. Make your changes
4. Click **Save** or **Update**

### Deleting a Post

1. Find the post in the blog list
2. Click the **delete icon** (trash can)
3. Confirm the deletion in the popup dialog

> **Tip:** Posts have automatic view count tracking and read time estimation. Published posts are immediately visible at `/blog/[post-id]`.

---

## 4. Adding Events & Meetings

**URL:** `/admin/meetings`
**Required Role:** Admin

### Scheduling a New Meeting/Event

1. Navigate to **Admin > Meetings**
2. Click **"Schedule Meeting"** or **"Add New"**
3. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | Yes | Name of the meeting/event (max 200 characters) |
| **Description** | Yes | Details about the event (max 1,000 characters) |
| **Program** | No | Associate with a specific program (e.g., IOP, Surrender) |
| **Start Time** | Yes | Date and time the event begins |
| **End Time** | Yes | Date and time the event ends (must be after start time) |
| **Format** | Yes | **In-Person** or **Online** |
| **Location** | If In-Person | Physical address of the event |
| **Meeting Link** | If Online | URL for virtual meeting (Zoom, Google Meet, etc.) |
| **Capacity** | No | Maximum number of attendees (1-1,000) |

4. Click **"Create"** to publish the event

### Managing Events

- **Edit:** Click on any event to update its details
- **Delete:** Use the delete button with confirmation
- **Track RSVPs:** View who has registered for each session
- **Attendance:** Monitor actual attendance vs. RSVPs

> **Note:** Community members can RSVP to events from `/community/meetings`. They can view and manage their RSVPs at `/community/my-rsvps`.

---

## 5. Updating Success Stories

**URL:** `/admin/blog` (use the "Stories" category)
**Required Role:** Admin

Success stories are managed through the blog system using the **"Stories"** category.

### Adding a Success Story

1. Go to **Admin > Blog**
2. Click **"Create New Post"**
3. Set the **Category** to **"Stories"**
4. Write the success story with an inspiring title
5. Add a featured image if available
6. Set tags like "recovery", "milestone", "graduation"
7. **Publish** when ready

### Best Practices for Success Stories

- Always get written consent from the individual before publishing
- Use first names only (or aliases) to protect privacy
- Focus on the journey and positive outcomes
- Include a photo only with explicit permission
- Tag stories appropriately for easy filtering

---

## 6. Managing the Community Hub

**URL:** `/admin/community`
**Required Role:** Admin

The Community Hub is the private space for alumni and community members. As an admin, you manage three key areas:

### 6a. Community Announcements

**URL:** `/admin/community/announcements`

1. Click **"Create Announcement"**
2. Fill in:
   - **Title** (required, max 500 characters)
   - **Content** (required, max 50,000 characters)
   - **Published** toggle (draft vs. visible to community)
3. Click **"Save"**

Announcements appear on the community hub at `/community/announcements` for all alumni, board members, and admins.

- **Edit** any announcement by clicking on it
- **Unpublish** to temporarily hide it
- **Delete** to remove permanently

### 6b. Community Resources

**URL:** `/admin/community/resources`

Add helpful resources for community members:
1. Click **"Add Resource"**
2. Enter a title, description, and link
3. Categorize appropriately
4. Save

Resources appear at `/community/resources`.

### 6c. Community Polls

See [Section 7: Board Voting & Polls](#7-using-board-voting--polls) for full details.

---

## 7. Using Board Voting & Polls

### For Admins (Creating Polls)

**URL:** `/admin/community/polls`
**Required Role:** Admin

#### Creating a Poll

1. Navigate to **Admin > Community > Polls**
2. Click **"Create Poll"**
3. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| **Poll Question** | Yes | The question to vote on (max 200 characters) |
| **Description** | No | Additional context for voters (max 2,000 characters) |
| **Closes At** | No | Optional deadline for voting. Leave empty for no expiration. |

4. Click **"Create Poll"**

The poll will immediately be visible to alumni and board members in the community hub.

#### Managing Polls

- **Toggle Active/Closed:** Click the active/closed toggle button to open or close voting
- **View Results:** See the yes/no vote bar chart, total votes, and percentages
- **Delete:** Click the trash icon to permanently delete a poll and all its votes

#### Poll Results Display

Each poll shows:
- A green/red progress bar showing yes vs. no percentages
- Total vote count
- Individual yes and no counts
- Creation date and closing date (if set)

### For Board Members & Alumni (Voting)

**URL:** `/community/polls`
**Required Role:** Alumni, Board, or Admin

1. Go to **Community Hub > Polls**
2. You'll see all active polls
3. Click **"Yes"** or **"No"** to cast your vote
4. Your vote is recorded instantly
5. After voting, you'll see the current results

> **Important:** You can only vote once per poll. Votes cannot be changed after submission.

---

## 8. Updating Donation Campaigns

### Viewing Donation Reports

**URL:** `/admin/donations`
**Required Role:** Admin

The donations dashboard shows:

| Metric | Description |
|--------|-------------|
| **Total Raised** | All-time donation total |
| **Average Donation** | Mean donation amount |
| **Monthly Recurring** | Total from monthly recurring donors |
| **Success Rate** | Percentage of completed vs. attempted donations |
| **One-Time Count** | Number of one-time donations |
| **Recurring Count** | Number of monthly/yearly subscriptions |
| **Pending** | Donations awaiting processing |
| **Failed** | Donations that didn't complete |

### Filtering Donations

- **Search** by donor name or email
- **Filter by Status:** All, Completed, Pending, Failed
- **Filter by Type:** All, One-Time, Monthly, Yearly

### Exporting Data

Click the **"Export CSV"** button to download a spreadsheet with:
- Date, Donor Name, Email, Amount, Status, Type, Comment

### Campaign Hub (Board Members)

**URL:** `/board/campaigns`
**Required Role:** Board or Admin

Board members can view and manage fundraising campaigns, including:
- Campaign progress tracking
- Goal vs. actual raised
- Share campaigns on social media (Facebook, LinkedIn, Email)
- Copy campaign links

---

## 9. Uploading Media

**URL:** `/admin/media`
**Required Role:** Admin

The Media Library is your central hub for all images, videos, and files.

### Uploading Files

1. Navigate to **Admin > Media**
2. Click **"Upload"**
3. Drag and drop files or click to browse
4. For each file, set:
   - **Tags** (select from: event, recovery, donor, program, facility, community, celebration)
   - **Usage** (select where this media will be used):
     - Website
     - Facebook
     - Instagram
     - Twitter
     - Grants
     - Newsletter
     - Marketing

5. Click **"Upload"** to save

### Supported File Types

- **Images:** JPG, PNG, WebP, GIF
- **Videos:** MP4
- **Max file size:** 10 MB per file

### Managing Media

- **Search** by filename or tags
- **Filter** by tag category using the tab bar
- **Preview** by hovering over thumbnails
- **Download** individual files
- **Delete** files you no longer need

### Using Media in Blog Posts

When creating or editing a blog post, use the **"Featured Image"** field to select from your media library or upload a new image directly.

---

## 10. Editing Page Content

### Team Members

**URL:** `/admin/team`
**Required Role:** Admin

Manage the staff directory that appears on the website:

1. Go to **Admin > Team**
2. Click **"Add Team Member"** or edit an existing entry
3. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Name** | Yes | Full name |
| **Title** | Yes | Job title / role |
| **Bio** | No | Short biography (max 5,000 characters) |
| **Email** | No | Contact email |
| **Phone** | No | Contact phone number |
| **Photo** | No | Profile picture (upload or URL) |

4. Click **"Save"**

### Newsletter Management

**URL:** `/admin/newsletter`
**Required Role:** Admin

1. Click **"Create Newsletter"**
2. Fill in:
   - **Title** - Email subject line
   - **Excerpt** - Preview text shown in email clients
   - **Content** - Full newsletter body
   - **Featured Image** - Optional header image
3. Save as **Draft** to review, or set to **Published**
4. Click **"Send"** to distribute to all subscribers

> **Warning:** Sending a newsletter cannot be undone. Double-check content before clicking Send.

### DUI Classes

**URL:** `/admin/dui-classes`
**Required Role:** Admin

1. Click **"Add Class"**
2. Fill in class details:

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | Yes | Class name |
| **Description** | No | Class details |
| **Date** | Yes | Date of the class |
| **Start/End Time** | Yes | Session hours |
| **Location** | Yes | Where the class is held |
| **Price** | Yes | Cost in dollars |
| **Capacity** | Yes | Max students |
| **Instructor** | No | Instructor name |
| **Active** | Yes | Whether registration is open |

3. Click **"Save"**

Students can register and pay at `/programs/dui-classes`.

### Board Updates & Documents

**URL:** `/admin/board/updates` and `/admin/board/documents`
**Required Role:** Admin

**Board Updates:**
1. Click **"Create Update"**
2. Enter title, content, and category
3. Toggle **"High Priority"** for urgent items (these appear in an alert banner on the board dashboard)
4. Save

**Board Documents:**
1. Click **"Upload Document"**
2. Select the file and set a category
3. Save - board members can now access and download it from `/board/documents`

### Social Media Settings

**URL:** `/admin/settings/social`
**Required Role:** Admin

Configure social media links and integrations that appear across the site:
- Facebook page URL
- Instagram handle
- LinkedIn page
- TikTok account

---

## Quick Reference: Key URLs

| Page | URL | Who Can Access |
|------|-----|---------------|
| Login | `/login` | Everyone |
| Dashboard | `/dashboard` | All logged-in users |
| Admin Panel | `/admin` | Admin only |
| Board Portal | `/board` | Board + Admin |
| Community Hub | `/community` | Alumni + Board + Admin |
| Blog | `/blog` | Public |
| Programs | `/programs` | Public |
| Donate | `/donate` | Public |
| Contact | `/contact` | Public |

---

## Troubleshooting

### "Unauthorized" or Redirect to Login

- Your session may have expired. Log out and log back in.
- Your role may not have access to that page. Contact an admin to update your role.

### "Failed to Create" Errors

- Check that all required fields are filled in.
- Ensure text fields don't exceed their character limits.
- If setting a closing date on a poll, make sure it's a future date.
- Check your internet connection and try again.

### Images Not Uploading

- Verify the file is under 10 MB.
- Ensure it's a supported format (JPG, PNG, WebP, GIF, MP4).
- Try refreshing the page and uploading again.

### Contact Support

If you encounter issues not covered in this guide, contact the site administrator at the email listed in your organization's directory.

---

*Last updated: March 2026*
*A Vision For You Recovery - avisionforyou.org*
