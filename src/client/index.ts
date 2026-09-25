/**
 * @dsh-external/dsh-persona-switcher — browser half。
 *
 * 三个 UI 挂点：
 * 1. 设置页 ▸ 插件 tab（settings.plugins.tab）：模板库管理（增删改）。
 * 2. 输入区工具行（conversation.input.left）：开始对话前/对话中挑选模板。
 * 3. 会话头部（conversation.session.header.utilities）：显示当前人设名。
 *
 * 读写都经 ctx.configForms.get(NS)（0.1.7 的设置表单服务；旧的
 * `settingsScope.bind()` 已移除）。写入落到 profile 的 cordis patch，host
 * 条目重载后生效。
 */
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SlotsService } from '@deepseek-ai/dsh-client-ui-slots'
import { PersonaCard } from './PersonaCard.tsx'
import { PersonaSelect } from './PersonaSelect.tsx'

/** Settings namespace（必须与 host 端一致）。 */
const NS = 'persona-switcher'

/** 设置表单的快照面：与 0.1.7 `ConfigForm` 的 subscribe/getSnapshot/set 同形。 */
type FormScope = {
  subscribe(listener: () => void): () => void
  getSnapshot(): { value?: unknown }
  set(field: string, value: unknown): Promise<boolean>
}

type ClientContext = {
  slots: SlotsService
  configForms: {
    get(entryId: string): FormScope
  }
}

export const inject = ['slots', 'configForms']

export function apply(ctx: ClientContext): void {
  console.info('[persona-switcher] client apply: start')
  try {
    // 0.1.7：按 profile 条目 id 取该插件的设置表单（Config.volatile 字段）。
    const scope = ctx.configForms.get(NS)

    // ── 设置页 ▸ 插件 tab：模板库管理 ────────────────────────────────────────
    ctx.slots.inject('settings.plugins.tab', function* () {
      yield ctx.slots.register({
        name: 'settings.plugins.tab',
        id: NS,
        order: 40,
        label: () => '人设',
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
