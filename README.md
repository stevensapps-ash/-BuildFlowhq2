# BuildFlow HQ

BuildFlow HQ is an AI-first contractor operating system for managing projects, customers, estimates, contracts, change orders, invoices, receipts, scheduling, conceptual project planning, employees, payroll workflows, documents and owner notes.

## Current owner app
- Responsive dashboard
- Customer/project organization
- AI Estimate Builder with scope, materials, labor, assumptions and pricing output
- AI Contract Builder
- AI Change Order Builder
- AI conceptual project-planning/blueprint assistant
- Invoice tracking
- Receipt/project-tagging workspace
- Schedule workspace
- Owner/Manager/Employee role model
- Payroll workspace
- Documents and owner notes
- Global customer/project search
- Local MVP persistence
- Server-side AI endpoint so API secrets are never exposed in the browser

## AI configuration
The app uses `app/api/ai/route.ts` for server-side generation.

Set this environment variable in Vercel:

```text
OPENAI_API_KEY=your_server_side_key
```

Optional model override:

```text
OPENAI_MODEL=gpt-6-astra
```

Without an AI key, the estimate builder provides a clearly labeled local preview rather than pretending the result came from live AI. Other AI generators tell the user that AI is not configured.

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

## Remaining production infrastructure
The owner-side application and AI workflows are scaffolded, but a true production launch still requires authenticated multi-tenant database storage, cloud file uploads, signature provider, payment/payroll provider, customer portal delivery, and production credentials for the services the business chooses to connect.
