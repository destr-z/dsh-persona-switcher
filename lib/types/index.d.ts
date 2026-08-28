/**
 * @dsh-external/dsh-persona-switcher — 按会话记忆人设（persona）的 host 端。
 *
 * 两层数据：
 * - `templates`：用户维护的人设模板库（名称 + 文字），在设置页编辑。
 * - `sessions`：会话 → 快照（模板选中的那一刻复制；模板后续修改不追溯）。
 *
 * 生效规则：**未选择的会话 = 插件完全不干预**（不注册任何段，与未装插件
 * 一致）；只有给某会话选择了模板（或清空后重新选择）才注册 `/` 摘除段。
 * 段注册在 agent 作用域（名为 deployment:persona、order 0），比 agent preset
 * 的 persona 行更贴近会话，因此必然遮蔽预设与全局人设。文本动态读取：
 * 设置变更后无需重注册，下一次模型请求即生效。
 *
 * 零运行时依赖：不 import 任何 @deepseek-ai 包（schemastery 兼容的极简
 * schema 就地实现），与 dsh-mode-boost 同样的理由——注入器装载时模块
 * 解析路径可预期。
 */
/** 一个会话的 agent（行为契约最小面）。 */
interface SessionAgent {
    session: {
        id: string;
    };
    ctx: AgentScope;
}
/** agent 作用域 ctx（我们只调 inject）。 */
interface AgentScope {
    inject<Scope>(inject: string[], callback: (scope: Scope) => void): FiberHandle;
}
/** 可释放的 fiber 句柄。 */
interface FiberHandle {
    dispose(): unknown;
}
/** 宿主 ctx（行为契约最小面，避免依赖 cordis 声明合并与事件键类型）。 */
interface HostContext {
    agents: {
        list(): SessionAgent[];
    };
    on(event: string, listener: (payload: {
        agent: SessionAgent;
    }) => void): void;
    inject<Scope>(inject: string[], callback: (scope: Scope) => void): void;
    effect(fn: () => void | (() => void), label?: string): void;
}
/** Required services：agents（会话枚举与生命周期）、settings（持久化）。 */
export declare const inject: string[];
/** Cordis plugin name（loader 诊断用）。 */
export declare const name = "@dsh-external/dsh-persona-switcher";
export declare function apply(ctx: HostContext): void;
export {};
