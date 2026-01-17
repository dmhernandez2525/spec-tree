# Pre-Commit Checklist

Complete all items before committing code to the Spec Tree repository.

---

## Code Quality

### TypeScript Standards
- [ ] No `any` types in code
- [ ] No `@ts-ignore` or `@ts-expect-error` comments
- [ ] No `eslint-disable` comments
- [ ] All functions have explicit return types
- [ ] All props interfaces defined with `interface`
- [ ] State hooks are typed: `useState<Type>()`

### Logging & Debugging
- [ ] No `console.log/warn/error` statements (use logger service)
- [ ] Debug code removed
- [ ] Commented-out code removed

### Error Handling
- [ ] No empty catch blocks
- [ ] All async operations wrapped in try/catch
- [ ] Errors logged with context
- [ ] User-friendly error messages provided

---

## Testing

### Automated Tests
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm test` passes with no failures (if applicable)
- [ ] New code has test coverage

### Manual Verification
- [ ] Feature works as expected
- [ ] Edge cases tested
- [ ] Error states verified

---

## Formatting & Style

### Code Organization
- [ ] Imports ordered correctly:
  1. React/Next
  2. External packages
  3. Internal modules (`@/`)
  4. Types
- [ ] No unused imports
- [ ] No unused variables
- [ ] Files named correctly (PascalCase for components)

### React/Next.js Patterns
- [ ] Server/Client components appropriately marked
- [ ] `useCallback`/`useMemo` used where needed
- [ ] Keys are stable (not array index for dynamic lists)
- [ ] Event handlers properly typed

---

## Git Standards

### Branch & Commit
- [ ] Changes are on feature branch (not main)
- [ ] Commit message follows convention: `type(scope): description`
- [ ] Commit is atomic (single logical change)
- [ ] No unrelated changes included

### Security
- [ ] No secrets or credentials in code
- [ ] No hardcoded API keys
- [ ] No sensitive data in logs

---

## Documentation

- [ ] Complex logic has explanatory comments
- [ ] Public APIs have JSDoc
- [ ] CHANGELOG updated for user-facing changes

---

## Verification Commands

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

- Detail 1
- Detail 2

Refs: #issue-number
```

### Commit Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Build process, tooling |

---

*All items must be checked before committing.*
