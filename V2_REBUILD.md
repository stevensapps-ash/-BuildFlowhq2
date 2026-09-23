# Construction HQ v2 Rebuild

This branch is the clean rebuild track for Construction HQ.

## Release gates
1. `npm run check` must pass.
2. `npm run build` must pass.
3. Production smoke tests must pass.
4. Desktop and mobile navigation must be click-tested.
5. Authentication, workspace load/save, estimates, contracts, projects, invoices, receipts, documents, notes and settings must be verified before promotion.

## Architecture direction
- Keep authentication and tenant boundaries server-side.
- Split the current monolithic workspace into feature modules.
- Preserve existing customer/company data contracts while migrating UI incrementally.
- Never promote an unverified rebuild directly over production.
