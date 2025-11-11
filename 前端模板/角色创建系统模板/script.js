// ============================================
// 🎮 角色创建系统 - JavaScript 核心逻辑
// ============================================

// 全局变量
let currentStep = 1;
const totalSteps = 5;
const STORAGE_KEY = 'character_draft';

// 初始化
document.addEventListener('DOMContentLoaded', function () {
  console.log('🎮 角色创建系统已加载');
  updateButtonVisibility();
  initializeEventListeners();
  loadDraft(); // 加载草稿
  showWelcomeMessage();
});

// 显示欢迎信息
function showWelcomeMessage() {
  console.log('%c[ SYSTEM ONLINE ]', 'color: #00ff41; font-weight: bold; font-size: 14px;');
  console.log('%c角色创建系统 v2.0 - 像素科技版', 'color: #00d9ff; font-size: 12px;');
  console.log('%c按 Ctrl+S 可保存草稿', 'color: #8b95b0; font-size: 11px;');
}

// ============================================
// 事件监听器初始化
// ============================================
function initializeEventListeners() {
  // 头像预览
  const avatarInput = document.getElementById('avatar');
  if (avatarInput) {
    avatarInput.addEventListener('input', function () {
      updateAvatarPreview(this.value);
    });
  }

  // 属性值滑块
  const statInputs = document.querySelectorAll('.stat-item input[type="range"]');
  statInputs.forEach(input => {
    input.addEventListener('input', function () {
      const valueSpan = this.parentElement.querySelector('.stat-value');
      valueSpan.textContent = this.value;
      updateStatColor(this, valueSpan);
    });
  });

  // 表单自动保存
  const form = document.getElementById('characterForm');
  form.addEventListener('input', debounce(saveDraft, 1000));

  // 键盘快捷键
  document.addEventListener('keydown', handleKeyboard);

  // 表单提交拦截
  form.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  // 添加输入框聚焦效果音
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      console.log(`%c[INPUT] ${input.name || input.id}`, 'color: #00ff41;');
    });
  });
}

// 更新属性值颜色（根据数值动态变化）
function updateStatColor(slider, valueSpan) {
  const value = parseInt(slider.value);
  let color = '#00ff41'; // 默认绿色

  if (value >= 80) {
    color = '#ff9500'; // 橙色 - 极高
  } else if (value >= 60) {
    color = '#00d9ff'; // 青色 - 高
  } else if (value >= 40) {
    color = '#00ff41'; // 绿色 - 中
  } else if (value >= 20) {
    color = '#bd00ff'; // 紫色 - 低
  } else {
    color = '#ff006e'; // 粉红 - 极低
  }

  valueSpan.style.color = color;
  valueSpan.style.textShadow = `0 0 10px ${color}`;
  slider.style.setProperty('--thumb-color', color);
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 键盘快捷键处理
function handleKeyboard(e) {
  // Ctrl + S: 保存草稿
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveDraft();
    showNotification('💾 草稿已保存', 'success');
  }

  // Ctrl + 左箭头: 上一步
  if (e.ctrlKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    changeStep(-1);
  }

  // Ctrl + 右箭头: 下一步
  if (e.ctrlKey && e.key === 'ArrowRight') {
    e.preventDefault();
    changeStep(1);
  }

  // Ctrl + Enter: 生成角色（在最后一步）
  if (e.ctrlKey && e.key === 'Enter' && currentStep === totalSteps) {
    e.preventDefault();
    generateCharacter();
  }
}

// ============================================
// 步骤导航
// ============================================
function changeStep(direction) {
  const newStep = currentStep + direction;

  if (newStep < 1 || newStep > totalSteps) {
    return;
  }

  // 如果是前进，验证当前步骤
  if (direction > 0 && !validateCurrentStep()) {
    return;
  }

  console.log(`%c[STEP] ${currentStep} -> ${newStep}`, 'color: #00d9ff;');

  // 更新当前步骤
  currentStep = newStep;

  // 更新UI
  updateProgressBar();
  showFormSection(currentStep);
  updateButtonVisibility();

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 验证当前步骤
function validateCurrentStep() {
  const currentSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
  const requiredInputs = currentSection.querySelectorAll('[required]');

  for (const input of requiredInputs) {
    if (!input.value.trim()) {
      const labelText = input.previousElementSibling?.textContent || '该字段';
      showNotification(`⚠️ 请填写必填项：${labelText}`, 'warning');
      input.focus();
      return false;
    }
  }

  return true;
}

// 更新进度条
function updateProgressBar() {
  const steps = document.querySelectorAll('.progress-step');

  steps.forEach((step, index) => {
    const stepNumber = index + 1;

    if (stepNumber < currentStep) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (stepNumber === currentStep) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
}

// 显示表单部分
function showFormSection(step) {
  const sections = document.querySelectorAll('.form-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.querySelector(`.form-section[data-section="${step}"]`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

// 更新按钮可见性
function updateButtonVisibility() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';

  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'flex';
  } else {
    nextBtn.style.display = 'flex';
    submitBtn.style.display = 'none';
  }
}

// ============================================
// 头像预览
// ============================================
function updateAvatarPreview(url) {
  const preview = document.getElementById('avatarPreview');

  if (url.trim()) {
    preview.innerHTML = `<img src="${url}" alt="角色头像" onerror="this.style.display='none'; this.parentElement.innerHTML='<p style=\\'color: var(--danger); text-align: center;\\'>❌ 图片加载失败</p>'">`;
    console.log('%c[AVATAR] 已更新头像预览', 'color: #00d9ff;');
  } else {
    preview.innerHTML = '';
  }
}

// ============================================
// 技能管理
// ============================================
function addSkill() {
  const skillsList = document.getElementById('skillsList');
  const skillItem = document.createElement('div');
  skillItem.className = 'skill-item';
  skillItem.style.animation = 'glitchIn 0.3s';
  skillItem.innerHTML = `
    <input type="text" placeholder="技能名称" name="skillName[]">
    <input type="number" placeholder="等级 (1-10)" name="skillLevel[]" min="1" max="10" value="1">
    <button type="button" class="btn-remove" onclick="removeSkill(this)">
      <i class="fas fa-times"></i>
    </button>
  `;
  skillsList.appendChild(skillItem);
  console.log('%c[SKILL] 添加技能', 'color: #00ff41;');
}

function removeSkill(button) {
  const skillItem = button.parentElement;
  skillItem.style.animation = 'glitchOut 0.3s';
  setTimeout(() => {
    skillItem.remove();
    console.log('%c[SKILL] 移除技能', 'color: #ff006e;');
  }, 300);
}

// ============================================
// 角色生成
// ============================================
function generateCharacter() {
  if (!validateCurrentStep()) {
    return;
  }

  console.log('%c[GENERATE] 生成角色数据...', 'color: #00ff41; font-weight: bold;');

  const character = {
    基本信息: {
      名字: document.getElementById('name').value,
      年龄: parseInt(document.getElementById('age').value) || null,
      性别: document.getElementById('gender').value || '未知',
      种族: document.getElementById('race').value || '未知',
      职业: document.getElementById('occupation').value || '未知',
      称号: document.getElementById('nickname').value || '',
      头像: document.getElementById('avatar').value || '',
    },
    外貌特征: {
      身高_cm: parseInt(document.getElementById('height').value) || null,
      体重_kg: parseInt(document.getElementById('weight').value) || null,
      体型: document.getElementById('build').value || '普通',
      发色: document.getElementById('hairColor').value || '',
      发型: document.getElementById('hairStyle').value || '',
      瞳色: document.getElementById('eyeColor').value || '',
      特殊特征: document.getElementById('features').value || '',
      常穿服装: document.getElementById('clothing').value || '',
    },
    性格特点: {
      性格类型: getSelectedTags('personality'),
      性格描述: document.getElementById('personalityDesc').value || '',
      喜好: document.getElementById('likes').value || '',
      厌恶: document.getElementById('dislikes').value || '',
      恐惧: document.getElementById('fears').value || '',
    },
    背景故事: {
      出生地: document.getElementById('birthplace').value || '',
      家庭背景: document.getElementById('family').value || '',
      成长经历: document.getElementById('backstory').value || '',
      行动动机: document.getElementById('motivation').value || '',
      秘密: document.getElementById('secrets').value || '',
    },
    技能能力: {
      属性值: {
        力量: parseInt(document.getElementById('strength').value),
        敏捷: parseInt(document.getElementById('agility').value),
        智力: parseInt(document.getElementById('intelligence').value),
        魅力: parseInt(document.getElementById('charisma').value),
        幸运: parseInt(document.getElementById('luck').value),
        意志: parseInt(document.getElementById('willpower').value),
      },
      技能列表: getSkills(),
      特殊能力: document.getElementById('specialAbility').value || '',
      弱点: document.getElementById('weaknesses').value || '',
    },
    元数据: {
      创建时间: new Date().toLocaleString('zh-CN'),
      版本: '2.0_像素科技版',
      生成器: '角色创建系统',
    },
  };

  // 显示结果
  displayResult(character);

  // 清除草稿
  clearDraft();
}

// 获取选中的标签
function getSelectedTags(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

// 获取技能列表
function getSkills() {
  const skillNames = document.querySelectorAll('input[name="skillName[]"]');
  const skillLevels = document.querySelectorAll('input[name="skillLevel[]"]');
  const skills = [];

  skillNames.forEach((nameInput, index) => {
    const name = nameInput.value.trim();
    const level = parseInt(skillLevels[index].value) || 1;

    if (name) {
      skills.push({ 名称: name, 等级: level });
    }
  });

  return skills;
}

// ============================================
// 结果显示
// ============================================
function displayResult(character) {
  const resultSection = document.getElementById('resultSection');
  const resultOutput = document.getElementById('resultOutput');

  // 隐藏表单
  document.getElementById('characterForm').style.display = 'none';

  // 显示结果
  resultSection.style.display = 'block';
  resultOutput.textContent = formatJSON(character);

  // 保存到全局变量
  window.currentCharacter = character;

  console.log('%c[SUCCESS] 角色生成成功！', 'color: #00ff41; font-weight: bold; font-size: 14px;');
  console.log(character);

  // 滚动到结果区域
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);

  showNotification('✅ 角色卡生成成功！', 'success');
}

// 格式化 JSON（带颜色高亮）
function formatJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

// ============================================
// 导出功能
// ============================================
function copyToClipboard() {
  const resultOutput = document.getElementById('resultOutput');
  const text = resultOutput.textContent;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      showNotification('✅ 已复制到剪贴板！', 'success');
      console.log('%c[COPY] 已复制到剪贴板', 'color: #00ff41;');
    })
    .catch(err => {
      console.error('复制失败:', err);
      // 降级方案
      fallbackCopy(text);
    });
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showNotification('✅ 已复制到剪贴板！', 'success');
  } catch (err) {
    showNotification('❌ 复制失败，请手动复制', 'error');
  }
  document.body.removeChild(textarea);
}

function downloadJSON() {
  const character = window.currentCharacter;
  if (!character) {
    showNotification('❌ 没有可下载的角色数据', 'error');
    return;
  }

  const json = JSON.stringify(character, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.基本信息.名字 || '角色'}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('%c[DOWNLOAD] JSON 已下载', 'color: #00ff41;');
  showNotification('✅ JSON 文件已下载', 'success');
}

function downloadYAML() {
  const character = window.currentCharacter;
  if (!character) {
    showNotification('❌ 没有可下载的角色数据', 'error');
    return;
  }

  const yaml = convertToYAML(character);
  const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.基本信息.名字 || '角色'}_${Date.now()}.yaml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('%c[DOWNLOAD] YAML 已下载', 'color: #00ff41;');
  showNotification('✅ YAML 文件已下载', 'success');
}

// 转换为 YAML 格式
function convertToYAML(obj, indent = 0) {
  let yaml = '';
  const spaces = '  '.repeat(indent);

  for (const key in obj) {
    const value = obj[key];

    if (value === null || value === undefined || value === '') {
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) continue;
      yaml += `${spaces}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object') {
          yaml += `${spaces}  -\n${convertToYAML(item, indent + 2)}`;
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      });
    } else {
      const valueStr =
        typeof value === 'string' && value.includes('\n')
          ? `|\n${spaces}  ${value.replace(/\n/g, `\n${spaces}  `)}`
          : value;
      yaml += `${spaces}${key}: ${valueStr}\n`;
    }
  }

  return yaml;
}

// ============================================
// 草稿管理
// ============================================
function saveDraft() {
  const formData = new FormData(document.getElementById('characterForm'));
  const draft = {
    step: currentStep,
    data: Object.fromEntries(formData),
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    console.log('%c[DRAFT] 草稿已自动保存', 'color: #00d9ff;');
  } catch (e) {
    console.error('保存草稿失败:', e);
  }
}

function loadDraft() {
  try {
    const draftStr = localStorage.getItem(STORAGE_KEY);
    if (!draftStr) return;

    const draft = JSON.parse(draftStr);
    const age = Date.now() - draft.timestamp;

    // 如果草稿超过7天，忽略
    if (age > 7 * 24 * 60 * 60 * 1000) {
      clearDraft();
      return;
    }

    // 询问是否恢复草稿
    if (confirm('检测到未完成的角色草稿，是否恢复？\n\n草稿时间：' + new Date(draft.timestamp).toLocaleString())) {
      // 恢复表单数据
      for (const [key, value] of Object.entries(draft.data)) {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = true;
          } else {
            input.value = value;
          }
        }
      }

      // 恢复步骤
      currentStep = draft.step || 1;
      updateProgressBar();
      showFormSection(currentStep);
      updateButtonVisibility();

      // 更新头像预览
      const avatarInput = document.getElementById('avatar');
      if (avatarInput && avatarInput.value) {
        updateAvatarPreview(avatarInput.value);
      }

      // 更新属性值显示
      document.querySelectorAll('.stat-item input[type="range"]').forEach(input => {
        const valueSpan = input.parentElement.querySelector('.stat-value');
        valueSpan.textContent = input.value;
        updateStatColor(input, valueSpan);
      });

      showNotification('✅ 草稿已恢复', 'success');
      console.log('%c[DRAFT] 草稿已恢复', 'color: #00ff41;');
    } else {
      clearDraft();
    }
  } catch (e) {
    console.error('加载草稿失败:', e);
    clearDraft();
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('%c[DRAFT] 草稿已清除', 'color: #8b95b0;');
  } catch (e) {
    console.error('清除草稿失败:', e);
  }
}

// ============================================
// 重置表单
// ============================================
function resetForm() {
  if (!confirm('⚠️ 确定要重新创建角色吗？\n当前数据将会丢失。')) {
    return;
  }

  console.log('%c[RESET] 重置表单', 'color: #ff9500;');

  // 重置表单
  document.getElementById('characterForm').reset();

  // 重置步骤
  currentStep = 1;
  updateProgressBar();
  showFormSection(1);
  updateButtonVisibility();

  // 显示表单，隐藏结果
  document.getElementById('characterForm').style.display = 'block';
  document.getElementById('resultSection').style.display = 'none';

  // 清空头像预览
  document.getElementById('avatarPreview').innerHTML = '';

  // 重置属性值显示
  document.querySelectorAll('.stat-value').forEach(span => {
    span.textContent = '50';
    span.style.color = 'var(--cyber-green)';
  });

  // 清空技能列表，保留第一个
  const skillsList = document.getElementById('skillsList');
  skillsList.innerHTML = `
    <div class="skill-item">
      <input type="text" placeholder="技能名称" name="skillName[]">
      <input type="number" placeholder="等级 (1-10)" name="skillLevel[]" min="1" max="10" value="1">
      <button type="button" class="btn-remove" onclick="removeSkill(this)">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  // 清除草稿
  clearDraft();

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });

  showNotification('✅ 表单已重置', 'success');
}

// ============================================
// 通知提示
// ============================================
function showNotification(message, type = 'info') {
  // 如果已有通知，先移除
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: var(--bg-card);
    border: 2px solid var(--${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'error' ? 'danger' : 'info'});
    color: var(--text-primary);
    border-radius: 0;
    z-index: 10000;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 0 20px var(--${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'error' ? 'danger' : 'info'});
    animation: slideIn 0.3s, slideOut 0.3s 2.7s;
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

  @keyframes glitchOut {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; transform: translateX(-5px); }
  }
`;
document.head.appendChild(style);

// ============================================
// 进度条步骤点击跳转
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  const progressSteps = document.querySelectorAll('.progress-step');

  progressSteps.forEach(step => {
    step.addEventListener('click', function () {
      const targetStep = parseInt(this.dataset.step);

      // 只允许跳转到已完成的步骤或下一步
      if (targetStep <= currentStep + 1) {
        // 验证当前步骤
        if (targetStep > currentStep && !validateCurrentStep()) {
          return;
        }

        currentStep = targetStep;
        updateProgressBar();
        showFormSection(currentStep);
        updateButtonVisibility();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        console.log(`%c[JUMP] 跳转到步骤 ${targetStep}`, 'color: #00d9ff;');
      } else {
        showNotification('⚠️ 请先完成前面的步骤', 'warning');
      }
    });
  });
});

// ============================================
// 导出到全局作用域（供 HTML 调用）
// ============================================
window.changeStep = changeStep;
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.generateCharacter = generateCharacter;
window.copyToClipboard = copyToClipboard;
window.downloadJSON = downloadJSON;
window.downloadYAML = downloadYAML;
window.resetForm = resetForm;

console.log('%c[ SYSTEM READY ]', 'color: #00ff41; font-weight: bold; font-size: 14px;');
