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
            placeholder="✨ 描述你想要的翻页状态栏（描述越详细越精美）：&#10;&#10;🎨 风格示例：&#10;• 深色科技风：深灰渐变 #1e293b → #334155，蓝色强调 #3b82f6，发光效果，玻璃态&#10;• 粉色可爱风：粉色渐变 #ec4899 → #f472b6，圆润设计，卡片式布局，柔和动画&#10;• 赛博朋克风：紫色 #8b5cf6 + 霓虹边框，HP/MP 进度条，脉动动画&#10;• 商务简约风：灰蓝渐变 #475569 → #64748b，极简设计，专业配色&#10;&#10;📝 字段示例：&#10;• 基础信息：时间、地点、天气、姿势&#10;• 角色状态：心情、健康值、能量值&#10;• ABO设定：发情期、抑制剂、标记状态&#10;• 游戏属性：等级、经验、金币、背包&#10;&#10;💡 描述要点：&#10;1. 【字段】需要显示哪些信息（会生成对应的世界书提示词）&#10;2. 【风格】科技/可爱/游戏/商务/简约等&#10;3. 【配色】具体颜色值（如 #3b82f6）&#10;4. 【布局】标签页位置（顶部/左侧/右侧）&#10;5. 【特殊效果】渐变/阴影/发光/玻璃态/进度条等&#10;&#10;⚠️ 提示：描述越详细，AI 生成的界面越精美！同时会生成可用于世界书的提示词。"
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

        <!-- 世界书提示词显示区 -->
        <div
          v-if="worldbookPrompt"
          style="
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(139, 92, 246, 0.3);
            margin-bottom: 15px;
          "
        >
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px">
            <h4 style="color: #8b5cf6; margin: 0; font-size: 15px; display: flex; align-items: center; gap: 8px">
              <i class="fa-solid fa-book"></i>
              世界书提示词
            </h4>
            <button
              style="
                padding: 6px 12px;
                background: rgba(139, 92, 246, 0.2);
                border: 1px solid rgba(139, 92, 246, 0.4);
                border-radius: 6px;
                color: #8b5cf6;
                font-size: 12px;
                cursor: pointer;
              "
              @click="copyWorldbookPrompt"
            >
              <i class="fa-solid fa-copy" style="margin-right: 4px"></i>
              复制
            </button>
          </div>
          <pre
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              padding: 12px;
              color: #e0e0e0;
              font-size: 12px;
              line-height: 1.5;
              margin: 0;
              overflow-x: auto;
              max-height: 300px;
              overflow-y: auto;
            "
            >{{ worldbookPrompt }}</pre
          >
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
import { getApiConfigError, isApiConfigValid } from '../utils/api-config';

// Settings store
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

// 状态
const triggerRegex = ref('<-PAGEABLE_STATUS->([\\s\\S]*?)</status>');
const aiPrompt = ref('');
const isGenerating = ref(false);
const generatedHTML = ref('');
const worldbookPrompt = ref(''); // 存储生成的世界书提示词

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

  if (!isApiConfigValid(settings.value.api_endpoint, settings.value.api_key)) {
    (window as any).toastr?.error(getApiConfigError(settings.value.api_endpoint));
    return;
  }

  isGenerating.value = true;

  const systemPrompt = `你需要生成两个部分：世界书提示词 和 HTML翻页状态栏。

# 第一部分：世界书提示词

\`\`\`
#指令：回复末尾需附带状态栏。

#⚠️ 核心警告:
严禁输出任何 HTML 代码！仅输出纯文本格式。

#格式要求：
1. 必须以 <status> 开头，</status> 结尾
2. 第一行必须是 <-PAGEABLE_STATUS->
3. 每行格式：{{字段名}}具体内容

#输出示例：
<status>
<-PAGEABLE_STATUS->
{{时间}}10:30
{{地点}}教室
{{心情}}开心
</status>
\`\`\`

# 第二部分：HTML 翻页状态栏

⚠️ 必须使用以下可靠模板结构（只修改样式和内容，不要修改翻页逻辑）：

\`\`\`html
<details open style="[你的容器样式]">
<summary style="[你的标题样式]">📊 状态栏</summary>
<div style="[你的内容容器样式]">
  <!-- 标签页按钮 -->
  <div style="display:flex;gap:8px;margin-bottom:12px;">
    <button onclick="this.parentElement.parentElement.querySelectorAll('[data-page]').forEach(p=>p.style.display='none');this.parentElement.parentElement.querySelector('[data-page=\\"1\\"]').style.display='block';this.parentElement.querySelectorAll('button').forEach(b=>b.style.opacity='0.6');this.style.opacity='1';" style="[按钮样式];opacity:1;">页面1</button>
    <button onclick="this.parentElement.parentElement.querySelectorAll('[data-page]').forEach(p=>p.style.display='none');this.parentElement.parentElement.querySelector('[data-page=\\"2\\"]').style.display='block';this.parentElement.querySelectorAll('button').forEach(b=>b.style.opacity='0.6');this.style.opacity='1';" style="[按钮样式];opacity:0.6;">页面2</button>
  </div>
  <!-- 页面内容 -->
  <div data-page="1" style="display:block;">
    <div style="[卡片样式]">$1</div>
    <div style="[卡片样式]">$2</div>
  </div>
  <div data-page="2" style="display:none;">
    <div style="[卡片样式]">$3</div>
    <div style="[卡片样式]">$4</div>
  </div>
</div>
</details>
\`\`\`

# 关键规则
1. **翻页逻辑必须用 onclick 内联**，不要用外部 script 标签
2. **使用 data-page 属性**区分页面，不要用 class
3. **按钮用 opacity 切换状态**（激活=1，未激活=0.6）
4. **$1 $2 $3 占位符**对应提示词字段顺序
5. 所有样式必须 inline
6. 根据用户需求设计配色和布局

用 === 分隔两部分输出。`;

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
5. 根据用户描述的字段生成对应的世界书提示词

💡 提示：如果用户描述了具体字段（如：时间、地点、心情等），请在世界书提示词中包含这些字段。

现在请输出：
1. 世界书提示词（纯文本格式，用于添加到世界书）
2. HTML 展示代码（用于预览效果）`,
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

    // 尝试分离世界书提示词和HTML代码
    const parts: string[] = content.split(/={3,}|---{3,}|###.*世界书.*###|###.*HTML.*###/i);

    if (parts.length >= 2) {
      // 找到世界书提示词部分
      const worldbookPart = parts.find(
        part => part.includes('#指令：') || part.includes('核心警告') || part.includes('<-PAGEABLE_STATUS->'),
      );

      // 找到HTML部分
      const htmlPart = parts.find(part => part.includes('<details') || part.includes('<div'));

      if (worldbookPart) {
        // 清理世界书提示词
        worldbookPrompt.value = worldbookPart
          .replace(/```.*?\n/g, '')
          .replace(/```/g, '')
          .trim();
      }

      if (htmlPart) {
        // 提取 <details> 到 </details> 之间的内容
        const detailsMatch = htmlPart.match(/<details[\s\S]*?<\/details>/i);
        if (detailsMatch) {
          generatedHTML.value = detailsMatch[0];
        } else {
          generatedHTML.value = htmlPart.trim();
        }
      }

      if (worldbookPrompt.value && generatedHTML.value) {
        (window as any).toastr?.success('✨ AI 生成成功！已生成世界书提示词和HTML预览');
      } else if (generatedHTML.value) {
        (window as any).toastr?.success('✨ AI 生成成功！');
      } else {
        (window as any).toastr?.warning('生成成功，但格式可能需要调整');
      }
    } else {
      // 兼容旧格式：只有HTML
      const detailsMatch = content.match(/<details[\s\S]*?<\/details>/i);
      if (detailsMatch) {
        generatedHTML.value = detailsMatch[0];
        (window as any).toastr?.success('✨ AI 生成成功！');
      } else {
        generatedHTML.value = content;
        (window as any).toastr?.warning('生成成功，但格式可能需要调整');
      }
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
    worldbookPrompt.value = '';
    (window as any).toastr?.success('已清空');
  }
};

// 复制世界书提示词
const copyWorldbookPrompt = () => {
  if (!worldbookPrompt.value) {
    (window as any).toastr?.warning('还没有生成世界书提示词');
    return;
  }

  // 复制到剪贴板
  navigator.clipboard
    .writeText(worldbookPrompt.value)
    .then(() => {
      (window as any).toastr?.success('✅ 世界书提示词已复制到剪贴板');
    })
    .catch(() => {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = worldbookPrompt.value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      (window as any).toastr?.success('✅ 世界书提示词已复制到剪贴板');
    });
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
