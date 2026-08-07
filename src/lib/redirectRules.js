function validRedirects(redirects) {
  return redirects.filter((r) => r.from.trim() && r.to.trim())
}

/**
 * Splits generated rule text (blocks are separated by blank lines) into its
 * first block and everything after — used to show a free "first rule only"
 * preview while the rest stays Pro-gated.
 */
export function splitFirstBlock(text) {
  const blocks = text.trim().split(/\n\n+/)
  return { first: blocks[0] || '', rest: blocks.slice(1).join('\n\n') }
}

export function buildApacheRules({ redirects, wwwMode, trailingSlashMode }) {
  const lines = ['RewriteEngine On', '']

  if (wwwMode === 'force-www') {
    lines.push('# Force www')
    lines.push('RewriteCond %{HTTP_HOST} !^www\\. [NC]')
    lines.push('RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [L,R=301]')
    lines.push('')
  } else if (wwwMode === 'force-non-www') {
    lines.push('# Force non-www')
    lines.push('RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]')
    lines.push('RewriteRule ^(.*)$ https://%1/$1 [L,R=301]')
    lines.push('')
  }

  if (trailingSlashMode === 'add') {
    lines.push('# Add trailing slash')
    lines.push('RewriteCond %{REQUEST_URI} /+[^.]+$')
    lines.push('RewriteCond %{REQUEST_URI} !/$')
    lines.push('RewriteRule ^(.*[^/])$ /$1/ [L,R=301]')
    lines.push('')
  } else if (trailingSlashMode === 'remove') {
    lines.push('# Remove trailing slash')
    lines.push('RewriteCond %{REQUEST_FILENAME} !-d')
    lines.push('RewriteRule ^(.*)/$ /$1 [L,R=301]')
    lines.push('')
  }

  const redirectRows = validRedirects(redirects)
  if (redirectRows.length > 0) {
    lines.push('# Custom redirects')
    for (const r of redirectRows) {
      lines.push(`Redirect ${r.type} ${r.from.trim()} ${r.to.trim()}`)
    }
    lines.push('')
  }

  return `${lines.join('\n').trim()}\n`
}

export function buildNginxRules({ redirects, wwwMode, trailingSlashMode }) {
  const lines = []

  if (wwwMode === 'force-www') {
    lines.push('# Force www — replace example.com with your domain')
    lines.push('if ($host = example.com) {')
    lines.push('    return 301 https://www.example.com$request_uri;')
    lines.push('}')
    lines.push('')
  } else if (wwwMode === 'force-non-www') {
    lines.push('# Force non-www — replace example.com with your domain')
    lines.push('if ($host = www.example.com) {')
    lines.push('    return 301 https://example.com$request_uri;')
    lines.push('}')
    lines.push('')
  }

  if (trailingSlashMode === 'add') {
    lines.push('# Add trailing slash')
    lines.push('rewrite ^([^.]*[^/])$ $1/ permanent;')
    lines.push('')
  } else if (trailingSlashMode === 'remove') {
    lines.push('# Remove trailing slash')
    lines.push('rewrite ^/(.*)/$ /$1 permanent;')
    lines.push('')
  }

  const redirectRows = validRedirects(redirects)
  if (redirectRows.length > 0) {
    lines.push('# Custom redirects')
    for (const r of redirectRows) {
      const flag = r.type === '301' ? 'permanent' : 'redirect'
      lines.push(`rewrite ^${r.from.trim()}$ ${r.to.trim()} ${flag};`)
    }
    lines.push('')
  }

  return `${lines.join('\n').trim()}\n`
}
