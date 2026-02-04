# CLAUDE.md

This file provides guidance for Claude Code when working on this project.

## Project Overview

DocFlow (formerly Satvos UI) is a Next.js 16 frontend for a document processing platform. It handles invoice parsing, validation, and review workflows with a modern light-mode-first UI inspired by Notion, Stripe, and Linear.

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
- **Auth**: Zustand store at `src/store/auth-store.ts` with sessionStorage persistence
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

## Key Patterns

### Components
- UI primitives in `src/components/ui/` follow shadcn/ui patterns
- Feature components in `src/components/{feature}/`
- Use `cn()` utility for conditional class merging

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
| `src/components/layout/top-nav.tsx` | Top navigation with search, theme toggle |
| `src/components/layout/app-sidebar.tsx` | Collapsible sidebar navigation |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout with sidebar + top nav |
| `src/lib/utils/structured-data.ts` | Utilities for editing structured invoice data |
| `vitest.config.ts` | Test framework configuration |
| `Dockerfile` | Multi-stage production Docker build |
| `.github/workflows/ci.yml` | CI pipeline (lint, typecheck, test, build) |
| `.github/workflows/docker.yml` | Docker build & push to GHCR |

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
- Split-pane view using `react-resizable-panels`
- Left panel: PDF viewer (with Google Docs viewer fallback for S3)
- Right panel: Tabbed interface (Extracted Data, Validations, History)
- Mobile: Stacked tabs instead of split view
- Footer: Tags and review actions
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
  - Tenant-level role: admin, manager, or member (`hasRole(userRole, ROLES.MEMBER)`)
  - Collection-level permission: `owner` or `editor` on the document's collection
  - The page fetches the collection via `useCollection(document.collection_id)` and reads `user.role` from `useAuthStore()`
  - `onSaveEdits` is conditionally passed to `DocumentTabs` — if not provided, the Edit button is hidden

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
- **Count**: 420+ tests across 21 test files

### Test Coverage Areas
- Utility functions (format, validation, cn)
- Constants and type validations
- Zustand stores (auth-store, ui-store)
- API client (interceptors, error handling)
- React hooks (use-toast)
- UI components (status-badge, history-tab, collection-card, collection-header, bulk-actions-bar, breadcrumbs, structured-data-viewer, document-tabs)
- API functions (documents: addDocumentTag, getDocumentTags)
- Structured data utilities (applyEditsToStructuredData, getValueAtPath, setValueAtPath)

## CI/CD & Docker

### GitHub Actions
- **CI** (`.github/workflows/ci.yml`): Runs lint, typecheck, and test in parallel, then build. Triggers on PRs and pushes to main.
- **Docker** (`.github/workflows/docker.yml`): Builds and pushes Docker image to GHCR on pushes to main/tags. Build-only validation on PRs.

### Docker
- Multi-stage build: `deps` → `builder` → `runner`
- Uses Next.js standalone output (`output: "standalone"` in `next.config.ts`)
- Runs as non-root user on port 3000
- Build: `docker build -t docflow .`
- Run: `docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:8080/api/v1 docflow`

## Current State & Next Steps

### Completed
- [x] Light mode theme with dark mode toggle
- [x] New layout (TopNav + Sidebar)
- [x] Collection card grid view
- [x] Hybrid dashboard (stats + collections + needs attention)
- [x] Document detail with tabs (Data, Validations, History)
- [x] Global search (Cmd+K)
- [x] Exceptions page
- [x] Design system documentation
- [x] CI/CD pipeline (GitHub Actions)
- [x] Docker support (multi-stage build)
- [x] Test framework setup (Vitest, 369+ tests)
- [x] Auth flow fix (JWT decode + user fetch)
- [x] Review API fix (PUT with status field)
- [x] Font: Plus Jakarta Sans (replaced Inter)
- [x] Typography: `font-semibold` on all page titles
- [x] Status badges: `showType` prop for context labels (e.g., "Parsing: Completed")
- [x] Collection page: document count from actual fetched documents
- [x] Bulk actions bar on collection detail page (approve/reject/delete selected)
- [x] Tags API fix: `{ tags: Record<string, string> }` format, separate `useDocumentTags` fetch
- [x] Editable extracted data with auto re-validation (Edit → modify fields → Save → auto validate)

### In Progress / Next Steps
1. **Design System Implementation** - Apply consistent spacing, sizing, colors across all components per `DESIGN_SYSTEM.md`
2. **Extracted Data Viewer** - Fix to work with actual API response format (user will provide sample response)
3. **Upload Page Polish** - Upload page exists at `/upload` with drag-drop, collection selection, progress tracking. May need design system alignment.

### Upload Page Features (Already Implemented)
Location: `src/app/(dashboard)/upload/page.tsx`
- Collection selector (existing or create new)
- Drag-and-drop file upload (react-dropzone)
- File list with remove option
- Upload progress with status indicators
- Auto-create documents option
- Parse mode selection (single/dual)
- Uses `useUpload` hook from `src/lib/hooks/use-upload.ts`

### Known Issues
- PDF viewer may need CORS configuration for S3 (Google Docs viewer fallback available)
- Collection cards use `documents_count ?? files_count ?? 0` for compatibility
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

### Modifying theme colors
1. Update CSS variables in `src/app/globals.css` (`:root` for light, `.dark` for dark)
2. Add Tailwind mappings in `tailwind.config.ts` if needed

### Adding tests
1. Create `__tests__/{name}.test.ts(x)` next to the source file
2. Use `renderWithProviders` from `src/test/test-utils.tsx` for component tests
3. Run `npm run test` to verify

### Design System Reference
See `DESIGN_SYSTEM.md` for:
- Color tokens and usage
- Typography scale
- Spacing scale (4px base)
- Component sizing standards
- Shadow/elevation levels
- Common class combinations
