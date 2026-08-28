/**
 * PersonaSelect：输入框工具行的人设选择器——按官方权限/模型触发器与
 * Menu 组件的样式逐值复刻：28px 高 24px 胶囊触发器（默认透明、hover 浮现
 * 浅灰、chevron 120ms 旋转过渡）、29 号菜单卡片（12px 圆角、specific-menu
 * 底、40px 项/10px 圆角、hover 浅灰、选中仅打勾、向上弹出）。
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

type ScopeLike = {
  subscribe(listener: () => void): () => void
  getSnapshot(): any
  set(field: string, value: unknown): Promise<void>
}

function ChevronDown(props: { open: boolean }): any {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        flex: '0 0 auto',
        color: 'var(--dsw-alias-label-caption)',
        transform: props.open ? 'rotate(180deg)' : 'none',
        transition: 'transform 120ms ease',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3.5 5.25 7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function CheckIcon(): any {
  return (
    <span aria-hidden style={{ display: 'inline-flex', flex: 'none', color: 'var(--dsw-alias-label-primary)' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3.5 8.3 6.8 11.6 12.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function PersonaSelect(props: { sessionId: string; scope: ScopeLike }): any {
  const { sessionId, scope } = props
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement | null>(null)

  const snap = useSyncExternalStore(
    (listener: () => void) => scope.subscribe(listener),
    () => scope.getSnapshot(),
  )
  const value = snap?.value
  const templates = (value?.templates ?? []) as Array<{ id: string; name: string; text: string }>
  const sessions = (value?.sessions ?? {}) as Record<string, { id?: string; name: string; text: string }>
  const current = sessions[sessionId]

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent): void => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = async (id: string): Promise<void> => {
    setOpen(false)
    const next = { ...sessions }
    if (id === '') {
      delete next[sessionId]
    } else {
      const tpl = templates.find(t => t.id === id)
      if (tpl === undefined) return
      next[sessionId] = { id: tpl.id, name: tpl.name, text: tpl.text }
    }
    await scope.set('sessions', next)
  }

  return (
    <span
      ref={rootRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="为本对话选择人设模板（开始对话前也可选）"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          maxWidth: '220px',
          height: '28px',
          padding: '0 4px 0 8px',
          border: 'none',
          borderRadius: '24px',
          outline: 'none',
          background: 'transparent',
          color: 'var(--dsw-alias-label-secondary)',
          fontSize: '13px',
          lineHeight: '20px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 120ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--dsw-alias-interactive-bg-hover)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
      >
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current ? `人设：${current.name}` : '人设'}
        </span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            left: '0',
            bottom: 'calc(100% + 4px)',
            zIndex: 100,
            boxSizing: 'border-box',
            minWidth: '218px',
            maxWidth: '360px',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--dsw-alias-border-inverted)',
            borderRadius: '12px',
            background: 'var(--dsw-specific-menu)',
            boxShadow: 'var(--dsw-shadow-lv3)',
          }}
        >
          <button
            type="button"
            role="option"
            aria-selected={!current}
            onClick={() => void choose('')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              minHeight: '40px',
              padding: '8px 10px',
              border: 'none',
              borderRadius: '10px',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: '22px',
              color: 'var(--dsw-alias-label-primary)',
              textAlign: 'left',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--dsw-alias-interactive-bg-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              未设置
            </span>
            {!current && <CheckIcon />}
          </button>
          {templates.map(t => {
            const active = current?.id === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => void choose(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  minHeight: '40px',
                  padding: '8px 10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: 'var(--dsw-alias-label-primary)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--dsw-alias-interactive-bg-hover)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.name}
                </span>
                {active && <CheckIcon />}
              </button>
            )
          })}
        </div>
      )}
    </span>
  )
}
