import { watch, createApp } from 'vue';
import { klona } from 'klona';
import { useSettingsStore, useSummaryHistoryStore } from './settings';
import { getScriptIdSafe, setGlobalScriptId } from './utils';
import { summarizeMessages } from './总结功能';
import './浮动面板';
import './添加导航按钮';
import { globalPinia } from './globalPinia';
import TaskManager from './components/TaskManager.vue';

$(() => {
  // 延迟初始化，确保酒馆完全加载
  setTimeout(() => {
    // 插件环境：使用固定的ID
    const script_id = 'maomaomz_extension_v1';
    
    // 设置全局 script_id
    setGlobalScriptId(script_id);

    console.log('🐱 猫猫的记忆管理工具开始初始化，插件ID:', script_id);

    // 等待一段时间确保完全准备好
    setTimeout(() => {
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

          if (typeof settings.summary_interval !== 'number' || settings.summary_interval < 1) {
            console.warn('❌ 总结间隔设置无效，跳过检查');
            return;
          }
          console.log('📋 当前设置:', {
            auto_summarize_enabled: settings.auto_summarize_enabled,
            summary_interval: settings.summary_interval,
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

          const last_message_id = getLastMessageId();

          // 获取当前聊天ID
          const current_chat_id = SillyTavern.getCurrentChatId();
          if (!current_chat_id) {
            console.log('❌ 无法获取聊天ID，跳过自动总结检查');
            return;
          }

          // 获取自动总结开启时的起始楼层（基于聊天ID）
          let auto_summary_start_id = 0;
          try {
            // 根据酒馆助手文档，使用聊天变量存储每个聊天的状态
            const chatVars = getVariables({ type: 'chat' });
            const auto_summary_start_id_key = 'auto_summary_start_id';

            console.log(`🔍 检查聊天变量:`, {
              current_chat_id,
              chat_vars: chatVars,
              has_start_id: chatVars[auto_summary_start_id_key] !== undefined,
              existing_start_id: chatVars[auto_summary_start_id_key],
            });

            if (chatVars[auto_summary_start_id_key] !== undefined && chatVars[auto_summary_start_id_key] !== null) {
              auto_summary_start_id = chatVars[auto_summary_start_id_key];
              console.log(`✅ 使用现有起始楼层: ${auto_summary_start_id} (聊天: ${current_chat_id})`);
            } else {
              // 当前聊天没有起始楼层，需要智能设置
              // 检查是否有现有的总结历史，避免重复总结
              const scriptId = getScriptIdSafe();
              if (!scriptId) {
                console.warn('script_id 为空，无法检查现有总结');
                return;
              }
              const scriptVars = getVariables({ type: 'script', script_id: scriptId });
              const existingSummaries = Array.isArray(scriptVars?.summary_history) ? scriptVars.summary_history : [];

              if (existingSummaries.length > 0) {
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

              // 保存起始楼层到聊天变量（根据酒馆助手文档）
              insertOrAssignVariables({ [auto_summary_start_id_key]: auto_summary_start_id }, { type: 'chat' });
            }
          } catch (error) {
            console.warn('获取自动总结起始楼层失败，使用当前楼层:', error);
            auto_summary_start_id = last_message_id;
          }

          console.log(
            `检查自动总结: 当前楼层=${last_message_id}, 起始楼层=${auto_summary_start_id}, 间隔=${settings.summary_interval}`,
          );

          // 检查是否需要自动总结
          // 修正计算逻辑：从起始楼层开始计算相对位置，包含起始楼层
          // 楼层编号：0=AI开场白, 1=用户, 2=AI, 3=用户...
          const relative_position = last_message_id - auto_summary_start_id;

          // 修复：间隔为5表示每5层总结一次（0-4, 5-9...）
          // 从楼层0到楼层4共5层，relative_position=4，所以触发条件是 >= interval - 1
          const should_trigger = relative_position >= settings.summary_interval - 1;

          console.log('🧮 计算检查:', {
            last_message_id,
            auto_summary_start_id,
            relative_position,
            summarize_interval: settings.summary_interval,
            should_trigger,
            calculation: `${relative_position} >= ${settings.summary_interval - 1} (包含起始楼层，共${relative_position + 1}层)`,
            expected_trigger_at_floor: auto_summary_start_id + settings.summary_interval - 1,
            will_summarize_range: `${auto_summary_start_id}-${auto_summary_start_id + settings.summary_interval - 1}`,
            floor_explanation: '楼层编号：0=AI开场白, 1=用户, 2=AI, 3=用户...',
          });

          if (last_message_id >= auto_summary_start_id && should_trigger) {
            // 计算总结范围：固定总结interval层（例如间隔5就总结5层）
            const start_id = auto_summary_start_id;
            const end_id = auto_summary_start_id + settings.summary_interval - 1;

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

                // 更新起始楼层，为下次总结做准备
                const new_start_id = end_id + 1;
                insertOrAssignVariables({ auto_summary_start_id: new_start_id }, { type: 'chat' });
                console.log(`🔄 更新起始楼层为: ${new_start_id}`);

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

      // 监听消息接收事件
      try {
        eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, () => {
          console.log('📨 收到消息渲染事件，检查自动总结...');
          checkAutoSummarize();
        });

        // 监听聊天切换事件（根据酒馆助手文档）
        eventOn(tavern_events.CHAT_CHANGED, (chat_file_name: string) => {
          console.log('🔄 聊天切换事件:', chat_file_name);

          // 检查新聊天是否已有自动总结状态
          try {
            const chatVars = getVariables({ type: 'chat' });
            const auto_summary_start_id = chatVars.auto_summary_start_id;

            if (auto_summary_start_id !== undefined && auto_summary_start_id !== null) {
              console.log(`✅ 切换到已有自动总结的聊天: ${chat_file_name}, 起始楼层: ${auto_summary_start_id}`);
            } else {
              console.log(`🆕 切换到新聊天: ${chat_file_name}, 等待下一条消息时初始化`);
            }
          } catch (error) {
            console.warn('检查聊天状态失败:', error);
          }
        });

        console.log('✅ 事件监听器已注册');
      } catch (error) {
        console.error('❌ 注册事件监听器失败:', error);
      }

      // 添加设置监控，当设置变化时重新验证
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
                const chatVars = getVariables({ type: 'chat' });
                const auto_summary_start_id = chatVars.auto_summary_start_id;

                // 只有在没有设置过起始楼层时才设置
                if (auto_summary_start_id === undefined || auto_summary_start_id === null) {
                  const last_message_id = getLastMessageId();
                  insertOrAssignVariables({ auto_summary_start_id: last_message_id }, { type: 'chat' });
                  console.log(`✅ 首次开启自动总结，起始楼层设置为: ${last_message_id}`);
                  window.toastr?.info(`自动总结已开启，将从第 ${last_message_id} 层开始`);
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

          const chat_id = SillyTavern.getCurrentChatId();
          console.log('获取到的聊天ID:', chat_id, '类型:', typeof chat_id);

          if (!chat_id && chat_id !== 0) {
            console.error('❌ 无法获取当前聊天ID，可能未打开任何聊天');
            window.toastr.error('请先打开一个聊天');
            return;
          }

          const lastMessageId = getLastMessageId();
          console.log('最新消息ID:', lastMessageId);

          const messages = getChatMessages(`0-${lastMessageId}`);
          console.log('获取到的消息数量:', messages?.length);

          if (!messages || messages.length === 0) {
            console.warn('⚠️ 当前聊天没有消息');
            window.toastr.warning('当前聊天没有消息');
            return;
          }

          const current_floor = lastMessageId;

          // 将起始楼层重置为当前楼层
          try {
            insertOrAssignVariables({ auto_summary_start_id: current_floor }, { type: 'chat' });
            console.log('✅ 变量已写入聊天变量');
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

      // 2. 测试完整自动总结流程
      (window as any).testCompleteAutoSummary = () => {
        try {
          console.log('🧪 开始测试完整自动总结流程...');

          const store = useSettingsStore();
          const settings = store.settings;

          console.log('当前设置:', {
            自动总结开启: settings.auto_summarize_enabled,
            总结间隔: settings.summary_interval,
            保存到世界书: settings.auto_save_to_worldbook,
          });

          const lastMessageId = getLastMessageId();
          const messages = getChatMessages(`0-${lastMessageId}`);
          const chat_id = SillyTavern.getCurrentChatId();
          const chatVars = getVariables({ type: 'chat' });
          const auto_summary_start_id = chatVars?.auto_summary_start_id || 0;

          console.log('当前状态:', {
            聊天ID: chat_id,
            当前楼层: messages.length - 1,
            起始楼层: auto_summary_start_id,
            间隔: settings.summary_interval,
          });

          window.toastr.info('测试信息已输出到控制台');
        } catch (error) {
          console.error('❌ 测试失败:', error);
          window.toastr.error('测试失败: ' + (error as Error).message);
        }
      };

      // 3. 同步数据
      (window as any).syncAutoSummaryData = () => {
        try {
          console.log('🔄 开始同步数据...');

          const chat_id = SillyTavern.getCurrentChatId();
          if (!chat_id) {
            console.error('❌ 无法获取当前聊天ID');
            window.toastr.error('无法获取当前聊天ID');
            return;
          }

          const chatVars = getVariables({ type: 'chat' });
          console.log('当前聊天变量:', chatVars);

          const scriptId = getScriptIdSafe();
          if (scriptId) {
            const scriptVars = getVariables({ type: 'script', script_id: scriptId });
            console.log('脚本变量:', scriptVars);
          }

          window.toastr.success('数据已同步，请查看控制台');
        } catch (error) {
          console.error('❌ 同步失败:', error);
          window.toastr.error('同步失败: ' + (error as Error).message);
        }
      };

      // 4. 检查当前楼层
      (window as any).checkCurrentFloor = () => {
        try {
          console.log('🔍 开始检查楼层...');

          const lastMessageId = getLastMessageId();
          const messages = getChatMessages(`0-${lastMessageId}`);
          if (!messages || messages.length === 0) {
            console.warn('⚠️ 当前聊天没有消息');
            window.toastr.warning('当前聊天没有消息');
            return;
          }

          const current_floor = lastMessageId;
          const chatVars = getVariables({ type: 'chat' });
          const auto_summary_start_id = chatVars?.auto_summary_start_id || 0;

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

      // 5. 验证楼层计算
      (window as any).testFloorCalculation = () => {
        try {
          console.log('🧮 开始验证楼层计算...');

          const store = useSettingsStore();
          const settings = store.settings;
          const lastMessageId = getLastMessageId();
          const messages = getChatMessages(`0-${lastMessageId}`);
          const chatVars = getVariables({ type: 'chat' });
          const auto_summary_start_id = chatVars?.auto_summary_start_id || 0;
          const current_floor = messages.length - 1;

          const relative_position = current_floor - auto_summary_start_id;
          const should_trigger = relative_position > 0 && relative_position % settings.summary_interval === 0;

          console.log('计算结果:', {
            当前楼层: current_floor,
            起始楼层: auto_summary_start_id,
            相对位置: relative_position,
            总结间隔: settings.summary_interval,
            是否触发: should_trigger,
            下次触发楼层: auto_summary_start_id + settings.summary_interval,
          });

          window.toastr.info(`相对位置: ${relative_position}, 是否触发: ${should_trigger}`);
        } catch (error) {
          console.error('❌ 计算验证失败:', error);
          window.toastr.error('计算验证失败: ' + (error as Error).message);
        }
      };

      // 6. 检查自动总结状态
      (window as any).checkAutoSummaryStatus = () => {
        try {
          console.log('📊 开始检查自动总结状态...');

          const store = useSettingsStore();
          const settings = store.settings;
          const lastMessageId = getLastMessageId();
          const messages = getChatMessages(`0-${lastMessageId}`);
          const chat_id = SillyTavern.getCurrentChatId();
          const chatVars = getVariables({ type: 'chat' });

          const status = {
            基本信息: {
              聊天ID: chat_id,
              当前楼层: messages.length - 1,
              消息总数: messages.length,
            },
            设置信息: {
              自动总结开启: settings.auto_summarize_enabled,
              总结间隔: settings.summary_interval,
              保存到世界书: settings.auto_save_to_worldbook,
              API配置: settings.api_endpoint ? '已配置' : '未配置',
            },
            状态信息: {
              起始楼层: chatVars?.auto_summary_start_id || 0,
              聊天变量: chatVars,
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

      console.log('✅ 调试函数已注册:', [
        'smartResetChat',
        'testCompleteAutoSummary',
        'syncAutoSummaryData',
        'checkCurrentFloor',
        'testFloorCalculation',
        'checkAutoSummaryStatus',
      ]);

      window.toastr.success('mzrodyu猫猫的小破烂脚本已加载');
    }, 200);
  }, 100);
});

// 全局挂载任务管理器（独立于主面板，不受面板开关影响）
$(() => {
  // 延迟挂载，确保DOM完全加载
  setTimeout(() => {
    try {
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
  }, 500);
});
