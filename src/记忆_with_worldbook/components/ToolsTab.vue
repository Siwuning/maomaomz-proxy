<template>
  <div class="tools-tab" style="padding: 25px !important; background: transparent !important">
    <!-- 快速上手教程 -->
    <QuickGuide
      storage-key="maomaomz_tools_guide_hidden"
      title="AI 工具箱使用指南"
      icon="fa-solid fa-toolbox"
      theme="purple"
      :steps="[
        { title: '选择工具', desc: '点击展开你需要的工具' },
        { title: '输入内容', desc: '粘贴或输入要处理的文本' },
        { title: 'AI 处理', desc: '点击按钮让 AI 帮你处理' },
      ]"
    />

    <!-- 反八股工具 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(84, 107, 131, 0.3);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('antiCliche')"
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
          <i class="fa-solid fa-broom" style="color: #ff6b6b; font-size: 18px"></i>
          {{ t('tools_anti_cliche') }}
        </h4>
        <i
          :class="isToolExpanded('antiCliche') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease; font-size: 14px"
        ></i>
      </div>

      <div v-if="isToolExpanded('antiCliche')" class="tool-content">
        <div class="tool-instructions">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #17a2b8"></i>
            角色卡/世界书/开场白八股清理工具，<strong style="color: #10b981">适度清理</strong>明显八股，保持原文信息量。
          </p>
          <p
            style="
              margin: 0 0 8px 0;
              color: #ffa500;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #ffa500;
            "
          >
            🎯
            <strong>清理重点</strong
            >：模糊词（一丝、似乎）、动物化比喻（像小兽）、否定句式（不是而是）、极端情绪、夸张修辞
          </p>
          <p
            style="
              margin: 0;
              color: #10b981;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #10b981;
            "
          >
            ✅ <strong>保持内容</strong>：核心设定、对话内容、具体动作、重要信息 - 输入几段输出几段！
          </p>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            输入文本：
          </label>
          <!-- 快速读取按钮 -->
          <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap">
            <button
              style="
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #17a2b8;
                font-size: 11px;
                cursor: pointer;
              "
              @click="loadAntiClicheFromChar('description')"
            >
              📝 角色描述
            </button>
            <button
              style="
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #17a2b8;
                font-size: 11px;
                cursor: pointer;
              "
              @click="loadAntiClicheFromChar('personality')"
            >
              💭 角色性格
            </button>
            <button
              style="
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #17a2b8;
                font-size: 11px;
                cursor: pointer;
              "
              @click="loadAntiClicheFromChar('scenario')"
            >
              🎬 场景
            </button>
            <button
              style="
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #17a2b8;
                font-size: 11px;
                cursor: pointer;
              "
              @click="loadAntiClicheFromChar('mes_example')"
            >
              📖 示例对话
            </button>
            <select
              v-model="antiClicheWorldbook"
              style="
                padding: 6px 10px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #10b981;
                font-size: 11px;
              "
              @change="loadAntiClicheFromWorldbook"
            >
              <option value="">📚 从世界书读取...</option>
              <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
            </select>
          </div>
          <textarea
            v-model="antiClicheInput"
            placeholder="请输入需要清理的文本...&#10;💡 也可点击上方按钮快速读取角色卡或世界书内容"
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
              font-family: inherit;
            "
          ></textarea>
        </div>

        <!-- 清理强度选择 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            清理强度：
          </label>
          <div style="display: flex; gap: 10px; flex-wrap: wrap">
            <label
              v-for="level in antiClicheLevels"
              :key="level.value"
              style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                background: #2a2a2a;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
              "
              :style="{
                background: antiClicheLevel === level.value ? level.color + '20' : '#2a2a2a',
                border: antiClicheLevel === level.value ? '1px solid ' + level.color : '1px solid #3a3a3a',
              }"
            >
              <input v-model="antiClicheLevel" type="radio" :value="level.value" style="display: none" />
              <i :class="level.icon" :style="{ color: level.color }"></i>
              <span style="color: #e0e0e0; font-size: 12px">{{ level.label }}</span>
            </label>
          </div>
          <p style="margin: 8px 0 0 0; color: #888; font-size: 11px">
            {{ antiClicheLevelDescription }}
          </p>
        </div>

        <!-- 流式传输开关 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 13px; cursor: pointer">
            <input v-model="enableAntiClicheStreaming" type="checkbox" style="cursor: pointer" />
            启用流式传输（可查看清理进度）
          </label>
        </div>

        <!-- 进度条 -->
        <div
          v-if="isProcessingAntiCliche && antiClicheProgressPercent > 0"
          class="progress-bar-container"
          style="margin: 15px 0"
        >
          <div
            class="progress-bar"
            style="
              width: 100%;
              height: 8px;
              background: #2a2a2a;
              border-radius: 4px;
              overflow: hidden;
              position: relative;
            "
          >
            <div
              class="progress-fill"
              :style="{
                width: antiClicheProgressPercent + '%',
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
                backgroundSize: '200% 100%',
                animation: enableAntiClicheStreaming ? 'progress-slide 2s linear infinite' : 'none',
                transition: 'width 0.3s ease',
              }"
            ></div>
          </div>
          <div style="text-align: center; margin-top: 8px; color: #667eea; font-size: 12px; font-weight: 500">
            清理中... {{ antiClicheProgressPercent.toFixed(0) }}%
          </div>
        </div>

        <div class="button-group" style="display: flex; gap: 10px; margin-bottom: 20px">
          <button
            :disabled="isProcessingAntiCliche || !antiClicheInput.trim()"
            style="
              padding: 10px 18px;
              background: #3b82f6;
              border: none;
              border-radius: 6px;
              color: white;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 6px;
            "
            @click="handleAntiClicheProcess"
          >
            <i class="fa-solid fa-magic"></i>
            {{ isProcessingAntiCliche ? '处理中...' : '开始清理' }}
          </button>

          <button
            style="
              padding: 10px 18px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 6px;
            "
            @click="clearAntiClicheForm"
          >
            <i class="fa-solid fa-trash"></i>
            清空
          </button>
        </div>

        <!-- 输出区域 -->
        <div v-if="antiClicheOutput" class="output-section">
          <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-check-circle" style="margin-right: 6px; color: #28a745"></i>
            清理结果：
          </h5>
          <div
            class="output-content"
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              padding: 15px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
              word-wrap: break-word;
              max-height: 300px;
              overflow-y: auto;
            "
          >
            {{ antiClicheOutput }}
          </div>

          <div class="output-actions" style="margin-top: 12px; display: flex; gap: 12px">
            <button
              class="copy-button"
              style="
                padding: 10px 20px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
              "
              @click="copyAntiClicheResult"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-copy" style="font-size: 14px"></i> 复制结果
            </button>
          </div>

          <!-- 修改功能 -->
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #3a3a3a">
            <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 6px; color: #ffc107"></i>
              AI 修改清理结果
            </h5>
            <div class="form-group" style="margin-bottom: 12px">
              <textarea
                v-model="antiClicheModifyRequest"
                placeholder="描述你想要的修改，例如：把这段话改得更简洁一些..."
                style="
                  width: 100%;
                  height: 80px;
                  padding: 12px;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  resize: vertical;
                  font-family: inherit;
                "
              ></textarea>
            </div>

            <div style="display: flex; gap: 10px">
              <button
                :disabled="isModifyingAntiCliche || !antiClicheModifyRequest.trim()"
                style="
                  flex: 1;
                  padding: 10px 20px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                "
                :style="{
                  opacity: isModifyingAntiCliche || !antiClicheModifyRequest.trim() ? 0.5 : 1,
                  cursor: isModifyingAntiCliche || !antiClicheModifyRequest.trim() ? 'not-allowed' : 'pointer',
                }"
                @click="handleModifyAntiCliche"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 6px"></i>
                {{ isModifyingAntiCliche ? '修改中...' : 'AI 修改' }}
              </button>
              <button
                :disabled="!antiClicheModifyRequest.trim()"
                style="
                  padding: 10px 20px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                "
                :style="{
                  opacity: !antiClicheModifyRequest.trim() ? 0.5 : 1,
                  cursor: !antiClicheModifyRequest.trim() ? 'not-allowed' : 'pointer',
                }"
                @click="clearAntiClicheModifyRequest"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-eraser" style="margin-right: 6px"></i>
                清空修改需求
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NPC 快速生成工具 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 12px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('npcGen')"
      >
        <h4
          style="
            margin: 0;
            color: #fff;
            font-size: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >
          <i class="fa-solid fa-users" style="color: #ffc107; font-size: 18px"></i>
          {{ t('tools_npc_gen') }}
        </h4>
        <i
          :class="isToolExpanded('npcGen') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #888; font-size: 14px; transition: transform 0.3s ease"
        ></i>
      </div>

      <div v-show="isToolExpanded('npcGen')" class="section-content" style="padding: 20px">
        <div class="tool-description" style="margin-bottom: 15px">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #ffc107"></i>
            快速生成配角 NPC 设定，读取当前角色卡和世界书作为背景参考。
          </p>
        </div>

        <!-- 背景来源选择 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            读取背景参考（可选）：
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <button
              style="
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #17a2b8;
                font-size: 11px;
                cursor: pointer;
              "
              @click="loadNpcContext('char')"
            >
              📝 当前角色卡
            </button>
            <select
              v-model="npcContextWorldbook"
              style="
                padding: 6px 10px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #10b981;
                font-size: 11px;
              "
              @change="loadNpcContext('worldbook')"
            >
              <option value="">📚 从世界书读取...</option>
              <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
            </select>
            <button
              v-if="npcContext"
              style="
                padding: 6px 12px;
                background: #3a3a3a;
                border: 1px solid #ff6b6b;
                border-radius: 4px;
                color: #ff6b6b;
                font-size: 11px;
                cursor: pointer;
              "
              @click="npcContext = ''"
            >
              ✕ 清除背景
            </button>
          </div>
          <div
            v-if="npcContext"
            style="
              margin-top: 8px;
              padding: 8px;
              background: #1a1a1a;
              border-radius: 4px;
              max-height: 80px;
              overflow-y: auto;
            "
          >
            <p style="margin: 0; color: #888; font-size: 11px; white-space: pre-wrap">
              {{ npcContext.substring(0, 200) }}{{ npcContext.length > 200 ? '...' : '' }}
            </p>
          </div>
        </div>

        <!-- 🆕 NPC 模板选择 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            输出模板：
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <label
              v-for="tpl in npcTemplates"
              :key="tpl.value"
              style="
                display: flex;
                flex-direction: column;
                padding: 8px 12px;
                background: #2a2a2a;
                border-radius: 6px;
                cursor: pointer;
                min-width: 120px;
              "
              :style="{
                background: npcTemplateType === tpl.value ? 'rgba(255, 193, 7, 0.15)' : '#2a2a2a',
                border: npcTemplateType === tpl.value ? '1px solid #ffc107' : '1px solid #3a3a3a',
              }"
            >
              <input v-model="npcTemplateType" type="radio" :value="tpl.value" style="display: none" />
              <span style="color: #e0e0e0; font-size: 12px; font-weight: 500">{{ tpl.label }}</span>
              <span style="color: #888; font-size: 10px; margin-top: 2px">{{ tpl.desc }}</span>
            </label>
          </div>
        </div>

        <!-- 🆕 输出长度限制配置 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            输出长度限制：
          </label>
          <div style="display: flex; align-items: center; gap: 12px">
            <input
              v-model.number="npcMaxTokens"
              type="range"
              min="300"
              max="4000"
              step="100"
              style="flex: 1; cursor: pointer; accent-color: #ffc107"
            />
            <span style="color: #ffc107; font-size: 14px; font-weight: 600; min-width: 100px; text-align: right">
              {{ npcMaxTokens }} tokens
            </span>
          </div>
          <p style="margin: 6px 0 0 0; color: #888; font-size: 11px">
            💡 约等于 {{ Math.round(npcMaxTokens * 0.75) }}-{{ npcMaxTokens }} 字中文
          </p>
        </div>

        <!-- 🆕 自定义模板输入 -->
        <div v-if="npcTemplateType === 'custom'" class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            自定义模板格式：
          </label>
          <textarea
            v-model="npcCustomTemplate"
            placeholder="【姓名】xxx&#10;【外貌】xxx&#10;【性格】xxx&#10;【其他字段】xxx&#10;&#10;💡 AI 会按照你定义的格式输出"
            style="
              width: 100%;
              height: 80px;
              padding: 12px;
              background: #2a2a2a;
              border: 1px solid #ffc107;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 12px;
              resize: vertical;
              font-family: inherit;
            "
          ></textarea>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            NPC 描述（简短即可）：
          </label>
          <textarea
            v-model="npcDescription"
            placeholder="例如：酒馆老板，中年男性，健谈，知道很多八卦，对主角有好感&#10;💡 可先点击上方按钮读取角色卡/世界书作为背景参考"
            style="
              width: 100%;
              height: 80px;
              padding: 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              resize: vertical;
              font-family: inherit;
            "
          ></textarea>
        </div>

        <!-- 流式传输开关 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 13px; cursor: pointer">
            <input v-model="enableNpcStreaming" type="checkbox" style="cursor: pointer" />
            启用流式传输
          </label>
        </div>

        <!-- 进度条 -->
        <div v-if="isGeneratingNpc && npcProgressPercent > 0" class="progress-bar-container" style="margin: 15px 0">
          <div
            class="progress-bar"
            style="width: 100%; height: 8px; background: #2a2a2a; border-radius: 4px; overflow: hidden"
          >
            <div
              :style="{
                width: npcProgressPercent + '%',
                height: '100%',
                background: '#ffc107',
                transition: 'width 0.3s',
              }"
            ></div>
          </div>
          <p style="margin: 5px 0 0 0; color: #ffc107; font-size: 11px; text-align: center">
            生成中... {{ npcProgressPercent.toFixed(0) }}%
          </p>
        </div>

        <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap">
          <button
            :disabled="isGeneratingNpc || !npcDescription.trim()"
            style="
              padding: 10px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="handleGenerateNpc"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-magic" style="margin-right: 6px"></i>
            {{ isGeneratingNpc ? '生成中...' : '生成 NPC' }}
          </button>
          <!-- 🆕 批量生成按钮 -->
          <button
            :disabled="isBatchGeneratingNpc || !npcDescription.trim()"
            style="
              padding: 10px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #ffc107;
              border-radius: 6px;
              color: #ffc107;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="showNpcBatchDialog = true"
            @mouseenter="$event.target.style.background = 'rgba(255, 193, 7, 0.15)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-layer-group" style="margin-right: 6px"></i>
            批量生成
          </button>
          <button
            style="
              padding: 10px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="
              npcDescription = '';
              npcOutput = '';
              npcBatchResults = [];
            "
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-trash" style="margin-right: 6px"></i>
            清空
          </button>
        </div>

        <!-- 输出区域 -->
        <div v-if="npcOutput" class="output-section">
          <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-check-circle" style="margin-right: 6px; color: #28a745"></i>
            生成的 NPC：
          </h5>
          <div
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              padding: 15px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
              max-height: 300px;
              overflow-y: auto;
            "
          >
            {{ npcOutput }}
          </div>

          <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center">
            <button
              style="
                padding: 8px 16px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
              @click="copyToClipboard(npcOutput, 'NPC 已复制')"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-copy" style="margin-right: 6px"></i>
              复制
            </button>
            <select
              v-model="npcInsertWorldbook"
              style="
                padding: 8px 12px;
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 12px;
              "
            >
              <option value="">插入到世界书...</option>
              <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
            </select>
            <button
              v-if="npcInsertWorldbook"
              style="
                padding: 8px 16px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
              @click="insertNpcToWorldbook"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-download" style="margin-right: 6px"></i>
              插入
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 🆕 NPC 批量生成对话框 -->
    <div
      v-if="showNpcBatchDialog"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      "
      @click.self="!isBatchGeneratingNpc && (showNpcBatchDialog = false)"
    >
      <div
        style="
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          background: #2a2a2a;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        "
      >
        <!-- 对话框头部 -->
        <div
          style="
            padding: 16px 20px;
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h3 style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600">
            <i class="fa-solid fa-layer-group" style="margin-right: 8px"></i>
            批量生成 NPC
          </h3>
          <button
            v-if="!isBatchGeneratingNpc"
            style="background: none; border: none; color: #1a1a1a; font-size: 18px; cursor: pointer; padding: 4px"
            @click="showNpcBatchDialog = false"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- 对话框内容 -->
        <div style="padding: 20px; max-height: calc(80vh - 140px); overflow-y: auto">
          <div v-if="!isBatchGeneratingNpc && npcBatchResults.length === 0">
            <p style="color: #ccc; font-size: 13px; margin-bottom: 12px">
              <i class="fa-solid fa-info-circle" style="color: #ffc107; margin-right: 6px"></i>
              根据当前描述批量生成多个不同的 NPC，每个都有独特性。
            </p>
            <div style="margin-bottom: 16px">
              <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px"> 生成数量： </label>
              <div style="display: flex; align-items: center; gap: 12px">
                <input v-model.number="npcBatchCount" type="range" min="1" max="10" style="flex: 1; cursor: pointer" />
                <span style="color: #ffc107; font-size: 16px; font-weight: 600; min-width: 30px">
                  {{ npcBatchCount }}
                </span>
              </div>
            </div>
            <button
              :disabled="!npcDescription.trim()"
              style="
                width: 100%;
                padding: 12px;
                background: rgba(255, 193, 7, 0.2);
                border: 1px solid #ffc107;
                border-radius: 8px;
                color: #ffc107;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
              "
              @click="handleBatchGenerateNpc"
            >
              <i class="fa-solid fa-magic" style="margin-right: 8px"></i>
              开始批量生成
            </button>
          </div>

          <!-- 生成进度 -->
          <div v-if="isBatchGeneratingNpc" style="text-align: center; padding: 20px 0">
            <div style="margin-bottom: 16px">
              <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: #ffc107"></i>
            </div>
            <p style="color: #ccc; font-size: 14px; margin-bottom: 8px">
              正在生成第 {{ npcBatchProgress.current }} / {{ npcBatchProgress.total }} 个 NPC
            </p>
            <p style="color: #888; font-size: 12px">
              {{ npcBatchProgress.currentName || '准备中...' }}
            </p>
            <div style="margin-top: 16px; background: #1a1a1a; height: 8px; border-radius: 4px; overflow: hidden">
              <div
                :style="{
                  width:
                    (npcBatchProgress.total > 0 ? (npcBatchProgress.current / npcBatchProgress.total) * 100 : 0) + '%',
                  height: '100%',
                  background: '#ffc107',
                  transition: 'width 0.3s ease',
                }"
              ></div>
            </div>
          </div>

          <!-- 生成结果 -->
          <div v-if="!isBatchGeneratingNpc && npcBatchResults.length > 0">
            <p style="color: #51cf66; font-size: 14px; margin-bottom: 16px">
              <i class="fa-solid fa-check-circle" style="margin-right: 6px"></i>
              成功生成 {{ npcBatchResults.length }} 个 NPC！
            </p>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 16px">
              <div
                v-for="(npc, idx) in npcBatchResults"
                :key="idx"
                style="
                  background: #1a1a1a;
                  border: 1px solid #3a3a3a;
                  border-radius: 8px;
                  padding: 12px;
                  margin-bottom: 8px;
                "
              >
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
                  <span style="color: #ffc107; font-size: 12px; font-weight: 600">NPC {{ Number(idx) + 1 }}</span>
                  <button
                    style="
                      padding: 4px 8px;
                      background: transparent;
                      border: 1px solid #4a4a4a;
                      border-radius: 4px;
                      color: #ccc;
                      font-size: 11px;
                      cursor: pointer;
                    "
                    @click="copyToClipboard(npc, `NPC ${Number(idx) + 1} 已复制`)"
                  >
                    <i class="fa-solid fa-copy"></i>
                  </button>
                </div>
                <p style="margin: 0; color: #e0e0e0; font-size: 12px; white-space: pre-wrap; line-height: 1.5">
                  {{ npc.substring(0, 200) }}{{ npc.length > 200 ? '...' : '' }}
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 10px">
              <select
                v-model="npcInsertWorldbook"
                style="
                  flex: 1;
                  padding: 10px;
                  background: #1a1a1a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                "
              >
                <option value="">选择世界书...</option>
                <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
              </select>
              <button
                :disabled="!npcInsertWorldbook"
                style="
                  padding: 10px 20px;
                  background: rgba(81, 207, 102, 0.2);
                  border: 1px solid #51cf66;
                  border-radius: 6px;
                  color: #51cf66;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                "
                @click="insertBatchNpcToWorldbook"
              >
                <i class="fa-solid fa-download" style="margin-right: 6px"></i>
                全部插入
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Token 压缩工具 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border: 1px solid rgba(220, 53, 69, 0.3);
          border-radius: 12px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('tokenCompress')"
      >
        <h4
          style="
            margin: 0;
            color: #fff;
            font-size: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >
          <i class="fa-solid fa-compress" style="color: #dc3545; font-size: 18px"></i>
          Token 压缩
        </h4>
        <i
          :class="isToolExpanded('tokenCompress') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #888; font-size: 14px; transition: transform 0.3s ease"
        ></i>
      </div>

      <div v-show="isToolExpanded('tokenCompress')" class="section-content" style="padding: 20px">
        <div class="tool-description" style="margin-bottom: 15px">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #dc3545"></i>
            精简角色卡/世界书内容，在保留核心信息的前提下减少 Token 消耗。
          </p>
        </div>

        <!-- 读取来源 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            读取内容：
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <button
              style="
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #17a2b8;
                font-size: 11px;
                cursor: pointer;
              "
              @click="loadTokenCompressFromChar('description')"
            >
              📝 角色描述
            </button>
            <button
              style="
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #17a2b8;
                font-size: 11px;
                cursor: pointer;
              "
              @click="loadTokenCompressFromChar('personality')"
            >
              💭 角色性格
            </button>
            <button
              style="
                padding: 6px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #17a2b8;
                font-size: 11px;
                cursor: pointer;
              "
              @click="loadTokenCompressFromChar('scenario')"
            >
              🎬 场景
            </button>
            <select
              v-model="tokenCompressWorldbook"
              style="
                padding: 6px 10px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #10b981;
                font-size: 11px;
              "
              @change="loadTokenCompressFromWorldbook"
            >
              <option value="">📚 从世界书读取...</option>
              <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
            </select>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="form-group" style="margin: 15px 0">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
            <label style="color: #ccc; font-size: 13px; font-weight: 500">原始内容：</label>
            <span style="color: #dc3545; font-size: 12px; font-weight: 600">
              约 {{ tokenCompressInputTokens }} tokens
            </span>
          </div>
          <textarea
            v-model="tokenCompressInput"
            placeholder="粘贴或读取需要压缩的内容..."
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
              font-family: inherit;
            "
          ></textarea>
        </div>

        <!-- 压缩强度 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            压缩强度：
          </label>
          <div style="display: flex; gap: 10px; flex-wrap: wrap">
            <label
              v-for="level in tokenCompressLevels"
              :key="level.value"
              style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                background: #2a2a2a;
                border-radius: 8px;
                cursor: pointer;
              "
              :style="{
                background: tokenCompressLevel === level.value ? level.color + '20' : '#2a2a2a',
                border: tokenCompressLevel === level.value ? '1px solid ' + level.color : '1px solid #3a3a3a',
              }"
            >
              <input v-model="tokenCompressLevel" type="radio" :value="level.value" style="display: none" />
              <span style="color: #e0e0e0; font-size: 12px">{{ level.label }}</span>
            </label>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="isCompressingToken && tokenCompressProgress > 0" style="margin: 15px 0">
          <div style="width: 100%; height: 8px; background: #2a2a2a; border-radius: 4px; overflow: hidden">
            <div
              :style="{
                width: tokenCompressProgress + '%',
                height: '100%',
                background: '#dc3545',
                transition: 'width 0.3s',
              }"
            ></div>
          </div>
          <p style="margin: 5px 0 0 0; color: #dc3545; font-size: 11px; text-align: center">
            压缩中... {{ tokenCompressProgress.toFixed(0) }}%
          </p>
        </div>

        <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 15px">
          <button
            :disabled="isCompressingToken || !tokenCompressInput.trim()"
            style="
              padding: 10px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="handleTokenCompress"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-compress" style="margin-right: 6px"></i>
            {{ isCompressingToken ? '压缩中...' : '压缩' }}
          </button>
          <button
            style="
              padding: 10px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="
              tokenCompressInput = '';
              tokenCompressOutput = '';
            "
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-trash" style="margin-right: 6px"></i>
            清空
          </button>
        </div>

        <!-- 输出区域 -->
        <div v-if="tokenCompressOutput" class="output-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <h5 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-check-circle" style="margin-right: 6px; color: #28a745"></i>
              压缩结果：
            </h5>
            <div style="display: flex; gap: 12px; align-items: center">
              <span style="color: #28a745; font-size: 12px; font-weight: 600">
                约 {{ tokenCompressOutputTokens }} tokens
              </span>
              <span
                style="
                  padding: 4px 8px;
                  background: rgba(40, 167, 69, 0.2);
                  border-radius: 4px;
                  color: #28a745;
                  font-size: 11px;
                  font-weight: 600;
                "
              >
                节省 {{ tokenCompressSaved }}%
              </span>
            </div>
          </div>
          <div
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              padding: 15px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
              max-height: 200px;
              overflow-y: auto;
            "
          >
            {{ tokenCompressOutput }}
          </div>

          <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap">
            <button
              style="
                padding: 8px 16px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
              @click="copyToClipboard(tokenCompressOutput, '压缩结果已复制')"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-copy" style="margin-right: 6px"></i>
              复制
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色关系分析工具 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border: 1px solid rgba(233, 30, 99, 0.3);
          border-radius: 12px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('relationMap')"
      >
        <h4
          style="
            margin: 0;
            color: #fff;
            font-size: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >
          <i class="fa-solid fa-heart" style="color: #e91e63; font-size: 18px"></i>
          角色关系分析
        </h4>
        <i
          :class="isToolExpanded('relationMap') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #888; font-size: 14px"
        ></i>
      </div>

      <div v-show="isToolExpanded('relationMap')" class="section-content" style="padding: 20px">
        <div class="tool-description" style="margin-bottom: 15px">
          <p style="margin: 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #e91e63"></i>
            分析角色卡和世界书，提取角色关系图谱。
          </p>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500"
            >分析来源：</label
          >
          <div style="display: flex; gap: 10px; flex-wrap: wrap">
            <label
              style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border-radius: 8px;
                cursor: pointer;
              "
              :style="{
                background: relationIncludeChar ? 'rgba(23, 162, 184, 0.2)' : '#2a2a2a',
                border: relationIncludeChar ? '1px solid #17a2b8' : '1px solid #3a3a3a',
              }"
            >
              <input v-model="relationIncludeChar" type="checkbox" style="display: none" />
              <span style="color: #e0e0e0; font-size: 12px">📝 角色卡</span>
            </label>
            <select
              v-model="relationWorldbook"
              style="
                padding: 8px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 8px;
                color: #10b981;
                font-size: 12px;
              "
            >
              <option value="">📚 选择世界书...</option>
              <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
            </select>
          </div>
        </div>

        <div v-if="isAnalyzingRelation && relationProgress > 0" style="margin: 15px 0">
          <div style="width: 100%; height: 8px; background: #2a2a2a; border-radius: 4px; overflow: hidden">
            <div
              :style="{
                width: relationProgress + '%',
                height: '100%',
                background: '#e91e63',
                transition: 'width 0.3s',
              }"
            ></div>
          </div>
          <p style="margin: 5px 0 0 0; color: #e91e63; font-size: 11px; text-align: center">
            分析中... {{ relationProgress.toFixed(0) }}%
          </p>
        </div>

        <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 15px">
          <button
            :disabled="isAnalyzingRelation || (!relationIncludeChar && !relationWorldbook)"
            style="
              padding: 10px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="handleAnalyzeRelation"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-heart" style="margin-right: 6px"></i>
            {{ isAnalyzingRelation ? '分析中...' : '分析关系' }}
          </button>
          <button
            style="
              padding: 10px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="relationOutput = ''"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-trash" style="margin-right: 6px"></i>清空
          </button>
        </div>

        <div v-if="relationOutput" class="output-section">
          <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-project-diagram" style="margin-right: 6px; color: #e91e63"></i>角色关系图谱：
          </h5>
          <div
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              padding: 15px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.8;
              white-space: pre-wrap;
              max-height: 400px;
              overflow-y: auto;
            "
          >
            {{ relationOutput }}
          </div>
          <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap">
            <button
              style="
                padding: 8px 16px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
              @click="copyToClipboard(relationOutput, '关系图谱已复制')"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-copy" style="margin-right: 6px"></i>复制
            </button>
            <select
              v-model="relationInsertWorldbook"
              style="
                padding: 8px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #10b981;
                font-size: 12px;
              "
            >
              <option value="">📚 插入到世界书...</option>
              <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
            </select>
            <button
              v-if="relationInsertWorldbook"
              :disabled="isInsertingRelation"
              style="
                padding: 8px 16px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
              @click="insertRelationToWorldbook"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-download" style="margin-right: 6px"></i
              >{{ isInsertingRelation ? '插入中...' : '插入' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 开场白生成工具 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(84, 107, 131, 0.3);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('greetingGen')"
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
          <i class="fa-solid fa-comment-dots" style="color: #10b981; font-size: 18px"></i>
          开场白生成工具
        </h4>
        <i
          :class="isToolExpanded('greetingGen') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease; font-size: 14px"
        ></i>
      </div>

      <div v-if="isToolExpanded('greetingGen')" class="tool-content">
        <div class="tool-instructions">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #10b981"></i>
            根据角色卡和用户人设，AI 自动生成高质量的开场白文字。
          </p>
          <p
            style="
              margin: 0 0 6px 0;
              color: #4a9eff;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #10b981;
            "
          >
            💡 会自动读取当前角色卡的描述、性格、场景设定和用户人设
          </p>
        </div>

        <!-- 当前角色信息 -->
        <div style="background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; padding: 12px; margin: 15px 0">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
            <i class="fa-solid fa-user" style="color: #10b981"></i>
            <span style="color: #e0e0e0; font-size: 13px; font-weight: 500">当前角色信息</span>
          </div>
          <div style="color: #888; font-size: 12px">
            <p style="margin: 4px 0">📌 角色：{{ greetingCharName || '未选择角色' }}</p>
          </div>
          <button
            style="
              margin-top: 8px;
              padding: 4px 10px;
              background: #3a3a3a;
              border: 1px solid #4a4a4a;
              border-radius: 4px;
              color: #ccc;
              font-size: 11px;
              cursor: pointer;
            "
            @click="refreshGreetingCharInfo"
          >
            <i class="fa-solid fa-refresh" style="margin-right: 4px"></i>
            刷新角色信息
          </button>
        </div>

        <!-- 用户人设来源选择 -->
        <div style="background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 6px; padding: 12px; margin: 15px 0">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px">
            <i class="fa-solid fa-id-card" style="color: #4a9eff"></i>
            <span style="color: #e0e0e0; font-size: 13px; font-weight: 500">用户人设来源</span>
          </div>

          <!-- 来源选择 -->
          <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap">
            <label
              v-for="src in greetingPersonaSources"
              :key="src.value"
              style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                color: #ccc;
              "
              :style="{
                borderColor: greetingPersonaSource === src.value ? '#4a9eff' : '#3a3a3a',
                color: greetingPersonaSource === src.value ? '#4a9eff' : '#ccc',
              }"
            >
              <input
                v-model="greetingPersonaSource"
                type="radio"
                :value="src.value"
                style="cursor: pointer"
                @change="onPersonaSourceChange"
              />
              {{ src.label }}
            </label>
          </div>

          <!-- 世界书选择（仅当来源为世界书时显示） -->
          <div v-if="greetingPersonaSource === 'worldbook'" style="margin-bottom: 10px">
            <select
              v-model="greetingPersonaWorldbook"
              style="
                width: 100%;
                padding: 8px;
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #e0e0e0;
                font-size: 12px;
                margin-bottom: 8px;
              "
              @change="loadPersonaFromWorldbook"
            >
              <option value="">选择世界书...</option>
              <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
            </select>
            <select
              v-if="greetingPersonaWorldbook"
              v-model="greetingPersonaEntry"
              style="
                width: 100%;
                padding: 8px;
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                color: #e0e0e0;
                font-size: 12px;
              "
              @change="onPersonaEntryChange"
            >
              <option value="">选择用户人设条目...</option>
              <option v-for="(entry, idx) in greetingPersonaEntries" :key="idx" :value="idx">
                {{ entry.name || entry.comment || entry.strategy?.keys?.join(', ') || `条目 ${Number(idx) + 1}` }}
              </option>
            </select>
          </div>

          <!-- 当前用户人设预览 -->
          <div style="color: #888; font-size: 12px; margin-top: 8px">
            <p style="margin: 4px 0">
              👤 用户人设：{{
                greetingUserPersona
                  ? greetingUserPersona.substring(0, 60) + (greetingUserPersona.length > 60 ? '...' : '')
                  : '无'
              }}
            </p>
          </div>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            生成需求：
          </label>
          <textarea
            v-model="greetingGenRequest"
            placeholder="描述你想要的开场白场景，例如：在咖啡厅初次见面、雨天的偶遇、深夜的酒吧相遇..."
            style="
              width: 100%;
              height: 80px;
              padding: 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              resize: vertical;
              font-family: inherit;
            "
          ></textarea>
        </div>

        <!-- 流式传输开关 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 13px; cursor: pointer">
            <input v-model="enableGreetingStreaming" type="checkbox" style="cursor: pointer" />
            启用流式传输（可查看生成进度）
          </label>
        </div>

        <!-- 进度条 -->
        <div
          v-if="isGeneratingGreeting && greetingProgressPercent > 0"
          class="progress-bar-container"
          style="margin: 15px 0"
        >
          <div
            class="progress-bar"
            style="
              position: relative;
              width: 100%;
              height: 12px;
              background: rgba(16, 185, 129, 0.1);
              border-radius: 12px;
              overflow: hidden;
            "
          >
            <div
              class="progress-fill"
              :style="{
                width: greetingProgressPercent + '%',
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                transition: 'width 0.5s ease',
                borderRadius: '12px',
              }"
            ></div>
          </div>
          <div style="display: flex; justify-content: center; margin-top: 8px">
            <span style="color: #10b981; font-size: 13px"> 生成中... {{ greetingProgressPercent.toFixed(0) }}% </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div style="display: flex; gap: 10px; margin: 15px 0">
          <button
            style="
              flex: 1;
              padding: 12px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            "
            :disabled="isGeneratingGreeting"
            @click="handleGenerateGreeting"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i :class="isGeneratingGreeting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"></i>
            {{ isGeneratingGreeting ? '生成中...' : '生成开场白' }}
          </button>
          <button
            style="
              padding: 12px 20px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="clearGreetingForm"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-eraser"></i>
          </button>
        </div>

        <!-- 生成结果 -->
        <div v-if="greetingGenOutput" class="form-group" style="margin: 15px 0">
          <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
            <span style="color: #ccc; font-size: 13px; font-weight: 500">生成结果：</span>
            <button
              style="
                padding: 4px 10px;
                background: #10b981;
                border: none;
                border-radius: 4px;
                color: white;
                font-size: 11px;
                cursor: pointer;
              "
              @click="copyGreetingOutput"
            >
              <i class="fa-solid fa-copy" style="margin-right: 4px"></i>
              复制
            </button>
          </label>
          <div
            style="
              width: 100%;
              min-height: 150px;
              max-height: 400px;
              padding: 12px;
              background: #1a1a1a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.8;
              overflow-y: auto;
              white-space: pre-wrap;
            "
          >
            {{ greetingGenOutput }}
          </div>
        </div>
      </div>
    </div>

    <!-- 世界书条目生成工具 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(84, 107, 131, 0.3);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('worldbookEntry')"
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
          <i class="fa-solid fa-book-atlas" style="color: #ffc107; font-size: 18px"></i>
          世界书条目生成工具
        </h4>
        <i
          :class="isToolExpanded('worldbookEntry') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease; font-size: 14px"
        ></i>
      </div>

      <div v-if="isToolExpanded('worldbookEntry')" class="tool-content">
        <div class="tool-instructions">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #ffc107"></i>
            输入你想要的世界书条目描述，AI 将自动生成符合格式的条目，并可插入到指定世界书中。
          </p>
          <p
            style="
              margin: 0;
              color: #4a9eff;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #ffc107;
            "
          >
            💡 示例：「生成一个关于魔法学院的条目，包含学院历史和规则」、「创建角色"艾莉丝"的背景条目」
          </p>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            条目描述：
          </label>
          <textarea
            v-model="worldbookDescription"
            placeholder="请描述你想要生成的世界书条目内容..."
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
              font-family: inherit;
            "
          ></textarea>
        </div>

        <!-- 流式传输开关 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 13px; cursor: pointer">
            <input v-model="enableWorldbookStreaming" type="checkbox" style="cursor: pointer" />
            启用流式传输（可查看生成进度）
          </label>
        </div>

        <!-- 进度条 -->
        <div
          v-if="isGeneratingWorldbook && worldbookProgressPercent > 0"
          class="progress-bar-container"
          style="margin: 15px 0"
        >
          <!-- 进度条容器 -->
          <div
            class="progress-bar"
            style="
              position: relative;
              width: 100%;
              height: 12px;
              background: rgba(255, 193, 7, 0.1);
              border-radius: 12px;
              overflow: hidden;
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
            "
          >
            <!-- 进度条背景光效 -->
            <div
              style="
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent 0%, rgba(255, 193, 7, 0.2) 50%, transparent 100%);
                background-size: 200% 100%;
                animation: progress-glow 2s linear infinite;
              "
            ></div>
            <!-- 实际进度条 -->
            <div
              class="progress-fill"
              :style="{
                position: 'relative',
                width: worldbookProgressPercent + '%',
                height: '100%',
                background: 'linear-gradient(90deg, #ffc107 0%, #ff9800 50%, #ffc107 100%)',
                backgroundSize: '200% 100%',
                animation: enableWorldbookStreaming ? 'progress-slide 2s linear infinite' : 'none',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '12px',
                boxShadow: '0 0 10px rgba(255, 193, 7, 0.5)',
              }"
            >
              <!-- 进度条内光效 -->
              <div
                style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 50%;
                  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
                  border-radius: 12px 12px 0 0;
                "
              ></div>
            </div>
          </div>
          <!-- 进度文字和动画 -->
          <div style="display: flex; justify-content: center; align-items: center; margin-top: 12px; gap: 8px">
            <span
              style="
                color: #ffc107;
                font-size: 13px;
                font-weight: 600;
                background: linear-gradient(90deg, #ffc107 0%, #ff9800 50%, #ffc107 100%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: gradient-shift 2s linear infinite;
              "
            >
              生成中... {{ worldbookProgressPercent.toFixed(0) }}%
            </span>
            <!-- 加载点动画 -->
            <div style="display: flex; gap: 4px">
              <div
                style="
                  width: 6px;
                  height: 6px;
                  background: #ffc107;
                  border-radius: 50%;
                  animation: bounce-small 1.4s ease-in-out 0s infinite;
                "
              ></div>
              <div
                style="
                  width: 6px;
                  height: 6px;
                  background: #ffc107;
                  border-radius: 50%;
                  animation: bounce-small 1.4s ease-in-out 0.2s infinite;
                "
              ></div>
              <div
                style="
                  width: 6px;
                  height: 6px;
                  background: #ffc107;
                  border-radius: 50%;
                  animation: bounce-small 1.4s ease-in-out 0.4s infinite;
                "
              ></div>
            </div>
          </div>
        </div>

        <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 20px">
          <button
            class="generate-button"
            :disabled="isGeneratingWorldbook || !worldbookDescription.trim()"
            style="
              padding: 12px 24px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="handleGenerateWorldbookEntry"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px"></i>
            {{ isGeneratingWorldbook ? '生成中...' : '生成条目' }}
          </button>

          <button
            class="batch-button"
            :disabled="isBatchGenerating"
            style="
              padding: 12px 24px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="showBatchDialog = true"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-layer-group" style="font-size: 14px; margin-right: 6px"></i>
            批量生成
          </button>

          <button
            class="clear-button"
            style="
              padding: 12px 24px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="clearWorldbookForm"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-trash" style="font-size: 14px; margin-right: 6px"></i>
            清空
          </button>
        </div>

        <!-- 🆕 从世界书加载已有条目 -->
        <div
          class="load-existing-section"
          style="margin: 20px 0; padding: 15px; background: #1e1e1e; border: 1px dashed #ffc107; border-radius: 8px"
        >
          <h5 style="margin: 0 0 12px 0; color: #ffc107; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-folder-open" style="margin-right: 6px"></i>
            从世界书加载已有条目
          </h5>
          <p style="margin: 0 0 12px 0; color: #888; font-size: 12px">
            💡 选择世界书中的已有条目，直接加载并进行 AI 修改
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end">
            <div style="flex: 1; min-width: 150px">
              <label style="display: block; margin-bottom: 4px; color: #ccc; font-size: 11px">选择世界书：</label>
              <select
                v-model="loadExistingWorldbook"
                style="
                  width: 100%;
                  padding: 8px 10px;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  border-radius: 4px;
                  color: #e0e0e0;
                  font-size: 12px;
                "
                @change="loadExistingEntriesList"
              >
                <option value="">请选择...</option>
                <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
              </select>
            </div>
            <div style="flex: 2; min-width: 200px">
              <label style="display: block; margin-bottom: 4px; color: #ccc; font-size: 11px">选择条目：</label>
              <select
                v-model="loadExistingEntryUid"
                :disabled="!loadExistingWorldbook || loadExistingEntries.length === 0"
                style="
                  width: 100%;
                  padding: 8px 10px;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  border-radius: 4px;
                  color: #e0e0e0;
                  font-size: 12px;
                "
              >
                <option value="">
                  {{
                    loadExistingWorldbook
                      ? loadExistingEntries.length > 0
                        ? '请选择条目...'
                        : '该世界书没有条目'
                      : '请先选择世界书'
                  }}
                </option>
                <option v-for="entry in loadExistingEntries" :key="entry.uid" :value="entry.uid">
                  {{ entry.comment || entry.key?.join(', ') || '(无名称)' }}
                </option>
              </select>
            </div>
            <button
              :disabled="!loadExistingEntryUid"
              style="
                padding: 8px 16px;
                background: rgba(255, 193, 7, 0.15);
                border: 1px solid #ffc107;
                border-radius: 4px;
                color: #ffc107;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
              "
              :style="{ opacity: loadExistingEntryUid ? 1 : 0.5 }"
              @click="loadExistingEntryToEdit"
            >
              <i class="fa-solid fa-download" style="margin-right: 4px"></i>
              加载
            </button>
          </div>
        </div>

        <!-- 输出区域 -->
        <div v-if="worldbookEntryOutput" class="output-section">
          <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-check-circle" style="margin-right: 6px; color: #28a745"></i>
            生成的条目：
          </h5>

          <!-- 条目预览 -->
          <div
            class="entry-preview"
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 15px;
            "
          >
            <div class="entry-field" style="margin-bottom: 10px">
              <label style="color: #ffc107; font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px"
                >条目名称：</label
              >
              <div style="color: #e0e0e0; font-size: 13px">{{ worldbookEntryOutput.name || '未命名' }}</div>
            </div>

            <div class="entry-field" style="margin-bottom: 10px">
              <label style="color: #ffc107; font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px"
                >主要关键字：</label
              >
              <div style="color: #e0e0e0; font-size: 13px">
                {{ worldbookEntryOutput.strategy?.keys?.join(', ') || '无' }}
              </div>
            </div>

            <div class="entry-field" style="margin-bottom: 10px">
              <label style="color: #ffc107; font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px"
                >条目内容：</label
              >
              <div
                style="
                  color: #e0e0e0;
                  font-size: 13px;
                  line-height: 1.6;
                  white-space: pre-wrap;
                  max-height: 200px;
                  overflow-y: auto;
                "
              >
                {{ worldbookEntryOutput.content }}
              </div>
            </div>

            <div class="entry-field">
              <label style="color: #ffc107; font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px"
                >激活策略：</label
              >
              <div style="color: #e0e0e0; font-size: 13px">
                {{
                  worldbookEntryOutput.strategy?.type === 'constant'
                    ? '🔵 常量 (蓝灯)'
                    : worldbookEntryOutput.strategy?.type === 'selective'
                      ? '🟢 可选项 (绿灯)'
                      : '🔗 向量化'
                }}
              </div>
            </div>
          </div>

          <!-- 条目修改区域 -->
          <div class="modify-section" style="margin-top: 25px; border-top: 2px dashed #3a3a3a; padding-top: 20px">
            <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-edit" style="margin-right: 6px; color: #ffa500"></i>
              修改条目
            </h5>
            <div
              class="modify-instructions"
              style="
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 15px;
              "
            >
              <p style="margin: 0 0 6px 0; color: #ccc; font-size: 12px">
                <i class="fa-solid fa-lightbulb" style="margin-right: 6px; color: #ffa500"></i>
                描述你想要修改的内容，AI会根据你的需求调整条目。例如："增加更多细节"、"改为女性角色"、"添加技能说明"等。
              </p>
              <p style="margin: 0; color: #ffa500; font-size: 11px">⚠️ 修改后会保持 JSON 格式。</p>
            </div>

            <div class="form-group" style="margin: 15px 0">
              <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
                修改需求：
              </label>
              <textarea
                v-model="worldbookModifyRequest"
                placeholder="请描述你想要修改的内容..."
                style="
                  width: 100%;
                  height: 80px;
                  padding: 12px;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  resize: vertical;
                  font-family: inherit;
                "
              ></textarea>
            </div>

            <!-- 修改进度条 -->
            <div
              v-if="isModifyingWorldbook && worldbookProgressPercent > 0"
              class="progress-bar-container"
              style="margin: 12px 0"
            >
              <div
                class="progress-bar"
                style="
                  width: 100%;
                  height: 8px;
                  background: #2a2a2a;
                  border-radius: 4px;
                  overflow: hidden;
                  position: relative;
                "
              >
                <div
                  class="progress-fill"
                  :style="{
                    width: worldbookProgressPercent + '%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #ffa500 0%, #ff8c00 50%, #ffa500 100%)',
                    backgroundSize: '200% 100%',
                    animation: enableWorldbookStreaming ? 'progress-slide 2s linear infinite' : 'none',
                    transition: 'width 0.3s ease',
                  }"
                ></div>
              </div>
              <div style="text-align: center; margin-top: 8px; color: #ffa500; font-size: 12px; font-weight: 500">
                修改中... {{ worldbookProgressPercent.toFixed(0) }}%
              </div>
            </div>

            <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 15px">
              <button
                class="modify-button"
                :disabled="isModifyingWorldbook || !worldbookModifyRequest.trim()"
                style="
                  padding: 12px 24px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                "
                @click="handleModifyWorldbookEntry"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 14px; margin-right: 6px"></i>
                {{ isModifyingWorldbook ? '修改中...' : 'AI修改' }}
              </button>

              <button
                class="clear-modify-button"
                style="
                  padding: 12px 24px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                "
                @click="clearWorldbookModifyRequest"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-eraser" style="font-size: 14px; margin-right: 6px"></i>
                清空修改需求
              </button>
            </div>
          </div>

          <!-- 世界书选择和插入 -->
          <div class="insert-section" style="background: #1a1a1a; padding: 15px; border-radius: 6px; margin-top: 20px">
            <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-file-import" style="margin-right: 6px; color: #17a2b8"></i>
              插入到世界书
            </h5>

            <div class="form-group" style="margin-bottom: 12px">
              <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
                选择世界书：
              </label>
              <select
                v-model="selectedWorldbook"
                style="
                  width: 100%;
                  padding: 10px;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                "
              >
                <option value="" disabled>请选择世界书</option>
                <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
              </select>
            </div>

            <div class="output-actions" style="display: flex; gap: 12px">
              <button
                class="insert-button"
                :disabled="!selectedWorldbook || isInsertingEntry"
                style="
                  padding: 10px 20px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                "
                @click="handleInsertEntry"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-plus-circle" style="font-size: 14px"></i>
                {{ isInsertingEntry ? '插入中...' : '插入条目' }}
              </button>

              <button
                class="copy-button"
                style="
                  padding: 10px 20px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                "
                @click="copyWorldbookEntry"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-copy" style="font-size: 14px"></i> 复制 JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 世界书条目查看器 -->
    <div class="tool-section">
      <div
        class="section-header viewer-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(84, 107, 131, 0.3);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('worldbookViewer')"
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
          <i class="fa-solid fa-list" style="color: #20c997; font-size: 18px"></i>
          世界书条目查看器
        </h4>
        <i
          :class="isToolExpanded('worldbookViewer') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #888; font-size: 14px; transition: transform 0.3s ease"
        ></i>
      </div>

      <div v-if="isToolExpanded('worldbookViewer')" class="tool-content">
        <div
          class="tool-instructions"
          style="
            background: rgba(32, 201, 151, 0.1);
            border-left: 3px solid #20c997;
            padding: 12px 15px;
            border-radius: 6px;
            margin-bottom: 20px;
          "
        >
          <p style="margin: 0; color: #a0f0e0; font-size: 13px; display: flex; align-items: center; gap: 8px">
            <i class="fa-solid fa-info-circle" style="color: #20c997"></i>
            选择一个世界书，查看其中所有条目的详细信息，支持搜索和筛选。
          </p>
        </div>

        <!-- 选择世界书 -->
        <div class="form-group" style="margin-bottom: 20px">
          <label
            style="
              display: block;
              margin-bottom: 10px;
              color: #e0e0e0;
              font-size: 14px;
              font-weight: 500;
              letter-spacing: 0.3px;
            "
          >
            选择世界书：
          </label>
          <select
            v-model="selectedViewerWorldbook"
            style="
              width: 100%;
              padding: 12px 15px;
              background: #2a2a2a;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              color: #e0e0e0;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
            "
            @change="loadWorldbookEntries"
            @focus="(e: any) => (e.target.style.borderColor = '#20c997')"
            @blur="(e: any) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')"
          >
            <option value="">请选择世界书</option>
            <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">
              {{ wb }}
            </option>
          </select>
        </div>

        <!-- 搜索条目 -->
        <div v-if="selectedViewerWorldbook" class="form-group" style="margin-bottom: 20px">
          <label
            style="
              display: block;
              margin-bottom: 10px;
              color: #e0e0e0;
              font-size: 14px;
              font-weight: 500;
              letter-spacing: 0.3px;
            "
          >
            搜索条目：
          </label>
          <input
            v-model="viewerSearchQuery"
            type="text"
            placeholder="搜索条目名称、关键字或内容..."
            style="
              width: 100%;
              padding: 12px 15px;
              background: #2a2a2a;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              color: #e0e0e0;
              font-size: 14px;
              transition: all 0.3s ease;
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
            "
            @focus="(e: any) => (e.target.style.borderColor = '#20c997')"
            @blur="(e: any) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')"
          />
        </div>

        <!-- 排序 -->
        <div
          v-if="selectedViewerWorldbook && worldbookEntries.length > 0"
          style="display: flex; gap: 10px; margin-bottom: 15px"
        >
          <button
            :style="{
              padding: '8px 16px',
              background: viewerSortBy === 'original' ? 'rgba(40, 51, 69, 0.8)' : 'rgba(30, 41, 59, 0.5)',
              border: viewerSortBy === 'original' ? '1px solid #6a6a6a' : '1px solid #4a4a4a',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }"
            @click="viewerSortBy = 'original'"
          >
            原始顺序
          </button>
          <button
            :style="{
              padding: '8px 16px',
              background: viewerSortBy === 'enabled' ? 'rgba(40, 51, 69, 0.8)' : 'rgba(30, 41, 59, 0.5)',
              border: viewerSortBy === 'enabled' ? '1px solid #6a6a6a' : '1px solid #4a4a4a',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }"
            @click="viewerSortBy = 'enabled'"
          >
            <i class="fa-solid fa-check" style="margin-right: 4px"></i>全选
          </button>
          <button
            :style="{
              padding: '8px 16px',
              background: viewerSortBy === 'disabled' ? 'rgba(40, 51, 69, 0.8)' : 'rgba(30, 41, 59, 0.5)',
              border: viewerSortBy === 'disabled' ? '1px solid #6a6a6a' : '1px solid #4a4a4a',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }"
            @click="viewerSortBy = 'disabled'"
          >
            <i class="fa-solid fa-xmark" style="margin-right: 4px"></i>取消全选
          </button>
        </div>

        <!-- 找到的条目统计 -->
        <div v-if="selectedViewerWorldbook" style="margin-bottom: 15px; color: #888; font-size: 12px">
          <span v-if="filteredWorldbookEntries.length > 0"> 共找到 {{ filteredWorldbookEntries.length }} 个条目 </span>
          <span v-else style="color: #ff6b6b">未找到条目</span>
        </div>

        <!-- 条目列表 -->
        <div v-if="filteredWorldbookEntries.length > 0" style="display: flex; flex-direction: column; gap: 12px">
          <div
            v-for="(entry, index) in filteredWorldbookEntries"
            :key="index"
            style="
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 12px;
              padding: 15px;
              transition: all 0.3s ease;
            "
          >
            <!-- 条目头部 -->
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                cursor: pointer;
                user-select: none;
              "
              @click="toggleEntryExpanded(index)"
            >
              <!-- 三行格式显示 -->
              <div style="flex: 1; line-height: 1.6">
                <!-- 第一行：状态灯 + 条目名称 -->
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px">
                  <span v-if="entry.strategy?.type === 'constant'" style="font-size: 14px">🔵</span>
                  <span v-else-if="entry.strategy?.type === 'selective'" style="font-size: 14px">🟢</span>
                  <span v-else style="font-size: 14px">⚪</span>
                  <span style="color: #fff; font-weight: 600; font-size: 14px">
                    {{ entry.name || '(无名称)' }}
                  </span>
                </div>

                <!-- 第二行：关键词 | 位置 | 深度 -->
                <div style="padding-left: 20px; margin-bottom: 6px; font-size: 12px; color: #ccc">
                  <span v-if="entry.strategy?.keys && entry.strategy.keys.length > 0">
                    关键词:
                    {{ entry.strategy.keys.map((k: any) => (typeof k === 'string' ? k : String(k))).join(', ') }}
                  </span>
                  <span v-else>关键词: (无)</span>

                  <span v-if="entry.position?.order && entry.position.order !== 0">
                    <span style="color: #666"> | </span>
                    顺序: {{ entry.position.order }}
                  </span>

                  <span
                    v-if="entry.position?.type === 'at_depth' && entry.position.depth && entry.position.depth !== 0"
                  >
                    <span style="color: #666"> | </span>
                    深度: {{ entry.position.depth }}
                  </span>
                </div>

                <!-- 第三行：内容预览 -->
                <div style="padding-left: 20px; font-size: 12px; color: #999; font-style: italic">
                  {{
                    entry.content
                      ? entry.content.length > 50
                        ? entry.content.substring(0, 50) + '...'
                        : entry.content
                      : '(无内容)'
                  }}
                </div>
              </div>

              <i
                :class="isEntryExpanded(index) ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                style="color: #888; font-size: 12px; margin-top: 2px"
              ></i>
            </div>

            <!-- 条目内容（展开时显示） -->
            <div
              v-if="isEntryExpanded(index)"
              style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #3a3a3a"
            >
              <!-- 触发策略信息 -->
              <div style="margin-bottom: 12px">
                <span style="color: #888; font-size: 12px; font-weight: 600; display: block; margin-bottom: 6px">
                  ⚙️ 触发策略：
                </span>
                <div style="display: flex; align-items: center; gap: 8px">
                  <span
                    v-if="entry.strategy?.type === 'constant'"
                    style="
                      padding: 4px 10px;
                      background: #4a9eff;
                      color: white;
                      border-radius: 12px;
                      font-size: 11px;
                      font-weight: bold;
                    "
                  >
                    🔵 蓝灯（常量）- 无需关键字匹配
                  </span>
                  <span
                    v-else-if="entry.strategy?.type === 'selective'"
                    style="
                      padding: 4px 10px;
                      background: #28a745;
                      color: white;
                      border-radius: 12px;
                      font-size: 11px;
                      font-weight: bold;
                    "
                  >
                    🟢 绿灯（可选项）- 需要关键字匹配
                  </span>
                  <span
                    v-else
                    style="
                      padding: 4px 10px;
                      background: #888;
                      color: white;
                      border-radius: 12px;
                      font-size: 11px;
                      font-weight: bold;
                    "
                  >
                    ⚪ 未知类型
                  </span>
                </div>
              </div>

              <!-- 关键字 -->
              <div style="margin-bottom: 12px">
                <span style="color: #888; font-size: 12px; font-weight: 600; display: block; margin-bottom: 6px">
                  🔑 关键字：
                  <span
                    v-if="entry.strategy?.type === 'constant'"
                    style="color: #ffa500; font-size: 10px; margin-left: 6px"
                  >
                    (蓝灯条目通常不需要关键字)
                  </span>
                </span>
                <div style="display: flex; flex-wrap: wrap; gap: 6px">
                  <span
                    v-for="(key, ki) in entry.strategy?.keys || []"
                    :key="ki"
                    style="padding: 4px 10px; background: #667eea; color: white; border-radius: 12px; font-size: 11px"
                  >
                    {{ typeof key === 'string' ? key : String(key) }}
                  </span>
                  <span
                    v-if="!entry.strategy?.keys || entry.strategy.keys.length === 0"
                    style="color: #888; font-size: 11px"
                  >
                    {{ entry.strategy?.type === 'constant' ? '(蓝灯条目无需关键字)' : '(无关键字)' }}
                  </span>
                </div>
              </div>

              <!-- 条目内容 -->
              <div style="margin-bottom: 12px">
                <span style="color: #888; font-size: 12px; font-weight: 600; display: block; margin-bottom: 6px">
                  📄 条目内容：
                </span>
                <div
                  style="
                    padding: 12px;
                    background: #1a1a1a;
                    border: 1px solid #3a3a3a;
                    border-radius: 6px;
                    color: #ccc;
                    font-size: 12px;
                    line-height: 1.6;
                    max-height: 200px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                  "
                >
                  {{ entry.content || '(无内容)' }}
                </div>
              </div>

              <!-- 操作按钮 -->
              <div style="display: flex; gap: 10px; margin-top: 12px">
                <button
                  style="
                    padding: 8px 16px;
                    background: #4a9eff;
                    border: none;
                    border-radius: 6px;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                  "
                  @click="editWorldbookEntry(entry)"
                >
                  <i class="fa-solid fa-edit"></i> 编辑
                </button>
                <button
                  style="
                    padding: 8px 16px;
                    background: #ff6b6b;
                    border: none;
                    border-radius: 6px;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                  "
                  @click="deleteWorldbookEntry(entry)"
                >
                  <i class="fa-solid fa-trash"></i> 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 世界书条目编辑对话框 -->
    <div
      v-if="showEditDialog"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
      "
      @click.self="showEditDialog = false"
    >
      <div
        style="
          background: #2a2a2a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 25px;
          max-width: 700px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        "
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
          <h3 style="margin: 0; color: #fff; font-size: 18px; font-weight: 600">
            <i class="fa-solid fa-edit" style="margin-right: 8px; color: #4a9eff"></i>
            编辑世界书条目
          </h3>
          <button
            style="
              background: transparent;
              border: none;
              color: #888;
              font-size: 20px;
              cursor: pointer;
              padding: 5px 10px;
              transition: color 0.2s;
            "
            @click="showEditDialog = false"
            @mouseenter="(e: any) => (e.target.style.color = '#fff')"
            @mouseleave="(e: any) => (e.target.style.color = '#888')"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 15px">
          <!-- 条目名称 -->
          <div>
            <label style="display: block; margin-bottom: 8px; color: #e0e0e0; font-size: 14px; font-weight: 500">
              条目名称：
            </label>
            <input
              v-model="editingEntry.name"
              type="text"
              style="
                width: 100%;
                padding: 12px;
                background: #1a1a1a;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #e0e0e0;
                font-size: 14px;
              "
            />
          </div>

          <!-- 启用状态 -->
          <div style="display: flex; align-items: center; gap: 10px">
            <input
              id="entry-enabled"
              v-model="editingEntry.enabled"
              type="checkbox"
              style="width: 18px; height: 18px; cursor: pointer"
            />
            <label for="entry-enabled" style="color: #e0e0e0; font-size: 14px; cursor: pointer"> 启用此条目 </label>
          </div>

          <!-- 主要关键字 -->
          <div>
            <label style="display: block; margin-bottom: 8px; color: #e0e0e0; font-size: 14px; font-weight: 500">
              主要关键字：
            </label>
            <input
              :value="
                (editingEntry.strategy?.keys || []).map((k: any) => (typeof k === 'string' ? k : String(k))).join(',')
              "
              type="text"
              placeholder="用逗号分隔，如：艾莉娅,Aria,精灵,{{char}}"
              style="
                width: 100%;
                padding: 12px;
                background: #1a1a1a;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #e0e0e0;
                font-size: 14px;
              "
              @input="
                (e: any) => {
                  const keys = e.target.value
                    .split(',')
                    .filter((k: string) => k.trim())
                    .map((k: string) => k.trim());
                  editingEntry.strategy = {
                    ...editingEntry.strategy,
                    keys: keys,
                    keys_secondary: editingEntry.strategy?.keys_secondary || { logic: 'and_any', keys: [] },
                    scan_depth: editingEntry.strategy?.scan_depth || 'same_as_global',
                    type: editingEntry.strategy?.type || 'selective',
                  };
                }
              "
            />
          </div>

          <!-- 触发类型 -->
          <div>
            <label style="display: block; margin-bottom: 8px; color: #e0e0e0; font-size: 14px; font-weight: 500">
              触发类型：
            </label>
            <select
              :value="editingEntry.strategy?.type || 'selective'"
              style="
                width: 100%;
                padding: 12px;
                background: #1a1a1a;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #e0e0e0;
                font-size: 14px;
                cursor: pointer;
              "
              @change="
                (e: any) =>
                  (editingEntry.strategy = {
                    ...editingEntry.strategy,
                    type: e.target.value,
                    keys: editingEntry.strategy?.keys || [],
                    keys_secondary: editingEntry.strategy?.keys_secondary || { logic: 'and_any', keys: [] },
                    scan_depth: editingEntry.strategy?.scan_depth || 'same_as_global',
                  })
              "
            >
              <option value="selective">绿灯 (可选项)</option>
              <option value="constant">蓝灯 (常量)</option>
            </select>
          </div>

          <!-- 插入位置 -->
          <div>
            <label style="display: block; margin-bottom: 8px; color: #e0e0e0; font-size: 14px; font-weight: 500">
              插入位置：
            </label>
            <select
              :value="editingEntry.position?.type || 'before_character_definition'"
              style="
                width: 100%;
                padding: 12px;
                background: #1a1a1a;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #e0e0e0;
                font-size: 14px;
                cursor: pointer;
              "
              @change="
                (e: any) =>
                  (editingEntry.position = {
                    ...editingEntry.position,
                    type: e.target.value,
                    role: editingEntry.position?.role || 'system',
                    depth: editingEntry.position?.depth || 0,
                    order: editingEntry.position?.order || 0,
                  })
              "
            >
              <option value="before_character_definition">角色定义之前</option>
              <option value="after_character_definition">角色定义之后</option>
              <option value="before_example_messages">示例消息之前</option>
              <option value="after_example_messages">示例消息之后</option>
              <option value="before_author_note">作者注释之前</option>
              <option value="after_author_note">作者注释之后</option>
              <option value="at_depth">插入到指定深度</option>
            </select>
          </div>

          <!-- 深度和顺序 -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
            <div>
              <label style="display: block; margin-bottom: 8px; color: #e0e0e0; font-size: 14px; font-weight: 500">
                深度：
              </label>
              <input
                :value="editingEntry.position?.depth || 0"
                type="number"
                style="
                  width: 100%;
                  padding: 12px;
                  background: #1a1a1a;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  border-radius: 12px;
                  color: #e0e0e0;
                  font-size: 14px;
                "
                @input="
                  (e: any) =>
                    (editingEntry.position = {
                      ...editingEntry.position,
                      depth: Number(e.target.value) || 0,
                      role: editingEntry.position?.role || 'system',
                      order: editingEntry.position?.order || 0,
                      type: editingEntry.position?.type || 'before_character_definition',
                    })
                "
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; color: #e0e0e0; font-size: 14px; font-weight: 500">
                顺序：
              </label>
              <input
                :value="editingEntry.position?.order || 0"
                type="number"
                style="
                  width: 100%;
                  padding: 12px;
                  background: #1a1a1a;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  border-radius: 12px;
                  color: #e0e0e0;
                  font-size: 14px;
                "
                @input="
                  (e: any) =>
                    (editingEntry.position = {
                      ...editingEntry.position,
                      order: Number(e.target.value) || 0,
                      type: editingEntry.position?.type || 'before_character_definition',
                      role: editingEntry.position?.role || 'system',
                      depth: editingEntry.position?.depth || 0,
                    })
                "
              />
            </div>
          </div>

          <!-- 递归设置 -->
          <div
            style="background: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1)"
          >
            <label style="display: block; margin-bottom: 12px; color: #e0e0e0; font-size: 14px; font-weight: 600">
              递归设置：
            </label>
            <div style="display: flex; flex-direction: column; gap: 10px">
              <label
                style="color: #ccc; font-size: 13px; display: flex; align-items: center; gap: 10px; cursor: pointer"
              >
                <input
                  type="checkbox"
                  :checked="editingEntry.recursion?.prevent_incoming || false"
                  @change="
                    (e: any) =>
                      (editingEntry.recursion = {
                        ...editingEntry.recursion,
                        prevent_incoming: e.target.checked,
                        prevent_outgoing: editingEntry.recursion?.prevent_outgoing || false,
                        delay_until: editingEntry.recursion?.delay_until || null,
                      })
                  "
                />
                禁止其他条目递归激活本条目
              </label>
              <label
                style="color: #ccc; font-size: 13px; display: flex; align-items: center; gap: 10px; cursor: pointer"
              >
                <input
                  type="checkbox"
                  :checked="editingEntry.recursion?.prevent_outgoing || false"
                  @change="
                    (e: any) =>
                      (editingEntry.recursion = {
                        ...editingEntry.recursion,
                        prevent_outgoing: e.target.checked,
                        prevent_incoming: editingEntry.recursion?.prevent_incoming || false,
                        delay_until: editingEntry.recursion?.delay_until || null,
                      })
                  "
                />
                禁止本条目递归激活其他条目
              </label>
              <div>
                <label style="color: #ccc; font-size: 13px; display: block; margin-bottom: 5px">
                  延迟到第 n 级递归：
                </label>
                <input
                  :value="editingEntry.recursion?.delay_until || ''"
                  type="number"
                  placeholder="留空表示不延迟"
                  style="
                    width: 100%;
                    padding: 8px;
                    background: #2a2a2a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: #e0e0e0;
                    font-size: 13px;
                  "
                  @input="
                    (e: any) =>
                      (editingEntry.recursion = {
                        ...editingEntry.recursion,
                        delay_until: e.target.value === '' ? null : Number(e.target.value),
                        prevent_incoming: editingEntry.recursion?.prevent_incoming || false,
                        prevent_outgoing: editingEntry.recursion?.prevent_outgoing || false,
                      })
                  "
                />
              </div>
            </div>
          </div>

          <!-- 条目内容 -->
          <div>
            <label style="display: block; margin-bottom: 8px; color: #e0e0e0; font-size: 14px; font-weight: 500">
              条目内容：
            </label>
            <textarea
              v-model="editingEntry.content"
              style="
                width: 100%;
                min-height: 200px;
                padding: 12px;
                background: #1a1a1a;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #e0e0e0;
                font-size: 14px;
                resize: vertical;
                font-family: inherit;
              "
            ></textarea>
          </div>
        </div>

        <!-- 对话框按钮 -->
        <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end">
          <button
            style="
              padding: 10px 20px;
              background: #444;
              border: none;
              border-radius: 12px;
              color: white;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
            "
            @click="showEditDialog = false"
            @mouseenter="(e: any) => (e.target.style.background = '#555')"
            @mouseleave="(e: any) => (e.target.style.background = '#444')"
          >
            取消
          </button>
          <button
            style="
              padding: 10px 20px;
              background: #4a9eff;
              border: none;
              border-radius: 12px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            "
            @click="saveEditedEntry"
            @mouseenter="(e: any) => (e.target.style.background = '#5ba8ff')"
            @mouseleave="(e: any) => (e.target.style.background = '#4a9eff')"
          >
            <i class="fa-solid fa-save" style="margin-right: 6px"></i>
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 角色卡生成工具 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(84, 107, 131, 0.3);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('characterCard')"
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
          <i class="fa-solid fa-user-plus" style="color: #17a2b8; font-size: 18px"></i>
          角色卡生成工具
        </h4>
        <i
          :class="isToolExpanded('characterCard') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease; font-size: 14px"
        ></i>
      </div>

      <div v-if="isToolExpanded('characterCard')" class="tool-content">
        <div class="tool-instructions">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #17a2b8"></i>
            输入角色描述，AI将自动生成角色卡（YAML 格式，纯中文）。
          </p>
          <p
            style="
              margin: 0 0 6px 0;
              color: #4a9eff;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #17a2b8;
            "
          >
            💡 包含内容：基础信息、外貌身材、核心性格、对话风格、背景经历、人际关系、演绎指导
          </p>
          <p
            style="
              margin: 0 0 6px 0;
              color: #ffa500;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #ffa500;
            "
          >
            ⚠️ 注意：身高体重使用文字描述（如"高大匀称"），避免AI刻板化，有性格对立面和修复机制
          </p>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            角色描述：
          </label>
          <textarea
            v-model="characterDescription"
            placeholder="请描述角色的基本信息，如外观、性格、背景等..."
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
              font-family: inherit;
            "
          ></textarea>
        </div>

        <!-- 流式传输开关 -->
        <div class="form-group" style="margin: 15px 0">
          <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 13px; cursor: pointer">
            <input v-model="enableCharacterStreaming" type="checkbox" style="cursor: pointer" />
            启用流式传输（可查看生成进度）
          </label>
        </div>

        <!-- 进度条 -->
        <div
          v-if="isGeneratingCharacter && characterProgressPercent > 0"
          class="progress-bar-container"
          style="margin: 15px 0"
        >
          <!-- 进度条容器 -->
          <div
            class="progress-bar"
            style="
              position: relative;
              width: 100%;
              height: 12px;
              background: rgba(23, 162, 184, 0.1);
              border-radius: 12px;
              overflow: hidden;
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
            "
          >
            <!-- 进度条背景光效 -->
            <div
              style="
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent 0%, rgba(23, 162, 184, 0.2) 50%, transparent 100%);
                background-size: 200% 100%;
                animation: progress-glow 2s linear infinite;
              "
            ></div>
            <!-- 实际进度条 -->
            <div
              class="progress-fill"
              :style="{
                position: 'relative',
                width: characterProgressPercent + '%',
                height: '100%',
                background: 'linear-gradient(90deg, #17a2b8 0%, #138496 50%, #17a2b8 100%)',
                backgroundSize: '200% 100%',
                animation: enableCharacterStreaming ? 'progress-slide 2s linear infinite' : 'none',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '12px',
                boxShadow: '0 0 10px rgba(23, 162, 184, 0.5)',
              }"
            >
              <!-- 进度条内光效 -->
              <div
                style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 50%;
                  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
                  border-radius: 12px 12px 0 0;
                "
              ></div>
            </div>
          </div>
          <!-- 进度文字和动画 -->
          <div style="display: flex; justify-content: center; align-items: center; margin-top: 12px; gap: 8px">
            <span
              style="
                color: #17a2b8;
                font-size: 13px;
                font-weight: 600;
                background: linear-gradient(90deg, #17a2b8 0%, #138496 50%, #17a2b8 100%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: gradient-shift 2s linear infinite;
              "
            >
              生成中... {{ characterProgressPercent.toFixed(0) }}%
            </span>
            <!-- 加载点动画 -->
            <div style="display: flex; gap: 4px">
              <div
                style="
                  width: 6px;
                  height: 6px;
                  background: #17a2b8;
                  border-radius: 50%;
                  animation: bounce-small 1.4s ease-in-out 0s infinite;
                "
              ></div>
              <div
                style="
                  width: 6px;
                  height: 6px;
                  background: #17a2b8;
                  border-radius: 50%;
                  animation: bounce-small 1.4s ease-in-out 0.2s infinite;
                "
              ></div>
              <div
                style="
                  width: 6px;
                  height: 6px;
                  background: #17a2b8;
                  border-radius: 50%;
                  animation: bounce-small 1.4s ease-in-out 0.4s infinite;
                "
              ></div>
            </div>
          </div>
        </div>

        <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 20px">
          <button
            class="generate-button"
            :disabled="isGeneratingCharacter || !characterDescription.trim()"
            style="
              padding: 12px 24px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="handleGenerateCharacterCard"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px"></i>
            {{ isGeneratingCharacter ? '生成中...' : '生成角色卡' }}
          </button>

          <button
            class="clear-button"
            style="
              padding: 12px 24px;
              background: rgba(30, 41, 59, 0.5);
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="clearCharacterForm"
            @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
            @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
          >
            <i class="fa-solid fa-trash" style="font-size: 14px; margin-right: 6px"></i>
            清空
          </button>
        </div>

        <!-- 输出区域 -->
        <div v-if="characterCardOutput" class="output-section">
          <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-check-circle" style="margin-right: 6px; color: #28a745"></i>
            生成的角色卡：
          </h5>
          <div
            class="output-content"
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              padding: 15px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
              word-wrap: break-word;
              max-height: 300px;
              overflow-y: auto;
            "
          >
            {{ characterCardOutput }}
          </div>

          <div class="output-actions" style="margin-top: 12px; display: flex; gap: 12px">
            <button
              class="copy-button"
              style="
                padding: 10px 20px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
              "
              @click="copyCharacterCard"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-copy" style="font-size: 14px"></i> 复制角色卡
            </button>
          </div>

          <!-- 插入到角色卡/世界书 -->
          <div
            class="insert-section"
            style="
              margin-top: 20px;
              padding: 15px;
              background: rgba(23, 162, 184, 0.1);
              border: 1px solid rgba(23, 162, 184, 0.3);
              border-radius: 8px;
            "
          >
            <h5 style="margin: 0 0 12px 0; color: #17a2b8; font-size: 13px; font-weight: 600">
              <i class="fa-solid fa-file-import" style="margin-right: 6px"></i>
              插入生成内容
            </h5>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 10px">
              <select
                v-model="characterInsertPosition"
                style="
                  flex: 1;
                  min-width: 200px;
                  padding: 8px 12px;
                  background: #1a1a1a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 12px;
                "
              >
                <option v-for="pos in characterInsertPositions" :key="pos.value" :value="pos.value">
                  {{ pos.label }}
                </option>
              </select>
              <button
                :disabled="
                  isInsertingCharacter || (characterInsertPosition === 'worldbook' && !characterInsertWorldbook)
                "
                style="
                  padding: 8px 16px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 12px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  white-space: nowrap;
                "
                @click="insertCharacterCard"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-download" style="margin-right: 6px"></i>
                {{ isInsertingCharacter ? '插入中...' : '插入' }}
              </button>
            </div>
            <!-- 世界书选择（仅当选择世界书时显示） -->
            <div v-if="characterInsertPosition === 'worldbook'" style="margin-bottom: 10px">
              <select
                v-model="characterInsertWorldbook"
                style="
                  width: 100%;
                  padding: 8px 12px;
                  background: #1a1a1a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 12px;
                "
              >
                <option value="">选择目标世界书...</option>
                <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
              </select>
            </div>
            <p style="margin: 0; color: #888; font-size: 11px">
              {{
                characterInsertPosition === 'worldbook'
                  ? '📚 将作为新条目插入到所选世界书'
                  : '⚠️ 插入会覆盖所选位置的原有内容'
              }}
            </p>
          </div>

          <!-- 角色卡修改区域 -->
          <div class="modify-section" style="margin-top: 25px; border-top: 2px dashed #3a3a3a; padding-top: 20px">
            <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-edit" style="margin-right: 6px; color: #ffa500"></i>
              修改角色卡
            </h5>
            <div
              class="modify-instructions"
              style="
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 15px;
              "
            >
              <p style="margin: 0 0 6px 0; color: #ccc; font-size: 12px">
                <i class="fa-solid fa-lightbulb" style="margin-right: 6px; color: #ffa500"></i>
                描述你想要修改的内容，AI会根据你的需求调整角色卡。例如："让角色更活泼一些"、"增加魔法技能"、"改为女性角色"等。
              </p>
              <p style="margin: 0; color: #ffa500; font-size: 11px">⚠️ 修改后会保持 YAML 格式和中文字段。</p>
            </div>

            <div class="form-group" style="margin: 15px 0">
              <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
                修改需求：
              </label>
              <textarea
                v-model="modifyRequest"
                placeholder="请描述你想要修改的内容..."
                style="
                  width: 100%;
                  height: 80px;
                  padding: 12px;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  resize: vertical;
                  font-family: inherit;
                "
              ></textarea>
            </div>

            <!-- 修改进度条 -->
            <div
              v-if="isModifyingCharacter && characterProgressPercent > 0"
              class="progress-bar-container"
              style="margin: 15px 0"
            >
              <!-- 进度条容器 -->
              <div
                class="progress-bar"
                style="
                  position: relative;
                  width: 100%;
                  height: 12px;
                  background: rgba(23, 162, 184, 0.1);
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                "
              >
                <!-- 进度条背景光效 -->
                <div
                  style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent 0%, rgba(23, 162, 184, 0.2) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: progress-glow 2s linear infinite;
                  "
                ></div>
                <!-- 实际进度条 -->
                <div
                  class="progress-fill"
                  :style="{
                    position: 'relative',
                    width: characterProgressPercent + '%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #17a2b8 0%, #138496 50%, #17a2b8 100%)',
                    backgroundSize: '200% 100%',
                    animation: enableCharacterStreaming ? 'progress-slide 2s linear infinite' : 'none',
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '12px',
                    boxShadow: '0 0 10px rgba(23, 162, 184, 0.5)',
                  }"
                >
                  <!-- 进度条内光效 -->
                  <div
                    style="
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 50%;
                      background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
                      border-radius: 12px 12px 0 0;
                    "
                  ></div>
                </div>
              </div>
              <!-- 进度文字和动画 -->
              <div style="display: flex; justify-content: center; align-items: center; margin-top: 12px; gap: 8px">
                <span
                  style="
                    color: #17a2b8;
                    font-size: 13px;
                    font-weight: 600;
                    background: linear-gradient(90deg, #17a2b8 0%, #138496 50%, #17a2b8 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-shift 2s linear infinite;
                  "
                >
                  修改中... {{ characterProgressPercent.toFixed(0) }}%
                </span>
                <!-- 加载点动画 -->
                <div style="display: flex; gap: 4px">
                  <div
                    style="
                      width: 6px;
                      height: 6px;
                      background: #17a2b8;
                      border-radius: 50%;
                      animation: bounce-small 1.4s ease-in-out 0s infinite;
                    "
                  ></div>
                  <div
                    style="
                      width: 6px;
                      height: 6px;
                      background: #17a2b8;
                      border-radius: 50%;
                      animation: bounce-small 1.4s ease-in-out 0.2s infinite;
                    "
                  ></div>
                  <div
                    style="
                      width: 6px;
                      height: 6px;
                      background: #17a2b8;
                      border-radius: 50%;
                      animation: bounce-small 1.4s ease-in-out 0.4s infinite;
                    "
                  ></div>
                </div>
              </div>
            </div>

            <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 15px">
              <button
                class="modify-button"
                :disabled="isModifyingCharacter || !modifyRequest.trim()"
                style="
                  padding: 12px 24px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                "
                @click="handleModifyCharacterCard"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 14px; margin-right: 6px"></i>
                {{ isModifyingCharacter ? '修改中...' : 'AI修改' }}
              </button>

              <button
                class="clear-modify-button"
                style="
                  padding: 12px 24px;
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid #4a4a4a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                "
                @click="clearModifyRequest"
                @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
                @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
              >
                <i class="fa-solid fa-eraser" style="font-size: 14px; margin-right: 6px"></i>
                清空修改需求
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 前端界面生成器 -->
    <div class="tool-section">
      <div
        class="section-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2a3a4a 0%, #3a4a5a 100%);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(84, 107, 131, 0.3);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('uiGenerator')"
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
          <i class="fa-solid fa-palette" style="color: #4a9eff; font-size: 18px"></i>
          前端界面生成器
        </h4>
        <i
          :class="isToolExpanded('uiGenerator') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease; font-size: 14px"
        ></i>
      </div>

      <div v-if="isToolExpanded('uiGenerator')" class="tool-content">
        <UIGenerator />
      </div>
    </div>

    <!-- 批量生成对话框 -->
    <div
      v-if="showBatchDialog"
      class="batch-dialog-overlay"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      "
      @click.self="!isBatchGenerating && (showBatchDialog = false)"
    >
      <div
        class="batch-dialog"
        style="
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          background: #2a2a2a;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        "
      >
        <!-- 对话框头部 -->
        <div
          style="
            padding: 16px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600">
            <i class="fa-solid fa-layer-group" style="margin-right: 8px"></i>
            批量生成世界书条目
          </h3>
          <button
            v-if="!isBatchGenerating"
            style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px"
            @click="showBatchDialog = false"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- 对话框内容 -->
        <div style="padding: 20px; max-height: calc(80vh - 140px); overflow-y: auto">
          <div v-if="!isBatchGenerating && batchResults.length === 0">
            <p style="color: #ccc; font-size: 13px; margin-bottom: 12px">
              <i class="fa-solid fa-info-circle" style="color: #667eea; margin-right: 6px"></i>
              输入一段完整的设定文本，AI 将自动拆分并生成多个世界书条目。
            </p>
            <p
              style="
                color: #888;
                font-size: 12px;
                margin-bottom: 16px;
                background: #1a1a1a;
                padding: 8px;
                border-radius: 4px;
                border-left: 3px solid #667eea;
              "
            >
              💡
              示例：「魔法学院位于云端之上，由大魔导师艾莉创立于千年前。学院分为火、水、风、土四系，每系都有独立的塔楼。学院禁止黑魔法，违者终身禁入。」
            </p>
            <textarea
              v-model="batchInput"
              placeholder="请输入完整的设定文本，AI 将自动拆分成多个条目..."
              style="
                width: 100%;
                height: 200px;
                padding: 12px;
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 16px;
                resize: vertical;
                font-family: inherit;
                box-sizing: border-box;
                -webkit-appearance: none;
                appearance: none;
              "
            ></textarea>
          </div>

          <!-- 生成进度 -->
          <div v-if="isBatchGenerating" style="text-align: center; padding: 20px 0">
            <div style="margin-bottom: 16px">
              <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: #667eea"></i>
            </div>
            <p style="color: #ccc; font-size: 14px; margin-bottom: 8px">
              正在生成第 {{ batchProgress.current }} / {{ batchProgress.total }} 个条目
            </p>
            <p style="color: #888; font-size: 12px">
              {{ batchProgress.currentName || '准备中...' }}
            </p>
            <div style="margin-top: 16px; background: #1a1a1a; height: 8px; border-radius: 4px; overflow: hidden">
              <div
                :style="{
                  width: (batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0) + '%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  transition: 'width 0.3s ease',
                }"
              ></div>
            </div>
          </div>

          <!-- 生成结果 -->
          <div v-if="!isBatchGenerating && batchResults.length > 0">
            <p style="color: #51cf66; font-size: 14px; margin-bottom: 16px">
              <i class="fa-solid fa-check-circle" style="margin-right: 6px"></i>
              成功生成 {{ batchResults.length }} 个条目
            </p>
            <div style="max-height: 300px; overflow-y: auto">
              <div
                v-for="(entry, index) in batchResults"
                :key="index"
                style="
                  background: #1a1a1a;
                  padding: 12px;
                  border-radius: 6px;
                  margin-bottom: 8px;
                  border-left: 3px solid #667eea;
                "
              >
                <div style="color: #fff; font-weight: 600; margin-bottom: 4px">{{ entry.name || '未命名条目' }}</div>
                <div style="color: #888; font-size: 12px">关键词: {{ getEntryKeys(entry) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 对话框底部 -->
        <div
          style="
            padding: 16px 20px;
            background: #1a1a1a;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
          "
        >
          <!-- 🔥 在弹窗中直接选择世界书，优化用户体验 -->
          <div v-if="!isBatchGenerating && batchResults.length > 0" style="flex: 1; min-width: 200px">
            <select
              v-model="selectedWorldbook"
              style="
                width: 100%;
                padding: 10px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
              "
            >
              <option value="" disabled>选择目标世界书...</option>
              <option v-for="wb in availableWorldbooks" :key="wb" :value="wb">{{ wb }}</option>
            </select>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <button
              v-if="!isBatchGenerating && batchResults.length === 0"
              :disabled="!batchInput.trim()"
              style="
                padding: 10px 20px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              "
              :style="{ opacity: !batchInput.trim() ? 0.5 : 1 }"
              @click="handleBatchGenerate"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-magic" style="margin-right: 6px"></i>
              开始批量生成
            </button>
            <button
              v-if="!isBatchGenerating && batchResults.length > 0"
              style="
                padding: 10px 20px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              "
              @click="handleBatchInsert"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-plus" style="margin-right: 6px"></i>
              全部插入到世界书
            </button>
            <button
              v-if="!isBatchGenerating && batchResults.length > 0"
              style="
                padding: 10px 20px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              "
              @click="clearBatchResults"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-trash" style="margin-right: 6px"></i>
              清空
            </button>
            <button
              v-if="isBatchGenerating"
              style="
                padding: 10px 20px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              "
              @click="minimizeBatchDialog"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              <i class="fa-solid fa-window-minimize" style="margin-right: 6px"></i>
              后台运行
            </button>
            <button
              v-if="!isBatchGenerating"
              style="
                padding: 10px 20px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #4a4a4a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              "
              @click="closeBatchDialog"
              @mouseenter="$event.target.style.background = 'rgba(40, 51, 69, 0.7)'"
              @mouseleave="$event.target.style.background = 'rgba(30, 41, 59, 0.5)'"
            >
              {{ batchResults.length > 0 ? '关闭' : '取消' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { useI18n } from '../i18n';
import { detectApiProvider, filterApiParams, normalizeApiEndpoint, useSettingsStore } from '../settings';
import { copyToClipboard, getScriptIdSafe } from '../utils';
import { callAIWithTavernSupport } from '../utils/api';
import { translateError } from '../utils/error-handler';
import QuickGuide from './QuickGuide.vue';
import UIGenerator from './UIGenerator.vue';

// 国际化
const { t } = useI18n();

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

// 响应式数据
const toolExpandedState = ref(new Map<string, boolean>());
const antiClicheInput = ref('');
const antiClicheOutput = ref('');
const isProcessingAntiCliche = ref(false);
const enableAntiClicheStreaming = ref(false); // 反八股是否启用流式传输
const antiClicheProgressPercent = ref(0); // 反八股处理进度
const antiClicheModifyRequest = ref(''); // 反八股修改需求
const isModifyingAntiCliche = ref(false); // 是否正在修改
const antiClicheLevel = ref<'light' | 'moderate' | 'deep'>('moderate'); // 清理强度
const antiClicheWorldbook = ref(''); // 反八股读取的世界书

// 清理强度选项
const antiClicheLevels = [
  {
    value: 'light',
    label: '轻度',
    icon: 'fa-solid fa-feather',
    color: '#10b981',
    desc: '只删除最明显的套话词汇，保留大部分文学表达',
  },
  {
    value: 'moderate',
    label: '适度',
    icon: 'fa-solid fa-balance-scale',
    color: '#667eea',
    desc: '删除八股词汇和文学腔，保持信息量',
  },
  {
    value: 'deep',
    label: '深度',
    icon: 'fa-solid fa-fire',
    color: '#ff6b6b',
    desc: '彻底清理所有八股表述，转为简洁人话',
  },
] as const;

// 清理强度描述
const antiClicheLevelDescription = computed(() => {
  return antiClicheLevels.find(l => l.value === antiClicheLevel.value)?.desc || '';
});
const characterDescription = ref('');
const characterCardOutput = ref('');
const isGeneratingCharacter = ref(false);
const modifyRequest = ref('');
const isModifyingCharacter = ref(false);
const enableCharacterStreaming = ref(false); // 角色卡生成是否启用流式传输
const characterProgressPercent = ref(0); // 角色卡生成进度
const characterInsertPosition = ref('description'); // 角色卡插入位置
const isInsertingCharacter = ref(false); // 是否正在插入角色卡
const characterInsertWorldbook = ref(''); // 插入世界书时选择的世界书

// NPC 快速生成工具相关
const npcDescription = ref('');
const npcOutput = ref('');
const isGeneratingNpc = ref(false);
const npcProgressPercent = ref(0);
const enableNpcStreaming = ref(false);
const npcInsertWorldbook = ref('');
const npcContext = ref(''); // NPC 生成的背景参考
const npcContextWorldbook = ref(''); // 选择的世界书
// 🆕 NPC 模板和批量生成
const npcTemplateType = ref<'simple' | 'detailed' | 'dialogue' | 'custom'>('simple');
const npcCustomTemplate = ref('');
const npcBatchCount = ref(3); // 批量生成数量
const isBatchGeneratingNpc = ref(false);
const npcBatchProgress = ref({ current: 0, total: 0, currentName: '' });
const npcBatchResults = ref<string[]>([]);
const showNpcBatchDialog = ref(false);
const npcMaxTokens = ref(1000); // 🆕 用户可配置的 Token 限制
const npcTemplates = [
  { value: 'simple', label: '🎯 简洁版', desc: '姓名+外貌+性格+关系（约150字）' },
  { value: 'detailed', label: '📖 详细版', desc: '完整设定含背景故事（约300字）' },
  { value: 'dialogue', label: '💬 对话风格', desc: '含口头禅和说话方式（约200字）' },
  { value: 'custom', label: '✏️ 自定义', desc: '使用你自己的模板' },
] as const;

// Token 压缩工具相关
const tokenCompressInput = ref('');
const tokenCompressOutput = ref('');
const isCompressingToken = ref(false);
const tokenCompressProgress = ref(0);
const tokenCompressWorldbook = ref('');
const tokenCompressLevel = ref<'light' | 'moderate' | 'aggressive'>('moderate');
const tokenCompressLevels = [
  { value: 'light', label: '轻度 (保留细节)', color: '#10b981' },
  { value: 'moderate', label: '适度 (平衡)', color: '#ffc107' },
  { value: 'aggressive', label: '激进 (极简)', color: '#dc3545' },
];

// 角色关系分析工具相关
const relationIncludeChar = ref(true);
const relationWorldbook = ref('');
const relationOutput = ref('');
const isAnalyzingRelation = ref(false);
const relationProgress = ref(0);
const relationInsertWorldbook = ref('');
const isInsertingRelation = ref(false);

const characterInsertPositions = [
  { value: 'description', label: '📝 角色描述 (Description)', type: 'char' },
  { value: 'personality', label: '💭 角色性格 (Personality)', type: 'char' },
  { value: 'scenario', label: '🎬 场景 (Scenario)', type: 'char' },
  { value: 'first_mes', label: '💬 首条消息 (First Message)', type: 'char' },
  { value: 'mes_example', label: '📖 示例对话 (Example Messages)', type: 'char' },
  { value: 'system_prompt', label: '⚙️ 系统提示词 (System Prompt)', type: 'char' },
  { value: 'post_history_instructions', label: '🔓 后历史指令 (Jailbreak)', type: 'char' },
  { value: 'creator_notes', label: '📋 创作者备注 (Creator Notes)', type: 'char' },
  { value: 'worldbook', label: '📚 世界书条目 (新建)', type: 'worldbook' },
];

// 开场白生成工具相关
const greetingGenRequest = ref('');
const greetingGenOutput = ref('');
const isGeneratingGreeting = ref(false);
const enableGreetingStreaming = ref(false);
const greetingProgressPercent = ref(0);
const greetingCharName = ref('');
const greetingUserPersona = ref('');
const greetingPersonaSource = ref<'tavern' | 'worldbook'>('tavern');
const greetingPersonaSources = [
  { value: 'tavern', label: '酒馆用户设定' },
  { value: 'worldbook', label: '世界书条目' },
];
const greetingPersonaWorldbook = ref('');
const greetingPersonaEntry = ref('');
const greetingPersonaEntries = ref<any[]>([]);

// 世界书条目生成工具相关
const worldbookDescription = ref('');
const worldbookEntryOutput = ref<Partial<WorldbookEntry> | null>(null);
const isGeneratingWorldbook = ref(false);
const availableWorldbooks = ref<string[]>([]);
const selectedWorldbook = ref('');
const isInsertingEntry = ref(false);
const worldbookModifyRequest = ref('');
const isModifyingWorldbook = ref(false);
const enableWorldbookStreaming = ref(false); // 世界书条目生成是否启用流式传输
const worldbookProgressPercent = ref(0); // 世界书条目生成进度

// 🆕 加载已有条目相关
const loadExistingWorldbook = ref(''); // 选择的世界书
const loadExistingEntryUid = ref<number | string>(''); // 选择的条目 UID
const loadExistingEntries = ref<any[]>([]); // 条目列表

// 批量生成相关
const showBatchDialog = ref(false);
const batchInput = ref('');
const isBatchGenerating = ref(false);
const batchProgress = ref({ current: 0, total: 0, currentName: '' });
const batchResults = ref<Array<Partial<WorldbookEntry>>>([]);

// 世界书查看器相关
const selectedViewerWorldbook = ref('');
const worldbookEntries = ref<WorldbookEntry[]>([]);
const viewerSearchQuery = ref('');
const viewerSortBy = ref<'original' | 'enabled' | 'disabled'>('original');
const entryExpandedState = ref(new Map<number, boolean>());

// 编辑对话框相关
const showEditDialog = ref(false);
const editingEntry = ref<Partial<WorldbookEntry>>({});
const editingEntryUid = ref<number | null>(null);

// 标志位：是否已完成初始加载（避免加载时触发保存）
const isDataLoaded = ref(false);

// 加载可用的世界书列表（插件环境使用 TavernHelper）
const loadAvailableWorldbooks = () => {
  try {
    const tav = (window as any).TavernHelper;
    // 插件环境：优先使用新 API getWorldbookNames()，回退到旧 API getLorebooks()
    if (typeof tav?.getWorldbookNames === 'function') {
      availableWorldbooks.value = tav.getWorldbookNames();
      console.log('✅ 已加载世界书列表 (getWorldbookNames):', availableWorldbooks.value);
    } else if (typeof tav?.getLorebooks === 'function') {
      availableWorldbooks.value = tav.getLorebooks();
      console.log('✅ 已加载世界书列表 (getLorebooks - 旧版 API):', availableWorldbooks.value);
    } else {
      availableWorldbooks.value = [];
      console.warn('⚠️ TavernHelper 不可用，世界书功能受限');
    }
  } catch (error) {
    console.error('❌ 加载世界书列表失败:', error);
    availableWorldbooks.value = [];
  }
};

// 🆕 加载已有条目列表
const loadExistingEntriesList = async () => {
  loadExistingEntryUid.value = '';
  loadExistingEntries.value = [];

  if (!loadExistingWorldbook.value) return;

  try {
    const tav = (window as any).TavernHelper;
    if (!tav) {
      window.toastr.warning('TavernHelper 不可用');
      return;
    }

    // 🔧 修复：使用 getWorldbook API（与其他地方一致），而非 getWorldbookEntries
    // getWorldbook 是异步的，需要 await
    let entries: any[] = [];
    if (typeof tav.getWorldbook === 'function') {
      entries = (await tav.getWorldbook(loadExistingWorldbook.value)) || [];
      console.log(`📚 通过 getWorldbook 获取到条目:`, entries);
    } else if (typeof tav.getWorldbookEntries === 'function') {
      // 回退到 getWorldbookEntries（可能是旧版 API）
      entries = tav.getWorldbookEntries(loadExistingWorldbook.value) || [];
      console.log(`📚 通过 getWorldbookEntries 获取到条目:`, entries);
    } else {
      window.toastr.warning('世界书 API 不可用');
      return;
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      console.log('⚠️ 世界书条目为空或格式不正确');
      loadExistingEntries.value = [];
      return;
    }

    loadExistingEntries.value = entries.map((entry: any) => ({
      uid: entry.uid,
      comment: entry.comment || entry.name, // 兼容不同的字段名
      key: entry.key,
      content: entry.content,
      enabled: entry.enabled,
      constant: entry.constant,
      selective: entry.selective,
      selectiveLogic: entry.selectiveLogic,
      secondary_keys: entry.secondary_keys,
      position: entry.position,
      depth: entry.depth,
    }));
    console.log(`✅ 已加载 ${loadExistingEntries.value.length} 个条目`);
  } catch (error) {
    console.error('❌ 加载条目失败:', error);
    window.toastr.error('加载条目失败: ' + (error as Error).message);
  }
};

// 🆕 将选中的已有条目加载到编辑区
const loadExistingEntryToEdit = () => {
  if (!loadExistingEntryUid.value) {
    window.toastr.warning('请先选择条目');
    return;
  }

  const entry = loadExistingEntries.value.find(e => e.uid === loadExistingEntryUid.value);
  if (!entry) {
    window.toastr.error('未找到该条目');
    return;
  }

  // 转换为 worldbookEntryOutput 格式
  worldbookEntryOutput.value = {
    name: entry.comment || entry.key?.[0] || '未命名',
    content: entry.content || '',
    strategy: {
      type: entry.constant ? 'constant' : entry.selective ? 'selective' : 'vectorized',
      keys: entry.key || [],
      secondary_keys: entry.secondary_keys || [],
    },
    // 保存原始 UID，方便后续保存回去
    uid: entry.uid,
    _sourceWorldbook: loadExistingWorldbook.value,
  } as any;

  window.toastr.success(`已加载条目: ${entry.comment || entry.key?.[0] || '未命名'}`);
  console.log('✅ 已加载条目到编辑区:', worldbookEntryOutput.value);
};

// 从 localStorage 加载工具数据（插件环境）
const loadToolsData = () => {
  try {
    isDataLoaded.value = false; // 加载期间暂停自动保存
    const script_id = getScriptIdSafe();
    if (!script_id) {
      console.warn('⚠️ script_id 为空，无法加载数据');
      isDataLoaded.value = true;
      return;
    }

    // 插件环境：从 localStorage 加载
    const storageKey = `${script_id}_tools_data`;
    const savedDataString = localStorage.getItem(storageKey);
    const savedData = savedDataString ? JSON.parse(savedDataString) : {};

    console.log('📥 加载工具数据:', savedData);

    // 加载反八股数据
    if (savedData.tools_antiCliche) {
      antiClicheInput.value = savedData.tools_antiCliche.input || '';
      antiClicheOutput.value = savedData.tools_antiCliche.output || '';
      enableAntiClicheStreaming.value = savedData.tools_antiCliche.enableStreaming || false;
      antiClicheModifyRequest.value = savedData.tools_antiCliche.modifyRequest || '';
      antiClicheLevel.value = savedData.tools_antiCliche.level || 'moderate';
      console.log('✅ 已恢复反八股数据:', {
        input: antiClicheInput.value.substring(0, 50),
        output: antiClicheOutput.value.substring(0, 50),
        enableStreaming: enableAntiClicheStreaming.value,
        level: antiClicheLevel.value,
      });
    }

    // 加载角色卡数据
    if (savedData.tools_characterCard) {
      characterDescription.value = savedData.tools_characterCard.description || '';
      characterCardOutput.value = savedData.tools_characterCard.output || '';
      modifyRequest.value = savedData.tools_characterCard.modifyRequest || '';
      enableCharacterStreaming.value = savedData.tools_characterCard.enableStreaming || false;
      console.log('✅ 已恢复角色卡数据:', {
        description: characterDescription.value.substring(0, 50),
        output: characterCardOutput.value.substring(0, 50),
      });
    }

    // 加载开场白生成数据
    if (savedData.tools_greetingGen) {
      greetingGenRequest.value = savedData.tools_greetingGen.request || '';
      greetingGenOutput.value = savedData.tools_greetingGen.output || '';
      enableGreetingStreaming.value = savedData.tools_greetingGen.enableStreaming || false;
      greetingPersonaSource.value = savedData.tools_greetingGen.personaSource || 'tavern';
      greetingPersonaWorldbook.value = savedData.tools_greetingGen.personaWorldbook || '';
      greetingPersonaEntry.value = savedData.tools_greetingGen.personaEntry || '';
      console.log('✅ 已恢复开场白生成数据');
      // 恢复后加载用户人设
      if (greetingPersonaSource.value === 'tavern') {
        loadPersonaFromTavern();
      } else if (greetingPersonaWorldbook.value) {
        loadPersonaFromWorldbook().then(() => {
          if (greetingPersonaEntry.value) {
            onPersonaEntryChange();
          }
        });
      }
    }

    // 加载世界书条目数据
    if (savedData.tools_worldbookEntry) {
      worldbookDescription.value = savedData.tools_worldbookEntry.description || '';
      worldbookEntryOutput.value = savedData.tools_worldbookEntry.output || null;
      selectedWorldbook.value = savedData.tools_worldbookEntry.selectedWorldbook || '';
      worldbookModifyRequest.value = savedData.tools_worldbookEntry.modifyRequest || '';
      enableWorldbookStreaming.value = savedData.tools_worldbookEntry.enableStreaming || false;
      // 恢复批量生成结果
      if (savedData.tools_worldbookEntry.batchResults?.length > 0) {
        batchResults.value = savedData.tools_worldbookEntry.batchResults;
      }
      console.log('✅ 已恢复世界书条目数据:', {
        description: worldbookDescription.value.substring(0, 50),
        output: worldbookEntryOutput.value ? '有输出' : '无输出',
        selectedWorldbook: selectedWorldbook.value,
        modifyRequest: worldbookModifyRequest.value.substring(0, 50),
        enableStreaming: enableWorldbookStreaming.value,
        batchResults: batchResults.value.length,
      });
    }

    // 加载展开状态
    if (savedData.tools_expandedState) {
      toolExpandedState.value = new Map(Object.entries(savedData.tools_expandedState));
      console.log('✅ 已恢复展开状态:', Object.fromEntries(toolExpandedState.value));
    }

    // 加载世界书查看器数据
    if (savedData.tools_worldbookViewer) {
      selectedViewerWorldbook.value = savedData.tools_worldbookViewer.selectedWorldbook || '';
      viewerSearchQuery.value = savedData.tools_worldbookViewer.searchQuery || '';
      viewerSortBy.value = savedData.tools_worldbookViewer.sortBy || 'original';
      console.log('✅ 已恢复世界书查看器数据:', {
        selectedWorldbook: selectedViewerWorldbook.value,
        searchQuery: viewerSearchQuery.value,
        sortBy: viewerSortBy.value,
      });

      // 如果已选择世界书，自动加载条目
      if (selectedViewerWorldbook.value) {
        console.log('🔄 自动加载已选择的世界书条目...');
        setTimeout(() => {
          loadWorldbookEntries();
        }, 200);
      }
    }

    // 延迟启用自动保存，避免加载时触发
    setTimeout(() => {
      isDataLoaded.value = true;
      console.log('✅ 数据加载完成，启用自动保存');
    }, 100);
  } catch (error) {
    console.error('❌ 加载工具数据失败:', error);
    isDataLoaded.value = true;
  }
};

// 保存工具数据到 localStorage（插件环境）
const saveToolsDataImmediate = () => {
  // 只有在数据加载完成后才保存
  if (!isDataLoaded.value) {
    console.log('⏸️ 跳过保存：数据尚未加载完成');
    return;
  }

  try {
    const script_id = getScriptIdSafe();
    if (!script_id) {
      console.warn('⚠️ script_id 为空，无法保存数据');
      return;
    }

    const dataToSave = {
      tools_antiCliche: {
        input: antiClicheInput.value,
        output: antiClicheOutput.value,
        enableStreaming: enableAntiClicheStreaming.value,
        modifyRequest: antiClicheModifyRequest.value,
        level: antiClicheLevel.value,
      },
      tools_characterCard: {
        description: characterDescription.value,
        output: characterCardOutput.value,
        modifyRequest: modifyRequest.value,
        enableStreaming: enableCharacterStreaming.value,
      },
      tools_greetingGen: {
        request: greetingGenRequest.value,
        output: greetingGenOutput.value,
        enableStreaming: enableGreetingStreaming.value,
        personaSource: greetingPersonaSource.value,
        personaWorldbook: greetingPersonaWorldbook.value,
        personaEntry: greetingPersonaEntry.value,
      },
      tools_worldbookEntry: {
        description: worldbookDescription.value,
        output: worldbookEntryOutput.value,
        selectedWorldbook: selectedWorldbook.value,
        modifyRequest: worldbookModifyRequest.value,
        enableStreaming: enableWorldbookStreaming.value,
        batchResults: batchResults.value, // 保存批量生成结果
      },
      tools_worldbookViewer: {
        selectedWorldbook: selectedViewerWorldbook.value,
        searchQuery: viewerSearchQuery.value,
        sortBy: viewerSortBy.value,
      },
      tools_expandedState: Object.fromEntries(toolExpandedState.value),
    };

    // 插件环境：保存到 localStorage
    const storageKey = `${script_id}_tools_data`;
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    console.log('💾 工具数据已保存到 localStorage:', {
      antiCliche_input_length: antiClicheInput.value.length,
      antiCliche_output_length: antiClicheOutput.value.length,
      character_desc_length: characterDescription.value.length,
      character_output_length: characterCardOutput.value.length,
    });
  } catch (error) {
    console.error('❌ 保存工具数据失败:', error);
  }
};

// 使用防抖来避免频繁保存（减少到300ms，更快响应）
const saveToolsData = debounce(saveToolsDataImmediate, 300);

// 监听数据变化并自动保存
watch(
  [
    antiClicheInput,
    antiClicheOutput,
    enableAntiClicheStreaming,
    antiClicheModifyRequest,
    characterDescription,
    characterCardOutput,
    modifyRequest,
    enableCharacterStreaming,
    worldbookDescription,
    worldbookEntryOutput,
    selectedWorldbook,
    worldbookModifyRequest,
    enableWorldbookStreaming,
    selectedViewerWorldbook,
    viewerSearchQuery,
    viewerSortBy,
    toolExpandedState,
  ],
  () => {
    if (isDataLoaded.value) {
      console.log('📝 数据变化，触发保存...');
      saveToolsData();
    }
  },
  { deep: true },
);

// 组件挂载时加载数据
onMounted(() => {
  console.log('🔧 ToolsTab 组件已挂载，加载数据...');
  loadToolsData();
  loadAvailableWorldbooks();
});

// 组件卸载前保存数据
onBeforeUnmount(() => {
  console.log('🔄 ToolsTab 组件即将卸载，保存数据...');
  // 取消防抖，立即保存
  saveToolsData.cancel();
  saveToolsDataImmediate();
});

// 切换工具展开状态
const toggleToolExpanded = (toolName: string) => {
  console.log('toggleToolExpanded 被调用，工具名称:', toolName);
  const current = toolExpandedState.value.get(toolName) || false;
  console.log('当前展开状态:', current);
  toolExpandedState.value.set(toolName, !current);
  console.log('新的展开状态:', !current);
};

// 检查工具是否展开
const isToolExpanded = (toolName: string) => {
  return toolExpandedState.value.get(toolName) || false;
};

// copyToClipboard 函数已从 utils.ts 导入

// 根据清理强度生成提示词
const getAntiClichePrompt = (level: 'light' | 'moderate' | 'deep'): string => {
  const baseRules = `# 📋 八股词汇清单

**模糊词**：一丝、一抹、一缕、一股、似乎、几乎、近乎、仿佛
**比喻词**：如同、宛如、恰似、像是、好像、就像
**对比句**："不是...而是..."、"既...又..."
**强调词**：猛地、重重地、狂野、激烈地、不容置疑
**修饰废话**："不易察觉"、"难以察觉"、"带着xx意味"
**眼神描写**："眼里闪过xxx"、"嘴角上扬"、"视线交汇"
**动物比喻**："像小兽"、"像猫咪"、"野兽般的"
**气氛渲染**："气氛凝重"、"空气凝固"
**对白标注**："（带着不屑的口吻）"、"（轻声说）"`;

  if (level === 'light') {
    return `你是文本编辑助手，进行轻度八股清理。

# 🎯 轻度清理原则
- **只删除最明显的套话**：一丝、一抹、似乎、仿佛
- **保留大部分文学表达**：比喻、修辞可以保留
- **信息量100%保持**：不删任何实质内容
- **改动最小化**：能不改就不改

${baseRules}

# ⚠️ 轻度模式只处理上述"模糊词"和"强调词"，其他保留！

直接输出清理后的文本，不要任何解释。`;
  }

  if (level === 'deep') {
    return `你是文本编辑助手，进行深度八股清理。

# 🎯 深度清理原则
- **彻底清理所有八股**：套话、比喻、文学腔全部删除
- **转为简洁人话**：用最直白的方式表达
- **保持核心信息**：设定、对话、动作保留
- **段落可以合并**：精简为更紧凑的表达

${baseRules}

# 🔥 深度模式额外清理：
- 所有比喻修辞 → 直接描述
- 冗长描写 → 一句话概括
- 精确数字（168cm）→ 模糊化（个子高）
- 重复信息 → 合并

直接输出清理后的文本，不要任何解释。`;
  }

  // moderate（默认）
  return `你是专业的文本编辑助手，专注于清理角色卡/世界书/开场白中的AI文学腔和八股表述。

# 🎯 第一原则（最重要！）
**信息量守恒**：输入500字，输出也应该接近500字！
- ❌ 错误：把五段话压缩成两句话
- ✅ 正确：只替换/删除八股词汇，保留所有实质内容

${baseRules}

# 💡 工作方式
- 把文学腔改成日常口语
- 把套路比喻改成直接描述
- 保留所有对白、设定、动作

# ✅ 必须保留
1. 所有""内的台词
2. 核心设定：背景、职业、关系
3. 基础动作和简单情绪

直接输出清理后的文本，不要任何解释。`;
};

// 反八股工具处理函数
const handleAntiClicheProcess = async () => {
  if (!antiClicheInput.value.trim()) {
    window.toastr.warning('请输入需要清理的文本');
    return;
  }

  try {
    isProcessingAntiCliche.value = true;
    antiClicheProgressPercent.value = 0;
    const levelLabel = antiClicheLevels.find(l => l.value === antiClicheLevel.value)?.label || '适度';
    window.toastr.info(`AI正在${levelLabel}清理...`, '反八股清理', { timeOut: 15000 });

    const requestPayload = {
      model: settings.value.model,
      max_tokens: settings.value.max_tokens || 8000,
      temperature: antiClicheLevel.value === 'light' ? 0.5 : antiClicheLevel.value === 'deep' ? 0.8 : 0.7,
      stream: enableAntiClicheStreaming.value,
      messages: [
        {
          role: 'system',
          content: getAntiClichePrompt(antiClicheLevel.value),
        },
        {
          role: 'user',
          content: antiClicheInput.value,
        },
      ],
    };

    let generatedText: string;

    // 如果启用了"使用酒馆 API"，通过酒馆后端发送请求（绕过 CORS）
    if (settings.value.use_tavern_api) {
      console.log('🍺 使用酒馆 API 发送反八股请求（绕过 CORS）...');

      generatedText = await callAIWithTavernSupport(requestPayload.messages, settings.value, {
        onProgress: p => (antiClicheProgressPercent.value = p),
      });
    } else if (enableAntiClicheStreaming.value) {
      // 流式生成
      generatedText = await generateWithStreaming(requestPayload, antiClicheProgressPercent);
    } else {
      // 非流式生成
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
      // 过滤 API 参数，确保兼容不同的服务提供商
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
        const errorText = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      generatedText = data.choices[0].message.content.trim();
      antiClicheProgressPercent.value = 100;
    }

    antiClicheOutput.value = generatedText;
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('文本清理完成！');
  } catch (error) {
    console.error('反八股清理失败:', error);
    window.toastr.error(translateError(error, '文本清理'));
  } finally {
    isProcessingAntiCliche.value = false;
    antiClicheProgressPercent.value = 0;
  }
};

const copyAntiClicheResult = () => {
  if (!antiClicheOutput.value) {
    window.toastr.warning('没有可复制的内容');
    return;
  }

  // 使用统一的复制函数
  copyToClipboard(antiClicheOutput.value, '清理结果已复制到剪贴板');
};

// 反八股修改处理函数
const handleModifyAntiCliche = async () => {
  if (!antiClicheModifyRequest.value.trim()) {
    window.toastr.warning('请输入修改需求');
    return;
  }

  if (!antiClicheOutput.value) {
    window.toastr.warning('没有可修改的内容');
    return;
  }

  try {
    isModifyingAntiCliche.value = true;
    antiClicheProgressPercent.value = 0;
    window.toastr.info('AI正在修改...', '反八股修改', { timeOut: 15000 });

    const requestPayload = {
      model: settings.value.model,
      max_tokens: settings.value.max_tokens || 8000,
      temperature: 0.7,
      stream: enableAntiClicheStreaming.value,
      messages: [
        {
          role: 'system',
          content:
            '你是一个文本编辑助手。根据用户的修改需求，对提供的文本进行修改。直接输出修改后的结果，不要添加任何解释或说明。',
        },
        {
          role: 'user',
          content: `当前文本：\n${antiClicheOutput.value}\n\n修改需求：${antiClicheModifyRequest.value}`,
        },
      ],
    };

    let modifiedText: string;

    // 如果启用了"使用酒馆 API"，通过酒馆后端发送请求（绕过 CORS）
    if (settings.value.use_tavern_api) {
      console.log('🍺 使用酒馆 API 发送反八股修改请求（绕过 CORS）...');

      modifiedText = await callAIWithTavernSupport(requestPayload.messages, settings.value, {
        onProgress: p => (antiClicheProgressPercent.value = p),
      });
    } else if (enableAntiClicheStreaming.value) {
      // 流式生成
      modifiedText = await generateWithStreaming(requestPayload, antiClicheProgressPercent);
    } else {
      // 非流式生成
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
      // 过滤 API 参数，确保兼容不同的服务提供商
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
        const errorText = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      modifiedText = data.choices[0].message.content.trim();
      antiClicheProgressPercent.value = 100;
    }

    antiClicheOutput.value = modifiedText;
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('修改完成！');
  } catch (error) {
    console.error('反八股修改失败:', error);
    window.toastr.error(translateError(error, '修改'));
  } finally {
    isModifyingAntiCliche.value = false;
    antiClicheProgressPercent.value = 0;
  }
};

// 从角色卡读取内容到反八股
const loadAntiClicheFromChar = (field: string) => {
  try {
    const tav = (window as any).TavernHelper;
    if (tav?.getCharData) {
      const char = tav.getCharData('current');
      if (char) {
        const fieldMap: Record<string, string> = {
          description: char.description || char.data?.description || '',
          personality: char.personality || char.data?.personality || '',
          scenario: char.scenario || char.data?.scenario || '',
          mes_example: char.mes_example || char.data?.mes_example || '',
        };
        const content = fieldMap[field] || '';
        if (content) {
          antiClicheInput.value = content;
          window.toastr.success(`已读取角色卡 ${field}`);
        } else {
          window.toastr.warning(`角色卡 ${field} 为空`);
        }
        return;
      }
    }
    window.toastr.warning('请先选择一个角色');
  } catch (e) {
    console.error('读取角色卡失败:', e);
    window.toastr.error('读取失败');
  }
};

// 从世界书读取内容到反八股
const loadAntiClicheFromWorldbook = async () => {
  if (!antiClicheWorldbook.value) return;

  try {
    const tav = (window as any).TavernHelper;
    if (tav?.getWorldbook) {
      const entries = await tav.getWorldbook(antiClicheWorldbook.value);
      if (entries?.length) {
        // 合并所有条目内容
        const allContent = entries
          .filter((e: any) => e.content)
          .map((e: any) => `【${e.name || e.comment || '条目'}】\n${e.content}`)
          .join('\n\n');
        if (allContent) {
          antiClicheInput.value = allContent;
          window.toastr.success(`已读取 ${entries.length} 个条目`);
        } else {
          window.toastr.warning('世界书条目内容为空');
        }
      } else {
        window.toastr.warning('世界书没有条目');
      }
    }
  } catch (e) {
    console.error('读取世界书失败:', e);
    window.toastr.error('读取失败');
  } finally {
    antiClicheWorldbook.value = '';
  }
};

// 清空反八股修改需求
const clearAntiClicheModifyRequest = () => {
  antiClicheModifyRequest.value = '';
  saveToolsDataImmediate();
  window.toastr.success('修改需求已清空');
};

// Token 估算函数（简单估算：中文约 2 token/字，英文约 0.75 token/word）
const estimateTokens = (text: string): number => {
  if (!text) return 0;
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  const punctuation = (text.match(/[^\w\s\u4e00-\u9fff]/g) || []).length;
  return Math.ceil(chineseChars * 2 + englishWords * 0.75 + numbers * 0.5 + punctuation * 0.5);
};

// Token 压缩相关计算属性
const tokenCompressInputTokens = computed(() => estimateTokens(tokenCompressInput.value));
const tokenCompressOutputTokens = computed(() => estimateTokens(tokenCompressOutput.value));
const tokenCompressSaved = computed(() => {
  if (!tokenCompressInputTokens.value || !tokenCompressOutputTokens.value) return 0;
  const saved =
    ((tokenCompressInputTokens.value - tokenCompressOutputTokens.value) / tokenCompressInputTokens.value) * 100;
  return Math.max(0, saved).toFixed(0);
});

// 从角色卡读取内容到 Token 压缩
const loadTokenCompressFromChar = (field: string) => {
  try {
    const tav = (window as any).TavernHelper;
    if (tav?.getCharData) {
      const char = tav.getCharData('current');
      if (char) {
        const fieldMap: Record<string, string> = {
          description: char.description || char.data?.description || '',
          personality: char.personality || char.data?.personality || '',
          scenario: char.scenario || char.data?.scenario || '',
        };
        const content = fieldMap[field] || '';
        if (content) {
          tokenCompressInput.value = content;
          window.toastr.success(`已读取角色卡 ${field}`);
        } else {
          window.toastr.warning(`角色卡 ${field} 为空`);
        }
        return;
      }
    }
    window.toastr.warning('请先选择一个角色');
  } catch (e) {
    console.error('读取角色卡失败:', e);
    window.toastr.error('读取失败');
  }
};

// 从世界书读取内容到 Token 压缩
const loadTokenCompressFromWorldbook = async () => {
  if (!tokenCompressWorldbook.value) return;

  try {
    const tav = (window as any).TavernHelper;
    if (tav?.getWorldbook) {
      const entries = await tav.getWorldbook(tokenCompressWorldbook.value);
      if (entries?.length) {
        const allContent = entries
          .filter((e: any) => e.content)
          .map((e: any) => `【${e.name || e.comment || '条目'}】\n${e.content}`)
          .join('\n\n');
        if (allContent) {
          tokenCompressInput.value = allContent;
          window.toastr.success(`已读取 ${entries.length} 个条目`);
        } else {
          window.toastr.warning('世界书条目内容为空');
        }
      } else {
        window.toastr.warning('世界书没有条目');
      }
    }
  } catch (e) {
    console.error('读取世界书失败:', e);
    window.toastr.error('读取失败');
  } finally {
    tokenCompressWorldbook.value = '';
  }
};

// Token 压缩处理
const handleTokenCompress = async () => {
  if (!tokenCompressInput.value.trim()) {
    window.toastr.warning('请输入需要压缩的内容');
    return;
  }

  try {
    isCompressingToken.value = true;
    tokenCompressProgress.value = 0;
    window.toastr.info('正在压缩...');

    const levelPrompts: Record<string, string> = {
      light: '轻度精简：删除明显冗余和重复内容，保留所有细节和描写，只减少约 10-20% 的长度',
      moderate: '适度精简：在保留核心信息的前提下，精简冗长描述，合并相似内容，减少约 30-40% 的长度',
      aggressive: '激进精简：只保留最核心的信息和关键设定，删除所有非必要的描写和细节，尽可能减少长度',
    };

    const systemPrompt = `你是一个专业的文本压缩专家。请按照以下要求压缩文本：

${levelPrompts[tokenCompressLevel.value]}

要求：
1. 保持原文的核心信息和逻辑
2. 保持原文的格式结构（如果有标题、分段等）
3. 不要改变原文的语气和风格
4. 直接输出压缩后的内容，不要解释`;

    const requestPayload = {
      model: settings.value.model,
      max_tokens: 4000,
      temperature: 0.3,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请压缩以下内容：\n\n${tokenCompressInput.value}` },
      ],
    };

    let compressedText = '';

    if (settings.value.use_tavern_api) {
      compressedText = await callAIWithTavernSupport(requestPayload.messages, settings.value, {
        onProgress: p => (tokenCompressProgress.value = p),
      });
    } else {
      compressedText = await generateWithStreaming(requestPayload, tokenCompressProgress);
    }

    tokenCompressOutput.value = cleanCharacterCardOutput(compressedText);
    saveToolsDataImmediate();
    window.toastr.success('压缩完成！');
  } catch (error) {
    console.error('Token 压缩失败:', error);
    window.toastr.error(translateError(error, '压缩'));
  } finally {
    isCompressingToken.value = false;
    tokenCompressProgress.value = 0;
  }
};

// 角色关系分析
const handleAnalyzeRelation = async () => {
  if (!relationIncludeChar.value && !relationWorldbook.value) {
    window.toastr.warning('请选择至少一个分析来源');
    return;
  }

  try {
    isAnalyzingRelation.value = true;
    relationProgress.value = 0;
    window.toastr.info('正在分析角色关系...');

    let content = '';
    const tav = (window as any).TavernHelper;

    if (relationIncludeChar.value && tav?.getCharData) {
      const char = tav.getCharData('current');
      if (char) {
        content += `【主角色卡】\n角色名：${char.name || '未知'}\n`;
        const desc = char.description || char.data?.description;
        if (desc) content += `描述：${desc}\n`;
        const personality = char.personality || char.data?.personality;
        if (personality) content += `性格：${personality}\n`;
        const scenario = char.scenario || char.data?.scenario;
        if (scenario) content += `场景：${scenario}\n`;
        content += '\n';
      }
    }

    if (relationWorldbook.value && tav?.getWorldbook) {
      const entries = await tav.getWorldbook(relationWorldbook.value);
      if (entries?.length) {
        content += `【世界书条目】\n`;
        entries.forEach((e: any) => {
          if (e.content) content += `[${e.name || e.comment || '条目'}]\n${e.content}\n\n`;
        });
      }
    }

    if (!content.trim()) {
      window.toastr.warning('没有找到可分析的内容');
      isAnalyzingRelation.value = false;
      return;
    }

    const systemPrompt = `你是一个角色关系分析专家。请分析提供的角色设定，提取所有角色及其关系。

输出格式要求：
1. 首先列出所有角色（包括主角和配角）
2. 然后用图谱形式展示关系，标注关系类型：
   - [恋人/暧昧]
   - [亲密/喜欢]
   - [家人/血缘]
   - [朋友/同伴]
   - [敌对/竞争]
   - [上下级/主从]
   - [复杂/纠葛]
   - [未知/待探索]
3. 对重要关系给出简短说明
4. 保持简洁，避免废话，不要使用 emoji`;

    const requestPayload = {
      model: settings.value.model,
      max_tokens: 2000,
      temperature: 0.5,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请分析以下内容中的角色关系：\n\n${content}` },
      ],
    };

    let result = '';
    if (settings.value.use_tavern_api) {
      result = await callAIWithTavernSupport(requestPayload.messages, settings.value, {
        onProgress: p => (relationProgress.value = p),
      });
    } else {
      result = await generateWithStreaming(requestPayload, relationProgress);
    }

    // 🔥 添加调试日志，帮助诊断"弹窗显示完成但界面没反应"的问题
    console.log('📊 关系分析原始结果长度:', result?.length || 0);
    if (!result || result.trim() === '') {
      console.warn('⚠️ AI 返回了空结果');
      window.toastr.warning('AI 返回了空结果，请重试');
      return;
    }

    const cleaned = cleanCharacterCardOutput(result);
    console.log('📊 清理后结果长度:', cleaned?.length || 0);

    if (!cleaned || cleaned.trim() === '') {
      console.warn('⚠️ 清理后结果为空，使用原始结果');
      relationOutput.value = result.trim(); // 回退到原始结果
    } else {
      relationOutput.value = cleaned;
    }

    saveToolsDataImmediate();
    window.toastr.success('关系分析完成！');
  } catch (error) {
    console.error('关系分析失败:', error);
    window.toastr.error(translateError(error, '分析'));
  } finally {
    isAnalyzingRelation.value = false;
    relationProgress.value = 0;
  }
};

// 插入关系图谱到世界书
const insertRelationToWorldbook = async () => {
  if (!relationOutput.value || !relationInsertWorldbook.value) {
    window.toastr.warning('请先生成关系图谱并选择世界书');
    return;
  }

  try {
    isInsertingRelation.value = true;
    const tav = (window as any).TavernHelper;

    if (tav?.createWorldbookEntries) {
      await tav.createWorldbookEntries(relationInsertWorldbook.value, [
        {
          name: '角色关系图谱',
          content: relationOutput.value,
          keys: ['关系', '人物', '角色'],
          comment: '由猫猫工具自动生成',
          enabled: true,
        },
      ]);
      window.toastr.success('已插入到世界书');
      relationInsertWorldbook.value = '';
    } else {
      window.toastr.error('TavernHelper API 不可用');
    }
  } catch (e) {
    console.error('插入失败:', e);
    window.toastr.error('插入失败');
  } finally {
    isInsertingRelation.value = false;
  }
};

// 读取 NPC 背景参考
const loadNpcContext = async (source: 'char' | 'worldbook') => {
  try {
    const tav = (window as any).TavernHelper;

    if (source === 'char') {
      if (tav?.getCharData) {
        const char = tav.getCharData('current');
        if (char) {
          let content = `【角色信息】\n角色名：${char.name || '未知'}\n`;
          const desc = char.description || char.data?.description;
          if (desc) content += `描述：${desc}\n`;
          const personality = char.personality || char.data?.personality;
          if (personality) content += `性格：${personality}\n`;
          const scenario = char.scenario || char.data?.scenario;
          if (scenario) content += `场景：${scenario}\n`;
          npcContext.value = content;
          window.toastr.success('已读取角色卡');
        } else {
          window.toastr.warning('请先选择一个角色');
        }
      }
    } else if (source === 'worldbook' && npcContextWorldbook.value) {
      if (tav?.getWorldbook) {
        const entries = await tav.getWorldbook(npcContextWorldbook.value);
        if (entries?.length) {
          const content = entries
            .filter((e: any) => e.content)
            .map((e: any) => `【${e.name || e.comment || '条目'}】\n${e.content}`)
            .join('\n\n');
          npcContext.value = content;
          window.toastr.success(`已读取 ${entries.length} 个条目`);
        } else {
          window.toastr.warning('世界书没有条目');
        }
      }
      npcContextWorldbook.value = '';
    }
  } catch (e) {
    console.error('读取失败:', e);
    window.toastr.error('读取失败');
  }
};

// 🆕 获取 NPC 模板 Prompt
const getNpcTemplatePrompt = (templateType: string, context: string, customTemplate?: string): string => {
  const contextBlock = context ? `【背景参考】\n${context}\n\n` : '';

  if (templateType === 'custom' && customTemplate?.trim()) {
    return `你是一个专业的配角 NPC 设计师。根据用户的描述和提供的模板格式生成 NPC。

${contextBlock}【输出模板】
${customTemplate}

要求：
1. 严格按照上面的模板格式输出
2. 风格自然，避免八股套话
3. 直接输出内容，不要解释`;
  }

  const templates: Record<string, string> = {
    simple: `你是一个专业的配角 NPC 设计师。生成简洁的 NPC 设定。

${contextBlock}输出格式（约150字）：
【姓名】xxx
【外貌】一句话描述
【性格】2-3个关键词
【与主角关系】一句话

要求：极简风格，只保留核心信息，不要废话。`,

    detailed: `你是一个专业的配角 NPC 设计师。生成详细的 NPC 设定。

${contextBlock}输出格式（约300字）：
【姓名】xxx
【外貌特征】详细描述
【性格特点】性格描述和行为习惯
【背景故事】简短的来历
【与主角关系】关系和态度
【特殊技能/特点】如有

要求：内容丰富但不啰嗦，避免八股套话。`,

    dialogue: `你是一个专业的配角 NPC 设计师。生成带对话风格的 NPC 设定。

${contextBlock}输出格式（约200字）：
【姓名】xxx
【外貌】简短描述
【性格】关键词
【说话方式】语气、用词特点
【口头禅】1-2句标志性台词
【示例对话】一段短对话展示性格

要求：突出角色的说话风格和语言特点。`,
  };

  return templates[templateType] || templates.simple;
};

// NPC 快速生成函数（支持模板）
const handleGenerateNpc = async () => {
  if (!npcDescription.value.trim()) {
    window.toastr.warning('请输入 NPC 描述');
    return;
  }

  if (npcTemplateType.value === 'custom' && !npcCustomTemplate.value.trim()) {
    window.toastr.warning('请输入自定义模板');
    return;
  }

  try {
    isGeneratingNpc.value = true;
    npcProgressPercent.value = 0;
    window.toastr.info('正在生成 NPC...');

    const systemPrompt = getNpcTemplatePrompt(npcTemplateType.value, npcContext.value, npcCustomTemplate.value);

    const requestPayload = {
      model: settings.value.model,
      max_tokens: npcMaxTokens.value,
      temperature: 0.8,
      stream: enableNpcStreaming.value,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请为以下描述生成 NPC 设定：\n${npcDescription.value}` },
      ],
    };

    let generatedText = '';

    if (settings.value.use_tavern_api) {
      generatedText = await callAIWithTavernSupport(requestPayload.messages, settings.value, {
        onProgress: p => (npcProgressPercent.value = p),
      });
    } else if (enableNpcStreaming.value) {
      generatedText = await generateWithStreaming(requestPayload, npcProgressPercent);
    } else {
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
      const filteredPayload = filterApiParams(requestPayload, settings.value.api_endpoint);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.value.api_key}`,
        },
        body: JSON.stringify(filteredPayload),
      });

      if (!response.ok) throw new Error(`API 请求失败 (${response.status})`);
      const data = await response.json();
      generatedText = data.choices[0].message.content.trim();
      npcProgressPercent.value = 100;
    }

    npcOutput.value = cleanCharacterCardOutput(generatedText);
    saveToolsDataImmediate();
    window.toastr.success('NPC 生成完成！');
  } catch (error) {
    console.error('NPC 生成失败:', error);
    window.toastr.error(translateError(error, '生成'));
  } finally {
    isGeneratingNpc.value = false;
    npcProgressPercent.value = 0;
  }
};

// 🆕 批量生成 NPC
const handleBatchGenerateNpc = async () => {
  if (!npcDescription.value.trim()) {
    window.toastr.warning('请输入 NPC 描述/主题');
    return;
  }

  const count = Math.min(Math.max(npcBatchCount.value, 1), 10); // 限制 1-10 个

  try {
    isBatchGeneratingNpc.value = true;
    npcBatchResults.value = [];
    npcBatchProgress.value = { current: 0, total: count, currentName: '' };

    const systemPrompt = getNpcTemplatePrompt(npcTemplateType.value, npcContext.value, npcCustomTemplate.value);

    for (let i = 0; i < count; i++) {
      npcBatchProgress.value = { current: i + 1, total: count, currentName: `生成第 ${i + 1} 个...` };

      const requestPayload = {
        model: settings.value.model,
        max_tokens: npcMaxTokens.value,
        temperature: 0.9, // 批量时温度稍高，增加多样性
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt + '\n\n注意：每次生成的 NPC 要有独特性，不要重复。' },
          {
            role: 'user',
            content: `请为以下描述生成第 ${i + 1} 个独特的 NPC 设定：\n${npcDescription.value}\n\n已生成的 NPC 名字：${npcBatchResults.value.map(r => r.split('\n')[0]).join('、') || '无'}`,
          },
        ],
      };

      let generatedText = '';

      if (settings.value.use_tavern_api) {
        generatedText = await callAIWithTavernSupport(requestPayload.messages, settings.value, {});
      } else {
        const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
        const filteredPayload = filterApiParams(requestPayload, settings.value.api_endpoint);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.value.api_key}`,
          },
          body: JSON.stringify(filteredPayload),
        });

        if (!response.ok) throw new Error(`API 请求失败 (${response.status})`);
        const data = await response.json();
        generatedText = data.choices[0].message.content.trim();
      }

      npcBatchResults.value.push(cleanCharacterCardOutput(generatedText));
    }

    window.toastr.success(`成功生成 ${count} 个 NPC！`);
  } catch (error) {
    console.error('批量生成失败:', error);
    window.toastr.error(translateError(error, '批量生成'));
  } finally {
    isBatchGeneratingNpc.value = false;
    npcBatchProgress.value = { current: 0, total: 0, currentName: '' };
  }
};

// 🆕 批量插入 NPC 到世界书
const insertBatchNpcToWorldbook = async () => {
  if (npcBatchResults.value.length === 0 || !npcInsertWorldbook.value) {
    window.toastr.warning('请先批量生成 NPC 并选择目标世界书');
    return;
  }

  try {
    const tav = (window as any).TavernHelper;
    if (!tav?.createWorldbookEntries) {
      throw new Error('TavernHelper.createWorldbookEntries 不可用');
    }

    const entries = npcBatchResults.value.map((content, idx) => ({
      content,
      comment: `NPC ${idx + 1} - ${new Date().toLocaleString()}`,
      keys: ['NPC', '配角'],
      enabled: true,
    }));

    await tav.createWorldbookEntries(npcInsertWorldbook.value, entries, { render: 'immediate' });
    window.toastr.success(`已将 ${entries.length} 个 NPC 插入到「${npcInsertWorldbook.value}」`);
    npcBatchResults.value = [];
    showNpcBatchDialog.value = false;
  } catch (error) {
    console.error('批量插入失败:', error);
    window.toastr.error('批量插入失败');
  }
};

// 插入 NPC 到世界书
const insertNpcToWorldbook = async () => {
  if (!npcOutput.value || !npcInsertWorldbook.value) {
    window.toastr.warning('请先生成 NPC 并选择目标世界书');
    return;
  }

  try {
    const tav = (window as any).TavernHelper;
    if (!tav?.createWorldbookEntries) {
      throw new Error('TavernHelper.createWorldbookEntries 不可用');
    }

    const newEntry = {
      content: npcOutput.value,
      comment: 'NPC - ' + new Date().toLocaleString(),
      keys: ['NPC', '配角'],
      enabled: true,
    };

    await tav.createWorldbookEntries(npcInsertWorldbook.value, [newEntry], { render: 'immediate' });
    window.toastr.success(`已插入到「${npcInsertWorldbook.value}」`);
    npcInsertWorldbook.value = '';
  } catch (error) {
    console.error('插入失败:', error);
    window.toastr.error('插入失败');
  }
};

// 开场白生成工具相关函数
const refreshGreetingCharInfo = () => {
  try {
    const tav = (window as any).TavernHelper;
    if (tav?.getCharData) {
      const char = tav.getCharData('current');
      greetingCharName.value = char?.name || '';
    }
    // 根据来源刷新用户人设
    if (greetingPersonaSource.value === 'tavern') {
      loadPersonaFromTavern();
    }
    window.toastr.success('角色信息已刷新');
  } catch {
    window.toastr.warning('无法获取角色信息');
  }
};

// 从酒馆用户设定加载人设
const loadPersonaFromTavern = () => {
  try {
    // 方式1: 从 TavernHelper 获取
    const tav = (window as any).TavernHelper;
    if (tav?.getPersona) {
      const p = tav.getPersona();
      if (p) {
        greetingUserPersona.value = p;
        console.log('✅ 从 TavernHelper.getPersona 获取用户人设');
        return;
      }
    }

    // 方式2: 从 SillyTavern context 获取
    const st = (window as any).SillyTavern || (window as any).parent?.SillyTavern;
    if (st?.getContext) {
      const ctx = st.getContext();
      console.log('🔍 SillyTavern context keys:', Object.keys(ctx || {}));

      // 尝试多种可能的字段名
      const personaText =
        ctx?.persona || ctx?.user_persona || ctx?.personaDescription || ctx?.default_persona || ctx?.name1 || '';
      if (personaText) {
        greetingUserPersona.value = personaText;
        console.log('✅ 从 SillyTavern context 获取用户人设');
        return;
      }

      // 尝试从 personas 数组获取当前激活的
      if (ctx?.personas && ctx?.persona_id) {
        const activePersona = ctx.personas.find((p: any) => p.id === ctx.persona_id);
        if (activePersona?.description) {
          greetingUserPersona.value = activePersona.description;
          console.log('✅ 从 personas 数组获取用户人设');
          return;
        }
      }
    }

    // 方式3: 直接从全局变量获取
    const win = window as any;
    const power_user = win.power_user || win.parent?.power_user;
    if (power_user?.persona_description) {
      greetingUserPersona.value = power_user.persona_description;
      console.log('✅ 从 power_user.persona_description 获取用户人设');
      return;
    }

    console.warn('⚠️ 未能获取用户人设');
  } catch (e) {
    console.warn('获取酒馆用户人设失败:', e);
  }
};

// 用户人设来源切换
const onPersonaSourceChange = () => {
  greetingUserPersona.value = '';
  if (greetingPersonaSource.value === 'tavern') {
    loadPersonaFromTavern();
  } else {
    // 清空世界书选择
    greetingPersonaWorldbook.value = '';
    greetingPersonaEntry.value = '';
    greetingPersonaEntries.value = [];
  }
  saveToolsDataImmediate();
};

// 从世界书加载条目列表
const loadPersonaFromWorldbook = async () => {
  if (!greetingPersonaWorldbook.value) {
    greetingPersonaEntries.value = [];
    return;
  }
  try {
    console.log('🔍 尝试加载世界书条目:', greetingPersonaWorldbook.value);

    // 使用 TavernHelper.getWorldbook() 获取
    const tav = (window as any).TavernHelper;
    if (tav?.getWorldbook) {
      const entries = await tav.getWorldbook(greetingPersonaWorldbook.value);
      if (entries?.length) {
        greetingPersonaEntries.value = entries;
        console.log('✅ 从 TavernHelper.getWorldbook 获取世界书条目:', entries.length);
        window.toastr.success(`已加载 ${entries.length} 个条目`);
        return;
      }
    }

    console.warn('⚠️ 未能获取世界书条目');
    window.toastr.warning('无法加载世界书条目');
    greetingPersonaEntries.value = [];
  } catch (error) {
    console.error('加载世界书条目失败:', error);
    window.toastr.error('加载失败');
    greetingPersonaEntries.value = [];
  }
};

// 选择世界书条目作为用户人设
const onPersonaEntryChange = () => {
  if (greetingPersonaEntry.value === '' || greetingPersonaEntry.value === null) {
    greetingUserPersona.value = '';
    return;
  }
  const idx = Number(greetingPersonaEntry.value);
  const entry = greetingPersonaEntries.value[idx];
  if (entry) {
    greetingUserPersona.value = entry.content || '';
    console.log('✅ 选择世界书条目:', entry.name || entry.comment || `条目 ${idx + 1}`);
  }
  saveToolsDataImmediate();
};

const handleGenerateGreeting = async () => {
  if (!greetingGenRequest.value.trim()) {
    window.toastr.warning('请输入生成需求');
    return;
  }

  // 获取角色信息
  let charInfo = { name: '', description: '', personality: '', scenario: '', first_mes: '', mes_example: '' };

  try {
    const tav = (window as any).TavernHelper;
    if (tav?.getCharData) {
      const char = tav.getCharData('current');
      if (char) {
        charInfo = {
          name: char.name || '',
          description: char.description || char.data?.description || '',
          personality: char.personality || char.data?.personality || '',
          scenario: char.scenario || char.data?.scenario || '',
          first_mes: char.first_mes || char.data?.first_mes || '',
          mes_example: char.mes_example || char.data?.mes_example || '',
        };
        greetingCharName.value = charInfo.name;
      }
    }
  } catch {
    console.warn('获取角色信息失败');
  }

  if (!charInfo.name) {
    window.toastr.warning('请先选择一个角色');
    return;
  }

  // 使用已选择的用户人设
  const persona = greetingUserPersona.value;

  try {
    isGeneratingGreeting.value = true;
    greetingProgressPercent.value = 0;
    window.toastr.info('AI正在生成开场白...');

    const systemPrompt = `你是一个专业的角色扮演开场白编写专家。根据角色设定和用户人设，创作一段高质量的开场白。

【角色信息】
角色名：${charInfo.name}
角色描述：${charInfo.description || '无'}
角色性格：${charInfo.personality || '无'}
场景设定：${charInfo.scenario || '无'}
${charInfo.mes_example ? `对话示例（参考语气）：${charInfo.mes_example.substring(0, 500)}` : ''}

【用户人设】
${persona || '无特定人设'}

【参考开场白风格】
${charInfo.first_mes ? charInfo.first_mes.substring(0, 800) : '无'}

【写作要求】
1. 开场白要符合角色性格和场景设定
2. 要自然地引入用户（{{user}}），让用户有参与感
3. 描写要生动，有画面感，注重氛围营造
4. 长度适中，300-600字左右
5. 对话用「」包裹，动作和心理用自然叙述
6. 直接输出开场白内容，不要任何解释或标记`;

    const requestPayload = {
      model: settings.value.model || 'gpt-3.5-turbo',
      max_tokens: settings.value.max_tokens || 4000,
      temperature: 0.85,
      stream: enableGreetingStreaming.value,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `请根据以上角色设定，生成一个新的开场白。\n\n用户的具体要求：${greetingGenRequest.value}\n\n请直接输出开场白内容：`,
        },
      ],
    };

    let generatedText: string;

    if (settings.value.use_tavern_api) {
      generatedText = await callAIWithTavernSupport(requestPayload.messages, settings.value, {
        onProgress: p => (greetingProgressPercent.value = p),
      });
    } else if (enableGreetingStreaming.value) {
      generatedText = await generateWithStreaming(requestPayload, greetingProgressPercent);
    } else {
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
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
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      generatedText = data.choices?.[0]?.message?.content?.trim() || '';
      greetingProgressPercent.value = 100;
    }

    // 清理内容
    generatedText = generatedText.replace(/^```.*?\n?|```$/gm, '').trim();

    greetingGenOutput.value = generatedText;
    saveToolsDataImmediate();
    window.toastr.success('开场白生成完成！');
  } catch (error) {
    console.error('开场白生成失败:', error);
    window.toastr.error(translateError(error, '生成'));
  } finally {
    isGeneratingGreeting.value = false;
    greetingProgressPercent.value = 0;
  }
};

const clearGreetingForm = () => {
  greetingGenRequest.value = '';
  greetingGenOutput.value = '';
  saveToolsDataImmediate();
  window.toastr.success('已清空');
};

const copyGreetingOutput = () => {
  if (!greetingGenOutput.value) {
    window.toastr.warning('没有可复制的内容');
    return;
  }
  copyToClipboard(greetingGenOutput.value, '开场白已复制到剪贴板');
};

// 角色卡生成工具相关函数
const handleGenerateCharacterCard = async () => {
  if (!characterDescription.value.trim()) {
    window.toastr.warning('请输入角色描述');
    return;
  }

  try {
    isGeneratingCharacter.value = true;
    characterProgressPercent.value = 0;
    window.toastr.info('AI正在生成角色卡，请稍候...');

    const requestPayload = {
      model: settings.value.model || 'gpt-3.5-turbo',
      max_tokens: settings.value.max_tokens || 16000,
      temperature: 0.8,
      stream: enableCharacterStreaming.value,
      messages: [
        {
          role: 'system',
          content: `你是一位专业的角色设计师，擅长创造真实、立体、有血有肉的角色。

# 核心原则
1. **真实性第一**：角色必须像真实存在的人，有优点也有缺点，有逻辑也有矛盾
2. **避免刻板印象**：拒绝"温柔体贴"、"成熟稳重"、"活泼开朗"等空洞标签
3. **展现而非告知**：用具体行为、习惯、反应来展现性格，而非直接描述
4. **矛盾与冲突**：性格要有张力，内心要有挣扎，行为要有动机

# 输出格式
严格使用 YAML 格式，纯中文，结构如下：

\`\`\`yaml
基础信息:
  姓名: "全名（只写中文，不带英文）"
  年龄: 具体数字
  出生年月: "YYYY年MM月"
  性别: "男/女"
  第二性别: "Alpha/Beta/Omega/无"
  身高体重: "用描述性词语，如'身材高挑''体型匀称''略显瘦削'，禁用数字和单位"
  信息素: "如适用ABO设定，描述气味和特征，否则写'无'"
  性取向: "明确但自然的描述"
  恋爱经验: "具体描述过往经历和对感情的态度，不要写'丰富'这种模糊词"
  身份职业: "具体职业+当前状态，如'互联网公司产品经理，正处于职业瓶颈期'"
  标志性特征:
    微信昵称: "符合角色性格的昵称"
    头像: "简短描述，体现性格"
    其他: "1-2个独特的外在特征"

外貌与身材:
  整体印象: "第一眼给人的感觉，用生动的比喻"
  面容特征:
    发型发色: "具体描述+日常打理习惯"
    肤色肤质: "不只说白/黑，要有质感描述"
    眼睛: "形状+神态+眼神特点（如'总是微微眯起，带着审视'）"
    五官: "1-2个最突出的特点+细节"
  穿搭风格: "日常3种场景的穿着+品味倾向+为什么这样穿"
  声音气质: "音色+语速+说话习惯（如'会在句尾拖长音''习惯用鼻音哼声'）"
  习惯动作: "3-5个自然的小动作，注明在什么情况下会做"

性格与心理:
  核心性格:
    主导特质: "1个最核心的性格特点，用行为模式解释"
    次要特质: "2-3个补充特质，说明如何体现"
    隐藏面: "不轻易展现但确实存在的一面"
  性格矛盾: "至少1组内在矛盾（如：渴望亲密却害怕受伤，追求完美却容易自我怀疑）"
  情绪模式:
    基线情绪: "日常的情绪基调，不要用'平和''稳定'这种词"
    易触发点: "具体场景+为什么会触发"
    情绪表现: "高兴/生气/难过时的具体表现，要有细节"
    自我调节: "心情不好时会做什么，效果如何"
  压力应对: "面对压力的第一反应+长期策略+极限状态"
  自我认知: "TA如何看待自己+与他人眼中形象的差异"

对话风格:
  语言特征: "用词习惯+句式特点+说话节奏，给出具体例子"
  对不同对象:
    熟人: "如何说话+举例"
    生人: "如何说话+举例"
    上级/长辈: "如何说话+举例"
    下属/晚辈: "如何说话+举例"
  情绪化时: "生气时语气如何变化+难过时说话方式+兴奋时的特点"
  口头禅: ["2-3个符合角色的口头禅，要自然"]
  言外之意: "常用的委婉表达或暗示方式"

背景经历:
  家庭背景: "家庭结构+成长环境+家庭氛围+对性格的影响"
  教育经历: "学习经历+成绩表现+对知识/权威的态度"
  重要事件:
    - "具体事件1+当时年龄+如何影响了TA"
    - "具体事件2+当时年龄+如何影响了TA"
    - "具体事件3+当时年龄+如何影响了TA"
  转折点: "人生中最重要的改变+前后对比"
  当前状况: "具体的生活状态+面临的问题+应对方式"
  未来规划: "想要什么+为什么想要+有何行动"

人际关系:
  对{{user}}: "初次见面的态度+相处模式+内心真实想法+可能的发展"
  社交模式: "喜欢什么样的社交+讨厌什么+社交能量来源"
  群体定位: "在团体中的角色+如何获得这个位置+是否满意"
  关系处理: "如何建立关系+如何维持关系+如何结束关系"
  冲突模式: "冲突时第一反应+沟通方式+底线在哪"

行为模式:
  日常习惯: "3-5个具体的生活习惯+背后原因"
  决策模式: "做决定的方式+考虑因素+犹豫点"
  主动行为: "TA会主动去做的事+动机"
  回避行为: "TA避免做的事+为什么回避"
  应激反应: "突发情况的本能反应+事后如何处理"
  行为底线: "绝对不会做的事+为什么"

内在动机:
  核心驱动: "推动TA行动的最深层原因（不是'想成功'这种泛泛之谈）"
  深层需求: "TA真正缺失和渴望的（可能自己都未意识到）"
  价值排序: "TA认为最重要的3-5个价值观，按优先级排序"
  内在冲突: "价值观之间的矛盾+如何权衡"
  隐秘想法: "不愿说出口的真实想法+为什么隐藏"
  自我欺骗: "TA对自己撒的谎+真相是什么"

情绪管理:
  失控阈值: "什么情况会失控+失控时的表现"
  恢复机制: "如何平复下来+需要多久+谁能帮助"
  情绪模式: "是压抑型/爆发型/渐进型"
  脆弱时刻: "什么时候最脆弱+会向谁示弱"
\`\`\`

# 写作要求

## ✅ 这样写（好例子）：
- "会在紧张时咬指甲，咬到出血也不自觉"
- "表面上说无所谓，但会在深夜反复刷对方的社交账号"
- "习惯在句尾加'吧''呢'这些不确定的语气词，显得不够坚定"
- "对陌生人冷淡，但遇到流浪猫会蹲下来哄半天"

## ❌ 不要这样写（坏例子）：
- "性格温柔善良" → 太空洞，要写具体行为
- "是个负责任的人" → 太抽象，要写如何体现
- "很关心朋友" → 太笼统，要写具体怎么关心
- "成熟稳重" → 太刻板，真人有复杂性

## 关键原则：
1. **每个描述都要有"为什么"**：不只说TA是什么样，要说为什么是这样
2. **展现矛盾**：真实的人都有自相矛盾的地方
3. **具体场景**：用"会在XX情况下做XX"而非"是个XX的人"
4. **避免完美**：缺陷和局限让角色真实
5. **语言生动**：用比喻、对比、细节，不要用形容词堆砌

现在请根据用户描述，创造一个真实可信的角色。记住：你在创造一个人，不是填写表格。`,
        },
        {
          role: 'user',
          content: characterDescription.value,
        },
      ],
    };

    let generatedText: string;

    // 如果启用了"使用酒馆 API"，通过酒馆后端发送请求（绕过 CORS）
    if (settings.value.use_tavern_api) {
      console.log('🍺 使用酒馆 API 发送角色卡生成请求（绕过 CORS）...');

      generatedText = await callAIWithTavernSupport(requestPayload.messages, settings.value, {
        onProgress: p => (characterProgressPercent.value = p),
      });
    } else if (enableCharacterStreaming.value) {
      // 流式生成
      generatedText = await generateWithStreaming(requestPayload, characterProgressPercent);
    } else {
      // 非流式生成
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
      // 过滤 API 参数，确保兼容不同的服务提供商
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
        const errorText = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        console.warn('⚠️ API 返回数据缺少内容:', JSON.stringify(data).substring(0, 300));
        throw new Error('AI 返回了空内容，请检查 API 设置或重试');
      }
      generatedText = content;
      characterProgressPercent.value = 100;
    }

    // 清理 AI 输出中的废话和代码块标记
    characterCardOutput.value = cleanCharacterCardOutput(generatedText);
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('角色卡生成完成！');
  } catch (error) {
    console.error('角色卡生成失败:', error);
    window.toastr.error(translateError(error, '生成'));
  } finally {
    isGeneratingCharacter.value = false;
    characterProgressPercent.value = 0;
  }
};

// 清理角色卡输出中的废话和代码块标记
const cleanCharacterCardOutput = (text: string): string => {
  let cleaned = text;

  // 移除开头的 AI 废话（如 "好的，我将为你创造..." "以下是..." 等）
  const prefixPatterns = [
    /^.*?(?:好的|当然|没问题|以下是|我将|我来|让我)[^]*?(?:角色|创造|设计|生成)[^]*?[:：。\n]/i,
    /^.*?(?:根据你的要求|按照你的描述)[^]*?[:：。\n]/i,
    /^[^]*?---\s*\n/, // 移除分隔线之前的内容
  ];

  for (const pattern of prefixPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // 移除 markdown 代码块标记
  cleaned = cleaned.replace(/^```(?:yaml|yml|json|markdown|md)?\s*\n?/gim, '');
  cleaned = cleaned.replace(/\n?```\s*$/gim, '');
  cleaned = cleaned.replace(/```/g, '');

  // 移除开头的空行
  cleaned = cleaned.replace(/^\s*\n+/, '');

  // 移除结尾的空行
  cleaned = cleaned.replace(/\n+\s*$/, '');

  return cleaned.trim();
};

const clearCharacterForm = () => {
  characterDescription.value = '';
  characterCardOutput.value = '';
  modifyRequest.value = '';
  saveToolsDataImmediate(); // 立即保存
  window.toastr.success('内容已清空');
};

const copyCharacterCard = () => {
  if (!characterCardOutput.value) {
    window.toastr.warning('没有可复制的内容');
    return;
  }

  // 使用统一的复制函数
  copyToClipboard(characterCardOutput.value, '角色卡已复制到剪贴板');
};

// 插入角色卡到当前角色或世界书
const insertCharacterCard = async () => {
  if (!characterCardOutput.value) {
    window.toastr.warning('没有可插入的内容');
    return;
  }

  try {
    isInsertingCharacter.value = true;
    const position = characterInsertPosition.value;
    const positionLabel = characterInsertPositions.find(p => p.value === position)?.label || position;
    const tav = (window as any).TavernHelper;

    // 如果是世界书，走世界书插入逻辑
    if (position === 'worldbook') {
      if (!characterInsertWorldbook.value) {
        window.toastr.warning('请先选择目标世界书');
        return;
      }

      window.toastr.info(`正在插入到世界书「${characterInsertWorldbook.value}」...`);

      if (!tav?.createWorldbookEntries) {
        throw new Error('TavernHelper.createWorldbookEntries 不可用');
      }

      // 创建世界书条目
      const newEntry = {
        content: characterCardOutput.value,
        comment: '角色卡生成 - ' + new Date().toLocaleString(),
        keys: ['角色设定'],
        enabled: true,
      };

      await tav.createWorldbookEntries(characterInsertWorldbook.value, [newEntry], {
        render: 'immediate',
      });

      window.toastr.success(`已插入到世界书「${characterInsertWorldbook.value}」`);
      return;
    }

    window.toastr.info(`正在插入到「${positionLabel}」...`);

    // 获取当前角色
    const st = (window as any).SillyTavern || (window as any).parent?.SillyTavern;

    // 方式1: 使用 TavernHelper.setCharData (如果可用)
    if (tav?.setCharData) {
      await tav.setCharData('current', { [position]: characterCardOutput.value });
      window.toastr.success(`已插入到「${positionLabel}」`);
      return;
    }

    // 方式2: 使用 SillyTavern API
    if (st?.getContext) {
      const ctx = st.getContext();

      // 获取当前角色数据
      const charId = ctx.characterId ?? ctx.characters?.findIndex?.((c: any) => c.avatar === ctx.character?.avatar);
      if (charId === undefined || charId < 0) {
        throw new Error('未找到当前角色');
      }

      // 更新角色数据
      const updateData: any = {};

      // 根据位置设置对应字段
      if (['system_prompt', 'post_history_instructions', 'creator_notes'].includes(position)) {
        // V2 字段在 data 下
        updateData[`data.${position}`] = characterCardOutput.value;
      } else {
        updateData[position] = characterCardOutput.value;
      }

      // 调用保存 API
      const response = await fetch('/api/characters/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar_url: ctx.characters?.[charId]?.avatar,
          ...updateData,
        }),
      });

      if (response.ok) {
        window.toastr.success(`已插入到「${positionLabel}」，请刷新页面查看`);
        return;
      }
    }

    // 方式3: 直接操作 DOM (最后的降级方案)
    const fieldMap: Record<string, string> = {
      description: '#description_textarea, textarea[name="description"]',
      personality: '#personality_textarea, textarea[name="personality"]',
      scenario: '#scenario_textarea, textarea[name="scenario"]',
      first_mes: '#firstmessage_textarea, textarea[name="first_mes"]',
      mes_example: '#mes_example_textarea, textarea[name="mes_example"]',
      system_prompt: '#character_system_prompt, textarea[name="system_prompt"]',
      post_history_instructions: '#character_jailbreak, textarea[name="post_history_instructions"]',
      creator_notes: '#creator_notes_textarea, textarea[name="creator_notes"]',
    };

    const selector = fieldMap[position];
    if (selector) {
      // 尝试在 parent window 中查找
      const parentDoc = window.parent?.document || document;
      const textarea = parentDoc.querySelector(selector) as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = characterCardOutput.value;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        window.toastr.success(`已插入到「${positionLabel}」，记得保存角色卡！`);
        return;
      }
    }

    window.toastr.warning('无法自动插入，已复制到剪贴板，请手动粘贴');
    copyToClipboard(characterCardOutput.value);
  } catch (error) {
    console.error('插入角色卡失败:', error);
    window.toastr.error('插入失败: ' + (error as Error).message);
  } finally {
    isInsertingCharacter.value = false;
  }
};

// 清空反八股表单
const clearAntiClicheForm = () => {
  antiClicheInput.value = '';
  antiClicheOutput.value = '';
  saveToolsDataImmediate(); // 立即保存
  window.toastr.success('内容已清空');
};

// 修改角色卡
const handleModifyCharacterCard = async () => {
  if (!modifyRequest.value.trim()) {
    window.toastr.warning('请输入修改需求');
    return;
  }

  if (!characterCardOutput.value) {
    window.toastr.warning('没有可修改的角色卡，请先生成角色卡');
    return;
  }

  try {
    isModifyingCharacter.value = true;
    characterProgressPercent.value = 0;
    window.toastr.info('AI正在根据你的需求修改角色卡，请稍候...');

    const requestPayload = {
      model: settings.value.model || 'gpt-3.5-turbo',
      max_tokens: settings.value.max_tokens || 16000,
      temperature: 0.8,
      stream: enableCharacterStreaming.value,
      messages: [
        {
          role: 'system',
          content: `你是一个角色卡编辑助手。用户会提供一个现有的 YAML 格式角色卡和修改需求，请根据修改需求调整角色卡内容。

**修改原则**：
1. 必须保持 YAML 格式，所有字段名和内容都使用中文
2. 只修改用户明确要求修改的部分
3. 确保修改后的内容与原有角色卡风格一致
4. 如果用户的要求与原有设定冲突，以用户的要求为准
5. 输出完整的修改后的角色卡，不要截断
6. 保持原有的字段结构，除非用户要求添加或删除字段

**重要注意事项**：
- 身高体重必须用文字描述（高大/中等/娇小/匀称/纤瘦等），不要用数字和单位
- 保持性格的多面性和复杂性，避免单一化
- 行为模式要从角色视角出发，描述角色会如何思考和行动
- 避免AI刻板化，保持角色的真实感和多样性

请输出完整的 YAML 格式角色卡。`,
        },
        {
          role: 'user',
          content: `以下是现有的角色卡：

${characterCardOutput.value}

---

请根据以下修改需求调整角色卡：
${modifyRequest.value}`,
        },
      ],
    };

    let modifiedCard: string;

    // 如果启用了"使用酒馆 API"，通过酒馆后端发送请求（绕过 CORS）
    if (settings.value.use_tavern_api) {
      console.log('🍺 使用酒馆 API 发送角色卡修改请求（绕过 CORS）...');

      modifiedCard = await callAIWithTavernSupport(requestPayload.messages, settings.value, {
        onProgress: p => (characterProgressPercent.value = p),
      });
    } else if (enableCharacterStreaming.value) {
      // 流式生成
      modifiedCard = await generateWithStreaming(requestPayload, characterProgressPercent);
    } else {
      // 非流式生成
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
      // 过滤 API 参数，确保兼容不同的服务提供商
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
        const errorText = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      modifiedCard = data.choices[0].message.content.trim();
      characterProgressPercent.value = 100;
    }

    // 清理输出中的废话和代码块标记
    characterCardOutput.value = cleanCharacterCardOutput(modifiedCard);
    modifyRequest.value = ''; // 清空修改需求
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('角色卡修改完成！');
  } catch (error) {
    console.error('角色卡修改失败:', error);
    window.toastr.error(translateError(error, '修改'));
  } finally {
    isModifyingCharacter.value = false;
    characterProgressPercent.value = 0;
  }
};

// 清空修改需求
const clearModifyRequest = () => {
  modifyRequest.value = '';
  saveToolsDataImmediate(); // 立即保存
  window.toastr.success('修改需求已清空');
};

// ==================== 通用流式生成辅助函数 ====================

/**
 * 智能提取 JSON 对象
 * 尝试从文本中提取 JSON，支持多种格式
 */
const extractJsonFromText = (text: string): { json: any; rawText: string } | null => {
  const trimmedText = text.trim();

  // 方法1: 直接解析（文本本身就是 JSON）
  try {
    const parsed = JSON.parse(trimmedText);
    if (typeof parsed === 'object' && parsed !== null) {
      return { json: parsed, rawText: trimmedText };
    }
  } catch (e) {
    // 继续尝试其他方法
  }

  // 方法2: 提取代码块中的 JSON
  const codeBlockMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (typeof parsed === 'object' && parsed !== null) {
        return { json: parsed, rawText: codeBlockMatch[1].trim() };
      }
    } catch (e) {
      // 继续尝试其他方法
    }
  }

  // 方法3: 查找文本中的第一个 { ... } 对象
  const braceStart = trimmedText.indexOf('{');
  if (braceStart !== -1) {
    let braceCount = 0;
    let braceEnd = -1;
    for (let i = braceStart; i < trimmedText.length; i++) {
      if (trimmedText[i] === '{') braceCount++;
      if (trimmedText[i] === '}') braceCount--;
      if (braceCount === 0) {
        braceEnd = i;
        break;
      }
    }
    if (braceEnd !== -1) {
      const jsonCandidate = trimmedText.substring(braceStart, braceEnd + 1);
      try {
        const parsed = JSON.parse(jsonCandidate);
        if (typeof parsed === 'object' && parsed !== null) {
          return { json: parsed, rawText: jsonCandidate };
        }
      } catch (e) {
        // JSON 无效
      }
    }
  }

  return null;
};

// 从流式响应中提取内容
const extractStreamContent = (chunk: any): string | null => {
  // OpenAI 格式
  if (chunk.choices?.[0]?.delta?.content) {
    return chunk.choices[0].delta.content;
  }
  // Claude 格式
  if (chunk.delta?.text) {
    return chunk.delta.text;
  }
  // 直接内容格式
  if (typeof chunk.content === 'string') {
    return chunk.content;
  }
  if (typeof chunk.text === 'string') {
    return chunk.text;
  }
  if (typeof chunk.response === 'string') {
    return chunk.response;
  }
  return null;
};

// 通用流式生成函数
const generateWithStreaming = async (
  requestPayload: Record<string, any>,
  progressRef: Ref<number>,
): Promise<string> => {
  const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
  const provider = detectApiProvider(settings.value.api_endpoint);
  const wantsStream = requestPayload.stream === true;

  // 过滤 API 参数，确保兼容不同的服务提供商
  const filteredPayload = filterApiParams(requestPayload, settings.value.api_endpoint);

  // 如果当前服务不支持流式传输，则自动降级为普通请求
  if (!wantsStream || provider === 'gemini') {
    if (wantsStream && provider === 'gemini') {
      console.warn('⚠️ 当前 API 不支持流式输出，已自动切换为普通模式');
    }

    delete filteredPayload.stream;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    progressRef.value = 100;

    // 检测内容过滤/安全拦截
    const finishReason = data.choices?.[0]?.finish_reason;
    if (finishReason === 'content_filter' || finishReason === 'PROHIBITED_CONTENT') {
      throw new Error(
        `内容被 AI 安全过滤器拦截 (finish_reason: ${finishReason})\n\n` +
          `输入内容可能包含敏感词汇，或请求的输出被认为不符合安全准则。\n` +
          `建议检查并修改输入内容，或尝试换一个模型。`,
      );
    }

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.warn('⚠️ API 返回数据缺少内容:', JSON.stringify(data).substring(0, 300));
      throw new Error('AI 返回了空内容，请检查 API 设置或重试');
    }
    return content;
  }

  // 对于支持流式的服务，确保 stream 参数存在
  filteredPayload.stream = true;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.value.api_key}`,
    },
    body: JSON.stringify(filteredPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`流式请求失败：${response.status} ${response.statusText}\n${errorText.slice(0, 400)}`);
  }

  if (!response.body) {
    throw new Error('该 API 未返回可读流，请关闭流式模式或检查端点支持情况');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let done = false;
  let result = '';

  progressRef.value = 0;

  const processLine = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) {
      return false;
    }

    if (trimmed === 'data: [DONE]' || trimmed === '[DONE]') {
      return true;
    }

    const payloadText = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
    if (!payloadText || payloadText === '[DONE]') {
      return false;
    }

    try {
      const payloadJson = JSON.parse(payloadText);
      const deltaText = extractStreamContent(payloadJson);
      if (deltaText) {
        result += deltaText;
        progressRef.value = Math.min(progressRef.value + 2, 98);
      }
    } catch (parseError) {
      console.warn('无法解析流式数据块:', payloadText.slice(0, 100), parseError);
    }

    return false;
  };

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (processLine(line)) {
          done = true;
          break;
        }
      }
    }

    if (readerDone) {
      done = true;
    }
  }

  if (buffer && !done) {
    processLine(buffer);
  }

  progressRef.value = 100;

  // 🔧 检查流式结果是否为空
  if (!result || result.trim() === '') {
    throw new Error('AI 返回了空内容，请检查 API 设置或重试');
  }

  return result;
};

// ==================== 世界书条目生成工具 ====================

// 生成世界书条目
const handleGenerateWorldbookEntry = async () => {
  if (!worldbookDescription.value.trim()) {
    window.toastr.warning('请输入条目描述');
    return;
  }

  try {
    isGeneratingWorldbook.value = true;
    worldbookProgressPercent.value = 0;
    window.toastr.info('AI正在生成世界书条目，请稍候...', '', { timeOut: 15000 });

    const requestPayload = {
      model: settings.value.model || 'gpt-3.5-turbo',
      max_tokens: settings.value.max_tokens || 4000,
      temperature: 0.7,
      stream: enableWorldbookStreaming.value,
      messages: [
        {
          role: 'system',
          content: `你是SillyTavern世界书条目生成专家，负责将用户需求转换为标准JSON格式的世界书条目。

# JSON结构规范

{
  "name": "条目名称",
  "enabled": true,
  "strategy": {
    "type": "selective或constant",
    "keys": ["关键字数组"],
    "keys_secondary": { "logic": "and_any", "keys": [] },
    "scan_depth": "same_as_global"
  },
  "position": {
    "type": "after_character_definition",
    "role": "system",
    "depth": 4,
    "order": 100
  },
  "content": "条目正文内容",
  "probability": 100,
  "recursion": {
    "prevent_incoming": false,
    "prevent_outgoing": false,
    "delay_until": null
  },
  "effect": {
    "sticky": null,
    "cooldown": null,
    "delay": null
  }
}

---

# 字段填写规则

## 1️⃣ name（条目名称）
- 简短明确（2-6字最佳）
- 反映核心主题
- 示例："林潜"、"魔法学院"、"火焰剑"

## 2️⃣ strategy.type（激活类型）
**selective（绿灯）** - 关键字触发：
- 角色、地点、物品
- 特定事件、特定概念
- 需要按需激活的内容

**constant（蓝灯）** - 始终生效：
- 世界观基础设定
- 通用规则
- 全局背景信息

## 3️⃣ strategy.keys（关键字）
- 3-6个关键词
- 包含：全名、简称、别名、相关概念
- 示例：["林潜", "林", "潜"]、["魔法学院", "学院", "星辉"]

## 4️⃣ content（正文内容）⚠️ 最重要！

### ❌ 严禁使用的格式
**禁止Markdown语法**：
- ❌ 不用 # 标题、## 二级标题
- ❌ 不用 **粗体**、*斜体*
- ❌ 不用 - 列表、1. 数字列表
- ❌ 不用 > 引用
- ❌ 不用 \`代码\`

**禁止AI八股文**：
- ❌ 不用"一丝"、"一抹"、"如同"、"宛如"
- ❌ 不用"眼里闪过"、"嘴角上扬"
- ❌ 不用"既...又..."、"不是...而是..."
- ❌ 不描写心理、眼神、声音、气氛

### ✅ 正确的写法
**纯文本 + 冒号分隔**：
- 用"。"句号分隔信息
- 用"："冒号引出具体内容
- 用"、"顿号列举

**陈述式 + 信息密集**：
- 直接陈述事实
- 简洁有力，不绕弯子
- 每句话都有实质信息

**结构化组织**：
- 从基础信息到详细设定
- 逻辑顺序：身份→特征→背景→能力→关系
- 用换行段落分隔不同主题

### 📋 内容模板

**角色类**：
[姓名]，[性别]，[年龄]，[职业/身份]。[外貌特征1-2句]。[性格核心特点]。[重要背景]。[能力/特长]。[与其他角色的关系]。

**地点类**：
[地点名]位于[位置]，[基本描述]。[功能用途]。[历史背景]。[重要特征]。[相关规则]。

**物品类**：
[物品名]，[类型]，[外观]。[功能/效果]。[获取方式]。[使用限制]。[特殊说明]。

**概念/事件类**：
[概念名]指[定义]。[具体表现]。[影响范围]。[相关规则]。[注意事项]。

---

# 完整示例

## 示例1：角色条目

用户需求："创建角色林潜的条目，16岁，男，高中生，普通家庭"

输出：
{
  "name": "林潜",
  "enabled": true,
  "strategy": {
    "type": "selective",
    "keys": ["林潜", "林", "潜", "男生", "同学"],
    "keys_secondary": { "logic": "and_any", "keys": [] },
    "scan_depth": "same_as_global"
  },
  "position": {
    "type": "after_character_definition",
    "role": "system",
    "depth": 4,
    "order": 100
  },
  "content": "林潜，男性，16岁，目前就读高中。出身于普通家庭，家庭经济状况中等。性格内向，不太擅长社交。学习成绩中等偏上，理科比文科好。平时喜欢独自看书，经常一个人待在图书馆。对陌生人保持警惕，熟悉后会放松一些。",
  "probability": 100,
  "recursion": {
    "prevent_incoming": false,
    "prevent_outgoing": false,
    "delay_until": null
  },
  "effect": {
    "sticky": null,
    "cooldown": null,
    "delay": null
  }
}

## 示例2：地点条目

用户需求："创建魔法学院的条目，包含历史和规则"

输出：
{
  "name": "星辉魔法学院",
  "enabled": true,
  "strategy": {
    "type": "selective",
    "keys": ["星辉魔法学院", "魔法学院", "学院", "星辉", "校园"],
    "keys_secondary": { "logic": "and_any", "keys": [] },
    "scan_depth": "same_as_global"
  },
  "position": {
    "type": "after_character_definition",
    "role": "system",
    "depth": 4,
    "order": 100
  },
  "content": "星辉魔法学院位于浮空岛上，建立于三百年前。学院有七座高塔，对应七大魔法流派：元素、心灵、转化、召唤、预言、防护、幻术。学院采用学分制，学生需完成基础课程和专精课程才能毕业。\n\n学院规则：禁止在教学区施展未经许可的魔法。禁止擅自进入禁书区。禁止私下决斗，违者将被停学。学生需佩戴学院徽章，按时参加每周的全体集会。",
  "probability": 100,
  "recursion": {
    "prevent_incoming": false,
    "prevent_outgoing": false,
    "delay_until": null
  },
  "effect": {
    "sticky": null,
    "cooldown": null,
    "delay": null
  }
}

---

# 最终要求

1. **只输出JSON**：不要任何解释、注释、说明
2. **格式正确**：确保可被JSON.parse()解析
3. **信息完整**：用户提供的所有信息都必须在content中体现
4. **禁用Markdown**：content必须是纯文本，不用任何Markdown语法
5. **避免八股文**：不用套话、比喻、心理描写
6. **结构清晰**：用句号、冒号、换行组织内容，不用列表符号

现在根据用户需求生成世界书条目JSON。`,
        },
        {
          role: 'user',
          content: worldbookDescription.value,
        },
      ],
    };

    let generatedText: string;

    // 如果启用了"使用酒馆 API"，通过酒馆后端发送请求（绕过 CORS）
    if (settings.value.use_tavern_api) {
      console.log('🍺 使用酒馆 API 发送世界书生成请求（绕过 CORS）...');

      generatedText = await callAIWithTavernSupport(requestPayload.messages, settings.value as any, {
        onProgress: (p: number) => {
          worldbookProgressPercent.value = Math.max(worldbookProgressPercent.value, p);
        },
      });

      if (!generatedText || generatedText.trim() === '') {
        throw new Error('酒馆 API 返回了空结果');
      }

      worldbookProgressPercent.value = 100;
      console.log('✅ 通过酒馆 API 成功获取世界书条目');
    } else if (enableWorldbookStreaming.value) {
      // 流式生成
      generatedText = await generateWithStreaming(requestPayload, worldbookProgressPercent);
    } else {
      // 非流式生成
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
      // 过滤 API 参数，确保兼容不同的服务提供商
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
        const errorText = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      generatedText = data.choices[0].message.content.trim();
      worldbookProgressPercent.value = 100;
    }

    // 尝试解析 JSON
    const extractResult = extractJsonFromText(generatedText);
    if (extractResult) {
      worldbookEntryOutput.value = extractResult.json;
      saveToolsDataImmediate(); // 立即保存结果
      window.toastr.success('世界书条目生成完成！');
    } else {
      console.error('JSON 提取失败，原始响应:', generatedText);
      // 保存原始响应以便用户查看
      worldbookEntryOutput.value = {
        _error: true,
        _message: 'AI 返回的内容不是有效的 JSON 格式，请重试或手动修改',
        _rawResponse: generatedText,
      };
      saveToolsDataImmediate();
      window.toastr.warning('AI 返回的内容不是 JSON 格式，已显示原始响应');
    }
  } catch (error) {
    console.error('世界书条目生成失败:', error);
    window.toastr.error(translateError(error, '生成'));
  } finally {
    isGeneratingWorldbook.value = false;
    worldbookProgressPercent.value = 0;
  }
};

// 清空世界书表单
const clearWorldbookForm = () => {
  worldbookDescription.value = '';
  worldbookEntryOutput.value = null;
  selectedWorldbook.value = '';
  worldbookModifyRequest.value = '';
  saveToolsDataImmediate(); // 立即保存
  window.toastr.success('内容已清空');
};

// 插入条目到世界书
const handleInsertEntry = async () => {
  if (!selectedWorldbook.value) {
    window.toastr.warning('请选择目标世界书');
    return;
  }

  if (!worldbookEntryOutput.value) {
    window.toastr.warning('没有可插入的条目');
    return;
  }

  try {
    isInsertingEntry.value = true;
    window.toastr.info(`正在插入条目到「${selectedWorldbook.value}」...`);

    // 检查 TavernHelper 是否可用
    if (typeof (window as any).TavernHelper === 'undefined') {
      throw new Error('TavernHelper 不可用，请确保在 SillyTavern 环境中运行');
    }

    // 使用 TavernHelper.createWorldbookEntries 插入条目
    await (window as any).TavernHelper.createWorldbookEntries(selectedWorldbook.value, [worldbookEntryOutput.value], {
      render: 'immediate',
    });

    window.toastr.success(`✅ 条目已成功插入到「${selectedWorldbook.value}」`);
  } catch (error) {
    console.error('插入条目失败:', error);
    window.toastr.error(translateError(error, '插入条目'));
  } finally {
    isInsertingEntry.value = false;
  }
};

// 复制世界书条目 JSON
const copyWorldbookEntry = () => {
  if (!worldbookEntryOutput.value) {
    window.toastr.warning('没有可复制的内容');
    return;
  }

  const jsonText = JSON.stringify(worldbookEntryOutput.value, null, 2);
  copyToClipboard(jsonText, '世界书条目 JSON 已复制到剪贴板');
};

// 修改世界书条目
const handleModifyWorldbookEntry = async () => {
  if (!worldbookModifyRequest.value.trim()) {
    window.toastr.warning('请输入修改需求');
    return;
  }

  if (!worldbookEntryOutput.value) {
    window.toastr.warning('没有可修改的条目，请先生成条目');
    return;
  }

  try {
    isModifyingWorldbook.value = true;
    worldbookProgressPercent.value = 0;
    window.toastr.info('AI正在根据你的需求修改世界书条目，请稍候...');

    const requestPayload = {
      model: settings.value.model || 'gpt-3.5-turbo',
      max_tokens: settings.value.max_tokens || 4000,
      temperature: 0.7,
      stream: enableWorldbookStreaming.value,
      messages: [
        {
          role: 'system',
          content: `你是一个世界书条目编辑助手。用户会提供一个现有的世界书条目 JSON 和修改需求，请根据修改需求调整条目内容。

**修改原则**：
1. 必须保持 JSON 格式正确
2. 只修改用户明确要求修改的部分
3. 确保修改后的内容与原有条目风格一致
4. 如果用户的要求与原有设定冲突，以用户的要求为准
5. 输出完整的修改后的 JSON，不要截断
6. 保持原有的字段结构，除非用户要求添加或删除字段

**重要注意事项**：
- 如果修改内容 (content)，务必包含用户要求的所有信息
- 如果修改关键字 (keys)，要确保关键字与内容匹配
- 保持激活策略 (strategy.type) 的合理性
- 只输出 JSON 数据，不要添加任何解释

请输出完整的 JSON 格式世界书条目。`,
        },
        {
          role: 'user',
          content: `以下是现有的世界书条目：

${JSON.stringify(worldbookEntryOutput.value, null, 2)}

---

请根据以下修改需求调整条目：
${worldbookModifyRequest.value}`,
        },
      ],
    };

    let generatedText: string;

    // 如果启用了"使用酒馆 API"，通过酒馆后端发送请求（绕过 CORS）
    if (settings.value.use_tavern_api) {
      console.log('🍺 使用酒馆 API 发送世界书修改请求（绕过 CORS）...');

      generatedText = await callAIWithTavernSupport(requestPayload.messages, settings.value as any, {
        onProgress: (p: number) => {
          worldbookProgressPercent.value = Math.max(worldbookProgressPercent.value, p);
        },
      });

      if (!generatedText || generatedText.trim() === '') {
        throw new Error('酒馆 API 返回了空结果');
      }

      worldbookProgressPercent.value = 100;
      console.log('✅ 通过酒馆 API 成功获取修改后的世界书条目');
    } else if (enableWorldbookStreaming.value) {
      // 流式生成
      generatedText = await generateWithStreaming(requestPayload, worldbookProgressPercent);
    } else {
      // 非流式生成
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
      // 过滤 API 参数，确保兼容不同的服务提供商
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
        const errorText = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      generatedText = data.choices[0].message.content.trim();
      worldbookProgressPercent.value = 100;
    }

    // 尝试解析 JSON
    const extractResult = extractJsonFromText(generatedText);
    if (extractResult) {
      worldbookEntryOutput.value = extractResult.json;
      worldbookModifyRequest.value = ''; // 清空修改需求
      saveToolsDataImmediate(); // 立即保存结果
      window.toastr.success('世界书条目修改完成！');
    } else {
      console.error('JSON 提取失败，原始响应:', generatedText);
      // 保存原始响应以便用户查看
      worldbookEntryOutput.value = {
        _error: true,
        _message: 'AI 返回的内容不是有效的 JSON 格式，请重试或手动修改',
        _rawResponse: generatedText,
      };
      saveToolsDataImmediate();
      window.toastr.warning('AI 返回的内容不是 JSON 格式，已显示原始响应');
    }
  } catch (error) {
    console.error('世界书条目修改失败:', error);
    window.toastr.error(translateError(error, '修改'));
  } finally {
    isModifyingWorldbook.value = false;
    worldbookProgressPercent.value = 0;
  }
};

// 清空修改需求
const clearWorldbookModifyRequest = () => {
  worldbookModifyRequest.value = '';
  saveToolsDataImmediate(); // 立即保存
  window.toastr.success('修改需求已清空');
};

// ==================== 批量生成世界书条目 ====================

// 关闭批量生成对话框（不清空结果，保留供下次查看）
const closeBatchDialog = () => {
  showBatchDialog.value = false;
  // 只清空输入和进度，保留结果
  batchInput.value = '';
  batchProgress.value = { current: 0, total: 0, currentName: '' };
};

// 清空批量生成结果
const clearBatchResults = () => {
  batchResults.value = [];
  saveToolsDataImmediate();
  window.toastr.success('批量生成结果已清空');
};

// 最小化批量生成对话框（后台运行）
const minimizeBatchDialog = () => {
  showBatchDialog.value = false;
  window.toastr.info('批量生成已转入后台运行，完成后将自动通知', '后台运行', { timeOut: 3000 });
};

// 获取条目的关键词（兼容不同结构）
const getEntryKeys = (entry: any): string => {
  // 优先读取 strategy.keys（新结构）
  if (entry.strategy?.keys?.length > 0) {
    return entry.strategy.keys.join(', ');
  }
  // 兼容 key 数组（旧结构）
  if (Array.isArray(entry.key) && entry.key.length > 0) {
    return entry.key.join(', ');
  }
  // 兼容 key 字符串
  if (typeof entry.key === 'string' && entry.key) {
    return entry.key;
  }
  return '无';
};

// 批量生成世界书条目
const handleBatchGenerate = async () => {
  if (!batchInput.value.trim()) {
    window.toastr.warning('请输入设定文本');
    return;
  }

  try {
    isBatchGenerating.value = true;
    batchResults.value = [];
    batchProgress.value = { current: 0, total: 0, currentName: '正在分析文本...' };

    // 第一步：让 AI 分析文本并拆分成多个条目描述
    const splitPrompt = `你是世界书条目拆分专家。请分析以下设定文本，将其拆分成多个独立的世界书条目。

要求：
1. 每个条目应该是一个独立的概念（角色、地点、物品、规则等）
2. 返回 JSON 数组格式
3. 每个元素包含 name（条目名称）和 description（条目描述）

设定文本：
${batchInput.value}

请直接返回 JSON 数组，格式如下：
[
  {"name": "条目名称1", "description": "该条目的详细描述"},
  {"name": "条目名称2", "description": "该条目的详细描述"}
]`;

    // 构建请求参数
    const splitPayload = {
      model: settings.value.model,
      max_tokens: settings.value.max_tokens || 4000,
      temperature: 0.7,
      messages: [{ role: 'user', content: splitPrompt }],
    };

    let splitResponse: string;
    if (settings.value.use_tavern_api) {
      splitResponse = await callAIWithTavernSupport(splitPayload.messages, settings.value);
    } else {
      // 直接调用 API（和反八股工具一样的方式）
      const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
      const filteredPayload = filterApiParams(splitPayload, settings.value.api_endpoint);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.value.api_key}`,
        },
        body: JSON.stringify(filteredPayload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
      }
      const data = await response.json();
      splitResponse = data.choices?.[0]?.message?.content?.trim() || '';
    }

    // 解析拆分结果
    let entries: Array<{ name: string; description: string }> = [];
    try {
      const jsonMatch = splitResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        entries = JSON.parse(jsonMatch[0]);
      }
    } catch {
      window.toastr.error('AI 返回的拆分结果格式错误，请重试');
      isBatchGenerating.value = false;
      return;
    }

    if (entries.length === 0) {
      window.toastr.warning('未能从文本中拆分出条目，请检查输入');
      isBatchGenerating.value = false;
      return;
    }

    batchProgress.value.total = entries.length;
    window.toastr.info(`已拆分为 ${entries.length} 个条目，开始生成...`);

    // 第二步：逐个生成世界书条目
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      batchProgress.value.current = i + 1;
      batchProgress.value.currentName = entry.name;

      try {
        const generatePrompt = `你是SillyTavern世界书条目生成专家。请根据以下描述生成一个世界书条目。

条目名称：${entry.name}
条目描述：${entry.description}

# 生成规则（重要！）
1. content 必须使用简洁的陈述式语言，禁止使用：
   - 模糊词：似乎、几乎、近乎、好像、仿佛、如同
   - 八股比喻：像小兔子一样、像小兽
   - 语气描述：带着xxx的口吻、用xxx的语气
   - 微表情：嘴角上扬、眼里闪过
   - 否定转折：不是……而是……
2. 不要使用 Markdown 格式（# 和 **）
3. key 关键词要精准，避免过于宽泛

请直接返回 JSON：
{
  "name": "条目名称",
  "key": ["精准关键词1", "关键词2"],
  "content": "简洁陈述式的条目正文",
  "comment": "条目备注"
}`;

        // 构建请求参数
        const generatePayload = {
          model: settings.value.model,
          max_tokens: settings.value.max_tokens || 4000,
          temperature: 0.7,
          messages: [{ role: 'user', content: generatePrompt }],
        };

        let response: string;
        if (settings.value.use_tavern_api) {
          response = await callAIWithTavernSupport(generatePayload.messages, settings.value);
        } else {
          const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
          const filteredPayload = filterApiParams(generatePayload, settings.value.api_endpoint);
          const fetchResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${settings.value.api_key}`,
            },
            body: JSON.stringify(filteredPayload),
          });
          if (!fetchResponse.ok) {
            throw new Error(`API 请求失败 (${fetchResponse.status})`);
          }
          const data = await fetchResponse.json();
          response = data.choices?.[0]?.message?.content?.trim() || '';
        }

        // 解析生成的条目
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiResult = JSON.parse(jsonMatch[0]);
          // 补全世界书条目的完整结构（按教程建议设置）
          const generatedEntry = {
            name: aiResult.name || entry.name,
            enabled: true,
            // 策略：按关键词触发（黄灯）
            strategy: {
              type: 'conditional' as const,
              keys: aiResult.key || [entry.name],
              keys_secondary: { logic: 'and_any' as const, keys: [] },
              scan_depth: 'same_as_global' as const,
            },
            // 位置：角色定义之后（按教程建议）
            position: {
              type: 'after_character_definition' as const,
              role: 'system' as const,
              depth: 0,
            },
            content: aiResult.content || entry.description,
            comment: aiResult.comment || '',
            insertion_order: i + 1, // 按生成顺序排序
            case_sensitive: false,
            exclude_recursion: true, // 防止进一步递归（按教程建议）
            uid: Date.now() + i,
          };
          batchResults.value.push(generatedEntry);
        }
      } catch (error) {
        console.error(`生成条目 "${entry.name}" 失败:`, error);
        // 继续生成下一个
      }
    }

    if (batchResults.value.length > 0) {
      saveToolsDataImmediate(); // 保存批量生成结果
      // 如果对话框已关闭（后台运行），弹出可点击的通知
      if (!showBatchDialog.value) {
        window.toastr.success(`✅ 成功生成 ${batchResults.value.length} 个条目，点击查看`, '批量生成完成', {
          timeOut: 0, // 不自动消失
          extendedTimeOut: 0,
          closeButton: true,
          onclick: () => {
            showBatchDialog.value = true;
          },
        });
      } else {
        window.toastr.success(`成功生成 ${batchResults.value.length} 个条目`);
      }
    } else {
      window.toastr.error('所有条目生成失败，请重试');
    }
  } catch (error) {
    console.error('批量生成失败:', error);
    window.toastr.error(translateError(error, '批量生成'));
  } finally {
    isBatchGenerating.value = false;
  }
};

// 批量插入条目到世界书
const handleBatchInsert = async () => {
  if (batchResults.value.length === 0) {
    window.toastr.warning('没有可插入的条目');
    return;
  }

  if (!selectedWorldbook.value) {
    window.toastr.warning('请先在下方选择目标世界书');
    showBatchDialog.value = false;
    return;
  }

  try {
    await (window as any).TavernHelper.createWorldbookEntries(selectedWorldbook.value, batchResults.value, {
      render: 'immediate',
    });

    window.toastr.success(`已将 ${batchResults.value.length} 个条目插入到「${selectedWorldbook.value}」`);
    // 插入成功后清空结果
    batchResults.value = [];
    saveToolsDataImmediate();
    closeBatchDialog();
  } catch (error) {
    console.error('批量插入失败:', error);
    window.toastr.error(translateError(error, '批量插入'));
  }
};

// ==================== 世界书查看器相关函数 ====================

// 加载世界书条目（插件环境使用 TavernHelper）
const loadWorldbookEntries = async () => {
  if (!selectedViewerWorldbook.value) {
    worldbookEntries.value = [];
    return;
  }

  try {
    // 插件环境：优先使用 TavernHelper.getWorldbook()
    let worldbook: any = null;
    if (
      typeof (window as any).TavernHelper !== 'undefined' &&
      typeof (window as any).TavernHelper.getWorldbook === 'function'
    ) {
      worldbook = await (window as any).TavernHelper.getWorldbook(selectedViewerWorldbook.value);
    } else {
      console.error('❌ TavernHelper.getWorldbook 不可用');
      window.toastr.error('世界书功能需要酒馆助手支持');
      worldbookEntries.value = [];
      return;
    }

    if (worldbook && Array.isArray(worldbook) && worldbook.length > 0) {
      worldbookEntries.value = worldbook;
      console.log(`✅ 已加载世界书 "${selectedViewerWorldbook.value}" 的 ${worldbookEntries.value.length} 个条目`);
      window.toastr.success(`已加载 ${worldbookEntries.value.length} 个条目`);
    } else {
      worldbookEntries.value = [];
      window.toastr.info('该世界书没有条目');
    }
  } catch (error) {
    console.error('❌ 加载世界书条目失败:', error);
    window.toastr.error(translateError(error, '加载'));
    worldbookEntries.value = [];
  }
};

// 计算过滤后的条目
const filteredWorldbookEntries = computed(() => {
  let entries = [...worldbookEntries.value];

  // 搜索过滤
  if (viewerSearchQuery.value.trim()) {
    const query = viewerSearchQuery.value.toLowerCase();
    entries = entries.filter(entry => {
      const nameMatch = entry.name?.toLowerCase().includes(query);
      const contentMatch = entry.content?.toLowerCase().includes(query);
      const keysMatch = entry.strategy?.keys?.some(key => {
        if (typeof key === 'string') {
          return key.toLowerCase().includes(query);
        } else if (key instanceof RegExp) {
          return key.toString().toLowerCase().includes(query);
        }
        return false;
      });
      return nameMatch || contentMatch || keysMatch;
    });
  }

  // 排序过滤
  if (viewerSortBy.value === 'enabled') {
    entries = entries.filter(entry => entry.enabled);
  } else if (viewerSortBy.value === 'disabled') {
    entries = entries.filter(entry => !entry.enabled);
  }

  return entries;
});

// 切换条目展开状态
const toggleEntryExpanded = (index: number) => {
  const current = entryExpandedState.value.get(index) || false;
  entryExpandedState.value.set(index, !current);
};

// 检查条目是否展开
const isEntryExpanded = (index: number) => {
  return entryExpandedState.value.get(index) || false;
};

// 编辑世界书条目
const editWorldbookEntry = (entry: WorldbookEntry) => {
  try {
    // 深拷贝条目数据，避免直接修改原数据
    editingEntry.value = {
      uid: entry.uid,
      name: entry.name || '',
      enabled: entry.enabled ?? true,
      content: entry.content || '',
      strategy: {
        type: entry.strategy?.type || 'selective',
        keys: [...(entry.strategy?.keys || [])],
        keys_secondary: {
          logic: entry.strategy?.keys_secondary?.logic || 'and_any',
          keys: [...(entry.strategy?.keys_secondary?.keys || [])],
        },
        scan_depth: entry.strategy?.scan_depth || 'same_as_global',
      },
      position: entry.position
        ? {
            type: entry.position.type || 'before_character_definition',
            role: entry.position.role || 'system',
            depth: entry.position.depth ?? 0,
            order: entry.position.order ?? 0,
          }
        : {
            type: 'before_character_definition',
            role: 'system',
            depth: 0,
            order: 0,
          },
      probability: entry.probability ?? 100,
      recursion: entry.recursion
        ? {
            prevent_incoming: entry.recursion.prevent_incoming ?? false,
            prevent_outgoing: entry.recursion.prevent_outgoing ?? false,
            delay_until: entry.recursion.delay_until ?? null,
          }
        : {
            prevent_incoming: false,
            prevent_outgoing: false,
            delay_until: null,
          },
      effect: entry.effect
        ? {
            sticky: entry.effect.sticky ?? null,
            cooldown: entry.effect.cooldown ?? null,
            delay: entry.effect.delay ?? null,
          }
        : {
            sticky: null,
            cooldown: null,
            delay: null,
          },
    };
    editingEntryUid.value = entry.uid;
    showEditDialog.value = true;
  } catch (error) {
    console.error('打开编辑界面失败:', error);
    window.toastr.error(translateError(error, '打开编辑界面'));
  }
};

// 保存编辑的条目
const saveEditedEntry = async () => {
  if (!editingEntry.value.name?.trim()) {
    window.toastr.warning('条目名称不能为空');
    return;
  }

  if (!editingEntryUid.value) {
    window.toastr.error('条目ID不存在');
    return;
  }

  try {
    // 检查 TavernHelper 是否可用
    if (typeof (window as any).TavernHelper === 'undefined') {
      throw new Error('TavernHelper 不可用，请确保在 SillyTavern 环境中运行');
    }

    // 使用 TavernHelper.updateWorldbookWith API 更新条目
    const updatedWorldbook = await (window as any).TavernHelper.updateWorldbookWith(
      selectedViewerWorldbook.value,
      (worldbook: any) => {
        const entryIndex = worldbook.findIndex((e: any) => e.uid === editingEntryUid.value);
        if (entryIndex !== -1) {
          // 更新条目
          worldbook[entryIndex] = {
            ...worldbook[entryIndex],
            ...editingEntry.value,
            uid: editingEntryUid.value, // 确保 UID 不变
          };
        }
        return worldbook;
      },
    );

    // 更新本地数据
    worldbookEntries.value = updatedWorldbook;

    // 关闭对话框
    showEditDialog.value = false;
    editingEntry.value = {};
    editingEntryUid.value = null;

    window.toastr.success('条目已保存');
  } catch (error) {
    console.error('保存条目失败:', error);
    window.toastr.error(translateError(error, '保存'));
  }
};

// 删除世界书条目
const deleteWorldbookEntry = async (entry: WorldbookEntry) => {
  if (!confirm(`确定要删除条目 "${entry.name}" 吗？`)) {
    return;
  }

  try {
    // 使用 deleteWorldbookEntries API
    const { worldbook } = await deleteWorldbookEntries(selectedViewerWorldbook.value, e => e.uid === entry.uid);

    // 重新加载列表
    worldbookEntries.value = worldbook;

    window.toastr.success(`已删除条目 "${entry.name}"`);
  } catch (error) {
    console.error('删除条目失败:', error);
    window.toastr.error(translateError(error, '删除'));
  }
};
</script>

<style scoped>
.tools-tab {
  height: 100%;
  overflow-y: auto;
  padding: 25px !important;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  border: 1px solid #3a3a3a;
}

.section-header:hover {
  background: linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 反八股工具美化 */
.section-header-anti-cliche {
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(58, 58, 58, 0.95) 100%) !important;
  border: 1px solid rgba(255, 107, 107, 0.3) !important;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 107, 107, 0.1) inset !important;
  backdrop-filter: blur(10px);
}

.section-header-anti-cliche:hover {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(238, 90, 36, 0.2) 100%) !important;
  border-color: rgba(255, 107, 107, 0.5) !important;
  box-shadow:
    0 4px 16px rgba(255, 107, 107, 0.3),
    0 0 0 1px rgba(255, 107, 107, 0.2) inset !important;
  transform: translateY(-2px) !important;
}

/* 世界书条目生成工具美化 */
.section-header-worldbook {
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(58, 58, 58, 0.95) 100%) !important;
  border: 1px solid rgba(255, 193, 7, 0.3) !important;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 193, 7, 0.1) inset !important;
  backdrop-filter: blur(10px);
}

.section-header-worldbook:hover {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%) !important;
  border-color: rgba(255, 193, 7, 0.5) !important;
  box-shadow:
    0 4px 16px rgba(255, 193, 7, 0.3),
    0 0 0 1px rgba(255, 193, 7, 0.2) inset !important;
  transform: translateY(-2px) !important;
}

/* 角色卡生成工具美化 */
.section-header-character {
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(58, 58, 58, 0.95) 100%) !important;
  border: 1px solid rgba(23, 162, 184, 0.3) !important;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(23, 162, 184, 0.1) inset !important;
  backdrop-filter: blur(10px);
}

.section-header-character:hover {
  background: linear-gradient(135deg, rgba(23, 162, 184, 0.2) 0%, rgba(19, 132, 150, 0.2) 100%) !important;
  border-color: rgba(23, 162, 184, 0.5) !important;
  box-shadow:
    0 4px 16px rgba(23, 162, 184, 0.3),
    0 0 0 1px rgba(23, 162, 184, 0.2) inset !important;
  transform: translateY(-2px) !important;
}

/* 工具区域整体美化 */
.tool-section-anti-cliche,
.tool-section-worldbook,
.tool-section-character {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(26, 26, 26, 0.5);
  backdrop-filter: blur(5px);
}

.tool-content {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.tool-instructions {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 12px;
  color: #ccc;
  font-size: 12px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.output-section {
  margin-top: 20px;
}

.output-content {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 15px;
  color: #e0e0e0;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}

.output-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

/* 按钮样式 */
.process-button,
.clear-button,
.generate-button,
.copy-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.process-button:hover:not(:disabled),
.clear-button:hover:not(:disabled),
.generate-button:hover:not(:disabled),
.copy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.copy-button:hover {
  background: #218838 !important;
}

.tool-instructions {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 12px;
  color: #ccc;
  font-size: 12px;
  margin-bottom: 15px;
}

/* 美化按钮的悬停效果 */
.process-button:hover:not(:disabled) .shimmer-effect,
.clear-button:hover:not(:disabled) .shimmer-effect,
.generate-button:hover:not(:disabled) .shimmer-effect,
.copy-button:hover .shimmer-effect {
  left: 100%;
}

.process-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.clear-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(23, 162, 184, 0.4);
}

.copy-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

.process-button:disabled,
.clear-button:disabled,
.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.process-button:disabled:hover,
.clear-button:disabled:hover,
.generate-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 滚动条样式 */
.output-content::-webkit-scrollbar {
  width: 6px;
}

.output-content::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.output-content::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.output-content::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .output-actions {
    flex-direction: column;
  }
}

/* 进度条动画 */
@keyframes progress-slide {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes progress-glow {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes gradient-shift {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes bounce-small {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
