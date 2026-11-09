# UConnect Backend System Rundown

This document explains how the backend works, what each file does, and how to debug issues independently.

## 1) What This Backend Does

The backend is a TypeScript Node.js API using Hono and MySQL.

It provides:

- Public read endpoints for locations and announcements.
- Admin-protected endpoints for announcement create/update/delete.
- Database bootstrap logic (database creation, table creation, and initial seed data).

## 2) Request Flow (End-to-End)

1. Server starts from `src/index.ts`.
2. Environment variables are validated via `.env`.
3. MySQL pool is created in `src/config/db.ts`.
4. `src/db/bootstrap.ts` ensures schema/data readiness.
5. Routes are mounted:

- Public routes under `/api`.
- Admin routes under `/api/admin`.

6. Admin routes pass through `src/middleware/admin-auth.ts`.
7. Controllers in `src/controllers/*` validate input and run SQL via pool.
8. JSON responses are returned to frontend.

## 3) Main Debug Path (Recommended)

When backend behavior is wrong, check in this order:

1. Environment

- Confirm required vars are present (`PORT`, DB values, `ADMIN_KEY`).

2. Database connectivity

- Confirm MySQL is running and credentials are valid.

3. Bootstrap result

- Confirm tables exist and expected seed data is present.

4. Route mapping

- Confirm the requested endpoint exists in route files.

5. Middleware

- For admin routes, confirm `x-admin-key` header value exactly matches `ADMIN_KEY`.

6. Controller validation

- Confirm payload fields pass type/content checks.

7. SQL and response mapping

- Confirm query filters and ordering match expected output.

## 4) File-by-File Rundown (All Backend Files)

## A. Root and Tooling Files

### `UConnect-Backend/package.json`

Purpose:

- Defines runtime/build dependencies and scripts (`dev`, `build`, `start`).

Debug checks:

- If startup command fails, verify script targets and installed dependencies.

### `UConnect-Backend/package-lock.json`

Purpose:

- Locks dependency versions for reproducible installs.

### `UConnect-Backend/tsconfig.json`

Purpose:

- TypeScript compile configuration for backend output.

Debug checks:

- Build type errors and module mode issues.

### `UConnect-Backend/README.md`

Purpose:

- Basic setup/start instructions.

### `UConnect-Backend/.env.example`

Purpose:

- Template for required environment variables.

### `UConnect-Backend/.gitignore`

Purpose:

- Ignore build and local-only files.

### `UConnect-Backend/.idea/.gitignore`

Purpose:

- IDE-specific ignore behavior for JetBrains projects.

### `UConnect-Backend/.idea/adet-be-bsit22.iml`

Purpose:

- JetBrains module metadata.

### `UConnect-Backend/.idea/misc.xml`

Purpose:

- JetBrains project settings.

### `UConnect-Backend/.idea/modules.xml`

Purpose:

- JetBrains module registry file.

### `UConnect-Backend/.idea/vcs.xml`

Purpose:

- JetBrains VCS settings.

## B. Core Server Boot and Config

### `UConnect-Backend/src/index.ts`

Purpose:

- Main server bootstrap.

Key responsibilities:

- Create Hono app.
- Configure CORS.
- Register route groups.
- Run database bootstrap.
- Start listening on configured port.

Debug checks:

- Startup crash, CORS issues, port binding problems, and route mounting issues are traced here first.

### `UConnect-Backend/src/config/env.ts`

Purpose:

- Environment variable helpers and validation.

Key responsibilities:

- Enforce required values.
- Parse numeric env values safely.

Debug checks:

- If app fails immediately, missing/invalid env parsing is often the reason.

### `UConnect-Backend/src/config/db.ts`

Purpose:

- MySQL pool setup and DB configuration wiring.

Key responsibilities:

- Parse DATABASE_URL or separate DB vars.
- Initialize mysql2 pool with connection limits.

Debug checks:

- Connection refused, authentication failures, malformed URL, wrong database name.

## C. Database Bootstrap and Seed

### `UConnect-Backend/src/db/bootstrap.ts`

Purpose:

- Ensures database, tables, and baseline seed data exist.

Key responsibilities:

- Create schema/tables if missing.
- Apply compatibility/migration logic (for example missing columns).
- Seed default locations/announcements when tables are empty.

Debug checks:

- Missing tables, old schema shape, unexpected empty default data.

## D. Models (Type Contracts)

### `UConnect-Backend/src/models/announcement.model.ts`

Purpose:

- Announcement data types and payload constraints for controller usage.

### `UConnect-Backend/src/models/location.model.ts`

Purpose:

- Location data interface for public query responses.

Why models matter:

- They keep controller logic and frontend expectations aligned.

## E. Middleware

### `UConnect-Backend/src/middleware/admin-auth.ts`

Purpose:

- Validates admin key for all admin routes.

Key behavior:

- Reads `x-admin-key` request header.
- Compares to `ADMIN_KEY` from env.
- Rejects unauthorized requests.

Debug checks:

- 401 errors on admin endpoints usually trace here.

## F. Controllers (Business Logic)

### `UConnect-Backend/src/controllers/public.controller.ts`

Purpose:

- Implements public read-only logic.

Typical responsibilities:

- `getLocations`: handles optional search/category filtering and ordering.
- `getAnnouncements`: handles include-inactive and limit behavior.

Debug checks:

- Wrong ordering/filtering/output shape usually comes from controller query logic.

### `UConnect-Backend/src/controllers/admin.controller.ts`

Purpose:

- Implements admin mutation logic for announcements.

Typical responsibilities:

- Create announcement.
- Update announcement by ID.
- Delete announcement by ID.
- Validate payload and route params.

Debug checks:

- 400/404 mutation errors are usually payload/ID validation or record-not-found logic.

## G. Route Definitions

### `UConnect-Backend/src/routes/public.route.ts`

Purpose:

- Public route map under `/api`.

Typical endpoints:

- GET announcements.
- GET locations.

### `UConnect-Backend/src/routes/admin.route.ts`

Purpose:

- Admin route map under `/api/admin`.

Key behavior:

- Applies admin auth middleware to protected routes.

Typical endpoints:

- Key validation endpoint.
- Create/update/delete announcement endpoints.

## 5) Feature Data Flows

## A. Public Announcements Read

1. Client calls `/api/announcements`.
2. Public route forwards to public controller.
3. Controller parses query options (such as includeInactive and limit).
4. Controller runs SQL query and returns JSON list.

## B. Public Locations Read

1. Client calls `/api/locations` with optional search/category query params.
2. Public controller builds filtered SQL query.
3. Results are ordered (featured first, then name order).
4. JSON list returned.

## C. Admin Announcement Mutations

1. Client calls admin endpoint with `x-admin-key` header.
2. Admin middleware authorizes request.
3. Controller validates payload + route params.
4. SQL insert/update/delete runs.
5. Controller returns status + payload (or no-content for delete path).

## 6) Practical Backend Debug Checklist (No AI Needed)

Run this sequence:

1. Startup sanity

- Start server and watch initial logs for env/db/bootstrap errors.

2. Environment sanity

- Verify required values in `.env` against `.env.example`.

3. DB sanity

- Confirm DB exists, credentials work, and tables are present.

4. Endpoint sanity

- Call routes directly with Postman/cURL.
- Confirm status codes and response body shapes.

5. Admin auth sanity

- Test with missing/invalid/valid `x-admin-key` values.

6. Payload validation sanity

- Send both valid and intentionally-invalid payloads to ensure validation branch behavior is understood.

7. SQL sanity

- Compare expected filter/order behavior to actual SQL query logic in controllers.

## 7) Backend Mental Model (Quick Summary)

- `index.ts` wires everything.
- `env.ts` and `db.ts` provide startup guarantees.
- `bootstrap.ts` makes schema/data safe at boot.
- Routes decide which controller runs.
- Middleware protects admin paths.
- Controllers enforce business rules and execute SQL.
- Models define data contracts.

If you remember this chain, backend debugging becomes predictable:

`env -> db -> route -> middleware -> controller -> sql -> response`.
