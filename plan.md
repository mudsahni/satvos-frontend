# Admin Pages Implementation Plan

## Overview

Build a complete admin control panel for tenant-scoped user management, service accounts, permissions, and tenant settings. Admin pages live at `/admin/*` within the existing `(dashboard)` route group, reusing the authenticated layout (sidebar + topnav). Only users with `role === "admin"` can access these pages.

---

## Phase 1: Foundation (Types, Constants, API Layer, Shared Components)

### 1.1 Add `service` role to constants

**File**: `src/lib/constants.ts`

- Add `SERVICE: "service"` to `ROLES`
- Add `service: -1` to `ROLE_HIERARCHY` (below free, non-human)
- Update `Role` type (auto-derived from const, no change needed)
- Add helper: `canManageTenant(role: Role): boolean` → `role === "admin"`
- Add helper: `canManageServiceAccounts(role: Role): boolean` → `role === "admin"`
- Add `isServiceAccount(role: Role): boolean` helper

### 1.2 Add `auth_provider` to User type

**File**: `src/types/user.ts`

- Add `auth_provider?: "email" | "google" | "api_key"` to `User` interface
- `CreateUserRequest` already covers what we need (email, full_name, password, role)
- Update `UpdateUserRequest` to include `is_active` (already present)

### 1.3 New types file: `src/types/tenant.ts`

```typescript
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  is_active?: boolean;
}
```

### 1.4 New types file: `src/types/service-account.ts`

```typescript
export interface ServiceAccount {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  api_key_prefix: string;
  is_active: boolean;
  created_by: string;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceAccountRequest {
  name: string;
  description?: string;
  expires_at?: string;
}

export interface CreateServiceAccountResponse {
  service_account: ServiceAccount;
  api_key: string;
}

export interface ServiceAccountPermission {
  id: string;
  service_account_id: string;
  collection_id: string;
  tenant_id: string;
  permission: PermissionLevel;
  granted_by: string;
}

export interface GrantServiceAccountPermissionRequest {
  collection_id: string;
  permission: PermissionLevel;
}

export interface ServiceAccountListParams {
  offset?: number;
  limit?: number;
}
```

### 1.5 Extend `src/types/collection.ts` — Permission entry for admin view

Add to collection.ts:
```typescript
export interface CollectionPermissionEntry {
  id: string;
  collection_id: string;
  tenant_id: string;
  user_id: string;
  permission: PermissionLevel;
  granted_by: string;
  created_at: string;
}
```

### 1.6 New API file: `src/lib/api/admin.ts`

Tenant endpoints:
- `getTenant(): Promise<Tenant>` — `GET /admin/tenant`
- `updateTenant(data: UpdateTenantRequest): Promise<Tenant>` — `PUT /admin/tenant`

### 1.7 New API file: `src/lib/api/service-accounts.ts`

- `getServiceAccounts(params?): Promise<PaginatedResponse<ServiceAccount>>` — `GET /service-accounts`
- `getServiceAccount(id): Promise<ServiceAccount>` — `GET /service-accounts/:id`
- `createServiceAccount(data): Promise<CreateServiceAccountResponse>` — `POST /service-accounts`
- `rotateServiceAccountKey(id): Promise<{ api_key: string }>` — `POST /service-accounts/:id/rotate-key`
- `revokeServiceAccount(id): Promise<void>` — `POST /service-accounts/:id/revoke`
- `deleteServiceAccount(id): Promise<void>` — `DELETE /service-accounts/:id`
- `getServiceAccountPermissions(id): Promise<ServiceAccountPermission[]>` — `GET /service-accounts/:id/permissions`
- `grantServiceAccountPermission(id, data): Promise<ServiceAccountPermission>` — `POST /service-accounts/:id/permissions`
- `removeServiceAccountPermission(id, collectionId): Promise<void>` — `DELETE /service-accounts/:id/permissions/:collectionId`

### 1.8 Export new API modules from `src/lib/api/index.ts`

### 1.9 New hooks file: `src/lib/hooks/use-tenant.ts`

- `useTenant()` — query for tenant details
- `useUpdateTenant()` — mutation with toast + invalidation of `["tenant"]`

### 1.10 New hooks file: `src/lib/hooks/use-service-accounts.ts`

- `useServiceAccounts(params?)` — paginated list query
- `useServiceAccount(id)` — single query
- `useCreateServiceAccount()` — mutation (no auto-toast — custom UX for API key display)
- `useRotateServiceAccountKey()` — mutation (no auto-toast — same reason)
- `useRevokeServiceAccount()` — mutation with toast
- `useDeleteServiceAccount()` — mutation with toast
- `useServiceAccountPermissions(id)` — query
- `useGrantServiceAccountPermission()` — mutation with toast
- `useRemoveServiceAccountPermission()` — mutation with toast

### 1.11 Export new hook modules from `src/lib/hooks/index.ts`

### 1.12 New validation schemas in `src/lib/utils/validation.ts`

```typescript
export const updateTenantSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  is_active: z.boolean().optional(),
});

export const createServiceAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  expires_at: z.string().optional(), // ISO 8601 date or empty
});
```

### 1.13 Add admin error codes to a new `src/lib/utils/admin-errors.ts`

Map backend error codes → user-friendly messages per the spec (DUPLICATE_EMAIL, DUPLICATE_SLUG, SELF_PERMISSION_REMOVAL, etc.). Provide a helper `getAdminErrorMessage(error)` that falls back to `getErrorMessage()`.

---

## Phase 2: Middleware & Navigation

### 2.1 Update middleware — protect `/admin` routes

**File**: `src/middleware.ts`

Add `"/admin"` to the `protectedRoutes` array. This ensures unauthenticated users are redirected to `/login`. (Role-based access is enforced client-side in the layout, since middleware only has the cookie, not the JWT role.)

### 2.2 Add admin section to sidebar

**File**: `src/components/layout/app-sidebar.tsx`

Add new `adminItems` array:
```typescript
const adminItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Tenant Settings", href: "/admin/settings", icon: Building2, roles: ["admin"] },
  { label: "Users", href: "/admin/users", icon: Users, roles: ["admin"] },
  { label: "Service Accounts", href: "/admin/service-accounts", icon: Key, roles: ["admin"] },
  { label: "Permissions", href: "/admin/permissions", icon: Shield, roles: ["admin"] },
];
```

Render as a new sidebar group between Insights and Settings:
```tsx
{filteredAdmin.length > 0 && (
  <SidebarGroup>
    <SidebarSeparator className="mb-2" />
    <SidebarGroupLabel>Admin</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu className="gap-0.5">{renderItems(filteredAdmin)}</SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
)}
```

### 2.3 Admin layout guard

**File**: `src/app/(dashboard)/admin/layout.tsx`

A thin layout that checks `user.role === "admin"` and shows a 403/not-found page if the user isn't an admin. All admin pages inherit this.

```tsx
"use client";
export default function AdminLayout({ children }) {
  const { user } = useAuthStore();
  if (!user || user.role !== "admin") {
    return <NotAuthorized />;
  }
  return <>{children}</>;
}
```

---

## Phase 3: Admin Pages

### 3.1 Admin Overview Dashboard — `/admin/page.tsx`

**Route**: `src/app/(dashboard)/admin/page.tsx`

- Fetch: `useTenant()`, `useStats()`, `useUsers({ limit: 1 })`, `useServiceAccounts({ limit: 1 })`
- Display tenant name as page header
- Stat cards grid (2x3):
  - Total Users (from `users.total`)
  - Total Collections (from `stats`)
  - Total Service Accounts (from `serviceAccounts.total`)
  - Parsing Failures (from `stats.parsing_failed`)
  - Pending Review (from `stats.review_pending`)
  - Validation Issues (from `stats.validation_invalid + stats.validation_warning`)
- Each card links to the relevant page

### 3.2 Tenant Settings — `/admin/settings/page.tsx`

**Route**: `src/app/(dashboard)/admin/settings/page.tsx`

- Fetch: `useTenant()`
- **View mode**: Card showing Name, Slug, Status badge, Created date — "Edit" button
- **Edit mode**: Form (React Hook Form + `updateTenantSchema`) with:
  - Name (text input)
  - Slug (text input, lowercase validation)
  - Active toggle — with warning alert when deactivating
- Handle `DUPLICATE_SLUG` error (409)
- Cancel returns to view mode

### 3.3 Admin Users Page — `/admin/users/page.tsx`

**Route**: `src/app/(dashboard)/admin/users/page.tsx`

This is a **new, richer** version of the existing `/users` page, tailored for admin workflows. The existing `/users` page remains unchanged.

- Fetch: `useUsers(params)` with pagination
- **Table columns**: Full Name, Email, Role (color-coded badge), Status (active/inactive), Email Verified (icon), Auth Provider, Doc Usage (for free users), Created date, Actions
- **Filters**: Role dropdown, Active/Inactive toggle — client-side filtering
- **Search**: Debounced text search on name/email
- **Create User dialog**: Form with email, password (strength indicator), full name, role dropdown (admin/manager/member/viewer — NOT free or service)
- **Edit User dialog**: Pre-populated form with role selector, active toggle (with warning), read-only fields (email verified, auth provider, quota info)
- **View User detail**: Separate page or dialog showing full user info
- **Delete User**: AlertDialog with user name/email confirmation
- **Role hierarchy help**: Tooltip or info panel showing the role table from spec

### 3.4 Service Accounts Page — `/admin/service-accounts/page.tsx`

**Route**: `src/app/(dashboard)/admin/service-accounts/page.tsx`

- Fetch: `useServiceAccounts(params)` with pagination
- **Table columns**: Name, Description, Key Prefix (`sk_XXXXXXXX...` in monospace), Status badge, Last Used, Expires, Created, Actions
- **Info box**: Service account restrictions (from spec section 4.6)
- **Create Service Account dialog**:
  - Form: Name, Description, Expiry date picker (optional)
  - On success: **API key reveal dialog** — monospace field, copy button, warning banner, "I've saved this key" confirmation checkbox before dismiss
- **Actions menu per row**: View Details, Rotate Key, Revoke, Delete
- **Rotate Key dialog**: Confirmation → on success, same API key reveal UX
- **Revoke dialog**: AlertDialog with warning about breaking integrations
- **Delete dialog**: AlertDialog (destructive)

### 3.5 Service Account Detail Page — `/admin/service-accounts/[id]/page.tsx`

**Route**: `src/app/(dashboard)/admin/service-accounts/[id]/page.tsx`

- Fetch: `useServiceAccount(id)`, `useServiceAccountPermissions(id)`
- **Info card**: Name, description, key prefix, status, creator, last used, expiry
- **Key actions**: Rotate Key button, Revoke button
- **Permissions table**: Collection name, permission level, remove button
- **Add Collection permission**: CollectionPicker + permission dropdown

### 3.6 Permissions Overview — `/admin/permissions/page.tsx`

**Route**: `src/app/(dashboard)/admin/permissions/page.tsx`

- Fetch: `useCollections({ limit: 100 })` — get all collections in tenant
- For each collection: show name, document count, count of explicit permission grants
- Link to manage each collection's permissions (reuses existing `/collections/[id]/settings`)
- Can also link to the collection detail page
- Summary view: "Who has access to what?" matrix or list

---

## Phase 4: Shared Admin Components

### 4.1 `src/components/admin/user-picker.tsx`

Searchable dropdown for selecting a tenant user.
- Fetch `useUsers({ limit: 100 })` for user list
- Filter by search text on `full_name` and `email`
- Display as `Full Name (email)`
- Used in: permission grants, assignment dialogs

### 4.2 `src/components/admin/collection-picker.tsx`

Searchable dropdown for selecting a collection.
- Fetch `useCollections({ limit: 100 })`
- Display as collection name + document count
- Used in: service account permission grants

### 4.3 `src/components/admin/api-key-reveal-dialog.tsx`

Reusable dialog for displaying a one-time API key.
- Monospace read-only text field with full key
- Copy to clipboard button (with success feedback)
- Warning banner: "Save this API key now. It will not be shown again."
- "I've saved this key" checkbox → enables Close button
- Used in: create service account, rotate key

### 4.4 `src/components/admin/role-badge.tsx`

Color-coded role badge component:
- admin → purple (`bg-purple-50 text-purple-700 border-purple-200` — or use CSS variable tokens if available)
- manager → blue
- member → teal
- viewer → gray
- free → green
- service → orange

Uses existing `Badge` component with appropriate variant/className.

### 4.5 `src/components/admin/role-info-panel.tsx`

Collapsible info panel showing the role hierarchy table (spec section 2.6). Used as a help tooltip or expandable section on the Users page.

### 4.6 `src/components/admin/service-account-restrictions.tsx`

Info box showing service account restrictions (spec section 4.6). Renders as a muted callout with a list of restrictions.

---

## Phase 5: Comprehensive Tests

### 5.1 Type & API tests

**`src/types/__tests__/tenant.test.ts`**
- Verify Tenant interface shape (type-level, compile check)

**`src/lib/api/__tests__/admin.test.ts`**
- Test `getTenant()` response unwrapping
- Test `updateTenant()` request body and response
- Test `DUPLICATE_SLUG` error handling (409)

**`src/lib/api/__tests__/service-accounts.test.ts`**
- Test all CRUD operations (list, get, create, rotate, revoke, delete)
- Test permission operations (list, grant, remove)
- Test response unwrapping for `createServiceAccount` (nested `{ service_account, api_key }`)
- Test error scenarios (404, 403, 409)

### 5.2 Hook tests

**`src/lib/hooks/__tests__/use-tenant.test.ts`**
- Test `useTenant()` fetches and returns tenant data
- Test `useUpdateTenant()` mutation → invalidates `["tenant"]`

**`src/lib/hooks/__tests__/use-service-accounts.test.ts`**
- Test `useServiceAccounts()` pagination
- Test `useCreateServiceAccount()` returns key
- Test `useRevokeServiceAccount()` success toast
- Test `useDeleteServiceAccount()` invalidation

### 5.3 Middleware test

**`src/__tests__/middleware.test.ts`** (extend existing)
- Test `/admin` routes require authentication (redirect to login)
- Test `/admin/settings`, `/admin/users` etc. are all protected

### 5.4 Component tests

**`src/components/admin/__tests__/api-key-reveal-dialog.test.tsx`**
- Renders the API key in a monospace field
- Copy to clipboard button works (mock `navigator.clipboard`)
- Close button disabled until "I've saved this key" is checked
- Close button enabled after checking

**`src/components/admin/__tests__/user-picker.test.tsx`**
- Renders user list
- Filters by search text
- Calls `onSelect` with selected user

**`src/components/admin/__tests__/collection-picker.test.tsx`**
- Renders collection list
- Filters by search text
- Shows document count

**`src/components/admin/__tests__/role-badge.test.tsx`**
- Renders correct color/variant for each role

### 5.5 Page tests

**`src/app/(dashboard)/admin/__tests__/page.test.tsx`** (Admin Overview)
- Shows loading skeletons when data is loading
- Shows stat cards with correct values when loaded
- Links navigate to correct pages
- Shows tenant name in header

**`src/app/(dashboard)/admin/settings/__tests__/page.test.tsx`** (Tenant Settings)
- Shows tenant info in view mode
- Switches to edit mode on button click
- Form validation (slug format)
- Submits update and shows success toast
- Handles DUPLICATE_SLUG error
- Deactivation warning appears when toggling active off

**`src/app/(dashboard)/admin/users/__tests__/page.test.tsx`** (Admin Users)
- Shows user table with all columns
- Search filters users client-side
- Role filter works
- Create user dialog opens and validates form
- Create user with DUPLICATE_EMAIL error (409)
- Edit user dialog pre-fills current values
- Role change warning displayed
- Delete user confirmation dialog works
- Pagination works

**`src/app/(dashboard)/admin/service-accounts/__tests__/page.test.tsx`** (Service Accounts)
- Shows service account table
- Create flow: form → submit → API key reveal dialog
- API key reveal: copy button, checkbox, close flow
- Rotate key flow: confirm → new key revealed
- Revoke flow: confirm dialog → success toast
- Delete flow: confirm dialog → removed from table
- Restrictions info box rendered

**`src/app/(dashboard)/admin/service-accounts/[id]/__tests__/page.test.tsx`** (SA Detail)
- Shows service account info
- Shows permission table
- Add collection permission flow
- Remove permission flow with confirmation
- Rotate key from detail page

**`src/app/(dashboard)/admin/permissions/__tests__/page.test.tsx`** (Permissions Overview)
- Shows all collections with permission counts
- Links to collection settings pages

### 5.6 Admin layout guard test

**`src/app/(dashboard)/admin/__tests__/layout.test.tsx`**
- Admin user sees children content
- Non-admin user sees "Not authorized" message
- Unauthenticated user sees "Not authorized" message

### 5.7 Sidebar test

**`src/components/layout/__tests__/app-sidebar.test.tsx`** (new or extend)
- Admin user sees Admin section with all 5 items
- Manager user does NOT see Admin section
- Member user does NOT see Admin section
- Free user does NOT see Admin section

### 5.8 Validation schema tests

**`src/lib/utils/__tests__/validation-admin.test.ts`**
- `updateTenantSchema`: valid inputs pass, invalid slug rejected, empty name rejected
- `createServiceAccountSchema`: name required, description optional, expires_at optional

---

## Phase 6: Integration & Polish

### 6.1 Update existing `/users` page breadcrumb/link

Add a subtle "Admin Users" link for admin users pointing to `/admin/users` for the richer management view.

### 6.2 Wire up collection detail → permission management

Ensure collection settings page at `/collections/[id]/settings` is reachable from the admin permissions overview.

### 6.3 Error boundary for admin pages

Add error.tsx files in `/admin/` route for graceful error handling.

### 6.4 Loading states

Add loading.tsx files in admin routes for Suspense fallback skeletons.

---

## File Inventory (New Files)

| File | Purpose |
|------|---------|
| `src/types/tenant.ts` | Tenant types |
| `src/types/service-account.ts` | Service account types |
| `src/lib/api/admin.ts` | Tenant API endpoints |
| `src/lib/api/service-accounts.ts` | Service account API endpoints |
| `src/lib/hooks/use-tenant.ts` | Tenant hooks |
| `src/lib/hooks/use-service-accounts.ts` | Service account hooks |
| `src/lib/utils/admin-errors.ts` | Admin error code mapping |
| `src/app/(dashboard)/admin/layout.tsx` | Admin role guard layout |
| `src/app/(dashboard)/admin/page.tsx` | Admin overview dashboard |
| `src/app/(dashboard)/admin/settings/page.tsx` | Tenant settings |
| `src/app/(dashboard)/admin/users/page.tsx` | Admin user management |
| `src/app/(dashboard)/admin/service-accounts/page.tsx` | Service account list |
| `src/app/(dashboard)/admin/service-accounts/[id]/page.tsx` | Service account detail |
| `src/app/(dashboard)/admin/permissions/page.tsx` | Permissions overview |
| `src/components/admin/user-picker.tsx` | User search/select component |
| `src/components/admin/collection-picker.tsx` | Collection search/select component |
| `src/components/admin/api-key-reveal-dialog.tsx` | API key one-time reveal |
| `src/components/admin/role-badge.tsx` | Color-coded role badge |
| `src/components/admin/role-info-panel.tsx` | Role hierarchy help panel |
| `src/components/admin/service-account-restrictions.tsx` | SA restrictions info box |

## Files Modified

| File | Change |
|------|--------|
| `src/lib/constants.ts` | Add `service` role, new helpers |
| `src/types/user.ts` | Add `auth_provider` field |
| `src/middleware.ts` | Add `/admin` to protected routes |
| `src/components/layout/app-sidebar.tsx` | Add Admin nav group |
| `src/lib/api/index.ts` | Export new modules |
| `src/lib/hooks/index.ts` | Export new hooks |
| `src/lib/utils/validation.ts` | Add admin schemas |

## Test Files (New)

| File |
|------|
| `src/lib/api/__tests__/admin.test.ts` |
| `src/lib/api/__tests__/service-accounts.test.ts` |
| `src/lib/hooks/__tests__/use-tenant.test.ts` |
| `src/lib/hooks/__tests__/use-service-accounts.test.ts` |
| `src/components/admin/__tests__/api-key-reveal-dialog.test.tsx` |
| `src/components/admin/__tests__/user-picker.test.tsx` |
| `src/components/admin/__tests__/collection-picker.test.tsx` |
| `src/components/admin/__tests__/role-badge.test.tsx` |
| `src/app/(dashboard)/admin/__tests__/layout.test.tsx` |
| `src/app/(dashboard)/admin/__tests__/page.test.tsx` |
| `src/app/(dashboard)/admin/settings/__tests__/page.test.tsx` |
| `src/app/(dashboard)/admin/users/__tests__/page.test.tsx` |
| `src/app/(dashboard)/admin/service-accounts/__tests__/page.test.tsx` |
| `src/app/(dashboard)/admin/service-accounts/[id]/__tests__/page.test.tsx` |
| `src/app/(dashboard)/admin/permissions/__tests__/page.test.tsx` |
| `src/components/layout/__tests__/app-sidebar.test.tsx` |
| `src/lib/utils/__tests__/validation-admin.test.ts` |
| `src/__tests__/middleware.test.ts` (extend) |

## Implementation Order

1. **Phase 1** — Foundation (types, API, hooks, schemas, error mapping)
2. **Phase 2** — Middleware + sidebar + admin layout guard
3. **Phase 3** — Pages, in order: Overview → Tenant Settings → Users → Service Accounts → SA Detail → Permissions
4. **Phase 4** — Shared components (build as needed during Phase 3, not all upfront)
5. **Phase 5** — Tests (write alongside each phase, not deferred to end)
6. **Phase 6** — Polish, loading states, error boundaries

Each phase should produce a commit. Lint + typecheck + test after each phase.
