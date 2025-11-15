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
      <h3 style="color: #4a9eff; margin: 0 0 10px 0; font-size: 20px; font-weight: 600">📖 翻页状态栏生成器</h3>
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
            placeholder="<-PAGEABLE_STATUS->"
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
            placeholder="✨ 描述你想要的翻页状态栏（描述越详细越精美）：&#10;&#10;🎨 风格示例：&#10;• 深色科技风：深灰渐变 #1e293b → #334155，蓝色强调 #3b82f6，发光效果，玻璃态&#10;• 粉色可爱风：粉色渐变 #ec4899 → #f472b6，圆润设计，卡片式布局，柔和动画&#10;• 赛博朋克风：紫色 #8b5cf6 + 霓虹边框，HP/MP 进度条，脉动动画&#10;• 商务简约风：灰蓝渐变 #475569 → #64748b，极简设计，专业配色&#10;&#10;💡 描述要点：&#10;1. 【风格】科技/可爱/游戏/商务/简约等&#10;2. 【配色】具体颜色值（如 #3b82f6）&#10;3. 【布局】标签页位置（顶部/左侧/右侧）&#10;4. 【页面内容】每页显示哪些字段&#10;5. 【特殊效果】渐变/阴影/发光/玻璃态/进度条等&#10;&#10;⚠️ 提示：描述越详细，AI 生成的界面越精美！"
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
const triggerRegex = ref('<-PAGEABLE_STATUS->');
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

  const systemPrompt = `🚫🚫🚫 严重警告 🚫🚫🚫

如果你生成这样的代码，将被拒绝：
❌ <span class="field-label">姓名</span><span class="field-value">$1</span>
❌ <div class="field-row"><span>姓名</span><span>$1</span></div>
❌ 任何使用 class 的字段
❌ 任何简单的文本行

你必须生成这样的代码：
✅ 每个字段必须是独立的 div 卡片
✅ 所有样式必须 inline（不要用 class）
✅ 必须有渐变/阴影/圆角

正确示例（强制照做）：
\`\`\`html
<div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.08)); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 18px 22px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1); transition: all 0.3s ease;">
  <div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 10px; font-weight: 600;">
    <i class="fa-solid fa-user" style="margin-right: 6px;"></i>姓名
  </div>
  <div style="font-size: 17px; color: #fff; font-weight: 500;">
    $1
  </div>
</div>

<div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.08)); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 18px 22px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.3s ease;">
  <div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 10px; font-weight: 600;">
    <i class="fa-solid fa-cake-candles" style="margin-right: 6px;"></i>年龄
  </div>
  <div style="font-size: 17px; color: #fff; font-weight: 500;">
    $2
  </div>
</div>
\`\`\`

# 任务
生成翻页状态栏（2-4个页面）

# 要求
1. 使用 $1, $2, $3 占位符
2. 容器用渐变背景 + 圆角 + 阴影
3. 标签页按钮三态明显
4. **每个字段必须完全按照上面的正确示例格式！**
5. 所有 style 必须 inline
6. 在 <details> 标签内
7. 包含 <style> 和 <script>

🚫 如果字段不是卡片（有完整 inline style），你的输出无效！🚫`;

  try {
    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    const requestParams = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `🎨 用户需求：
${aiPrompt.value.trim()}

📋 任务：
根据以上需求，创造一个**令人惊艳、极致精美**的翻页状态栏！

⚠️ 核心要求：
1. 完全按照用户需求自由设计，不要套模板
2. 字段项必须是精美卡片，禁止简单文本行
3. 必须使用渐变、阴影、圆角、动画等现代元素
4. 标签页三态（默认/悬停/激活）必须明显区分

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

  (window as any).toastr?.success('✅ 正则已导出');
};

// 清空所有
const clearAll = () => {
  if (confirm('确定要清空所有内容吗？')) {
    triggerRegex.value = '<-PAGEABLE_STATUS->';
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
