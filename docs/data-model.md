# Data model

Three entities: Client, Invoice and Expense. Invoice status is partly stored (Paid / Unpaid) and partly derived (Pending / Overdue), so it never drifts out of date.

## Client

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string (UUID) | Yes | Generated |
| name | string | Yes | Unique, case-insensitive |
| email | string | No | Valid email format |
| createdAt | datetime | Yes | Generated |

## Invoice

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string (UUID) | Yes | Generated |
| invoiceNumber | string | Yes | Unique, e.g. INV-024 |
| clientId | string | Yes | References Client |
| amount | integer (cents) | Yes | > 0 |
| issueDate | date | Yes | |
| dueDate | date | Yes | ≥ issueDate |
| paidDate | date | No | Required when status is Paid; ≥ issueDate |
| status | enum | Yes | Stored: `paid`, `unpaid` |
| description | string | No | Max 200 characters |
| source | enum | Yes | `manual`, `import`, `sample` |

## Expense

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string (UUID) | Yes | Generated |
| date | date | Yes | |
| amount | integer (cents) | Yes | > 0 |
| category | enum | Yes | Software, Equipment, Office, Travel, Marketing, Education, Fees, Other |
| description | string | No | Max 200 characters |
| source | enum | Yes | `manual`, `import`, `sample` |

## Settings

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| currency | enum | `USD` | `USD`, `EUR`, `BAM`; formatting only |

## CSV import formats

Invoices:

```csv
invoice_number,client,amount,issue_date,due_date,paid_date,description
INV-001,Northwind Studio,1200.00,2026-04-02,2026-04-16,2026-04-14,Brand refresh phase 1
INV-002,Lumen Coffee,850.00,2026-04-10,2026-04-24,,Menu design
```

Expenses:

```csv
date,amount,category,description
2026-04-01,54.99,Software,Figma subscription
2026-04-08,320.00,Equipment,Drawing tablet
```

- Accepted date formats: YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY, MM/DD/YYYY. The user confirms the format during column matching; the app suggests one from the first rows.
- Decimal separator: dot or comma, confirmed by the user.
- Duplicates are skipped and reported: invoices by invoice number; expenses by identical date, amount and description.
- Clients named in an invoice import are created if they don't exist.
- Limits: .csv only, up to 5 MB and 5,000 rows.
