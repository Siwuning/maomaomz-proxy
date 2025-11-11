<template>
  <div class="summary-tab" style="padding: 25px !important; background: #1a1a1a !important">
    <div
      class="section-header"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px !important;
        border-bottom: 1px solid #3a3a3a;
        margin-bottom: 5px;
      "
    >
      <h3
        style="
          margin: 0;
          color: #fff;
          font-size: 15px !important;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        📝 历史总结记录
      </h3>
      <div class="header-actions" style="display: flex; align-items: center; gap: 10px">
        <span
          v-if="summary_history.length > 0"
          class="count-badge"
          style="background: #4a9eff; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px"
          >{{ summary_history.length }} 条记录</span
        >
        <button
          class="mini-button refresh-button"
          style="
            padding: 6px 12px;
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 4px;
            color: #e0e0e0;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          @click="handleRefreshData"
        >
          <i class="fa-solid fa-refresh"></i> 刷新数据
        </button>
        <button
          class="mini-button create-worldbook-button"
          style="
            padding: 6px 12px;
            background: #51cf66;
            border: 1px solid #40c057;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          @click="createSummaryWorldbook"
        >
          <i class="fa-solid fa-plus"></i> 创建总结世界书
        </button>
        <button
          class="mini-button debug-button"
          style="
            padding: 6px 12px;
            background: #ffc107;
            border: 1px solid #ffb300;
            border-radius: 4px;
            color: #000;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          @click="showDebugPanel"
        >
          <i class="fa-solid fa-bug"></i> 调试工具
        </button>
      </div>
    </div>

    <div
      v-if="summary_history && summary_history.length > 0"
      class="history-list"
      style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px"
    >
      <div
        v-for="(item, index) in summary_history"
        :key="index"
        class="history-item"
        style="
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 8px;
          padding: 15px;
          transition: all 0.3s ease;
        "
      >
        <div
          class="history-header"
          style="
            padding: 12px 15px;
            background: #1a1a1a;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            user-select: none;
            transition: background 0.2s;
            border-radius: 6px;
          "
          @click="toggleExpanded(index)"
        >
          <div class="history-info" style="display: flex; align-items: center; gap: 10px; flex: 1">
            <span class="history-number" style="color: #4a9eff; font-weight: bold">#{{ index + 1 }}</span>
            <span class="history-range" style="color: #888; font-size: 12px"
              >楼层 {{ item.start_id }} - {{ item.end_id }}</span
            >
          </div>
          <span class="expand-icon" style="color: #888; font-size: 12px">{{ isExpanded(index) ? '▼' : '▶' }}</span>
        </div>
        <div
          v-if="isExpanded(index)"
          class="history-content"
          style="padding: 15px; background: #2a2a2a; border-radius: 0 0 6px 6px"
        >
          <div
            class="history-actions"
            style="display: flex; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #3a3a3a"
          >
            <button
              class="mini-button"
              style="
                flex: 1;
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #e0e0e0;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
              "
              @click="copySummary(item.content)"
            >
              <i class="fa-solid fa-copy"></i> 复制
            </button>
            <button
              class="mini-button worldbook-button"
              style="
                flex: 1;
                padding: 6px 12px;
                background: #4a9eff;
                border: 1px solid #5aaeff;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
              "
              @click="bindToWorldbook(item.content, index)"
            >
              <i class="fa-solid fa-book"></i> 绑定到世界书
            </button>
            <button
              class="mini-button delete-button"
              style="
                flex: 1;
                padding: 6px 12px;
                background: #ff6b6b;
                border: 1px solid #ff5252;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
              "
              @click="deleteSummary(index)"
            >
              <i class="fa-solid fa-trash"></i> 删除
            </button>
          </div>
          <div
            class="history-text"
            style="
              font-family: 'Courier New', monospace;
              font-size: 13px;
              line-height: 1.6;
              color: #e0e0e0;
              white-space: pre-wrap;
              word-wrap: break-word;
              user-select: text;
              cursor: text;
            "
          >
            {{ item.content }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state" style="text-align: center; padding: 40px 20px; color: #888">
      <i class="fa-solid fa-inbox" style="font-size: 48px; margin-bottom: 10px; opacity: 0.3"></i>
      <p style="margin: 10px 0; font-size: 16px">还没有总结记录</p>
      <small style="font-size: 12px; color: #666">使用"设置"标签页手动创建总结</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSummaryHistoryStore } from '../settings';
import { getChatIdSafe } from '../utils';

const historyStore = useSummaryHistoryStore();

// 响应式数据
const summary_history = ref<Array<{ start_id: number; end_id: number; content: string }>>([]);
const expandedState = ref<Map<number, boolean>>(new Map());

// 更新总结历史的函数
const refreshSummaryHistory = () => {
  try {
    summary_history.value = historyStore.getSummaryHistory();
    console.log('已刷新总结历史，当前聊天记录数:', summary_history.value.length);
  } catch (e) {
    console.error('刷新总结历史失败:', e);
    summary_history.value = [];
  }
};

// 切换展开状态
const toggleExpanded = (index: number) => {
  const current = expandedState.value.get(index) || false;
  expandedState.value.set(index, !current);
};

const isExpanded = (index: number) => {
  return expandedState.value.get(index) || false;
};

// 处理刷新数据按钮
const handleRefreshData = async () => {
  console.log('刷新数据按钮被点击');
  try {
    await refreshSummaryHistory();
    window.toastr.success('数据已刷新');
  } catch (error) {
    console.error('刷新数据失败:', error);
    window.toastr.error('刷新数据失败: ' + (error as Error).message);
  }
};

// 统一的复制函数 - 针对iframe环境优化
const copyToClipboard = async (text: string, successMessage: string = '内容已复制到剪贴板') => {
  console.log('开始复制，文本长度:', text.length);

  try {
    // 在iframe环境中，优先尝试在父窗口中复制
    if (window.parent && window.parent !== window) {
      console.log('检测到iframe环境，尝试在父窗口复制');
      const parentSuccess = await tryParentWindowCopy(text);
      if (parentSuccess) {
        console.log('父窗口复制成功');
        window.toastr.success(successMessage);
        return;
      }
    }

    // 方法1: 尝试使用现代的 Clipboard API（仅在安全上下文中）
    if (navigator.clipboard && window.isSecureContext) {
      console.log('使用现代 Clipboard API');
      try {
        await navigator.clipboard.writeText(text);
        console.log('Clipboard API 复制成功');
        window.toastr.success(successMessage);
        return;
      } catch (clipboardErr) {
        console.warn('Clipboard API 失败:', clipboardErr);
        // 继续尝试其他方法
      }
    }

    // 方法2: 使用传统的 execCommand 方法
    console.log('使用 execCommand 方法');
    const success = await execCommandCopy(text);
    if (success) {
      console.log('execCommand 复制成功');
      window.toastr.success(successMessage);
      return;
    }

    // 方法3: 如果都失败了，显示文本框让用户手动复制
    console.log('所有自动复制方法都失败，显示手动复制界面');
    showManualCopyDialog(text);
  } catch (err) {
    console.error('复制异常:', err);
    // 出错时也显示手动复制界面
    showManualCopyDialog(text);
  }
};

// 在父窗口中尝试复制
const tryParentWindowCopy = async (text: string): Promise<boolean> => {
  return new Promise(resolve => {
    try {
      const parentDoc = window.parent.document;
      const parentBody = window.parent.document.body;

      // 创建一个临时的 textarea 元素在父窗口中
      const textarea = parentDoc.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = `
        position: fixed;
        left: -9999px;
        top: -9999px;
        opacity: 0;
        pointer-events: none;
        z-index: -1000;
      `;
      textarea.setAttribute('readonly', '');

      parentBody.appendChild(textarea);

      // 选中文本
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      // 尝试复制
      const success = parentDoc.execCommand('copy');

      // 清理
      parentBody.removeChild(textarea);

      resolve(success);
    } catch (err) {
      console.error('父窗口复制失败:', err);
      resolve(false);
    }
  });
};

// execCommand 复制方法
const execCommandCopy = async (text: string): Promise<boolean> => {
  return new Promise(resolve => {
    try {
      // 创建一个临时的 textarea 元素
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      textarea.setAttribute('readonly', '');

      document.body.appendChild(textarea);

      // 选中文本
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      // 尝试复制
      const success = document.execCommand('copy');

      // 清理
      document.body.removeChild(textarea);

      resolve(success);
    } catch (err) {
      console.error('execCommand 复制失败:', err);
      resolve(false);
    }
  });
};

// 手动复制对话框 - 更可靠的实现
const showManualCopyDialog = (text: string) => {
  console.log('显示手动复制对话框，文本长度:', text.length);

  try {
    // 使用父窗口的document来创建元素
    const parentDoc = window.parent.document;
    const parentBody = window.parent.document.body;

    // 移除可能存在的旧对话框
    const existingOverlay = parentDoc.getElementById('manual-copy-overlay');
    if (existingOverlay) {
      parentBody.removeChild(existingOverlay);
    }

    // 创建遮罩层
    const overlay = parentDoc.createElement('div');
    overlay.id = 'manual-copy-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // 创建主容器
    const container = parentDoc.createElement('div');
    container.style.cssText = `
      background: #2a2a2a;
      border: 2px solid #4a9eff;
      border-radius: 16px;
      padding: 25px;
      max-width: 900px;
      width: 95%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;

    // 创建标题
    const header = parentDoc.createElement('div');
    header.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #4a9eff; text-align: center; font-size: 18px; font-weight: 600;">
        📋 手动复制总结内容
      </h3>
      <div style="background: #1a1a1a; border: 1px solid #444; border-radius: 6px; padding: 12px; margin-bottom: 15px;">
        <p style="margin: 0 0 8px 0; color: #e0e0e0; font-size: 14px;">
          <strong>操作步骤：</strong>
        </p>
        <ol style="margin: 0; padding-left: 20px; color: #ccc; font-size: 13px; line-height: 1.6;">
          <li>点击下方文本框</li>
          <li>按 <kbd style="background: #444; padding: 2px 6px; border-radius: 3px; color: #fff;">Ctrl+A</kbd> 全选文本</li>
          <li>按 <kbd style="background: #444; padding: 2px 6px; border-radius: 3px; color: #fff;">Ctrl+C</kbd> 复制到剪贴板</li>
          <li>点击"关闭"按钮或按 <kbd style="background: #444; padding: 2px 6px; border-radius: 3px; color: #fff;">Esc</kbd> 关闭对话框</li>
        </ol>
      </div>
    `;

    // 创建文本框
    const textarea = parentDoc.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = `
      width: 100%;
      height: 400px;
      background: #1a1a1a;
      border: 2px solid #444;
      border-radius: 6px;
      padding: 15px;
      color: #e0e0e0;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: vertical;
      white-space: pre-wrap;
      word-wrap: break-word;
      outline: none;
      margin-bottom: 20px;
      box-sizing: border-box;
    `;

    // 创建按钮容器
    const buttonContainer = parentDoc.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: center;
      align-items: center;
    `;

    // 创建关闭按钮
    const closeButton = parentDoc.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.cssText = `
      background: #4a9eff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.background = '#5ba8ff';
    };
    closeButton.onmouseout = () => {
      closeButton.style.background = '#4a9eff';
    };

    // 创建复制按钮（备用）
    const copyButton = parentDoc.createElement('button');
    copyButton.textContent = '尝试自动复制';
    copyButton.style.cssText = `
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    `;
    copyButton.onmouseover = () => {
      copyButton.style.background = '#218838';
    };
    copyButton.onmouseout = () => {
      copyButton.style.background = '#28a745';
    };

    // 组装元素
    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(closeButton);

    container.appendChild(header);
    container.appendChild(textarea);
    container.appendChild(buttonContainer);
    overlay.appendChild(container);

    // 添加到页面
    parentBody.appendChild(overlay);

    // 事件处理
    closeButton.onclick = () => {
      console.log('关闭按钮被点击');
      parentBody.removeChild(overlay);
    };

    copyButton.onclick = async () => {
      console.log('尝试自动复制按钮被点击');
      try {
        // 选中文本
        textarea.focus();
        textarea.select();

        // 尝试复制
        const success = document.execCommand('copy');
        if (success) {
          window.toastr.success('自动复制成功！');
          parentBody.removeChild(overlay);
        } else {
          window.toastr.warning('自动复制失败，请手动复制');
        }
      } catch (err) {
        console.error('自动复制失败:', err);
        window.toastr.warning('自动复制失败，请手动复制');
      }
    };

    // 点击背景关闭
    overlay.onclick = e => {
      if (e.target === overlay) {
        console.log('点击背景关闭');
        parentBody.removeChild(overlay);
      }
    };

    // 键盘事件处理
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('按ESC键关闭');
        parentBody.removeChild(overlay);
        parentDoc.removeEventListener('keydown', handleKeyDown);
      }
    };
    parentDoc.addEventListener('keydown', handleKeyDown);

    // 自动选中文本
    setTimeout(() => {
      console.log('自动选中文本');
      textarea.focus();
      textarea.select();
    }, 200);

    // 显示成功消息
    window.toastr.info('手动复制对话框已打开，请按照提示操作');
  } catch (err) {
    console.error('创建手动复制对话框失败:', err);
    window.toastr.error('无法显示复制对话框，请检查浏览器权限');
  }
};

// 复制总结 - 使用统一的复制函数
const copySummary = (content: string) => {
  copyToClipboard(content, '总结已复制到剪贴板');
};

// 删除总结（插件环境 - 使用 localStorage）
const deleteSummary = (index: number) => {
  if (confirm('确定要删除这条总结吗？')) {
    try {
      const chat_id = getChatIdSafe();
      if (!chat_id) {
        window.toastr.error('无法获取当前聊天信息');
        return;
      }

      summary_history.value.splice(index, 1);

      // 保存到 localStorage（按聊天ID存储）
      const scriptId = getScriptIdSafe();
      const storageKey = `${scriptId}_summary_history_${chat_id}`;
      localStorage.setItem(storageKey, JSON.stringify(summary_history.value));
      console.log('✅ 总结已删除并保存到 localStorage');

      window.toastr.success('总结已删除');
    } catch (error) {
      console.error('删除总结失败:', error);
      window.toastr.error('删除总结失败');
    }
  }
};

// 创建总结世界书
const createSummaryWorldbook = async () => {
  try {
    // 获取当前角色卡信息
    let characterName = '未知角色';
    try {
      const currentCharacter = getCharData('current');
      if (currentCharacter && currentCharacter.name) {
        characterName = currentCharacter.name;
        // 清理角色名中的特殊字符，避免文件名问题
        characterName = characterName.replace(/[<>:"/\\|?*]/g, '_').trim();
      }
    } catch (charError) {
      console.warn('获取角色信息失败:', charError);
    }

    // 生成包含角色名和日期的世界书名称
    const dateStr = new Date().toISOString().slice(0, 10);
    const worldbookName = `总结_${characterName}_${dateStr}`;

    console.log('准备创建世界书:', worldbookName);

    const existingWorldbooks = (window as any).getWorldbookNames();
    if (existingWorldbooks.includes(worldbookName)) {
      window.toastr.warning(`世界书 "${worldbookName}" 已存在`);
      return;
    }

    await createWorldbook(worldbookName, []);

    try {
      await rebindChatWorldbook('current', worldbookName);
      window.toastr.success(`已创建总结世界书 "${worldbookName}" 并绑定到当前聊天`);
    } catch (bindError) {
      console.warn('绑定到聊天失败:', bindError);
      window.toastr.success(`已创建总结世界书 "${worldbookName}"，请手动在聊天知识书中绑定`);
    }
  } catch (error) {
    console.error('创建总结世界书失败:', error);
    window.toastr.error('创建总结世界书失败: ' + (error as Error).message);
  }
};

// 绑定总结到世界书
const bindToWorldbook = async (content: string, summaryIndex: number) => {
  try {
    const worldbookNames = (window as any).getWorldbookNames();
    if (worldbookNames.length === 0) {
      window.toastr.warning('没有可用的世界书，请先创建总结世界书');
      return;
    }

    const selectedWorldbook =
      worldbookNames.length === 1 ? worldbookNames[0] : await promptForWorldbook(worldbookNames);
    if (!selectedWorldbook) {
      return;
    }

    const entryName = `总结_${summaryIndex + 1}_${new Date().toLocaleDateString()}`;
    const newEntry = {
      name: entryName,
      enabled: true,
      strategy: {
        type: 'constant' as const,
        keys: [],
        keys_secondary: { logic: 'and_any' as const, keys: [] },
        scan_depth: 'same_as_global' as const,
      },
      position: {
        type: 'before_character_definition' as const,
        role: 'system' as const,
        depth: 1,
      },
      content: content,
      comment: `自动生成的总结条目 - 楼层范围: ${summary_history.value[summaryIndex]?.start_id || '?'} - ${summary_history.value[summaryIndex]?.end_id || '?'}`,
      insertion_order: 0,
      case_sensitive: false,
      name_is_regex: false,
      keys_are_regex: false,
      selective_logic: 'and',
      secondary_keys_logic: 'and',
      activation_threshold: 0,
      disabled: false,
      order: 0,
      group: '',
      local_id: 0,
      depth_entries: [],
      depth_entries_all: false,
      search_range: 0,
      force_activation: false,
      disable: false,
      exclude_recursion: false,
      hidden: false,
      priority: 0,
      comment_is_regex: false,
      content_is_regex: false,
      secondary_keys_are_regex: false,
      keys_secondary_are_regex: false,
      uid: Date.now(),
    };

    await createWorldbookEntries(selectedWorldbook, [newEntry]);
    window.toastr.success(`总结已绑定到世界书: ${selectedWorldbook}`);
  } catch (error) {
    console.error('绑定到世界书失败:', error);
    window.toastr.error('绑定到世界书失败: ' + (error as Error).message);
  }
};

// 让用户选择世界书的辅助函数
const promptForWorldbook = async (worldbookNames: string[]): Promise<string | null> => {
  return new Promise<string | null>(resolve => {
    const dialog = $(`
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #2a2a2a;
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        padding: 20px;
        z-index: 1000000;
        min-width: 300px;
      ">
        <h3 style="margin: 0 0 15px 0; color: #e0e0e0;">选择世界书</h3>
        <div style="margin-bottom: 15px;">
          ${worldbookNames
            .map(
              name => `
            <label style="display: block; margin: 5px 0; color: #e0e0e0;">
              <input type="radio" name="worldbook" value="${name}" style="margin-right: 8px;">
              ${name}
            </label>
          `,
            )
            .join('')}
        </div>
        <div style="text-align: right;">
          <button id="cancelWorldbook" style="
            background: #666;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            margin-right: 10px;
            cursor: pointer;
          ">取消</button>
          <button id="confirmWorldbook" style="
            background: #4a9eff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          ">确定</button>
        </div>
      </div>
    `);

    const overlay = $(`
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
      "></div>
    `);

    $('body').append(overlay).append(dialog);

    $('#cancelWorldbook').on('click', () => {
      overlay.remove();
      dialog.remove();
      resolve(null);
    });

    $('#confirmWorldbook').on('click', () => {
      const selected = $('input[name="worldbook"]:checked').val() as string;
      overlay.remove();
      dialog.remove();
      resolve(selected || null);
    });

    $('input[name="worldbook"]:first').prop('checked', true);
  });
};

// 显示调试面板
const showDebugPanel = () => {
  try {
    // 使用父窗口的document来创建元素
    const parentDoc = window.parent.document;
    const parentBody = window.parent.document.body;

    // 移除可能存在的旧对话框
    const existingOverlay = parentDoc.getElementById('debug-panel-overlay');
    if (existingOverlay) {
      parentBody.removeChild(existingOverlay);
    }

    // 创建遮罩层
    const overlay = parentDoc.createElement('div');
    overlay.id = 'debug-panel-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // 创建主容器
    const container = parentDoc.createElement('div');
    container.style.cssText = `
      background: #2a2a2a;
      border: 2px solid #ffc107;
      border-radius: 16px;
      padding: 25px;
      max-width: 800px;
      width: 95%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;

    // 创建标题
    const header = parentDoc.createElement('div');
    header.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #ffc107; text-align: center; font-size: 18px; font-weight: 600;">
        🐛 自动总结调试工具
      </h3>
      <div style="background: #1a1a1a; border: 1px solid #444; border-radius: 6px; padding: 12px; margin-bottom: 15px;">
        <p style="margin: 0 0 8px 0; color: #e0e0e0; font-size: 14px;">
          <strong>调试功能：</strong>
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 13px; line-height: 1.6;">
          <li>测试自动总结流程</li>
          <li>同步localStorage数据到酒馆助手变量</li>
          <li>检查当前楼层状态</li>
          <li>验证触发条件计算</li>
        </ul>
      </div>
    `;

    // 创建按钮容器
    const buttonContainer = parentDoc.createElement('div');
    buttonContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    `;

    // 创建按钮
    const buttons = [
      { id: 'testComplete', text: '🧪 测试完整流程', color: '#4a9eff' },
      { id: 'syncData', text: '🔄 同步数据', color: '#28a745' },
      { id: 'checkFloor', text: '🔍 检查楼层', color: '#17a2b8' },
      { id: 'testCalculation', text: '🧮 验证计算', color: '#6f42c1' },
      { id: 'showStatus', text: '📊 显示状态', color: '#fd7e14' },
      { id: 'resetStartId', text: '🔄 重置起始楼层', color: '#dc3545' },
    ];

    buttons.forEach(button => {
      const btn = parentDoc.createElement('button');
      btn.id = button.id;
      btn.textContent = button.text;
      btn.style.cssText = `
        background: ${button.color};
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: background 0.2s;
      `;
      btn.onmouseover = () => {
        btn.style.opacity = '0.8';
      };
      btn.onmouseout = () => {
        btn.style.opacity = '1';
      };
      buttonContainer.appendChild(btn);
    });

    // 创建输出区域
    const outputArea = parentDoc.createElement('div');
    outputArea.id = 'debug-output';
    outputArea.style.cssText = `
      background: #1a1a1a;
      border: 1px solid #444;
      border-radius: 6px;
      padding: 15px;
      height: 200px;
      overflow-y: auto;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 12px;
      color: #e0e0e0;
      white-space: pre-wrap;
      margin-bottom: 20px;
    `;
    outputArea.textContent = '点击上方按钮开始调试...\n';

    // 创建关闭按钮
    const closeButton = parentDoc.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.cssText = `
      background: #6c757d;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
      align-self: center;
    `;

    // 组装元素
    container.appendChild(header);
    container.appendChild(buttonContainer);
    container.appendChild(outputArea);
    container.appendChild(closeButton);

    overlay.appendChild(container);
    parentBody.appendChild(overlay);

    // 添加日志函数
    const log = (message: string) => {
      const output = parentDoc.getElementById('debug-output');
      if (output) {
        output.textContent += message + '\n';
        output.scrollTop = output.scrollHeight;
      }
    };

    // 事件处理
    closeButton.onclick = () => {
      parentBody.removeChild(overlay);
    };

    // 测试完整流程
    parentDoc.getElementById('testComplete')?.addEventListener('click', () => {
      log('🧪 开始测试完整自动总结流程...');
      try {
        if ((window as any).testCompleteAutoSummary) {
          (window as any).testCompleteAutoSummary();
          log('✅ 测试函数已执行，请查看控制台输出');
        } else {
          log('❌ 测试函数不可用');
        }
      } catch (error) {
        log('❌ 测试失败: ' + (error as Error).message);
      }
    });

    // 同步数据
    parentDoc.getElementById('syncData')?.addEventListener('click', () => {
      log('🔄 开始同步数据...');
      try {
        if ((window as any).syncAutoSummaryData) {
          (window as any).syncAutoSummaryData();
          log('✅ 同步函数已执行，请查看控制台输出');
        } else {
          log('❌ 同步函数不可用');
        }
      } catch (error) {
        log('❌ 同步失败: ' + (error as Error).message);
      }
    });

    // 检查楼层
    parentDoc.getElementById('checkFloor')?.addEventListener('click', () => {
      log('🔍 开始检查楼层...');
      try {
        if ((window as any).checkCurrentFloor) {
          (window as any).checkCurrentFloor();
          log('✅ 楼层检查函数已执行，请查看控制台输出');
        } else {
          log('❌ 楼层检查函数不可用');
        }
      } catch (error) {
        log('❌ 楼层检查失败: ' + (error as Error).message);
      }
    });

    // 验证计算
    parentDoc.getElementById('testCalculation')?.addEventListener('click', () => {
      log('🧮 开始验证计算...');
      try {
        if ((window as any).testFloorCalculation) {
          (window as any).testFloorCalculation();
          log('✅ 计算验证函数已执行，请查看控制台输出');
        } else {
          log('❌ 计算验证函数不可用');
        }
      } catch (error) {
        log('❌ 计算验证失败: ' + (error as Error).message);
      }
    });

    // 显示状态
    parentDoc.getElementById('showStatus')?.addEventListener('click', () => {
      log('📊 开始显示状态...');
      try {
        if ((window as any).checkAutoSummaryStatus) {
          (window as any).checkAutoSummaryStatus();
          log('✅ 状态检查函数已执行，请查看控制台输出');
        } else {
          log('❌ 状态检查函数不可用');
        }
      } catch (error) {
        log('❌ 状态检查失败: ' + (error as Error).message);
      }
    });

    // 重置起始楼层
    parentDoc.getElementById('resetStartId')?.addEventListener('click', () => {
      log('🔄 开始重置起始楼层...');
      try {
        if ((window as any).smartResetChat) {
          (window as any).smartResetChat();
          log('✅ 重置函数已执行，请查看控制台输出');
        } else {
          log('❌ 重置函数不可用');
        }
      } catch (error) {
        log('❌ 重置失败: ' + (error as Error).message);
      }
    });

    // 点击背景关闭
    overlay.onclick = e => {
      if (e.target === overlay) {
        parentBody.removeChild(overlay);
      }
    };

    // 键盘事件处理
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        parentBody.removeChild(overlay);
        parentDoc.removeEventListener('keydown', handleKeyDown);
      }
    };
    parentDoc.addEventListener('keydown', handleKeyDown);

    window.toastr?.info('调试面板已打开');
  } catch (err) {
    console.error('创建调试面板失败:', err);
    window.toastr?.error('无法显示调试面板，请检查浏览器权限');
  }
};

// 初始化
refreshSummaryHistory();
</script>

<style scoped>
.summary-tab {
  height: 100%;
  overflow-y: auto;
  padding: 25px !important;
}

/* 滚动条样式 */
.summary-tab::-webkit-scrollbar {
  width: 6px;
}

.summary-tab::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.summary-tab::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.summary-tab::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px !important;
  border-bottom: 1px solid #3a3a3a;
  margin-bottom: 5px;
}

.section-header h3 {
  margin: 0;
  color: #fff;
  font-size: 15px !important;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-badge {
  background: #4a9eff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.3;
}

.empty-state p {
  margin: 10px 0;
  font-size: 14px;
}

.empty-state small {
  color: #666;
  font-size: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 20px;
}

.history-item {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.history-item:hover {
  border-color: #4a4a4a;
}

.history-header {
  padding: 12px 15px;
  background: #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.history-header:hover {
  background: #2a2a2a;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.history-number {
  color: #4a9eff;
  font-weight: bold;
}

.history-range {
  color: #888;
  font-size: 12px;
}

.expand-icon {
  color: #888;
  font-size: 12px;
}

.history-content {
  padding: 15px;
  background: #2a2a2a;
}

.history-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #3a3a3a;
}

.mini-button {
  flex: 1;
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.mini-button:hover {
  background: #3a3a3a;
}

.mini-button.delete-button:hover {
  background: #ff4444;
  border-color: #ff4444;
  color: white;
}

.mini-button.worldbook-button {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.mini-button.worldbook-button:hover {
  background: #218838;
  border-color: #218838;
  color: white;
}

.mini-button.create-worldbook-button {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.mini-button.create-worldbook-button:hover {
  background: #138496;
  border-color: #138496;
  color: white;
}

.mini-button.refresh-button {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.mini-button.refresh-button:hover {
  background: #5a6268;
  border-color: #5a6268;
  color: white;
}

.mini-button.debug-button {
  background: #ffc107;
  color: #000;
  border-color: #ffb300;
}

.mini-button.debug-button:hover {
  background: #e0a800;
  border-color: #d39e00;
  color: #000;
}

.history-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
}
</style>
