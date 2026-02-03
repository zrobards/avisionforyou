# Board System - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Restart Dev Server
```bash
npm run dev
```

### 2. Create Board Member
```sql
UPDATE users SET role = 'BOARD' WHERE email = 'test@example.com';
```

### 3. Test Access
- Board: `http://localhost:3000/board`
- Admin: `http://localhost:3000/admin/board`

---

## 📁 File Structure

```
src/
├── app/
│   ├── board/                    # Board Member Portal
│   │   ├── layout.tsx           # Board layout with auth
│   │   ├── page.tsx             # Dashboard
│   │   ├── updates/page.tsx     # Updates feed
│   │   └── documents/page.tsx   # Document repository
│   ├── admin/board/             # Admin Management
│   │   ├── page.tsx             # Redirect to updates
│   │   ├── updates/page.tsx     # Manage updates
│   │   └── documents/page.tsx   # Manage documents
│   └── api/
│       ├── board/               # Board APIs (read-only)
│       │   ├── metrics/route.ts
│       │   ├── updates/route.ts
│       │   └── documents/route.ts
│       └── admin/board/         # Admin APIs (CRUD)
│           ├── updates/route.ts
│           ├── updates/[id]/route.ts
│           ├── documents/route.ts
│           └── documents/[id]/route.ts
└── components/
    └── board/
        └── BoardSidebar.tsx     # Board navigation
```

---

## 🎯 Routes

### Board Member (READ-ONLY)
| Route | Description |
|-------|-------------|
| `/board` | Dashboard with metrics |
| `/board/updates` | View all updates |
| `/board/documents` | View all documents |

### Admin (FULL CRUD)
| Route | Description |
|-------|-------------|
| `/admin/board` | Redirects to updates |
| `/admin/board/updates` | Manage updates |
| `/admin/board/documents` | Manage documents |

---

## 🔑 Roles

| Role | Board Access | Admin Access |
|------|--------------|--------------|
| USER | ❌ | ❌ |
| BOARD | ✅ Read-only | ❌ |
| ADMIN | ✅ Full access | ✅ Full access |

---

## 📊 Database Models

### BoardUpdate
```prisma
- id: String
- title: String
- content: Text
- category: BoardDocumentCategory
- priority: Boolean
- authorId: String
- createdAt: DateTime
- updatedAt: DateTime
```

### BoardDocument
```prisma
- id: String
- title: String
- description: String?
- fileUrl: String (base64)
- fileName: String
- fileSize: Int?
- category: BoardDocumentCategory
- uploadedById: String
- uploadedAt: DateTime
```

### BoardDocumentCategory (Enum)
- EXECUTIVE_DIRECTIVE
- BOARD_UPDATE
- FINANCIAL_SUMMARY
- GOVERNANCE

---

## 🎨 Color Scheme

| Element | Color |
|---------|-------|
| Board Portal | Indigo (indigo-600 to indigo-800) |
| Admin Board | Purple (purple-600 to purple-700) |
| Priority Badge | Amber (amber-500, amber-100) |
| Category Badge | Indigo (indigo-100, indigo-700) |

---

## 🔒 Security

### Middleware Protection
```typescript
// src/middleware.ts
if (pathname.startsWith("/board")) {
  // Requires BOARD or ADMIN role
}
```

### API Protection
```typescript
// All board APIs
if (role !== "BOARD" && role !== "ADMIN") {
  return 401 Unauthorized
}

// All admin board APIs
if (role !== "ADMIN") {
  return 401 Unauthorized
}
```

---

## 📝 Common Tasks

### Create Board Update (Admin)
1. Go to `/admin/board/updates`
2. Click "Create Update"
3. Fill form (title, content, category, priority)
4. Click "Create"

### Upload Document (Admin)
1. Go to `/admin/board/documents`
2. Click "Upload Document"
3. Fill form (title, description, category, file)
4. Click "Upload"

### View Updates (Board Member)
1. Go to `/board/updates`
2. Use category filter if needed
3. Click "Read more" to expand

### Download Document (Board Member)
1. Go to `/board/documents`
2. Use search or filter
3. Click "Download" button

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Prisma Client not found | Restart dev server |
| Unauthorized access | Check user role in database |
| File upload fails | Check file type and size |
| Sidebar not showing | Clear cache, restart server |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `BOARD-SYSTEM-COMPLETE.md` | Complete summary |
| `BOARD-SYSTEM-IMPLEMENTATION.md` | Technical details |
| `BOARD-SYSTEM-TESTING-GUIDE.md` | Testing instructions |
| `BOARD-SYSTEM-SEED-DATA.md` | Sample data scripts |
| `BOARD-SYSTEM-QUICK-REFERENCE.md` | This file |

---

## ✅ Checklist

### Initial Setup
- [ ] Restart dev server
- [ ] Create board member account
- [ ] Test board access
- [ ] Test admin access

### Testing
- [ ] Board member can view dashboard
- [ ] Board member can view updates
- [ ] Board member can view documents
- [ ] Board member can download files
- [ ] Board member CANNOT edit/delete
- [ ] Admin can create updates
- [ ] Admin can upload documents
- [ ] Admin can edit/delete content

### Production
- [ ] Remove test accounts
- [ ] Create real board members
- [ ] Upload real documents
- [ ] Test all features
- [ ] Monitor performance

---

## 🎯 Key Features

✅ Dashboard with real-time metrics
✅ Updates feed with priority flagging
✅ Document repository with search
✅ Category filtering
✅ Download capability
✅ Read-only for board members
✅ Full CRUD for admins
✅ Responsive design
✅ Security implemented

---

## 📞 Support

**Issues?** Check:
1. `BOARD-SYSTEM-TESTING-GUIDE.md` for detailed testing
2. `BOARD-SYSTEM-IMPLEMENTATION.md` for technical details
3. Browser console for errors
4. Database for user roles

---

**Status:** ✅ COMPLETE
**Version:** 1.0
**Date:** January 19, 2026
