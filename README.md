# Mortis Atlas

Elite tier 1 venture capital fund management platform for Mortis Ventures - comprehensive CRM, deal flow management, portfolio tracking, and LP relations.

## 🎯 Vision

Build a world-class, in-house fund management system that provides:
- **Complete data ownership** - No vendor lock-in, all data in our database
- **Defense tech focused** - Built for deep tech and defense innovation investing
- **Elite aesthetics** - Professional, data-dense interface inspired by Linear and Bloomberg
- **Scalable architecture** - Handle 500-1000 companies/year, 30-50 portfolio companies

## 🏗️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Recharts/D3.js** - Data visualization

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database (via Supabase)
- **tRPC** - End-to-end typesafe APIs

### Infrastructure
- **Supabase** - PostgreSQL hosting + Auth + Storage
- **Vercel** - Frontend deployment
- **GitHub Actions** - CI/CD

### Integrations
- **Gmail API** - Email integration for deal flow
- **Carta API** - Cap table data sync
- **AWS S3 / Supabase Storage** - Document management

## 📁 Project Structure

```
mortis-atlas/
├── src/
│   ├── app/              # Next.js 14 app directory
│   │   ├── (auth)/       # Authentication routes
│   │   ├── (dashboard)/  # Main app routes
│   │   ├── api/          # API routes
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── companies/    # Company-related components
│   │   ├── deals/        # Deal flow components
│   │   ├── portfolio/    # Portfolio management
│   │   └── lp/           # LP management
│   ├── lib/              # Utility functions
│   │   ├── db/           # Database utilities
│   │   ├── api/          # API clients
│   │   └── utils.ts      # Helper functions
│   ├── server/           # tRPC server
│   │   ├── routers/      # API routers
│   │   └── context.ts    # tRPC context
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
├── docs/                 # Documentation
│   ├── DATABASE.md       # Database schema docs
│   ├── API.md            # API documentation
│   └── DEVELOPMENT.md    # Development guide
└── tests/                # Test files
```

## 🗄️ Core Data Models

### Companies
- Company profile (name, website, description, sector)
- Founding team information
- Deal stage tracking (Initial Review → DD → Investment Decision)
- Tags and categorization (defense sub-sector, technology areas)
- Activity history

### Contacts
- Founder and stakeholder information
- Relationship tracking
- Communication history
- LinkedIn integration

### Deals
- Investment pipeline management
- Due diligence checklists
- Investment committee memos
- Document repository
- Deal scoring and metrics

### Portfolio
- Portfolio company dashboard
- Quarterly update tracking
- Key metrics and KPIs
- Value creation initiatives
- Board meeting notes

### LPs (Limited Partners)
- LP database and profiles
- Capital commitments and calls
- Distribution tracking
- Quarterly reporting
- Communication logs

### Fund Operations
- Capital call management
- Distribution calculations
- Expense tracking
- Accounting export (QuickBooks-compatible)
- Carry tracking

## 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [x] GitHub repository setup
- [ ] Next.js project initialization
- [ ] Database schema design
- [ ] Authentication setup (Google OAuth)
- [ ] Basic CRUD operations

### Phase 2: Core CRM (Weeks 3-4)
- [ ] Company database and list view
- [ ] Company detail pages
- [ ] Contact management
- [ ] Search and filtering
- [ ] Tags and categorization

### Phase 3: Deal Flow (Weeks 5-6)
- [ ] Pipeline stage management
- [ ] Kanban board view
- [ ] Activity logging
- [ ] Gmail integration
- [ ] Deal scoring system

### Phase 4: Investment Process (Weeks 7-8)
- [ ] Due diligence checklists
- [ ] IC memo creation
- [ ] Document management
- [ ] Investment committee dashboard

### Phase 5: Portfolio Management (Weeks 9-10)
- [ ] Portfolio dashboard
- [ ] Update tracking
- [ ] Analytics and reporting
- [ ] Metrics visualization

### Phase 6: LP & Fund Ops (Weeks 11-12)
- [ ] LP database
- [ ] Capital call tracking
- [ ] Distribution management
- [ ] Quarterly report generation
- [ ] Accounting export

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL (via Supabase account)
- Git
- Code editor (VS Code recommended)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/MortisVentures/mortis-atlas.git
   cd mortis-atlas
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your:
   - `DATABASE_URL` (Supabase PostgreSQL connection string)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

4. **Initialize database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to `http://localhost:3000`

## 🤖 Working with Claude Code

This project is designed for AI-assisted development with Claude Code. Best practices:

### 1. Keep Context Updated
Maintain a `CLAUDE_CONTEXT.md` file with:
- Current tech stack decisions
- Database schema
- Key architecture patterns
- Coding conventions

### 2. Iterative Development
Build features in small, testable increments:
```
✅ Good: "Create a Prisma schema for the Company model"
❌ Bad: "Build the entire CRM system"
```

### 3. Test Immediately
Run the code after each Claude session to catch issues early.

### 4. Commit Frequently
Commit working code after each feature completion.

## 📊 Database Schema Overview

**Core Tables:**
- `users` - Platform users
- `companies` - Company database
- `contacts` - People/founders
- `deals` - Investment pipeline
- `portfolio_companies` - Post-investment tracking
- `lps` - Limited partners
- `capital_calls` - LP capital management
- `documents` - File metadata
- `activities` - Activity log
- `tags` - Taxonomies and categorization

See `docs/DATABASE.md` for detailed schema.

## 🎨 Design Philosophy

**"Defense Tech Bloomberg"**
- Clean, professional, data-dense
- Dark mode native
- Fast keyboard navigation (command palette)
- Information hierarchy like military briefings
- Print-ready reports (IC memos, LP reports)

**Visual Inspirations:**
- Linear (workflow excellence)
- Stripe Dashboard (data clarity)
- Palantir Foundry (sophisticated but usable)
- Bloomberg Terminal (information density)

## 📝 Contributing

This is a private repository for Mortis Ventures internal development.

## 📄 License

Proprietary - All rights reserved by Mortis Ventures

---

**Built with 🛡️ for defense tech innovation investing**
