# CLAUDE.md

This file provides guidance for Claude Code when working on this project.

## Project Overview

Satvos is a Next.js 16 frontend for a document processing platform. It handles invoice parsing, validation, and review workflows with a modern light-mode-first UI inspired by Notion, Stripe, and Linear.

**Target Users**: Accountants, finance ops teams, small business owners

## Tech Stack

- Next.js 16 with App Router, React 19, TypeScript
- Tailwind CSS with CSS variables for theming
- Radix UI primitives (via shadcn/ui pattern)
- TanStack Query for server state, Zustand for client state (auth)
- React Hook Form + Zod for forms
- next-themes for light/dark mode, Lucide React for icons

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
- `(auth)` route group: Public auth pages (login, register, forgot-password, reset-password)
- `(dashboard)` route group: Protected pages requiring authentication
- `/` → product landing page, `/dashboard` → authenticated dashboard
- `/verify-email` is standalone (not in auth/dashboard groups)

### State Management
- **Auth**: Zustand store at `src/store/auth-store.ts` with sessionStorage persistence (or localStorage when "Remember me" is enabled)
- **Server State**: TanStack Query hooks in `src/lib/hooks/`
- **Theme**: next-themes with `light` as default

### API Layer
- API client: `src/lib/api/client.ts` (Axios with interceptors, token refresh, session expiry handling)
- Endpoint functions: `src/lib/api/*.ts`
- React Query hooks: `src/lib/hooks/use-*.ts`

### Styling
- **Light mode first** with dark mode toggle
- Primary color: Indigo (#6366f1)
- CSS variables in `src/app/globals.css`, Tailwind extended in `tailwind.config.ts`
- Full design system in `DESIGN_SYSTEM.md`

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
- Never hardcode colors like `bg-emerald-600` — always use design system tokens

#### Action Button Severity
- Positive actions (approve): `variant="outline"` + success colors (`border-success-border bg-success-bg text-success`)
- Warning actions (reject): `variant="outline"` + warning colors (`border-warning-border bg-warning-bg text-warning`)
- Destructive actions (delete): `variant="outline"` + destructive colors (`border-destructive/30 text-destructive`)
- **NEVER** style two actions of different severity identically

#### Color Tokens
- Always use CSS variable-based tokens from `globals.css` / `tailwind.config.ts`
- Never hardcode hex colors or Tailwind palette colors (like `emerald-600`, `amber-500`)
- Use: `text-success`, `bg-warning-bg`, `border-error-border`, `text-primary`, etc.

#### Table Headers
- `TableHead` has default `text-xs uppercase tracking-wider` styling
- Sortable columns use `SortableHeader` (a ghost Button that overrides these defaults)
- Non-sortable columns: override with `className="text-sm normal-case tracking-normal"`

## Key Patterns

### Components
- UI primitives in `src/components/ui/` follow shadcn/ui patterns
- Feature components in `src/components/{feature}/`
- Use `cn()` utility for conditional class merging
- `inline-parsed-data.tsx` and `enhanced-field.tsx` are actively used by `document-split-view.tsx`

### Data Fetching
```typescript
export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
    enabled: !!id,
  });
}
```

**TanStack Query v5 — `isPending` vs `isLoading`**: For queries with `enabled: false`, `isLoading` is **false** but `isPending` is true. Use `isPending` for loading/skeleton UI on dependent queries.

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
| `src/lib/api/client.ts` | Axios API client with token refresh |
| `src/types/auth.ts` | Auth types, TokenPair, `decodeJwtPayload()` |
| `src/components/ui/` | Reusable UI components |
| `src/lib/utils/structured-data.ts` | Utilities for editing structured invoice data |
| `src/test/test-utils.tsx` | `renderWithProviders` for component tests |

## Layout Structure

```
SidebarProvider
├── AppSidebar (collapsible, left)
└── div (flex-1)
    ├── TopNav (sticky top, h-14)
    └── SidebarInset → main (content area, p-4 md:p-6)
```

## API Gotchas

### Response Unwrapping
- Single-resource endpoints may return nested responses like `{ success, data: { collection: {...} } }`
- `getCollection` unwraps via `response.data.data.collection` (not `response.data.data`)
- Always verify the actual backend response structure

### Review API
Document review uses **PUT** (not POST): `PUT /documents/{id}/review` with `{ status: "approved" | "rejected" }`

### Tags API
Tags use `Record<string, string>` format: `POST /documents/{id}/tags` with `{ tags: { "vendor": "Acme" } }`

### Known API Limitations
The API does **not** support `search`, `parsing_status`, `validation_status`, or `review_status` query params on list endpoints. Only `offset`, `limit`, and `collection_id` (documents only) are supported server-side.

**Client-side search pattern**: When search/filters are active, fetch all items and filter with `useMemo`. See Documents page (dual-query), Collections page (limit 1000), Needs Attention page (fetch-all).

### Upload Content-Type
`files.ts` uploadFile MUST include `headers: { "Content-Type": "multipart/form-data" }` — without it, Axios converts FormData to JSON.

## Authentication Flow

The login API returns only tokens (no user object). User details are fetched separately:

1. `POST /auth/login` → `{ access_token, refresh_token, expires_at }`
2. `decodeJwtPayload()` extracts `user_id` from JWT
3. `GET /users/{id}` fetches full user profile
4. There is **no** `/auth/me` endpoint

### Token Refresh
- Middleware cookie (`satvos-auth-state`) checked on page navigations, renewed on login/refresh
- API client interceptor auto-refreshes on 401, queues concurrent requests
- On refresh failure → redirect to `/login?session_expired=true&returnUrl=<path>`

### Email Verification
- Free-tier users must verify email before uploading. Backend returns 403 + `EMAIL_NOT_VERIFIED`
- `needsEmailVerification(user)` helper in `constants.ts` checks `isFreeUser && !email_verified`

## Permission Gating

Edit/upload/bulk actions gated by collection-level permission:
- Backend returns `current_user_permission` → API layer maps to `user_permission`
- Check: `collection.user_permission === "owner" || "editor"` for write access

## Testing

- **Framework**: Vitest + React Testing Library + jsdom
- **Test Utils**: `renderWithProviders` from `src/test/test-utils.tsx`
- **Location**: Tests in `__tests__/` directories next to source files

**Testing pages with React 19 `use(params)`**: Tests must wrap in `<Suspense>`, use a **stable promise reference** (not inline `Promise.resolve()`), and use `await waitFor()`. See `documents/[id]/__tests__/page.test.tsx`.

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
5. **Icons**: Use bare `<Icon />` inside Button/DropdownMenuItem

### Adding tests
1. Create `__tests__/{name}.test.ts(x)` next to the source file
2. Use `renderWithProviders` for component tests
3. Run `npm run test` to verify

### CI/CD
- CI runs lint, typecheck, test in parallel, then build
- Docker: multi-stage build, standalone output, port 3000
- `docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:8080/api/v1 satvos`
