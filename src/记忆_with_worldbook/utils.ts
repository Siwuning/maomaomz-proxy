/**
 * 通用工具函数
 */

/**
 * 复制文本到剪贴板（支持 iframe 环境）
 * @param text 要复制的文本
 * @param successMessage 成功提示消息
 * @returns Promise<boolean> 复制是否成功
 */
export async function copyToClipboard(text: string, successMessage?: string): Promise<boolean> {
  try {
    // 策略1: 尝试在父窗口中使用 execCommand（最稳定）
    if (window.parent && window.parent.document) {
      try {
        const textarea = window.parent.document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        window.parent.document.body.appendChild(textarea);
        textarea.select();
        const success = window.parent.document.execCommand('copy');
        window.parent.document.body.removeChild(textarea);

        if (success) {
          if (successMessage) {
            toastr.success(successMessage);
          }
          return true;
        }
      } catch (e) {
        console.warn('父窗口复制失败，尝试其他方法', e);
      }
    }

    // 策略2: 尝试在当前窗口使用 execCommand
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        if (successMessage) {
          toastr.success(successMessage);
        }
        return true;
      }
    } catch (e) {
      console.warn('当前窗口复制失败，尝试 Clipboard API', e);
    }

    // 策略3: 使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      if (successMessage) {
        toastr.success(successMessage);
      }
      return true;
    }

    throw new Error('所有复制方法都失败了');
  } catch (error) {
    console.error('复制失败:', error);
    toastr.error('复制失败，请手动复制');
    return false;
  }
}

/**
 * 安全获取脚本 ID
 * 插件环境使用固定ID
 */
export function getScriptIdSafe(): string {
  // 插件环境直接返回固定ID
  if (!globalScriptId) {
    globalScriptId = 'maomaomz_extension_v1';
  }
  return globalScriptId;
}

/**
 * 安全获取聊天 ID
 */
export function getChatIdSafe(): string {
  try {
    return SillyTavern.getCurrentChatId();
  } catch (error) {
    console.error('获取聊天 ID 失败:', error);
    return '';
  }
}

// 全局脚本 ID（用于在 iframe 加载完成前缓存）
let globalScriptId: string | null = null;

/**
 * 设置全局脚本 ID
 */
export function setGlobalScriptId(id: string): void {
  globalScriptId = id;
}

/**
 * 获取全局脚本 ID
 */
export function getGlobalScriptId(): string | null {
  return globalScriptId;
}
