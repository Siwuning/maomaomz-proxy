<template>
  <div class="preferences-tab" style="padding: 25px; background: #1a1a1a; min-height: 100%">
    <!-- 标题 -->
    <div
      style="
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(74, 158, 255, 0.1) 100%);
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 20px;
        border: 1px solid rgba(139, 92, 246, 0.2);
      "
    >
      <h3 style="color: #8b5cf6; margin: 0 0 10px 0; font-size: 20px; font-weight: 600">
        <i class="fa-solid fa-sliders" style="margin-right: 8px"></i>
        偏好设置
      </h3>
      <p style="color: #888; margin: 0; font-size: 14px; line-height: 1.6">自定义你的使用体验</p>
    </div>

    <!-- 界面设置 -->
    <div
      style="background: #2a2a2a; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #3a3a3a"
    >
      <h4 style="color: #fff; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center; gap: 8px">
        <i class="fa-solid fa-desktop" style="color: #4a9eff"></i>
        界面设置
      </h4>

      <!-- 自动弹出面板 -->
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
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">刷新时自动弹出面板</div>
          <div style="color: #888; font-size: 12px">页面刷新后自动显示猫猫的小破烂面板</div>
        </div>
        <label class="toggle-switch">
          <input v-model="preferences.autoShowPanel" type="checkbox" @change="savePreferences" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- 显示任务中心 -->
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
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">显示任务中心</div>
          <div style="color: #888; font-size: 12px">在界面右下角显示任务进度和状态</div>
        </div>
        <label class="toggle-switch">
          <input v-model="preferences.showTaskManager" type="checkbox" @change="savePreferences" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- 通知设置 -->
    <div
      style="background: #2a2a2a; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #3a3a3a"
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
        <label class="toggle-switch">
          <input v-model="preferences.showSuccessToast" type="checkbox" @change="savePreferences" />
          <span class="toggle-slider"></span>
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
        <label class="toggle-switch">
          <input v-model="preferences.showErrorToast" type="checkbox" @change="savePreferences" />
          <span class="toggle-slider"></span>
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
  showSuccessToast: boolean;
  showErrorToast: boolean;
}

// 默认偏好设置
const defaultPreferences: Preferences = {
  autoShowPanel: true,
  showTaskManager: true,
  showSuccessToast: true,
  showErrorToast: true,
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

    // 延迟应用DOM设置，避免阻塞渲染
    setTimeout(() => {
      try {
        // 查找任务管理器容器（ID 是 global-task-manager）
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
    }, 100);
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

<style scoped>
/* 开关按钮样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #3a3a3a;
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, #4a9eff 0%, #5ab0ff 100%);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-slider:hover {
  opacity: 0.9;
}
</style>
