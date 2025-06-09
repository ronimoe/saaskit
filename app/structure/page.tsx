export default function StructurePage() {
  const structure = [
    {
      name: '📁 apps/',
      description: 'Independent Next.js applications',
      children: [
        { name: 'main-app/', description: 'Main SaaS application' },
        { name: 'marketing-site/', description: 'Marketing website' },
        { name: 'web/', description: 'Demo application (this app!)' },
      ],
    },
    {
      name: '📁 packages/',
      description: 'Shared code libraries',
      children: [
        { name: 'auth/', description: 'Authentication utilities' },
        { name: 'billing/', description: 'Payment processing' },
        { name: 'email/', description: 'Email services' },
        { name: 'lib/', description: 'Utility functions' },
        { name: 'supabase/', description: 'Database client' },
        { name: 'types/', description: 'TypeScript types' },
        { name: 'ui/', description: 'React components' },
      ],
    },
    {
      name: '📁 tools/',
      description: 'Shared tooling and configurations',
      children: [
        { name: 'eslint-config/', description: 'ESLint configurations' },
        { name: 'tsconfig/', description: 'TypeScript configurations' },
        { name: 'vitest-config/', description: 'Testing configurations' },
      ],
    },
    {
      name: '📁 supabase/',
      description: 'Database migrations and functions',
      children: [
        { name: 'migrations/', description: 'Database schema migrations' },
        { name: 'functions/', description: 'Edge functions' },
      ],
    },
    {
      name: '📁 tests/',
      description: 'End-to-end testing',
      children: [
        { name: 'e2e/', description: 'E2E test files' },
        { name: 'fixtures/', description: 'Test data and fixtures' },
      ],
    },
  ]

  const rootFiles = [
    { name: 'package.json', description: 'Root package configuration' },
    { name: 'pnpm-workspace.yaml', description: 'pnpm workspace configuration' },
    { name: 'turbo.json', description: 'Turbo build orchestration' },
    { name: 'vitest.workspace.ts', description: 'Vitest workspace configuration' },
    { name: 'tsconfig.json', description: 'Root TypeScript configuration' },
    { name: '.gitignore', description: 'Git ignore patterns' },
    { name: 'pnpm-lock.yaml', description: 'Dependency lock file' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🏗️ Monorepo Structure
        </h1>
        <p className="text-lg text-gray-600">
          Complete folder structure and organization of the SaaS Kit monorepo.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📄 Root Configuration Files
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {rootFiles.map((file) => (
              <div key={file.name} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <span className="text-blue-600 font-mono text-sm">{file.name}</span>
                <span className="text-gray-600 text-sm">{file.description}</span>
              </div>
            ))}
          </div>
        </div>

        {structure.map((section) => (
          <div key={section.name} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {section.name}
              </h2>
              <p className="text-gray-600">{section.description}</p>
            </div>
            <div className="space-y-2">
              {section.children.map((child) => (
                <div key={child.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-gray-400">├─</span>
                  <span className="font-mono text-sm text-blue-600">{child.name}</span>
                  <span className="text-gray-600 text-sm">{child.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          🔧 Key Benefits
        </h2>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-center">
            <span className="text-blue-600 mr-2">•</span>
            Shared dependencies and configurations
          </li>
          <li className="flex items-center">
            <span className="text-blue-600 mr-2">•</span>
            Consistent tooling across all packages
          </li>
          <li className="flex items-center">
            <span className="text-blue-600 mr-2">•</span>
            Efficient build and test orchestration
          </li>
          <li className="flex items-center">
            <span className="text-blue-600 mr-2">•</span>
            Cross-package imports and code sharing
          </li>
        </ul>
      </div>
    </div>
  )
} 