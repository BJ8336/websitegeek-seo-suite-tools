import Field from './Field'

function LocalBusinessForm({ fields, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Business Name *" value={fields.name} onChange={(v) => onChange('name', v)} placeholder="WebsiteGeek" />
      <Field
        label="Telephone"
        value={fields.telephone}
        onChange={(v) => onChange('telephone', v)}
        placeholder="+1 555-123-4567"
      />
      <Field
        label="Street Address *"
        value={fields.streetAddress}
        onChange={(v) => onChange('streetAddress', v)}
        placeholder="123 Main St"
      />
      <Field label="City *" value={fields.addressLocality} onChange={(v) => onChange('addressLocality', v)} placeholder="Springfield" />
      <Field label="State / Region" value={fields.addressRegion} onChange={(v) => onChange('addressRegion', v)} placeholder="IL" />
      <Field label="Postal Code" value={fields.postalCode} onChange={(v) => onChange('postalCode', v)} placeholder="62701" />
      <Field label="Country" value={fields.addressCountry} onChange={(v) => onChange('addressCountry', v)} placeholder="US" />
      <Field label="Price Range" value={fields.priceRange} onChange={(v) => onChange('priceRange', v)} placeholder="$$" />
      <div className="sm:col-span-2">
        <Field label="Website URL" value={fields.url} onChange={(v) => onChange('url', v)} placeholder="https://example.com" />
      </div>
    </div>
  )
}

export default LocalBusinessForm
