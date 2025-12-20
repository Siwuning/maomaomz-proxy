import { klona } from 'klona';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { getChatIdSafe, getScriptIdSafe } from './utils';
// 使用标准的 ES 模块导入，而不是 require
// 这样确保 zod 在全局作用域中可用，避免与其他插件冲突
import { z } from 'zod';

/**
 * 获取酒馆的 API 连接配置列表
 */
export function getTavernApiPresets(): Array<{ name: string; value: string }> {
  try {
    const presets: Array<{ name: string; value: string }> = [];
    const mainDoc = window.parent?.document || document;

    // 调试：打印所有包含 "connection" 或 "profile" 的元素
    const allSelects = mainDoc.querySelectorAll('select');
    console.log('🔍 查找 API 连接配置选择器...');
    allSelects.forEach(sel => {
      const s = sel as HTMLSelectElement;
      const id = s.id.toLowerCase();
      const cls = s.className.toLowerCase();
      if (
        id.includes('connection') ||
        id.includes('profile') ||
        id.includes('proxy') ||
        cls.includes('connection') ||
        cls.includes('profile')
      ) {
        console.log(`  📍 id=${s.id}, class=${s.className}, options=${s.options.length}`);
        // 打印前5个选项
        for (let i = 0; i < Math.min(5, s.options.length); i++) {
          console.log(`     [${i}] value="${s.options[i].value}" text="${s.options[i].text}"`);
        }
      }
    });

    // 尝试多个选择器
    const selectors = [
      '#connection_profile', // 连接配置
      '#openai_proxy_preset', // 代理预设
      '#reverse_proxy', // 反向代理
      'select[id*="connection"]', // 包含 connection 的
      'select[id*="profile"]', // 包含 profile 的
    ];

    for (const selector of selectors) {
      const profileSelect = mainDoc.querySelector(selector) as HTMLSelectElement;
      if (profileSelect && profileSelect.options && profileSelect.options.length > 2) {
        console.log(`✅ 找到选择器 ${selector}，选项数: ${profileSelect.options.length}`);
        for (let i = 0; i < profileSelect.options.length; i++) {
          const option = profileSelect.options[i];
          if (option.value && option.value.trim() !== '' && option.text !== 'None' && option.text !== '<None>') {
            presets.push({
              name: option.text || option.value,
              value: option.value,
            });
          }
        }
        if (presets.length > 0) return presets;
      }
    }

    return presets;
  } catch (error) {
    console.error('❌ 获取酒馆 API 配置失败:', error);
    return [];
  }
}

// 找到正确的预设选择器
function findPresetSelector(): HTMLSelectElement | null {
  const mainDoc = window.parent?.document || document;
  const selectors = [
    '#connection_profile',
    '#openai_proxy_preset',
    'select[id*="connection"]',
    'select[id*="profile"]',
  ];
  for (const selector of selectors) {
    const el = mainDoc.querySelector(selector) as HTMLSelectElement;
    if (el && el.options && el.options.length > 2) {
      return el;
    }
  }
  return null;
}

/**
 * 获取当前酒馆选中的 API 连接预设
 */
export function getTavernCurrentPreset(): string {
  try {
    const profileSelect = findPresetSelector();
    return profileSelect?.value || '';
  } catch (error) {
    return '';
  }
}

/**
 * 切换酒馆的 API 连接预设
 */
export async function switchTavernPreset(presetValue: string): Promise<boolean> {
  try {
    const profileSelect = findPresetSelector();

    if (profileSelect) {
      profileSelect.value = presetValue;
      // 触发多种事件确保酒馆响应
      profileSelect.dispatchEvent(new Event('change', { bubbles: true }));
      profileSelect.dispatchEvent(new Event('input', { bubbles: true }));

      // 尝试调用酒馆的应用预设函数
      try {
        const parentWin = window.parent as any;
        if (parentWin && typeof parentWin.applyConnectionProfile === 'function') {
          await parentWin.applyConnectionProfile(presetValue);
          console.log('✅ 通过 applyConnectionProfile 应用预设');
        }
      } catch (e) {
        // 忽略
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ 切换酒馆预设失败:', error);
    return false;
  }
}

/**
 * 获取当前酒馆的 API 配置信息用于显示
 */
export function getTavernApiConfigForDisplay(): { url: string; key: string; model: string } {
  try {
    const mainDoc = window.parent?.document || document;

    // URL - 尝试多个选择器
    let url = '';
    const urlSelectors = [
      '#custom_api_url',
      '#reverse_proxy',
      '#openai_reverse_proxy',
      'input[id*="api_url"]',
      'input[id*="reverse_proxy"]',
    ];
    for (const sel of urlSelectors) {
      const el = mainDoc.querySelector(sel) as HTMLInputElement;
      if (el && el.value) {
        url = el.value;
        break;
      }
    }

    // API Key - 优先检查反代密码
    let key = '';
    const keySelectors = [
      '#openai_proxy_password', // 反代密码（优先）
      '#proxy_password', // 反代密码
      '#api_key_openai',
      '#custom_api_key',
      '#api_key',
      'input[id*="proxy_password"]',
      'input[id*="api_key"]',
    ];
    for (const sel of keySelectors) {
      const el = mainDoc.querySelector(sel) as HTMLInputElement;
      if (el && el.value) {
        // 只显示前几位，隐藏其余部分
        const val = el.value;
        key = val.length > 8 ? val.substring(0, 4) + '****' + val.substring(val.length - 4) : '****';
        break;
      }
    }

    // Model
    const model = getTavernCurrentModel();

    return { url, key, model };
  } catch (error) {
    return { url: '', key: '', model: '' };
  }
}

/**
 * 获取当前酒馆使用的模型名称
 */
export function getTavernCurrentModel(): string {
  try {
    // 方法1: 使用酒馆 API
    if (typeof SillyTavern !== 'undefined' && typeof SillyTavern.getChatCompletionModel === 'function') {
      const model = SillyTavern.getChatCompletionModel();
      if (model) return model;
    }

    // 方法2: 从 DOM 读取模型选择器（最可靠）
    const mainDoc = window.parent?.document || document;
    const selectors = ['#model_google_select', '#model_openai_select', '#model_claude_select'];
    for (const sel of selectors) {
      const el = mainDoc.querySelector(sel) as HTMLSelectElement;
      if (el && el.value) return el.value;
    }

    // 方法3: 从 parent window 的 oai_settings 获取
    try {
      const parentWin = window.parent as any;
      if (parentWin?.oai_settings) {
        const model =
          parentWin.oai_settings.google_model ||
          parentWin.oai_settings.openai_model ||
          parentWin.oai_settings.claude_model;
        if (model) return model;
      }
    } catch (e) {
      /* 跨域限制 */
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
      // 优先使用反向代理配置（reverse_proxy / proxy_password）
      const hasReverseProxy = tavernConfig.reverse_proxy && tavernConfig.reverse_proxy.trim() !== '';
      if (hasReverseProxy) {
        config.api_endpoint = tavernConfig.reverse_proxy;
        config.api_key = tavernConfig.proxy_password || '';
        console.log('🔄 检测到反向代理配置，使用 reverse_proxy:', config.api_endpoint);
      } else {
        config.api_endpoint = tavernConfig.api_url_scale || tavernConfig.api_url || 'https://api.openai.com/v1';
        config.api_key = tavernConfig.api_key_scale || tavernConfig.api_key || '';
      }
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
  auto_bind_to_worldbook: z.boolean().default(false), // 总结后自动绑定到世界书
  auto_hide_after_summary: z.boolean().default(false), // 总结后自动隐藏已总结楼层
  keep_recent_messages: z.number().default(10), // 保留最近几条消息不隐藏
  summarize_interval: z.number().default(50), // 每多少楼层自动总结一次
  start_message_id: z.number().default(0), // 开始总结的楼层
  end_message_id: z.number().default(0), // 结束总结的楼层
  table_start_message_id: z.number().default(0), // 开始生成表格的楼层
  table_end_message_id: z.number().default(0), // 结束生成表格的楼层
  show_minimize_icon: z.boolean().default(true), // 是否显示最小化图标
  summary_style: z.enum(['concise', 'detailed', 'narrative']).default('concise'), // 总结风格
  custom_summary_prompt: z.string().default(''), // 自定义总结提示词模板（空则使用默认）
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

  // 特殊处理 Google Gemini OpenAI 兼容端点
  // 格式: https://generativelanguage.googleapis.com/v1beta/openai
  // 正确 URL: /v1beta/openai/chat/completions (不需要再加 /v1)
  if (baseUrl.includes('/v1beta/openai') || baseUrl.includes('/openai')) {
    return baseUrl + path;
  }

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

    // 🔧 首先读取本地存储的设置
    let localSettings: any = {};
    try {
      const saved = localStorage.getItem('tavern_helper_settings');
      console.log('🔍 localStorage 原始数据:', saved ? saved.substring(0, 200) + '...' : 'null');
      if (saved) {
        localSettings = JSON.parse(saved);
        console.log('📦 从 localStorage 读取到的完整设置:', JSON.stringify(localSettings, null, 2));
      } else {
        console.log('📦 localStorage 中没有保存的设置 (tavern_helper_settings 为空)');
      }
    } catch (e) {
      console.warn('从 localStorage 读取设置失败:', e);
    }

    // 🔧 检查本地是否已保存 API 配置（如果用户手动配置过，优先使用本地配置）
    const hasLocalApiConfig = localSettings.api_endpoint && localSettings.api_key;

    if (hasLocalApiConfig) {
      // 本地已有 API 配置，直接使用本地设置
      console.log('✅ 使用本地保存的 API 配置（用户手动配置）');
      const parsed = Settings.parse(localSettings);
      console.log('📋 本地设置:', {
        api_endpoint: parsed.api_endpoint,
        model: parsed.model,
      });
      return ref(parsed);
    }

    // 本地没有 API 配置，尝试从 SillyTavern 读取
    const tavernConfig = getTavernApiConfig();
    if (tavernConfig) {
      console.log('✅ 本地无 API 配置，使用 SillyTavern API 配置');
      // 合并设置：其他本地设置 + ST 的 API 配置
      const mergedSettings = {
        ...localSettings, // 本地设置优先（包含 summary_style, summarize_interval 等）
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

      const parsed = Settings.parse(mergedSettings);
      console.log('📋 合并后的设置:', {
        api_endpoint: parsed.api_endpoint,
        model: parsed.model,
      });
      return ref(parsed);
    }

    // 如果没有 SillyTavern 配置，使用本地存储
    console.log('⚠️ 未找到 SillyTavern API 配置，使用本地存储');
    const parsed = Settings.parse(localSettings);
    console.log('📋 使用本地设置:', {
      summary_style: parsed.summary_style,
      summarize_interval: parsed.summarize_interval,
    });
    return ref(parsed);
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
      saveTimeout = null;
    }, 300); // 300ms 防抖（缩短延迟以提高响应性）
  };

  // 🔧 取消待执行的防抖保存
  const cancelPendingSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
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
      // 🔧 取消待执行的防抖保存，避免冲突
      cancelPendingSave();

      const settingsToSave = klona(settings.value);
      console.log('💾 手动保存设置到 localStorage:', {
        summary_style: settingsToSave.summary_style,
        summarize_interval: settingsToSave.summarize_interval,
        auto_summarize_enabled: settingsToSave.auto_summarize_enabled,
      });

      localStorage.setItem('tavern_helper_settings', JSON.stringify(settingsToSave));

      // 🔧 验证保存是否成功
      const verification = localStorage.getItem('tavern_helper_settings');
      if (verification) {
        const parsed = JSON.parse(verification);
        if (
          parsed.summary_style === settingsToSave.summary_style &&
          parsed.summarize_interval === settingsToSave.summarize_interval
        ) {
          console.log('✅ 设置保存验证成功');
          window.toastr?.success('设置已保存');
          return true;
        } else {
          console.error('❌ 设置保存验证失败：数据不一致');
          window.toastr?.error('设置保存失败：数据不一致');
          return false;
        }
      }

      window.toastr?.success('设置已保存');
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

      // 🔧 检查是否已存在相同楼层范围的总结，避免重复添加
      const isDuplicate = chatHistory.some(item => item.start_id === start_id && item.end_id === end_id);

      if (isDuplicate) {
        console.log(`⏭️ 跳过重复总结: 楼层 ${start_id}-${end_id}`);
        return;
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
