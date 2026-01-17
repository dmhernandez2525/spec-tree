# Spec Tree Documentation Index

**Version:** 1.0.0
**Last Updated:** January 17, 2026
**Total Features:** 1,220 features across 4 phases

---

## Quick Links

### Standards & Patterns (Read First!)

| Document | Purpose |
|----------|---------|
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | **MANDATORY** - Coding patterns, forbidden patterns |
| [ARCHITECTURE_PATTERNS.md](./ARCHITECTURE_PATTERNS.md) | System architecture, component patterns |

### Planning & Roadmap

| Document | Purpose |
|----------|---------|
| [ROADMAP.md](./ROADMAP.md) | Public roadmap with phases and priorities |
| [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) | Complete 1,220 feature backlog |
| [IMPLEMENTATION_PRIORITY_MATRIX.md](./IMPLEMENTATION_PRIORITY_MATRIX.md) | Top 50 prioritized features |
| [AI_TOOL_EXPORT_FORMATS.md](./AI_TOOL_EXPORT_FORMATS.md) | All AI tool export formats |
| [RESEARCH_CATEGORIES.md](./RESEARCH_CATEGORIES.md) | 20 research categories detailed |

---

## Documentation Structure

```
docs/
├── INDEX.md                           # This file - documentation hub
├── CODING_STANDARDS.md               # MANDATORY coding standards
├── ARCHITECTURE_PATTERNS.md          # System architecture patterns
├── ROADMAP.md                         # Public roadmap
├── FEATURE_BACKLOG.md                # 1,220 features organized
├── IMPLEMENTATION_PRIORITY_MATRIX.md  # Top 50 features detailed
├── AI_TOOL_EXPORT_FORMATS.md         # Export format reference
├── RESEARCH_CATEGORIES.md            # 20 research categories
├── COMPETITIVE_ANALYSIS_AND_ROADMAP.md # Market research (gitignored)
│
├── checklists/                        # Development checklists
│   ├── README.md                      # Checklist overview
│   ├── PRE_COMMIT_CHECKLIST.md       # Before every commit
│   ├── PRE_MR_CHECKLIST.md           # Before merge requests
│   └── CODE_REVIEW_CHECKLIST.md      # For code reviewers
│
└── sdd/                               # Software Design Documents
    ├── README.md                      # SDD workflow guide
    ├── templates/
    │   └── FEATURE_SDD_TEMPLATE.md   # Enhanced SDD template
    ├── phase-1/
    │   ├── PHASE_1_OVERVIEW.md       # Foundation phase overview
    │   └── F1.1.9-multi-provider-ai-backend.md
    ├── phase-2/
    │   ├── PHASE_2_OVERVIEW.md       # AI Tool Integration overview
    │   ├── F2.1.1-cursor-rules-export.md
    │   └── F2.1.5-copilot-export.md
    ├── phase-3/
    │   └── PHASE_3_OVERVIEW.md       # Advanced Integrations overview
    └── phase-4/
        └── PHASE_4_OVERVIEW.md       # Enterprise & Scale overview
```

---

## Phase Overviews

### Phase 1: Foundation (Q1 2026)
**[PHASE_1_OVERVIEW.md](./sdd/phase-1/PHASE_1_OVERVIEW.md)**

| Focus | Feature Count | Status |
|-------|---------------|--------|
| Core SDD Builder | ~30 features | 65% scaffolded |
| Hierarchy & Structure | ~14 features | Planned |
| AI Generation | ~20 features | 40% scaffolded |

Key deliverables:
- Drag-and-drop reordering
- Full context propagation
- Multi-provider AI backend (OpenAI, Claude, Gemini)
- Streaming AI responses
- Template system foundation

### Phase 2: AI Tool Integration (Q2 2026)
**[PHASE_2_OVERVIEW.md](./sdd/phase-2/PHASE_2_OVERVIEW.md)**

| Focus | Feature Count | Status |
|-------|---------------|--------|
| Low-Effort Exports | ~20 features | Planned |
| Medium-Effort Exports | ~30 features | Planned |
| PM Tool Integrations | ~50 features | Planned |

Key deliverables:
- Cursor Rules export
- GitHub Copilot WRAP export
- Devin task format
- v0 UI spec export
- Jira/Linear/GitHub integration

### Phase 3: Advanced Integrations (Q3 2026)
**[PHASE_3_OVERVIEW.md](./sdd/phase-3/PHASE_3_OVERVIEW.md)**

| Focus | Feature Count | Status |
|-------|---------------|--------|
| MCP Server | ~24 features | Planned |
| Webhooks | ~20 features | Planned |
| Bidirectional Sync | ~25 features | Planned |
| Public API | ~30 features | Planned |

Key deliverables:
- MCP Server for real-time context
- Webhook infrastructure
- Jira/Linear bidirectional sync
- Public REST API with SDKs

### Phase 4: Enterprise & Scale (Q4 2026)
**[PHASE_4_OVERVIEW.md](./sdd/phase-4/PHASE_4_OVERVIEW.md)**

| Focus | Feature Count | Status |
|-------|---------------|--------|
| Real-Time Collaboration | ~40 features | Planned |
| Version Control | ~35 features | Planned |
| Team Features | ~45 features | Planned |
| Enterprise Security | ~50 features | Planned |

Key deliverables:
- Real-time collaborative editing
- Version history and rollback
- SSO/SAML, SCIM provisioning
- Self-hosting option

---

## Feature Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P0 Critical** | 299 | Core platform, blocking issues |
| **P1 High** | 474 | Essential features, competitive parity |
| **P2 Medium** | 329 | Market differentiation |
| **P3 Future** | 118 | Long-term vision |
| **Total** | **1,220** | |

---

## SDD Documents

### Created SDDs

| Feature ID | Feature Name | Phase | Status |
|------------|--------------|-------|--------|
| F1.1.9 | Multi-Provider AI Backend | 1 | 📋 Planned |
| F2.1.1 | Cursor Rules Export | 2 | 📋 Planned |
| F2.1.5 | Copilot Export | 2 | 📋 Planned |

### SDDs Needed (Top Priority)

| Feature ID | Feature Name | Phase |
|------------|--------------|-------|
| F1.1.1 | Drag-and-Drop Reordering | 1 |
| F1.1.2 | Context Propagation | 1 |
| F1.1.6 | Error Boundaries | 1 |
| F1.1.10 | Streaming AI Responses | 1 |
| F2.2.1 | Devin Task Format | 2 |

---

## Development Checklists

### Pre-Work Validation

| Checklist | When to Use |
|-----------|-------------|
| [PRE_COMMIT_CHECKLIST.md](./checklists/PRE_COMMIT_CHECKLIST.md) | Before every `git commit` |
| [PRE_MR_CHECKLIST.md](./checklists/PRE_MR_CHECKLIST.md) | Before creating merge/pull requests |
| [CODE_REVIEW_CHECKLIST.md](./checklists/CODE_REVIEW_CHECKLIST.md) | When reviewing others' code |

### Quick Reference

**Forbidden Patterns:**
```typescript
any                    // Use specific types
@ts-ignore            // Fix the type error
eslint-disable        // Follow lint rules
console.log           // Use logger service
catch(e) {}           // Handle errors properly
```

**Required Patterns:**
```typescript
const [items, setItems] = useState<ItemType[]>([]);  // Typed state
const notification = useNotification();              // Not useToast
logger.error('message', { context });                // Structured logging
```

---

## AI Tool Export Reference

### [AI_TOOL_EXPORT_FORMATS.md](./AI_TOOL_EXPORT_FORMATS.md)

| Tool | Format | Priority |
|------|--------|----------|
| Cursor | `.cursor/rules/*.mdc` | P1 |
| GitHub Copilot | WRAP + `copilot-instructions.md` | P1 |
| Devin | Atomic task specs | P1 |
| v0 | UI specifications | P1 |
| Windsurf | `.windsurfrules` XML | P2 |
| Lovable | Knowledge Base PRD | P2 |
| MCP Server | Real-time JSON API | P1 |

---

## Technical Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** Zustand (client) + TanStack Query (server)
- **UI:** Radix UI primitives
- **Forms:** React Hook Form + Zod

### Backend
- **CMS:** Strapi 5
- **Database:** PostgreSQL
- **Microservice:** Express (AI proxy)
- **AI Providers:** OpenAI, Anthropic, Google

---

## Workflow: SDD-First Development

1. **Create SDD** using [FEATURE_SDD_TEMPLATE.md](./sdd/templates/FEATURE_SDD_TEMPLATE.md)
2. **Review** SDD with team
3. **Create branch** following convention: `feat/{feature-id}-{short-name}`
4. **Implement** following acceptance criteria
5. **Use checklists** before commit and MR
6. **Update SDD** status to Complete
7. **Merge PR** and close related issues

---

## Contributing to Documentation

### Adding a New SDD
1. Copy template from `sdd/templates/FEATURE_SDD_TEMPLATE.md`
2. Place in appropriate phase folder: `sdd/phase-{N}/F{X}.{Y}.{Z}-{name}.md`
3. Fill out all sections (no placeholders!)
4. Update this index

### Documentation Standards
- Use status indicators: 📋 Planned, 🟡 In Progress, ✅ Complete, 🔴 Blocked
- Include feature IDs: F{Phase}.{Category}.{Number}
- Keep all dates in YYYY-MM-DD format
- Update version numbers on significant changes

---

## Related Resources

| Resource | Location |
|----------|----------|
| Competitive Analysis | [COMPETITIVE_ANALYSIS_AND_ROADMAP.md](./COMPETITIVE_ANALYSIS_AND_ROADMAP.md) |
| Strapi CMS | `Server/` directory |
| Next.js Client | `Client/` directory |
| AI Microservice | `Microservice/` directory |

---

**Document Version:** 1.0.0
**Last Updated:** January 17, 2026
**Maintained By:** Spec Tree Team
