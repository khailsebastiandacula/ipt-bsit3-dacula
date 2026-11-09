# UConnect Debugging Playbook (No-AI Workflow)

This playbook is a practical troubleshooting guide you can follow when the system misbehaves.

Use this together with:

- `Documentation/FRONTEND_SYSTEM_RUNDOWN.md`
- `Documentation/BACKEND_SYSTEM_RUNDOWN.md`

---

## 1) Fast Triage Order

When you see a bug, always check in this order:

1. Is the backend running?
2. Is the frontend using the correct API base URL?
3. Is the request reaching the correct endpoint?
4. Is the response status code expected?
5. Does frontend state update after response?
6. Does template render the updated state?
7. Is CSS/layout hiding the content?

This order avoids jumping between files randomly.

---

## 2) Pre-Debug Sanity Commands

Run these first in separate terminals.

Frontend:

```powershell
Set-Location c:\laragon\www\UConnect\UConnect-Frontend
npm run start
```

Backend:

```powershell
Set-Location c:\laragon\www\UConnect\UConnect-Backend
npm run dev
```

Build checks:

```powershell
Set-Location c:\laragon\www\UConnect\UConnect-Frontend
npm run build

Set-Location c:\laragon\www\UConnect\UConnect-Backend
npm run build
```

---

## 3) Scenario Playbooks

## Scenario A: Admin Page Returns 401 / Unauthorized

Symptom:

- Admin key looks correct but create/update/delete fails with 401.

Most likely causes:

- Wrong `x-admin-key` header value.
- `ADMIN_KEY` in backend `.env` is not what you expect.
- Frontend sent key with extra spaces or stale stored value.

Check sequence:

1. Validate backend env

- Open backend `.env` and confirm `ADMIN_KEY` value.

2. Validate admin auth endpoint directly

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/auth" -Headers @{"x-admin-key"="YOUR_ADMIN_KEY"}
```

Expected:

- Status 200 when key is correct.

3. Validate browser request headers

- In DevTools Network tab, inspect admin request.
- Confirm `x-admin-key` exists and value matches.

4. Clear stale local storage key

- In browser console:

```javascript
localStorage.removeItem("uconnect-admin-key");
```

- Re-enter key in admin page.

Relevant files:

- `UConnect-Frontend/src/app/pages/admin/admin.component.ts`
- `UConnect-Frontend/src/app/core/services/announcements/announcements-api.service.ts`
- `UConnect-Backend/src/middleware/admin-auth.ts`

---

## Scenario B: Announcements Are Empty on Home

Symptom:

- Home page renders but no announcements appear.

Most likely causes:

- API returned empty data.
- Backend filtered out inactive records.
- Frontend API base URL points to wrong backend.
- Cached stale response in production service worker.

Check sequence:

1. Call backend endpoint directly

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/announcements"
```

2. Check with inactive included

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/announcements?includeInactive=true"
```

3. Verify frontend request URL in Network tab

- Confirm it matches intended backend host.

4. Verify runtime env in browser

```javascript
window.__env;
```

5. In production/PWA mode, hard refresh and test cache behavior.

Relevant files:

- `UConnect-Frontend/src/app/pages/home/home.component.ts`
- `UConnect-Frontend/src/app/core/services/announcements/announcements-api.service.ts`
- `UConnect-Backend/src/controllers/public.controller.ts`

---

## Scenario C: Map Page Is Blank or Pins Do Not Show

Symptom:

- Map area is empty, or no markers render.

Most likely causes:

- Leaflet map initialization timing issue.
- Container height/style issue.
- Locations API empty or failing.
- Coordinates missing and fallback logic not reached as expected.

Check sequence:

1. Confirm locations API returns data

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/locations"
```

2. In browser DevTools:

- Inspect map container element dimensions.
- Ensure container has non-zero height.

3. Confirm no console errors from Leaflet initialization.

4. Validate location records have expected `code`, `lat`, and `lng` shape.

5. Check filtering state

- Clear search text and category filter.

Relevant files:

- `UConnect-Frontend/src/app/pages/map/map.component.ts`
- `UConnect-Frontend/src/app/pages/map/map.component.scss`
- `UConnect-Frontend/src/app/core/services/locations/locations-api.service.ts`
- `UConnect-Backend/src/controllers/public.controller.ts`

---

## Scenario D: Frontend Calls Wrong API URL

Symptom:

- Requests go to wrong host, fail with 404, or never hit backend logs.

Most likely causes:

- `public/env.js` not regenerated.
- Incorrect value from `.env` during `sync-env.mjs` execution.
- Old static build still serving outdated env.

Check sequence:

1. Inspect generated runtime file

- `UConnect-Frontend/public/env.js`

2. Confirm script output pipeline

- `npm run start` should run `prestart`.
- `npm run build` should run `prebuild`.

3. Verify browser runtime value

```javascript
window.__env;
```

4. Rebuild and reload frontend after env change.

Relevant files:

- `UConnect-Frontend/scripts/sync-env.mjs`
- `UConnect-Frontend/public/env.js`
- `UConnect-Frontend/src/app/core/config/runtime-env.ts`

---

## Scenario E: CORS / Preflight Errors

Symptom:

- Browser says blocked by CORS policy.

Most likely causes:

- Frontend origin not included in backend CORS `origin` allow list.
- Missing custom header allowance for `x-admin-key`.

Check sequence:

1. Inspect backend CORS config in `src/index.ts`.
2. Confirm frontend origin exactly matches one of allowed origins.
3. Confirm `x-admin-key` is included in allowed headers.
4. Restart backend after CORS config changes.

Relevant file:

- `UConnect-Backend/src/index.ts`

---

## Scenario F: Admin Create/Update Returns 400

Symptom:

- API rejects payload with 400.

Most likely causes:

- Missing required fields (`title`, `message`, `author_name`, `priority`).
- Invalid `priority` value.
- Invalid `id` path param on update.

Check sequence:

1. Inspect request payload in Network tab.
2. Validate exact field names and value types.
3. Confirm priority is one of: `LOW`, `NORMAL`, `HIGH`, `URGENT`.
4. For update, confirm `id` is a positive integer.

Relevant files:

- `UConnect-Frontend/src/app/pages/admin/admin.component.ts`
- `UConnect-Backend/src/controllers/admin.controller.ts`

---

## Scenario G: Stale Data in Production

Symptom:

- Backend data changed but UI still shows old values.

Most likely causes:

- Service worker cached API responses.

Check sequence:

1. Disable cache in browser DevTools and hard reload.
2. Inspect service worker status in Application tab.
3. Review data cache strategy in `ngsw-config.json`.
4. If needed, unregister service worker and reload.

Relevant files:

- `UConnect-Frontend/ngsw-config.json`
- `UConnect-Frontend/src/app/app.config.ts`

---

## 4) Minimal Log Points to Add Temporarily

Use temporary logs when isolating difficult bugs, then remove them after fixing.

Frontend log points:

- After each API call in page components.
- Before and after signal updates.
- Before submit on admin form.

Backend log points:

- At start of each controller.
- Before and after SQL queries.
- In admin auth middleware when key check fails.

Tip:

- Keep logs structured and short to avoid noise.

---

## 5) Root Cause Report Template

After fixing a bug, document it quickly using this template:

1. Symptom

- What user saw.

2. Trigger

- Exact steps to reproduce.

3. Root cause

- Single technical reason (not generic wording).

4. Fix

- What code/config changed.

5. Verification

- Which endpoint/page/test/build confirmed fix.

6. Prevention

- What to add (validation, test, monitor, checklist item).

Keeping this report habit makes future debugging much faster.

---

## 6) One-Line Mental Model

Most bugs are one of these four:

1. Wrong input/config.
2. Wrong request/response.
3. Wrong state/render condition.
4. Wrong cache/old data.

Find which bucket the issue belongs to first, then drill down.
