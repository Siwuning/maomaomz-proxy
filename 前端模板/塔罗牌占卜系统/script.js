// ============================================
// 🔮 塔罗秘占 - JavaScript 核心逻辑
// ============================================

// 全局变量
let currentCharacter = '';
let currentType = '';
let selectedCard = null;

// 占卜结果数据库
const divinationResults = {
  selfpleasure: {
    title: '私密时刻占卜',
    results: [
      {
        icon: '💦',
        text: '塔罗牌显示，{name}今天清晨在浴室里度过了一段"放松"的时光。水声掩盖了一切，但命运之眼看到了那副慵懒而满足的表情...',
      },
      {
        icon: '🌙',
        text: '昨夜，{name}独自躺在床上，思绪飘向了某个人的身影。手指不自觉地滑向了隐秘的地方，在黑暗中释放了压抑已久的欲望...',
      },
      {
        icon: '🛁',
        text: '最近{name}洗澡的时间明显变长了。塔罗牌揭示，那不仅仅是在清洁身体，更是在享受温热水流带来的另一种快感...',
      },
      {
        icon: '😳',
        text: '就在几小时前，{name}偷偷在无人注意的角落里，快速地解决了心中涌动的躁热。那种紧张刺激的感觉让心跳加速...',
      },
      {
        icon: '💭',
        text: '{name}今天频繁地走神，脑海中全是不可描述的画面。趁着独处的机会，终于忍不住用手缓解了那份难耐的渴望...',
      },
      {
        icon: '🌡️',
        text: '占卜显示，{name}最近每晚都有一个固定的"睡前仪式"。在寂静的夜里，独自探索身体的愉悦，已成为每日必修课...',
      },
    ],
  },

  'lewd-thoughts': {
    title: '色色想法占卜',
    results: [
      {
        icon: '💭',
        text: '此刻，{name}正在脑海中想象着某人被压在墙上的场景。嘴唇相贴，手指游走，呼吸交缠... 越想越觉得脸颊发烫。',
      },
      {
        icon: '😏',
        text: '塔罗牌揭示，{name}刚才看到了一个让人浮想联翩的画面，现在满脑子都是"如果是我和ta..."的幻想，身体也开始有了反应...',
      },
      {
        icon: '🔥',
        text: '{name}最近脑子里装满了各种大胆的想法。被绑住双手的画面、被温柔侵犯的触感、还有那些羞耻又刺激的姿势...',
      },
      {
        icon: '💋',
        text: '命运之眼看到，{name}正在幻想着被某人压在身下深吻的感觉。舌尖的纠缠、唾液的交换... 光是想象就让人腿软。',
      },
      {
        icon: '😳',
        text: '{name}现在正想着："如果能和那个人做一次就好了..."越想越觉得心痒难耐，连坐着都有些不自在...',
      },
      {
        icon: '🌶️',
        text: '塔罗牌显示，{name}脑海中正在上演一部少儿不宜的"小电影"。主角是自己和某个人，剧情相当大胆露骨...',
      },
    ],
  },

  dream: {
    title: '昨夜春梦占卜',
    results: [
      {
        icon: '🌙',
        text: '昨晚{name}梦到自己和某人在月光下拥吻，衣物一件件褪去，双方的身体紧密相贴... 醒来时发现床单都湿了一片。',
      },
      {
        icon: '💫',
        text: '塔罗牌揭示，{name}做了一个非常刺激的梦。梦里被某人强势地压住，无法挣脱，只能承受那波涛般的侵犯... 醒来时双腿发软。',
      },
      {
        icon: '🔥',
        text: '昨夜{name}梦到自己在公共场所被人悄悄爱抚，既羞耻又兴奋。梦境如此真实，以至于醒来后还能感受到那份余韵...',
      },
      {
        icon: '💕',
        text: '{name}梦到和初恋在海边缠绵，海浪拍打着身体，彼此的温度在月色下融合... 这个梦太过美好，醒来时竟有些失落。',
      },
      {
        icon: '😳',
        text: '命运之眼看到，{name}昨晚梦到自己主动勾引某人，做出了许多平时不敢做的大胆举动... 醒来后羞愧得把脸埋进枕头。',
      },
      {
        icon: '🌹',
        text: '{name}梦到被蒙上双眼，在黑暗中感受着某人的抚摸和亲吻，不知道下一秒会被触碰哪里... 醒来时心跳如鼓。',
      },
    ],
  },

  crush: {
    title: '暗恋对象占卜',
    results: [
      {
        icon: '💕',
        text: '塔罗牌显示，{name}心中藏着一个温柔的人。那人的笑容、声音、甚至一个不经意的眼神，都能让{name}心跳加速，夜不能寐...',
      },
      {
        icon: '😳',
        text: '命运之眼看到，{name}暗恋着一个平时看起来高冷的人。每次对视时的紧张、每次擦肩而过的心动... 这份感情藏得很深。',
      },
      {
        icon: '💭',
        text: '{name}喜欢上了一个不该喜欢的人。明知不会有结果，却还是忍不住偷偷关注，默默想念... 这份苦涩的暗恋无人知晓。',
      },
      {
        icon: '🌹',
        text: '占卜显示，{name}对某个朋友动了心。友情与爱情的界限越来越模糊，每次相处都在忍耐着想要更进一步的冲动...',
      },
      {
        icon: '💫',
        text: '{name}心里装着一个遥不可及的人。那人如星辰般耀眼，而{name}只能远远地仰望，把这份爱意深深埋藏...',
      },
      {
        icon: '💖',
        text: '塔罗牌揭示，{name}暗恋的人就在身边。每天的相处都是甜蜜的折磨，想要靠近却又害怕被发现... 这份心意何时能说出口呢？',
      },
    ],
  },

  browsing: {
    title: '浏览记录占卜',
    results: [
      {
        icon: '📱',
        text: '命运之眼看到，{name}最近经常在深夜浏览某些"特殊"的网站。搜索记录里全是些不可描述的关键词... 真是个小色批！',
      },
      {
        icon: '💻',
        text: '塔罗牌显示，{name}的收藏夹里藏着许多涩涩的图片和视频。那个名为"学习资料"的文件夹，其实装满了少儿不宜的内容...',
      },
      {
        icon: '🔍',
        text: '{name}最近搜索过"如何勾引喜欢的人"、"接吻技巧"、"第一次该注意什么"... 看来是在做某些事情的准备呢~',
      },
      {
        icon: '😏',
        text: '占卜揭示，{name}昨晚看了整整3小时的某种特殊视频。今天眼睛有点肿，据说是"熬夜学习"导致的... 呵呵。',
      },
      {
        icon: '📚',
        text: '{name}最近关注了好几个专门发涩图的账号，每天刷新好几遍。浏览历史里全是些羞羞的内容，真怕被别人看到...',
      },
      {
        icon: '🎬',
        text: '塔罗牌显示，{name}的观看历史里有很多"教学视频"。从基础到进阶，从温柔到激烈... 学得还挺认真呢！',
      },
    ],
  },

  fetish: {
    title: '隐藏癖好占卜',
    results: [
      {
        icon: '🎭',
        text: '塔罗牌揭示，{name}对"被束缚"这件事有着特殊的兴趣。想象着双手被绑住、无法挣脱、只能任人摆布的场景... 又羞又兴奋。',
      },
      {
        icon: '👔',
        text: '命运之眼看到，{name}对穿制服的人毫无抵抗力。无论是西装革履还是军装警服，都能让{name}瞬间沦陷...',
      },
      {
        icon: '🎀',
        text: '{name}有个不为人知的癖好：特别喜欢被称赞。听到"好乖"、"真棒"这类话时，身体会不由自主地产生奇怪的反应...',
      },
      {
        icon: '😈',
        text: '占卜显示，{name}其实喜欢"稍微强势一点"的对待方式。被压制、被命令、被狠狠地要... 这种失控的感觉让人上瘾。',
      },
      {
        icon: '🦶',
        text: '塔罗牌揭示了一个有趣的秘密：{name}对某个部位特别着迷。虽然表面上不动声色，但每次看到都会忍不住多看几眼...',
      },
      {
        icon: '🌶️',
        text: '{name}私下里喜欢一些比较"刺激"的玩法。普通的已经满足不了了，需要一些特殊的道具和场景才能完全兴奋起来...',
      },
    ],
  },

  experience: {
    title: '亲密经验占卜',
    results: [
      {
        icon: '💋',
        text: '塔罗牌显示，{name}的初吻献给了一个月光下的冲动。那次青涩而激烈的吻，让{name}第一次体会到了心跳的疯狂...',
      },
      {
        icon: '🌹',
        text: '命运之眼看到，{name}曾在某个秘密的地方，与某人有过一次"差点失控"的亲密接触。虽然最后刹住了车，但那份悸动至今难忘...',
      },
      {
        icon: '😳',
        text: '{name}有过一次喝醉后的"意外"。醒来时发现自己和某人躺在一起，衣衫不整... 到底发生了什么已经记不清了。',
      },
      {
        icon: '🔥',
        text: '占卜揭示，{name}曾和某人在公共场所做过一些大胆的事情。那种可能被发现的紧张感，反而让人更加兴奋...',
      },
      {
        icon: '💕',
        text: '{name}的第一次献给了深爱的人。虽然过程有些青涩笨拙，但那份温柔和小心翼翼，成为了最珍贵的回忆...',
      },
      {
        icon: '🌙',
        text: '塔罗牌显示，{name}曾在某个特殊的夜晚，体验了前所未有的快感。那种欲仙欲死的感觉，让人想要一次又一次...',
      },
    ],
  },

  desire: {
    title: '欲望指数占卜',
    results: [
      {
        icon: '🔥',
        text: '塔罗牌显示：欲望指数 ★★★★★ 爆表！\n\n{name}现在处于极度渴望的状态，身体里像有一团火在燃烧。迫切地想要被某人狠狠地拥抱、亲吻、侵犯... 再这样下去会忍不住主动扑上去！',
      },
      {
        icon: '💕',
        text: '塔罗牌显示：欲望指数 ★★★☆☆ 中等偏高\n\n{name}最近有点小想要，但还在可控范围内。偶尔会幻想一些涩涩的场景，看到喜欢的人会心跳加速... 如果有人主动勾引，很可能会把持不住哦~',
      },
      {
        icon: '😌',
        text: '塔罗牌显示：欲望指数 ★★☆☆☆ 平静期\n\n{name}目前的欲望值不高，处于比较平和的状态。不过一旦被撩拨起来，可能会像火山爆发一样突然爆发... 所以还是要小心点~',
      },
      {
        icon: '🌡️',
        text: '塔罗牌显示：欲望指数 ★★★★☆ 非常高！\n\n{name}现在身体很敏感，稍微一碰就会产生反应。脑子里全是些不正经的想法，看谁都像是在勾引自己... 急需"解决"一下！',
      },
      {
        icon: '💤',
        text: '塔罗牌显示：欲望指数 ★☆☆☆☆ 贤者模式\n\n{name}刚刚"释放"过，现在完全不想那方面的事情。不过这种状态维持不了多久，最多一天就会恢复成小色批~',
      },
      {
        icon: '😏',
        text: '塔罗牌显示：欲望指数 ★★★★★ MAX！\n\n{name}已经饥渴到极点，随时可能爆发！眼神开始变得危险，看人的时候总是盯着某些部位... 千万别单独和{name}待在密闭空间，会被吃掉的！',
      },
    ],
  },
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔮 塔罗秘占系统已加载');
  initializeEventListeners();
});

// ============================================
// 事件监听器
// ============================================
function initializeEventListeners() {
  // 输入角色名
  const nameInput = document.getElementById('characterName');
  nameInput.addEventListener('input', checkFormValid);

  // 选择占卜类型
  const typeCards = document.querySelectorAll('.type-card');
  typeCards.forEach(card => {
    card.addEventListener('click', function () {
      // 移除其他选中状态
      typeCards.forEach(c => c.classList.remove('selected'));
      // 添加选中状态
      this.classList.add('selected');
      currentType = this.dataset.type;
      checkFormValid();
    });
  });

  // 开始占卜按钮
  document.getElementById('startDivination').addEventListener('click', startDivination);

  // 塔罗牌点击
  document.querySelectorAll('.tarot-card').forEach(card => {
    card.addEventListener('click', function () {
      if (!this.classList.contains('flipped')) {
        flipCard(this);
      }
    });
  });
}

// ============================================
// 检查表单是否有效
// ============================================
function checkFormValid() {
  const name = document.getElementById('characterName').value.trim();
  const startBtn = document.getElementById('startDivination');

  if (name && currentType) {
    startBtn.disabled = false;
  } else {
    startBtn.disabled = true;
  }
}

// ============================================
// 开始占卜
// ============================================
function startDivination() {
  currentCharacter = document.getElementById('characterName').value.trim();

  // 隐藏输入区域
  document.getElementById('inputSection').style.display = 'none';

  // 显示卡片区域
  const cardSection = document.getElementById('cardSection');
  cardSection.style.display = 'block';

  // 更新目标名字
  document.getElementById('targetName').textContent = currentCharacter;

  // 重置所有卡片
  document.querySelectorAll('.tarot-card').forEach(card => {
    card.classList.remove('flipped');
  });

  // 滚动到卡片区域
  setTimeout(() => {
    cardSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);

  console.log(`🔮 开始为 ${currentCharacter} 占卜：${currentType}`);
}

// ============================================
// 翻牌
// ============================================
function flipCard(cardElement) {
  if (selectedCard) return; // 已经选过牌了

  selectedCard = cardElement;

  // 翻牌动画
  cardElement.classList.add('flipped');

  // 生成结果
  setTimeout(() => {
    const resultData = getRandomResult();

    // 显示卡片图标
    const cardResult = cardElement.querySelector('.card-result');
    cardResult.textContent = resultData.icon;

    // 延迟显示结果
    setTimeout(() => {
      showResult(resultData);
    }, 800);
  }, 400);

  console.log('🃏 翻开了一张牌');
}

// ============================================
// 获取随机结果
// ============================================
function getRandomResult() {
  const typeData = divinationResults[currentType];
  const results = typeData.results;
  const randomIndex = Math.floor(Math.random() * results.length);
  const result = results[randomIndex];

  // 替换名字占位符
  const text = result.text.replace(/{name}/g, currentCharacter);

  return {
    icon: result.icon,
    text: text,
    title: typeData.title,
  };
}

// ============================================
// 显示结果
// ============================================
function showResult(resultData) {
  // 隐藏卡片区域
  document.getElementById('cardSection').style.display = 'none';

  // 显示结果区域
  const resultSection = document.getElementById('resultSection');
  resultSection.style.display = 'block';

  // 填充结果内容
  document.getElementById('resultName').textContent = currentCharacter;
  document.getElementById('resultType').textContent = resultData.title;
  document.getElementById('resultText').textContent = resultData.text;

  // 滚动到结果区域
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  console.log('✨ 占卜完成');
}

// ============================================
// 重新占卜
// ============================================
function resetDivination() {
  // 重置变量
  currentCharacter = '';
  currentType = '';
  selectedCard = null;

  // 清空输入
  document.getElementById('characterName').value = '';

  // 移除所有选中状态
  document.querySelectorAll('.type-card').forEach(card => {
    card.classList.remove('selected');
  });

  // 重置按钮状态
  document.getElementById('startDivination').disabled = true;

  // 隐藏结果区域
  document.getElementById('resultSection').style.display = 'none';

  // 显示输入区域
  document.getElementById('inputSection').style.display = 'block';

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });

  console.log('🔄 重置占卜');
}

// ============================================
// 复制结果
// ============================================
function copyResult() {
  const name = document.getElementById('resultName').textContent;
  const type = document.getElementById('resultType').textContent;
  const text = document.getElementById('resultText').textContent;

  const fullText = `🔮 ${type}\n\n角色：${name}\n\n${text}\n\n━━━━━━━━━━━━\n塔罗秘占 · 仅供娱乐`;

  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      showNotification('✨ 占卜结果已复制到剪贴板！');
    })
    .catch(err => {
      console.error('复制失败:', err);
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showNotification('✨ 占卜结果已复制到剪贴板！');
      } catch (err) {
        showNotification('❌ 复制失败，请手动复制');
      }
      document.body.removeChild(textarea);
    });
}

// ============================================
// 通知提示
// ============================================
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 30px;
    background: linear-gradient(135deg, var(--mystic-purple), var(--mystic-pink));
    border: 2px solid var(--mystic-gold);
    color: white;
    z-index: 10000;
    font-size: 1rem;
    box-shadow: 0 5px 20px rgba(107, 70, 193, 0.5);
    animation: slideIn 0.3s, slideOut 0.3s 2.7s;
    font-family: 'Georgia', serif;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============================================
// 发送到聊天
// ============================================
function sendToChat() {
  const name = document.getElementById('resultName').textContent;
  const type = document.getElementById('resultType').textContent;
  const text = document.getElementById('resultText').textContent;

  const chatMessage = `🔮 ${type}\n\n**角色：${name}**\n\n${text}`;

  // 尝试使用 SillyTavern API 发送
  try {
    if (window.SillyTavern && window.SillyTavern.getContext) {
      const context = window.SillyTavern.getContext();
      if (context.sendUserMessage) {
        context.sendUserMessage(chatMessage);
        showNotification('✅ 已发送到聊天！', 'success');
        console.log('💬 已通过 SillyTavern API 发送到聊天');
        return;
      }
    }
  } catch (error) {
    console.error('SillyTavern API 发送失败:', error);
  }

  // 降级方案：复制到剪贴板
  navigator.clipboard
    .writeText(chatMessage)
    .then(() => {
      showNotification('📋 已复制，请粘贴到聊天框！', 'success');
      console.log('📋 已复制到剪贴板（降级方案）');
    })
    .catch(err => {
      console.error('复制失败:', err);
      showNotification('❌ 发送失败，请手动复制', 'error');
    });
}

// ============================================
// 创建快速回复
// ============================================
function createQuickReply() {
  const name = document.getElementById('resultName').textContent;
  const type = document.getElementById('resultType').textContent;
  const text = document.getElementById('resultText').textContent;

  // 创建快速回复标签（简短版）
  const label = `🔮 ${name} ${type.replace('占卜', '')}`;

  // 创建快速回复消息（完整结果）
  const message = `🔮 ${type}\n\n**角色：${name}**\n\n${text}`;

  // 生成 SillyTavern QR 命令
  const qrCommand = `/qr create label="${label}" ${message}`;

  // 尝试直接执行命令
  try {
    if (window.SillyTavern && window.SillyTavern.getContext) {
      const context = window.SillyTavern.getContext();
      if (context.executeSlashCommands) {
        context.executeSlashCommands(qrCommand);
        showNotification('✅ 快速回复已创建！', 'success');
        console.log('⚡ 快速回复已创建');
        return;
      }
    }
  } catch (error) {
    console.error('创建快速回复失败:', error);
  }

  // 降级方案：复制命令
  navigator.clipboard
    .writeText(qrCommand)
    .then(() => {
      showNotification('📋 QR 命令已复制，请粘贴到聊天框执行！', 'success');
      console.log('📋 QR 命令已复制:', qrCommand);
    })
    .catch(err => {
      console.error('复制失败:', err);
      // 再次降级：显示命令
      alert('请复制以下命令到聊天框执行：\n\n' + qrCommand);
    });
}

// 导出到全局作用域
window.resetDivination = resetDivination;
window.copyResult = copyResult;
window.sendToChat = sendToChat;
window.createQuickReply = createQuickReply;

console.log('🔮 命运的齿轮已经转动...');
