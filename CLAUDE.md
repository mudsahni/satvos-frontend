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
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
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
| `src/components/ui/` | Reusable UI components |
| `src/components/layout/top-nav.tsx` | Top navigation with search, theme toggle |
| `src/components/layout/app-sidebar.tsx` | Collapsible sidebar navigation |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout with sidebar + top nav |

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

### Design System Reference
See `DESIGN_SYSTEM.md` for:
- Color tokens and usage
- Typography scale
- Spacing scale (4px base)
- Component sizing standards
- Shadow/elevation levels
- Common class combinations
