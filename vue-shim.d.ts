// 临时兼容类型：避免某些编辑器 / TS 插件环境下无法识别 Vue 3 组合式 API 导致的报错
// 运行时代码依然使用 node_modules 中真正的 Vue 类型，这里只影响类型检查提示。

declare module 'vue' {
  // 使用 any 避免与真实类型冲突，仅用于消除 "没有导出的成员" 报错
  export function ref<T = any>(value?: T): any;
  export function onMounted(hook: () => void): void;
}
