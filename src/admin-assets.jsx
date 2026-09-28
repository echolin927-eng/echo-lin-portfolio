import { useMemo, useState } from 'react'

export default function SiteAssets({ assets, request, reload }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const groups = [...new Set(assets.map(item => item.group))]
  const visible = useMemo(() => assets.filter(item =>
    (group === 'all' || item.group === group) &&
    (!query || `${item.label} ${item.path}`.toLowerCase().includes(query.toLowerCase()))
  ), [assets, group, query])

  const replace = async (asset, event) => {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    if (file.size > 25 * 1024 * 1024) { setMessage('图片不能超过 25MB。'); return }
    const body = new FormData(); body.append('path', asset.path); body.append('image', file)
    setBusy(asset.path); setMessage('正在上传替换图片…')
    try { await request('/admin/assets/replace', { method: 'POST', body }); await reload(); setMessage('替换成功，游客端刷新后即可看到。') }
    catch (reason) { setMessage(reason.message) }
    finally { setBusy('') }
  }
  const visibility = async asset => {
    setBusy(asset.path)
    try { await request('/admin/assets/visibility', { method: 'POST', body: JSON.stringify({ path: asset.path, hidden: !asset.hidden }) }); await reload() }
    catch (reason) { setMessage(reason.message) }
    finally { setBusy('') }
  }
  const reset = async asset => {
    if (!confirm(`恢复“${asset.label}”的原始图片？`)) return
    setBusy(asset.path)
    try { await request('/admin/assets/reset', { method: 'POST', body: JSON.stringify({ path: asset.path }) }); await reload(); setMessage('已恢复原始图片。') }
    catch (reason) { setMessage(reason.message) }
    finally { setBusy('') }
  }

  return <section className="asset-library">
    <div className="asset-toolbar">
      <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索图片文件名…" />
      <select value={group} onChange={event => setGroup(event.target.value)}><option value="all">全部栏目</option>{groups.map(value => <option key={value}>{value}</option>)}</select>
    </div>
    <p className="asset-help">这里包含网站原来就有的图片。替换不会改变页面排版；“隐藏”可随时恢复，“恢复原图”会撤销替换。</p>
    {message && <p className="message is-success">{message}</p>}
    <div className="asset-grid">{visible.map(asset => <article className={`asset-card ${asset.hidden ? 'is-hidden' : ''}`} key={asset.path}>
      <div className="asset-preview"><img src={asset.url} alt="" loading="lazy" /><span>{asset.group}</span>{asset.replaced && <b>已替换</b>}</div>
      <div className="asset-copy"><strong title={asset.path}>{asset.label}</strong><small>{asset.path}</small></div>
      <div className="asset-actions">
        <label className="upload-button">{busy === asset.path ? '处理中…' : '上传替换'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={Boolean(busy)} onChange={event => replace(asset, event)} /></label>
        <button disabled={Boolean(busy)} onClick={() => visibility(asset)}>{asset.hidden ? '恢复显示' : '隐藏'}</button>
        {asset.replaced && <button disabled={Boolean(busy)} onClick={() => reset(asset)}>恢复原图</button>}
      </div>
    </article>)}</div>
    {!visible.length && <div className="empty-state">没有找到匹配的图片。</div>}
  </section>
}
