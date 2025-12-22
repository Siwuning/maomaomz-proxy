/**
 * 全局类型声明 - 为现有代码提供类型支持
 * 这个文件只添加类型声明，不会改变任何运行时行为
 */

// SillyTavern 全局变量
declare const SillyTavern:
  | {
      chat?: any[];
      getContext?: () => { chatId?: string; chat?: any[]; name1?: string; name2?: string };
      getCurrentChatId?: () => string;
      chatId?: string;
      name1?: string;
      name2?: string;
      eventSource?: {
        on: (event: string, callback: () => void) => void;
      };
      eventTypes?: {
        CHAT_CHANGED: string;
      };
      getRequestHeaders?: () => Record<string, string>;
    }
  | undefined;

// toastr 通知库
declare const toastr:
  | {
      success: (message: string, title?: string, options?: any) => void;
      error: (message: string, title?: string, options?: any) => void;
      warning: (message: string, title?: string, options?: any) => void;
      info: (message: string, title?: string, options?: any) => void;
    }
  | undefined;

declare global {
  interface Window {
    // SillyTavern 相关
    SillyTavern?: typeof SillyTavern;

    // toastr 通知
    toastr?: typeof toastr;

    // 全局函数
    getLastMessageId?: () => number;
    getChatMessages?: (range: string) => any[];
    getScriptId?: () => string;

    // 其他全局变量
    tavern_events?: {
      CHAT_CHANGED: string;
    };

    // API 相关
    api_server?: string | HTMLElement;
    main_api?: string;

    // zod (插件暴露的)
    z?: typeof import('zod').z;

    // 全局 chat 变量
    chat?: any[];
  }
}

// Vue 事件类型增强
declare module '@vue/runtime-dom' {
  interface HTMLElementEventMap {
    mouseenter: MouseEvent;
    mouseleave: MouseEvent;
  }
}

// 扩展 EventTarget 接口以支持 style 属性
declare global {
  interface EventTarget {
    style?: CSSStyleDeclaration;
  }
}

export {};
