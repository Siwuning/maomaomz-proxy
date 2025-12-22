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
      } else if (path === '/batch-import-banned') {
        return await handleBatchImportBanned(request, env, corsHeaders);
      } else if (path === '/delete-endpoint') {
        return await handleDeleteEndpoint(request, env, corsHeaders);
      } else if (path === '/add-blacklist') {
        return await handleAddBlacklist(request, env, corsHeaders);
      } else if (path === '/get-blacklist') {
        return await handleGetBlacklist(request, env, corsHeaders);
      } else if (path === '/remove-blacklist') {
        return await handleRemoveBlacklist(request, env, corsHeaders);
      } else if (path === '/edit-blacklist') {
        return await handleEditBlacklist(request, env, corsHeaders);
      } else if (path === '/fetch-site-name') {
        return await handleFetchSiteName(request, env, corsHeaders);
      } else if (path === '/detect-site-name') {
        return await handleDetectSiteName(request, env, corsHeaders);
      } else if (path === '/batch-import-blacklist') {
        return await handleBatchImportBlacklist(request, env, corsHeaders);
      } else if (path === '/report-models') {
        return await handleReportModels(request, env, corsHeaders);
      } else if (path === '/get-model-reports') {
        return await handleGetModelReports(request, env, corsHeaders);
      } else if (path === '/get-device-tracks') {
        return await handleGetDeviceTracks(request, env, corsHeaders);
      } else if (path === '/get-endpoint-detail') {
        return await handleGetEndpointDetail(request, env, corsHeaders);
      } else if (path === '/whitelist-endpoint') {
        return await handleWhitelistEndpoint(request, env, corsHeaders);
      } else if (path === '/unwhitelist-endpoint') {
        return await handleUnwhitelistEndpoint(request, env, corsHeaders);
      } else if (path === '/get-whitelist-endpoints') {
        return await handleGetWhitelistEndpoints(request, env, corsHeaders);
      } else if (path === '/update-whitelist-name') {
        return await handleUpdateWhitelistName(request, env, corsHeaders);
      } else if (path === '/update-banned-name') {
        return await handleUpdateBannedName(request, env, corsHeaders);
      } else if (path === '/suspicious-endpoint') {
        return await handleSuspiciousEndpoint(request, env, corsHeaders);
      } else if (path === '/unsuspicious-endpoint') {
        return await handleUnsuspiciousEndpoint(request, env, corsHeaders);
      } else if (path === '/get-suspicious-endpoints') {
        return await handleGetSuspiciousEndpoints(request, env, corsHeaders);
      } else if (path === '/fetch-site-title') {
        return await handleFetchSiteTitle(request, env, corsHeaders);
      } else if (path === '/merge-blacklist') {
        return await handleMergeBlacklist(request, env, corsHeaders);
      } else if (path === '/merge-whitelist') {
        return await handleMergeWhitelist(request, env, corsHeaders);
      } else if (path === '/toggle-reseller') {
        return await handleToggleReseller(request, env, corsHeaders);
      } else if (path === '/toggle-public') {
        return await handleTogglePublic(request, env, corsHeaders);
      } else if (path === '/get-block-message') {
        return await handleGetBlockMessage(request, env, corsHeaders);
      } else if (path === '/set-block-message') {
        return await handleSetBlockMessage(request, env, corsHeaders);
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
      } else if (path === '/cleanup-duplicates') {
        return await handleCleanupDuplicates(request, env, corsHeaders);
      } else if (path === '/clear-list') {
        return await handleClearList(request, env, corsHeaders);
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
 * 验证授权码（带API端点追踪 + 安全加强）
 */
// 最低支持版本（低于此版本拒绝验证）
const MIN_SUPPORTED_VERSION = '2.0.7';

// 🔒 安全配置
const SECURITY_CONFIG = {
  maxRequestsPerMinute: 30,
};

// 🚨 已知的假 URL / 非 API 站点（用户用来伪装端点）
const FAKE_URL_PATTERNS = [
  // 图床
  'imgur.com',
  'imgbb.com',
  'postimg.cc',
  'imgurl.org',
  'sm.ms',
  'pic.com',
  'photobucket.com',
  'flickr.com',
  'tinypic.com',
  'imageshack.com',
  // 作业/教育站点
  'zuoyebang.com',
  'zybang.com',
  'xiaoyuan',
  'homework',
  'xueersi',
  'yuanfudao',
  'zuoye',
  'bangbang',
  'gaokao',
  'zhongkao',
  'shuxue',
  'yingyu',
  // 常见网站
  'baidu.com',
  'google.com',
  'bing.com',
  'yahoo.com',
  'sogou.com',
  'taobao.com',
  'jd.com',
  'tmall.com',
  'pinduoduo.com',
  'alibaba.com',
  'weibo.com',
  'zhihu.com',
  'bilibili.com',
  'douyin.com',
  'tiktok.com',
  'qq.com',
  'wechat.com',
  'weixin.qq.com',
  '163.com',
  'sina.com',
  'youku.com',
  'iqiyi.com',
  'douban.com',
  'tieba.baidu.com',
  // 其他明显不是 API 的
  'github.com',
  'gitee.com',
  'gitlab.com',
  'stackoverflow.com',
  'wikipedia.org',
  'amazon.com',
  'apple.com',
  'microsoft.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'linkedin.com',
  'netflix.com',
  'spotify.com',
  'youtube.com',
  'twitch.tv',
  // 网盘/云存储
  'pan.baidu.com',
  'aliyundrive.com',
  '115.com',
  'quark.cn',
  'dropbox.com',
  'onedrive.com',
  'drive.google.com',
  // 其他可疑模式
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'example.com',
  'test.com',
];

// 🚨 检测是否为假 URL
function isFakeUrl(url) {
  if (!url || url === 'unknown') return false;
  const lowerUrl = url.toLowerCase();

  // 检查是否包含已知假站点
  for (const pattern of FAKE_URL_PATTERNS) {
    if (lowerUrl.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  // 检查是否为纯 IP 地址（排除常见端口）
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(lowerUrl.replace(/^https?:\/\//, ''))) {
    // 纯 IP 地址可能是自建服务，标记为可疑但不拒绝
    return false;
  }

  return false;
}

// 🚨 检测 URL 是否看起来像真实的 API 端点（放宽验证）
function looksLikeRealApiEndpoint(url) {
  if (!url || url === 'unknown') return false;
  const lowerUrl = url.toLowerCase();

  // 🔥 排除明显的假 URL
  const fakePatterns = ['localhost', '127.0.0.1', '0.0.0.0', 'example.com', 'test.com', '[object', 'undefined', 'null'];
  for (const fake of fakePatterns) {
    if (lowerUrl.includes(fake)) {
      return false;
    }
  }

  // 🔥 只要看起来像个正常的 URL 就行（包含协议和域名）
  // 放宽验证：只要是 https:// 开头且包含 . 的都算真实端点
  if (lowerUrl.startsWith('https://') && lowerUrl.includes('.')) {
    return true;
  }

  // http:// 开头的也行（某些自建服务）
  if (lowerUrl.startsWith('http://') && lowerUrl.includes('.') && !lowerUrl.includes('localhost')) {
    return true;
  }

  // 应该包含常见的 API 特征
  const apiPatterns = [
    '/v1',
    '/api',
    '/chat',
    '/completions',
    '/models',
    'openai',
    'claude',
    'anthropic',
    'gemini',
    'gpt',
    'api.',
    '-api.',
    'llm',
    'ai.',
    'chat.',
  ];

  for (const pattern of apiPatterns) {
    if (lowerUrl.includes(pattern)) {
      return true;
    }
  }

  // 检查常见的 API 部署平台
  const deployPlatforms = [
    'vercel.app',
    'netlify.app',
    'railway.app',
    'render.com',
    'fly.io',
    'zeabur.app',
    'deno.dev',
    'workers.dev',
    'herokuapp.com',
    'azure',
    'aws',
    'cloudflare',
  ];

  for (const platform of deployPlatforms) {
    if (lowerUrl.includes(platform)) {
      return true;
    }
  }

  return false;
}

// 版本比较函数
function compareVersions(v1, v2) {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

async function handleVerify(request, env, corsHeaders) {
  console.log(`🔐 授权验证请求`);

  try {
    const { code, apiEndpoint, timestamp, version, model, d } = await request.json();

    // 🔥 版本检查：没发版本号或版本太旧都拒绝
    if (!version || compareVersions(version, MIN_SUPPORTED_VERSION) < 0) {
      console.log(`⛔ 版本过旧或未知被拒绝: ${version || '未提供'} < ${MIN_SUPPORTED_VERSION}`);
      return jsonResponse(
        {
          valid: false,
          outdated: true,
          message: `❌ 插件版本过旧 (${version || '未知'})\n\n请更新到 v${MIN_SUPPORTED_VERSION} 或更高版本！\n\n在扩展管理中点击【立即更新】`,
        },
        200,
        corsHeaders,
      );
    }

    if (!code) {
      return jsonResponse({ valid: false, message: '❌ 授权码不能为空' }, 400, corsHeaders);
    }

    // 🔥 清理API端点数据（防止前端发送对象）
    let cleanApiEndpoint = 'unknown';
    if (apiEndpoint && typeof apiEndpoint === 'string' && apiEndpoint !== '[object Object]') {
      cleanApiEndpoint = apiEndpoint.trim() || 'unknown';
    }

    // 🔥 提取主域名函数（去掉子域名）- 提前定义供白名单检查使用
    const getMainDomain = domain => {
      const parts = domain.split('.');
      if (parts.length <= 2) return domain;
      const specialTlds = ['com.cn', 'net.cn', 'org.cn', 'co.uk', 'co.jp', 'com.au'];
      const lastTwo = parts.slice(-2).join('.');
      if (specialTlds.includes(lastTwo)) {
        return parts.slice(-3).join('.');
      }
      return parts.slice(-2).join('.');
    };

    // 🚨 检测假 URL 和真实 API URL
    const endpointUrls = cleanApiEndpoint.split(/\s*\|\s*/).filter(e => e && e !== 'unknown');
    let hasFakeUrl = false;
    let hasRealApiUrl = false;
    const realApiUrls = [];

    // ✅ 【提前】检查白名单 - 白名单端点跳过真实端点检测
    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};
    let isWhitelistedEarly = false;
    for (const url of endpointUrls) {
      const lowerUrl = url
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/v1\/?$/, '')
        .replace(/\/$/, '');
      const urlMainDomain = getMainDomain(lowerUrl.split('/')[0]);
      for (const key of Object.keys(whitelist)) {
        const lowerKey = key
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/v1\/?$/, '')
          .replace(/\/$/, '');
        const keyMainDomain = getMainDomain(lowerKey.split('/')[0]);
        if (lowerUrl.includes(lowerKey) || lowerKey.includes(lowerUrl) || urlMainDomain === keyMainDomain) {
          isWhitelistedEarly = true;
          console.log(`✅ 白名单端点（提前检测），跳过真实端点检测: ${url} (匹配: ${key})`);
          break;
        }
      }
      if (isWhitelistedEarly) break;
    }

    for (const url of endpointUrls) {
      if (isFakeUrl(url)) {
        hasFakeUrl = true;
        console.log(`🚨 检测到假 URL: ${url}`);
      }
      if (looksLikeRealApiEndpoint(url)) {
        hasRealApiUrl = true;
        realApiUrls.push(url);
      }
    }

    // 🔥 必须有拦截到的真实 API 端点（用户必须实际拉取过模型）
    // 如果没有真实端点，或者只有假URL，拒绝验证
    // ✅ 白名单端点跳过此检测
    if (!isWhitelistedEarly && (!hasRealApiUrl || endpointUrls.length === 0)) {
      console.log(`⚠️ 没有真实API端点，需要先使用插件拉取模型 - ${cleanApiEndpoint}`);

      // 记录可疑请求
      try {
        const suspiciousLogsStr = await redisGet('suspicious_fake_urls');
        const suspiciousLogs = suspiciousLogsStr ? JSON.parse(suspiciousLogsStr) : [];
        suspiciousLogs.unshift({
          url: cleanApiEndpoint || 'empty',
          code: code.substring(0, 8) + '****',
          reason: hasFakeUrl ? 'FAKE_URL' : 'NO_REAL_ENDPOINT',
          timestamp: new Date().toISOString(),
        });
        if (suspiciousLogs.length > 100) suspiciousLogs.length = 100;
        await redisSet('suspicious_fake_urls', JSON.stringify(suspiciousLogs));
      } catch (e) {
        console.error('记录可疑URL失败:', e);
      }

      // 🔥 返回需要先使用插件的提示
      return jsonResponse(
        {
          valid: false,
          needRealEndpoint: true,
          message:
            '❌ 请先在插件中拉取模型列表\\n\\n验证需要检测到真实的 API 请求\\n请确保已正确配置 API 端点并拉取过模型',
        },
        200,
        corsHeaders,
      );
    }

    // 如果有假URL混入真实URL中，记录但不阻止
    if (hasFakeUrl) {
      console.log(`⚠️ 检测到假URL混入: ${cleanApiEndpoint}`);
    }

    console.log(`✅ 检测到真实API端点: ${realApiUrls.join(', ')}`);
    // 只使用真实的API端点进行后续检查
    cleanApiEndpoint = realApiUrls.join(' | ');

    // 🔥 拆分多个 URL（客户端可能发送 "url1 | url2 | url3"）
    const endpointList = cleanApiEndpoint.split(/\s*\|\s*/).filter(e => e && e !== 'unknown');

    // ✅ 白名单已在前面检查过，复用 isWhitelistedEarly
    const isWhitelisted = isWhitelistedEarly;

    // 🔥 检查 API 端点是否被禁用（支持模糊匹配，兼容带/不带 /v1）
    // ✅ 白名单端点跳过此检查
    const bannedEndpointsStr = await redisGet('banned_endpoints');
    const bannedEndpoints = bannedEndpointsStr ? JSON.parse(bannedEndpointsStr) : {};

    let matchedBanned = null;
    if (!isWhitelisted) {
      for (const singleEndpoint of endpointList) {
        if (matchedBanned) break;

        // 🔥 更激进的清理：去掉协议、/v1、尾部斜杠
        const lowerEndpoint = singleEndpoint
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/v1\/?$/, '')
          .replace(/\/$/, '');
        const endpointMainDomain = getMainDomain(lowerEndpoint.split('/')[0]);

        for (const key of Object.keys(bannedEndpoints)) {
          const lowerKey = key
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/v1\/?$/, '')
            .replace(/\/$/, '');
          const keyMainDomain = getMainDomain(lowerKey.split('/')[0]);

          // 🔥 三重匹配：完整包含 OR 主域名相同
          if (
            lowerEndpoint.includes(lowerKey) ||
            lowerKey.includes(lowerEndpoint) ||
            endpointMainDomain === keyMainDomain
          ) {
            matchedBanned = bannedEndpoints[key];
            matchedBanned.matchedKey = key;
            matchedBanned.matchedEndpoint = singleEndpoint;
            break;
          }
        }
      }
    } // 结束 if (!isWhitelisted) 块

    if (matchedBanned) {
      console.log(`⛔ 已禁用的 API 端点尝试验证: ${cleanApiEndpoint} (匹配: ${matchedBanned.matchedKey})`);

      // 记录被拒绝的访问
      await logVerification(env, {
        code,
        isValid: false,
        apiEndpoint: cleanApiEndpoint,
        model: model || 'unknown',
        timestamp: timestamp || new Date().toISOString(),
        reason: 'BANNED_ENDPOINT',
      });

      // 🎣 钓鱼模式：返回自定义封禁消息，和黑名单一样的处理
      const blockMessage =
        (await redisGet('block_message')) || '❌ 授权服务暂时不可用\n\n请稍后重试，若持续失败可前往帖子反馈';
      return jsonResponse(
        {
          valid: false,
          blocked: true,
          punish: true,
          message: blockMessage,
        },
        200,
        corsHeaders,
      );
    }

    // 🔥 检查 API 端点是否在黑名单中（贩子端点，支持模糊匹配）
    // ✅ 白名单端点跳过此检查
    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    // 模糊匹配：检查用户端点是否包含黑名单中的任何关键词（兼容带/不带 /v1、https://）
    let matchedBlacklist = null;
    if (!isWhitelisted) {
      // 🔥 复用拆分后的 endpointList
      for (const singleEndpoint of endpointList) {
        if (matchedBlacklist) break;

        // 🔥 更激进的清理：去掉协议、/v1、尾部斜杠
        const lowerEndpoint = singleEndpoint
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/v1\/?$/, '')
          .replace(/\/$/, '');
        const endpointMainDomain = getMainDomain(lowerEndpoint.split('/')[0]);

        for (const key of Object.keys(blacklist)) {
          const lowerKey = key
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/v1\/?$/, '')
            .replace(/\/$/, '');
          const keyMainDomain = getMainDomain(lowerKey.split('/')[0]);

          // 🔥 三重匹配：完整包含 OR 主域名相同
          if (
            lowerEndpoint.includes(lowerKey) ||
            lowerKey.includes(lowerEndpoint) ||
            endpointMainDomain === keyMainDomain
          ) {
            matchedBlacklist = blacklist[key];
            matchedBlacklist.matchedKey = key;
            matchedBlacklist.matchedEndpoint = singleEndpoint;
            break;
          }
        }
      }
    } // 结束 if (!isWhitelisted) 黑名单检查块

    if (matchedBlacklist) {
      console.log(
        `☠️ 黑名单 API 端点尝试验证: ${cleanApiEndpoint} (匹配: ${matchedBlacklist.matchedKey}, 站点: ${matchedBlacklist.siteName})`,
      );

      // 记录被拒绝的访问
      await logVerification(env, {
        code,
        isValid: false,
        apiEndpoint: cleanApiEndpoint,
        model: model || 'unknown',
        timestamp: timestamp || new Date().toISOString(),
        reason: 'BLACKLIST_ENDPOINT',
      });

      // 🎣 钓鱼模式：返回自定义封禁消息
      const blockMessage =
        (await redisGet('block_message')) || '❌ 授权服务暂时不可用\n\n请稍后重试，若持续失败可前往帖子反馈';
      return jsonResponse(
        {
          valid: false,
          blocked: true,
          punish: true,
          message: blockMessage,
        },
        200,
        corsHeaders,
      );
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
      // 记录失败的详细日志（不记录IP）
      await logVerification(env, {
        code: code, // 显示完整授权码，方便排查
        isValid: false,
        apiEndpoint: cleanApiEndpoint,
        model: model || 'unknown',
        timestamp: timestamp || new Date().toISOString(),
      });

      // 记录失败统计
      await incrementStats(env, 'failed');

      // 🔥 记录端点（失败）
      const invalidEndpoints = [
        'unknown',
        '[object HTMLSelectElement]',
        'admin',
        'null',
        'undefined',
        '',
        '[object Object]',
      ];
      if (
        cleanApiEndpoint &&
        !invalidEndpoints.includes(cleanApiEndpoint.toLowerCase()) &&
        cleanApiEndpoint.length > 3
      ) {
        try {
          await recordApiEndpoint(env, cleanApiEndpoint, 'failed', code, model);
        } catch (logError) {
          console.warn('记录API端点失败:', logError);
        }
      }

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

    // 🔥 记录端点（成功）
    const invalidEndpoints2 = [
      'unknown',
      '[object HTMLSelectElement]',
      'admin',
      'null',
      'undefined',
      '',
      '[object Object]',
    ];
    if (
      cleanApiEndpoint &&
      !invalidEndpoints2.includes(cleanApiEndpoint.toLowerCase()) &&
      cleanApiEndpoint.length > 3
    ) {
      try {
        await recordApiEndpoint(env, cleanApiEndpoint, 'success', code, model);
        // 记录设备追踪（静默）
        if (d && typeof d === 'string' && d.length > 10) {
          await recordDeviceTrack(d, cleanApiEndpoint);
        }
      } catch (logError) {
        console.warn('记录API端点失败:', logError);
      }
    }

    // 🔒 记录成功验证日志（不记录IP）
    console.log(`✅ 授权验证成功: Endpoint=${cleanApiEndpoint.substring(0, 50)}`);

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

    // 获取黑名单
    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    // 获取站点名称缓存
    const siteNamesStr = await redisGet('site_names');
    const siteNames = siteNamesStr ? JSON.parse(siteNamesStr) : {};

    // 🔥 获取模型上报数据（这是准确的模型列表）
    const modelReportsStr = await redisGet('model_reports');
    const modelReports = modelReportsStr ? JSON.parse(modelReportsStr) : {};

    // 合并禁用、白名单、可疑状态到端点列表
    // 🔥 使用 model_reports 的模型数据替换验证时记录的不准确数据
    const endpointList = Object.values(endpoints).map(ep => {
      // 查找匹配的模型上报记录（按端点URL匹配）
      let matchedModels = [];
      try {
        const epHost = ep.endpoint?.replace(/^https?:\/\//, '').split('/')[0];
        for (const [reportEndpoint, reportData] of Object.entries(modelReports)) {
          try {
            const reportHost = new URL(reportEndpoint).host;
            if (epHost && reportHost && epHost.includes(reportHost.split(':')[0])) {
              matchedModels = reportData.models || [];
              break;
            }
          } catch {
            /* ignore invalid URLs */
          }
        }
      } catch {
        /* ignore */
      }
      // 获取站点名称（从多个来源）
      const siteName =
        siteNames[ep.endpoint]?.siteName ||
        blacklist[ep.endpoint]?.siteName ||
        whitelist[ep.endpoint]?.siteName ||
        bannedEndpoints[ep.endpoint]?.siteName ||
        suspicious[ep.endpoint]?.siteName ||
        '';
      return {
        ...ep,
        models: matchedModels, // 使用上报的准确模型，不用验证时的
        siteName: siteName,
        isBanned: !!bannedEndpoints[ep.endpoint],
        isBlacklisted: !!blacklist[ep.endpoint],
        isWhitelisted: !!whitelist[ep.endpoint],
        isSuspicious: !!suspicious[ep.endpoint],
        blacklistInfo: blacklist[ep.endpoint] || null,
      };
    });

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
          logs: logs.slice(0, 500), // 最近 500 条验证日志
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
 * 管理页面 - 重构版 v2.0
 */
function handleAdmin(env) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🐱 猫猫授权后台</title>
  <style>
    :root {
      --bg: #0f172a; --card: #1e293b; --border: #334155; --text: #f1f5f9; --muted: #94a3b8;
      --primary: #60a5fa; --success: #34d399; --warning: #fbbf24; --danger: #f87171;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); }

    /* 布局 */
    .app { display: flex; min-height: 100vh; }
    .sidebar { width: 200px; background: var(--card); border-right: 1px solid var(--border); padding: 16px 0; flex-shrink: 0; }
    .main { flex: 1; padding: 24px; overflow-y: auto; }

    /* 侧边栏 */
    .logo { padding: 0 16px 16px; font-size: 16px; font-weight: 700; color: #f59e0b; border-bottom: 1px solid var(--border); margin-bottom: 8px; }
    .nav-item { display: block; padding: 10px 16px; color: var(--muted); cursor: pointer; border-left: 3px solid transparent; font-size: 13px; }
    .nav-item:hover { background: #334155; color: var(--text); }
    .nav-item.active { color: var(--primary); border-left-color: var(--primary); background: rgba(59,130,246,0.1); }
    .nav-section { font-size: 10px; color: #555; padding: 16px 16px 6px; text-transform: uppercase; letter-spacing: 1px; }
    .admin-key { padding: 16px; border-top: 1px solid var(--border); margin-top: auto; }
    .admin-key input { width: 100%; padding: 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 4px; color: var(--text); font-size: 12px; }

    /* 页面 */
    .page { display: none; }
    .page.active { display: block; }
    .page-title { font-size: 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

    /* 卡片 */
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .card-title { font-size: 14px; color: var(--primary); margin-bottom: 12px; font-weight: 600; }

    /* 网格 */
    .grid { display: grid; gap: 16px; }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    @media (max-width: 900px) { .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } .app { flex-direction: column; } .sidebar { width: 100%; } }

    /* 统计 */
    .stat { text-align: center; padding: 16px; background: var(--bg); border-radius: 6px; }
    .stat-value { font-size: 28px; font-weight: 700; color: var(--primary); }
    .stat-label { font-size: 11px; color: var(--muted); margin-top: 4px; }

    /* 表单 */
    input, textarea, select { width: 100%; padding: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 13px; }
    input:focus, textarea:focus { outline: none; border-color: var(--primary); }
    textarea { min-height: 100px; resize: vertical; font-family: monospace; }
    label { display: block; margin-bottom: 6px; font-size: 12px; color: var(--muted); }
    .form-row { margin-bottom: 12px; }

    /* 按钮 */
    .btn { padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-success { background: var(--success); color: #fff; }
    .btn-warning { background: var(--warning); color: #000; }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-secondary { background: #333; color: var(--text); }
    .btn:hover { opacity: 0.9; }
    .btn-sm { padding: 5px 12px; font-size: 11px; white-space: nowrap; }
    .btn-group { display: inline-flex; gap: 8px; }
    .pagination { display: flex; align-items: center; justify-content: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }

    /* 表格 */
    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid var(--border); }
    .table th { color: var(--muted); font-weight: 500; font-size: 13px; text-transform: uppercase; }
    .table tr:hover { background: rgba(255,255,255,0.02); }

    /* 标签 */
    .tag { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; white-space: nowrap; text-align: center; min-width: 60px; }
    .tag-success { background: rgba(52,211,153,0.15); color: var(--success); }
    .tag-danger { background: rgba(248,113,113,0.15); color: var(--danger); }
    .tag-warning { background: rgba(251,191,36,0.15); color: var(--warning); }
    .tag-info { background: rgba(96,165,250,0.15); color: var(--primary); }

    /* 端点卡片 */
    .endpoint-card { background: var(--bg); border-radius: 6px; padding: 12px; border-left: 3px solid var(--border); }
    .endpoint-card.banned { border-left-color: var(--danger); }
    .endpoint-card.whitelist { border-left-color: var(--success); }
    .endpoint-card.suspicious { border-left-color: var(--warning); }
    .endpoint-url { font-family: monospace; font-size: 14px; word-break: break-all; color: var(--primary); }
    .endpoint-meta { font-size: 13px; color: var(--muted); margin-top: 6px; }

    /* 授权码 */
    .code-box { background: var(--bg); border: 2px solid var(--primary); border-radius: 8px; padding: 20px; text-align: center; font-family: monospace; font-size: 24px; font-weight: 700; color: var(--primary); letter-spacing: 3px; }

    /* 提示 */
    .toast { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 6px; font-size: 13px; z-index: 9999; animation: slideIn 0.3s; }
    .toast-success { background: var(--success); color: #fff; }
    .toast-error { background: var(--danger); color: #fff; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    /* 搜索框 */
    .search-box { display: flex; gap: 8px; margin-bottom: 16px; }
    .search-box input { flex: 1; }

    /* 滚动 */
    .scroll { max-height: 400px; overflow-y: auto; }
    .scroll::-webkit-scrollbar { width: 6px; }
    .scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

    /* 空状态 */
    .empty { text-align: center; padding: 40px; color: var(--muted); }

    /* 模型标签 */
    .model-tag { display: inline-block; padding: 3px 8px; margin: 2px; background: #222; border-radius: 3px; font-size: 13px; font-family: monospace; }
  </style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="logo">🐱 猫猫后台</div>
    <div class="nav-section">概览</div>
    <div class="nav-item active" data-page="dashboard">📊 仪表盘</div>
    <div class="nav-item" data-page="auth">🔑 授权管理</div>
    <div class="nav-section">端点管理</div>
    <div class="nav-item" data-page="endpoints">📡 API端点</div>
    <div class="nav-item" data-page="blacklist">☠️ 黑名单</div>
    <div class="nav-item" data-page="whitelist">✅ 白名单</div>
    <div class="nav-item" data-page="banned">🚫 禁用列表</div>
    <div class="nav-item" data-page="suspicious">⚠️ 可疑列表</div>
    <div class="nav-section">日志</div>
    <div class="nav-item" data-page="logs">📝 验证日志</div>
    <div class="nav-item" data-page="models">🤖 模型记录</div>
    <div class="nav-item" data-page="tracks">🔗 端点关联</div>
    <div class="nav-section">设置</div>
    <div class="nav-item" data-page="settings">⚙️ 系统设置</div>
    <div class="admin-key">
      <label>管理密钥</label>
      <input type="password" id="adminKey" placeholder="输入密钥">
    </div>
  </aside>

  <main class="main">
    <!-- 仪表盘 -->
    <div id="page-dashboard" class="page active">
      <h1 class="page-title">📊 仪表盘</h1>
      <div class="grid grid-4" id="stats-grid">
        <div class="stat"><div class="stat-value" id="stat-success">-</div><div class="stat-label">成功验证</div></div>
        <div class="stat"><div class="stat-value" id="stat-failed">-</div><div class="stat-label">失败验证</div></div>
        <div class="stat"><div class="stat-value" id="stat-endpoints">-</div><div class="stat-label">API端点</div></div>
        <div class="stat"><div class="stat-value" id="stat-rate">-</div><div class="stat-label">成功率</div></div>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-title">当前授权码</div>
          <div class="code-box" id="current-code">加载中...</div>
          <div style="margin-top:12px;font-size:12px;color:var(--muted)">更新于: <span id="code-updated">-</span></div>
        </div>
        <div class="card">
          <div class="card-title">快速操作</div>
          <div class="btn-group">
            <button class="btn btn-primary" onclick="generateCode()">🎲 生成新授权码</button>
            <button class="btn btn-secondary" onclick="loadStats()">🔄 刷新数据</button>
          </div>
          <div style="margin-top:16px">
            <label>手动设置授权码</label>
            <div style="display:flex;gap:8px">
              <input type="text" id="new-code" placeholder="输入新授权码">
              <button class="btn btn-primary" onclick="updateCode()">更新</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">最近验证</div>
        <div class="scroll" id="recent-logs"></div>
      </div>
    </div>

    <!-- 授权管理 -->
    <div id="page-auth" class="page">
      <h1 class="page-title">🔑 授权管理</h1>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-title">自动更新设置</div>
          <div class="form-row">
            <label>启用自动更新</label>
            <select id="auto-update-enabled"><option value="false">关闭</option><option value="true">开启</option></select>
          </div>
          <div class="form-row">
            <label>更新时间（北京时间，0-23点）</label>
            <input type="number" id="auto-update-hour" min="0" max="23" value="0">
          </div>
          <div class="form-row">
            <label>更新间隔（天）</label>
            <input type="number" id="auto-update-days" min="1" value="1">
          </div>
          <button class="btn btn-primary" onclick="saveAutoUpdate()">保存设置</button>
        </div>
        <div class="card">
          <div class="card-title">历史授权码</div>
          <div class="scroll" id="code-history"></div>
        </div>
      </div>
    </div>

    <!-- API端点 -->
    <div id="page-endpoints" class="page">
      <h1 class="page-title">📡 API端点统计 <button class="btn btn-sm btn-info" style="margin-left:12px" onclick="batchFetchEndpointNames()">🔍 一键检测</button></h1>
      <div class="search-box">
        <input type="text" id="endpoint-search" placeholder="搜索端点..." oninput="filterEndpoints()">
        <select id="endpoint-filter" onchange="filterEndpoints()">
          <option value="all">全部</option>
          <option value="new">🆕 未分类</option>
          <option value="normal">正常</option>
          <option value="banned">已禁用</option>
          <option value="whitelist">白名单</option>
          <option value="suspicious">可疑</option>
        </select>
      </div>
      <div id="endpoints-list"></div>
    </div>

    <!-- 黑名单 -->
    <div id="page-blacklist" class="page">
      <h1 class="page-title">☠️ 黑名单（贩子站点）<button class="btn btn-sm btn-danger" style="margin-left:12px" onclick="clearList('blacklist')">清空全部</button></h1>
      <div class="card">
        <div class="card-title">添加黑名单</div>
        <div style="display:flex;gap:8px">
          <input type="text" id="blacklist-name" placeholder="站点名称" style="width:200px">
          <input type="text" id="blacklist-url" placeholder="URL（自动提取主域名）" style="flex:1">
          <button class="btn btn-danger" onclick="addBlacklist()">添加</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">📥 批量导入（TXT格式）</div>
        <div style="margin-bottom:8px;font-size:12px;color:var(--muted)">格式：每行一条，支持 "站点名称|URL" 或 "站点名称,URL" 或纯URL（名称默认为"未知贩子"）<br>以#开头的行会被忽略</div>
        <div style="display:flex;gap:8px;flex-direction:column">
          <textarea id="blacklist-import-content" placeholder="粘贴内容或上传TXT文件..." style="width:100%;height:120px;resize:vertical;font-family:monospace;font-size:12px"></textarea>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="file" id="blacklist-import-file" accept=".txt" style="display:none" onchange="handleBlacklistFileUpload(event)">
            <button class="btn btn-secondary" onclick="document.getElementById('blacklist-import-file').click()">📁 选择TXT文件</button>
            <button class="btn btn-danger" onclick="batchImportBlacklist()">📥 批量导入</button>
            <span id="blacklist-import-status" style="font-size:12px;color:var(--muted)"></span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
          <span>黑名单列表</span>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-info" onclick="batchFetchSiteNames()">🔍 一键检测</button>
            <button class="btn btn-sm btn-secondary" onclick="exportBlacklist('txt')">📤 导出TXT</button>
            <button class="btn btn-sm btn-secondary" onclick="exportBlacklist('csv')">📤 导出CSV</button>
          </div>
        </div>
        <div class="scroll" id="blacklist-list"></div>
      </div>
    </div>

    <!-- 白名单 -->
    <div id="page-whitelist" class="page">
      <h1 class="page-title">✅ 白名单（受信任站点）<button class="btn btn-sm btn-danger" style="margin-left:12px" onclick="clearList('whitelist')">清空全部</button></h1>
      <div class="card">
        <div class="card-title">添加白名单</div>
        <div style="display:flex;gap:8px">
          <input type="text" id="whitelist-url" placeholder="输入端点URL" style="flex:1">
          <button class="btn btn-success" onclick="addWhitelist()">添加</button>
        </div>
      </div>
      <div class="grid grid-3" id="whitelist-list"></div>
    </div>

    <!-- 禁用列表 -->
    <div id="page-banned" class="page">
      <h1 class="page-title">🚫 禁用列表<button class="btn btn-sm btn-danger" style="margin-left:12px" onclick="clearList('banned')">清空全部</button></h1>
      <div class="card">
        <div class="card-title">添加禁用</div>
        <div style="display:flex;gap:8px">
          <input type="text" id="ban-url" placeholder="输入要禁用的端点URL" style="flex:1">
          <input type="text" id="ban-reason" placeholder="禁用原因" style="width:200px">
          <button class="btn btn-danger" onclick="banEndpoint()">禁用</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">📥 批量导入（TXT格式）</div>
        <div style="margin-bottom:8px;font-size:12px;color:var(--muted)">格式：每行一个URL，或 "URL|原因"（自动去重）</div>
        <div style="display:flex;gap:8px;flex-direction:column">
          <textarea id="banned-import-content" placeholder="粘贴内容或上传TXT文件..." style="width:100%;height:100px;resize:vertical;font-family:monospace;font-size:12px"></textarea>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="file" id="banned-import-file" accept=".txt" style="display:none" onchange="handleBannedFileUpload(event)">
            <button class="btn btn-secondary" onclick="document.getElementById('banned-import-file').click()">📁 选择TXT文件</button>
            <button class="btn btn-danger" onclick="batchImportBanned()">📥 批量导入</button>
            <span id="banned-import-status" style="font-size:12px;color:var(--muted)"></span>
          </div>
        </div>
      </div>
      <div class="scroll" id="banned-list"></div>
    </div>

    <!-- 可疑列表 -->
    <div id="page-suspicious" class="page">
      <h1 class="page-title">⚠️ 可疑列表<button class="btn btn-sm btn-danger" style="margin-left:12px" onclick="clearList('suspicious')">清空全部</button></h1>
      <div class="grid grid-3" id="suspicious-list"></div>
    </div>

    <!-- 验证日志 -->
    <div id="page-logs" class="page">
      <h1 class="page-title">📝 验证日志</h1>
      <div class="search-box">
        <input type="text" id="log-search" placeholder="搜索日志..." oninput="filterLogs()">
      </div>
      <div class="scroll" style="max-height:600px" id="logs-list"></div>
    </div>

    <!-- 模型记录 -->
    <div id="page-models" class="page">
      <h1 class="page-title">🤖 模型记录</h1>
      <div class="search-box">
        <input type="text" id="model-search" placeholder="搜索端点或模型..." oninput="filterModels()">
        <button class="btn btn-secondary" onclick="loadModelReports()">刷新</button>
      </div>
      <div id="models-list"></div>
    </div>

    <!-- 端点关联 -->
    <div id="page-tracks" class="page">
      <h1 class="page-title">🔗 端点关联</h1>
      <p style="color:#888;margin-bottom:16px">查看同一用户使用的不同API端点（用于识别换站行为）</p>
      <div class="search-box">
        <input type="text" id="track-search" placeholder="搜索端点..." oninput="filterTracks()">
        <button class="btn btn-secondary" onclick="loadDeviceTracks()">刷新</button>
      </div>
      <div id="tracks-list"></div>
    </div>

    <!-- 设置 -->
    <div id="page-settings" class="page">
      <h1 class="page-title">⚙️ 系统设置</h1>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-title">封禁提示消息</div>
          <textarea id="block-message" placeholder="被封禁时显示的消息"></textarea>
          <button class="btn btn-primary" style="margin-top:12px" onclick="saveBlockMessage()">保存</button>
        </div>
        <div class="card">
          <div class="card-title">插件信息</div>
          <div class="form-row"><label>版本号</label><input type="text" id="plugin-version"></div>
          <div class="form-row"><label>更新日志</label><textarea id="plugin-changelog"></textarea></div>
          <div class="form-row"><label>使用说明</label><textarea id="plugin-usage"></textarea></div>
          <button class="btn btn-primary" onclick="savePluginInfo()">保存</button>
        </div>
      </div>
      <div class="card" style="margin-top:16px;border-color:#f59e0b">
        <div class="card-title" style="color:#f59e0b">🧹 数据清理</div>
        <p style="color:#888;margin-bottom:12px">清理所有列表中的重复数据（黑名单、白名单、禁用列表、可疑列表、API端点）</p>
        <button class="btn btn-warning" onclick="cleanupDuplicates()">清理重复数据</button>
      </div>
    </div>
  </main>
</div>

<script>
const adminKey = () => document.getElementById('adminKey').value;
let allEndpoints = [], allLogs = [];
const PAGE_SIZE = 15;
let currentPage = { endpoints: 1, whitelist: 1, blacklist: 1, banned: 1, suspicious: 1 };

// 分页组件
function renderPagination(total, current, listName) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return '';
  let html = '<div class="pagination">';
  html += '<button class="btn btn-sm btn-secondary" ' + (current <= 1 ? 'disabled' : '') + ' onclick="goPage(' + "'" + listName + "'" + ', ' + (current - 1) + ')">上一页</button>';
  html += '<span style="margin:0 12px;color:var(--muted)">第 ' + current + ' / ' + pages + ' 页 (共' + total + '条)</span>';
  html += '<button class="btn btn-sm btn-secondary" ' + (current >= pages ? 'disabled' : '') + ' onclick="goPage(' + "'" + listName + "'" + ', ' + (current + 1) + ')">下一页</button>';
  html += '</div>';
  return html;
}

function goPage(listName, page) {
  currentPage[listName] = page;
  if (listName === 'endpoints') renderEndpoints(allEndpoints);
  else if (listName === 'whitelist') loadWhitelist();
  else if (listName === 'blacklist') loadBlacklist();
  else if (listName === 'banned') loadBanned();
  else if (listName === 'suspicious') loadSuspicious();
}

// 导航
document.querySelectorAll('.nav-item').forEach(item => {
  item.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('page-' + item.dataset.page).classList.add('active');
    if (item.dataset.page === 'dashboard') loadStats();
    if (item.dataset.page === 'endpoints') loadEndpoints();
    if (item.dataset.page === 'blacklist') loadBlacklist();
    if (item.dataset.page === 'whitelist') loadWhitelist();
    if (item.dataset.page === 'banned') loadBanned();
    if (item.dataset.page === 'suspicious') loadSuspicious();
    if (item.dataset.page === 'logs') loadLogs();
    if (item.dataset.page === 'models') loadModelReports();
    if (item.dataset.page === 'tracks') loadDeviceTracks();
    if (item.dataset.page === 'auth') loadAutoUpdate();
    if (item.dataset.page === 'settings') loadSettings();
  };
});

// Toast
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// API
async function api(path, data = {}) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminKey: adminKey(), ...data })
  });
  return res.json();
}

// 加载统计
async function loadStats() {
  if (!adminKey()) {
    document.getElementById('current-code').textContent = '请先输入管理密钥';
    return;
  }
  try {
    const r = await api('/stats');
    if (!r.success) return toast(r.message || '加载失败', 'error');
  const d = r.data;
  document.getElementById('stat-success').textContent = d.stats.success;
  document.getElementById('stat-failed').textContent = d.stats.failed;
  document.getElementById('stat-endpoints').textContent = d.stats.apiEndpointCount;
  document.getElementById('stat-rate').textContent = d.stats.successRate + '%';
  document.getElementById('current-code').textContent = d.currentCode;
  document.getElementById('code-updated').textContent = d.updatedAt ? new Date(d.updatedAt).toLocaleString('zh-CN') : '-';

  // 最近日志
  const logsHtml = (d.logs || []).slice(0, 20).map(l =>
    '<div class="endpoint-card ' + (l.isValid ? '' : 'banned') + '">' +
    '<div style="display:flex;justify-content:space-between">' +
    '<span class="tag ' + (l.isValid !== false ? 'tag-success' : 'tag-danger') + '">' + (l.isValid !== false ? '✓' : '✗') + '</span>' +
    '<span style="font-size:11px;color:var(--muted)">' + new Date(l.timestamp).toLocaleString('zh-CN') + '</span></div>' +
    '<div class="endpoint-url" style="margin-top:6px">' + (l.apiEndpoint || '-') + '</div>' +
    '<div class="endpoint-meta">授权码: ' + (l.code || '-') + '</div></div>'
  ).join('');
  document.getElementById('recent-logs').innerHTML = logsHtml || '<div class="empty">暂无日志</div>';

  // 历史授权码
  const historyHtml = (d.history || []).map(h =>
    '<div class="endpoint-card"><code>' + h.code + '</code><div class="endpoint-meta">' + new Date(h.replacedAt).toLocaleString('zh-CN') + '</div></div>'
  ).join('');
  document.getElementById('code-history').innerHTML = historyHtml || '<div class="empty">暂无历史</div>';

  allEndpoints = d.apiEndpoints || [];
  allLogs = d.logs || [];
  } catch (e) {
    toast('加载失败: ' + e.message, 'error');
  }
}

// 更新授权码
async function updateCode() {
  const code = document.getElementById('new-code').value.trim();
  if (!code) return toast('请输入授权码', 'error');
  const r = await api('/update', { newCode: code });
  toast(r.message, r.success ? 'success' : 'error');
  if (r.success) loadStats();
}

// 生成授权码
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const d = new Date();
  const date = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  let rand = '';
  for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('new-code').value = 'MEOW-' + date + '-' + rand;
}

// 加载端点
async function loadEndpoints() {
  const r = await api('/stats');
  if (r.success) {
    allEndpoints = r.data.apiEndpoints || [];
    filterEndpoints(); // 保持当前筛选状态
  }
}

function renderEndpoints(list) {
  if (list.length === 0) {
    document.getElementById('endpoints-list').innerHTML = '<div class="empty">暂无端点</div>';
    return;
  }
  const start = (currentPage.endpoints - 1) * PAGE_SIZE;
  const pageList = list.slice(start, start + PAGE_SIZE);
  const html = '<table class="table" style="width:100%"><thead><tr><th style="width:60px">状态</th><th style="width:120px">站点</th><th>URL</th><th>模型</th><th style="width:50px">次数</th><th style="width:80px">访问</th><th style="width:100px">操作</th></tr></thead><tbody>' +
    pageList.map(e => {
      let status = '正常', cls = 'tag-info';
      if (e.isBanned) { status = '已禁用'; cls = 'tag-danger'; }
      else if (e.isWhitelisted) { status = '白名单'; cls = 'tag-success'; }
      else if (e.isSuspicious) { status = '可疑'; cls = 'tag-warning'; }
      else if (e.isBlacklisted) { status = '黑名单'; cls = 'tag-danger'; }
      const modelCount = e.models ? e.models.length : 0;
      const modelTags = modelCount > 0 ? e.models.map(m => '<span class="model-tag">' + m + '</span>').join('') : '<span style="color:var(--muted)">无</span>';
      const siteName = e.siteName || e.blacklistInfo?.siteName || '';
      return '<tr>' +
        '<td><span class="tag ' + cls + '">' + status + '</span></td>' +
        '<td style="font-size:12px">' + (siteName ? '<span style="color:#fbbf24">' + siteName + '</span>' : '<button class="btn btn-sm btn-info" onclick="fetchEndpointName(\\'' + e.endpoint.replace(/'/g, "\\\\'") + '\\')">检测</button>') + '</td>' +
        '<td style="font-family:monospace;font-size:14px;word-break:break-all"><a href="' + e.endpoint + '" target="_blank" style="color:#60a5fa;text-decoration:none" title="点击打开">' + e.endpoint + '</a></td>' +
        '<td><div style="max-height:60px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:2px;align-content:flex-start">' + modelTags + '</div></td>' +
        '<td style="text-align:center">' + (e.accessCount || 0) + '</td>' +
        '<td style="font-size:14px">' + (e.lastAccess ? new Date(e.lastAccess).toLocaleDateString('zh-CN') : '-') + '</td>' +
        '<td><button class="btn btn-sm btn-danger" onclick="quickBan(' + "'" + e.endpoint.replace(/'/g, "\\'") + "'" + ')" title="禁用">禁</button>' +
        '<button class="btn btn-sm btn-success" onclick="quickWhitelist(' + "'" + e.endpoint.replace(/'/g, "\\'") + "'" + ')" title="白名单">白</button>' +
        '<button class="btn btn-sm" style="background:#dc2626" onclick="addToBlacklist(' + "'" + e.endpoint.replace(/'/g, "\\'") + "'" + ')" title="加入黑名单">黑</button>' +
        '<button class="btn btn-sm" style="background:#6b7280" onclick="deleteEndpoint(' + "'" + e.endpoint.replace(/'/g, "\\'") + "'" + ')" title="删除记录">删</button></td></tr>';
    }).join('') + '</tbody></table>' + renderPagination(list.length, currentPage.endpoints, 'endpoints');
  document.getElementById('endpoints-list').innerHTML = html;
}

function filterEndpoints() {
  const search = document.getElementById('endpoint-search').value.toLowerCase();
  const filter = document.getElementById('endpoint-filter').value;
  let list = allEndpoints;
  if (search) list = list.filter(e => e.endpoint.toLowerCase().includes(search));
  if (filter === 'banned') list = list.filter(e => e.isBanned);
  if (filter === 'whitelist') list = list.filter(e => e.isWhitelisted);
  if (filter === 'suspicious') list = list.filter(e => e.isSuspicious);
  if (filter === 'normal') list = list.filter(e => !e.isBanned && !e.isWhitelisted && !e.isSuspicious);
  if (filter === 'new') list = list.filter(e => !e.isBanned && !e.isWhitelisted && !e.isSuspicious && !e.isBlacklisted);
  renderEndpoints(list);
}

async function quickBan(url) {
  if (!confirm('确定禁用 ' + url + '?')) return;
  const r = await api('/ban-endpoint', { endpoint: url, reason: '管理员禁用' });
  toast(r.message, r.success ? 'success' : 'error');
  loadEndpoints();
}

async function quickWhitelist(url) {
  const r = await api('/whitelist-endpoint', { endpoint: url });
  toast(r.message, r.success ? 'success' : 'error');
  loadEndpoints();
}

async function deleteEndpoint(url) {
  if (!confirm('确定删除 ' + url + ' 的记录？删除后用户需要重新授权获取')) return;
  const r = await api('/delete-endpoint', { endpoint: url });
  toast(r.message, r.success ? 'success' : 'error');
  loadEndpoints();
}

async function addToBlacklist(url) {
  if (!confirm('加入黑名单: ' + url + '?')) return;
  toast('正在添加并获取站点名称...', 'info');
  // 先添加到黑名单
  const r1 = await api('/add-blacklist', { endpoint: url, siteName: '获取中...' });
  if (!r1.success) { toast(r1.message, 'error'); return; }
  // 自动获取站点名称
  const r2 = await api('/fetch-site-name', { endpoint: url });
  toast(r2.success ? '✅ 已加入黑名单: ' + (r2.siteName || url) : '⚠️ 已加入黑名单，名称获取失败', r2.success ? 'success' : 'warning');
  loadEndpoints();
}

async function fetchEndpointName(url) {
  toast('正在检测站点名称...', 'info');
  // 只获取名称，不加入黑名单
  const r = await api('/detect-site-name', { endpoint: url });
  toast(r.success ? '✅ ' + (r.siteName || url) : '⚠️ 检测失败', r.success ? 'success' : 'warning');
  loadEndpoints();
}

async function batchFetchEndpointNames() {
  // 筛选没有站点名称的端点
  const toFetch = allEndpoints.filter(x => !x.siteName);
  if (toFetch.length === 0) {
    toast('所有端点都已有站点名称', 'info');
    return;
  }
  if (!confirm('将检测 ' + toFetch.length + ' 个端点的站点名称，是否继续？')) return;

  let success = 0, fail = 0;
  toast('正在批量检测 ' + toFetch.length + ' 个站点...', 'info');

  for (let i = 0; i < toFetch.length; i++) {
    const item = toFetch[i];
    try {
      // 只获取名称，不加入黑名单
      const r = await api('/detect-site-name', { endpoint: item.endpoint });
      if (r.success && r.siteName) success++;
      else fail++;
    } catch (e) { fail++; }
    if ((i + 1) % 3 === 0 || i === toFetch.length - 1) {
      toast('进度: ' + (i + 1) + '/' + toFetch.length + ' (成功:' + success + ' 失败:' + fail + ')', 'info');
    }
  }

  toast('✅ 检测完成！成功:' + success + ' 失败:' + fail, success > 0 ? 'success' : 'warning');
  loadEndpoints();
}

// 黑名单
let blacklistData = [];
async function loadBlacklist() {
  const r = await api('/get-blacklist');
  if (!r.success) return;
  blacklistData = r.data || [];
  renderBlacklist();
}
function renderBlacklist() {
  if (blacklistData.length === 0) {
    document.getElementById('blacklist-list').innerHTML = '<div class="empty">暂无黑名单</div>';
    return;
  }
  const start = (currentPage.blacklist - 1) * PAGE_SIZE;
  const pageList = blacklistData.slice(start, start + PAGE_SIZE);
  const html = '<table class="table"><thead><tr><th>站点名称</th><th>URL</th><th>添加时间</th><th>操作</th></tr></thead><tbody>' +
    pageList.map(info =>
      '<tr><td><span class="tag tag-danger">' + (info.siteName || '未知') + '</span></td>' +
      '<td>' + (info.endpoint || info.mainDomain || '-') + '</td>' +
      '<td>' + (info.addedAt ? new Date(info.addedAt).toLocaleString('zh-CN') : '-') + '</td>' +
      '<td><button class="btn btn-sm btn-info" onclick="fetchSiteName(\\'' + (info.endpoint || info.mainDomain || '').replace(/'/g, "\\\\'") + '\\')" title="获取网站标题">获取</button>' +
      '<button class="btn btn-sm btn-warning" onclick="editSiteName(\\'' + (info.endpoint || info.mainDomain || '').replace(/'/g, "\\\\'") + '\\')" title="手动编辑">编辑</button>' +
      '<button class="btn btn-sm btn-secondary" onclick="removeBlacklist(\\'' + (info.endpoint || info.mainDomain || '').replace(/'/g, "\\\\'") + '\\')">移除</button></td></tr>'
    ).join('') + '</tbody></table>' + renderPagination(blacklistData.length, currentPage.blacklist, 'blacklist');
  document.getElementById('blacklist-list').innerHTML = html;
}

async function addBlacklist() {
  const name = document.getElementById('blacklist-name').value.trim();
  const url = document.getElementById('blacklist-url').value.trim();
  if (!url) return toast('请输入URL', 'error');
  const r = await api('/add-blacklist', { endpoint: url, siteName: name || '未知贩子' });
  toast(r.message, r.success ? 'success' : 'error');
  if (r.success) { document.getElementById('blacklist-name').value = ''; document.getElementById('blacklist-url').value = ''; loadBlacklist(); }
}

async function removeBlacklist(url) {
  if (!confirm('确定移除?')) return;
  const r = await api('/remove-blacklist', { endpoint: url });
  toast(r.message, r.success ? 'success' : 'error');
  loadBlacklist();
}

async function fetchSiteName(url) {
  toast('正在获取站点名称...', 'info');
  const r = await api('/fetch-site-name', { endpoint: url });
  toast(r.message, r.success ? 'success' : 'error');
  if (r.success) loadBlacklist();
}

async function editSiteName(url) {
  const name = prompt('请输入站点名称:');
  if (!name) return;
  const r = await api('/edit-blacklist', { endpoint: url, siteName: name.trim() });
  toast(r.message, r.success ? 'success' : 'error');
  if (r.success) loadBlacklist();
}

async function batchFetchSiteNames() {
  // 筛选出需要检测的项（未知贩子或获取中）
  const toFetch = blacklistData.filter(x => !x.siteName || x.siteName === '未知贩子' || x.siteName === '获取中...' || x.siteName === '未知');
  if (toFetch.length === 0) {
    toast('没有需要检测的项', 'info');
    return;
  }
  if (!confirm('将检测 ' + toFetch.length + ' 个站点名称，是否继续？')) return;

  let success = 0, fail = 0;
  toast('正在批量检测 ' + toFetch.length + ' 个站点...', 'info');

  for (let i = 0; i < toFetch.length; i++) {
    const item = toFetch[i];
    try {
      const r = await api('/fetch-site-name', { endpoint: item.endpoint });
      if (r.success && r.siteName) success++;
      else fail++;
    } catch (e) { fail++; }
    // 每5个刷新一次显示进度
    if ((i + 1) % 5 === 0 || i === toFetch.length - 1) {
      toast('进度: ' + (i + 1) + '/' + toFetch.length + ' (成功:' + success + ' 失败:' + fail + ')', 'info');
    }
  }

  toast('✅ 检测完成！成功:' + success + ' 失败:' + fail, success > 0 ? 'success' : 'warning');
  loadBlacklist();
}

// 批量导入黑名单
function handleBlacklistFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('blacklist-import-status');
  status.textContent = '读取中...';
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('blacklist-import-content').value = e.target.result;
    status.textContent = '已读取: ' + file.name;
  };
  reader.onerror = function() {
    status.textContent = '读取失败';
    toast('文件读取失败', 'error');
  };
  reader.readAsText(file, 'UTF-8');
}

async function batchImportBlacklist() {
  const content = document.getElementById('blacklist-import-content').value.trim();
  if (!content) return toast('请输入或上传导入内容', 'error');
  const status = document.getElementById('blacklist-import-status');
  status.textContent = '导入中...';
  const r = await api('/batch-import-blacklist', { content });
  toast(r.message, r.success ? 'success' : 'error');
  status.textContent = r.success ? '导入完成' : '导入失败';
  if (r.success) {
    document.getElementById('blacklist-import-content').value = '';
    document.getElementById('blacklist-import-file').value = '';
    loadBlacklist();
  }
}

// 导出黑名单
function exportBlacklist(format) {
  if (!blacklistData || blacklistData.length === 0) {
    return toast('暂无数据可导出', 'error');
  }
  let content = '';
  let filename = '黑名单_' + new Date().toISOString().slice(0,10);
  let mimeType = 'text/plain';

  if (format === 'csv') {
    content = '站点名称,URL,添加时间\\n';
    content += blacklistData.map(item =>
      '"' + (item.siteName || '').replace(/"/g, '""') + '",' +
      '"' + (item.endpoint || item.mainDomain || '') + '",' +
      '"' + (item.addedAt ? new Date(item.addedAt).toLocaleString('zh-CN') : '') + '"'
    ).join('\\n');
    filename += '.csv';
    mimeType = 'text/csv;charset=utf-8';
  } else {
    content = blacklistData.map(item =>
      (item.siteName || '未知') + '|' + (item.endpoint || item.mainDomain || '')
    ).join('\\n');
    filename += '.txt';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast('导出成功: ' + filename, 'success');
}

// 白名单
async function loadWhitelist() {
  const r = await api('/get-whitelist-endpoints');
  if (!r.success) return;
  const list = r.data || [];
  if (list.length === 0) {
    document.getElementById('whitelist-list').innerHTML = '<div class="empty">暂无白名单</div>';
    return;
  }
  const html = '<table class="table"><thead><tr><th style="width:50px">#</th><th style="width:120px">站点</th><th>URL</th><th>添加时间</th><th>操作</th></tr></thead><tbody>' +
    list.map((info, i) => {
      const siteName = info.siteName || '';
      return '<tr><td style="text-align:center;color:var(--muted)">' + (i + 1) + '</td>' +
      '<td style="font-size:12px">' + (siteName ? '<span style="color:#22c55e">' + siteName + '</span>' : '<button class="btn btn-sm btn-info" onclick="fetchWhitelistName(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')">检测</button>') + '</td>' +
      '<td style="font-family:monospace;font-size:12px">' + (info.endpoint || '-') + '</td>' +
      '<td style="white-space:nowrap;color:var(--muted)">' + (info.addedAt ? new Date(info.addedAt).toLocaleString('zh-CN') : '-') + '</td>' +
      '<td><button class="btn btn-sm" style="background:#dc2626" onclick="whitelistToBlacklist(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')" title="转移到黑名单">转黑</button>' +
      '<button class="btn btn-sm btn-danger" onclick="removeWhitelist(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')">移除</button></td></tr>';
    }).join('') + '</tbody></table>';
  document.getElementById('whitelist-list').innerHTML = html;
}

async function addWhitelist() {
  const url = document.getElementById('whitelist-url').value.trim();
  if (!url) return toast('请输入URL', 'error');
  const r = await api('/whitelist-endpoint', { endpoint: url });
  toast(r.message, r.success ? 'success' : 'error');
  if (r.success) { document.getElementById('whitelist-url').value = ''; loadWhitelist(); }
}

async function removeWhitelist(url) {
  if (!confirm('确定移除?')) return;
  const r = await api('/unwhitelist-endpoint', { endpoint: url });
  toast(r.message, r.success ? 'success' : 'error');
  loadWhitelist();
}

async function fetchWhitelistName(url) {
  toast('正在检测站点名称...', 'info');
  const r = await api('/fetch-site-name', { endpoint: url });
  if (r.success && r.siteName) {
    // 更新白名单中的站点名称
    await api('/update-whitelist-name', { endpoint: url, siteName: r.siteName });
  }
  toast(r.success ? '✅ ' + (r.siteName || url) : '⚠️ 检测失败', r.success ? 'success' : 'warning');
  loadWhitelist();
}

async function whitelistToBlacklist(url) {
  if (!confirm('转移到黑名单: ' + url + '?')) return;
  toast('正在转移并获取站点名称...', 'info');
  // 先从白名单移除
  await api('/unwhitelist-endpoint', { endpoint: url });
  // 添加到黑名单
  await api('/add-blacklist', { endpoint: url, siteName: '获取中...' });
  // 获取站点名称
  const r = await api('/fetch-site-name', { endpoint: url });
  toast(r.success ? '✅ 已转移到黑名单: ' + (r.siteName || url) : '⚠️ 已转移，名称获取失败', r.success ? 'success' : 'warning');
  loadWhitelist();
}

// 禁用列表
async function loadBanned() {
  const r = await api('/get-banned-endpoints');
  if (!r.success) return;
  const list = r.data || [];
  if (list.length === 0) {
    document.getElementById('banned-list').innerHTML = '<div class="empty">暂无禁用</div>';
    return;
  }
  const html = '<table class="table"><thead><tr><th>状态</th><th style="width:120px">站点</th><th>URL</th><th>原因</th><th>禁用时间</th><th>操作</th></tr></thead><tbody>' +
    list.map(info => {
      const siteName = info.siteName || '';
      return '<tr><td><span class="tag tag-danger">已禁用</span></td>' +
      '<td style="font-size:12px">' + (siteName ? '<span style="color:#ef4444">' + siteName + '</span>' : '<button class="btn btn-sm btn-info" onclick="fetchBannedName(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')">检测</button>') + '</td>' +
      '<td style="font-family:monospace;font-size:12px">' + (info.endpoint || '-') + '</td>' +
      '<td style="color:var(--muted)">' + (info.reason || '-') + '</td>' +
      '<td style="white-space:nowrap;color:var(--muted)">' + (info.bannedAt ? new Date(info.bannedAt).toLocaleString('zh-CN') : '-') + '</td>' +
      '<td><button class="btn btn-sm" style="background:#dc2626" onclick="bannedToBlacklist(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')" title="加入黑名单">加黑</button>' +
      '<button class="btn btn-sm btn-success" onclick="unban(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')">解禁</button></td></tr>';
    }).join('') + '</tbody></table>';
  document.getElementById('banned-list').innerHTML = html;
}

async function banEndpoint() {
  const url = document.getElementById('ban-url').value.trim();
  const reason = document.getElementById('ban-reason').value.trim();
  if (!url) return toast('请输入URL', 'error');
  const r = await api('/ban-endpoint', { endpoint: url, reason: reason || '管理员禁用' });
  toast(r.message, r.success ? 'success' : 'error');
  if (r.success) { document.getElementById('ban-url').value = ''; document.getElementById('ban-reason').value = ''; loadBanned(); }
}

async function unban(url) {
  if (!confirm('确定解禁?')) return;
  const r = await api('/unban-endpoint', { endpoint: url });
  toast(r.message, r.success ? 'success' : 'error');
  loadBanned();
}

async function bannedToBlacklist(url) {
  if (!confirm('加入黑名单: ' + url + '?')) return;
  toast('正在添加并获取站点名称...', 'info');
  // 添加到黑名单
  await api('/add-blacklist', { endpoint: url, siteName: '获取中...' });
  // 获取站点名称
  const r = await api('/fetch-site-name', { endpoint: url });
  toast(r.success ? '✅ 已加入黑名单: ' + (r.siteName || url) : '⚠️ 已加入黑名单，名称获取失败', r.success ? 'success' : 'warning');
  loadBanned();
}

async function fetchBannedName(url) {
  toast('正在检测站点名称...', 'info');
  const r = await api('/fetch-site-name', { endpoint: url });
  if (r.success && r.siteName) {
    await api('/update-banned-name', { endpoint: url, siteName: r.siteName });
  }
  toast(r.success ? '✅ ' + (r.siteName || url) : '⚠️ 检测失败', r.success ? 'success' : 'warning');
  loadBanned();
}

// 批量导入禁用列表
function handleBannedFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('banned-import-status');
  status.textContent = '读取中...';
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('banned-import-content').value = e.target.result;
    status.textContent = '已读取: ' + file.name;
  };
  reader.onerror = function() {
    status.textContent = '读取失败';
    toast('文件读取失败', 'error');
  };
  reader.readAsText(file, 'UTF-8');
}

async function batchImportBanned() {
  const content = document.getElementById('banned-import-content').value.trim();
  if (!content) return toast('请输入或上传导入内容', 'error');
  const status = document.getElementById('banned-import-status');
  status.textContent = '导入中...';
  const r = await api('/batch-import-banned', { content });
  toast(r.message, r.success ? 'success' : 'error');
  status.textContent = r.success ? '导入完成' : '导入失败';
  if (r.success) {
    document.getElementById('banned-import-content').value = '';
    document.getElementById('banned-import-file').value = '';
    loadBanned();
  }
}

// 可疑列表
async function loadSuspicious() {
  const r = await api('/get-suspicious-endpoints');
  if (!r.success) return;
  const list = r.data || [];
  if (list.length === 0) {
    document.getElementById('suspicious-list').innerHTML = '<div class="empty">暂无可疑端点</div>';
    return;
  }
  const html = '<table class="table"><thead><tr><th style="width:50px">#</th><th>URL</th><th>添加时间</th><th>操作</th></tr></thead><tbody>' +
    list.map((info, i) =>
      '<tr><td style="text-align:center;color:var(--muted)">' + (i + 1) + '</td>' +
      '<td style="font-family:monospace;font-size:12px">' + (info.endpoint || '-') + '</td>' +
      '<td style="white-space:nowrap;color:var(--muted)">' + (info.addedAt ? new Date(info.addedAt).toLocaleString('zh-CN') : '-') + '</td>' +
      '<td><div class="btn-group">' +
      '<button class="btn btn-sm btn-danger" onclick="quickBan(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')">禁用</button>' +
      '<button class="btn btn-sm btn-success" onclick="quickWhitelist(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')">白名单</button>' +
      '<button class="btn btn-sm btn-secondary" onclick="removeSuspicious(\\'' + (info.endpoint || '').replace(/'/g, "\\\\'") + '\\')">移除</button></div></td></tr>'
    ).join('') + '</tbody></table>';
  document.getElementById('suspicious-list').innerHTML = html;
}

async function removeSuspicious(url) {
  const r = await api('/unsuspicious-endpoint', { endpoint: url });
  toast(r.message, r.success ? 'success' : 'error');
  loadSuspicious();
}

// 日志
async function loadLogs() {
  const r = await api('/stats');
  if (r.success) {
    allLogs = r.data.logs || [];
    renderLogs(allLogs);
  }
}

function renderLogs(list) {
  const html = list.slice(0, 200).map(l =>
    '<div class="endpoint-card ' + (l.isValid !== false ? '' : 'banned') + '">' +
    '<div style="display:flex;justify-content:space-between">' +
    '<span class="tag ' + (l.isValid !== false ? 'tag-success' : 'tag-danger') + '">' + (l.isValid !== false ? '成功' : '失败') + '</span>' +
    '<span style="font-size:11px;color:var(--muted)">' + new Date(l.timestamp).toLocaleString('zh-CN') + '</span></div>' +
    '<div class="endpoint-url" style="margin:6px 0">' + (l.apiEndpoint || '-') + '</div>' +
    '<div class="endpoint-meta">授权码: ' + (l.code || '-') + (l.reason ? ' | 原因: ' + l.reason : '') + '</div></div>'
  ).join('');
  document.getElementById('logs-list').innerHTML = html || '<div class="empty">暂无日志</div>';
}

function filterLogs() {
  const search = document.getElementById('log-search').value.toLowerCase();
  let list = allLogs;
  if (search) list = list.filter(l => (l.apiEndpoint || '').toLowerCase().includes(search) || (l.code || '').toLowerCase().includes(search));
  renderLogs(list);
}

// 模型记录
async function loadModelReports() {
  const r = await api('/get-model-reports');
  if (!r.success) return;
  const list = r.data || [];
  const html = list.map(item =>
    '<div class="card">' +
    '<div class="endpoint-url">' + item.endpoint + '</div>' +
    '<div class="endpoint-meta" style="margin:8px 0">上报次数: ' + (item.reportCount || 0) + ' | 最后: ' + (item.lastReport ? new Date(item.lastReport).toLocaleString('zh-CN') : '-') + '</div>' +
    '<div>' + (item.models || []).map(m => '<span class="model-tag">' + m + '</span>').join('') + '</div></div>'
  ).join('');
  document.getElementById('models-list').innerHTML = html || '<div class="empty">暂无模型记录</div>';
}

function filterModels() {
  // TODO
}

// 设备追踪
let allTracks = [];
async function loadDeviceTracks() {
  const r = await api('/get-device-tracks');
  if (!r.success) return;
  allTracks = r.data || [];
  renderTracks();
}

function renderTracks() {
  const search = (document.getElementById('track-search')?.value || '').toLowerCase();
  const filtered = allTracks.filter(t => !search || t.name.toLowerCase().includes(search) || t.endpoints.some(e => e.url.toLowerCase().includes(search)));

  const html = filtered.map((t, idx) => {
    const endpointCount = t.endpoints.length;
    const totalCount = t.endpoints.reduce((sum, e) => sum + (e.count || 1), 0);
    const name = t.name || ('maomao' + (idx + 1));
    return '<div class="card" style="margin-bottom:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div><span style="color:#4a9eff;font-weight:600">' + name + '</span>' +
      '<span style="margin-left:12px;color:#888">' + endpointCount + ' 个端点 / ' + totalCount + ' 次访问</span></div>' +
      '<div style="color:#666;font-size:12px">首次: ' + new Date(t.firstSeen).toLocaleDateString('zh-CN') + ' | 最近: ' + new Date(t.lastSeen).toLocaleString('zh-CN') + '</div></div>' +
      '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px">' +
      t.endpoints.map(e => '<div style="background:#1a1a2e;padding:6px 10px;border-radius:6px;font-size:12px">' +
        '<a href="' + e.url + '" target="_blank" style="color:#4a9eff">' + e.url.substring(0, 40) + (e.url.length > 40 ? '...' : '') + '</a>' +
        '<span style="color:#888;margin-left:8px">x' + (e.count || 1) + '</span></div>').join('') +
      '</div></div>';
  }).join('');

  document.getElementById('tracks-list').innerHTML = html || '<div class="empty">暂无数据</div>';
}

function filterTracks() {
  renderTracks();
}

// 自动更新
async function loadAutoUpdate() {
  const r = await fetch('/get-auto-update-config').then(r => r.json());
  if (r.success && r.data) {
    document.getElementById('auto-update-enabled').value = r.data.enabled ? 'true' : 'false';
    document.getElementById('auto-update-hour').value = r.data.hour || 0;
    document.getElementById('auto-update-days').value = r.data.days || 1;
  }
  loadStats();
}

async function saveAutoUpdate() {
  const r = await api('/set-auto-update-config', {
    enabled: document.getElementById('auto-update-enabled').value === 'true',
    hour: parseInt(document.getElementById('auto-update-hour').value) || 0,
    days: parseInt(document.getElementById('auto-update-days').value) || 1
  });
  toast(r.message, r.success ? 'success' : 'error');
}

// 设置
async function loadSettings() {
  const r1 = await api('/get-block-message');
  if (r1.success) document.getElementById('block-message').value = r1.data || '';

  const r2 = await fetch('/plugin-info').then(r => r.json());
  if (r2.success && r2.data) {
    document.getElementById('plugin-version').value = r2.data.version || '';
    document.getElementById('plugin-changelog').value = r2.data.changelog || '';
    document.getElementById('plugin-usage').value = r2.data.usage || '';
  }
}

async function saveBlockMessage() {
  const r = await api('/set-block-message', { message: document.getElementById('block-message').value });
  toast(r.message, r.success ? 'success' : 'error');
}

async function cleanupDuplicates() {
  if (!confirm('确定要清理所有重复数据吗？')) return;
  const r = await api('/cleanup-duplicates');
  toast(r.message, r.success ? 'success' : 'error');
  if (r.success) {
    console.log('清理结果:', r.data);
    loadStats();
  }
}

async function savePluginInfo() {
  const r = await fetch('/update-plugin-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: document.getElementById('plugin-version').value,
      changelog: document.getElementById('plugin-changelog').value,
      usage: document.getElementById('plugin-usage').value
    })
  }).then(r => r.json());
  toast(r.message, r.success ? 'success' : 'error');
}

function showEndpointDetail(url) {
  // TODO: 弹窗显示详情
  alert('端点: ' + url);
}

// 初始化 - 监听管理密钥输入
document.getElementById('adminKey').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loadStats();
});
document.getElementById('adminKey').addEventListener('change', () => loadStats());

// 首次不自动加载，等用户输入密钥
document.getElementById('current-code').textContent = '请输入管理密钥后按回车';

// 一键清空列表
async function clearList(listType) {
  const names = { blacklist: '黑名单', whitelist: '白名单', banned: '禁用列表', suspicious: '可疑列表', all: '所有列表' };
  if (!confirm('确定要清空' + names[listType] + '吗？此操作不可恢复！')) return;
  const r = await api('/clear-list', { listType });
  toast(r.message, r.success ? 'success' : 'error');
  if (r.success) {
    if (listType === 'blacklist') loadBlacklist();
    else if (listType === 'whitelist') loadWhitelist();
    else if (listType === 'banned') loadBanned();
    else if (listType === 'suspicious') loadSuspicious();
    else loadStats();
  }
}
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * 清理重复数据
 */
async function handleCleanupDuplicates(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const cleaned = { blacklist: 0, whitelist: 0, banned: 0, suspicious: 0, endpoints: 0 };

    // 清理黑名单重复
    const blacklistStr = await redisGet('blacklist_endpoints');
    if (blacklistStr) {
      const blacklist = JSON.parse(blacklistStr);
      const originalCount = Object.keys(blacklist).length;
      const seen = new Set();
      for (const key of Object.keys(blacklist)) {
        const endpoint = blacklist[key].endpoint || blacklist[key].mainDomain || key;
        if (seen.has(endpoint)) {
          delete blacklist[key];
        } else {
          seen.add(endpoint);
        }
      }
      cleaned.blacklist = originalCount - Object.keys(blacklist).length;
      await redisSet('blacklist_endpoints', JSON.stringify(blacklist));
    }

    // 清理白名单重复
    const whitelistStr = await redisGet('whitelist_endpoints');
    if (whitelistStr) {
      const whitelist = JSON.parse(whitelistStr);
      const originalCount = Object.keys(whitelist).length;
      const seen = new Set();
      for (const key of Object.keys(whitelist)) {
        const endpoint = whitelist[key].endpoint || key;
        if (seen.has(endpoint)) {
          delete whitelist[key];
        } else {
          seen.add(endpoint);
        }
      }
      cleaned.whitelist = originalCount - Object.keys(whitelist).length;
      await redisSet('whitelist_endpoints', JSON.stringify(whitelist));
    }

    // 清理禁用列表重复
    const bannedStr = await redisGet('banned_endpoints');
    if (bannedStr) {
      const banned = JSON.parse(bannedStr);
      const originalCount = Object.keys(banned).length;
      const seen = new Set();
      for (const key of Object.keys(banned)) {
        const endpoint = banned[key].endpoint || key;
        if (seen.has(endpoint)) {
          delete banned[key];
        } else {
          seen.add(endpoint);
        }
      }
      cleaned.banned = originalCount - Object.keys(banned).length;
      await redisSet('banned_endpoints', JSON.stringify(banned));
    }

    // 清理可疑列表重复
    const suspiciousStr = await redisGet('suspicious_endpoints');
    if (suspiciousStr) {
      const suspicious = JSON.parse(suspiciousStr);
      const originalCount = Object.keys(suspicious).length;
      const seen = new Set();
      for (const key of Object.keys(suspicious)) {
        const endpoint = suspicious[key].endpoint || key;
        if (seen.has(endpoint)) {
          delete suspicious[key];
        } else {
          seen.add(endpoint);
        }
      }
      cleaned.suspicious = originalCount - Object.keys(suspicious).length;
      await redisSet('suspicious_endpoints', JSON.stringify(suspicious));
    }

    // 清理API端点重复
    const endpointsStr = await redisGet('api_endpoints');
    if (endpointsStr) {
      const endpoints = JSON.parse(endpointsStr);
      const originalCount = Object.keys(endpoints).length;
      const seen = new Set();
      for (const key of Object.keys(endpoints)) {
        const endpoint = endpoints[key].endpoint || key;
        if (seen.has(endpoint)) {
          delete endpoints[key];
        } else {
          seen.add(endpoint);
        }
      }
      cleaned.endpoints = originalCount - Object.keys(endpoints).length;
      await redisSet('api_endpoints', JSON.stringify(endpoints));
    }

    const total = cleaned.blacklist + cleaned.whitelist + cleaned.banned + cleaned.suspicious + cleaned.endpoints;
    return jsonResponse(
      {
        success: true,
        message: `✅ 清理完成！共删除 ${total} 条重复数据`,
        data: cleaned,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 清理失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 一键清空列表
 */
async function handleClearList(request, env, corsHeaders) {
  try {
    const { adminKey, listType } = await request.json();
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const listMap = {
      blacklist: 'blacklist_endpoints',
      whitelist: 'whitelist_endpoints',
      banned: 'banned_endpoints',
      suspicious: 'suspicious_endpoints',
      endpoints: 'api_endpoints',
      all: ['blacklist_endpoints', 'whitelist_endpoints', 'banned_endpoints', 'suspicious_endpoints'],
    };

    const listNames = {
      blacklist: '黑名单',
      whitelist: '白名单',
      banned: '禁用列表',
      suspicious: '可疑列表',
      endpoints: 'API端点',
      all: '所有列表',
    };

    if (!listType || !listMap[listType]) {
      return jsonResponse({ success: false, message: '❌ 无效的列表类型' }, 400, corsHeaders);
    }

    const keys = Array.isArray(listMap[listType]) ? listMap[listType] : [listMap[listType]];
    for (const key of keys) {
      await redisSet(key, '{}');
    }

    return jsonResponse({ success: true, message: `✅ ${listNames[listType]}已清空` }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 清空失败: ' + error.message }, 500, corsHeaders);
  }
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
    const now = new Date().toISOString();

    if (usage[code]) {
      // 授权码已存在，更新统计
      usage[code].lastUsed = now;
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
        firstUsed: now,
        lastUsed: now,
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
async function recordApiEndpoint(env, apiEndpoint, verifyResult = null, code = null, model = null) {
  try {
    const endpointsStr = await redisGet('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};

    const now = new Date().toISOString();

    // 🔥 拆分多个 URL（用 | 分隔），分别存储
    const urlList = apiEndpoint
      .split(/\s*\|\s*/)
      .map(u => u.trim().replace(/\/+$/, '').replace(/\/v1$/, ''))
      .filter(u => u && u !== 'unknown' && u.length > 5);

    // 如果没有有效 URL，用原始值
    const endpointsToRecord = urlList.length > 0 ? urlList : [apiEndpoint];

    for (const singleEndpoint of endpointsToRecord) {
      if (endpoints[singleEndpoint]) {
        // API端点已存在，更新统计
        endpoints[singleEndpoint].lastAccess = now;
        endpoints[singleEndpoint].accessCount = (endpoints[singleEndpoint].accessCount || 0) + 1;
      } else {
        // 新的API端点
        endpoints[singleEndpoint] = {
          endpoint: singleEndpoint,
          firstAccess: now,
          lastAccess: now,
          accessCount: 1,
          models: [],
        };
      }

      // 🔥 不再在验证时记录模型（数据不准确）
      // 模型数据现在来自 /report-models 接口（插件拉取模型列表时上报）

      // 记录验证历史（最多保留50条）
      if (!endpoints[singleEndpoint].verifyHistory) {
        endpoints[singleEndpoint].verifyHistory = [];
      }
      endpoints[singleEndpoint].verifyHistory.unshift({
        timestamp: now,
        success: verifyResult === 'success',
        code: code ? code.substring(0, 8) + '****' : null, // 脱敏
        result: verifyResult || 'unknown',
        model: model || null,
      });
      if (endpoints[singleEndpoint].verifyHistory.length > 50) {
        endpoints[singleEndpoint].verifyHistory.length = 50;
      }
    }

    await redisSet('api_endpoints', JSON.stringify(endpoints));
    console.log(`📝 记录 API 端点: ${endpointsToRecord.join(', ')}, 模型: ${model || 'unknown'}`);
  } catch (error) {
    console.error('记录API端点失败:', error);
  }
}

/**
 * 记录设备追踪（匿名，用于关联同一用户的不同API端点）
 */
async function recordDeviceTrack(deviceId, apiEndpoint) {
  try {
    const tracksStr = await redisGet('device_tracks');
    const tracks = tracksStr ? JSON.parse(tracksStr) : {};

    const now = new Date().toISOString();

    // 拆分多个 URL
    const urlList = apiEndpoint
      .split(/\s*\|\s*/)
      .map(u => u.trim().replace(/\/+$/, '').replace(/\/v1$/, ''))
      .filter(u => u && u !== 'unknown' && u.length > 5);

    if (!tracks[deviceId]) {
      tracks[deviceId] = {
        firstSeen: now,
        lastSeen: now,
        endpoints: [],
      };
    }

    tracks[deviceId].lastSeen = now;

    // 记录使用过的端点（去重）
    for (const url of urlList) {
      const existing = tracks[deviceId].endpoints.find(e => e.url === url);
      if (existing) {
        existing.lastUsed = now;
        existing.count = (existing.count || 1) + 1;
      } else {
        tracks[deviceId].endpoints.push({
          url,
          firstUsed: now,
          lastUsed: now,
          count: 1,
        });
      }
    }

    // 限制每个设备最多记录 20 个端点
    if (tracks[deviceId].endpoints.length > 20) {
      tracks[deviceId].endpoints = tracks[deviceId].endpoints
        .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
        .slice(0, 20);
    }

    // 限制总设备数（保留最近活跃的 500 个）
    const deviceIds = Object.keys(tracks);
    if (deviceIds.length > 500) {
      const sorted = deviceIds.sort(
        (a, b) => new Date(tracks[b].lastSeen).getTime() - new Date(tracks[a].lastSeen).getTime(),
      );
      const toKeep = sorted.slice(0, 500);
      const newTracks = {};
      for (const id of toKeep) {
        newTracks[id] = tracks[id];
      }
      await redisSet('device_tracks', JSON.stringify(newTracks));
    } else {
      await redisSet('device_tracks', JSON.stringify(tracks));
    }
  } catch (error) {
    // 静默失败，不影响主流程
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
 * 批量导入禁用列表（支持txt格式）
 * 格式：每行一个URL，或 "URL|原因"
 */
async function handleBatchImportBanned(request, env, corsHeaders) {
  try {
    const { adminKey, content } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!content || !content.trim()) {
      return jsonResponse({ success: false, message: '❌ 导入内容不能为空' }, 400, corsHeaders);
    }

    const bannedStr = await redisGet('banned_endpoints');
    const banned = bannedStr ? JSON.parse(bannedStr) : {};

    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    let addedCount = 0;
    let skippedCount = 0;

    for (const line of lines) {
      let endpoint = '';
      let reason = '批量导入禁用';

      // 智能解析格式：支持 "URL|原因" 或 "名称|URL" 两种格式
      const separators = ['|', ',', '\t'];
      let parsed = false;
      for (const sep of separators) {
        if (line.includes(sep)) {
          const parts = line.split(sep).map(p => p.trim());
          if (parts.length >= 2) {
            // 检查哪个部分是URL
            if (parts[1].includes('http') || (parts[1].includes('.') && !parts[0].includes('http'))) {
              // 格式: 名称|URL - 第二部分是URL
              endpoint = parts[1];
              reason = parts[0] || '批量导入禁用';
            } else if (parts[0].includes('.') || parts[0].includes('http')) {
              // 格式: URL|原因 - 第一部分是URL
              endpoint = parts[0];
              reason = parts[1] || '批量导入禁用';
            }
            if (endpoint) {
              parsed = true;
              break;
            }
          }
        }
      }

      if (!parsed) {
        if (line.includes('.') || line.includes('http')) {
          endpoint = line;
        } else {
          continue;
        }
      }

      if (!endpoint) continue;

      // 去重检查
      if (banned[endpoint]) {
        skippedCount++;
        continue;
      }

      banned[endpoint] = {
        endpoint: endpoint,
        reason: reason,
        bannedAt: new Date().toISOString(),
      };
      addedCount++;
    }

    await redisSet('banned_endpoints', JSON.stringify(banned));

    return jsonResponse(
      {
        success: true,
        message: `✅ 批量导入完成：新增 ${addedCount} 条，跳过 ${skippedCount} 条重复`,
        added: addedCount,
        skipped: skippedCount,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 导入失败: ' + error.message }, 500, corsHeaders);
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
    const { adminKey, endpoint, siteName } = await request.json();

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
      siteName: siteName || '',
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
    list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

    return jsonResponse({ success: true, data: list }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 获取失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 更新白名单站点名称
 */
async function handleUpdateWhitelistName(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint, siteName } = await request.json();
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }
    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};
    if (whitelist[endpoint]) {
      whitelist[endpoint].siteName = siteName;
      await redisSet('whitelist_endpoints', JSON.stringify(whitelist));
    }
    return jsonResponse({ success: true, message: '✅ 已更新' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 更新禁用列表站点名称
 */
async function handleUpdateBannedName(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint, siteName } = await request.json();
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }
    const bannedStr = await redisGet('banned_endpoints');
    const banned = bannedStr ? JSON.parse(bannedStr) : {};
    if (banned[endpoint]) {
      banned[endpoint].siteName = siteName;
      await redisSet('banned_endpoints', JSON.stringify(banned));
    }
    return jsonResponse({ success: true, message: '✅ 已更新' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 添加端点到可疑列表
 */
async function handleSuspiciousEndpoint(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint, siteName } = await request.json();

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
      siteName: siteName || '',
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
    list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

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
    list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

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

/**
 * 获取网站标题并更新黑名单
 */
async function handleFetchSiteName(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    // 提取网站名称的辅助函数
    const extractFromHtml = html => {
      let name = null;
      let match;

      // 1. title 标签
      match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (match && match[1] && match[1].trim()) name = match[1].replace(/\s+/g, ' ').trim();

      // 2. og:title / og:site_name
      if (!name) {
        match =
          html.match(/<meta[^>]+(?:property|name)=["']og:(?:title|site_name)["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:(?:title|site_name)["']/i);
        if (match && match[1]) name = match[1].trim();
      }

      // 3. twitter:title
      if (!name) {
        match = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
        if (match && match[1]) name = match[1].trim();
      }

      // 4. application-name / apple-mobile-web-app-title
      if (!name) {
        match = html.match(
          /<meta[^>]+name=["'](?:application-name|apple-mobile-web-app-title)["'][^>]+content=["']([^"']+)["']/i,
        );
        if (match && match[1]) name = match[1].trim();
      }

      // 5. h1/h2 标签
      if (!name) {
        match = html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
        if (match && match[1])
          name = match[1]
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
      }

      // 6. JSON-LD
      if (!name) {
        match = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        if (match && match[1]) {
          try {
            const j = JSON.parse(match[1]);
            name = j.name || j.headline || j.siteName || (j['@graph'] && j['@graph'].find(x => x.name)?.name);
          } catch (e) {}
        }
      }

      // 7. logo alt 属性
      if (!name) {
        match =
          html.match(/<img[^>]+(?:class|id)=["'][^"']*logo[^"']*["'][^>]+alt=["']([^"']+)["']/i) ||
          html.match(/<img[^>]+alt=["']([^"']+)["'][^>]+(?:class|id)=["'][^"']*logo[^"']*["']/i);
        if (match && match[1]) name = match[1].trim();
      }

      // 8. 页面内 JS 变量
      if (!name) {
        match = html.match(/(?:site[_-]?name|app[_-]?name|brand)['":\s]+['"]([^'"]+)['"]/i);
        if (match && match[1]) name = match[1].trim();
      }

      // 8.5 NewAPI 特有：systemName、serverAddress 等配置
      if (!name) {
        match = html.match(/(?:systemName|system_name|serverName|server_name)['":\s]+['"]([^'"]+)['"]/i);
        if (match && match[1]) name = match[1].trim();
      }

      // 8.6 NewAPI: window.config 或 __CONFIG__
      if (!name) {
        match = html.match(
          /(?:window\.config|__CONFIG__|globalConfig)\s*=\s*\{[^}]*(?:name|title|systemName)['":\s]+['"]([^'"]+)['"]/i,
        );
        if (match && match[1]) name = match[1].trim();
      }

      // 8.7 React/Vue 组件中的 props
      if (!name) {
        match = html.match(/(?:siteName|siteTitle|appTitle|systemTitle)['":\s]+['"]([^'"]+)['"]/i);
        if (match && match[1]) name = match[1].trim();
      }

      // 9. Next.js __NEXT_DATA__
      if (!name) {
        match = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
        if (match && match[1]) {
          try {
            const d = JSON.parse(match[1]);
            name = d.props?.pageProps?.site?.name || d.props?.pageProps?.title || d.buildId?.split('-')[0]; // 有时 buildId 包含项目名
          } catch (e) {}
        }
      }

      // 10. Nuxt __NUXT__
      if (!name) {
        match = html.match(/window\.__NUXT__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/i);
        if (match && match[1]) {
          try {
            const nuxtMatch = match[1].match(/(?:title|name|siteName)['":\s]+['"]([^'"]+)['"]/i);
            if (nuxtMatch) name = nuxtMatch[1];
          } catch (e) {}
        }
      }

      // 11. 从 link 标签的 href 提取（如 /static/xxx-api/）
      if (!name) {
        match = html.match(/<link[^>]+href=["'][^"']*\/([a-zA-Z][\w-]{2,20})(?:-api)?[\/."']/i);
        if (match && match[1] && match[1].length > 2) {
          name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        }
      }

      // 12. 页脚 copyright
      if (!name) {
        match = html.match(/(?:copyright|©|\(c\))\s*(?:\d{4}\s*)?([A-Za-z][\w\s]{2,25}?)(?:\s*[.|,|All])/i);
        if (match && match[1]) name = match[1].trim();
      }

      // 13. 导航栏 navbar-brand
      if (!name) {
        match =
          html.match(/<[^>]+class=["'][^"']*navbar-brand[^"']*["'][^>]*>([^<]+)</i) ||
          html.match(/<a[^>]+class=["'][^"']*(?:logo|brand)[^"']*["'][^>]*>([^<]+)</i);
        if (match && match[1]) name = match[1].replace(/\s+/g, ' ').trim();
      }

      return name;
    };

    // 从 JSON API 响应提取名称（支持 NewAPI、manifest.json 等）
    const extractFromJson = text => {
      try {
        const json = JSON.parse(text);

        // NewAPI /api/status 响应格式
        if (json.data) {
          const d = json.data;
          if (d.system_name) return d.system_name;
          if (d.server_name) return d.server_name;
          if (d.site_name) return d.site_name;
          if (d.name) return d.name;
          if (d.title) return d.title;
        }

        // NewAPI /api/notice 响应
        if (json.message && typeof json.message === 'string' && json.message.length < 50) {
          return null; // 跳过普通消息
        }

        // manifest.json 字段
        if (json.short_name) return json.short_name;
        if (json.name) return json.name;

        // 直接字段
        if (json.system_name) return json.system_name;
        if (json.server_name) return json.server_name;
        if (json.site_name) return json.site_name;
        if (json.title) return json.title;
        if (json.siteName) return json.siteName;
        if (json.appName) return json.appName;
        if (json.app_name) return json.app_name;
        if (json.brand) return json.brand;

        return null;
      } catch (e) {
        return null;
      }
    };

    // 从 URL 提取域名
    const extractFromUrl = url => {
      try {
        const urlObj = new URL(url);
        const host = urlObj.hostname.replace(/^(www|api|v1|v2)\./, '');
        const parts = host.split('.');
        if (parts.length >= 2 && parts[0].length > 1) {
          return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' API';
        }
      } catch (e) {}
      return null;
    };

    // 尝试获取网页标题（超级增强版）
    let siteName = null;
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    };

    // 尝试多个 URL（包括 NewAPI 特有端点）
    const urlObj = new URL(endpoint);
    const urlsToTry = [
      urlObj.origin + '/api/status', // NewAPI 状态接口 ⭐
      urlObj.origin + '/api/notice', // NewAPI 公告接口
      urlObj.origin + '/', // 根域名
      urlObj.origin, // 根域名（无斜杠）
      urlObj.origin + '/manifest.json', // PWA manifest
      urlObj.origin + '/site.webmanifest', // Web manifest
      urlObj.origin + '/docs', // 文档页
      urlObj.origin + '/about', // 关于页
      endpoint, // 原始 URL
    ];

    for (const url of urlsToTry) {
      if (siteName) break;
      try {
        const response = await fetch(url, { method: 'GET', headers, redirect: 'follow' });
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          const text = await response.text();

          if (contentType.includes('json')) {
            // JSON 响应
            siteName = extractFromJson(text);
          } else {
            // HTML 响应
            siteName = extractFromHtml(text);
          }
        }
      } catch (e) {
        console.log('获取失败:', url, e.message);
      }
    }

    // 最后手段：从 URL 提取
    if (!siteName) {
      siteName = extractFromUrl(endpoint);
    }

    // 清理
    if (siteName) {
      siteName = siteName
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      // 过滤无意义的标题
      if (['404', 'error', 'not found', '403', '500', 'forbidden'].some(x => siteName.toLowerCase().includes(x))) {
        siteName = extractFromUrl(endpoint);
      }
      if (siteName && siteName.length > 50) siteName = siteName.substring(0, 47) + '...';
    }

    // 如果还是没获取到，返回提示让用户手动编辑
    if (!siteName) {
      return jsonResponse({ success: false, message: '⚠️ 无法自动获取，请手动编辑名称' }, 200, corsHeaders);
    }

    // 更新黑名单中的站点名称
    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    if (blacklist[endpoint]) {
      blacklist[endpoint].siteName = siteName;
      await redisSet('blacklist_endpoints', JSON.stringify(blacklist));
    }

    return jsonResponse({ success: true, message: '✅ 获取成功: ' + siteName, siteName }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 检测站点名称（不加入黑名单，只保存名称）
 */
async function handleDetectSiteName(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    // 复用 fetch-site-name 的检测逻辑，但保存到 site_names
    const extractFromUrl = url => {
      try {
        const urlObj = new URL(url);
        const host = urlObj.hostname.replace(/^(www|api|v1|v2)\./, '');
        const parts = host.split('.');
        if (parts.length >= 2 && parts[0].length > 1) {
          return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' API';
        }
      } catch (e) {}
      return null;
    };

    // 尝试从 NewAPI /api/status 获取
    let siteName = null;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json,text/html,*/*',
    };

    const urlObj = new URL(endpoint);
    const urlsToTry = [urlObj.origin + '/api/status', urlObj.origin + '/', urlObj.origin + '/manifest.json'];

    for (const url of urlsToTry) {
      if (siteName) break;
      try {
        const response = await fetch(url, { method: 'GET', headers, redirect: 'follow' });
        if (response.ok) {
          const text = await response.text();
          try {
            const json = JSON.parse(text);
            siteName = json.data?.system_name || json.data?.name || json.short_name || json.name || json.title;
          } catch {
            // HTML - 提取 title
            const match = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            if (match && match[1]) siteName = match[1].replace(/\s+/g, ' ').trim();
          }
        }
      } catch (e) {}
    }

    if (!siteName) siteName = extractFromUrl(endpoint);
    if (siteName) {
      siteName = siteName
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (siteName.length > 50) siteName = siteName.substring(0, 47) + '...';
    }

    if (!siteName) {
      return jsonResponse({ success: false, message: '⚠️ 无法自动获取' }, 200, corsHeaders);
    }

    // 保存到 site_names（不是黑名单）
    const siteNamesStr = await redisGet('site_names');
    const siteNames = siteNamesStr ? JSON.parse(siteNamesStr) : {};
    siteNames[endpoint] = { siteName, detectedAt: new Date().toISOString() };
    await redisSet('site_names', JSON.stringify(siteNames));

    return jsonResponse({ success: true, message: '✅ ' + siteName, siteName }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 编辑黑名单
 */
async function handleEditBlacklist(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint, siteName } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 端点不能为空' }, 400, corsHeaders);
    }

    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    if (!blacklist[endpoint]) {
      return jsonResponse({ success: false, message: '❌ 该端点不在黑名单中' }, 404, corsHeaders);
    }

    // 更新站点名称
    blacklist[endpoint].siteName = siteName;

    await redisSet('blacklist_endpoints', JSON.stringify(blacklist));

    return jsonResponse({ success: true, message: '✅ 黑名单已更新' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 批量导入黑名单（支持txt格式）
 * 格式：每行一个，格式为 "站点名称|URL" 或 "站点名称,URL" 或 "站点名称 URL"
 * 也支持纯URL格式（站点名称默认为"未知贩子"）
 */
async function handleBatchImportBlacklist(request, env, corsHeaders) {
  try {
    const { adminKey, content } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!content || !content.trim()) {
      return jsonResponse({ success: false, message: '❌ 导入内容不能为空' }, 400, corsHeaders);
    }

    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    let addedCount = 0;
    let skippedCount = 0;

    for (const line of lines) {
      let siteName = '未知贩子';
      let endpoint = '';

      // 尝试解析格式：站点名称|URL 或 站点名称,URL 或 站点名称\tURL
      const separators = ['|', ',', '\t'];
      let parsed = false;
      for (const sep of separators) {
        if (line.includes(sep)) {
          const parts = line.split(sep).map(p => p.trim());
          if (parts.length >= 2) {
            siteName = parts[0] || '未知贩子';
            endpoint = parts[1];
            parsed = true;
            break;
          }
        }
      }

      // 如果没有分隔符，检查是否是纯URL
      if (!parsed) {
        // 检查是否包含域名特征
        if (line.includes('.') || line.includes('http')) {
          endpoint = line;
        } else {
          continue; // 跳过无效行
        }
      }

      if (!endpoint) continue;

      // 检查是否已存在
      if (blacklist[endpoint]) {
        skippedCount++;
        continue;
      }

      blacklist[endpoint] = {
        endpoint: endpoint,
        siteName: siteName,
        addedAt: new Date().toISOString(),
      };
      addedCount++;
    }

    await redisSet('blacklist_endpoints', JSON.stringify(blacklist));

    return jsonResponse(
      {
        success: true,
        message: `✅ 批量导入完成：新增 ${addedCount} 条，跳过 ${skippedCount} 条重复`,
        added: addedCount,
        skipped: skippedCount,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 导入失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取网页标题 + 完整 Ping 检测（域名信息）
 */
async function handleFetchSiteTitle(request, env, corsHeaders) {
  try {
    const { url } = await request.json();

    if (!url) {
      return jsonResponse({ success: false, title: '', error: 'no url', ping: false }, 200, corsHeaders);
    }

    // 规范化URL
    let baseUrl = url;
    if (!baseUrl.startsWith('http')) {
      baseUrl = 'https://' + baseUrl;
    }

    let urlObj;
    try {
      urlObj = new URL(baseUrl);
    } catch (e) {
      return jsonResponse({ success: false, title: '', error: 'invalid url', ping: false }, 200, corsHeaders);
    }

    const domain = urlObj.hostname;
    let title = '';
    const pingInfo = {
      success: false,
      status: 0,
      latency: 0,
      server: '',
      contentType: '',
      isApi: false,
      hasModels: false,
      modelCount: 0,
      sampleModels: [],
    };

    // 1. 先 Ping 主站获取基本信息
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(urlObj.origin, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html,application/json,*/*',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      pingInfo.latency = Date.now() - startTime;
      pingInfo.success = true;
      pingInfo.status = response.status;
      pingInfo.server = response.headers.get('server') || '';
      pingInfo.contentType = response.headers.get('content-type') || '';

      // 检查是否是 JSON API
      if (pingInfo.contentType.includes('application/json')) {
        pingInfo.isApi = true;
      }

      // 尝试读取内容获取标题
      if (response.ok) {
        const text = await response.text();

        // HTML 标题提取（多种方式）
        if (pingInfo.contentType.includes('text/html')) {
          // 1. <title> 标签
          const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();

          // 2. og:title
          if (!title) {
            const ogMatch =
              text.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
              text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
            if (ogMatch && ogMatch[1]) title = ogMatch[1].trim();
          }

          // 3. twitter:title
          if (!title) {
            const twMatch = text.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
            if (twMatch && twMatch[1]) title = twMatch[1].trim();
          }

          // 4. <meta name="title">
          if (!title) {
            const metaMatch = text.match(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i);
            if (metaMatch && metaMatch[1]) title = metaMatch[1].trim();
          }

          // 5. <h1> 标签
          if (!title) {
            const h1Match = text.match(/<h1[^>]*>([^<]+)<\/h1>/i);
            if (h1Match && h1Match[1]) title = h1Match[1].trim();
          }

          // 6. description 作为后备
          if (!title) {
            const descMatch = text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
            if (descMatch && descMatch[1] && descMatch[1].length < 50) title = descMatch[1].trim();
          }
        }

        // JSON 响应中提取 (有些 API 站点返回 JSON)
        if (!title && pingInfo.contentType.includes('application/json')) {
          try {
            const json = JSON.parse(text);
            title = json.title || json.name || json.siteName || json.site_name || '';
          } catch (e) {
            // JSON 解析失败
          }
        }
      }
    } catch (e) {
      console.log('❌ 主站请求失败:', e.message);
    }

    // 2. 检测 /v1/models API 端点
    try {
      const modelsUrl = urlObj.origin + '/v1/models';
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);

      const modelsRes = await fetch(modelsUrl, {
        headers: { Accept: 'application/json' },
        signal: controller2.signal,
      });

      clearTimeout(timeoutId2);

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        if (modelsData.data && Array.isArray(modelsData.data)) {
          pingInfo.hasModels = true;
          pingInfo.isApi = true;
          pingInfo.modelCount = modelsData.data.length;
          pingInfo.sampleModels = modelsData.data.slice(0, 5).map(m => m.id || m.name || 'unknown');
        }
      }
    } catch (e) {
      // /v1/models 不存在或需要认证
    }

    // 3. 如果主站没标题，尝试多个 URL 变体
    if (!title) {
      const urlVariants = [];

      // 去掉常见子域名前缀
      if (domain.startsWith('api.')) {
        urlVariants.push(urlObj.origin.replace('://api.', '://www.'));
        urlVariants.push(urlObj.origin.replace('://api.', '://'));
      } else if (domain.startsWith('pro.')) {
        urlVariants.push(urlObj.origin.replace('://pro.', '://www.'));
        urlVariants.push(urlObj.origin.replace('://pro.', '://'));
      } else if (domain.startsWith('app.')) {
        urlVariants.push(urlObj.origin.replace('://app.', '://www.'));
        urlVariants.push(urlObj.origin.replace('://app.', '://'));
      } else if (!domain.startsWith('www.')) {
        // 没有子域名，尝试加 www
        urlVariants.push(urlObj.protocol + '//www.' + domain);
      }

      // 去重
      const uniqueVariants = [...new Set(urlVariants)].filter(u => u !== urlObj.origin);

      for (const variantUrl of uniqueVariants) {
        if (title) break;
        try {
          const controller3 = new AbortController();
          const timeoutId3 = setTimeout(() => controller3.abort(), 4000);

          const variantRes = await fetch(variantUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              Accept: 'text/html',
            },
            signal: controller3.signal,
            redirect: 'follow',
          });

          clearTimeout(timeoutId3);

          if (variantRes.ok) {
            const html = await variantRes.text();
            // 尝试多种方式提取
            let match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (match && match[1]) {
              title = match[1].trim();
            }
            if (!title) {
              match = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
              if (match && match[1]) title = match[1].trim();
            }
            if (!title) {
              match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              if (match && match[1]) title = match[1].trim();
            }
          }
        } catch (e) {
          // 变体 URL 请求失败，继续尝试下一个
        }
      }
    }

    // 清理标题
    if (title) {
      title = title.replace(/[-–—|·].*$/, '').trim();
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    }

    return jsonResponse(
      {
        success: !!title,
        title: title || '',
        domain: domain,
        ping: pingInfo.success,
        pingStatus: pingInfo.status,
        pingInfo: pingInfo,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, title: '', error: error.message, ping: false }, 200, corsHeaders);
  }
}

/**
 * 合并重复的黑名单条目（同主域名的合并为主域名）
 */
async function handleMergeBlacklist(request, env, corsHeaders) {
  try {
    const { adminKey, preview } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};

    if (Object.keys(blacklist).length === 0) {
      return jsonResponse({ success: false, message: '❌ 黑名单为空' }, 400, corsHeaders);
    }

    // 检测是否为 IP 地址
    function isIPAddress(str) {
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) || str === 'localhost';
    }

    // 提取主域名的辅助函数
    function getRootDomain(domain) {
      // IP 地址不合并，保持原样
      if (isIPAddress(domain)) {
        return domain;
      }
      const parts = domain.toLowerCase().split('.');
      // 处理常见二级域名后缀
      const secondLevelTlds = ['com', 'net', 'org', 'co', 'io', 'ai', 'me', 'cc', 'work', 'icu', 'top', 'xyz', 'dev'];
      if (parts.length >= 3 && secondLevelTlds.includes(parts[parts.length - 1])) {
        return parts.slice(-2).join('.');
      }
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return domain;
    }

    // 按主域名分组
    const domainGroups = {};
    for (const [endpoint, info] of Object.entries(blacklist)) {
      const root = getRootDomain(endpoint);
      if (!domainGroups[root]) {
        domainGroups[root] = [];
      }
      domainGroups[root].push({ endpoint, info });
    }

    // 找出需要合并的组（条目数 > 1 的组）
    const mergeGroups = [];
    let deletedCount = 0;

    for (const [root, entries] of Object.entries(domainGroups)) {
      if (entries.length > 1) {
        mergeGroups.push({
          target: root,
          sources: entries.map(e => e.endpoint),
        });
        deletedCount += entries.length - 1;
      }
    }

    // 预览模式：只返回预览结果
    if (preview) {
      return jsonResponse(
        {
          success: true,
          mergeGroups: mergeGroups,
          deleteCount: deletedCount,
        },
        200,
        corsHeaders,
      );
    }

    // 执行合并
    const newBlacklist = {};

    for (const [root, entries] of Object.entries(domainGroups)) {
      // 合并站点名称（取最长非空的）
      let siteName = '';
      let earliestTime = entries[0].info.addedAt;
      for (const e of entries) {
        if (e.info.siteName && e.info.siteName.length > (siteName || '').length) {
          siteName = e.info.siteName;
        }
        if (e.info.addedAt && (!earliestTime || new Date(e.info.addedAt) < new Date(earliestTime))) {
          earliestTime = e.info.addedAt;
        }
      }

      // 使用主域名作为 key
      newBlacklist[root] = {
        endpoint: root,
        siteName: siteName || root,
        addedAt: earliestTime,
        mergedFrom: entries.length > 1 ? entries.map(e => e.endpoint) : undefined,
      };
    }

    await redisSet('blacklist_endpoints', JSON.stringify(newBlacklist));

    const beforeCount = Object.keys(blacklist).length;
    const afterCount = Object.keys(newBlacklist).length;

    return jsonResponse(
      {
        success: true,
        message: `✅ 合并完成！原 ${beforeCount} 条 → ${afterCount} 条（删除 ${deletedCount} 条重复）`,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 合并失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 合并重复的白名单条目（同主域名的合并为主域名）
 */
async function handleMergeWhitelist(request, env, corsHeaders) {
  try {
    const { adminKey, preview } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};

    if (Object.keys(whitelist).length === 0) {
      return jsonResponse({ success: false, message: '❌ 白名单为空' }, 400, corsHeaders);
    }

    // 从 URL 提取 hostname
    function extractHostname(url) {
      try {
        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        return new URL(fullUrl).hostname.toLowerCase();
      } catch (e) {
        return url.split('/')[0].toLowerCase();
      }
    }

    // 检测是否为 IP 地址
    function isIPAddress(str) {
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) || str === 'localhost';
    }

    // 提取主域名
    function getRootDomain(hostname) {
      // IP 地址不合并，保持原样
      if (isIPAddress(hostname)) {
        return hostname;
      }
      const parts = hostname.split('.');
      const secondLevelTlds = ['com', 'net', 'org', 'co', 'io', 'ai', 'me', 'cc', 'work', 'icu', 'top', 'xyz', 'dev'];
      if (parts.length >= 3 && secondLevelTlds.includes(parts[parts.length - 1])) {
        return parts.slice(-2).join('.');
      }
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    }

    // 按主域名分组（所有子域名归到同一组）
    const domainGroups = {};
    for (const [endpoint, info] of Object.entries(whitelist)) {
      const hostname = extractHostname(endpoint);
      const root = getRootDomain(hostname);
      if (!domainGroups[root]) {
        domainGroups[root] = [];
      }
      domainGroups[root].push({ endpoint, info, hostname });
    }

    // 找出需要合并的组（条目数 > 1 的组）
    const mergeGroups = [];
    let deletedCount = 0;

    for (const [root, entries] of Object.entries(domainGroups)) {
      if (entries.length > 1) {
        mergeGroups.push({
          target: root,
          sources: entries.map(e => e.endpoint),
        });
        deletedCount += entries.length - 1;
      }
    }

    // 预览模式：只返回预览结果
    if (preview) {
      return jsonResponse(
        {
          success: true,
          mergeGroups: mergeGroups,
          deleteCount: deletedCount,
        },
        200,
        corsHeaders,
      );
    }

    // 执行合并
    const newWhitelist = {};

    for (const [root, entries] of Object.entries(domainGroups)) {
      // 合并站点名（取最长非空的）
      let siteName = '';
      let earliestTime = entries[0].info.addedAt;
      for (const e of entries) {
        if (e.info.siteName && e.info.siteName.length > (siteName || '').length) {
          siteName = e.info.siteName;
        }
        if (e.info.addedAt && (!earliestTime || new Date(e.info.addedAt) < new Date(earliestTime))) {
          earliestTime = e.info.addedAt;
        }
      }

      // 使用主域名作为 key
      newWhitelist[root] = {
        endpoint: root,
        siteName: siteName || root,
        addedAt: earliestTime,
        mergedFrom: entries.length > 1 ? entries.map(e => e.endpoint) : undefined,
      };

      if (entries.length > 1) {
        deletedCount += entries.length - 1;
      }
    }

    await redisSet('whitelist_endpoints', JSON.stringify(newWhitelist));

    const beforeCount = Object.keys(whitelist).length;
    const afterCount = Object.keys(newWhitelist).length;

    return jsonResponse(
      {
        success: true,
        message: `✅ 合并完成！原 ${beforeCount} 条 → ${afterCount} 条（删除 ${deletedCount} 条重复）`,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 合并失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 切换端点的贩子标签
 */
async function handleToggleReseller(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint, isReseller } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 请提供端点' }, 400, corsHeaders);
    }

    // 获取模型记录
    const reportsStr = await redisGet('model_reports');
    const reports = reportsStr ? JSON.parse(reportsStr) : {};

    if (!reports[endpoint]) {
      return jsonResponse({ success: false, message: '❌ 找不到该端点的记录' }, 404, corsHeaders);
    }

    // 更新贩子标签
    reports[endpoint].isReseller = isReseller;

    await redisSet('model_reports', JSON.stringify(reports));

    return jsonResponse(
      {
        success: true,
        message: isReseller ? '✅ 已标记为贩子' : '✅ 已取消贩子标签',
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 切换端点的公益站标签
 */
async function handleTogglePublic(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint, isPublic } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 请提供端点' }, 400, corsHeaders);
    }

    const reportsStr = await redisGet('model_reports');
    const reports = reportsStr ? JSON.parse(reportsStr) : {};

    if (!reports[endpoint]) {
      return jsonResponse({ success: false, message: '❌ 找不到该端点的记录' }, 404, corsHeaders);
    }

    reports[endpoint].isPublic = isPublic;

    await redisSet('model_reports', JSON.stringify(reports));

    return jsonResponse(
      {
        success: true,
        message: isPublic ? '✅ 已标记为公益站' : '✅ 已取消公益标签',
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 操作失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取封禁提示消息
 */
async function handleGetBlockMessage(request, env, corsHeaders) {
  try {
    const message = await redisGet('block_message');
    return jsonResponse(
      {
        success: true,
        data: message || '', // 返回 data 字段供前端使用
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, data: '' }, 500, corsHeaders);
  }
}

/**
 * 设置封禁提示消息
 */
async function handleSetBlockMessage(request, env, corsHeaders) {
  try {
    const { adminKey, message } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!message) {
      return jsonResponse({ success: false, message: '❌ 请输入封禁提示内容' }, 400, corsHeaders);
    }

    await redisSet('block_message', message);
    return jsonResponse({ success: true, message: '✅ 封禁提示已保存' }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 保存失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 接收模型列表上报
 */
async function handleReportModels(request, env, corsHeaders) {
  try {
    const { endpoint, models, timestamp } = await request.json();

    if (!endpoint || !models) {
      return jsonResponse({ success: false }, 200, corsHeaders);
    }

    // 读取现有记录
    const reportsStr = await redisGet('model_reports');
    const reports = reportsStr ? JSON.parse(reportsStr) : {};

    // 更新或新增记录
    reports[endpoint] = {
      models: models,
      lastReport: timestamp || new Date().toISOString(),
      reportCount: (reports[endpoint]?.reportCount || 0) + 1,
    };

    // 只保留最近100条记录
    const keys = Object.keys(reports);
    if (keys.length > 100) {
      const sortedKeys = keys.sort(
        (a, b) => new Date(reports[b].lastReport).getTime() - new Date(reports[a].lastReport).getTime(),
      );
      const newReports = {};
      sortedKeys.slice(0, 100).forEach(k => (newReports[k] = reports[k]));
      await redisSet('model_reports', JSON.stringify(newReports));
    } else {
      await redisSet('model_reports', JSON.stringify(reports));
    }

    return jsonResponse({ success: true }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false }, 200, corsHeaders);
  }
}

/**
 * 获取模型上报记录（管理员）
 */
async function handleGetModelReports(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const reportsStr = await redisGet('model_reports');
    const reports = reportsStr ? JSON.parse(reportsStr) : {};

    // 转换为数组格式
    const data = Object.entries(reports)
      .map(([endpoint, info]) => ({
        endpoint,
        models: info.models,
        lastReport: info.lastReport,
        reportCount: info.reportCount,
        isReseller: info.isReseller || false,
        isPublic: info.isPublic || false,
      }))
      .sort((a, b) => new Date(b.lastReport).getTime() - new Date(a.lastReport).getTime());

    return jsonResponse({ success: true, data }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 获取失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取设备追踪数据（管理员）
 */
async function handleGetDeviceTracks(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const tracksStr = await redisGet('device_tracks');
    const tracks = tracksStr ? JSON.parse(tracksStr) : {};

    // 转换为数组格式，按最后活跃时间排序，分配友好名称
    const data = Object.entries(tracks)
      .map(([id, info]) => ({
        id,
        firstSeen: info.firstSeen,
        lastSeen: info.lastSeen,
        endpoints: info.endpoints || [],
      }))
      .filter(t => t.endpoints.length > 1) // 只显示使用过多个端点的
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
      .map((t, idx) => ({ ...t, name: 'maomao' + (idx + 1) })); // 分配友好名称

    return jsonResponse({ success: true, data }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 获取失败: ' + error.message }, 500, corsHeaders);
  }
}

/**
 * 获取端点详情（管理员）- 包含验证历史、模型列表等
 */
async function handleGetEndpointDetail(request, env, corsHeaders) {
  try {
    const { adminKey, endpoint } = await request.json();

    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!endpoint) {
      return jsonResponse({ success: false, message: '❌ 请提供端点地址' }, 400, corsHeaders);
    }

    // 获取端点基本信息
    const endpointsStr = await redisGet('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};
    const endpointInfo = endpoints[endpoint] || null;

    // 获取模型记录
    const reportsStr = await redisGet('model_reports');
    const reports = reportsStr ? JSON.parse(reportsStr) : {};
    const modelInfo = reports[endpoint] || null;

    // 获取黑名单状态
    const blacklistStr = await redisGet('blacklist_endpoints');
    const blacklist = blacklistStr ? JSON.parse(blacklistStr) : {};
    let isBlacklisted = false;
    let blacklistInfo = null;
    for (const key of Object.keys(blacklist)) {
      if (endpoint.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(endpoint.toLowerCase())) {
        isBlacklisted = true;
        blacklistInfo = blacklist[key];
        break;
      }
    }

    // 获取禁用状态（存储为对象）
    const bannedStr = await redisGet('banned_endpoints');
    const banned = bannedStr ? JSON.parse(bannedStr) : {};
    const isBanned = !!banned[endpoint];

    // 获取白名单状态（存储为对象）
    const whitelistStr = await redisGet('whitelist_endpoints');
    const whitelist = whitelistStr ? JSON.parse(whitelistStr) : {};
    const isWhitelisted = !!whitelist[endpoint];

    // 获取可疑状态（存储为对象）
    const suspiciousStr = await redisGet('suspicious_endpoints');
    const suspicious = suspiciousStr ? JSON.parse(suspiciousStr) : {};
    const isSuspicious = !!suspicious[endpoint];

    const data = {
      endpoint,
      // 基本信息
      firstAccess: endpointInfo?.firstAccess || null,
      lastAccess: endpointInfo?.lastAccess || null,
      accessCount: endpointInfo?.accessCount || 0,
      // 验证历史
      verifyHistory: endpointInfo?.verifyHistory || [],
      // 模型列表
      models: modelInfo?.models || [],
      lastModelReport: modelInfo?.lastReport || null,
      modelReportCount: modelInfo?.reportCount || 0,
      isReseller: modelInfo?.isReseller || false,
      isPublic: modelInfo?.isPublic || false,
      // 状态
      isBanned,
      isBlacklisted,
      blacklistInfo,
      isWhitelisted,
      isSuspicious,
    };

    return jsonResponse({ success: true, data }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 获取失败: ' + error.message }, 500, corsHeaders);
  }
}
