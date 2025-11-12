<template>
  <div class="tools-tab" style="padding: 25px !important; background: #1a1a1a !important">
    <!-- 变量结构生成器 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 16px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleExpanded('structure')"
        @mouseenter="(e: any) => (e.currentTarget.style.transform = 'translateY(-1px)')"
        @mouseleave="(e: any) => (e.currentTarget.style.transform = 'translateY(0)')"
      >
        <h4
          style="
            margin: 0;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >
          <i class="fa-solid fa-database" style="color: #4a9eff; font-size: 18px"></i>
          [InitVar] 变量结构生成器
        </h4>
        <i
          :class="expanded.structure ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease; font-size: 14px"
        ></i>
      </div>

      <div v-if="expanded.structure" class="tool-content">
        <div class="tool-instructions" style="margin-bottom: 15px">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #17a2b8"></i>
            生成符合 MVU Beta 规范的 <strong style="color: #4a9eff">[InitVar]</strong> 初始化数据。
          </p>
          <p
            style="
              margin: 0;
              color: #ffa500;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #ffa500;
            "
          >
            ⚠️ 重要：InitVar JSON 中<strong>不要包含 "stat_data" 根节点</strong>，系统会自动添加
          </p>
        </div>

        <!-- AI智能生成区域 -->
        <div
          style="
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          "
        >
          <h4 style="color: #667eea; font-size: 14px; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            AI 智能生成（推荐）
          </h4>

          <div class="form-group" style="margin: 0 0 12px 0">
            <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
              描述你的变量需求：
            </label>
            <textarea
              v-model="aiStructurePrompt"
              placeholder="例如：我需要一个角色属性系统，包含名字（字符串）、等级（数字，初始为1）、好感度（数字，范围-30到100）、背包（可扩展数组）、成就（可扩展对象）"
              rows="4"
              style="
                width: 100%;
                padding: 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                resize: vertical;
                line-height: 1.5;
                transition: all 0.2s ease;
              "
              @focus="(e: any) => (e.target.style.borderColor = '#667eea')"
              @blur="(e: any) => (e.target.style.borderColor = '#3a3a3a')"
            ></textarea>
          </div>

          <button
            class="ai-generate-btn"
            :disabled="isGeneratingAI || !aiStructurePrompt.trim()"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
              position: relative;
              overflow: hidden;
            "
            :style="{
              opacity: isGeneratingAI || !aiStructurePrompt.trim() ? 0.6 : 1,
              cursor: isGeneratingAI || !aiStructurePrompt.trim() ? 'not-allowed' : 'pointer',
            }"
            @click="handleAIGenerateStructure"
            @mouseenter="
              (e: any) => {
                if (!isGeneratingAI && aiStructurePrompt.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }
              }
            "
            @mouseleave="
              (e: any) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 12px rgba(102, 126, 234, 0.3)';
              }
            "
          >
            <div
              style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
              "
              class="shimmer-effect"
            ></div>
            <i
              class="fa-solid fa-wand-magic-sparkles"
              style="font-size: 14px; margin-right: 6px; position: relative; z-index: 1"
            ></i>
            <span style="position: relative; z-index: 1">{{ isGeneratingAI ? 'AI 生成中...' : 'AI 智能生成' }}</span>
          </button>

          <!-- AI 修改按钮 -->
          <button
            v-if="generatedStructure && originalStructurePrompt"
            style="
              margin-left: 12px;
              padding: 10px 20px;
              background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.3));
              border: 1px solid rgba(251, 191, 36, 0.4);
              border-radius: 8px;
              color: #fbbf24;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
            "
            @click="showStructureModifyDialog = true"
            @mouseenter="
              (e: any) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, rgba(251, 191, 36, 0.35), rgba(245, 158, 11, 0.45))';
                e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.35)';
              }
            "
            @mouseleave="
              (e: any) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.3))';
                e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.2)';
              }
            "
          >
            <i class="fa-solid fa-edit" style="margin-right: 6px"></i>
            AI 修改
          </button>

          <p style="color: #888; font-size: 11px; margin: 8px 0 0 0">
            💡 AI 会根据你的描述自动生成结构、选择类型、配置 $meta
          </p>
        </div>

        <div style="text-align: center; margin: 20px 0; position: relative">
          <span
            style="background: #1a1a1a; padding: 0 12px; color: #666; font-size: 12px; position: relative; z-index: 1"
            >或手动配置</span
          >
          <div
            style="
              position: absolute;
              top: 50%;
              left: 0;
              right: 0;
              height: 1px;
              background: rgba(255, 255, 255, 0.1);
              z-index: 0;
            "
          ></div>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            变量名称：
          </label>
          <input
            v-model="varName"
            type="text"
            placeholder="例如：角色、背包、技能"
            style="
              width: 100%;
              padding: 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: all 0.2s ease;
            "
            @focus="(e: any) => (e.target.style.borderColor = '#4a9eff')"
            @blur="(e: any) => (e.target.style.borderColor = '#3a3a3a')"
          />
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            子字段（每行一个，格式：字段名:类型:描述）：
          </label>
          <textarea
            v-model="subFields"
            placeholder="例如：&#10;好感度:number:[-30,100]之间，与角色交流时变化&#10;名字:string:角色名称&#10;背包:array:获得或使用物品时更新"
            rows="5"
            style="
              width: 100%;
              height: 120px;
              padding: 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              resize: vertical;
              font-family: 'Courier New', monospace;
              line-height: 1.5;
              transition: all 0.2s ease;
            "
            @focus="(e: any) => (e.target.style.borderColor = '#4a9eff')"
            @blur="(e: any) => (e.target.style.borderColor = '#3a3a3a')"
          ></textarea>
          <p style="color: #888; font-size: 11px; margin: 6px 0 0 0">💡 支持类型：number、string、array、object</p>
        </div>

        <button
          class="generate-btn"
          style="
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
          "
          @click="generateStructure"
          @mouseenter="
            (e: any) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }
          "
          @mouseleave="
            (e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 12px rgba(102, 126, 234, 0.3)';
            }
          "
        >
          <div
            style="
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
              transition: left 0.5s;
            "
            class="shimmer-effect"
          ></div>
          <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px; position: relative; z-index: 1"></i>
          <span style="position: relative; z-index: 1">生成 [InitVar] 结构</span>
        </button>

        <div v-if="generatedStructure" class="output-section">
          <h4 style="color: #4a9eff; font-size: 14px; margin-bottom: 10px">生成的 [InitVar] 结构：</h4>
          <div class="code-output">
            <pre>{{ generatedStructure }}</pre>
            <button class="copy-btn-abs" @click="copyGenerated">
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>

          <!-- 快捷操作 -->
          <div
            style="
              margin-top: 15px;
              padding: 12px;
              background: rgba(74, 158, 255, 0.05);
              border: 1px solid rgba(74, 158, 255, 0.2);
              border-radius: 8px;
            "
          >
            <p style="margin: 0 0 10px 0; color: #4a9eff; font-size: 12px; font-weight: 600">
              <i class="fa-solid fa-link"></i> 基于此结构继续生成：
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap">
              <button
                style="
                  flex: 1;
                  min-width: 140px;
                  padding: 8px 16px;
                  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3));
                  color: #10b981;
                  border: 1px solid rgba(16, 185, 129, 0.4);
                  border-radius: 6px;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.2s;
                "
                @click="autoGeneratePrompt"
                @mouseenter="
                  (e: any) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }
                "
                @mouseleave="
                  (e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                "
              >
                <i class="fa-solid fa-file-alt"></i> 生成 COT 提示词
              </button>
              <button
                style="
                  flex: 1;
                  min-width: 140px;
                  padding: 8px 16px;
                  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.3));
                  color: #f59e0b;
                  border: 1px solid rgba(245, 158, 11, 0.4);
                  border-radius: 6px;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.2s;
                "
                @click="exportWorldbook"
                @mouseenter="
                  (e: any) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  }
                "
                @mouseleave="
                  (e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                "
              >
                <i class="fa-solid fa-book"></i> 导出世界书 JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- COT 提示词生成器 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 16px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleExpanded('prompt')"
        @mouseenter="(e: any) => (e.currentTarget.style.transform = 'translateY(-1px)')"
        @mouseleave="(e: any) => (e.currentTarget.style.transform = 'translateY(0)')"
      >
        <h4
          style="
            margin: 0;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >
          <i class="fa-solid fa-file-code" style="color: #fbbf24; font-size: 18px"></i>
          COT 提示词生成器（6 步思维链）
        </h4>
        <i
          :class="expanded.prompt ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease; font-size: 14px"
        ></i>
      </div>

      <div v-if="expanded.prompt" class="tool-content">
        <div class="tool-instructions" style="margin-bottom: 15px">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #17a2b8"></i>
            生成适用于 MVU Beta 的 <strong style="color: #fbbf24">COT（思维链）提示词模板</strong>，包含 6 步分析流程。
          </p>
        </div>

        <!-- AI智能生成区域 -->
        <div
          style="
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.08));
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          "
        >
          <h4 style="color: #fbbf24; font-size: 14px; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            AI 智能生成（推荐）
          </h4>

          <div class="form-group" style="margin: 0 0 12px 0">
            <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
              描述你的变量系统和使用场景：
            </label>
            <textarea
              v-model="aiPromptDescription"
              placeholder="例如：我的角色卡有一个好感度系统和时间系统，需要 AI 在每次互动后更新时间和好感度"
              rows="4"
              style="
                width: 100%;
                padding: 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                resize: vertical;
                line-height: 1.5;
                transition: all 0.2s ease;
              "
              @focus="(e: any) => (e.target.style.borderColor = '#fbbf24')"
              @blur="(e: any) => (e.target.style.borderColor = '#3a3a3a')"
            ></textarea>
          </div>

          <button
            class="ai-generate-btn"
            :disabled="isGeneratingPrompt || !aiPromptDescription.trim()"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(251, 191, 36, 0.3);
              position: relative;
              overflow: hidden;
            "
            :style="{
              opacity: isGeneratingPrompt || !aiPromptDescription.trim() ? 0.6 : 1,
              cursor: isGeneratingPrompt || !aiPromptDescription.trim() ? 'not-allowed' : 'pointer',
            }"
            @click="handleAIGeneratePrompt"
            @mouseenter="
              (e: any) => {
                if (!isGeneratingPrompt && aiPromptDescription.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.4)';
                }
              }
            "
            @mouseleave="
              (e: any) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 12px rgba(251, 191, 36, 0.3)';
              }
            "
          >
            <div
              style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
              "
              class="shimmer-effect"
            ></div>
            <i
              class="fa-solid fa-wand-magic-sparkles"
              style="font-size: 14px; margin-right: 6px; position: relative; z-index: 1"
            ></i>
            <span style="position: relative; z-index: 1">{{
              isGeneratingPrompt ? 'AI 生成中...' : 'AI 智能生成'
            }}</span>
          </button>

          <!-- AI 修改按钮 -->
          <button
            v-if="generatedPrompt && originalPromptDescription"
            style="
              margin-left: 12px;
              padding: 10px 20px;
              background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.3));
              border: 1px solid rgba(251, 191, 36, 0.4);
              border-radius: 8px;
              color: #fbbf24;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
            "
            @click="showPromptModifyDialog = true"
            @mouseenter="
              (e: any) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, rgba(251, 191, 36, 0.35), rgba(245, 158, 11, 0.45))';
                e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.35)';
              }
            "
            @mouseleave="
              (e: any) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.3))';
                e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.2)';
              }
            "
          >
            <i class="fa-solid fa-edit" style="margin-right: 6px"></i>
            AI 修改
          </button>

          <p style="color: #888; font-size: 11px; margin: 8px 0 0 0">
            💡 AI 会根据你的描述自动生成完整的 6 步 COT 提示词
          </p>
        </div>

        <div style="text-align: center; margin: 20px 0; position: relative">
          <span
            style="background: #1a1a1a; padding: 0 12px; color: #666; font-size: 12px; position: relative; z-index: 1"
            >或手动配置</span
          >
          <div
            style="
              position: absolute;
              top: 50%;
              left: 0;
              right: 0;
              height: 1px;
              background: rgba(255, 255, 255, 0.1);
              z-index: 0;
            "
          ></div>
        </div>

        <div v-if="generatedStructure" class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            变量分类（用于 STEP 3，每行一个分类）：
          </label>
          <textarea
            v-model="variableCategories"
            placeholder="例如：&#10;基础信息 - 3 fields&#10;人物关系 - 2 fields&#10;重要记忆 - 1 field"
            rows="4"
            style="
              width: 100%;
              padding: 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              resize: vertical;
              font-family: 'Courier New', monospace;
              line-height: 1.5;
              transition: all 0.2s ease;
            "
            @focus="(e: any) => (e.target.style.borderColor = '#fbbf24')"
            @blur="(e: any) => (e.target.style.borderColor = '#3a3a3a')"
          ></textarea>
          <p style="color: #888; font-size: 11px; margin: 6px 0 0 0">💡 AI 会在 STEP 3 中按照这些分类逐个检查变量</p>
        </div>

        <button
          class="generate-btn"
          style="
            margin-top: 10px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
          "
          @click="generatePrompt"
          @mouseenter="
            (e: any) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }
          "
          @mouseleave="
            (e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 12px rgba(102, 126, 234, 0.3)';
            }
          "
        >
          <div
            style="
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
              transition: left 0.5s;
            "
            class="shimmer-effect"
          ></div>
          <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px; position: relative; z-index: 1"></i>
          <span style="position: relative; z-index: 1">生成 COT 提示词</span>
        </button>

        <div v-if="generatedPrompt" class="output-section">
          <h4 style="color: #fbbf24; font-size: 14px; margin-bottom: 10px">生成的 COT 提示词：</h4>
          <div class="code-output">
            <pre>{{ generatedPrompt }}</pre>
            <button class="copy-btn-abs" @click="copyPrompt">
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- AI 修改对话框 - 结构 -->
  <AIModifyDialog
    :show="showStructureModifyDialog"
    :is-modifying="isModifyingStructure"
    title="AI 修改 [InitVar] 结构"
    description="告诉 AI 你想如何修改当前的 MVU 结构"
    :examples="[
      '增加一个【健康值】字段，类型为 number',
      '删除【背包】字段',
      '将【好感度】的描述改为更详细的说明',
      '调整字段顺序，把【时间】放到最前面',
    ]"
    @close="showStructureModifyDialog = false"
    @confirm="modifyStructureWithAI"
  />

  <!-- AI 修改对话框 - 提示词 -->
  <AIModifyDialog
    :show="showPromptModifyDialog"
    :is-modifying="isModifyingPrompt"
    title="AI 修改 COT 提示词"
    description="告诉 AI 你想如何修改当前的提示词"
    :examples="[
      '在 STEP 2 中添加对场景变化的检查',
      '强调时间必须精确到分钟',
      '增加对特殊状态的处理说明',
      '简化 STEP 3 的分析步骤',
    ]"
    @close="showPromptModifyDialog = false"
    @confirm="modifyPromptWithAI"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import { normalizeApiEndpoint, useSettingsStore, filterApiParams } from '../settings';
import { getScriptIdSafe } from '../utils';
import AIModifyDialog from './AIModifyDialog.vue';

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const expanded = ref({
  structure: true,
  prompt: false,
});

function toggleExpanded(key: keyof typeof expanded.value) {
  expanded.value[key] = !expanded.value[key];
}

// AI生成相关
const aiStructurePrompt = ref('');
const isGeneratingAI = ref(false);
const aiPromptDescription = ref('');
const isGeneratingPrompt = ref(false);

// 原始输入（用于增量修改）
const originalStructurePrompt = ref('');
const originalPromptDescription = ref('');

// 修改对话框状态
const showStructureModifyDialog = ref(false);
const isModifyingStructure = ref(false);
const showPromptModifyDialog = ref(false);
const isModifyingPrompt = ref(false);

// 表单数据
const varName = ref('');
const subFields = ref('');
const generatedStructure = ref('');
const variableCategories = ref('');
const generatedPrompt = ref('');

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    window.toastr.success('已复制到剪贴板');
  });
}

function generateStructure() {
  if (!varName.value.trim()) {
    window.toastr.error('请输入变量名称');
    return;
  }

  const result: any = {
    $meta: {
      extensible: false,
      strictSet: true,
    },
  };

  result[varName.value] = parseSubFields();
  generatedStructure.value = JSON.stringify(result, null, 2);
}

function parseSubFields(): any {
  const lines = subFields.value.split('\n').filter(l => l.trim());
  const obj: any = {};

  lines.forEach(line => {
    const parts = line.split(':').map(s => s.trim());
    const name = parts[0];
    const type = parts[1] || 'string';
    const desc = parts[2] || '描述...';

    if (!name) return;

    if (type === 'number') {
      obj[name] = [0, desc];
    } else if (type === 'string') {
      obj[name] = ['', desc];
    } else if (type === 'array') {
      obj[name] = [[], desc];
    } else if (type === 'object') {
      obj[name] = [{}, desc];
    } else {
      obj[name] = [null, desc];
    }
  });

  return obj;
}

function copyGenerated() {
  copyToClipboard(generatedStructure.value);
}

// AI智能生成结构
async function handleAIGenerateStructure() {
  if (!aiStructurePrompt.value.trim()) {
    window.toastr.error('请输入需求描述');
    return;
  }

  if (!settings.value.api_endpoint || !settings.value.api_key) {
    window.toastr.error('请先在设置页面配置 API 端点和 API Key');
    return;
  }

  // 保存原始输入（用于增量修改）
  originalStructurePrompt.value = aiStructurePrompt.value;

  isGeneratingAI.value = true;

  try {
    const systemPrompt = `你是 MVU Beta 变量系统专家，负责生成精确、实用的 [InitVar] 初始化数据。

# 核心格式规范

## ⚠️ 关键规则（必须严格遵守）
1. **不包含 "stat_data" 根节点**（系统会自动添加）
2. **所有字段格式**: \`[默认值, "描述"]\`（数组格式，两个元素）
3. **$meta 位置**: 必须在 JSON 根级别（与变量名同级）
4. **字符串要求**: 必须在一行内，不能换行
5. **描述长度**: 15-20字以内，简洁准确

## JSON 结构模板
\`\`\`json
{
  "$meta": {
    "extensible": false,
    "strictSet": true
  },
  "变量分组名": {
    "字段名1": [默认值, "字段用途说明"],
    "字段名2": [默认值, "字段用途说明"]
  }
}
\`\`\`

---

# 类型选择指南

## 1️⃣ number（数字）
**何时使用**：
- 计数、等级、属性值（如：好感度、金币）
- 时间戳、进度值
- 任何需要加减运算的值

**格式**: \`[初始数字, "描述"]\`
**示例**:
- \`"好感度": [0, "与角色的亲密程度，-30到100"]\`
- \`"等级": [1, "当前等级，影响解锁内容"]\`
- \`"金币": [100, "可用于购买物品"]\`

## 2️⃣ string（字符串）
**何时使用**：
- 名称、状态、描述性文本
- 时间（如 "10:00"）、地点
- 单选状态（如 "进行中"/"已完成"）

**格式**: \`["初始文本", "描述"]\`
**示例**:
- \`"当前状态": ["空闲", "角色当前的行为状态"]\`
- \`"时间": ["09:00", "故事中的当前时间"]\`
- \`"关系": ["陌生人", "与user的关系定位"]\`

## 3️⃣ array（数组）
**何时使用**：
- 列表、集合（如：背包、成就列表）
- 需要添加/删除元素的内容
- 多个同类型数据

**格式**: \`[[], "描述"]\` 或 \`[[示例项], "描述"]\`
**示例**:
- \`"背包": [[], "角色拥有的物品列表"]\`
- \`"成就": [["新手"], "已解锁的成就"]\`
- \`"记忆片段": [[], "重要的记忆事件"]\`

## 4️⃣ object（对象）
**何时使用**：
- 键值对数据（如：物品→数量）
- 复杂的嵌套数据
- 需要动态添加属性的结构

**格式**: \`[{}, "描述"]\` 或 \`[{"示例键": "示例值"}, "描述"]\`
**示例**:
- \`"物品数量": [{"苹果": 3}, "物品名与数量的映射"]\`
- \`"关系网": [{}, "NPC名与好感度的映射"]\`

---

# 命名规范

## ✅ 好的命名
- **简洁明确**: "好感度"、"时间"、"背包"
- **中文优先**: 便于理解和使用
- **符合语境**: 与角色卡/游戏设定一致

## ❌ 避免的命名
- 过于抽象: "数据1"、"值A"
- 过长: "角色与玩家之间的好感度数值"
- 英文混杂: "favor_value"（除非必要）

---

# 描述编写规范

## ✅ 好的描述（15-20字）
- "与角色的亲密程度，-30到100"
- "故事中的当前时间，格式HH:MM"
- "角色拥有的物品列表，可增删"
- "当前所在位置，影响剧情走向"

## ❌ 避免的描述
- 太短: "好感度"（无信息量）
- 太长: "这是一个用于记录玩家与角色之间的情感联系强度的数值变量，范围..."
- 无意义: "描述..."、"数据"

---

# 完整示例

## 示例1：角色属性系统
\`\`\`json
{
  "$meta": {
    "extensible": false,
    "strictSet": true
  },
  "角色": {
    "姓名": ["未命名", "角色的名字"],
    "等级": [1, "当前等级，影响技能解锁"],
    "好感度": [0, "与user的亲密度，-30到100"],
    "状态": ["正常", "当前的身体/精神状态"],
    "背包": [[], "拥有的物品列表"],
    "成就": [{}, "已解锁成就与解锁时间"]
  }
}
\`\`\`

## 示例2：时间与地点系统
\`\`\`json
{
  "$meta": {
    "extensible": false,
    "strictSet": true
  },
  "世界": {
    "时间": ["09:00", "故事中的当前时间"],
    "日期": ["2024年1月1日", "当前日期"],
    "地点": ["起始镇", "角色所在的位置"],
    "天气": ["晴朗", "当前天气状况"],
    "已完成任务": [[], "完成的任务列表"]
  }
}
\`\`\`

---

# 最终要求

1. **只输出 JSON**，不要任何解释或注释
2. **确保格式正确**：字符串在一行内，无尾随逗号
3. **变量名有意义**：符合用户需求的实际场景
4. **类型选择准确**：根据用途选择最合适的类型
5. **描述精准简洁**：15-20字，说清楚用途和变化规则

现在开始根据用户需求生成 [InitVar] JSON。`;

    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
    // 过滤 API 参数，确保兼容不同的服务提供商
    const requestPayload = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `需求：${aiStructurePrompt.value}\n\n请生成 [InitVar] JSON。` },
      ],
      temperature: settings.value.temperature || 0.7,
      max_tokens: settings.value.max_tokens || 4000,
    };

    const filteredPayload = filterApiParams(requestPayload, settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredPayload),
    });

    // 先读取响应文本
    const responseText = await response.text();

    if (!response.ok) {
      // 尝试解析错误信息
      let errorMessage = `API 错误: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error.message || JSON.stringify(errorData.error)}`;
        } else if (errorData.message) {
          errorMessage = `${errorMessage} - ${errorData.message}`;
        } else {
          errorMessage = `${errorMessage} - ${JSON.stringify(errorData)}`;
        }
      } catch (e) {
        errorMessage = `${errorMessage} - ${responseText.slice(0, 200)}`;
      }
      console.error('API 请求失败:', errorMessage);
      console.error('请求 URL:', settings.value.api_endpoint);
      console.error(
        '请求体:',
        JSON.stringify(
          {
            model: settings.value.model,
            messages: [
              { role: 'system', content: systemPrompt.substring(0, 100) + '...' },
              { role: 'user', content: `需求：${aiStructurePrompt.value.substring(0, 100)}...` },
            ],
            temperature: settings.value.temperature || 0.7,
            max_tokens: settings.value.max_tokens || 4000,
          },
          null,
          2,
        ),
      );
      throw new Error(errorMessage);
    }

    // 解析成功响应
    const data = JSON.parse(responseText);
    // 尝试从不同的响应格式中提取内容
    let result = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      result = data.choices[0].message.content || '';
    } else if (data.data && data.data.choices && data.data.choices[0]) {
      // 某些 API 可能返回 data.data.choices 格式
      result = data.data.choices[0].message?.content || '';
    } else if (data.content) {
      result = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
    }

    console.log('AI 返回内容:', result);

    // 提取 JSON
    let jsonText = result;

    // 移除代码块标记
    jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*$/g, '');

    // 提取第一个 JSON 对象（可能不完整）
    const jsonMatch = jsonText.match(/\{[\s\S]*$/);
    if (!jsonMatch) {
      throw new Error('未找到 JSON 对象');
    }

    jsonText = jsonMatch[0];

    // 尝试补全不完整的 JSON
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    let lastValidPos = jsonText.length;

    for (let i = 0; i < jsonText.length; i++) {
      const char = jsonText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !inString) {
        inString = true;
        continue;
      } else if (char === '"' && inString) {
        inString = false;
        continue;
      }

      if (inString) continue;

      if (char === '{') bracketCount++;
      else if (char === '}') bracketCount--;

      if (bracketCount === 0) {
        lastValidPos = i + 1;
        break;
      }
    }

    jsonText = jsonText.substring(0, lastValidPos);

    // 如果括号不匹配，尝试补全
    if (bracketCount > 0) {
      console.warn(`JSON 不完整，缺少 ${bracketCount} 个闭合括号，尝试补全...`);
      jsonText += '}'.repeat(bracketCount);
    }

    // 清理 JSON
    // 移除尾随逗号
    jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
    // 移除注释
    jsonText = jsonText.replace(/\/\/[^\n]*/g, '');
    jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error('JSON 解析失败，原始内容:', jsonText);
      throw new Error(`JSON 解析失败: ${(e as Error).message}。请让 AI 输出正确的 JSON（字符串在一行内，无尾随逗号）`);
    }
    const varNameParsed = Object.keys(parsed).find(k => k !== '$meta') || 'myVar';
    varName.value = varNameParsed;

    const varData = parsed[varNameParsed] || {};
    const fields: string[] = [];

    for (const key in varData) {
      if (key === '$meta') continue;
      const value = varData[key];
      if (Array.isArray(value) && value.length === 2) {
        const val = value[0];
        const type =
          typeof val === 'number'
            ? 'number'
            : typeof val === 'string'
              ? 'string'
              : Array.isArray(val)
                ? 'array'
                : 'object';
        const desc = value[1] || '描述...';
        fields.push(`${key}:${type}:${desc}`);
      }
    }

    subFields.value = fields.join('\n');
    generatedStructure.value = JSON.stringify(parsed, null, 2);
    window.toastr.success('AI 生成成功！');
  } catch (error: any) {
    console.error('AI生成失败:', error);
    window.toastr.error(`AI生成失败: ${error.message}`);
  } finally {
    isGeneratingAI.value = false;
  }
}

function autoGeneratePrompt() {
  if (!generatedStructure.value) {
    window.toastr.error('请先生成 [InitVar] 结构');
    return;
  }

  try {
    const structure = JSON.parse(generatedStructure.value);
    const varNameParsed = Object.keys(structure).find(k => k !== '$meta') || 'myVar';

    const varData = structure[varNameParsed] || {};
    let fieldCount = 0;

    for (const key in varData) {
      if (key === '$meta') continue;
      fieldCount++;
    }

    variableCategories.value = `${varNameParsed} - ${fieldCount} fields`;
    expanded.value.prompt = true;
    generatePrompt();
    window.toastr.success('已基于结构自动生成 COT 提示词');

    setTimeout(() => {
      const promptSection = document.querySelector('.tool-section:nth-child(2)');
      promptSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  } catch (error: any) {
    console.error('生成提示词失败:', error);
    window.toastr.error('生成失败，请检查变量结构格式');
  }
}

function generatePrompt() {
  const categories = variableCategories.value.trim() || '变量分类 - X fields';

  const promptTemplate = `<%_ setLocalVar('initialized_lorebooks.-YourLorebook[0]', true); _%>
【变量更新】
在所有文本的最后，进行变量更新。

以下是故事中需要追踪的关键变量，当前状态以这些变量的值为准。

<status_current_variables>
{{get_message_variable::stat_data}}
</status_current_variables>

严格按照以下规则和格式进行输出，并确定每一个变量是否需要更新，不要遗漏：

rule:
  description:
    - Output update analysis at the end of response
    - Variable updates are omitted in context but you must still add them
    - **CRITICAL**: For MVU format [value, description], ALWAYS use [0] suffix to access the value part
    - 4 commands available: \\\`_.set\\\` (2-3 args), \\\`_.insert\\\` (2-3 args), \\\`_.remove\\\` (1-2 args), \\\`_.add\\\` (2 args)
    - **RECOMMENDED**: Use \\\`_.insert\\\` instead of \\\`_.assign\\\`
    - strictSet enabled: [0] suffix is mandatory for all value access

  command_usage:
    - \\\`_.set('path[0]', old?, new);//reason\\\` - Replace value
    - \\\`_.add('path[0]', delta);//reason\\\` - Add/subtract numbers only
    - \\\`_.insert('path[0]', value);//reason\\\` - Add to array end
    - \\\`_.insert('path[0]', index, value);//reason\\\` - Insert to array at position
    - \\\`_.insert('path', key, value);//reason\\\` - Add key-value to object
    - \\\`_.remove('path[0]', value);//reason\\\` - Remove from array/object

  analysis:
    You MUST follow this Chain-of-Thought (COT) analysis process step by step:

    **STEP 1: Scene Analysis (50 words max, IN ENGLISH)**
    - Identify current scene/stage/phase
    - Describe what happened
    - Determine what changes occurred (time/location/status/progress)

    **STEP 2: Time & Key Status Check**
    - Extract current time/status from story context
    - Read key variables from <status_current_variables>
    - Calculate changes
    - Decision: What needs to be updated?

    **STEP 3: Systematic Variable Review (check EVERY variable category)**
    Go through each variable category systematically and mark Y or N:

    ${categories}:
      - 变量1[0]: [Y/N] - explain
      - 变量2[0]: [Y/N] - explain

    **STEP 4: Command Selection**
    For each variable marked Y, determine which command to use

    **STEP 5: Analyze Other Variable Systems**
    - stat_data detailed COT: COMPLETED
    - Other variable groups? [YES/NO]

    **STEP 6: Final Validation Checklist**
    - All [0] suffixes present? [YES/NO]
    - All Y variables have corresponding commands? [YES/NO]
    - All commands have clear Chinese comments? [YES/NO]

  format: |-
    <UpdateVariable>
        <ThinkingProcess>
            **STEP 1: Scene Analysis**
            [50 words]

            **STEP 2: Time & Key Status Check**
            - Current status: ...
            - Stored variable[0]: ...
            - Changes: ...
            - Update decision: ...

            **STEP 3: Variable Review (stat_data)**
            [List categories with Y/N]

            **STEP 4: Command Selection**
            [For each Y variable, state which command]

            **STEP 5: Other Systems**
            - stat_data COT: COMPLETED
            - Other groups? NO

            **STEP 6: Final Check**
            - [0] suffixes? YES
            - All Y have commands? YES
            - Chinese comments? YES
        </ThinkingProcess>

        _.set('path[0]', old?, new);//reason
        _.add('path[0]', delta);//reason
        _.insert('path[0]', value);//reason
        _.remove('path[0]', value);//reason
    </UpdateVariable>

  example: |-
    <UpdateVariable>
        <ThinkingProcess>
            **STEP 1: Scene Analysis**
            User and character had conversation at library. User helped find a book. Time advanced from 10:00 to 10:30. Character's impression improved.

            **STEP 2: Time & Key Status Check**
            - Current time: 10:30
            - Stored 时间[0]: "10:00"
            - Time passed: 30 minutes
            - Update decision: Time, Favor

            **STEP 3: Variable Review (stat_data)**
            基础信息 - 3 fields:
              - 时间[0]: Y - Time advanced
              - 日期[0]: N - Same day
              - 当前位置[0]: N - Still at library

            人物关系 - 1 field:
              - 好感度[0]: Y - Positive interaction

            **STEP 4: Command Selection**
            - 时间: use _.set
            - 好感度: use _.add

            **STEP 5: Other Systems**
            - stat_data COT: COMPLETED
            - Other groups? NO

            **STEP 6: Final Check**
            - [0] suffixes? YES
            - All Y have commands? YES
            - Chinese comments? YES
        </ThinkingProcess>

        _.set('时间[0]', '10:00', '10:30');//时间推进30分钟
        _.add('角色.好感度[0]', 3);//愉快的交流，好感度小幅提升
    </UpdateVariable>

  specific_rules:
    - 时间推进：每次互动后更新具体时间，使用 _.set 更新
    - 状态切换：当状态/阶段切换时，必须更新对应的状态变量
    - 计数器：使用 _.add 增加或减少计数
    - 数组操作：添加元素必须用 _.insert，删除元素必须用 _.remove
    - [0]后缀：所有变量访问都必须加[0]后缀
    - 扩展数组：带有 $__META_EXTENSIBLE__$ 标记的数组使用 _.insert 添加元素
    - 对象添加键值：使用 _.insert('路径', 键名, 值) 向对象添加新的键值对`;

  generatedPrompt.value = promptTemplate;
}

function copyPrompt() {
  copyToClipboard(generatedPrompt.value);
}

// AI智能生成提示词
async function handleAIGeneratePrompt() {
  if (!aiPromptDescription.value.trim()) {
    window.toastr.error('请输入场景描述');
    return;
  }

  if (!settings.value.api_endpoint || !settings.value.api_key) {
    window.toastr.error('请先在设置页面配置 API 端点和 API Key');
    return;
  }

  // 保存原始输入（用于增量修改）
  originalPromptDescription.value = aiPromptDescription.value;

  isGeneratingPrompt.value = true;

  try {
    const systemPrompt = `你是 MVU Beta COT（思维链）提示词专家，负责生成完整、规范的 6 步分析流程提示词。

# 核心要求

## ⚠️ 必须包含的元素
1. **变量读取**: \`{{get_message_variable::stat_data}}\`
2. **[0] 后缀**: 所有MVU变量访问必须加 \`[0]\` 后缀
3. **推荐命令**: 优先使用 \`_.insert\` 而非 \`_.assign\`
4. **6步COT**: 完整的思维链分析流程

## 提示词结构

\`\`\`ejs
<%_ setLocalVar('initialized_lorebooks.-YourLorebook[0]', true); _%>
【变量更新】
在所有文本的最后，进行变量更新。

以下是故事中需要追踪的关键变量，当前状态以这些变量的值为准。

<status_current_variables>
{{get_message_variable::stat_data}}
</status_current_variables>

严格按照以下规则和格式进行输出，并确定每一个变量是否需要更新，不要遗漏：

rule:
  description:
    - Output update analysis at the end of response
    - Variable updates are omitted in context but you must still add them
    - **CRITICAL**: For MVU format [value, description], ALWAYS use [0] suffix to access the value part
    - 4 commands available: _.set (2-3 args), _.insert (2-3 args), _.remove (1-2 args), _.add (2 args)
    - **RECOMMENDED**: Use _.insert instead of _.assign
    - strictSet enabled: [0] suffix is mandatory for all value access

  command_usage:
    - _.set('path[0]', old?, new);//reason - Replace value
    - _.add('path[0]', delta);//reason - Add/subtract numbers only
    - _.insert('path[0]', value);//reason - Add to array end
    - _.insert('path[0]', index, value);//reason - Insert to array at position
    - _.insert('path', key, value);//reason - Add key-value to object
    - _.remove('path[0]', value);//reason - Remove from array/object

  analysis:
    You MUST follow this Chain-of-Thought (COT) analysis process step by step:

    **STEP 1: Scene Analysis (50 words max, IN ENGLISH)**
    - Identify current scene/stage/phase
    - Describe what happened
    - Determine what changes occurred (time/location/status/progress)

    **STEP 2: Time & Key Status Check**
    - Extract current time/status from story context
    - Read key variables from <status_current_variables>
    - Calculate changes
    - Decision: What needs to be updated?

    **STEP 3: Systematic Variable Review (check EVERY variable category)**
    Go through each variable category systematically and mark Y or N:

    [基于用户需求生成的变量分类]:
      - 变量1[0]: [Y/N] - explain
      - 变量2[0]: [Y/N] - explain

    **STEP 4: Command Selection**
    For each variable marked Y, determine which command to use

    **STEP 5: Analyze Other Variable Systems**
    - stat_data detailed COT: COMPLETED
    - Other variable groups? [YES/NO]

    **STEP 6: Final Validation Checklist**
    - All [0] suffixes present? [YES/NO]
    - All Y variables have corresponding commands? [YES/NO]
    - All commands have clear Chinese comments? [YES/NO]

  format: |-
    <UpdateVariable>
        <ThinkingProcess>
            **STEP 1: Scene Analysis**
            [50 words]

            **STEP 2: Time & Key Status Check**
            - Current status: ...
            - Stored variable[0]: ...
            - Changes: ...
            - Update decision: ...

            **STEP 3: Variable Review (stat_data)**
            [List categories with Y/N]

            **STEP 4: Command Selection**
            [For each Y variable, state which command]

            **STEP 5: Other Systems**
            - stat_data COT: COMPLETED
            - Other groups? NO

            **STEP 6: Final Check**
            - [0] suffixes? YES
            - All Y have commands? YES
            - Chinese comments? YES
        </ThinkingProcess>

        _.set('path[0]', old?, new);//reason
        _.add('path[0]', delta);//reason
        _.insert('path[0]', value);//reason
        _.remove('path[0]', value);//reason
    </UpdateVariable>

  specific_rules:
    - 时间推进：每次互动后更新具体时间，使用 _.set 更新
    - 状态切换：当状态/阶段切换时，必须更新对应的状态变量
    - 计数器：使用 _.add 增加或减少计数
    - 数组操作：添加元素必须用 _.insert，删除元素必须用 _.remove
    - [0]后缀：所有变量访问都必须加[0]后缀
    - 扩展数组：带有 $__META_EXTENSIBLE__$ 标记的数组使用 _.insert 添加元素
    - 对象添加键值：使用 _.insert('路径', 键名, 值) 向对象添加新的键值对
\`\`\`

---

# 生成要求

1. **完整性**: 包含所有必需部分（变量读取、6步COT、命令示例）
2. **准确性**: 变量名与用户的InitVar结构一致
3. **实用性**: 具体规则要符合用户的实际使用场景
4. **格式**: 直接输出EJS格式，可直接使用

直接输出完整的 COT 提示词内容。`;

    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
    // 过滤 API 参数，确保兼容不同的服务提供商
    const requestPayload = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `场景：${aiPromptDescription.value}\n\n请生成 COT 提示词。` },
      ],
      temperature: settings.value.temperature || 0.7,
      max_tokens: settings.value.max_tokens || 3000,
    };

    const filteredPayload = filterApiParams(requestPayload, settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredPayload),
    });

    // 先读取响应文本
    const responseText2 = await response.text();

    if (!response.ok) {
      // 尝试解析错误信息
      let errorMessage = `API 错误: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText2);
        if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error.message || JSON.stringify(errorData.error)}`;
        } else if (errorData.message) {
          errorMessage = `${errorMessage} - ${errorData.message}`;
        } else {
          errorMessage = `${errorMessage} - ${JSON.stringify(errorData)}`;
        }
      } catch (e) {
        errorMessage = `${errorMessage} - ${responseText2.slice(0, 200)}`;
      }
      console.error('API 请求失败:', errorMessage);
      console.error('请求 URL:', settings.value.api_endpoint);
      console.error(
        '请求体:',
        JSON.stringify(
          {
            model: settings.value.model,
            messages: [
              { role: 'system', content: systemPrompt.substring(0, 100) + '...' },
              { role: 'user', content: `场景：${aiPromptDescription.value.substring(0, 100)}...` },
            ],
            temperature: settings.value.temperature || 0.7,
            max_tokens: settings.value.max_tokens || 3000,
          },
          null,
          2,
        ),
      );
      throw new Error(errorMessage);
    }

    // 解析成功响应
    const data = JSON.parse(responseText2);
    // 尝试从不同的响应格式中提取内容
    let result = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      result = data.choices[0].message.content || '';
    } else if (data.data && data.data.choices && data.data.choices[0]) {
      // 某些 API 可能返回 data.data.choices 格式
      result = data.data.choices[0].message?.content || '';
    } else if (data.content) {
      result = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
    }

    generatedPrompt.value = result.trim();
    window.toastr.success('AI 生成成功！');
  } catch (error: any) {
    console.error('AI生成失败:', error);
    window.toastr.error(`AI生成失败: ${error.message}`);
  } finally {
    isGeneratingPrompt.value = false;
  }
}

// AI 修改结构（增量修改）
async function modifyStructureWithAI(modifyInstruction: string) {
  if (!originalStructurePrompt.value) {
    window.toastr.warning('请先生成结构');
    return;
  }

  isModifyingStructure.value = true;

  try {
    window.toastr.info('AI 正在修改中...');

    const systemPrompt = `你是 MVU Beta 变量系统专家。基于原始需求，应用用户的修改建议，生成更新后的 [InitVar] JSON。

# 核心原则
1. **保持原有结构**：除非明确要求改动，否则保留原有字段
2. **精确修改**：只修改用户明确指出的部分
3. **格式一致**：\`[默认值, "描述"]\`，$meta在根级别
4. **字符串在一行内**，无尾随逗号

# 修改类型

## 1️⃣ 添加字段
用户说"增加XX字段"时：
- 选择合适的类型（number/string/array/object）
- 设置合理的默认值
- 写清楚15-20字的描述

## 2️⃣ 删除字段
用户说"删除XX字段"时：
- 直接从JSON中移除该字段
- 不要留下任何痕迹

## 3️⃣ 修改描述
用户说"改描述"时：
- 保持字段名和默认值不变
- 只更新描述部分
- 保持15-20字长度

## 4️⃣ 调整顺序
用户说"调整顺序"时：
- 按要求重新排列字段
- 内容不变，只改顺序

## 5️⃣ 修改默认值/类型
用户说"改初始值"或"改类型"时：
- 更新默认值或更改数据类型
- 确保新值合理

---

只输出更新后的 JSON，不要解释。`;

    const userPrompt = `# 原始需求：
${originalStructurePrompt.value}

# 修改建议：
${modifyInstruction}

请根据原始需求和修改建议，重新生成 [InitVar] JSON。`;

    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
    // 过滤 API 参数，确保兼容不同的服务提供商
    const requestPayload = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: settings.value.temperature || 0.7,
      max_tokens: settings.value.max_tokens || 4000,
    };

    const filteredPayload = filterApiParams(requestPayload, settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredPayload),
    });

    if (!response.ok) {
      throw new Error(`API 错误: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || '';

    // 提取 JSON
    let jsonText = result.replace(/```json\s*/gi, '').replace(/```\s*$/g, '');
    const jsonMatch = jsonText.match(/\{[\s\S]*$/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    // 清理并解析
    jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
    const parsed = JSON.parse(jsonText);

    const varNameParsed = Object.keys(parsed).find(k => k !== '$meta') || 'myVar';
    varName.value = varNameParsed;

    const varData = parsed[varNameParsed] || {};
    const fields: string[] = [];

    for (const key in varData) {
      if (key === '$meta') continue;
      const value = varData[key];
      if (Array.isArray(value) && value.length === 2) {
        const val = value[0];
        const type =
          typeof val === 'number'
            ? 'number'
            : typeof val === 'string'
              ? 'string'
              : Array.isArray(val)
                ? 'array'
                : 'object';
        const desc = value[1] || '描述...';
        fields.push(`${key}:${type}:${desc}`);
      }
    }

    subFields.value = fields.join('\n');
    generatedStructure.value = JSON.stringify(parsed, null, 2);

    // 更新原始输入（累积修改）
    originalStructurePrompt.value += `\n\n【已应用的修改】：${modifyInstruction}`;

    window.toastr.success('✅ AI 修改完成！');
    showStructureModifyDialog.value = false;
  } catch (error: any) {
    console.error('AI 修改失败:', error);
    window.toastr.error('AI 修改失败: ' + error.message);
  } finally {
    isModifyingStructure.value = false;
  }
}

// AI 修改提示词（增量修改）
async function modifyPromptWithAI(modifyInstruction: string) {
  if (!originalPromptDescription.value) {
    window.toastr.warning('请先生成提示词');
    return;
  }

  isModifyingPrompt.value = true;

  try {
    window.toastr.info('AI 正在修改中...');

    const systemPrompt = `你是 MVU Beta COT（思维链）提示词专家。基于原始场景描述，应用用户的修改建议，生成更新后的 6 步思维链提示词。

# 核心原则
1. **保持原有结构**：除非明确要求改动，否则保留原有内容
2. **精确修改**：只修改用户明确指出的部分
3. **格式一致**：EJS格式，包含所有必需元素
4. **6步完整**：确保6步COT流程不缺失

# 修改类型

## 1️⃣ 修改STEP内容
用户说"修改STEP X"时：
- 保持其他STEP不变
- 只更新指定的STEP内容
- 保持逻辑连贯性

## 2️⃣ 添加/删除规则
用户说"添加/删除XX规则"时：
- 在specific_rules部分操作
- 保持规则格式一致

## 3️⃣ 调整变量分类
用户说"修改变量分类"时：
- 更新STEP 3中的分类
- 保持所有字段都被覆盖

## 4️⃣ 强化某个方面
用户说"强调XX"时：
- 在相应STEP中增加说明
- 或在specific_rules中添加规则

---

必须包含的元素：
- \`{{get_message_variable::stat_data}}\`
- [0] 后缀说明
- 6步完整COT流程
- 命令使用示例

直接输出完整的 EJS 格式提示词。`;

    const userPrompt = `# 原始场景描述：
${originalPromptDescription.value}

# 修改建议：
${modifyInstruction}

请根据原始场景描述和修改建议，重新生成 COT 提示词。`;

    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
    // 过滤 API 参数，确保兼容不同的服务提供商
    const requestPayload = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: settings.value.temperature || 0.7,
      max_tokens: settings.value.max_tokens || 3000,
    };

    const filteredPayload = filterApiParams(requestPayload, settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredPayload),
    });

    if (!response.ok) {
      throw new Error(`API 错误: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || '';

    generatedPrompt.value = result.trim();

    // 更新原始输入（累积修改）
    originalPromptDescription.value += `\n\n【已应用的修改】：${modifyInstruction}`;

    window.toastr.success('✅ AI 修改完成！');
    showPromptModifyDialog.value = false;
  } catch (error: any) {
    console.error('AI 修改失败:', error);
    window.toastr.error('AI 修改失败: ' + error.message);
  } finally {
    isModifyingPrompt.value = false;
  }
}

function exportWorldbook() {
  if (!generatedStructure.value) {
    window.toastr.error('请先生成 [InitVar] 结构');
    return;
  }

  if (!generatedPrompt.value) {
    autoGeneratePrompt();
  }

  setTimeout(() => {
    exportAsWorldbook();
  }, 100);
}

function exportAsWorldbook() {
  if (!generatedStructure.value || !generatedPrompt.value) {
    window.toastr.error('请先生成 [InitVar] 结构和 COT 提示词');
    return;
  }

  let varNameParsed = 'myVar';
  try {
    const structure = JSON.parse(generatedStructure.value);
    varNameParsed = Object.keys(structure).find(k => k !== '$meta') || 'myVar';
  } catch (e) {
    console.error('解析变量名失败:', e);
  }

  const worldbookEntries = [
    {
      uid: generateUID(),
      key: [],
      keysecondary: [],
      comment: '[InitVar]',
      content: generatedStructure.value,
      constant: false,
      vectorized: false,
      selective: true,
      selectiveLogic: 0,
      addMemo: false,
      order: 100,
      position: 0,
      disable: false,
      excludeRecursion: false,
      delayUntilRecursion: false,
      probability: 100,
      useProbability: true,
      depth: 4,
      group: '',
      groupOverride: false,
      groupWeight: 100,
      scanDepth: null,
      caseSensitive: null,
      matchWholeWords: null,
      useGroupScoring: false,
      automationId: '',
      role: 0,
      sticky: 0,
      cooldown: 0,
      delay: 0,
    },
    {
      uid: generateUID(),
      key: [],
      keysecondary: [],
      comment: '变量',
      content: generatedPrompt.value,
      constant: true,
      vectorized: false,
      selective: false,
      selectiveLogic: 0,
      addMemo: false,
      order: 100,
      position: 1,
      disable: false,
      excludeRecursion: false,
      delayUntilRecursion: false,
      probability: 100,
      useProbability: true,
      depth: 0,
      group: '',
      groupOverride: false,
      groupWeight: 100,
      scanDepth: null,
      caseSensitive: null,
      matchWholeWords: null,
      useGroupScoring: false,
      automationId: '',
      role: 0,
      sticky: 0,
      cooldown: 0,
      delay: 0,
    },
  ];

  const jsonStr = JSON.stringify(worldbookEntries, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${varNameParsed}_MVU_worldbook.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  window.toastr.success(`✅ 已导出世界书 JSON：[InitVar] + 变量规则`);
}

function generateUID(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ==================== 数据持久化 ====================

// 加载保存的配置（插件环境 - localStorage）
function loadSavedData() {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      console.warn('script_id 为空，无法加载 MVU 配置');
      return;
    }

    // 插件环境：从 localStorage 加载
    const storageKey = `${scriptId}_mvu_beta_config`;
    const savedDataStr = localStorage.getItem(storageKey);

    if (savedDataStr) {
      const savedData = JSON.parse(savedDataStr);
      if (savedData.varName) varName.value = savedData.varName;
      if (savedData.subFields) subFields.value = savedData.subFields;
      if (savedData.generatedStructure) generatedStructure.value = savedData.generatedStructure;
      if (savedData.variableCategories) variableCategories.value = savedData.variableCategories;
      if (savedData.generatedPrompt) generatedPrompt.value = savedData.generatedPrompt;
      console.log('✅ 已加载保存的 MVU Beta 配置');
    }
  } catch (error) {
    console.error('加载 MVU Beta 配置失败:', error);
  }
}

// 保存配置（插件环境 - localStorage）
function saveData() {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      console.warn('script_id 为空，无法保存 MVU 配置');
      return;
    }

    // 插件环境：保存到 localStorage
    const storageKey = `${scriptId}_mvu_beta_config`;
    const dataToSave = {
      varName: varName.value,
      subFields: subFields.value,
      generatedStructure: generatedStructure.value,
      variableCategories: variableCategories.value,
      generatedPrompt: generatedPrompt.value,
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('保存 MVU Beta 配置失败:', error);
  }
}

// 组件挂载时加载
onMounted(() => {
  loadSavedData();
});

// 监听数据变化，自动保存（防抖）
let saveTimer: number | null = null;
watch([varName, subFields, generatedStructure, variableCategories, generatedPrompt], () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveData();
  }, 1000); // 1秒后保存
});
</script>

<style scoped>
.tool-section {
  margin-bottom: 20px;
}

.tool-content {
  padding: 0 20px 20px 20px;
}

.form-group {
  margin-bottom: 15px;
}

.generate-btn:hover .shimmer-effect {
  left: 100%;
}

.output-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.code-output {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 15px;
  position: relative;
  max-height: 400px;
  overflow-y: auto;
}

/* 滚动条样式 */
.code-output::-webkit-scrollbar {
  width: 6px;
}

.code-output::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.code-output::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.code-output::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}

.code-output pre {
  margin: 0;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.copy-btn-abs {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(102, 126, 234, 0.3));
  border: 1px solid rgba(74, 158, 255, 0.4);
  border-radius: 6px;
  color: #4a9eff;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.2);
}

.copy-btn-abs:hover {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.35), rgba(102, 126, 234, 0.45));
  border-color: rgba(74, 158, 255, 0.6);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.35);
  transform: translateY(-2px);
  color: #fff;
}
</style>
