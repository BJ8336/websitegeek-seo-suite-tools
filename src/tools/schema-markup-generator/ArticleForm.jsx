import Field from './Field'

function ArticleForm({ fields, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="Headline *"
        value={fields.headline}
        onChange={(v) => onChange('headline', v)}
        placeholder="10 SEO Tips for 2026"
      />
      <Field
        label="Author *"
        value={fields.author}
        onChange={(v) => onChange('author', v)}
        placeholder="Jane Doe"
      />
      <Field
        label="Date Published *"
        type="date"
        value={fields.datePublished}
        onChange={(v) => onChange('datePublished', v)}
      />
      <Field
        label="Date Modified"
        type="date"
        value={fields.dateModified}
        onChange={(v) => onChange('dateModified', v)}
      />
      <Field
        label="Image URL"
        value={fields.image}
        onChange={(v) => onChange('image', v)}
        placeholder="https://example.com/image.jpg"
      />
      <Field
        label="Publisher Name"
        value={fields.publisherName}
        onChange={(v) => onChange('publisherName', v)}
        placeholder="WebsiteGeek"
      />
      <div className="sm:col-span-2">
        <Field
          label="Description"
          value={fields.description}
          onChange={(v) => onChange('description', v)}
          placeholder="Short summary of the article"
        />
      </div>
    </div>
  )
}

export default ArticleForm
