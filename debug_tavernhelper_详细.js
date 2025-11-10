// 详细检查 TavernHelper 对象
console.log('='.repeat(60));
console.log('📊 TavernHelper 详细检查');
console.log('='.repeat(60));

if (typeof TavernHelper !== 'undefined') {
  console.log('\n【TavernHelper 所有属性】');
  const allProps = Object.keys(TavernHelper);
  console.log('总数:', allProps.length);
  console.log('列表:', allProps);

  console.log('\n【tavern_events 详情】');
  if (TavernHelper.tavern_events) {
    console.log('类型:', typeof TavernHelper.tavern_events);
    console.log('所有事件:', Object.keys(TavernHelper.tavern_events));
    console.log('完整内容:', TavernHelper.tavern_events);
  }

  console.log('\n【iframe_events 详情】');
  if (TavernHelper.iframe_events) {
    console.log('类型:', typeof TavernHelper.iframe_events);
    console.log('所有事件:', Object.keys(TavernHelper.iframe_events));
    console.log('完整内容:', TavernHelper.iframe_events);
  }

  console.log('\n【搜索事件相关的方法】');
  const eventRelated = allProps.filter(
    key =>
      key.toLowerCase().includes('event') ||
      key.toLowerCase().includes('on') ||
      key.toLowerCase().includes('emit') ||
      key.toLowerCase().includes('listen'),
  );

  if (eventRelated.length > 0) {
    console.log('找到事件相关方法:', eventRelated);
    eventRelated.forEach(key => {
      console.log(`\n- ${key}:`);
      console.log('  类型:', typeof TavernHelper[key]);
      if (typeof TavernHelper[key] === 'function') {
        console.log('  函数:', TavernHelper[key].toString().substring(0, 200));
      } else {
        console.log('  值:', TavernHelper[key]);
      }
    });
  }

  console.log('\n【测试：是否可以直接使用 tavern_events 监听】');
  try {
    // 测试是否可以通过 jQuery 监听 tavern_events 中定义的事件
    if (TavernHelper.tavern_events && TavernHelper.tavern_events.CHARACTER_MESSAGE_RENDERED) {
      const eventName = TavernHelper.tavern_events.CHARACTER_MESSAGE_RENDERED;
      console.log('尝试监听事件:', eventName);

      $(document).on(eventName, function (e, ...args) {
        console.log('🎉 成功捕获事件:', eventName, args);
        window.toastr?.success('捕获到事件: ' + eventName);
      });

      console.log('✅ 监听器已注册，等待事件触发...');
      window.toastr?.info('请发送一条消息来测试事件监听');
    }
  } catch (e) {
    console.error('❌ 监听失败:', e);
  }
} else {
  console.log('❌ TavernHelper 不存在');
}

console.log('\n' + '='.repeat(60));
console.log('请发送一条消息，观察控制台输出');
console.log('='.repeat(60));
