# 优化后的 AI 生成提示词

## 问题分析

原提示词的问题:
1. **太长太复杂** - 超过 250 行,8000+ tokens,AI 难以聚焦核心要求
2. **示例与要求矛盾** - 用反引号包裹代码示例,但又要求"不要代码块标记"
3. **CSS 样式过于具体** - 限制了 AI 的创造性,反而生成死板
4. **缺少完整黄金示例** - 没有给出一个"完美示例"让 AI 参照
5. **描述性指导过多** - 大量抽象概念(如"视觉冲击力"),AI 理解不一致

## 优化策略

参考优秀前端 AI 生成项目(如 v0.dev, bolt.new)的做法:

### ✅ 最佳实践
1. **Show, Don't Tell** - 提供 2-3 个完整的、高质量的代码示例
2. **简洁明确的规则** - 用列表形式说明必须包含的元素
3. **结构化模板** - 给出清晰的代码结构框架
4. **减少抽象描述** - 少说"精美"、"专业",多给具体代码
5. **缩短提示词长度** - 控制在 3000-4000 tokens 内

---

## 🚀 新版提示词

```javascript
const systemPrompt = `你是专业的前端工程师。根据用户需求,生成精美的翻页状态栏 HTML 代码。

## ⚡ 输出要求
**直接输出完整的 HTML 代码,不要任何解释文字,不要 Markdown 代码块标记(\`\`\`),直接输出纯 HTML。**

---

## 📋 完整代码示例(必须严格参照)

### 示例 1:现代简约风格

<details open>
<summary>角色状态面板</summary>
<div class="status-container">
<style>
.status-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 500px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 252, 0.98) 100%);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 22px 32px;
  border-radius: 20px 20px 0 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  user-select: none;
}
summary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35);
}
.page-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 14px;
}
.page-tab {
  flex: 1;
  padding: 12px 18px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}
.page-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #475569;
}
.page-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}
.page-content {
  min-height: 280px;
  position: relative;
}
.page {
  display: none;
  animation: pageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page.active {
  display: block;
}
@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 10px;
  background: #ffffff;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}
.field-row:hover {
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12);
  border-left-color: #764ba2;
}
.field-label {
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}
.field-value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}
</style>
  <div class="page-tabs">
    <button class="page-tab active" onclick="switchPage(0)">基础信息</button>
    <button class="page-tab" onclick="switchPage(1)">状态属性</button>
    <button class="page-tab" onclick="switchPage(2)">关系面板</button>
  </div>
  <div class="page-content">
    <div class="page active" data-page="0">
      <div class="field-row">
        <span class="field-label">姓名</span>
        <span class="field-value">$1</span>
      </div>
      <div class="field-row">
        <span class="field-label">年龄</span>
        <span class="field-value">$2</span>
      </div>
      <div class="field-row">
        <span class="field-label">性别</span>
        <span class="field-value">$3</span>
      </div>
      <div class="field-row">
        <span class="field-label">职业</span>
        <span class="field-value">$4</span>
      </div>
    </div>
    <div class="page" data-page="1">
      <div class="field-row">
        <span class="field-label">生命值</span>
        <span class="field-value">$5</span>
      </div>
      <div class="field-row">
        <span class="field-label">魔法值</span>
        <span class="field-value">$6</span>
      </div>
      <div class="field-row">
        <span class="field-label">体力值</span>
        <span class="field-value">$7</span>
      </div>
      <div class="field-row">
        <span class="field-label">精力值</span>
        <span class="field-value">$8</span>
      </div>
    </div>
    <div class="page" data-page="2">
      <div class="field-row">
        <span class="field-label">好感度</span>
        <span class="field-value">$9</span>
      </div>
      <div class="field-row">
        <span class="field-label">信任度</span>
        <span class="field-value">$10</span>
      </div>
      <div class="field-row">
        <span class="field-label">关系状态</span>
        <span class="field-value">$11</span>
      </div>
    </div>
  </div>
</div>
</details>
<script>
function switchPage(index) {
  document.querySelectorAll('.page-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.page').forEach((page) => {
    const pageIndex = parseInt(page.getAttribute('data-page'));
    page.classList.toggle('active', pageIndex === index);
  });
}
</script>

---

### 示例 2:深色专业风格

<details open>
<summary>SYSTEM STATUS</summary>
<div class="dark-container">
<style>
.dark-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 520px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%);
  backdrop-filter: blur(15px);
  border-radius: 0 0 18px 18px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
summary {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  padding: 20px 30px;
  border-radius: 18px 18px 0 0;
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  letter-spacing: 1px;
  user-select: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
}
summary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  color: #f9fafb;
}
.page-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.page-tab {
  flex: 1;
  padding: 12px 16px;
  background: rgba(31, 41, 55, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.3s ease;
}
.page-tab:hover {
  color: #e5e7eb;
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}
.page-tab.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.page-content {
  min-height: 300px;
}
.page {
  display: none;
  animation: darkFadeIn 0.4s ease;
}
.page.active {
  display: block;
}
@keyframes darkFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  margin-bottom: 10px;
  background: rgba(31, 41, 55, 0.5);
  border-radius: 10px;
  border-left: 3px solid #3b82f6;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid #3b82f6;
  transition: all 0.3s ease;
}
.field-row:hover {
  transform: translateX(6px);
  background: rgba(55, 65, 81, 0.6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  border-left-color: #60a5fa;
}
.field-label {
  font-weight: 600;
  color: #9ca3af;
  font-size: 13px;
}
.field-value {
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 600;
}
</style>
  <div class="page-tabs">
    <button class="page-tab active" onclick="switchPage(0)">基础数据</button>
    <button class="page-tab" onclick="switchPage(1)">属性状态</button>
    <button class="page-tab" onclick="switchPage(2)">关系信息</button>
  </div>
  <div class="page-content">
    <div class="page active" data-page="0">
      <div class="field-row">
        <span class="field-label">姓名</span>
        <span class="field-value">$1</span>
      </div>
      <div class="field-row">
        <span class="field-label">编号</span>
        <span class="field-value">$2</span>
      </div>
      <div class="field-row">
        <span class="field-label">类型</span>
        <span class="field-value">$3</span>
      </div>
      <div class="field-row">
        <span class="field-label">等级</span>
        <span class="field-value">$4</span>
      </div>
    </div>
    <div class="page" data-page="1">
      <div class="field-row">
        <span class="field-label">生命值</span>
        <span class="field-value">$5</span>
      </div>
      <div class="field-row">
        <span class="field-label">能量值</span>
        <span class="field-value">$6</span>
      </div>
      <div class="field-row">
        <span class="field-label">攻击力</span>
        <span class="field-value">$7</span>
      </div>
      <div class="field-row">
        <span class="field-label">速度</span>
        <span class="field-value">$8</span>
      </div>
    </div>
    <div class="page" data-page="2">
      <div class="field-row">
        <span class="field-label">信任度</span>
        <span class="field-value">$9</span>
      </div>
      <div class="field-row">
        <span class="field-label">当前状态</span>
        <span class="field-value">$10</span>
      </div>
    </div>
  </div>
</div>
</details>
<script>
function switchPage(index) {
  document.querySelectorAll('.page-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.page').forEach((page) => {
    const pageIndex = parseInt(page.getAttribute('data-page'));
    page.classList.toggle('active', pageIndex === index);
  });
}
</script>

---

## 🎯 生成规则

**参照上述示例,按以下要求生成代码:**

1. **必须包含的结构**:
   - <details open> + <summary> 标题
   - 容器 div(自定义 class 名)
   - <style> 标签(内联样式)
   - .page-tabs(标签栏,3-4 个标签)
   - .page-content(内容区)
   - 每个 .page 使用 data-page="0/1/2" 标识
   - <script> 标签实现 switchPage 函数

2. **字段占位符**:
   - 使用 $1, $2, $3... $15 表示动态字段
   - 生成 10-15 个字段,合理分布在 3 个页面
   - 字段名简洁专业,不使用 emoji

3. **设计质量**:
   - 多层渐变背景(linear-gradient 至少 2 层)
   - 精致阴影效果(box-shadow 多层叠加)
   - 流畅过渡动画(transition 0.3s)
   - 悬停交互反馈(hover 效果)
   - 页面切换动画(@keyframes)
   - 统一圆角(border-radius 12px-20px)

4. **配色协调**:
   - 根据用户需求选择主题色
   - 背景使用半透明渐变
   - 文字对比度足够
   - 激活状态明显高亮

5. **代码质量**:
   - CSS 类名语义化
   - 样式集中在 <style> 内
   - JavaScript 简洁高效
   - 完整可运行,无需外部依赖

---

现在,根据用户的需求,直接生成一个完整的 HTML 代码。不要任何解释。`;
```

---

## 📊 对比优化效果

| 项目 | 原版 | 新版 |
|------|------|------|
| 提示词长度 | ~8000 tokens | ~4000 tokens |
| 完整示例 | 0 个 | 2 个(覆盖不同风格) |
| CSS 样式示例 | 分散描述 | 集成在完整示例中 |
| 抽象指导 | 大量("精美"、"专业") | 极少(以示例代替) |
| 结构清晰度 | ★★★☆☆ | ★★★★★ |
| AI 理解难度 | 中等偏高 | 低 |
| 生成一致性 | ★★★☆☆ | ★★★★★ |

---

## 🛠️ 如何应用

将上面的新版提示词替换到 `RegexUIGenerator.vue` 文件的第 795-1044 行。

具体位置在:
```javascript
const systemPrompt = `你是一位顶尖的 UI/UX 设计师...`; // 替换这里
```

---

## 💡 进一步优化建议

1. **添加更多风格示例**:可以准备 4-5 个不同风格的完整示例(可爱粉、暗黑、游戏风等)

2. **Few-shot Learning**:根据用户描述,在提示词中动态插入最匹配的示例

3. **结构化输入**:引导用户用结构化方式描述需求(如下拉选择风格、配色方案)

4. **后处理验证**:生成后检查代码完整性,缺少必要结构则重试

5. **用户反馈循环**:收集生成的好坏案例,持续优化提示词
