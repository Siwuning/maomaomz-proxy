/**
 * 🔐 授权验证模块 - 简化版（带API端点追踪）
 * 作者: mzrodyu
 * ⚠️ 商业化死全家，贩子死全家 ⚠️
 */

// 🔥 Cloudflare Worker 授权后端地址
const AUTH_API_URL = 'https://maomaomz-auth.baobaoyu999727272.workers.dev';

// LocalStorage 键名
const STORAGE_KEY = 'maomaomz_auth_code';
const STORAGE_VERIFIED_KEY = 'maomaomz_auth_verified';

/**
 * 获取当前使用的 API 端点（用于追踪商业化倒卖）
 */
function getCurrentApiEndpoint(): string {
  try {
    // 尝试从 SillyTavern 配置中获取 API 端点
    let apiUrl = (window as any).api_server || '';
    let apiType = (window as any).main_api || 'unknown';

    // 🔥 处理 apiType 如果是 DOM 元素
    if (apiType && typeof apiType === 'object') {
      if ('value' in apiType) {
        apiType = apiType.value || 'unknown';
      } else {
        apiType = 'unknown';
      }
    }
    apiType = String(apiType || 'unknown').trim();

    // 🔥 先检查是否是对象类型（在转换为字符串之前）
    if (apiUrl && typeof apiUrl === 'object') {
      console.log('🔍 检测到 API端点是对象类型:', apiUrl);

      // 如果是 DOM 元素，尝试获取其 value
      if ('value' in apiUrl) {
        console.log('🔍 从 DOM 元素获取 value 属性');
        apiUrl = apiUrl.value || '';
      }
      // 如果还是对象，转为空字符串
      else {
        console.warn('⚠️ API端点是对象但无 value 属性，设为空');
        apiUrl = '';
      }
    }

    // 确保是字符串并清理
    apiUrl = String(apiUrl || '').trim();

    // 过滤掉无效值（包括字符串化后的对象标识）
    if (apiUrl.startsWith('[object ') || apiUrl === '' || apiUrl === 'undefined' || apiUrl === 'null') {
      console.log('🔄 API端点无效，使用 API 类型:', apiType);
      return apiType;
    }

    // 只返回域名部分，不要完整URL（保护隐私）
    try {
      const url = new URL(apiUrl);
      return url.hostname || apiUrl;
    } catch {
      // 如果不是有效的URL，直接返回（可能是类型名）
      return apiUrl;
    }
  } catch (error) {
    console.error('❌ 获取API端点失败:', error);
    return 'unknown';
  }
}

/**
 * 验证授权码（带API端点追踪）
 */
async function verifyAuthCode(code: string): Promise<{ valid: boolean; message: string }> {
  try {
    // 获取当前使用的 API 端点
    const apiEndpoint = getCurrentApiEndpoint();

    const trimmedCode = code.trim().toUpperCase();
    console.log('🔐 正在验证授权码...');
    console.log('📝 原始授权码:', code);
    console.log('📝 处理后授权码:', trimmedCode);
    console.log('🌐 API端点:', apiEndpoint);

    const requestBody = {
      code: trimmedCode,
      apiEndpoint: apiEndpoint,
      timestamp: new Date().toISOString(),
    };

    console.log('📤 发送请求:', JSON.stringify(requestBody, null, 2));

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
          <button
            id="authCancelBtn"
            style="
              padding: 14px 24px;
              background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
              border: none;
              border-radius: 12px;
              color: #fff;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 16px rgba(107, 114, 128, 0.3);
            "
          >
            ❌ 取消
          </button>
        </div>
        <p style="
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          line-height: 1.5;
        ">
          没有授权码？<br>
          请访问我的 Discord 频道获取今日授权码
        </p>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const input = dialog.querySelector('#authCodeInput') as HTMLInputElement;
    const submitBtn = dialog.querySelector('#authSubmitBtn') as HTMLButtonElement;
    const cancelBtn = dialog.querySelector('#authCancelBtn') as HTMLButtonElement;

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

    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.transform = 'translateY(-2px)';
      cancelBtn.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.5)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.transform = 'translateY(0)';
      cancelBtn.style.boxShadow = '0 4px 16px rgba(107, 114, 128, 0.3)';
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
      document.body.removeChild(overlay);
      resolve(code);
    };

    submitBtn.addEventListener('click', handleSubmit);
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    });

    // 取消按钮事件
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(null);
    });
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

  // 🔥 每次都重新验证，不使用时间缓存
  if (savedCode) {
    console.log('📋 找到已保存的授权码，重新验证中...');

    try {
      const result = await verifyAuthCode(savedCode);

      if (result.valid) {
        console.log('✅ 授权验证成功！');
        localStorage.setItem(STORAGE_VERIFIED_KEY, 'true');

        // 短暂显示成功消息
        setTimeout(() => {
          (window as any).toastr?.success('✅ 授权验证成功！猫猫欢迎你！🐱', '', {
            timeOut: 2000,
          });
        }, 300);

        return true;
      } else {
        console.warn('⚠️ 授权码已失效，需要重新输入');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_VERIFIED_KEY);
      }
    } catch (error) {
      console.error('❌ 验证授权码时出错:', error);
      // 验证出错，清除旧数据，继续弹窗流程
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_VERIFIED_KEY);
    }
  }

  // 需要用户输入授权码 - 必须弹出对话框
  console.log('🔐 需要用户输入授权码，显示授权对话框...');
  console.log('📊 当前状态:', {
    hasSavedCode: !!savedCode,
    lastVerifyTime: lastVerifyTime ? new Date(parseInt(lastVerifyTime)).toISOString() : 'never',
    timeSinceLastVerify: lastVerifyTime
      ? `${Math.floor((Date.now() - parseInt(lastVerifyTime)) / (60 * 60 * 1000))} hours`
      : 'N/A',
  });

  let attempts = 0;
  const MAX_ATTEMPTS = 5; // 增加尝试次数

  while (attempts < MAX_ATTEMPTS) {
    // 🔥 强制显示授权对话框
    console.log(`🎯 准备显示授权对话框 (尝试 ${attempts + 1}/${MAX_ATTEMPTS})...`);
    const code = await showAuthDialog();
    console.log('📝 用户输入结果:', code ? '已输入授权码' : '用户取消');

    if (!code) {
      // 用户取消 - 再次提示
      console.error('❌ 用户取消了授权');

      const confirmCancel = confirm(
        '⚠️ 未授权无法使用插件\n\n是否放弃授权？\n\n点击"确定"将禁用插件\n点击"取消"继续输入授权码',
      );

      if (confirmCancel) {
        (window as any).toastr?.error('❌ 授权已取消，插件已被禁用', '', {
          timeOut: 0,
          extendedTimeOut: 0,
        });
        return false;
      } else {
        // 用户选择继续，重新显示对话框
        continue;
      }
    }

    attempts++;
    console.log(`🔄 验证授权码... (尝试 ${attempts}/${MAX_ATTEMPTS})`);

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
