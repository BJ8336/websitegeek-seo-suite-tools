import { Link } from 'react-router-dom'
import { CATEGORY_ORDER, getToolsByCategory } from '../data/toolsConfig'
import ToolIcon from '../components/ToolIcon'

function ToolCard({ tool }) {
  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm">
      {tool.proOnly && (
        <span className="absolute right-4 top-4 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
          Pro
        </span>
      )}
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <ToolIcon slug={tool.slug} className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-900">{tool.name}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-600">{tool.description}</p>
      <Link
        to={`/tools/${tool.slug}`}
        className="mt-4 inline-flex w-fit items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-700"
      >
        Go to Tool
      </Link>
    </div>
  )
}

function Home() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">WebsiteGeek SEO Suite</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Free, Browser-Based SEO Tools</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        WebsiteGeek SEO Suite is a collection of SEO tools — keyword research, on-page
        optimization, technical audits, and AI content analysis — for checking and improving a
        website's search visibility. Paste your content or page HTML into any tool below and get
        an instant result. The free tools work with no signup, and nothing you paste is ever sent
        to a server — everything runs directly in your browser.
      </p>

      <div className="mt-10 space-y-12">
        {CATEGORY_ORDER.map((category) => (
          <section key={category}>
            <h2 className="mb-4 text-lg font-bold text-slate-900">{category}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getToolsByCategory(category).map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Home
