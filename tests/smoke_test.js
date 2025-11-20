// Simple smoke test for basic protections
// Usage: set BASE_URL (default http://localhost:3000) and run with Node 18+

const BASE = process.env.BASE_URL || 'http://localhost:3000'

async function run() {
  console.log('Base URL:', BASE)

  // 1) Public programs endpoint should be reachable
  try {
    const res = await fetch(`${BASE}/api/programs`)
    console.log('/api/programs ->', res.status)
  } catch (err) {
    console.error('Failed to reach /api/programs:', err)
  }

  // 2) Protected admin endpoint should require auth (expect 401)
  try {
    const res = await fetch(`${BASE}/api/admin/certificates/issue`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) })
    console.log('/api/admin/certificates/issue (no auth) ->', res.status)
    const body = await res.text()
    console.log('Response body:', body)
  } catch (err) {
    console.error('Failed to reach protected endpoint:', err)
  }

  // 3) Public certificate fetch should return 404 for unknown code
  try {
    const res = await fetch(`${BASE}/api/certificates/public/THIS_SHOULD_NOT_EXIST`)
    console.log('/api/certificates/public/THIS_SHOULD_NOT_EXIST ->', res.status)
  } catch (err) {
    console.error('Failed to reach public certificate endpoint:', err)
  }
}

run().catch((e) => { console.error(e); process.exit(1) })
