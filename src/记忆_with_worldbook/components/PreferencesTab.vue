<template>
  <div class="preferences-tab" style="padding: 25px; background: transparent; min-height: 100%">
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
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border-radius: 10px;
          margin-top: 12px;
          border: 1px solid rgba(84, 107, 131, 0.3);
        "
      >
        <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 12px">
          <i class="fa-solid fa-palette" style="margin-right: 8px; color: var(--maomaomz-theme-color, #8b5cf6)"></i>
          主题色
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
          <div
            v-for="color in themeColors"
            :key="color.value"
            :title="color.name"
            :class="{ 'color-picker-active': preferences.themeColor === color.value }"
            :style="{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '10px',
              background: color.value,
              cursor: 'pointer',
              border: preferences.themeColor === color.value ? '3px solid #fff' : '3px solid transparent',
              boxShadow:
                preferences.themeColor === color.value
                  ? `0 0 0 3px ${color.value}, 0 4px 15px ${color.value}80`
                  : 'none',
              transition: 'all 0.3s ease',
              display: 'inline-block',
            }"
            @click="
              preferences.themeColor = color.value;
              savePreferences();
            "
          ></div>
          <!-- 自定义颜色选择器 -->
          <div style="display: flex; align-items: center; gap: 8px; margin-left: 8px">
            <input
              type="color"
              :value="preferences.themeColor"
              title="自定义颜色"
              style="
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                background: transparent;
                padding: 0;
              "
              @input="
                preferences.themeColor = ($event.target as HTMLInputElement).value;
                applyPreferences();
              "
              @change="savePreferencesQuiet()"
            />
            <input
              type="text"
              :value="preferences.themeColor"
              placeholder="#4a9eff"
              title="输入颜色代码"
              style="
                width: 80px;
                height: 32px;
                background: #1a1a1a;
                border: 1px solid rgba(84, 107, 131, 0.3);
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 12px;
                font-family: monospace;
                text-align: center;
                padding: 0 8px;
              "
              @change="
                const val = ($event.target as HTMLInputElement).value;
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                  preferences.themeColor = val;
                  savePreferences();
                }
              "
            />
          </div>
        </div>

        <!-- 渐变色设置 -->
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(84, 107, 131, 0.2)">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px">
            <div style="color: #e0e0e0; font-size: 14px; font-weight: 500">
              <i
                class="fa-solid fa-wand-magic-sparkles"
                style="margin-right: 8px; color: var(--maomaomz-theme-color, #8b5cf6)"
              ></i>
              渐变色模式
            </div>
            <label class="maomaomz-toggle-switch">
              <input v-model="preferences.useGradient" type="checkbox" @change="savePreferences" />
              <span class="maomaomz-toggle-slider"></span>
            </label>
          </div>

          <!-- 渐变色设置（仅在开启时显示） -->
          <div v-if="preferences.useGradient" style="display: flex; flex-direction: column; gap: 12px">
            <!-- 第二颜色选择 -->
            <div style="display: flex; align-items: center; gap: 12px">
              <span style="color: #888; font-size: 12px; min-width: 60px">第二颜色</span>
              <input
                type="color"
                :value="preferences.gradientColor2"
                style="
                  width: 36px;
                  height: 36px;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  background: transparent;
                  padding: 0;
                "
                @input="
                  preferences.gradientColor2 = ($event.target as HTMLInputElement).value;
                  applyPreferences();
                "
                @change="savePreferencesQuiet()"
              />
              <input
                type="text"
                :value="preferences.gradientColor2"
                placeholder="#8b5cf6"
                style="
                  width: 80px;
                  height: 28px;
                  background: #1a1a1a;
                  border: 1px solid rgba(84, 107, 131, 0.3);
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 12px;
                  font-family: monospace;
                  text-align: center;
                "
                @change="
                  const val = ($event.target as HTMLInputElement).value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    preferences.gradientColor2 = val;
                    savePreferences();
                  }
                "
              />
            </div>

            <!-- 渐变角度 -->
            <div style="display: flex; align-items: center; gap: 12px">
              <span style="color: #888; font-size: 12px; min-width: 60px">渐变角度</span>
              <input
                v-model.number="preferences.gradientAngle"
                type="range"
                min="0"
                max="360"
                style="flex: 1; accent-color: var(--maomaomz-theme-color, #4a9eff)"
                @input="applyPreferences()"
                @change="savePreferencesQuiet()"
              />
              <span style="color: #e0e0e0; font-size: 12px; min-width: 35px">{{ preferences.gradientAngle }}°</span>
            </div>

            <!-- 预览 -->
            <div
              style="height: 40px; border-radius: 8px; margin-top: 4px"
              :style="{
                background: `linear-gradient(${preferences.gradientAngle}deg, ${preferences.themeColor} 0%, ${preferences.gradientColor2} 100%)`,
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 背景图片设置 -->
      <div
        style="
          padding: 15px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border-radius: 10px;
          margin-top: 12px;
          border: 1px solid rgba(84, 107, 131, 0.3);
        "
      >
        <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 12px">
          <i class="fa-solid fa-image" style="margin-right: 8px; color: var(--maomaomz-theme-color, #8b5cf6)"></i>
          背景图片
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
          <label
            style="
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 16px;
              background: rgba(74, 158, 255, 0.1);
              border: 1px solid rgba(74, 158, 255, 0.3);
              border-radius: 8px;
              color: #4a9eff;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s ease;
            "
          >
            <i class="fa-solid fa-upload"></i>
            上传图片
            <input type="file" accept="image/*" style="display: none" @change="handleBackgroundUpload" />
          </label>
          <button
            v-if="preferences.backgroundImage"
            style="
              padding: 8px 16px;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 8px;
              color: #ef4444;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="clearBackground"
          >
            <i class="fa-solid fa-trash" style="margin-right: 6px"></i>
            清除背景
          </button>
        </div>
        <div v-if="preferences.backgroundImage" style="margin-top: 12px">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px">
            <span style="color: #888; font-size: 12px">透明度:</span>
            <input
              v-model.number="preferences.backgroundOpacity"
              type="range"
              min="10"
              max="80"
              style="flex: 1; accent-color: var(--maomaomz-theme-color, #4a9eff)"
              @input="applyPreferences()"
              @change="savePreferences()"
            />
            <span style="color: #e0e0e0; font-size: 12px; min-width: 35px">{{ preferences.backgroundOpacity }}%</span>
          </div>
          <div
            style="
              width: 100%;
              height: 60px;
              border-radius: 8px;
              background-size: cover;
              background-position: center;
              border: 1px solid rgba(84, 107, 131, 0.3);
            "
            :style="{ backgroundImage: `url(${preferences.backgroundImage})` }"
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

    <!-- 教程设置 -->
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
        <i class="fa-solid fa-graduation-cap" style="color: #fbbf24"></i>
        教程设置
      </h4>

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
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">重新显示所有教程</div>
          <div style="color: #888; font-size: 12px">点击后各页面的快速上手教程将重新显示</div>
        </div>
        <button
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
          @click="resetAllGuides"
        >
          <i class="fa-solid fa-eye"></i>
          重新显示
        </button>
      </div>

      <div style="color: #666; font-size: 11px; padding: 0 5px">
        💡 提示：每个页面顶部的教程可以单独关闭，关闭后不会再显示。如果想重新查看，点击上方按钮即可。
      </div>
    </div>

    <!-- 数据备份 -->
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
        <i class="fa-solid fa-database" style="color: #60a5fa"></i>
        数据备份
      </h4>

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
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">导出数据</div>
          <div style="color: #888; font-size: 12px">导出所有设置、总结历史和偏好配置到 JSON 文件</div>
        </div>
        <button
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
          @click="exportData"
        >
          <i class="fa-solid fa-download"></i>
          导出
        </button>
      </div>

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
          <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 4px">导入数据</div>
          <div style="color: #888; font-size: 12px">从 JSON 文件恢复设置和数据（会覆盖现有配置）</div>
        </div>
        <label
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
        >
          <i class="fa-solid fa-upload"></i>
          导入
          <input type="file" accept=".json" style="display: none" @change="importData" />
        </label>
      </div>

      <div style="color: #666; font-size: 11px; padding: 0 5px">
        💡 提示：定期备份数据可以防止数据丢失。导入时会覆盖现有配置，请谨慎操作。
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
  useGradient: boolean; // 是否使用渐变色
  gradientColor2: string; // 渐变色第二个颜色
  gradientAngle: number; // 渐变角度 0-360
  defaultSectionsExpanded: boolean; // 设置页面折叠区块默认展开
  backgroundImage: string; // 背景图片 (base64 或 URL)
  backgroundOpacity: number; // 背景透明度 0-100
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
  useGradient: false, // 默认不使用渐变
  gradientColor2: '#8b5cf6', // 默认第二颜色为紫色
  gradientAngle: 135, // 默认135度角
  defaultSectionsExpanded: true, // 默认展开
  backgroundImage: '', // 默认无背景
  backgroundOpacity: 30, // 默认 30% 透明度
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

// 静默保存偏好设置（不弹通知，用于滑动操作）
const savePreferencesQuiet = () => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    console.log('💾 偏好设置已静默保存');
  } catch (error) {
    console.error('❌ 保存偏好设置失败:', error);
  }
};

// 应用偏好设置
const applyPreferences = () => {
  try {
    // 保存到全局，供其他模块使用
    (window as any).maomaomzPreferences = preferences;

    // 应用主题色 CSS 变量
    document.documentElement.style.setProperty('--maomaomz-theme-color', preferences.themeColor);
    document.documentElement.style.setProperty('--maomaomz-theme-color-2', preferences.gradientColor2 || '#8b5cf6');
    document.documentElement.style.setProperty('--maomaomz-gradient-angle', `${preferences.gradientAngle || 135}deg`);
    document.documentElement.style.setProperty('--maomaomz-use-gradient', preferences.useGradient ? '1' : '0');
    console.log(
      '🎨 主题色已更新:',
      preferences.themeColor,
      preferences.useGradient ? `渐变到 ${preferences.gradientColor2}` : '纯色',
    );

    // 应用背景图片到面板
    document.documentElement.style.setProperty(
      '--maomaomz-bg-image',
      preferences.backgroundImage ? `url(${preferences.backgroundImage})` : 'none',
    );
    document.documentElement.style.setProperty(
      '--maomaomz-bg-opacity',
      (preferences.backgroundOpacity / 100).toString(),
    );
    console.log('🖼️ 背景设置已更新');

    // 应用渐变模式 class
    const baseLayer = document.querySelector('.panel-base-layer');
    const glassEffects = document.querySelectorAll('.glass-effect');
    if (preferences.useGradient) {
      baseLayer?.classList.add('gradient-mode');
      glassEffects.forEach(el => el.classList.add('gradient-mode'));
    } else {
      baseLayer?.classList.remove('gradient-mode');
      glassEffects.forEach(el => el.classList.remove('gradient-mode'));
    }

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

// 重置所有教程显示状态
const resetAllGuides = () => {
  const guideKeys = [
    'maomaomz_settings_guide_hidden',
    'maomaomz_summary_guide_hidden',
    'maomaomz_statusbar_guide_hidden',
    'maomaomz_uigenerator_guide_hidden',
    'maomaomz_tools_guide_hidden',
    'maomaomz_greetings_guide_hidden',
    'maomaomz_mvu_guide_hidden',
  ];

  guideKeys.forEach(key => localStorage.removeItem(key));
  (window as any).toastr?.success('所有教程已重置，切换页面后即可看到');
  console.log('✅ 已重置所有教程显示状态');
};

// 处理背景图片上传
const handleBackgroundUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // 检查文件大小 (限制 2MB)
  if (file.size > 2 * 1024 * 1024) {
    (window as any).toastr?.error('图片大小不能超过 2MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    preferences.backgroundImage = e.target?.result as string;
    savePreferences();
    (window as any).toastr?.success('背景图片已设置');
  };
  reader.readAsDataURL(file);
  input.value = ''; // 清空 input 以便再次选择同一文件
};

// 清除背景图片
const clearBackground = () => {
  preferences.backgroundImage = '';
  savePreferences();
  (window as any).toastr?.info('背景图片已清除');
};

// 导出数据
const exportData = () => {
  try {
    const exportObj: Record<string, any> = {
      exportTime: new Date().toISOString(),
      version: '2.0',
      data: {},
    };

    // 收集所有 maomaomz 相关的 localStorage 数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('maomaomz') || key.includes('tavern_helper') || key.includes('maomao'))) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            // 尝试解析 JSON，如果失败则保存原始字符串
            try {
              exportObj.data[key] = JSON.parse(value);
            } catch {
              exportObj.data[key] = value;
            }
          }
        } catch (e) {
          console.warn(`跳过无法读取的键: ${key}`);
        }
      }
    }

    // 生成文件名
    const date = new Date();
    const fileName = `maomaomz_backup_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}.json`;

    // 创建下载
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const keyCount = Object.keys(exportObj.data).length;
    (window as any).toastr?.success(`✅ 数据导出成功！共 ${keyCount} 项配置`);
  } catch (error) {
    console.error('导出数据失败:', error);
    (window as any).toastr?.error('❌ 导出失败: ' + (error as Error).message);
  }
};

// 导入数据
const importData = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const content = e.target?.result as string;
      const importObj = JSON.parse(content);

      // 验证文件格式
      if (!importObj.data || typeof importObj.data !== 'object') {
        throw new Error('无效的备份文件格式');
      }

      // 确认导入
      const keyCount = Object.keys(importObj.data).length;
      const exportTime = importObj.exportTime ? new Date(importObj.exportTime).toLocaleString() : '未知';

      if (
        !confirm(`确定要导入此备份吗？\n\n备份时间: ${exportTime}\n配置项数: ${keyCount}\n\n⚠️ 导入将覆盖现有配置！`)
      ) {
        return;
      }

      // 导入数据
      let successCount = 0;
      for (const [key, value] of Object.entries(importObj.data)) {
        try {
          const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, valueStr);
          successCount++;
        } catch (e) {
          console.warn(`导入键失败: ${key}`, e);
        }
      }

      // 重新加载偏好设置
      loadPreferences();

      (window as any).toastr?.success(`✅ 数据导入成功！已恢复 ${successCount} 项配置\n请刷新页面以应用所有更改`);

      // 提示刷新
      setTimeout(() => {
        if (confirm('是否立即刷新页面以应用所有更改？')) {
          window.location.reload();
        }
      }, 500);
    } catch (error) {
      console.error('导入数据失败:', error);
      (window as any).toastr?.error('❌ 导入失败: ' + (error as Error).message);
    }
  };

  reader.readAsText(file);
  input.value = ''; // 清空 input 以便再次选择
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
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  border-radius: 10px !important;
  background: var(--picker-color) !important;
  cursor: pointer !important;
  border: 3px solid transparent !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
  display: inline-block !important;
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
