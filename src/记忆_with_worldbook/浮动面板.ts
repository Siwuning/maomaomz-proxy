import { createApp } from 'vue';
import { globalPinia } from './globalPinia';
import 浮动面板 from './浮动面板.vue';

$(() => {
  console.log('浮动面板.ts 开始执行');

  // 注入移动端响应式CSS
  if ($('#memory-panel-responsive-css').length === 0) {
    const responsiveCSS = `
      <style id="memory-panel-responsive-css">
        /* 桌面端（横屏）：隐藏移动端专用标题 */
        .panel-title-mobile {
          display: none;
        }

        /* 桌面端（横屏）：显示完整标题 */
        .panel-title {
          display: inline;
        }

        /* 移动端全局样式 - 改用宽度判断，适配所有小屏设备 */
        @media (max-width: 768px) {
          /* 移动端：面板容器全屏显示 - 使用最高优先级覆盖内联样式 */
          body #memoryManagementPanel {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            transform: none !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            min-width: 100vw !important;
            min-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 移动端：隐藏完整标题，显示简短标题 */
          .panel-title {
            display: none !important;
          }

          .panel-title-mobile {
            display: inline !important;
            font-size: 14px !important;
          }

          /* 移动端：隐藏最小化按钮 */
          .minimize-button {
            display: none !important;
          }

          /* 移动端：调整头部样式 */
          .panel-header {
            padding: 12px 16px !important;
            border-radius: 0 !important;
          }

          .panel-header .header-left {
            gap: 8px !important;
          }

          .panel-header .header-left .header-icon {
            font-size: 24px !important;
          }

          .panel-header .header-left .panel-title {
            font-size: 15px !important;
          }

          .panel-header > div:last-child {
            gap: 8px !important;
          }

          /* 移动端：头部按钮 */
          .panel-header .header-button {
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
            min-height: 40px !important;
            padding: 0 !important;
            font-size: 16px !important;
            border-radius: 8px !important;
          }

          /* 移动端：标签栏可横向滚动 */
          .panel-tabs {
            overflow-x: auto !important;
            overflow-y: hidden !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding: 0 8px !important;
          }

          .panel-tabs::-webkit-scrollbar {
            height: 3px !important;
          }

          .panel-tabs .tab-item {
            flex: 0 0 auto !important;
            padding: 12px 16px !important;
            font-size: 13px !important;
            gap: 6px !important;
            min-width: auto !important;
            border-radius: 0 !important; /* 移动端标签不需要圆角 */
          }

          .panel-tabs .tab-item .tab-icon {
            font-size: 15px !important;
          }

          .panel-tabs .tab-item .tab-label {
            white-space: nowrap !important;
            font-weight: 500 !important;
          }

          /* 移动端：内容区域优化 */
          .memory-panel-container {
            font-size: 14px !important;
          }

          /* 移动端：面板内容区域滚动优化 */
          .panel-content {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            height: 100% !important;
            padding: 12px !important;
          }

          /* 移动端：确保标签页内容不超出 */
          .memory-panel-container .tab-content {
            max-width: 100vw !important;
            overflow-x: hidden !important;
          }

          /* 移动端：按钮优化 */
          .memory-panel-container button,
          .memory-panel-container .el-button {
            padding: 12px 18px !important;
            font-size: 14px !important;
            min-height: 48px !important; /* iOS推荐的最小触摸区域 */
            border-radius: 12px !important; /* 统一圆角 */
            font-weight: 500 !important;
          }

          /* 移动端：小按钮优化 */
          .memory-panel-container .mini-button,
          .memory-panel-container .show-button {
            padding: 10px 16px !important;
            min-height: 44px !important;
            font-size: 13px !important;
            border-radius: 10px !important;
          }

          /* 移动端：复选框优化 */
          .memory-panel-container input[type="checkbox"] {
            width: 20px !important;
            height: 20px !important;
            min-width: 20px !important;
            min-height: 20px !important;
            cursor: pointer !important;
          }

          /* 移动端：按钮组堆叠（只针对按钮组，不影响主布局） */
          .memory-panel-container .button-group,
          .memory-panel-container .project-action-buttons {
            flex-direction: column !important;
            gap: 8px !important;
          }

          .memory-panel-container .button-group > *,
          .memory-panel-container .button-group button,
          .memory-panel-container .project-action-buttons > button {
            width: 100% !important;
            margin: 0 !important;
          }

          /* 移动端：对话框内的按钮堆叠 */
          .memory-panel-container .dialog-actions,
          .memory-panel-container [style*="justify-content: flex-end"] {
            flex-direction: column !important;
            gap: 10px !important;
          }

          .memory-panel-container .dialog-actions > button {
            width: 100% !important;
          }

          /* 移动端：输入框优化 */
          .memory-panel-container input,
          .memory-panel-container textarea,
          .memory-panel-container select {
            font-size: 16px !important; /* 防止iOS自动缩放 */
            padding: 12px !important;
            min-height: 44px !important;
          }

          .memory-panel-container textarea {
            min-height: 120px !important;
          }

          /* 移动端：表单项间距 */
          .memory-panel-container .form-group,
          .memory-panel-container [style*="margin"] {
            margin-bottom: 16px !important;
          }

          /* 移动端：卡片/面板内边距 */
          .memory-panel-container .card,
          .memory-panel-container .panel,
          .memory-panel-container .section {
            padding: 12px !important;
            margin: 8px 0 !important;
          }

          /* 移动端：字段组优化 */
          .memory-panel-container .field-group,
          .memory-panel-container [class*="field"] {
            padding: 8px !important;
            margin-bottom: 12px !important;
          }

          /* 移动端：工具区域优化 */
          .memory-panel-container .tool-section,
          .memory-panel-container .section-content {
            padding: 12px 8px !important;
          }

          /* 移动端：预览区域优化 */
          .memory-panel-container .preview-container,
          .memory-panel-container [class*="preview"] {
            padding: 8px !important;
            max-width: 100% !important;
            overflow-x: auto !important;
          }

          /* 移动端：标题字体 */
          .memory-panel-container h1,
          .memory-panel-container h2,
          .memory-panel-container h3,
          .memory-panel-container h4,
          .memory-panel-container h5 {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }

          /* 移动端：对话框全屏 */
          .memory-panel-container .modal,
          .memory-panel-container .dialog {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
          }

          /* 移动端：滚动条优化 */
          .memory-panel-container ::-webkit-scrollbar {
            width: 3px !important;
            height: 3px !important;
          }

          /* 移动端：减小字段间的gap */
          .memory-panel-container [style*="gap: 1"] {
            gap: 8px !important;
          }

          .memory-panel-container [style*="gap: 2"] {
            gap: 12px !important;
          }

          /* 移动端：工具区域按钮组优化 */
          .memory-panel-container .tool-section .button-group {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
          }

          /* 移动端：状态栏生成器字段优化（只针对字段，不影响主布局） */
          .memory-panel-container .field-item {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .memory-panel-container .field-item > * {
            width: 100% !important;
            margin-bottom: 8px !important;
          }

          /* 移动端：两栏布局改为单列（只针对设置项，不影响主布局） */
          .memory-panel-container [style*="display: grid"][style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }

          /* 移动端：三栏布局改为单列！！！最重要的修复！ */
          /* 用更通用的选择器强制覆盖所有grid布局 */
          .memory-panel-container div[style*="display: grid"],
          .memory-panel-container > div[style*="display: grid"],
          .panel-content > div[style*="display: grid"],
          body [style*="display: grid"][style*="grid-template-columns"],
          .pageable-statusbar-generator > div[style*="display: grid"],
          .statusbar-generator > div[style*="display: grid"],
          [style*="grid-template-columns: 400px"],
          [style*="grid-template-columns: 280px"],
          [style*="grid-template-columns: 300px"] {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
          }

          /* 移动端：翻页状态栏生成器专属优化 */
          .pageable-statusbar-generator {
            padding: 12px !important;
          }

          .pageable-statusbar-generator h3 {
            font-size: 16px !important;
          }

          .pageable-statusbar-generator textarea {
            min-height: 150px !important;
          }

          /* 移动端：翻页状态栏生成器顶部header */
          .pageable-statusbar-generator > .section-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 15px !important;
          }

          .pageable-statusbar-generator > .section-header h3 {
            text-align: center !important;
            font-size: 15px !important;
          }

          .pageable-statusbar-generator > .section-header > div {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 6px !important;
            width: 100% !important;
          }

          .pageable-statusbar-generator > .section-header > div > button {
            padding: 8px 4px !important;
            font-size: 11px !important;
            flex-direction: column !important;
            gap: 4px !important;
            min-height: 56px !important;
          }

          .pageable-statusbar-generator > .section-header > div > button i {
            margin-right: 0 !important;
            font-size: 16px !important;
          }

          /* 移动端：状态栏生成器专属优化 */
          .statusbar-generator {
            padding: 12px !important;
          }

          .statusbar-generator > div[style*="display: grid"] > div {
            width: 100% !important;
            min-width: 0 !important;
          }

          /* 移动端：状态栏生成器顶部header改为纵向布局 */
          .statusbar-generator > .section-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 15px !important;
          }

          .statusbar-generator > .section-header h3 {
            text-align: center !important;
            font-size: 15px !important;
          }

          .statusbar-generator > .section-header > div {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            width: 100% !important;
          }

          .statusbar-generator > .section-header > div > button {
            width: 100% !important;
            justify-content: center !important;
            padding: 10px 8px !important;
            font-size: 12px !important;
          }

          /* 移动端：所有带固定宽度的元素强制改为100%宽度 */
          .memory-panel-container div[style*="width: 280px"],
          .memory-panel-container div[style*="width: 300px"],
          .memory-panel-container div[style*="width: 400px"],
          .memory-panel-container div[style*="width: 500px"],
          .memory-panel-container div[style*="width: 600px"],
          .memory-panel-container div[style*="max-width: 600px"],
          .memory-panel-container div[style*="max-width: 90vw"],
          body #memoryManagementPanel div[style*="width:"],
          body #memoryManagementPanel div[style*="min-height: 600px"],
          .pageable-statusbar-generator > div > div,
          .statusbar-generator > div > div {
            width: 100% !important;
            max-width: 100% !important;
            min-width: auto !important;
          }

          /* 移动端：工具栏按钮组横向滚动 */
          .memory-panel-container .tool-buttons,
          .memory-panel-container [style*="display: flex"][style*="flex-wrap: wrap"] {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 8px !important;
          }

          .memory-panel-container .tool-buttons > button,
          .memory-panel-container .tool-buttons > div {
            flex-shrink: 0 !important;
          }

          /* 移动端：强制所有子div在容器内正确显示 */
          .memory-panel-container > div > div,
          .panel-content > div > div {
            max-width: 100% !important;
            overflow-x: hidden !important;
          }

          /* 移动端：开场白管理器整体布局优化 */
          .memory-panel-container .greetings-tab > div[style*="display: flex"][style*="gap: 20px"] {
            flex-direction: column !important;
            gap: 15px !important;
          }

          .memory-panel-container .greetings-tab > div > div[style*="flex: 1"] {
            width: 100% !important;
            flex: none !important;
            max-height: 50vh !important;
          }

          /* 移动端：开场白管理器顶部操作按钮优化 */
          .memory-panel-container .header-actions {
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }

          .memory-panel-container .header-actions .mini-button,
          .memory-panel-container .header-actions button {
            width: 100% !important;
            justify-content: center !important;
          }

          .memory-panel-container .header-actions .count-badge {
            display: none !important;
          }

          /* 移动端：开场白管理器整个header纵向排列 */
          .greetings-tab > .section-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 15px !important;
          }

          .greetings-tab > .section-header h3 {
            text-align: center !important;
          }

          /* 移动端：开场白管理器底部操作按钮堆叠 */
          .memory-panel-container .greetings-tab > div > div > div[style*="position: sticky"][style*="bottom: 0"] {
            flex-direction: column !important;
            gap: 10px !important;
          }

          .memory-panel-container .greetings-tab > div > div > div[style*="position: sticky"] button {
            width: 100% !important;
            justify-content: center !important;
          }

          /* 移动端：开场白管理器配置界面优化 */
          .memory-panel-container .greeting-item > div:first-child {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }

          .memory-panel-container .greeting-item input[placeholder*="图标"] {
            width: 100% !important;
            max-width: 80px !important;
            margin: 0 auto !important;
          }

          .memory-panel-container .greeting-item input[placeholder*="开场白"],
          .memory-panel-container .greeting-item input[placeholder*="默认"] {
            width: 100% !important;
            flex: none !important;
          }

          .memory-panel-container .greeting-item button {
            width: 100% !important;
            justify-content: center !important;
          }

          /* 移动端：开场白选择器网格布局优化 */
          .memory-panel-container iframe,
          body iframe[srcdoc*="scene-grid"] {
            width: 100% !important;
            max-width: 100% !important;
          }

          /* 移动端：iframe内的网格布局也要优化（开场白选择器） */
          @supports (-webkit-touch-callout: none) {
            /* iOS Safari特殊处理 */
            body iframe {
              width: 100% !important;
              max-width: 100vw !important;
            }
          }

          /* 移动端：删除/操作按钮优化 */
          .memory-panel-container .delete-button,
          .memory-panel-container [class*="delete"],
          .memory-panel-container .action-button {
            min-width: 44px !important;
            min-height: 44px !important;
            padding: 8px !important;
          }

          /* 移动端：表单label优化 */
          .memory-panel-container label {
            font-size: 13px !important;
            margin-bottom: 6px !important;
            display: block !important;
          }

          /* 移动端：防止内容超出视口（只针对表单元素和文本） */
          .memory-panel-container input,
          .memory-panel-container textarea,
          .memory-panel-container select,
          .memory-panel-container button,
          .memory-panel-container pre,
          .memory-panel-container code {
            max-width: 100% !important;
            word-wrap: break-word !important;
          }

          /* 移动端：字段标题区域 */
          .memory-panel-container .section-header {
            padding: 16px !important;
            font-size: 14px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }

          .memory-panel-container .section-header h3 {
            font-size: 15px !important;
            margin-bottom: 0 !important;
          }

          /* 移动端：减少不必要的空白 */
          .memory-panel-container .empty-space,
          .memory-panel-container [style*="padding: 20px"],
          .memory-panel-container [style*="padding: 25px"] {
            padding: 12px !important;
          }

          /* 移动端：隐藏最小化图标 */
          #memoryPanelMinimizeIcon {
            display: none !important;
          }
        }
      </style>
    `;
    $('head').append(responsiveCSS);
    console.log('📱 移动端响应式CSS已注入');
  }

  setTimeout(() => {
    console.log('浮动面板.ts setTimeout 回调执行');

    // 检查面板容器是否已存在
    const existingPanel = $('#memoryManagementPanel');

    if (existingPanel.length > 0) {
      console.log('mzrodyu猫猫的小破烂浮动面板已存在，强制删除并重新创建...');
      // 强制删除所有现有的面板
      existingPanel.remove();
      // 等待DOM更新
      setTimeout(() => {
        console.log('旧面板已删除，开始创建新面板...');
      }, 100);
    }

    console.log('🚀🚀🚀 开始创建面板容器 - 时间戳:', new Date().toISOString());

    // 检查偏好设置
    let shouldAutoShow = true; // 默认自动显示
    try {
      const prefsStr = localStorage.getItem('maomaomz_preferences');
      if (prefsStr) {
        const prefs = JSON.parse(prefsStr);
        // 如果设置中明确指定了 autoShowPanel，使用该值；否则默认 true
        shouldAutoShow = prefs.autoShowPanel !== undefined ? prefs.autoShowPanel : true;
      }
    } catch (e) {
      console.warn('读取偏好设置失败:', e);
    }

    // 创建面板容器 - 居中显示，固定高度（完整版：更大的面板）
    const panelContainer = $(`
      <div id="memoryManagementPanel" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 95vw;
        max-width: 1600px;
        height: 92vh;
        max-height: 92vh;
        background: #1a1a1a;
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: ${shouldAutoShow ? 'flex' : 'none'};
        flex-direction: column;
        overflow: hidden;
      ">
      </div>
    `);

    // 添加到 body
    $('body').append(panelContainer);
    console.log('面板容器已添加到 body, 容器元素:', panelContainer[0]);

    // 创建新的 Vue 应用
    console.log('准备创建新的 Vue 应用，面板容器:', panelContainer[0]);

    const app = createApp(浮动面板).use(globalPinia); // 使用全局pinia实例

    try {
      app.mount(panelContainer[0]);
      console.log('Vue 应用已成功挂载');
      console.log('Vue 实例:', (panelContainer[0] as any).__vue_app__);
    } catch (error) {
      console.error('Vue 应用挂载失败:', error);
      console.error('错误详情:', JSON.stringify(error, null, 2));
      console.error('错误堆栈:', (error as Error).stack);
    }

    console.log('mzrodyu猫猫的小破烂浮动面板已创建，面板元素:', panelContainer[0]);

    // 创建常驻的最小化图标
    setTimeout(() => {
      createMinimizeIcon();
      console.log('📍 常驻最小化图标已创建');
    }, 500);
  }, 200);
});

// 创建最小化图标
function createMinimizeIcon() {
  // 检查偏好设置，如果用户禁用了最小化图标，则不创建
  const preferencesStr = localStorage.getItem('maomaomz_preferences');
  if (preferencesStr) {
    try {
      const preferences = JSON.parse(preferencesStr);
      if (preferences.showMinimizeIcon === false) {
        console.log('⚙️ 最小化图标已被用户禁用');
        return null;
      }
    } catch (error) {
      console.error('读取偏好设置失败:', error);
    }
  }

  // 如果图标已存在，只需要显示它
  const existingIcon = $('#memoryPanelMinimizeIcon');
  if (existingIcon.length > 0) {
    existingIcon.fadeIn(200);
    return existingIcon;
  }

  const isMobile = window.innerWidth <= 768;

  // 标签页列表
  const tabs = [
    { key: 'settings', label: '⚙️ 设置', icon: 'fa-solid fa-cog' },
    { key: 'summary', label: '📝 历史总结', icon: 'fa-solid fa-list' },
    { key: 'table', label: '📊 表格', icon: 'fa-solid fa-table' },
    { key: 'greetings', label: '💬 开场白', icon: 'fa-solid fa-comments' },
    { key: 'regex', label: '🎨 界面生成器', icon: 'fa-solid fa-code' },
    { key: 'status', label: '📈 状态栏生成', icon: 'fa-solid fa-chart-bar' },
    { key: 'project', label: '💻 前端项目', icon: 'fa-solid fa-laptop-code' },
    { key: 'tools', label: '🛠️ 工具模板', icon: 'fa-solid fa-tools' },
    { key: 'mvu', label: '🧪 MVU Beta', icon: 'fa-solid fa-flask' },
    { key: 'help', label: '❓ 帮助', icon: 'fa-solid fa-question-circle' },
  ];

  // 创建快捷菜单（初始位置，会动态更新）
  const quickMenu = $(`
    <div id="memoryPanelQuickMenu" style="
      position: fixed;
      top: 0;
      left: 0;
      background: #2a2a2a;
      border: 2px solid #4a9eff;
      border-radius: 12px;
      padding: 8px;
      display: none;
      z-index: 999999;
      box-shadow: 0 8px 32px rgba(74, 158, 255, 0.6), 0 4px 16px rgba(0, 0, 0, 0.8);
      min-width: 200px;
      max-height: 80vh;
      overflow-y: auto;
    ">
      <div style="
        padding: 8px 12px;
        color: #4a9eff;
        font-size: 12px;
        font-weight: 600;
        border-bottom: 1px solid rgba(74, 158, 255, 0.2);
        margin-bottom: 4px;
      ">
        快捷访问
      </div>
      ${tabs
        .map(
          tab => `
        <div class="quick-menu-item" data-tab="${tab.key}" style="
          padding: 10px 12px;
          margin: 2px 0;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          color: #e0e0e0;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
        ">
          ${tab.label}
        </div>
      `,
        )
        .join('')}
    </div>
  `);

  // 菜单项悬停效果
  quickMenu.find('.quick-menu-item').hover(
    function () {
      $(this).css({
        background: 'rgba(74, 158, 255, 0.15)',
        color: '#4a9eff',
        transform: 'translateX(-3px)',
      });
    },
    function () {
      $(this).css({
        background: 'transparent',
        color: '#e0e0e0',
        transform: 'translateX(0)',
      });
    },
  );

  // 菜单项点击事件
  quickMenu.find('.quick-menu-item').on('click', function () {
    const tabKey = $(this).data('tab');
    const panel = $('#memoryManagementPanel');

    // 显示面板
    if (!panel.is(':visible')) {
      panel.fadeIn(200);
    }

    // 延迟切换标签，确保面板已完全显示
    setTimeout(() => {
      const tabOrder = [
        'settings',
        'summary',
        'table',
        'greetings',
        'regex',
        'status',
        'project',
        'tools',
        'mvu',
        'help',
      ];
      const tabIndex = tabOrder.indexOf(tabKey);

      if (tabIndex >= 0) {
        // 通过索引直接点击对应的标签
        const tabs = panel.find('.tab-item');
        if (tabs.length > tabIndex) {
          tabs.eq(tabIndex).trigger('click');
        }
      }
    }, 150);

    // 隐藏菜单
    quickMenu.fadeOut(200);
  });

  // 自定义滚动条样式
  quickMenu.css({
    'scrollbar-width': 'thin',
    'scrollbar-color': '#4a9eff #1a1a1a',
  });

  const icon = $(`
    <div id="memoryPanelMinimizeIcon" style="
      position: fixed;
      top: ${isMobile ? '20px' : '20px'};
      right: ${isMobile ? '20px' : '20px'};
      width: ${isMobile ? '64px' : '72px'};
      height: ${isMobile ? '64px' : '72px'};
      background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
      border: 3px solid #4a9eff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999998;
      box-shadow: 0 4px 16px rgba(74, 158, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      font-size: ${isMobile ? '32px' : '38px'};
    ">
      🐱
    </div>
  `);

  let hideMenuTimeout: number | null = null;

  // 更新菜单位置的函数
  function updateMenuPosition() {
    const iconPos = icon.offset();
    const iconWidth = icon.outerWidth() || 72;
    const iconHeight = icon.outerHeight() || 72;
    const menuWidth = quickMenu.outerWidth() || 200;
    const menuHeight = quickMenu.outerHeight() || 400;

    console.log('🔍 位置计算开始:', { iconPos, iconWidth, iconHeight, menuWidth, menuHeight });

    if (!iconPos) {
      console.warn('⚠️ 图标位置获取失败');
      return;
    }

    // 默认显示在图标左侧
    let left = iconPos.left - menuWidth - 10;
    let top = iconPos.top;

    console.log('📍 初始位置（图标左侧）:', { left, top });

    // 如果左侧空间不够，显示在右侧
    if (left < 10) {
      left = iconPos.left + iconWidth + 10;
      console.log('📍 左侧不够，移到右侧:', left);
    }

    // 如果右侧也不够，显示在图标上方或下方
    const windowWidth = $(window).width() || 1920;
    if (left + menuWidth > windowWidth - 10) {
      left = iconPos.left - (menuWidth - iconWidth) / 2;
      // 尝试显示在上方
      if (iconPos.top > menuHeight + 10) {
        top = iconPos.top - menuHeight - 10;
        console.log('📍 右侧不够，移到上方:', { left, top });
      } else {
        // 否则显示在下方
        top = iconPos.top + iconHeight + 10;
        console.log('📍 右侧不够，移到下方:', { left, top });
      }
    }

    // 确保不超出屏幕边界
    const windowHeight = $(window).height() || 1080;
    const finalLeft = Math.max(10, Math.min(left, windowWidth - menuWidth - 10));
    const finalTop = Math.max(10, Math.min(top, windowHeight - Math.min(menuHeight, windowHeight * 0.8) - 10));

    console.log('✅ 最终位置:', { finalLeft, finalTop, windowWidth, windowHeight });

    quickMenu.css({ left: finalLeft + 'px', top: finalTop + 'px' });
  }

  // 悬停效果 + 显示快捷菜单
  icon.hover(
    function () {
      if (hideMenuTimeout) {
        clearTimeout(hideMenuTimeout);
        hideMenuTimeout = null;
      }

      $(this).css({
        transform: 'scale(1.15) rotate(5deg)',
        boxShadow: '0 6px 24px rgba(74, 158, 255, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)',
        borderColor: '#5ab0ff',
      });

      // 先显示菜单（但透明），计算位置后再显示
      quickMenu.css('opacity', '0').show();
      updateMenuPosition();
      quickMenu.css('opacity', '1').hide().fadeIn(200);
      console.log('🎯 快捷菜单已显示，位置:', quickMenu.offset());
    },
    function () {
      $(this).css({
        transform: 'scale(1) rotate(0deg)',
        boxShadow: '0 4px 16px rgba(74, 158, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
        borderColor: '#4a9eff',
      });

      // 延迟隐藏菜单，给用户时间移动到菜单上
      hideMenuTimeout = window.setTimeout(() => {
        if (!quickMenu.is(':hover')) {
          quickMenu.fadeOut(200);
        }
      }, 200);
    },
  );

  // 菜单悬停时保持显示
  quickMenu.hover(
    function () {
      if (hideMenuTimeout) {
        clearTimeout(hideMenuTimeout);
        hideMenuTimeout = null;
      }
    },
    function () {
      quickMenu.fadeOut(200);
    },
  );

  // 点击恢复面板（但不隐藏图标）
  icon.on('click', () => {
    const panel = $('#memoryManagementPanel');
    if (panel.is(':visible')) {
      // 如果面板可见，最小化它
      panel.fadeOut(200);
      icon.fadeIn(200);
    } else {
      // 如果面板隐藏，显示它（图标保持可见）
      panel.fadeIn(200);
    }
  });

  // 使图标可以拖动
  icon.draggable({
    containment: 'window',
    scroll: false,
    start: function () {
      $(this).css('transition', 'none');
      quickMenu.hide(); // 拖动时隐藏菜单
    },
    stop: function () {
      $(this).css('transition', 'all 0.3s ease');
    },
  });

  $('body').append(quickMenu);
  $('body').append(icon);

  console.log('✅ 最小化图标已创建:', icon);
  console.log('✅ 快捷菜单已创建:', quickMenu);
  console.log('📍 快捷菜单是否在页面中:', $('#memoryPanelQuickMenu').length > 0);

  return icon;
}

// 最小化面板
export function minimizeMemoryPanel() {
  const panel = $('#memoryManagementPanel');
  if (panel.length === 0) return;

  panel.fadeOut(200);
  createMinimizeIcon(); // 确保图标存在
}

// 打开/关闭面板的函数
export function toggleMemoryPanel() {
  const panel = $('#memoryManagementPanel');
  if (panel.length === 0) return;

  if (panel.is(':visible')) {
    panel.fadeOut(200);
  } else {
    panel.fadeIn(200);
  }
}
