/**
 * 🐱 猫猫的小破烂 - 授权验证后端 (Upstash Redis 版)
 * 作者: mzrodyu
 * 功能: 每日统一授权码验证系统
 * ⚠️ 商业化死全家，贩子死全家 ⚠️
 */

// ========== Upstash Redis 配置 ==========
const UPSTASH_REDIS_REST_URL = 'https://pro-piglet-36199.upstash.io';
const UPSTASH_REDIS_REST_TOKEN = 'AY1nAAIncDI0ODNmMmM0MzhiODA0YjUzYTc4OTk0NjFhMjRlNTY2MnAyMzYxOTk';

/**
 * Upstash Redis REST API 辅助函数
 */
async function redisGet(key) {
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/GET/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await response.json();
  return data.result;
}

async function redisSet(key, value) {
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  // 使用 Pipeline API 避免 URL 长度限制
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([['SET', key, valueStr]]),
  });
  const data = await response.json();
  return data[0]; // Pipeline 返回数组，取第一个结果
}

async function redisKeys(pattern) {
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/KEYS/${pattern}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await response.json();
  return data.result || [];
}

async function redisIncr(key) {
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/INCR/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await response.json();
  return data.result;
}

async function redisDel(key) {
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/DEL/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  return await response.json();
}

// ========== Cloudflare Workers 主程序 ==========

export default {
  // HTTP 请求处理
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
      } else if (path === '/get-regex-templates') {
        return await handleGetRegexTemplates(request, env, corsHeaders);
      } else if (path === '/update-regex-templates') {
        return await handleUpdateRegexTemplates(request, env, corsHeaders);
      } else if (path === '/ban-endpoint') {
        return await handleBanEndpoint(request, env, corsHeaders);
      } else if (path === '/unban-endpoint') {
        return await handleUnbanEndpoint(request, env, corsHeaders);
      } else if (path === '/get-banned-endpoints') {
        return await handleGetBannedEndpoints(request, env, corsHeaders);
      } else if (path === '/delete-endpoint') {
        return await handleDeleteEndpoint(request, env, corsHeaders);
      } else if (path === '/add-blacklist') {
        return await handleAddBlacklist(request, env, corsHeaders);
      } else if (path === '/get-blacklist') {
        return await handleGetBlacklist(request, env, corsHeaders);
      } else if (path === '/remove-blacklist') {
        return await handleRemoveBlacklist(request, env, corsHeaders);
      } else if (path === '/whitelist-endpoint') {
        return await handleWhitelistEndpoint(request, env, corsHeaders);
      } else if (path === '/unwhitelist-endpoint') {
        return await handleUnwhitelistEndpoint(request, env, corsHeaders);
      } else if (path === '/get-whitelist-endpoints') {
        return await handleGetWhitelistEndpoints(request, env, corsHeaders);
      } else if (path === '/suspicious-endpoint') {
        return await handleSuspiciousEndpoint(request, env, corsHeaders);
      } else if (path === '/unsuspicious-endpoint') {
        return await handleUnsuspiciousEndpoint(request, env, corsHeaders);
      } else if (path === '/get-suspicious-endpoints') {
        return await handleGetSuspiciousEndpoints(request, env, corsHeaders);
      } else if (path === '/admin' || path === '/') {
        return handleAdmin(env);
      } else if (path === '/get-auto-update-config') {
        return await handleGetAutoUpdateConfig(request, env, corsHeaders);
      } else if (path === '/set-auto-update-config') {
        return await handleSetAutoUpdateConfig(request, env, corsHeaders);
      } else if (path === '/trigger-auto-update') {
        return await handleTriggerAutoUpdate(request, env, corsHeaders);
      } else if (path === '/get-code' || path === '/daily-code') {
        return await handleGetCode(request, env, corsHeaders);
      } else if (path === '/api/bot/claim') {
        return await handleBotClaim(request, env, corsHeaders);
      } else {
        return jsonResponse({ error: '404 Not Found' }, 404, corsHeaders);
      }
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: 'Internal Server Error', details: error.message }, 500, corsHeaders);
    }
  },

  // 🔄 定时任务处理（Cron Triggers）
  async scheduled(event, env, ctx) {
    console.log('⏰ 定时任务触发:', new Date().toISOString());

    try {
      // 检查是否启用了自动更新
      const configStr = await redisGet('auto_update_config');
      const config = configStr ? JSON.parse(configStr) : { enabled: false, hour: 0, days: 1 };

      if (!config.enabled) {
        console.log('ℹ️ 自动更新未启用，跳过');
        return;
      }

      // 检查是否到达用户配置的更新时间（北京时间）
      const now = new Date();
      const beijingHour = (now.getUTCHours() + 8) % 24;
      const configuredHour = config.hour !== undefined ? config.hour : 0;
      const configuredDays = config.days !== undefined ? config.days : 1;

      if (beijingHour !== configuredHour) {
        console.log('ℹ️ 当前北京时间 ' + beijingHour + ' 点，配置更新时间 ' + configuredHour + ' 点，跳过');
        return;
      }

      // 检查天数间隔
      if (configuredDays > 1) {
        const lastUpdateStr = await redisGet('updated_at');
        if (lastUpdateStr) {
          const lastUpdate = new Date(lastUpdateStr);
          const daysSinceLastUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLastUpdate < configuredDays) {
            console.log('ℹ️ 距上次更新 ' + daysSinceLastUpdate + ' 天，配置间隔 ' + configuredDays + ' 天，跳过');
            return;
          }
        }
      }

      console.log(
        '🔄 到达配置的更新时间（每' + configuredDays + '天，北京时间 ' + configuredHour + ' 点），开始更新...',
      );

      // 生成新的授权码
      const today = new Date();
      const dateStr =
        today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let random = '';
      for (let i = 0; i < 4; i++) {
        random += chars[Math.floor(Math.random() * chars.length)];
      }

      const newCode = 'MEOW-' + dateStr + '-' + random;

      // 保存旧的授权码到历史
      const oldCode = await redisGet('current_code');
      if (oldCode) {
        const historyStr = await redisGet('history');
        const history = historyStr ? JSON.parse(historyStr) : [];
        history.unshift({
          code: oldCode,
          replacedAt: new Date().toISOString(),
          replacedBy: 'auto_update',
        });
        if (history.length > 30) {
          history.length = 30;
        }
        await redisSet('history', JSON.stringify(history));
      }

      // 更新当前授权码
      await redisSet('current_code', newCode);
      await redisSet('updated_at', new Date().toISOString());

      // 记录自动更新日志
      const autoUpdateLogsStr = await redisGet('auto_update_logs');
      const autoUpdateLogs = autoUpdateLogsStr ? JSON.parse(autoUpdateLogsStr) : [];
      autoUpdateLogs.unshift({
        oldCode: oldCode || '无',
        newCode: newCode,
        timestamp: new Date().toISOString(),
        trigger: 'cron',
      });
      if (autoUpdateLogs.length > 100) {
        autoUpdateLogs.length = 100;
      }
      await redisSet('auto_update_logs', JSON.stringify(autoUpdateLogs));

      // 重置今日统计
      await redisSet(
        'stats',
        JSON.stringify({
          success: 0,
          failed: 0,
          lastReset: new Date().toISOString(),
        }),
      );

      console.log('✅ 自动更新授权码成功:', newCode);
    } catch (error) {
      console.error('❌ 自动更新失败:', error);
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

    // 🔥 清理API端点数据（防止前端发送对象）
    let cleanApiEndpoint = 'unknown';
    if (apiEndpoint && typeof apiEndpoint === 'string' && apiEndpoint !== '[object Object]') {
      cleanApiEndpoint = apiEndpoint.trim() || 'unknown';
    }

    // 🔥 检查 API 端点是否被禁用
    const bannedEndpointsStr = await redisGet('banned_endpoints');
    const bannedEndpoints = bannedEndpointsStr ? JSON.parse(bannedEndpointsStr) : {};

    if (cleanApiEndpoint !== 'unknown' && bannedEndpoints[cleanApiEndpoint]) {
      const banInfo = bannedEndpoints[cleanApiEndpoint];
      console.log(`⛔ 已禁用的 API 端点尝试验证: ${cleanApiEndpoint}`);

      // 记录被拒绝的访问
      await logVerification(env, {
        code,
        isValid: false,
        apiEndpoint: cleanApiEndpoint,
        timestamp: timestamp || new Date().toISOString(),
        reason: 'BANNED_ENDPOINT',
      });

      // 🎣 钓鱼模式：不暴露真实原因，让他来帖子找你
      return jsonResponse(
        {
          valid: false,
          message: `❌ 授权服务暂时不可用\n\n请稍后重试，若持续失败可前往帖子反馈`,
        },
        200,
        corsHeaders,
      );
    }

    // 🔥 检查 API 端点是否在黑名单中（贩子端点，支持模糊匹配）
    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    // 模糊匹配：检查用户端点是否包含黑名单中的任何关键词
    let matchedBlacklist = null;
    if (cleanApiEndpoint !== 'unknown') {
      const lowerEndpoint = cleanApiEndpoint.toLowerCase();
      for (const key of Object.keys(blacklist)) {
        const lowerKey = key.toLowerCase();
        // 检查是否包含（支持 www.xxx.com、api.xxx.com、xxx.com/v1 等各种形式）
        if (lowerEndpoint.includes(lowerKey) || lowerKey.includes(lowerEndpoint)) {
          matchedBlacklist = blacklist[key];
          matchedBlacklist.matchedKey = key;
          break;
        }
      }
    }

    if (matchedBlacklist) {
      console.log(
        `☠️ 黑名单 API 端点尝试验证: ${cleanApiEndpoint} (匹配: ${matchedBlacklist.matchedKey}, 站点: ${matchedBlacklist.siteName})`,
      );

      // 记录被拒绝的访问
      await logVerification(env, {
        code,
        isValid: false,
        apiEndpoint: cleanApiEndpoint,
        timestamp: timestamp || new Date().toISOString(),
        reason: 'BLACKLIST_ENDPOINT',
      });

      // 🎣 钓鱼模式
      return jsonResponse(
        {
          valid: false,
          message: `❌ 授权服务暂时不可用\n\n请稍后重试，若持续失败可前往帖子反馈`,
        },
        200,
        corsHeaders,
      );
    }

    // 🔥 无论验证成功还是失败，都记录 API 端点（用于抓商业化）
    if (cleanApiEndpoint !== 'unknown' && cleanApiEndpoint !== '[object HTMLSelectElement]') {
      try {
        await recordApiEndpoint(env, cleanApiEndpoint);
      } catch (logError) {
        console.warn('记录API端点失败:', logError);
      }
    }

    // 获取当前有效的授权码
    const currentCode = await redisGet('current_code');

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

    if (!isValid) {
      // 记录失败的详细日志
      await logVerification(env, {
        code,
        isValid: false,
        apiEndpoint: cleanApiEndpoint,
        timestamp: timestamp || new Date().toISOString(),
      });

      // 记录失败统计
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

    // 验证成功：记录统计
    try {
      await incrementStats(env, 'success');
    } catch (logError) {
      console.warn('记录统计失败:', logError);
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
  } catch (error) {
    console.error('❌ handleVerify 错误:', error);
    console.error('错误堆栈:', error.stack);
    return jsonResponse(
      {
        valid: false,
        message: '❌ 请求格式错误: ' + error.message,
      },
      400,
      corsHeaders,
    );
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
    const oldCode = await redisGet('current_code');
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
      await redisSet('history', JSON.stringify(history));
    }

    // 更新当前授权码
    await redisSet('current_code', code);
    await redisSet('updated_at', new Date().toISOString());

    // 重置今日统计
    await redisSet(
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

    const currentCode = await redisGet('current_code');
    const updatedAt = await redisGet('updated_at');
    const stats = await getStats(env);
    const history = await getHistory(env);

    // 获取API端点数据 🔥
    const endpointsStr = await redisGet('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};

    // 获取禁用列表
    const bannedEndpointsStr = await redisGet('banned_endpoints');
    const bannedEndpoints = bannedEndpointsStr ? JSON.parse(bannedEndpointsStr) : {};

    // 获取白名单
    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};

    // 获取可疑列表
    const suspiciousStr = await redisGet('suspicious_endpoints');
    const suspicious = suspiciousStr ? JSON.parse(suspiciousStr) : {};

    // 合并禁用、白名单、可疑状态到端点列表
    const endpointList = Object.values(endpoints).map(ep => ({
      ...ep,
      isBanned: !!bannedEndpoints[ep.endpoint],
      isWhitelisted: !!whitelist[ep.endpoint],
      isSuspicious: !!suspicious[ep.endpoint],
    }));

    // 按访问次数排序
    endpointList.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));

    // 🔥 获取授权码使用统计
    const codeUsageStr = await redisGet('code_usage');
    const codeUsage = codeUsageStr ? JSON.parse(codeUsageStr) : {};
    const codeUsageList = Object.values(codeUsage);

    // 按使用次数排序
    codeUsageList.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

    // 获取验证日志
    const logsStr = await redisGet('verification_logs');
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
          apiEndpoints: endpointList.slice(0, 100), // 🔥 最多 100 个API端点
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
 * 管理页面 - 侧边栏布局版本
 */
function handleAdmin(env) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐱 猫猫的小破烂 - 授权管理后台</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e0e0e0; line-height: 1.6; }

        /* 侧边栏 */
        .sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 240px; background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border-right: 1px solid #2a2a2a; overflow-y: auto; z-index: 100; display: flex; flex-direction: column; }
        .sidebar-header { padding: 20px 16px; border-bottom: 1px solid #2a2a2a; text-align: center; }
        .sidebar-header h1 { font-size: 18px; background: linear-gradient(135deg, #ff9500 0%, #ffa500 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sidebar-header .warning { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #fff; padding: 6px 10px; border-radius: 6px; margin-top: 10px; font-size: 10px; font-weight: 700; }
        .nav-group { padding: 10px 0; border-bottom: 1px solid #1f1f1f; }
        .nav-group-title { padding: 6px 16px; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: #888; cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; }
        .nav-item:hover { background: rgba(74, 158, 255, 0.1); color: #fff; }
        .nav-item.active { background: rgba(74, 158, 255, 0.15); color: #4a9eff; border-left-color: #4a9eff; }
        .nav-item .icon { font-size: 16px; }
        .nav-item .label { font-size: 13px; }
        .sidebar-footer { padding: 12px; border-top: 1px solid #2a2a2a; margin-top: auto; }
        .sidebar-footer label { display: block; margin-bottom: 4px; color: #888; font-size: 11px; }
        .sidebar-footer input { width: 100%; padding: 8px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 12px; }

        /* 主内容区 */
        .main-content { margin-left: 240px; min-height: 100vh; padding: 20px; }
        .page-header { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #2a2a2a; }
        .page-header h2 { font-size: 22px; color: #fff; }
        .page-header p { color: #888; font-size: 13px; margin-top: 4px; }
        .page { display: none; }
        .page.active { display: block; }

        /* 卡片 */
        .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
        .card-title { font-size: 15px; color: #4a9eff; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

        /* 表单 */
        .form-group { margin-bottom: 14px; }
        .form-group label { display: block; margin-bottom: 4px; color: #ccc; font-size: 13px; }
        input[type="text"], input[type="password"], textarea { width: 100%; padding: 10px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 13px; }
        input:focus, textarea:focus { outline: none; border-color: #4a9eff; }
        textarea { min-height: 120px; resize: vertical; font-family: 'Courier New', monospace; }

        /* 按钮 */
        .btn { padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%); color: #fff; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3); }
        .btn-secondary { background: #2a2a2a; color: #ccc; }
        .btn-secondary:hover { background: #3a3a3a; }
        .btn-danger { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff; }
        .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }

        /* 统计卡片 */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 16px; }
        .stat-card { background: #0f0f0f; border: 1px solid #2a2a2a; border-radius: 8px; padding: 14px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: 700; color: #4a9eff; }
        .stat-label { font-size: 11px; color: #888; margin-top: 4px; }

        /* 授权码显示 */
        .code-display { background: #0f0f0f; border: 2px solid #4a9eff; border-radius: 8px; padding: 16px; text-align: center; font-family: 'Courier New', monospace; font-size: 22px; font-weight: 700; color: #4a9eff; letter-spacing: 2px; }

        /* 列表项 */
        .list-item { background: #0f0f0f; border-radius: 6px; padding: 10px 14px; margin-bottom: 6px; border-left: 3px solid #4a9eff; }
        .list-item.success { border-left-color: #10b981; }
        .list-item.error { border-left-color: #ef4444; }
        .list-item.warning { border-left-color: #f59e0b; }

        /* 开关 */
        .switch-container { display: flex; align-items: center; gap: 10px; }
        .switch { width: 44px; height: 24px; background: #3a3a3a; border-radius: 12px; position: relative; cursor: pointer; transition: background 0.3s; }
        .switch.active { background: #4a9eff; }
        .switch::after { content: ''; position: absolute; width: 20px; height: 20px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: transform 0.3s; }
        .switch.active::after { transform: translateX(20px); }

        /* 提示 */
        .alert { padding: 10px 14px; border-radius: 6px; margin-bottom: 12px; font-size: 13px; }
        .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; }
        .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ef4444; }
        #alert-container { position: fixed; top: 16px; right: 16px; z-index: 1000; max-width: 360px; }

        /* 滚动容器 */
        .scroll-container { max-height: 350px; overflow-y: auto; }

        /* 响应式 */
        @media (max-width: 768px) {
            .sidebar { width: 100%; height: auto; position: relative; border-right: none; border-bottom: 1px solid #2a2a2a; }
            .main-content { margin-left: 0; }
            .nav-group { display: flex; flex-wrap: wrap; padding: 6px; }
            .nav-item { padding: 6px 10px; border-left: none; border-radius: 4px; }
        }

    </style>
</head>
<body>
    <!-- 侧边栏 -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <h1>🐱 猫猫的小破烂</h1>
            <p style="font-size: 11px; color: #888; margin-top: 4px;">授权管理后台</p>
            <div class="warning">⚠️ 商业化死全家 ⚠️</div>
        </div>
        <nav>
            <div class="nav-group">
                <div class="nav-group-title">授权管理</div>
                <div class="nav-item active" onclick="showPage('dashboard')"><span class="icon">�</span><span class="label">仪表盘</span></div>
                <div class="nav-item" onclick="showPage('auth-code')"><span class="icon">🔑</span><span class="label">授权码管理</span></div>
                <div class="nav-item" onclick="showPage('auto-update')"><span class="icon">🔄</span><span class="label">自动更新</span></div>
            </div>
            <div class="nav-group">
                <div class="nav-group-title">监控</div>
                <div class="nav-item" onclick="showPage('endpoints')"><span class="icon">🌐</span><span class="label">API端点</span></div>
                <div class="nav-item" onclick="showPage('logs')"><span class="icon">📋</span><span class="label">验证日志</span></div>
                <div class="nav-item" onclick="showPage('banned')"><span class="icon">🚫</span><span class="label">禁用列表</span></div>
                <div class="nav-item" onclick="showPage('suspicious')"><span class="icon">⚠️</span><span class="label">可疑列表</span></div>
                <div class="nav-item" onclick="showPage('whitelist')"><span class="icon">✅</span><span class="label">白名单</span></div>
                <div class="nav-item" onclick="showPage('blacklist')"><span class="icon">☠️</span><span class="label">黑名单</span></div>
            </div>
            <div class="nav-group">
                <div class="nav-group-title">设置</div>
                <div class="nav-item" onclick="showPage('plugin-info')"><span class="icon">�</span><span class="label">插件信息</span></div>
            </div>
        </nav>
        <div class="sidebar-footer">
            <label>🔐 管理员密钥</label>
            <input type="password" id="adminKey" placeholder="输入密钥" />
        </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
        <div id="alert-container"></div>

        <!-- 仪表盘 -->
        <div id="page-dashboard" class="page active">
            <div class="page-header"><h2>📊 仪表盘</h2><p>授权系统概览</p></div>
            <div class="card">
                <div class="card-title">当前授权码</div>
                <div class="code-display" id="currentCode">加载中...</div>
                <p style="text-align: center; color: #888; margin-top: 10px;">更新时间: <span id="updatedTime">--</span></p>
                <div class="btn-group" style="justify-content: center; margin-top: 12px;">
                    <button class="btn btn-primary" onclick="copyCode()">📋 复制</button>
                    <button class="btn btn-secondary" onclick="refreshStats()">🔄 刷新</button>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-value" id="statSuccess">0</div><div class="stat-label">验证成功</div></div>
                <div class="stat-card"><div class="stat-value" id="statFailed">0</div><div class="stat-label">验证失败</div></div>
                <div class="stat-card"><div class="stat-value" id="statTotal">0</div><div class="stat-label">总次数</div></div>
                <div class="stat-card"><div class="stat-value" id="statRate">0%</div><div class="stat-label">成功率</div></div>
                <div class="stat-card"><div class="stat-value" id="statEndpoints">0</div><div class="stat-label">API端点</div></div>
            </div>
            <div class="card">
                <div class="card-title">💎 历史授权码</div>
                <div id="historyList" class="scroll-container" style="max-height: 180px;"><p style="color: #888; text-align: center;">加载中...</p></div>
            </div>
            <div class="card" style="border: 2px solid #f59e0b;">
                <div class="card-title" style="color: #f59e0b;">🆕 新端点提醒（24小时内）</div>
                <div id="newEndpointsList" style="max-height: 200px; overflow-y: auto;"><p style="color: #888; text-align: center;">加载中...</p></div>
            </div>
        </div>

        <!-- 授权码管理 -->
        <div id="page-auth-code" class="page">
            <div class="page-header"><h2>� 授权码管理</h2><p>更新和管理授权码</p></div>
            <div class="card">
                <div class="card-title">更新授权码</div>
                <div class="form-group"><label>新授权码</label><input type="text" id="newCode" placeholder="例如：MEOW-20251205-ABCD" /></div>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="updateCode()">🚀 更新</button>
                    <button class="btn btn-secondary" onclick="generateCode()">🎲 自动生成</button>
                </div>
            </div>
            <div class="card">
                <div class="card-title">� 授权码使用统计</div>
                <div id="codeUsageList" class="scroll-container"><p style="color: #888; text-align: center;">加载中...</p></div>
            </div>
        </div>

        <!-- 自动更新 -->
        <div id="page-auto-update" class="page">
            <div class="page-header"><h2>🔄 自动更新配置</h2><p>定时自动生成新授权码</p></div>
            <div class="card">
                <div class="card-title">配置</div>
                <div class="switch-container" style="margin-bottom: 14px;">
                    <div class="switch" id="autoUpdateSwitch" onclick="toggleAutoUpdate()"></div>
                    <span id="autoUpdateStatusText">未启用</span>
                </div>
                <div class="form-group">
                    <label>📅 更新周期</label>
                    <select id="autoUpdateDays" style="width: 100%; padding: 10px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 13px;">
                        <option value="1">每天</option>
                        <option value="2">每2天</option>
                        <option value="3">每3天</option>
                        <option value="5">每5天</option>
                        <option value="7">每周（7天）</option>
                        <option value="14">每两周（14天）</option>
                        <option value="30">每月（30天）</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>⏰ 更新时间（北京时间）</label>
                    <select id="autoUpdateHour" style="width: 100%; padding: 10px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 13px;">
                        <option value="0">00:00（午夜）</option>
                        <option value="1">01:00</option>
                        <option value="2">02:00</option>
                        <option value="3">03:00</option>
                        <option value="4">04:00</option>
                        <option value="5">05:00</option>
                        <option value="6">06:00</option>
                        <option value="7">07:00</option>
                        <option value="8">08:00</option>
                        <option value="9">09:00</option>
                        <option value="10">10:00</option>
                        <option value="11">11:00</option>
                        <option value="12">12:00（正午）</option>
                        <option value="13">13:00</option>
                        <option value="14">14:00</option>
                        <option value="15">15:00</option>
                        <option value="16">16:00</option>
                        <option value="17">17:00</option>
                        <option value="18">18:00</option>
                        <option value="19">19:00</option>
                        <option value="20">20:00</option>
                        <option value="21">21:00</option>
                        <option value="22">22:00</option>
                        <option value="23">23:00</option>
                    </select>
                </div>
                <p style="color: #888; font-size: 12px; margin-bottom: 14px;">系统会按设定周期在指定时间自动生成新授权码</p>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="saveAutoUpdateConfig()">💾 保存配置</button>
                    <button class="btn btn-secondary" onclick="triggerAutoUpdate()">⚡ 立即更新</button>
                </div>
            </div>
            <div class="card">
                <div class="card-title">📋 更新日志</div>
                <div id="autoUpdateLogs" class="scroll-container"><p style="color: #888; text-align: center;">加载中...</p></div>
            </div>
        </div>

        <!-- API端点 -->
        <div id="page-endpoints" class="page">
            <div class="page-header"><h2>🌐 API端点统计</h2><p>追踪用户使用的API服务商</p></div>
            <div class="card" style="margin-bottom: 16px; padding: 16px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <input type="text" id="endpointSearch" placeholder="🔍 搜索端点..." style="flex: 1; min-width: 200px; padding: 10px 14px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 14px;" oninput="filterEndpoints()" />
                    <select id="endpointFilter" style="padding: 10px 14px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 13px;" onchange="filterEndpoints()">
                        <option value="all">全部</option>
                        <option value="banned">已禁用</option>
                        <option value="suspicious">可疑</option>
                        <option value="whitelist">白名单</option>
                    </select>
                    <span id="endpointCount" style="color: #888; font-size: 13px;"></span>
                </div>
            </div>
            <div id="endpointsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px;"><p style="color: #888; text-align: center;">加载中...</p></div>
        </div>

        <!-- 验证日志 -->
        <div id="page-logs" class="page">
            <div class="page-header"><h2>📋 验证日志</h2><p>最近的验证记录</p></div>
            <div class="card"><div id="logsList" class="scroll-container"><p style="color: #888; text-align: center;">加载中...</p></div></div>
        </div>

        <!-- 禁用列表 -->
        <div id="page-banned" class="page">
            <div class="page-header"><h2>🚫 禁用列表</h2><p>已禁用的API端点</p></div>
            <div class="card" style="margin-bottom: 16px; padding: 16px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <input type="text" id="manualBanEndpoint" placeholder="输入端点名称或URL..." style="flex: 1; min-width: 250px; padding: 10px 14px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 14px;" />
                    <button onclick="manualBan()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">🚫 添加禁用</button>
                </div>
            </div>
            <div class="card"><div id="bannedEndpointsList" class="scroll-container"><p style="color: #888; text-align: center;">加载中...</p></div></div>
        </div>

        <!-- 可疑列表 -->
        <div id="page-suspicious" class="page">
            <div class="page-header"><h2>⚠️ 可疑列表</h2><p>需要关注的API端点</p></div>
            <div class="card" style="margin-bottom: 16px; padding: 16px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <input type="text" id="manualSuspiciousEndpoint" placeholder="输入端点名称或URL..." style="flex: 1; min-width: 250px; padding: 10px 14px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 14px;" />
                    <button onclick="manualSuspicious()" style="padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">⚠️ 添加可疑</button>
                </div>
            </div>
            <div class="card"><div id="suspiciousEndpointsList" class="scroll-container"><p style="color: #888; text-align: center;">加载中...</p></div></div>
        </div>

        <!-- 白名单 -->
        <div id="page-whitelist" class="page">
            <div class="page-header"><h2>✅ 白名单</h2><p>受信任的API端点</p></div>
            <div class="card" style="margin-bottom: 16px; padding: 16px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <input type="text" id="manualWhitelistEndpoint" placeholder="输入端点名称或URL..." style="flex: 1; min-width: 250px; padding: 10px 14px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 14px;" />
                    <button onclick="manualWhitelist()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">✅ 添加白名单</button>
                </div>
            </div>
            <div class="card"><div id="whitelistEndpointsList" class="scroll-container"><p style="color: #888; text-align: center;">加载中...</p></div></div>
        </div>

        <!-- 黑名单（贩子API端点） -->
        <div id="page-blacklist" class="page">
            <div class="page-header"><h2>☠️ 黑名单</h2><p>已知贩子API端点（手动添加，支持模糊匹配）</p></div>
            <div class="card" style="margin-bottom: 16px; padding: 16px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 12px;">
                    <input type="text" id="blacklistSiteName" placeholder="站点名称（如：某某API站）" style="flex: 0 0 200px; padding: 10px 14px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 14px;" />
                    <input type="text" id="blacklistEndpoint" placeholder="端点URL或域名关键词（支持完整URL）" style="flex: 1; min-width: 250px; padding: 10px 14px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 14px;" />
                    <button onclick="addBlacklist()" style="padding: 10px 20px; background: #7c2d12; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">☠️ 添加黑名单</button>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <input type="text" id="blacklistSearch" placeholder="🔍 搜索黑名单..." style="flex: 1; padding: 10px 14px; background: #0f0f0f; border: 1px solid #3a3a3a; border-radius: 6px; color: #fff; font-size: 14px;" oninput="filterBlacklist()" />
                    <span id="blacklistCount" style="color: #888; font-size: 13px;"></span>
                </div>
            </div>
            <div id="blacklistGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px;"><p style="color: #888; text-align: center;">加载中...</p></div>
        </div>

        <!-- 插件信息 -->
        <div id="page-plugin-info" class="page">
            <div class="page-header"><h2>📦 插件信息管理</h2><p>更新插件版本号和说明</p></div>
            <div class="card">
                <div class="form-group"><label>版本号</label><input type="text" id="pluginVersion" placeholder="例如：1.6.2" /></div>
                <div class="form-group"><label>更新日志 (Markdown)</label><textarea id="pluginChangelog" placeholder="## v1.6.2&#10;- 新增功能&#10;- 修复问题"></textarea></div>
                <div class="form-group"><label>使用说明 (Markdown)</label><textarea id="pluginUsage" placeholder="## 功能介绍&#10;&#10;### 功能1&#10;说明..."></textarea></div>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="updatePluginInfo()">💾 保存</button>
                    <button class="btn btn-secondary" onclick="loadPluginInfo()">🔄 重新加载</button>
                </div>
            </div>
        </div>
    </main>

    <script>
        // 页面切换
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
            document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
            document.getElementById('page-' + pageId).classList.add('active');
            if (event && event.currentTarget) event.currentTarget.classList.add('active');
            if (pageId === 'dashboard') refreshStats();
            if (pageId === 'auto-update') loadAutoUpdateConfig();
            if (pageId === 'plugin-info') loadPluginInfo();
            if (pageId === 'blacklist') loadBlacklist();
        }

        // 自动更新开关
        function toggleAutoUpdate() {
            var switchEl = document.getElementById('autoUpdateSwitch');
            var statusText = document.getElementById('autoUpdateStatusText');
            switchEl.classList.toggle('active');
            if (switchEl.classList.contains('active')) {
                statusText.textContent = '已启用';
                statusText.style.color = '#10b981';
            } else {
                statusText.textContent = '未启用';
                statusText.style.color = '#888';
            }
        }
        // 页面加载
        window.onload = function() {
            const savedKey = localStorage.getItem('adminKey');
            if (savedKey) {
                document.getElementById('adminKey').value = savedKey;
                // 延迟100ms确保DOM完全就绪
                setTimeout(function() {
                    refreshStats();
                }, 100);
            }
            loadPluginInfo();

            // 自动刷新（每30秒）
            setInterval(function() {
                const adminKey = document.getElementById('adminKey').value;
                if (adminKey && document.getElementById('page-dashboard').classList.contains('active')) {
                    refreshStats();
                }
            }, 30000);
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

                            const borderColor = isHighUsage ? '#ef4444' : '#10b981';
                            const highUsageBadge = isHighUsage ? '<span style="background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">⚠️ 高频使用</span>' : '';
                            const usageColor = isHighUsage ? '#ef4444' : '#10b981';

                            return '<div class="list-item" style="border-left-color: ' + borderColor + ';">' +
                                '<div style="flex: 1;">' +
                                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">' +
                                        highUsageBadge +
                                        '<span style="font-family: Courier New, monospace; font-weight: 700; color: #4a9eff; font-size: 14px;">' +
                                            usage.code +
                                        '</span>' +
                                    '</div>' +
                                    '<div style="color: #888; font-size: 13px; margin-bottom: 6px;">' +
                                        '使用次数: <span style="color: ' + usageColor + '; font-weight: 700;">' + usage.usageCount + '</span>' +
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

                    // 🔥 保存端点数据到全局变量，初始渲染时排除白名单、已禁用和可疑
                    window.allEndpoints = data.apiEndpoints || [];
                    const activeEndpoints = window.allEndpoints.filter(function(ep) { return !ep.isWhitelisted && !ep.isBanned && !ep.isSuspicious; });
                    renderEndpoints(activeEndpoints);

                    // 加载禁用列表、可疑列表和白名单
                    loadBannedEndpoints();
                    loadSuspiciousEndpoints();
                    loadWhitelistEndpoints();

                    // 更新验证日志
                    const logsList = document.getElementById('logsList');
                    if (data.logs && data.logs.length > 0) {
                        logsList.innerHTML = data.logs.map(function(log) {
                            const borderColor = log.isValid ? '#10b981' : '#ef4444';
                            const icon = log.isValid ? '✅' : '❌';
                            const codeColor = log.isValid ? '#10b981' : '#ef4444';
                            const apiEndpoint = log.apiEndpoint || 'unknown';

                            return '<div class="list-item" style="border-left-color: ' + borderColor + ';">' +
                                '<div>' +
                                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
                                        '<span style="font-size: 14px;">' + icon + '</span>' +
                                        '<span style="font-family: Courier New, monospace; color: ' + codeColor + ';">' +
                                            log.code +
                                        '</span>' +
                                        '<span style="color: #888; font-size: 12px;">' +
                                        '</span>' +
                                    '</div>' +
                                    '<div style="color: #666; font-size: 12px;">' +
                                        '🌐 API: ' + apiEndpoint +
                                    '</div>' +
                                '</div>' +
                                '<span style="color: #888; font-size: 12px;">' + new Date(log.timestamp).toLocaleString("zh-CN") + '</span>' +
                            '</div>';
                        }).join('');
                    } else {
                        logsList.innerHTML = '<p style="color: #888; text-align: center;">暂无验证日志</p>';
                    }

                    // 更新历史授权码
                    const historyList = document.getElementById('historyList');
                    if (data.history && data.history.length > 0) {
                        historyList.innerHTML = data.history.map(function(item) {
                            return '<div class="list-item" style="display: flex; justify-content: space-between; align-items: center;">' +
                                '<span style="font-family: Courier New, monospace; font-weight: 700; color: #4a9eff;">' + item.code + '</span>' +
                                '<span style="color: #888; font-size: 12px;">' + new Date(item.replacedAt).toLocaleString("zh-CN") + '</span>' +
                            '</div>';
                        }).join('');
                    } else {
                        historyList.innerHTML = '<p style="color: #888; text-align: center;">暂无历史记录</p>';
                    }

                    // 🆕 新端点提醒（24小时内首次出现的）
                    const newEndpointsList = document.getElementById('newEndpointsList');
                    const now = new Date();
                    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    const newEndpoints = (data.apiEndpoints || []).filter(function(ep) {
                        if (!ep.firstAccess) return false;
                        const firstAccessDate = new Date(ep.firstAccess);
                        return firstAccessDate > oneDayAgo && !ep.isWhitelisted;
                    }).sort(function(a, b) {
                        return new Date(b.firstAccess) - new Date(a.firstAccess);
                    });

                    if (newEndpoints.length > 0) {
                        newEndpointsList.innerHTML = newEndpoints.map(function(ep) {
                            var safeEndpoint = String(ep.endpoint || '').split(String.fromCharCode(39)).join('').split(String.fromCharCode(34)).join('');
                            var borderColor = ep.isBanned ? '#7c2d12' : (ep.isSuspicious ? '#f59e0b' : '#f59e0b');
                            var badge = ep.isBanned ? '<span style="background:#7c2d12;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:8px;">已禁用</span>' :
                                       (ep.isSuspicious ? '<span style="background:#f59e0b;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:8px;">可疑</span>' : '');
                            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#1a1a1a;border-left:3px solid ' + borderColor + ';border-radius:6px;margin-bottom:8px;">' +
                                '<div style="flex:1;">' +
                                    '<div style="font-family:Courier New,monospace;color:#4a9eff;font-size:13px;word-break:break-all;">' + (ep.endpoint || '(空)') + badge + '</div>' +
                                    '<div style="color:#666;font-size:11px;margin-top:4px;">首次: ' + new Date(ep.firstAccess).toLocaleString("zh-CN") + ' | 访问: ' + (ep.accessCount || 1) + '次</div>' +
                                '</div>' +
                                '<button onclick="banEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding:4px 10px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">禁用</button>' +
                            '</div>';
                        }).join('');
                    } else {
                        newEndpointsList.innerHTML = '<p style="color: #10b981; text-align: center;">✅ 最近24小时无新端点</p>';
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

        // 🔄 加载自动更新配置
        async function loadAutoUpdateConfig() {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) return;

            try {
                const response = await fetch('/get-auto-update-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey })
                });

                const result = await response.json();

                if (result.success) {
                    const config = result.data.config;
                    const logs = result.data.logs;
                    const switchEl = document.getElementById('autoUpdateSwitch');
                    const statusText = document.getElementById('autoUpdateStatusText');
                    const hourSelect = document.getElementById('autoUpdateHour');

                    // 更新开关状态
                    if (config.enabled) {
                        switchEl.classList.add('active');
                        statusText.textContent = '已启用';
                        statusText.style.color = '#10b981';
                    } else {
                        switchEl.classList.remove('active');
                        statusText.textContent = '未启用';
                        statusText.style.color = '#888';
                    }

                    // 更新时间选择
                    hourSelect.value = config.hour !== undefined ? config.hour : 0;

                    // 更新天数选择
                    const daysSelect = document.getElementById('autoUpdateDays');
                    daysSelect.value = config.days !== undefined ? config.days : 1;

                    // 更新日志
                    const logsDiv = document.getElementById('autoUpdateLogs');
                    if (logs && logs.length > 0) {
                        logsDiv.innerHTML = logs.map(function(log) {
                            const triggerIcon = log.trigger === 'cron' ? '⏰' : '⚡';
                            return '<div class="list-item"><span>' + triggerIcon + '</span> <span style="color: #888;">' + log.oldCode + '</span> → <span style="color: #10b981; font-weight: 700;">' + log.newCode + '</span><div style="color: #666; font-size: 11px; margin-top: 4px;">' + new Date(log.timestamp).toLocaleString('zh-CN') + '</div></div>';
                        }).join('');
                    } else {
                        logsDiv.innerHTML = '<p style="color: #888; text-align: center;">暂无日志</p>';
                    }
                }
            } catch (error) {
                console.error('加载自动更新配置失败:', error);
            }
        }

        // 🔄 保存自动更新配置
        async function saveAutoUpdateConfig() {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) { showAlert('❌ 请先输入管理员密钥', 'error'); return; }

            const enabled = document.getElementById('autoUpdateSwitch').classList.contains('active');
            const hour = parseInt(document.getElementById('autoUpdateHour').value, 10);
            const days = parseInt(document.getElementById('autoUpdateDays').value, 10);

            try {
                const response = await fetch('/set-auto-update-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, enabled, hour, days })
                });

                const result = await response.json();
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) loadAutoUpdateConfig();
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 🔄 手动触发更新
        async function triggerAutoUpdate() {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) { showAlert('❌ 请先输入管理员密钥', 'error'); return; }
            if (!confirm('确定要立即生成新的授权码吗？')) return;

            try {
                const response = await fetch('/trigger-auto-update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey })
                });

                const result = await response.json();
                if (result.success) {
                    showAlert('✅ 新授权码: ' + result.data.newCode, 'success');
                    refreshStats();
                    loadAutoUpdateConfig();
                } else {
                    showAlert('❌ ' + result.message, 'error');
                }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 渲染端点列表
        function renderEndpoints(endpoints) {
            const endpointsList = document.getElementById('endpointsList');
            const countSpan = document.getElementById('endpointCount');

            if (endpoints && endpoints.length > 0) {
                countSpan.textContent = '共 ' + endpoints.length + ' 个端点';
                endpointsList.innerHTML = endpoints.map(function(endpoint) {
                    const isBanned = endpoint.isBanned;
                    const isWhitelisted = endpoint.isWhitelisted;
                    const isSuspicious = endpoint.isSuspicious;

                    let borderColor = '#4a9eff';
                    if (isBanned) borderColor = '#7c2d12';
                    else if (isWhitelisted) borderColor = '#10b981';
                    else if (isSuspicious) borderColor = '#f59e0b';

                    const bannedBadge = isBanned ? '<span style="background: #7c2d12; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">🚫 已禁用</span>' : '';
                    const whitelistBadge = isWhitelisted ? '<span style="background: #065f46; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">✅ 白名单</span>' : '';
                    const suspiciousBadge = isSuspicious ? '<span style="background: #f59e0b; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">⚠️ 可疑</span>' : '';

                    var safeEndpoint = String(endpoint.endpoint || '').split(String.fromCharCode(39)).join('').split(String.fromCharCode(34)).join('');

                    // 禁用/解禁按钮
                    var banButton = isBanned
                        ? '<button onclick="unbanEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 6px 14px; background: #065f46; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">✅ 解禁</button>'
                        : '<button onclick="banEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 6px 14px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">🚫 禁用</button>';

                    // 白名单按钮
                    var whitelistButton = isWhitelisted
                        ? '<button onclick="unwhitelistEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 6px 14px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">移除白名单</button>'
                        : '<button onclick="whitelistEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 6px 14px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">➕ 白名单</button>';

                    // 可疑按钮
                    var suspiciousButton = isSuspicious
                        ? '<button onclick="unsuspiciousEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 6px 14px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">移除可疑</button>'
                        : '<button onclick="suspiciousEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 6px 14px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">⚠️ 可疑</button>';

                    // 删除按钮
                    var deleteButton = '<button onclick="deleteEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 6px 14px; background: #374151; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️ 删除</button>';

                    return '<div style="background: #1a1a1a; border: 2px solid ' + borderColor + '; border-radius: 12px; padding: 20px; ' + (isBanned ? 'opacity: 0.6;' : '') + '" data-endpoint="' + safeEndpoint + '">' +
                        '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">' +
                            bannedBadge + whitelistBadge + suspiciousBadge +
                        '</div>' +
                        '<a href="' + (endpoint.endpoint && endpoint.endpoint.startsWith('http') ? endpoint.endpoint : 'https://' + (endpoint.endpoint || '')) + '" target="_blank" style="display: block; font-family: Courier New, monospace; font-weight: 700; color: ' + (isBanned ? '#666' : '#4a9eff') + '; font-size: 16px; word-break: break-all; margin-bottom: 16px; line-height: 1.4; text-decoration: underline; cursor: pointer;">' +
                            (endpoint.endpoint || '(空)') +
                        '</a>' +
                        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
                            '<span style="color: #888; font-size: 13px;">访问次数</span>' +
                            '<span style="color: #10b981; font-weight: 700; font-size: 28px;">' + (endpoint.accessCount || 0) + '</span>' +
                        '</div>' +
                        '<div style="border-top: 1px solid #2a2a2a; padding-top: 12px; margin-top: 8px;">' +
                            '<div style="display: flex; justify-content: space-between; color: #666; font-size: 12px; margin-bottom: 6px;">' +
                                '<span>首次访问</span>' +
                                '<span>' + (endpoint.firstAccess ? new Date(endpoint.firstAccess).toLocaleString("zh-CN") : '-') + '</span>' +
                            '</div>' +
                            '<div style="display: flex; justify-content: space-between; color: #888; font-size: 12px;">' +
                                '<span>最近访问</span>' +
                                '<span>' + (endpoint.lastAccess ? new Date(endpoint.lastAccess).toLocaleString("zh-CN") : '-') + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">' +
                            banButton + suspiciousButton + whitelistButton + deleteButton +
                        '</div>' +
                    '</div>';
                }).join('');
            } else {
                countSpan.textContent = '';
                endpointsList.innerHTML = '<p style="color: #888; text-align: center;">暂无API端点数据</p>';
            }
        }

        // 筛选端点
        function filterEndpoints() {
            const searchText = document.getElementById('endpointSearch').value.toLowerCase();
            const filterType = document.getElementById('endpointFilter').value;

            let filtered = window.allEndpoints || [];

            // 默认排除白名单、已禁用和可疑（除非专门筛选）
            if (filterType !== 'whitelist' && filterType !== 'banned' && filterType !== 'suspicious') {
                filtered = filtered.filter(function(ep) {
                    return !ep.isWhitelisted && !ep.isBanned && !ep.isSuspicious;
                });
            }

            // 搜索过滤
            if (searchText) {
                filtered = filtered.filter(function(ep) {
                    return (ep.endpoint || '').toLowerCase().includes(searchText);
                });
            }

            // 类型过滤
            if (filterType !== 'all') {
                filtered = filtered.filter(function(ep) {
                    if (filterType === 'banned') return ep.isBanned;
                    if (filterType === 'suspicious') return ep.isSuspicious;
                    if (filterType === 'whitelist') return ep.isWhitelisted;
                    return true;
                });
            }

            renderEndpoints(filtered);
        }

        // 加入白名单
        async function whitelistEndpoint(endpoint) {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) { showAlert('❌ 请先输入管理员密钥', 'error'); return; }

            try {
                const response = await fetch('/whitelist-endpoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, endpoint })
                });
                const result = await response.json();
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) refreshStats();
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 移除白名单
        async function unwhitelistEndpoint(endpoint) {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) { showAlert('❌ 请先输入管理员密钥', 'error'); return; }

            try {
                const response = await fetch('/unwhitelist-endpoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, endpoint })
                });
                const result = await response.json();
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) refreshStats();
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 加载白名单列表
        async function loadWhitelistEndpoints() {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) return;

            try {
                const response = await fetch('/get-whitelist-endpoints', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey })
                });
                const result = await response.json();

                const listDiv = document.getElementById('whitelistEndpointsList');
                if (result.success && result.data && result.data.length > 0) {
                    listDiv.innerHTML = result.data.map(function(item) {
                        return '<div class="list-item success" style="display: flex; justify-content: space-between; align-items: center;">' +
                            '<div>' +
                                '<div style="font-family: Courier New, monospace; color: #10b981; font-weight: 700; font-size: 14px; margin-bottom: 4px;">' + item.endpoint + '</div>' +
                                '<div style="color: #666; font-size: 11px;">添加时间: ' + new Date(item.addedAt).toLocaleString('zh-CN') + '</div>' +
                            '</div>' +
                            '<button onclick="unwhitelistEndpoint(this.dataset.ep)" data-ep="' + item.endpoint + '" style="padding: 4px 10px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">移除</button>' +
                        '</div>';
                    }).join('');
                } else {
                    listDiv.innerHTML = '<p style="color: #888; text-align: center;">暂无白名单</p>';
                }
            } catch (error) {
                console.error('加载白名单失败:', error);
            }
        }

        // 手动添加禁用
        async function manualBan() {
            const endpoint = document.getElementById('manualBanEndpoint').value.trim();
            if (!endpoint) { showAlert('❌ 请输入端点名称或URL', 'error'); return; }
            await banEndpoint(endpoint);
            document.getElementById('manualBanEndpoint').value = '';
        }

        // 手动添加白名单
        async function manualWhitelist() {
            const endpoint = document.getElementById('manualWhitelistEndpoint').value.trim();
            if (!endpoint) { showAlert('❌ 请输入端点名称或URL', 'error'); return; }
            await whitelistEndpoint(endpoint);
            document.getElementById('manualWhitelistEndpoint').value = '';
        }

        // 手动添加可疑
        async function manualSuspicious() {
            const endpoint = document.getElementById('manualSuspiciousEndpoint').value.trim();
            if (!endpoint) { showAlert('❌ 请输入端点名称或URL', 'error'); return; }
            await suspiciousEndpoint(endpoint);
            document.getElementById('manualSuspiciousEndpoint').value = '';
        }

        // 标记为可疑
        async function suspiciousEndpoint(endpoint) {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) { showAlert('❌ 请先输入管理员密钥', 'error'); return; }

            try {
                const response = await fetch('/suspicious-endpoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, endpoint })
                });
                const result = await response.json();
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) { refreshStats(); loadSuspiciousEndpoints(); }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 移除可疑标记
        async function unsuspiciousEndpoint(endpoint) {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) { showAlert('❌ 请先输入管理员密钥', 'error'); return; }

            try {
                const response = await fetch('/unsuspicious-endpoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, endpoint })
                });
                const result = await response.json();
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) { refreshStats(); loadSuspiciousEndpoints(); }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 加载可疑列表
        async function loadSuspiciousEndpoints() {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) return;

            try {
                const response = await fetch('/get-suspicious-endpoints', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey })
                });
                const result = await response.json();

                const listDiv = document.getElementById('suspiciousEndpointsList');
                if (result.success && result.data && result.data.length > 0) {
                    listDiv.innerHTML = result.data.map(function(item) {
                        var linkUrl = item.endpoint && item.endpoint.startsWith('http') ? item.endpoint : 'https://' + (item.endpoint || '');
                        return '<div class="list-item" style="display: flex; justify-content: space-between; align-items: center; border-left-color: #f59e0b;">' +
                            '<div>' +
                                '<a href="' + linkUrl + '" target="_blank" style="display: block; font-family: Courier New, monospace; color: #f59e0b; font-weight: 700; font-size: 14px; margin-bottom: 4px; text-decoration: underline; cursor: pointer;">' + item.endpoint + '</a>' +
                                '<div style="color: #666; font-size: 11px;">添加时间: ' + new Date(item.addedAt).toLocaleString('zh-CN') + '</div>' +
                            '</div>' +
                            '<button onclick="unsuspiciousEndpoint(this.dataset.ep)" data-ep="' + item.endpoint + '" style="padding: 4px 10px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">移除</button>' +
                        '</div>';
                    }).join('');
                } else {
                    listDiv.innerHTML = '<p style="color: #888; text-align: center;">暂无可疑端点</p>';
                }
            } catch (error) {
                console.error('加载可疑列表失败:', error);
            }
        }

        // 禁用 API 端点
        async function banEndpoint(endpoint) {
            const reason = prompt('请输入禁用原因（可留空）:', '涉嫌商业化倒卖');
            if (reason === null) return; // 用户取消

            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) {
                showAlert('❌ 请先输入管理员密钥', 'error');
                return;
            }

            try {
                const response = await fetch('/ban-endpoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, endpoint, reason: reason || '涉嫌商业化倒卖' })
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('✅ 已禁用: ' + endpoint, 'success');
                    refreshStats();
                } else {
                    showAlert('❌ ' + result.message, 'error');
                }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 解禁 API 端点
        async function unbanEndpoint(endpoint) {
            if (!confirm('确定要解禁 ' + endpoint + ' 吗？')) return;

            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) {
                showAlert('❌ 请先输入管理员密钥', 'error');
                return;
            }

            try {
                const response = await fetch('/unban-endpoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, endpoint })
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('✅ 已解禁: ' + endpoint, 'success');
                    refreshStats();
                } else {
                    showAlert('❌ ' + result.message, 'error');
                }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 删除 API 端点记录
        async function deleteEndpoint(endpoint) {
            if (!confirm('确定要删除 ' + endpoint + ' 的记录吗？')) return;

            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) {
                showAlert('❌ 请先输入管理员密钥', 'error');
                return;
            }

            try {
                const response = await fetch('/delete-endpoint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, endpoint })
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('✅ 已删除: ' + endpoint, 'success');
                    refreshStats();
                } else {
                    showAlert('❌ ' + result.message, 'error');
                }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 加载禁用列表
        async function loadBannedEndpoints() {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) return;

            try {
                const response = await fetch('/get-banned-endpoints', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey })
                });

                const result = await response.json();

                if (result.success) {
                    const bannedList = document.getElementById('bannedEndpointsList');
                    const endpoints = result.data || [];

                    if (endpoints.length > 0) {
                        bannedList.innerHTML = endpoints.map(function(item) {
                            var safeEndpoint = String(item.endpoint || '').split(String.fromCharCode(39)).join('').split(String.fromCharCode(34)).join('');
                            return '<div class="list-item" style="border-left-color: #7c2d12;">' +
                                '<div style="flex: 1;">' +
                                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">' +
                                        '<span style="background: #7c2d12; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">🚫 已禁用</span>' +
                                        '<span style="font-family: Courier New, monospace; font-weight: 700; color: #ef4444; font-size: 14px;">' +
                                            item.endpoint +
                                        '</span>' +
                                        '<button onclick="unbanEndpoint(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 4px 12px; background: #065f46; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 8px;">✅ 解禁</button>' +
                                    '</div>' +
                                    '<div style="color: #888; font-size: 13px;">' +
                                        '禁用原因: <span style="color: #f59e0b;">' + item.reason + '</span> | ' +
                                        '禁用时间: ' + new Date(item.bannedAt).toLocaleString("zh-CN") +
                                    '</div>' +
                                '</div>' +
                            '</div>';
                        }).join('');
                    } else {
                        bannedList.innerHTML = '<p style="color: #10b981; text-align: center;">✅ 暂无禁用的 API 端点</p>';
                    }
                }
            } catch (error) {
                console.error('加载禁用列表失败:', error);
            }
        }

        // 添加黑名单
        async function addBlacklist() {
            const siteName = document.getElementById('blacklistSiteName').value.trim();
            const endpoint = document.getElementById('blacklistEndpoint').value.trim();
            const adminKey = document.getElementById('adminKey').value;

            if (!adminKey) {
                showAlert('❌ 请先输入管理员密钥', 'error');
                return;
            }
            if (!siteName) {
                showAlert('❌ 请输入站点名称', 'error');
                return;
            }
            if (!endpoint) {
                showAlert('❌ 请输入端点URL', 'error');
                return;
            }

            try {
                const response = await fetch('/add-blacklist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, siteName, endpoint })
                });
                const result = await response.json();
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    document.getElementById('blacklistSiteName').value = '';
                    document.getElementById('blacklistEndpoint').value = '';
                    loadBlacklist();
                }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 加载黑名单
        async function loadBlacklist() {
            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) return;

            try {
                const response = await fetch('/get-blacklist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey })
                });
                const result = await response.json();

                if (result.success) {
                    window.allBlacklist = result.data || [];
                    renderBlacklist(window.allBlacklist);
                }
            } catch (error) {
                console.error('加载黑名单失败:', error);
            }
        }

        // 渲染黑名单卡片
        function renderBlacklist(list) {
            const grid = document.getElementById('blacklistGrid');
            const countSpan = document.getElementById('blacklistCount');

            if (list && list.length > 0) {
                countSpan.textContent = '共 ' + list.length + ' 个';
                grid.innerHTML = list.map(function(item) {
                    var safeEndpoint = String(item.endpoint || '').split(String.fromCharCode(39)).join('').split(String.fromCharCode(34)).join('');
                    var displayUrl = item.endpoint || '';
                    // 如果不是完整URL，构造一个用于跳转
                    var linkUrl = displayUrl.startsWith('http') ? displayUrl : 'https://' + displayUrl;

                    return '<div style="background: #1a1a1a; border: 2px solid #7c2d12; border-radius: 12px; padding: 20px;" data-sitename="' + (item.siteName || '') + '" data-endpoint="' + safeEndpoint + '">' +
                        '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">' +
                            '<span style="background: #7c2d12; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 700;">☠️ ' + (item.siteName || '未知站点') + '</span>' +
                        '</div>' +
                        '<a href="' + linkUrl + '" target="_blank" style="display: block; font-family: Courier New, monospace; font-weight: 600; color: #4a9eff; font-size: 15px; word-break: break-all; margin-bottom: 12px; text-decoration: underline; cursor: pointer;">' + displayUrl + '</a>' +
                        '<div style="color: #666; font-size: 12px; margin-bottom: 14px;">添加时间: ' + (item.addedAt ? new Date(item.addedAt).toLocaleString("zh-CN") : '-') + '</div>' +
                        '<button onclick="removeBlacklist(this.dataset.ep)" data-ep="' + safeEndpoint + '" style="padding: 8px 16px; background: #374151; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">🗑️ 移除</button>' +
                    '</div>';
                }).join('');
            } else {
                countSpan.textContent = '';
                grid.innerHTML = '<p style="color: #888; text-align: center; grid-column: 1 / -1;">暂无黑名单记录</p>';
            }
        }

        // 搜索黑名单
        function filterBlacklist() {
            const searchText = document.getElementById('blacklistSearch').value.toLowerCase();
            let filtered = window.allBlacklist || [];

            if (searchText) {
                filtered = filtered.filter(function(item) {
                    return (item.siteName || '').toLowerCase().includes(searchText) ||
                           (item.endpoint || '').toLowerCase().includes(searchText);
                });
            }

            renderBlacklist(filtered);
        }

        // 移除黑名单
        async function removeBlacklist(endpoint) {
            if (!confirm('确定要从黑名单移除 ' + endpoint + ' 吗？')) return;

            const adminKey = document.getElementById('adminKey').value;
            if (!adminKey) {
                showAlert('❌ 请先输入管理员密钥', 'error');
                return;
            }

            try {
                const response = await fetch('/remove-blacklist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, endpoint })
                });
                const result = await response.json();
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) loadBlacklist();
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
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
                }
            } catch (error) {
                console.error('加载插件信息失败:', error);
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

          console.log('Worker.js loaded');
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
  const statsStr = await redisGet('stats');
  if (!statsStr) {
    return { success: 0, failed: 0, lastReset: new Date().toISOString() };
  }
  return JSON.parse(statsStr);
}

async function incrementStats(env, type) {
  const stats = await getStats(env);
  stats[type] = (stats[type] || 0) + 1;
  await redisSet('stats', JSON.stringify(stats));
}

async function getHistory(env) {
  const historyStr = await redisGet('history');
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
    const logsStr = await redisGet('verification_logs');
    const logs = logsStr ? JSON.parse(logsStr) : [];

    logs.unshift(logData);

    // 只保留最近 500 条日志
    if (logs.length > 500) {
      logs.length = 500;
    }

    await redisSet('verification_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('记录日志失败:', error);
  }
}

/**
 * 记录授权码使用次数（不记录IP）
 */
async function recordCodeUsage(env, code, apiEndpoint) {
  try {
    const usageStr = await redisGet('code_usage');
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
      };
    }

    await redisSet('code_usage', JSON.stringify(usage));
  } catch (error) {
    console.error('记录授权码使用失败:', error);
  }
}

/**
 * 记录API端点使用情况（用于抓第三方商业化）
 * 不记录IP，只记录端点使用统计
 */
async function recordApiEndpoint(env, apiEndpoint) {
  try {
    const endpointsStr = await redisGet('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};

    if (endpoints[apiEndpoint]) {
      // API端点已存在，更新统计
      endpoints[apiEndpoint].lastAccess = new Date().toISOString();
      endpoints[apiEndpoint].accessCount = (endpoints[apiEndpoint].accessCount || 0) + 1;
    } else {
      // 新的API端点
      endpoints[apiEndpoint] = {
        endpoint: apiEndpoint,
        firstAccess: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        accessCount: 1,
      };
    }

    await redisSet('api_endpoints', JSON.stringify(endpoints));
    console.log(`📝 记录 API 端点: ${apiEndpoint}`);
  } catch (error) {
    console.error('记录API端点失败:', error);
  }
}

/**
 * 获取插件信息（版本、更新日志、使用说明）
 */
async function handleGetPluginInfo(request, env, corsHeaders) {
  try {
    const pluginInfoStr = await redisGet('plugin_info');
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

    await redisSet('plugin_info', JSON.stringify(pluginInfo));

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
    const templatesStr = await redisGet('project_templates');
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

    await redisSet('project_templates', JSON.stringify(templateData));

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

/**
 * 禁用 API 端点
 */
async function handleBanEndpoint(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint, reason } = await request.json();

    // 验证管理员密钥
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    // 获取当前禁用列表
    const bannedEndpointsStr = await redisGet('banned_endpoints');
    const bannedEndpoints = bannedEndpointsStr ? JSON.parse(bannedEndpointsStr) : {};

    // 添加到禁用列表
    bannedEndpoints[endpoint] = {
      endpoint: endpoint,
      reason: reason || '涉嫌商业化倒卖',
      bannedAt: new Date().toISOString(),
    };

    await redisSet('banned_endpoints', JSON.stringify(bannedEndpoints));

    return jsonResponse(
      {
        success: true,
        message: `✅ 已禁用 API 端点: ${endpoint}`,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('禁用端点失败:', error);
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 解禁 API 端点
 */
async function handleUnbanEndpoint(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    // 验证管理员密钥
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    // 获取当前禁用列表
    const bannedEndpointsStr = await redisGet('banned_endpoints');
    const bannedEndpoints = bannedEndpointsStr ? JSON.parse(bannedEndpointsStr) : {};

    // 从禁用列表移除
    delete bannedEndpoints[endpoint];

    await redisSet('banned_endpoints', JSON.stringify(bannedEndpoints));

    return jsonResponse(
      {
        success: true,
        message: `✅ 已解禁 API 端点: ${endpoint}`,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('解禁端点失败:', error);
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 删除 API 端点记录
 */
async function handleDeleteEndpoint(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    // 验证管理员密钥
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    // 从 api_endpoints 中删除
    const endpointsStr = await redisGet('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};
    delete endpoints[endpoint];
    await redisSet('api_endpoints', JSON.stringify(endpoints));

    // 同时从禁用列表、白名单、可疑列表中删除
    const bannedStr = await redisGet('banned_endpoints');
    const banned = bannedStr ? JSON.parse(bannedStr) : {};
    delete banned[endpoint];
    await redisSet('banned_endpoints', JSON.stringify(banned));

    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};
    delete whitelist[endpoint];
    await redisSet('whitelist_endpoints', JSON.stringify(whitelist));

    const suspiciousStr = await redisGet('suspicious_endpoints');
    const suspicious = suspiciousStr ? JSON.parse(suspiciousStr) : {};
    delete suspicious[endpoint];
    await redisSet('suspicious_endpoints', JSON.stringify(suspicious));

    return jsonResponse(
      {
        success: true,
        message: `✅ 已删除 API 端点记录: ${endpoint}`,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('删除端点失败:', error);
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取禁用的 API 端点列表
 */
async function handleGetBannedEndpoints(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    // 验证管理员密钥
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const bannedEndpointsStr = await redisGet('banned_endpoints');
    const bannedEndpoints = bannedEndpointsStr ? JSON.parse(bannedEndpointsStr) : {};

    // 转换为数组并按禁用时间排序
    const bannedList = Object.values(bannedEndpoints).sort(
      (a, b) => new Date(b.bannedAt).getTime() - new Date(a.bannedAt).getTime(),
    );

    return jsonResponse(
      {
        success: true,
        data: bannedList,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('获取禁用列表失败:', error);
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取正则模板列表（翻页状态栏生成器用）
 */
async function handleGetRegexTemplates(request, env, corsHeaders) {
  try {
    const templatesStr = await redisGet('regex_templates');
    const templates = templatesStr
      ? JSON.parse(templatesStr)
      : {
          templates: [],
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
    console.error('获取正则模板失败:', error);
    return jsonResponse({ success: false, error: error.message }, 500, corsHeaders);
  }
}

/**
 * 更新正则模板（仅管理员）
 */
async function handleUpdateRegexTemplates(request, env, corsHeaders) {
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
        name: t.name,
        icon: t.icon || '📄',
        description: t.description,
        pages: t.pages || [],
        variables: t.variables || [],
        theme: t.theme,
        triggerRegex: t.triggerRegex,
        tags: t.tags || [],
        enabled: t.enabled !== false,
      })),
      lastUpdated: new Date().toISOString(),
    };

    await redisSet('regex_templates', JSON.stringify(templateData));

    return jsonResponse(
      {
        success: true,
        message: '✅ 正则模板已更新',
        data: templateData,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('更新正则模板失败:', error);
    return jsonResponse({ success: false, error: error.message }, 500, corsHeaders);
  }
}

/**
 * 获取自动更新配置
 */
async function handleGetAutoUpdateConfig(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const configStr = await redisGet('auto_update_config');
    const config = configStr
      ? JSON.parse(configStr)
      : {
          enabled: false,
          updateTime: '00:00',
          timezone: 'Asia/Shanghai',
          lastUpdated: null,
        };

    // 获取自动更新日志
    const logsStr = await redisGet('auto_update_logs');
    const logs = logsStr ? JSON.parse(logsStr) : [];

    return jsonResponse(
      {
        success: true,
        data: {
          config: config,
          logs: logs.slice(0, 20),
        },
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('获取自动更新配置失败:', error);
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 设置自动更新配置
 */
async function handleSetAutoUpdateConfig(request, env, corsHeaders) {
  try {
    const { adminKey, enabled, hour, days } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    // hour 验证：0-23
    const validHour = typeof hour === 'number' && hour >= 0 && hour <= 23 ? hour : 0;
    // days 验证：1-30
    const validDays = typeof days === 'number' && days >= 1 && days <= 30 ? days : 1;

    const config = {
      enabled: enabled === true,
      hour: validHour,
      days: validDays,
      lastUpdated: new Date().toISOString(),
    };

    await redisSet('auto_update_config', JSON.stringify(config));

    const hourStr = String(validHour).padStart(2, '0') + ':00';
    const daysStr = validDays === 1 ? '每天' : '每' + validDays + '天';
    return jsonResponse(
      {
        success: true,
        message: enabled ? '✅ 自动更新已启用，' + daysStr + '北京时间 ' + hourStr + ' 更新' : '✅ 自动更新已禁用',
        data: config,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('设置自动更新配置失败:', error);
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 手动触发自动更新（测试用）
 */
async function handleTriggerAutoUpdate(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    // 生成新的授权码
    const today = new Date();
    const dateStr =
      today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let random = '';
    for (let i = 0; i < 4; i++) {
      random += chars[Math.floor(Math.random() * chars.length)];
    }

    const newCode = 'MEOW-' + dateStr + '-' + random;

    // 保存旧的授权码到历史
    const oldCode = await redisGet('current_code');
    if (oldCode) {
      const historyStr = await redisGet('history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.unshift({
        code: oldCode,
        replacedAt: new Date().toISOString(),
        replacedBy: 'manual_trigger',
      });
      if (history.length > 30) {
        history.length = 30;
      }
      await redisSet('history', JSON.stringify(history));
    }

    // 更新当前授权码
    await redisSet('current_code', newCode);
    await redisSet('updated_at', new Date().toISOString());

    // 记录自动更新日志
    const autoUpdateLogsStr = await redisGet('auto_update_logs');
    const autoUpdateLogs = autoUpdateLogsStr ? JSON.parse(autoUpdateLogsStr) : [];
    autoUpdateLogs.unshift({
      oldCode: oldCode || '无',
      newCode: newCode,
      timestamp: new Date().toISOString(),
      trigger: 'manual',
    });
    if (autoUpdateLogs.length > 100) {
      autoUpdateLogs.length = 100;
    }
    await redisSet('auto_update_logs', JSON.stringify(autoUpdateLogs));

    return jsonResponse(
      {
        success: true,
        message: '✅ 手动触发更新成功',
        data: {
          oldCode: oldCode || '无',
          newCode: newCode,
        },
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('手动触发更新失败:', error);
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * Bot 领取授权码接口
 */
async function handleBotClaim(request, env, corsHeaders) {
  try {
    const botSecret = request.headers.get('Bot-Secret');

    // 验证 Bot Secret（如果配置了）
    if (env.BOT_SECRET && botSecret !== env.BOT_SECRET) {
      return jsonResponse({ success: false, message: 'Bot认证失败' }, 403, corsHeaders);
    }

    const { user_id } = await request.json();

    if (!user_id) {
      return jsonResponse({ success: false, message: '缺少用户ID' }, 400, corsHeaders);
    }

    const currentCode = await redisGet('current_code');
    const updatedAt = await redisGet('updated_at');

    if (!currentCode) {
      return jsonResponse({ success: false, message: '暂未设置授权码' }, 200, corsHeaders);
    }

    // 检查用户今日是否已领取
    const today = new Date().toISOString().split('T')[0];
    const claimKey = `claim:${user_id}:${today}`;
    const hasClaimed = await redisGet(claimKey);

    if (hasClaimed) {
      return jsonResponse(
        {
          success: false,
          message: '你今天已经领取过了',
          code: currentCode,
          expiry: getNextMidnightUTC(),
        },
        200,
        corsHeaders,
      );
    }

    // 记录领取（24小时后过期）
    await redisSet(claimKey, 'claimed');

    return jsonResponse(
      {
        success: true,
        code: currentCode,
        expiry: getNextMidnightUTC(),
        message: '领取成功',
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('Bot claim 错误:', error);
    return jsonResponse({ success: false, message: '服务器错误: ' + error.message }, 500, corsHeaders);
  }
}

// 获取下一个 UTC 午夜时间
function getNextMidnightUTC() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return tomorrow.toISOString();
}

/**
 * 获取当前授权码（Bot 使用）
 */
async function handleGetCode(request, env, corsHeaders) {
  try {
    const currentCode = await redisGet('current_code');
    const updatedAt = await redisGet('updated_at');

    if (!currentCode) {
      return jsonResponse(
        {
          success: false,
          message: '暂未设置授权码',
          code: null,
        },
        200,
        corsHeaders,
      );
    }

    return jsonResponse(
      {
        success: true,
        code: currentCode,
        updatedAt: updatedAt || new Date().toISOString(),
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('获取授权码失败:', error);
    return jsonResponse({ success: false, message: '获取失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 添加端点到白名单
 */
async function handleWhitelistEndpoint(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};

    whitelist[endpoint] = {
      endpoint: endpoint,
      addedAt: new Date().toISOString(),
    };

    await redisSet('whitelist_endpoints', JSON.stringify(whitelist));

    return jsonResponse({ success: true, message: '✅ 已添加到白名单' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 从白名单移除端点
 */
async function handleUnwhitelistEndpoint(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};

    delete whitelist[endpoint];

    await redisSet('whitelist_endpoints', JSON.stringify(whitelist));

    return jsonResponse({ success: true, message: '✅ 已从白名单移除' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取白名单列表
 */
async function handleGetWhitelistEndpoints(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};

    const list = Object.values(whitelist);
    list.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return jsonResponse({ success: true, data: list }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 获取失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 添加端点到可疑列表
 */
async function handleSuspiciousEndpoint(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    const suspiciousStr = await redisGet('suspicious_endpoints');
    const suspicious = suspiciousStr ? JSON.parse(suspiciousStr) : {};

    suspicious[endpoint] = {
      endpoint: endpoint,
      addedAt: new Date().toISOString(),
    };

    await redisSet('suspicious_endpoints', JSON.stringify(suspicious));

    return jsonResponse({ success: true, message: '⚠️ 已添加到可疑列表' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 从可疑列表移除端点
 */
async function handleUnsuspiciousEndpoint(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    const suspiciousStr = await redisGet('suspicious_endpoints');
    const suspicious = suspiciousStr ? JSON.parse(suspiciousStr) : {};

    delete suspicious[endpoint];

    await redisSet('suspicious_endpoints', JSON.stringify(suspicious));

    return jsonResponse({ success: true, message: '✅ 已从可疑列表移除' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取可疑列表
 */
async function handleGetSuspiciousEndpoints(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const suspiciousStr = await redisGet('suspicious_endpoints');
    const suspicious = suspiciousStr ? JSON.parse(suspiciousStr) : {};

    const list = Object.values(suspicious);
    list.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return jsonResponse({ success: true, data: list }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 获取失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 添加到黑名单（贩子API端点）
 */
async function handleAddBlacklist(request, env, corsHeaders) {
  try {
    const { adminKey, siteName, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!siteName || !endpoint) {
      return jsonResponse({ success: false, message: '❌ 站点名称和端点不能为空' }, 400, corsHeaders);
    }

    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    blacklist[endpoint] = {
      endpoint: endpoint,
      siteName: siteName,
      addedAt: new Date().toISOString(),
    };

    await redisSet('blacklist_endpoints', JSON.stringify(blacklist));

    return jsonResponse({ success: true, message: '✅ 已添加到黑名单: ' + siteName }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取黑名单
 */
async function handleGetBlacklist(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    const list = Object.values(blacklist);
    list.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return jsonResponse({ success: true, data: list }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 获取失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 从黑名单移除
 */
async function handleRemoveBlacklist(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    delete blacklist[endpoint];

    await redisSet('blacklist_endpoints', JSON.stringify(blacklist));

    return jsonResponse({ success: true, message: '✅ 已从黑名单移除' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}
