import { filterApiParams } from '../settings';
import { APISettings, ChatMessage } from '../types';
import { handleApiResponseError } from './error-handler';

/**
 * 获取 SillyTavern 的 generateQuietPrompt 函数
 * @returns generateQuietPrompt 函数，如果不可用则返回 null
 */
export function getGenerateQuietPrompt(): ((prompt: string, ...args: any[]) => Promise<string>) | null {
  const win = window as any;

  // 方法1: 从 SillyTavern.getContext() 获取（推荐方式）
  try {
    const st = win.SillyTavern || win.parent?.SillyTavern;
    if (st && typeof st.getContext === 'function') {
      const context = st.getContext();
      if (context && typeof context.generateQuietPrompt === 'function') {
        console.log('✅ 从 SillyTavern.getContext() 获取到 generateQuietPrompt');
        return context.generateQuietPrompt.bind(context);
      }
    }
  } catch (e) {
    console.log('⚠️ 从 getContext 获取失败:', e);
  }

  // 方法2: 直接从 SillyTavern 对象获取（旧版本兼容）
  try {
    const st = win.SillyTavern || win.parent?.SillyTavern;
    if (st && typeof st.generateQuietPrompt === 'function') {
      console.log('✅ 直接从 SillyTavern 对象获取到 generateQuietPrompt');
      return st.generateQuietPrompt.bind(st);
    }
  } catch (e) {
    console.log('⚠️ 直接获取失败:', e);
  }

  // 方法3: 从全局函数获取
  if (typeof win.generateQuietPrompt === 'function') {
    console.log('✅ 从全局函数获取到 generateQuietPrompt');
    return win.generateQuietPrompt;
  }

  // 方法4: 从 parent window 的全局函数获取
  try {
    if (typeof win.parent?.generateQuietPrompt === 'function') {
      console.log('✅ 从 parent window 获取到 generateQuietPrompt');
      return win.parent.generateQuietPrompt;
    }
  } catch (e) {
    // 跨域限制
  }

  console.log('❌ 无法找到 generateQuietPrompt 函数');

  // 更详细的调试信息
  console.log('🔍 调试信息:', {
    'window.SillyTavern': !!win.SillyTavern,
    'window.SillyTavern.getContext': typeof win.SillyTavern?.getContext,
    'window.generateQuietPrompt': typeof win.generateQuietPrompt,
    'parent.SillyTavern': !!win.parent?.SillyTavern,
  });

  // 输出 SillyTavern 对象的所有属性
  if (win.SillyTavern) {
    console.log('📋 SillyTavern 对象属性:', Object.keys(win.SillyTavern));

    // 输出 getContext() 返回的对象属性
    if (typeof win.SillyTavern.getContext === 'function') {
      const ctx = win.SillyTavern.getContext();
      console.log('📋 SillyTavern.getContext() 返回的属性:', Object.keys(ctx || {}));

      // 检查是否有 generate 相关的方法
      const generateMethods = Object.keys(ctx || {}).filter(k => k.toLowerCase().includes('generate'));
      if (generateMethods.length > 0) {
        console.log('🔍 发现 generate 相关方法:', generateMethods);
      }
    }
  }

  // 检查全局 window 上是否有 generate 相关函数
  const globalGenerateFns = Object.keys(win).filter(
    k => k.toLowerCase().includes('generate') && typeof win[k] === 'function',
  );
  if (globalGenerateFns.length > 0) {
    console.log('🔍 全局 generate 相关函数:', globalGenerateFns);
  }

  return null;
}

/**
 * 通用 AI API 调用函数（自动支持酒馆API绕过CORS）
 * @param messages - 消息数组 [{role: 'system'|'user'|'assistant', content: string}]
 * @param settings - API设置对象，包含 use_tavern_api, api_endpoint, api_key, model, max_tokens 等
 * @param options - 可选参数 { temperature, onProgress }
 * @returns 生成的文本
 */
export async function callAIWithTavernSupport(
  messages: Array<{ role: string; content: string }>,
  settings: {
    use_tavern_api?: boolean;
    api_endpoint: string;
    api_key: string;
    model: string;
    max_tokens: number;
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  },
  options?: {
    temperature?: number;
    onProgress?: (percent: number) => void;
  },
): Promise<string> {
  // 如果启用了"使用酒馆 API"，通过酒馆后端发送请求（绕过 CORS）
  if (settings.use_tavern_api) {
    console.log('🍺 使用酒馆 API 发送请求（绕过 CORS）...');

    const generateFn = getGenerateQuietPrompt();
    if (!generateFn) {
      throw new Error('酒馆 API 不可用，请确保在 SillyTavern 环境中运行，或关闭"使用酒馆 API"选项');
    }

    // 合并所有消息
    const fullPrompt = messages.map(m => m.content).join('\n\n');

    const result = await generateFn(
      fullPrompt,
      false, // quiet_to_loud
      true, // skip_wian
      undefined,
      undefined,
      settings.max_tokens,
    );

    if (!result || result.trim() === '') {
      throw new Error('酒馆 API 返回了空结果');
    }

    options?.onProgress?.(100);
    console.log('✅ 通过酒馆 API 成功获取响应');
    return result.trim();
  }

  // 直接调用 API
  const apiUrl = normalizeApiEndpoint(settings.api_endpoint);
  const requestPayload = {
    model: settings.model || 'gpt-3.5-turbo',
    max_tokens: settings.max_tokens || 4000,
    temperature: options?.temperature ?? settings.temperature ?? 0.7,
    top_p: settings.top_p,
    presence_penalty: settings.presence_penalty,
    frequency_penalty: settings.frequency_penalty,
    messages,
  };

  const filteredPayload = filterApiParams(requestPayload, settings.api_endpoint);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.api_key}`,
    },
    body: JSON.stringify(filteredPayload),
  });

  if (!response.ok) {
    await handleApiResponseError(response, 'AI 生成');
  }

  const data = await response.json();
  options?.onProgress?.(100);

  return data.choices?.[0]?.message?.content?.trim() || '';
}

// 带重试的 fetch 函数（处理 503 等临时错误）
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 2000,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 直接使用 fetch，不尝试代理（因为浏览器插件环境中 CORS 由服务器控制）
      const response = await fetch(url, options);

      // 如果是 503 错误（服务过载），进行重试
      if (response.status === 503 && attempt < maxRetries) {
        console.warn(`⚠️ API 服务过载 (503)，${retryDelay / 1000}秒后进行第 ${attempt + 1}/${maxRetries} 次重试...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt)); // 指数退避
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // 如果是 CORS 错误，给出更友好的提示
      if (lastError.message.includes('Failed to fetch') || lastError.message.includes('CORS')) {
        console.error('❌ CORS 错误：API 服务器未配置 CORS 头');
        console.error('💡 解决方案：');
        console.error('   1. 在 API 服务器配置中启用 CORS');
        console.error('   2. 或使用支持 CORS 的 API 端点');
        console.error('   3. 或在酒馆主界面配置相同的 API（推荐）');
      }

      if (attempt < maxRetries) {
        console.warn(`⚠️ 请求失败，${retryDelay / 1000}秒后进行第 ${attempt + 1}/${maxRetries} 次重试...`, error);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }
    }
  }

  throw lastError || new Error('请求失败');
}

// 规范化API端点
export function normalizeApiEndpoint(endpoint: string, path: string = '/chat/completions'): string {
  try {
    const url = new URL(endpoint);

    // 如果已经包含完整路径，直接返回
    if (endpoint.includes('/chat/completions') || endpoint.includes('/models')) {
      return endpoint;
    }

    // 特殊处理 Gemini OpenAI 兼容端点
    // 格式: https://generativelanguage.googleapis.com/v1beta/openai
    // 正确 URL: /v1beta/openai/chat/completions (不需要再加 /v1)
    if (endpoint.includes('/v1beta/openai') || endpoint.includes('/openai')) {
      // 确保路径正确拼接
      const cleanPathname = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
      url.pathname = cleanPathname + path;
      return url.toString();
    }

    // 标准处理：确保有 /v1 前缀
    let pathname = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
    if (!pathname.endsWith('/v1')) {
      pathname += '/v1';
    }
    url.pathname = pathname + path;
    return url.toString();
  } catch (error) {
    throw new Error(`API 端点格式不正确: ${endpoint}`);
  }
}

// 获取可用模型列表
export async function fetchAvailableModels(settings: APISettings): Promise<string[]> {
  if (!settings.api_endpoint || settings.api_endpoint.trim() === '') {
    throw new Error('API 端点未配置');
  }

  const endpoint = settings.api_endpoint.trim();
  let modelEndpoint: string;

  console.log('📍 原始端点:', endpoint);

  try {
    modelEndpoint = normalizeApiEndpoint(endpoint, '/models');
    console.log('🔗 规范化的 models 端点:', modelEndpoint);
  } catch (error) {
    throw new Error(`API 端点格式不正确: ${endpoint}`);
  }

  try {
    new URL(modelEndpoint);
  } catch (error) {
    throw new Error(`API 端点格式不正确: ${modelEndpoint}`);
  }

  // 尝试多个可能的端点
  const possibleEndpoints = [
    modelEndpoint,
    endpoint + (endpoint.endsWith('/') ? 'models' : '/models'),
    new URL(modelEndpoint).origin + '/v1/models',
    new URL(modelEndpoint).origin + '/models',
  ];

  console.log('🔍 尝试的模型端点:', possibleEndpoints);

  const errors: string[] = [];
  let hasCorsError = false;

  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`📡 正在请求: ${endpoint}`);

      const response = await fetchWithRetry(
        endpoint,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.api_key}`,
          },
        },
        2,
        1500,
      );

      console.log(`📊 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        errors.push(`${endpoint}: ${response.status} - ${errorText.substring(0, 100)}`);
        console.log(`❌ 端点返回错误: ${response.status}`);
        console.log(`错误详情: ${errorText.substring(0, 200)}`);
        continue;
      }

      const contentType = response.headers.get('content-type');
      console.log(`📄 内容类型: ${contentType}`);

      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        errors.push(`${endpoint}: 非 JSON 响应 - ${errorText.substring(0, 100)}`);
        console.log('❌ 返回非 JSON 内容:', errorText.substring(0, 200));
        continue;
      }

      const data = await response.json();
      console.log('✅ API 返回数据:', JSON.stringify(data, null, 2));

      // 尝试不同的响应格式
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((item: any) => item.id || item.name || item).filter(Boolean);
        if (models.length > 0) {
          console.log(`🎉 成功获取 ${models.length} 个模型:`, models);
          return models;
        }
      }

      if (Array.isArray(data)) {
        const models = data.map((item: any) => item.id || item.name || item).filter(Boolean);
        if (models.length > 0) {
          console.log(`🎉 成功获取 ${models.length} 个模型:`, models);
          return models;
        }
      }

      if (data.models && Array.isArray(data.models)) {
        const models = data.models.map((item: any) => item.id || item.name || item).filter(Boolean);
        if (models.length > 0) {
          console.log(`🎉 成功获取 ${models.length} 个模型:`, models);
          return models;
        }
      }

      errors.push(`${endpoint}: 响应格式无法识别 - ${JSON.stringify(data).substring(0, 100)}`);
      console.log('❌ 响应格式未识别');
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
        hasCorsError = true;
      }
      errors.push(`${endpoint}: ${errorMessage}`);
      console.log('❌ 请求失败:', error);
      continue;
    }
  }

  console.error('❌ 所有端点都失败了，详细错误:');
  errors.forEach((error, index) => console.error(`  ${index + 1}. ${error}`));

  let errorMessage = `无法从 API 获取模型列表。尝试了 ${possibleEndpoints.length} 个端点均失败。\n\n详细错误信息：\n${errors.join('\n\n')}\n\n请检查：\n1. API 端点是否正确（当前：${endpoint}）\n2. API Key 是否有效\n3. 该 API 是否支持 /v1/models 接口\n`;

  if (hasCorsError) {
    errorMessage += `\n⚠️ 检测到 CORS 错误：\n这是因为你的 API 服务器（${new URL(endpoint).origin}）没有配置 CORS 头。\n解决方案：\n• 在 Zeabur 项目设置中添加环境变量启用 CORS\n• 或在你的 API 服务器代码中添加 CORS 中间件\n• 或在酒馆主界面配置相同的 API，然后我们可以复用酒馆的配置\n\n`;
  }

  errorMessage += '如果该 API 不支持模型列表接口，请手动输入模型名称。';

  throw new Error(errorMessage);
}

// 总结消息
export async function summarizeMessages(startId: number, endId: number, settings: APISettings): Promise<string> {
  if (!settings.api_endpoint || settings.api_endpoint.trim() === '') {
    throw new Error('API 端点未配置');
  }

  const endpoint = settings.api_endpoint.trim();
  let apiUrl: string;

  try {
    apiUrl = normalizeApiEndpoint(endpoint);
    console.log('📍 原始端点:', endpoint);
    console.log('🔗 规范化的 API URL:', apiUrl);
  } catch (error) {
    throw new Error(`API 端点格式不正确: ${endpoint}`);
  }

  try {
    new URL(apiUrl);
  } catch (error) {
    throw new Error(`API 端点格式不正确: ${apiUrl}`);
  }

  // 收集消息 - 使用 TavernHelper
  let messages: ChatMessage[] = [];

  if (
    typeof (window as any).TavernHelper !== 'undefined' &&
    typeof (window as any).TavernHelper.getChatMessages === 'function'
  ) {
    // 使用范围获取
    const range = `${startId}-${endId}`;
    messages = (window as any).TavernHelper.getChatMessages(range);
  } else {
    throw new Error('TavernHelper.getChatMessages 不可用');
  }

  if (!messages || messages.length === 0) {
    throw new Error('没有可总结的消息');
  }

  const prompt = `你是一位专业的剧情总结助手。请对以下对话内容进行总结，**重点总结正文剧情**。

总结要求：
- 按时间顺序或逻辑顺序组织信息
- 保留关键事件和重要细节，省略冗余描述
- 直接陈述事实，避免主观评价
- 使用简洁清晰的语言，避免过度修饰
- 突出事件发展脉络和关键转折点
- 不使用任何XML标签，纯文字叙述
- 不回避任何敏感内容，保证记录完全还原前文
- 总结长度约 ${settings.max_tokens / 4} 字
- **重要：直接输出总结内容，不要添加任何回复语、问候语或解释性文字**

总结必须使用以下格式：
【关键事件标题】
关键事件概述。
发生地点: [地点]
关键角色: [角色列表]

• 分解事件1（小标题形式）: 简要描述
• 分解事件2（小标题形式）: 简要描述
• 分解事件3（小标题形式）: 简要描述
...

对话内容：
${messages.map(msg => `[${msg.role}]: ${msg.message}`).join('\n\n')}

直接输出总结内容，不要任何回复语：`;

  let response: Response;

  console.log('准备调用 API，URL:', apiUrl);
  console.log('请求体:', {
    model: settings.model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: settings.max_tokens,
    temperature: settings.temperature,
  });

  const requestParams = {
    model: settings.model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: settings.max_tokens,
    temperature: settings.temperature,
    top_p: settings.top_p,
    presence_penalty: settings.presence_penalty,
    frequency_penalty: settings.frequency_penalty,
  };

  // 根据 API 提供商过滤参数
  const filteredParams = filterApiParams(requestParams, settings.api_endpoint);

  try {
    response = await fetchWithRetry(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.api_key}`,
        },
        body: JSON.stringify(filteredParams),
      },
      3,
      2000,
    );
  } catch (error) {
    console.error('fetch 调用失败:', error);
    throw new Error(`无法连接到 API: ${(error as Error).message}`);
  }

  if (!response.ok) {
    let errorMessage = `API 请求失败: ${response.status}`;
    let errorDetails = '';

    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
      errorDetails = JSON.stringify(errorData, null, 2);
    } catch (error) {
      try {
        errorDetails = await response.text();
      } catch {
        // 忽略解析错误
      }
    }

    let userFriendlyMessage = errorMessage;

    if (response.status === 503) {
      userFriendlyMessage = `API 服务过载 (503)：${errorMessage}\n\nGemini API 当前负载过高，已自动重试但仍然失败。建议：\n• 等待几分钟后再试\n• 切换到其他模型（如 gemini-2.0-flash）\n• 检查 API 配额是否充足`;
    } else if (response.status === 500) {
      userFriendlyMessage = `API 服务器内部错误 (500)：${errorMessage}\n\n这通常是暂时性问题，请稍后重试。如果问题持续，请检查：\n• API 服务状态\n• 账户配额是否充足\n• 请求内容是否过长`;
    } else if (response.status === 429) {
      userFriendlyMessage = 'API 请求频率限制 (429)：请求过于频繁，请稍后再试。';
    } else if (response.status === 401) {
      userFriendlyMessage = 'API 认证失败 (401)：请检查 API 密钥是否正确。';
    } else if (response.status === 400) {
      userFriendlyMessage = `API 请求参数错误 (400)：${errorMessage}`;
    }

    console.error('❌ API 请求失败详情:', {
      status: response.status,
      statusText: response.statusText,
      errorMessage,
      errorDetails: errorDetails.substring(0, 500),
    });

    throw new Error(userFriendlyMessage);
  }

  const data = await response.json();

  // 检测内容过滤/安全拦截
  const finishReason = data.choices?.[0]?.finish_reason;
  if (finishReason === 'content_filter' || finishReason === 'PROHIBITED_CONTENT') {
    throw new Error(
      `内容被 AI 安全过滤器拦截 (finish_reason: ${finishReason})\n\n` +
        `输入内容可能包含敏感词汇，或请求的输出被认为不符合安全准则。\n` +
        `建议检查并修改输入内容，或尝试换一个模型。`,
    );
  }

  if (!data.choices || !data.choices[0] || !data.choices[0].message?.content) {
    throw new Error('API 返回数据格式错误');
  }

  return data.choices[0].message.content;
}
