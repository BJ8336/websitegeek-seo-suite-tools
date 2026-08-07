export const SCHEMA_TYPES = {
  ARTICLE: 'Article',
  FAQ_PAGE: 'FAQPage',
  LOCAL_BUSINESS: 'LocalBusiness',
  SOFTWARE_APPLICATION: 'SoftwareApplication',
}

function buildArticleSchema(fields) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fields.headline?.trim() || undefined,
    author: fields.author?.trim() ? { '@type': 'Person', name: fields.author.trim() } : undefined,
    datePublished: fields.datePublished?.trim() || undefined,
    dateModified: fields.dateModified?.trim() || undefined,
    image: fields.image?.trim() || undefined,
    description: fields.description?.trim() || undefined,
    publisher: fields.publisherName?.trim()
      ? { '@type': 'Organization', name: fields.publisherName.trim() }
      : undefined,
  }
}

function buildFaqSchema(fields) {
  const validPairs = (fields.questions || []).filter((q) => q.question?.trim() && q.answer?.trim())
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validPairs.map((q) => ({
      '@type': 'Question',
      name: q.question.trim(),
      acceptedAnswer: { '@type': 'Answer', text: q.answer.trim() },
    })),
  }
}

function buildLocalBusinessSchema(fields) {
  const hasAddress = fields.streetAddress?.trim() || fields.addressLocality?.trim()
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: fields.name?.trim() || undefined,
    telephone: fields.telephone?.trim() || undefined,
    url: fields.url?.trim() || undefined,
    priceRange: fields.priceRange?.trim() || undefined,
    address: hasAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: fields.streetAddress?.trim() || undefined,
          addressLocality: fields.addressLocality?.trim() || undefined,
          addressRegion: fields.addressRegion?.trim() || undefined,
          postalCode: fields.postalCode?.trim() || undefined,
          addressCountry: fields.addressCountry?.trim() || undefined,
        }
      : undefined,
  }
}

function buildSoftwareApplicationSchema(fields) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: fields.name?.trim() || undefined,
    applicationCategory: fields.applicationCategory?.trim() || undefined,
    operatingSystem: fields.operatingSystem?.trim() || undefined,
    offers: fields.price?.trim()
      ? { '@type': 'Offer', price: fields.price.trim(), priceCurrency: fields.priceCurrency?.trim() || 'USD' }
      : undefined,
  }
}

const BUILDERS = {
  [SCHEMA_TYPES.ARTICLE]: buildArticleSchema,
  [SCHEMA_TYPES.FAQ_PAGE]: buildFaqSchema,
  [SCHEMA_TYPES.LOCAL_BUSINESS]: buildLocalBusinessSchema,
  [SCHEMA_TYPES.SOFTWARE_APPLICATION]: buildSoftwareApplicationSchema,
}

export function buildSchema(type, fields) {
  const builder = BUILDERS[type]
  return builder ? builder(fields) : null
}

export function validateSchema(type, fields) {
  const errors = []

  if (type === SCHEMA_TYPES.ARTICLE) {
    if (!fields.headline?.trim()) errors.push('Headline is required.')
    if (!fields.author?.trim()) errors.push('Author is required.')
    if (!fields.datePublished?.trim()) errors.push('Date published is required.')
  } else if (type === SCHEMA_TYPES.FAQ_PAGE) {
    const validPairs = (fields.questions || []).filter((q) => q.question?.trim() && q.answer?.trim())
    if (validPairs.length === 0) errors.push('At least one question with an answer is required.')
  } else if (type === SCHEMA_TYPES.LOCAL_BUSINESS) {
    if (!fields.name?.trim()) errors.push('Business name is required.')
    if (!fields.streetAddress?.trim()) errors.push('Street address is required.')
    if (!fields.addressLocality?.trim()) errors.push('City is required.')
  } else if (type === SCHEMA_TYPES.SOFTWARE_APPLICATION) {
    if (!fields.name?.trim()) errors.push('Application name is required.')
    if (!fields.applicationCategory?.trim()) errors.push('Application category is required.')
    if (!fields.operatingSystem?.trim()) errors.push('Operating system is required.')
  }

  return errors
}
