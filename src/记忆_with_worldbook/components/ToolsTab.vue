<template>
  <div class="tools-tab" style="padding: 25px !important; background: #1a1a1a !important">
    <!-- 反八股工具 -->
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
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 255, 255, 0.06);
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
          反八股工具
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
          <textarea
            v-model="antiClicheInput"
            placeholder="请输入需要清理的文本..."
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

        <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 20px">
          <button
            class="process-button"
            :disabled="isProcessingAntiCliche || !antiClicheInput.trim()"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
              border-radius: 12px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="handleAntiClicheProcess"
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
            <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px"></i>
            {{ isProcessingAntiCliche ? '处理中...' : '开始清理' }}
          </button>

          <button
            class="clear-button"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              border: none;
              border-radius: 12px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(255, 107, 107, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="clearAntiClicheForm"
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
            <i class="fa-solid fa-trash" style="font-size: 14px; margin-right: 6px"></i>
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
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
                position: relative;
                overflow: hidden;
              "
              @click="copyAntiClicheResult"
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
                  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
                  border: none;
                  border-radius: 6px;
                  color: #1a1a1a;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 3px 12px rgba(255, 193, 7, 0.3);
                  opacity: 1;
                "
                :style="{
                  opacity: isModifyingAntiCliche || !antiClicheModifyRequest.trim() ? 0.5 : 1,
                  cursor: isModifyingAntiCliche || !antiClicheModifyRequest.trim() ? 'not-allowed' : 'pointer',
                }"
                @click="handleModifyAntiCliche"
              >
                <i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 6px"></i>
                {{ isModifyingAntiCliche ? '修改中...' : 'AI 修改' }}
              </button>
              <button
                :disabled="!antiClicheModifyRequest.trim()"
                style="
                  padding: 10px 20px;
                  background: #dc3545;
                  border: none;
                  border-radius: 6px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                "
                :style="{
                  opacity: !antiClicheModifyRequest.trim() ? 0.5 : 1,
                  cursor: !antiClicheModifyRequest.trim() ? 'not-allowed' : 'pointer',
                }"
                @click="clearAntiClicheModifyRequest"
              >
                <i class="fa-solid fa-eraser" style="margin-right: 6px"></i>
                清空修改需求
              </button>
            </div>
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
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 255, 255, 0.06);
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
              background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
              border: none;
              border-radius: 12px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(255, 193, 7, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="handleGenerateWorldbookEntry"
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
            <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px"></i>
            {{ isGeneratingWorldbook ? '生成中...' : '生成条目' }}
          </button>

          <button
            class="clear-button"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              border: none;
              border-radius: 12px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(255, 107, 107, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="clearWorldbookForm"
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
            <i class="fa-solid fa-trash" style="font-size: 14px; margin-right: 6px"></i>
            清空
          </button>
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
                  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
                  border: none;
                  border-radius: 12px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 3px 12px rgba(255, 165, 0, 0.3);
                  position: relative;
                  overflow: hidden;
                "
                @click="handleModifyWorldbookEntry"
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
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 14px; margin-right: 6px"></i>
                {{ isModifyingWorldbook ? '修改中...' : 'AI修改' }}
              </button>

              <button
                class="clear-modify-button"
                style="
                  padding: 12px 24px;
                  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                  border: none;
                  border-radius: 12px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 3px 12px rgba(108, 117, 125, 0.3);
                  position: relative;
                  overflow: hidden;
                "
                @click="clearWorldbookModifyRequest"
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
                  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                  border: none;
                  border-radius: 6px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
                  position: relative;
                  overflow: hidden;
                "
                @click="handleInsertEntry"
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
                <i class="fa-solid fa-plus-circle" style="font-size: 14px"></i>
                {{ isInsertingEntry ? '插入中...' : '插入条目' }}
              </button>

              <button
                class="copy-button"
                style="
                  padding: 10px 20px;
                  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                  border: none;
                  border-radius: 6px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  box-shadow: 0 3px 12px rgba(23, 162, 184, 0.3);
                  position: relative;
                  overflow: hidden;
                "
                @click="copyWorldbookEntry"
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
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 255, 255, 0.06);
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
              background: viewerSortBy === 'original' ? '#20c997' : '#444',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
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
              background: viewerSortBy === 'enabled' ? '#28a745' : '#444',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }"
            @click="viewerSortBy = 'enabled'"
          >
            ✓ 全选
          </button>
          <button
            :style="{
              padding: '8px 16px',
              background: viewerSortBy === 'disabled' ? '#dc3545' : '#444',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }"
            @click="viewerSortBy = 'disabled'"
          >
            ✕ 取消全选
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
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 255, 255, 0.06);
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
              background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
              border: none;
              border-radius: 12px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(23, 162, 184, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="handleGenerateCharacterCard"
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
            <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px"></i>
            {{ isGeneratingCharacter ? '生成中...' : '生成角色卡' }}
          </button>

          <button
            class="clear-button"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              border: none;
              border-radius: 12px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(255, 107, 107, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="clearCharacterForm"
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
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
                position: relative;
                overflow: hidden;
              "
              @click="copyCharacterCard"
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
              <i class="fa-solid fa-copy" style="font-size: 14px"></i> 复制角色卡
            </button>
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
                  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
                  border: none;
                  border-radius: 12px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 3px 12px rgba(255, 165, 0, 0.3);
                  position: relative;
                  overflow: hidden;
                "
                @click="handleModifyCharacterCard"
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
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 14px; margin-right: 6px"></i>
                {{ isModifyingCharacter ? '修改中...' : 'AI修改' }}
              </button>

              <button
                class="clear-modify-button"
                style="
                  padding: 12px 24px;
                  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                  border: none;
                  border-radius: 12px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 3px 12px rgba(108, 117, 125, 0.3);
                  position: relative;
                  overflow: hidden;
                "
                @click="clearModifyRequest"
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
                <i class="fa-solid fa-eraser" style="font-size: 14px; margin-right: 6px"></i>
                清空修改需求
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 翻页状态栏生成器 -->
    <div class="tool-section" style="margin-top: 20px">
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
          border-radius: 12px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        @click="toggleToolExpanded('pageableStatusBar')"
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
          <i class="fa-solid fa-book-open" style="color: #4a9eff; font-size: 18px"></i>
          翻页状态栏生成器
        </h4>
        <i
          :class="isToolExpanded('pageableStatusBar') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease; font-size: 14px"
        ></i>
      </div>

      <div v-if="isToolExpanded('pageableStatusBar')" class="tool-content">
        <!-- 翻页状态栏生成器内容 -->
        <div style="padding: 10px">
          <div
            style="
              background: linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
              padding: 15px;
              border-radius: 12px;
              margin-bottom: 15px;
              border: 1px solid rgba(74, 158, 255, 0.2);
            "
          >
            <p style="color: #888; margin: 0; font-size: 13px; line-height: 1.6">
              用 AI 生成可翻页、可交互的多页面状态栏。描述你想要的样式，AI 会为你创造！
            </p>
          </div>

          <div style="display: grid; grid-template-columns: 400px 1fr; gap: 20px">
            <!-- 左侧：配置区 -->
            <div style="display: flex; flex-direction: column; gap: 15px">
              <!-- 触发正则 -->
              <div style="background: #2a2a2a; padding: 15px; border-radius: 12px; border: 1px solid #3a3a3a">
                <label style="display: block; margin-bottom: 8px; color: #c0c0c0; font-size: 13px; font-weight: 600">
                  触发正则
                </label>
                <input
                  v-model="pageableTriggerRegex"
                  type="text"
                  placeholder="<-STATUS->"
                  style="
                    width: 100%;
                    padding: 10px 12px;
                    background: #1e1e1e;
                    border: 1px solid #3a3a3a;
                    border-radius: 6px;
                    color: #e0e0e0;
                    font-size: 13px;
                  "
                />
              </div>

              <!-- AI 生成区 -->
              <div
                style="
                  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
                  padding: 20px;
                  border-radius: 12px;
                  border: 1px solid rgba(245, 158, 11, 0.3);
                "
              >
                <h4
                  style="
                    color: #f59e0b;
                    margin: 0 0 12px 0;
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                  "
                >
                  <i class="fa-solid fa-sparkles"></i>
                  AI 智能生成
                </h4>
                <textarea
                  v-model="pageableAIPrompt"
                  placeholder="✨ 描述你想要的翻页状态栏样式：&#10;&#10;例如：&#10;- 深色科技风格，左边圆形头像，右边3个标签页&#10;- 粉色可爱风格，显示角色信息、状态、关系&#10;- 游戏风格，HP/MP进度条，技能图标"
                  :disabled="isPageableGenerating"
                  style="
                    width: 100%;
                    min-height: 200px;
                    padding: 12px;
                    background: #1e1e1e;
                    border: 2px solid #f59e0b;
                    border-radius: 8px;
                    color: #e0e0e0;
                    font-size: 13px;
                    line-height: 1.6;
                    resize: vertical;
                    margin-bottom: 12px;
                  "
                ></textarea>
                <button
                  style="
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                  "
                  :style="{
                    opacity: isPageableGenerating ? 0.6 : 1,
                    cursor: isPageableGenerating ? 'not-allowed' : 'pointer',
                  }"
                  :disabled="isPageableGenerating"
                  @click="generatePageableStatusBar"
                >
                  <i
                    :class="isPageableGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"
                    style="margin-right: 8px"
                  ></i>
                  {{ isPageableGenerating ? '生成中...' : '✨ AI 一键生成' }}
                </button>
              </div>

              <!-- 操作按钮 -->
              <div style="display: flex; flex-direction: column; gap: 10px">
                <button
                  style="
                    padding: 12px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                  "
                  :disabled="!pageableGeneratedHTML"
                  :style="{ opacity: !pageableGeneratedHTML ? 0.5 : 1 }"
                  @click="exportPageableRegex"
                >
                  <i class="fa-solid fa-download" style="margin-right: 8px"></i>
                  导出正则 JSON
                </button>

                <button
                  style="
                    padding: 12px;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                  "
                  @click="loadPageableExample"
                >
                  <i class="fa-solid fa-lightbulb" style="margin-right: 8px"></i>
                  加载示例
                </button>

                <button
                  style="
                    padding: 12px;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                  "
                  @click="clearPageableAll"
                >
                  <i class="fa-solid fa-trash" style="margin-right: 8px"></i>
                  清空所有
                </button>
              </div>
            </div>

            <!-- 右侧：预览区 -->
            <div
              style="
                background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
                border-radius: 16px;
                padding: 20px;
                border: 2px solid #10b981;
                display: flex;
                flex-direction: column;
                min-height: 700px;
                box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
              "
            >
              <div
                style="
                  margin: 0 0 16px 0;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  padding: 12px 16px;
                  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
                  border-radius: 10px;
                  border: 1px solid rgba(16, 185, 129, 0.3);
                "
              >
                <i class="fa-solid fa-eye" style="color: #10b981; font-size: 18px"></i>
                <span style="color: #fff; font-size: 16px; font-weight: 700">实时预览</span>
              </div>

              <div
                style="
                  flex: 1;
                  background: linear-gradient(135deg, #1e1e1e 0%, #252525 100%);
                  border-radius: 12px;
                  padding: 30px;
                  overflow: auto;
                  border: 2px solid #3a3a3a;
                  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
                "
              >
                <iframe
                  v-if="pageableGeneratedHTML"
                  :srcdoc="pageablePreviewHTML"
                  style="
                    width: 100%;
                    height: 100%;
                    min-height: 600px;
                    border: none;
                    border-radius: 8px;
                    background: white;
                  "
                  sandbox="allow-scripts allow-same-origin"
                ></iframe>
                <div
                  v-else
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #666;
                    text-align: center;
                  "
                >
                  <div>
                    <i
                      class="fa-solid fa-wand-magic-sparkles"
                      style="font-size: 48px; margin-bottom: 16px; opacity: 0.3"
                    ></i>
                    <p style="font-size: 16px">使用 AI 生成或加载示例查看预览</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref, Ref, watch } from 'vue';
import { detectApiProvider, filterApiParams, normalizeApiEndpoint, useSettingsStore } from '../settings';
import { copyToClipboard, getScriptIdSafe } from '../utils';

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
const characterDescription = ref('');
const characterCardOutput = ref('');
const isGeneratingCharacter = ref(false);
const modifyRequest = ref('');
const isModifyingCharacter = ref(false);
const enableCharacterStreaming = ref(false); // 角色卡生成是否启用流式传输
const characterProgressPercent = ref(0); // 角色卡生成进度

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

// 翻页状态栏生成器相关
const pageableTriggerRegex = ref('<-STATUS->');
const pageableAIPrompt = ref('');
const isPageableGenerating = ref(false);
const pageableGeneratedHTML = ref('');

// 加载可用的世界书列表（插件环境使用 TavernHelper）
const loadAvailableWorldbooks = () => {
  try {
    // 插件环境：优先使用 TavernHelper.getWorldbookNames()
    if (
      typeof (window as any).TavernHelper !== 'undefined' &&
      typeof (window as any).TavernHelper.getWorldbookNames === 'function'
    ) {
      availableWorldbooks.value = (window as any).TavernHelper.getWorldbookNames();
      console.log('✅ 已加载世界书列表 (TavernHelper):', availableWorldbooks.value);
    } else {
      availableWorldbooks.value = [];
      console.warn('⚠️ TavernHelper 不可用，世界书功能受限');
    }
  } catch (error) {
    console.error('❌ 加载世界书列表失败:', error);
    availableWorldbooks.value = [];
  }
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
      console.log('✅ 已恢复反八股数据:', {
        input: antiClicheInput.value.substring(0, 50),
        output: antiClicheOutput.value.substring(0, 50),
        enableStreaming: enableAntiClicheStreaming.value,
        modifyRequest: antiClicheModifyRequest.value.substring(0, 30),
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
        modifyRequest: modifyRequest.value.substring(0, 50),
        enableStreaming: enableCharacterStreaming.value,
      });
    }

    // 加载世界书条目数据
    if (savedData.tools_worldbookEntry) {
      worldbookDescription.value = savedData.tools_worldbookEntry.description || '';
      worldbookEntryOutput.value = savedData.tools_worldbookEntry.output || null;
      selectedWorldbook.value = savedData.tools_worldbookEntry.selectedWorldbook || '';
      worldbookModifyRequest.value = savedData.tools_worldbookEntry.modifyRequest || '';
      enableWorldbookStreaming.value = savedData.tools_worldbookEntry.enableStreaming || false;
      console.log('✅ 已恢复世界书条目数据:', {
        description: worldbookDescription.value.substring(0, 50),
        output: worldbookEntryOutput.value ? '有输出' : '无输出',
        selectedWorldbook: selectedWorldbook.value,
        modifyRequest: worldbookModifyRequest.value.substring(0, 50),
        enableStreaming: enableWorldbookStreaming.value,
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
      },
      tools_characterCard: {
        description: characterDescription.value,
        output: characterCardOutput.value,
        modifyRequest: modifyRequest.value,
        enableStreaming: enableCharacterStreaming.value,
      },
      tools_worldbookEntry: {
        description: worldbookDescription.value,
        output: worldbookEntryOutput.value,
        selectedWorldbook: selectedWorldbook.value,
        modifyRequest: worldbookModifyRequest.value,
        enableStreaming: enableWorldbookStreaming.value,
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

// 反八股工具处理函数
const handleAntiClicheProcess = async () => {
  if (!antiClicheInput.value.trim()) {
    window.toastr.warning('请输入需要清理的文本');
    return;
  }

  try {
    isProcessingAntiCliche.value = true;
    antiClicheProgressPercent.value = 0;
    window.toastr.info('AI正在分析文本...', '反八股清理', { timeOut: 15000 });

    const requestPayload = {
      model: settings.value.model,
      max_tokens: settings.value.max_tokens || 8000,
      temperature: 0.7,
      stream: enableAntiClicheStreaming.value,
      messages: [
        {
          role: 'system',
          content: `你是专业的文本编辑助手，专注于清理角色卡/世界书/开场白中的AI文学腔和八股表述。

# 🎯 第一原则（最重要！）

## ⚠️ 信息量守恒定律
**输入500字，输出也应该接近500字！信息量必须相同！**

- ❌ 错误：把五段话压缩成两句话
- ❌ 错误：删除整个句子或段落
- ❌ 错误：把详细描述变成简略概括
- ✅ 正确：只替换/删除八股词汇，保留所有实质内容
- ✅ 正确：用更自然的表达替换文学腔，而不是简单删除

## 💡 工作方式
**不是"删除工"，而是"改写师"：**
- 不要想着"删删删"
- 要想着"怎么用人话说同样的事"
- 把文学腔改成日常口语
- 把套路比喻改成直接描述

---

# 📋 清理规则（三级分类）

## 🔴 第一级：必须删除（最明显的八股）

### 1️⃣ AI套话词汇（见到就删）
**模糊词**：一丝、一抹、一缕、一股、似乎、几乎、近乎、仿佛
**比喻词**：如同、宛如、恰似、像是、好像、就像
**对比句**："不是...而是..."、"既...又..."、"与其...不如"
**强调词**：猛地、重重地、狂野、激烈地、恨不得、不容置疑
**修饰废话**："不易察觉"、"难以察觉"、"带着xx意味"、"充满了某种"

### 2️⃣ AI文学腔描写（全部删除）
- **眼神/视线**："眼里闪过xxx"、"嘴角上扬"、"视线交汇" → 直接删
- **心理状态**："她感到害怕"、"他内心矛盾" → 改成对白或动作
- **声音描述**："声音沙哑"、"声音里带着..." → 全删
- **动物比喻**："像小兽"、"像猫咪"、"野兽般的" → 全删
- **气氛渲染**："气氛凝重"、"空气凝固" → 全删
- **对白标注**："（带着不屑的口吻）"、"（轻声说）" → 全删

### 3️⃣ 所有格主语（改写）
- ❌ "她的声音"、"他的眼神" → 直接删或改主语
- ❌ "她的性格是..." → 改为 "她很..."

### 4️⃣ 精确数据（模糊化）
- ❌ "身高168cm"、"一米六八" → ✅ "个子高"
- ❌ "体重50kg" → ✅ "很瘦" 或直接删
- ❌ "罩杯C" → ✅ "胸部丰满" 或直接删

---

## 🟡 第二级：改写替换（文学腔 → 人话）

### 文学腔比喻 → 直接描述
| 文学腔 | 人话 |
|--------|------|
| 醇厚的香气扑面而来 | 闻到酒味了 / 有股酒香 |
| 如同黑曜石般璀璨的眼眸 | 黑眼睛 / 眼睛很黑 |
| 心中涌起复杂的情绪 | 心里矛盾 / 又怕又期待 |
| 冷暖交织的气息 | 冷香和酒味混在一起 |
| 致命的诱惑 | 忍不住想靠近 |
| 矛盾而极具吸引力 | 说不上来，但就是想看 |

### 对仗结构 → 口语化
- "既冷冽又醇厚" → "冷香和酒味"
- "既矛盾又复杂" → "很矛盾"
- "不是温柔而是傲慢" → "傲慢，不温柔"

---

## 🟢 第三级：必须保留（核心内容）

### ✅ 完全保留：
1. **所有对白**：包括""内的所有台词
2. **核心设定**：人物背景、职业、关系
3. **基础动作**：走、坐、站、拿、放
4. **简单情绪**：开心、难过、生气（这些可以保留）
5. **具体信息**：年龄、地点、时间、事件

### ✅ 可以保留：
- 自然的形容词（不是套话比喻）
- 日常化的描述
- 有意义的细节

---

# 💡 对比示例（学习正确做法）

## 示例1：角色卡八股清理

**❌ 输入（AI八股）：**
角色A似乎有些困惑，眼里闪过一丝不易察觉的疑惑，她用不容置疑的语气说："你是谁？"她的声音低沉而富有磁性，如同野兽般的低吼。

角色A出生于贵族家庭，她有着一头如同黑曜石般的长发，双眸宛如深邃的湖泊，身高168cm，罩杯C。她的性格并不是温柔的，而是傲慢且狂热的。

她对魔法有着近乎狂热的追求，仿佛那是她生命的全部意义。语料："哼，你这种凡人怎么会理解我的想法。"（带着不屑的口吻）

**❌ 错误输出（过度删减，信息量丢失）：**
角色A问："你是谁？"
角色A出生于贵族家庭，有黑色长发。
语料："你不会理解我的想法。"

**✅ 正确输出（保持信息量，只去八股）：**
角色A停了停。"你是谁？"

角色A出生于贵族家庭，黑色长发，黑眼睛，个子高，胸部丰满。傲慢，对很多事都很热情。喜欢阅读，经常一个人待在图书馆。

角色A对魔法很痴迷，投入了很多时间研究。她怕一些东西。

语料："哼，你这种凡人怎么会理解我的想法。"

**改写思路：**
- "似乎有些困惑，眼里闪过..." → "停了停"（行为代替心理+眼神）
- "她的声音...如同野兽..." → 全删（声音描写+比喻）
- "如同黑曜石般的长发" → "黑色长发"（删套话比喻）
- "身高168cm，罩杯C" → "个子高，胸部丰满"（模糊化数字）
- "并不是...而是..." → "傲慢"（删对比句）
- "（带着不屑的口吻）" → 删（对白标注）
- **对白完全保留**，设定信息全保留

---

## 示例2：信息素描写清理

**❌ 输入（文学腔）：**
一阵既冷冽又醇厚的香气飘来，混合着冬日雪松与温热白兰地的味道，矛盾而极具吸引力。浓郁而滚烫的信息素正从他身上源源不断地散发出来，那冰冷的雪杉气息已经被醇厚的白兰地酒香彻底包裹，充满了毫无防备的、致命的诱惑。

**✅ 正确输出（人话）：**
闻到香味，雪松和白兰地混在一起。滚烫的信息素从他身上散出来，雪杉味被酒香盖过了。

**改写思路：**
- "一阵" → "闻到"（删"一"+量词）
- "既...又..." → 删（删对仗结构）
- "矛盾而极具吸引力" → 删（删文学腔评价）
- "浓郁而滚烫" → "滚烫"（删冗余形容词）
- "充满了...致命的诱惑" → 删（删夸张描述）
- **保留核心信息**：雪松、白兰地、信息素、滚烫、混合、盖过

---

# 🎯 最终执行要求

1. **信息量守恒**：输入多少字，输出接近多少字
2. **段落数守恒**：输入几段，输出几段
3. **对白完整**：所有""内的台词必须100%保留
4. **设定保留**：背景、职业、关系等核心设定全保留
5. **只改八股**：只处理上述明确列出的八股表述
6. **直接输出**：不要任何解释、标注、说明，直接给清理后的文本

---

**现在开始清理，记住：你是"改写师"而不是"删除工"！**`,
        },
        {
          role: 'user',
          content: antiClicheInput.value,
        },
      ],
    };

    let generatedText: string;

    if (enableAntiClicheStreaming.value) {
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
    window.toastr.error('清理失败：' + (error as Error).message);
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

    if (enableAntiClicheStreaming.value) {
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
    window.toastr.error('修改失败：' + (error as Error).message);
  } finally {
    isModifyingAntiCliche.value = false;
    antiClicheProgressPercent.value = 0;
  }
};

// 清空反八股修改需求
const clearAntiClicheModifyRequest = () => {
  antiClicheModifyRequest.value = '';
  saveToolsDataImmediate();
  window.toastr.success('修改需求已清空');
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

    if (enableCharacterStreaming.value) {
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
      generatedText = data.choices[0].message.content.trim();
      characterProgressPercent.value = 100;
    }

    characterCardOutput.value = generatedText;
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('角色卡生成完成！');
  } catch (error) {
    console.error('角色卡生成失败:', error);
    window.toastr.error('生成失败：' + (error as Error).message);
  } finally {
    isGeneratingCharacter.value = false;
    characterProgressPercent.value = 0;
  }
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

    if (enableCharacterStreaming.value) {
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

    characterCardOutput.value = modifiedCard;
    modifyRequest.value = ''; // 清空修改需求
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('角色卡修改完成！');
  } catch (error) {
    console.error('角色卡修改失败:', error);
    window.toastr.error('修改失败：' + (error as Error).message);
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
    return data.choices?.[0]?.message?.content?.trim() || '';
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

    if (enableWorldbookStreaming.value) {
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
    try {
      // 提取 JSON 部分（如果有代码块包裹）
      const jsonMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, generatedText];
      const jsonText = jsonMatch[1] || generatedText;

      const parsedEntry = JSON.parse(jsonText);
      worldbookEntryOutput.value = parsedEntry;
      saveToolsDataImmediate(); // 立即保存结果

      window.toastr.success('世界书条目生成完成！');
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      console.log('原始响应:', generatedText);
      window.toastr.error('生成的内容格式错误，请重试');
    }
  } catch (error) {
    console.error('世界书条目生成失败:', error);
    window.toastr.error('生成失败：' + (error as Error).message);
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
    window.toastr.error('插入失败：' + (error as Error).message);
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

    if (enableWorldbookStreaming.value) {
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
    try {
      // 提取 JSON 部分（如果有代码块包裹）
      const jsonMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, generatedText];
      const jsonText = jsonMatch[1] || generatedText;

      const parsedEntry = JSON.parse(jsonText);
      worldbookEntryOutput.value = parsedEntry;
      worldbookModifyRequest.value = ''; // 清空修改需求
      saveToolsDataImmediate(); // 立即保存结果

      window.toastr.success('世界书条目修改完成！');
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      console.log('原始响应:', generatedText);
      window.toastr.error('修改的内容格式错误，请重试');
    }
  } catch (error) {
    console.error('世界书条目修改失败:', error);
    window.toastr.error('修改失败：' + (error as Error).message);
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
    window.toastr.error('加载失败：' + (error as Error).message);
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
    window.toastr.error('打开编辑界面失败：' + (error as Error).message);
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
    window.toastr.error('保存失败：' + (error as Error).message);
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
    window.toastr.error('删除失败：' + (error as Error).message);
  }
};

// 翻页状态栏生成器方法
const pageablePreviewHTML = computed(() => {
  if (!pageableGeneratedHTML.value) return '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ${pageableGeneratedHTML.value}
</body>
</html>
  `;
});

const generatePageableStatusBar = async () => {
  if (!pageableAIPrompt.value.trim()) {
    window.toastr.warning('请输入生成需求');
    return;
  }

  if (!settings.value.api_endpoint || !settings.value.api_key) {
    window.toastr.error('请先在"设置"标签页配置 API');
    return;
  }

  isPageableGenerating.value = true;

  const systemPrompt =
    `你是一个专业的前端设计师，专门为 SillyTavern 生成翻页状态栏。

【输出格式】：
必须输出一个完整的 HTML 代码块，包含：
1. <style> 标签内的所有 CSS 样式
2. HTML 结构（使用 <details> 和 <summary>）
3. <script> 标签内的翻页 JavaScript 代码

【HTML 结构要求】：
<details>
<summary>状态栏标题</summary>
<div class="status-container">
  <!-- 翻页按钮/标签页 -->
  <div class="page-tabs">
    <button class="page-tab active" onclick="switchPage(0)">页面1</button>
    <button class="page-tab" onclick="switchPage(1)">页面2</button>
  </div>

  <!-- 页面内容 -->
  <div class="page-content">
    <div class="page active" data-page="0">
      <div>字段1: $1</div>
      <div>字段2: $2</div>
    </div>
    <div class="page" data-page="1">
      <div>字段3: $3</div>
      <div>字段4: $4</div>
    </div>
  </div>
</div>
</details>

【JavaScript 要求】：
<` +
    `script>
function switchPage(index) {
  document.querySelectorAll('.page-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.page').forEach((page, i) => {
    page.classList.toggle('active', i === index);
  });
}
</` +
    `script>

【关键要求】：
1. 使用 $1, $2, $3 等占位符表示字段值
2. 生成 2-4 个页面，每个页面显示不同字段
3. CSS 样式要富有创意，符合用户需求
4. 翻页按钮要美观、易用
5. 直接输出完整的 HTML 代码，不要添加任何解释文字
6. 不要使用 \`\`\`html 代码块标记`;

  try {
    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    const requestParams = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `用户需求：${pageableAIPrompt.value.trim()}\n\n现在直接输出完整的 HTML 代码：` },
      ],
      max_tokens: Math.min(settings.value.max_tokens, 8192),
      temperature: settings.value.temperature,
    };

    const filteredParams = filterApiParams(requestParams, settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredParams),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败 (${response.status})`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.content || '';

    // 清理代码块标记
    content = content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 提取 details 标签之间的内容
    const detailsRegex = new RegExp('<details[\\s\\S]*?</details>', 'i');
    const detailsMatch = content.match(detailsRegex);
    if (detailsMatch) {
      pageableGeneratedHTML.value = detailsMatch[0];
      window.toastr.success('✨ AI 生成成功！');
    } else {
      // 如果没有 <details>，尝试提取整个 HTML
      pageableGeneratedHTML.value = content;
      window.toastr.warning('生成成功，但格式可能需要调整');
    }
  } catch (error) {
    console.error('AI 生成失败:', error);
    window.toastr.error('AI 生成失败：' + (error as Error).message);
  } finally {
    isPageableGenerating.value = false;
  }
};

const exportPageableRegex = () => {
  if (!pageableGeneratedHTML.value) {
    window.toastr.warning('请先生成内容');
    return;
  }

  const uuid = `regex-pageable-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const regexData = {
    id: uuid,
    scriptName: '翻页状态栏',
    findRegex: pageableTriggerRegex.value,
    replaceString: pageableGeneratedHTML.value,
    trimStrings: [],
    placement: [2], // AI回复前
    disabled: false,
    runOnEdit: true,
  };

  const jsonStr = JSON.stringify(regexData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pageable-statusbar.json';
  a.click();
  URL.revokeObjectURL(url);

  window.toastr.success('✅ 正则已导出');
};

const loadPageableExample = () => {
  pageableAIPrompt.value =
    '深色科技风格的角色状态栏，包含3个标签页：\n1. 基础信息（姓名、年龄、性别、职业）\n2. 状态（HP、MP、体力、精力，使用进度条）\n3. 关系（好感度、信任度、关系状态）\n\n使用蓝色渐变配色，圆角卡片设计，标签页按钮要有悬停效果';
  window.toastr.info('已加载示例，点击"AI 一键生成"开始');
};

const clearPageableAll = () => {
  if (confirm('确定要清空所有内容吗？')) {
    pageableTriggerRegex.value = '<-STATUS->';
    pageableAIPrompt.value = '';
    pageableGeneratedHTML.value = '';
    window.toastr.success('已清空');
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
