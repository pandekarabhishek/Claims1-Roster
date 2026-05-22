const BASE = process.env.REACT_APP_API_URL || ''

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
  return json
}

// Map .NET PascalCase response → camelCase JS shape
export function mapLeave(l) {
  return {
    id:       l.id,
    emp:      l.emp,
    type:     l.type,
    from:     l.fromDate,   // .NET: fromDate → JS: from
    to:       l.toDate,     // .NET: toDate   → JS: to
    note:     l.note ?? '',
    dayCount: l.dayCount,
    createdAt:l.createdAt,
  }
}

export const api = {
  getLeaves:   async ()          => { const r = await request('GET', '/api/leaves');           return r.data.map(mapLeave) },
  addLeave:    async (data)      => { const r = await request('POST','/api/leaves', {
                                        emp:      data.emp,
                                        type:     data.type,
                                        fromDate: data.from,   // JS: from → .NET: fromDate
                                        toDate:   data.to,
                                        note:     data.note || ''
                                      }); return mapLeave(r.data) },
  deleteLeave: async (id)        => request('DELETE', `/api/leaves/${id}`),
  getEmpLeaves:async (emp)       => { const r = await request('GET', `/api/leaves/emp/${encodeURIComponent(emp)}`); return r.data.map(mapLeave) },
  health:      async ()          => request('GET', '/health'),
}
