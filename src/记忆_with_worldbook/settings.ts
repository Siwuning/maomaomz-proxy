import { klona } from 'klona';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { getChatIdSafe, getScriptIdSafe } from './utils';
// 使用标准的 ES 模块导入，而不是 require
// 这样确保 zod 在全局作用域中可用，避免与其他插件冲突
import { z } from 'zod';

/**
 * 获取酒馆的 API 连接预设列表
 */
export function getTavernApiPresets(): Array<{ name: string; value: string }> {
  try {
    const presets: Array<{ name: string; value: string }> = [];

    // 方法1: 从 SillyTavern 的 getPresetManager 获取
    if (typeof SillyTavern !== 'undefined' && typeof SillyTavern.getPresetManager === 'function') {
      try {
        const presetManager = SillyTavern.getPresetManager('openai');
        if (presetManager && presetManager.presets) {
          for (const [key, preset] of Object.entries(presetManager.presets)) {
            if (preset && typeof preset === 'object') {
              presets.push({
                name: (preset as any).name || key,
                value: key,
              });
            }
          }
        }
      } catch (e) {
        console.log('⚠️ getPresetManager 不可用:', e);
      }
    }

    // 方法2: 从 DOM 读取预设下拉框
    if (presets.length === 0) {
      const presetSelect = document.querySelector('#api_button_openai') as HTMLSelectElement;
      if (presetSelect && presetSelect.options) {
        for (let i = 0; i < presetSelect.options.length; i++) {
          const option = presetSelect.options[i];
          if (option.value && option.value !== 'None') {
            presets.push({
              name: option.text || option.value,
              value: option.value,
            });
          }
        }
      }
    }

    // 方法3: 从 chatCompletionSettings 获取当前配置的名称
    if (presets.length === 0 && typeof SillyTavern !== 'undefined') {
      const settings = SillyTavern.chatCompletionSettings;
      if (settings) {
        // 添加当前配置作为选项
        presets.push({
          name: '当前酒馆配置',
          value: 'current',
        });
      }
    }

    console.log('🔍 获取到的酒馆 API 预设:', presets);
    return presets;
  } catch (error) {
    console.error('❌ 获取酒馆 API 预设失败:', error);
    return [];
  }
}

/**
 * 获取当前酒馆使用的模型名称
 */
export function getTavernCurrentModel(): string {
  try {
    console.log('🔍 开始检测酒馆模型...');

    if (typeof SillyTavern !== 'undefined') {
      // 方法1: 使用 getChatCompletionModel（尝试不同的 source）
      if (typeof SillyTavern.getChatCompletionModel === 'function') {
        // 先不传参数试试
        let model = SillyTavern.getChatCompletionModel();
        console.log('📍 getChatCompletionModel() 返回:', model);
        if (model) return model;

        // 尝试传入不同的 source
        const sources = ['google', 'openai', 'claude', 'makersuite', 'ai_studio'];
        for (const source of sources) {
          try {
            model = SillyTavern.getChatCompletionModel(source);
            console.log(`📍 getChatCompletionModel('${source}') 返回:`, model);
            if (model) return model;
          } catch (e) {
            // 忽略
          }
        }
      }

      // 方法1.5: 尝试从 CONNECT_API_MAP 获取
      if (SillyTavern.CONNECT_API_MAP) {
        console.log('📍 CONNECT_API_MAP:', Object.keys(SillyTavern.CONNECT_API_MAP));
      }

      // 方法2: 从 chatCompletionSettings 获取
      const settings = SillyTavern.chatCompletionSettings;
      console.log('📍 chatCompletionSettings:', settings);
      if (settings) {
        // 检查多种可能的模型字段
        const model =
          settings.openai_model ||
          settings.google_model || // Google AI Studio
          settings.claude_model || // Claude
          settings.model ||
          '';
        console.log('📍 从 settings 提取的模型:', model);
        if (model) return model;
      }
    }

    // 方法3: 从 localStorage 读取
    try {
      const tavernSettings = JSON.parse(localStorage.getItem('TavernAI_Settings') || '{}');
      console.log('📍 TavernAI_Settings:', Object.keys(tavernSettings));
      const model =
        tavernSettings.openai_model ||
        tavernSettings.google_model ||
        tavernSettings.claude_model ||
        tavernSettings.model ||
        '';
      console.log('📍 从 localStorage 提取的模型:', model);
      if (model) return model;
    } catch (e) {
      // 忽略解析错误
    }

    // 方法4: 从 DOM 读取模型选择器（在主页面查找）
    const mainDoc = window.parent?.document || document;
    const selectors = [
      '#model_google_select',
      '#model_openai_select',
      '#model_claude_select',
      'select[name="model"]',
      '#openai_model',
      '#google_model',
    ];
    for (const sel of selectors) {
      const el = mainDoc.querySelector(sel) as HTMLSelectElement | HTMLInputElement;
      if (el && el.value) {
        console.log('📍 从 DOM 找到模型:', sel, el.value);
        return el.value;
      }
    }

    // 方法5: 直接从酒馆全局变量获取（通过 parent window）
    try {
      const parentWin = window.parent as any;
      if (parentWin && parentWin.oai_settings) {
        const model =
          parentWin.oai_settings.google_model ||
          parentWin.oai_settings.openai_model ||
          parentWin.oai_settings.claude_model ||
          '';
        if (model) {
          console.log('📍 从 parent.oai_settings 找到模型:', model);
          return model;
        }
      }
    } catch (e) {
      // 跨域限制，忽略
    }

    return '';
  } catch (error) {
    console.error('❌ 获取酒馆当前模型失败:', error);
    return '';
  }
}

// 读取 SillyTavern 主界面的 API 配置
export function getTavernApiConfig() {
  try {
    // 尝试获取 SillyTavern 的 API 配置
    const apiServer = window.api_server;
    const mainApi = window.main_api;

    // 从localStorage中读取配置
    const tavernConfig = JSON.parse(localStorage.getItem('TavernAI_Settings') || '{}');
    const powerUserConfig = JSON.parse(localStorage.getItem('power_user') || '{}');

    console.log('🔍 检测到的 SillyTavern API 配置:');
    console.log('- api_server:', apiServer);
    console.log('- main_api:', mainApi);
    console.log('- TavernAI_Settings:', Object.keys(tavernConfig));
    console.log('- power_user:', Object.keys(powerUserConfig));

    // 构建API配置对象
    const config: any = {
      api_provider: 'openai', // 默认值
      api_endpoint: '',
      api_key: '',
      model: '',
      max_tokens: 4000,
      temperature: 0.7,
      top_p: 1.0,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
    };

    // 根据主 API 类型设置配置
    if (mainApi === 'openai') {
      config.api_provider = 'openai';
      config.api_endpoint = tavernConfig.api_url_scale || tavernConfig.api_url || 'https://api.openai.com/v1';
      config.api_key = tavernConfig.api_key_scale || tavernConfig.api_key || '';
      config.model = tavernConfig.openai_model || tavernConfig.model || 'gpt-4o-mini';
      config.max_tokens = tavernConfig.openai_max_tokens || 4000;
      config.temperature = tavernConfig.temp_openai || 0.7;
      config.top_p = tavernConfig.top_p_openai || 1.0;
      config.presence_penalty = tavernConfig.presence_penalty_openai || 0.0;
      config.frequency_penalty = tavernConfig.frequency_penalty_openai || 0.0;
    } else if (mainApi === 'claude') {
      config.api_provider = 'openai'; // Claude 通常使用 OpenAI 兼容格式
      config.api_endpoint = tavernConfig.claude_api_url || 'https://api.anthropic.com';
      config.api_key = tavernConfig.claude_api_key || '';
      config.model = tavernConfig.claude_model || 'claude-3-haiku-20240307';
      config.max_tokens = tavernConfig.claude_max_tokens || 4000;
      config.temperature = tavernConfig.temp_claude || 0.7;
    } else if (mainApi === 'google') {
      config.api_provider = 'gemini';
      config.api_endpoint = tavernConfig.google_api_url || 'https://generativelanguage.googleapis.com/v1beta/openai';
      config.api_key = tavernConfig.google_api_key || '';
      config.model = tavernConfig.google_model || 'models/gemini-1.5-flash';
      config.max_tokens = tavernConfig.google_max_tokens || 4000;
      config.temperature = tavernConfig.temp_google || 0.7;
      config.top_p = tavernConfig.top_p_google || 1.0;
    }

    // 如果没有检测到有效配置，返回null
    if (!config.api_key || config.api_key.trim() === '') {
      console.log('⚠️ 未检测到有效的 API 密钥配置');
      return null;
    }

    console.log('✅ 成功读取 SillyTavern API 配置:', {
      provider: config.api_provider,
      endpoint: config.api_endpoint,
      model: config.model,
      hasApiKey: !!config.api_key,
    });

    return config;
  } catch (error) {
    console.error('❌ 读取 SillyTavern API 配置失败:', error);
    return null;
  }
}

const Settings = z.object({
  use_tavern_api: z.boolean().default(false), // 是否使用酒馆主界面配置的 API（绕过 CORS）
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
  auto_hide_after_summary: z.boolean().default(false), // 总结后自动隐藏已总结楼层
  keep_recent_messages: z.number().default(10), // 保留最近几条消息不隐藏
  summarize_interval: z.number().default(50), // 每多少楼层自动总结一次
  start_message_id: z.number().default(0), // 开始总结的楼层
  end_message_id: z.number().default(0), // 结束总结的楼层
  table_start_message_id: z.number().default(0), // 开始生成表格的楼层
  table_end_message_id: z.number().default(0), // 结束生成表格的楼层
  show_minimize_icon: z.boolean().default(true), // 是否显示最小化图标
  summary_history: z
    .array(
      z.object({
        start_id: z.number(),
        end_id: z.number(),
        content: z.string(),
      }),
    )
    .default([]),
});

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

/**
 * 检测 API 提供商类型
 */
export function detectApiProvider(endpoint: string): 'gemini' | 'openai' | 'unknown' {
  const trimmed = endpoint.trim().toLowerCase();

  // Gemini API 特征 - 支持多种 Google API 端点格式
  if (
    trimmed.includes('generativelanguage.googleapis.com') ||
    trimmed.includes('googleai.com') ||
    (trimmed.includes('googleapis.com') && (trimmed.includes('gemini') || trimmed.includes('generative'))) ||
    trimmed.includes('gemini')
  ) {
    return 'gemini';
  }

  // 其他默认为 OpenAI 兼容
  return 'openai';
}

/**
 * 根据 API 提供商过滤请求参数
 * Gemini 不支持 frequency_penalty, presence_penalty, top_p 等参数
 */
export function filterApiParams(params: any, endpoint: string): any {
  const provider = detectApiProvider(endpoint);

  if (provider === 'gemini') {
    // Gemini OpenAI 兼容 API 支持: model, messages, temperature, max_tokens
    // 但不支持 frequency_penalty, presence_penalty, top_p 等参数
    const filtered: any = {
      model: params.model,
      messages: params.messages,
    };

    // Gemini 不支持 system role，需要将 system 消息合并到第一个 user 消息中
    if (filtered.messages && Array.isArray(filtered.messages)) {
      const systemMessages = filtered.messages.filter((m: any) => m.role === 'system');
      const otherMessages = filtered.messages.filter((m: any) => m.role !== 'system');

      if (systemMessages.length > 0) {
        // 将所有 system 消息合并
        const systemContent = systemMessages.map((m: any) => m.content).join('\n\n');

        // 找到第一个 user 消息，将 system 内容添加到前面
        const firstUserIndex = otherMessages.findIndex((m: any) => m.role === 'user');
        if (firstUserIndex !== -1) {
          otherMessages[firstUserIndex] = {
            ...otherMessages[firstUserIndex],
            content: systemContent + '\n\n' + otherMessages[firstUserIndex].content,
          };
        } else {
          // 如果没有 user 消息，创建一个
          otherMessages.unshift({
            role: 'user',
            content: systemContent,
          });
        }

        filtered.messages = otherMessages;
        console.log('🔄 Gemini API: 已将 system 消息合并到 user 消息');
      }
    }

    // 直接使用 OpenAI 标准参数名，不需要 generation_config 包装
    if (params.temperature !== undefined) {
      filtered.temperature = params.temperature;
    }
    if (params.max_tokens !== undefined) {
      // Gemini 2.5 Pro 支持最多 8192 输出 token
      // Gemini 2.0 Flash 支持最多 8192 输出 token
      // 不再强制限制为 4000
      filtered.max_tokens = params.max_tokens;
    }

    // 清理流式参数，Gemini 当前不支持 OpenAI 风格的 stream
    if (filtered.stream !== undefined) {
      delete filtered.stream;
    }

    console.log('🔍 检测到 Gemini API，已过滤不支持的参数');
    console.log('原始参数:', params);
    console.log('过滤后参数:', filtered);

    return filtered;
  }

  // OpenAI 或其他 API，保留所有参数
  return params;
}

// 固定的全局变量key，确保版本更新后数据不丢失
const SETTINGS_GLOBAL_KEY = 'maomao_tool_settings';

export const useSettingsStore = defineStore('settings', () => {
  // 检测是否在插件环境（插件始终使用 localStorage，不使用酒馆助手API）
  const isLocalDebug = () => {
    // 插件环境没有 getVariables 函数，使用 localStorage
    return true; // 插件环境强制使用 localStorage
  };

  // 初始化设置（插件环境 - 优先读取ST配置，再使用 localStorage）
  const initSettings = () => {
    console.log('🔧 插件环境：优先读取 SillyTavern API 配置，然后使用 localStorage');

    // 首先尝试从 SillyTavern 读取 API 配置
    const tavernConfig = getTavernApiConfig();
    if (tavernConfig) {
      console.log('✅ 使用 SillyTavern 主界面的 API 配置');
      // 合并 SillyTavern 配置和本地设置
      try {
        const saved = localStorage.getItem('tavern_helper_settings');
        const localSettings = saved ? JSON.parse(saved) : {};

        // 用 SillyTavern 的 API 配置覆盖本地配置
        const mergedSettings = {
          ...localSettings,
          api_provider: tavernConfig.api_provider,
          api_endpoint: tavernConfig.api_endpoint,
          api_key: tavernConfig.api_key,
          model: tavernConfig.model,
          max_tokens: tavernConfig.max_tokens,
          temperature: tavernConfig.temperature,
          top_p: tavernConfig.top_p,
          presence_penalty: tavernConfig.presence_penalty,
          frequency_penalty: tavernConfig.frequency_penalty,
        };

        return ref(Settings.parse(mergedSettings));
      } catch (e) {
        console.warn('合并设置失败，使用 SillyTavern 配置:', e);
        return ref(Settings.parse(tavernConfig));
      }
    }

    // 如果没有 SillyTavern 配置，使用本地存储
    console.log('⚠️ 未找到 SillyTavern API 配置，使用本地存储');
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

  // 刷新 SillyTavern API 配置
  const refreshTavernConfig = () => {
    try {
      const tavernConfig = getTavernApiConfig();
      if (tavernConfig) {
        console.log('✅ 刷新 SillyTavern API 配置成功');
        // 保留本地的非API设置，只更新API相关设置
        const currentSettings = settings.value;
        const updatedSettings = {
          ...currentSettings,
          api_provider: tavernConfig.api_provider,
          api_endpoint: tavernConfig.api_endpoint,
          api_key: tavernConfig.api_key,
          model: tavernConfig.model,
          max_tokens: tavernConfig.max_tokens,
          temperature: tavernConfig.temperature,
          top_p: tavernConfig.top_p,
          presence_penalty: tavernConfig.presence_penalty,
          frequency_penalty: tavernConfig.frequency_penalty,
        };

        settings.value = Settings.parse(updatedSettings);
        window.toastr?.success('已刷新 SillyTavern API 配置');
        return true;
      } else {
        console.warn('⚠️ 未找到 SillyTavern API 配置');
        window.toastr?.warning('未找到 SillyTavern API 配置，请先在主界面配置 API');
        return false;
      }
    } catch (e) {
      console.error('❌ 刷新 SillyTavern API 配置失败:', e);
      window.toastr?.error('刷新 API 配置失败: ' + (e as Error).message);
      return false;
    }
  };

  return {
    settings,
    saveSettings,
    reloadSettings,
    refreshTavernConfig,
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

  const clearSummaryHistory = () => {
    try {
      const chat_id = getChatIdSafe();
      if (!chat_id) {
        console.error('无法获取聊天 ID');
        return;
      }
      const scriptId = getScriptIdSafe();
      const storageKey = `${scriptId}_summary_history_${chat_id}`;
      localStorage.removeItem(storageKey);
      console.log('已清空总结历史:', chat_id);
    } catch (e) {
      console.warn('清空总结历史失败:', e);
    }
  };

  return {
    addSummary,
    getSummaryHistory,
    clearSummaryHistory,
  };
});
