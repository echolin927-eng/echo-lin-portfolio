const encoder = new TextEncoder()
const json = (data, init = {}) => new Response(JSON.stringify(data), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', ...init.headers } })
const error = (message, status = 400) => json({ error: message }, { status })
const cookieValue = (request, name) => request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1] || ''
const toBase64Url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
async function sign(value, secret) { const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(value))) }
async function authenticated(request, env) { const [expires, signature] = cookieValue(request, 'portfolio_admin').split('.'); return Boolean(expires && signature && Number(expires) >= Date.now() && signature === await sign(expires, env.ADMIN_PASSWORD || '')) }
async function projectRows(env, category, includeDrafts = false) {
  const conditions = [], values = []
  if (!includeDrafts) conditions.push('published = 1')
  if (category) { conditions.push('category = ?'); values.push(category) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const { results: projects } = await env.DB.prepare(`SELECT * FROM projects ${where} ORDER BY sort_order, created_at DESC`).bind(...values).all()
  if (!projects.length) return []
  const { results: images } = await env.DB.prepare(`SELECT id, project_id, file_key, alt, sort_order FROM images WHERE project_id IN (${projects.map(() => '?').join(',')}) ORDER BY sort_order, created_at`).bind(...projects.map(({ id }) => id)).all()
  return projects.map(project => ({ ...project, published: Boolean(project.published), images: images.filter(image => image.project_id === project.id).map(image => ({ ...image, url: `/api/portfolio/media/${encodeURIComponent(image.file_key)}` })) }))
}
const cleanProject = input => ({ title: String(input.title || '').trim().slice(0, 120), english: String(input.english || '').trim().slice(0, 120), description: String(input.description || '').trim().slice(0, 600), category: String(input.category || '').trim().slice(0, 80), published: input.published === false ? 0 : 1, sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 0 })
export async function onRequest({ request, env, params }) {
  if (!env.DB || !env.MEDIA || !env.ADMIN_PASSWORD) return error('后台尚未配置，请检查 Cloudflare 环境绑定。', 503)
  const method = request.method.toUpperCase(), parts = Array.isArray(params.path) ? params.path : params.path ? [params.path] : []
  if (method === 'GET' && parts[0] === 'media') {
    const object = await env.MEDIA.get(decodeURIComponent(parts.slice(1).join('/')))
    if (!object) return new Response('Not found', { status: 404 })
    const headers = new Headers(); object.writeHttpMetadata(headers); headers.set('etag', object.httpEtag); headers.set('cache-control', 'public, max-age=31536000, immutable')
    return new Response(object.body, { headers })
  }
  if (method === 'POST' && parts[0] === 'login') {
    const { password = '' } = await request.json().catch(() => ({}))
    if (!password || password !== env.ADMIN_PASSWORD) return error('密码不正确。', 401)
    const expires = String(Date.now() + 43200000), token = `${expires}.${await sign(expires, env.ADMIN_PASSWORD)}`
    return json({ ok: true }, { headers: { 'set-cookie': `portfolio_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` } })
  }
  if (method === 'POST' && parts[0] === 'logout') return json({ ok: true }, { headers: { 'set-cookie': 'portfolio_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' } })
  if (method === 'GET' && parts.length === 0) return json({ projects: await projectRows(env, new URL(request.url).searchParams.get('category')) })
  if (!(await authenticated(request, env))) return error('登录已失效，请重新登录。', 401)
  if (method === 'GET' && parts[0] === 'admin' && parts[1] === 'projects') return json({ projects: await projectRows(env, null, true) })
  if (method === 'POST' && parts[0] === 'admin' && parts[1] === 'projects' && parts.length === 2) {
    const p = cleanProject(await request.json()); if (!p.title || !p.category) return error('作品名称和分类不能为空。'); const id = crypto.randomUUID()
    await env.DB.prepare('INSERT INTO projects (id, title, english, description, category, published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, p.title, p.english, p.description, p.category, p.published, p.sort_order).run(); return json({ id }, { status: 201 })
  }
  const projectId = parts[2]
  if (parts[0] === 'admin' && parts[1] === 'projects' && projectId && parts.length === 3 && method === 'PUT') {
    const p = cleanProject(await request.json()); if (!p.title || !p.category) return error('作品名称和分类不能为空。')
    await env.DB.prepare('UPDATE projects SET title = ?, english = ?, description = ?, category = ?, published = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(p.title, p.english, p.description, p.category, p.published, p.sort_order, projectId).run(); return json({ ok: true })
  }
  if (parts[0] === 'admin' && parts[1] === 'projects' && projectId && parts.length === 3 && method === 'DELETE') {
    const { results } = await env.DB.prepare('SELECT file_key FROM images WHERE project_id = ?').bind(projectId).all(); await Promise.all(results.map(({ file_key }) => env.MEDIA.delete(file_key))); await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run(); return json({ ok: true })
  }
  if (parts[0] === 'admin' && parts[1] === 'projects' && projectId && parts[3] === 'images' && method === 'POST') {
    const files = (await request.formData()).getAll('images').filter(value => value instanceof File)
    if (!files.length) return error('请选择图片。'); if (files.length > 30) return error('一次最多上传 30 张图片。')
    const existing = await env.DB.prepare('SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM images WHERE project_id = ?').bind(projectId).first()
    for (const [index, file] of files.entries()) { if (!file.type.startsWith('image/')) return error(`${file.name} 不是图片文件。`); if (file.size > 20971520) return error(`${file.name} 超过 20MB。`); const extension = file.name.includes('.') ? `.${file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')}` : ''; const key = `${projectId}/${crypto.randomUUID()}${extension}`; await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type } }); await env.DB.prepare('INSERT INTO images (id, project_id, file_key, alt, sort_order) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), projectId, key, file.name.slice(0, 200), Number(existing.max_order) + index + 1).run() }
    return json({ ok: true }, { status: 201 })
  }
  if (parts[0] === 'admin' && parts[1] === 'images' && parts[2] && method === 'DELETE') { const image = await env.DB.prepare('SELECT file_key FROM images WHERE id = ?').bind(parts[2]).first(); if (!image) return error('图片不存在。', 404); await env.MEDIA.delete(image.file_key); await env.DB.prepare('DELETE FROM images WHERE id = ?').bind(parts[2]).run(); return json({ ok: true }) }
  if (parts[0] === 'admin' && parts[1] === 'projects' && projectId && parts[3] === 'images' && method === 'PUT') { const { imageIds = [] } = await request.json(); await Promise.all(imageIds.map((id, index) => env.DB.prepare('UPDATE images SET sort_order = ? WHERE id = ? AND project_id = ?').bind(index, id, projectId).run())); return json({ ok: true }) }
  return error('接口不存在。', 404)
}