$(() => {
  // 延迟初始化，确保酒馆完全加载
  setTimeout(() => {
    let isAdding = false;

    // 🔥 在扩展设置页面添加备用入口
    const addExtensionSettingsEntry = () => {
      // 查找扩展设置区域（支持移动端和PC端多种选择器）
      const possibleContainers = [
        '#extensions_settings',
        '#extensions_settings2',
        '#extensionsMenu',
        '.extensions_block',
        '#drawer-content .extensions_info',
        '.drawer-content .extensions_info',
        '#rm_extensions_block',
        '.rm_extensions_block',
      ];

      let extensionsSettings = $();
      for (const selector of possibleContainers) {
        const found = $(selector);
        if (found.length > 0) {
          extensionsSettings = found;
          console.log('找到扩展设置区域:', selector);
          break;
        }
      }

      if (extensionsSettings.length === 0) {
        console.log('扩展设置区域未找到，稍后重试...');
        setTimeout(addExtensionSettingsEntry, 1000);
        return;
      }

      // 检查是否已添加
      if ($('#maomaomz-extension-entry').length > 0) {
        return;
      }

      // 创建入口卡片（紧凑版）
      const entryCard = $(`
        <div id="maomaomz-extension-entry" class="extension_container" style="
          background: rgba(74, 158, 255, 0.08);
          border: 1px solid rgba(74, 158, 255, 0.3);
          border-radius: 5px;
          padding: 6px 10px;
          margin: 5px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        ">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 16px;">🐱</span>
            <span style="font-size: 13px; color: #aaa;">猫猫插件</span>
          </div>
          <button id="maomaomz-open-panel-btn" class="menu_button" style="
            background: #4a9eff;
            color: white;
            border: none;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
          ">
            打开
          </button>
        </div>
      `);

      // 添加到扩展设置区域的最前面
      extensionsSettings.first().prepend(entryCard);

      // 按钮点击事件
      $('#maomaomz-open-panel-btn').on('click', function () {
        const panel = $('#memoryManagementPanel');
        if (panel.length > 0) {
          panel.fadeIn(200);
          // 关闭设置面板
          $('#drawer-content').removeClass('openDrawer');
          (window as any).toastr?.success('🐱 面板已打开！', '', { timeOut: 2000 });
        } else {
          (window as any).toastr?.error('面板未加载，请刷新页面重试', '错误');
        }
      });

      // 🔥 移动端触摸事件
      $('#maomaomz-open-panel-btn').on('touchend', function (e) {
        e.preventDefault();
        const panel = $('#memoryManagementPanel');
        if (panel.length > 0) {
          panel.fadeIn(200);
          $('#drawer-content').removeClass('openDrawer');
          (window as any).toastr?.success('🐱 面板已打开！', '', { timeOut: 2000 });
        } else {
          (window as any).toastr?.error('面板未加载，请刷新页面重试', '错误');
        }
      });

      // 按钮悬停效果
      $('#maomaomz-open-panel-btn')
        .on('mouseenter', function () {
          $(this).css({ background: '#5ab0ff', transform: 'scale(1.05)' });
        })
        .on('mouseleave', function () {
          $(this).css({ background: '#4a9eff', transform: 'scale(1)' });
        });

      console.log('✅ 扩展设置入口已添加');
    };

    // 添加扩展设置入口
    addExtensionSettingsEntry();

    // 监听抽屉打开事件，确保入口存在
    $(document).on('click', '#extensionsMenuButton, [data-tab="extensions"]', () => {
      setTimeout(addExtensionSettingsEntry, 300);
    });

    const addNavButton = () => {
      // 防止重复添加
      if (isAdding) {
        return;
      }
      isAdding = true;
      try {
        // 尝试多个可能的导航栏选择器
        const possibleSelectors = [
          '#top-bar', // 从你提供的 HTML 看到的
          '#top-settings-holder', // 从你提供的 HTML 看到的
          '#topBar',
          '.topBar',
          '#navbar',
          '.navbar',
          'header',
          '.header',
          '#header',
          '.top_header',
          '.navigation',
          // 🔥 移动端可能的选择器
          '.drawer-header',
          '#leftNavDrawerIcon',
          '.menu_button_icon',
          '#send_but_sheld',
          '.range-block',
          '#rm_button_main',
          '.rm_button',
        ];

        let topBar: JQuery<HTMLElement> = $();
        let foundSelector = '';

        for (const selector of possibleSelectors) {
          const found = $(selector);
          if (found.length > 0) {
            topBar = found;
            foundSelector = selector;
            console.log(`找到导航栏: ${selector}`);
            break;
          }
        }

        if (topBar.length === 0) {
          console.log('未找到导航栏，500ms后重试...');
          setTimeout(addNavButton, 500);
          return;
        }

        console.log(`使用导航栏: ${foundSelector}`);

        // 检查是否已经添加过
        const existingButton = $('#memoryNavButton');
        if (existingButton.length > 0) {
          console.log('mzrodyu猫猫的小破烂导航按钮已存在，移除后重新添加');
          existingButton.remove();
        }

        // 查找正确的容器 - 如果是 top-bar，查找 top-settings-holder
        let targetContainer = topBar;
        if (foundSelector === '#top-bar') {
          const settingsHolder = $('#top-settings-holder');
          if (settingsHolder.length > 0) {
            targetContainer = settingsHolder;
            console.log('使用 top-settings-holder 作为容器');
          }
        }

        // 创建按钮 - 只显示图标，和其他图标一致
        const navButton = $(
          `<div id="memoryNavButton" class="interactable" style="
            padding: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: inherit;
            border-radius: 4px;
            transition: background 0.2s;
            position: relative;
          " title="mzrodyu猫猫的小破烂">
            <span style="font-size: 24px">🐱</span>
          </div>`,
        );

        // 打印导航栏结构用于调试
        console.log('目标容器类型:', targetContainer[0]?.id || '未指定');
        console.log('目标容器HTML:', targetContainer[0]?.outerHTML?.substring(0, 300));

        // 如果 targetContainer 就是 top-settings-holder，添加到最前面
        if (targetContainer[0]?.id === 'top-settings-holder') {
          console.log('添加到 top-settings-holder 最前面');
          const firstChild = targetContainer.children().first();
          if (firstChild.length > 0) {
            navButton.insertBefore(firstChild);
          } else {
            targetContainer.prepend(navButton);
          }
        } else {
          // 对于其他容器，添加到前面
          console.log('添加到容器前面');
          targetContainer.prepend(navButton);
        }

        // 添加点击事件 - 打开浮动面板
        navButton.on('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          console.log('点击mzrodyu猫猫的小破烂导航按钮');

          // 打开浮动面板
          const panel = $('#memoryManagementPanel');
          if (panel.length > 0) {
            if (panel.is(':visible')) {
              panel.fadeOut(200);
            } else {
              panel.fadeIn(200);
            }
          } else {
            toastr.error('浮动面板未加载');
          }
        });

        // 🔥 移动端触摸事件支持
        navButton.on('touchend', function (e) {
          e.preventDefault();
          e.stopPropagation();

          console.log('触摸mzrodyu猫猫的小破烂导航按钮');

          const panel = $('#memoryManagementPanel');
          if (panel.length > 0) {
            if (panel.is(':visible')) {
              panel.fadeOut(200);
            } else {
              panel.fadeIn(200);
            }
          } else {
            toastr.error('浮动面板未加载');
          }
        });

        // 添加鼠标悬停效果
        navButton
          .on('mouseenter', function () {
            $(this).css('background', 'rgba(255, 255, 255, 0.1)');
          })
          .on('mouseleave', function () {
            $(this).css('background', 'transparent');
          });

        console.log('mzrodyu猫猫的小破烂导航按钮已添加到:', targetContainer[0]?.id || '容器');
        console.log('按钮位置:', navButton[0]?.parentElement?.children?.[0]?.className || '已添加');
        console.log('按钮元素:', navButton[0]);
        console.log('面板容器长度:', $('#memoryManagementPanel').length);
        isAdding = false;
      } catch (error) {
        console.error('添加导航按钮失败:', error);
        isAdding = false;
        setTimeout(addNavButton, 500);
      }
    };

    // 初始添加
    addNavButton();

    // 每2秒检查一次按钮是否存在，如果不存在就重新添加
    setInterval(() => {
      const button = $('#memoryNavButton');
      if (button.length === 0 && !isAdding) {
        console.log('检测到按钮消失，重新添加...');
        addNavButton();
      }
    }, 2000);

    // 监听酒馆的各种可能导致UI更新的事件（插件环境 - 使用 SillyTavern.eventSource）
    if (typeof SillyTavern !== 'undefined' && SillyTavern.eventSource) {
      try {
        // 监听聊天变化
        SillyTavern.eventSource.on(SillyTavern.eventTypes.CHAT_CHANGED, () => {
          console.log('聊天变化，检查按钮...');
          setTimeout(() => {
            const button = $('#memoryNavButton');
            if (button.length === 0 && !isAdding) {
              console.log('聊天变化后按钮消失，重新添加...');
              addNavButton();
            }
          }, 500);
        });
      } catch (e) {
        console.log('无法监听事件:', e);
      }
    } else if (
      typeof (window as any).TavernHelper !== 'undefined' &&
      typeof (window as any).TavernHelper.eventOn === 'function'
    ) {
      // 降级：使用 TavernHelper (酒馆助手环境)
      try {
        const TavernHelper = (window as any).TavernHelper;
        const tavern_events = (window as any).tavern_events;
        TavernHelper.eventOn(tavern_events.CHAT_CHANGED, () => {
          console.log('聊天变化，检查按钮...');
          setTimeout(() => {
            const button = $('#memoryNavButton');
            if (button.length === 0 && !isAdding) {
              console.log('聊天变化后按钮消失，重新添加...');
              addNavButton();
            }
          }, 500);
        });
      } catch (e) {
        console.log('无法监听事件:', e);
      }
    }
  }, 300);
});

export {};
