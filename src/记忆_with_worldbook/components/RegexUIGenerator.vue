<template>
  <div class="pageable-statusbar-generator" style="padding: 25px; background: #1a1a1a">
    <!-- 标题 -->
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
        生成可翻页、可交互的多页面状态栏，支持标签页切换、按钮交互等功能
      </p>
    </div>

    <!-- 使用说明 -->
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
        使用流程：
      </h4>
      <ol style="margin: 0; padding-left: 20px; color: #ccc; line-height: 2">
        <li>
          <strong style="color: #fff">第1步：</strong> 设置触发正则（如
          <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 3px; color: #4a9eff">&lt;-STATUS-&gt;</code
          >）
        </li>
        <li><strong style="color: #fff">第2步：</strong> 添加页面，配置每个页面的内容和样式</li>
        <li><strong style="color: #fff">第3步：</strong> 预览效果，调整样式</li>
        <li><strong style="color: #fff">第4步：</strong> 导出为正则 JSON，导入到酒馆</li>
        <li><strong style="color: #fff">完成！</strong> 在聊天中输入触发词即可显示翻页状态栏</li>
      </ol>
    </div>

    <!-- 主要内容区域 -->
    <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px; min-height: 700px">
      <!-- 左侧：配置面板 -->
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          padding: 15px;
          border: 1px solid #3a3a3a;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
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
          <i class="fa-solid fa-sliders" style="color: #4a9eff"></i>
          基础配置
        </h4>

        <!-- 触发正则 -->
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
              padding: 8px 12px;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 12px;
            "
          />
        </div>

        <!-- 页面列表 -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px">
          <div
            v-for="(page, index) in pages"
            :key="index"
            :style="{
              padding: '10px',
              background: selectedPageIndex === index ? 'rgba(74, 158, 255, 0.15)' : '#1e1e1e',
              border: selectedPageIndex === index ? '2px solid #4a9eff' : '1px solid #3a3a3a',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }"
            @click="selectPage(index)"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="color: #e0e0e0; font-size: 13px; font-weight: 500">{{ page.name }}</span>
              <i
                class="fa-solid fa-trash"
                style="color: #ef4444; cursor: pointer; font-size: 12px"
                @click.stop="deletePage(index)"
              ></i>
            </div>
          </div>
        </div>

        <!-- AI 生成器 - 始终显示 -->
        <div
          style="
            margin-bottom: 15px;
            padding: 15px;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
            border-radius: 8px;
            border: 1px solid rgba(245, 158, 11, 0.3);
          "
        >
          <h5
            style="color: #f59e0b; margin-bottom: 10px; font-size: 13px; display: flex; align-items: center; gap: 6px"
          >
            <i class="fa-solid fa-sparkles"></i>
            AI 智能生成
          </h5>
          <textarea
            v-model="aiPrompt"
            placeholder="✨ 完全自由！想要什么样式就描述什么样式，AI 会为你创造！&#10;&#10;🎨 任意形状：圆形、椭圆、方形、六边形、不规则形状、波浪边框&#10;🎭 任意风格：学神手册、粉色可爱、赛博朋克、游戏UI、便签本、科幻面板&#10;🌈 任意配色：深色/浅色/渐变/霓虹/复古/梦幻&#10;💫 任意动画：淡入淡出、滑动、旋转、脉动、悬停特效&#10;📐 任意布局：网格、卡片堆叠、环形、自由排列&#10;&#10;💡 示例：&#10;- 学神手册风格，绿色卡片，左边圆形头像，右边4个标签页&#10;- 粉色椭圆形，HP和LUST进度条，渐变背景&#10;- 赛博朋克，霓虹蓝色边框，扫描线动画&#10;&#10;⚠️ 形状、颜色、布局完全自由！"
            :disabled="isGenerating"
            style="
              width: 100%;
              min-height: 160px;
              padding: 14px;
              background: linear-gradient(135deg, #1e1e1e 0%, #252525 100%);
              border: 3px solid #f59e0b;
              border-radius: 10px;
              color: #e0e0e0;
              font-size: 12px;
              line-height: 1.7;
              resize: vertical;
              margin-bottom: 12px;
              box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            "
          ></textarea>
          <button
            style="
              width: 100%;
              padding: 10px;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              border: none;
              border-radius: 6px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              opacity: 1;
            "
            :style="{ opacity: isGenerating ? 0.6 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }"
            :disabled="isGenerating"
            @click="generateWithAI"
          >
            <i
              :class="isGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"
              style="margin-right: 6px"
            ></i>
            {{ isGenerating ? '生成中...' : '✨ AI 一键生成' }}
          </button>
        </div>

        <!-- 主要操作按钮 -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px">
          <div style="display: flex; gap: 8px">
            <button
              style="
                flex: 1;
                padding: 8px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
              "
              @click="exportRegex"
            >
              <i class="fa-solid fa-download" style="margin-right: 4px"></i>
              单文件导出
            </button>

            <button
              style="
                flex: 1;
                padding: 8px;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
              "
              @click="loadTemplate"
            >
              <i class="fa-solid fa-lightbulb" style="margin-right: 4px"></i>
              示例
            </button>
          </div>

          <button
            style="
              width: 100%;
              padding: 8px;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              border: none;
              border-radius: 6px;
              color: white;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            "
            @click="exportThreeStage"
          >
            <i class="fa-solid fa-layer-group" style="margin-right: 4px"></i>
            三段式导出（推荐）
          </button>
        </div>

        <!-- 高级选项 - 折叠 -->
        <details style="margin-top: 10px">
          <summary
            style="
              padding: 8px;
              background: #2a2a2a;
              border-radius: 6px;
              cursor: pointer;
              color: #c0c0c0;
              font-size: 12px;
              list-style: none;
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <i class="fa-solid fa-cog"></i>
            高级选项
          </summary>

          <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px">
            <button
              style="
                width: 100%;
                padding: 6px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #c0c0c0;
                font-size: 11px;
                cursor: pointer;
              "
              @click="addPage"
            >
              <i class="fa-solid fa-plus" style="margin-right: 4px"></i>
              手动添加页面
            </button>

            <button
              style="
                width: 100%;
                padding: 6px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #c0c0c0;
                font-size: 11px;
                cursor: pointer;
              "
              @click="showVariableManager = !showVariableManager"
            >
              <i class="fa-solid fa-code" style="margin-right: 4px"></i>
              {{ showVariableManager ? '隐藏' : '显示' }}变量管理
            </button>

            <button
              style="
                width: 100%;
                padding: 6px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #c0c0c0;
                font-size: 11px;
                cursor: pointer;
              "
              @click="openPreviewWindow"
            >
              <i class="fa-solid fa-external-link-alt" style="margin-right: 4px"></i>
              新窗口预览
            </button>

            <button
              style="
                width: 100%;
                padding: 6px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #c0c0c0;
                font-size: 11px;
                cursor: pointer;
              "
              @click="exportWorldbookEntry"
            >
              <i class="fa-solid fa-book" style="margin-right: 4px"></i>
              导出世界书条目
            </button>

            <button
              style="
                width: 100%;
                padding: 6px;
                background: #2a2a2a;
                border: 1px solid #ef4444;
                border-radius: 4px;
                color: #ef4444;
                font-size: 11px;
                cursor: pointer;
              "
              @click="clearAllData"
            >
              <i class="fa-solid fa-trash-alt" style="margin-right: 4px"></i>
              清空所有数据
            </button>
          </div>
        </details>

        <!-- 变量管理器 -->
        <div
          v-if="showVariableManager"
          style="
            margin-top: 15px;
            padding: 15px;
            background: #1e1e1e;
            border-radius: 8px;
            border: 1px solid #3a3a3a;
            max-height: 400px;
            overflow-y: auto;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px">
            <h5 style="color: #fff; font-size: 13px">📝 变量管理</h5>
            <button
              style="
                padding: 4px 8px;
                background: #4a9eff;
                border: none;
                border-radius: 4px;
                color: white;
                font-size: 10px;
                cursor: pointer;
              "
              @click="addVariable"
            >
              + 添加变量
            </button>
          </div>

          <div
            v-for="(variable, index) in variables"
            :key="index"
            style="
              margin-bottom: 10px;
              padding: 10px;
              background: #2a2a2a;
              border-radius: 6px;
              border: 1px solid #3a3a3a;
            "
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
              <input
                v-model="variable.name"
                placeholder="变量名 (如: hp)"
                style="
                  flex: 1;
                  padding: 4px 8px;
                  background: #1e1e1e;
                  border: 1px solid #3a3a3a;
                  border-radius: 4px;
                  color: #e0e0e0;
                  font-size: 11px;
                  margin-right: 8px;
                "
              />
              <button
                style="
                  padding: 4px 8px;
                  background: #ef4444;
                  border: none;
                  border-radius: 4px;
                  color: white;
                  font-size: 10px;
                  cursor: pointer;
                "
                @click="deleteVariable(index)"
              >
                删除
              </button>
            </div>
            <input
              v-model="variable.defaultValue"
              placeholder="默认值 (如: 100)"
              style="
                width: 100%;
                padding: 4px 8px;
                background: #1e1e1e;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #e0e0e0;
                font-size: 11px;
                margin-bottom: 6px;
              "
            />
            <input
              v-model="variable.description"
              placeholder="描述 (如: 角色生命值)"
              style="
                width: 100%;
                padding: 4px 8px;
                background: #1e1e1e;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #e0e0e0;
                font-size: 11px;
              "
            />
          </div>

          <div v-if="variables.length === 0" style="text-align: center; color: #666; padding: 20px; font-size: 12px">
            暂无变量，点击上方按钮添加
          </div>
        </div>
      </div>

      <!-- 右侧：编辑器和预览 -->
      <div style="display: flex; flex-direction: column; gap: 20px">
        <!-- 页面编辑器 -->
        <div style="background: #2a2a2a; border-radius: 16px; padding: 20px; border: 1px solid #3a3a3a; flex: 0 0 auto">
          <div v-if="selectedPage" style="display: flex; flex-direction: column; gap: 15px; overflow-y: auto">
            <!-- 页面名称 -->
            <div>
              <label style="display: block; margin-bottom: 8px; color: #c0c0c0; font-size: 12px; font-weight: 600"
                >页面名称</label
              >
              <input
                v-model="selectedPage.name"
                type="text"
                placeholder="例如：基础信息"
                style="
                  width: 100%;
                  padding: 8px 12px;
                  background: #1e1e1e;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 12px;
                "
              />
            </div>

            <!-- 页面内容 -->
            <div>
              <label style="display: block; margin-bottom: 8px; color: #c0c0c0; font-size: 12px; font-weight: 600"
                >页面内容（支持HTML）</label
              >
              <textarea
                v-model="selectedPage.content"
                placeholder="输入页面内容，支持 HTML 标签和 {{变量}}"
                style="
                  width: 100%;
                  min-height: 200px;
                  padding: 12px;
                  background: #1e1e1e;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 12px;
                  font-family: 'Courier New', monospace;
                  resize: vertical;
                "
              ></textarea>
            </div>

            <!-- 自定义样式 -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
                <label style="color: #c0c0c0; font-size: 12px; font-weight: 600">自定义 CSS</label>
                <button
                  style="
                    padding: 4px 12px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border: none;
                    border-radius: 4px;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                  "
                  :style="{ opacity: isGeneratingCSS ? 0.6 : 1, cursor: isGeneratingCSS ? 'not-allowed' : 'pointer' }"
                  :disabled="isGeneratingCSS"
                  @click="generateCSSWithAI"
                >
                  <i :class="isGeneratingCSS ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"></i>
                  {{ isGeneratingCSS ? '生成中...' : 'AI优化样式' }}
                </button>
              </div>
              <textarea
                v-model="selectedPage.customCSS"
                placeholder="例如：.my-class { color: red; }&#10;&#10;点击上方 'AI优化样式' 按钮，让AI自动生成美观的CSS样式！"
                style="
                  width: 100%;
                  min-height: 100px;
                  padding: 12px;
                  background: #1e1e1e;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 12px;
                  font-family: 'Courier New', monospace;
                  resize: vertical;
                "
              ></textarea>
            </div>
          </div>

          <div v-else style="display: flex; align-items: center; justify-content: center; padding: 40px; color: #666">
            <div style="text-align: center">
              <i class="fa-solid fa-arrow-left" style="font-size: 24px; margin-bottom: 10px; display: block"></i>
              <p>请选择或添加一个页面</p>
            </div>
          </div>
        </div>

        <!-- 实时预览 -->
        <div
          style="
            background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
            border-radius: 16px;
            padding: 20px;
            border: 2px solid #10b981;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 500px;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
          "
        >
          <h4
            style="
              margin: 0 0 16px 0;
              color: #fff;
              font-size: 16px;
              font-weight: 700;
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
            ✨ 实时预览 - 完全自由的创意展示
            <span style="margin-left: auto; font-size: 11px; color: #888; font-weight: 400">
              任意形状 · 任意风格 · 任意布局
            </span>
          </h4>

          <div
            style="
              flex: 1;
              background: linear-gradient(135deg, #1e1e1e 0%, #252525 100%);
              border-radius: 12px;
              padding: 30px;
              overflow: hidden;
              border: 2px solid #3a3a3a;
              box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
            "
          >
            <iframe
              ref="previewFrame"
              :srcdoc="previewHTML"
              style="width: 100%; height: 100%; border: none; border-radius: 8px; background: white"
              sandbox="allow-scripts allow-same-origin"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

// 页面数据结构
interface Page {
  name: string;
  content: string;
  customCSS?: string;
}

// 布局配置
interface LayoutConfig {
  tabPosition: 'top' | 'bottom' | 'left' | 'right' | 'custom';
  tabStyle: 'default' | 'pills' | 'minimal' | 'custom';
  containerStyle: string;
  tabContainerStyle: string;
  customTabHTML?: string;
}

// 变量定义
interface Variable {
  name: string;
  defaultValue: string;
  description: string;
}

// localStorage 键名
const STORAGE_KEY = 'regex_ui_generator_data';

// 从 localStorage 加载数据
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      triggerRegex.value = data.triggerRegex || '<-STATUS->';
      pages.value = data.pages || [];
      selectedPageIndex.value = data.selectedPageIndex ?? null;
      layoutConfig.value = data.layoutConfig || getDefaultLayout();
      variables.value = data.variables || [];
      console.log('✅ 已从本地存储加载数据');
    }
  } catch (error) {
    console.error('❌ 加载本地数据失败:', error);
  }
};

// 默认布局配置
const getDefaultLayout = (): LayoutConfig => ({
  tabPosition: 'top',
  tabStyle: 'default',
  containerStyle: '',
  tabContainerStyle: '',
  customTabHTML: '',
});

// 保存到 localStorage
const saveToStorage = () => {
  try {
    const data = {
      triggerRegex: triggerRegex.value,
      pages: pages.value,
      selectedPageIndex: selectedPageIndex.value,
      layoutConfig: layoutConfig.value,
      variables: variables.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('💾 数据已保存到本地存储');
  } catch (error) {
    console.error('❌ 保存本地数据失败:', error);
  }
};

// 状态
const triggerRegex = ref('<-STATUS->');
const pages = ref<Page[]>([]);
const selectedPageIndex = ref<number | null>(null);
const previewFrame = ref<HTMLIFrameElement | null>(null);
const layoutConfig = ref<LayoutConfig>(getDefaultLayout());
const showLayoutEditor = ref(false);
const variables = ref<Variable[]>([]);
const showVariableManager = ref(false);
const showAIGenerator = ref(false);
const aiPrompt = ref('');
const isGenerating = ref(false);
const isGeneratingCSS = ref(false);

// 组件挂载时加载数据
onMounted(() => {
  loadFromStorage();
});

// 监听数据变化，自动保存
watch(
  [triggerRegex, pages, selectedPageIndex, layoutConfig, variables],
  () => {
    saveToStorage();
  },
  { deep: true },
);

// 计算属性
const selectedPage = computed(() => {
  if (selectedPageIndex.value !== null && pages.value[selectedPageIndex.value]) {
    return pages.value[selectedPageIndex.value];
  }
  return null;
});

// 生成预览 HTML
const previewHTML = computed(() => {
  if (pages.value.length === 0) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #f5f5f5;
          }
          .empty-state {
            text-align: center;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="empty-state">
          <p>暂无页面，请添加页面后查看预览</p>
        </div>
      </body>
      </html>
    `;
  }

  const customCSS = pages.value.map(p => p.customCSS || '').join('\n');
  const config = layoutConfig.value;

  // 生成翻页按钮HTML
  const generateTabsHTML = () => {
    if (config.tabPosition === 'custom' && config.customTabHTML) {
      return config.customTabHTML;
    }

    const tabsHTML = pages.value
      .map(
        (page, index) => `
      <button class="tab ${index === 0 ? 'active' : ''}" onclick="switchPage(${index})">
        ${page.name}
      </button>
    `,
      )
      .join('');

    return `<div class="tabs" style="${config.tabContainerStyle}">${tabsHTML}</div>`;
  };

  // 根据位置生成不同的布局
  const getLayoutHTML = () => {
    const tabsHTML = generateTabsHTML();
    const contentHTML = pages.value
      .map(
        (page, index) => `
      <div class="page ${index === 0 ? 'active' : ''}" id="page-${index}">
        ${page.content}
      </div>
    `,
      )
      .join('');

    switch (config.tabPosition) {
      case 'top':
        return `${tabsHTML}<div class="page-content">${contentHTML}</div>`;
      case 'bottom':
        return `<div class="page-content">${contentHTML}</div>${tabsHTML}`;
      case 'left':
        return `<div style="display: flex;">${tabsHTML}<div class="page-content" style="flex: 1;">${contentHTML}</div></div>`;
      case 'right':
        return `<div style="display: flex;"><div class="page-content" style="flex: 1;">${contentHTML}</div>${tabsHTML}</div>`;
      case 'custom':
        return `${tabsHTML}<div class="page-content">${contentHTML}</div>`;
      default:
        return `${tabsHTML}<div class="page-content">${contentHTML}</div>`;
    }
  };

  // 生成按钮样式
  const getTabStyles = () => {
    const baseStyles = `
      .tabs {
        display: flex;
        gap: 8px;
        background: #f8f9fa;
        padding: 12px;
        flex-wrap: wrap;
      }
    `;

    switch (config.tabStyle) {
      case 'pills':
        return (
          baseStyles +
          `
        .tab {
          padding: 8px 16px;
          cursor: pointer;
          background: #e9ecef;
          border: none;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: #495057;
          transition: all 0.3s;
        }
        .tab:hover {
          background: #dee2e6;
          transform: scale(1.05);
        }
        .tab.active {
          background: linear-gradient(135deg, #4a9eff 0%, #5ab0ff 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
        }
      `
        );
      case 'minimal':
        return (
          baseStyles +
          `
        .tab {
          padding: 8px 16px;
          cursor: pointer;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 14px;
          font-weight: 500;
          color: #6c757d;
          transition: all 0.3s;
        }
        .tab:hover {
          color: #4a9eff;
          border-bottom-color: #4a9eff;
        }
        .tab.active {
          color: #4a9eff;
          border-bottom-color: #4a9eff;
          font-weight: 600;
        }
      `
        );
      default:
        return (
          baseStyles +
          `
        .tab {
          padding: 10px 20px;
          cursor: pointer;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #6c757d;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .tab:hover {
          background: #f8f9ff;
          border-color: #4a9eff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(74, 158, 255, 0.2);
        }
        .tab.active {
          background: linear-gradient(135deg, #4a9eff 0%, #5ab0ff 100%);
          color: white;
          border-color: #4a9eff;
          box-shadow: 0 4px 12px rgba(74, 158, 255, 0.4);
        }
      `
        );
    }
  };

  return (
    `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }
        .statusbar-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
          ${config.containerStyle}
        }
        ${getTabStyles()}
        .page-content {
          padding: 20px;
          min-height: 200px;
        }
        .page {
          display: none;
        }
        .page.active {
          display: block;
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ${customCSS}
      </style>
    </head>
    <body>
      <div class="statusbar-container">
        ${getLayoutHTML()}
      </div>
      <script type="text/javascript">
        function switchPage(index) {
          document.querySelectorAll('.tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
          });
          document.querySelectorAll('.page').forEach((page, i) => {
            page.classList.toggle('active', i === index);
          });
        }
      <` +
    `/script>
    </body>
    </html>
  `
  );
});

// 方法
const selectPage = (index: number) => {
  selectedPageIndex.value = index;
};

const addPage = () => {
  const newPage: Page = {
    name: `页面 ${pages.value.length + 1}`,
    content: '<p>这是新页面的内容</p>',
    customCSS: '',
  };
  pages.value.push(newPage);
  selectedPageIndex.value = pages.value.length - 1;
};

const deletePage = (index: number) => {
  if (confirm('确定要删除这个页面吗？')) {
    pages.value.splice(index, 1);
    if (selectedPageIndex.value === index) {
      selectedPageIndex.value = pages.value.length > 0 ? 0 : null;
    } else if (selectedPageIndex.value !== null && selectedPageIndex.value > index) {
      selectedPageIndex.value--;
    }
  }
};

const generateWithAI = async () => {
  if (!aiPrompt.value.trim()) {
    (window as any).toastr?.warning('请输入生成需求');
    return;
  }

  const userPrompt = aiPrompt.value.trim();
  isGenerating.value = true;

  // 创建任务
  const { useTaskStore } = await import('../taskStore');
  const taskStore = useTaskStore();
  const taskId = taskStore.createTask('ui_generate', `AI 生成翻页状态栏: ${userPrompt.substring(0, 50)}...`);

  // 构建 AI 提示词
  const systemPrompt = `你是一个富有创意的前端设计师，专门为翻页状态栏生成完全自由的创意设计。

🎨 【核心理念】完全自由！不受任何限制！
- 整个容器内的所有内容都可以自由设计：标签页、内容区域、布局、形状、颜色、动画
- 可以是任意形状：圆形、椭圆、六边形、不规则形状、卡片、面板
- 可以是任意风格：学神手册、赛博朋克、可爱粉色、游戏UI、科幻面板
- 可以是任意布局：上下、左右、环形、网格、自由排列
- 标签页按钮可以是任意样式：圆形、方形、标签、图标、侧边栏

🎯 任务：
根据用户描述，生成翻页状态栏的 HTML 内容和变量定义。

📋 返回格式（纯 JSON，不要添加任何解释）：
{
  "pages": [
    {
      "name": "页面名称",
      "content": "完整的HTML内容，包含所有内联样式，可以是任意创意设计",
      "customCSS": ""
    }
  ],
  "variables": [
    {
      "name": "变量名（不含花括号）",
      "defaultValue": "默认值",
      "description": "变量说明"
    }
  ]
}

✅ 核心规则 - 必须遵守：
1. **所有样式必须使用内联 style 属性**，不要依赖外部CSS类
2. **完全自由设计**：整个容器内的所有元素（标签页、内容、布局）都可以任意设计
3. **customCSS 留空**：所有样式都在 HTML 的 style 属性中
4. 生成2-4个相关页面，每个页面风格统一但内容不同
5. **发挥创意**：根据用户描述创造独特的视觉效果

🎨 创意示例：
- 学神手册：绿色卡片，左边圆形头像，右边4个圆形标签页按钮
- 粉色可爱：椭圆形容器，顶部标签页，内容区域有进度条和装饰
- 赛博朋克：六边形容器，霓虹边框，侧边标签页，扫描线动画
- 游戏UI：血条样式，技能图标标签页，装备槽布局

🎨 样式要求：
- 使用内联样式实现所有视觉效果
- 可以使用：渐变背景、圆角、阴影、transform、过渡效果
- 进度条、卡片、图标等都用 HTML+内联样式实现
- 颜色搭配要和谐、现代化
- 布局可以用 flexbox、grid、absolute 等（都在 style 里）

📝 变量使用：
- 使用 {{变量名}} 格式，例如：{{char}}, {{hp}}, {{favorability}}, {{lust}}
- **不要修改标准变量名**：{{char}} 就是 {{char}}
- 在 variables 数组中列出所有变量及说明

💡 示例（六边形容器的正确写法）：
<div style="width: 300px; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display: flex; align-items: center; justify-content: center; color: white;">
  <div style="text-align: center;">
    <div style="font-size: 24px; font-weight: bold;">{{char}}</div>
    <div style="margin-top: 10px;">HP: {{hp}}/{{max_hp}}</div>
  </div>
</div>

🚫 错误示例（不要这样）：
<div class="container">{{char}}</div>  ❌ 不要用class
<div>{{char}}</div>  ❌ 缺少样式和创意

✅ 其他规则：
- 直接返回 JSON，不要添加 \`\`\`json 标记
- 可以包含任何类型的内容（包括 NSFW）
- 每个页面的 HTML 要完整、自包含
- 发挥你的创意，让每个设计都独一无二

用户需求：${userPrompt}

现在直接输出 JSON：`;

  try {
    taskStore.updateTaskProgress(taskId, 10, '正在准备...');

    // 动态导入设置
    const { useSettingsStore, normalizeApiEndpoint } = await import('../settings');
    const settings = useSettingsStore().settings;

    if (!settings.api_endpoint || !settings.api_key) {
      taskStore.failTask(taskId, '请先在"设置"标签页配置 API 端点和密钥');
      alert('请先在"设置"标签页配置 API 端点和密钥');
      isGenerating.value = false;
      return;
    }

    // 规范化 API 端点
    const apiUrl = normalizeApiEndpoint(settings.api_endpoint);

    taskStore.updateTaskProgress(taskId, 20, '正在连接 AI...');

    // 自动重试机制（针对503等临时错误）
    let response;
    let lastError;
    const maxRetries = 5; // 增加到5次
    const retryDelay = 3000; // 增加到3秒

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          taskStore.updateTaskProgress(taskId, 20 + attempt * 5, `第 ${attempt} 次重试...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt)); // 递增延迟
        }

        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.api_key}`,
          },
          body: JSON.stringify({
            model: settings.model,
            messages: [
              {
                role: 'user',
                content: systemPrompt,
              },
            ],
            max_tokens: settings.max_tokens || 2000,
            temperature: 0.8,
          }),
        });

        if (response.ok) {
          break; // 成功，跳出重试循环
        }

        const errorText = await response.text();
        lastError = errorText;

        // 503 (服务过载) 或 429 (请求过多) 可以重试
        if (response.status === 503 || response.status === 429) {
          if (attempt < maxRetries) {
            console.log(`⚠️ API返回 ${response.status}，将在 ${retryDelay * attempt}ms 后重试...`);
            continue;
          }
        }

        // 其他错误直接抛出
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      } catch (err) {
        lastError = err;
        if (attempt === maxRetries) {
          throw err;
        }
      }
    }

    if (!response || !response.ok) {
      throw new Error(`API 请求失败，已重试 ${maxRetries} 次: ${lastError}`);
    }

    taskStore.updateTaskProgress(taskId, 60, '正在接收 AI 响应...');

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.content || '';

    taskStore.updateTaskProgress(taskId, 80, '正在解析结果...');

    // 清理可能的 markdown 代码块标记
    content = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 解析 JSON
    const result = JSON.parse(content);

    if (result.pages && Array.isArray(result.pages)) {
      pages.value = result.pages;
      selectedPageIndex.value = 0;

      // 自动提取并设置变量
      if (result.variables && Array.isArray(result.variables)) {
        variables.value = result.variables;
        console.log('✅ 已自动提取变量:', result.variables);
      } else {
        // 如果 AI 没有返回变量，自动从内容中提取
        const extractedVars = new Set<string>();
        pages.value.forEach(page => {
          const matches = page.content.match(/\{\{(\w+)\}\}/g);
          if (matches) {
            matches.forEach(match => {
              const varName = match.replace(/\{\{|\}\}/g, '');
              extractedVars.add(varName);
            });
          }
        });

        variables.value = Array.from(extractedVars).map(varName => ({
          name: varName,
          defaultValue: '',
          description: `自动提取的变量: ${varName}`,
        }));
        console.log('✅ 自动提取变量:', variables.value);
      }

      aiPrompt.value = '';
      showAIGenerator.value = false;

      taskStore.completeTask(taskId, `成功生成 ${result.pages.length} 个页面，提取 ${variables.value.length} 个变量`);
      (window as any).toastr.success(`成功生成 ${result.pages.length} 个页面，提取 ${variables.value.length} 个变量！`);
    } else {
      throw new Error('返回格式不正确');
    }
  } catch (error) {
    console.error('AI 生成失败:', error);
    taskStore.failTask(taskId, (error as Error).message);
    (window as any).toastr.error('AI 生成失败：' + (error as Error).message);
  } finally {
    isGenerating.value = false;
  }
};

// AI 生成 CSS 样式
const generateCSSWithAI = async () => {
  if (!selectedPage.value) {
    (window as any).toastr?.warning('请先选择一个页面');
    return;
  }

  isGeneratingCSS.value = true;

  // 创建任务
  const { useTaskStore } = await import('../taskStore');
  const taskStore = useTaskStore();
  const taskId = taskStore.createTask('css_generate', `AI 优化样式: ${selectedPage.value.name}`);

  // 构建 AI 提示词
  const systemPrompt = `你是一个专业的 CSS 样式设计师。

🎯 任务：
为以下 HTML 内容生成美观、现代化的 CSS 样式。

📋 HTML 内容：
${selectedPage.value.content}

✅ 要求：
1. 生成完整的 CSS 代码，包含所有必要的样式类
2. 样式要现代化、美观、有创意
3. 可以使用渐变、阴影、动画、过渡等 CSS 特性
4. 确保响应式设计和良好的可读性
5. 使用合理的颜色搭配和间距
6. 直接返回纯 CSS 代码，不要添加 \`\`\`css 标记或任何解释
7. 不要包含 <style> 标签，只返回 CSS 内容

现在直接输出 CSS 代码：`;

  try {
    taskStore.updateTaskProgress(taskId, 10, '正在准备...');

    // 动态导入设置
    const { useSettingsStore, normalizeApiEndpoint } = await import('../settings');
    const settings = useSettingsStore().settings;

    if (!settings.api_endpoint || !settings.api_key) {
      taskStore.failTask(taskId, '请先在"设置"标签页配置 API 端点和密钥');
      alert('请先在"设置"标签页配置 API 端点和密钥');
      isGeneratingCSS.value = false;
      return;
    }

    // 规范化 API 端点
    const apiUrl = normalizeApiEndpoint(settings.api_endpoint);

    taskStore.updateTaskProgress(taskId, 20, '正在连接 AI...');

    // 自动重试机制（针对503等临时错误）
    let response;
    let lastError;
    const maxRetries = 5; // 增加到5次
    const retryDelay = 3000; // 增加到3秒

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          taskStore.updateTaskProgress(taskId, 20 + attempt * 5, `第 ${attempt} 次重试...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }

        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.api_key}`,
          },
          body: JSON.stringify({
            model: settings.model,
            messages: [
              {
                role: 'user',
                content: systemPrompt,
              },
            ],
            max_tokens: settings.max_tokens || 1500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          break;
        }

        const errorText = await response.text();
        lastError = errorText;

        if (response.status === 503 || response.status === 429) {
          if (attempt < maxRetries) {
            console.log(`⚠️ API返回 ${response.status}，将在 ${retryDelay * attempt}ms 后重试...`);
            continue;
          }
        }

        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      } catch (err) {
        lastError = err;
        if (attempt === maxRetries) {
          throw err;
        }
      }
    }

    if (!response || !response.ok) {
      throw new Error(`API 请求失败，已重试 ${maxRetries} 次: ${lastError}`);
    }

    taskStore.updateTaskProgress(taskId, 60, '正在接收 AI 响应...');

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.content || '';

    taskStore.updateTaskProgress(taskId, 80, '正在应用样式...');

    // 清理可能的 markdown 代码块标记和 style 标签
    content = content
      .replace(/```css\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/<style>/g, '')
      .replace(/<\/style>/g, '')
      .trim();

    // 应用生成的 CSS
    selectedPage.value.customCSS = content;

    taskStore.completeTask(taskId, '样式优化完成');
    (window as any).toastr.success('✨ CSS 样式已生成！');
  } catch (error) {
    console.error('AI 生成 CSS 失败:', error);
    taskStore.failTask(taskId, (error as Error).message);
    (window as any).toastr.error('AI 生成 CSS 失败：' + (error as Error).message);
  } finally {
    isGeneratingCSS.value = false;
  }
};

// 单文件导出（原有方式）
const exportRegex = () => {
  if (pages.value.length === 0) {
    alert('请先添加至少一个页面');
    return;
  }

  // 生成唯一ID
  const uuid = `regex-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // 构建符合SillyTavern格式的正则对象
  const regexData = {
    id: uuid,
    scriptName: '翻页状态栏',
    findRegex: triggerRegex.value,
    replaceString: previewHTML.value,
    trimStrings: [],
    placement: [2], // 2 = AI回复前
    disabled: false,
    runOnEdit: true,
  };

  const jsonStr = JSON.stringify(regexData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'statusbar-regex.json';
  a.click();
  URL.revokeObjectURL(url);

  (window as any).toastr?.success('✅ 正则已导出');
};

// 三段式导出（新方式）
const exportThreeStage = () => {
  if (pages.value.length === 0) {
    alert('请先添加至少一个页面');
    return;
  }

  // 提取所有变量
  const allVariables = new Set<string>();
  pages.value.forEach(page => {
    const matches = page.content.match(/\{\{(\w+)\}\}/g);
    if (matches) {
      matches.forEach(match => {
        const varName = match.replace(/\{\{|\}\}/g, '');
        allVariables.add(varName);
      });
    }
  });

  const variableList = Array.from(allVariables);

  // 生成基础时间戳和ID
  const timestamp = Date.now();
  const baseId = Math.random().toString(36).substring(2, 9);

  // ========== 1. 数据捕获正则 ==========
  // 构建捕获正则：<STATUS>变量1:值1|变量2:值2|...|</STATUS>
  const capturePattern = `${triggerRegex.value}[\\r\\n\\s]*${variableList.map(() => '([^|]+)').join('\\|')}[\\r\\n\\s]*`;

  // 生成HTML结构（带占位符）
  const htmlStructure = generateHTMLStructure(variableList);

  const regex1 = {
    id: `regex-data-${timestamp}-${baseId}`,
    scriptName: '翻页状态栏-数据捕获',
    findRegex: capturePattern,
    replaceString: htmlStructure,
    trimStrings: [],
    placement: [2],
    disabled: false,
    runOnEdit: true,
  };

  // ========== 2. CSS注入正则 ==========
  const cssContent = extractAllCSS();

  const regex2 = {
    id: `regex-css-${timestamp}-${baseId}`,
    scriptName: '翻页状态栏-CSS注入',
    findRegex: '<link rel="stylesheet" href="statusbar-placeholder.css">',
    replaceString: `<style>\n${cssContent}\n</style>`,
    trimStrings: [],
    placement: [2],
    disabled: false,
    runOnEdit: true,
  };

  // ========== 3. JS注入正则 ==========
  const jsContent = generateJavaScript();
  const scriptTag = 'script';

  const regex3 = {
    id: `regex-js-${timestamp}-${baseId}`,
    scriptName: '翻页状态栏-JS注入',
    findRegex: `<${scriptTag} src="statusbar-placeholder.js"></${scriptTag}>`,
    replaceString: `<${scriptTag}>\n${jsContent}\n</${scriptTag}>`,
    trimStrings: [],
    placement: [2],
    disabled: false,
    runOnEdit: true,
  };

  // 导出三个文件
  downloadJSON(regex1, 'statusbar-1-data.json');
  setTimeout(() => downloadJSON(regex2, 'statusbar-2-css.json'), 100);
  setTimeout(() => downloadJSON(regex3, 'statusbar-3-js.json'), 200);

  (window as any).toastr?.success('✅ 三段式正则已导出！\n\n请按顺序导入：\n1. 数据捕获\n2. CSS注入\n3. JS注入');
};

// 辅助函数：生成HTML结构
const generateHTMLStructure = (variableList: string[]) => {
  const customCSS = pages.value.map(p => p.customCSS || '').join('\n');

  // 生成页面HTML
  const pagesHTML = pages.value
    .map((page, index) => {
      // 替换变量为捕获组引用
      let content = page.content;
      variableList.forEach((varName, varIndex) => {
        const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
        content = content.replace(regex, `$${varIndex + 1}`);
      });

      return `
      <div class="page ${index === 0 ? 'active' : ''}" id="page-${index}">
        ${content}
      </div>
    `;
    })
    .join('');

  // 生成标签页按钮
  const tabsHTML = pages.value
    .map(
      (page, index) => `
      <button class="tab ${index === 0 ? 'active' : ''}" onclick="switchPage(${index})">
        ${page.name}
      </button>
    `,
    )
    .join('');

  const scriptTag = 'script';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="statusbar-placeholder.css">
</head>
<body>
  <div class="statusbar-container">
    <div class="tabs">${tabsHTML}</div>
    <div class="page-content">${pagesHTML}</div>
  </div>
  <${scriptTag} src="statusbar-placeholder.js"></${scriptTag}>
</body>
</html>`;
};

// 辅助函数：提取所有CSS
const extractAllCSS = () => {
  const customCSS = pages.value.map(p => p.customCSS || '').join('\n');

  return `
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.statusbar-container {
  width: 90%;
  max-width: 800px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  padding: 12px;
  flex-wrap: wrap;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tab:hover {
  background: #f8f9ff;
  border-color: #4a9eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(74, 158, 255, 0.2);
}

.tab.active {
  background: linear-gradient(135deg, #4a9eff 0%, #5ab0ff 100%);
  color: white;
  border-color: #4a9eff;
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.4);
}

.page-content {
  padding: 20px;
  min-height: 200px;
}

.page {
  display: none;
}

.page.active {
  display: block;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statusbar-container {
    width: 100%;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    width: 100%;
  }
}

/* 自定义样式 */
${customCSS}
`;
};

// 辅助函数：生成JavaScript
const generateJavaScript = () => {
  return `
let currentPage = 0;

function switchPage(index) {
  const pages = document.querySelectorAll('.page');
  const tabs = document.querySelectorAll('.tab');

  pages.forEach((page, i) => {
    if (i === index) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  tabs.forEach((tab, i) => {
    if (i === index) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  currentPage = index;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  switchPage(0);
});
`;
};

// 辅助函数：下载JSON文件
const downloadJSON = (data: any, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const loadTemplate = () => {
  pages.value = [
    {
      name: '基础信息',
      content: `
        <div style="line-height: 1.8;">
          <h3 style="color: #4a9eff; margin-bottom: 15px;">角色基础信息</h3>
          <p><strong>姓名：</strong>{{char}}</p>
          <p><strong>年龄：</strong>{{age}}</p>
          <p><strong>性别：</strong>{{gender}}</p>
          <p><strong>职业：</strong>{{occupation}}</p>
        </div>
      `,
      customCSS: '',
    },
    {
      name: '状态',
      content: `
        <div style="line-height: 1.8;">
          <h3 style="color: #10b981; margin-bottom: 15px;">当前状态</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="padding: 10px; background: #f0f9ff; border-radius: 6px;">
              <strong>体力：</strong> <span style="color: #ef4444;">{{hp}}/100</span>
            </div>
            <div style="padding: 10px; background: #f0fdf4; border-radius: 6px;">
              <strong>精力：</strong> <span style="color: #10b981;">{{energy}}/100</span>
            </div>
          </div>
        </div>
      `,
      customCSS: '',
    },
    {
      name: '关系',
      content: `
        <div style="line-height: 1.8;">
          <h3 style="color: #f59e0b; margin-bottom: 15px;">人际关系</h3>
          <p><strong>好感度：</strong> <span style="color: #ef4444;">❤️</span> {{favorability}}/100</p>
          <p><strong>信任度：</strong> {{trust}}/100</p>
          <p><strong>关系状态：</strong> {{relationship}}</p>
        </div>
      `,
      customCSS: '',
    },
  ];
  selectedPageIndex.value = 0;
};

const clearAllData = () => {
  if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    triggerRegex.value = '<-STATUS->';
    pages.value = [];
    selectedPageIndex.value = null;
    variables.value = [];
    localStorage.removeItem(STORAGE_KEY);
    (window as any).toastr?.success('✅ 所有数据已清空');
    console.log('🗑️ 所有数据已清空');
  }
};

// 新窗口预览
const openPreviewWindow = () => {
  if (pages.value.length === 0) {
    (window as any).toastr?.warning('请先添加至少一个页面');
    return;
  }

  const previewWindow = window.open('', '_blank', 'width=1200,height=800');
  if (previewWindow) {
    previewWindow.document.write(previewHTML.value);
    previewWindow.document.close();
  }
};

// 预览世界书条目
const previewWorldbookEntry = () => {
  if (pages.value.length === 0) {
    (window as any).toastr?.warning('请先添加至少一个页面');
    return;
  }

  // 提取所有使用的变量
  const usedVariables = new Set<string>();
  pages.value.forEach(page => {
    const matches = page.content.match(/\{\{(\w+)\}\}/g);
    if (matches) {
      matches.forEach(match => {
        const varName = match.replace(/\{\{|\}\}/g, '');
        usedVariables.add(varName);
      });
    }
  });

  // 生成世界书条目内容
  const entryContent = `# 状态栏变量说明

这是一个翻页状态栏系统，使用以下变量：

${Array.from(usedVariables)
  .map(varName => {
    const variable = variables.value.find(v => v.name === varName);
    return `## {{${varName}}}
- 默认值: ${variable?.defaultValue || '未设置'}
- 说明: ${variable?.description || '无描述'}`;
  })
  .join('\n\n')}

---

## 使用方法

1. 在聊天中输入 \`${triggerRegex.value}\` 触发状态栏显示
2. 在世界书中设置变量的实际值，例如：
   \`\`\`
   {{char}}的生命值是{{hp}}
   {{char}}的精力是{{energy}}
   \`\`\`
3. 状态栏会自动替换变量并显示

## 变量更新示例

你可以在角色卡或世界书中这样更新变量：

\`\`\`
[当前状态]
{{hp}}=85
{{energy}}=60
{{favorability}}=75
\`\`\`

或者让AI在回复中更新：

\`\`\`
*{{char}}受到攻击，生命值降低*
{{hp}}=70
\`\`\`
`;

  // 在新窗口中显示
  const previewWindow = window.open('', '_blank', 'width=800,height=600');
  if (previewWindow) {
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>世界书条目预览</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
            line-height: 1.6;
          }
          pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            white-space: pre-wrap;
          }
          h1 {
            color: #333;
            border-bottom: 3px solid #4a9eff;
            padding-bottom: 10px;
          }
          h2 {
            color: #4a9eff;
            margin-top: 30px;
          }
          code {
            background: #e0e0e0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          hr {
            border: none;
            border-top: 2px solid #ddd;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <pre>${entryContent}</pre>
      </body>
      </html>
    `);
    previewWindow.document.close();
  }
};

// 添加变量
const addVariable = () => {
  variables.value.push({
    name: '',
    defaultValue: '',
    description: '',
  });
};

// 删除变量
const deleteVariable = (index: number) => {
  variables.value.splice(index, 1);
};

// 导出世界书条目
const exportWorldbookEntry = () => {
  if (pages.value.length === 0) {
    alert('请先添加至少一个页面');
    return;
  }

  // 提取所有使用的变量
  const usedVariables = new Set<string>();
  pages.value.forEach(page => {
    const matches = page.content.match(/\{\{(\w+)\}\}/g);
    if (matches) {
      matches.forEach(match => {
        const varName = match.replace(/\{\{|\}\}/g, '');
        usedVariables.add(varName);
      });
    }
  });

  // 生成世界书条目内容
  const entryContent = `# 状态栏变量说明

这是一个翻页状态栏系统，使用以下变量：

${Array.from(usedVariables)
  .map(varName => {
    const variable = variables.value.find(v => v.name === varName);
    return `## {{${varName}}}
- 默认值: ${variable?.defaultValue || '未设置'}
- 说明: ${variable?.description || '无描述'}`;
  })
  .join('\n\n')}

---

## 使用方法

1. 在聊天中输入 \`${triggerRegex.value}\` 触发状态栏显示
2. 在世界书中设置变量的实际值，例如：
   \`\`\`
   {{char}}的生命值是{{hp}}
   {{char}}的精力是{{energy}}
   \`\`\`
3. 状态栏会自动替换变量并显示

## 变量更新示例

你可以在角色卡或世界书中这样更新变量：

\`\`\`
[当前状态]
{{hp}}=85
{{energy}}=60
{{favorability}}=75
\`\`\`

或者让AI在回复中更新：

\`\`\`
*{{char}}受到攻击，生命值降低*
{{hp}}=70
\`\`\`
`;

  // 生成世界书条目JSON
  const worldbookEntry = {
    uid: Date.now(),
    key: [triggerRegex.value],
    keysecondary: [],
    comment: '翻页状态栏 - 变量定义',
    content: entryContent,
    constant: true,
    selective: false,
    selectiveLogic: 0,
    addMemo: true,
    order: 100,
    position: 0,
    disable: false,
    excludeRecursion: false,
    preventRecursion: false,
    delayUntilRecursion: false,
    probability: 100,
    useProbability: false,
    depth: 4,
    group: '',
    groupOverride: false,
    groupWeight: 100,
    scanDepth: null,
    caseSensitive: false,
    matchWholeWords: false,
    useGroupScoring: false,
    automationId: '',
    role: 0,
    vectorized: false,
    sticky: 0,
    cooldown: 0,
    delay: 0,
  };

  // 下载JSON文件
  const jsonStr = JSON.stringify([worldbookEntry], null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'statusbar-worldbook-entry.json';
  a.click();
  URL.revokeObjectURL(url);

  (window as any).toastr?.success('✅ 世界书条目已导出！\n\n请在酒馆中导入此文件到世界书');
};
</script>
