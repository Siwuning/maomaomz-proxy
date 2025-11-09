$(() => {
  // 延迟初始化，确保酒馆完全加载
  setTimeout(() => {
    let isAdding = false;

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
