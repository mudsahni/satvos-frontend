# DocFlow

A modern, light-mode-first document processing and validation frontend built with Next.js 16, React 19, and Tailwind CSS. Inspired by Notion, Stripe, and Linear.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS, Radix UI primitives
- **State Management**: Zustand (auth), TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Theme**: next-themes (light/dark mode)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── collections/   # Collection management
│   │   ├── documents/     # Document list and detail views
│   │   ├── exceptions/    # Documents needing attention
│   │   ├── upload/        # File upload
│   │   ├── settings/      # User settings
│   │   └── users/         # Team management (admin)
│   ├── globals.css        # Global styles and CSS variables
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── collections/       # Collection cards, headers, filters
│   ├── documents/         # Document viewers, tabs, tables
│   ├── layout/            # TopNav, AppSidebar
│   ├── search/            # Global search (Cmd+K)
│   └── ui/                # Reusable UI primitives (shadcn/ui style)
├── lib/
│   ├── api/               # API client and endpoints
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── store/                 # Zustand stores
└── types/                 # TypeScript type definitions
```

## Key Features

### Document Processing
- Upload PDF/image documents
- Automatic parsing with AI extraction
- Field-level confidence scores
- Inline validation with expandable error messages

### Document Detail View
- Split-pane layout: PDF viewer (left) + tabbed data (right)
- Tabs: Extracted Data, Validations, History
- Resizable panels
- Mobile-responsive stacked view
- Review workflow (approve/reject with keyboard shortcuts)

### Collections
- Card-based grid view
- Document count, owner, permission badges
- Filter and search

### Dashboard
- Stats overview (documents, pending review, exceptions)
- Recent collections grid
- Documents needing attention

### Theme
- Light mode by default with dark mode toggle
- Indigo primary color (#6366f1)
- Consistent design system (see `DESIGN_SYSTEM.md`)

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## API Integration

The frontend expects a backend API with the following endpoints:

- `POST /auth/login` - Authentication
- `GET /collections` - List collections
- `GET /collections/:id` - Get collection detail
- `GET /documents` - List documents
- `GET /documents/:id` - Get document detail with parsed_data
- `POST /documents/:id/parse` - Trigger parsing
- `POST /documents/:id/validate` - Trigger validation
- `POST /documents/:id/review` - Submit review (approve/reject)
- `GET /files/:id/download` - Get S3 pre-signed URL

## Design System

See `DESIGN_SYSTEM.md` for comprehensive documentation on:
- Colors and semantic tokens
- Typography scale
- Spacing system (4px base)
- Component sizing standards
- Shadow/elevation levels
- Animation guidelines

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

- `CLAUDE.md` - Development guide for AI assistants
- `DESIGN_SYSTEM.md` - Visual design specifications
