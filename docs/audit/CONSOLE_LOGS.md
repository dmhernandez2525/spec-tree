# Spec Tree - Console.log Statements to Remove

**Generated:** January 16, 2026
**Total:** 106 occurrences across 44 files

## By File (with occurrence count)

| File | Count |
|------|-------|
| `api/fetchData.ts` | 9 |
| `components/spec-tree/components/app-selector/app-selector.tsx` | 5 |
| `components/dashboard/organization/InviteUsers.tsx` | 5 |
| `components/spec-tree/components/epic/epic.tsx` | 4 |
| `components/dashboard/organization/MemberManagement.tsx` | 4 |
| `lib/store/user-slice.ts` | 4 |
| `components/dashboard/organization/settings/AISettings.tsx` | 3 |
| `lib/store/sow-slice.ts` | 9 |
| `components/spec-tree/components/builder/builder.tsx` | 2 |
| `components/spec-tree/components/chat/chat.tsx` | 2 |
| `components/spec-tree/components/contextual-questions/workitems-contextual-info-component.tsx` | 2 |
| `components/spec-tree/components/feature/feature.tsx` | 2 |
| `components/spec-tree/components/user-story/user-story.tsx` | 2 |
| `components/spec-tree/index.tsx` | 2 |
| `components/spec-tree/lib/api/openai-proxy-helper.ts` | 2 |
| `components/spec-tree/lib/hooks/useAppSearch.ts` | 2 |
| `components/dashboard/DashboardNotifications.tsx` | 2 |
| `components/dashboard/organization/PermissionsDrawer.tsx` | 2 |
| `components/dashboard/organization/settings/IntegrationsSettings.tsx` | 2 |
| `components/dashboard/organization/settings/SSOSettings.tsx` | 2 |
| `components/dashboard/settings/AccountSettings.tsx` | 2 |
| `components/dashboard/settings/NotificationSettings.tsx` | 2 |
| `components/dashboard/settings/PrivacySettings.tsx` | 2 |
| `components/dashboard/settings/ThemeConfigurator/ThemeConfigurator.tsx` | 2 |
| `components/dashboard/support/SupportTickets.tsx` | 2 |
| `components/dashboard/tutorial/TutorialControls.tsx` | 2 |
| `components/dashboard/tutorial/TutorialOverlay.tsx` | 2 |
| `components/marketing/demo/DemoForm.tsx` | 2 |
| `components/marketing/demo/InteractiveDemo.tsx` | 2 |
| `components/marketing/resources/ResourceDetail.tsx` | 2 |
| `components/marketing/resources/TutorialResources.tsx` | 2 |
| `components/marketing/resources/TutorialTranscript.tsx` | 2 |
| `lib/hooks/use-resources.ts` | 2 |
| `lib/store/subscription-slice.ts` | 2 |
| `app/(marketing)/careers/apply/page.tsx` | 1 |
| `app/(marketing)/resources/[type]/[slug]/page.tsx` | 1 |
| `components/spec-tree/components/app-selector/AppCard.tsx` | 2 |
| `components/spec-tree/components/sow-input/sow-input.tsx` | 1 |
| `components/spec-tree/lib/utils/calculate-total-points.ts` | 1 |
| `components/spec-tree/lib/utils/calculation-utils.ts` | 1 |
| `components/dashboard/header/Search.tsx` | 1 |
| `components/dashboard/organization/OrganizationManagement.tsx` | 1 |
| `components/dashboard/theme/index.tsx` | 1 |
| `components/ui/chart.tsx` | 1 |

## Priority Files (most console.logs)

### 1. `api/fetchData.ts` - 9 occurrences
Primarily error logging - consider replacing with proper logger.

### 2. `lib/store/sow-slice.ts` - 9 occurrences
Redux slice debugging - should be removed for production.

### 3. `components/spec-tree/components/app-selector/app-selector.tsx` - 5 occurrences
App selector component debugging.

### 4. `components/dashboard/organization/InviteUsers.tsx` - 5 occurrences
Invite flow debugging.

## Recommended Action

Replace console.log with:
1. **Remove entirely** - if purely for debugging
2. **Replace with proper logger** - if error tracking needed
3. **Use Redux DevTools** - for state debugging

Example logger setup:
```typescript
// lib/logger.ts
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => console.error(...args), // Always log errors
  warn: (...args: any[]) => isDev && console.warn(...args),
};
```
