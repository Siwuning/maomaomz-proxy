import { APISettings, ChatMessage } from '../types';

// API请求代理函数
async function fetchWithProxy(url: string, options: RequestInit = {}) {
  try {
    const origin = window.location.origin;
    console.log('🔄 尝试通过酒馆后端代理:', origin);

    const response = await fetch(`${origin}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(typeof SillyTavern !== 'undefined' && SillyTavern.getRequestHeaders ? SillyTavern.getRequestHeaders() : {}),
      },
      body: JSON.stringify({
        url: url,
        method: options.method || 'GET',
        headers: options.headers || {},
      }),
    });

    if (response.ok) {
      console.log('✅ 成功通过酒馆后端代理');
      return response;
    }
    console.log('⚠️ 酒馆代理不可用，尝试直接请求');
  } catch (error) {
    console.log('⚠️ 酒馆代理失败，尝试直接请求:', error);
  }

  return fetch(url, options);
}

// 规范化API端点
export function normalizeApiEndpoint(endpoint: string, path: string = ''): string {
  try {
    const url = new URL(endpoint);
    if (path && !url.pathname.endsWith('/')) {
      url.pathname += '/';
    }
    if (path) {
      url.pathname += path.startsWith('/') ? path.slice(1) : path;
    }
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

      const response = await fetchWithProxy(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.api_key}`,
        },
      });

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

  // 导入参数过滤函数
  const { filterApiParams } = await import('../settings');

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
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.api_key}`,
      },
      body: JSON.stringify(filteredParams),
    });
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

    if (response.status === 500) {
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

  if (!data.choices || !data.choices[0] || !data.choices[0].message?.content) {
    throw new Error('API 返回数据格式错误');
  }

  return data.choices[0].message.content;
}
