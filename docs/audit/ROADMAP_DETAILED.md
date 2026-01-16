# Spec Tree - Detailed Development Roadmap

**Generated:** January 16, 2026
**Total Estimated Time:** 152-228 hours (6-8 weeks)

---

## Phase 0: Tailwind v4 & shadcn v4 Upgrade

**Priority:** P0 (CRITICAL)
**Timeline:** Week 1
**Estimated Hours:** 24-40 hours

### Why This Phase Is Required

The current application uses:
- **Tailwind CSS v3.4.1** - Released 2023, now outdated
- **shadcn/ui v3-compatible** - Not using latest components

For a portfolio project in 2026, using current versions is essential:
- Demonstrates staying current with ecosystem
- Access to latest features and improvements
- Better performance and smaller bundle sizes
- Shows technical competence to potential employers

### Detailed Tasks

#### Week 1, Day 1-2: Tailwind v4 Migration

| Task | Hours | Command/Action |
|------|-------|----------------|
| Create backup branch | 0.5 | `git checkout -b backup/pre-v4-upgrade` |
| Upgrade Tailwind packages | 0.5 | `npm install tailwindcss@4 @tailwindcss/postcss@4 --save-dev` |
| Read Tailwind v4 migration guide | 1 | [tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide) |
| Update postcss.config.mjs | 0.5 | See config below |
| Create new CSS-based config | 4 | Migrate tailwind.config.ts to @theme |
| Update globals.css | 1 | Replace @tailwind with @import |
| Test build compiles | 0.5 | `npm run build` |

**New postcss.config.mjs:**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**New globals.css structure:**
```css
@import "tailwindcss";

@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
  /* ... rest of custom theme */
}

@layer base {
  :root {
    /* CSS custom properties */
  }
}
```

#### Week 1, Day 3-4: shadcn v4 Migration

| Task | Hours | Command/Action |
|------|-------|----------------|
| Backup components/ui | 0.5 | `cp -r components/ui components/ui-backup` |
| Update components.json | 0.5 | Update registry URL |
| Re-initialize shadcn | 1 | `npx shadcn@latest init` |
| Reinstall all 49 components | 4 | See script below |
| Fix any custom modifications | 4-8 | Manual review |

**Reinstall script:**
```bash
#!/bin/bash
components=(
  accordion alert alert-dialog aspect-ratio avatar badge breadcrumb
  button calendar card carousel chart checkbox collapsible command
  context-menu dialog drawer dropdown-menu form hover-card input
  input-otp label menubar navigation-menu pagination popover progress
  radio-group resizable scroll-area select separator sheet sidebar
  skeleton slider sonner steps switch table tabs textarea toast
  toaster toggle toggle-group tooltip
)

for component in "${components[@]}"; do
  npx shadcn@latest add "$component" --overwrite
done
```

#### Week 1, Day 5: Testing & Validation

| Task | Hours | Action |
|------|-------|--------|
| Test dark mode toggle | 1 | Verify theme switching works |
| Test all custom colors | 1 | Check sidebar, chart, custom variables |
| Test responsive breakpoints | 1 | Mobile, tablet, desktop |
| Test all form components | 1 | Inputs, selects, checkboxes, etc. |
| Test modals/dialogs | 0.5 | Dialog, sheet, drawer |
| Test navigation | 0.5 | Sidebar, dropdown menus |
| Visual regression check | 2 | Compare screenshots before/after |
| Fix identified issues | 4 | As discovered |

### Success Criteria for Phase 0

- [ ] `npm run build` succeeds with no Tailwind errors
- [ ] Dark mode toggle works correctly
- [ ] All 49 shadcn components render properly
- [ ] Custom theme variables (sidebar, chart colors) work
- [ ] No visual regressions from before upgrade

---

## Phase 1: Critical Fixes

**Priority:** P1 (High)
**Timeline:** Week 2
**Estimated Hours:** 16-24 hours

### Tasks

| Task | Hours | Dependencies |
|------|-------|--------------|
| Fix npm vulnerabilities | 2 | Run audit fix |
| Fix 11 ESLint warnings | 2 | Add missing deps |
| Implement role update API | 2 | Strapi endpoint |
| Implement member removal API | 2 | Strapi endpoint |
| Implement org update API | 2 | Strapi endpoint |
| Fix/remove Google Reviews | 1 | Decide approach |
| Connect careers to API/static | 2 | Content strategy |
| Fix careers form submission | 2 | Strapi endpoint |
| Fix resource detail API | 2 | Connect to CMS |
| Configure SendGrid email | 4 | Account setup |

### API Endpoints to Create

**Strapi Custom Controllers:**

```typescript
// Server/src/api/organization/controllers/custom.ts
export default {
  async updateRole(ctx) {
    const { memberId, newRole } = ctx.request.body;
    // Implementation
  },

  async removeMember(ctx) {
    const { memberId } = ctx.request.body;
    // Implementation
  },
};
```

---

## Phase 2: Core Features

**Priority:** P2 (Medium)
**Timeline:** Weeks 3-4
**Estimated Hours:** 40-60 hours

### Week 3: Code Quality

| Task | Hours | Notes |
|------|-------|-------|
| Remove 106 console.log statements | 4 | Use find/replace |
| Replace 75 `any` types | 8 | Type properly |
| Implement AI Settings persistence | 4 | Strapi endpoint |
| Implement Integration Settings | 4 | Or stub with "coming soon" |
| Decide SSO strategy | 2 | Implement or remove |

### Week 4: Feature Completion

| Task | Hours | Notes |
|------|-------|-------|
| Complete analytics page | 4 | Fix TODO issue |
| Implement support tickets | 4 | Full CRUD |
| Refactor fetchData | 4 | Use fetchCmsData |
| Add error boundaries | 2 | All layouts |
| Add loading skeletons | 4 | Key pages |
| Add empty states | 2 | All lists |

---

## Phase 3: AI Integration Polish

**Priority:** P2 (Medium)
**Timeline:** Week 5
**Estimated Hours:** 24-32 hours

### Tasks

| Task | Hours | Notes |
|------|-------|-------|
| Improve AI error handling | 4 | User-friendly messages |
| Add retry logic | 4 | Exponential backoff |
| Implement streaming | 8 | Real-time display |
| Progress indicators | 4 | During generation |
| Improve context UX | 4 | Better question flow |
| AI usage analytics | 4 | Track in Strapi |
| Prompt caching | 4 | Performance |

### Streaming Implementation

**Microservice update:**
```typescript
// Microservice/src/services/openai.service.ts
async createStreamingCompletion(params: OpenAIRequestBody) {
  const stream = await openai.chat.completions.create({
    model: params.selectedModel,
    messages: params.messages,
    stream: true,
  });

  return stream;
}
```

**Client update:**
```typescript
// Use fetch with ReadableStream
const response = await fetch('/api/openai/stream', {
  method: 'POST',
  body: JSON.stringify(params),
});

const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process chunk
}
```

---

## Phase 4: UI/UX Polish

**Priority:** P2-P3
**Timeline:** Week 6
**Estimated Hours:** 32-48 hours

### Tasks

| Task | Hours | Notes |
|------|-------|-------|
| Responsive audit | 8 | All pages |
| Mobile navigation | 4 | Hamburger menu |
| Accessibility audit | 4 | axe-core |
| Fix a11y issues | 8 | As found |
| Form validation UX | 4 | Better feedback |
| Keyboard shortcuts | 4 | Power users |
| Theme improvements | 4 | More options |
| Animations | 4 | Framer motion |
| Performance | 4 | Lighthouse |

### Responsive Breakpoints to Test

| Breakpoint | Width | Devices |
|------------|-------|---------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large monitors |

---

## Phase 5: Documentation & Deploy

**Priority:** P2-P3
**Timeline:** Week 7
**Estimated Hours:** 16-24 hours

### Tasks

| Task | Hours | Deliverable |
|------|-------|-------------|
| README.md | 4 | Comprehensive guide |
| Screenshots | 2 | 10+ quality images |
| API docs | 2 | Endpoint reference |
| Env setup guide | 2 | Step-by-step |
| Production deploy | 4 | Render/Vercel |
| CI/CD setup | 4 | GitHub Actions |
| Demo video | 4 | 3-5 minute walkthrough |
| Case study | 2 | Portfolio writeup |

### Deployment Checklist

**Vercel (Client):**
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Enable analytics

**Render (Server/Microservice):**
- [ ] Create PostgreSQL database
- [ ] Deploy Strapi instance
- [ ] Deploy Express microservice
- [ ] Configure CORS for production
- [ ] Set up SSL

**Environment Variables for Production:**
```bash
# Vercel
NEXT_PUBLIC_STRAPI_API_URL=https://api.blueprintbuilder.app
NEXT_PUBLIC_MICROSERVICE_URL=https://ai.blueprintbuilder.app

# Render - Strapi
DATABASE_URL=postgres://...
NODE_ENV=production

# Render - Microservice
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://blueprintbuilder.app
```

---

## Weekly Summary

| Week | Phase | Focus | Hours |
|------|-------|-------|-------|
| 1 | 0 | Tailwind/shadcn v4 upgrade | 24-40 |
| 2 | 1 | Critical fixes | 16-24 |
| 3 | 2a | Code quality | 20-30 |
| 4 | 2b | Feature completion | 20-30 |
| 5 | 3 | AI polish | 24-32 |
| 6 | 4 | UI/UX polish | 32-48 |
| 7 | 5 | Docs & deploy | 16-24 |
| **Total** | - | - | **152-228** |

---

## Risk Mitigation

### Risk 1: Tailwind v4 Migration Breaks Styles
**Mitigation:**
- Create backup branch before starting
- Have visual comparison screenshots
- Allocate buffer time for fixes

### Risk 2: shadcn Components Have Breaking Changes
**Mitigation:**
- Backup components/ui directory
- Document custom modifications before upgrade
- Reinstall one component at a time if issues

### Risk 3: Strapi Beta Instability
**Mitigation:**
- Monitor Strapi releases
- Consider upgrade to stable when released
- Document any workarounds used

### Risk 4: OpenAI API Changes
**Mitigation:**
- Pin to specific SDK version
- Monitor deprecation notices
- Abstract API calls for easy updates

---

## Definition of Done

A task is complete when:
1. Code is written and tested locally
2. No TypeScript errors
3. No ESLint errors/warnings
4. Feature works in development
5. Feature works in production build
6. Code is committed with descriptive message
