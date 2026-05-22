# KoinX Transaction Reconciliation Engine

> A production-style backend service that reconciles crypto transactions between user-imported data and exchange-exported data — built with Node.js, TypeScript, Express, and MongoDB.

---

## Features

- CSV ingestion for user and exchange transactions
- MongoDB persistence layer
- Structured ingestion validation with warnings/errors
- Asset normalization (`BTC` ↔ `Bitcoin`)
- Transaction type normalization (`TRANSFER_IN` ↔ `TRANSFER_OUT`)
- Configurable reconciliation tolerances
- Tolerance-based transaction matching
- Match confidence scoring
- Conflict detection
- Reconciliation report generation
- Downloadable CSV reconciliation reports
- REST APIs for reports and summaries

---

## Tech Stack

| Layer              | Technology               |
|--------------------|--------------------------|
| Runtime            | Node.js                  |
| Language           | TypeScript               |
| Framework          | Express.js               |
| Database           | MongoDB + Mongoose        |
| CSV Parsing        | fast-csv                 |
| CSV Export         | @fast-csv/format         |
| Precision Arithmetic | decimal.js             |
| File Uploads       | multer                   |

---

## Project Structure

```
src/
│
├── config/
├── constants/
├── controllers/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
├── middleware/
└── server.ts
```

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd koinx-reconciliation-engine
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/koinx-reconciliation
TIMESTAMP_TOLERANCE_SECONDS=300
QUANTITY_TOLERANCE_PCT=0.01
```

### 4. Start MongoDB

Using Docker:

```bash
docker run -d \
  --name koinx-mongo \
  -p 27017:27017 \
  mongo:7
```

### 5. Run Development Server

```bash
npm run dev
```

---

## API Endpoints

### `POST /reconcile`

Triggers reconciliation between uploaded CSV files.

**Request** — Multipart form-data:

| Key                   | Type |
|-----------------------|------|
| `user_transactions`   | File |
| `exchange_transactions` | File |

**Optional config overrides:**

| Key                          | Example |
|------------------------------|---------|
| `timestampToleranceSeconds`  | `300`   |
| `quantityTolerancePct`       | `0.01`  |

---

### `GET /report/:runId`

Fetch full reconciliation report.

---

### `GET /report/:runId/summary`

Fetch reconciliation summary counts.

---

### `GET /report/:runId/unmatched`

Fetch only unmatched transactions.

---

### `GET /report/:runId/csv`

Download reconciliation report as CSV.

---

## Matching Logic

Transactions are matched using:

- Normalized asset
- Normalized transaction type
- Configurable timestamp tolerance
- Configurable quantity tolerance

Candidates are scored using:

- Quantity proximity
- Timestamp proximity

The best-scoring candidate is selected as the final match.

---

## Data Validation

The ingestion pipeline validates all rows before reconciliation. Validation issues are stored with severity levels:

- `WARNING`
- `ERROR`

Examples of validation issues:

- Invalid timestamp
- Missing type
- Invalid quantity
- Suspicious negative `BUY` quantity

> Invalid rows are preserved and stored in MongoDB instead of being silently dropped.

---

## Reconciliation Categories

| Category        | Description                                  |
|-----------------|----------------------------------------------|
| `MATCHED`       | Successfully reconciled                      |
| `CONFLICTING`   | Candidate found but exceeded tolerance       |
| `USER_ONLY`     | Missing on exchange side                     |
| `EXCHANGE_ONLY` | Missing on user side                         |

---

## Design Decisions & Assumptions

### 1. Invalid Rows Are Preserved
Malformed rows are stored with validation issues rather than discarded to maintain auditability.

### 2. Decimal128 for Financial Precision
MongoDB `Decimal128` and `decimal.js` are used to avoid floating-point precision issues common in financial systems.

### 3. Asset Normalization
Assets are normalized to support aliases:

```
BTC  → BITCOIN
ETH  → ETHEREUM
```

This enables reconciliation across inconsistent naming conventions.

### 4. Transaction Type Normalization
Transfers are normalized to support opposite exchange/user perspectives:

```
TRANSFER_IN  → TRANSFER
TRANSFER_OUT → TRANSFER
```

### 5. One-to-One Matching
Once a transaction is matched, it cannot be reused for another reconciliation match — this avoids duplicate pairings.

### 6. Duplicate Transactions Are Preserved
Duplicate rows are intentionally not removed automatically to avoid accidental data loss and preserve traceability.

---

## Sample Reconciliation Flow

```
1. Upload user and exchange CSVs
2. Parse and validate rows
3. Normalize fields
4. Store transactions in MongoDB
5. Run reconciliation engine
6. Generate report
7. Download CSV report
```

---

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm run start    # Run compiled production build
```

---

## Run Using Docker

```bash
docker-compose up --build
```

---
#  Test Docker

Run:

```bash id="9jlwmv"
docker-compose up --build
```

## Future Improvements

- Swagger/OpenAPI documentation
- Pagination for reports
- Background job processing
- Streaming CSV ingestion for large files
- Duplicate detection engine
- Automated retry handling
- Unit and integration testing
- Docker Compose support

---

## Author

**Mohit S.**