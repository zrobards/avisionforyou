# Dialog Replacement Guide

This document tracks the replacement of native `confirm()` and `alert()` calls with custom themed dialogs.

## Files Already Updated:
- ✅ src/app/(client)/client/hours/page.tsx
- ✅ src/app/settings/page.tsx  
- ✅ src/components/client/MaintenancePlanManager.tsx

## Remaining Files to Update:

### Files with confirm() calls (42 remaining):
- src/components/admin/TasksClient.tsx
- src/app/(client)/client/components/RequestsClient.tsx
- src/components/admin/LeadsTableClient.tsx
- src/components/admin/AdminSubscriptionManager.tsx
- src/components/client/SubscriptionCard.tsx
- src/app/(client)/client/payment-methods/page.tsx
- src/app/(client)/client/components/SettingsTab.tsx
- src/app/admin/project-requests/page.tsx
- src/components/admin/ProjectDetailClient.tsx
- src/app/admin/projects/page.tsx
- src/components/admin/LinksClient.tsx
- src/components/admin/InvoicesClient.tsx
- src/components/admin/calendar/EventDetailModal.tsx
- src/components/admin/kanban/TaskDetailModal.tsx
- src/components/admin/finance/SubscriptionsTable.tsx
- src/components/admin/templates/TemplatesClient.tsx
- src/components/profile/OAuthConnectionCard.tsx
- src/components/admin/ClientModal.tsx
- src/components/admin/AdminToolsClient.tsx
- src/components/admin/pipeline/LeadModal.tsx
- src/app/admin/projects/[id]/components/AdminProjectTasks.tsx
- src/app/(client)/client/components/DashboardClient.tsx
- src/components/ceo/CEOLinksClient.tsx
- src/components/admin/AdminTaskManager.tsx
- src/app/settings/page-old.tsx
- src/components/admin/InvoiceModal.tsx
- src/components/admin/ToolsClient.tsx
- src/components/ceo/LearningHubManagementClient.tsx
- src/components/admin/TaskDetailClient.tsx
- src/components/ceo/PayoutDashboard.tsx
- src/components/ceo/TrainingList.tsx
- src/components/ceo/ToolGrid.tsx
- src/components/ceo/ResourceList.tsx

### Files with alert() calls (154 remaining):
- Many files throughout the codebase

## Replacement Pattern:

1. **Add import:**
```typescript
import { useDialogContext } from '@/lib/dialog';
```

2. **Add hook in component:**
```typescript
const dialog = useDialogContext();
```

3. **Replace confirm():**
```typescript
// Before:
if (!confirm('Message?')) return;

// After:
const confirmed = await dialog.confirm('Message?', {
  title: 'Title',
  variant: 'danger', // or 'default', 'warning'
});
if (!confirmed) return;
```

4. **Replace alert():**
```typescript
// Before:
alert('Message');

// After:
await dialog.alert('Message', {
  title: 'Title', // optional
  variant: 'success', // or 'info', 'warning', 'error'
});
```




