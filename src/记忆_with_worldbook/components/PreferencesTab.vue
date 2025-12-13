<template>
  <div class="preferences-tab" style="padding: 25px; background: #1a2332; min-height: 100%">
    <!-- 标题 -->
    <div
      style="
        background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        border: 1px solid rgba(84, 107, 131, 0.3);
      "
    >
      <h3 style="color: #7a9bb8; margin: 0 0 10px 0; font-size: 18px; font-weight: 600">
        <i class="fa-solid fa-sliders" style="margin-right: 8px"></i>
        偏好设置
      </h3>
      <p style="color: #888; margin: 0; font-size: 14px; line-height: 1.6">自定义你的使用体验</p>
    </div>

    <!-- 界面设置 -->
    <div
      style="
        background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        border: 1px solid rgba(84, 107, 131, 0.3);
      "
    >
      <h4 style="color: #fff; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center; gap: 8px">
        <i class="fa-solid fa-desktop" style="color: #6b8299"></i>
        界面设置
      </h4>

      <!-- 自动弹出面板 -->
      <div class="setting-item">
        <div style="flex: 1">
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">刷新时自动弹出面板</div>
          <div style="color: #888; font-size: 12px">页面刷新后自动显示猫猫的小破烂面板</div>
        </div>
        <label class="maomaomz-toggle-switch">
          <input v-model="preferences.autoShowPanel" type="checkbox" @change="savePreferences" />
          <span class="maomaomz-toggle-slider"></span>
        </label>
      </div>

      <!-- 显示任务中心 -->
      <div class="setting-item">
        <div style="flex: 1">
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">显示任务中心</div>
          <div style="color: #888; font-size: 12px">在界面右下角显示任务进度和状态</div>
        </div>
        <label class="maomaomz-toggle-switch">
          <input v-model="preferences.showTaskManager" type="checkbox" @change="savePreferences" />
          <span class="maomaomz-toggle-slider"></span>
        </label>
      </div>

      <!-- 显示最小化图标 -->
      <div class="setting-item">
        <div style="flex: 1">
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">显示最小化图标</div>
          <div style="color: #888; font-size: 12px">在页面右上角显示猫猫头快捷图标</div>
        </div>
        <label class="maomaomz-toggle-switch">
          <input v-model="preferences.showMinimizeIcon" type="checkbox" @change="savePreferences" />
          <span class="maomaomz-toggle-slider"></span>
        </label>
      </div>

      <!-- 设置区块默认展开 -->
      <div class="setting-item" style="margin-bottom: 0">
        <div style="flex: 1">
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">设置区块默认展开</div>
          <div style="color: #888; font-size: 12px">打开设置页面时，各功能区块默认展开还是折叠</div>
        </div>
        <label class="maomaomz-toggle-switch">
          <input v-model="preferences.defaultSectionsExpanded" type="checkbox" @change="savePreferences" />
          <span class="maomaomz-toggle-slider"></span>
        </label>
      </div>

      <!-- 主题色选择 -->
      <div
        style="
          padding: 15px;
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%);
          border-radius: 10px;
          margin-top: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        "
      >
        <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 12px">
          <i class="fa-solid fa-palette" style="margin-right: 8px; color: var(--maomaomz-theme-color, #8b5cf6)"></i>
          主题色
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 12px">
          <div
            v-for="color in themeColors"
            :key="color.value"
            :title="color.name"
            class="color-picker-item"
            :class="{ 'color-picker-active': preferences.themeColor === color.value }"
            :style="{ '--picker-color': color.value }"
            @click="
              preferences.themeColor = color.value;
              savePreferences();
            "
          ></div>
        </div>
      </div>
    </div>

    <!-- 通知设置 -->
    <div
      style="
        background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        border: 1px solid rgba(84, 107, 131, 0.3);
      "
    >
      <h4 style="color: #fff; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center; gap: 8px">
        <i class="fa-solid fa-bell" style="color: #10b981"></i>
        通知设置
      </h4>

      <!-- 成功通知 -->
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #1e1e1e;
          border-radius: 8px;
          margin-bottom: 12px;
        "
      >
        <div style="flex: 1">
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">显示成功通知</div>
          <div style="color: #888; font-size: 12px">操作成功时显示提示消息</div>
        </div>
        <label class="maomaomz-toggle-switch">
          <input v-model="preferences.showSuccessToast" type="checkbox" @change="savePreferences" />
          <span class="maomaomz-toggle-slider"></span>
        </label>
      </div>

      <!-- 错误通知 -->
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #1e1e1e;
          border-radius: 8px;
        "
      >
        <div style="flex: 1">
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">显示错误通知</div>
          <div style="color: #888; font-size: 12px">操作失败时显示错误消息</div>
        </div>
        <label class="maomaomz-toggle-switch">
          <input v-model="preferences.showErrorToast" type="checkbox" @change="savePreferences" />
          <span class="maomaomz-toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- 重置按钮 -->
    <div style="display: flex; justify-content: flex-end; gap: 10px">
      <button
        style="
          padding: 10px 20px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        "
        @click="resetPreferences"
      >
        <i class="fa-solid fa-undo"></i>
        恢复默认
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';

// 偏好设置接口
interface Preferences {
  autoShowPanel: boolean;
  showTaskManager: boolean;
  showMinimizeIcon: boolean;
  showSuccessToast: boolean;
  showErrorToast: boolean;
  themeColor: string;
  defaultSectionsExpanded: boolean; // 设置页面折叠区块默认展开
}

// 主题色预设
const themeColors = [
  { name: '天空蓝', value: '#4a9eff' },
  { name: '薄荷绿', value: '#10b981' },
  { name: '梦幻紫', value: '#8b5cf6' },
  { name: '珊瑚橙', value: '#f97316' },
  { name: '樱花粉', value: '#ec4899' },
  { name: '柠檬黄', value: '#eab308' },
  { name: '宝石红', value: '#ef4444' },
  { name: '青瓷色', value: '#06b6d4' },
];

// 默认偏好设置
const defaultPreferences: Preferences = {
  autoShowPanel: true,
  showTaskManager: true,
  showMinimizeIcon: true,
  showSuccessToast: true,
  showErrorToast: true,
  themeColor: '#4a9eff',
  defaultSectionsExpanded: true, // 默认展开
};

// 偏好设置状态
const preferences = reactive<Preferences>({ ...defaultPreferences });

// localStorage 键名
const PREFERENCES_KEY = 'maomaomz_preferences';

// 加载偏好设置
const loadPreferences = () => {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(preferences, data);
      console.log('✅ 已加载偏好设置:', preferences);

      // 应用设置
      applyPreferences();
    }
  } catch (error) {
    console.error('❌ 加载偏好设置失败:', error);
  }
};

// 保存偏好设置
const savePreferences = () => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    console.log('💾 偏好设置已保存:', preferences);
    (window as any).toastr?.success('偏好设置已保存');

    // 应用设置
    applyPreferences();
  } catch (error) {
    console.error('❌ 保存偏好设置失败:', error);
    (window as any).toastr?.error('保存失败');
  }
};

// 应用偏好设置
const applyPreferences = () => {
  try {
    // 保存到全局，供其他模块使用
    (window as any).maomaomzPreferences = preferences;

    // 应用主题色 CSS 变量
    document.documentElement.style.setProperty('--maomaomz-theme-color', preferences.themeColor);
    console.log('🎨 主题色已更新:', preferences.themeColor);

    // 立即应用任务管理器显示状态
    try {
      const taskManager = document.getElementById('global-task-manager') as HTMLElement;
      if (taskManager) {
        taskManager.style.display = preferences.showTaskManager ? 'block' : 'none';
        console.log('✅ 任务管理器显示状态已更新:', preferences.showTaskManager ? '显示' : '隐藏');
      } else {
        console.warn('⚠️ 任务管理器容器未找到');
      }
    } catch (err) {
      console.warn('❌ 更新任务管理器显示状态失败:', err);
    }

    // 应用最小化图标显示状态（需要等待图标创建，增加重试机制）
    const applyMinimizeIconState = () => {
      try {
        const minimizeIcon = document.getElementById('memoryPanelMinimizeIcon') as HTMLElement;
        if (minimizeIcon) {
          minimizeIcon.style.display = preferences.showMinimizeIcon ? 'flex' : 'none';
          console.log('✅ 最小化图标显示状态已更新:', preferences.showMinimizeIcon ? '显示' : '隐藏');
          return true;
        }
        return false;
      } catch (err) {
        console.warn('❌ 更新最小化图标显示状态失败:', err);
        return false;
      }
    };

    // 立即尝试应用
    if (!applyMinimizeIconState()) {
      // 如果图标还未创建，延迟重试（最多尝试15次，每次间隔100ms = 1.5秒总等待）
      console.log('⏳ 最小化图标尚未创建，开始等待...');
      let retryCount = 0;
      const maxRetries = 15;
      const retryInterval = setInterval(() => {
        retryCount++;
        if (applyMinimizeIconState()) {
          clearInterval(retryInterval);
          console.log(`✅ 第 ${retryCount} 次重试成功应用最小化图标状态`);
        } else if (retryCount >= maxRetries) {
          clearInterval(retryInterval);
          console.warn('⚠️ 最小化图标在1.5秒后仍未创建');
        }
      }, 100);
    }
  } catch (error) {
    console.error('❌ 应用偏好设置失败:', error);
  }
};

// 重置偏好设置
const resetPreferences = () => {
  if (confirm('确定要恢复默认设置吗？')) {
    Object.assign(preferences, defaultPreferences);
    savePreferences();
    (window as any).toastr?.success('已恢复默认设置');
  }
};

// 组件挂载时加载
onMounted(() => {
  loadPreferences();
});
</script>

<style>
/* 开关按钮样式 - 使用唯一前缀避免冲突 */
.maomaomz-toggle-switch {
  position: relative !important;
  display: inline-block !important;
  width: 50px !important;
  height: 26px !important;
  flex-shrink: 0 !important;
}

.maomaomz-toggle-switch input {
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  position: absolute !important;
}

.maomaomz-toggle-slider {
  position: absolute !important;
  cursor: pointer !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: #3a3a3a !important;
  transition: 0.3s !important;
  border-radius: 26px !important;
  display: block !important;
}

.maomaomz-toggle-slider:before {
  position: absolute !important;
  content: '' !important;
  height: 20px !important;
  width: 20px !important;
  left: 3px !important;
  bottom: 3px !important;
  background-color: white !important;
  transition: 0.3s !important;
  border-radius: 50% !important;
}

.maomaomz-toggle-switch input:checked + .maomaomz-toggle-slider {
  background: var(--maomaomz-theme-color, #4a9eff) !important;
}

.maomaomz-toggle-switch input:checked + .maomaomz-toggle-slider:before {
  transform: translateX(24px) !important;
}

.maomaomz-toggle-slider:hover {
  opacity: 0.9 !important;
}

/* 设置项卡片 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #1e1e1e;
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.setting-item:hover {
  background: linear-gradient(135deg, #252525 0%, #2a2a2a 100%);
  border-color: var(--maomaomz-theme-color, #4a9eff);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transform: translateX(4px);
}

/* 主题色选择器 */
.color-picker-item {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--picker-color);
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.color-picker-item:hover {
  transform: scale(1.15) translateY(-2px);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--picker-color) 50%, transparent);
}

.color-picker-item:active {
  transform: scale(0.95);
}

.color-picker-active {
  border-color: #fff;
  box-shadow:
    0 0 0 3px var(--picker-color),
    0 4px 15px color-mix(in srgb, var(--picker-color) 60%, transparent);
  transform: scale(1.1);
}

.color-picker-active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>
