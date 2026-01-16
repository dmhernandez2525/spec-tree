# Bug Requirements Template

## Quick Bug Analysis (3 minutes max!)

When user says "there's a bug", "fix this issue", "something is broken", or similar phrases:

### 1. Bug Summary (1-2 sentences)

**What is broken?**

- Current behavior (what's happening)
- Expected behavior (what should happen)
- Impact level (Critical/High/Medium/Low)

### 2. Bug Details (3-5 bullet points)

**Reproduction steps:**

- Step 1: [Action taken]
- Step 2: [What happened]
- Step 3: [Error observed]
- Environment: [Browser/Device/OS if relevant]

### 3. Applications Affected

**Which apps are impacted?** (Based on our established Strapi + Microservice + Client architecture)

- [ ] Client (Next.js 15 - customer-facing interface)
- [ ] Clubhouse (React + Vite - business management interface)  
- [ ] Microservice (Node.js 22 LTS - business logic & integrations)
- [ ] Strapi V5 (Headless CMS - authentication & content management)
- [ ] Shared UI Libraries (/Libs/tailored-ui-react, /Libs/tailored-ui-nextjs)
- [ ] Docker/Infrastructure (docker-compose, environment configuration)

### 4. Priority Assessment

**How urgent is this fix?**

- **Critical**: System down, data loss, security breach
- **High**: Major feature broken, affects many users
- **Medium**: Minor feature issue, workaround exists
- **Low**: Cosmetic issue, edge case

### 5. Success Criteria

**How do we know it's fixed?**

- [ ] Bug no longer reproduces
- [ ] Original functionality works as expected
- [ ] No regression in related features
- [ ] Tests pass (existing + new)

---

## Then IMMEDIATELY Run Bug Setup

```bash
# After getting bug details (3 min), run ONE command:
./MultiAgentWorkTracking/scripts/bug-setup.sh [number] [bug-name] "[description]"

# Example:
./MultiAgentWorkTracking/scripts/bug-setup.sh 004 login-timeout "User session timeout causing login failures"
```

**This creates everything in seconds:**

- Bug tracking folder structure
- Investigation templates
- Fix breakdown
- Testing checklist
- Coordination prompt

## Then Start Investigation & Fix!

No more analysis - start fixing:

1. Navigate to bug folder
2. Use investigation scripts
3. Identify root cause
4. Implement fix
5. Test thoroughly

**Total time from bug report to fixing: < 5 minutes setup!**
