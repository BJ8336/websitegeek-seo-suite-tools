import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import CopyButton from '../../components/CopyButton'
import LockedOverlay from '../../components/LockedOverlay'
import { useSubscription } from '../../context/SubscriptionContext'
import { SCHEMA_TYPES, buildSchema, validateSchema } from '../../lib/schemaGenerator'
import { getToolBySlug } from '../../data/toolsConfig'
import ArticleForm from './ArticleForm'
import FaqForm from './FaqForm'
import LocalBusinessForm from './LocalBusinessForm'
import SoftwareApplicationForm from './SoftwareApplicationForm'

const tool = getToolBySlug('schema-markup-generator')

const TYPE_TABS = [
  { type: SCHEMA_TYPES.ARTICLE, label: 'Article', Form: ArticleForm, empty: {} },
  { type: SCHEMA_TYPES.FAQ_PAGE, label: 'FAQ Page', Form: FaqForm, empty: { questions: [] } },
  { type: SCHEMA_TYPES.LOCAL_BUSINESS, label: 'Local Business', Form: LocalBusinessForm, empty: {} },
  {
    type: SCHEMA_TYPES.SOFTWARE_APPLICATION,
    label: 'Software Application',
    Form: SoftwareApplicationForm,
    empty: {},
  },
]

function SchemaMarkupGenerator() {
  const { isPro } = useSubscription()
  const [activeType, setActiveType] = useState(SCHEMA_TYPES.ARTICLE)
  const [fieldsByType, setFieldsByType] = useState(() =>
    Object.fromEntries(TYPE_TABS.map((tab) => [tab.type, tab.empty])),
  )

  const activeTab = TYPE_TABS.find((tab) => tab.type === activeType)
  const fields = fieldsByType[activeType]

  const handleFieldChange = (key, value) => {
    setFieldsByType((prev) => ({ ...prev, [activeType]: { ...prev[activeType], [key]: value } }))
  }

  const schema = useMemo(() => buildSchema(activeType, fields), [activeType, fields])
  const errors = useMemo(() => validateSchema(activeType, fields), [activeType, fields])
  const json = useMemo(() => JSON.stringify(schema, null, 2), [schema])

  const ActiveForm = activeTab.Form

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveType(tab.type)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeType === tab.type
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <ActiveForm fields={fields} onChange={handleFieldChange} />
      </div>

      {errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Missing required fields
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-amber-700">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">JSON-LD output</p>
          {isPro && <CopyButton getText={() => json} />}
        </div>
        {isPro ? (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-slate-900 p-3 text-xs text-slate-100">
            {json}
          </pre>
        ) : (
          <LockedOverlay label="Unlock full JSON-LD code + copy with Pro">
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-slate-900 p-3 text-xs text-slate-100">
              {json}
            </pre>
          </LockedOverlay>
        )}
      </div>
    </div>
  )
}

export default SchemaMarkupGenerator
