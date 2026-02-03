# Board System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AVFY Board System                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         USER ROLES                               │
├─────────────────────────────────────────────────────────────────┤
│  BOARD (Read-Only)          │  ADMIN (Full CRUD)                │
│  - View dashboard           │  - All board features             │
│  - View updates             │  - Create/edit/delete updates     │
│  - View documents           │  - Upload/delete documents        │
│  - Download files           │  - Manage all content             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      BOARD MEMBER PORTAL                         │
│                        (/board/*)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Dashboard     │  │    Updates      │  │   Documents     │ │
│  │   /board        │  │  /board/updates │  │ /board/documents│ │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤ │
│  │ • Metrics       │  │ • List updates  │  │ • List docs     │ │
│  │ • Priority      │  │ • Filter by cat │  │ • Filter by cat │ │
│  │ • Recent feed   │  │ • Expand/read   │  │ • Search        │ │
│  │ • Quick links   │  │ • Priority flag │  │ • Download      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BOARD API ROUTES                           │
│                    (Read-Only Access)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  GET /api/board/metrics      → Dashboard metrics                │
│  GET /api/board/updates      → List updates (with filters)      │
│  GET /api/board/documents    → List documents (with filters)    │
│                                                                   │
│  Auth: BOARD or ADMIN role required                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN BOARD MANAGEMENT                        │
│                      (/admin/board/*)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │   Manage Updates         │  │   Manage Documents       │    │
│  │  /admin/board/updates    │  │  /admin/board/documents  │    │
│  ├──────────────────────────┤  ├──────────────────────────┤    │
│  │ • Create update          │  │ • Upload document        │    │
│  │ • Edit update            │  │ • Delete document        │    │
│  │ • Delete update          │  │ • View all docs          │    │
│  │ • Set priority           │  │ • Download docs          │    │
│  │ • View all updates       │  │                          │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN API ROUTES                            │
│                     (Full CRUD Access)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Board Updates:                                                  │
│  GET    /api/admin/board/updates       → List all               │
│  POST   /api/admin/board/updates       → Create new             │
│  GET    /api/admin/board/updates/[id]  → Get single             │
│  PUT    /api/admin/board/updates/[id]  → Update                 │
│  DELETE /api/admin/board/updates/[id]  → Delete                 │
│                                                                   │
│  Board Documents:                                                │
│  GET    /api/admin/board/documents     → List all               │
│  POST   /api/admin/board/documents     → Upload new             │
│  DELETE /api/admin/board/documents/[id]→ Delete                 │
│                                                                   │
│  Auth: ADMIN role required                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Database Operations
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                           │
│                    (PostgreSQL + Prisma)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   BoardUpdate    │  │  BoardDocument   │  │    User      │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤  │
│  │ • id             │  │ • id             │  │ • id         │  │
│  │ • title          │  │ • title          │  │ • email      │  │
│  │ • content        │  │ • description    │  │ • role       │  │
│  │ • category       │  │ • fileUrl        │  │ • name       │  │
│  │ • priority       │  │ • fileName       │  │              │  │
│  │ • authorId ────┐ │  │ • fileSize       │  │              │  │
│  │ • createdAt     │ │  │ • category       │  │              │  │
│  │ • updatedAt     │ │  │ • uploadedById ─┼──┼──────────────┤  │
│  └─────────────────┼─┘  │ • uploadedAt     │  │              │  │
│                    │     └──────────────────┘  │              │  │
│                    └─────────────────────────────              │  │
│                                                                   │
│  Enum: BoardDocumentCategory                                    │
│  - EXECUTIVE_DIRECTIVE                                          │
│  - BOARD_UPDATE                                                 │
│  - FINANCIAL_SUMMARY                                            │
│  - GOVERNANCE                                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Middleware (src/middleware.ts)                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ /board/*  → Requires BOARD or ADMIN role               │   │
│  │ /admin/*  → Requires ADMIN role                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Layout Protection (Server-Side)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Board Layout  → getServerSession() + role check         │   │
│  │ Admin Layout  → getServerSession() + role check         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  API Protection                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Board APIs   → BOARD or ADMIN role                      │   │
│  │ Admin APIs   → ADMIN role only                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Board Member Viewing Dashboard

```
┌──────────────┐
│ Board Member │
└──────┬───────┘
       │ 1. Navigate to /board
       ▼
┌──────────────────┐
│   Middleware     │ 2. Check auth & role
└──────┬───────────┘
       │ 3. Allow (BOARD role)
       ▼
┌──────────────────┐
│  Board Layout    │ 4. Server-side auth check
└──────┬───────────┘
       │ 5. Render page
       ▼
┌──────────────────┐
│ Dashboard Page   │ 6. useEffect() calls APIs
└──────┬───────────┘
       │ 7. Parallel API calls
       ├─────────────────────────────┐
       ▼                             ▼
┌──────────────────┐      ┌──────────────────┐
│ GET /api/board/  │      │ GET /api/board/  │
│     metrics      │      │     updates      │
└──────┬───────────┘      └──────┬───────────┘
       │ 8. Auth check           │ 8. Auth check
       ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  Prisma Query    │      │  Prisma Query    │
└──────┬───────────┘      └──────┬───────────┘
       │ 9. Return data          │ 9. Return data
       ▼                         ▼
┌──────────────────────────────────┐
│      Dashboard displays:         │
│  • Metrics cards                 │
│  • Priority updates              │
│  • Recent updates feed           │
└──────────────────────────────────┘
```

### Admin Creating Board Update

```
┌──────────────┐
│    Admin     │
└──────┬───────┘
       │ 1. Navigate to /admin/board/updates
       ▼
┌──────────────────┐
│   Middleware     │ 2. Check auth & role
└──────┬───────────┘
       │ 3. Allow (ADMIN role)
       ▼
┌──────────────────┐
│  Admin Layout    │ 4. Server-side auth check
└──────┬───────────┘
       │ 5. Render page
       ▼
┌──────────────────┐
│ Updates Page     │ 6. Click "Create Update"
└──────┬───────────┘
       │ 7. Fill form & submit
       ▼
┌──────────────────┐
│ POST /api/admin/ │ 8. Send data
│  board/updates   │
└──────┬───────────┘
       │ 9. Validate auth (ADMIN)
       ▼
┌──────────────────┐
│ Validate Data    │ 10. Check required fields
└──────┬───────────┘
       │ 11. All valid
       ▼
┌──────────────────┐
│ Prisma Create    │ 12. Insert into database
└──────┬───────────┘
       │ 13. Return created update
       ▼
┌──────────────────┐
│  Updates Page    │ 14. Refresh list
│  (shows new)     │
└──────────────────┘
```

### Admin Uploading Document

```
┌──────────────┐
│    Admin     │
└──────┬───────┘
       │ 1. Navigate to /admin/board/documents
       ▼
┌──────────────────┐
│  Documents Page  │ 2. Click "Upload Document"
└──────┬───────────┘
       │ 3. Fill form & select file
       ▼
┌──────────────────┐
│ POST /api/admin/ │ 4. Send FormData
│ board/documents  │
└──────┬───────────┘
       │ 5. Validate auth (ADMIN)
       ▼
┌──────────────────┐
│ Process File     │ 6. Convert to base64
└──────┬───────────┘
       │ 7. Create data URL
       ▼
┌──────────────────┐
│ Prisma Create    │ 8. Store in database
└──────┬───────────┘
       │ 9. Return document record
       ▼
┌──────────────────┐
│  Documents Page  │ 10. Refresh list
│  (shows new doc) │
└──────────────────┘
```

## Component Hierarchy

```
Board Member Portal
└── BoardLayout
    ├── BoardSidebar
    │   ├── Navigation Links
    │   └── Back to Main Site
    └── Page Content
        ├── Dashboard (/board)
        │   ├── Metrics Cards
        │   ├── Priority Updates
        │   └── Recent Updates Feed
        ├── Updates (/board/updates)
        │   ├── Category Filter
        │   └── Updates List
        └── Documents (/board/documents)
            ├── Category Tabs
            ├── Search Bar
            └── Documents Table

Admin Board Management
└── AdminLayout
    ├── AdminSidebar
    │   ├── Regular Menu Items
    │   └── Board Management (collapsible)
    │       ├── Board Updates
    │       └── Board Documents
    └── Page Content
        ├── Updates Management
        │   ├── Updates Table
        │   └── Create/Edit Modal
        └── Documents Management
            ├── Documents Table
            └── Upload Modal
```

## File Storage Flow

```
┌──────────────────┐
│  Admin uploads   │
│   document.pdf   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Read file as    │
│  ArrayBuffer     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Convert to      │
│  base64 string   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Create data URL │
│  data:type;base64│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Store in        │
│  PostgreSQL      │
│  (fileUrl field) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Board member    │
│  downloads via   │
│  <a> tag with    │
│  data URL        │
└──────────────────┘
```

## Security Flow

```
┌──────────────────┐
│  User attempts   │
│  to access route │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Middleware     │
│   checks token   │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Valid  │ │Invalid │
│ token  │ │ token  │
└───┬────┘ └───┬────┘
    │          │
    │          └──────► Redirect to /login
    │
    ▼
┌──────────────────┐
│  Check user role │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ BOARD  │ │ Other  │
│ ADMIN  │ │ roles  │
└───┬────┘ └───┬────┘
    │          │
    │          └──────► Redirect to /unauthorized
    │
    ▼
┌──────────────────┐
│  Allow access    │
└──────────────────┘
```

## Category System

```
BoardDocumentCategory (Enum)
├── EXECUTIVE_DIRECTIVE
│   └── High-priority directives from leadership
├── BOARD_UPDATE
│   └── General board communications
├── FINANCIAL_SUMMARY
│   └── Financial reports and budgets
└── GOVERNANCE
    └── Policies, procedures, handbooks
```

## Priority System

```
Updates with priority = true
├── Displayed in yellow highlight box on dashboard
├── Sorted to top of updates list
├── Amber badge indicator
└── Used for urgent communications
```

---

**Legend:**
- `→` Data flow
- `├──` Relationship/hierarchy
- `▼` Process flow
- `┌──┐` Component/system boundary
