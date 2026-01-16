# 🤖 Agent Workflow Instructions

## 🚨 CRITICAL: Complete Epic Process Required

When a user says **"Let's work on [functionality]"** or **"Let's build [feature]"**, you MUST follow this complete workflow automatically. **DO NOT STOP** after gathering requirements!

## ⚡ IMPORTANT: Use Automation Scripts!

**DO NOT manually create files or write long markdown content!** Use the provided automation scripts that handle everything in seconds:

- `epic-setup.sh` - Creates entire epic structure with one command
- `agent-helpers.sh` - Provides helper functions for coordination
- Templates are auto-generated - just fill in specifics

---

## 📋 Complete Workflow Steps

### Step 1: Requirements Gathering

- Ask user for business requirements and technical scope
- Understand what applications will be affected (Clubhouse, Client, Microservice, Strapi)
- Clarify success criteria and constraints

### Step 2: Epic Creation (AUTOMATED - ONE COMMAND!)

**Use the epic setup script - it handles EVERYTHING automatically:**

```bash
# Check next epic number in epic-tracking/DASHBOARD.md, then run:
./MultiAgentWorkTracking/scripts/epic-setup.sh 003 booking-system "Golf club booking system"
```

**This single command automatically:**

- ✅ Creates epic folder from master template
- ✅ Runs all setup scripts
- ✅ Generates priority file templates
- ✅ Creates task breakdown template
- ✅ Initializes tracking files
- ✅ Generates coordination prompt
- ✅ Sets up everything needed to start

### Step 3: Epic Planning (QUICK UPDATES ONLY)

**Just fill in the specifics - templates are already created:**

- Update generated `priorities/priority-X.md` files with actual requirements
- Fill in `TASK_BREAKDOWN.md` with specific tasks (template provided)
- Use generated `AGENT_COORDINATION_PROMPT.md` to start work

### Step 4: Epic Documentation Setup

- Fill out the generated priority files with specific requirements from user
- Update `TASK_BREAKDOWN.md` with detailed tasks based on requirements
- Customize the generated `AGENT_COORDINATION_PROMPT.md` with epic-specific details

### Step 5: Provide Coordination Prompt

- Present the final `AGENT_COORDINATION_PROMPT.md` content to the user
- This prompt will be given to another AI agent who will do the actual implementation
- **DO NOT start coding yourself** - your job is to create the epic documentation and coordination prompt
- The implementation will be done by a separate AI agent using your coordination prompt

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T DO THIS:

- Stop after gathering requirements and ask "Should I proceed?"
- Ask "Any questions?" or "Need clarification?" after user provides requirements
- Create planning documents without implementing functionality
- Skip the epic tracking system entirely
- Implement without proper task breakdown
- Forget to update the main dashboard

### ✅ DO THIS:

- Follow complete workflow automatically
- Implement actual working functionality
- Update task progress as you work
- Create comprehensive documentation
- Update dashboard when complete

---

## 🎯 Success Criteria

Epic setup is complete when:

- ✅ Epic folder created with all documentation templates
- ✅ Priority files filled out with specific requirements
- ✅ Task breakdown updated with detailed tasks
- ✅ Coordination prompt customized and provided to user
- ✅ User has the prompt to give to implementation AI
- ✅ All epic documentation committed to git

---

## 📂 File Structure Example

```
epic-tracking/epics/003-booking-system/
├── EPIC_OVERVIEW.md          # Business context, technical scope, risks
├── TASK_BREAKDOWN.md         # Detailed tasks with progress tracking
└── COMPLETION_STATUS.md      # Final summary and metrics
```

---

## 🔗 Key Files to Reference

- **Main Dashboard**: `epic-tracking/DASHBOARD.md` - Check for next epic number
- **Epic Template**: `epic-tracking/templates/EPIC_TEMPLATE.md` - Copy this for overview
- **Task Template**: `epic-tracking/templates/TASK_BREAKDOWN_TEMPLATE.md` - Copy this for tasks
- **Examples**: `epic-tracking/epics/001-tax-configuration/` - See completed epic example

---

## 💡 Remember

The goal is to deliver **complete, working functionality** with proper documentation and tracking. The user should be able to use the new feature immediately after you finish, and other stakeholders should be able to understand what was built by reading the epic documentation.

**Always follow the complete workflow - never stop halfway!**

---

## 🐛 Bug Fix Workflow

When a user reports a bug ("there's a bug", "fix this issue", "something is broken", "error", "exception", "crash", "hotfix", "bugfix", "defect", or similar):

### Step B1: Bug Triage and Details

- Use `MultiAgentWorkTracking/prompts/BUG_REQUIREMENTS_TEMPLATE.md` (3 minutes max)
- Capture reproduction steps, environment, severity, and affected applications

### Step B2: Bug Tracking Creation (AUTOMATED - ONE COMMAND!)

```bash
# Example
./MultiAgentWorkTracking/scripts/bug-setup.sh 004 login-timeout "User session timeout causing login failures"
```

This command automatically:

- Creates bug folder `MultiAgentWorkTracking/[number]-bug-[name]/`
- Generates `BUG_INVESTIGATION.md` and `BUG_COORDINATION_PROMPT.md`
- Adds helper scripts in `scripts/bug-helpers.sh`
- Initializes tracking files

### Step B3: Investigation & Planning

- Fill out `BUG_INVESTIGATION.md` (repro, root cause, fix strategy, files to modify)
- Define tests to add: unit, integration, E2E
- Update severity and status as you progress

### Step B4: Provide Bug Coordination Prompt

- Present the `BUG_COORDINATION_PROMPT.md` content to the user
- This prompt will be given to another AI agent who will implement the fix
- Do not start coding yourself in this workflow

### ✅ Bug Fix Success Criteria

- Bug is no longer reproducible using documented steps
- Appropriate tests added and passing (unit/integration/E2E as applicable)
- No regressions in related features
- Documentation updated in `BUG_INVESTIGATION.md`
