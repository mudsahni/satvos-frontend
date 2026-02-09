# CLAUDE.md

This file provides guidance for Claude Code when working on this project.

## Project Overview

Satvos (formerly Satvos UI) is a Next.js 16 frontend for a document processing platform. It handles invoice parsing, validation, and review workflows with a modern light-mode-first UI inspired by Notion, Stripe, and Linear.

**Target Users**: Accountants, finance ops teams, small business owners

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS with CSS variables for theming
- Radix UI primitives (via shadcn/ui pattern)
- TanStack Query for server state
- Zustand for client state (auth)
- React Hook Form + Zod for forms
- next-themes for light/dark mode toggle
- react-resizable-panels for split views
- Lucide React for icons

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint (eslint . --max-warnings 0)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run test         # Run tests once (vitest run)
npm run test:watch   # Run tests in watch mode (vitest)
npm run test:coverage # Run tests with coverage (vitest run --coverage)
```

## Architecture

### Routing
- `(auth)` route group: Public auth pages (login)
- `(dashboard)` route group: Protected pages requiring authentication

### State Management
- **Auth**: Zustand store at `src/store/auth-store.ts` with sessionStorage persistence (or localStorage when "Remember me" is enabled)
- **Server State**: TanStack Query hooks in `src/lib/hooks/`
- **Theme**: next-themes with `light` as default

### API Layer
- API client: `src/lib/api/client.ts` (Axios with interceptors)
- Endpoint functions: `src/lib/api/*.ts`
- React Query hooks: `src/lib/hooks/use-*.ts`

### Styling
- **Light mode first** with dark mode toggle (using next-themes)
- Primary color: Indigo (#6366f1)
- CSS variables defined in `src/app/globals.css`
- Design system documented in `DESIGN_SYSTEM.md`
- Tailwind extended in `tailwind.config.ts`
- Status colors: success (green), warning (amber), error (red)

### Design System Enforcement (CRITICAL)

These rules are mandatory. Follow them exactly unless the user explicitly overrides them.

#### Icons in Buttons
- `Button` and `DropdownMenuItem` have built-in `gap-2` and `[&_svg]:size-4`
- **NEVER** add `mr-2 h-4 w-4` or similar sizing/spacing to icons inside these components
- Use bare icons: `<Button><Upload /> Upload</Button>`
- Only keep behavioral classes like `animate-spin`: `<Loader2 className="animate-spin" />`
- **Exception**: `TabsTrigger` has no built-in icon handling — use `className="mr-2 h-4 w-4"` there

#### Badge Styling
- Badges use `rounded-md` (NOT `rounded-full`), `px-2`, and colored borders per status
- Status variants: `success` = green bg + border, `warning` = amber bg + border, `error` = red bg + border
- Never hardcode colors like `bg-emerald-600` — always use design system tokens (`bg-success`, `text-warning`, etc.)

#### Action Button Severity
- Positive actions (approve): `variant="outline"` + success colors (`border-success-border bg-success-bg text-success`)
- Warning actions (reject): `variant="outline"` + warning colors (`border-warning-border bg-warning-bg text-warning`)
- Destructive actions (delete): `variant="outline"` + destructive colors (`border-destructive/30 text-destructive`)
- **NEVER** style two actions of different severity identically (e.g., reject and delete should NOT both be solid red)

#### Color Tokens
- Always use CSS variable-based tokens from `globals.css` / `tailwind.config.ts`
- Never hardcode hex colors or Tailwind palette colors (like `emerald-600`, `amber-500`, `red-500`)
- Use: `text-success`, `bg-warning-bg`, `border-error-border`, `text-primary`, etc.

#### Table Headers
- `TableHead` has default `text-xs uppercase tracking-wider` styling
- Sortable columns use `SortableHeader` (a ghost Button that overrides these defaults)
- Non-sortable columns that should match: override with `className="text-sm normal-case tracking-normal"` on `TableHead`

#### API Response Unwrapping
- Single-resource endpoints (e.g., `GET /collections/{id}`) may return nested responses like `{ success, data: { collection: {...}, files: [...] } }`
- Always verify the actual backend response structure before writing `response.data.data` extraction
- The `getCollection` function unwraps via `response.data.data.collection` (not `response.data.data`)

## Key Patterns

### Components
- UI primitives in `src/components/ui/` follow shadcn/ui patterns
- Feature components in `src/components/{feature}/`
- Use `cn()` utility for conditional class merging
- **Removed**: `header.tsx`, `parsed-data-viewer.tsx`, and `validation-panel.tsx` were deleted as unused
- **Active**: `inline-parsed-data.tsx` and `enhanced-field.tsx` are still in use (used by document-split-view)

### Data Fetching
```typescript
// Hook pattern
export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
    enabled: !!id,
  });
}
```

**TanStack Query v5 — `isPending` vs `isLoading`**: For queries with `enabled: false` (or falsy dependent values), the query starts with `status: 'pending'` and `fetchStatus: 'idle'`. `isLoading` = `isPending && isFetching` → **false** for disabled queries. Use `isPending` for loading/skeleton UI on dependent queries. Example: `useCollection(document?.collection_id ?? "")` — when `collection_id` is `""`, the query is disabled, `isLoading` is false, but `isPending` is true.

### Form Handling
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});
```

## Important Files

| File | Purpose |
|------|---------|
| `DESIGN_SYSTEM.md` | Comprehensive design system guide |
| `src/app/globals.css` | CSS variables for theming (light/dark) |
| `tailwind.config.ts` | Extended Tailwind config with soft shadows |
| `src/store/auth-store.ts` | Auth state management with hydration |
| `src/lib/api/client.ts` | Axios API client |
| `src/types/auth.ts` | Auth types, TokenPair, `decodeJwtPayload()` |
| `src/components/ui/` | Reusable UI components |
| `src/components/ui/error-state.tsx` | Reusable error state components |
| `src/components/layout/top-nav.tsx` | Top navigation with search, theme toggle |
| `src/components/layout/app-sidebar.tsx` | Collapsible sidebar navigation |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout with sidebar + top nav |
| `src/lib/utils/structured-data.ts` | Utilities for editing structured invoice data |
| `vitest.config.ts` | Test framework configuration |
| `Dockerfile` | Multi-stage production Docker build |
| `.github/workflows/ci.yml` | CI pipeline (lint, typecheck, test, build) |
| `.github/workflows/docker.yml` | Docker build & push to GHCR |
| `src/components/dashboard/greeting-banner.tsx` | Dashboard greeting banner with time-based greeting |

## Layout Structure

```
SidebarProvider
├── AppSidebar (collapsible, left)
└── div (flex-1)
    ├── TopNav (sticky top, h-14)
    │   ├── SidebarTrigger + Logo
    │   ├── Search (Cmd+K)
    │   └── Tenant badge + Theme toggle + User menu
    └── SidebarInset
        └── main (content area, p-4 md:p-6)
```

## Document Detail Page

The document detail page (`/documents/[id]`) features:
- **Compact 2-row header**: Breadcrumb row + combined title/status/actions row
- Breadcrumb: `Documents > [Collection Name] > Document Name` — always visible, with skeleton while collection loads, fallback "Collection" link on error
- Status badges inline after title (hidden on small screens via `hidden md:flex`)
- Actions overflow menu (icon-only `MoreVertical` button) with Re-Parse, Re-Validate
- Review buttons (Approve/Reject) on right side of title row, keyboard hint "A to approve, R to reject"
- Split-pane view using `react-resizable-panels`, height: `calc(100vh-3.5rem)` matching TopNav `h-14`
- Left panel: `DocumentViewer` — auto-detects file type from file name extension. Renders PDF viewer (with Google Docs viewer fallback) for `.pdf` files, or image viewer with zoom/rotate controls for `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.tiff` files
- Right panel: `DocumentTabs` — tabbed interface (Extracted Data, Validations, History)
- **Tags**: Inline pill row at top of Extracted Data tab (not in page header), with compact "+" Add button
- **Retry Parsing**: Button shown in Extracted Data tab when parsing failed, with loading state
- Data tab has status indicators: spinner (parsing), check (data ready), error (failed)
- Validation tab: compact expandable result cards with left-border color accent
- Mobile: Stacked layout — document viewer on top (40vh), tabs below, scrollable
- Keyboard shortcuts: A=approve, R=reject

## Types

Key types in `src/types/`:
- `Document` - Document entity with parsed data
- `ParsedInvoice` - Structured invoice data
- `FieldWithConfidence<T>` - Field value with confidence score
- `ValidationResult` - Validation rule result
- `Collection` - Collection with documents_count/files_count

## Authentication Flow

The login API returns only tokens (no user object). User details are fetched separately:

1. `POST /auth/login` returns `{ access_token, refresh_token, expires_at }`
2. `decodeJwtPayload()` (in `src/types/auth.ts`) extracts `user_id` from the JWT
3. `GET /users/{id}` fetches the full user profile
4. There is **no** `/auth/me` endpoint

```typescript
// JWT payload contains user_id and sub fields
const payload = decodeJwtPayload(accessToken);
const userId = (payload?.user_id ?? payload?.sub) as string;
const user = await getUser(userId);
```

### Token Refresh & Session Management

Two auth layers work together:

- **Middleware cookie** (`satvos-auth-state`): A 24-hour cookie checked by Next.js middleware on page navigations. Renewed on login and every successful token refresh via `renewAuthCookie()`.
- **API client interceptor** (`src/lib/api/client.ts`): On 401 responses, automatically refreshes the access token using the refresh token, queues concurrent requests, and retries. On refresh failure, calls `handleSessionExpired()`.

**Session expiry flow:**
1. API call returns 401 → interceptor tries `POST /auth/refresh`
2. If refresh succeeds → tokens updated, cookie renewed, original request retried
3. If refresh fails (or no refresh token) → `logout()` clears store, cookie cleared, redirect to `/login?session_expired=true&returnUrl=<current_path>`
4. Login page shows "Your session has expired" warning banner and restores the user's location after re-login

**Key functions in `src/lib/api/client.ts`:**
- `renewAuthCookie()` — sets the middleware cookie (exported, also used by login form)
- `handleSessionExpired()` — clears cookie, redirects to login with context

### Remember Me

When "Remember me" is checked on the login form, auth data persists to `localStorage` instead of `sessionStorage`, surviving browser restarts.

- Controlled by the `satvos-remember-me` flag in `localStorage`
- The `login()` action in the auth store accepts an optional `rememberMe` parameter
- When enabled, the Zustand persist middleware switches its storage backend to `localStorage`

## Review API

Document review uses **PUT** (not POST) with `status` field:

```typescript
// PUT /documents/{id}/review
{ status: "approved" | "rejected", notes?: string }
```

## Editable Extracted Data

The Extracted Data tab supports inline editing. Users click "Edit" to toggle all fields into inputs, modify values, then "Save" to persist changes and auto-trigger validation.

- `UpdateDocumentRequest.structured_data` sends the full `StructuredInvoiceData` via `PUT /documents/{id}`
- `applyEditsToStructuredData()` in `src/lib/utils/structured-data.ts` merges dot-notation edits into a cloned data object with type coercion
- After save, validation is auto-triggered via `POST /documents/{id}/validate`
- Unsaved changes guard prompts before tab switches or cancel
- **Permission gating**: Edit button only shows when user has edit permission. Checked via:
  - Collection-level permission: `owner` or `editor` on the document's collection (backend computes effective permission as `max(implicit_from_role, explicit_db_permission)` and returns it as `current_user_permission`)
  - The page fetches the collection via `useCollection(document.collection_id)` and reads `user_permission`
  - `onSaveEdits` is conditionally passed to `DocumentTabs` — if not provided, the Edit button is hidden
- **Retry Parsing**: When parsing fails, the Extracted Data tab shows an error state with a "Retry Parsing" button (via `onReparse` prop). Loading state shown via `isReparsing` prop.
- **Tags in DocumentTabs**: Tags are rendered as inline pills at the top of the Extracted Data tab. Props: `tags`, `onAddTag`, `isAddingTag`, `onDeleteTag`. The Add Tag dialog is inside DocumentTabs.

## Tags API

Tags use a `Record<string, string>` format (`{ tags: { key: value } }`):

```typescript
// POST /documents/{id}/tags
{ tags: { "vendor": "Acme Corp", "project": "Q4" } }
// Returns DocumentTag[]

// GET /documents/{id}/tags → DocumentTag[]
// DELETE /documents/{id}/tags/{tagId}
```

## Testing

- **Framework**: Vitest + React Testing Library + jsdom
- **Setup**: `src/test/setup.ts` (mocks for next/navigation, next-themes, ResizeObserver, etc.)
- **Test Utils**: `src/test/test-utils.tsx` (renderWithProviders with QueryClient + TooltipProvider)
- **Location**: Tests live in `__tests__/` directories next to their source files
- **Count**: 550+ tests across 31 test files

### Test Coverage Areas
- Utility functions (format, validation, cn)
- Constants and type validations
- Zustand stores (auth-store, ui-store, remember-me persistence)
- API client (interceptors, error handling, renewAuthCookie)
- React hooks (use-toast)
- Auth components (login-form: session expired banner, form rendering)
- UI components (status-badge, history-tab, collection-card, collection-header, bulk-actions-bar, breadcrumbs, structured-data-viewer, document-tabs, error-state)
- Error state components (ErrorState, InlineErrorState)
- Bulk actions bar (results banner, auto-clear, per-document feedback)
- Page components (document detail page: breadcrumb states, collection loading/error/success)
- API functions (documents: addDocumentTag, getDocumentTags)
- Structured data utilities (applyEditsToStructuredData, getValueAtPath, setValueAtPath)
- Global search (document/collection/page search, keyboard nav, data fetching)
- Needs Attention utilities (needsAttention, matchesFilter)
- Stats API (getStats)
- Collections API (current_user_permission → user_permission mapping in getCollections/getCollection, CSV export download)
- Collection card (export CSV dropdown action)
- Collection header (export CSV button, disabled state)
- Document viewer (isImageFile detection, PDF rendering, image rendering with zoom/rotate, error/retry states)

## CI/CD & Docker

### GitHub Actions
- **CI** (`.github/workflows/ci.yml`): Runs lint, typecheck, and test in parallel, then build. Triggers on PRs and pushes to main.
- **Docker** (`.github/workflows/docker.yml`): Builds and pushes Docker image to GHCR on pushes to main/tags. Build-only validation on PRs.

### Docker
- Multi-stage build: `deps` → `builder` → `runner`
- Uses Next.js standalone output (`output: "standalone"` in `next.config.ts`)
- Runs as non-root user on port 3000
- Build: `docker build -t satvos .`
- Run: `docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:8080/api/v1 satvos`

## Current State & Next Steps

### Completed
- [x] Light mode theme with dark mode toggle
- [x] New layout (TopNav + Sidebar)
- [x] Collection card grid view
- [x] Hybrid dashboard (stats + collections + needs attention)
- [x] Document detail with tabs (Data, Validations, History)
- [x] Global search (Cmd+K)
- [x] Needs Attention page (renamed from Exceptions)
- [x] Design system documentation
- [x] CI/CD pipeline (GitHub Actions)
- [x] Docker support (multi-stage build)
- [x] Test framework setup (Vitest, 497 tests)
- [x] Auth flow fix (JWT decode + user fetch)
- [x] Review API fix (PUT with status field)
- [x] Font: Plus Jakarta Sans (replaced Inter)
- [x] Typography: `font-semibold` on all page titles
- [x] Status badges: `showType` prop for context labels (e.g., "Parsing: Completed")
- [x] Collection page: document count from actual fetched documents
- [x] Bulk actions bar on collection detail page (approve/reject/delete selected)
- [x] Tags API fix: `{ tags: Record<string, string> }` format, separate `useDocumentTags` fetch
- [x] Editable extracted data with auto re-validation (Edit → modify fields → Save → auto validate)
- [x] Token refresh: cookie renewed on refresh, session expired banner + return URL on forced logout
- [x] Collection detail: client-side sorting, hidden date when unavailable, consistent table headers
- [x] Document detail: breadcrumb nav, Actions dropdown, data tab status indicators
- [x] Validation tab: compact expandable result cards with left-border accent, smaller summary cards
- [x] Document detail layout: compact 2-row header (breadcrumb + title/status/actions), tags moved to data tab as inline pills, retry parsing button on failed state
- [x] Breadcrumb: loading-aware with skeleton placeholder, error fallback, always visible
- [x] Collection detail: `isPending` fix for collection name display (TanStack Query v5)
- [x] Error state handling on all list pages (collections, documents, needs-attention, users)
- [x] Users page pagination
- [x] Mobile responsiveness fixes (responsive tables, filter stacking)
- [x] Parallel uploads with retry
- [x] Bulk operations per-document feedback
- [x] Remember me on login
- [x] Settings page form validation (React Hook Form + Zod)
- [x] Design system gaps fixed (Tailwind config, CSS cleanup)
- [x] Removed unused components (header, parsed-data-viewer, validation-panel)
- [x] Stats API endpoint (`GET /stats`) for accurate dashboard counts
- [x] Needs Attention page: server-paginated fetch of all docs, client-side filtering, URL param filter support (`?filter=`), Failed Parsing category
- [x] Dashboard stat cards link to Needs Attention with pre-set filter
- [x] Greeting banner enhanced with processing/failed parsing counts
- [x] Dialog a11y fix (removed hardcoded empty DialogTitle)
- [x] Collection name fix (API response unwrapping for nested `data.collection`)
- [x] Badge redesign: `rounded-md` with colored borders (not `rounded-full` pills)
- [x] Bulk actions bar: semantic color differentiation (approve=green, reject=amber, delete=red outline)
- [x] Icon spacing cleanup: removed redundant `mr-2 h-4 w-4` from all Button/DropdownMenuItem icons
- [x] Vendor column fallback: tries structured_data.seller.name → parsed_data.seller.name.value → tags seller_name
- [x] Dashboard greeting banner with time-based greeting and document stack illustration
- [x] Client-side search: Documents page (dual-query: paginated + fetch-all), Collections page (limit 1000), Needs Attention page
- [x] Global search (Cmd+K) enhanced: searches real documents and collections, grouped results by type
- [x] Form field styling: Input/Select use `bg-background shadow-sm` for contrast on tinted canvas
- [x] History tab: UserName component resolves user IDs to full names via `useUser()` hook
- [x] Dark mode card contrast bump (`--card` lightness 9% → 11%), content canvas tint (`bg-muted/50`)
- [x] `current_user_permission` integration: API layer maps backend field → `user_permission`, removed role-based permission workarounds, collection permission gates upload/bulk/edit actions
- [x] CSV export: `GET /collections/{id}/export/csv` → blob download, button in collection header + dropdown in collection cards
- [x] Token refresh resilience: network errors (ECONNRESET) during active refresh are queued and retried; file upload timeout increased to 5 min
- [x] Document viewer: `DocumentViewer` component replaces `PDFViewer`, auto-detects PDF vs image from file name, image viewer has zoom/rotate/reset controls
- [x] Mobile document detail: stacked layout (document viewer on top 40vh, tabs below) instead of tabs-only
- [x] Product landing page with routing migration (`/` → landing, `/dashboard` → authenticated dashboard)

### In Progress / Next Steps
1. **Extracted Data Viewer** - Fix to work with actual API response format (user will provide sample response)
2. **Upload Page Polish** - Upload page exists at `/upload` with drag-drop, collection selection, progress tracking. May need design system alignment.

### Upload Page Features (Already Implemented)
Location: `src/app/(dashboard)/upload/page.tsx`
- Collection selector (existing or create new)
- Drag-and-drop file upload (react-dropzone)
- File list with remove option
- Upload progress with status indicators
- Auto-create documents option
- Parse mode selection (single/dual)
- Uses `useUpload` hook from `src/lib/hooks/use-upload.ts`

### Known API Limitations & Client-Side Search

The API does **not** support `search`, `parsing_status`, `validation_status`, or `review_status` query params on list endpoints (confirmed via swagger.json). Only `offset`, `limit`, and `collection_id` (documents only) are supported server-side.

**Pattern**: When search or filters are active, fetch all items client-side and filter with `useMemo`:
- **Documents page**: Dual-query — uses normal `useDocuments()` when idle, switches to a fetch-all `useQuery` (paginating through all API pages with `Promise.all`) when searching. Status filters also applied client-side.
- **Collections page**: Fetches with `limit: 1000` when search is active, filters by name/description.
- **Needs Attention page**: Always fetches all documents, filters with `matchesFilter()` from `src/lib/utils/needs-attention.ts`.
- **Global search (Cmd+K)**: Fetches all documents + collections when dialog opens (cached 2 min), filters client-side, groups results by type.

### Known Issues
- PDF viewer may need CORS configuration for S3 (Google Docs viewer fallback available)
- Extracted Data tab has "Raw JSON" toggle for debugging API response format

## Common Tasks

### Adding a new API endpoint
1. Add function in `src/lib/api/{resource}.ts`
2. Create hook in `src/lib/hooks/use-{resource}.ts`
3. Export from `src/lib/hooks/index.ts`

### Adding a new UI component
1. Create in `src/components/ui/{component}.tsx`
2. Use Radix primitives if interactive
3. Use `cva` for variants (see `badge.tsx`)
4. Follow `DESIGN_SYSTEM.md` for spacing, colors, sizing
5. **Icons**: Use bare `<Icon />` inside Button/DropdownMenuItem (no className for sizing/spacing)

### Modifying theme colors
1. Update CSS variables in `src/app/globals.css` (`:root` for light, `.dark` for dark)
2. Add Tailwind mappings in `tailwind.config.ts` if needed

### Adding tests
1. Create `__tests__/{name}.test.ts(x)` next to the source file
2. Use `renderWithProviders` from `src/test/test-utils.tsx` for component tests
3. Run `npm run test` to verify

**Testing pages with React 19 `use(params)`**: Pages using `use(params)` suspend on first render. Tests must: (1) wrap in `<Suspense>`, (2) use a **stable promise reference** created once outside the render function (not inline `Promise.resolve()`), (3) use `await waitFor()` for assertions. See `src/app/(dashboard)/documents/[id]/__tests__/page.test.tsx` for the pattern.

### Design System Reference
See `DESIGN_SYSTEM.md` for:
- Color tokens and usage
- Typography scale
- Spacing scale (4px base)
- Component sizing standards
- Shadow/elevation levels
- Common class combinations
