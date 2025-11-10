<template>
  <div class="help-tab" style="padding: 25px !important; background: #1a1a1a !important">
    <!-- 版本信息 -->
    <div
      style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 35px 30px;
        border-radius: 20px;
        margin-bottom: 25px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        text-align: center;
        position: relative;
        overflow: hidden;
      "
    >
      <!-- 装饰元素 -->
      <div
        style="
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        "
      ></div>
      <div
        style="
          position: absolute;
          bottom: -30px;
          left: -30px;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        "
      ></div>

      <div style="position: relative; z-index: 1">
        <div style="font-size: 48px; margin-bottom: 10px">🐱</div>
        <h2 style="margin: 0 0 10px 0; color: white; font-size: 24px; font-weight: 600">mzrodyu猫猫的小破烂</h2>
        <div
          style="
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
          "
        >
          <span class="version-info">版本 v{{ currentVersion }}</span>
          <button
            @click="checkForUpdates"
            :disabled="isCheckingUpdate"
            style="
              padding: 8px 16px;
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              border-radius: 8px;
              color: white;
              cursor: pointer;
              font-size: 13px;
              font-weight: 500;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 6px;
              backdrop-filter: blur(10px);
            "
            :style="{
              opacity: isCheckingUpdate ? 0.6 : 1,
              cursor: isCheckingUpdate ? 'not-allowed' : 'pointer',
            }"
            @mouseenter="e => !isCheckingUpdate && (e.target.style.background = 'rgba(255, 255, 255, 0.3)')"
            @mouseleave="e => (e.target.style.background = 'rgba(255, 255, 255, 0.2)')"
          >
            <i :class="isCheckingUpdate ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-sync-alt'"></i>
            {{ isCheckingUpdate ? '检查中...' : '检查更新' }}
          </button>
        </div>

        <!-- 版权声明 -->
        <div
          style="
            margin-top: 25px;
            padding: 20px;
            background: rgba(220, 53, 69, 0.15);
            border: 2px solid rgba(220, 53, 69, 0.3);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          "
        >
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; justify-content: center">
            <i class="fa-solid fa-shield-halved" style="color: #ffc107; font-size: 16px"></i>
            <span style="color: white; font-weight: 600; font-size: 14px">版权声明</span>
          </div>
          <div style="color: rgba(255, 255, 255, 0.95); font-size: 13px; line-height: 1.8; text-align: left">
            <div style="margin-bottom: 5px">📌 本脚本仅发布在类脑/旅程</div>
            <div style="margin-bottom: 5px">🚫 禁止二传</div>
            <div style="margin-bottom: 5px">⚠️ 二改需要获得作者允许</div>
            <div>❌ 商业化绝对禁止</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div
      style="
        background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
        padding: 25px;
        border-radius: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      "
    >
      <h3
        @click="toggleSection('usageGuide')"
        style="
          margin: 0 0 20px 0;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        "
      >
        <i class="fa-solid fa-book" style="color: #17a2b8; font-size: 18px"></i>
        使用说明
        <i
          :class="expandedSections.usageGuide ? 'fa-chevron-up' : 'fa-chevron-down'"
          class="fa-solid"
          style="margin-left: auto; font-size: 14px; transition: transform 0.3s; color: #888"
        ></i>
      </h3>

      <div
        v-show="expandedSections.usageGuide"
        style="color: #e0e0e0; font-size: 14px; line-height: 1.8; animation: fadeIn 0.3s ease-in"
      >
        <div style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
          {{ pluginUsage }}
        </div>
      </div>
    </div>

    <!-- 更新日志 -->
    <div
      style="
        background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
        padding: 25px;
        border-radius: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      "
    >
      <h3
        @click="toggleSection('changelog')"
        style="
          margin: 0 0 20px 0;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        "
      >
        <i class="fa-solid fa-clock-rotate-left" style="color: #28a745; font-size: 18px"></i>
        更新日志
        <i
          :class="expandedSections.changelog ? 'fa-chevron-up' : 'fa-chevron-down'"
          class="fa-solid"
          style="margin-left: auto; font-size: 14px; transition: transform 0.3s; color: #888"
        ></i>
      </h3>

      <div
        v-show="expandedSections.changelog"
        style="color: #e0e0e0; font-size: 14px; line-height: 1.8; animation: fadeIn 0.3s ease-in"
      >
        <div style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
          {{ pluginChangelog }}
        </div>

        <!-- 旧的硬编码版本记录（作为备份） -->
        <div v-if="false">
        <div
          style="
            padding: 20px;
            background: rgba(76, 175, 80, 0.05);
            border-left: 4px solid #4caf50;
            border-radius: 8px;
            margin-bottom: 15px;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <div
              style="font-size: 16px; font-weight: 600; color: #4caf50; display: flex; align-items: center; gap: 8px"
            >
              v1.34
            </div>
            <div style="font-size: 13px; color: #888">2025年11月8日</div>
          </div>
          <ul class="update-list">
            <li class="update-item">🐛 修复：移除 vue-i18n 国际化系统，改为直接使用中文</li>
            <li class="update-item">🔧 优化：精简代码，提高加载速度</li>
            <li class="update-item">✨ 改进：界面显示更加稳定</li>
          </ul>
        </div>

        <!-- v1.33 -->
        <div
          style="
            padding: 20px;
            background: rgba(255, 152, 0, 0.05);
            border-left: 4px solid #ff9800;
            border-radius: 8px;
            margin-bottom: 15px;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <div
              style="font-size: 16px; font-weight: 600; color: #ff9800; display: flex; align-items: center; gap: 8px"
            >
              v1.33 - 🎨 开场白管理器
            </div>
            <div style="font-size: 13px; color: #888">2025年11月5日</div>
          </div>
          <ul class="update-list">
            <li class="update-item">新增：开场白美化选择器工具</li>
            <li class="update-item">自动读取角色卡的所有开场白</li>
            <li class="update-item">为每个开场白配置美化样式（图标、标题、描述）</li>
            <li class="update-item">AI 生成描述：根据开场白原文内容自动生成吸引人的描述</li>
            <li class="update-item">AI 编辑描述：根据需求快速修改描述</li>
            <li class="update-item">⭐ AI 生成界面样式：直接告诉AI你想要什么风格，自动生成完整HTML界面</li>
            <li class="update-item">实时预览生成的美化界面样式效果</li>
            <li class="update-item">一键导出为 STScript JSON 格式</li>
            <li class="update-item">配置自动保存到角色卡变量</li>
          </ul>
        </div>

        <!-- v1.32 -->
        <div
          style="
            padding: 20px;
            background: rgba(99, 102, 241, 0.05);
            border-left: 4px solid #6366f1;
            border-radius: 8px;
            margin-bottom: 15px;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <div style="font-size: 16px; font-weight: 600; color: #6366f1">v1.32</div>
            <div style="font-size: 13px; color: #888">2025年11月2日</div>
          </div>

          <div style="margin-bottom: 15px">
            <div style="color: #6366f1; font-weight: 600; margin-bottom: 8px">🔧 优化</div>
            <ul class="update-list">
              <li class="update-item">最小化图标支持拖动，可随意调整位置</li>
            </ul>
          </div>
        </div>

        <!-- v1.31 -->
        <div
          style="
            padding: 20px;
            background: rgba(99, 102, 241, 0.05);
            border-left: 4px solid #6366f1;
            border-radius: 8px;
            margin-bottom: 15px;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <div style="font-size: 16px; font-weight: 600; color: #6366f1">v1.31</div>
            <div style="font-size: 13px; color: #888">2025年10月30日</div>
          </div>

          <div style="margin-bottom: 15px">
            <div style="color: #ffc107; font-weight: 600; margin-bottom: 8px">✨ 新功能</div>
            <ul class="update-list">
              <li class="update-item">同层对话：AI 回复直接显示在面板内，支持流式传输和正则过滤</li>
              <li class="update-item">状态栏生成器新增 AI 解析 XML 和自然语言生成字段功能</li>
            </ul>
          </div>

          <div>
            <div style="color: #6366f1; font-weight: 600; margin-bottom: 8px">🔧 优化</div>
            <ul class="update-list">
              <li class="update-item">完整的移动端适配：响应式布局、标签栏滚动、滑动切换</li>
              <li class="update-item">所有 AI 功能统一使用设置页的 API 配置</li>
            </ul>
          </div>
        </div>

        <!-- v1.30 -->
        <div
          style="
            padding: 20px;
            background: rgba(99, 102, 241, 0.05);
            border-left: 4px solid #6366f1;
            border-radius: 8px;
            margin-bottom: 15px;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <div style="font-size: 16px; font-weight: 600; color: #6366f1">v1.30</div>
            <div style="font-size: 13px; color: #888">2025年10月26日</div>
          </div>

          <div style="margin-bottom: 15px">
            <div style="color: #ffc107; font-weight: 600; margin-bottom: 8px">✨ 新功能</div>
            <ul class="update-list">
              <li class="update-item">新增 MVU Beta 标签页：变量结构、提示词模板、meta 配置生成</li>
              <li class="update-item">新增状态栏生成器：可视化配置状态栏，生成正则 JSON 和世界书条目</li>
              <li class="update-item">状态栏生成器支持 ABO 模板快速加载</li>
            </ul>
          </div>

          <div>
            <div style="color: #6366f1; font-weight: 600; margin-bottom: 8px">🔧 优化</div>
            <ul class="update-list">
              <li class="update-item">所有 AI 工具统一从设置页读取 max_tokens 和 temperature</li>
              <li class="update-item">MVU Beta 和状态栏生成器支持数据持久化</li>
            </ul>
          </div>
        </div>

        <!-- v1.00 -->
        <div
          style="
            padding: 20px;
            background: rgba(99, 102, 241, 0.05);
            border-left: 4px solid #6366f1;
            border-radius: 8px;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <div style="font-size: 16px; font-weight: 600; color: #6366f1">v1.00</div>
            <div style="font-size: 13px; color: #888">2025年10月20日</div>
          </div>

          <ul class="update-list">
            <li class="update-item">🎉 初始版本发布</li>
            <li class="update-item">支持自动/手动总结、表格生成、反八股、世界书条目管理、楼层隐藏/显示</li>
          </ul>
        </div>
        </div>
        <!-- 结束备份的硬编码内容 -->
      </div>
    </div>

    <!-- 关于 -->
    <div
      style="
        background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
        padding: 25px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      "
    >
      <div style="color: #888; font-size: 13px; line-height: 1.8">
        <p style="margin: 0 0 8px 0">Made with ❤️ by mzrodyu</p>
        <p style="margin: 0">基于 Vue 和 Pinia</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { CURRENT_VERSION, manualCheckUpdates } from '../versionCheck';

const AUTH_API_URL = 'https://maomaomz-auth.baobaoyu999727272.workers.dev';

const currentVersion = CURRENT_VERSION;
const isCheckingUpdate = ref(false);
const pluginUsage = ref('加载中...');
const pluginChangelog = ref('加载中...');

const expandedSections = reactive({
  usageGuide: true,
  changelog: true,
});

const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section];
};

const checkForUpdates = async () => {
  if (isCheckingUpdate.value) return;

  isCheckingUpdate.value = true;
  try {
    await manualCheckUpdates();
  } catch (error) {
    console.error('❌ 检查更新失败:', error);
  } finally {
    isCheckingUpdate.value = false;
  }
};

// 从后端加载插件信息
const loadPluginInfo = async () => {
  try {
    console.log('🔍 正在从后端加载使用说明和更新日志...');
    const response = await fetch(`${AUTH_API_URL}/plugin-info`);
    const result = await response.json();

    if (result.success && result.data) {
      pluginUsage.value = result.data.usage || '暂无使用说明';
      pluginChangelog.value = result.data.changelog || '暂无更新日志';
      console.log('✅ 成功加载插件信息', result.data);
    } else {
      pluginUsage.value = '❌ 加载失败，请稍后重试';
      pluginChangelog.value = '❌ 加载失败，请稍后重试';
    }
  } catch (error) {
    console.error('❌ 加载插件信息失败:', error);
    pluginUsage.value = '❌ 无法连接到服务器';
    pluginChangelog.value = '❌ 无法连接到服务器';
  }
};

// 页面加载时获取插件信息
onMounted(() => {
  loadPluginInfo();
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.update-list {
  margin: 5px 0;
  padding-left: 20px;
  font-size: 14px;
}

.update-item {
  margin-bottom: 8px;
  line-height: 1.6;
}
</style>
