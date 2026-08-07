import Field from './Field'

function SoftwareApplicationForm({ fields, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Application Name *" value={fields.name} onChange={(v) => onChange('name', v)} placeholder="WebsiteGeek SEO Suite" />
      <Field
        label="Application Category *"
        value={fields.applicationCategory}
        onChange={(v) => onChange('applicationCategory', v)}
        placeholder="BusinessApplication"
      />
      <Field
        label="Operating System *"
        value={fields.operatingSystem}
        onChange={(v) => onChange('operatingSystem', v)}
        placeholder="Web"
      />
      <Field label="Price" value={fields.price} onChange={(v) => onChange('price', v)} placeholder="0.00" />
      <Field
        label="Price Currency"
        value={fields.priceCurrency}
        onChange={(v) => onChange('priceCurrency', v)}
        placeholder="USD"
      />
    </div>
  )
}

export default SoftwareApplicationForm
