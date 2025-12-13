/**
 * 🔄 版本检测模块
 * 作者: mzrodyu
 * ⚠️ 商业化死全家，贩子死全家 ⚠️
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
 * 获取远程 manifest.json 的版本号
 */
async function fetchRemoteVersion(): Promise<string | null> {
  const manifestUrls = [
    `https://raw.githubusercontent.com/${GITHUB_REPO}/main/manifest.json?t=${Date.now()}`,
    `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@main/manifest.json?t=${Date.now()}`,
  ];

  for (const url of manifestUrls) {
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
): void {
  // 强制更新模式不检查跳过时间
  if (!forceUpdate) {
    const skipUntil = localStorage.getItem('maomaomz_skip_update_until');
    if (skipUntil && Date.now() < parseInt(skipUntil, 10)) {
      console.log('⏰ 在跳过时间内，不显示更新提示');
      return;
    }
  }

  const dialogHtml = `
    <div id="maomaomz-update-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
      backdrop-filter: blur(12px);
      z-index: 9999998 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.4s ease-out;
    ">
      <div id="maomaomz-update-dialog" style="
        background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 24px;
        padding: 48px;
        max-width: 480px;
        width: 90%;
        box-shadow: 0 25px 80px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(255,255,255,0.05) inset;
        z-index: 9999999 !important;
        animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <!-- 顶部装饰 -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4);
          ">
            <span style="font-size: 40px;">🐱</span>
          </div>
          <h2 style="color: #f1f5f9; font-size: 24px; margin: 0 0 8px 0; font-weight: 700; letter-spacing: -0.5px;">
            发现新版本
          </h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">
            猫猫的小破烂有更新啦~
          </p>
        </div>

        <!-- 版本信息 -->
        <div style="
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        ">
          <div style="display: flex; align-items: center; justify-content: center; gap: 24px;">
            <div style="text-align: center;">
              <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">当前</div>
              <div style="color: #e2e8f0; font-size: 24px; font-weight: 700;">v${updateInfo.currentVersion}</div>
            </div>
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            ">
              <span style="color: #fff; font-size: 18px;">→</span>
            </div>
            <div style="text-align: center;">
              <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">最新</div>
              <div style="color: #a5b4fc; font-size: 24px; font-weight: 700;">v${updateInfo.latestVersion}</div>
            </div>
          </div>
        </div>

        <!-- 警告 -->
        <div style="
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.15) 100%);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 24px;
          text-align: center;
        ">
          <div style="color: #fca5a5; font-size: 13px; font-weight: 600;">
            ⚠️ 商业化死全家，贩子死全家
          </div>
          <div style="color: #f87171; font-size: 11px; margin-top: 4px;">本插件免费，禁止倒卖！</div>
        </div>

        <!-- 按钮 -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="maomaomz-update-now" style="
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: none;
            border-radius: 14px;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 30px rgba(99, 102, 241, 0.5)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 20px rgba(99, 102, 241, 0.4)';">
            🚀 立即更新
          </button>
          <button id="maomaomz-refresh-only" style="
            width: 100%;
            padding: 14px 24px;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            color: #a5b4fc;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.background='rgba(99, 102, 241, 0.2)';" onmouseout="this.style.background='rgba(99, 102, 241, 0.1)';">
            🔄 已手动更新？刷新页面
          </button>
          ${
            !forceUpdate
              ? `<button id="maomaomz-skip-update" style="
            width: 100%;
            padding: 12px;
            background: transparent;
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 10px;
            color: #64748b;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.borderColor='rgba(100, 116, 139, 0.5)';" onmouseout="this.style.borderColor='rgba(100, 116, 139, 0.3)';">
            ⏰ 稍后提醒
          </button>`
              : ''
          }
        </div>
        ${forceUpdate ? '<p style="color: #f87171; font-size: 12px; text-align: center; margin-top: 16px; font-weight: 500;">🚫 必须更新才能继续使用</p>' : ''}
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

      // 方法2: 直接调用 SillyTavern API（尝试不同参数格式）
      if (!updateSuccess) {
        const extensionNames = ['maomaomz', 'third-party/maomaomz'];
        for (const name of extensionNames) {
          if (updateSuccess) break;
          try {
            console.log(`🔄 尝试更新: ${name}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
            const response = await fetch('/api/extensions/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ extensionName: name }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (response.ok) {
              updateSuccess = true;
              console.log(`✅ 更新成功: ${name}`);
            }
          } catch (e: any) {
            if (e.name === 'AbortError') {
              console.warn(`更新超时 (${name})`);
            } else {
              console.warn(`更新失败 (${name}):`, e);
            }
          }
        }
      }

      if (updateSuccess) {
        (window as any).toastr?.success('✅ 更新成功！3秒后刷新页面...', '完成', { timeOut: 3000 });
        // 3秒后刷新页面
        setTimeout(() => {
          window.location.reload();
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

  // 仅刷新页面按钮
  document.getElementById('maomaomz-refresh-only')?.addEventListener('click', () => {
    window.location.reload();
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
      showUpdateDialog({
        latestVersion: result.latestVersion || CURRENT_VERSION,
        latestCommit: result.latestCommit,
        currentVersion: result.currentVersion,
        currentCommit: result.currentCommit,
        updateUrl: result.updateUrl,
        notes: result.notes,
      });
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
      showUpdateDialog({
        latestVersion: result.latestVersion || CURRENT_VERSION,
        latestCommit: result.latestCommit,
        currentVersion: result.currentVersion,
        currentCommit: result.currentCommit,
        updateUrl: result.updateUrl,
        notes: result.notes,
      });
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
