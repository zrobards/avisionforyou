# AVFY Screenshots Setup

## 📸 Required Screenshots

To complete the AVFY project showcase, add these 4 screenshots to the `public/` folder:

### Files to Add:

1. **`avfy-home.png`**
   - Source: Homepage screenshot (purple/lime gradient hero)
   - Shows: Mission statement, CTAs, main navigation
   - Used on: Projects page (main image), Homepage (featured section)

2. **`avfy-programs.png`**
   - Source: Programs page screenshot
   - Shows: 4 program cards (Surrender, MindBodySoul, Moving Mountains, Women's)
   - Used on: Projects page (gallery), Homepage (gallery)

3. **`avfy-donate.png`**
   - Source: Donation page screenshot (**THE MONEY SHOT**)
   - Shows: Stripe integration, impact tiers, real-time calculator
   - Used on: Projects page (gallery), Services page (featured), Homepage (gallery)

4. **`avfy-contact.png`**
   - Source: Contact page screenshot
   - Shows: Multi-channel contact form, department dropdown, office info
   - Used on: Projects page (gallery), Homepage (gallery)

---

## 🚀 Quick Setup

1. Save all 4 screenshots from the browser to your Desktop
2. Rename them to match the filenames above
3. Copy them to: `c:\Users\seanp\OneDrive\Desktop\SeeZee-fix-admin-v32-restore\public\`
4. Run `npm run dev` to verify they display correctly

---

## 📍 Where They're Used:

### Projects Page (`/projects`)
- Main hero image: `avfy-home.png` (large)
- Gallery: `avfy-programs.png`, `avfy-donate.png`, `avfy-contact.png` (small grid)

### Homepage (`/`)
- Featured section: `avfy-home.png` (large)
- Mini gallery: all 3 secondary images

### Services Page (`/services`)
- Donation showcase section: `avfy-donate.png` (large, featured)

---

## ⚠️ Important Notes:

- Images should be **PNG format** for best quality
- Recommended resolution: **1920x1080** or higher
- If images are missing, pages will show broken image icons
- All code is already implemented and ready - just add the images!

---

## 🎯 Deploy Checklist:

- [ ] Add all 4 images to `/public/`
- [ ] Verify images display on `/projects`
- [ ] Verify images display on homepage `/`
- [ ] Verify donation image on `/services`
- [ ] Test on mobile (images should be responsive)
- [ ] Deploy to Vercel

**Once images are added, the site is 100% deploy-ready!** 🚀


