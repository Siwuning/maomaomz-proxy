<template>
  <div
    class="memory-panel-container"
    :style="{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      color: '#e0e0e0',
      position: 'relative',
    }"
  >
    <!-- 底色层 -->
    <div class="panel-base-layer"></div>
    <!-- 背景图片层 -->
    <div class="panel-bg-layer"></div>
    <!-- 面板头部 -->
    <div
      class="panel-header glass-effect"
      style="
        padding: 16px 24px;
        border-bottom: 1px solid rgba(84, 107, 131, 0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
      "
    >
      <div class="header-left" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <span
          class="header-icon"
          style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
          >🐱</span
        >
        <div style="display: flex; flex-direction: column; gap: 4px">
          <span
            class="panel-title"
            :style="{
              fontSize: '16px',
              fontWeight: '600',
              background: `linear-gradient(90deg, var(--maomaomz-theme-color, #546b83), color-mix(in srgb, var(--maomaomz-theme-color, #546b83) 60%, #fff))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
            }"
            >猫猫的小破烂</span
          >
          <span style="font-size: 11px; color: #7a9bb8; font-weight: 500; letter-spacing: 0.5px; opacity: 0.8"
            >⚠️ 禁止商业化 | 禁止倒卖 ⚠️</span
          >
        </div>
      </div>
      <div class="header-actions" style="display: flex; gap: 8px; align-items: center">
        <button
          class="header-button minimize-button"
          title="最小化"
          style="
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(84, 107, 131, 0.4);
            background: rgba(84, 107, 131, 0.15);
            color: #6b8299;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
          "
          @click="minimizePanel"
        >
          <i class="fa-solid fa-minus"></i>
        </button>
        <button
          class="header-button close-button"
          title="关闭"
          style="
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(84, 107, 131, 0.4);
            background: rgba(84, 107, 131, 0.15);
            color: #6b8299;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
          "
          @click="closePanel"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    </div>

    <!-- 移动端标签头 + 可折叠菜单 -->
    <template v-if="isMobile">
      <div
        class="mobile-tab-header"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: #252525;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
        "
      >
        <div style="display: flex; align-items: center; gap: 8px">
          <i :class="currentTab.icon" class="mobile-tab-icon"></i>
          <span class="mobile-tab-label" style="font-size: 13px">{{ currentTab.label }}</span>
        </div>
        <button
          type="button"
          class="mobile-tab-toggle"
          style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.6);
            background: rgba(15, 23, 42, 0.8);
            color: #e5e7eb;
            font-size: 11px;
            cursor: pointer;
          "
          @click="toggleMobileMenu"
        >
          <i class="fa-solid" :class="isMobileMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          <span>{{ isMobileMenuOpen ? '收起功能' : '全部功能' }}</span>
        </button>
      </div>

      <div
        v-if="isMobileMenuOpen"
        class="mobile-tab-menu"
        style="
          background: #1a1a1a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
          padding: 6px 10px 8px;
        "
      >
        <div class="mobile-tab-grid" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px">
          <button
            v-for="tab of tabs"
            :key="tab.key"
            type="button"
            class="mobile-tab-btn"
            :class="{ 'mobile-tab-btn-active': activeTab === tab.key }"
            @click="handleMobileTabClick(tab.key)"
          >
            <i :class="tab.icon" class="mobile-tab-icon"></i>
            <span class="mobile-tab-label">{{ tab.label }}</span>
          </button>
        </div>
      </div>
    </template>

    <!-- 面板标签栏（桌面端） -->
    <div
      v-else
      class="panel-tabs glass-effect"
      style="
        display: flex;
        border-bottom: 1px solid rgba(84, 107, 131, 0.2);
        flex-shrink: 0;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        position: relative;
        z-index: 1;
      "
    >
      <div
        v-for="tab of tabs"
        :key="tab.key"
        :class="{ 'tab-active': activeTab === tab.key }"
        class="tab-item"
        :style="{
          flex: '0 0 auto',
          minWidth: '100px',
          padding: '12px 16px',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          position: 'relative',
          background:
            activeTab === tab.key
              ? 'color-mix(in srgb, var(--maomaomz-theme-color, #546B83) 20%, transparent)'
              : 'transparent',
          color: activeTab === tab.key ? 'var(--maomaomz-theme-color, #546B83)' : '#6b7280',
          borderBottom:
            activeTab === tab.key ? '2px solid var(--maomaomz-theme-color, #546B83)' : '2px solid transparent',
          fontSize: '12px',
          fontWeight: '500',
        }"
        @click="switchTab(tab.key)"
      >
        <i :class="tab.icon" class="tab-icon"></i>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <!-- 面板内容 -->
    <div
      class="panel-content glass-effect"
      style="
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0;
        min-height: 0;
        scrollbar-width: thin;
        scrollbar-color: var(--maomaomz-theme-color, #4a9eff) transparent;
        position: relative;
        z-index: 1;
      "
    >
      <ErrorBoundary :key="activeTab + '-boundary'">
        <component :is="currentComponent" :key="activeTab" v-bind="componentProps" />
      </ErrorBoundary>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { minimizeMemoryPanel } from '../浮动面板';
import GreetingsTab from './GreetingsTab.vue';
import HelpTab from './HelpTab.vue';
import MvuBetaTab from './MvuBetaTab.vue';
import PreferencesTab from './PreferencesTab.vue';
import ProjectManager from './ProjectManager.vue';
import RegexUIGenerator from './RegexUIGenerator.vue';
import SettingsTab from './SettingsTab.vue';
import StatusBarGenerator from './StatusBarGenerator.vue';
import SummaryTab from './SummaryTab.vue';
import TableTab from './TableTab.vue';
import TokenStatsTab from './TokenStatsTab.vue';
import ToolsTab from './ToolsTab.vue';

// 标签页配置
const tabs = [
  { key: 'settings', label: '设置', icon: 'fa-solid fa-cog' },
  { key: 'preferences', label: '偏好', icon: 'fa-solid fa-sliders' },
  { key: 'summary', label: '历史总结', icon: 'fa-solid fa-list' },
  { key: 'table', label: '表格', icon: 'fa-solid fa-table' },
  { key: 'greetings', label: '开场白', icon: 'fa-solid fa-comments' },
  { key: 'regex', label: '翻页状态栏', icon: 'fa-solid fa-book-open' },
  { key: 'status', label: '状态栏生成', icon: 'fa-solid fa-chart-bar' },
  { key: 'project', label: '前端项目', icon: 'fa-solid fa-laptop-code' },
  { key: 'tools', label: '工具模板', icon: 'fa-solid fa-tools' },
  { key: 'token', label: 'Token 统计', icon: 'fa-solid fa-chart-pie' },
  { key: 'mvu', label: 'MVU Beta', icon: 'fa-solid fa-flask' },
  { key: 'help', label: '帮助', icon: 'fa-solid fa-question-circle' },
];

const activeTab = ref<
  | 'settings'
  | 'preferences'
  | 'summary'
  | 'table'
  | 'greetings'
  | 'status'
  | 'regex'
  | 'project'
  | 'tools'
  | 'token'
  | 'mvu'
  | 'help'
>('settings');

// 仅用于 UI 的移动端检测，不影响业务逻辑
const isMobile = ref(false);

// 移动端标签菜单展开状态
const isMobileMenuOpen = ref(false);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 初始化时加载并应用偏好设置（确保背景图片等设置在面板加载时就生效）
const loadAndApplyPreferences = () => {
  try {
    const saved = localStorage.getItem('maomaomz_preferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      // 应用主题色
      if (preferences.themeColor) {
        document.documentElement.style.setProperty('--maomaomz-theme-color', preferences.themeColor);
      }
      // 应用背景图片
      document.documentElement.style.setProperty(
        '--maomaomz-bg-image',
        preferences.backgroundImage ? `url(${preferences.backgroundImage})` : 'none',
      );
      // 应用背景透明度
      const opacity = preferences.backgroundOpacity ?? 30;
      document.documentElement.style.setProperty('--maomaomz-bg-opacity', (opacity / 100).toString());
      console.log('🖼️ MainPanel: 背景设置已初始化, 透明度:', opacity + '%');
    }
  } catch (error) {
    console.error('❌ MainPanel: 加载偏好设置失败:', error);
  }
};

// 注入背景和玻璃效果样式
const injectGlassStyles = () => {
  const styleId = 'maomaomz-glass-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* 背景图片层 - 铺满整个面板，透明度由用户控制 */
    .panel-bg-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: var(--maomaomz-bg-image, none);
      background-size: cover;
      background-position: center;
      opacity: var(--maomaomz-bg-opacity, 0.3);
      pointer-events: none;
      z-index: 0;
    }

    /* 底色层 - 支持纯色或渐变 */
    .panel-base-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: color-mix(in srgb, var(--maomaomz-theme-color, #546b83) 30%, #1a1a1a);
      z-index: -1;
      pointer-events: none;
    }

    /* 渐变模式底色 */
    .panel-base-layer.gradient-mode {
      background: linear-gradient(
        var(--maomaomz-gradient-angle, 135deg),
        color-mix(in srgb, var(--maomaomz-theme-color, #546b83) 35%, #1a1a1a),
        color-mix(in srgb, var(--maomaomz-theme-color-2, #8b5cf6) 35%, #1a1a1a)
      );
    }

    /* 玻璃效果 - 半透明毛玻璃，让背景透出来 */
    .glass-effect {
      background: color-mix(in srgb, var(--maomaomz-theme-color, #546b83) 15%, rgba(26, 26, 26, 0.85)) !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    /* 渐变模式玻璃效果 */
    .glass-effect.gradient-mode {
      background: linear-gradient(
        var(--maomaomz-gradient-angle, 135deg),
        color-mix(in srgb, var(--maomaomz-theme-color, #546b83) 20%, rgba(26, 26, 26, 0.8)),
        color-mix(in srgb, var(--maomaomz-theme-color-2, #8b5cf6) 20%, rgba(26, 26, 26, 0.8))
      ) !important;
    }
  `;
  document.head.appendChild(style);
  console.log('🎨 玻璃效果样式已注入');
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
  // 注入玻璃效果样式
  injectGlassStyles();
  // 初始化偏好设置
  loadAndApplyPreferences();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});

// 组件映射
const componentMap = {
  settings: SettingsTab,
  preferences: PreferencesTab,
  summary: SummaryTab,
  table: TableTab,
  greetings: GreetingsTab,
  status: StatusBarGenerator,
  regex: RegexUIGenerator,
  project: ProjectManager,
  tools: ToolsTab,
  token: TokenStatsTab,
  mvu: MvuBetaTab,
  help: HelpTab,
};

// 当前组件
const currentComponent = computed(() => componentMap[activeTab.value]);

// 组件属性
const componentProps = computed(() => ({
  activeTab: activeTab.value,
}));

// 切换标签页
const switchTab = (tabKey: string) => {
  console.log('切换标签页:', tabKey);
  activeTab.value = tabKey as any;
};

// 当前标签信息（用于移动端头部展示）
const currentTab = computed(() => {
  return tabs.find(tab => tab.key === activeTab.value) ?? tabs[0];
});

// 切换移动端菜单展开状态
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// 移动端点击标签：切换并收起菜单
const handleMobileTabClick = (tabKey: string) => {
  switchTab(tabKey);
  isMobileMenuOpen.value = false;
};

// 最小化面板
const minimizePanel = () => {
  minimizeMemoryPanel();
};

// 关闭面板
const closePanel = () => {
  $('#memoryManagementPanel').fadeOut(200);
};
</script>

<style scoped>
/* 头部按钮样式 */
.header-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.header-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.header-button:active {
  transform: translateY(0);
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* 标签栏滚动条隐藏 */
.panel-tabs::-webkit-scrollbar {
  display: none;
}

/* 标签项悬停效果 */
.tab-icon {
  font-size: 14px;
  transition: all 0.25s ease;
}

.tab-item:hover:not(.tab-active) {
  background: rgba(255, 255, 255, 0.03) !important;
  color: #ccc !important;
}

.tab-item:hover:not(.tab-active) .tab-icon {
  transform: scale(1.1);
}

.tab-active .tab-icon {
  color: #4a9eff;
  filter: drop-shadow(0 0 6px rgba(74, 158, 255, 0.3));
}

.tab-active {
  box-shadow: 0 -2px 8px rgba(74, 158, 255, 0.1) !important;
}

/* 面板内容滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}

/* 移动端标签菜单样式 */
@media (max-width: 768px) {
  .mobile-tab-menu {
    background: #222;
  }

  .mobile-tab-btn {
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    color: #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mobile-tab-btn-active {
    background: color-mix(in srgb, var(--maomaomz-theme-color, #4a9eff) 20%, #1e293b);
    border-color: var(--maomaomz-theme-color, #4a9eff);
    color: var(--maomaomz-theme-color, #e2e8f0);
    box-shadow: 0 0 8px color-mix(in srgb, var(--maomaomz-theme-color, #4a9eff) 30%, transparent);
  }

  .mobile-tab-icon {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .mobile-tab-label {
    font-size: 11px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 80px;
  }
}
</style>
