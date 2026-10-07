# Task/To-Do CRUD Management — Flezi-E1-Dev Assessment (Option 2)

A per-user to-do manager with full CRUD, strict ownership enforcement, and a
reactive React front-end.

## Story Point Estimation

| Factor | Assessment |
|---|---|
| **Complexity** (how hard is the logic?) | Low-to-medium. Core logic is straightforward CRUD, but ownership enforcement must be checked on every read/write path, and status filtering/toggling needs to be race-safe. |
| **Effort** (how much work / how many parts?) | Medium. Requires: auth middleware, 4 REST endpoints, validation, a React UI with add/inline-edit/toggle/delete, optimistic updates with rollback, filter tabs, empty state, and a full test suite. |
| **Uncertainty / Risk** (unknowns, dependencies?) | Low. No external integrations, no payment/money math, no complex aggregation. Main risk is ensuring optimistic UI rollback behaves correctly on failures and that double-toggle clicks don't produce duplicate requests. |
| **Estimate (points)** | **5** |
| **Rationale** | Not a 1-2 because it spans full-stack (API + UI + ownership + tests), touching more moving parts than a trivial CRUD. Not an 8+ because there's no complex business computation (no money, no aggregation, no multi-entity merge logic like the Cart or Rating tasks). A 5 reflects "several straightforward parts assembled carefully," which matches Fibonacci's mid-range for a bounded, well-specified feature with low risk. |

## Stack

- **Backend**: Node.js, Express, better-sqlite3 (file-based SQL, zero setup), JWT for auth identity.
- **Frontend**: React 18 + Vite.
- **Tests**: Jest + Supertest (backend API tests covering all required scenarios).

> Note: full registration/login (hashing, password rules) is the scope of
> Task 1. Since this assessment is scoped to Task 2 only, authentication here
> is simplified to a `/dev-login` endpoint that issues a JWT for one of two
> seeded demo users (`user-a`, `user-b`), so ownership enforcement between two
> distinct users can be exercised end-to-end.

## How to Run

### Backend

```bash
cd backend
npm install
npm start
# API listening on http://localhost:4000
```

### Backend Tests

```bash
cd backend
npm test
```

All 9 scenarios from the worksheet pass:
- Rejects whitespace-only title (400)
- Creates task, returns 201 with resource
- Denies cross-owner update/delete (403)
- Toggles status open -> done -> open
- Returns 404 for update/delete on missing task
- Filters list by status correctly
- Rejects unauthenticated requests (401)
- Each user only sees their own tasks

### Frontend

```bash
cd frontend
npm install
npm run dev
# App on http://localhost:5173, proxies /api to the backend on :4000
```

Open the app, pick "Login as User A" or "Login as User B" (simplified login
for this assessment), then add/edit/toggle/delete tasks. Switch users in a
second browser tab to confirm ownership isolation.

## API Summary

| Method | Endpoint | Purpose | Success | Errors |
|---|---|---|---|---|
| POST | `/tasks` | Create a task | 201 | 400, 401 |
| GET | `/tasks?status=` | List own tasks | 200 | 401 |
| PUT | `/tasks/:id` | Update/toggle a task | 200 | 400, 403, 404 |
| DELETE | `/tasks/:id` | Delete a task | 204 | 403, 404 |

## Acceptance Criteria Coverage

- [x] Ownership enforced on every read/write; cross-owner access returns 403/404
- [x] Task has title (required), description (optional), status (open/done), timestamps
- [x] Create returns 201 with created resource
- [x] Update supports title/description edits and status toggle
- [x] Delete removes permanently and the UI updates immediately (optimistic + rollback)
- [x] Missing task ID returns 404
- [x] Status filtering on the list endpoint
- [x] Empty-state message when no tasks exist
- [x] Visual distinction between open/done (strikethrough)
- [x] Whitespace-only titles rejected
