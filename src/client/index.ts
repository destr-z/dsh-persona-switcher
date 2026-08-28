/**
 * @dsh-external/dsh-persona-switcher — browser half。
 *
 * 三个 UI 挂点：
 * 1. 设置页卡片（settings.plugin.item）：模板库管理（增删改）。
 * 2. 输入区选择器（conversation.input.dock）：开始对话前/对话中挑选模板。
 * 3. 会话头部小徽标（conversation.session.header.utilities）：显示当前人设名。
 *
 * 读写都经 ctx.settingsScope（host settings 服务的浏览器镜像），与 host 端
 * 同一数据源；选择模板后 host 的 watch 会立即把文本应用到会话。
 */
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SlotsService } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import { PersonaCard } from './PersonaCard.tsx'
import { PersonaSelect } from './PersonaSelect.tsx'

/** Settings namespace（必须与 host 端一致）。 */
const NS = 'persona-switcher'

type ClientContext = {
  slots: SlotsService
  settingsScope: {
    bind(options: { namespace: string; decode?: (value: unknown) => unknown }): unknown
  }
}

export const inject = ['slots', 'settingsScope']

export function apply(ctx: ClientContext): void {
  console.info('[persona-switcher] client apply: start')
  try {
    // 直接取原始值（我们的 schema 不是 schemastery 格式，默认 decode 会拒绝）。
    const scope = ctx.settingsScope.bind({
      namespace: NS,
      decode: (value: unknown) => value,
    })

    // ── 设置页卡片：模板库管理 ──────────────────────────────────────────────
    ctx.slots.inject('settings.plugin.item', function* () {
      yield ctx.slots.register({
        name: 'settings.plugin.item',
        key: NS,
        inject: () => ({ scope }),
      }, PersonaCard)
    })

    // ── 输入框工具行：人设选择器（不占新行，与 Workspace Write 等控件同排）──
    ctx.slots.inject('conversation.input.left', () =>
      ctx.slots.register({
        name: 'conversation.input.left',
        id: NS + '-select',
        order: 30,
        inject: (sessionId: string) => ({ sessionId, scope }),
      }, PersonaSelect),
    )
    console.info('[persona-switcher] client apply: slots registered')
  } catch (error) {
    console.error('[persona-switcher] client apply FAILED:', error)
  }
}
