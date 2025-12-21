# 🚀 5-Minute AVFY Screenshot Setup

**Current Status:** Code is ready. Just add 4 images and deploy.

---

## ⚡ Quick Steps

### 1. **Open AVFY Site in Browser**
Navigate to: `localhost:3001` (or wherever AVFY is running)

### 2. **Take 4 Screenshots**

#### Screenshot 1: Homepage (`avfy-home.png`)
- Go to: `localhost:3001`
- Capture: Full page with purple/lime hero
- **This is your money shot** - shows the full design

#### Screenshot 2: Programs (`avfy-programs.png`)
- Go to: `localhost:3001/programs`
- Capture: Page showing all 4 program cards
- Shows: Surrender, MindBodySoul, Moving Mountains, Women's programs

#### Screenshot 3: Donation Page (`avfy-donate.png`)
- Go to: `localhost:3001/donate`
- Capture: Page showing Stripe integration
- **CRITICAL** - This proves you can build payment systems
- Shows: $25/$50/$100/$250/$500 tiers with impact descriptions

#### Screenshot 4: Contact (`avfy-contact.png`)
- Go to: `localhost:3001/contact`
- Capture: Contact form with all info
- Shows: Multi-channel contact, department dropdown, phone/email/address

---

### 3. **Rename & Move Files**

```powershell
# Save screenshots to Desktop, then:
cd ~\Desktop
Rename-Item "screenshot1.png" "avfy-home.png"
Rename-Item "screenshot2.png" "avfy-programs.png"
Rename-Item "screenshot3.png" "avfy-donate.png"
Rename-Item "screenshot4.png" "avfy-contact.png"

# Move to public folder:
Move-Item avfy-*.png "~\OneDrive\Desktop\SeeZee-fix-admin-v32-restore\public\"
```

---

### 4. **Test Locally**

```bash
cd ~/OneDrive/Desktop/SeeZee-fix-admin-v32-restore
npm run dev
```

**Check these pages:**
- http://localhost:3000 (homepage - should show AVFY section)
- http://localhost:3000/projects (should show AVFY with gallery)
- http://localhost:3000/services (should show donation screenshot)

---

### 5. **Deploy**

```bash
npm run deploy
# or
vercel --prod
# or
git add .
git commit -m "Add AVFY project screenshots and content"
git push origin main
```

---

## 🎯 What This Adds to Your Portfolio

### **Before:**
- 1 project (Big Red Bus)
- No payment system proof
- Generic nonprofit claims

### **After:**
- 2 projects (Big Red Bus + AVFY)
- Stripe integration proven
- Real client (501c3 serving 500+ users)
- Professional screenshots
- Specific capabilities demonstrated

---

## 📍 Where Screenshots Appear

| Screenshot | Homepage | Projects Page | Services Page |
|-----------|----------|--------------|---------------|
| `avfy-home.png` | ✅ Large | ✅ Large | ❌ |
| `avfy-programs.png` | ✅ Small | ✅ Small | ❌ |
| `avfy-donate.png` | ✅ Small | ✅ Small | ✅ **Featured** |
| `avfy-contact.png` | ✅ Small | ✅ Small | ❌ |

**Total usage:** 9 locations across 3 pages

---

## ⚠️ Common Issues

### **"Images not showing"**
- Check filenames exactly match: `avfy-home.png` (lowercase, no spaces)
- Confirm files are in `public/` folder (not `public/logos/`)
- Clear browser cache and refresh

### **"Images too large"**
- Recommended size: 1920x1080 or 1440x900
- Max file size: <500KB each
- Use PNG format for best quality

### **"Layout looks broken"**
- Images should be landscape orientation (wider than tall)
- If portrait images, take new screenshots in landscape

---

## 🔥 Pro Tips

### **For Best Screenshots:**
1. Use Chrome in full-screen mode (F11)
2. Zoom to 100% (Ctrl+0)
3. Hide browser toolbars
4. Use Windows Snipping Tool or ShareX
5. Capture full page, not just viewport

### **Optional Enhancements:**
- Add subtle drop shadow in Photoshop/Figma
- Crop to remove unnecessary whitespace
- Ensure text is readable at thumbnail size

---

## ✅ Deploy Checklist

- [ ] AVFY site is running locally
- [ ] Screenshot homepage → save as `avfy-home.png`
- [ ] Screenshot programs → save as `avfy-programs.png`  
- [ ] Screenshot donations → save as `avfy-donate.png`
- [ ] Screenshot contact → save as `avfy-contact.png`
- [ ] Move all 4 files to `public/` folder
- [ ] Test on localhost:3000
- [ ] Verify homepage shows AVFY section
- [ ] Verify projects page shows gallery
- [ ] Verify services page shows donation screenshot
- [ ] Deploy to Vercel
- [ ] Test on production URL

---

**Time Required:** 5 minutes

**Difficulty:** Copy/paste 4 files

**Impact:** Transforms portfolio from student project to professional agency

---

**That's it!** Once the 4 screenshots are in place, you're 100% deploy-ready. 🚀


