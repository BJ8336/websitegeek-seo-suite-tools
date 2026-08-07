function escapeCsvField(value) {
  const str = String(value ?? '')
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function rowsToCsv(rows, columns) {
  const header = columns.map((col) => escapeCsvField(col.label)).join(',')
  const lines = rows.map((row) => columns.map((col) => escapeCsvField(col.value(row))).join(','))
  return [header, ...lines].join('\n')
}
