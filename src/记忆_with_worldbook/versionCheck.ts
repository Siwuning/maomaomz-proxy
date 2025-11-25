/**
 * 🔄 版本检测模块
 * 作者: mzrodyu
 * ⚠️ 商业化死全家，贩子死全家 ⚠️
 */

import packageJson from '../../package.json';

// 当前版本号（从 package.json 读取）
export const CURRENT_VERSION = packageJson.version;

// GitHub 仓库信息
const GITHUB_REPO = 'mzrodyu/maomaomz';
const GITHUB_API_BASE = 'https://api.github.com';

// LocalStorage 键名
const LAST_CHECK_KEY = 'maomaomz_last_version_check';
const IGNORED_VERSION_KEY = 'maomaomz_ignored_version';

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
 * 从 GitHub 获取最新版本
 */
async function fetchLatestVersion(): Promise<{ version: string; url: string; notes: string } | null> {
  try {
    console.log('🔍 正在从 GitHub API 获取版本信息...');

    // 尝试从 GitHub Releases API 获取
    const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      // 添加超时控制
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    console.log(`📡 GitHub API 响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.warn(`⚠️ GitHub API 请求失败 (${response.status})，尝试使用 jsDelivr CDN...`);
      // 备用：使用 jsDelivr CDN 获取 package.json
      return await fetchVersionFromCDN();
    }

    const data = await response.json();
    console.log('✅ 成功获取版本信息:', data.tag_name);

    return {
      version: data.tag_name.replace(/^v/, ''),
      url: data.html_url,
      notes: data.body || '暂无更新说明',
    };
  } catch (error: any) {
    console.error('❌ GitHub API 请求失败:', error.message || error);

    // 如果是网络错误，尝试备用方案
    console.warn('🔄 尝试使用 jsDelivr CDN 备用方案...');
    return await fetchVersionFromCDN();
  }
}

/**
 * 备用方案：使用多个 CDN 源获取 package.json
 */
async function fetchVersionFromCDN(): Promise<{ version: string; url: string; notes: string } | null> {
  // 多个备用 CDN 源
  const cdnSources = [
    {
      name: 'jsDelivr',
      url: `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@main/package.json?t=${Date.now()}`,
    },
    {
      name: 'raw.githubusercontent',
      url: `https://raw.githubusercontent.com/${GITHUB_REPO}/main/package.json?t=${Date.now()}`,
    },
    {
      name: 'ghproxy',
      url: `https://ghproxy.com/https://raw.githubusercontent.com/${GITHUB_REPO}/main/package.json`,
    },
    {
      name: 'fastgit',
      url: `https://raw.fastgit.org/${GITHUB_REPO}/main/package.json`,
    },
  ];

  for (const source of cdnSources) {
    try {
      console.log(`🔍 正在从 ${source.name} 获取版本信息...`);

      const response = await fetch(source.url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.warn(`⚠️ ${source.name} 请求失败 (${response.status})`);
        continue;
      }

      const data = await response.json();
      console.log(`✅ 从 ${source.name} 成功获取版本:`, data.version);

      return {
        version: data.version,
        url: `https://github.com/${GITHUB_REPO}/releases/latest`,
        notes: `最新版本: ${data.version}\n\n请前往 GitHub 查看详细更新日志`,
      };
    } catch (error: any) {
      console.warn(`⚠️ ${source.name} 请求失败:`, error.message || error);
      continue;
    }
  }

  console.error('❌ 所有 CDN 源都无法访问');
  return null;
}

/**
 * 检查更新
 * @param force 是否强制检查（忽略检查间隔）
 */
export async function checkForUpdates(force: boolean = false): Promise<{
  hasUpdate: boolean;
  latestVersion?: string;
  currentVersion: string;
  updateUrl?: string;
  notes?: string;
} | null> {
  try {
    // 检查是否需要跳过（非强制且最近检查过）
    if (!force) {
      const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
      if (lastCheck) {
        const lastCheckTime = parseInt(lastCheck);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (now - lastCheckTime < oneDay) {
          console.log('ℹ️ 距离上次检查不到24小时，跳过自动检查');
          return null;
        }
      }
    }

    console.log('🔍 检查更新中...');

    const latest = await fetchLatestVersion();

    if (!latest) {
      console.warn('⚠️ 无法获取版本信息');
      return null;
    }

    // 保存检查时间
    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());

    // 比较版本
    const hasUpdate = compareVersions(latest.version, CURRENT_VERSION) > 0;

    // 检查是否被忽略
    if (!force) {
      const ignoredVersion = localStorage.getItem(IGNORED_VERSION_KEY);
      if (ignoredVersion === latest.version) {
        console.log(`ℹ️ 版本 ${latest.version} 已被用户忽略`);
        return null;
      }
    }

    return {
      hasUpdate,
      latestVersion: latest.version,
      currentVersion: CURRENT_VERSION,
      updateUrl: latest.url,
      notes: latest.notes,
    };
  } catch (error) {
    console.error('❌ 检查更新失败:', error);
    return null;
  }
}

/**
 * 显示更新对话框
 */
export function showUpdateDialog(updateInfo: {
  latestVersion: string;
  currentVersion: string;
  updateUrl: string;
  notes: string;
}): void {
  const dialogHtml = `
    <div id="maomaomz-update-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 9999998 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    ">
      <div id="maomaomz-update-dialog" style="
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        border: 3px solid #4a9eff;
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(74, 158, 255, 0.3);
        z-index: 9999999 !important;
        animation: slideUp 0.4s ease-out;
      ">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
          <h2 style="color: #fff; font-size: 28px; margin-bottom: 12px; font-weight: 700;">
            发现新版本！
          </h2>
          <p style="color: #ccc; font-size: 14px;">
            是时候更新猫猫的小破烂了~
          </p>
        </div>

        <div style="background: rgba(74, 158, 255, 0.1); border-left: 4px solid #4a9eff; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <div>
              <div style="color: #888; font-size: 12px; margin-bottom: 4px;">当前版本</div>
              <div style="color: #fff; font-size: 20px; font-weight: 600;">v${updateInfo.currentVersion}</div>
            </div>
            <div style="color: #4a9eff; font-size: 32px; align-self: center;">→</div>
            <div>
              <div style="color: #888; font-size: 12px; margin-bottom: 4px;">最新版本</div>
              <div style="color: #4a9eff; font-size: 20px; font-weight: 600;">v${updateInfo.latestVersion}</div>
            </div>
          </div>

          <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px;">
            <div style="color: #ccc; font-size: 13px; margin-bottom: 8px; font-weight: 600;">📝 更新内容：</div>
            <div style="color: #aaa; font-size: 12px; line-height: 1.6; max-height: 150px; overflow-y: auto; white-space: pre-wrap;">
${updateInfo.notes}
            </div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 16px; border-radius: 12px; margin-bottom: 24px; border: 2px solid #7f1d1d;">
          <div style="color: #fff; font-size: 14px; font-weight: 600; text-align: center; letter-spacing: 1px;">
            ⚠️ 商业化死全家，贩子死全家 ⚠️
          </div>
          <div style="color: #fca5a5; font-size: 12px; text-align: center; margin-top: 8px;">
            本插件完全免费，禁止倒卖！
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="maomaomz-update-now" style="
            flex: 1;
            padding: 16px;
            background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(74, 158, 255, 0.4)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(74, 158, 255, 0.3)';">
            🚀 立即更新
          </button>
          <button id="maomaomz-update-later" style="
            padding: 16px 24px;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: #aaa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='#fff';" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.color='#aaa';">
            稍后提醒
          </button>
          <button id="maomaomz-update-ignore" style="
            padding: 16px 24px;
            background: transparent;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #666;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.borderColor='rgba(255, 255, 255, 0.3)'; this.style.color='#999';" onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'; this.style.color='#666';">
            忽略此版本
          </button>
        </div>
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

  // 绑定事件
  document.getElementById('maomaomz-update-now')?.addEventListener('click', () => {
    // 关闭对话框
    document.getElementById('maomaomz-update-overlay')?.remove();

    // 显示更新说明 - 引导用户去扩展管理中更新
    (window as any).toastr?.success(
      `📦 请按以下步骤更新：\n\n1️⃣ 点击左侧【扩展】图标\n2️⃣ 找到【猫猫的记忆管理工具】\n3️⃣ 点击【立即更新】按钮\n4️⃣ 等待更新完成后刷新页面\n\n✨ 新版本 v${updateInfo.latestVersion} 即可安装成功！`,
      '🎉 如何更新到最新版本',
      { timeOut: 15000, extendedTimeOut: 5000 },
    );
  });

  document.getElementById('maomaomz-update-later')?.addEventListener('click', () => {
    // 清除检查时间，下次启动会再次检查
    localStorage.removeItem(LAST_CHECK_KEY);
    (window as any).toastr?.info('下次启动时会再次提醒您更新');
    document.getElementById('maomaomz-update-overlay')?.remove();
  });

  document.getElementById('maomaomz-update-ignore')?.addEventListener('click', () => {
    // 标记此版本为已忽略
    localStorage.setItem(IGNORED_VERSION_KEY, updateInfo.latestVersion);
    (window as any).toastr?.warning(`已忽略版本 ${updateInfo.latestVersion}，不再提示`);
    document.getElementById('maomaomz-update-overlay')?.remove();
  });
}

/**
 * 自动检查更新（静默，不强制）
 */
export async function autoCheckUpdates(): Promise<void> {
  const result = await checkForUpdates(false);

  if (result && result.hasUpdate && result.latestVersion && result.updateUrl && result.notes) {
    console.log(`✨ 发现新版本: ${result.latestVersion} (当前: ${result.currentVersion})`);
    showUpdateDialog({
      latestVersion: result.latestVersion,
      currentVersion: result.currentVersion,
      updateUrl: result.updateUrl,
      notes: result.notes,
    });
  }
}

/**
 * 手动检查更新（强制，显示结果）
 */
export async function manualCheckUpdates(): Promise<void> {
  console.log('🔍 手动检查更新...');
  (window as any).toastr?.info('正在检查更新...', '版本检测', { timeOut: 3000 });

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

  if (result.hasUpdate && result.latestVersion && result.updateUrl && result.notes) {
    console.log(`✨ 发现新版本: ${result.latestVersion} (当前: ${result.currentVersion})`);
    showUpdateDialog({
      latestVersion: result.latestVersion,
      currentVersion: result.currentVersion,
      updateUrl: result.updateUrl,
      notes: result.notes,
    });
  } else {
    console.log(`✅ 已是最新版本: ${result.currentVersion}`);
    (window as any).toastr?.success(`✅ 已是最新版本 v${result.currentVersion}`, '无需更新');
  }
}
