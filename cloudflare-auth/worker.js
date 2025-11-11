/**
 * 🐱 猫猫的小破烂 - 授权验证后端
 * 作者: mzrodyu
 * 功能: 每日统一授权码验证系统
 * ⚠️ 商业化死全家，贩子死全家 ⚠️
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 处理
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由分发
      if (path === '/verify') {
        return await handleVerify(request, env, corsHeaders);
      } else if (path === '/update') {
        return await handleUpdate(request, env, corsHeaders);
      } else if (path === '/stats') {
        return await handleStats(request, env, corsHeaders);
      } else if (path === '/plugin-info') {
        return await handleGetPluginInfo(request, env, corsHeaders);
      } else if (path === '/update-plugin-info') {
        return await handleUpdatePluginInfo(request, env, corsHeaders);
      } else if (path === '/get-templates') {
        return await handleGetTemplates(request, env, corsHeaders);
      } else if (path === '/update-templates') {
        return await handleUpdateTemplates(request, env, corsHeaders);
      } else if (path === '/admin' || path === '/') {
        return handleAdmin(env);
      } else {
        return jsonResponse({ error: '404 Not Found' }, 404, corsHeaders);
      }
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: 'Internal Server Error', details: error.message }, 500, corsHeaders);
    }
  },
};

/**
 * 验证授权码（带API端点追踪）
 */
async function handleVerify(request, env, corsHeaders) {
  try {
    const { code, apiEndpoint, timestamp } = await request.json();

    if (!code) {
      return jsonResponse({ valid: false, message: '❌ 授权码不能为空' }, 400, corsHeaders);
    }

    // 获取请求的 IP 地址
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const country = request.headers.get('CF-IPCountry') || 'unknown';

    // 🔥 清理API端点数据（防止前端发送对象）
    let cleanApiEndpoint = 'unknown';
    if (apiEndpoint && typeof apiEndpoint === 'string' && apiEndpoint !== '[object Object]') {
      cleanApiEndpoint = apiEndpoint.trim() || 'unknown';
    }

    // 获取当前有效的授权码
    const currentCode = await env.CODES.get('current_code');

    if (!currentCode) {
      return jsonResponse(
        {
          valid: false,
          message: '❌ 系统暂未设置授权码\n\n请联系管理员',
        },
        200,
        corsHeaders,
      );
    }

    // 验证授权码（不区分大小写）
    const isValid = code.toUpperCase() === currentCode.toUpperCase();

    // 记录详细的验证日志（包含API端点）
    await logVerification(env, {
      code,
      isValid,
      apiEndpoint: cleanApiEndpoint, // 🔥 记录清理后的API端点
      ip,
      country,
      timestamp: timestamp || new Date().toISOString(),
    });

    if (isValid) {
      // 记录成功的验证
      await incrementStats(env, 'success');

      // 🔥 记录授权码使用次数
      await recordCodeUsage(env, currentCode, cleanApiEndpoint, ip, country);

      // 🔥 记录API端点使用情况（用于抓第三方商业化）
      if (cleanApiEndpoint !== 'unknown') {
        await recordApiEndpoint(env, cleanApiEndpoint, ip, country);
      }

      return jsonResponse(
        {
          valid: true,
          message: '✅ 授权验证通过！猫猫欢迎你！🐱',
          code: currentCode,
        },
        200,
        corsHeaders,
      );
    } else {
      // 记录失败的验证
      await incrementStats(env, 'failed');

      return jsonResponse(
        {
          valid: false,
          message: '❌ 授权码错误或已过期\n\n📢 请前往 Discord 查看今日最新授权码！\n⚠️ 商业化死全家，贩子死全家',
        },
        200,
        corsHeaders,
      );
    }
  } catch (error) {
    return jsonResponse({ valid: false, message: '❌ 请求格式错误' }, 400, corsHeaders);
  }
}

/**
 * 更新授权码（管理员接口）
 */
async function handleUpdate(request, env, corsHeaders) {
  try {
    const { adminKey, newCode } = await request.json();

    // 验证管理员密钥
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!newCode || newCode.trim().length === 0) {
      return jsonResponse({ success: false, message: '❌ 授权码不能为空' }, 400, corsHeaders);
    }

    const code = newCode.trim().toUpperCase();

    // 保存旧的授权码到历史
    const oldCode = await env.CODES.get('current_code');
    if (oldCode) {
      const history = await getHistory(env);
      history.unshift({
        code: oldCode,
        replacedAt: new Date().toISOString(),
      });
      // 只保留最近 30 条历史
      if (history.length > 30) {
        history.length = 30;
      }
      await env.CODES.put('history', JSON.stringify(history));
    }

    // 更新当前授权码
    await env.CODES.put('current_code', code);
    await env.CODES.put('updated_at', new Date().toISOString());

    // 重置今日统计
    await env.CODES.put(
      'stats',
      JSON.stringify({
        success: 0,
        failed: 0,
        lastReset: new Date().toISOString(),
      }),
    );

    return jsonResponse(
      {
        success: true,
        message: '✅ 授权码更新成功！',
        code: code,
        updatedAt: new Date().toISOString(),
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 请求格式错误' }, 400, corsHeaders);
  }
}

/**
 * 获取统计数据（管理员接口）
 */
async function handleStats(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    // 验证管理员密钥
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const currentCode = await env.CODES.get('current_code');
    const updatedAt = await env.CODES.get('updated_at');
    const stats = await getStats(env);
    const history = await getHistory(env);

    // 获取API端点数据 🔥
    const endpointsStr = await env.CODES.get('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};
    const endpointList = Object.values(endpoints);

    // 按访问次数排序
    endpointList.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));

    // 🔥 获取授权码使用统计
    const codeUsageStr = await env.CODES.get('code_usage');
    const codeUsage = codeUsageStr ? JSON.parse(codeUsageStr) : {};
    const codeUsageList = Object.values(codeUsage);

    // 按使用次数排序
    codeUsageList.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

    // 获取验证日志
    const logsStr = await env.CODES.get('verification_logs');
    const logs = logsStr ? JSON.parse(logsStr) : [];

    return jsonResponse(
      {
        success: true,
        data: {
          currentCode: currentCode || '未设置',
          updatedAt: updatedAt || '未知',
          stats: {
            success: stats.success || 0,
            failed: stats.failed || 0,
            total: (stats.success || 0) + (stats.failed || 0),
            successRate:
              stats.success + stats.failed > 0
                ? ((stats.success / (stats.success + stats.failed)) * 100).toFixed(1)
                : '0',
            apiEndpointCount: endpointList.length, // API端点数量
          },
          history: history.slice(0, 10), // 最近 10 条历史授权码
          apiEndpoints: endpointList.slice(0, 30), // 🔥 最近 30 个API端点
          codeUsage: codeUsageList.slice(0, 20), // 🔥 授权码使用统计（最近20个）
          logs: logs.slice(0, 50), // 最近 50 条验证日志
        },
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 请求格式错误' }, 400, corsHeaders);
  }
}

/**
 * 管理页面
 */
function handleAdmin(env) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐱 猫猫的小破烂 - 授权管理后台</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a2a2a 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid #3a3a3a;
        }

        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #ff9500 0%, #ffa500 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .warning-banner {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: #fff;
            padding: 15px;
            border-radius: 12px;
            margin: 20px auto;
            max-width: 600px;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 1px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
        }

        .card {
            background: rgba(42, 42, 42, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            border: 1px solid #3a3a3a;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(74, 158, 255, 0.2);
        }

        .card h2 {
            color: #4a9eff;
            margin-bottom: 20px;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            cursor: pointer;
            user-select: none;
            transition: all 0.3s ease;
        }

        .card h2:hover {
            color: #6ab4ff;
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .collapse-icon {
            font-size: 16px;
            transition: transform 0.3s ease;
            color: #888;
        }

        .collapse-icon.collapsed {
            transform: rotate(-90deg);
        }

        .card-content {
            max-height: 2000px;
            overflow: hidden;
            transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
            opacity: 1;
        }

        .card-content.collapsed {
            max-height: 0 !important;
            opacity: 0;
            pointer-events: none;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #ccc;
            font-weight: 500;
        }

        input[type="text"],
        input[type="password"],
        textarea {
            width: 100%;
            padding: 14px;
            background: #1a1a1a;
            border: 2px solid #3a3a3a;
            border-radius: 10px;
            color: #fff;
            font-size: 16px;
            transition: border-color 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        textarea {
            resize: vertical;
            min-height: 200px;
            line-height: 1.6;
            font-family: 'Courier New', 'Monaco', monospace;
        }

        input:focus,
        textarea:focus {
            outline: none;
            border-color: #4a9eff;
            box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
        }

        .button {
            padding: 14px 28px;
            background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
            border: none;
            border-radius: 10px;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(74, 158, 255, 0.3);
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(74, 158, 255, 0.5);
        }

        .button:active {
            transform: translateY(0);
        }

        .button-secondary {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            box-shadow: 0 4px 16px rgba(107, 114, 128, 0.3);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .stat-card {
            background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #3a3a3a;
            text-align: center;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #4a9eff;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #888;
            font-size: 14px;
        }

        .code-display {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #4a9eff;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            text-align: center;
            letter-spacing: 3px;
            color: #4a9eff;
            margin: 20px 0;
            font-weight: 700;
        }

        .history-item {
            background: #1a1a1a;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid #4a9eff;
        }

        .history-code {
            font-family: 'Courier New', monospace;
            font-weight: 700;
            color: #4a9eff;
        }

        .history-time {
            color: #888;
            font-size: 14px;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(74, 158, 255, 0.3);
            border-radius: 50%;
            border-top-color: #4a9eff;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .alert {
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 500;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            color: #10b981;
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            color: #ef4444;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 28px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐱 猫猫的小破烂 - 授权管理后台</h1>
            <p style="color: #888; margin-top: 10px;">作者: mzrodyu | 完全免费 | 禁止商业化</p>
            <div class="warning-banner">
                ⚠️ 商业化死全家，贩子死全家 ⚠️
            </div>
        </div>

        <div id="alert-container"></div>

        <!-- 插件信息管理 -->
        <div class="card">
            <h2 onclick="toggleCard('plugin-info')">
                <span class="card-header">📦 插件信息管理</span>
                <span class="collapse-icon" id="plugin-info-icon">▼</span>
            </h2>
            <div class="card-content" id="plugin-info-content">
            <div class="form-group">
                <label>当前版本号</label>
                <input type="text" id="pluginVersion" placeholder="例如：1.4.0" />
            </div>
            <div class="form-group">
                <label>更新日志（支持 Markdown）</label>
                <textarea id="pluginChangelog" placeholder="例如：&#10;## v1.4.0&#10;- 新增功能A&#10;- 修复Bug B&#10;&#10;## v1.3.0&#10;- 修复了XXX问题" style="min-height: 300px;"></textarea>
            </div>
            <div class="form-group">
                <label>使用说明（支持 Markdown）</label>
                <textarea id="pluginUsage" placeholder="例如：&#10;## 功能简介&#10;&#10;### 总结功能&#10;- 自动/手动总结对话&#10;&#10;### 写卡辅助&#10;- 生成角色卡、世界书等" style="min-height: 400px;"></textarea>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="button" onclick="updatePluginInfo()">💾 保存插件信息</button>
                <button class="button button-secondary" onclick="loadPluginInfo()">🔄 重新加载</button>
            </div>
            <div id="plugin-info-status" style="margin-top: 15px; padding: 12px; background: rgba(74, 158, 255, 0.1); border-radius: 8px; border-left: 4px solid #4a9eff; display: none;">
                <strong>📋 当前插件信息：</strong>
                <div id="plugin-info-display" style="margin-top: 10px; font-size: 14px;"></div>
            </div>
            </div>
        </div>

        <!-- 更新授权码 -->
        <div class="card">
            <h2 onclick="toggleCard('update-code')">
                <span class="card-header">🔑 更新今日授权码</span>
                <span class="collapse-icon" id="update-code-icon">▼</span>
            </h2>
            <div class="card-content" id="update-code-content">
            <div class="form-group">
                <label>管理员密钥</label>
                <input type="password" id="adminKey" placeholder="输入你的管理员密钥" />
            </div>
            <div class="form-group">
                <label>新的授权码</label>
                <input type="text" id="newCode" placeholder="例如：MEOW-20251110-ABCD" />
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="button" onclick="updateCode()">🚀 更新授权码</button>
                <button class="button button-secondary" onclick="generateCode()">🎲 自动生成</button>
            </div>
            </div>
        </div>

        <!-- 当前授权码显示 -->
        <div class="card">
            <h2 onclick="toggleCard('current-code')">
                <span class="card-header">📊 当前授权码</span>
                <span class="collapse-icon" id="current-code-icon">▼</span>
            </h2>
            <div class="card-content" id="current-code-content">
            <div class="code-display" id="currentCode">加载中...</div>
            <p style="text-align: center; color: #888;">
                <span id="updatedTime">更新时间: 加载中...</span>
            </p>
            <button class="button" onclick="copyCode()" style="width: 100%; margin-top: 15px;">
                📋 复制到剪贴板
            </button>
            </div>
        </div>

        <!-- 使用统计 -->
        <div class="card">
            <h2 onclick="toggleCard('stats')">
                <span class="card-header">📈 今日使用统计</span>
                <span class="collapse-icon" id="stats-icon">▼</span>
            </h2>
            <div class="card-content" id="stats-content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="statSuccess">0</div>
                    <div class="stat-label">验证成功</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="statFailed">0</div>
                    <div class="stat-label">验证失败</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="statTotal">0</div>
                    <div class="stat-label">总验证次数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="statRate">0%</div>
                    <div class="stat-label">成功率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="statEndpoints">0</div>
                    <div class="stat-label">API端点数</div>
                </div>
            </div>
            <button class="button button-secondary" onclick="refreshStats()" style="width: 100%;">
                🔄 刷新统计
            </button>
            </div>
        </div>

        <!-- 授权码使用统计 -->
        <div class="card">
            <h2 onclick="toggleCard('code-usage')">
                <span class="card-header">🔑 授权码使用统计</span>
                <span class="collapse-icon" id="code-usage-icon">▼</span>
            </h2>
            <div class="card-content" id="code-usage-content">
            <p style="color: #888; font-size: 14px; margin-bottom: 15px;">
                📊 每个授权码的使用次数、独立IP数量、API端点分布
            </p>
            <div id="codeUsageList" style="max-height: 400px; overflow-y: auto;">
                <p style="color: #888; text-align: center;">加载中...</p>
            </div>
            </div>
        </div>

        <!-- API端点统计（用于抓第三方商业化） -->
        <div class="card">
            <h2 onclick="toggleCard('api-endpoints')">
                <span class="card-header">🌐 API端点统计（用于抓第三方）</span>
                <span class="collapse-icon" id="api-endpoints-icon">▼</span>
            </h2>
            <div class="card-content" id="api-endpoints-content">
            <p style="color: #888; font-size: 14px; margin-bottom: 15px;">
                📊 追踪用户使用的API服务商，如果某个端点频繁出现，可能是商业化倒卖行为
            </p>
            <div id="endpointsList" style="max-height: 500px; overflow-y: auto;">
                <p style="color: #888; text-align: center;">加载中...</p>
            </div>
            </div>
        </div>

        <!-- 验证日志 -->
        <div class="card">
            <h2 onclick="toggleCard('logs')">
                <span class="card-header">📋 验证日志（最近50条）</span>
                <span class="collapse-icon" id="logs-icon">▼</span>
            </h2>
            <div class="card-content" id="logs-content">
            <div id="logsList" style="max-height: 500px; overflow-y: auto;">
                <p style="color: #888; text-align: center;">加载中...</p>
            </div>
            </div>
        </div>

        <!-- 历史授权码 -->
        <div class="card">
            <h2 onclick="toggleCard('history')">
                <span class="card-header">📜 历史授权码</span>
                <span class="collapse-icon" id="history-icon">▼</span>
            </h2>
            <div class="card-content" id="history-content">
            <div id="historyList">
                <p style="color: #888; text-align: center;">加载中...</p>
            </div>
            </div>
        </div>

        <!-- 项目模板管理 -->
        <div class="card">
            <h2 onclick="toggleCard('templates')">
                <span class="card-header">📁 项目模板管理</span>
                <span class="collapse-icon" id="templates-icon">▼</span>
            </h2>
            <div class="card-content" id="templates-content">
                <p style="color: #888; font-size: 14px; margin-bottom: 15px;">
                    🎨 管理前端项目的模板选项，前端会从这里读取模板列表
                </p>
                <div id="templatesList" style="margin-bottom: 20px;">
                    <p style="color: #888; text-align: center;">加载中...</p>
                </div>
                <button class="button" onclick="saveTemplates()" style="width: 100%;">
                    💾 保存模板配置
                </button>
            </div>
        </div>
    </div>

    <script>
        // 折叠/展开卡片功能
        function toggleCard(cardId) {
            const content = document.getElementById(cardId + '-content');
            const icon = document.getElementById(cardId + '-icon');

            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                icon.classList.remove('collapsed');
                icon.textContent = '▼';
                localStorage.setItem('card-' + cardId, 'expanded');
            } else {
                content.classList.add('collapsed');
                icon.classList.add('collapsed');
                icon.textContent = '▶';
                localStorage.setItem('card-' + cardId, 'collapsed');
            }
        }

        // 折叠/展开单个模板卡片
        function toggleTemplateCard(index) {
            const content = document.getElementById('template-card-' + index);
            const icon = document.getElementById('template-collapse-' + index);

            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '▼';
            } else {
                content.style.display = 'none';
                icon.textContent = '▶';
            }
        }

        // 恢复卡片折叠状态
        function restoreCardStates() {
            const cardIds = ['plugin-info', 'update-code', 'current-code', 'stats', 'code-usage', 'api-endpoints', 'logs', 'history', 'templates'];
            cardIds.forEach(function(cardId) {
                const state = localStorage.getItem('card-' + cardId);
                if (state === 'collapsed') {
                    const content = document.getElementById(cardId + '-content');
                    const icon = document.getElementById(cardId + '-icon');
                    if (content && icon) {
                        content.classList.add('collapsed');
                        icon.classList.add('collapsed');
                        icon.textContent = '▶';
                    }
                }
            });
        }

        // 页面加载时自动获取统计
        window.onload = function() {
            restoreCardStates(); // 恢复卡片折叠状态
            const savedKey = localStorage.getItem('adminKey');
            if (savedKey) {
                document.getElementById('adminKey').value = savedKey;
                refreshStats();
            }
            loadPluginInfo(); // 加载插件信息
            loadTemplates(); // 加载项目模板
        };

        // 显示提示消息
        function showAlert(message, type) {
            if (type === undefined) type = 'success';
            const container = document.getElementById('alert-container');
            const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
            const alert = document.createElement('div');
            alert.className = 'alert ' + alertClass;
            alert.textContent = message;
            container.innerHTML = '';
            container.appendChild(alert);
            setTimeout(function() { alert.remove(); }, 5000);
        }

        // 更新授权码
        async function updateCode() {
            const adminKey = document.getElementById('adminKey').value;
            const newCode = document.getElementById('newCode').value;

            if (!adminKey) {
                showAlert('❌ 请输入管理员密钥', 'error');
                return;
            }

            if (!newCode) {
                showAlert('❌ 请输入新的授权码', 'error');
                return;
            }

            try {
                const response = await fetch('/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, newCode })
                });

                const data = await response.json();

                if (data.success) {
                    showAlert('✅ ' + data.message, 'success');
                    localStorage.setItem('adminKey', adminKey);
                    document.getElementById('newCode').value = '';
                    refreshStats();
                } else {
                    showAlert('❌ ' + data.message, 'error');
                }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 自动生成授权码
        function generateCode() {
            const today = new Date();
            const dateStr = today.getFullYear() +
                          String(today.getMonth() + 1).padStart(2, '0') +
                          String(today.getDate()).padStart(2, '0');

            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let random = '';
            for (let i = 0; i < 4; i++) {
                random += chars[Math.floor(Math.random() * chars.length)];
            }

            const code = 'MEOW-' + dateStr + '-' + random;
            document.getElementById('newCode').value = code;
            showAlert('✅ 已生成授权码: ' + code, 'success');
        }

        // 刷新统计数据
        async function refreshStats() {
            const adminKey = document.getElementById('adminKey').value;

            if (!adminKey) {
                return;
            }

            try {
                const response = await fetch('/stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey })
                });

                const result = await response.json();

                if (result.success) {
                    const data = result.data;

                    // 更新当前授权码
                    document.getElementById('currentCode').textContent = data.currentCode;
                    document.getElementById('updatedTime').textContent =
                        '更新时间: ' + new Date(data.updatedAt).toLocaleString("zh-CN");

                    // 更新统计数据
                    document.getElementById('statSuccess').textContent = data.stats.success;
                    document.getElementById('statFailed').textContent = data.stats.failed;
                    document.getElementById('statTotal').textContent = data.stats.total;
                    document.getElementById('statRate').textContent = data.stats.successRate + '%';
                    document.getElementById('statEndpoints').textContent = data.stats.apiEndpointCount || 0;

                    // 🔥 更新授权码使用统计
                    const codeUsageList = document.getElementById('codeUsageList');
                    if (data.codeUsage && data.codeUsage.length > 0) {
                        codeUsageList.innerHTML = data.codeUsage.map(function(usage) {
                            const isHighUsage = usage.usageCount > 100;
                            const isMultiIP = usage.ipCount > 5;
                            const endpointList = usage.endpoints ? Object.entries(usage.endpoints) : [];

                            let endpointDetails = '';
                            if (endpointList.length > 0) {
                                const endpointItems = endpointList.map(function(item) {
                                    return '<div style="color: #666; font-size: 11px; margin-bottom: 4px;">🌐 ' + item[0] + ': ' + item[1] + '次</div>';
                                }).join('');
                                endpointDetails = '<details style="margin-top: 8px;">' +
                                    '<summary style="cursor: pointer; color: #666; font-size: 12px;">查看API端点分布</summary>' +
                                    '<div style="margin-top: 8px; padding: 10px; background: #0a0a0a; border-radius: 8px;">' +
                                    endpointItems +
                                    '</div></details>';
                            }

                            const borderColor = (isHighUsage || isMultiIP) ? '#ef4444' : '#10b981';
                            const highUsageBadge = isHighUsage ? '<span style="background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">⚠️ 高频使用</span>' : '';
                            const multiIPBadge = isMultiIP ? '<span style="background: #f59e0b; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">⚠️ 多IP</span>' : '';
                            const usageColor = isHighUsage ? '#ef4444' : '#10b981';
                            const ipColor = isMultiIP ? '#f59e0b' : '#10b981';

                            return '<div class="history-item" style="border-left-color: ' + borderColor + ';">' +
                                '<div style="flex: 1;">' +
                                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">' +
                                        highUsageBadge + multiIPBadge +
                                        '<span style="font-family: Courier New, monospace; font-weight: 700; color: #4a9eff; font-size: 14px;">' +
                                            usage.code +
                                        '</span>' +
                                    '</div>' +
                                    '<div style="color: #888; font-size: 13px; margin-bottom: 6px;">' +
                                        '使用次数: <span style="color: ' + usageColor + '; font-weight: 700;">' + usage.usageCount + '</span> | ' +
                                        '独立IP: <span style="color: ' + ipColor + '; font-weight: 700;">' + usage.ipCount + '</span>' +
                                    '</div>' +
                                    '<div style="color: #666; font-size: 12px; margin-bottom: 4px;">' +
                                        '首次: ' + new Date(usage.firstUsed).toLocaleString("zh-CN") + ' | ' +
                                        '最后: ' + new Date(usage.lastUsed).toLocaleString("zh-CN") +
                                    '</div>' +
                                    endpointDetails +
                                '</div>' +
                            '</div>';
                        }).join('');
                    } else {
                        codeUsageList.innerHTML = '<p style="color: #888; text-align: center;">暂无授权码使用数据</p>';
                    }

                    // 🔥 更新API端点列表
                    const endpointsList = document.getElementById('endpointsList');
                    if (data.apiEndpoints && data.apiEndpoints.length > 0) {
                        endpointsList.innerHTML = data.apiEndpoints.map(function(endpoint) {
                            const ipCount = endpoint.ips ? Object.keys(endpoint.ips).length : 0;
                            const isHighRisk = endpoint.accessCount > 50;

                            let ipDetails = '无IP数据';
                            let moreIPsText = '';
                            if (endpoint.ips) {
                                const ipEntries = Object.entries(endpoint.ips).slice(0, 10);
                                ipDetails = ipEntries.map(function(item) {
                                    const ip = item[0];
                                    const info = item[1];
                                    return '<div style="color: #666; font-size: 11px; margin-bottom: 4px;">📍 ' + ip + ' (' + info.country + ') - 访问' + info.count + '次</div>';
                                }).join('');
                                if (Object.keys(endpoint.ips).length > 10) {
                                    moreIPsText = '<div style="color: #666; font-size: 11px;">...更多IP</div>';
                                }
                            }

                            const borderColor = isHighRisk ? '#ef4444' : '#4a9eff';
                            const highRiskBadge = isHighRisk ? '<span style="background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">⚠️ 高风险</span>' : '';
                            const countColor = isHighRisk ? '#ef4444' : '#10b981';

                            return '<div class="history-item" style="border-left-color: ' + borderColor + ';">' +
                                '<div style="flex: 1;">' +
                                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">' +
                                        highRiskBadge +
                                        '<span style="font-family: Courier New, monospace; font-weight: 700; color: #4a9eff; font-size: 14px;">' +
                                            endpoint.endpoint +
                                        '</span>' +
                                    '</div>' +
                                    '<div style="color: #888; font-size: 13px; margin-bottom: 4px;">' +
                                        '访问次数: <span style="color: ' + countColor + '; font-weight: 700;">' + endpoint.accessCount + '</span> | ' +
                                        '独立IP: ' + ipCount + ' | ' +
                                        '首次: ' + new Date(endpoint.firstAccess).toLocaleString("zh-CN") +
                                    '</div>' +
                                    '<details style="margin-top: 8px;">' +
                                        '<summary style="cursor: pointer; color: #666; font-size: 12px;">查看IP详情</summary>' +
                                        '<div style="margin-top: 8px; padding: 10px; background: #0a0a0a; border-radius: 8px;">' +
                                            ipDetails + moreIPsText +
                                        '</div>' +
                                    '</details>' +
                                '</div>' +
                                '<span class="history-time">' + new Date(endpoint.lastAccess).toLocaleString("zh-CN") + '</span>' +
                            '</div>';
                        }).join('');
                    } else {
                        endpointsList.innerHTML = '<p style="color: #888; text-align: center;">暂无API端点数据</p>';
                    }

                    // 更新验证日志
                    const logsList = document.getElementById('logsList');
                    if (data.logs && data.logs.length > 0) {
                        logsList.innerHTML = data.logs.map(function(log) {
                            const borderColor = log.isValid ? '#10b981' : '#ef4444';
                            const icon = log.isValid ? '✅' : '❌';
                            const codeColor = log.isValid ? '#10b981' : '#ef4444';
                            const apiEndpoint = log.apiEndpoint || 'unknown';

                            return '<div class="history-item" style="border-left-color: ' + borderColor + ';">' +
                                '<div>' +
                                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
                                        '<span style="font-size: 14px;">' + icon + '</span>' +
                                        '<span style="font-family: Courier New, monospace; color: ' + codeColor + ';">' +
                                            log.code +
                                        '</span>' +
                                        '<span style="color: #888; font-size: 12px;">' +
                                            'IP: ' + log.ip + ' (' + log.country + ')' +
                                        '</span>' +
                                    '</div>' +
                                    '<div style="color: #666; font-size: 12px;">' +
                                        '🌐 API: ' + apiEndpoint +
                                    '</div>' +
                                '</div>' +
                                '<span class="history-time">' + new Date(log.timestamp).toLocaleString("zh-CN") + '</span>' +
                            '</div>';
                        }).join('');
                    } else {
                        logsList.innerHTML = '<p style="color: #888; text-align: center;">暂无验证日志</p>';
                    }

                    // 更新历史授权码
                    const historyList = document.getElementById('historyList');
                    if (data.history && data.history.length > 0) {
                        historyList.innerHTML = data.history.map(function(item) {
                            return '<div class="history-item">' +
                                '<span class="history-code">' + item.code + '</span>' +
                                '<span class="history-time">' + new Date(item.replacedAt).toLocaleString("zh-CN") + '</span>' +
                            '</div>';
                        }).join('');
                    } else {
                        historyList.innerHTML = '<p style="color: #888; text-align: center;">暂无历史记录</p>';
                    }
                } else {
                    showAlert('❌ ' + result.message, 'error');
                }
            } catch (error) {
                showAlert('❌ 获取统计失败: ' + error.message, 'error');
            }
        }

        // 复制授权码
        function copyCode() {
            const code = document.getElementById('currentCode').textContent;
            if (code === '加载中...' || code === '未设置') {
                showAlert('❌ 暂无可复制的授权码', 'error');
                return;
            }
            navigator.clipboard.writeText(code);
            showAlert('✅ 授权码已复制到剪贴板！', 'success');
        }

        // 加载插件信息
        async function loadPluginInfo() {
            try {
                const response = await fetch('/plugin-info');
                const result = await response.json();

                if (result.success && result.data) {
                    const data = result.data;
                    document.getElementById('pluginVersion').value = data.version || '';
                    document.getElementById('pluginChangelog').value = data.changelog || '';
                    document.getElementById('pluginUsage').value = data.usage || '';

                    // 显示当前信息
                    const displayDiv = document.getElementById('plugin-info-display');
                    displayDiv.innerHTML = '<div style="color: #ccc;">' +
                        '<div style="margin-bottom: 8px;">📌 版本：<strong style="color: #4a9eff;">' + data.version + '</strong></div>' +
                        '<div style="margin-bottom: 8px;">🕐 最后更新：' + new Date(data.lastUpdated).toLocaleString("zh-CN") + '</div>' +
                        '<div style="font-size: 12px; color: #888;">💡 插件前端可以通过 /plugin-info 接口获取这些信息</div>' +
                    '</div>';
                    document.getElementById('plugin-info-status').style.display = 'block';
                } else {
                    showAlert('⚠️ 暂无插件信息，请填写并保存', 'error');
                }
            } catch (error) {
                console.error('加载插件信息失败:', error);
                showAlert('❌ 加载插件信息失败：' + error.message, 'error');
            }
        }

        // 更新插件信息
        async function updatePluginInfo() {
            const version = document.getElementById('pluginVersion').value.trim();
            const changelog = document.getElementById('pluginChangelog').value.trim();
            const usage = document.getElementById('pluginUsage').value.trim();

            if (!version || !changelog || !usage) {
                showAlert('❌ 版本号、更新日志和使用说明不能为空', 'error');
                return;
            }

            try {
                const response = await fetch('/update-plugin-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ version, changelog, usage })
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('✅ ' + result.message, 'success');
                    loadPluginInfo(); // 重新加载显示
                } else {
                    showAlert('❌ ' + (result.message || '更新失败'), 'error');
                }
            } catch (error) {
                console.error('更新插件信息失败:', error);
                showAlert('❌ 更新失败：' + error.message, 'error');
            }
        }

        console.log('✅ Worker.js 已加载最新版本 2024-11-11-01:30 - 模板卡片可折叠');

        // 全局存储模板数据
        let currentTemplates = [];

        // 加载项目模板
        async function loadTemplates() {
            try {
                const response = await fetch('/get-templates');
                const result = await response.json();

                if (result.success) {
                    currentTemplates = result.data.templates || [];
                    renderTemplates();
                } else {
                    document.getElementById('templatesList').innerHTML =
                        '<p style="color: #ef4444; text-align: center;">加载失败</p>';
                }
            } catch (error) {
                console.error('加载模板失败:', error);
                document.getElementById('templatesList').innerHTML =
                    '<p style="color: #ef4444; text-align: center;">加载失败：' + error.message + '</p>';
            }
        }

        // 渲染模板列表
        function renderTemplates() {
            var listHtml = currentTemplates.map(function(template, index) {
                var borderColor = template.enabled ? '#4a9eff' : '#6b7280';
                var checkedAttr = template.enabled ? 'checked' : '';
                var files = template.files || [];

                // 渲染文件列表
                var filesHtml = files.map(function(file, fileIndex) {
                    var fileName = (file.name || '').replace(/"/g, '&quot;');
                    var fileContent = (file.content || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return '<div style="background: #0a0a0a; padding: 10px; border-radius: 6px; margin-bottom: 8px;">' +
                        '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">' +
                            '<input type="text" id="template-' + index + '-file-' + fileIndex + '-name" value="' + fileName + '" ' +
                                   'style="flex: 1; padding: 6px; background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 4px; color: #4a9eff; font-size: 12px; font-family: monospace;" ' +
                                   'placeholder="filename.ext" />' +
                            '<button onclick="removeFile(' + index + ',' + fileIndex + ')" ' +
                                    'style="padding: 4px 8px; background: #7c2d12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Del</button>' +
                        '</div>' +
                        '<textarea id="template-' + index + '-file-' + fileIndex + '-content" ' +
                                  'style="width: 100%; min-height: 150px; padding: 8px; background: #1a1a1a; border: 1px solid #3a3a3a; border-radius: 4px; color: #10b981; font-size: 12px; font-family: monospace; line-height: 1.4; resize: vertical;" ' +
                                  'placeholder="File content...">' + fileContent + '</textarea>' +
                    '</div>';
                }).join('');

                return '<div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ' + borderColor + ';">' +
                    // 模板标题区域 - 可点击折叠
                    '<div onclick="toggleTemplateCard(' + index + ')" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center; cursor: pointer; padding: 8px; background: #252525; border-radius: 6px; transition: background 0.2s;" ' +
                         'onmouseover="this.style.background=' + "'" + '#2a2a2a' + "'" + '" onmouseout="this.style.background=' + "'" + '#252525' + "'" + '">' +
                        '<span style="color: #888; font-size: 16px;" id="template-collapse-' + index + '">▶</span>' +
                        '<span style="font-size: 20px;">' + template.icon + '</span>' +
                        '<span style="flex: 1; color: #e0e0e0; font-size: 14px; font-weight: 600;">' + template.title + '</span>' +
                        '<span style="color: #888; font-size: 12px;">' + files.length + ' file(s)</span>' +
                    '</div>' +
                    // 可折叠的内容区域
                    '<div id="template-card-' + index + '" style="display: none; animation: slideDown 0.3s ease-out;">' +
                        '<div style="display: flex; gap: 10px; margin-bottom: 10px;">' +
                            '<input type="text" id="template-icon-' + index + '" value="' + template.icon + '" ' +
                                   'style="width: 60px; padding: 8px; background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; color: #e0e0e0; font-size: 20px; text-align: center;" ' +
                                   'placeholder="📁" onclick="event.stopPropagation()" />' +
                            '<input type="text" id="template-title-' + index + '" value="' + template.title + '" ' +
                                   'style="flex: 1; padding: 8px; background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; color: #e0e0e0; font-size: 14px;" ' +
                                   'placeholder="Template Title" onclick="event.stopPropagation()" />' +
                        '</div>' +
                        '<div style="margin-bottom: 10px;">' +
                            '<input type="text" id="template-desc-' + index + '" value="' + template.description + '" ' +
                                   'style="width: 100%; padding: 8px; background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; color: #e0e0e0; font-size: 13px;" ' +
                                   'placeholder="Description" onclick="event.stopPropagation()" />' +
                        '</div>' +
                        '<div style="margin-bottom: 10px;">' +
                            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">' +
                                '<label style="display: block; color: #888; font-size: 12px;">Files:</label>' +
                                '<button onclick="addFile(' + index + ')" ' +
                                        'style="padding: 4px 12px; background: #065f46; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">+ Add File</button>' +
                            '</div>' +
                            '<div id="template-' + index + '-files">' +
                                filesHtml +
                            '</div>' +
                        '</div>' +
                        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                            '<label style="display: flex; align-items: center; cursor: pointer;">' +
                                '<input type="checkbox" id="template-enabled-' + index + '" ' + checkedAttr + ' ' +
                                       'style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;" onclick="event.stopPropagation()" />' +
                                '<span style="color: #888; font-size: 13px;">Enabled</span>' +
                            '</label>' +
                            '<button onclick="removeTemplate(' + index + ')" ' +
                                    'style="padding: 6px 12px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Delete Template</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');

            document.getElementById('templatesList').innerHTML = listHtml +
                '<button onclick="addTemplate()" ' +
                        'style="width: 100%; padding: 12px; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; margin-top: 10px;">' +
                    '+ Add Template' +
                '</button>';
        }

        // 添加新模板
        function addTemplate() {
            currentTemplates.push({
                id: 'template-' + Date.now(),
                icon: '📁',
                title: 'New Template',
                description: 'Description',
                files: [
                    { name: 'index.html', content: '' },
                    { name: 'style.css', content: '' },
                    { name: 'script.js', content: '' }
                ],
                enabled: true
            });
            renderTemplates();
        }

        // 添加文件
        function addFile(templateIndex) {
            if (!currentTemplates[templateIndex].files) {
                currentTemplates[templateIndex].files = [];
            }
            currentTemplates[templateIndex].files.push({
                name: 'newfile.js',
                content: ''
            });
            renderTemplates();
        }

        // 删除文件
        function removeFile(templateIndex, fileIndex) {
            if (confirm('Delete this file?')) {
                currentTemplates[templateIndex].files.splice(fileIndex, 1);
                renderTemplates();
            }
        }

        // 删除模板
        function removeTemplate(index) {
            if (confirm('Delete this template?')) {
                currentTemplates.splice(index, 1);
                renderTemplates();
            }
        }

        // 保存模板配置
        async function saveTemplates() {
            try {
                var templates = currentTemplates.map(function(template, index) {
                    var files = (template.files || []).map(function(file, fileIndex) {
                        var nameElem = document.getElementById('template-' + index + '-file-' + fileIndex + '-name');
                        var contentElem = document.getElementById('template-' + index + '-file-' + fileIndex + '-content');
                        return {
                            name: nameElem ? nameElem.value : file.name,
                            content: contentElem ? contentElem.value : file.content
                        };
                    });

                    return {
                        id: template.id,
                        icon: document.getElementById('template-icon-' + index).value.trim(),
                        title: document.getElementById('template-title-' + index).value.trim(),
                        description: document.getElementById('template-desc-' + index).value.trim(),
                        files: files,
                        enabled: document.getElementById('template-enabled-' + index).checked
                    };
                });

                var response = await fetch('/update-templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templates: templates })
                });

                var result = await response.json();

                if (result.success) {
                    showAlert('Saved successfully', 'success');
                    currentTemplates = result.data.templates;
                    renderTemplates();
                } else {
                    showAlert('Save failed', 'error');
                }
            } catch (error) {
                console.error('Save error:', error);
                showAlert('Save failed: ' + error.message, 'error');
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// ===== 辅助函数 =====

function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

async function getStats(env) {
  const statsStr = await env.CODES.get('stats');
  if (!statsStr) {
    return { success: 0, failed: 0, lastReset: new Date().toISOString() };
  }
  return JSON.parse(statsStr);
}

async function incrementStats(env, type) {
  const stats = await getStats(env);
  stats[type] = (stats[type] || 0) + 1;
  await env.CODES.put('stats', JSON.stringify(stats));
}

async function getHistory(env) {
  const historyStr = await env.CODES.get('history');
  if (!historyStr) {
    return [];
  }
  return JSON.parse(historyStr);
}

/**
 * 记录详细的验证日志
 */
async function logVerification(env, logData) {
  try {
    const logsStr = await env.CODES.get('verification_logs');
    const logs = logsStr ? JSON.parse(logsStr) : [];

    logs.unshift(logData);

    // 只保留最近 500 条日志
    if (logs.length > 500) {
      logs.length = 500;
    }

    await env.CODES.put('verification_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('记录日志失败:', error);
  }
}

/**
 * 记录授权码使用次数
 */
async function recordCodeUsage(env, code, apiEndpoint, ip, country) {
  try {
    const usageStr = await env.CODES.get('code_usage');
    const usage = usageStr ? JSON.parse(usageStr) : {};

    if (usage[code]) {
      // 授权码已存在，更新统计
      usage[code].lastUsed = new Date().toISOString();
      usage[code].usageCount = (usage[code].usageCount || 0) + 1;

      // 记录API端点分布
      if (!usage[code].endpoints) {
        usage[code].endpoints = {};
      }
      if (!usage[code].endpoints[apiEndpoint]) {
        usage[code].endpoints[apiEndpoint] = 0;
      }
      usage[code].endpoints[apiEndpoint] += 1;

      // 记录IP数量（用于检测多人使用）
      // 从数组恢复为Set
      const ips = new Set(usage[code].uniqueIPs || []);
      ips.add(ip);
      usage[code].uniqueIPs = Array.from(ips);
      usage[code].ipCount = ips.size;
    } else {
      // 新的授权码
      usage[code] = {
        code: code,
        firstUsed: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        usageCount: 1,
        endpoints: {
          [apiEndpoint]: 1,
        },
        uniqueIPs: [ip],
        ipCount: 1,
      };
    }

    await env.CODES.put('code_usage', JSON.stringify(usage));
  } catch (error) {
    console.error('记录授权码使用失败:', error);
  }
}

/**
 * 记录API端点使用情况（用于抓第三方商业化）
 */
async function recordApiEndpoint(env, apiEndpoint, ip, country) {
  try {
    const endpointsStr = await env.CODES.get('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};

    if (endpoints[apiEndpoint]) {
      // API端点已存在，更新统计
      endpoints[apiEndpoint].lastAccess = new Date().toISOString();
      endpoints[apiEndpoint].accessCount = (endpoints[apiEndpoint].accessCount || 0) + 1;

      // 记录使用这个端点的IP（用于追踪）
      if (!endpoints[apiEndpoint].ips) {
        endpoints[apiEndpoint].ips = {};
      }
      if (!endpoints[apiEndpoint].ips[ip]) {
        endpoints[apiEndpoint].ips[ip] = {
          country: country,
          firstSeen: new Date().toISOString(),
          count: 0,
        };
      }
      endpoints[apiEndpoint].ips[ip].count += 1;
      endpoints[apiEndpoint].ips[ip].lastSeen = new Date().toISOString();
    } else {
      // 新的API端点
      endpoints[apiEndpoint] = {
        endpoint: apiEndpoint,
        firstAccess: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        accessCount: 1,
        ips: {
          [ip]: {
            country: country,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            count: 1,
          },
        },
      };
    }

    await env.CODES.put('api_endpoints', JSON.stringify(endpoints));
  } catch (error) {
    console.error('记录API端点失败:', error);
  }
}

/**
 * 获取插件信息（版本、更新日志、使用说明）
 */
async function handleGetPluginInfo(request, env, corsHeaders) {
  try {
    const pluginInfoStr = await env.CODES.get('plugin_info');
    const pluginInfo = pluginInfoStr
      ? JSON.parse(pluginInfoStr)
      : {
          version: '1.4.0',
          changelog: '暂无更新日志',
          usage: '暂无使用说明',
          lastUpdated: new Date().toISOString(),
        };

    return jsonResponse(
      {
        success: true,
        data: pluginInfo,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('获取插件信息失败:', error);
    return jsonResponse({ success: false, error: error.message }, 500, corsHeaders);
  }
}

/**
 * 更新插件信息（仅管理员）
 */
async function handleUpdatePluginInfo(request, env, corsHeaders) {
  try {
    const { version, changelog, usage } = await request.json();

    if (!version || !changelog || !usage) {
      return jsonResponse(
        {
          success: false,
          message: '版本号、更新日志和使用说明不能为空',
        },
        400,
        corsHeaders,
      );
    }

    const pluginInfo = {
      version: version.trim(),
      changelog: changelog.trim(),
      usage: usage.trim(),
      lastUpdated: new Date().toISOString(),
    };

    await env.CODES.put('plugin_info', JSON.stringify(pluginInfo));

    return jsonResponse(
      {
        success: true,
        message: '✅ 插件信息已更新',
        data: pluginInfo,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('更新插件信息失败:', error);
    return jsonResponse({ success: false, error: error.message }, 500, corsHeaders);
  }
}

/**
 * 获取项目模板列表
 */
async function handleGetTemplates(request, env, corsHeaders) {
  try {
    const templatesStr = await env.CODES.get('project_templates');
    const templates = templatesStr
      ? JSON.parse(templatesStr)
      : {
          templates: [
            {
              id: 'basic-template',
              icon: '📄',
              title: '基础模板',
              description: 'HTML + CSS + JS 基础项目',
              files: [
                { name: 'index.html', content: '' },
                { name: 'style.css', content: '' },
                { name: 'script.js', content: '' },
              ],
              enabled: true,
            },
          ],
          lastUpdated: new Date().toISOString(),
        };

    return jsonResponse(
      {
        success: true,
        data: templates,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('获取项目模板失败:', error);
    return jsonResponse({ success: false, error: error.message }, 500, corsHeaders);
  }
}

/**
 * 更新项目模板（仅管理员）
 */
async function handleUpdateTemplates(request, env, corsHeaders) {
  try {
    const { templates } = await request.json();

    if (!templates || !Array.isArray(templates)) {
      return jsonResponse(
        {
          success: false,
          message: '模板列表格式错误',
        },
        400,
        corsHeaders,
      );
    }

    const templateData = {
      templates: templates.map(t => ({
        id: t.id,
        icon: t.icon,
        title: t.title,
        description: t.description,
        files: t.files || [],
        enabled: t.enabled !== false,
      })),
      lastUpdated: new Date().toISOString(),
    };

    await env.CODES.put('project_templates', JSON.stringify(templateData));

    return jsonResponse(
      {
        success: true,
        message: '✅ 项目模板已更新',
        data: templateData,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('更新项目模板失败:', error);
    return jsonResponse({ success: false, error: error.message }, 500, corsHeaders);
  }
}
