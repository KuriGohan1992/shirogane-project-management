# Next.js Internship Capstone Project

> **Shiro** - A comprehensive 12-week full-stack development internship program focused on building a modern project management tool with Next.js 16, React 19, and TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.10.0-yellow?logo=pnpm)](https://pnpm.io/)

## 📚 Repository Structure

```
nextjs-internship-capstone/
├── project/              # Main Next.js application
│   ├── app/             # Next.js 16 App Router
│   ├── components/      # React components
│   ├── lib/             # Utilities and configurations
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # State management (Zustand)
│   ├── types/           # TypeScript definitions
│   └── README.md        # Project documentation
├── docs/                # Program documentation
│   ├── CODE_REVIEW_GUIDE.md
│   ├── DEVELOPMENT_SETUP.md
│   └── TIMELINE_MILESTONES.md
└── tasks/               # Task breakdown and planning
    ├── INDIVIDUAL_DEVELOPMENT_APPROACH.md
    └── tasks-capstone-project-management-tool.md
```

## 🎯 Project Overview

**Shiro** is a Kanban-style project management tool (similar to Trello/Asana) built as an internship capstone project. Each intern builds their own complete implementation from scratch, gaining hands-on experience with modern full-stack development.

### ✨ Key Features (Planned)

- 🔐 **Authentication** - Secure user authentication with Clerk
- 📊 **Project Management** - Create and manage multiple projects
- 📋 **Kanban Boards** - Drag-and-drop task management
- 👥 **Team Collaboration** - Task assignment and real-time updates
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 🌓 **Theme Support** - Dark/Light mode toggle

### 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.6 (App Router with Turbopack) |
| **Runtime** | React 19 |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 3.3 |
| **Database** | PostgreSQL + Drizzle ORM _(planned)_ |
| **Auth** | Clerk _(planned)_ |
| **State** | Zustand _(planned)_ |
| **Testing** | Jest, React Testing Library, Playwright _(planned)_ |
| **Deployment** | Vercel _(planned)_ |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ LTS
- **pnpm** 10.10.0+ (`npm install -g pnpm`)
- **Git** for version control
- **VS Code** (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/nextjs-internship-capstone.git
   cd nextjs-internship-capstone
   ```

2. **Navigate to the project directory**
   ```bash
   cd project
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   - Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Project README](project/README.md) | Main application documentation, including Vercel deployment & GitHub Actions workflow |
| [Development Setup](docs/DEVELOPMENT_SETUP.md) | Setup guide and git workflow |
| [Timeline & Milestones](docs/TIMELINE_MILESTONES.md) | 12-week project timeline |
| [Code Review Guide](docs/CODE_REVIEW_GUIDE.md) | Code review standards |
| [Tasks Breakdown](tasks/tasks-capstone-project-management-tool.md) | Detailed task list |
| [Individual Dev Approach](tasks/INDIVIDUAL_DEVELOPMENT_APPROACH.md) | Fork strategy, git workflow, deployment |

## 📅 12-Week Program Structure

### Phase 1: Foundation (Weeks 1-3)
- Project setup and Next.js fundamentals
- Environment configuration
- Git workflow and best practices

### Phase 2: Implementation (Weeks 4-8)
- Authentication with Clerk
- Database design and implementation
- Core CRUD operations
- Kanban board with drag-and-drop
- State management with Zustand

### Phase 3: Production (Weeks 9-12)
- Comprehensive testing
- Performance optimization
- Production deployment
- Documentation and showcase

## 🎓 Learning Objectives

By completing this capstone, interns will demonstrate:

- ✅ Full-stack Next.js 16 development with App Router
- ✅ Server Components and Server Actions
- ✅ TypeScript for type-safe development
- ✅ PostgreSQL database design with Drizzle ORM
- ✅ Authentication and authorization with Clerk
- ✅ Client-side state management with Zustand
- ✅ Testing strategies (unit, integration, E2E)
- ✅ Git workflow and collaboration
- ✅ Production deployment to Vercel (manual deploy recommended; GitHub Actions workflow included but disabled by default — see [project/README.md](project/README.md#-vercel-deployment))

## 🌟 Current Status

This is an **active learning project** currently in the setup phase:

- ✅ **Foundation Complete**: Next.js 16 + React 19 upgrade
- ✅ **UI Mockups**: Landing page and dashboard layouts
- ✅ **Type Definitions**: Complete TypeScript types
- ⏳ **In Progress**: Component development
- 📝 **Planned**: Authentication, database, testing

## 🔄 Development Approach

### Individual Development
Each intern builds their own complete version by:
1. **Forking** this repository
2. **Working independently** through all phases
3. **Building** the entire stack from start to finish
4. **Owning** their complete portfolio project

### Collaborative Learning
Despite individual development, interns collaborate through:
- Daily standups sharing progress and blockers
- Code review sessions for learning
- Technical discussions on implementation approaches
- Knowledge sharing and problem-solving

## 🤝 Contributing

This is an internship learning project. Each intern maintains their own fork and develops independently.

## 📄 License

This project is for educational purposes as part of the internship program.

## 🆘 Support & Resources

- **Project Documentation**: See [docs/](docs/) folder
- **Task Breakdown**: See [tasks/](tasks/) folder
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

**Built with ❤️ as part of the Stratpoint Engineering Internship Program**
