<template>
  <div class="pageable-statusbar-generator" style="padding: 25px; background: #1a1a1a">
    <!-- 标题说明 -->
    <div
      style="
        background: linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 20px;
        border: 1px solid rgba(74, 158, 255, 0.2);
      "
    >
      <h3 style="color: #4a9eff; margin: 0 0 10px 0; font-size: 20px; font-weight: 600">
        📖 翻页状态栏生成器
      </h3>
      <p style="color: #888; margin: 0; font-size: 14px; line-height: 1.6">
        用 AI 生成可翻页、可交互的多页面状态栏。描述你想要的样式，AI 会为你创造！
      </p>
    </div>

    <!-- 主内容区 -->
    <div style="display: grid; grid-template-columns: 400px 1fr; gap: 20px">
      <!-- 左侧：配置区 -->
      <div style="display: flex; flex-direction: column; gap: 15px">
        <!-- 触发正则 -->
        <div
          style="
            background: #2a2a2a;
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #3a3a3a;
          "
        >
          <label style="display: block; margin-bottom: 8px; color: #c0c0c0; font-size: 13px; font-weight: 600">
            触发正则
          </label>
          <input
            v-model="triggerRegex"
            type="text"
            placeholder="<-STATUS->"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
            "
          />
        </div>

        <!-- AI 生成区 -->
        <div
          style="
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(245, 158, 11, 0.3);
          "
        >
          <h4
            style="
              color: #f59e0b;
              margin: 0 0 12px 0;
              font-size: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            "
          >
            <i class="fa-solid fa-sparkles"></i>
            AI 智能生成
          </h4>
          <textarea
            v-model="aiPrompt"
            placeholder="✨ 描述你想要的翻页状态栏样式：&#10;&#10;例如：&#10;- 深色科技风格，左边圆形头像，右边3个标签页&#10;- 粉色可爱风格，显示角色信息、状态、关系&#10;- 游戏风格，HP/MP进度条，技能图标&#10;&#10;💡 提示：&#10;- 可以指定颜色、形状、布局&#10;- 可以要求动画效果&#10;- 可以参考游戏UI风格"
            :disabled="isGenerating"
            style="
              width: 100%;
              min-height: 200px;
              padding: 12px;
              background: #1e1e1e;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              resize: vertical;
              margin-bottom: 12px;
            "
          ></textarea>
          <button
            style="
              width: 100%;
              padding: 12px;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            :style="{ opacity: isGenerating ? 0.6 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }"
            :disabled="isGenerating"
            @click="generateWithAI"
          >
            <i
              :class="isGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"
              style="margin-right: 8px"
            ></i>
            {{ isGenerating ? '生成中...' : '✨ AI 一键生成' }}
          </button>
        </div>

        <!-- 操作按钮 -->
        <div style="display: flex; flex-direction: column; gap: 10px">
          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            :disabled="!generatedHTML"
            :style="{ opacity: !generatedHTML ? 0.5 : 1 }"
            @click="exportRegex"
          >
            <i class="fa-solid fa-download" style="margin-right: 8px"></i>
            导出正则 JSON
          </button>

          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            @click="loadExample"
          >
            <i class="fa-solid fa-lightbulb" style="margin-right: 8px"></i>
            加载示例
          </button>

          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            @click="clearAll"
          >
            <i class="fa-solid fa-trash" style="margin-right: 8px"></i>
            清空所有
          </button>
        </div>
      </div>

      <!-- 右侧：预览区 -->
      <div
        style="
          background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #10b981;
          display: flex;
          flex-direction: column;
          min-height: 700px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
        "
      >
        <div
          style="
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
            border-radius: 10px;
            border: 1px solid rgba(16, 185, 129, 0.3);
          "
        >
          <i class="fa-solid fa-eye" style="color: #10b981; font-size: 18px"></i>
          <span style="color: #fff; font-size: 16px; font-weight: 700">实时预览</span>
        </div>

        <div
          style="
            flex: 1;
            background: linear-gradient(135deg, #1e1e1e 0%, #252525 100%);
            border-radius: 12px;
            padding: 30px;
            overflow: auto;
            border: 2px solid #3a3a3a;
            box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
          "
        >
          <iframe
            v-if="generatedHTML"
            :srcdoc="previewHTML"
            style="width: 100%; height: 100%; min-height: 600px; border: none; border-radius: 8px; background: white"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
          <div
            v-else
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: #666;
              text-align: center;
            "
          >
            <div>
              <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3"></i>
              <p style="font-size: 16px">使用 AI 生成或加载示例查看预览</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore, normalizeApiEndpoint, filterApiParams } from '../settings';

// Settings store
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

// 状态
const triggerRegex = ref('<-STATUS->');
const aiPrompt = ref('');
const isGenerating = ref(false);
const generatedHTML = ref('');

// 预览 HTML
const previewHTML = computed(() => {
  if (!generatedHTML.value) return '';

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
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ${generatedHTML.value}
</body>
</html>
  `;
});

// AI 生成
const generateWithAI = async () => {
  if (!aiPrompt.value.trim()) {
    (window as any).toastr?.warning('请输入生成需求');
    return;
  }

  if (!settings.value.api_endpoint || !settings.value.api_key) {
    (window as any).toastr?.error('请先在"设置"标签页配置 API');
    return;
  }

  isGenerating.value = true;

  const systemPrompt = `你是一个专业的前端设计师，专门为 SillyTavern 生成翻页状态栏。

【输出格式】：
必须输出一个完整的 HTML 代码块，包含：
1. <style> 标签内的所有 CSS 样式
2. HTML 结构（使用 <details> 和 <summary>）
3. <script> 标签内的翻页 JavaScript 代码

【HTML 结构要求】：
<details>
<summary>状态栏标题</summary>
<div class="status-container">
  <!-- 翻页按钮/标签页 -->
  <div class="page-tabs">
    <button class="page-tab active" onclick="switchPage(0)">页面1</button>
    <button class="page-tab" onclick="switchPage(1)">页面2</button>
  </div>

  <!-- 页面内容 -->
  <div class="page-content">
    <div class="page active" data-page="0">
      <div>字段1: $1</div>
      <div>字段2: $2</div>
    </div>
    <div class="page" data-page="1">
      <div>字段3: $3</div>
      <div>字段4: $4</div>
    </div>
  </div>
</div>
</details>

【JavaScript 要求】：
<script>
function switchPage(index) {
  document.querySelectorAll('.page-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.page').forEach((page, i) => {
    page.classList.toggle('active', i === index);
  });
}
</script>

【关键要求】：
1. 使用 $1, $2, $3 等占位符表示字段值
2. 生成 2-4 个页面，每个页面显示不同字段
3. CSS 样式要富有创意，符合用户需求
4. 翻页按钮要美观、易用
5. 直接输出完整的 HTML 代码，不要添加任何解释文字
6. 不要使用 \`\`\`html 代码块标记`;

  try {
    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    const requestParams = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `用户需求：${aiPrompt.value.trim()}\n\n现在直接输出完整的 HTML 代码：` },
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

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.content || '';

    // 清理代码块标记
    content = content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 提取 <details> 到 </details> 之间的内容
    const detailsMatch = content.match(/<details[\s\S]*?<\/details>/i);
    if (detailsMatch) {
      generatedHTML.value = detailsMatch[0];
      (window as any).toastr?.success('✨ AI 生成成功！');
    } else {
      // 如果没有 <details>，尝试提取整个 HTML
      generatedHTML.value = content;
      (window as any).toastr?.warning('生成成功，但格式可能需要调整');
    }
  } catch (error) {
    console.error('AI 生成失败:', error);
    (window as any).toastr?.error('AI 生成失败：' + (error as Error).message);
  } finally {
    isGenerating.value = false;
  }
};

// 导出正则
const exportRegex = () => {
  if (!generatedHTML.value) {
    (window as any).toastr?.warning('请先生成内容');
    return;
  }

  const uuid = `regex-pageable-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const regexData = {
    id: uuid,
    scriptName: '翻页状态栏',
    findRegex: triggerRegex.value,
    replaceString: generatedHTML.value,
    trimStrings: [],
    placement: [2], // AI回复前
    disabled: false,
    runOnEdit: true,
  };

  const jsonStr = JSON.stringify(regexData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pageable-statusbar.json';
  a.click();
  URL.revokeObjectURL(url);

  (window as any).toastr?.success('✅ 正则已导出');
};

// 加载示例
const loadExample = () => {
  aiPrompt.value = '深色科技风格的角色状态栏，包含3个标签页：\n1. 基础信息（姓名、年龄、性别、职业）\n2. 状态（HP、MP、体力、精力，使用进度条）\n3. 关系（好感度、信任度、关系状态）\n\n使用蓝色渐变配色，圆角卡片设计，标签页按钮要有悬停效果';
  (window as any).toastr?.info('已加载示例，点击"AI 一键生成"开始');
};

// 清空所有
const clearAll = () => {
  if (confirm('确定要清空所有内容吗？')) {
    triggerRegex.value = '<-STATUS->';
    aiPrompt.value = '';
    generatedHTML.value = '';
    (window as any).toastr?.success('已清空');
  }
};
</script>

<style scoped>
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  cursor: not-allowed !important;
  opacity: 0.5 !important;
}

textarea:focus,
input:focus {
  outline: none;
  border-color: #4a9eff;
}
</style>
