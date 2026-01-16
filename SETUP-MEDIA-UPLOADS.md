# 📸 Setup Media Uploads - Quick Guide

## The Problem:

You can't upload media (videos, images) anywhere because the `BLOB_READ_WRITE_TOKEN` environment variable is missing.

---

## The Solution (2 Options):

### Option A: Quick Fix for Development (No Videos)

**For now, just skip video uploads:**

1. Social Posts page → Plan posts without videos (just text + description)
2. When you need videos, set up Vercel Blob (Option B below)

**This works fine for:**
- Planning social media posts
- Organizing content ideas
- Tracking what platforms to post to

---

### Option B: Full Setup with Vercel Blob

**When you're ready to upload videos/images:**

#### Step 1: Create Vercel Blob Store

1. Go to: https://vercel.com/dashboard
2. Click on **Storage** in the left menu
3. Click **Create Database** → Select **Blob**
4. Name it: `avfy-media-storage`
5. Click **Create**

#### Step 2: Get Your Token

1. In the Blob store page, you'll see the connection details
2. Copy the **BLOB_READ_WRITE_TOKEN**
   - It looks like: `vercel_blob_rw_...`

#### Step 3: Add to Environment

```bash
cd /Users/zacharyrobards/Downloads/avfy-main

# Add to .env file
echo 'BLOB_READ_WRITE_TOKEN="vercel_blob_rw_YOUR_TOKEN_HERE"' >> .env

# Also add to .env.local (for Next.js)
echo 'BLOB_READ_WRITE_TOKEN="vercel_blob_rw_YOUR_TOKEN_HERE"' >> .env.local
```

#### Step 4: Restart Dev Server

```bash
# Press Ctrl+C to stop
npm run dev
```

#### Step 5: Test Upload

1. Go to: http://localhost:3002/admin/media
2. Click "Upload Media"
3. Select an image or video
4. ✅ Should upload successfully!

---

## What You Can Upload With Blob:

Once set up, you can upload:

### Social Posts Page
- ✅ Videos for social media planning
- ✅ Keeps videos organized with descriptions
- ✅ Track which platforms each video is for

### Media Library Page
- ✅ Upload images
- ✅ Upload videos
- ✅ Organize with tags
- ✅ Track usage (website, social, marketing, etc.)

### Blog Posts
- ✅ Upload featured images
- ✅ Upload inline images
- ✅ Upload videos for blog content

### Team Member Photos
- ✅ Upload team member profile photos
- ✅ Manage all staff photos in one place

---

## Pricing:

**Vercel Blob Storage:**
- **Free Tier**: 10 GB storage, 100 GB bandwidth/month
- **Perfect for:** Getting started, small to medium sites
- **Paid Plans**: Start at $20/month for more storage

**For your use case (recovery center):**
- Free tier is probably fine to start
- Can always upgrade later if needed

---

## Alternative: Use Local Storage (Development Only)

If you don't want to set up Vercel Blob yet, you can temporarily:

1. Store videos locally in `public/uploads/` folder
2. Reference them with `/uploads/filename.mp4`
3. **Note**: This WON'T work in production on Vercel
4. Only for local development/testing

---

## Testing Without Token:

Without the Blob token, these features won't work:
- ❌ Social media video uploads
- ❌ Media library uploads
- ❌ Blog image uploads

But these features WILL work fine:
- ✅ Social posts planning (text only)
- ✅ User management
- ✅ Contact form
- ✅ Team page (if photos already in `public/team/`)
- ✅ All admin features except uploads

---

## Quick Decision Guide:

**Just testing/developing?**
→ Skip Blob setup for now, use Option A

**Ready to use media features?**
→ Set up Blob storage, takes 5 minutes (Option B)

**Deploying to production soon?**
→ Definitely set up Blob storage now (Option B)

---

## ✅ After Setup:

Once you add `BLOB_READ_WRITE_TOKEN` and restart:

1. Go to Social Posts page
2. Upload a video
3. Add description and select platforms
4. Save draft
5. ✅ Video is stored in Vercel Blob
6. ✅ You can download it later to post to platforms

---

**For now, Option A (skip videos) works fine. Set up Blob when you're ready!** 🚀
