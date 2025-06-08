export default function PackagesPage() {
  const packages = [
    {
      name: '@saas/auth',
      description: 'Authentication and authorization utilities',
      version: '0.1.0',
      type: 'Library',
    },
    {
      name: '@saas/billing',
      description: 'Subscription and payment processing',
      version: '0.1.0',
      type: 'Library',
    },
    {
      name: '@saas/email',
      description: 'Email templates and sending utilities',
      version: '0.1.0',
      type: 'Library',
    },
    {
      name: '@saas/lib',
      description: 'Shared utilities and helper functions',
      version: '0.1.0',
      type: 'Library',
    },
    {
      name: '@saas/supabase',
      description: 'Supabase client and database utilities',
      version: '0.1.0',
      type: 'Library',
    },
    {
      name: '@saas/types',
      description: 'Shared TypeScript types and interfaces',
      version: '0.1.0',
      type: 'Library',
    },
    {
      name: '@saas/ui',
      description: 'Reusable React components and UI elements',
      version: '0.1.0',
      type: 'Library',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📦 Monorepo Packages
        </h1>
        <p className="text-lg text-gray-600">
          All shared packages available in the SaaS Kit monorepo. These packages can be imported 
          and used across different applications in the workspace.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.name} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {pkg.name}
              </h3>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {pkg.type}
              </span>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              {pkg.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">v{pkg.version}</span>
              <span className="text-green-600 font-medium">✓ Installed</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          💡 Usage Example
        </h2>
        <div className="bg-gray-800 text-white p-4 rounded font-mono text-sm overflow-x-auto">
          <div className="text-green-400">// Import packages in your application</div>
          <div className="mt-1">import {"{ Button }"} from &#39;@saas/ui&#39;</div>
          <div>import {"{ useAuth }"} from &#39;@saas/auth&#39;</div>
          <div>import {"{ formatCurrency }"} from &#39;@saas/lib&#39;</div>
          <div className="mt-2 text-green-400">// Use in your components</div>
          <div className="mt-1">const {"{ user }"} = useAuth()</div>
          <div>const price = formatCurrency(2999)</div>
        </div>
      </div>
    </div>
  )
} 