import Image from "next/image";

export default function Home() {
  const packages = [
    { name: '@saas/ui', description: 'Shared UI components and design system' },
    { name: '@saas/auth', description: 'Authentication utilities and hooks' },
    { name: '@saas/supabase', description: 'Supabase integration and database operations' },
    { name: '@saas/billing', description: 'Stripe integration and payment logic' },
    { name: '@saas/email', description: 'Email utilities and templates' },
    { name: '@saas/lib', description: 'Shared utility functions and helpers' },
    { name: '@saas/types', description: 'Shared TypeScript definitions' },
  ];

  const apps = [
    { name: '@saas/main-app', description: 'Primary SaaS application (this app)' },
    { name: 'marketing-site', description: 'Marketing website (planned)' },
  ];

  const tools = [
    { name: '@repo/tsconfig', description: 'Shared TypeScript configurations' },
    { name: '@repo/eslint-config', description: 'Shared ESLint rules' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Hello SaaS Kit! 🚀
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Welcome to your migration-ready SaaS platform monorepo
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            ✅ Monorepo infrastructure successfully initialized
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              📱 Applications
            </h2>
            <div className="space-y-3">
              {apps.map((app) => (
                <div key={app.name} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {app.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              📦 Shared Packages
            </h2>
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.name} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {pkg.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🛠️ Development Tools
            </h2>
            <div className="space-y-3">
              {tools.map((tool) => (
                <div key={tool.name} className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🏗️ Monorepo Structure
          </h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <div className="text-gray-700 dark:text-gray-300">
              <div>📁 saaskit/</div>
              <div className="ml-4">├── 📁 apps/ <span className="text-gray-500"># Next.js applications</span></div>
              <div className="ml-8">├── 📁 main-app/ <span className="text-gray-500"># Primary SaaS app</span></div>
              <div className="ml-8">└── 📁 marketing-site/ <span className="text-gray-500"># Marketing website</span></div>
              <div className="ml-4">├── 📁 packages/ <span className="text-gray-500"># Shared code</span></div>
              <div className="ml-8">├── 📁 ui/ <span className="text-gray-500"># Component library</span></div>
              <div className="ml-8">├── 📁 auth/ <span className="text-gray-500"># Authentication</span></div>
              <div className="ml-8">├── 📁 supabase/ <span className="text-gray-500"># Database operations</span></div>
              <div className="ml-8">├── 📁 billing/ <span className="text-gray-500"># Stripe integration</span></div>
              <div className="ml-8">├── 📁 email/ <span className="text-gray-500"># Email utilities</span></div>
              <div className="ml-8">├── 📁 lib/ <span className="text-gray-500"># Utility functions</span></div>
              <div className="ml-8">└── 📁 types/ <span className="text-gray-500"># TypeScript definitions</span></div>
              <div className="ml-4">├── 📁 supabase/ <span className="text-gray-500"># Database migrations & functions</span></div>
              <div className="ml-4">├── 📁 tools/ <span className="text-gray-500"># Shared tooling</span></div>
              <div className="ml-4">└── 📁 tests/ <span className="text-gray-500"># E2E tests</span></div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">pnpm workspace</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Turbo build system</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
