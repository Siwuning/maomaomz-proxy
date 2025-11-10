<template>
  <div class="regex-ui-generator" style="padding: 25px !important; background: #1a1a1a !important">
    <!-- 标题 -->
    <div
      style="
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 20px;
        border: 1px solid rgba(102, 126, 234, 0.2);
      "
    >
      <h3 style="color: #4a9eff; margin: 0 0 10px 0; font-size: 20px; font-weight: 600">🔧 酒馆正则界面生成器</h3>
      <p style="color: #888; margin: 0; font-size: 14px; line-height: 1.6">
        AI 辅助生成酒馆正则替换界面，用自然语言描述即可生成完整的 HTML/CSS/JS 代码
      </p>
    </div>

    <!-- 新手使用流程 -->
    <div
      style="
        background: #2a2a2a;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #ffc107;
      "
    >
      <h4 style="color: #ffc107; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center; gap: 8px">
        <i class="fa-solid fa-lightbulb"></i>
        新手使用流程（超简单！）：
      </h4>
      <ol style="margin: 0; padding-left: 20px; color: #ccc; line-height: 2">
        <li>
          <strong style="color: #fff">第1步：</strong> 输入触发词（比如
          <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 3px; color: #4a9eff">【状态栏】</code>
          ）
        </li>
        <li><strong style="color: #fff">第2步：</strong> 用自然语言描述你想要的界面（省略技术细节）</li>
        <li><strong style="color: #fff">第3步：</strong> 点击"AI 生成"，等几秒钟，AI 自动生成代码</li>
        <li>
          <strong style="color: #fff">第4步：</strong> 看右侧<strong style="color: #51cf66">实时预览</strong
          >，不满意就点"AI 修改"继续调整
        </li>
        <li><strong style="color: #fff">第5步：</strong> 点击"复制正则"，直接粘贴到酒馆正则里就完了！</li>
        <li>
          <strong style="color: #fff">完成！</strong> 现在在聊天中输入
          <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 3px; color: #51cf66">【状态栏】</code>
          就会显示你的界面了！
        </li>
      </ol>
    </div>

    <!-- 主内容区域：左右分栏 -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px">
      <!-- 左侧：输入区域 -->
      <div style="display: flex; flex-direction: column; gap: 20px">
        <!-- 触发关键词 -->
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px">
          <h4 style="color: #4a9eff; margin: 0 0 15px 0; font-size: 16px">
            <i class="fa-solid fa-key"></i>
            触发关键词:
          </h4>
          <input
            v-model="triggerKeyword"
            type="text"
            placeholder="输入触发词，例如：【开场白】"
            style="
              width: 100%;
              background: #1a1a1a;
              color: #e0e0e0;
              border: 1px solid #444;
              border-radius: 4px;
              padding: 12px;
              font-size: 14px;
            "
          />
        </div>

        <!-- 界面描述（AI 生成） -->
        <div
          style="background: #2a2a2a; padding: 20px; border-radius: 8px; flex: 1; display: flex; flex-direction: column"
        >
          <h4 style="color: #4a9eff; margin: 0 0 15px 0; font-size: 16px">
            <i class="fa-solid fa-magic"></i>
            界面描述（AI 生成）:
          </h4>
          <p style="color: #888; margin: 0 0 10px 0; font-size: 13px">
            用自然语言描述你想要的界面，比如：一个RPG游戏风格的状态栏，显示生命值、魔力值、经验值...
          </p>
          <textarea
            v-model="interfaceDescription"
            placeholder="详细描述你想要的界面（越详细越好）：&#10;- 说清楚你想要什么功能（如：生命值、魔力值、经验值）&#10;- 说清楚你想要什么样式（如：RPG游戏风格、赛博朋克、可爱风等）&#10;- 如果想要特殊效果（如：进度条、动画、按钮），也写清楚&#10;&#10;例如：&#10;我想要一个现代简洁风格的状态栏，显示当前日期、时间、地点、天气温度。"
            style="
              width: 100%;
              flex: 1;
              min-height: 200px;
              background: #1a1a1a;
              color: #e0e0e0;
              border: 1px solid #444;
              border-radius: 4px;
              padding: 12px;
              font-size: 14px;
              font-family: 'Consolas', monospace;
              resize: none;
              line-height: 1.6;
            "
          />

          <!-- AI 生成/修改按钮 -->
          <div style="display: flex; gap: 12px; margin-top: 15px">
            <button
              :disabled="!triggerKeyword || !interfaceDescription || isGenerating"
              style="
                flex: 1;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s;
              "
              :style="{ opacity: !triggerKeyword || !interfaceDescription || isGenerating ? 0.5 : 1 }"
              @click="generateWithAI"
            >
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              {{ isGenerating ? 'AI 生成中...' : generatedCode ? 'AI 重新生成' : 'AI 生成界面' }}
            </button>
            <button
              v-if="generatedCode"
              :disabled="isModifying"
              style="
                flex: 1;
                background: #ffc107;
                color: #000;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s;
              "
              :style="{ opacity: isModifying ? 0.5 : 1 }"
              @click="showModifyDialog"
            >
              <i class="fa-solid fa-edit"></i>
              {{ isModifying ? '修改中...' : 'AI 修改界面' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：实时预览 -->
      <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; display: flex; flex-direction: column">
        <h4 style="color: #51cf66; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center; gap: 8px">
          <i class="fa-solid fa-eye"></i>
          实时预览
          <span
            v-if="generatedCode"
            style="
              margin-left: auto;
              background: #51cf66;
              color: white;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 12px;
            "
            >已生成</span
          >
        </h4>
        <div
          style="
            flex: 1;
            background: #1a1a1a;
            border: 2px solid #444;
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          "
        >
          <div v-if="!generatedCode" style="text-align: center; color: #666; padding: 40px">
            <i class="fa-solid fa-image" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3"></i>
            <p style="font-size: 16px; margin: 0">等待生成...</p>
            <p style="font-size: 14px; margin: 10px 0 0 0">点击"AI 生成界面"后，预览将显示在这里</p>
          </div>
          <iframe
            v-else
            ref="previewFrame"
            :srcdoc="generatedCode"
            sandbox="allow-scripts allow-same-origin"
            style="width: 100%; height: 100%; border: none; background: white"
          ></iframe>
        </div>

        <!-- 复制正则按钮 -->
        <button
          v-if="generatedCode"
          style="
            margin-top: 15px;
            background: #51cf66;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
          "
          @click="copyRegex"
        >
          <i class="fa-solid fa-copy"></i> 复制正则代码
        </button>
      </div>
    </div>

    <!-- 生成的正则代码（可折叠） -->
    <div v-if="generatedRegex" style="background: #2a2a2a; padding: 20px; border-radius: 8px">
      <div
        style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 15px"
        @click="showCode = !showCode"
      >
        <h4 style="color: #4a9eff; margin: 0">
          <i class="fa-solid fa-code"></i>
          生成的正则代码
        </h4>
        <i
          :class="showCode ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #888; transition: transform 0.3s"
        ></i>
      </div>
      <div
        v-if="showCode"
        style="
          background: #1a1a1a;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #444;
          max-height: 300px;
          overflow-y: auto;
        "
      >
        <pre
          style="
            margin: 0;
            color: #e0e0e0;
            font-family: 'Consolas', monospace;
            font-size: 13px;
            white-space: pre-wrap;
            word-wrap: break-word;
          "
          >{{ generatedRegex }}</pre
        >
      </div>
    </div>

    <!-- AI 修改对话框 -->
    <div
      v-if="showModify"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      "
      @click.self="showModify = false"
    >
      <div
        style="
          background: #2a2a2a;
          border: 2px solid #ffc107;
          border-radius: 16px;
          padding: 30px;
          max-width: 600px;
          width: 100%;
        "
        @click.stop
      >
        <h3 style="color: #ffc107; margin: 0 0 20px 0">
          <i class="fa-solid fa-edit"></i>
          AI 修改界面
        </h3>
        <p style="color: #888; margin: 0 0 15px 0; line-height: 1.6">
          描述你想要修改的地方，AI 会在当前界面的基础上进行调整。例如：
        </p>
        <ul style="color: #888; margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8">
          <li>把生命值进度条改成红色</li>
          <li>增加一个金币显示</li>
          <li>调整整体布局，改成竖向排列</li>
          <li>添加一个按钮，点击后显示详细信息</li>
        </ul>
        <textarea
          v-model="modifyInstruction"
          placeholder="输入修改建议..."
          style="
            width: 100%;
            min-height: 150px;
            background: #1a1a1a;
            color: #e0e0e0;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 12px;
            font-size: 14px;
            margin-bottom: 20px;
            resize: vertical;
          "
        ></textarea>
        <div style="display: flex; gap: 12px">
          <button
            :disabled="!modifyInstruction || isModifying"
            style="
              flex: 1;
              background: #ffc107;
              color: #000;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
            "
            :style="{ opacity: !modifyInstruction || isModifying ? 0.5 : 1 }"
            @click="modifyWithAI"
          >
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            {{ isModifying ? '修改中...' : '确认修改' }}
          </button>
          <button
            style="
              flex: 1;
              background: #666;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
            "
            @click="showModify = false"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { klona } from 'klona';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { normalizeApiEndpoint, useSettingsStore } from '../settings';
import { useTaskStore } from '../taskStore';
import { copyToClipboard, getScriptIdSafe } from '../utils';

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const taskStore = useTaskStore();

const triggerKeyword = ref('【开场白】');
const interfaceDescription = ref('');
const generatedCode = ref('');
const generatedRegex = ref('');
const isGenerating = ref(false);
const isModifying = ref(false);
const showCode = ref(false);
const showModify = ref(false);
const modifyInstruction = ref('');
const previewFrame = ref<HTMLIFrameElement | null>(null);

// 从 localStorage 加载数据（插件环境）
const loadData = () => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) return;

    const storageKey = `${scriptId}_regex_ui_generator`;
    const savedDataString = localStorage.getItem(storageKey);

    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString);
        triggerKeyword.value = savedData.triggerKeyword || '【开场白】';
        interfaceDescription.value = savedData.interfaceDescription || '';
        generatedCode.value = savedData.generatedCode || '';
        generatedRegex.value = savedData.generatedRegex || '';
        console.log('✅ [界面生成器] 数据已从 localStorage 加载');
      } catch (parseError) {
        console.error('❌ [界面生成器] 解析数据失败:', parseError);
      }
    }
  } catch (error) {
    console.error('❌ [界面生成器] 加载数据失败:', error);
  }
};

// 保存数据到 localStorage（插件环境）
const saveData = () => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) return;

    const dataToSave = {
      triggerKeyword: triggerKeyword.value,
      interfaceDescription: interfaceDescription.value,
      generatedCode: generatedCode.value,
      generatedRegex: generatedRegex.value,
    };

    const storageKey = `${scriptId}_regex_ui_generator`;
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    console.log('💾 [界面生成器] 数据已保存到 localStorage');
  } catch (error) {
    console.error('❌ [界面生成器] 保存数据失败:', error);
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});

// 监听数据变化，自动保存
// 使用防抖监听，避免频繁保存
watchDebounced(
  [triggerKeyword, interfaceDescription, generatedCode, generatedRegex],
  () => {
    saveData();
  },
  { debounce: 500 },
);

// AI 生成界面代码
const generateWithAI = async () => {
  if (!triggerKeyword.value || !interfaceDescription.value) {
    window.toastr.warning('请填写触发关键词和界面描述');
    return;
  }

  // 创建任务
  const taskId = taskStore.createTask('ui_generate', `生成界面：${triggerKeyword.value}`);
  isGenerating.value = true;

  try {
    taskStore.updateTaskProgress(taskId, 10, '正在构建提示词...');

    const systemPrompt = `你是专业的前端开发专家，擅长生成完整的单文件 HTML 应用。

# 核心任务
根据用户的自然语言描述，生成**完整**的 HTML 代码（包含 CSS 和 JS）。

# 代码结构要求
1. **必须是完整的HTML文档**：从 \`<!DOCTYPE html>\` 开始到 \`</html>\` 结束
2. **所有样式内嵌**：使用 \`<style>\` 标签，不要外部CSS
3. **所有脚本内嵌**：使用 \`<script>\` 标签，不要外部JS
4. **无外部依赖**：不要引入 CDN 或外部库（除非用户明确要求）

# 关键原则
1. **完整性第一**：确保生成的代码是完整的，不要截断
2. **美观现代**：使用现代 CSS 特性（flexbox, grid, 动画等）
3. **符合描述**：严格按照用户的风格需求和功能需求
4. **可直接运行**：代码可以直接在浏览器中运行，无需修改

# 禁止事项
❌ 不要输出任何解释、说明、注释
❌ 不要使用 markdown 代码块（\`\`\`html）
❌ 不要生成不完整的代码
❌ 不要省略任何部分（如"...省略..."）
❌ 不要引入外部依赖（除非用户明确要求）

# 输出格式
直接输出完整的 HTML 代码，从 \`<!DOCTYPE html>\` 开始。`;

    const userPrompt = `**触发关键词**：${triggerKeyword.value}

**界面需求**：
${interfaceDescription.value}

---

**生成要求**：
1. 生成完整的单文件 HTML（包含 <style> 和 <script>）
2. 风格：${interfaceDescription.value.includes('风格') ? '按描述风格' : '现代简洁风格'}
3. 确保代码完整，不要截断
4. 可以直接在浏览器中运行

立即生成完整的HTML代码：`;

    taskStore.updateTaskProgress(taskId, 20, '正在发送请求到 AI 服务器...');
    taskStore.addTaskDetail(taskId, `触发词: ${triggerKeyword.value}`);

    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify({
        model: settings.value.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: settings.value.temperature || 0.7,
        max_tokens: settings.value.max_tokens || 16000,
        top_p: settings.value.top_p,
        presence_penalty: settings.value.presence_penalty,
        frequency_penalty: settings.value.frequency_penalty,
      }),
    });

    taskStore.updateTaskProgress(taskId, 40, '等待AI响应...');

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    taskStore.updateTaskProgress(taskId, 50, '正在等待 AI 生成代码...');
    taskStore.addTaskDetail(taskId, 'AI 正在思考并生成完整的HTML代码...');

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || '';

    taskStore.updateTaskProgress(taskId, 70, '正在处理 AI 返回的代码...');

    console.log('📝 [界面生成] AI 原始返回长度:', result.length);
    console.log('📝 [界面生成] AI 原始返回前500字符:', result.substring(0, 500));

    // 移除可能的 markdown 代码块标记
    result = result
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 尝试提取HTML代码（处理AI推理过程）
    // 1. 先查找 <!DOCTYPE html 开头的完整文档
    const doctypeMatch = result.match(/<!DOCTYPE html>[\s\S]*/i);
    if (doctypeMatch) {
      result = doctypeMatch[0].trim();
      console.log('✅ [界面生成] 提取到完整的HTML文档（含DOCTYPE）');
    } else {
      // 2. 如果没有DOCTYPE，查找 <html 开头的部分
      const htmlMatch = result.match(/<html[\s\S]*/i);
      if (htmlMatch) {
        result = htmlMatch[0].trim();
        console.log('✅ [界面生成] 提取到HTML文档（不含DOCTYPE）');
      } else if (result.includes('<') && result.includes('>')) {
        // 3. 如果没有完整的html标签，但包含HTML标签
        console.log('⚠️ [界面生成] 包含HTML标签但格式不标准，尝试包装');
        // 尝试包装成完整文档
        if (!result.includes('<html')) {
          result = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
${result}
</body>
</html>`;
          console.log('✅ [界面生成] 已自动包装为完整HTML文档');
        }
      } else {
        // 4. 如果完全没有HTML标签，说明AI返回的是纯文本或推理过程
        console.error('❌ [界面生成] AI未返回有效的HTML代码');
        console.error('AI返回内容:', result);
        throw new Error('AI未返回有效的HTML代码，请尝试更详细的界面描述或更换模型');
      }
    }

    console.log('📝 [界面生成] 最终HTML长度:', result.length);

    taskStore.updateTaskProgress(taskId, 85, '正在生成正则配置...');

    generatedCode.value = result;

    // 生成正则配置（符合酒馆正则格式）
    const findRegex = triggerKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexJson = {
      id: `regex_ui_${Date.now()}`,
      scriptName: `界面_${triggerKeyword.value}`,
      findRegex: findRegex,
      replaceString: result,
      trimStrings: [],
      placement: [2], // AI输出后处理
      disabled: false,
      markdownOnly: true,
      promptOnly: false,
      runOnEdit: true,
      substituteRegex: 0,
      minDepth: null,
      maxDepth: null,
    };
    generatedRegex.value = JSON.stringify(regexJson, null, 2);

    taskStore.addTaskDetail(taskId, `✅ HTML代码长度: ${result.length} 字符`);
    taskStore.completeTask(taskId, { code: result, regex: generatedRegex.value });

    window.toastr.success('AI 生成成功！');
  } catch (error) {
    console.error('AI 生成失败:', error);
    taskStore.failTask(taskId, (error as Error).message);
    window.toastr.error('AI 生成失败: ' + (error as Error).message);
  } finally {
    isGenerating.value = false;
  }
};

// 显示修改对话框
const showModifyDialog = () => {
  modifyInstruction.value = '';
  showModify.value = true;
};

// AI 修改界面（增量修改）
const modifyWithAI = async () => {
  if (!modifyInstruction.value) {
    window.toastr.warning('请输入修改建议');
    return;
  }

  // 创建任务
  const taskId = taskStore.createTask('ui_modify', `修改界面：${triggerKeyword.value}`);
  isModifying.value = true;

  try {
    taskStore.updateTaskProgress(taskId, 10, '正在构建修改提示词...');

    const systemPrompt = `你是专业的前端开发专家，擅长根据用户反馈修改和优化界面代码。

# 核心任务
根据用户的原始需求和修改建议，生成**完整**的优化后的 HTML 代码。

# 修改原则
1. **保持原有风格**：不要改变原始描述中的核心风格
2. **精准修改**：只修改用户明确要求修改的部分
3. **完整输出**：确保修改后的代码是完整的，不要截断
4. **向下兼容**：确保修改不会破坏原有功能

# 禁止事项
❌ 不要输出任何解释、说明、注释
❌ 不要使用 markdown 代码块（\`\`\`html）
❌ 不要生成不完整的代码
❌ 不要省略任何部分

# 输出格式
直接输出完整的 HTML 代码，从 \`<!DOCTYPE html>\` 开始。`;

    const userPrompt = `**触发关键词**：${triggerKeyword.value}

**原始界面需求**：
${interfaceDescription.value}

**用户修改建议**：
${modifyInstruction.value}

---

**修改要求**：
1. 在原始需求的基础上，精准应用修改建议
2. 保持代码完整性，不要截断
3. 确保可以直接在浏览器中运行

立即生成修改后的完整HTML代码：`;

    taskStore.updateTaskProgress(taskId, 20, '正在发送修改请求...');
    taskStore.addTaskDetail(taskId, `修改建议: ${modifyInstruction.value}`);

    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify({
        model: settings.value.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: settings.value.temperature || 0.7,
        max_tokens: settings.value.max_tokens || 16000,
        top_p: settings.value.top_p,
        presence_penalty: settings.value.presence_penalty,
        frequency_penalty: settings.value.frequency_penalty,
      }),
    });

    taskStore.updateTaskProgress(taskId, 40, '等待AI响应...');

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    taskStore.updateTaskProgress(taskId, 50, '正在等待 AI 修改代码...');
    taskStore.addTaskDetail(taskId, 'AI 正在根据修改建议重新生成代码...');

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || '';

    taskStore.updateTaskProgress(taskId, 70, '正在处理修改后的代码...');

    console.log('📝 [界面修改] AI 原始返回长度:', result.length);
    console.log('📝 [界面修改] AI 原始返回前500字符:', result.substring(0, 500));

    // 移除可能的 markdown 代码块标记
    result = result
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 尝试提取HTML代码（处理AI推理过程）
    // 1. 先查找 <!DOCTYPE html 开头的完整文档
    const doctypeMatch = result.match(/<!DOCTYPE html>[\s\S]*/i);
    if (doctypeMatch) {
      result = doctypeMatch[0].trim();
      console.log('✅ [界面修改] 提取到完整的HTML文档（含DOCTYPE）');
    } else {
      // 2. 如果没有DOCTYPE，查找 <html 开头的部分
      const htmlMatch = result.match(/<html[\s\S]*/i);
      if (htmlMatch) {
        result = htmlMatch[0].trim();
        console.log('✅ [界面修改] 提取到HTML文档（不含DOCTYPE）');
      } else if (result.includes('<') && result.includes('>')) {
        // 3. 如果没有完整的html标签，但包含HTML标签
        console.log('⚠️ [界面修改] 包含HTML标签但格式不标准，尝试包装');
        // 尝试包装成完整文档
        if (!result.includes('<html')) {
          result = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
${result}
</body>
</html>`;
          console.log('✅ [界面修改] 已自动包装为完整HTML文档');
        }
      } else {
        // 4. 如果完全没有HTML标签，说明AI返回的是纯文本或推理过程
        console.error('❌ [界面修改] AI未返回有效的HTML代码');
        console.error('AI返回内容:', result);
        throw new Error('AI未返回有效的HTML代码，请尝试更详细的修改建议或更换模型');
      }
    }

    console.log('📝 [界面修改] 最终HTML长度:', result.length);

    taskStore.updateTaskProgress(taskId, 85, '正在更新正则配置...');

    generatedCode.value = result;

    // 更新正则配置（符合酒馆正则格式）
    const findRegex = triggerKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexJson = {
      id: `regex_ui_${Date.now()}`,
      scriptName: `界面_${triggerKeyword.value}`,
      findRegex: findRegex,
      replaceString: result,
      trimStrings: [],
      placement: [2], // AI输出后处理
      disabled: false,
      markdownOnly: true,
      promptOnly: false,
      runOnEdit: true,
      substituteRegex: 0,
      minDepth: null,
      maxDepth: null,
    };
    generatedRegex.value = JSON.stringify(regexJson, null, 2);

    // 更新界面描述（将修改建议合并到原描述中，用于下次修改）
    interfaceDescription.value = `${interfaceDescription.value}\n\n【已应用的修改】：\n${modifyInstruction.value}`;

    taskStore.addTaskDetail(taskId, `✅ 修改后代码长度: ${result.length} 字符`);
    taskStore.completeTask(taskId, { code: result, regex: generatedRegex.value });

    window.toastr.success('AI 修改成功！');
    showModify.value = false;
  } catch (error) {
    console.error('AI 修改失败:', error);
    taskStore.failTask(taskId, (error as Error).message);
    window.toastr.error('AI 修改失败: ' + (error as Error).message);
  } finally {
    isModifying.value = false;
  }
};

// 复制正则代码
const copyRegex = () => {
  copyToClipboard(generatedRegex.value, '正则代码已复制到剪贴板');
};
</script>

<style scoped>
.regex-ui-generator {
  height: 100%;
  overflow-y: auto;
}

button:disabled {
  cursor: not-allowed !important;
  opacity: 0.5 !important;
}

button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

code {
  background: #1a1a1a;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
}

pre::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

pre::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}
</style>
