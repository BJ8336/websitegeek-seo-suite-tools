import { Link } from 'react-router-dom'
import { useDocumentHead } from '../hooks/useDocumentHead'
import JsonLd from './JsonLd'

function GuideLayout({ title, description, schema, children }) {
  useDocumentHead({ title, description })

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd data={schema} />
      <Link to="/guides" className="text-sm text-blue-600 hover:underline">
        ← Back to Guides
      </Link>
      <div className="guide-content mt-4">{children}</div>
    </article>
  )
}

export default GuideLayout
