<template>
  <div class="table-tab" style="padding: 25px !important; background: #1a1a1a !important">
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
        📊 表格分析
      </h3>
      <span
        v-if="table_history.length > 0"
        class="count-badge"
        style="background: #4a9eff; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px"
        >{{ table_history.length }} 条记录</span
      >
    </div>

    <!-- 表格历史列表 -->
    <div
      v-if="table_history && table_history.length > 0"
      class="history-list"
      style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px"
    >
      <div
        v-for="(item, index) in table_history"
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
          @click="toggleTableExpanded(index)"
        >
          <div class="history-info" style="display: flex; align-items: center; gap: 10px; flex: 1">
            <span class="history-number" style="color: #4a9eff; font-weight: bold">#{{ index + 1 }}</span>
            <span class="history-range" style="color: #888; font-size: 12px"
              >楼层 {{ item.start_id }} - {{ item.end_id }}</span
            >
          </div>
          <span class="expand-icon" style="color: #888; font-size: 12px">{{
            isTableExpanded(index) ? '▼' : '▶'
          }}</span>
        </div>
        <div
          v-if="isTableExpanded(index)"
          class="history-content"
          style="padding: 15px; background: #2a2a2a; border-radius: 0 0 6px 6px"
        >
          <div
            class="history-actions"
            style="
              display: flex;
              gap: 10px;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #3a3a3a;
              flex-wrap: wrap;
            "
          >
            <button
              class="copy-button"
              style="
                padding: 8px 16px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
                position: relative;
                overflow: hidden;
              "
              @click="copyTable(item)"
            >
              <div
                style="
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                  transition: left 0.5s;
                "
                class="shimmer-effect"
              ></div>
              <i class="fa-solid fa-copy" style="font-size: 12px"></i> 复制
            </button>
            <button
              class="delete-button"
              style="
                padding: 8px 16px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 3px 12px rgba(255, 107, 107, 0.3);
                position: relative;
                overflow: hidden;
              "
              @click="deleteTable(index)"
            >
              <div
                style="
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                  transition: left 0.5s;
                "
                class="shimmer-effect"
              ></div>
              <i class="fa-solid fa-trash" style="font-size: 12px"></i> 删除
            </button>
          </div>
          <div class="table-display" style="overflow-x: auto; border-radius: 6px; border: 1px solid #3a3a3a">
            <table style="width: 100%; border-collapse: collapse; background: #1a1a1a">
              <thead style="background: #2a2a2a">
                <tr>
                  <th
                    v-for="(header, idx) in item.headers"
                    :key="idx"
                    style="
                      padding: 12px 16px;
                      text-align: left;
                      font-weight: bold;
                      color: #fff;
                      border-bottom: 2px solid #3a3a3a;
                      border-right: 1px solid #3a3a3a;
                    "
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIdx) in item.data" :key="rowIdx" style="border-bottom: 1px solid #3a3a3a">
                  <td
                    v-for="(cell, cellIdx) in row"
                    :key="cellIdx"
                    style="padding: 10px 16px; color: #e0e0e0; border-right: 1px solid #3a3a3a"
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state" style="text-align: center; padding: 40px 20px; color: #888">
      <i class="fa-solid fa-table" style="font-size: 48px; margin-bottom: 10px; opacity: 0.3"></i>
      <p style="margin: 10px 0; font-size: 16px">还没有表格记录</p>
      <small style="font-size: 12px; color: #666">使用"设置"标签页手动生成表格</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getChatIdSafe } from '../utils';

// 响应式数据
const table_history = ref<Array<{ start_id: number; end_id: number; headers: string[]; data: string[][] }>>([]);
const tableExpandedState = ref<Map<number, boolean>>(new Map());

// 更新表格历史的函数（插件环境 - localStorage）
const refreshTableHistory = () => {
  try {
    const chat_id = getChatIdSafe();
    if (!chat_id) {
      console.warn('无法获取聊天ID，清空表格历史');
      table_history.value = [];
      return;
    }

    // 插件环境：从 localStorage 读取
    const scriptId = getScriptIdSafe();
    const storageKey = `${scriptId}_table_history_${chat_id}`;
    const savedData = localStorage.getItem(storageKey);

    console.log('从 localStorage 读取表格历史，key:', storageKey);

    if (savedData) {
      table_history.value = JSON.parse(savedData);
    } else {
      table_history.value = [];
    }

    console.log('已刷新表格历史，当前聊天表格数:', table_history.value.length);
  } catch (e) {
    console.error('刷新表格历史失败:', e);
    table_history.value = [];
  }
};

// 切换表格展开状态
const toggleTableExpanded = (index: number) => {
  const current = tableExpandedState.value.get(index) || false;
  tableExpandedState.value.set(index, !current);
};

const isTableExpanded = (index: number) => {
  return tableExpandedState.value.get(index) || false;
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
        📋 手动复制表格内容
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

// 复制表格 - 使用统一的复制函数
const copyTable = (tableItem: { headers: string[]; data: string[][] }) => {
  try {
    // 创建表格的TSV格式
    const tsv = [tableItem.headers.join('\t'), ...tableItem.data.map(row => row.join('\t'))].join('\n');
    copyToClipboard(tsv, '表格已复制到剪贴板');
  } catch (error) {
    console.error('复制表格失败:', error);
    window.toastr.error('复制失败，请手动复制');
  }
};

// 删除表格（插件环境 - localStorage）
const deleteTable = (index: number) => {
  if (confirm('确定要删除这个表格吗？')) {
    table_history.value.splice(index, 1);
    const chat_id = getChatIdSafe();
    if (chat_id) {
      // 插件环境：保存到 localStorage
      const scriptId = getScriptIdSafe();
      const storageKey = `${scriptId}_table_history_${chat_id}`;
      localStorage.setItem(storageKey, JSON.stringify(table_history.value));
      window.toastr.success('表格已删除');
    }
  }
};

// 初始化
refreshTableHistory();
</script>

<style scoped>
.table-tab {
  height: 100%;
  overflow-y: auto;
  padding: 25px !important;
}

/* 滚动条样式 */
.table-tab::-webkit-scrollbar {
  width: 6px;
}

.table-tab::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.table-tab::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.table-tab::-webkit-scrollbar-thumb:hover {
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

.table-display {
  margin-top: 15px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 6px;
  background: #1a1a1a;
}

.table-display table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
}

.table-display th,
.table-display td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  padding: 8px;
  border: 1px solid #444;
}

.table-display th {
  background: #2a2a2a;
  font-weight: bold;
  color: #fff;
}

.table-display td {
  color: #e0e0e0;
}

/* 美化按钮的悬停效果 */
.copy-button:hover .shimmer-effect,
.delete-button:hover .shimmer-effect {
  left: 100%;
}

.copy-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

.delete-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}
</style>
