<template>
  <div class="pageable-statusbar-generator">
    <!-- 顶部操作栏 -->
    <div
      class="section-header"
      style="
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
        margin-bottom: 20px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow:
          0 3px 12px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.04),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      "
    >
      <h3
        style="
          margin: 0;
          color: #fff;
          font-size: 16px !important;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        "
      >
        <i class="fa-solid fa-book-open" style="color: #4a9eff; font-size: 18px"></i>
        翻页状态栏生成器
      </h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <button
          class="action-button"
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          @click="loadExample"
        >
          <i class="fa-solid fa-lightbulb" style="margin-right: 6px"></i>
          加载示例
        </button>
        <button
          class="action-button"
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          :disabled="isGenerating"
          @click="generateWithAI"
        >
          <i
            :class="isGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"
            style="margin-right: 6px"
          ></i>
          {{ isGenerating ? '生成中...' : 'AI 生成' }}
        </button>
        <button
          class="action-button"
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          :disabled="!generatedHTML"
          @click="exportRegex"
        >
          <i class="fa-solid fa-download" style="margin-right: 6px"></i>
          导出正则
        </button>
        <button
          class="action-button"
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          :disabled="!generatedHTML"
          @click="showWorldbookGuide"
        >
          <i class="fa-solid fa-book" style="margin-right: 6px"></i>
          世界书说明
        </button>
        <button
          class="action-button"
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          "
          @click="clearAll"
        >
          <i class="fa-solid fa-trash" style="margin-right: 6px"></i>
          清空
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div style="display: grid; grid-template-columns: 350px 1fr 500px; gap: 20px; min-height: 600px">
      <!-- 左侧：配置区 -->
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #3a3a3a;
          display: flex;
          flex-direction: column;
          gap: 20px;
        "
      >
        <div>
          <h4
            style="
              margin: 0 0 12px 0;
              color: #fff;
              font-size: 14px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            "
          >
            <i class="fa-solid fa-cog" style="color: #4a9eff"></i>
            基础配置
          </h4>

          <div style="margin-bottom: 15px">
            <label style="display: block; margin-bottom: 8px; color: #c0c0c0; font-size: 12px; font-weight: 600"
              >触发正则</label
            >
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
        </div>

        <div
          style="
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
            padding: 15px;
            border-radius: 12px;
            border: 1px solid rgba(245, 158, 11, 0.3);
          "
        >
          <h4 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 14px; display: flex; align-items: center; gap: 8px">
            <i class="fa-solid fa-sparkles"></i>
            AI 需求描述
          </h4>
          <textarea
            v-model="aiPrompt"
            placeholder="✨ 描述你想要的翻页状态栏：&#10;&#10;例如：&#10;- 深色科技风格，3个标签页&#10;- 粉色可爱风格，显示角色信息&#10;- 游戏风格，HP/MP进度条"
            :disabled="isGenerating"
            style="
              width: 100%;
              min-height: 200px;
              padding: 12px;
              background: #1e1e1e;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              color: #e0e0e0;
              font-size: 12px;
              line-height: 1.6;
              resize: vertical;
            "
          ></textarea>
        </div>
      </div>

      <!-- 中间：代码编辑区 -->
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #3a3a3a;
          display: flex;
          flex-direction: column;
        "
      >
        <h4
          style="
            margin: 0 0 15px 0;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <i class="fa-solid fa-code" style="color: #10b981"></i>
          生成的代码
        </h4>

        <textarea
          v-model="generatedHTML"
          placeholder="AI 生成的代码将显示在这里..."
          style="
            flex: 1;
            padding: 15px;
            background: #1e1e1e;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            color: #e0e0e0;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            resize: none;
            min-height: 500px;
          "
        ></textarea>
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
          <span style="color: #fff; font-size: 14px; font-weight: 600">实时预览</span>
        </div>

        <div
          style="
            flex: 1;
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            overflow: auto;
            border: 2px solid #3a3a3a;
          "
        >
          <div v-if="generatedHTML" v-html="previewHTML"></div>
          <div
            v-else
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: #999;
              text-align: center;
            "
          >
            <div>
              <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3"></i>
              <p style="font-size: 14px">使用 AI 生成或加载示例查看预览</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 世界书说明对话框 -->
    <div
      v-if="showWorldbookDialog"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      "
      @click.self="showWorldbookDialog = false"
    >
      <div
        style="
          background: #1e1e1e;
          border-radius: 16px;
          padding: 30px;
          max-width: 700px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        "
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
          <h3 style="color: #8b5cf6; margin: 0; font-size: 20px">
            <i class="fa-solid fa-book" style="margin-right: 8px"></i>
            世界书使用说明
          </h3>
          <button
            style="
              background: none;
              border: none;
              color: #888;
              font-size: 24px;
              cursor: pointer;
              padding: 0;
              width: 32px;
              height: 32px;
            "
            @click="showWorldbookDialog = false"
          >
            ×
          </button>
        </div>

        <div style="color: #ccc; line-height: 1.8">
          <div
            style="
              background: rgba(139, 92, 246, 0.1);
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #8b5cf6;
            "
          >
            <p style="margin: 0; font-size: 14px">
              <strong style="color: #8b5cf6">📌 使用方法：</strong><br />
              1. 在聊天中输入
              <code style="background: #2a2a2a; padding: 2px 6px; border-radius: 3px">{{ triggerRegex }}</code>
              触发状态栏<br />
              2. 在世界书中设置变量值，状态栏会自动替换显示
            </p>
          </div>

          <h4 style="color: #fff; margin: 20px 0 10px 0; font-size: 16px">
            <i class="fa-solid fa-list" style="color: #10b981; margin-right: 8px"></i>
            检测到的变量：
          </h4>

          <div v-if="detectedVariables.length > 0" style="margin-bottom: 20px">
            <div
              v-for="(variable, index) in detectedVariables"
              :key="index"
              style="
                background: #2a2a2a;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid #3a3a3a;
              "
            >
              <code style="color: #4a9eff; font-size: 14px; font-weight: 600">${{ variable }}</code>
              <p style="margin: 5px 0 0 0; color: #888; font-size: 12px">
                在世界书中使用：<code style="background: #1e1e1e; padding: 2px 6px; border-radius: 3px"
                  >字段{{ variable }}: 值</code
                >
              </p>
            </div>
          </div>

          <h4 style="color: #fff; margin: 20px 0 10px 0; font-size: 16px">
            <i class="fa-solid fa-code" style="color: #f59e0b; margin-right: 8px"></i>
            世界书示例：
          </h4>

          <pre
            style="
              background: #2a2a2a;
              padding: 15px;
              border-radius: 8px;
              overflow-x: auto;
              color: #e0e0e0;
              font-size: 12px;
              border: 1px solid #3a3a3a;
            "
            >{{ worldbookExample }}</pre
          >

          <div
            style="
              background: rgba(16, 185, 129, 0.1);
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              border-left: 4px solid #10b981;
            "
          >
            <p style="margin: 0; font-size: 13px">
              <strong style="color: #10b981">💡 提示：</strong><br />
              - 变量值会自动替换到状态栏中<br />
              - 可以在角色卡或世界书中动态更新这些值<br />
              - AI 回复时也可以更新变量值
            </p>
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

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const triggerRegex = ref('<-STATUS->');
const aiPrompt = ref('');
const isGenerating = ref(false);
const generatedHTML = ref('');
const showWorldbookDialog = ref(false);

// 预览 HTML
const previewHTML = computed(() => {
  if (!generatedHTML.value) return '';
  return generatedHTML.value;
});

// 检测变量
const detectedVariables = computed(() => {
  if (!generatedHTML.value) return [];
  const matches = generatedHTML.value.match(/\$(\d+)/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.substring(1)))].sort((a, b) => parseInt(a) - parseInt(b));
});

// 世界书示例
const worldbookExample = computed(() => {
  if (detectedVariables.value.length === 0) return '';

  const examples = detectedVariables.value
    .map((num, index) => {
      const fieldNames = ['姓名', '年龄', '性别', '职业', 'HP', 'MP', '体力', '精力', '好感度', '信任度'];
      const fieldName = fieldNames[index] || `字段${num}`;
      const exampleValue = index === 0 ? '张三' : index === 1 ? '25' : index === 2 ? '男' : '示例值';
      return `字段${num}: ${exampleValue}  // ${fieldName}`;
    })
    .join('\n');

  return `[角色状态]
${examples}

// 在世界书中创建一个条目，包含以上内容
// 当触发 ${triggerRegex.value} 时，这些值会自动填充到状态栏`;
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

  const scriptTag = 'script';
  const systemPrompt = `你是一个专业的前端设计师，专门为 SillyTavern 生成翻页状态栏。

【输出格式】：
必须输出一个完整的 HTML 代码块，包含：
1. <style> 标签内的所有 CSS 样式
2. HTML 结构（使用 <details> 和 <summary>）
3. <${scriptTag}> 标签内的翻页 JavaScript 代码

【HTML 结构要求】：
<details>
<summary>状态栏标题</summary>
<div class="status-container">
  <div class="page-tabs">
    <button class="page-tab active" onclick="switchPage(0)">页面1</button>
    <button class="page-tab" onclick="switchPage(1)">页面2</button>
  </div>
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
<${scriptTag}>
function switchPage(index) {
  document.querySelectorAll('.page-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.page').forEach((page, i) => {
    page.classList.toggle('active', i === index);
  });
}
</${scriptTag}>

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

    content = content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const detailsRegex = new RegExp('<details[\\s\\S]*?</details>', 'i');
    const detailsMatch = content.match(detailsRegex);

    if (detailsMatch) {
      generatedHTML.value = detailsMatch[0];
      (window as any).toastr?.success('✨ AI 生成成功！');
    } else {
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
    placement: [2],
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

const loadExample = () => {
  aiPrompt.value =
    '深色科技风格的角色状态栏，包含3个标签页：\n1. 基础信息（姓名、年龄、性别、职业）\n2. 状态（HP、MP、体力、精力，使用进度条）\n3. 关系（好感度、信任度、关系状态）\n\n使用蓝色渐变配色，圆角卡片设计，标签页按钮要有悬停效果';
  (window as any).toastr?.info('已加载示例，点击"AI 生成"开始');
};

const showWorldbookGuide = () => {
  showWorldbookDialog.value = true;
};

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
.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-button:active {
  transform: translateY(0);
}

.action-button:disabled {
  cursor: not-allowed !important;
  opacity: 0.5 !important;
}

textarea:focus,
input:focus {
  outline: none;
  border-color: #4a9eff;
}
</style>
