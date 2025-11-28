// 临时兼容类型：避免某些编辑器 / TS 插件环境下无法识别 Vue 3 组合式 API 导致的报错
// 运行时代码依然使用 node_modules 中真正的 Vue 类型，这里只影响类型检查提示。

declare module 'vue' {
  // 使用 any 避免与真实类型冲突，仅用于消除 "没有导出的成员" 报错
  export function createApp(rootComponent: any, rootProps?: any): any;
  export function ref<T = any>(value?: T): any;
  export type Ref<T = any> = { value: T };
  export function reactive<T extends object>(target: T): T;
  export function computed<T = any>(getter: () => T): any;
  export function watch(source: any, callback: any, options?: any): any;
  export function watchEffect(effect: () => void, options?: any): any;
  export function onMounted(hook: () => void): void;
  export function onUnmounted(hook: () => void): void;
  export function onBeforeMount(hook: () => void): void;
  export function onBeforeUnmount(hook: () => void): void;
  export function nextTick(callback?: () => void): Promise<void>;
  export function defineComponent(options: any): any;
  export function h(type: any, props?: any, children?: any): any;
  export function provide(key: any, value: any): void;
  export function inject(key: any, defaultValue?: any): any;
  export function toRef(object: any, key: string): any;
  export function toRefs(object: any): any;
  export function unref(ref: any): any;
  export function isRef(value: any): boolean;
  export function shallowRef<T = any>(value?: T): any;
  export function triggerRef(ref: any): void;
}
