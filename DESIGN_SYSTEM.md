# Satvos Design System

A comprehensive guide to maintaining visual consistency across the Satvos application.

---

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Sizing](#sizing)
5. [Shadows & Elevation](#shadows--elevation)
6. [Border Radius](#border-radius)
7. [Components](#components)
8. [Layout](#layout)
9. [Icons](#icons)
10. [Animation](#animation)

---

## Colors

### Brand Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Primary | `hsl(239 84% 67%)` (#6366f1) | `hsl(239 84% 67%)` | Primary actions, links, active states |
| Primary Foreground | `hsl(0 0% 100%)` | `hsl(0 0% 100%)` | Text on primary background |

### Semantic Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Background | `hsl(0 0% 100%)` | `hsl(224 71% 4%)` | Page background |
| Foreground | `hsl(222 47% 11%)` | `hsl(213 31% 91%)` | Primary text |
| Card | `hsl(0 0% 100%)` | `hsl(224 71% 4%)` | Card backgrounds |
| Muted | `hsl(220 14% 96%)` | `hsl(215 28% 17%)` | Subtle backgrounds |
| Muted Foreground | `hsl(220 9% 46%)` | `hsl(217 11% 65%)` | Secondary text |
| Border | `hsl(220 13% 93%)` | `hsl(220 20% 16%)` | Borders, dividers |

### Status Colors

| Status | Color Value | Background | Border | Usage |
|--------|-------------|------------|--------|-------|
| Success | `hsl(142 76% 36%)` | `success-bg` | `success-border` | Approved, passed, completed |
| Warning | `hsl(38 92% 50%)` | `warning-bg` | `warning-border` | Warnings, pending review |
| Error | `hsl(0 84% 60%)` | `error-bg` | `error-border` | Errors, rejected, failed |

### Usage Guidelines

```tsx
// Primary actions
<Button>Submit</Button>
<Button variant="default">Primary Action</Button>

// Secondary actions
<Button variant="secondary">Cancel</Button>
<Button variant="outline">Alternative</Button>

// Status indicators
<Badge variant="success">Approved</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
```

---

## Typography

### Font Family

- **Primary**: `var(--font-jakarta)` - Plus Jakarta Sans
- **Monospace**: `var(--font-geist-mono)` - Geist Mono (code, timestamps)

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| Display | 36px (2.25rem) | 1.2 | 600 | Page titles, hero text |
| H1 | 30px (1.875rem) | 1.3 | 600 | Section headers |
| H2 | 24px (1.5rem) | 1.35 | 600 | Card titles, subsections |
| H3 | 20px (1.25rem) | 1.4 | 600 | Component headers |
| H4 | 18px (1.125rem) | 1.4 | 600 | Labels, small headers |
| Body | 16px (1rem) | 1.5 | 400 | Default text |
| Body Small | 14px (0.875rem) | 1.5 | 400 | Secondary text, descriptions |
| Caption | 12px (0.75rem) | 1.4 | 400 | Labels, timestamps |
| Tiny | 10px (0.625rem) | 1.2 | 500 | Badges, keyboard shortcuts |

### Usage Guidelines

```tsx
// Page titles
<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

// Section headers
<h2 className="text-2xl font-semibold">Collections</h2>

// Card titles
<h3 className="text-lg font-semibold">Invoice Details</h3>

// Body text
<p className="text-sm text-muted-foreground">Description text</p>

// Captions
<span className="text-xs text-muted-foreground">Last updated 2 hours ago</span>
```

---

## Spacing

### Base Unit

All spacing is based on a **4px** base unit.

### Spacing Scale

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `0.5` | 0.125rem | 2px | Tight gaps (icon margins) |
| `1` | 0.25rem | 4px | Minimal spacing |
| `1.5` | 0.375rem | 6px | Compact elements |
| `2` | 0.5rem | 8px | Default small gap |
| `3` | 0.75rem | 12px | Medium gap |
| `4` | 1rem | 16px | Standard padding |
| `5` | 1.25rem | 20px | Medium padding |
| `6` | 1.5rem | 24px | Large padding |
| `8` | 2rem | 32px | Section spacing |
| `10` | 2.5rem | 40px | Large section spacing |
| `12` | 3rem | 48px | Page sections |
| `16` | 4rem | 64px | Major sections |

### Component Spacing Standards

| Component | Padding | Gap |
|-----------|---------|-----|
| Card | `p-4` (16px) or `p-6` (24px) | - |
| Button (sm) | `px-3 py-1.5` | - |
| Button (default) | `px-4 py-2` | - |
| Button (lg) | `px-6 py-3` | - |
| Input | `px-3 py-2` | - |
| Form fields | - | `gap-4` between fields |
| Card grid | - | `gap-4` or `gap-6` |
| Inline elements | - | `gap-2` |
| Section content | - | `gap-6` or `gap-8` |

### Usage Guidelines

```tsx
// Card with standard padding
<Card className="p-6">...</Card>

// Form field spacing
<div className="space-y-4">
  <FormField />
  <FormField />
</div>

// Grid gaps
<div className="grid gap-4 md:gap-6">...</div>

// Inline items
<div className="flex items-center gap-2">...</div>
```

---

## Sizing

### Fixed Heights

| Element | Height | Class |
|---------|--------|-------|
| Top Navigation | 56px | `h-14` |
| Sidebar (collapsed) | auto | `w-16` |
| Sidebar (expanded) | auto | `w-64` |
| Button (sm) | 32px | `h-8` |
| Button (default) | 36px | `h-9` |
| Button (lg) | 40px | `h-10` |
| Button (icon) | 36px | `h-9 w-9` |
| Input | 36px | `h-9` |
| Avatar (sm) | 32px | `h-8 w-8` |
| Avatar (default) | 40px | `h-10 w-10` |
| Avatar (lg) | 48px | `h-12 w-12` |
| Badge | 20px | `h-5` |
| Tab | 48px | `h-12` |
| Table Row | 52px | `h-13` |

### Icon Sizes

| Context | Size | Class |
|---------|------|-------|
| Inline with text | 16px | `h-4 w-4` |
| Button icon | 16px | `h-4 w-4` |
| Card icon | 20px | `h-5 w-5` |
| Feature icon | 24px | `h-6 w-6` |
| Empty state | 32px | `h-8 w-8` |
| Hero/illustration | 48-64px | `h-12 w-12` to `h-16 w-16` |

### Max Widths

| Element | Max Width | Class |
|---------|-----------|-------|
| Search bar | 512px | `max-w-lg` |
| Form | 480px | `max-w-lg` |
| Dialog (sm) | 384px | `max-w-sm` |
| Dialog (default) | 512px | `max-w-lg` |
| Dialog (lg) | 640px | `max-w-xl` |
| Content area | 1280px | `max-w-7xl` |

---

## Shadows & Elevation

### Design Philosophy

The design system follows a **flat, borderless** approach. Cards, buttons, and inputs do not use shadows at rest. Shadows are reserved for elevated overlays (dropdowns, modals) and opt-in interactive hover states via the `.card-hover` utility.

### Shadow Scale (Available for Opt-in Use)

| Level | Token | CSS | Usage |
|-------|-------|-----|-------|
| 0 | none | `shadow-none` | Default for cards, buttons, inputs |
| 1 | soft-sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle lift (opt-in) |
| 2 | soft | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | *Not used at rest* |
| 3 | soft-md | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | `.card-hover` on hover |
| 4 | soft-lg | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Dropdowns, popovers |
| 5 | soft-xl | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Modals |

### Dark Mode Glows

| Level | Token | Color | Usage |
|-------|-------|-------|-------|
| Status Success | glow-success | Green | Success badges |
| Status Warning | glow-warning | Amber | Warning badges |
| Status Error | glow-error | Red | Error badges |
| Primary | glow-sm | Primary | Interactive elements |

### Usage Guidelines

```tsx
// Interactive card hover (using .card-hover utility)
<Card className="card-hover cursor-pointer">...</Card>
// Applies: hover:-translate-y-0.5 hover:shadow-soft-md transition-all

// Interactive card hover (using border highlight)
<Card className="hover:border-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer">...</Card>

// Dropdown
<DropdownMenuContent className="shadow-soft-lg">...</DropdownMenuContent>

// Status badge with glow (dark mode)
<Badge variant="success" className="dark:shadow-glow-success">Approved</Badge>
```

---

## Border Radius

### Base Radius

`--radius: 0.625rem` (10px) — set in `globals.css`. Components derive their radius from this base value.

### Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Small inline elements |
| `rounded` | 6px | Buttons |
| `rounded-md` | 8px | Buttons, containers |
| `rounded-lg` | 10px | Inputs, skeletons, sidebar items |
| `rounded-xl` | 16px | Cards, icon containers, dropzones |
| `rounded-full` | 9999px | Avatars, badges (pill shape), workspace tags |

### Component Standards

| Component | Border Radius |
|-----------|---------------|
| Button | `rounded-md` |
| Input | `rounded-lg` |
| Card | `rounded-xl` |
| Badge | `rounded-full` (pill) |
| Avatar | `rounded-full` |
| Dialog | `rounded-lg` |
| Dropdown | `rounded-md` |
| Tooltip | `rounded-md` |
| Skeleton | `rounded-lg` |
| Icon container | `rounded-xl` |
| Sidebar item | `rounded-lg` |

---

## Components

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| Default | Primary | Primary Foreground | None | Primary actions |
| Secondary | Muted | Foreground | None | Secondary actions |
| Outline | Transparent | Foreground | Border | Alternative actions |
| Ghost | Transparent | Foreground | None | Subtle actions |
| Destructive | Error | White | None | Dangerous actions |

```tsx
// Primary action
<Button>Save Changes</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Outline action
<Button variant="outline">Download</Button>

// Ghost action (icons, subtle)
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>

// Destructive action
<Button variant="destructive">Delete</Button>
```

### Cards

Cards are **flat by default** — no shadow, border-only. Use `rounded-xl` for soft feel.

```tsx
// Standard card (flat, border-only)
<Card className="p-6">
  <CardHeader className="p-0 pb-4">
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent className="p-0">
    Content here
  </CardContent>
</Card>

// Interactive card (border highlight on hover)
<Card className="p-6 hover:border-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer">
  ...
</Card>

// Interactive card (shadow on hover via utility)
<Card className="p-6 card-hover cursor-pointer">
  ...
</Card>
```

### Badges

| Variant | Usage |
|---------|-------|
| default | Primary info |
| secondary | Neutral info |
| outline | Subtle categorization |
| success | Positive status |
| warning | Attention needed |
| error | Negative status |
| processing | In-progress state |
| pending | Awaiting action |

### Tables

Table headers use **uppercase tracking** for a clean, structured look. Row hover is subtle (`muted/30`). Cells have generous padding (`py-3 px-3`).

```tsx
<Table>
  <TableHeader>
    <TableRow className="hover:bg-transparent">
      <TableHead className="w-[100px]">ID</TableHead>  {/* auto: text-xs uppercase tracking-wider */}
      <TableHead>Name</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>  {/* auto: hover:bg-muted/30 */}
      <TableCell className="font-medium">001</TableCell>
      <TableCell>Item name</TableCell>
      <TableCell className="text-right">$100.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Layout

### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ Top Nav (h-14, sticky)                                  │
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│ Side   │  Main Content                                  │
│ bar    │  (p-4 md:p-6 lg:p-8)                           │
│        │                                                │
│ (w-64/ │  ┌────────────────────────────────────────┐   │
│  w-16) │  │ Page Header                            │   │
│        │  │ (pb-6 or pb-8)                         │   │
│        │  └────────────────────────────────────────┘   │
│        │                                                │
│        │  ┌────────────────────────────────────────┐   │
│        │  │ Content Section                        │   │
│        │  │ (space-y-6)                            │   │
│        │  └────────────────────────────────────────┘   │
│        │                                                │
└────────┴────────────────────────────────────────────────┘
```

### Page Header Pattern

```tsx
<div className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">Page Title</h1>
    <p className="text-muted-foreground">Page description or subtitle</p>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline">Secondary</Button>
    <Button>Primary Action</Button>
  </div>
</div>
```

### Grid Layouts

```tsx
// Card grid - responsive
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <Card>...</Card>
</div>

// Dashboard stats - responsive
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatCard>...</StatCard>
</div>

// Two-column layout
<div className="grid gap-6 lg:grid-cols-2">
  <div>Left column</div>
  <div>Right column</div>
</div>
```

### Sidebar

The sidebar uses an **indigo pill** active state:

| State | Style |
|-------|-------|
| Active | `bg-primary text-primary-foreground rounded-lg` (full indigo pill, white text/icon) |
| Inactive | `text-muted-foreground hover:bg-muted/50 rounded-lg` |
| Group labels | Sentence case ("Menu", "Settings") — `text-xs font-medium text-muted-foreground` |

```tsx
// Active navigation item
<SidebarMenuButton className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
  <Icon className="text-primary-foreground" /> Label
</SidebarMenuButton>

// Inactive navigation item
<SidebarMenuButton className="text-muted-foreground hover:bg-muted/50 rounded-lg">
  <Icon /> Label
</SidebarMenuButton>
```

### Top Navigation

The top nav uses a subtle bottom border (single-pixel shadow line instead of `border-b`):

```tsx
// Header separator
className="shadow-[0_1px_0_0_hsl(var(--border))]"

// Search bar: prominent, muted background, no border
className="bg-muted/60 rounded-lg h-10 border-0 hover:bg-muted"
```

### Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

---

## Icons

### Icon Library

Use **Lucide React** for all icons.

### Standard Sizes

| Context | Size | Class |
|---------|------|-------|
| Inline text | 16px | `h-4 w-4` |
| Navigation | 20px | `h-5 w-5` |
| Feature | 24px | `h-6 w-6` |
| Empty state | 32-48px | `h-8 w-8` (inside `h-16 w-16` circle) |

### Common Icons

| Action | Icon |
|--------|------|
| Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Close | `X` |
| Search | `Search` |
| Filter | `Filter` |
| Settings | `Settings` |
| Back | `ArrowLeft` |
| More | `MoreHorizontal` |
| Check | `Check` or `CheckCircle` |
| Error | `XCircle` or `AlertCircle` |
| Warning | `AlertTriangle` |
| Info | `Info` |
| Loading | `Loader2` (with `animate-spin`) |

---

## Animation

### Transition Durations

| Duration | Value | Usage |
|----------|-------|-------|
| Fast | 150ms | Micro-interactions (hover) |
| Default | 200ms | Most transitions |
| Medium | 300ms | Modals, larger elements |
| Slow | 500ms | Page transitions |

### Standard Transitions

```tsx
// Interactive elements (buttons, inputs, cards)
className="transition-all duration-200"

// Hover effects
className="hover:bg-muted transition-colors"
className="hover:shadow-soft-lg transition-shadow"
className="hover:-translate-y-0.5 transition-transform"
```

### Focus Ring Standard

All interactive elements use a consistent focus ring:

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
```

### Active Press State

Buttons include a subtle scale-down on press:

```tsx
className="active:scale-[0.97]"
```

### Overlay Standard

All dialogs, sheets, and modals use a softened overlay:

```tsx
className="bg-black/60"  // Not bg-black/80
```

### Empty State Standard

All empty state icon circles use consistent sizing:

```tsx
<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
  <Icon className="h-8 w-8 text-muted-foreground" />
</div>
```

### Search Input Standard

Search inputs follow a consistent pattern:

```tsx
<div className="relative max-w-sm">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input className="pl-9" placeholder="Search..." />
</div>
```

### Loading States

```tsx
// Spinner
<Loader2 className="h-4 w-4 animate-spin" />

// Skeleton (shimmer sweep animation)
<Skeleton className="h-4 w-24" />

// Custom shimmer utility class
className="animate-shimmer-skeleton"
```

---

## Implementation Checklist

When creating new components or pages:

- [ ] Use correct color tokens (never hardcode colors)
- [ ] Follow spacing scale (use Tailwind spacing classes)
- [ ] Use correct typography scale
- [ ] Apply proper border radius
- [ ] Include hover/focus states
- [ ] Add transitions for interactive elements
- [ ] Ensure responsive design
- [ ] Test in both light and dark modes
- [ ] Verify accessibility (contrast, focus states)

---

## Quick Reference

### Common Class Combinations

```tsx
// Page container
"p-4 md:p-6 lg:p-8 space-y-6"

// Card (flat, border-only)
"rounded-xl border bg-card p-6"

// Interactive card (border highlight)
"rounded-xl border bg-card p-6 hover:border-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer"

// Interactive card (shadow hover via utility)
"rounded-xl border bg-card p-6 card-hover cursor-pointer"

// Section header
"text-lg font-semibold"

// Muted text
"text-sm text-muted-foreground"

// Flex row with gap
"flex items-center gap-2"

// Grid layout
"grid gap-4 sm:grid-cols-2 lg:grid-cols-3"

// Form field container
"space-y-2"

// Form section
"space-y-4"

// Status badge (pill shape, success)
"inline-flex items-center rounded-full border border-success-border bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success"

// Icon container (feature/stat cards)
"p-2.5 rounded-xl bg-muted/40"
```
