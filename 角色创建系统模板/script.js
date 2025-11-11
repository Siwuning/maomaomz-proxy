// 全局变量
let currentStep = 1;
const totalSteps = 5;

// 初始化
document.addEventListener('DOMContentLoaded', function () {
  updateButtonVisibility();
  initializeEventListeners();
});

// 初始化事件监听器
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
    });
  });

  // 表单验证
  const form = document.getElementById('characterForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
  });
}

// 更改步骤
function changeStep(direction) {
  const newStep = currentStep + direction;

  if (newStep < 1 || newStep > totalSteps) {
    return;
  }

  // 如果是前进，验证当前步骤
  if (direction > 0 && !validateCurrentStep()) {
    return;
  }

  // 更新当前步骤
  currentStep = newStep;

  // 更新进度条
  updateProgressBar();

  // 显示对应的表单部分
  showFormSection(currentStep);

  // 更新按钮可见性
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
      alert(`请填写必填项：${input.previousElementSibling.textContent}`);
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

  // 上一步按钮
  prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';

  // 下一步和提交按钮
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'flex';
  } else {
    nextBtn.style.display = 'flex';
    submitBtn.style.display = 'none';
  }
}

// 更新头像预览
function updateAvatarPreview(url) {
  const preview = document.getElementById('avatarPreview');

  if (url.trim()) {
    preview.innerHTML = `<img src="${url}" alt="角色头像" onerror="this.style.display='none'">`;
  } else {
    preview.innerHTML = '';
  }
}

// 添加技能
function addSkill() {
  const skillsList = document.getElementById('skillsList');
  const skillItem = document.createElement('div');
  skillItem.className = 'skill-item';
  skillItem.innerHTML = `
        <input type="text" placeholder="技能名称" name="skillName[]">
        <input type="number" placeholder="等级 (1-10)" name="skillLevel[]" min="1" max="10">
        <button type="button" class="btn-remove" onclick="removeSkill(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
  skillsList.appendChild(skillItem);
}

// 移除技能
function removeSkill(button) {
  const skillItem = button.parentElement;
  skillItem.remove();
}

// 生成角色数据
function generateCharacter() {
  if (!validateCurrentStep()) {
    return;
  }

  const character = {
    基本信息: {
      名字: document.getElementById('name').value,
      年龄: parseInt(document.getElementById('age').value) || null,
      性别: document.getElementById('gender').value,
      种族: document.getElementById('race').value,
      职业: document.getElementById('occupation').value,
      称号: document.getElementById('nickname').value,
      头像: document.getElementById('avatar').value,
    },
    外貌特征: {
      身高: parseInt(document.getElementById('height').value) || null,
      体重: parseInt(document.getElementById('weight').value) || null,
      体型: document.getElementById('build').value,
      发色: document.getElementById('hairColor').value,
      发型: document.getElementById('hairStyle').value,
      瞳色: document.getElementById('eyeColor').value,
      特殊特征: document.getElementById('features').value,
      常穿服装: document.getElementById('clothing').value,
    },
    性格特点: {
      性格类型: getSelectedTags('personality'),
      性格描述: document.getElementById('personalityDesc').value,
      喜好: document.getElementById('likes').value,
      厌恶: document.getElementById('dislikes').value,
      恐惧: document.getElementById('fears').value,
    },
    背景故事: {
      出生地: document.getElementById('birthplace').value,
      家庭背景: document.getElementById('family').value,
      成长经历: document.getElementById('backstory').value,
      行动动机: document.getElementById('motivation').value,
      秘密: document.getElementById('secrets').value,
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
      特殊能力: document.getElementById('specialAbility').value,
      弱点: document.getElementById('weaknesses').value,
    },
    创建时间: new Date().toLocaleString('zh-CN'),
  };

  // 显示结果
  displayResult(character);
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

// 显示结果
function displayResult(character) {
  const resultSection = document.getElementById('resultSection');
  const resultOutput = document.getElementById('resultOutput');

  // 隐藏表单
  document.getElementById('characterForm').style.display = 'none';

  // 显示结果
  resultSection.style.display = 'block';
  resultOutput.textContent = JSON.stringify(character, null, 2);

  // 保存到全局变量
  window.currentCharacter = character;

  // 滚动到结果区域
  resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 复制到剪贴板
function copyToClipboard() {
  const resultOutput = document.getElementById('resultOutput');
  const text = resultOutput.textContent;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert('✅ 已复制到剪贴板！');
    })
    .catch(err => {
      console.error('复制失败:', err);
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ 已复制到剪贴板！');
    });
}

// 下载 JSON
function downloadJSON() {
  const character = window.currentCharacter;
  const json = JSON.stringify(character, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.基本信息.名字 || '角色'}_角色卡.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 下载 YAML
function downloadYAML() {
  const character = window.currentCharacter;
  const yaml = convertToYAML(character);
  const blob = new Blob([yaml], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.基本信息.名字 || '角色'}_角色卡.yaml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

// 重置表单
function resetForm() {
  if (confirm('确定要重新创建角色吗？当前数据将会丢失。')) {
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
    });

    // 清空技能列表，保留第一个
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = `
            <div class="skill-item">
                <input type="text" placeholder="技能名称" name="skillName[]">
                <input type="number" placeholder="等级 (1-10)" name="skillLevel[]" min="1" max="10">
                <button type="button" class="btn-remove" onclick="removeSkill(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// 进度条步骤点击跳转
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
      }
    });
  });
});
