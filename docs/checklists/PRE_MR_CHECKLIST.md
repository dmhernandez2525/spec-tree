# Pre-Merge Request Checklist

Complete all items before opening a merge/pull request to the Spec Tree repository.

---

## Pre-Commit Requirements (Completed)

- [ ] All Pre-Commit Checklist items completed
- [ ] All commits follow conventional commit format
- [ ] Branch is up to date with target branch

---

## Code Completeness

- [ ] Feature is fully implemented per SDD
- [ ] All acceptance criteria met
- [ ] No TODO comments for current feature
- [ ] No placeholder code or mock data
- [ ] Error states handled and tested
- [ ] Loading states implemented
- [ ] Empty states implemented

---

## Testing

### Automated
- [ ] Unit tests written for new code
- [ ] Integration tests updated if needed
- [ ] All tests passing (`pnpm test`)
- [ ] No regression in existing tests

### Manual
- [ ] Manual testing completed
- [ ] Edge cases verified
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile responsive checked
- [ ] Keyboard navigation verified

---

## Documentation

- [ ] CHANGELOG.md updated with changes
- [ ] README.md updated if setup changed
- [ ] API documentation updated if endpoints changed
- [ ] SDD marked as implemented
- [ ] Inline comments for complex logic

---

## Security

- [ ] No hardcoded secrets or credentials
- [ ] Input validation implemented
- [ ] Authentication/authorization verified
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] OWASP top 10 considered

---

## Performance

- [ ] No obvious performance issues
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Large data sets paginated
- [ ] Images/assets optimized

---

## MR Description Requirements

- [ ] Clear title describing change
- [ ] Description explains what and why
- [ ] Screenshots/videos for UI changes
- [ ] Testing instructions provided
- [ ] Related issues linked
- [ ] SDD document linked

---

## Final Verification

```bash
# Fresh build and test
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

## MR Template

```markdown
## Summary
Brief description of changes

## Related SDD
[F{X}.{Y}.{Z} - Feature Name](link to SDD)

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added
- [ ] Manual testing completed
- [ ] Cross-browser verified

## Screenshots
(if applicable)

## Checklist
- [ ] Pre-MR checklist completed
- [ ] Ready for review
```

---

## Feature Flag (if applicable)

- [ ] Feature flag created: `feature_{feature_id}`
- [ ] Flag configured for gradual rollout
- [ ] Rollback plan documented

---

*All items must be checked before opening MR.*
