import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== Upstash Redis 配置 ==========
const UPSTASH_REDIS_REST_URL = 'https://pro-piglet-36199.upstash.io';
const UPSTASH_REDIS_REST_TOKEN = 'AY1nAAIncDI0ODNmMmM0MzhiODA0YjUzYTc4OTk0NjFhMjRlNTY2MnAyMzYxOTk';

/**
 * Upstash Redis REST API 辅助函数
 */
async function redisGet(key: string) {
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/GET/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await response.json();
  return data.result;
}

async function redisIncr(key: string) {
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/INCR/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await response.json();
  return data.result;
}

serve(async req => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 解析请求
    const { code, apiEndpoint, timestamp } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ valid: false, message: '❌ 授权码不能为空' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取 IP 和地理位置
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const country = req.headers.get('cf-ipcountry') || 'unknown';

    // 清理 API 端点
    let cleanApiEndpoint = 'unknown';
    if (apiEndpoint && typeof apiEndpoint === 'string' && !apiEndpoint.startsWith('[object ')) {
      cleanApiEndpoint = apiEndpoint.trim() || 'unknown';
    }

    // 🔥 从 Upstash Redis 获取当前有效的授权码
    const currentCode = await redisGet('current_code');

    if (!currentCode) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: '❌ 系统暂未设置授权码\n\n请联系管理员',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 验证授权码（不区分大小写）
    const isValid = code.toUpperCase() === currentCode.toUpperCase();

    if (!isValid) {
      // 记录失败统计
      try {
        await redisIncr('stats:failed');
      } catch (e) {
        console.warn('记录失败统计出错:', e);
      }

      return new Response(
        JSON.stringify({
          valid: false,
          message: '❌ 授权码错误或已过期\n\n📢 请前往 Discord 查看今日最新授权码！\n⚠️ 商业化死全家，贩子死全家',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 验证成功：记录统计
    try {
      await redisIncr('stats:success');
    } catch (e) {
      console.warn('记录成功统计出错:', e);
    }

    return new Response(
      JSON.stringify({
        valid: true,
        message: '✅ 授权验证通过！猫猫欢迎你！🐱',
        code: currentCode,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('验证错误:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: '❌ 服务器错误: ' + (error as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
