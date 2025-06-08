# pnpm Workspace Management Guide

This guide covers efficient package management using pnpm workspaces in the SaaS Kit monorepo.

## 📋 Table of Contents

- [Workspace Overview](#workspace-overview)
- [Installation & Setup](#installation--setup)
- [Common Commands](#common-commands)
- [Dependency Management](#dependency-management)
- [Package Scripts](#package-scripts)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🔍 Workspace Overview

The SaaS Kit monorepo is structured with the following workspace packages:

```
saaskit/
├── apps/
│   ├── main-app/          # @saas/main-app - Main Next.js application
│   └── marketing-site/    # @saas/marketing-site - Marketing website
├── packages/
│   ├── auth/             # @saas/auth - Authentication utilities
│   ├── billing/          # @saas/billing - Stripe billing integration
│   ├── email/            # @saas/email - Email utilities
│   ├── lib/              # @saas/lib - Shared utilities
│   ├── supabase/         # @saas/supabase - Supabase client
│   ├── types/            # @saas/types - TypeScript type definitions
│   └── ui/               # @saas/ui - React UI components
└── tools/
    ├── eslint-config/    # @repo/eslint-config - ESLint configuration
    ├── tsconfig/         # @repo/tsconfig - TypeScript configurations
    ├── tsup-config/      # @repo/tsup-config - Build tool configuration
    └── vitest-config/    # @repo/vitest-config - Test configuration
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ and pnpm 9+
- pnpm installed globally: `npm install -g pnpm`

### Initial Setup

```bash
# Install all dependencies across the workspace
pnpm install

# Verify workspace configuration
pnpm list --recursive --depth=0
```

## ⚡ Common Commands

### Workspace Management

```bash
# Install dependencies for all packages
pnpm install

# Add a dependency to a specific package
pnpm --filter @saas/auth add lodash

# Add a dev dependency to the root
pnpm add -D -w prettier

# Remove a dependency from a specific package
pnpm --filter @saas/ui remove react-icons

# Update all dependencies
pnpm update --recursive

# List all workspace packages
pnpm list --recursive --depth=0
```

### Build & Development

```bash
# Build all packages (uses Turbo for orchestration)
pnpm build

# Start development mode for all packages
pnpm dev

# Run linting across all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code across all packages
pnpm format:fix

# Type check all packages
pnpm type-check
```

### Package-Specific Commands

```bash
# Run a command in a specific package
pnpm --filter @saas/auth build
pnpm --filter @saas/main-app dev

# Run a command in multiple packages using glob patterns
pnpm --filter "@saas/*" build
pnpm --filter "apps/*" test

# Run a command in a package and its dependencies
pnpm --filter @saas/main-app... build

# Run a command in packages that depend on a specific package
pnpm --filter ...@saas/types build
```

## 📦 Dependency Management

### Workspace Dependencies

Use `workspace:*` syntax for internal package dependencies:

```json
{
  "dependencies": {
    "@saas/types": "workspace:*",
    "@saas/lib": "workspace:*"
  },
  "devDependencies": {
    "@repo/tsconfig": "workspace:*",
    "@repo/eslint-config": "workspace:*"
  }
}
```

### Version Constraints

- `workspace:*` - Use any version from workspace
- `workspace:^` - Use compatible version from workspace  
- `workspace:~` - Use patch-level compatible version

### Adding Dependencies

```bash
# Add external dependency to a specific package
pnpm --filter @saas/auth add axios

# Add workspace dependency
pnpm --filter @saas/auth add @saas/types@workspace:*

# Add peer dependency
pnpm --filter @saas/ui add react@^19.0.0 --save-peer

# Add dev dependency to multiple packages
pnpm --filter "@saas/*" add -D vitest
```

## 🔧 Package Scripts

All packages follow standardized script conventions:

### Library Packages

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:fix": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

### Application Packages

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:fix": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

## ✅ Best Practices

### 1. Dependency Management

- Always use `workspace:*` for internal packages
- Pin external dependencies to specific versions for stability
- Use `pnpm --filter` instead of `cd` + `pnpm` for package-specific operations
- Keep `pnpm-lock.yaml` committed to version control

### 2. Development Workflow

```bash
# Start development session
pnpm install          # Ensure all deps are installed
pnpm build           # Build all packages
pnpm dev             # Start development servers

# Before committing
pnpm lint:fix        # Fix linting issues
pnpm format:fix      # Format code
pnpm type-check      # Verify TypeScript
pnpm build           # Ensure everything builds
```

### 3. Package Organization

- Use `@saas/*` namespace for application packages
- Use `@repo/*` namespace for tooling packages
- Keep shared utilities in `@saas/lib`
- Define types in `@saas/types` for reuse

### 4. Configuration

- Extend shared configurations (`@repo/tsconfig`, `@repo/eslint-config`)
- Use consistent script names across packages
- Document package-specific setup in individual READMEs

## 🛠️ Troubleshooting

### Common Issues

#### 1. Workspace Dependencies Not Resolving

```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. TypeScript Import Errors

```bash
# Rebuild all packages
pnpm build

# Check TypeScript configuration
pnpm type-check
```

#### 3. Dependency Version Conflicts

```bash
# Check for conflicting versions
pnpm list --recursive

# Update specific dependency
pnpm --filter @saas/auth update lodash
```

#### 4. Build Failures

```bash
# Build packages in dependency order
pnpm build

# Build specific package and its dependencies
pnpm --filter @saas/main-app... build
```

### Debugging Commands

```bash
# Show workspace configuration
pnpm config list

# Show dependency tree
pnpm list --recursive --depth=2

# Check for outdated dependencies
pnpm outdated --recursive

# Verify workspace package links
pnpm exec -- ls -la node_modules/@saas/
```

## 📚 Additional Resources

- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
- [pnpm CLI Reference](https://pnpm.io/cli/install)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [Project Folder Structure Guide](./FOLDER-STRUCTURE.md)

---

For questions or issues, refer to the main project documentation or create an issue in the repository. 