# BuildFlow HQ

BuildFlow HQ is a contractor-focused business operating system for managing projects, customers, estimates, invoices, scheduling, documents and owner notes from one dashboard.

## MVP included
- Responsive contractor dashboard
- Today's jobs
- Projects and customer organization
- Estimate creation
- Invoice tracking
- Schedule workspace
- Documents workspace
- Owner notes
- Global project/customer search
- Local persistence for MVP data
- Multi-tenant-ready company workspace concept
- Mobile responsive navigation

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm install
npm run build
```

The project uses Next.js + TypeScript and is configured for static export to the `out` directory for simple deployment.

## Next production phase
Replace localStorage with authenticated multi-tenant database storage, add role-based Owner/Manager/Employee accounts, cloud file uploads, signatures, payments/payroll, customer approvals, AI estimating/document assistance, and production integrations.
