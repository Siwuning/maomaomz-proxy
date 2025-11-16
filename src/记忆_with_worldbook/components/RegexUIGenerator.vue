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
      <div style="display: flex; gap: 10px; flex-wrap: wrap; position: relative; z-index: 10">
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
            pointer-events: auto;
          "
          @click.stop="loadExample"
        >
          <i class="fa-solid fa-lightbulb" style="margin-right: 6px; pointer-events: none"></i>
          加载示例
        </button>
        <button
          class="action-button"
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            pointer-events: auto;
          "
          @click.stop="showTemplateLibrary"
        >
          <i class="fa-solid fa-palette" style="margin-right: 6px; pointer-events: none"></i>
          模板库
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
            pointer-events: auto;
          "
          :disabled="isGenerating"
          @click.stop="generateWithAI"
        >
          <i
            :class="isGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"
            style="margin-right: 6px; pointer-events: none"
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
            pointer-events: auto;
          "
          :disabled="!generatedHTML"
          @click.stop="exportRegex"
        >
          <i class="fa-solid fa-download" style="margin-right: 6px; pointer-events: none"></i>
          导出正则
        </button>
        <button
          class="action-button"
          style="
            padding: 8px 16px;
            background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            pointer-events: auto;
          "
          :disabled="!generatedHTML"
          @click.stop="showWorldbookGuide"
        >
          <i class="fa-solid fa-question-circle" style="margin-right: 6px; pointer-events: none"></i>
          使用说明
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
            pointer-events: auto;
          "
          @click.stop="restoreFromBackup"
        >
          <i class="fa-solid fa-clock-rotate-left" style="margin-right: 6px; pointer-events: none"></i>
          恢复备份
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
            pointer-events: auto;
          "
          @click.stop="clearAll"
        >
          <i class="fa-solid fa-trash" style="margin-right: 6px; pointer-events: none"></i>
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
              placeholder="<-PAGEABLE_STATUSBAR->"
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

        <div style="flex: 1; background: #fff; border-radius: 12px; overflow: hidden; border: 2px solid #3a3a3a">
          <iframe
            v-if="generatedHTML"
            :srcdoc="previewHTML"
            style="width: 100%; height: 100%; border: none"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
          <div
            v-else
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: #999;
              text-align: center;
              padding: 20px;
            "
          >
            <div>
              <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3"></i>
              <p style="font-size: 14px">使用 AI 生成或加载示例查看预览</p>
            </div>
          </div>
        </div>

        <!-- 世界书条目预览 -->
        <div
          v-if="generatedHTML"
          style="margin-top: 20px; background: #2a2a2a; border-radius: 12px; padding: 16px; border: 2px solid #8b5cf6"
        >
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #3a3a3a;
            "
          >
            <div style="display: flex; align-items: center; gap: 10px">
              <i class="fa-solid fa-book" style="color: #8b5cf6; font-size: 16px"></i>
              <span style="color: #fff; font-size: 14px; font-weight: 600">世界书条目</span>
            </div>
            <button
              style="
                padding: 6px 12px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
              "
              @click="copyWorldbookContent"
            >
              <i class="fa-solid fa-copy"></i>
              复制
            </button>
          </div>
          <div
            style="
              background: #1e1e1e;
              border-radius: 8px;
              padding: 12px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #e0e0e0;
              line-height: 1.6;
              max-height: 300px;
              overflow-y: auto;
            "
          >
            <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word">{{ worldbookContent }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板库对话框 -->
    <div
      v-if="showTemplateDialog"
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
      @click.self="showTemplateDialog = false"
    >
      <div
        style="
          background: #1e1e1e;
          border-radius: 16px;
          padding: 30px;
          max-width: 900px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        "
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
          <h3 style="color: #a855f7; margin: 0; font-size: 20px">
            <i class="fa-solid fa-palette" style="margin-right: 8px"></i>
            精美模板库
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
            @click="showTemplateDialog = false"
          >
            ×
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px">
          <div
            v-for="template in templates"
            :key="template.id"
            style="
              background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
              border-radius: 12px;
              padding: 20px;
              border: 2px solid #3a3a3a;
              cursor: pointer;
              transition: all 0.3s ease;
            "
            @click="loadTemplate(template)"
            @mouseenter="e => (e.currentTarget.style.borderColor = '#a855f7')"
            @mouseleave="e => (e.currentTarget.style.borderColor = '#3a3a3a')"
          >
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px">
              <div
                style="
                  width: 40px;
                  height: 40px;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 20px;
                "
                :style="{ background: template.color }"
              >
                {{ template.icon }}
              </div>
              <h4 style="color: #fff; margin: 0; font-size: 16px">{{ template.name }}</h4>
            </div>
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0">{{ template.description }}</p>
            <div style="margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap">
              <span
                v-for="tag in template.tags"
                :key="tag"
                style="
                  background: rgba(168, 85, 247, 0.2);
                  color: #a855f7;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                "
              >
                {{ tag }}
              </span>
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
            <p style="margin: 0; font-size: 14px; line-height: 1.8">
              <strong style="color: #8b5cf6">📌 快速开始：</strong><br />
              1. 点击右侧"世界书条目"区域的"复制"按钮，复制状态栏规则<br />
              2. 在 SillyTavern 中打开世界书，创建或编辑一个条目<br />
              3. 将复制的内容粘贴到世界书条目的"内容"字段中<br />
              4. 在"关键词"中添加触发词（例如：<code
                style="background: #2a2a2a; padding: 2px 6px; border-radius: 3px"
                >{{ triggerRegex }}</code
              >）<br />
              5. 在聊天中输入触发词即可看到状态栏效果
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
import { computed, onMounted, ref, watch } from 'vue';
import { filterApiParams, normalizeApiEndpoint, useSettingsStore } from '../settings';

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const triggerRegex = ref('<-PAGEABLE_STATUSBAR->');
const aiPrompt = ref('');
const isGenerating = ref(false);
const generatedHTML = ref('');
const showWorldbookDialog = ref(false);
const showTemplateDialog = ref(false);

// localStorage 键名
const STORAGE_KEY = 'pageable_statusbar_generator_data';
const STORAGE_VERSION = 2; // 数据版本号
const BACKUP_KEY = 'pageable_statusbar_generator_backup';
const MAX_BACKUPS = 3; // 最多保留3个备份

// 防抖定时器
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

// 从 localStorage 加载数据
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // 检查数据版本
      const version = parsed.version || 1;
      let data = parsed.data || parsed; // 兼容旧版本

      // 数据迁移
      if (version < STORAGE_VERSION) {
        console.log(`🔄 数据版本从 v${version} 升级到 v${STORAGE_VERSION}`);
        data = migrateData(data, version);
      }

      // 加载数据
      triggerRegex.value = data.triggerRegex || '<-PAGEABLE_STATUSBAR->';
      aiPrompt.value = data.aiPrompt || '';
      generatedHTML.value = data.generatedHTML || '';

      console.log('✅ 已从 localStorage 加载翻页状态栏数据');
    }
  } catch (error) {
    console.error('❌ 加载数据失败:', error);
    // 尝试从备份恢复
    tryRestoreFromBackup();
  }
};

// 数据迁移函数
const migrateData = (data: any, fromVersion: number) => {
  // v1 -> v2: 无需迁移，只是添加了版本号
  return data;
};

// 从备份恢复
const tryRestoreFromBackup = () => {
  try {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (backupStr) {
      const backups = JSON.parse(backupStr);
      if (Array.isArray(backups) && backups.length > 0) {
        const latestBackup = backups[0];
        triggerRegex.value = latestBackup.triggerRegex || '<-PAGEABLE_STATUSBAR->';
        aiPrompt.value = latestBackup.aiPrompt || '';
        generatedHTML.value = latestBackup.generatedHTML || '';
        console.log('✅ 已从备份恢复数据');
        (window as any).toastr?.info('已从备份恢复数据');
      }
    }
  } catch (error) {
    console.error('❌ 从备份恢复失败:', error);
  }
};

// 保存到 localStorage（带防抖）
const saveToStorage = () => {
  // 清除之前的定时器
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // 设置新的定时器（500ms 防抖）
  saveTimeout = setTimeout(() => {
    try {
      const data = {
        triggerRegex: triggerRegex.value,
        aiPrompt: aiPrompt.value,
        generatedHTML: generatedHTML.value,
      };

      // 包装数据，添加版本信息和时间戳
      const wrappedData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        data: data,
      };

      // 尝试保存
      const jsonStr = JSON.stringify(wrappedData);
      localStorage.setItem(STORAGE_KEY, jsonStr);

      // 创建备份
      createBackup(data);

      console.log('💾 翻页状态栏数据已保存');
    } catch (error) {
      console.error('❌ 保存数据失败:', error);

      // 如果是配额超出错误，尝试清理旧数据
      if ((error as Error).name === 'QuotaExceededError') {
        console.warn('⚠️ 存储空间不足，正在清理...');
        cleanupStorage();
        // 重试保存
        try {
          const data = {
            triggerRegex: triggerRegex.value,
            aiPrompt: aiPrompt.value,
            generatedHTML: generatedHTML.value,
          };
          const wrappedData = {
            version: STORAGE_VERSION,
            timestamp: Date.now(),
            data: data,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(wrappedData));
          console.log('✅ 清理后保存成功');
        } catch (retryError) {
          console.error('❌ 重试保存失败:', retryError);
          (window as any).toastr?.error('存储空间不足，数据保存失败');
        }
      }
    }
  }, 500); // 500ms 防抖延迟
};

// 创建备份
const createBackup = (data: any) => {
  try {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    let backups: any[] = [];

    if (backupStr) {
      backups = JSON.parse(backupStr);
    }

    // 添加新备份（带时间戳）
    backups.unshift({
      ...data,
      timestamp: Date.now(),
    });

    // 只保留最近的 MAX_BACKUPS 个备份
    if (backups.length > MAX_BACKUPS) {
      backups = backups.slice(0, MAX_BACKUPS);
    }

    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
  } catch (error) {
    console.warn('⚠️ 创建备份失败:', error);
  }
};

// 清理存储空间
const cleanupStorage = () => {
  try {
    // 清理备份，只保留最新的一个
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (backupStr) {
      const backups = JSON.parse(backupStr);
      if (Array.isArray(backups) && backups.length > 0) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify([backups[0]]));
        console.log('✅ 已清理旧备份');
      }
    }
  } catch (error) {
    console.warn('⚠️ 清理存储失败:', error);
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadFromStorage();
});

// 监听数据变化，自动保存（带防抖）
watch([triggerRegex, aiPrompt, generatedHTML], () => {
  saveToStorage();
});

// 预览 HTML
const previewHTML = computed(() => {
  if (!generatedHTML.value) return '';

  // 返回完整的 HTML 文档，确保 JavaScript 可以执行
  const scriptTag = 'script';
  return (
    `
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

  <${scriptTag}>
  // 默认的翻页函数（如果 AI 生成的代码中没有定义）
  if (typeof switchPage === 'undefined') {
    window.switchPage = function(index) {
      console.log('Using default switchPage, index:', index);

      const tabs = document.querySelectorAll('.page-tab, button[onclick*="switchPage"]');
      tabs.forEach((tab, i) => {
        if (i === index) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      const pages = document.querySelectorAll('.page, [data-page]');
      pages.forEach((page, i) => {
        const pageIndex = page.getAttribute('data-page');
        if (pageIndex !== null) {
          if (parseInt(pageIndex) === index) {
            page.classList.add('active');
            page.style.display = 'block';
          } else {
            page.classList.remove('active');
            page.style.display = 'none';
          }
        } else {
          if (i === index) {
            page.classList.add('active');
            page.style.display = 'block';
          } else {
            page.classList.remove('active');
            page.style.display = 'none';
          }
        }
      });
    };
  }
  </` +
    `${scriptTag}>
</body>
</html>
  `
  );
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

// 世界书条目内容（用于显示）
const worldbookContent = computed(() => {
  if (!generatedHTML.value) return '';

  // 提取 {{字段名}} 格式的占位符
  const matches = generatedHTML.value.match(/\{\{([^}]+)\}\}/g);
  if (!matches || matches.length === 0) {
    return '未检测到字段占位符\n\n请在 AI 需求中描述需要的字段，AI 会自动生成对应的 {{字段名}} 占位符';
  }

  const uniqueFields = [...new Set(matches.map(m => m.slice(2, -2)))];

  // 生成状态栏规则 - 添加触发标记
  const triggerMark = triggerRegex.value; // 使用触发正则作为标记

  const statusRule = `<status_rule>
#每一次回复都必须在末尾加上完整的状态栏，实时更新{{char}}的状态。

##状态栏格式：
<status>
${triggerMark}
${uniqueFields.map(field => `{{${field}}}`).join('\n')}
</status>

##字段说明
${uniqueFields.map(field => `  - ${field}：描述${field}当前的值`).join('\n')}

##输出示例
此处仅为格式示例，具体内容需根据剧情填写
<status>
${triggerMark}
${uniqueFields
  .map(field => {
    let example = '[具体值]';
    if (field.includes('姓名') || field.includes('名字')) example = '{{char}}';
    else if (field.includes('年龄')) example = '25';
    else if (field.includes('HP') || field.includes('生命')) example = '100/100';
    else if (field.includes('MP') || field.includes('魔法')) example = '80/100';
    else if (field.includes('好感')) example = '88/100';
    return `{{${field}}}${example}`;
  })
  .join('\n')}
</status>

##格式要求（必读）：
1. **必须包含 <status> 标签和触发标记**：
   - ✅ 开头：<status>
   - ✅ 第一行：${triggerMark}
   - ✅ 结尾：</status>

2. **严格按照上述示例格式输出**：
   - 每个字段必须独占一行
   - ❌ 错误：姓名：张三
   - ✅ 正确：{{姓名}}张三
   - 格式必须是：{{字段名}}字段值（{{字段名}}不能省略！）
   - 不要改变行数、不要合并行、不要调换顺序

3. **字段值格式**：
   - ❌ 错误：姓名：张三（有冒号和字段名）
   - ✅ 正确：{{姓名}}张三（只有占位符和值）
   - 必须保留 {{字段名}} 占位符

4. **其他要求**：
   - 状态栏紧贴正文最后一句
   - {{字段名}} 是必须的，不能省略
   - 这是 {{char}} 的状态，不是 {{user}} 的状态
</status_rule>`;

  return statusRule;
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

  // 创建任务
  const { useTaskStore } = await import('../taskStore');
  const taskStore = useTaskStore();
  const taskId = taskStore.createTask('ui_generate', `AI 生成翻页状态栏: ${aiPrompt.value.substring(0, 30)}...`);

  const scriptTag = 'script';

  // 导入优化后的提示词
  const { getOptimizedPrompt } = await import('./optimized-prompt');
  const systemPrompt = getOptimizedPrompt(scriptTag);

  try {
    taskStore.updateTaskProgress(taskId, 10, '正在准备...');

    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    taskStore.updateTaskProgress(taskId, 20, '正在连接 AI...');

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

    taskStore.updateTaskProgress(taskId, 60, '正在接收 AI 响应...');

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.content || '';

    taskStore.updateTaskProgress(taskId, 80, '正在解析结果...');

    content = content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const detailsRegex = new RegExp('<details[\\s\\S]*?</details>', 'i');
    const detailsMatch = content.match(detailsRegex);

    if (detailsMatch) {
      generatedHTML.value = detailsMatch[0];
      taskStore.completeTask(taskId, '✨ AI 生成成功！');
      (window as any).toastr?.success('✨ AI 生成成功！');
    } else {
      generatedHTML.value = content;
      taskStore.completeTask(taskId, '生成成功，但格式可能需要调整');
      (window as any).toastr?.warning('生成成功，但格式可能需要调整');
    }
  } catch (error) {
    console.error('AI 生成失败:', error);
    taskStore.failTask(taskId, (error as Error).message);
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

  // 提取 {{字段名}} 占位符
  const matches = generatedHTML.value.match(/\{\{([^}]+)\}\}/g);
  if (!matches || matches.length === 0) {
    (window as any).toastr?.warning('未检测到字段占位符');
    return;
  }

  const uniqueFields = [...new Set(matches.map(m => m.slice(2, -2)))];

  // 构建 findRegex - 添加捕获组
  // 格式：<-PAGEABLE_STATUSBAR->\n{{姓名}}([^\n]+)\n{{年龄}}([^\n]+)\n...
  const captureGroups = uniqueFields.map(field => `\\{\\{${field}\\}\\}([^\\n]+)`).join('\\n');
  const findRegex = `${triggerRegex.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\r\\n]+${captureGroups}[\\r\\n]*`;

  // 构建 replaceString - 将 {{字段名}} 替换为 $1, $2...
  let replaceString = generatedHTML.value;
  uniqueFields.forEach((field, index) => {
    replaceString = replaceString.replace(
      new RegExp(`\\{\\{${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g'),
      `$${index + 1}`,
    );
  });

  const uuid = `regex-pageable-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const regexData = {
    id: uuid,
    scriptName: '翻页状态栏',
    findRegex: findRegex,
    replaceString: replaceString,
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
    '现代简约风格的角色状态栏，包含3个标签页：\n1. 基础信息（姓名、年龄、性别、职业）\n2. 状态属性（生命值、魔法值、体力值、精力值）\n3. 关系面板（好感度、信任度、关系状态）\n\n要求：\n- 使用你认为最合适的配色和样式\n- 圆角卡片设计\n- 不使用任何 emoji，纯文字';
  (window as any).toastr?.info('已加载示例，点击"AI 生成"开始');
};

const showWorldbookGuide = () => {
  showWorldbookDialog.value = true;
};

const clearAll = () => {
  if (confirm('确定要清空所有内容吗？\n\n注意：此操作会清空当前数据，但会保留备份。')) {
    triggerRegex.value = '<-PAGEABLE_STATUSBAR->';
    aiPrompt.value = '';
    generatedHTML.value = '';
    (window as any).toastr?.success('✅ 已清空，备份已保留');
  }
};

// 恢复最近的备份
const restoreFromBackup = () => {
  try {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (!backupStr) {
      (window as any).toastr?.warning('没有可用的备份');
      return;
    }

    const backups = JSON.parse(backupStr);
    if (!Array.isArray(backups) || backups.length === 0) {
      (window as any).toastr?.warning('没有可用的备份');
      return;
    }

    const latestBackup = backups[0];
    triggerRegex.value = latestBackup.triggerRegex || '<-PAGEABLE_STATUSBAR->';
    aiPrompt.value = latestBackup.aiPrompt || '';
    generatedHTML.value = latestBackup.generatedHTML || '';

    const backupTime = new Date(latestBackup.timestamp).toLocaleString('zh-CN');
    (window as any).toastr?.success(`✅ 已恢复备份 (${backupTime})`);
  } catch (error) {
    console.error('恢复备份失败:', error);
    (window as any).toastr?.error('恢复备份失败');
  }
};

// 清空所有数据（包括备份）
const clearAllWithBackups = () => {
  if (confirm('⚠️ 警告：此操作将清空所有数据和备份！\n\n确定要继续吗？此操作不可恢复！')) {
    triggerRegex.value = '<-PAGEABLE_STATUSBAR->';
    aiPrompt.value = '';
    generatedHTML.value = '';
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    (window as any).toastr?.success('✅ 已清空所有数据和备份');
  }
};

// 导入模板数据
import { templates } from './regexTemplates';

const showTemplateLibrary = () => {
  showTemplateDialog.value = true;
};

const loadTemplate = (template: (typeof templates)[0]) => {
  triggerRegex.value = template.triggerRegex;
  generatedHTML.value = template.htmlTemplate;
  showTemplateDialog.value = false;
  (window as any).toastr?.success(`✨ 已加载模板：${template.name}`);
};

// 复制世界书内容到剪贴板
const copyWorldbookContent = async () => {
  if (!worldbookContent.value) {
    (window as any).toastr?.warning('没有可复制的内容');
    return;
  }

  try {
    await navigator.clipboard.writeText(worldbookContent.value);
    (window as any).toastr?.success('✅ 世界书内容已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    (window as any).toastr?.error('复制失败：' + (error as Error).message);
  }
};
</script>

<style scoped>
.pageable-statusbar-generator {
  position: relative;
  z-index: 1;
}

.action-button {
  position: relative;
  z-index: 10;
  pointer-events: auto !important;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
}

.action-button:disabled {
  cursor: not-allowed !important;
  opacity: 0.5 !important;
  pointer-events: none !important;
}

textarea:focus,
input:focus {
  outline: none;
  border-color: #4a9eff;
}
</style>
