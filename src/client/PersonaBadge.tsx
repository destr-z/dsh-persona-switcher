/**
 * PersonaBadge：会话标题旁的一行小字，显示该会话当前使用的人设名。
 * 纯展示：读 settings 镜像快照（订阅自动刷新），未设置时不渲染。
 */
import { useSyncExternalStore } from 'react'

type BadgeScope = {
  subscribe(listener: () => void): () => void
  getSnapshot(): any
}

export function PersonaBadge(props: { sessionId: string; scope: BadgeScope }): any {
  const { sessionId, scope } = props
  const snap = useSyncExternalStore(
    (listener: () => void) => scope.subscribe(listener),
    () => scope.getSnapshot(),
  )
  const entry = snap?.value?.sessions?.[sessionId]
  if (!entry?.name) return null
  return (
    <span
      style={{
        fontSize: '12px',
        color: 'var(--dsw-alias-label-secondary)',
        whiteSpace: 'nowrap',
      }}
      title={`当前对话人设：${entry.name}`}
    >
      人设：{entry.name}
    </span>
  )
}
