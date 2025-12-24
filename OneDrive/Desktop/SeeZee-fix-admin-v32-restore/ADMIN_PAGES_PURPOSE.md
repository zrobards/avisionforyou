# Admin Dashboard Pages - Purpose & Organization

## Financial Pages (No Redundancy - Each Serves Different Purpose)

### 1. `/admin/finance` - Finance Overview
**Purpose**: Comprehensive financial dashboard with high-level metrics
- **Shows**: Revenue trends, monthly metrics, outstanding amounts, MRR
- **Focus**: Big picture financial health
- **Use Case**: Quick financial overview, revenue tracking, trends

### 2. `/admin/invoices` - Invoice Management
**Purpose**: Detailed invoice tracking and management
- **Shows**: All invoices with status, due dates, client info
- **Focus**: Invoice lifecycle (draft → sent → paid)
- **Use Case**: Managing individual invoices, sending reminders, marking as paid
- **Actions**: View, edit, send reminders, mark paid

### 3. `/admin/subscriptions` - Subscription Manager
**Purpose**: Active subscription management and control
- **Shows**: All active subscriptions (maintenance plans + legacy)
- **Focus**: Subscription lifecycle management
- **Use Case**: Pause, resume, cancel subscriptions, view billing dates
- **Actions**: Pause, Resume, Cancel, View Stripe dashboard
- **Unique**: Only page with subscription control actions

### 4. `/admin/purchases` - Purchase History
**Purpose**: Historical purchase tracking (hour packs + subscription payments)
- **Shows**: Hour pack purchases, subscription payment history
- **Focus**: What clients have purchased (past transactions)
- **Use Case**: View purchase history, track hour pack usage, see payment records
- **Unique**: Shows hour packs and payment history (different from subscriptions)

### 5. `/admin/maintenance` - Maintenance Operations
**Purpose**: Maintenance schedules and change requests
- **Shows**: Maintenance schedules, change requests, client maintenance needs
- **Focus**: Operational maintenance work, not billing
- **Use Case**: Schedule maintenance, manage change requests, track maintenance tasks
- **Unique**: Focuses on work/schedules, not billing

## Summary

**No Redundancy** - Each page serves a distinct purpose:
- **Finance**: High-level metrics and trends
- **Invoices**: Invoice management and tracking
- **Subscriptions**: Active subscription control
- **Purchases**: Historical purchase records
- **Maintenance**: Operational maintenance work

All pages work together to provide complete financial and operational visibility.


