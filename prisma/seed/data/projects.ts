import type { SeedProject } from "../types";

export const projects: SeedProject[] = [
  {
    slug: "expense-approval-workflow",
    title: "Expense Approval Workflow",
    difficulty: "INTERMEDIATE",
    summary:
      "Build a multi-step expense approval system where employees submit claims and managers approve or reject them with a full audit trail. The project focuses on state machines, role-based authorization, and auditable transitions in a TypeScript stack.",
    scenario:
      "A 40-person company tracks expense claims in a shared spreadsheet. Claims get lost, approvals happen over email with no record of who signed off, and finance cannot answer questions like 'who approved this $2,000 conference bill?'. The operations lead wants a small internal tool where employees submit receipts, claims route to the right manager based on department and amount, and every decision is stamped with who did it and when. Finance needs a filterable list of pending and settled claims for month-end reconciliation. You are the engineer hired to replace the spreadsheet with a proper web application.",
    estimatedHours: 40,
    learningGoals:
      "- Model a finite state machine for claim lifecycle (draft, submitted, approved, rejected, paid) and enforce transitions server-side\n- Implement role-based authorization: employee, manager, and finance roles with different capabilities\n- Design relational data with foreign keys, status enums, and an append-only audit log\n- Build typed forms with inline validation errors that mirror server-side rules\n- Write integration tests that exercise full approval paths against a real database",
    requirements:
      "- Employees can create, edit while draft, and submit expense claims with amount, category, date, and receipt notes\n- Claims above configurable thresholds require an extra finance approval step after manager approval\n- Approvers can only act on claims submitted by members of their department\n- Approvers can approve, reject with a mandatory comment, or request changes\n- Every status transition is recorded with actor, timestamp, and comment in an immutable audit log\n- Employees and approvers can filter claims by status, department, date range, and amount range\n- Users cannot transition a claim that is not in a state allowing that action",
    features:
      "- Claim submission form with category selection, amount entry, and receipt metadata\n- Manager inbox showing pending claims for their department, sorted by age\n- Two-step approval routing when amount exceeds the finance threshold\n- Append-only audit trail page per claim showing every transition with actor and timestamp\n- Dashboard with counts of pending, approved, and rejected claims per department\n- Seed script with realistic departments, users, and historical claims for demos",
    architectureNotes:
      "- Layered structure: React Router route modules for UI, a service layer for workflow logic, and Prisma for persistence\n- Keep the state machine in one module (`workflow.ts`) with explicit transition table so it can be unit tested without HTTP\n- Server loaders handle reads; server actions handle mutations, each going through Zod validation before touching Prisma\n- Authorization checks live in a shared `requireRole`/`requireOwnership` helper called at the top of every mutating action\n- Audit writes happen in the same transaction as the status change to avoid drift",
    databaseNotes:
      "- `User` with role and department; `Department` for org structure\n- `ExpenseClaim` with `status` enum, `amountCents`, `categoryId`, `submitterId`, and `approverId`\n- `ApprovalStep` rows per required step so multi-step routing is data-driven, not hardcoded\n- `AuditEntry` with `claimId`, `actorId`, `fromStatus`, `toStatus`, `comment`, `createdAt` — never updated or deleted\n- Index on `(status, submittedAt)` for the approver inbox and `(submitterId, createdAt)` for history lists",
    apiNotes:
      "- `POST /api/claims` — create draft claim\n- `PATCH /api/claims/:id` — update draft fields while status is DRAFT\n- `POST /api/claims/:id/submit` — submit and open the first approval step\n- `POST /api/claims/:id/transition` — approve, reject, or request-changes with body `{ action, comment }`\n- `GET /api/claims?status=&department=&from=&to=` — filtered list scoped to the caller's role\n- `GET /api/claims/:id/audit` — full transition history",
    testingNotes:
      "- Unit test the transition table: every allowed and forbidden (from, action) pair\n- Unit test threshold routing logic with boundary amounts\n- Integration test claim submission and approval flows with Vitest against a Postgres test database\n- Integration test authorization: a manager from another department gets a denial\n- End-to-end test with Playwright: submit as employee, approve as manager, verify audit trail renders",
    status: "PUBLISHED",
    categories: ["backend", "business"],
    topics: [
      "typescript",
      "nodejs",
      "sql",
      "postgresql",
      "authentication-authorization",
      "design-patterns",
    ],
    domains: ["accounting-finance", "hr-payroll"],
    resources: [
      {
        url: "https://www.prisma.io/docs",
        note: "Schema design, transactions, and migrations for the claims store.",
      },
      {
        url: "https://www.postgresql.org/docs/",
        note: "Reference for enums, constraints, and transactional guarantees.",
      },
    ],
    milestones: [
      {
        title: "Data model and claim CRUD",
        body: "Define Prisma models for users, departments, claims, and audit entries, and ship create/edit/read for drafts.",
      },
      {
        title: "Workflow engine",
        body: "Implement the state machine and service-layer transitions with full audit logging.",
      },
      {
        title: "Authorization and routing",
        body: "Add role checks, department scoping, and multi-step approval routing by amount.",
      },
      {
        title: "Dashboards and tests",
        body: "Build approver inbox and history views, then cover the flows with integration and Playwright tests.",
      },
    ],
  },
  {
    slug: "inventory-purchase-order-tracker",
    title: "Inventory & Purchase Order Tracker",
    difficulty: "INTERMEDIATE",
    summary:
      "Build a purchase order lifecycle tool tied to stock levels: raise POs against suppliers, receive goods, and watch inventory move. The project emphasizes relational modeling, quantity invariants, and receiving workflows.",
    scenario:
      "A small electronics distributor manages stock in a warehouse and purchase orders in email threads with each supplier. When a shipment arrives, someone re-types quantities into a spreadsheet and mistakes are common — items get marked received twice or short-shipped without record. The warehouse manager wants a system where staff raise purchase orders against approved suppliers, suppliers are simulated delivering goods, and each receipt adjusts stock levels and flags discrepancies. Purchasing needs to see open orders per supplier and expected delivery dates. You are building this as an internal tool with a Node and Prisma backend and a React interface.",
    estimatedHours: 45,
    learningGoals:
      "- Design a normalized schema covering suppliers, products, purchase orders, line items, and stock movements\n- Enforce quantity invariants (cannot receive more than ordered) at both database and application level\n- Model a receive-goods workflow that records partial deliveries against order lines\n- Implement running stock on-hand via movement ledger rather than a single mutable counter\n- Build filterable list views and detail pages with server-side pagination",
    requirements:
      "- Staff can create purchase orders with multiple line items, each referencing a product and order quantity\n- A PO must be submitted before goods can be received; draft POs are editable, submitted ones are not\n- Receiving records actual quantities per line, supports partial deliveries, and blocks over-receipt\n- Each receipt generates stock movement rows and updates on-hand quantity atomically\n- On-hand quantity can be recomputed by summing the movement ledger for a product\n- Users can search POs by supplier, status, date range, and product\n- Products below a configurable reorder level appear on a low-stock list",
    features:
      "- Supplier catalog with contact details and product price lists\n- PO creation wizard with line item entry and supplier product autofill\n- Receiving screen listing expected vs. received quantities with discrepancy highlighting\n- Stock movement ledger per product showing every in, out, and adjustment with running balance\n- Open POs by supplier view for follow-up emails\n- Low-stock report with reorder suggestions based on recent movement velocity",
    architectureNotes:
      "- Routes and loaders in React Router, a `purchasing` service module owning PO state transitions, and Prisma for all queries\n- Keep receiving logic in one transactional service method: insert movements, update stock, close completed lines\n- Represent stock as a movement ledger with a derived on-hand figure; add a periodic summary table only if performance demands it\n- Validate quantity rules in a Zod schema plus database CHECK constraints as a second line of defense\n- Seed data should include suppliers, products, open POs, and historical movements so screens are never empty",
    databaseNotes:
      "- `Supplier`, `Product` (with `sku` unique, `reorderLevel`), `PurchaseOrder` (with `status` enum and `supplierId`)\n- `PurchaseOrderLine` with `orderedQty`, per-line status, and FK to product\n- `Receipt` and `ReceiptLine` capturing each delivery event with `receivedQty`\n- `StockMovement` with `productId`, `type` (IN/OUT/ADJUST), `quantityDelta`, `referenceType`, `referenceId`\n- Unique constraint on `(sku)`; index on `(supplierId, status)` and `(productId, createdAt)` for ledger queries",
    apiNotes:
      "- `POST /api/purchase-orders` — create draft PO with lines\n- `POST /api/purchase-orders/:id/submit` — lock the PO for receiving\n- `POST /api/purchase-orders/:id/receipts` — record a delivery with per-line quantities\n- `GET /api/products/:id/movements` — paginated stock ledger\n- `GET /api/products/low-stock` — products at or below reorder level\n- `GET /api/purchase-orders?supplier=&status=` — filtered PO list",
    testingNotes:
      "- Unit test quantity validation: exact receipt, partial receipt, and over-receipt attempts\n- Integration test the receiving transaction, verifying movements and line statuses in one commit\n- Integration test concurrent receive attempts to confirm over-receipt is blocked\n- Component tests for the receiving screen's discrepancy display with Testing Library\n- End-to-end test: create PO, submit, receive fully, verify on-hand and PO status",
    status: "PUBLISHED",
    categories: ["backend", "business"],
    topics: [
      "typescript",
      "nodejs",
      "sql",
      "postgresql",
      "data-modeling",
      "rest-apis",
    ],
    domains: ["inventory-management", "procurement-procure-to-pay"],
    resources: [
      {
        url: "https://www.prisma.io/docs",
        note: "Transactions and relational queries for the receiving workflow.",
      },
      {
        url: "https://www.postgresql.org/docs/",
        note: "CHECK constraints, isolation levels, and ledger-style schemas.",
      },
    ],
    milestones: [
      {
        title: "Catalog and schema",
        body: "Model suppliers, products, POs, and lines; seed realistic catalog data.",
      },
      {
        title: "PO lifecycle",
        body: "Implement create, edit, and submit flows with validation on line quantities.",
      },
      {
        title: "Receiving and stock ledger",
        body: "Build transactional receiving that writes movements and updates on-hand.",
      },
      {
        title: "Reports and hardening",
        body: "Add low-stock and open-PO views, then cover edge cases with integration tests.",
      },
    ],
  },
  {
    slug: "billing-invoice-generator",
    title: "Billing & Invoice Generator",
    difficulty: "INTERMEDIATE",
    summary:
      "Build an invoicing tool that turns time entries and one-off charges into numbered invoices with tax and PDF export. The focus is on calculation correctness, numbering uniqueness, and document generation.",
    scenario:
      "A five-person consultancy bills clients with invoices assembled by hand in a word processor. Line items get mistyped, tax rates are applied inconsistently, and invoice numbers occasionally collide when two partners invoice on the same day. The managing partner wants a tool where staff record billable time against clients and projects, generate an invoice that totals everything automatically with the right tax rate, and export a PDF the client can pay. The finance clerk needs a clear list of draft, sent, and paid invoices per client. You are building this as a TypeScript application with a relational database for every amount stored in minor units.",
    estimatedHours: 40,
    learningGoals:
      "- Store and compute money in minor units (cents) with explicit rounding rules to avoid floating-point drift\n- Generate gapless, concurrent-safe invoice numbers using database sequences or advisory locks\n- Model line items, tax rates, and invoice totals with a single source of truth for calculation\n- Produce a printable PDF from structured invoice data\n- Write property-style tests for totals across many line item combinations",
    requirements:
      "- Staff can create clients, projects under clients, and billable time entries with date, hours, and rate\n- Generating an invoice snapshots time entries and one-off line items into immutable invoice lines\n- Tax is applied per line at the client's configured rate, with rounding half-up to the minor unit\n- Invoice numbers are unique and sequential per financial year with no gaps created by rolled-back transactions\n- Once finalized, invoice totals and lines cannot be edited; corrections require credit notes\n- Users can mark invoices as sent, paid, or voided, and filter by status and client\n- Invoices export to a PDF containing company header, client details, lines, tax breakdown, and total due",
    features:
      "- Client and project management with default billing rates\n- Time entry logging with a weekly grid view\n- Invoice generator that pulls unbilled entries and computes totals live\n- Immutable finalized invoices with a payment status timeline\n- Credit note creation against a finalized invoice\n- PDF export endpoint and preview page matching the PDF layout",
    architectureNotes:
      "- React Router UI plus a `billing` domain module isolating calculation and numbering logic from HTTP concerns\n- All arithmetic in an integer minor-unit library; ban raw floats for money in code review\n- Invoice numbering runs inside the same transaction as finalization, using a per-year sequence row locked with `SELECT ... FOR UPDATE`\n- PDF generation is a pure function from invoice DTO to document, so it can be tested without a database\n- Credit notes reference the original invoice and reverse amounts rather than mutating history",
    databaseNotes:
      "- `Client` with tax rate and billing address; `Project` under client with default rate\n- `TimeEntry` with `hours` numeric, `rateCents`, `invoicedAt` nullable marker\n- `Invoice` with `number` unique per year (composite unique `(year, number)`), `status`, `subtotalCents`, `taxCents`, `totalCents`\n- `InvoiceLine` snapshot of description, quantity, unit rate, tax rate, and line totals at invoice time\n- `InvoiceSequence` row per year; `CreditNote` referencing `invoiceId` with negative-scope totals",
    apiNotes:
      "- `POST /api/time-entries` — log billable time\n- `POST /api/invoices/preview` — compute totals for a draft without persisting\n- `POST /api/invoices` — finalize and number an invoice from selected entries\n- `POST /api/invoices/:id/status` — transition to SENT, PAID, or VOID\n- `POST /api/invoices/:id/pdf` — stream the generated PDF\n- `GET /api/invoices?client=&status=` — filtered invoice list",
    testingNotes:
      "- Property-based unit tests for line totals and invoice totals across random quantities and rates\n- Unit tests for rounding at half-cent boundaries\n- Integration test invoice finalization confirming sequence consumption and immutability of finalized rows\n- Integration test that rolled-back finalizations do not leave number gaps\n- End-to-end test generating and viewing a PDF for a seeded invoice",
    status: "PUBLISHED",
    categories: ["backend", "business"],
    topics: [
      "typescript",
      "nodejs",
      "sql",
      "postgresql",
      "data-modeling",
      "business-process-modeling",
    ],
    domains: ["accounting-finance", "sales-order-to-cash"],
    resources: [
      {
        url: "https://www.prisma.io/docs",
        note: "Transactions and locking patterns for safe invoice numbering.",
      },
      {
        url: "https://www.postgresql.org/docs/",
        note: "Sequences, advisory locks, and numeric types for money.",
      },
    ],
    milestones: [
      {
        title: "Clients, projects, and time entries",
        body: "Build the data model and CRUD for clients, projects, and billable time.",
      },
      {
        title: "Calculation engine",
        body: "Implement minor-unit totals, tax, and rounding as pure, tested functions.",
      },
      {
        title: "Finalization and numbering",
        body: "Ship gapless numbering, immutable finalization, and status transitions.",
      },
      {
        title: "PDF export and credit notes",
        body: "Generate PDFs and add credit notes, then verify with end-to-end tests.",
      },
    ],
  },
  {
    slug: "support-ticketing-system",
    title: "Support Ticketing System",
    difficulty: "INTERMEDIATE",
    summary:
      "Build a helpdesk where customers open tickets and agents triage, respond, and resolve them with SLA-style priorities. The project covers ticket state modeling, assignment, and threaded conversations.",
    scenario:
      "A SaaS startup handles support over a shared inbox. Replies collide, urgent tickets sit unanswered because nobody owns them, and the founder cannot measure response times. The support lead wants a ticketing system where each customer email-style request becomes a ticket, agents claim tickets or get assigned by queue, and every reply is part of a threaded conversation visible to the whole team. Tickets have priorities and due timestamps so overdue items surface on a dashboard. You are building the system with a TypeScript full-stack framework, with customers able to open tickets and agents working a queue view.",
    estimatedHours: 45,
    learningGoals:
      "- Model ticket lifecycle states and legal transitions with an explicit workflow definition\n- Implement assignment rules: claim, reassign, and queue-based round-robin\n- Design threaded conversation storage separating ticket metadata from messages\n- Build role-aware views: customer portal versus agent workspace\n- Measure and display first-response and resolution times from stored timestamps",
    requirements:
      "- Customers can open tickets with subject, body, and category, and view only their own tickets\n- Agents see all tickets; customers never see internal notes\n- Agents can claim unassigned tickets, reassign claimed ones, and add public replies or internal notes\n- Priority (low, normal, high, urgent) drives default due dates measured in business hours\n- A dashboard lists overdue tickets, unassigned tickets older than a threshold, and average response times\n- Ticket search filters by status, priority, assignee, category, and created date\n- Closing a ticket requires a resolution code; reopening returns it to open with history intact",
    features:
      "- Customer ticket submission form and personal ticket list with status badges\n- Agent queue view grouped by unassigned, claimed-by-me, and all-open\n- Threaded conversation view with public replies distinguished from internal notes\n- Assignment actions: claim, release, reassign with a required note\n- Overdue and unassigned dashboard with counts and drill-down lists\n- Per-ticket timeline showing status changes, assignments, and response metrics",
    architectureNotes:
      "- React Router full-stack app: route loaders scope queries by role; mutations live in a `tickets` service module\n- Represent state transitions in a table so the workflow is data, not scattered conditionals\n- Store messages separately from tickets; derive conversation order from insertion with a stable sequence column\n- Compute response metrics from the first agent public reply and the resolution timestamp rather than storing them redundantly\n- Seed a few hundred tickets so queue and dashboard performance can be judged honestly",
    databaseNotes:
      "- `User` with `role` (CUSTOMER, AGENT); `Ticket` with `status`, `priority`, `assigneeId`, `customerId`, `dueAt`\n- `TicketMessage` with `isInternal` boolean and `sequence` per ticket for stable ordering\n- `TicketStatusEvent` capturing every transition with actor and timestamp for timeline and metrics\n- Index on `(status, dueAt)` for the overdue query and `(assigneeId, status)` for agent views\n- Partial index on unassigned open tickets speeds the queue poll",
    apiNotes:
      "- `POST /api/tickets` — customer opens a ticket\n- `GET /api/tickets` — role-scoped filtered list\n- `POST /api/tickets/:id/claim` — agent claims an unassigned ticket\n- `POST /api/tickets/:id/messages` — public reply or internal note based on body flag\n- `POST /api/tickets/:id/transition` — status change with resolution code when closing\n- `GET /api/metrics/overview` — overdue counts and response-time averages",
    testingNotes:
      "- Unit test the transition table including reopen-after-close behavior\n- Unit test first-response-time computation against event fixtures\n- Integration test role scoping: customer queries never return other customers' tickets\n- Integration test claim races so two agents cannot claim the same ticket\n- End-to-end test with Playwright: open ticket as customer, claim and resolve as agent, verify timeline",
    status: "PUBLISHED",
    categories: ["backend", "business"],
    topics: [
      "typescript",
      "nodejs",
      "sql",
      "postgresql",
      "authentication-authorization",
      "rest-apis",
    ],
    domains: ["customer-support-helpdesk", "crm"],
    resources: [
      {
        url: "https://www.prisma.io/docs",
        note: "Relational queries for tickets, messages, and status events.",
      },
      {
        url: "https://testing-library.com/docs/",
        note: "User-centric tests for the queue and conversation views.",
      },
    ],
    milestones: [
      {
        title: "Ticket and message model",
        body: "Create schema, customer submission, and role-scoped ticket lists.",
      },
      {
        title: "Agent workspace",
        body: "Build queue views, claiming, reassignment, and threaded replies.",
      },
      {
        title: "Workflow and metrics",
        body: "Enforce transitions, compute response times, and surface the overdue dashboard.",
      },
      {
        title: "Search, polish, and tests",
        body: "Add filtering and search, then cover flows with integration and end-to-end tests.",
      },
    ],
  },
  {
    slug: "kanban-task-board",
    title: "Kanban Task Board",
    difficulty: "BEGINNER",
    summary:
      "Build a drag-and-drop Kanban board with lists, cards, and optimistic UI updates. The project teaches client state management, ordering logic, and persisting board mutations efficiently.",
    scenario:
      "A small design team coordinates work in a chat channel and keeps losing track of what is in progress. The team lead wants a simple board with columns like Backlog, In Progress, and Done, where cards can be dragged between columns and reordered within them. Cards have a title, description, labels, and optional assignee. Everyone on the team should see updates without refreshing the page, and the board must stay usable when the network is slow. You are building the board as a React single-page experience backed by a lightweight Node API.",
    estimatedHours: 20,
    learningGoals:
      "- Implement drag-and-drop with keyboard-accessible alternatives\n- Manage server state in the client with optimistic updates and rollback on failure\n- Compute stable card ordering using fractional indices rather than renumbering every card\n- Design a small REST API for boards, lists, and cards\n- Test drag interactions and optimistic update logic",
    requirements:
      "- Users can create boards, add lists, and add cards to any list\n- Cards can be dragged between lists and reordered within a list\n- Card details include title, description, labels with colors, and an optional assignee\n- The UI applies drag changes immediately and rolls back if the server rejects the update\n- Deleted lists or cards disappear for other clients without a full reload\n- Board state survives reloads via the API and a database\n- All drag operations are reachable by keyboard with clear focus indicators",
    features:
      "- Board view with horizontally scrolling columns and cards showing title, labels, and assignee avatar\n- Drag-and-drop with drop indicators and smooth card reordering\n- Card detail modal for editing title, description, labels, and assignee\n- List and card creation inline on the board\n- Optimistic updates with toast notifications on failures\n- Real-time-ish refresh via polling or server-sent events on the board route",
    architectureNotes:
      "- React front end with a dedicated board state hook that wraps fetches and applies optimistic mutations\n- Ordering uses fractional indices (strings sortable between neighbors) to avoid rewriting the whole column on each move\n- Node API exposes boards, lists, and cards as nested resources; mutations validate position deltas server-side\n- Keep the drag library choice isolated behind a small adapter so tests can drive moves programmatically\n- Poll the board endpoint on a short interval or subscribe via SSE to reflect other users' changes",
    databaseNotes:
      "- `Board`, `BoardList` with `position` numeric, `Card` with `position` and nullable `assigneeId`\n- `Label` with color and a join table to cards for many-to-many labels\n- Positions stored as fractional numbers (or fixed-precision strings) with an index on `(listId, position)`\n- Uniqueness is soft: positions must be ordered, not globally unique\n- Cascade deletes from board to lists to cards",
    apiNotes:
      "- `GET /api/boards/:id` — full board with lists and cards in position order\n- `POST /api/cards` — create a card in a list\n- `PATCH /api/cards/:id` — update fields\n- `POST /api/cards/:id/move` — move to target list and position\n- `DELETE /api/cards/:id` and `DELETE /api/lists/:id`\n- `GET /api/boards/:id/events` — SSE stream of board mutations",
    testingNotes:
      "- Unit test fractional index insertion at head, tail, and between neighbors\n- Unit test optimistic reducer logic including rollback on simulated failure\n- Component tests for the card detail modal with Testing Library\n- End-to-end test drag-and-drop with Playwright's mouse and keyboard APIs, confirming persistence after reload",
    status: "PUBLISHED",
    categories: ["frontend", "fundamentals"],
    topics: [
      "javascript",
      "typescript",
      "react",
      "state-management",
      "nodejs",
      "rest-apis",
    ],
    domains: [],
    resources: [
      {
        url: "https://react.dev/",
        note: "Hooks and patterns for optimistic board state.",
      },
      {
        url: "https://testing-library.com/docs/",
        note: "Accessible, user-centric tests for board interactions.",
      },
    ],
    milestones: [
      {
        title: "Board schema and API",
        body: "Ship boards, lists, and cards with position-ordered reads.",
      },
      {
        title: "Static board UI",
        body: "Render columns and cards with create and edit interactions.",
      },
      {
        title: "Drag, drop, and optimistic updates",
        body: "Add drag interactions with immediate UI feedback and rollback on failure.",
      },
      {
        title: "Live updates and accessibility",
        body: "Add change propagation and keyboard-operable moves, then test end to end.",
      },
    ],
  },
  {
    slug: "url-shortener",
    title: "URL Shortener",
    difficulty: "BEGINNER",
    summary:
      "Build a URL shortening service that issues short codes, redirects at scale, and reports click analytics. The project focuses on hash encoding, caching, and write-heavy analytics pipelines.",
    scenario:
      "A marketing team shares links across campaigns and needs to know which URLs get clicked and from where. Existing public shorteners are blocked by their security policy, so the company wants its own service. Users submit a long URL and receive a short link like `/s/ab12cd`; visiting that link redirects to the original and records a click with referrer, country, and timestamp. The team also wants to bulk-create codes via an API and occasionally retire a link so it returns a friendly 'this link is gone' page. You are building the service with a Node API and a Postgres backend, keeping redirect latency low even under sustained traffic.",
    estimatedHours: 24,
    learningGoals:
      "- Generate collision-resistant short codes and handle collisions explicitly\n- Optimize the redirect hot path with appropriate indexes and caching\n- Design an analytics write path that does not block the redirect response\n- Implement rate limiting and input validation for public endpoints\n- Load test the redirect endpoint and reason about bottlenecks",
    requirements:
      "- Users can submit a long URL and receive a unique short code, optionally customizing the code\n- Visiting a short code issues a 302 redirect to the original URL and records a click asynchronously\n- Each click stores referrer, user agent family, approximate country, and timestamp\n- Owners can list their links with total clicks and see click details over a date range\n- Retired codes return a 410 page instead of redirecting; code reuse after retirement is blocked\n- Bulk creation endpoint accepts up to 100 URLs per request\n- Rate limit anonymous creation to a fixed number per IP per hour",
    features:
      "- Creation form and API returning the short link immediately\n- Redirect endpoint with cache-friendly headers and click recording via a background queue or deferred write\n- Owner dashboard with per-link click totals and a simple time-series chart\n- Custom code support with validation against a reserved-word list\n- Retire and restore actions for owned links\n- Bulk creation API with per-item success or failure responses",
    architectureNotes:
      "- Two paths: a minimal redirect route that reads only what it needs, and a full CRUD API for management\n- Code generation uses base62 encoding of a random or sequence-backed id; on unique-violation, retry with a new code\n- Click recording enqueues a row write (outbox table or in-process queue) so the redirect is not blocked on analytics inserts\n- Cache redirect mappings in memory with a short TTL; invalidate on retire or edit\n- Validate and normalize input URLs before storage; refuse non-http(s) schemes",
    databaseNotes:
      "- `ShortLink` with `code` unique, `targetUrl`, `ownerId` nullable, `retiredAt` nullable\n- `Click` with `shortLinkId`, `referrer`, `userAgentFamily`, `countryCode`, `createdAt`\n- Index on `ShortLink.code` (unique) for the redirect lookup\n- Partition or index `Click(shortLinkId, createdAt)` for analytics range queries\n- `OutboxEvent` table if using deferred click processing with a worker drain",
    apiNotes:
      "- `POST /api/links` — create short link, returns code\n- `POST /api/links/bulk` — create up to 100 links in one call\n- `GET /s/:code` — redirect and enqueue click record\n- `GET /api/links/:id/clicks?from=&to=` — click analytics range\n- `POST /api/links/:id/retire` — retire a code (410 thereafter)\n- `GET /api/links` — list owner's links with totals",
    testingNotes:
      "- Unit test base62 encoding and decoding round trips\n- Unit test URL validation rejecting javascript: and data: schemes\n- Integration test redirect behavior including retired-code 410 responses\n- Integration test rate limiting returns 429 after the configured threshold\n- Load test the redirect route with a simple benchmark script and record p95 latency",
    status: "PUBLISHED",
    categories: ["backend", "fundamentals"],
    topics: [
      "typescript",
      "nodejs",
      "http-and-web",
      "sql",
      "postgresql",
      "web-performance",
    ],
    domains: [],
    resources: [
      {
        url: "https://nodejs.org/docs/latest/api/",
        note: "Streams, HTTP, and timers used in the redirect and queue paths.",
      },
      {
        url: "https://www.postgresql.org/docs/",
        note: "Indexing strategies for the redirect hot path.",
      },
    ],
    milestones: [
      {
        title: "Code generation and redirect",
        body: "Implement code encoding, storage, and the working redirect endpoint.",
      },
      {
        title: "Click analytics pipeline",
        body: "Record clicks asynchronously and expose per-link totals and ranges.",
      },
      {
        title: "Management features",
        body: "Add custom codes, retire/restore, bulk creation, and rate limiting.",
      },
      {
        title: "Performance pass",
        body: "Cache mappings, benchmark redirects, and tune indexes for the hot path.",
      },
    ],
  },
  {
    slug: "payroll-run-calculator",
    title: "Payroll Run Calculator",
    difficulty: "ADVANCED",
    summary:
      "Build a payroll engine that computes gross-to-net pay with tax tables, deductions, and auditable pay runs. The advanced project centers on precise money arithmetic, retroactive adjustments, and period locking.",
    scenario:
      "A mid-size services firm runs payroll from a fragile spreadsheet every two weeks. One bad formula reference paid everyone an extra hour of overtime, and correcting it took days. The finance director wants a payroll engine where employees have contracts, pay rates, and recurring deductions; each pay period produces a locked pay run with per-employee breakdowns of gross pay, statutory withholdings, and net pay. When timesheets change after a period closes, the system records a retroactive adjustment in the next run instead of silently editing history. An auditor must be able to recompute any past run from stored inputs and get identical numbers. You are building this as an advanced TypeScript project with strict money handling and a PostgreSQL ledger.",
    estimatedHours: 60,
    learningGoals:
      "- Implement gross-to-net calculation with versioned, data-driven tax and deduction tables\n- Guarantee deterministic recomputation of historical pay runs from stored snapshots\n- Model retroactive adjustments that flow into the next open period\n- Enforce period locking so closed runs cannot be mutated\n- Build audit-friendly reporting that ties every cent to a rule version",
    requirements:
      "- Employee records hold contract type, base salary or hourly rate, tax profile, and recurring deductions\n- A pay period is opened, calculated, reviewed, and closed; closing locks all inputs and outputs for that period\n- Tax and deduction rules are versioned by effective date; a run pins the rule versions it used\n- Overtime, bonuses, and one-off payments are entered per employee before calculation\n- Retroactive corrections to closed periods generate adjustment lines in the next open period\n- Recomputing a closed run from its snapshot reproduces identical totals (golden-run test)\n- Payslips render per employee with itemized gross, taxes, deductions, and net",
    features:
      "- Employee master data with contract and tax profile management\n- Pay period wizard: open period, import timesheets, review exceptions, calculate, approve, close\n- Rule table editor for tax bands and deduction formulas with effective dates\n- Exceptions report flagging missing bank details, negative net pay, and outliers versus last run\n- Payslip generation per employee and a run summary for finance\n- Adjustment queue showing retro items flowing into the next open period",
    architectureNotes:
      "- Pure calculation core with no I/O: inputs in, itemized result out — everything else wraps this core\n- Versioned rule engine loads the tax table row matching each employee's jurisdiction and the period's effective date\n- Pay run rows store a snapshot of inputs and the exact rule version ids used, enabling deterministic replay\n- Period locking enforced in the database (status check) and re-checked in the service layer\n- Heavy recalculation runs as a background job with progress surfaced in the UI",
    databaseNotes:
      "- `Employee`, `EmploymentContract`, `TaxProfile`, `RecurringDeduction`\n- `PayPeriod` with `status` (OPEN, CALCULATED, CLOSED) and locked timestamp\n- `PayRun` and `PayslipLine` with `componentType` (GROSS, TAX, DEDUCTION, NET) and integer minor-unit amounts\n- `RuleTable` and `RuleVersion` with `effectiveFrom`, `effectiveTo`, and structured parameters JSON\n- `RetroAdjustment` linking a source closed-period correction to the target open period\n- Composite unique on `(payPeriodId, employeeId)` for payslips; index rule lookups by jurisdiction and date",
    apiNotes:
      "- `POST /api/pay-periods` — open a new pay period\n- `POST /api/pay-periods/:id/calculate` — run the engine and persist draft payslips\n- `POST /api/pay-periods/:id/close` — lock the period and finalize payslips\n- `POST /api/adjustments` — record a retroactive adjustment against a closed period\n- `GET /api/pay-periods/:id/exceptions` — validation exceptions for the period\n- `GET /api/payslips/:id` — itemized payslip for an employee",
    testingNotes:
      "- Golden-file unit tests recomputing fixture pay runs to the cent\n- Property tests asserting net pay equals gross minus withholdings for random inputs\n- Unit tests for rule version selection at effective-date boundaries\n- Integration test that closing a period rejects any later input mutation\n- Integration test retroactive adjustments appearing exactly once in the next open period",
    status: "DRAFT",
    categories: ["backend", "business"],
    topics: [
      "typescript",
      "nodejs",
      "sql",
      "postgresql",
      "data-modeling",
      "design-patterns",
    ],
    domains: ["hr-payroll"],
    resources: [
      {
        url: "https://www.prisma.io/docs",
        note: "Schema, transactions, and snapshot storage for pay runs.",
      },
      {
        url: "https://martinfowler.com/",
        note: "Essays on domain modeling and keeping calculation logic pure.",
      },
    ],
    milestones: [
      {
        title: "Employee and rule model",
        body: "Model contracts, tax profiles, and versioned rule tables with seed data.",
      },
      {
        title: "Calculation core",
        body: "Build the pure gross-to-net engine with golden-file tests.",
      },
      {
        title: "Pay period workflow",
        body: "Implement open, calculate, exceptions review, and locking close.",
      },
      {
        title: "Retro adjustments and payslips",
        body: "Add adjustment flow, payslip rendering, and auditor replay verification.",
      },
    ],
  },
  {
    slug: "payments-webhook-reconciler",
    title: "Payments Webhook Reconciler",
    difficulty: "ADVANCED",
    summary:
      "Build an inbound webhook receiver for a payment provider that verifies signatures, deduplicates events, and reconciles them against local payment records. The advanced project focuses on idempotency, at-least-once delivery, and financial data integrity.",
    scenario:
      "A marketplace integrates with a payment provider (Stripe-style) for charges, refunds, and disputes. Provider webhooks arrive at least once, sometimes minutes apart, occasionally out of order, and occasionally with stale timestamps after provider outages. The current integration writes directly from the webhook handler, so a duplicate event double-refunds a customer and an out-of-order event marks a captured payment as failed. The backend lead wants a receiver that verifies signatures, stores every event raw, and a reconciler that folds events into canonical payment state machines idempotently, with a daily sweep comparing provider-side balances to local records. You are building this in TypeScript with an append-only event store in Postgres.",
    estimatedHours: 50,
    learningGoals:
      "- Verify webhook signatures correctly, including timestamp tolerance to prevent replay attacks\n- Design an idempotent event ingestion pipeline safe under at-least-once delivery\n- Apply out-of-order events to aggregate state machines without corrupting canonical status\n- Build a reconciliation sweep that detects and reports mismatches\n- Prove idempotency with replay and concurrency tests",
    requirements:
      "- Ingest webhook posts, verify HMAC signature and timestamp window, and reject invalid ones with clear error codes\n- Persist the raw payload and headers for every accepted event before any processing\n- Deduplicate by provider event id; duplicate deliveries return success without reprocessing\n- Apply events to payment aggregates with a monotonic version check so stale events cannot regress state\n- Out-of-order events are either applied correctly or parked in a dead-letter table for review\n- A reconciliation job compares local captured/refunded totals against a provider balance endpoint and writes a mismatch report\n- An admin view lists events, processing status, applied aggregates, and dead-lettered items",
    features:
      "- Webhook endpoint with signature verification and structured rejection reasons\n- Raw event store with processing status (RECEIVED, PROCESSED, FAILED, DEAD_LETTER)\n- Payment aggregate state machine covering authorized, captured, refunded, disputed, and lost states\n- Dead-letter queue with manual retry and discard actions\n- Reconciliation dashboard showing mismatch counts and drill-down per payment\n- Re-processing tool to replay stored events against a fixed handler version",
    architectureNotes:
      "- Split ingestion from processing: the HTTP handler verifies and stores; a worker drains the inbox\n- Ingestion table is append-only with a unique index on provider event id — the uniqueness constraint is the dedup mechanism\n- Each aggregate carries a version column; applying an event uses an optimistic compare-and-swap\n- Reconciliation is a scheduled job writing into a report table, never mutating payments directly\n- Keep provider-specific payload shapes in an adapter; the core state machine only sees a normalized event",
    databaseNotes:
      "- `WebhookEvent` with `providerEventId` unique, `type`, `payload` JSON, `status`, `receivedAt`\n- `Payment` with `status`, `version`, `amountCents`, `currency`, `providerPaymentId` unique\n- `PaymentEventApplied` join recording which events moved which aggregates and the resulting version\n- `DeadLetterItem` with reason and original event FK\n- `ReconciliationReport` and `ReconciliationMismatch` rows per sweep\n- Index on `WebhookEvent(status, receivedAt)` for the worker poll",
    apiNotes:
      "- `POST /api/webhooks/payments` — signature-verified ingestion endpoint\n- `GET /api/events?status=&type=` — admin listing of stored events\n- `POST /api/events/:id/retry` — re-enqueue a failed or dead-lettered event\n- `GET /api/payments/:id/events` — applied event history for an aggregate\n- `POST /api/reconciliation/run` — trigger an on-demand reconciliation sweep\n- `GET /api/reconciliation/reports/latest` — latest sweep summary and mismatches",
    testingNotes:
      "- Unit test signature verification including expired-timestamp and tampered-body cases\n- Property test: applying any permutation of a valid event sequence yields the same final state\n- Integration test duplicate delivery of the same event id processes exactly once\n- Integration test concurrent deliveries of conflicting events, asserting version guards hold\n- End-to-end test of the admin retry flow with a simulated failing handler",
    status: "PUBLISHED",
    categories: ["backend", "architecture"],
    topics: [
      "typescript",
      "nodejs",
      "sql",
      "postgresql",
      "integration-patterns",
      "automated-testing",
    ],
    domains: ["payments", "accounting-finance"],
    resources: [
      {
        url: "https://docs.stripe.com/",
        note: "Real-world reference for webhook signing and event design.",
      },
      {
        url: "https://www.postgresql.org/docs/",
        note: "Unique constraints and JSON storage for the event inbox.",
      },
    ],
    milestones: [
      {
        title: "Verified ingestion",
        body: "Build the webhook endpoint with HMAC verification and raw event persistence.",
      },
      {
        title: "Idempotent processing worker",
        body: "Drain the inbox with deduplication and optimistic version guards on aggregates.",
      },
      {
        title: "Dead letter and admin tools",
        body: "Park failures, expose retry/discard, and surface event inspection views.",
      },
      {
        title: "Reconciliation sweep",
        body: "Implement the provider comparison job, mismatch reports, and replay tooling with tests.",
      },
    ],
  },
  {
    slug: "legacy-catalog-import",
    title: "Legacy Catalog Import Tool",
    difficulty: "INTERMEDIATE",
    summary:
      "Build a batch import tool that migrates a messy legacy product catalog into a clean relational schema with validation, dry runs, and an error report. The project teaches ETL design, streaming over large files, and safe batch writes.",
    scenario:
      "A retailer is replacing a 15-year-old PHP catalog. The legacy system exports a CSV with 200,000 rows where category names are free text, prices are inconsistently formatted, product codes sometimes duplicate, and long descriptions contain stray HTML. A consultant has been hired to write an import tool that reads the export, validates and normalizes every row, maps free-text categories to a controlled taxonomy, and loads the result into a new PostgreSQL schema — without blocking for hours or loading everything into memory. Stakeholders want a dry-run mode producing a row-by-row error report before anything is written. You are building this as a TypeScript CLI with a streaming parser and transactional batch inserts.",
    estimatedHours: 30,
    learningGoals:
      "- Stream-parse large CSV files without buffering the entire dataset in memory\n- Design a validation pipeline with per-field rules and structured error accumulation\n- Map uncontrolled legacy values onto a controlled taxonomy with an alias table\n- Perform transactional batch inserts with clear failure semantics\n- Produce actionable dry-run reports distinguishing fixable and fatal errors",
    requirements:
      "- The tool reads a CSV export and streams rows without loading the full file into memory\n- Each row is validated: required fields, price parsing, SKU format, and description length\n- Free-text category values map through an alias table; unmapped values go to a review queue\n- Duplicate SKUs within the file or against the target database are reported, with a configurable first-wins or last-wins policy\n- Dry-run mode validates and reports without writing; apply mode loads in transactional batches\n- The error report is a CSV or JSON listing row number, field, raw value, and suggested fix\n- A summary log prints counts: processed, imported, skipped, and errors by category",
    features:
      "- CLI with `validate`, `dry-run`, and `apply` subcommands and a `--batch-size` flag\n- Pluggable field validators producing typed error objects\n- Alias mapping table for categories with an admin page for adding mappings\n- Streaming CSV reader with configurable delimiter and encoding handling\n- Transactional batch apply with automatic rollback of a failed batch and continuation policy\n- Error report export and a re-import mode that retries only previously failed rows",
    architectureNotes:
      "- CLI layer parses arguments and wires commands into a shared import pipeline\n- Pipeline stages: read, normalize, validate, map taxonomy, persist — each stage a transform over a row stream\n- Keep validators pure and table-driven so new rules are data, not new branches\n- Persistence uses numbered batches in transactions; a failed batch is rolled back and logged before the policy decides continue or abort\n- The alias mapper reads mappings once at startup and caches them; new mappings require a reload",
    databaseNotes:
      "- Target `Product` table with unique `sku`, normalized `priceCents`, and cleaned `description`\n- `Category` controlled taxonomy table\n- `CategoryAlias` mapping legacy free-text values to category ids\n- `ImportRun` recording run metadata: mode, started/finished, counters, and file hash\n- `ImportError` rows with run FK, row number, field, raw value, and code for the report\n- Index on `Product.sku` (unique) and `CategoryAlias(rawValue)` for lookup during mapping",
    apiNotes:
      "- `POST /api/import/runs` — start a run (mode: DRY_RUN or APPLY) with file upload\n- `GET /api/import/runs/:id` — run summary with counters and status\n- `GET /api/import/runs/:id/errors?code=` — paginated error rows for the report\n- `POST /api/import/runs/:id/retry` — re-process only rows that errored\n- `GET /api/category-aliases` and `POST /api/category-aliases` — manage the mapping table\n- CLI equivalents call the same service functions directly without HTTP",
    testingNotes:
      "- Unit test each validator with valid, invalid, and boundary fixtures\n- Unit test category alias mapping including unmapped-value fallback\n- Integration test dry-run leaves the database untouched\n- Integration test apply mode with a poisoned batch, asserting rollback and error records\n- Test memory behavior by importing a generated large file and watching heap usage stays bounded",
    status: "ARCHIVED",
    categories: ["backend", "architecture"],
    topics: [
      "typescript",
      "nodejs",
      "sql",
      "postgresql",
      "data-modeling",
      "command-line",
    ],
    domains: [],
    resources: [
      {
        url: "https://www.prisma.io/docs",
        note: "Batch inserts and transactions for the apply stage.",
      },
      {
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        note: "Typing the row stream and structured error objects.",
      },
    ],
    milestones: [
      {
        title: "Schema and streaming reader",
        body: "Define target tables and a memory-bounded CSV reader with fixtures.",
      },
      {
        title: "Validation and mapping pipeline",
        body: "Implement field validators, normalization, and category alias mapping.",
      },
      {
        title: "Dry run and error reporting",
        body: "Ship dry-run with counters, structured errors, and exportable reports.",
      },
      {
        title: "Apply mode and recovery",
        body: "Add transactional batch apply, rollback policy, and failed-row retry.",
      },
    ],
  },
];
