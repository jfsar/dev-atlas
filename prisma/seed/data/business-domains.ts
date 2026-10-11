import type { SeedBusinessDomain } from "../types";

export const businessDomains: SeedBusinessDomain[] = [
  {
    slug: "sales-order-to-cash",
    title: "Sales / Order-to-Cash",
    status: "PUBLISHED",
    summary:
      "The end-to-end path from a customer order through fulfillment, invoicing, and collection until cash is posted against the receivable.",
    definition:
      "**Order-to-cash (O2C)** spans everything from quote acceptance to the bank statement line that clears the invoice. It ties the sales order, delivery evidence, invoice, customer payment, and general ledger entry into one auditable chain. Breakdowns anywhere in that chain surface as delayed revenue, disputed invoices, or cash nobody can reconcile.",
    developerRelevance:
      "Developers building order, billing, or ERP features are modeling O2C data: line items, pricing rules, invoice numbering, and payment application. Getting states and idempotency wrong stalls revenue and fills the support queue.",
    categories: ["business", "backend"],
    topics: [
      "business-process-modeling",
      "data-modeling",
      "sql",
      "rest-apis",
      "integration-patterns",
    ],
    resources: ["https://docs.stripe.com/", "https://www.postgresql.org/docs/"],
    projects: ["billing-invoice-generator"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "Revenue captured without re-keying",
        body: "Every accepted order becomes a delivered line, an invoice, and cash applied to the correct customer account, with no manual re-entry between sales, billing, and the ledger.",
      },
      {
        kind: "ACTOR",
        title: "Sales representative",
        body: "Creates quotes, confirms contract pricing and discounts, enters the order, and chases the customer or credit team when the order sits in approval.",
      },
      {
        kind: "ACTOR",
        title: "Billing accountant",
        body: "Reviews generated invoices, posts revenue and tax entries, applies incoming payments to open items, and clears disputes raised by customers or auditors.",
      },
      {
        kind: "ENTITY",
        title: "Sales order",
        body: "The committed record of what the customer bought: line items, quantities, agreed prices, requested delivery dates, and the customer account it belongs to.",
      },
      {
        kind: "ENTITY",
        title: "Invoice",
        body: "The dated, sequentially numbered demand for payment listing shipped lines, tax, totals, payment terms, and any credit memos applied against it.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Order capture and credit check",
        body: "First the order is entered or received from a channel and validated against catalog and contract pricing, then screened against the customer's credit limit before release to fulfillment.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Fulfillment and invoicing",
        body: "Next, fulfilled lines are confirmed as shipped or delivered, then invoiced with terms, tax, and numbering applied so the receivable posts to the ledger.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Cash application and reconciliation",
        body: "Finally, payment remittances are matched to open invoices, unmatched amounts are held as unapplied cash or customer credits, and the bank statement is reconciled to the ledger.",
      },
      {
        kind: "STATE",
        title: "Invoice lifecycle",
        body: "An invoice moves through draft, issued, partially paid, paid, and voided, with the overdue flag derived from the due date rather than the issue date.",
      },
      {
        kind: "RULE",
        title: "Credit limit enforcement",
        body: "An order that would push a customer's outstanding balance past their approved credit limit is held until a credit manager approves it or open items are paid down.",
      },
      {
        kind: "CONTROL",
        title: "Segregation of duties on adjustments",
        body: "The user who can edit a customer's pricing and payment terms cannot also write off a balance, and credit notes above a threshold require a second approver.",
      },
      {
        kind: "KPI",
        title: "Days sales outstanding",
        body: "The average number of days between invoice issue date and cash receipt, tracked per customer segment and per billing run.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Idempotent invoicing and numbering",
        body: "Invoice number generation, shipment postings, and payment callbacks must be idempotent so a retry never duplicates a receivable or applies the same cash twice.",
      },
    ],
  },
  {
    slug: "procurement-procure-to-pay",
    title: "Procurement / Procure-to-Pay",
    status: "PUBLISHED",
    summary:
      "The purchasing cycle from requisition and supplier selection through purchase orders, goods receipt, invoice matching, and payment.",
    definition:
      "**Procure-to-pay (P2P)** connects internal demand to the cash that leaves the company: a requisition becomes a purchase order, the supplier's delivery becomes a goods receipt, and the supplier's invoice becomes a scheduled payment. Three-way matching between purchase order, receipt, and invoice is the core control that catches price and quantity discrepancies before money moves. The domain also governs vendor master data, approval thresholds, and spend visibility.",
    developerRelevance:
      "Purchasing systems are workflow and matching problems — the same issues developers face in any approval-heavy backend, plus document integrity that must survive partial deliveries and amendments. Modeling mistakes here cause duplicate or incorrect payments.",
    categories: ["business", "backend"],
    topics: [
      "business-process-modeling",
      "data-modeling",
      "sql",
      "rest-apis",
      "requirements-gathering",
    ],
    resources: [
      "https://www.prisma.io/docs",
      "https://www.postgresql.org/docs/",
    ],
    projects: ["inventory-purchase-order-tracker"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "Spend under control",
        body: "Every purchase is authorized before commitment, matched to what was actually received, and paid once at the agreed price within the agreed terms.",
      },
      {
        kind: "ACTOR",
        title: "Requesting employee",
        body: "Raises a requisition describing what is needed, justifies it against a budget line, and follows up when approval stalls.",
      },
      {
        kind: "ACTOR",
        title: "Accounts payable clerk",
        body: "Receives supplier invoices, performs three-way matching, resolves price and quantity variances with the requester, and releases approved invoices into payment runs.",
      },
      {
        kind: "ENTITY",
        title: "Purchase order",
        body: "The binding document sent to a supplier: vendor, ship-to location, line items, unit prices, delivery dates, and the budget or contract it draws from.",
      },
      {
        kind: "ENTITY",
        title: "Goods receipt",
        body: "The record confirming what physically arrived, including quantities accepted, rejected, or short-shipped, referenced line by line back to the purchase order.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Requisition and approval routing",
        body: "First a requisition is validated for budget and category, then routed through approvers whose set depends on amount, cost center, and whether the spend is contracted.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Three-way matching",
        body: "Then the supplier invoice is compared line by line against the purchase order and goods receipt, and tolerance rules decide whether it auto-posts, routes for review, or is rejected.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Payment run",
        body: "Finally, approved invoices are grouped by due date and payment method, debited from the bank account, and a remittance advice is sent back to the supplier.",
      },
      {
        kind: "STATE",
        title: "Purchase order status",
        body: "A purchase order progresses from draft to approved, partially received, fully received, closed, or cancelled, and a closed order rejects further receipts.",
      },
      {
        kind: "RULE",
        title: "Approval threshold matrix",
        body: "The approver set and required documentation escalate with total amount, cost center, and contract status, and an approver cannot approve their own request.",
      },
      {
        kind: "CONTROL",
        title: "Duplicate invoice detection",
        body: "An invoice matching an existing vendor, invoice number, and amount combination is blocked before posting so the same bill can never be paid twice.",
      },
      {
        kind: "KPI",
        title: "Straight-through match rate",
        body: "The percentage of supplier invoices that pass three-way matching without manual intervention, measured monthly and broken down by supplier.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Partial receipt and tolerance modeling",
        body: "The data model must support partial receipts, split lines, currency rounding, and configurable tolerance bands while preserving the audit trail back to the original purchase order.",
      },
    ],
  },
  {
    slug: "inventory-management",
    title: "Inventory Management",
    status: "PUBLISHED",
    summary:
      "Tracking stock levels, locations, and movements so the right quantity is available where and when it is needed.",
    definition:
      "**Inventory management** maintains the perpetual record of what the business holds: on-hand quantities by location, reserved and available buckets, receipts, issues, transfers, and adjustments. That record must reconcile continuously with physical counts and with the valuation finance posts to the balance sheet. The hard part is concurrency — many transactions touching the same SKU at once, each of which must leave an auditable movement.",
    developerRelevance:
      "Stock numbers drive checkout, purchasing, and accounting at the same time, so developers must model reservations, movements, and idempotent adjustments correctly. Race conditions here turn directly into oversells and write-offs.",
    categories: ["business", "backend"],
    topics: [
      "data-modeling",
      "sql",
      "system-design",
      "business-process-modeling",
      "automated-testing",
    ],
    resources: [
      "https://www.postgresql.org/docs/",
      "https://www.prisma.io/docs",
    ],
    projects: ["inventory-purchase-order-tracker"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "One trustworthy stock number",
        body: "Maintain an accurate, auditable quantity for every SKU and location so sales, purchasing, and finance all act on the same figure.",
      },
      {
        kind: "ACTOR",
        title: "Warehouse operator",
        body: "Scans goods in and out, executes assigned cycle counts, and reports discrepancies between the system quantity and what is physically on the shelf.",
      },
      {
        kind: "ACTOR",
        title: "Inventory planner",
        body: "Sets reorder points and safety stock, reviews slow-moving and obsolete stock, and decides when to transfer quantity between locations.",
      },
      {
        kind: "ENTITY",
        title: "Stock level",
        body: "The per SKU and per location breakdown into on-hand, reserved, quarantined, and available quantities, stamped with the timestamp of the last movement.",
      },
      {
        kind: "ENTITY",
        title: "Stock movement",
        body: "An immutable line recording every receipt, issue, transfer, or adjustment: quantity, direction, referencing document, user, and timestamp.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Receiving and putaway",
        body: "First deliveries are checked against the purchase order or advance shipping notice, counted into the system, and assigned a bin location before the quantity becomes available to sell.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Reservation and allocation",
        body: "Then demand from customer orders reserves available stock, either at order time or at pick time, and reservations that are not fulfilled within their window are released.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Cycle counting and adjustment",
        body: "Finally a rotating subset of SKUs is counted, variances are investigated against recent movements, and adjustments are posted with a reason code that updates both quantity and value.",
      },
      {
        kind: "STATE",
        title: "Stock availability states",
        body: "Units move between available, reserved, in transit, quarantined, and written off, and every transition must point at the document that caused it.",
      },
      {
        kind: "RULE",
        title: "No negative on-hand",
        body: "An issue or sale that would drive on-hand below zero is blocked or backordered instead of silently overselling the location.",
      },
      {
        kind: "CONTROL",
        title: "Dual approval for write-offs",
        body: "Adjustments above a value threshold require a second approver and a recorded reason code before the quantity and ledger impact are committed.",
      },
      {
        kind: "KPI",
        title: "Inventory record accuracy",
        body: "The percentage of counted SKU and location pairs where the system quantity matches the physical count, reported by warehouse and product category.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Concurrency-safe stock updates",
        body: "Quantity changes need atomic conditional updates or row locks, plus idempotency keys on movement references so retried events never double-post.",
      },
    ],
  },
  {
    slug: "accounting-finance",
    title: "Accounting / Finance",
    status: "PUBLISHED",
    summary:
      "Recording transactions in ledgers, closing periods, and producing the financial statements the business is run on.",
    definition:
      "**Accounting and finance** in a product context means the double-entry ledger: every business event posts balanced debits and credits to accounts, periods are closed, and the balance sheet, income statement, and cash flow statement are derived from that record. Controls such as journal approval, period locks, and audit trails exist because the ledger is the company's authoritative history. Software that touches money has to preserve that integrity under retries, corrections, and back-dated entries.",
    developerRelevance:
      "Anyone building features that create or change financial records — invoices, refunds, payouts, expenses — is writing to the ledger. Balanced entries, effective dates, and immutable history are engineering requirements, not just accounting policy.",
    categories: ["business", "backend"],
    topics: [
      "data-modeling",
      "sql",
      "business-process-modeling",
      "automated-testing",
      "requirements-gathering",
    ],
    resources: [
      "https://www.postgresql.org/docs/",
      "https://www.prisma.io/docs",
    ],
    projects: ["billing-invoice-generator", "expense-approval-workflow"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "Trustworthy books",
        body: "Produce financial statements that are complete, balanced, period-correct, and traceable back to the source document for every posted amount.",
      },
      {
        kind: "ACTOR",
        title: "Staff accountant",
        body: "Posts and reviews journal entries, runs account reconciliations, and prepares account analyses ahead of the period close.",
      },
      {
        kind: "ACTOR",
        title: "Controller",
        body: "Approves material journal entries, enforces period locks, and signs off that the statements reflect the ledger as of the close date.",
      },
      {
        kind: "ENTITY",
        title: "Journal entry",
        body: "A dated, numbered set of debit and credit lines that sum to zero, each coded to an account, cost center, and source document reference.",
      },
      {
        kind: "ENTITY",
        title: "Chart of accounts",
        body: "The structured list of accounts with type, normal balance, and reporting hierarchy that every posting is classified against.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Transaction capture and classification",
        body: "First source events such as invoices, payments, payroll, and expenses are mapped to accounts and posted as balanced entries with the original document attached.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Period close",
        body: "Then accruals and deferrals are recorded, subledgers are tied out to control accounts, and the period is locked against further postings.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Financial reporting",
        body: "Finally trial balance figures are aggregated through the account hierarchy into the income statement, balance sheet, and cash flow statement.",
      },
      {
        kind: "STATE",
        title: "Journal entry status",
        body: "Entries move from draft to submitted, approved, posted, and reversed, with a reversal creating a new offsetting entry rather than mutating the posted one.",
      },
      {
        kind: "RULE",
        title: "Immutable closed periods",
        body: "Once a period is closed no entry may post into it; corrections go into the current open period with a reference to the original entry.",
      },
      {
        kind: "CONTROL",
        title: "Maker-checker on journals",
        body: "The user who creates a journal entry cannot approve it, and approval authority escalates with the entry value and the accounts affected.",
      },
      {
        kind: "KPI",
        title: "Close cycle time",
        body: "The number of business days from period end to a signed-off set of statements, tracked alongside the count of post-close adjustments.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Append-only financial history",
        body: "Posted amounts need an append-only audit trail, separate effective and posting dates, and decimal arithmetic so rounding drift can never break the balance.",
      },
    ],
  },
  {
    slug: "payments",
    title: "Payments",
    status: "PUBLISHED",
    summary:
      "Authorizing, capturing, and settling money movement across card networks, bank rails, and stored payment methods.",
    definition:
      "**Payments** is the layer that moves money between a payer and the business — card transactions, bank transfers, wallets, and payout rails. It is defined by external state machines: a charge can be authorized, captured, failed, refunded, or disputed, and those transitions often arrive out of order through provider webhooks. Correctness depends on idempotency, strong authentication, and an accurate record of fees, chargebacks, and exchange rates.",
    developerRelevance:
      "Payment code fails loudly and expensively: double charges, missed refunds, and unreconciled settlements are all integration bugs. Developers must treat provider callbacks as untrusted, retried, and out-of-order input rather than a reliable event stream.",
    categories: ["business", "backend", "architecture"],
    topics: [
      "rest-apis",
      "authentication-authorization",
      "integration-patterns",
      "sql",
      "monitoring-observability",
    ],
    resources: [
      "https://docs.stripe.com/",
      "https://owasp.org/www-project-top-ten/",
      "https://github.com/donnemartin/system-design-primer",
    ],
    projects: ["payments-webhook-reconciler"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "Money moved exactly once",
        body: "Accept, settle, and record every payment correctly with no duplicates and no lost transactions, keeping internal balances in step with the processor's ledger.",
      },
      {
        kind: "ACTOR",
        title: "Payer",
        body: "Enters or selects a payment method, completes authentication when the issuer requires it, and receives either a receipt or a clear decline reason.",
      },
      {
        kind: "ACTOR",
        title: "Payments operations analyst",
        body: "Investigates failed and disputed transactions, reconciles settlement reports against internal records, and triggers refunds or retries within policy.",
      },
      {
        kind: "ENTITY",
        title: "Payment",
        body: "The internal record of an attempted charge: amount, currency, method, status, provider reference, and the order or invoice it is meant to settle.",
      },
      {
        kind: "ENTITY",
        title: "Settlement batch",
        body: "The processor's group of captured transactions paid out on a schedule, listing gross amount, fees, refunds, chargebacks, and the net bank deposit.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Authorization and authentication",
        body: "First card or bank details are tokenized rather than stored, the payer's bank approves or declines the hold, and strong customer authentication is invoked when risk rules require it.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Capture and confirmation",
        body: "Then an authorized charge is captured fully or partially after fulfillment, producing a provider event that must be applied to the payment exactly once.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Reconciliation",
        body: "Finally provider settlement files and webhooks are matched against internal payments, fees and chargebacks are posted, and variances are investigated to closure.",
      },
      {
        kind: "STATE",
        title: "Payment status",
        body: "A payment moves through requires action, processing, succeeded, failed, and refunded, and each transition must come from a provider-confirmed event.",
      },
      {
        kind: "RULE",
        title: "Amount invariance",
        body: "The amount captured never exceeds the amount authorized, and cumulative refunds are capped at the captured total net of prior refunds.",
      },
      {
        kind: "CONTROL",
        title: "Webhook signature verification",
        body: "Callbacks are rejected unless their signature and timestamp validate, and replays inside the tolerance window are deduplicated before any business logic runs.",
      },
      {
        kind: "KPI",
        title: "Authorization success rate",
        body: "The percentage of attempted charges approved on the first try, broken down by card type, region, and decline code.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Idempotent out-of-order event processing",
        body: "Provider events arrive late and more than once, so handlers need idempotency keys, a durable event journal, and a periodic reconciliation job as the safety net.",
      },
    ],
  },
  {
    slug: "crm",
    title: "CRM",
    status: "PUBLISHED",
    summary:
      "Managing the customer relationship lifecycle through accounts, contacts, opportunities, and the activity history around them.",
    definition:
      "**Customer relationship management (CRM)** is the system of record for who the company sells to: accounts, contacts, opportunities with stages and probabilities, and the calls, emails, and meetings linked to them. It feeds forecasting, quoting, and support by keeping a shared, permissioned view of every relationship. Its most common failures are data failures — duplicates, stale ownership, and opportunities that never reach a closed state.",
    developerRelevance:
      "A CRM is a large relational modeling exercise with hierarchies, many-to-many links, activity timelines, and role-based visibility. Developers also inherit the workflow automation and integration surface that sales and marketing teams expect to extend.",
    categories: ["business", "backend"],
    topics: [
      "data-modeling",
      "sql",
      "rest-apis",
      "business-process-modeling",
      "requirements-gathering",
    ],
    resources: [
      "https://www.prisma.io/docs",
      "https://www.postgresql.org/docs/",
    ],
    projects: ["support-ticketing-system"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "One shared view of the customer",
        body: "Keep every account, contact, and open opportunity accurate and current so sales, support, and finance act on the same relationship data.",
      },
      {
        kind: "ACTOR",
        title: "Account executive",
        body: "Owns the pipeline records, logs activity against contacts, and advances opportunities through stages with a documented next step and close date.",
      },
      {
        kind: "ACTOR",
        title: "Sales manager",
        body: "Reviews pipeline coverage, inspects stalled deals, and approves discounts or non-standard terms before they are offered to the customer.",
      },
      {
        kind: "ENTITY",
        title: "Account",
        body: "The company or organization record with industry, owner, parent account, and the linked contacts, opportunities, and support cases that hang off it.",
      },
      {
        kind: "ENTITY",
        title: "Opportunity",
        body: "A tracked deal with stage, expected close date, estimated value, associated products, and the timestamped history of every stage change.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Lead qualification",
        body: "First inbound interest is scored against fit and intent criteria, deduplicated against existing records, and either disqualified with a reason or assigned an owner.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Stage progression",
        body: "Then the opportunity moves through defined stages with explicit exit criteria, and each transition is timestamped so forecast rollups stay honest.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Handoff to fulfillment",
        body: "Finally a won opportunity transfers account context, contracted scope, and contacts into onboarding or billing so nothing has to be re-keyed by the delivery team.",
      },
      {
        kind: "STATE",
        title: "Opportunity stage",
        body: "Stages run from discovery through proposal and negotiation to won or lost, and a lost reason must be captured before the record can be closed.",
      },
      {
        kind: "RULE",
        title: "One open opportunity per buying group",
        body: "Two opportunities cannot sit open against the same account for the same product line without a manager-approved merge or an explicit split.",
      },
      {
        kind: "CONTROL",
        title: "Field access and change audit",
        body: "Only the record owner and their managers can edit core fields, and every change to stage, amount, or close date is logged with actor and timestamp.",
      },
      {
        kind: "KPI",
        title: "Pipeline coverage ratio",
        body: "Weighted open pipeline divided by the period's quota, calculated per team and refreshed as opportunities change stage or close date.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Deduplication and relationship integrity",
        body: "Matching rules on company domain, name, and external identifiers must prevent duplicates, while soft deletes and an activity log preserve history for reporting.",
      },
    ],
  },
  {
    slug: "customer-support-helpdesk",
    title: "Customer Support / Helpdesk",
    status: "PUBLISHED",
    summary:
      "Receiving, routing, and resolving customer issues through tickets governed by SLAs, escalation, and a permanent activity trail.",
    definition:
      "**Customer support** operates the ticket: issues arrive from email, chat, or the portal, get classified and assigned, move through states governed by service level agreements, and close with a resolution recorded for later reference. Escalation paths, priority rules, and customer entitlement checks decide who works what and how fast. The accumulated ticket corpus is what later powers self-service content and product feedback.",
    developerRelevance:
      "A helpdesk is a workflow engine with timers — assignment, SLA clocks, escalation, and merge or split operations on records the customer can see. Developers must handle concurrent agents, notification fan-out, and a timeline that is auditable end to end.",
    categories: ["business", "backend"],
    topics: [
      "business-process-modeling",
      "data-modeling",
      "rest-apis",
      "sql",
      "requirements-gathering",
    ],
    resources: [
      "https://www.prisma.io/docs",
      "https://www.postgresql.org/docs/",
    ],
    projects: ["support-ticketing-system"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "Issues resolved within commitment",
        body: "Every customer-reported problem is acknowledged, routed to the right owner, resolved inside its SLA, and closed with a documented outcome.",
      },
      {
        kind: "ACTOR",
        title: "Support agent",
        body: "Works the queue, requests missing details from the requester, applies known fixes or workarounds, and records the resolution for future reference.",
      },
      {
        kind: "ACTOR",
        title: "Escalation engineer",
        body: "Takes tickets that exceed agent scope or are about to breach SLA, investigates the underlying defect, and coordinates the fix with the product team.",
      },
      {
        kind: "ENTITY",
        title: "Ticket",
        body: "The customer-visible case record: requester, channel, subject and message thread, priority, assignee, linked customer, and the full activity log.",
      },
      {
        kind: "ENTITY",
        title: "Service level agreement",
        body: "The response and resolution targets attached to a support plan, including business-hours calendars, priority multipliers, and pause conditions.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Intake and triage",
        body: "First incoming issues are deduplicated, classified by category and severity, matched to a customer entitlement, and queued for the correct team.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Investigation and resolution",
        body: "Then the agent reproduces or diagnoses the issue, keeps the requester informed, applies the fix or workaround, and posts resolution notes to the ticket.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Escalation and closure",
        body: "Finally blocked or breaching tickets escalate by rule, and a resolved ticket is verified with the requester before it moves to closed.",
      },
      {
        kind: "STATE",
        title: "Ticket status",
        body: "A ticket moves through open, pending customer, in progress, escalated, resolved, and closed, with the SLA clock paused while it waits on the customer.",
      },
      {
        kind: "RULE",
        title: "Priority-driven SLA targets",
        body: "Response and resolution targets are derived from priority and the customer's plan, and lowering a priority requires a recorded justification.",
      },
      {
        kind: "CONTROL",
        title: "Immutable conversation history",
        body: "Agent and customer messages are append-only in the ticket timeline, internal notes are flagged as never customer-visible, and every state change is attributable to a user.",
      },
      {
        kind: "KPI",
        title: "SLA attainment and first response",
        body: "Median first response time, percentage of tickets resolved within SLA, and reopened rate, segmented by channel, priority, and support plan.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "SLA timers and notification fan-out",
        body: "SLA clocks require scheduled jobs that understand business-hours calendars, and assignment changes must fan out notifications idempotently so alerts are never duplicated.",
      },
    ],
  },
  {
    slug: "hr-payroll",
    title: "HR / Payroll",
    status: "PUBLISHED",
    summary:
      "Managing employee records, compensation, and time, then calculating and disbursing pay with statutory deductions.",
    definition:
      "**HR and payroll** covers the employee lifecycle — hire, change, leave, terminate — and the payroll run that turns time and salary data into gross pay, deductions, taxes, and net pay. Each pay period produces a payslip, a ledger posting, and statutory filings that must agree with reported figures exactly. Mid-period joins, retroactive changes, and leave balances make the calculation deeply stateful.",
    developerRelevance:
      "Payroll is a deterministic-calculation domain where rounding, effective dating, and retroactive adjustments are the hard parts. Developers must model entitlements precisely and audit every input, because a payslip is a legal document the employee can contest.",
    categories: ["business", "backend"],
    topics: [
      "data-modeling",
      "business-process-modeling",
      "sql",
      "automated-testing",
      "requirements-gathering",
    ],
    resources: [
      "https://www.postgresql.org/docs/",
      "https://owasp.org/www-project-top-ten/",
    ],
    projects: ["expense-approval-workflow"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "Everyone paid correctly and on time",
        body: "Calculate gross-to-net pay accurately for every employee each period, remit withholdings on schedule, and produce records that survive audit and employee queries.",
      },
      {
        kind: "ACTOR",
        title: "Payroll officer",
        body: "Runs the payroll cycle, validates time and variable inputs, approves exceptions, and resolves variances against the prior period before the payment deadline.",
      },
      {
        kind: "ACTOR",
        title: "Employee",
        body: "Maintains personal and banking details, submits time and leave requests, and reviews payslips for accuracy after each run.",
      },
      {
        kind: "ENTITY",
        title: "Employee record",
        body: "Identity, role, cost center, employment type, compensation elements, and the effective-dated changes that payroll calculations consume.",
      },
      {
        kind: "ENTITY",
        title: "Payroll run",
        body: "One period's calculation: input totals, earnings and deductions per employee, net pay, status, and the bank file and ledger entries it produced.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Input collection and approval",
        body: "First timesheets, commissions, leave taken, and one-off adjustments are submitted, approved by managers, and locked as the inputs for the period.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Gross-to-net calculation",
        body: "Then earnings are computed from base pay and approved inputs, and taxes, pension, and other deductions are applied by jurisdiction rules to yield net pay.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Disbursement and posting",
        body: "Finally the net total is paid via bank file, payslips are issued, and payroll cost and liability accounts are posted to the general ledger.",
      },
      {
        kind: "STATE",
        title: "Payroll run status",
        body: "A run moves from open to calculated, reviewed, locked, paid, and posted, and reopening it after lock requires documented approval.",
      },
      {
        kind: "RULE",
        title: "Effective-dated retroactive changes",
        body: "A salary or tax-table change entered after the fact recalculates every affected prior period and shows the correction as a separate line on the next payslip.",
      },
      {
        kind: "CONTROL",
        title: "Maker-checker on the pay run",
        body: "The user who prepares the payroll cannot release the payment file; a second approver signs off against headcount and net totals before the bank upload.",
      },
      {
        kind: "KPI",
        title: "Payroll accuracy rate",
        body: "The percentage of payslips issued without a correction in the following period, tracked together with the on-time payment rate for the cycle.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Reproducible calculations with audit",
        body: "Each run must persist its inputs and ruleset version so any amount can be recomputed exactly, with an audit log on every retroactive adjustment.",
      },
    ],
  },
  {
    slug: "reporting-bi",
    title: "Reporting / BI",
    status: "PUBLISHED",
    summary:
      "Turning operational data into governed metrics, reports, and dashboards that decision-makers can rely on.",
    definition:
      "**Reporting and business intelligence** extracts data from operational systems, transforms it into consistent metrics, and delivers dashboards, scheduled reports, and ad-hoc analysis. The central discipline is semantic consistency: one definition of revenue or active customer that every chart shares. Governance concerns — access control, refresh freshness, and query performance — decide whether anyone trusts the numbers enough to act on them.",
    developerRelevance:
      "Developers build the pipelines, aggregation queries, and permission models behind every dashboard, and they inherit the incident when two reports disagree. Understanding metric definitions, incremental loads, and slow-query behavior is essential.",
    categories: ["business", "backend", "architecture"],
    topics: [
      "sql",
      "postgresql",
      "reporting-analytics",
      "data-modeling",
      "system-design",
    ],
    resources: [
      "https://www.postgresql.org/docs/",
      "https://github.com/donnemartin/system-design-primer",
    ],
    projects: ["kanban-task-board"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "Consistent, trusted metrics",
        body: "Deliver the same governed numbers to every report and dashboard, refreshed on a known schedule, without analysts hand-building conflicting versions of a measure.",
      },
      {
        kind: "ACTOR",
        title: "Data analyst",
        body: "Builds and validates reports, investigates metric anomalies against source data, and documents definitions and caveats for consumers.",
      },
      {
        kind: "ACTOR",
        title: "Business stakeholder",
        body: "Consumes dashboards and scheduled reports to make staffing, pricing, and investment decisions, and raises data-quality issues when a number looks wrong.",
      },
      {
        kind: "ENTITY",
        title: "Metric definition",
        body: "The governed specification of a measure: source fields, filters, grain, and calculation logic, stored so multiple reports can share exactly one definition.",
      },
      {
        kind: "ENTITY",
        title: "Report",
        body: "A parameterized presentation of metrics — table, chart, or dashboard tile — with its default filters, refresh schedule, and recipient list.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Extraction and transformation",
        body: "First source tables are extracted on a schedule, cleansed, and joined into conformed dimensions and fact tables at a defined grain.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Aggregation and publication",
        body: "Then metrics are pre-aggregated at the common grains, indexed, and published to the semantic layer that every report queries against.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Consumption and review",
        body: "Finally stakeholders explore and schedule reports while dataset owners review freshness and variance alerts at the start of each reporting cycle.",
      },
      {
        kind: "STATE",
        title: "Dataset freshness",
        body: "Each dataset is reported as fresh, delayed, stale, or failed as of its last successful load, and that status is visible to everyone looking at a report.",
      },
      {
        kind: "RULE",
        title: "One definition per metric",
        body: "A metric name resolves to exactly one governed definition; alternative calculations get distinct names rather than silent per-report variants.",
      },
      {
        kind: "CONTROL",
        title: "Row-level access control",
        body: "Report and dataset access follows role and organizational scope so regional or sensitive figures are only visible to entitled users, including in exports.",
      },
      {
        kind: "KPI",
        title: "Report freshness and query latency",
        body: "The percentage of scheduled refreshes completing inside their window, together with the ninety-fifth percentile load time for dashboard queries.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Incremental loads and read scaling",
        body: "Pipelines need idempotent incremental loads and backfill-safe reruns, while dashboards need pre-aggregated tables, indexes, and read replicas to stay responsive.",
      },
    ],
  },
  {
    slug: "supply-chain",
    title: "Supply Chain",
    status: "DRAFT",
    summary:
      "Coordinating sourcing, production, logistics, and distribution so products move from suppliers to customers at the right cost.",
    definition:
      "**Supply chain management** plans and executes the flow of materials and finished goods across suppliers, plants, warehouses, and channels — covering demand forecasting, sourcing, production scheduling, transportation, and distribution. It constantly balances competing costs: inventory against stockouts, expedited freight against late deliveries. Multi-tier visibility and fast exception handling are what separate a resilient chain from a fragile one.",
    developerRelevance:
      "Supply chain software is event-heavy integration work — EDI messages, tracking feeds, and forecast updates arriving continuously — layered on scheduling and optimization logic. Developers must handle partial information, long-running state, and compensating actions when a plan changes mid-execution.",
    categories: ["business", "architecture"],
    topics: [
      "integration-patterns",
      "system-design",
      "data-modeling",
      "business-process-modeling",
      "monitoring-observability",
    ],
    resources: [
      "https://github.com/donnemartin/system-design-primer",
      "https://12factor.net/",
      "https://martinfowler.com/",
    ],
    projects: ["inventory-purchase-order-tracker"],
    points: [
      {
        kind: "OBJECTIVE",
        title: "Right product, right place, right time",
        body: "Plan and execute the flow of materials and finished goods so customer demand is met at the lowest feasible total cost of inventory, production, and transport.",
      },
      {
        kind: "ACTOR",
        title: "Demand planner",
        body: "Maintains the forecast from history, promotions, and market signals, and reviews forecast error with sales and operations each cycle.",
      },
      {
        kind: "ACTOR",
        title: "Logistics coordinator",
        body: "Books capacity with carriers, tracks shipments in transit, and resolves delays, damaged loads, and customs holds before they become missed delivery dates.",
      },
      {
        kind: "ENTITY",
        title: "Shipment",
        body: "A consignment with origin, destination, carrier, service level, line contents, checkpoint events, and the freight cost it accrues.",
      },
      {
        kind: "ENTITY",
        title: "Bill of materials",
        body: "The multi-level list of components and quantities required to build a finished good, including scrap factors, approved substitutions, and lead times.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Demand and supply planning",
        body: "First the forecast is consensus-locked, compared against capacity and inventory, and converted into production and replenishment plans with dated commitments.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Execution and transportation",
        body: "Then orders are released, loads are planned and booked, goods move through checkpoints, and proof of delivery closes the shipment.",
      },
      {
        kind: "PROCESS_STEP",
        title: "Exception management",
        body: "Finally deviations such as late inbound, quality holds, or stockout risk are detected against plan, prioritized, and resolved with a recorded corrective action.",
      },
      {
        kind: "STATE",
        title: "Order fulfilment status",
        body: "A customer order moves from planned to allocated, picked, shipped, in transit, delivered, and closed, and each state gates the ones that follow it.",
      },
      {
        kind: "RULE",
        title: "Safety stock and lead-time constraints",
        body: "Replenishment is triggered so projected stock never falls below safety stock given supplier lead time and demand variability.",
      },
      {
        kind: "CONTROL",
        title: "Chain-of-custody verification",
        body: "Every handoff is evidenced by a signed or scanned document, and restricted or high-value goods require identity verification at each transfer of custody.",
      },
      {
        kind: "KPI",
        title: "Perfect order rate",
        body: "The percentage of orders delivered complete, on time, undamaged, and with accurate documentation, measured over a rolling window by lane and carrier.",
      },
      {
        kind: "SOFTWARE_IMPLICATION",
        title: "Event-driven integration under partial failure",
        body: "Partner systems send tracking and inventory events in inconsistent formats and intervals, so ingestion needs durable queues, schema validation, and replayable dead-letter handling.",
      },
    ],
  },
];
