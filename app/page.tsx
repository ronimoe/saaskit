import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hello SaaS Kit! 🚀
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to the SaaS Kit monorepo demo application. 
          This demonstrates our working monorepo infrastructure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📦 Explore Packages
          </h2>
          <p className="text-gray-600 mb-4">
            View all the shared packages available in our monorepo, including UI components, 
            authentication, billing, and more.
          </p>
          <Link 
            href="/packages" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            View Packages
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🏗️ Monorepo Structure
          </h2>
          <p className="text-gray-600 mb-4">
            See the complete folder structure and organization of our monorepo, 
            including apps, packages, tools, and configuration.
          </p>
          <Link 
            href="/structure" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            View Structure
          </Link>
        </div>
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          ✨ Features Demonstrated
        </h2>
        <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            pnpm workspace configuration
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Turbo build orchestration
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Shared TypeScript configurations
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            ESLint and Prettier setup
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Vitest testing infrastructure
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Cross-package dependencies
          </li>
        </ul>
      </div>
    </div>
  )
} 