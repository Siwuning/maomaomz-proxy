// debug_plugin_autosummary.js - 测试插件的自动总结功能

(function () {
  console.log('============================================================');
  console.log('🔍 插件自动总结功能检查');
  console.log('============================================================');

  // 1. 检查插件是否加载
  console.log('\n【1. 插件加载状态】');
  const hasPinia = typeof window.pinia !== 'undefined';
  const hasSettingsStore = hasPinia && typeof window.pinia.useSettingsStore === 'function';
  const hasGetChatIdSafe = typeof window.getChatIdSafe === 'function';
  const hasGetScriptIdSafe = typeof window.getScriptIdSafe === 'function';
  const hasManualCheckSummary = typeof window.manualCheckSummary === 'function';

  console.log('Pinia:', hasPinia ? '✅' : '❌');
  console.log('useSettingsStore:', hasSettingsStore ? '✅' : '❌');
  console.log('getChatIdSafe:', hasGetChatIdSafe ? '✅' : '❌');
  console.log('getScriptIdSafe:', hasGetScriptIdSafe ? '✅' : '❌');
  console.log('manualCheckSummary:', hasManualCheckSummary ? '✅' : '❌');

  if (!hasPinia || !hasSettingsStore) {
    console.error('❌ 插件未加载！请确保插件已启用并刷新页面。');
    return;
  }

  // 2. 检查插件设置
  console.log('\n【2. 插件设置】');
  try {
    const settingsStore = window.pinia.useSettingsStore();
    const settings = settingsStore.settings;
    console.log('启用自动总结:', settings.auto_summary_enable ? '✅' : '❌');
    console.log('总结间隔:', settings.auto_summary_interval_floor, '条消息');
    console.log('总结模式:', settings.auto_summary_type === 'latest' ? '最新消息' : '完整对话');
    console.log('完整设置:', settings);
  } catch (error) {
    console.error('❌ 获取插件设置失败:', error);
  }

  // 3. 检查当前聊天
  console.log('\n【3. 当前聊天信息】');
  try {
    if (hasGetChatIdSafe) {
      const chatId = window.getChatIdSafe();
      console.log('聊天ID:', chatId || '❌ 未获取到');

      if (chatId) {
        const scriptId = window.getScriptIdSafe();
        const storageKey = `${scriptId}_auto_summary_start_id_${chatId}`;
        const startId = localStorage.getItem(storageKey);
        console.log('起始楼层 (localStorage):', startId || '未设置');
      }
    }

    if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
      console.log('当前消息数:', SillyTavern.chat.length);
      console.log('最后一条消息ID:', SillyTavern.chat.length - 1);
    }
  } catch (error) {
    console.error('❌ 获取聊天信息失败:', error);
  }

  // 4. 检查事件监听机制
  console.log('\n【4. 事件监听机制】');
  console.log('SillyTavern.eventSource:', typeof SillyTavern?.eventSource);
  console.log('SillyTavern.eventTypes:', typeof SillyTavern?.eventTypes);
  console.log('TavernHelper:', typeof TavernHelper);
  console.log('TavernHelper.tavern_events:', typeof TavernHelper?.tavern_events);
  console.log('eventOn (全局):', typeof eventOn);

  // 5. 测试 jQuery 监听
  console.log('\n【5. 测试 jQuery 监听】');
  let jqueryEventCount = 0;
  let customEventCount = 0;

  // 注册测试监听器
  if (typeof TavernHelper !== 'undefined' && TavernHelper.tavern_events) {
    const eventName = TavernHelper.tavern_events.CHARACTER_MESSAGE_RENDERED;
    console.log('尝试监听 jQuery 事件:', eventName);

    $(document).on(eventName, function (e) {
      jqueryEventCount++;
      console.log(`🎉 jQuery 事件触发 #${jqueryEventCount}:`, eventName, e);
    });

    console.log('✅ jQuery 监听器已注册');
  }

  // 注册 CustomEvent 监听
  if (typeof TavernHelper !== 'undefined' && TavernHelper.tavern_events) {
    const eventName = TavernHelper.tavern_events.CHARACTER_MESSAGE_RENDERED;
    console.log('尝试监听 CustomEvent:', eventName);

    document.addEventListener(eventName, function (e) {
      customEventCount++;
      console.log(`🎉 CustomEvent 触发 #${customEventCount}:`, eventName, e);
    });

    console.log('✅ CustomEvent 监听器已注册');
  }

  // 6. 检查 DOM 监控
  console.log('\n【6. DOM 监控机制】');
  const chatContainer = document.querySelector('#chat');
  if (chatContainer) {
    console.log('✅ 聊天容器已找到:', chatContainer);
    console.log('当前子节点数:', chatContainer.children.length);

    // 模拟插件的 DOM 监控
    let domChangeCount = 0;
    const testObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.matches('.mes')) {
              domChangeCount++;
              console.log(`🎉 DOM 监控检测到新消息 #${domChangeCount}:`, node);
            }
          });
        }
      });
    });

    testObserver.observe(chatContainer, {
      childList: true,
      subtree: true,
    });

    console.log('✅ DOM 监控已启动');

    // 暴露停止函数
    window.stopDOMTest = () => {
      testObserver.disconnect();
      console.log('⏹️ DOM 监控已停止');
    };
  } else {
    console.log('❌ 未找到聊天容器');
  }

  // 7. 手动触发检查
  console.log('\n【7. 手动触发测试】');
  if (hasManualCheckSummary) {
    console.log('你可以运行 manualCheckSummary() 来手动触发自动总结检查');

    // 暴露快捷测试函数
    window.testAutoSummary = () => {
      console.log('\n======== 手动触发自动总结检查 ========');
      window.manualCheckSummary();
    };

    console.log('✅ 快捷函数已创建: testAutoSummary()');
  }

  // 8. 统计函数
  window.showEventStats = () => {
    console.log('\n======== 事件统计 ========');
    console.log('jQuery 事件触发次数:', jqueryEventCount);
    console.log('CustomEvent 触发次数:', customEventCount);
    console.log('DOM 变化检测次数:', domChangeCount);
  };

  console.log('\n============================================================');
  console.log('✅ 调试脚本已准备就绪');
  console.log('');
  console.log('📋 可用命令：');
  console.log('  • testAutoSummary() - 手动触发自动总结检查');
  console.log('  • showEventStats() - 显示事件触发统计');
  console.log('  • stopDOMTest() - 停止 DOM 监控测试');
  console.log('');
  console.log('💡 现在请发送一条消息，观察控制台输出');
  console.log('============================================================');
})();
