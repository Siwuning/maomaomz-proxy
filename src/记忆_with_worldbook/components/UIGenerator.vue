<template>
  <div class="ui-generator">
    <!-- 顶部操作栏 -->
    <div class="section-header">
      <h3>
        <i class="fa-solid fa-palette" style="color: #4a9eff; font-size: 18px"></i>
        前端界面生成器
      </h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <button class="action-button primary" @click="loadExample">
          <i class="fa-solid fa-lightbulb"></i>
          加载示例
        </button>
        <button class="action-button warning" :disabled="isGenerating" @click="generateWithAI">
          <i :class="isGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"></i>
          {{ isGenerating ? '生成中...' : 'AI 生成' }}
        </button>
        <button class="action-button info" :disabled="!generatedCode" @click="modifyWithAI">
          <i class="fa-solid fa-pen-to-square"></i>
          AI 修改
        </button>
        <button class="action-button success" :disabled="!generatedCode" @click="exportRegex">
          <i class="fa-solid fa-download"></i>
          导出正则
        </button>
        <button class="action-button purple" @click="restoreFromBackup">
          <i class="fa-solid fa-clock-rotate-left"></i>
          恢复备份
        </button>
        <button class="action-button danger" @click="clearAll">
          <i class="fa-solid fa-trash"></i>
          清空
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：需求输入区 -->
      <div class="left-panel">
        <div class="input-section">
          <h4>
            <i class="fa-solid fa-sparkles" style="color: #f59e0b"></i>
            需求描述
          </h4>
          <textarea
            v-model="userPrompt"
            :placeholder="
              isModifyMode
                ? '✨ 描述你想要的修改：\n\n例如：\n- 把背景改成深蓝色\n- 添加一个按钮\n- 把字体改大一点'
                : '✨ 描述你想要的界面：\n\n例如：\n- 一个简单的登录表单\n- 卡片式的产品展示页面\n- 带进度条的任务列表'
            "
            :disabled="isGenerating"
            class="prompt-textarea"
          ></textarea>
        </div>

        <div class="input-section">
          <h4>
            <i class="fa-solid fa-code" style="color: #10b981"></i>
            触发正则
          </h4>
          <input v-model="triggerRegex" type="text" placeholder="/【界面】/g" class="regex-input" />
        </div>

        <div v-if="isModifyMode" class="modify-tips">
          <i class="fa-solid fa-info-circle"></i>
          <span>修改模式：AI 会基于当前代码进行修改</span>
        </div>
      </div>

      <!-- 中间：代码编辑区 -->
      <div class="middle-panel">
        <h4>
          <i class="fa-solid fa-file-code" style="color: #667eea"></i>
          生成的代码
        </h4>
        <textarea
          v-model="generatedCode"
          placeholder="AI 生成的 HTML 代码将显示在这里..."
          class="code-textarea"
        ></textarea>
      </div>

      <!-- 右侧：预览区 -->
      <div class="right-panel">
        <div class="preview-header">
          <i class="fa-solid fa-eye"></i>
          <span>实时预览</span>
        </div>
        <div class="preview-container">
          <iframe
            v-if="generatedCode"
            :srcdoc="previewHTML"
            class="preview-iframe"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
          <div v-else class="preview-placeholder">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <p>使用 AI 生成或加载示例查看预览</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { filterApiParams, normalizeApiEndpoint, useSettingsStore } from '../settings';

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const triggerRegex = ref('/【界面】/g');
const userPrompt = ref('');
const isGenerating = ref(false);
const generatedCode = ref('');
const isModifyMode = ref(false);

// localStorage 键名
const STORAGE_KEY = 'ui_generator_data';
const STORAGE_VERSION = 1;
const BACKUP_KEY = 'ui_generator_backup';
const MAX_BACKUPS = 3;
const GENERATING_STATE_KEY = 'ui_generator_generating_state';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let checkInterval: ReturnType<typeof setInterval> | null = null;

// 从 localStorage 加载数据
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const version = parsed.version || 1;
      let data = parsed.data || parsed;

      triggerRegex.value = data.triggerRegex || '/【界面】/g';
      userPrompt.value = data.userPrompt || '';
      generatedCode.value = data.generatedCode || '';

      console.log('✅ 已从 localStorage 加载 UI 生成器数据');
    }
  } catch (error) {
    console.error('❌ 加载数据失败:', error);
  }
};

// 保存到 localStorage（带防抖）
const saveToStorage = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    try {
      const data = {
        triggerRegex: triggerRegex.value,
        userPrompt: userPrompt.value,
        generatedCode: generatedCode.value,
      };

      const wrappedData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        data: data,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrappedData));
      createBackup(data);

      console.log('💾 UI 生成器数据已保存');
    } catch (error) {
      console.error('❌ 保存数据失败:', error);
    }
  }, 500);
};

// 创建备份
const createBackup = (data: any) => {
  try {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    let backups: any[] = backupStr ? JSON.parse(backupStr) : [];

    backups.unshift({ ...data, timestamp: Date.now() });

    if (backups.length > MAX_BACKUPS) {
      backups = backups.slice(0, MAX_BACKUPS);
    }

    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
  } catch (error) {
    console.warn('⚠️ 创建备份失败:', error);
  }
};

// 检查未完成的生成任务
const checkPendingGeneration = () => {
  try {
    const stateStr = localStorage.getItem(GENERATING_STATE_KEY);
    if (stateStr) {
      const state = JSON.parse(stateStr);
      if (state.isGenerating && Date.now() - state.startTime < 10 * 60 * 1000) {
        isGenerating.value = true;
        (window as any).toastr?.info('检测到后台生成任务正在进行中...');
        startStatusPolling();
      } else {
        localStorage.removeItem(GENERATING_STATE_KEY);
      }
    }
  } catch (error) {
    console.error('检查生成状态失败:', error);
  }
};

// 轮询生成状态
const startStatusPolling = () => {
  if (checkInterval) return;

  checkInterval = setInterval(() => {
    const stateStr = localStorage.getItem(GENERATING_STATE_KEY);
    if (!stateStr) {
      isGenerating.value = false;
      stopStatusPolling();
    } else {
      const state = JSON.parse(stateStr);
      if (Date.now() - state.startTime > 10 * 60 * 1000) {
        localStorage.removeItem(GENERATING_STATE_KEY);
        isGenerating.value = false;
        stopStatusPolling();
        (window as any).toastr?.warning('生成任务超时');
      }
    }
  }, 1000);
};

const stopStatusPolling = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

// 预览 HTML
const previewHTML = computed(() => {
  if (!generatedCode.value) return '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  ${generatedCode.value}
</body>
</html>
  `;
});

// AI 生成
const generateWithAI = async () => {
  if (!userPrompt.value.trim()) {
    (window as any).toastr?.warning('请输入需求描述');
    return;
  }

  if (!settings.value.api_endpoint || !settings.value.api_key) {
    (window as any).toastr?.error('请先在"设置"标签页配置 API');
    return;
  }

  isGenerating.value = true;
  isModifyMode.value = false;

  localStorage.setItem(
    GENERATING_STATE_KEY,
    JSON.stringify({
      isGenerating: true,
      startTime: Date.now(),
      prompt: userPrompt.value.substring(0, 50),
    }),
  );

  startStatusPolling();

  const { useTaskStore } = await import('../taskStore');
  const taskStore = useTaskStore();
  const taskId = taskStore.createTask('ui_generate', `AI 生成界面: ${userPrompt.value.substring(0, 30)}...`);

  const systemPrompt = `你是一个前端界面生成专家。根据用户需求，生成简洁、美观的 HTML 代码。

要求：
1. 只输出 HTML 代码，不要有任何解释文字
2. 使用内联 CSS 样式，确保样式完整
3. 不要使用外部资源（图片、字体等）
4. 代码要简洁、语义化
5. 确保响应式设计
6. 使用现代化的设计风格
7. 可以使用 JavaScript 增强交互效果

直接输出 HTML 代码，不要有 markdown 标记。`;

  const executeGeneration = async () => {
    try {
      taskStore.updateTaskProgress(taskId, 10, '正在准备...');

      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

      taskStore.updateTaskProgress(taskId, 20, '正在连接 AI...');

      const requestParams = {
        model: settings.value.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `用户需求：${userPrompt.value.trim()}\n\n现在直接输出完整的 HTML 代码：` },
        ],
        max_tokens: Math.min(settings.value.max_tokens, 8192),
        temperature: settings.value.temperature,
      };

      const filteredParams = filterApiParams(requestParams, settings.value.api_endpoint);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.value.api_key}`,
        },
        body: JSON.stringify(filteredParams),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败 (${response.status})`);
      }

      taskStore.updateTaskProgress(taskId, 60, '正在接收 AI 响应...');

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || data.content || '';

      taskStore.updateTaskProgress(taskId, 80, '正在解析结果...');

      content = content
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      generatedCode.value = content;
      taskStore.completeTask(taskId, '✨ AI 生成成功！');
      (window as any).toastr?.success('✨ AI 生成成功！');
    } catch (error) {
      console.error('AI 生成失败:', error);
      taskStore.failTask(taskId, (error as Error).message);
      (window as any).toastr?.error('AI 生成失败：' + (error as Error).message);
    } finally {
      isGenerating.value = false;
      localStorage.removeItem(GENERATING_STATE_KEY);
      stopStatusPolling();
    }
  };

  executeGeneration();
};

// AI 修改
const modifyWithAI = async () => {
  if (!userPrompt.value.trim()) {
    (window as any).toastr?.warning('请输入修改需求');
    return;
  }

  if (!generatedCode.value) {
    (window as any).toastr?.warning('没有可修改的代码');
    return;
  }

  if (!settings.value.api_endpoint || !settings.value.api_key) {
    (window as any).toastr?.error('请先在"设置"标签页配置 API');
    return;
  }

  isGenerating.value = true;
  isModifyMode.value = true;

  localStorage.setItem(
    GENERATING_STATE_KEY,
    JSON.stringify({
      isGenerating: true,
      startTime: Date.now(),
      prompt: userPrompt.value.substring(0, 50),
    }),
  );

  startStatusPolling();

  const { useTaskStore } = await import('../taskStore');
  const taskStore = useTaskStore();
  const taskId = taskStore.createTask('ui_modify', `AI 修改界面: ${userPrompt.value.substring(0, 30)}...`);

  const systemPrompt = `你是一个前端界面修改专家。根据用户的修改需求，对现有的 HTML 代码进行修改。

要求：
1. 只输出修改后的完整 HTML 代码，不要有任何解释文字
2. 保持原有的代码结构，只修改需要改动的部分
3. 确保修改后的代码仍然美观、完整
4. 直接输出 HTML 代码，不要有 markdown 标记`;

  const executeModification = async () => {
    try {
      taskStore.updateTaskProgress(taskId, 10, '正在准备...');

      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

      taskStore.updateTaskProgress(taskId, 20, '正在连接 AI...');

      const requestParams = {
        model: settings.value.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `现有代码：\n\`\`\`html\n${generatedCode.value}\n\`\`\`\n\n修改需求：${userPrompt.value.trim()}\n\n现在输出修改后的完整 HTML 代码：`,
          },
        ],
        max_tokens: Math.min(settings.value.max_tokens, 8192),
        temperature: settings.value.temperature,
      };

      const filteredParams = filterApiParams(requestParams, settings.value.api_endpoint);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.value.api_key}`,
        },
        body: JSON.stringify(filteredParams),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败 (${response.status})`);
      }

      taskStore.updateTaskProgress(taskId, 60, '正在接收 AI 响应...');

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || data.content || '';

      taskStore.updateTaskProgress(taskId, 80, '正在解析结果...');

      content = content
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      generatedCode.value = content;
      taskStore.completeTask(taskId, '✨ AI 修改成功！');
      (window as any).toastr?.success('✨ AI 修改成功！');
    } catch (error) {
      console.error('AI 修改失败:', error);
      taskStore.failTask(taskId, (error as Error).message);
      (window as any).toastr?.error('AI 修改失败：' + (error as Error).message);
    } finally {
      isGenerating.value = false;
      isModifyMode.value = false;
      localStorage.removeItem(GENERATING_STATE_KEY);
      stopStatusPolling();
    }
  };

  executeModification();
};

// 导出正则
const exportRegex = () => {
  if (!generatedCode.value) {
    (window as any).toastr?.warning('请先生成内容');
    return;
  }

  // 解析用户输入的正则表达式格式
  let findRegex = triggerRegex.value;

  // 如果是 /pattern/flags 格式，提取 pattern
  const regexMatch = triggerRegex.value.match(/^\/(.+?)\/([gimuy]*)$/);
  if (regexMatch) {
    // 用户输入的是正则格式，直接使用 pattern 部分
    findRegex = regexMatch[1];
  } else {
    // 用户输入的是普通字符串，需要转义
    findRegex = triggerRegex.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const uuid = `regex-ui-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const regexData = {
    id: uuid,
    scriptName: '前端界面',
    findRegex: findRegex,
    replaceString: generatedCode.value,
    trimStrings: [],
    placement: [2],
    disabled: false,
    runOnEdit: true,
  };

  const jsonStr = JSON.stringify(regexData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ui-generator.json';
  a.click();
  URL.revokeObjectURL(url);

  (window as any).toastr?.success('✅ 正则已导出');
};

// 加载示例
const loadExample = () => {
  userPrompt.value = '创建一个现代化的登录表单，包含用户名、密码输入框和登录按钮，使用深色主题和渐变背景';
  (window as any).toastr?.info('已加载示例，点击"AI 生成"开始');
};

// 恢复备份
const restoreFromBackup = () => {
  try {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (!backupStr) {
      (window as any).toastr?.warning('没有可用的备份');
      return;
    }

    const backups = JSON.parse(backupStr);
    if (!Array.isArray(backups) || backups.length === 0) {
      (window as any).toastr?.warning('没有可用的备份');
      return;
    }

    const latestBackup = backups[0];
    triggerRegex.value = latestBackup.triggerRegex || '/【界面】/g';
    userPrompt.value = latestBackup.userPrompt || '';
    generatedCode.value = latestBackup.generatedCode || '';

    const backupTime = new Date(latestBackup.timestamp).toLocaleString('zh-CN');
    (window as any).toastr?.success(`✅ 已恢复备份 (${backupTime})`);
  } catch (error) {
    console.error('恢复备份失败:', error);
    (window as any).toastr?.error('恢复备份失败');
  }
};

// 清空
const clearAll = () => {
  if (confirm('确定要清空所有内容吗？\n\n注意：此操作会清空当前数据，但会保留备份。')) {
    triggerRegex.value = '/【界面】/g';
    userPrompt.value = '';
    generatedCode.value = '';
    isModifyMode.value = false;
    (window as any).toastr?.success('✅ 已清空，备份已保留');
  }
};

onMounted(() => {
  loadFromStorage();
  checkPendingGeneration();
});

onUnmounted(() => {
  stopStatusPolling();
});

watch([triggerRegex, userPrompt, generatedCode], () => {
  saveToStorage();
});

watch(
  () => isGenerating.value,
  newValue => {
    if (!newValue) {
      localStorage.removeItem(GENERATING_STATE_KEY);
    }
  },
);
</script>

<style scoped>
.ui-generator {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: linear-gradient(
    135deg,
    rgba(30, 30, 30, 0.95) 0%,
    rgba(38, 38, 38, 0.9) 50%,
    rgba(30, 30, 30, 0.95) 100%
  );
  backdrop-filter: blur(12px);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

.section-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.action-button.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.action-button.info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.action-button.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.action-button.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.action-button.danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.main-content {
  display: grid;
  grid-template-columns: 350px 1fr 500px;
  gap: 20px;
  flex: 1;
  min-height: 600px;
}

.left-panel,
.middle-panel,
.right-panel {
  background: #2a2a2a;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
}

.left-panel h4,
.middle-panel h4 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-section {
  margin-bottom: 20px;
}

.prompt-textarea,
.code-textarea {
  width: 100%;
  padding: 12px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  resize: none;
}

.prompt-textarea {
  min-height: 250px;
}

.code-textarea {
  flex: 1;
  min-height: 500px;
}

.prompt-textarea:focus,
.code-textarea:focus {
  outline: none;
  border-color: #4a9eff;
}

.regex-input {
  width: 100%;
  padding: 10px 12px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 13px;
}

.regex-input:focus {
  outline: none;
  border-color: #4a9eff;
}

.modify-tips {
  padding: 12px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
  border-radius: 8px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  color: #4a9eff;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  border-radius: 10px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  margin-bottom: 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.preview-header i {
  color: #10b981;
  font-size: 18px;
}

.preview-container {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #3a3a3a;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
  padding: 20px;
}

.preview-placeholder i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.preview-placeholder p {
  font-size: 14px;
}
</style>
