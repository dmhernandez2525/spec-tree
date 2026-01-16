# Spec Tree Development History

## Overview

Spec Tree has evolved through multiple iterations, incorporating learnings from each version. This document captures the development journey and key decisions made along the way.

## Version Timeline

### Version 1: Original Concept (2023-2024)

- **Location**: `/spec-tree/` (old TT repo)
- **Tech Stack**: React CRA, Redux, Magic SDK for auth
- **Period**: July 2023 - June 2024
- **Commits**: ~110

**Key Features**:
- Basic Epic/Feature/User Story input
- Initial OpenAI GPT-4 integration for generating user stories
- Point estimation using Fibonacci system
- CSV export functionality
- Acceptance criteria management
- Task generation within user stories

**Architecture**:
- Single-page React application
- Redux for state management
- Direct OpenAI API calls from frontend
- No backend persistence (data stored in Redux state)

**What Was Learned**:
- AI-generated user stories need strong prompts and context
- Users need ability to edit and refine generated content
- Traceability from Epic -> Feature -> Story -> Task is valuable
- Point estimation automation is helpful but needs human oversight

### Version 2: Current (2024-2025)

- **Location**: `/bb/` (this repo)
- **Tech Stack**: Next.js 14, Shadcn/Radix UI, Redux Toolkit, Strapi CMS
- **Period**: December 2024 - Present
- **Commits**: ~68

**Key Features**:
- Full work item hierarchy (Apps -> Epics -> Features -> Stories -> Tasks)
- Advanced AI assistant with contextual Q&A flow
- App-level organization for multiple projects
- Persistent data storage via Strapi backend
- User authentication and organization management
- Template system for common patterns
- Enhanced export options (CSV, JSON)

**Architecture Improvements**:
- Separated frontend (Next.js) and backend (Strapi)
- Microservice for AI processing
- Server-side rendering for better performance
- Type-safe API calls with TypeScript
- Component-based UI with Shadcn

### Related Work: Tailored-Golf Platform

The Tailored-Golf monorepo contains several components relevant to Spec Tree:

**FormBuilder/FlowBuilder** (in Strapi plugins):
- Production-ready form building interface
- 19+ component types for form fields
- Drag-and-drop using @dnd-kit
- Step-based flow management
- Real-time preview and validation
- Publish/unpublish workflow
- Undo/redo functionality

**Work Manager Plugin**:
- Task management with priorities (High/Medium/Low)
- Status tracking (Open/In Progress/Completed)
- Task metrics dashboard
- Assignee management
- Activity tracking

**MultiAgentWorkTracking**:
- Repeatable architecture for multi-agent work coordination
- Epic tracking dashboard system
- Standardized templates for epics and features
- Agent workflow instructions

## Key Learnings Across Versions

### AI Integration

1. **Context is King**: The quality of AI-generated content directly correlates with the context provided
2. **Structured Prompts**: Using templates and structured prompts produces more consistent results
3. **Human in the Loop**: Always allow users to review and edit AI-generated content
4. **Iterative Refinement**: Build systems that support back-and-forth refinement with AI

### User Experience

1. **Progressive Disclosure**: Don't overwhelm users with all options at once
2. **Visual Hierarchy**: Clear parent-child relationships help users understand work breakdown
3. **Quick Actions**: Users need efficient ways to generate content at all levels
4. **Bulk Operations**: Ability to generate/export multiple items at once is essential

### Architecture

1. **Separation of Concerns**: Backend for persistence, frontend for interaction, microservice for AI
2. **Type Safety**: TypeScript throughout prevents many runtime errors
3. **Component Reusability**: Shadcn/Radix components provide consistent, accessible UI
4. **API Design**: RESTful patterns with Strapi provide predictable data access

## Feature Evolution

| Feature | V1 (Old) | V2 (Current) | Future |
|---------|----------|--------------|--------|
| Work Item Hierarchy | Epic -> Feature -> Story | App -> Epic -> Feature -> Story -> Task | Template-based generation |
| AI Generation | Basic prompts | Contextual Q&A flow | Advanced context propagation |
| Data Persistence | Browser only | Strapi backend | Multi-tenant support |
| Authentication | Magic SDK | Strapi auth | OAuth providers |
| Export | CSV only | CSV, JSON | Jira, ClickUp integrations |
| Collaboration | None | Organization-based | Real-time collaboration |

## Sources Referenced

- Old spec-tree README.md
- Old spec-tree SDD.md
- Old spec-tree detailedBreakdown.md (Roadmap)
- Old spec-tree CHANGELOG.md
- MultiAgentWorkTracking system documentation
- Strapi plugin implementations (document-builder, work-manager)
