# Code Review Checklist

Use this checklist when reviewing code submissions to the Spec Tree repository.

---

## Forbidden Patterns (Auto-Reject)

These patterns result in immediate rejection:

| Pattern | Reason | Fix |
|---------|--------|-----|
| `any` | Defeats type safety | Use specific type |
| `@ts-ignore` | Hides errors | Fix the type error |
| `@ts-expect-error` | Suppresses checks | Fix the type error |
| `eslint-disable` | Skips rules | Follow lint rules |
| `console.log` | Leaks to production | Use logger service |
| Empty `catch(e) {}` | Swallows errors | Log and handle error |
| Push to main | Bypasses review | Use feature branch + PR |

---

## Code Quality

### TypeScript
- [ ] All variables and parameters typed
- [ ] No implicit `any` types
- [ ] Proper use of interfaces vs types
- [ ] Enums or const objects for fixed values
- [ ] Generic types used appropriately

### Functions
- [ ] Single responsibility principle
- [ ] Functions under 50 lines
- [ ] Clear, descriptive names
- [ ] Return types explicitly declared
- [ ] Error cases handled

### React Components
- [ ] Props typed with interface
- [ ] State typed with generics `useState<Type>()`
- [ ] `useCallback`/`useMemo` where needed
- [ ] Error boundaries for user-facing components
- [ ] Keys are stable (not array index for dynamic lists)

---

## Architecture

- [ ] Follows existing patterns in codebase
- [ ] No circular dependencies
- [ ] Proper separation of concerns
- [ ] Business logic not in components
- [ ] Reusable code extracted to hooks/utilities

### Spec Tree Specific
- [ ] Zustand used for client state
- [ ] TanStack Query for server state
- [ ] Strapi API calls through proper service layer
- [ ] Tailwind classes with `cn()` utility

---

## Error Handling

- [ ] All async operations wrapped in try/catch
- [ ] Errors logged with context using logger
- [ ] User-friendly error messages (useNotification)
- [ ] Errors don't crash application
- [ ] Error states displayed in UI

---

## Security

- [ ] No secrets in code
- [ ] User input validated
- [ ] SQL/NoSQL injection prevented
- [ ] XSS prevention (escaped output)
- [ ] Proper authentication checks

---

## Testing

- [ ] Tests exist for new code
- [ ] Tests are meaningful (not just coverage)
- [ ] Edge cases tested
- [ ] Mocks used appropriately
- [ ] Tests pass consistently

---

## Performance

- [ ] No obvious performance issues
- [ ] Large lists virtualized
- [ ] Images lazy loaded
- [ ] No unnecessary re-renders
- [ ] API calls optimized

---

## Documentation

- [ ] Complex logic explained
- [ ] Public APIs documented
- [ ] CHANGELOG updated
- [ ] Breaking changes noted

---

## Review Decision Matrix

| Finding | Action |
|---------|--------|
| Forbidden pattern found | Request changes |
| Security issue found | Request changes |
| Minor improvements needed | Approve with comments |
| All good | Approve |

---

## Review Comment Templates

### Blocking
```
BLOCKING: Found `any` type. Please use specific type.
```

### Suggestion
```
SUGGESTION: Consider extracting this to a custom hook.
```

### Question
```
QUESTION: What happens if this API call fails?
```

### Positive
```
Nice solution for handling the edge case.
```

---

*Complete this checklist for every code review.*
