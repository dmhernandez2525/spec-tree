# Development Checklists

This folder contains standardized checklists for maintaining code quality in the Spec Tree project.

---

## Available Checklists

| Checklist | When to Use |
|-----------|-------------|
| [PRE_COMMIT_CHECKLIST.md](./PRE_COMMIT_CHECKLIST.md) | Before every `git commit` |
| [PRE_MR_CHECKLIST.md](./PRE_MR_CHECKLIST.md) | Before creating merge/pull requests |
| [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) | When reviewing others' code |

---

## Quick Reference

### Forbidden Patterns (Never Use)

```typescript
any                           // Use specific types
@ts-ignore                    // Fix the type error
@ts-expect-error              // Fix the type error
eslint-disable                // Follow lint rules
console.log/warn/error        // Use logger service
catch(e) {}                   // Handle all errors
```

### Required Patterns

```typescript
const [items, setItems] = useState<ItemType[]>([]);  // Typed state
const notification = useNotification();              // Not useToast
logger.error('message', { context });                // Structured logging
```

### Verification Commands

```bash
# Run all checks
pnpm lint && pnpm typecheck && pnpm test

# Check for forbidden patterns
grep -rn ":\s*any" --include="*.ts" --include="*.tsx" Client/
grep -rn "@ts-ignore" --include="*.ts" --include="*.tsx" Client/
grep -rn "console\." --include="*.ts" --include="*.tsx" Client/
```

---

## Commit Message Format

```
type(scope): short description

Refs: #issue-number
```

**Types:** feat, fix, docs, style, refactor, test, chore

---

*Complete the appropriate checklist before each code submission.*
