import { klona } from 'klona';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { getChatIdSafe, getScriptIdSafe } from './utils';

// 安全导入 zod
let z: any;
try {
  z = require('zod');
} catch (e) {
  console.warn('zod 不可用，使用备用方案');
  // 简单的备用验证函数
  z = {
    object: (obj: any) => ({
      parse: (data: any) => data,
      default: (def: any) => ({ parse: (data: any) => data || def }),
    }),
    string: () => ({ default: (def: string) => ({ parse: (data: any) => data || def }) }),
    number: () => ({ default: (def: number) => ({ parse: (data: any) => data || def }) }),
    boolean: () => ({ default: (def: boolean) => ({ parse: (data: any) => data || def }) }),
    array: (schema: any) => ({
      default: (def: any[]) => ({ parse: (data: any) => (Array.isArray(data) ? data : def) }),
    }),
  };
}

const Settings = z
  .object({
    api_provider: z.string().default('openai'), // 'openai' | 'gemini'
    api_endpoint: z.string().default('https://api.openai.com/v1'), // 兼容酒馆格式：base URL
    api_key: z.string().default(''),
    model: z.string().default('gpt-4o-mini'),
    max_tokens: z.number().default(4000),
    temperature: z.number().default(0.7),
    top_p: z.number().default(1.0), // 核采样参数 (0-1)
    presence_penalty: z.number().default(0.0), // 存在惩罚 (-2.0 to 2.0)
    frequency_penalty: z.number().default(0.0), // 频率惩罚 (-2.0 to 2.0)
    auto_summarize_enabled: z.boolean().default(false),
    summarize_interval: z.number().default(50), // 每多少楼层自动总结一次
    start_message_id: z.number().default(0), // 开始总结的楼层
    end_message_id: z.number().default(0), // 结束总结的楼层
    table_start_message_id: z.number().default(0), // 开始生成表格的楼层
    table_end_message_id: z.number().default(0), // 结束生成表格的楼层
    summary_history: z
      .array(
        z.object({
          start_id: z.number(),
          end_id: z.number(),
          content: z.string(),
        }),
      )
      .default([]),
  })
  .default({});

/**
 * 将 API 端点规范化为完整的 URL
 * 兼容酒馆格式：支持只填 base URL，自动补全 /v1/chat/completions
 */
export function normalizeApiEndpoint(endpoint: string, path: string = '/chat/completions'): string {
  if (!endpoint || endpoint.trim() === '') {
    throw new Error('API 端点不能为空');
  }

  const trimmed = endpoint.trim();

  // 如果已经包含 /chat/completions 或 /models，直接返回
  if (trimmed.includes('/chat/completions') || trimmed.includes('/models')) {
    return trimmed;
  }

  // 移除末尾的斜杠
  let baseUrl = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;

  // 如果 URL 不包含 /v1，自动添加 /v1
  if (!baseUrl.endsWith('/v1')) {
    baseUrl = baseUrl + '/v1';
  }

  // 自动补全路径
  return baseUrl + path;
}

// 固定的全局变量key，确保版本更新后数据不丢失
const SETTINGS_GLOBAL_KEY = 'maomao_tool_settings';

export const useSettingsStore = defineStore('settings', () => {
  // 检测是否在插件环境（插件始终使用 localStorage，不使用酒馆助手API）
  const isLocalDebug = () => {
    // 插件环境没有 getVariables 函数，使用 localStorage
    return true; // 插件环境强制使用 localStorage
  };

  // 初始化设置（插件环境 - 始终使用 localStorage）
  const initSettings = () => {
    console.log('🔧 插件环境：使用 localStorage 存储设置');
    try {
      const saved = localStorage.getItem('tavern_helper_settings');
      if (saved) {
        return ref(Settings.parse(JSON.parse(saved)));
      }
    } catch (e) {
      console.warn('从 localStorage 读取设置失败:', e);
    }
    return ref(Settings.parse({}));
  };

  const settings = initSettings();

  // 立即保存函数（内部使用，插件环境 - localStorage）
  const saveImmediately = (new_settings: any) => {
    try {
      console.log('💾 插件环境：立即保存设置到 localStorage:', klona(new_settings));
      localStorage.setItem('tavern_helper_settings', JSON.stringify(klona(new_settings)));
      console.log('✅ 设置已保存到 localStorage');
    } catch (e) {
      console.error('❌ 保存到 localStorage 失败:', e);
      window.toastr?.error('设置保存失败: ' + (e as Error).message);
    }
  };

  // 防抖保存设置，避免频繁保存
  let saveTimeout: number | null = null;
  const debouncedSave = (new_settings: any) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      saveImmediately(new_settings);
    }, 300); // 300ms 防抖（缩短延迟以提高响应性）
  };

  watch(settings, debouncedSave, { immediate: false, deep: true });

  // 页面卸载前立即保存
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => {
      console.log('⚠️ 页面卸载，立即保存设置');
      saveImmediately(settings.value);
    });
  }

  // 手动保存设置函数（插件环境 - localStorage）
  const saveSettings = () => {
    try {
      console.log('💾 插件环境：手动保存设置到 localStorage:', klona(settings.value));
      localStorage.setItem('tavern_helper_settings', JSON.stringify(klona(settings.value)));
      window.toastr?.success('设置已保存（localStorage）');
      return true;
    } catch (e) {
      console.error('❌ 保存到 localStorage 失败:', e);
      window.toastr?.error('设置保存失败: ' + (e as Error).message);
      return false;
    }
  };

  // 重新加载设置函数（插件环境 - localStorage）
  const reloadSettings = () => {
    try {
      const saved = localStorage.getItem('tavern_helper_settings');
      if (saved) {
        settings.value = Settings.parse(JSON.parse(saved));
        console.log('✅ 设置从 localStorage 重新加载成功:', settings.value);
        window.toastr?.success('设置已重新加载');
        return true;
      }
      console.warn('未找到保存的设置');
      window.toastr?.warning('未找到保存的设置');
      return false;
    } catch (e) {
      console.error('❌ 重新加载设置失败:', e);
      window.toastr?.error('设置重新加载失败: ' + (e as Error).message);
      return false;
    }
  };

  return {
    settings,
    saveSettings,
    reloadSettings,
  };
});

// 历史总结 Store - 插件环境（使用 localStorage）
export const useSummaryHistoryStore = defineStore('summaryHistory', () => {
  const addSummary = (start_id: number, end_id: number, content: string) => {
    try {
      // 获取当前聊天 ID
      const chat_id = getChatIdSafe();
      if (!chat_id) {
        console.error('无法获取聊天 ID');
        window.toastr.error('无法获取当前聊天信息');
        return;
      }

      console.log('添加总结到聊天:', chat_id);

      // 插件环境：从 localStorage 读取总结历史
      const scriptId = getScriptIdSafe();
      const storageKey = `${scriptId}_summary_history_${chat_id}`;
      let chatHistory: Array<{ start_id: number; end_id: number; content: string }> = [];

      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          chatHistory = JSON.parse(savedData);
          if (!Array.isArray(chatHistory)) {
            chatHistory = [];
          }
        }
      } catch (e) {
        console.warn('读取聊天总结历史失败:', e);
      }

      // 添加新的总结
      chatHistory.unshift({
        start_id,
        end_id,
        content,
      });

      // 保留最近 50 条历史
      if (chatHistory.length > 50) {
        chatHistory = chatHistory.slice(0, 50);
      }

      // 插件环境：保存到 localStorage
      localStorage.setItem(storageKey, JSON.stringify(chatHistory));

      console.log('总结已保存到 localStorage:', chat_id);
    } catch (error) {
      console.error('保存总结失败:', error);
      window.toastr.error('保存总结失败: ' + (error as Error).message);
    }
  };

  const getSummaryHistory = (): Array<{ start_id: number; end_id: number; content: string }> => {
    try {
      const chat_id = getChatIdSafe();
      if (!chat_id) {
        return [];
      }

      // 插件环境：从 localStorage 读取
      const scriptId = getScriptIdSafe();
      const storageKey = `${scriptId}_summary_history_${chat_id}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const history = JSON.parse(savedData);
        return Array.isArray(history) ? history : [];
      }
      return [];
    } catch (e) {
      console.warn('读取聊天总结历史失败:', e);
      return [];
    }
  };

  return {
    addSummary,
    getSummaryHistory,
  };
});
