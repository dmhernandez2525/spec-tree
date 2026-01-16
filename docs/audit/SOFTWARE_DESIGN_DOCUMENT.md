# Spec Tree - Software Design Document

**Version:** 1.0
**Generated:** January 16, 2026
**Author:** Daniel Hernandez
**Audited By:** Claude Code AI Assistant

---

## 1. Executive Summary

### 1.1 Project Overview

Spec Tree is an AI-powered project management tool that generates hierarchical work items from natural language descriptions. It uses OpenAI's GPT models to automatically create Epics, Features, User Stories, and Tasks based on project requirements and contextual information.

**Core Value Proposition:**
- Transform vague project ideas into structured, actionable work items
- Hierarchical breakdown: Organization → App → Epic → Feature → User Story → Task
- AI-assisted contextual question generation for requirement refinement
- Real-time collaboration and data persistence via Strapi CMS

### 1.2 Current State Assessment

| Metric | Status |
|--------|--------|
| **Overall Completion** | ~70% |
| **P0 (Critical) Issues** | 2 (Tailwind v4, shadcn v4 upgrades) |
| **P1 (High) Issues** | 14 |
| **P2 (Medium) Issues** | 28 |
| **P3 (Low/Polish) Issues** | 50+ |
| **Build Status** | ✅ Compiles with 11 warnings |
| **TypeScript** | ✅ No errors (75 `any` types to fix) |
| **NPM Vulnerabilities** | 11 (2 critical, 5 high, 3 moderate, 1 low) |

### 1.3 Critical Upgrade Requirement (P0)

**URGENT:** The application uses outdated versions:
- **Current Tailwind:** v3.4.1 → **Required:** v4.x
- **Current shadcn/ui:** v3-compatible → **Required:** v4 (0.9+)

These upgrades are **mandatory** before any other work and should be treated as P0 priority.

### 1.4 Effort Estimates

| Phase | Hours | Weeks |
|-------|-------|-------|
| Phase 0: Tailwind/shadcn v4 Upgrade | 24-40 hours | 1 week |
| Phase 1: Critical Fixes | 16-24 hours | 3-4 days |
| Phase 2: Core Feature Completion | 40-60 hours | 1.5-2 weeks |
| Phase 3: AI Integration Polish | 24-32 hours | 1 week |
| Phase 4: UI/UX Polish | 32-48 hours | 1-1.5 weeks |
| Phase 5: Documentation & Deploy | 16-24 hours | 3-4 days |
| **Total Estimated** | **152-228 hours** | **6-8 weeks** |

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SPEC TREE                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     CLIENT      │         │  MICROSERVICE   │         │     SERVER      │
│   (Next.js 14)  │◄───────►│   (Express.js)  │         │   (Strapi 5)    │
│   Port: 3000    │         │   Port: 3001    │         │   Port: 1337    │
│                 │         │                 │         │                 │
│ ├── App Router  │         │ ├── OpenAI API  │         │ ├── REST API    │
│ ├── Redux Store │         │ ├── Rate Limit  │         │ ├── PostgreSQL  │
│ ├── shadcn/ui   │         │ └── Validation  │         │ └── Auth        │
│ └── TailwindCSS │         └────────┬────────┘         └────────┬────────┘
└────────┬────────┘                  │                           │
         │                           ▼                           │
         │                  ┌─────────────────┐                  │
         │                  │    OpenAI API   │                  │
         │                  │   (GPT Models)  │                  │
         │                  └─────────────────┘                  │
         │                                                       │
         └───────────────────────────────────────────────────────┘
                              Data Persistence
```

### 2.2 Technology Stack

| Component | Technology | Current Version | Required Version | Status |
|-----------|------------|-----------------|------------------|--------|
| Frontend Framework | Next.js | 14.2.16 | 14.x ✅ | OK |
| UI Components | shadcn/ui | v3-compatible | **v4 (0.9+)** | ❌ UPGRADE NEEDED |
| CSS Framework | Tailwind CSS | 3.4.1 | **4.x** | ❌ UPGRADE NEEDED |
| State Management | Redux Toolkit | 2.4.0 | 2.x ✅ | OK |
| Backend/CMS | Strapi | 5.0.0-beta.16 | 5.x ⚠️ | Beta Warning |
| AI Integration | Express.js | 4.18.2 | 4.x ✅ | OK |
| AI Provider | OpenAI SDK | 4.24.1 | 4.x ✅ | OK |
| Database | PostgreSQL | 8.8.0 (pg) | 8.x ✅ | OK |
| Package Manager | npm | - | - | OK |

### 2.3 Data Flow

```
User Input (Description/Context)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Client: User enters application information                  │
│     └── Redux dispatch: setSow()                                │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Client: User clicks "Generate Epics"                         │
│     └── Redux async thunk: requestAdditionalEpics()             │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Client: Build prompts from context + state                   │
│     └── epicPrompt() + systemPrompt → makeProxyCall()           │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Microservice: POST /api/openai/completion                    │
│     ├── Validate request body                                    │
│     ├── Rate limit check                                        │
│     └── OpenAI SDK: openai.chat.completions.create()            │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. OpenAI API: Generate structured JSON response                │
│     └── Multiple items separated by "=+=" delimiter            │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Client: Parse response → JSON objects                        │
│     └── response.split('=+=').map(JSON.parse)                   │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. Client: Save to Strapi + Update Redux                        │
│     ├── strapiService.createEpic() for each item                │
│     └── Redux: addEpics()                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Inventory

### 3.1 Working Features ✅

| Feature | Location | Notes |
|---------|----------|-------|
| User Authentication | `/app/(auth)/` | Login, register, forgot password |
| Dashboard Layout | `/app/(dashboard)/` | Sidebar navigation, responsive |
| App Selector | `/components/spec-tree/components/app-selector/` | Grid/list view, search, filters |
| Epic CRUD | `/components/spec-tree/components/epic/` | Create, read, update, delete |
| Feature CRUD | `/components/spec-tree/components/feature/` | Full operations |
| User Story CRUD | `/components/spec-tree/components/user-story/` | Full operations |
| Task CRUD | `/components/spec-tree/components/task/` | Full operations |
| AI Epic Generation | Via Redux thunk | requestAdditionalEpics |
| AI Feature Generation | Via Redux thunk | requestAdditionalFeatures |
| AI User Story Generation | Via Redux thunk | requestUserStories |
| AI Task Generation | Via Redux thunk | requestTasks |
| Context Questions | `/components/spec-tree/components/contextual-questions/` | AI-generated refinement questions |
| Model Selection | `/components/spec-tree/components/config/` | GPT-3.5/GPT-4 toggle |
| Metrics Display | `/components/spec-tree/components/metrics-display/` | Points, counts |
| Marketing Pages | `/app/(marketing)/` | Home, about, features, pricing, etc. |
| Legal Pages | `/app/(legal)/` | Terms, privacy, cookies |
| Theme System | `/components/dashboard/theme/` | Light/dark mode |

### 3.2 Partially Working ⚠️

| Feature | Location | What's Missing |
|---------|----------|----------------|
| Organization Management | `/components/dashboard/organization/` | Role update API not implemented |
| Member Management | `/components/dashboard/organization/MemberManagement.tsx:76` | TODO: Implement role update API |
| SSO Settings | `/components/dashboard/organization/settings/SSOSettings.tsx` | TODO: Implement SSO configuration |
| AI Settings | `/components/dashboard/organization/settings/AISettings.tsx` | TODO: API call to update settings |
| Integration Settings | `/components/dashboard/organization/settings/IntegrationsSettings.tsx` | TODO: Connection logic |
| Chat Feature | `/components/spec-tree/components/chat/` | onClose handler unused |
| Analytics | `/app/(dashboard)/user-dashboard/analytics/page.tsx:450` | TODO: bring back when fixed |
| Tutorial System | `/components/dashboard/tutorial/` | Achievement checking incomplete |

### 3.3 Not Working / Placeholder ❌

| Feature | Location | Issue |
|---------|----------|-------|
| Google Reviews Fetch | `api/fetchData.ts:700` | Marked as "Functions that are broken" |
| Resources API | `lib/hooks/use-resources.ts` | setResources unused, console.log |
| Career Job API | `app/(marketing)/careers/page.tsx:26` | TODO: fetch jobs from API |
| Career Application Submit | `app/(marketing)/careers/apply/page.tsx:83` | TODO: submit form data to backend |
| Resource Detail API | `app/(marketing)/resources/[type]/[slug]/page.tsx:13` | TODO: pull from API |

### 3.4 Placeholder/Stub Code 📝

| Location | Description | What's Needed |
|----------|-------------|---------------|
| `components/dashboard/organization/MemberManagement.tsx:76` | Role update stub | Implement Strapi API call |
| `components/dashboard/organization/MemberManagement.tsx:100` | Member removal stub | Implement removal API |
| `components/dashboard/organization/OrganizationManagement.tsx:57` | Org update stub | Implement update API |
| `components/dashboard/organization/settings/SSOSettings.tsx:78` | SSO config stub | Full SSO implementation |
| `components/dashboard/organization/InviteUsers.tsx:146` | Resend invite stub | Implement resend functionality |
| `components/dashboard/settings/ThemeConfigurator.tsx:543` | "Coming soon" text | Color picker implementation |
| `lib/store/user-slice.ts:115` | "TODO: use state, action" | Cleanup reducer |
| `components/spec-tree/lib/hooks/use-work-item-update.ts:50` | "TODO-p1: Add requirements" | Complete requirements field |

---

## 4. Issue Registry

### 4.1 Critical (P0) - Must Fix Immediately

| ID | Issue | File | Impact | Fix |
|----|-------|------|--------|-----|
| C001 | Tailwind v3.4.1 instead of v4 | `package.json` | Portfolio uses outdated tech | Full Tailwind v4 migration |
| C002 | shadcn/ui not v4-compatible | `components.json` | Component library outdated | Re-install all shadcn components with v4 |

### 4.2 High (P1) - Should Fix

| ID | Issue | File:Line | Fix |
|----|-------|-----------|-----|
| H001 | 2 critical npm vulnerabilities | package.json | Run `npm audit fix --force` |
| H002 | 5 high npm vulnerabilities | package.json | Upgrade vulnerable packages |
| H003 | Strapi on beta version (5.0.0-beta.16) | Server/package.json | Upgrade when stable released |
| H004 | API key potentially exposed | Microservice | Verify .env not committed |
| H005 | Missing role update API | MemberManagement.tsx:76 | Implement Strapi endpoint |
| H006 | Missing member removal API | MemberManagement.tsx:100 | Implement Strapi endpoint |
| H007 | Missing org update API | OrganizationManagement.tsx:57 | Implement Strapi endpoint |
| H008 | Missing SSO implementation | SSOSettings.tsx:78 | Full SSO or remove feature |
| H009 | Missing AI settings save | AISettings.tsx:154 | Implement API persistence |
| H010 | Missing integration connect/disconnect | IntegrationsSettings.tsx:137 | Implement or stub |
| H011 | Broken Google Reviews fetch | fetchData.ts:700 | Fix or remove feature |
| H012 | Missing career jobs API | careers/page.tsx:26 | Connect to real API |
| H013 | Missing careers apply submit | careers/apply/page.tsx:83 | Implement form submission |
| H014 | Missing resource detail API | resources/[type]/[slug]/page.tsx:13 | Connect to CMS |

### 4.3 Medium (P2) - Code Quality

| ID | Issue | File:Line | Fix |
|----|-------|-----------|-----|
| M001 | 75 `any` type usages | Multiple files | Replace with proper types |
| M002 | 106 console.log statements | 44 files | Remove or replace with logger |
| M003 | 11 ESLint warnings | Build output | Fix useEffect deps, img tags |
| M004 | Missing env var documentation | - | Document all required env vars |
| M005 | fetchCmsData TODO | fetchData.ts:397+ | Refactor to use fetchCmsData |
| M006 | populate=* performance | fetchData.ts:376 | Specific field queries |
| M007 | env variable handling | fetchData.ts:2 | Use Next.js env pattern |
| M008 | Unused chatApi state | spec-tree/index.tsx:37 | Remove or implement |
| M009 | Multiple useEffect dep warnings | Various | Add missing dependencies |
| M010 | <img> tags instead of <Image> | 2 locations | Use next/image |

### 4.4 Low (P3) - Polish

| ID | Issue | File | Fix |
|----|-------|------|-----|
| L001 | Missing loading states | Various | Add skeleton loaders |
| L002 | Missing error boundaries | Layout files | Add React error boundaries |
| L003 | Missing empty states | List components | Add "no items" messages |
| L004 | Outdated browserslist | package.json | Run update script |
| L005 | Missing responsive testing | - | Test on mobile/tablet |
| L006 | Missing accessibility audit | - | Run a11y checker |
| L007 | Missing meta tags | Layout files | Add OpenGraph, Twitter cards |
| L008 | Missing favicon variants | public/ | Add all favicon sizes |
| L009 | Console output in tutorial | build log | Remove achievement logs |
| L010 | Custom color picker stub | ThemeConfigurator.tsx:543 | Implement or remove text |

---

## 5. Data Model

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
│─────────────────│
│ id              │
│ name            │
│ size (enum)     │
│ industry (enum) │
│ description     │
│ websiteUrl      │
│ ownerId         │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│      App        │
│─────────────────│
│ id              │
│ applicationInfo │
│ globalInfo      │
│ selectedModel   │
│ organization    │──┐
└────────┬────────┘  │
         │ 1:N       │
         ▼           │
┌─────────────────┐  │
│     Epic        │  │
│─────────────────│  │
│ id              │  │
│ title           │  │
│ description     │  │
│ goal            │  │
│ successCriteria │  │
│ dependencies    │  │
│ timeline        │  │
│ resources       │  │
│ notes           │  │
│ risksAndMitig.  │  │  ┌─────────────────────────┐
│ app             │──┘  │  ContextualQuestion     │
└────────┬────────┘     │─────────────────────────│
         │ 1:N          │ id                      │
         ▼              │ question                │
┌─────────────────┐     │ answer                  │
│    Feature      │     │ app (nullable)          │
│─────────────────│     │ epic (nullable)         │
│ id              │◄───►│ feature (nullable)      │
│ title           │     │ userStory (nullable)    │
│ description     │     │ task (nullable)         │
│ details         │     └─────────────────────────┘
│ notes           │
│ acceptCriteria  │
│ epic            │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│   UserStory     │
│─────────────────│
│ id              │
│ title           │
│ role            │
│ actionStr       │
│ goal            │
│ points          │
│ devOrder        │
│ notes           │
│ acceptCriteria  │
│ feature         │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│     Task        │
│─────────────────│
│ id              │
│ title           │
│ details         │
│ priority        │
│ notes           │
│ userStory       │
└─────────────────┘
```

### 5.2 Strapi Content Types

**Location:** `Server/src/api/`

| Content Type | API Endpoint | Relations |
|--------------|--------------|-----------|
| organization | `/api/organizations` | hasMany: apps, supportTickets |
| app | `/api/apps` | belongsTo: organization; hasMany: epics |
| epic | `/api/epics` | belongsTo: app; hasMany: features |
| feature | `/api/features` | belongsTo: epic; hasMany: userStories |
| user-story | `/api/user-stories` | belongsTo: feature; hasMany: tasks |
| task | `/api/tasks` | belongsTo: userStory |
| contextual-question | `/api/contextual-questions` | Polymorphic to all work items |
| about-page | `/api/about-page` | Singleton |
| blog-page | `/api/blog-page` | Singleton |
| blog-post | `/api/blog-posts` | Collection |
| contact-page | `/api/contact-page` | Singleton |
| cookies-page | `/api/cookies-page` | Singleton |
| home-page | `/api/home-page` | Singleton |
| navbar | `/api/navbar` | Singleton |
| footer | `/api/footer` | Singleton |
| privacy-page | `/api/privacy-page` | Singleton |
| terms-page | `/api/terms-page` | Singleton |
| support-ticket | `/api/support-tickets` | belongsTo: organization |

---

## 6. API Documentation

### 6.1 Strapi REST API

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/organizations` | List organizations | ✅ |
| POST | `/api/organizations` | Create organization | ✅ |
| GET | `/api/organizations/:id` | Get organization | ✅ |
| PUT | `/api/organizations/:id` | Update organization | ⚠️ Frontend stub |
| DELETE | `/api/organizations/:id` | Delete organization | ⚠️ Needs testing |
| GET | `/api/apps` | List apps | ✅ |
| POST | `/api/apps` | Create app | ✅ |
| GET | `/api/apps/:id` | Get app with relations | ✅ |
| PUT | `/api/apps/:id` | Update app | ✅ |
| DELETE | `/api/apps/:id` | Delete app | ✅ |
| GET | `/api/epics` | List epics | ✅ |
| POST | `/api/epics` | Create epic | ✅ |
| PUT | `/api/epics/:id` | Update epic | ✅ |
| DELETE | `/api/epics/:id` | Delete epic | ✅ |
| GET | `/api/features` | List features | ✅ |
| POST | `/api/features` | Create feature | ✅ |
| PUT | `/api/features/:id` | Update feature | ✅ |
| DELETE | `/api/features/:id` | Delete feature | ✅ |
| GET | `/api/user-stories` | List user stories | ✅ |
| POST | `/api/user-stories` | Create user story | ✅ |
| PUT | `/api/user-stories/:id` | Update user story | ✅ |
| DELETE | `/api/user-stories/:id` | Delete user story | ✅ |
| GET | `/api/tasks` | List tasks | ✅ |
| POST | `/api/tasks` | Create task | ✅ |
| PUT | `/api/tasks/:id` | Update task | ✅ |
| DELETE | `/api/tasks/:id` | Delete task | ✅ |
| GET | `/api/contextual-questions` | List questions | ✅ |
| POST | `/api/contextual-questions` | Create question | ✅ |

### 6.2 Microservice API

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/health` | Health check | ✅ |
| POST | `/api/openai/completion` | AI completion | ✅ |

**Request Body for `/api/openai/completion`:**
```json
{
  "messages": [
    { "role": "system", "content": "System prompt here" },
    { "role": "user", "content": "User prompt here" }
  ],
  "selectedModel": "gpt-3.5-turbo-16k",
  "maxTokens": 4096
}
```

**Response:**
```json
{
  "data": "Generated content here..."
}
```

### 6.3 Authentication Endpoints

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/auth/local` | Login | ✅ |
| POST | `/api/auth/local/register` | Register | ✅ |
| POST | `/api/auth/forgot-password` | Request reset | ⚠️ Needs email config |
| POST | `/api/auth/reset-password` | Reset password | ⚠️ Needs email config |
| GET | `/api/users/me` | Current user | ✅ |
| PUT | `/api/users/:id` | Update user | ✅ |

---

## 7. Component Inventory

### 7.1 Pages (40 total)

| Route | Component | Status | Issues |
|-------|-----------|--------|--------|
| `/` | HomePage | ✅ | None |
| `/login` | LoginPage | ✅ | None |
| `/register` | RegisterPage | ✅ | None |
| `/forgot-password` | ForgotPasswordPage | ⚠️ | Email not configured |
| `/forgot-password-update` | ForgotPasswordUpdatePage | ⚠️ | Email not configured |
| `/email-confirmation` | EmailConfirmationPage | ⚠️ | Email not configured |
| `/user-dashboard` | DashboardPage | ✅ | None |
| `/user-dashboard/spec-tree` | SpecTreePage | ✅ | Core feature |
| `/user-dashboard/analytics` | AnalyticsPage | ⚠️ | TODO comment |
| `/user-dashboard/organization` | OrganizationPage | ⚠️ | API stubs |
| `/user-dashboard/profile` | ProfilePage | ✅ | None |
| `/user-dashboard/settings` | SettingsPage | ⚠️ | Some stubs |
| `/user-dashboard/support` | SupportPage | ⚠️ | Ticket submission stub |
| `/about` | AboutPage | ✅ | CMS-driven |
| `/blog` | BlogPage | ✅ | CMS-driven |
| `/blog/[id]` | BlogPostPage | ✅ | CMS-driven |
| `/careers` | CareersPage | ❌ | TODO: fetch from API |
| `/careers/apply` | CareersApplyPage | ❌ | TODO: submit form |
| `/contact` | ContactPage | ✅ | CMS-driven |
| `/demo` | DemoPage | ✅ | Interactive demo |
| `/features` | FeaturesPage | ✅ | CMS-driven |
| `/features/[category]` | FeatureCategoryPage | ✅ | Dynamic |
| `/features/ai-context` | AIContextPage | ✅ | None |
| `/our-process` | OurProcessPage | ✅ | CMS-driven |
| `/pricing` | PricingPage | ✅ | None |
| `/resources` | ResourcesPage | ✅ | None |
| `/resources/[type]/[slug]` | ResourceDetailPage | ❌ | TODO: pull from API |
| `/resources/api-reference` | APIReferencePage | ✅ | Static |
| `/resources/case-studies` | CaseStudiesPage | ✅ | None |
| `/resources/case-studies/[slug]` | CaseStudyPage | ✅ | Dynamic |
| `/resources/documentation` | DocumentationPage | ✅ | None |
| `/resources/guides` | GuidesPage | ✅ | None |
| `/resources/tutorials` | TutorialsPage | ✅ | None |
| `/resources/tutorials/[id]` | TutorialPage | ⚠️ | Placeholder avatar |
| `/solutions` | SolutionsPage | ✅ | None |
| `/solutions/industry/[industry]` | IndustrySolutionPage | ✅ | Dynamic |
| `/solutions/role/[role]` | RoleSolutionPage | ✅ | Dynamic |
| `/terms` | TermsPage | ✅ | CMS-driven |
| `/privacy` | PrivacyPage | ✅ | CMS-driven |
| `/cookies` | CookiesPage | ✅ | CMS-driven |

### 7.2 Core Spec Tree Components

| Component | Location | Status | Issues |
|-----------|----------|--------|--------|
| SpecTree | `components/spec-tree/index.tsx` | ✅ | chatApi unused |
| Builder | `components/spec-tree/components/builder/` | ✅ | Large TODO comment |
| Epic | `components/spec-tree/components/epic/` | ✅ | console.log to remove |
| Feature | `components/spec-tree/components/feature/` | ✅ | console.log to remove |
| UserStory | `components/spec-tree/components/user-story/` | ✅ | console.log to remove |
| Task | `components/spec-tree/components/task/` | ✅ | None |
| AppSelector | `components/spec-tree/components/app-selector/` | ✅ | console.log to remove |
| AppCard | `components/spec-tree/components/app-selector/AppCard.tsx` | ✅ | console.log to remove |
| Chat | `components/spec-tree/components/chat/` | ⚠️ | onClose unused |
| Config | `components/spec-tree/components/config/` | ✅ | None |
| SowInput | `components/spec-tree/components/sow-input/` | ✅ | console.log to remove |
| ContextualQuestions | `components/spec-tree/components/contextual-questions/` | ✅ | console.log to remove |
| MetricsDisplay | `components/spec-tree/components/metrics-display/` | ✅ | None |
| AcceptanceCriteriaList | `components/spec-tree/components/acceptance-criteria-list/` | ✅ | None |
| FormatData | `components/spec-tree/components/format-data/` | ⚠️ | console.log, useEffect |
| LoadingSpinner | `components/spec-tree/components/loading-spinner/` | ✅ | None |

### 7.3 shadcn/ui Components (49 total)

All installed in `components/ui/`:

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, steps, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

**Status:** All v3-compatible, need v4 upgrade

### 7.4 Redux Store Slices

| Slice | Location | Status |
|-------|----------|--------|
| auth | `lib/store/auth-slice.ts` | ✅ |
| user | `lib/store/user-slice.ts` | ⚠️ TODOs, console.log |
| organization | `lib/store/organization-slice.ts` | ✅ |
| subscription | `lib/store/subscription-slice.ts` | ⚠️ TODO, console.log |
| sow | `lib/store/sow-slice.ts` | ⚠️ console.log, `any` types |

---

## 8. Development Roadmap

### Phase 0: Tailwind v4 & shadcn v4 Upgrade (P0) - 24-40 hours

**Priority: CRITICAL - Must complete before other work**

| Task | Priority | Hours | Dependencies |
|------|----------|-------|--------------|
| Backup current working state | P0 | 0.5 | None |
| Upgrade tailwindcss to v4 | P0 | 2 | None |
| Install @tailwindcss/postcss | P0 | 0.5 | tailwindcss v4 |
| Migrate tailwind.config.ts to CSS @theme | P0 | 4 | tailwindcss v4 |
| Update postcss.config.mjs for v4 | P0 | 0.5 | tailwindcss v4 |
| Update globals.css (@import vs @tailwind) | P0 | 1 | tailwindcss v4 |
| Remove deprecated utilities | P0 | 2 | CSS migration |
| Update @apply directives if needed | P0 | 2 | CSS migration |
| Update components.json for shadcn v4 | P0 | 0.5 | tailwindcss v4 |
| Reinstall all 49 shadcn components | P0 | 4 | components.json |
| Fix any broken component styles | P0 | 4-8 | Component reinstall |
| Test dark mode functionality | P0 | 1 | All above |
| Test all custom theme variables | P0 | 2 | All above |
| Test responsive breakpoints | P0 | 2 | All above |
| Full visual regression testing | P0 | 4 | All above |

**Tailwind v4 Migration Checklist:**
- [ ] Install `tailwindcss@4` and `@tailwindcss/postcss@4`
- [ ] Convert `tailwind.config.ts` to CSS-based `@theme` config
- [ ] Update `postcss.config.mjs` (use `@tailwindcss/postcss`)
- [ ] Update CSS imports to `@import "tailwindcss"`
- [ ] Remove `@tailwind base/components/utilities` directives
- [ ] Update any deprecated utilities (check v4 migration guide)
- [ ] Test dark mode toggle still works
- [ ] Verify all custom colors/spacing/fonts work

**shadcn v4 Migration Checklist:**
- [ ] Update `components.json` registry
- [ ] Re-run `npx shadcn@latest init`
- [ ] Re-install each component with `npx shadcn@latest add <component>`
- [ ] Verify all Radix primitives work
- [ ] Test form components (especially validation styling)
- [ ] Test dialog/modal components
- [ ] Test dropdown/select components
- [ ] Test toast notifications

### Phase 1: Critical Fixes (Week 1) - 16-24 hours

| Task | Priority | Hours | Dependencies |
|------|----------|-------|--------------|
| Run `npm audit fix` for vulnerabilities | P1 | 2 | Phase 0 |
| Fix 11 ESLint warnings | P1 | 2 | None |
| Implement role update API | P1 | 2 | Strapi |
| Implement member removal API | P1 | 2 | Strapi |
| Implement org update API | P1 | 2 | Strapi |
| Fix/remove Google Reviews | P1 | 1 | None |
| Connect careers page to API | P1 | 2 | Strapi or static |
| Fix careers application submit | P1 | 2 | Strapi |
| Fix resource detail API | P1 | 2 | Strapi |
| Configure email (forgot password) | P1 | 4 | SendGrid/SMTP |

### Phase 2: Core Features (Weeks 2-3) - 40-60 hours

| Task | Priority | Hours | Dependencies |
|------|----------|-------|--------------|
| Remove all console.log (106 instances) | P2 | 4 | None |
| Replace 75 `any` types with proper types | P2 | 8 | None |
| Implement AI Settings persistence | P2 | 4 | Strapi endpoint |
| Implement Integration Settings | P2 | 4 | Strategy decision |
| Implement SSO Settings (or remove) | P2 | 8 | Strategy decision |
| Complete analytics page | P2 | 4 | Research TODO |
| Implement support ticket submission | P2 | 4 | Strapi endpoint |
| Refactor fetchData to use fetchCmsData | P2 | 4 | None |
| Add error boundaries | P2 | 2 | None |
| Add loading skeletons | P2 | 4 | None |
| Add empty state components | P2 | 2 | None |

### Phase 3: AI Integration Polish (Week 4) - 24-32 hours

| Task | Priority | Hours | Dependencies |
|------|----------|-------|--------------|
| Improve AI error handling | P2 | 4 | None |
| Add AI response retry logic | P2 | 4 | None |
| Implement response streaming | P2 | 8 | Microservice |
| Add generation progress indicators | P2 | 4 | Streaming |
| Improve context question UX | P2 | 4 | None |
| Add AI usage analytics | P3 | 4 | Strapi |
| Implement prompt caching | P3 | 4 | Strategy |

### Phase 4: UI/UX Polish (Week 5) - 32-48 hours

| Task | Priority | Hours | Dependencies |
|------|----------|-------|--------------|
| Responsive design audit | P2 | 8 | None |
| Mobile navigation improvements | P2 | 4 | Responsive audit |
| Accessibility audit (a11y) | P2 | 4 | None |
| Fix accessibility issues | P2 | 8 | A11y audit |
| Improve form validation UX | P2 | 4 | None |
| Add keyboard shortcuts | P3 | 4 | None |
| Improve theme system | P3 | 4 | None |
| Add animations/transitions | P3 | 4 | None |
| Performance optimization | P3 | 4 | None |

### Phase 5: Documentation & Deploy (Week 6) - 16-24 hours

| Task | Priority | Hours | Dependencies |
|------|----------|-------|--------------|
| Write comprehensive README | P2 | 4 | None |
| Create screenshots/GIFs | P2 | 2 | All features |
| Document API endpoints | P2 | 2 | None |
| Document environment setup | P2 | 2 | None |
| Deploy to production (Render/Vercel) | P2 | 4 | Config |
| Set up CI/CD pipeline | P3 | 4 | Deploy |
| Create demo video | P3 | 4 | All complete |
| Write portfolio case study | P3 | 2 | Demo video |

---

## 9. Environment Configuration

### 9.1 Required Environment Variables

**Client (`.env.local`):**
```bash
# Strapi Connection
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_TOKEN=your-strapi-api-token

# Microservice Connection
NEXT_PUBLIC_MICROSERVICE_URL=http://localhost:3001

# Optional: Analytics
NEXT_PUBLIC_GA_ID=UA-XXXXXXXX-X
```

**Server (`.env`):**
```bash
# Server
HOST=0.0.0.0
PORT=1337

# Security
APP_KEYS="key1,key2"
API_TOKEN_SALT=random-salt
ADMIN_JWT_SECRET=random-secret
TRANSFER_TOKEN_SALT=random-salt
JWT_SECRET=random-secret

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=spec_tree
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_SSL=false

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxx
```

**Microservice (`.env`):**
```bash
# Server
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-xxxxxx

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 10. Success Criteria

**Portfolio-ready when ALL are complete:**

### Must Have (P0-P1)
- [ ] Using **Tailwind CSS v4** with CSS-first @theme config
- [ ] Using **shadcn/ui v4** (latest components)
- [ ] Zero npm vulnerabilities (critical/high)
- [ ] All services start without errors
- [ ] All CRUD operations work for all work items
- [ ] AI generation works for Epics, Features, User Stories, Tasks
- [ ] No TypeScript errors
- [ ] Zero console.log statements in production code
- [ ] Authentication flow complete (login, register, logout)
- [ ] Email functionality working (forgot password)

### Should Have (P2)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states present for all async operations
- [ ] Error states present with recovery options
- [ ] Empty states for lists/grids
- [ ] 85%+ code coverage (if tests added)

### Nice to Have (P3)
- [ ] Comprehensive README with screenshots
- [ ] Live demo deployed and accessible
- [ ] Demo video showing core features
- [ ] Performance: Lighthouse score 90+
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] CI/CD pipeline configured

---

## 11. Quick Wins (< 1 hour each)

These can be completed quickly and show immediate improvement:

| Task | Time | Impact |
|------|------|--------|
| Run `npm audit fix` | 5 min | Reduce vulnerabilities |
| Update browserslist db | 2 min | Remove console warning |
| Replace 2 `<img>` with `<Image>` | 10 min | Fix 2 ESLint warnings |
| Fix 11 useEffect dependency warnings | 30 min | Clean build output |
| Remove achievement console.log | 5 min | Clean console |
| Add favicon variants | 15 min | Professional polish |
| Add OpenGraph meta tags | 20 min | Social sharing |
| Add robots.txt | 5 min | SEO |
| Add sitemap.xml | 15 min | SEO |
| Update package.json description | 2 min | Professional |

---

## Appendices

### Appendix A: All TODOs/FIXMEs

See companion file: `CODE_ISSUES_COMPLETE.md`

### Appendix B: Console.log Locations

See companion file: `CONSOLE_LOGS.md`

### Appendix C: Complete File Tree

See companion file: `FILE_TREE.md`

### Appendix D: Type Issues (`any` usages)

See companion file: `TYPE_ISSUES.md`

---

**Document Version:** 1.0
**Last Updated:** January 16, 2026
**Next Review:** After Phase 0 completion
