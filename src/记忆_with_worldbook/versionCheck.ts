/**
 * 🔄 版本检测模块
 * 作者: mzrodyu
 */

import packageJson from '../../package.json';

// 当前版本号（从 package.json 读取）
export const CURRENT_VERSION = packageJson.version;

// 当前构建的 commit hash（构建时注入）
declare const __GIT_COMMIT_HASH__: string;
export const CURRENT_COMMIT = typeof __GIT_COMMIT_HASH__ !== 'undefined' ? __GIT_COMMIT_HASH__ : 'unknown';

// GitHub 仓库信息
const GITHUB_REPO = 'mzrodyu/maomaomz';
const GITHUB_API_BASE = 'https://api.github.com';

// LocalStorage 键名
const LAST_CHECK_KEY = 'maomaomz_last_version_check';
const IGNORED_COMMIT_KEY = 'maomaomz_ignored_commit';

// 防止重复检查的标志
let isCheckingInProgress = false;

/**
 * 版本比较
 * 返回: 1 表示 v1 > v2, -1 表示 v1 < v2, 0 表示相等
 */
function compareVersions(v1: string, v2: string): number {
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

/**
 * 从 GitHub API 获取最新的 commit hash
 */
async function fetchLatestCommit(): Promise<{ commit: string; message: string } | null> {
  const apiSources = [
    {
      name: 'GitHub API',
      url: `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/commits/main?t=${Date.now()}`,
    },
    {
      name: 'ghproxy (国内加速)',
      url: `https://ghproxy.com/${GITHUB_API_BASE}/repos/${GITHUB_REPO}/commits/main?t=${Date.now()}`,
    },
  ];

  for (const source of apiSources) {
    try {
      console.log(`🔍 正在从 ${source.name} 获取最新 commit...`);

      const response = await fetch(source.url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ ${source.name} 请求失败 (${response.status})`);
        continue;
      }

      const data = await response.json();
      const shortHash = data.sha?.substring(0, 7) || 'unknown';
      const message = data.commit?.message?.split('\n')[0] || '无描述';

      console.log(`✅ 从 ${source.name} 成功获取 commit: ${shortHash}`);

      return {
        commit: shortHash,
        message: message,
      };
    } catch (error: any) {
      console.warn(`⚠️ ${source.name} 请求失败:`, error.message || error);
      continue;
    }
  }

  console.error('❌ 所有 API 源都无法访问');
  return null;
}

/**
 * 从 GitHub API 获取远程 manifest.json 的版本号（无 CDN 缓存）
 */
async function fetchRemoteVersion(): Promise<string | null> {
  // 优先使用 GitHub API（无缓存，实时获取）
  const apiUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/manifest.json`;

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // GitHub API 返回 base64 编码的内容
      if (data.content) {
        const content = atob(data.content.replace(/\n/g, ''));
        const manifest = JSON.parse(content);
        console.log('📡 GitHub API 获取版本成功:', manifest.version);
        return manifest.version || null;
      }
    } else if (response.status === 403) {
      // GitHub API 限流，继续尝试 CDN 备用源
      console.warn('⚠️ GitHub API 限流 (403)，尝试 CDN 备用源');
    }
  } catch (e) {
    console.warn('GitHub API 获取失败，尝试备用源:', e);
  }

  // 备用：使用 CDN（可能有缓存）
  const fallbackUrls = [
    `https://raw.githubusercontent.com/${GITHUB_REPO}/main/manifest.json?_=${Date.now()}`,
    `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@latest/manifest.json`,
  ];

  for (const url of fallbackUrls) {
    try {
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        return data.version || null;
      }
    } catch (e) {
      console.warn('获取远程版本失败:', e);
    }
  }
  return null;
}

/**
 * 检查更新（基于版本号）
 * @param force 是否强制检查（忽略检查间隔）
 */
export async function checkForUpdates(force: boolean = false): Promise<{
  hasUpdate: boolean;
  latestVersion?: string;
  latestCommit?: string;
  currentVersion: string;
  currentCommit: string;
  updateUrl?: string;
  notes?: string;
} | null> {
  try {
    // 每次加载都检测（CDN 不限流）

    // 直接从 CDN 获取远程版本号（不调用 GitHub API，避免限流）
    const remoteVersion = await fetchRemoteVersion();

    if (!remoteVersion) {
      console.warn('⚠️ 无法获取远程版本信息');
      return null;
    }

    // 比较版本号（只有远程版本更高才算有更新）
    let hasUpdate = false;
    if (compareVersions(remoteVersion, CURRENT_VERSION) > 0) {
      hasUpdate = true;
      console.log(`📌 发现新版本: 本地 ${CURRENT_VERSION} → 远程 ${remoteVersion}`);
    } else {
      console.log(`✅ 已是最新版本: ${CURRENT_VERSION}（远程: ${remoteVersion}）`);
    }

    return {
      hasUpdate,
      latestVersion: remoteVersion,
      latestCommit: remoteVersion, // 用版本号代替 commit
      currentVersion: CURRENT_VERSION,
      currentCommit: CURRENT_COMMIT,
      updateUrl: `https://github.com/${GITHUB_REPO}`,
      notes: hasUpdate ? `新版本: ${remoteVersion}\n\n本地版本: ${CURRENT_VERSION}` : `已是最新版本 ${CURRENT_VERSION}`,
    };
  } catch (error) {
    console.error('❌ 检查更新失败:', error);
    return null;
  }
}

/**
 * 显示更新对话框
 * @param forceUpdate 是否强制更新（不允许跳过）
 */
export function showUpdateDialog(
  updateInfo: {
    latestVersion: string;
    latestCommit?: string;
    currentVersion: string;
    currentCommit?: string;
    updateUrl: string;
    notes: string;
  },
  forceUpdate: boolean = false,
): boolean {
  // 🔧 移除之前有问题的"自动刷新"逻辑
  // 之前的逻辑会导致：用户点击更新 → 页面刷新 → 检测到 lastUpdateAttempt → 又刷新（不显示弹窗）
  // 现在改为：只清理旧的标记，不自动刷新
  try {
    // 清理可能残留的旧标记
    const forceRefreshCount = parseInt(localStorage.getItem('maomaomz_force_refresh_count') || '0', 10);
    if (forceRefreshCount > 0) {
      console.log('🧹 清理残留的刷新计数器');
      localStorage.removeItem('maomaomz_force_refresh_count');
    }
  } catch (e) {
    console.warn('清理 localStorage 失败:', e);
  }

  // 检查跳过时间
  const skipUntil = localStorage.getItem('maomaomz_skip_update_until');
  if (skipUntil && Date.now() < parseInt(skipUntil, 10)) {
    console.log('⏰ 在跳过时间内，不显示更新提示');
    return false; // 返回 false 表示没有显示弹窗
  }

  const dialogHtml = `
    <div id="maomaomz-update-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 10, 20, 0.95);
      backdrop-filter: blur(8px);
      z-index: 9999998 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    ">
      <div id="maomaomz-update-dialog" style="
        background: #12121a;
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 16px;
        padding: 32px;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 0 60px rgba(139, 92, 246, 0.15);
        z-index: 9999999 !important;
        animation: slideUp 0.4s ease-out;
      ">
        <!-- 顶部 Logo -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 28px;">
          <div style="font-size: 32px;">🐱</div>
          <div>
            <div style="color: #fff; font-size: 18px; font-weight: 600;">猫猫的小破烂</div>
            <div style="color: #10b981; font-size: 12px;">● 有新版本</div>
          </div>
        </div>

        <!-- 版本卡片 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <div style="
            background: linear-gradient(135deg, #1e1e2e 0%, #16161f 100%);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          ">
            <div style="color: #666; font-size: 11px; margin-bottom: 8px;">当前版本</div>
            <div style="color: #fff; font-size: 28px; font-weight: 700;">${updateInfo.currentVersion}</div>
          </div>
          <div style="
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          ">
            <div style="color: #a78bfa; font-size: 11px; margin-bottom: 8px;">最新版本</div>
            <div style="color: #c4b5fd; font-size: 28px; font-weight: 700;">${updateInfo.latestVersion}</div>
          </div>
        </div>

        <!-- 警告条 -->
        <div style="
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-left: 3px solid #ef4444;
          border-radius: 0 8px 8px 0;
          padding: 12px 16px;
          margin-bottom: 24px;
        ">
          <div style="color: #fca5a5; font-size: 12px; font-weight: 500;">
            ⚠️ 本插件免费提供，禁止倒卖
          </div>
        </div>

        <!-- 按钮组 -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="maomaomz-update-now" style="
            width: 100%;
            padding: 14px 20px;
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            border: none;
            border-radius: 10px;
            color: #fff;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          " onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-1px)';" onmouseout="this.style.opacity='1'; this.style.transform='';">
            <span style="font-size: 16px;">🚀</span> 立即更新
          </button>
          <button id="maomaomz-refresh-only" style="
            width: 100%;
            padding: 12px 20px;
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 10px;
            color: #a78bfa;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          " onmouseover="this.style.background='rgba(139, 92, 246, 0.15)';" onmouseout="this.style.background='rgba(139, 92, 246, 0.1)';">
            🔄 已手动更新？刷新页面
          </button>
          ${
            !forceUpdate
              ? `<button id="maomaomz-skip-update" style="
            width: 100%;
            padding: 10px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: #666;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
          " onmouseover="this.style.borderColor='rgba(255,255,255,0.2)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';">
            ⏰ 稍后提醒
          </button>`
              : ''
          }
        </div>
        ${forceUpdate ? '<p style="color: #ef4444; font-size: 11px; text-align: center; margin-top: 14px;">🚫 必须更新才能继续使用</p>' : ''}
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;

  // 添加到页面
  document.body.insertAdjacentHTML('beforeend', dialogHtml);

  // 🔥 强制模式：阻止关闭弹窗
  if (forceUpdate) {
    // 阻止 ESC 键
    const blockEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', blockEscape, true);

    // 防止弹窗被删除
    const observer = new MutationObserver(() => {
      if (!document.getElementById('maomaomz-update-overlay')) {
        document.body.insertAdjacentHTML('beforeend', dialogHtml);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 定时检查弹窗是否被隐藏
    setInterval(() => {
      const overlay = document.getElementById('maomaomz-update-overlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
      }
    }, 500);
  }

  // 绑定事件
  document.getElementById('maomaomz-update-now')?.addEventListener('click', async () => {
    const TH = (window as any).TavernHelper;
    const updateButton = document.getElementById('maomaomz-update-now') as HTMLButtonElement;

    // 🔒 记录更新尝试时间，防止无限循环
    localStorage.setItem('maomaomz_last_update_attempt', Date.now().toString());

    // 更新按钮状态
    if (updateButton) {
      updateButton.disabled = true;
      updateButton.innerHTML = '⏳ 正在更新...';
      updateButton.style.opacity = '0.7';
    }

    (window as any).toastr?.info('🔄 正在更新插件，请稍候...', '更新中');

    try {
      let updateSuccess = false;

      // 方法1: TavernHelper API
      if (TH?.updateExtension) {
        try {
          const response = await TH.updateExtension('maomaomz');
          if (response && response.ok) {
            updateSuccess = true;
          }
        } catch (e) {
          console.warn('TavernHelper API 更新失败，尝试其他方法...', e);
        }
      }

      // 方法2: 直接调用 SillyTavern API
      if (!updateSuccess) {
        // 🔧 扩展名格式：优先尝试完整路径格式
        const extensionNames = ['third-party/maomaomz', 'maomaomz', 'third-party\\maomaomz'];
        for (const name of extensionNames) {
          if (updateSuccess) break;
          try {
            console.log(`🔄 尝试更新: ${name}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            // 获取 SillyTavern 请求头（包含认证信息）
            const stHeaders =
              typeof SillyTavern !== 'undefined' && SillyTavern.getRequestHeaders
                ? SillyTavern.getRequestHeaders()
                : {};
            const response = await fetch('/api/extensions/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...stHeaders,
              },
              body: JSON.stringify({ extensionName: name }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            // 🔧 检查响应状态和响应体
            if (response.ok) {
              const responseText = await response.text();
              console.log(`📥 更新响应 (${name}):`, responseText);

              // 检查响应体是否表示成功（有些API返回200但body可能有错误信息）
              if (responseText.toLowerCase().includes('error') || responseText.toLowerCase().includes('fail')) {
                console.warn(`⚠️ 更新响应包含错误 (${name}):`, responseText);
                continue;
              }

              updateSuccess = true;
              console.log(`✅ 更新成功: ${name}`);
            } else {
              const errorText = await response.text();
              console.warn(`更新失败 (${name}): ${response.status} - ${errorText}`);
            }
          } catch (e) {
            console.warn(`更新失败 (${name}):`, e);
          }
        }
      }

      if (updateSuccess) {
        (window as any).toastr?.success('✅ 更新成功！3秒后强制刷新页面...', '完成', { timeOut: 3000 });
        // 3秒后强制刷新页面（清除缓存）
        setTimeout(async () => {
          // 🔥 清除更新尝试记录，避免循环刷新问题（优先执行，确保不影响后续操作）
          try {
            localStorage.removeItem('maomaomz_last_update_attempt');
            localStorage.removeItem('maomaomz_force_refresh_count');
          } catch (e) {
            console.warn('清除 localStorage 失败:', e);
          }

          // 🔥 清除 Service Worker 缓存（移动端可能不支持，用 try-catch 包裹）
          try {
            if ('caches' in window && typeof caches.keys === 'function') {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => caches.delete(name)));
              console.log('✅ 已清除所有缓存');
            }
          } catch (e) {
            console.warn('清除缓存失败（移动端可能不支持）:', e);
          }

          // 🔥 尝试注销 Service Worker（移动端可能受限）
          try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const registration of registrations) {
                await registration.unregister();
              }
              console.log('✅ 已注销所有 Service Worker');
            }
          } catch (e) {
            console.warn('注销 Service Worker 失败（移动端可能不支持）:', e);
          }

          // 🔥 移动端兼容：多种刷新策略
          const forceRefresh = () => {
            try {
              // 策略1：使用时间戳强制刷新 URL
              const url = new URL(window.location.href);
              url.searchParams.set('_t', Date.now().toString());
              url.searchParams.set('_nocache', Math.random().toString(36).substring(7));

              // 策略2：尝试 location.replace（某些移动端浏览器可能更可靠）
              if (typeof window.location.replace === 'function') {
                window.location.replace(url.toString());
              } else {
                window.location.href = url.toString();
              }
            } catch (e) {
              console.warn('URL 刷新失败，尝试 reload:', e);
              // 策略3：降级到简单 reload
              try {
                window.location.reload();
              } catch (e2) {
                console.error('所有刷新方法都失败:', e2);
                (window as any).toastr?.warning('⚠️ 自动刷新失败，请手动刷新页面', '', { timeOut: 5000 });
              }
            }
          };

          forceRefresh();
        }, 3000);
      } else {
        throw new Error('所有更新方法都失败了');
      }
    } catch (error) {
      console.error('❌ 一键更新失败:', error);

      // 恢复按钮状态
      if (updateButton) {
        updateButton.disabled = false;
        updateButton.innerHTML = '🚀 立即更新';
        updateButton.style.opacity = '1';
      }

      // 🔥 强制模式：不关闭弹窗，只显示提示
      (window as any).toastr?.warning(
        `⚠️ 自动更新失败，请手动更新后点击刷新按钮\n\n终端命令：cd public/scripts/extensions/third-party/maomaomz && git pull`,
        '请手动更新',
        { timeOut: 0, closeButton: true },
      );
    }
  });

  // 仅刷新页面按钮（移动端兼容）
  document.getElementById('maomaomz-refresh-only')?.addEventListener('click', () => {
    // 清除更新相关的 localStorage 记录
    try {
      localStorage.removeItem('maomaomz_last_update_attempt');
      localStorage.removeItem('maomaomz_force_refresh_count');
    } catch (e) {
      console.warn('清除 localStorage 失败:', e);
    }

    // 🔥 移动端兼容：多种刷新方式
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('_t', Date.now().toString());
      if (typeof window.location.replace === 'function') {
        window.location.replace(url.toString());
      } else {
        window.location.href = url.toString();
      }
    } catch (e) {
      console.warn('URL 刷新失败，尝试 reload:', e);
      window.location.reload();
    }
  });

  // 稍后提醒按钮（只有非强制模式才有）
  if (!forceUpdate) {
    document.getElementById('maomaomz-skip-update')?.addEventListener('click', () => {
      // 记录跳过时间，1小时内不再提示
      localStorage.setItem('maomaomz_skip_update_until', String(Date.now() + 60 * 60 * 1000));
      document.getElementById('maomaomz-update-overlay')?.remove();
      (window as any).toastr?.info('⏰ 已跳过本次更新提示，1小时后再提醒', '', { timeOut: 3000 });
    });
  }

  return true; // 返回 true 表示显示了弹窗
}

/**
 * 自动检查更新（静默，不强制）
 */
export async function autoCheckUpdates(): Promise<void> {
  // 防止重复检查
  if (isCheckingInProgress) {
    console.log('⏳ 已在检查更新中，跳过自动检查');
    return;
  }

  isCheckingInProgress = true;
  try {
    const result = await checkForUpdates(false);

    if (result && result.hasUpdate && result.updateUrl && result.notes) {
      console.log(`✨ 发现新更新: ${result.currentCommit} → ${result.latestCommit}`);
      showUpdateDialog(
        {
          latestVersion: result.latestVersion || CURRENT_VERSION,
          latestCommit: result.latestCommit,
          currentVersion: result.currentVersion,
          currentCommit: result.currentCommit,
          updateUrl: result.updateUrl,
          notes: result.notes,
        },
        true,
      ); // 强制更新
    }
  } finally {
    isCheckingInProgress = false;
  }
}

/**
 * 手动检查更新（强制，显示结果）
 */
export async function manualCheckUpdates(): Promise<void> {
  // 防止重复检查
  if (isCheckingInProgress) {
    console.log('⏳ 已在检查更新中，跳过重复请求');
    return;
  }

  isCheckingInProgress = true;
  console.log('🔍 手动检查更新...');
  (window as any).toastr?.info('正在检查更新...', '版本检测', { timeOut: 3000, preventDuplicates: true });

  try {
    const result = await checkForUpdates(true);

    if (!result) {
      console.error('❌ 无法获取版本信息');
      (window as any).toastr?.error(
        '❌ 无法获取版本信息\n\n可能原因：\n1. GitHub API 访问受限\n2. 网络连接问题\n3. CDN 访问失败\n\n请稍后重试或查看控制台了解详情',
        '检查失败',
        { timeOut: 8000 },
      );
      return;
    }

    if (result.hasUpdate && result.updateUrl && result.notes) {
      console.log(`✨ 发现新更新: ${result.currentCommit} → ${result.latestCommit}`);
      showUpdateDialog(
        {
          latestVersion: result.latestVersion || CURRENT_VERSION,
          latestCommit: result.latestCommit,
          currentVersion: result.currentVersion,
          currentCommit: result.currentCommit,
          updateUrl: result.updateUrl,
          notes: result.notes,
        },
        true,
      ); // 强制更新
    } else {
      console.log(`✅ 已是最新版本: ${result.currentCommit}`);
      (window as any).toastr?.success(
        `✅ 已是最新版本 v${result.currentVersion} (${result.currentCommit})`,
        '无需更新',
        {
          preventDuplicates: true,
        },
      );
    }
  } finally {
    isCheckingInProgress = false;
  }
}
