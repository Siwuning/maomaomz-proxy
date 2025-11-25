import { detectApiProvider, normalizeApiEndpoint, useSettingsStore } from './settings';
import { detectEndpointType } from './utils/api-config';

/**
 * 通过酒馆后端获取模型列表（绕过 CORS）
 * 使用 /api/backends/chat-completions/status 端点
 */
async function fetchModelsViaTavern(apiUrl: string): Promise<string[]> {
  const tavernOrigin = window.location.origin;

  console.log('🔄 通过酒馆后端获取模型列表:', apiUrl);

  try {
    // 使用酒馆的 status 端点获取模型列表
    const response = await fetch(`${tavernOrigin}/api/backends/chat-completions/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(typeof SillyTavern !== 'undefined' && SillyTavern.getRequestHeaders ? SillyTavern.getRequestHeaders() : {}),
      },
      body: JSON.stringify({
        chat_completion_source: 'makersuite', // 使用 Google AI Studio 源，支持反代
        reverse_proxy: apiUrl.replace(/\/v1\/?$/, ''), // 移除 /v1 后缀
        proxy_password: '', // 反代不需要密码
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 酒馆返回模型数据:', data);

      if (data.data && Array.isArray(data.data)) {
        return data.data.map((m: any) => m.id || m.name || m).filter(Boolean);
      }
    } else {
      console.log('⚠️ 酒馆 status 端点返回错误:', response.status);
    }
  } catch (error) {
    console.log('⚠️ 通过酒馆获取模型失败:', error);
  }

  return [];
}

/**
 * 智能请求函数，自动处理 CORS 问题
 * 本地反代直接使用酒馆后端代理，避免 CORS 预检问题
 */
async function smartFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const endpointType = detectEndpointType(url);
  const isLocalEndpoint = endpointType === 'local' || endpointType === 'reverse-proxy';

  console.log(`🔍 端点类型: ${endpointType}, 是否本地: ${isLocalEndpoint}`);

  // 对于本地端点，直接使用酒馆后端代理（避免 CORS 预检问题）
  if (isLocalEndpoint) {
    console.log('🔄 本地端点，使用酒馆后端代理绕过 CORS...');
    return await tavernProxyFetch(url, options);
  }

  // 对于远程端点，直接请求
  return fetch(url, options);
}

/**
 * 通过酒馆后端代理请求（绕过 CORS）
 */
async function tavernProxyFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const tavernOrigin = window.location.origin;

  try {
    console.log('🔄 尝试通过酒馆后端代理:', tavernOrigin);

    // 方法 1: 使用酒馆的 /api/backends/chat-completions 端点
    // 这是酒馆内置的 OpenAI 兼容代理
    if (options.method === 'POST' && url.includes('/chat/completions')) {
      try {
        const body = options.body ? JSON.parse(options.body as string) : {};
        const headers = (options.headers as Record<string, string>) || {};

        const proxyResponse = await fetch(`${tavernOrigin}/api/backends/chat-completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof SillyTavern !== 'undefined' && SillyTavern.getRequestHeaders
              ? SillyTavern.getRequestHeaders()
              : {}),
          },
          body: JSON.stringify({
            ...body,
            api_url: url.replace('/chat/completions', ''),
            api_key: headers['Authorization']?.replace('Bearer ', '') || '',
          }),
        });

        if (proxyResponse.ok) {
          console.log('✅ 成功通过酒馆 chat-completions 代理');
          return proxyResponse;
        }
      } catch (e) {
        console.log('⚠️ chat-completions 代理不可用:', e);
      }
    }

    // 方法 2: 使用通用代理端点
    const proxyResponse = await fetch(`${tavernOrigin}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(typeof SillyTavern !== 'undefined' && SillyTavern.getRequestHeaders ? SillyTavern.getRequestHeaders() : {}),
      },
      body: JSON.stringify({
        url: url,
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body,
      }),
    });

    if (proxyResponse.ok) {
      console.log('✅ 成功通过酒馆通用代理');
      return proxyResponse;
    }

    console.log('⚠️ 酒馆代理返回错误:', proxyResponse.status);
  } catch (proxyError) {
    console.log('⚠️ 酒馆代理失败:', proxyError);
  }

  // 所有代理方式都失败，抛出详细错误
  throw new Error(
    `无法连接到 API 端点 (CORS 错误)\n\n` +
      `💡 解决方案：\n` +
      `1. 在反代服务中启用 CORS（添加 Access-Control-Allow-Origin: * 头）\n` +
      `2. 使用支持 CORS 的反代服务\n` +
      `3. 确保 Neural Proxy 已正确配置`,
  );
}

/**
 * 兼容旧的 proxyFetch 函数名
 */
async function proxyFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return smartFetch(url, options);
}

/**
 * 获取可用的模型列表
 */
export async function fetchAvailableModels(): Promise<string[]> {
  const settings = useSettingsStore().settings;

  // 验证 API endpoint
  if (!settings.api_endpoint || settings.api_endpoint.trim() === '') {
    throw new Error('API 端点未配置');
  }

  // 使用 normalizeApiEndpoint 获取 models 端点
  const baseUrl = settings.api_endpoint.trim();
  console.log('📍 原始端点:', baseUrl);

  // 检查是否是本地端点，如果是则优先使用酒馆后端获取模型列表
  const endpointType = detectEndpointType(baseUrl);
  const isLocalEndpoint = endpointType === 'local' || endpointType === 'reverse-proxy';

  if (isLocalEndpoint) {
    console.log('🏠 检测到本地端点，尝试通过酒馆后端获取模型列表...');
    const models = await fetchModelsViaTavern(baseUrl);
    if (models.length > 0) {
      console.log(`🎉 通过酒馆后端成功获取 ${models.length} 个模型:`, models);
      return models;
    }
    console.log('⚠️ 酒馆后端未返回模型，尝试其他方式...');
  }

  // 尝试规范化为 /models 端点
  let modelsUrl: string;
  try {
    modelsUrl = normalizeApiEndpoint(baseUrl, '/models');
    console.log('🔗 规范化的 models 端点:', modelsUrl);
  } catch (e) {
    throw new Error(`API 端点格式不正确: ${baseUrl}`);
  }

  // 验证是否为有效 URL
  try {
    new URL(modelsUrl);
  } catch (e) {
    throw new Error(`API 端点格式不正确: ${modelsUrl}`);
  }

  // 尝试多个可能的 models API 端点
  const possibleEndpoints = [
    modelsUrl, // 主要端点：规范化后的 /models
    // 备用端点
    baseUrl + (baseUrl.endsWith('/') ? 'models' : '/models'),
    new URL(modelsUrl).origin + '/v1/models',
    new URL(modelsUrl).origin + '/models',
  ];

  console.log('🔍 尝试的模型端点:', possibleEndpoints);

  const errors: string[] = [];
  let hasCorsError = false;

  for (const modelsUrl of possibleEndpoints) {
    try {
      console.log(`📡 正在请求: ${modelsUrl}`);

      // 构建请求头（API Key 可选）
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (settings.api_key && settings.api_key.trim()) {
        headers['Authorization'] = `Bearer ${settings.api_key}`;
      }

      // 使用代理请求
      const response = await proxyFetch(modelsUrl, {
        method: 'GET',
        headers,
      });

      console.log(`📊 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        errors.push(`${modelsUrl}: ${response.status} - ${errorText.substring(0, 100)}`);
        console.log(`❌ 端点返回错误: ${response.status}`);
        console.log(`错误详情: ${errorText.substring(0, 200)}`);
        continue;
      }

      const contentType = response.headers.get('content-type');
      console.log(`📄 内容类型: ${contentType}`);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        errors.push(`${modelsUrl}: 非 JSON 响应 - ${text.substring(0, 100)}`);
        console.log(`❌ 返回非 JSON 内容:`, text.substring(0, 200));
        continue;
      }

      const data = await response.json();
      console.log('✅ API 返回数据:', JSON.stringify(data, null, 2));

      // OpenAI 兼容 API 返回格式: { data: [...] }
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((model: any) => model.id || model.name || model).filter(Boolean);
        console.log(`🎉 成功获取 ${models.length} 个模型:`, models);
        if (models.length > 0) {
          return models;
        }
      }

      // 直接返回数组
      if (Array.isArray(data)) {
        const models = data.map((model: any) => model.id || model.name || model).filter(Boolean);
        console.log(`🎉 成功获取 ${models.length} 个模型:`, models);
        if (models.length > 0) {
          return models;
        }
      }

      // 有些 API 可能返回 { models: [...] }
      if (data.models && Array.isArray(data.models)) {
        const models = data.models.map((model: any) => model.id || model.name || model).filter(Boolean);
        console.log(`🎉 成功获取 ${models.length} 个模型:`, models);
        if (models.length > 0) {
          return models;
        }
      }

      errors.push(`${modelsUrl}: 响应格式无法识别 - ${JSON.stringify(data).substring(0, 100)}`);
      console.log('❌ 响应格式未识别');
    } catch (e) {
      const errMsg = (e as Error).message;
      if (errMsg.includes('Failed to fetch') || errMsg.includes('CORS')) {
        hasCorsError = true;
      }
      errors.push(`${modelsUrl}: ${errMsg}`);
      console.log(`❌ 请求失败:`, e);
      continue;
    }
  }

  console.error('❌ 所有端点都失败了，详细错误:');
  errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));

  let errorMessage =
    `无法从 API 获取模型列表。尝试了 ${possibleEndpoints.length} 个端点均失败。\n\n` +
    `详细错误信息：\n${errors.join('\n\n')}\n\n` +
    `请检查：\n` +
    `1. API 端点是否正确（当前：${baseUrl}）\n` +
    `2. API Key 是否有效\n` +
    `3. 该 API 是否支持 /v1/models 接口\n`;

  if (hasCorsError) {
    errorMessage +=
      `\n⚠️ 检测到 CORS 错误：\n` +
      `这是因为你的 API 服务器（${new URL(baseUrl).origin}）没有配置 CORS 头。\n` +
      `解决方案：\n` +
      `• 在 Zeabur 项目设置中添加环境变量启用 CORS\n` +
      `• 或在你的 API 服务器代码中添加 CORS 中间件\n` +
      `• 或在酒馆主界面配置相同的 API，然后我们可以复用酒馆的配置\n\n`;
  }

  errorMessage += `如果该 API 不支持模型列表接口，请手动输入模型名称。`;

  throw new Error(errorMessage);
}

/**
 * 总结指定楼层的消息上下文
 * @param start_id 开始楼层
 * @param end_id 结束楼层
 * @returns 总结文本
 */
export async function summarizeMessages(start_id: number, end_id: number): Promise<string> {
  const settings = useSettingsStore().settings;

  // 验证 API endpoint
  if (!settings.api_endpoint || settings.api_endpoint.trim() === '') {
    throw new Error('API 端点未配置');
  }

  // 规范化 API 端点（自动补全 /chat/completions）
  const baseUrl = settings.api_endpoint.trim();
  let apiUrl: string;
  try {
    apiUrl = normalizeApiEndpoint(baseUrl);
    console.log('📍 原始端点:', baseUrl);
    console.log('🔗 规范化的 API URL:', apiUrl);
  } catch (e) {
    throw new Error(`API 端点格式不正确: ${baseUrl}`);
  }

  // 验证是否为完整的 URL
  try {
    new URL(apiUrl);
  } catch (e) {
    throw new Error(`API 端点格式不正确: ${apiUrl}`);
  }

  // 获取要总结的消息
  // 使用 TavernHelper.getChatMessages() 获取消息范围
  const messages: Array<{ role: string; message: string }> = [];

  try {
    // 尝试多种方式获取消息
    let messagesRetrieved = false;

    // 方式1: 使用 TavernHelper.getChatMessages()
    if (
      typeof (window as any).TavernHelper !== 'undefined' &&
      typeof (window as any).TavernHelper.getChatMessages === 'function'
    ) {
      try {
        const range = `${start_id}-${end_id}`;
        console.log('📋 获取消息范围:', range);
        const msgs = (window as any).TavernHelper.getChatMessages(range);
        if (Array.isArray(msgs) && msgs.length > 0) {
          messages.push(...msgs);
          console.log('✅ 获取到消息数量:', msgs.length);
          messagesRetrieved = true;
        }

        // 如果从0开始获取不到消息，尝试从1开始
        if (start_id === 0 && (!Array.isArray(msgs) || msgs.length === 0)) {
          console.log('⚠️ 从0开始未获取到消息，尝试从1开始...');
          const newRange = `1-${end_id}`;
          const newMsgs = (window as any).TavernHelper.getChatMessages(newRange);
          if (Array.isArray(newMsgs) && newMsgs.length > 0) {
            messages.push(...newMsgs);
            console.log(`✅ 修改范围后(${newRange})获取到消息数量:`, newMsgs.length);
            messagesRetrieved = true;
          }
        }
      } catch (e) {
        console.warn('⚠️ TavernHelper.getChatMessages() 调用失败:', e);
        messagesRetrieved = false;
      }
    }

    // 方式2: 降级到 SillyTavern.chat（如果可用）
    if (
      !messagesRetrieved &&
      typeof (window as any).SillyTavern !== 'undefined' &&
      (window as any).SillyTavern.chat &&
      Array.isArray((window as any).SillyTavern.chat)
    ) {
      console.log('📝 尝试从 SillyTavern.chat 获取消息...');
      const chat = (window as any).SillyTavern.chat;
      const startIdx = Math.max(0, start_id);
      const endIdx = Math.min(chat.length - 1, end_id);

      for (let i = startIdx; i <= endIdx; i++) {
        if (chat[i] && chat[i].mes) {
          messages.push({
            role: chat[i].is_user ? 'user' : 'assistant',
            message: chat[i].mes || '',
          });
        }
      }
      console.log(`✅ 通过 SillyTavern.chat 获取到 ${messages.length} 条消息`);
      messagesRetrieved = true;
    }

    // 方式3: 使用全局 chat 变量（如果可用）
    if (!messagesRetrieved && typeof (window as any).chat !== 'undefined' && Array.isArray((window as any).chat)) {
      console.log('📝 尝试从全局 chat 变量获取消息...');
      const chat = (window as any).chat;
      const startIdx = Math.max(0, start_id);
      const endIdx = Math.min(chat.length - 1, end_id);

      for (let i = startIdx; i <= endIdx; i++) {
        if (chat[i] && chat[i].mes) {
          messages.push({
            role: chat[i].is_user ? 'user' : 'assistant',
            message: chat[i].mes || '',
          });
        }
      }
      console.log(`✅ 通过全局 chat 获取到 ${messages.length} 条消息`);
      messagesRetrieved = true;
    }

    if (!messagesRetrieved) {
      throw new Error('无法获取聊天消息：请确保在支持的聊天环境中使用（如 SillyTavern）');
    }
  } catch (error) {
    console.error('❌ 获取消息失败:', error);
    throw new Error('获取消息失败: ' + (error as Error).message);
  }

  if (messages.length === 0) {
    throw new Error(`没有可总结的消息（范围: ${start_id}-${end_id}）`);
  }

  // 构建总结提示 - 要求详细全面的剧情总结
  const summaryPrompt = `你是一位专业的剧情总结助手。请对以下对话内容进行总结，**重点总结正文剧情**。

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

  console.log('准备调用 API，URL:', apiUrl);
  console.log('请求体:', {
    model: settings.model,
    messages: [{ role: 'user', content: summaryPrompt }],
    max_tokens: settings.max_tokens,
    temperature: settings.temperature,
  });

  // 导入参数过滤函数
  const { filterApiParams } = await import('./settings');

  const requestParams = {
    model: settings.model,
    messages: [
      {
        role: 'user',
        content: summaryPrompt,
      },
    ],
    max_tokens: settings.max_tokens,
    temperature: settings.temperature,
    top_p: settings.top_p,
    presence_penalty: settings.presence_penalty,
    frequency_penalty: settings.frequency_penalty,
  };

  // 根据 API 提供商过滤参数
  const filteredParams = filterApiParams(requestParams, settings.api_endpoint);

  // 调用 OpenAI 兼容 API（使用智能请求，自动处理 CORS）
  let response;
  try {
    // 构建请求头（API Key 可选，本地反代可能不需要）
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (settings.api_key && settings.api_key.trim()) {
      headers['Authorization'] = `Bearer ${settings.api_key}`;
    }

    response = await smartFetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(filteredParams),
    });
  } catch (e) {
    console.error('smartFetch 调用失败:', e);
    throw new Error(`无法连接到 API: ${(e as Error).message}`);
  }

  if (!response.ok) {
    let errorMessage = `API 请求失败: ${response.status}`;
    let errorDetails = '';

    try {
      const error = await response.json();
      errorMessage = error.error?.message || error.message || errorMessage;
      errorDetails = JSON.stringify(error, null, 2);
    } catch (e) {
      // 如果响应不是 JSON，尝试读取文本
      try {
        errorDetails = await response.text();
      } catch {
        // 忽略文本读取错误
      }
    }

    // 根据状态码提供更具体的错误信息
    let userFriendlyMessage = errorMessage;
    if (response.status === 500) {
      userFriendlyMessage = `API 服务器内部错误 (500)：${errorMessage}\n\n这通常是暂时性问题，请稍后重试。如果问题持续，请检查：\n• API 服务状态\n• 账户配额是否充足\n• 请求内容是否过长`;
    } else if (response.status === 429) {
      userFriendlyMessage = `API 请求频率限制 (429)：请求过于频繁，请稍后再试。`;
    } else if (response.status === 401) {
      userFriendlyMessage = `API 认证失败 (401)：请检查 API 密钥是否正确。`;
    } else if (response.status === 403) {
      // 检查是否是 API Key 泄露的问题
      const lowerErrorMessage = errorMessage.toLowerCase();
      if (lowerErrorMessage.includes('leaked') || lowerErrorMessage.includes('reported')) {
        userFriendlyMessage = `❌ API Key 已被标记为泄露 (403)\n\n${errorMessage}\n\n💡 解决方案：\n1. 访问 https://aistudio.google.com/apikey 或 Google Cloud Console\n2. 删除当前 API Key（如果已泄露）\n3. 创建新的 API Key\n4. 在插件设置中更新新的 API Key\n\n⚠️ 注意：请妥善保管新的 API Key，不要分享给他人或提交到公开仓库`;
      } else {
        userFriendlyMessage = `API 权限被拒绝 (403)：${errorMessage}\n\n请检查：\n1. API Key 是否有效\n2. API Key 是否有足够的权限\n3. 是否已启用 Generative Language API（如果是 Gemini）`;
      }
    } else if (response.status === 400) {
      // 检查是否是 Gemini API，提供更具体的提示
      const provider = detectApiProvider(settings.api_endpoint);
      if (provider === 'gemini') {
        userFriendlyMessage = `API 请求参数错误 (400)：${errorMessage}\n\n💡 提示：检测到您使用的是 Google Gemini API。\n请确保：\n1. API 端点格式正确（例如：https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent）\n2. 模型名称正确（例如：gemini-pro）\n3. API Key 有效且已启用 Generative Language API`;
      } else {
        userFriendlyMessage = `API 请求参数错误 (400)：${errorMessage}\n\n请检查：\n1. API 端点格式是否正确\n2. 模型名称是否正确\n3. 请求参数是否有效`;
      }
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
  console.log('✅ API 返回的完整数据:', JSON.stringify(data, null, 2));

  // 尝试多种可能的返回格式
  let summary_content: string | null = null;

  // 格式 1: OpenAI 标准格式 { choices: [{ message: { content: "..." } }] }
  if (data.choices && data.choices[0] && data.choices[0].message?.content) {
    summary_content = data.choices[0].message.content;
  }
  // 格式 2: 直接返回文本 { content: "..." }
  else if (typeof data.content === 'string') {
    summary_content = data.content;
  }
  // 格式 3: 直接返回字符串
  else if (typeof data === 'string') {
    summary_content = data;
  }
  // 格式 4: { result: "..." }
  else if (typeof data.result === 'string') {
    summary_content = data.result;
  }
  // 格式 5: { text: "..." }
  else if (typeof data.text === 'string') {
    summary_content = data.text;
  }
  // 格式 6: { response: "..." }
  else if (typeof data.response === 'string') {
    summary_content = data.response;
  }

  if (!summary_content) {
    console.error('❌ 无法从返回数据中提取总结内容');
    console.error('📋 API 返回的完整数据结构:', JSON.stringify(data, null, 2));
    throw new Error(
      `API 返回数据格式不符合预期。\n\n` +
        `期望格式: { choices: [{ message: { content: "..." } }] }\n\n` +
        `实际返回: ${JSON.stringify(data).substring(0, 500)}...\n\n` +
        `请检查您的 API 端点是否为 OpenAI 兼容格式。`,
    );
  }

  console.log('✅ 成功提取总结内容');
  return summary_content;
}
