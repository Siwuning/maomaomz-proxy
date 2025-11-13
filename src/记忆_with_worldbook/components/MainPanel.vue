<template>
  <div
    class="memory-panel-container"
    style="display: flex; flex-direction: column; height: 100%; background: #1a1a1a; color: #e0e0e0"
  >
    <!-- 面板头部 -->
    <div
      class="panel-header"
      style="
        padding: 16px 24px;
        background: #252525;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      "
    >
      <div class="header-left" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <span
          class="header-icon"
          style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
          >🐱</span
        >
        <div style="display: flex; flex-direction: column; gap: 4px">
          <span class="panel-title" style="font-size: 16px; font-weight: 600; color: #fff; letter-spacing: 0.5px"
            >猫猫的小破烂</span
          >
          <span
            style="
              font-size: 11px;
              color: #ef4444;
              font-weight: 700;
              text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
              letter-spacing: 0.5px;
            "
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
            border: none;
            background: rgba(255, 255, 255, 0.05);
            color: #e0e0e0;
            border-radius: 6px;
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
            border: none;
            background: rgba(255, 255, 255, 0.05);
            color: #e0e0e0;
            border-radius: 6px;
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

    <!-- 面板标签栏 -->
    <div
      class="panel-tabs"
      style="
        display: flex;
        background: #222;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        flex-shrink: 0;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      "
    >
      <div
        v-for="tab of tabs"
        :key="tab.key"
        :class="{ 'tab-active': activeTab === tab.key }"
        class="tab-item"
        :style="{
          flex: '0 0 auto',
          minWidth: '120px',
          padding: '14px 20px',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          position: 'relative',
          background: activeTab === tab.key ? '#1a1a1a' : 'transparent',
          color: activeTab === tab.key ? '#4a9eff' : '#999',
          borderBottom: activeTab === tab.key ? '2px solid #4a9eff' : '2px solid transparent',
          fontSize: '13px',
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
      class="panel-content"
      style="
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0;
        min-height: 0;
        scrollbar-width: thin;
        scrollbar-color: #4a9eff #2a2a2a;
      "
    >
      <component :is="currentComponent" :key="activeTab" v-bind="componentProps" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { minimizeMemoryPanel } from '../浮动面板';
import GreetingsTab from './GreetingsTab.vue';
import HelpTab from './HelpTab.vue';
import MvuBetaTab from './MvuBetaTab.vue';
import ProjectManager from './ProjectManager.vue';
import RegexUIGenerator from './RegexUIGenerator.vue';
import SettingsTab from './SettingsTab.vue';
import StatusBarGenerator from './StatusBarGenerator.vue';
import SummaryTab from './SummaryTab.vue';
import TableTab from './TableTab.vue';
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
  | 'mvu'
  | 'help'
>('settings');

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
</style>
