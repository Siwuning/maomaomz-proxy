import { watch, createApp } from 'vue';
import { klona } from 'klona';
import { useSettingsStore, useSummaryHistoryStore } from './settings';
import { getScriptIdSafe, getChatIdSafe, setGlobalScriptId } from './utils';
import { summarizeMessages } from './总结功能';
// 先导入授权模块，但不立即导入UI模块
import { checkAuthorization, isAuthorized } from './auth';
import { globalPinia } from './globalPinia';
import TaskManager from './components/TaskManager.vue';

// 🔐 最高优先级：授权验证（在所有UI加载之前）
let authorizationPassed = false;

$(() => {
  // 立即进行授权验证，不要延迟
  (async () => {
    console.log('🔐 【优先级最高】开始插件授权验证...');

    const authorized = await checkAuthorization();

    if (!authorized) {
      console.error('❌ 授权验证失败，插件将不会加载');
      authorizationPassed = false;

      // 显示永久错误提示
      setTimeout(() => {
        if ((window as any).toastr) {
          (window as any).toastr.error(
            '❌ 未通过授权验证\n\n插件已被禁用，请刷新页面重新输入授权码\n\n前往 Discord 获取最新授权码',
            '授权失败',
            { timeOut: 0, extendedTimeOut: 0 },
          );
        }
      }, 500);

      return;
    }

    authorizationPassed = true;
    console.log('✅ 授权验证通过，开始加载插件UI和功能...');

    // 授权通过后才加载UI模块
    await import('./浮动面板');
    await import('./添加导航按钮');

    console.log('✅ UI模块加载完成');

    // 延迟一下确保UI加载完成
    setTimeout(() => {
      // 插件环境：使用固定的ID
      const script_id = 'maomaomz_extension_v1';

      // 设置全局 script_id
      setGlobalScriptId(script_id);

      console.log('🐱 猫猫的记忆管理工具开始初始化，插件ID:', script_id);
      // 监听消息变化，实现自动总结
      const checkAutoSummarize = () => {
        try {
          console.log('🔍 开始检查自动总结...');

          const store = useSettingsStore();
          if (!store || !store.settings) {
            console.warn('❌ 无法获取设置，跳过自动总结检查');
            return;
          }

          const settings = store.settings;

          // 验证设置完整性
          if (typeof settings.auto_summarize_enabled !== 'boolean') {
            console.warn('❌ 自动总结设置无效，跳过检查');
            return;
          }

          if (typeof settings.summarize_interval !== 'number' || settings.summarize_interval < 1) {
            console.warn('❌ 总结间隔设置无效，跳过检查');
            return;
          }
          console.log('📋 当前设置:', {
            auto_summarize_enabled: settings.auto_summarize_enabled,
            summarize_interval: settings.summarize_interval,
            has_api_key: !!settings.api_key,
          });

          if (!settings.auto_summarize_enabled) {
            console.log('⏸️ 自动总结未启用');
            return;
          }

          if (!settings.api_key) {
            console.log('❌ API Key 未设置');
            return;
          }

          // 优先使用 TavernHelper 获取最后一条消息ID
          let last_message_id = 0;

          // 方式1: TavernHelper.getLastMessageId()
          if (typeof (window as any).TavernHelper !== 'undefined') {
            if (typeof (window as any).TavernHelper.getLastMessageId === 'function') {
              try {
                last_message_id = (window as any).TavernHelper.getLastMessageId();
                console.log('✅ 通过 TavernHelper.getLastMessageId() 获取到消息ID:', last_message_id);
              } catch (error) {
                console.warn('⚠️ TavernHelper.getLastMessageId() 调用失败:', error);
                last_message_id = -1;
              }
            } else if (typeof (window as any).TavernHelper.getChatMessages === 'function') {
              // 方式2: TavernHelper.getChatMessages()
              try {
                const messages = (window as any).TavernHelper.getChatMessages('0-{{lastMessageId}}');
                if (Array.isArray(messages) && messages.length > 0) {
                  last_message_id = messages.length - 1;
                  console.log('✅ 通过 TavernHelper.getChatMessages() 获取到消息数:', messages.length);
                }
              } catch (error) {
                console.warn('⚠️ TavernHelper.getChatMessages() 调用失败:', error);
                last_message_id = -1;
              }
            }
          }

          // 方式3: 降级到 SillyTavern.chat（如果可用）
          if (last_message_id < 0 && typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
            last_message_id = SillyTavern.chat.length - 1;
            console.log('✅ 通过 SillyTavern.chat.length 获取到消息ID:', last_message_id);
          }

          // 方式4: 全局 getLastMessageId 函数（如果可用）
          if (last_message_id < 0 && typeof (window as any).getLastMessageId === 'function') {
            try {
              last_message_id = (window as any).getLastMessageId();
              console.log('✅ 通过 getLastMessageId() 获取到消息ID:', last_message_id);
            } catch (error) {
              console.warn('⚠️ getLastMessageId() 调用失败:', error);
            }
          }

          if (last_message_id < 0) {
            console.warn('⚠️ 无法获取最后一条消息ID');
            return;
          }

          // 插件环境：使用 getChatIdSafe() 获取聊天ID
          const current_chat_id = getChatIdSafe();
          if (!current_chat_id) {
            console.log('❌ 无法获取聊天ID，跳过自动总结检查');
            return;
          }

          // 获取自动总结开启时的起始楼层（插件环境 - localStorage）
          let auto_summary_start_id = 0;
          try {
            const scriptId = getScriptIdSafe();
            const storageKey = `${scriptId}_auto_summary_start_id_${current_chat_id}`;
            const savedStartId = localStorage.getItem(storageKey);

            console.log(`🔍 检查 localStorage:`, {
              current_chat_id,
              storageKey,
              savedStartId,
            });

            if (savedStartId !== null) {
              auto_summary_start_id = parseInt(savedStartId, 10);
              console.log(`✅ 使用现有起始楼层: ${auto_summary_start_id} (聊天: ${current_chat_id})`);
            } else {
              // 当前聊天没有起始楼层，需要智能设置
              // 检查是否有现有的总结历史，避免重复总结
              if (!scriptId) {
                console.warn('script_id 为空，无法检查现有总结');
                return;
              }

              // 插件环境：从 localStorage 读取历史总结
              const historyKey = `${scriptId}_summary_history_${current_chat_id}`;
              const savedHistory = localStorage.getItem(historyKey);
              const existingSummaries = savedHistory ? JSON.parse(savedHistory) : [];

              if (Array.isArray(existingSummaries) && existingSummaries.length > 0) {
                // 有现有总结，找到最后一个总结的结束楼层
                const lastSummary = existingSummaries[0]; // 最新的总结在数组开头
                const lastSummaryEnd = lastSummary.end_id || 0;

                // 如果当前楼层大于最后总结的结束楼层，从最后总结结束楼层+1开始
                if (last_message_id > lastSummaryEnd) {
                  auto_summary_start_id = lastSummaryEnd + 1;
                  console.log(
                    `🔄 重新加载聊天，基于现有总结设置起始楼层: ${auto_summary_start_id} (最后总结结束于第 ${lastSummaryEnd} 层)`,
                  );
                  window.toastr?.info(`重新加载聊天，起始楼层设置为第 ${auto_summary_start_id} 层`);
                } else {
                  // 当前楼层小于等于最后总结结束楼层，从当前楼层开始
                  auto_summary_start_id = last_message_id;
                  console.log(`🔄 重新加载聊天，当前楼层已总结，从当前楼层开始: ${last_message_id}`);
                  window.toastr?.info(`重新加载聊天，从当前楼层开始: ${last_message_id}`);
                }
              } else {
                // 没有现有总结，从第0层开始（包括AI开场白）
                auto_summary_start_id = 0;
                console.log(`🆕 新聊天窗口，设置起始楼层: 0 (聊天: ${current_chat_id}) - 从AI开场白开始`);
                window.toastr?.info(`新聊天窗口，起始楼层设置为第 0 层（AI开场白）`);
              }

              // 确保起始楼层从第0层开始（包括AI开场白）
              if (auto_summary_start_id < 0) {
                auto_summary_start_id = 0;
                console.log(`⚠️ 修正起始楼层为0，从AI开场白开始`);
              }

              // 插件环境：保存到 localStorage
              localStorage.setItem(storageKey, String(auto_summary_start_id));
            }
          } catch (error) {
            console.warn('获取自动总结起始楼层失败，使用当前楼层:', error);
            auto_summary_start_id = last_message_id;
          }

          console.log(
            `检查自动总结: 当前楼层=${last_message_id}, 起始楼层=${auto_summary_start_id}, 间隔=${settings.summarize_interval}`,
          );

          // 检查是否需要自动总结
          // 修正计算逻辑：从起始楼层开始计算相对位置，包含起始楼层
          // 楼层编号：0=AI开场白, 1=用户, 2=AI, 3=用户...
          const relative_position = last_message_id - auto_summary_start_id;

          // 修复：间隔为5表示每5层总结一次（0-4, 5-9...）
          // 从楼层0到楼层4共5层，relative_position=4，所以触发条件是 >= interval - 1
          const should_trigger = relative_position >= settings.summarize_interval - 1;

          console.log('🧮 计算检查:', {
            last_message_id,
            auto_summary_start_id,
            relative_position,
            summarize_interval: settings.summarize_interval,
            should_trigger,
            calculation: `${relative_position} >= ${settings.summarize_interval - 1} (包含起始楼层，共${relative_position + 1}层)`,
            expected_trigger_at_floor: auto_summary_start_id + settings.summarize_interval - 1,
            will_summarize_range: `${auto_summary_start_id}-${auto_summary_start_id + settings.summarize_interval - 1}`,
            floor_explanation: '楼层编号：0=AI开场白, 1=用户, 2=AI, 3=用户...',
          });

          if (last_message_id >= auto_summary_start_id && should_trigger) {
            // 计算总结范围：固定总结interval层（例如间隔5就总结5层）
            const start_id = auto_summary_start_id;
            const end_id = auto_summary_start_id + settings.summarize_interval - 1;

            // 异步执行总结
            console.log(`🎯 触发自动总结: 楼层 ${start_id}-${end_id}`);
            window.toastr.info(`🔄 开始自动总结楼层 ${start_id}-${end_id}...`);

            summarizeMessages(start_id, end_id)
              .then(summary => {
                console.log(`✅ 自动总结完成: 楼层 ${start_id}-${end_id}`, summary);

                // 添加到历史总结中
                try {
                  const historyStore = useSummaryHistoryStore();
                  historyStore.addSummary(start_id, end_id, summary);
                } catch (e) {
                  console.error('添加自动总结到历史失败:', e);
                }

                // 更新起始楼层，为下次总结做准备（插件环境 - localStorage）
                const new_start_id = end_id + 1;
                const scriptId = getScriptIdSafe();
                const current_chat_id = getChatIdSafe();
                if (scriptId && current_chat_id) {
                  const storageKey = `${scriptId}_auto_summary_start_id_${current_chat_id}`;
                  localStorage.setItem(storageKey, String(new_start_id));
                  console.log(`🔄 更新起始楼层为: ${new_start_id}`);
                }

                window.toastr.success(`✅ 已自动总结第 ${start_id}-${end_id} 楼，下次将从第 ${new_start_id} 楼开始`);
              })
              .catch(error => {
                console.error('❌ 自动总结失败：', error);
                window.toastr.error('❌ 自动总结失败：' + error.message);
              });
          }
        } catch (error) {
          console.error('checkAutoSummarize 发生错误：', error);
          // 静默失败，不影响用户操作
        }
      };

      // 使用 DOM 监控 + 轮询实现自动总结
      console.log('🔍 环境诊断: eventOn 不可用，使用 DOM 监控方案');

      let lastCheckedMessageId = -1;
      let domObserver: MutationObserver | null = null;

      // 方式1: DOM 变化监控
      const setupDOMMonitoring = () => {
        try {
          const chatContainer = document.getElementById('chat');
          if (!chatContainer) {
            console.warn('⚠️ 未找到聊天容器 #chat');
            return false;
          }

          domObserver = new MutationObserver(mutations => {
            // 检查是否有新的消息节点添加
            let hasNewMessage = false;
            for (const mutation of mutations) {
              if (mutation.addedNodes.length > 0) {
                for (const node of Array.from(mutation.addedNodes)) {
                  if (node.nodeType === 1) {
                    const element = node as Element;
                    const classList = Array.from(element.classList);
                    if (classList.includes('mes') && !classList.includes('mes_stop')) {
                      hasNewMessage = true;
                      break;
                    }
                  }
                }
              }
              if (hasNewMessage) break;
            }

            if (hasNewMessage) {
              console.log('📨 检测到新消息节点，延迟检查自动总结...');
              // 延迟500ms等待消息完全渲染
              setTimeout(() => {
                // 优先使用 TavernHelper 获取消息数量
                let currentMessageId = -1;

                // 方式1: TavernHelper.getLastMessageId()
                if (typeof (window as any).TavernHelper !== 'undefined') {
                  if (typeof (window as any).TavernHelper.getLastMessageId === 'function') {
                    try {
                      currentMessageId = (window as any).TavernHelper.getLastMessageId();
                      console.log('✅ 通过 TavernHelper.getLastMessageId() 获取到消息ID:', currentMessageId);
                    } catch (error) {
                      console.warn('⚠️ TavernHelper.getLastMessageId() 调用失败:', error);
                    }
                  } else if (typeof (window as any).TavernHelper.getChatMessages === 'function') {
                    // 方式2: TavernHelper.getChatMessages()
                    try {
                      const messages = (window as any).TavernHelper.getChatMessages('0-{{lastMessageId}}');
                      if (Array.isArray(messages) && messages.length > 0) {
                        currentMessageId = messages.length - 1;
                        console.log(
                          '✅ 通过 TavernHelper.getChatMessages() 获取到消息数:',
                          messages.length,
                          '最后ID:',
                          currentMessageId,
                        );
                      }
                    } catch (error) {
                      console.warn('⚠️ TavernHelper.getChatMessages() 调用失败:', error);
                    }
                  }
                }

                // 方式3: 降级到 SillyTavern.chat（如果可用）
                if (currentMessageId < 0 && typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
                  currentMessageId = SillyTavern.chat.length - 1;
                  console.log('✅ 通过 SillyTavern.chat.length 获取到消息ID:', currentMessageId);
                }

                // 方式4: 全局 getLastMessageId 函数（如果可用）
                if (currentMessageId < 0 && typeof (window as any).getLastMessageId === 'function') {
                  try {
                    currentMessageId = (window as any).getLastMessageId();
                    console.log('✅ 通过 getLastMessageId() 获取到消息ID:', currentMessageId);
                  } catch (error) {
                    console.warn('⚠️ getLastMessageId() 调用失败:', error);
                  }
                }

                console.log('🔍 DOM 监控检查结果:', {
                  currentMessageId,
                  lastCheckedMessageId,
                  条件满足: currentMessageId >= 0 && currentMessageId !== lastCheckedMessageId,
                });

                if (currentMessageId >= 0 && currentMessageId !== lastCheckedMessageId) {
                  lastCheckedMessageId = currentMessageId;
                  console.log(`🔄 DOM 监控触发自动总结检查，当前消息ID: ${currentMessageId}`);
                  checkAutoSummarize();
                } else {
                  if (currentMessageId < 0) {
                    console.warn('⚠️ 无法获取有效的消息ID，跳过自动总结检查');
                  } else {
                    console.log('ℹ️ 消息ID未变化，跳过检查');
                  }
                }
              }, 500);
            }
          });

          domObserver.observe(chatContainer, {
            childList: true,
            subtree: true,
          });

          console.log('✅ DOM 监控已启动，监控容器: #chat');
          return true;
        } catch (error) {
          console.error('❌ DOM 监控设置失败:', error);
          return false;
        }
      };

      // 方式2: 定时轮询（作为备用）
      const startPolling = () => {
        setInterval(() => {
          try {
            // 优先使用 TavernHelper 获取消息数量
            let currentMessageId = -1;

            // 方式1: TavernHelper.getLastMessageId()
            if (typeof (window as any).TavernHelper !== 'undefined') {
              if (typeof (window as any).TavernHelper.getLastMessageId === 'function') {
                try {
                  currentMessageId = (window as any).TavernHelper.getLastMessageId();
                } catch (error) {
                  console.warn('⚠️ 轮询：TavernHelper.getLastMessageId() 调用失败:', error);
                }
              } else if (typeof (window as any).TavernHelper.getChatMessages === 'function') {
                // 方式2: TavernHelper.getChatMessages()
                try {
                  const messages = (window as any).TavernHelper.getChatMessages('0-{{lastMessageId}}');
                  if (Array.isArray(messages) && messages.length > 0) {
                    currentMessageId = messages.length - 1;
                  }
                } catch (error) {
                  console.warn('⚠️ 轮询：TavernHelper.getChatMessages() 调用失败:', error);
                }
              }
            }

            // 方式3: 降级到 SillyTavern.chat（如果可用）
            if (currentMessageId < 0 && typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
              currentMessageId = SillyTavern.chat.length - 1;
            }

            // 方式4: 全局 getLastMessageId 函数（如果可用）
            if (currentMessageId < 0 && typeof (window as any).getLastMessageId === 'function') {
              try {
                currentMessageId = (window as any).getLastMessageId();
              } catch (error) {
                console.warn('⚠️ 轮询：getLastMessageId() 调用失败:', error);
              }
            }

            if (currentMessageId >= 0 && currentMessageId !== lastCheckedMessageId) {
              lastCheckedMessageId = currentMessageId;
              console.log(`🔄 轮询检测到消息变化，检查自动总结... 当前消息ID: ${currentMessageId}`);
              checkAutoSummarize();
            }
          } catch (error) {
            console.error('❌ 轮询检查失败:', error);
          }
        }, 3000); // 每3秒检查一次
      };

      // 启动监控
      const domSuccess = setupDOMMonitoring();
      if (domSuccess) {
        console.log('✅ 使用 DOM 监控方案');
      } else {
        console.log('⚠️ DOM 监控失败，使用轮询方案');
      }

      // 总是启动轮询作为备用
      startPolling();
      console.log('✅ 轮询检查已启动（每3秒）');

      // 页面卸载时清理
      $(window).on('pagehide', () => {
        if (domObserver) {
          domObserver.disconnect();
        }
      });

      // 添加设置监控，当设置变化时重新验证（插件环境 - 使用 localStorage）
      const settingsStore = useSettingsStore();
      if (settingsStore && settingsStore.settings) {
        // 监听设置变化，确保自动总结状态正确
        const unwatch = watch(
          () => settingsStore.settings.auto_summarize_enabled,
          (newValue, oldValue) => {
            console.log(`🔄 自动总结设置变化: ${oldValue} -> ${newValue}`);
            if (newValue && !oldValue) {
              // 开启自动总结时，检查是否需要设置起始楼层
              try {
                const scriptId = getScriptIdSafe();
                if (!scriptId) {
                  console.warn('script_id 为空，无法检查起始楼层');
                  return;
                }

                // 插件环境：从 localStorage 检查
                const chatId = getChatIdSafe();
                const storageKey = `${scriptId}_auto_summary_start_id_${chatId}`;
                const auto_summary_start_id = localStorage.getItem(storageKey);

                // 只有在没有设置过起始楼层时才设置
                if (!auto_summary_start_id) {
                  // 优先使用 TavernHelper 获取消息数量
                  let last_message_id = 0;

                  // 方式1: TavernHelper.getLastMessageId()
                  if (typeof (window as any).TavernHelper !== 'undefined') {
                    if (typeof (window as any).TavernHelper.getLastMessageId === 'function') {
                      try {
                        last_message_id = (window as any).TavernHelper.getLastMessageId();
                      } catch (error) {
                        console.warn('⚠️ TavernHelper.getLastMessageId() 调用失败:', error);
                        last_message_id = -1;
                      }
                    } else if (typeof (window as any).TavernHelper.getChatMessages === 'function') {
                      try {
                        const messages = (window as any).TavernHelper.getChatMessages('0-{{lastMessageId}}');
                        if (Array.isArray(messages) && messages.length > 0) {
                          last_message_id = messages.length - 1;
                        }
                      } catch (error) {
                        console.warn('⚠️ TavernHelper.getChatMessages() 调用失败:', error);
                        last_message_id = -1;
                      }
                    }
                  }

                  // 方式2: 降级到 SillyTavern.chat（如果可用）
                  if (last_message_id < 0 && typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
                    last_message_id = SillyTavern.chat.length - 1;
                  }

                  // 方式3: 全局 getLastMessageId 函数（如果可用）
                  if (last_message_id < 0 && typeof (window as any).getLastMessageId === 'function') {
                    try {
                      last_message_id = (window as any).getLastMessageId();
                    } catch (error) {
                      console.warn('⚠️ getLastMessageId() 调用失败:', error);
                    }
                  }

                  if (last_message_id >= 0) {
                    localStorage.setItem(storageKey, String(last_message_id));
                    console.log(`✅ 首次开启自动总结，起始楼层设置为: ${last_message_id}`);
                    window.toastr?.info(`自动总结已开启，将从第 ${last_message_id} 层开始`);
                  } else {
                    console.warn('⚠️ 无法获取消息ID，起始楼层设置为 0');
                    localStorage.setItem(storageKey, '0');
                    window.toastr?.warn('无法获取当前消息数，起始楼层设置为 0');
                  }
                } else {
                  console.log(`✅ 自动总结已开启，使用现有起始楼层: ${auto_summary_start_id}`);
                  window.toastr?.info(`自动总结已开启，起始楼层: ${auto_summary_start_id}`);
                }
              } catch (error) {
                console.error('❌ 检查起始楼层失败:', error);
              }
            }
          },
          { immediate: false },
        );

        // 页面卸载时清理监听器
        $(window).on('pagehide', () => {
          unwatch();
        });
      }

      // 暴露调试函数到全局

      // 1. 重置起始楼层 - 将当前聊天的auto_summary_start_id重置为当前楼层
      (window as any).smartResetChat = () => {
        try {
          console.log('🔄 开始智能重置起始楼层...');

          // 检查必要的API
          if (typeof SillyTavern === 'undefined') {
            console.error('❌ SillyTavern API 不可用');
            window.toastr.error('SillyTavern API 不可用');
            return;
          }

          // 插件环境：使用 getChatIdSafe() 函数
          const chat_id = getChatIdSafe();
          console.log('获取到的聊天ID:', chat_id, '类型:', typeof chat_id);

          if (!chat_id && chat_id !== 0) {
            console.error('❌ 无法获取当前聊天ID，可能未打开任何聊天');
            window.toastr.error('请先打开一个聊天');
            return;
          }

          // 插件环境：使用 SillyTavern.chat
          let lastMessageId = 0;
          let messages: any[] = [];
          if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
            lastMessageId = SillyTavern.chat.length - 1;
            messages = SillyTavern.chat;
          } else if (typeof getLastMessageId === 'function' && typeof getChatMessages === 'function') {
            lastMessageId = getLastMessageId();
            messages = getChatMessages('0-{{lastMessageId}}');
          }
          console.log('最新消息ID:', lastMessageId);
          console.log('获取到的消息数量:', messages.length);

          if (lastMessageId < 0) {
            console.warn('⚠️ 当前聊天没有消息');
            window.toastr.warning('当前聊天没有消息');
            return;
          }

          const current_floor = lastMessageId;

          // 将起始楼层重置为当前楼层（插件环境 - 使用 localStorage）
          try {
            const scriptId = getScriptIdSafe();
            const storageKey = `${scriptId}_auto_summary_start_id_${chat_id}`;
            localStorage.setItem(storageKey, String(current_floor));
            console.log('✅ 变量已写入 localStorage');
          } catch (varError) {
            console.error('❌ 写入变量失败:', varError);
            throw new Error('写入变量失败: ' + (varError as Error).message);
          }

          console.log(`✅ 起始楼层已重置为: ${current_floor}`);
          window.toastr.success(`起始楼层已重置为第 ${current_floor} 层`);

          // 输出详细信息
          console.log('重置详情:', {
            聊天ID: String(chat_id),
            当前楼层: current_floor,
            消息数量: messages.length,
          });
        } catch (error) {
          console.error('❌ 重置起始楼层失败:', error);
          console.error('错误堆栈:', (error as Error).stack);
          window.toastr.error('重置起始楼层失败: ' + (error as Error).message);
        }
      };

      // 2. 测试完整自动总结流程（插件环境）
      (window as any).testCompleteAutoSummary = () => {
        try {
          console.log('🧪 开始测试完整自动总结流程...');

          const store = useSettingsStore();
          const settings = store.settings;

          console.log('当前设置:', {
            自动总结开启: settings.auto_summarize_enabled,
            总结间隔: settings.summarize_interval,
            保存到世界书: settings.auto_save_to_worldbook,
          });

          // 插件环境：使用 SillyTavern.chat
          let lastMessageId = 0;
          let messages: any[] = [];
          if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
            lastMessageId = SillyTavern.chat.length - 1;
            messages = SillyTavern.chat;
          } else if (typeof getLastMessageId === 'function' && typeof getChatMessages === 'function') {
            lastMessageId = getLastMessageId();
            messages = getChatMessages('0-{{lastMessageId}}');
          }
          const chat_id = getChatIdSafe();

          const scriptId = getScriptIdSafe();
          const storageKey = `${scriptId}_auto_summary_start_id_${chat_id}`;
          const auto_summary_start_id = localStorage.getItem(storageKey) || '0';

          console.log('当前状态:', {
            聊天ID: chat_id,
            当前楼层: lastMessageId,
            起始楼层: auto_summary_start_id,
            间隔: settings.summarize_interval,
          });

          window.toastr.info('测试信息已输出到控制台');
        } catch (error) {
          console.error('❌ 测试失败:', error);
          window.toastr.error('测试失败: ' + (error as Error).message);
        }
      };

      // 3. 同步数据（插件环境 - localStorage）
      (window as any).syncAutoSummaryData = () => {
        try {
          console.log('🔄 开始同步数据...');

          const chat_id = getChatIdSafe();
          if (!chat_id) {
            console.error('❌ 无法获取当前聊天ID');
            window.toastr.error('无法获取当前聊天ID');
            return;
          }

          // 插件环境：显示 localStorage 数据
          const scriptId = getScriptIdSafe();
          const storageKey = `${scriptId}_auto_summary_start_id_${chat_id}`;
          const auto_summary_start_id = localStorage.getItem(storageKey);

          console.log('插件环境 localStorage 数据:', {
            聊天ID: chat_id,
            起始楼层: auto_summary_start_id,
            插件ID: scriptId,
          });

          window.toastr.success('数据已同步，请查看控制台');
        } catch (error) {
          console.error('❌ 同步失败:', error);
          window.toastr.error('同步失败: ' + (error as Error).message);
        }
      };

      // 4. 检查当前楼层（插件环境）
      (window as any).checkCurrentFloor = () => {
        try {
          console.log('🔍 开始检查楼层...');

          // 插件环境：使用 SillyTavern.chat
          let lastMessageId = 0;
          let messages: any[] = [];
          if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
            lastMessageId = SillyTavern.chat.length - 1;
            messages = SillyTavern.chat;
          } else if (typeof getLastMessageId === 'function' && typeof getChatMessages === 'function') {
            lastMessageId = getLastMessageId();
            messages = getChatMessages('0-{{lastMessageId}}');
          }
          if (lastMessageId < 0) {
            console.warn('⚠️ 当前聊天没有消息');
            window.toastr.warning('当前聊天没有消息');
            return;
          }
          const current_floor = lastMessageId;

          const scriptId = getScriptIdSafe();
          const chat_id = getChatIdSafe();
          const storageKey = `${scriptId}_auto_summary_start_id_${chat_id}`;
          const auto_summary_start_id = localStorage.getItem(storageKey) || '0';

          console.log('楼层信息:', {
            当前楼层: current_floor,
            起始楼层: auto_summary_start_id,
            消息总数: messages.length,
            最后一条消息: messages[messages.length - 1],
          });

          window.toastr.info(`当前楼层: ${current_floor}, 起始楼层: ${auto_summary_start_id}`);
        } catch (error) {
          console.error('❌ 检查失败:', error);
          window.toastr.error('检查失败: ' + (error as Error).message);
        }
      };

      // 5. 验证楼层计算（插件环境）
      (window as any).testFloorCalculation = () => {
        try {
          console.log('🧮 开始验证楼层计算...');

          const store = useSettingsStore();
          const settings = store.settings;

          // 插件环境：使用 SillyTavern.chat
          let lastMessageId = 0;
          if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
            lastMessageId = SillyTavern.chat.length - 1;
          } else if (typeof getLastMessageId === 'function') {
            lastMessageId = getLastMessageId();
          }
          const current_floor = lastMessageId;

          const scriptId = getScriptIdSafe();
          const chat_id = getChatIdSafe();
          const storageKey = `${scriptId}_auto_summary_start_id_${chat_id}`;
          const auto_summary_start_id = parseInt(localStorage.getItem(storageKey) || '0');

          const relative_position = current_floor - auto_summary_start_id;
          const should_trigger = relative_position > 0 && relative_position % settings.summarize_interval === 0;

          console.log('计算结果:', {
            当前楼层: current_floor,
            起始楼层: auto_summary_start_id,
            相对位置: relative_position,
            总结间隔: settings.summarize_interval,
            是否触发: should_trigger,
            下次触发楼层: auto_summary_start_id + settings.summarize_interval,
          });

          window.toastr.info(`相对位置: ${relative_position}, 是否触发: ${should_trigger}`);
        } catch (error) {
          console.error('❌ 计算验证失败:', error);
          window.toastr.error('计算验证失败: ' + (error as Error).message);
        }
      };

      // 6. 检查自动总结状态（插件环境）
      (window as any).checkAutoSummaryStatus = () => {
        try {
          console.log('📊 开始检查自动总结状态...');

          const store = useSettingsStore();
          const settings = store.settings;

          // 插件环境：使用 SillyTavern.chat
          let lastMessageId = 0;
          let messages: any[] = [];
          if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
            lastMessageId = SillyTavern.chat.length - 1;
            messages = SillyTavern.chat;
          } else if (typeof getLastMessageId === 'function' && typeof getChatMessages === 'function') {
            lastMessageId = getLastMessageId();
            messages = getChatMessages('0-{{lastMessageId}}');
          }
          const chat_id = getChatIdSafe();

          const scriptId = getScriptIdSafe();
          const storageKey = `${scriptId}_auto_summary_start_id_${chat_id}`;
          const auto_summary_start_id = localStorage.getItem(storageKey) || '0';

          const status = {
            基本信息: {
              聊天ID: chat_id,
              当前楼层: lastMessageId,
              消息总数: messages.length,
            },
            设置信息: {
              自动总结开启: settings.auto_summarize_enabled,
              总结间隔: settings.summarize_interval,
              保存到世界书: settings.auto_save_to_worldbook,
              API配置: settings.api_endpoint ? '已配置' : '未配置',
            },
            状态信息: {
              起始楼层: auto_summary_start_id,
              存储方式: 'localStorage',
            },
          };

          console.log('状态详情:', status);
          console.table(status.基本信息);
          console.table(status.设置信息);

          window.toastr.success('状态信息已输出到控制台');
        } catch (error) {
          console.error('❌ 状态检查失败:', error);
          window.toastr.error('状态检查失败: ' + (error as Error).message);
        }
      };

      // 7. 手动检查总结（用于没有事件监听的环境）
      (window as any).manualCheckSummary = () => {
        try {
          console.log('🔍 手动检查自动总结...');
          checkAutoSummarize();
          window.toastr.info('已手动触发总结检查，请查看控制台');
        } catch (error) {
          console.error('❌ 手动检查失败:', error);
          window.toastr.error('手动检查失败: ' + (error as Error).message);
        }
      };

      console.log('✅ 调试函数已注册:', [
        'smartResetChat',
        'testCompleteAutoSummary',
        'syncAutoSummaryData',
        'checkCurrentFloor',
        'testFloorCalculation',
        'checkAutoSummaryStatus',
        'manualCheckSummary',
      ]);

      // ===== 暴露关键对象和函数到 window，供调试和控制台使用 =====
      (window as any).pinia = {
        globalPinia,
        useSettingsStore,
        useSummaryHistoryStore,
      };
      (window as any).getScriptIdSafe = getScriptIdSafe;
      (window as any).getChatIdSafe = getChatIdSafe;

      console.log('✅ 全局对象已暴露:', {
        pinia: '✅ Pinia 实例和 Store 函数',
        getScriptIdSafe: '✅ 获取脚本ID',
        getChatIdSafe: '✅ 获取聊天ID',
      });

      window.toastr.success('🐱 猫猫的小破烂已加载 | 授权验证成功');
    }, 200);
  })(); // 结束 async IIFE
});

// 全局挂载任务管理器（独立于主面板，不受面板开关影响）
$(() => {
  // 延迟挂载，确保DOM完全加载和授权验证完成
  setTimeout(() => {
    try {
      // 🔐 检查授权状态
      if (!isAuthorized()) {
        console.warn('⚠️ 未授权，跳过任务管理器挂载');
        return;
      }

      // 检查是否已存在，避免重复挂载
      const existingContainer = document.getElementById('global-task-manager');
      if (existingContainer) {
        console.log('⚠️ 任务管理器容器已存在，跳过重复挂载');
        return;
      }

      const taskManagerContainer = document.createElement('div');
      taskManagerContainer.id = 'global-task-manager';
      taskManagerContainer.style.cssText = 'position: fixed; z-index: 999999;';
      document.body.appendChild(taskManagerContainer);

      console.log('📦 任务管理器容器已创建:', taskManagerContainer);

      const taskApp = createApp(TaskManager);
      taskApp.use(globalPinia); // 使用全局pinia实例

      // 使用选择器挂载
      taskApp.mount('#global-task-manager');

      console.log('✅ 全局任务管理器已成功挂载');
    } catch (error) {
      console.error('❌ 挂载任务管理器失败:', error);
      window.toastr?.error('任务管理器挂载失败');
    }
  }, 1000); // 增加延迟，确保授权验证完成
});
