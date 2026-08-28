/**
 * PersonaCard：设置页"人设"卡片——完全复刻官方插件卡片（PluginCard）视觉：
 * 12px 圆角、层次底色、头部 button 可点击折叠、旋转 chevron 图标、hover/展开
 * 变色，保存/删除按钮与官方 save/discard 一致。
 */
import { useEffect, useState, useSyncExternalStore } from 'react'

type ScopeLike = {
  subscribe(listener: () => void): () => void
  getSnapshot(): any
  set(field: string, value: unknown): Promise<void>
}

interface Template {
  id: string
  name: string
  text: string
}

/** 与官方 IconChevronDownOutline14 同款线条箭头（14px）。 */
function ChevronDown(props: { open: boolean }): any {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
      style={{
        flex: 'none',
        color: 'var(--dsw-alias-label-tertiary)',
        transform: props.open ? 'rotate(180deg)' : 'none',
        transition: 'transform .16s',
      }}
    >
      <path d="M3.5 5.25 7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PersonaCard(props: { scope: ScopeLike }): any {
  const { scope } = props
  // 与官方 PluginCard 一致：默认折叠（useState(false)）。
  const [open, setOpen] = useState(false)
  const snap = useSyncExternalStore(
    (listener: () => void) => scope.subscribe(listener),
    () => scope.getSnapshot(),
  )
  const templates = ((snap?.value?.templates ?? []) as Template[])

  const [sel, setSel] = useState('')
  const selected = templates.find(t => t.id === sel) ?? (templates[0] as Template | undefined)

  const [draftName, setDraftName] = useState('')
  const [draftText, setDraftText] = useState('')
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setDraftName(selected?.name ?? '')
    setDraftText(selected?.text ?? '')
    setSaved('')
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, snap])

  const save = async (): Promise<void> => {
    setError('')
    if (selected === undefined) return setError('请先新增一个模板。')
    const name = draftName.trim()
    const text = draftText.trim()
    if (name === '') return setError('模板名称不能为空。')
    if (text === '') return setError('模板文字不能为空。')
    const next = templates.map(t => (t.id === selected.id ? { ...t, name, text } : t))
    await scope.set('templates', next)
    setSaved('已保存')
  }

  const addNew = async (): Promise<void> => {
    setError('')
    setSaved('')
    try {
      const id = 'tpl-' + Date.now().toString(36)
      await scope.set('templates', [...templates, { id, name: '新模板', text: '' }])
      setSel(id)
      setSaved('')
    } catch (err) {
      setError(String(err))
    }
  }

  const remove = async (): Promise<void> => {
    setError('')
    setSaved('')
    try {
      if (selected === undefined) return
      const next = templates.filter(t => t.id !== selected.id)
      await scope.set('templates', next)
      setSel('')
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <li style={{
      listStyle: 'none',
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: '12px',
      background: open ? 'var(--dsw-alias-bg-layer-2)' : 'var(--dsw-alias-bg-layer-3)',
      transition: 'border-color .16s, background .16s',
      margin: '0',
    }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          appearance: 'none', border: 0, background: 'none', font: 'inherit', color: 'inherit',
          textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center',
          gap: '12px', padding: '14px 16px', borderRadius: '12px', width: '100%',
        }}
        aria-expanded={open}
      >
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, lineHeight: '1.4', color: 'var(--dsw-alias-label-primary)' }}>
            人设
          </span>
          <span style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--dsw-alias-label-tertiary)' }}>
            对话的人设模板库，可增删改；在对话输入框工具行选择使用。
          </span>
        </span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--dsw-alias-border-l2)', margin: '0 16px', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '12px 0 12px' }}>
            {templates.map(t => {
              const active = selected?.id === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSel(t.id)}
                  style={{
                    appearance: 'none', font: 'inherit', fontSize: '13px', lineHeight: '1.5',
                    padding: '3px 10px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${active ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-border-l2)'}`,
                    color: active ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
                    background: active ? 'var(--dsw-alias-bg-layer-2)' : 'none',
                  }}
                >
                  {t.name}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => void addNew()}
              style={{
                appearance: 'none', font: 'inherit', fontSize: '13px', lineHeight: '1.5',
                padding: '3px 10px', borderRadius: '8px', cursor: 'pointer',
                color: 'var(--dsw-alias-label-secondary)', background: 'none',
                border: '1px solid var(--dsw-alias-border-l2)',
              }}
            >
              ＋ 新增
            </button>
          </div>

          {selected === undefined ? (
            <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--dsw-alias-label-tertiary)' }}>
              还没有模板——点"＋ 新增"创建一个。
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--dsw-alias-label-tertiary)', marginBottom: '4px' }}>
                  名称
                </div>
                <input
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  placeholder="例如：梦境精灵"
                  style={{
                    font: 'inherit', fontSize: '14px', lineHeight: '1.6',
                    color: 'var(--dsw-alias-label-primary)',
                    backgroundColor: 'var(--dsw-alias-bg-layer-3)',
                    border: '1px solid var(--dsw-alias-border-l2)',
                    borderRadius: '8px', padding: '6px 10px', outline: 'none',
                    width: '100%', boxSizing: 'border-box',
                  }}
                  onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--dsw-alias-label-dimmed)' }}
                  onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--dsw-alias-border-l2)' }}
                />
              </div>

              <div>
                <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--dsw-alias-label-tertiary)', marginBottom: '4px' }}>
                  人设内容
                </div>
                <textarea
                  value={draftText}
                  onChange={e => setDraftText(e.target.value)}
                  placeholder="人设内容，支持 {{model}}、{{cwd}} 占位符；保存后用于新选择"
                  rows={4}
                  style={{
                    font: 'inherit', fontSize: '14px', lineHeight: '1.6',
                    color: 'var(--dsw-alias-label-primary)',
                    backgroundColor: 'var(--dsw-alias-bg-layer-3)',
                    border: '1px solid var(--dsw-alias-border-l2)',
                    borderRadius: '8px', padding: '6px 10px', outline: 'none',
                    width: '100%', boxSizing: 'border-box', resize: 'vertical',
                  }}
                  onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--dsw-alias-label-dimmed)' }}
                  onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--dsw-alias-border-l2)' }}
                />
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px',
                padding: '12px 0 4px', borderTop: '1px solid var(--dsw-alias-border-l2)', marginTop: '2px',
              }}>
                {saved !== '' && (
                  <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--dsw-alias-state-success-primary)', marginRight: 'auto' }}>
                    {saved}
                  </span>
                )}
                {error !== '' && (
                  <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--dsw-alias-state-error-primary)', marginRight: 'auto' }}>
                    {error}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void remove()}
                  style={{
                    appearance: 'none', font: 'inherit', fontSize: '13px', lineHeight: '1.5',
                    border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '8px', padding: '5px 14px',
                    cursor: 'pointer', background: 'none', color: 'var(--dsw-alias-label-secondary)',
                  }}
                >
                  删除
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  style={{
                    appearance: 'none', font: 'inherit', fontSize: '13px', lineHeight: '1.5',
                    border: '1px solid transparent', borderRadius: '8px', padding: '5px 14px',
                    cursor: 'pointer',
                    background: 'var(--dsw-alias-label-primary)', color: 'var(--dsw-alias-bg-layer-3)',
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  )
}
