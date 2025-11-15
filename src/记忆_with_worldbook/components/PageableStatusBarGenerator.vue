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
      <h3 style="color: #4a9eff; margin: 0 0 10px 0; font-size: 20px; font-weight: 600">翻页状态栏生成器</h3>
      <p style="color: #888; margin: 0; font-size: 14px; line-height: 1.6">
        用 AI 生成可翻页、可交互的多页面状态栏。描述你想要的样式，AI 会为你创造！
      </p>
    </div>

    <!-- 主内容区 -->
    <div style="display: grid; grid-template-columns: 400px 1fr; gap: 20px">
      <!-- 左侧：配置区 -->
      <div style="display: flex; flex-direction: column; gap: 15px">
        <!-- 触发正则 -->
        <div style="background: #2a2a2a; padding: 15px; border-radius: 12px; border: 1px solid #3a3a3a">
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
          <h4 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 15px; display: flex; align-items: center; gap: 8px">
            <i class="fa-solid fa-sparkles"></i>
            AI 智能生成
          </h4>
          <textarea
            v-model="aiPrompt"
            placeholder="描述你想要的翻页状态栏（描述越详细越精美）&#10;&#10;风格示例：&#10;• 深色科技风：深灰渐变 #1e293b → #334155，蓝色强调 #3b82f6，发光效果，玻璃态&#10;• 粉色可爱风：粉色渐变 #ec4899 → #f472b6，圆润设计，卡片式布局，柔和动画&#10;• 赛博朋克风：紫色 #8b5cf6 + 霓虹边框，HP/MP 进度条，脉动动画&#10;• 商务简约风：灰蓝渐变 #475569 → #64748b，极简设计，专业配色&#10;&#10;描述要点：&#10;1. 风格 - 科技/可爱/游戏/商务/简约等&#10;2. 配色 - 具体颜色值（如 #3b82f6）&#10;3. 布局 - 标签页位置（顶部/左侧/右侧）&#10;4. 页面内容 - 每页显示哪些字段&#10;5. 特殊效果 - 渐变/阴影/发光/玻璃态/进度条等&#10;&#10;提示：描述越详细，AI 生成的界面越精美"
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
            {{ isGenerating ? '生成中...' : 'AI 一键生成' }}
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
          background: linear-gradient(135deg, #2d2d2d 0%, #242424 100%);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #3a3a3a;
          display: flex;
          flex-direction: column;
          min-height: 700px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        "
      >
        <div
          style="
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%);
            border-radius: 12px;
            border: 1px solid rgba(16, 185, 129, 0.25);
          "
        >
          <i class="fa-solid fa-eye" style="color: #10b981; font-size: 16px"></i>
          <span style="color: #e0e0e0; font-size: 15px; font-weight: 600; letter-spacing: 0.3px">实时预览</span>
        </div>

        <div
          style="
            flex: 1;
            background: #1a1a1a;
            border-radius: 12px;
            padding: 24px;
            overflow: auto;
            border: 1px solid #333;
            box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
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
              <p style="font-size: 16px">使用 AI 生成查看预览</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { filterApiParams, normalizeApiEndpoint, useSettingsStore } from '../settings';

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

  const systemPrompt = `你是专业的前端工程师。根据用户需求,生成精美的翻页状态栏 HTML 代码。

强制要求：禁止使用任何 emoji 符号!包括但不限于: 😀 🎯 💡 ❤️ 等所有 Unicode emoji 字符。所有文字必须使用纯文本,简洁专业。

输出要求：直接输出完整的 HTML 代码,不要任何解释文字,不要 Markdown 代码块标记(\\\`\\\`\\\`),直接输出纯 HTML。

---

完整代码示例(必须严格参照):

示例 1:现代简约风格

<details open>
<summary>角色状态面板</summary>
<div class="status-container">
<style>
.status-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 500px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 252, 0.98) 100%);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 22px 32px;
  border-radius: 20px 20px 0 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  user-select: none;
}
summary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35);
}
.page-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 14px;
}
.page-tab {
  flex: 1;
  padding: 12px 18px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}
.page-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #475569;
}
.page-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}
.page-content {
  min-height: 280px;
  position: relative;
}
.page {
  display: none;
  animation: pageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page.active {
  display: block;
}
@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 10px;
  background: #ffffff;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}
.field-row:hover {
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12);
  border-left-color: #764ba2;
}
.field-label {
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}
.field-value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}
</style>
  <div class="page-tabs">
    <button class="page-tab active" onclick="switchPage(0)">基础信息</button>
    <button class="page-tab" onclick="switchPage(1)">状态属性</button>
    <button class="page-tab" onclick="switchPage(2)">关系面板</button>
  </div>
  <div class="page-content">
    <div class="page active" data-page="0">
      <div class="field-row">
        <span class="field-label">姓名</span>
        <span class="field-value">$1</span>
      </div>
      <div class="field-row">
        <span class="field-label">年龄</span>
        <span class="field-value">$2</span>
      </div>
      <div class="field-row">
        <span class="field-label">性别</span>
        <span class="field-value">$3</span>
      </div>
      <div class="field-row">
        <span class="field-label">职业</span>
        <span class="field-value">$4</span>
      </div>
    </div>
    <div class="page" data-page="1">
      <div class="field-row">
        <span class="field-label">生命值</span>
        <span class="field-value">$5</span>
      </div>
      <div class="field-row">
        <span class="field-label">魔法值</span>
        <span class="field-value">$6</span>
      </div>
      <div class="field-row">
        <span class="field-label">体力值</span>
        <span class="field-value">$7</span>
      </div>
      <div class="field-row">
        <span class="field-label">精力值</span>
        <span class="field-value">$8</span>
      </div>
    </div>
    <div class="page" data-page="2">
      <div class="field-row">
        <span class="field-label">好感度</span>
        <span class="field-value">$9</span>
      </div>
      <div class="field-row">
        <span class="field-label">信任度</span>
        <span class="field-value">$10</span>
      </div>
      <div class="field-row">
        <span class="field-label">关系状态</span>
        <span class="field-value">$11</span>
      </div>
    </div>
  </div>
</div>
</details>
<script>
function switchPage(index) {
  document.querySelectorAll('.page-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.page').forEach((page) => {
    const pageIndex = parseInt(page.getAttribute('data-page'));
    page.classList.toggle('active', pageIndex === index);
  });
}
</script>

---

生成规则:

参照上述示例,按以下要求生成代码:

1. 必须包含的结构:
   - <details open> + <summary> 标题
   - 容器 div(自定义 class 名)
   - <style> 标签(内联样式)
   - .page-tabs(标签栏,3-4 个标签)
   - .page-content(内容区)
   - 每个 .page 使用 data-page="0/1/2" 标识
   - <script> 标签实现 switchPage 函数

2. 字段占位符:
   - 使用 $1, $2, $3... $15 表示动态字段
   - 生成 10-15 个字段,合理分布在 3 个页面
   - 字段名简洁专业,不使用 emoji

3. 设计质量:
   - 多层渐变背景(linear-gradient 至少 2 层)
   - 精致阴影效果(box-shadow 多层叠加)
   - 流畅过渡动画(transition 0.3s)
   - 悬停交互反馈(hover 效果)
   - 页面切换动画(@keyframes)
   - 统一圆角(border-radius 12px-20px)

4. 配色协调:
   - 根据用户需求选择主题色
   - 背景使用半透明渐变
   - 文字对比度足够
   - 激活状态明显高亮

5. 代码质量:
   - CSS 类名语义化
   - 样式集中在 <style> 内
   - JavaScript 简洁高效
   - 完整可运行,无需外部依赖

---

再次强调:
严格禁止使用 emoji! 包括:
- 标签按钮文字: 使用"基础信息"而非"基础信息"
- 字段标签: 使用"姓名"而非"姓名"
- summary 标题: 使用纯文字,不要任何表情符号

违反此规则将视为失败!

---

现在,根据用户的需求,直接生成一个完整的 HTML 代码。不要任何解释`;

  try {
    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    const requestParams = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `用户需求：
${aiPrompt.value.trim()}

任务：
根据以上需求，创造一个令人惊艳、极致精美的翻页状态栏。

核心要求：
1. 完全按照用户需求自由设计，不要套模板
2. 字段项必须是精美卡片，禁止简单文本行
3. 必须使用渐变、阴影、圆角、动画等现代元素
4. 标签页三态（默认/悬停/激活）必须明显区分
5. 不要在生成的界面中使用任何 emoji 表情符号

现在直接输出完整的 HTML 代码（不要添加解释）：`,
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
      (window as any).toastr?.success('AI 生成成功');
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

  // 清理HTML：去除Windows的\r，标准化换行符（和普通状态栏生成器保持一致）
  const cleanReplaceString = generatedHTML.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  const regexData = {
    id: uuid,
    scriptName: '翻页状态栏',
    findRegex: triggerRegex.value,
    replaceString: cleanReplaceString,
    trimStrings: [],
    placement: [2], // AI回复前
    disabled: false,
    markdownOnly: true, // 重要：仅在Markdown中生效，让HTML正确渲染
    promptOnly: false,
    runOnEdit: true,
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
  };

  const jsonStr = JSON.stringify(regexData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pageable-statusbar.json';
  a.click();
  URL.revokeObjectURL(url);

  (window as any).toastr?.success('正则已导出');
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
