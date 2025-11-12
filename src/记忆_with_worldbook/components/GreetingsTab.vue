<template>
  <div
    class="greetings-tab"
    style="display: flex; flex-direction: column; height: 100%; background: #1a1a1a !important"
  >
    <!-- 标题区域 -->
    <div
      class="section-header"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px !important;
        border-bottom: 1px solid #3a3a3a;
      "
    >
      <h3
        style="
          margin: 0;
          color: #fff;
          font-size: 15px !important;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <i class="fa-solid fa-comments" style="color: #667eea"></i>
        开场白管理器
      </h3>
      <div class="header-actions" style="display: flex; align-items: center; gap: 10px">
        <span
          v-if="greetings.length > 0"
          class="count-badge"
          style="background: #667eea; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px"
        >
          {{ greetings.length }} 个开场白
        </span>
        <button
          v-if="greetings.length > 0"
          class="mini-button"
          style="
            padding: 6px 12px;
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          :style="{ color: showHelp ? '#667eea' : '#e0e0e0', borderColor: showHelp ? '#667eea' : '#3a3a3a' }"
          @click="showHelp = !showHelp"
        >
          <i class="fa-solid fa-circle-question"></i> {{ showHelp ? '隐藏帮助' : '显示帮助' }}
        </button>
        <button
          v-if="greetings.length > 0"
          class="mini-button"
          style="
            padding: 6px 12px;
            background: #dc2626;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          @click="clearAllConfig"
          @mouseenter="($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
        >
          <i class="fa-solid fa-eraser"></i> 清空配置
        </button>
        <button
          v-if="greetings.length > 0"
          class="mini-button"
          style="
            padding: 6px 12px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          @click="showAiStyleDialog = true"
          @mouseenter="($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
        >
          <i class="fa-solid fa-wand-magic-sparkles"></i> AI生成界面样式
        </button>
        <button
          class="mini-button refresh-button"
          style="
            padding: 6px 12px;
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 4px;
            color: #e0e0e0;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          @click="loadConfig"
        >
          <i class="fa-solid fa-refresh"></i> 刷新
        </button>
      </div>
    </div>

    <!-- 主内容区域：左右两栏 -->
    <div style="flex: 1; display: flex; gap: 20px; padding: 20px; overflow: hidden">
      <!-- 左侧：配置区域 -->
      <div style="flex: 1; overflow-y: auto; padding-right: 10px">
        <!-- 空状态 / 使用说明 -->
        <div
          v-if="greetings.length === 0"
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
            color: #888;
          "
        >
          <i class="fa-solid fa-comment-dots" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3"></i>
          <div style="font-size: 18px; font-weight: 600; color: #e0e0e0; margin-bottom: 10px">暂无开场白</div>
          <div style="font-size: 14px; color: #888; max-width: 400px; line-height: 1.6">
            请在酒馆中选择一个有开场白的角色卡，或点击上方的刷新按钮
          </div>
        </div>

        <!-- 使用说明 -->
        <div
          v-else-if="showHelp"
          style="background: #2a2a2a; border: 1px solid #667eea; border-radius: 8px; padding: 20px; margin-bottom: 20px"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <h4 style="color: #667eea; margin: 0; display: flex; align-items: center; gap: 8px">
              <i class="fa-solid fa-circle-info"></i>
              使用说明
            </h4>
            <button
              style="background: transparent; border: none; color: #888; cursor: pointer; font-size: 18px; padding: 4px"
              @click="showHelp = false"
            >
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <ol style="color: #ccc; margin: 0; padding-left: 20px; line-height: 1.8">
            <li>工具会自动读取当前角色卡的所有开场白</li>
            <li>为每个开场白设置图标、标题和描述</li>
            <li>使用AI生成描述功能，根据开场白内容自动生成吸引人的描述</li>
            <li>点击"AI生成界面样式"按钮，描述你想要的风格（如：深蓝色背景、金色标题）</li>
            <li>AI会根据你的描述生成完整的HTML样式代码</li>
            <li>右侧实时预览生成的界面样式效果</li>
            <li>点击"生成前端选择界面代码"查看完整代码</li>
            <li>点击"下载为STScript JSON"导出配置文件</li>
            <li>在酒馆中导入JSON文件，输入 /【开场白】 使用</li>
          </ol>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #3a3a3a">
            <p style="color: #888; font-size: 13px; margin: 0">
              <i class="fa-solid fa-lightbulb" style="color: #ffc107"></i>
              <strong>提示：</strong>生成的序号对应角色卡中的开场白序号（0为默认开场白）
            </p>
          </div>
        </div>

        <!-- 开场白列表 -->
        <div v-else style="display: flex; flex-direction: column; gap: 15px">
          <div
            v-for="(greeting, index) in greetings"
            :key="index"
            class="greeting-item"
            style="
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              padding: 15px;
              transition: all 0.3s ease;
            "
          >
            <!-- 顶部信息栏 -->
            <div
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
                padding-bottom: 10px;
                border-bottom: 1px solid #3a3a3a;
              "
            >
              <span
                style="
                  background: #667eea;
                  color: white;
                  padding: 4px 10px;
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: bold;
                  min-width: 35px;
                  text-align: center;
                "
              >
                #{{ index }}
              </span>
              <input
                v-model="greeting.icon"
                style="
                  width: 60px;
                  text-align: center;
                  font-size: 20px;
                  background: #1a1a1a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  padding: 6px;
                  color: #e0e0e0;
                "
                placeholder="图标"
                maxlength="4"
                @input="saveConfig"
              />
              <input
                v-model="greeting.title"
                style="
                  flex: 1;
                  background: #1a1a1a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  padding: 8px 12px;
                  color: #e0e0e0;
                  font-size: 14px;
                "
                :placeholder="index === 0 ? '默认开场白' : '开场白 ' + index"
                @input="saveConfig"
              />
              <button
                style="
                  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                  border: none;
                  color: white;
                  padding: 8px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  font-weight: 600;
                  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
                "
                title="根据开场白内容自动生成描述"
                @click="generateDescription(index)"
                @mouseenter="
                  ($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  ($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.5)';
                "
                @mouseleave="
                  ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  ($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.3)';
                "
              >
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                <span>AI 生成描述</span>
              </button>
              <button
                v-if="greeting.description"
                style="
                  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                  border: none;
                  color: white;
                  padding: 8px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  font-weight: 600;
                  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                "
                title="根据需求修改已有描述"
                @click="editDescription(index)"
                @mouseenter="
                  ($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  ($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
                "
                @mouseleave="
                  ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  ($event.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                "
              >
                <i class="fa-solid fa-edit"></i>
                <span>AI 编辑描述</span>
              </button>
            </div>

            <!-- 描述输入框 -->
            <textarea
              v-model="greeting.description"
              style="
                width: 100%;
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                padding: 10px;
                color: #e0e0e0;
                font-size: 13px;
                font-family: inherit;
                resize: vertical;
                min-height: 60px;
              "
              placeholder="输入简短描述..."
              @input="saveConfig"
            >
            </textarea>

            <!-- 查看原文按钮 -->
            <button
              style="
                width: 100%;
                padding: 10px;
                background: transparent;
                border: 1px solid #667eea;
                border-radius: 6px;
                color: #667eea;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-top: 10px;
              "
              @click="viewOriginalGreeting(index)"
              @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(102, 126, 234, 0.1)'"
              @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
            >
              <i class="fa-solid fa-file-lines"></i>
              <span>查看角色卡中的开场白原文</span>
            </button>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div
          v-if="greetings.length > 0"
          style="
            position: sticky;
            bottom: 0;
            padding: 20px;
            background: linear-gradient(to top, #1a1a1a 80%, transparent);
            border-top: 1px solid #3a3a3a;
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
          "
        >
          <button
            style="
              padding: 15px 35px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
              border-radius: 10px;
              color: white;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              gap: 10px;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            "
            @click="generateFrontendCode"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              ($event.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              ($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            "
          >
            <i class="fa-solid fa-code" style="font-size: 16px"></i>
            生成HTML代码
          </button>
          <button
            style="
              padding: 15px 35px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border: none;
              border-radius: 10px;
              color: white;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              gap: 10px;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            "
            @click="downloadAsJson"
            @mouseenter="
              ($event.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              ($event.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
            "
            @mouseleave="
              ($event.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              ($event.currentTarget as HTMLElement).style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
            "
          >
            <i class="fa-solid fa-download" style="font-size: 16px"></i>
            下载为STScript JSON
          </button>
        </div>
      </div>

      <!-- 右侧：实时预览 -->
      <div
        style="
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #2a2a2a;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #3a3a3a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        "
      >
        <div
          style="
            padding: 15px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-bottom: 1px solid #3a3a3a;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h4
            style="
              margin: 0;
              color: white;
              font-size: 14px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            "
          >
            <i class="fa-solid fa-eye"></i>
            实时预览
          </h4>
          <button
            v-if="previewHtml"
            title="新窗口打开"
            style="
              width: 32px;
              height: 32px;
              background: rgba(255, 255, 255, 0.2);
              border: none;
              border-radius: 6px;
              color: white;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
            "
            @click="openPreviewInNewWindow"
          >
            <i class="fa-solid fa-external-link-alt"></i>
          </button>
        </div>
        <div style="flex: 1; position: relative; overflow: hidden; background: #1e1e1e">
          <iframe
            v-if="previewHtml"
            :srcdoc="previewHtml"
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
            style="width: 100%; height: 100%; border: none; background: white"
          ></iframe>
          <div
            v-else
            style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #666;
              font-size: 14px;
              padding: 20px;
              text-align: center;
              line-height: 1.8;
            "
          >
            <div>
              <i class="fa-solid fa-eye-slash" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3"></i>
              <p style="margin: 0">配置开场白后将显示预览</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI生成对话框 -->
    <AIGenerateDialog
      :show="showAiGenerateDialog"
      :is-generating="isGeneratingAi"
      title="AI 生成简短描述"
      description="AI 正在根据开场白的实际内容自动生成吸引人的简短描述（20-50字）..."
      :show-input="false"
      :progress="isGeneratingAi ? progressWithElapsedTime : undefined"
      @close="closeAiGenerateDialog"
      @confirm="() => {}"
    />

    <!-- AI编辑对话框 -->
    <AIModifyDialog
      :show="showAiEditDialog"
      :is-modifying="isEditingAi"
      title="AI 编辑简短描述"
      description="描述你想要修改的地方，AI 会在当前描述的基础上进行调整。注意：仅修改描述，不会改变开场白内容本身。"
      :progress="isEditingAi ? progressWithElapsedTime : undefined"
      :examples="['更简洁一些', '更文艺一些', '更活泼一些', '添加情感色彩']"
      @close="showAiEditDialog = false"
      @confirm="confirmEditDescription"
    />

    <!-- AI生成界面样式对话框 -->
    <AIModifyDialog
      :show="showAiStyleDialog"
      :is-modifying="isGeneratingStyle"
      title="AI 生成开场白界面样式"
      description="描述你想要的界面风格，AI 会生成完整的HTML样式代码。例如：深蓝色背景、金色标题、圆角卡片等。"
      :progress="isGeneratingStyle ? progressWithElapsedTime : undefined"
      :examples="[
        '深蓝色渐变背景，白色圆角卡片，金色标题',
        '粉色可爱风格，带阴影的卡片',
        '深色科技风格，霓虹灯效果',
        '典雅金色风格，高贵大气',
        '游戏像素风格，方形卡片',
      ]"
      @close="showAiStyleDialog = false"
      @confirm="generateStyleWithAI"
    />

    <!-- 查看开场白原文对话框 -->
    <div
      v-if="showOriginalDialog"
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
        padding: 20px;
      "
      @click.self="showOriginalDialog = false"
    >
      <div
        style="
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          border-radius: 16px;
          padding: 24px;
          max-width: 700px;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        "
        @click.stop
      >
        <!-- 标题栏 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
          <h3 style="margin: 0; color: white; display: flex; align-items: center; gap: 8px">
            <i class="fa-solid fa-file-lines"></i>
            <span>开场白原文</span>
          </h3>
          <button
            style="
              background: transparent;
              border: none;
              color: rgba(255, 255, 255, 0.7);
              cursor: pointer;
              font-size: 20px;
              padding: 4px 8px;
              transition: all 0.2s;
            "
            @click="showOriginalDialog = false"
            @mouseenter="($event.currentTarget as HTMLElement).style.color = 'white'"
            @mouseleave="($event.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.7)'"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- 内容区域 -->
        <div
          style="
            background: #1a1a1a;
            border-radius: 8px;
            padding: 16px;
            color: #e0e0e0;
            font-size: 14px;
            line-height: 1.6;
            overflow-y: auto;
            flex: 1;
            white-space: pre-wrap;
            word-wrap: break-word;
          "
        >
          {{ originalGreetingContent }}
        </div>

        <!-- 底部按钮 -->
        <div style="display: flex; justify-content: flex-end; margin-top: 16px">
          <button
            style="
              padding: 10px 24px;
              background: white;
              border: none;
              border-radius: 6px;
              color: #1e3a8a;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            "
            @click="showOriginalDialog = false"
            @mouseenter="($event.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.transform = 'translateY(0)'"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 生成代码对话框 -->
    <div
      v-if="showCodeDialog"
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
        backdrop-filter: blur(5px);
      "
      @click="closeCodeDialog"
    >
      <div
        style="
          background: #2a2a2a;
          border-radius: 15px;
          max-width: 800px;
          width: 90%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        "
        @click.stop
      >
        <div
          style="
            padding: 20px;
            border-bottom: 1px solid #3a3a3a;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h3 style="color: #e0e0e0; font-size: 18px; margin: 0; display: flex; align-items: center; gap: 10px">
            <i class="fa-solid fa-code"></i>
            生成的前端代码
          </h3>
          <button
            style="
              background: transparent;
              border: none;
              color: #888;
              font-size: 20px;
              cursor: pointer;
              padding: 5px 10px;
              transition: color 0.2s ease;
            "
            @click="closeCodeDialog"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        <div style="padding: 20px; overflow-y: auto; flex: 1">
          <div
            style="
              background: #1a1a1a;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              color: #e0e0e0;
            "
          >
            <p style="margin-bottom: 10px; font-weight: 600"><strong>使用方法：</strong></p>
            <ol style="margin-left: 20px; color: #aaa; line-height: 1.8">
              <li>复制下面的代码</li>
              <li>
                在消息中输入占位符（如
                <code style="background: #2a2a2a; padding: 2px 6px; border-radius: 4px; color: #667eea">【开场白】</code
                >）
              </li>
              <li>创建正则脚本，将占位符替换为此代码</li>
            </ol>
          </div>
          <div
            style="
              background: #1a1a1a;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              padding: 15px;
              max-height: 400px;
              overflow-y: auto;
              margin-bottom: 15px;
            "
          >
            <pre
              style="margin: 0; white-space: pre-wrap; word-wrap: break-word"
            ><code style="color: #e0e0e0; font-family: 'Consolas', 'Monaco', monospace; font-size: 12px; line-height: 1.6">{{ generatedCode }}</code></pre>
          </div>
          <button
            style="
              width: 100%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 12px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            "
            @click="copyCode"
          >
            <i class="fa-solid fa-copy"></i>
            {{ copyButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { klona } from 'klona';
import { storeToRefs } from 'pinia';
import toastr from 'toastr';
import { computed, onMounted, ref } from 'vue';
import { z } from 'zod';
import { useSettingsStore, normalizeApiEndpoint } from '../settings';
import { copyToClipboard, getScriptIdSafe } from '../utils';
import { useTaskStore } from '../taskStore';
import AIGenerateDialog from './AIGenerateDialog.vue';
import AIModifyDialog from './AIModifyDialog.vue';

// 数据结构定义
const GreetingConfig = z.object({
  icon: z.string().default(''),
  title: z.string().default(''),
  description: z.string().default(''),
});

type GreetingConfig = z.infer<typeof GreetingConfig>;

// UI配置（保存生成的HTML代码和表单配置）
const UIConfig = z.object({
  customHtml: z.string().default(''), // AI生成的完整HTML代码
});

type UIConfig = z.infer<typeof UIConfig>;

// 获取settings store
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

// 获取task store
const taskStore = useTaskStore();

// 响应式数据
const greetings = ref<GreetingConfig[]>([]);
const uiConfig = ref<UIConfig>(UIConfig.parse({})); // UI配置
const showCodeDialog = ref(false);
const generatedCode = ref('');
const copyButtonText = ref('复制代码');
const showAiGenerateDialog = ref(false);
const showAiEditDialog = ref(false);
const isGeneratingAi = ref(false);
const isEditingAi = ref(false);
const currentEditingIndex = ref(-1);
const showHelp = ref(false); // 默认折叠帮助信息
const previewHtml = ref('');
const currentCharacter = ref<any>(null);
const showOriginalDialog = ref(false);
const originalGreetingContent = ref('');
const showAiStyleDialog = ref(false); // 显示AI生成样式对话框
const isGeneratingStyle = ref(false); // 正在生成样式

// AI 生成进度状态
interface AIProgress {
  step: number;
  total: number;
  stepName: string;
  percentage: number;
  message: string;
  startTime: number;
}

const aiProgress = ref<AIProgress>({
  step: 0,
  total: 4,
  stepName: '',
  percentage: 0,
  message: '',
  startTime: 0,
});

// 计算耗时的定时器
let elapsedTimer: NodeJS.Timeout | null = null;

// 更新进度
function updateProgress(step: number, stepName: string, message: string) {
  aiProgress.value.step = step;
  aiProgress.value.stepName = stepName;
  aiProgress.value.message = message;
  aiProgress.value.percentage = Math.round((step / aiProgress.value.total) * 100);

  console.log(`📊 [进度 ${aiProgress.value.percentage}%] ${stepName}: ${message}`);
}

// 开始耗时计算
function startElapsedTimer() {
  if (elapsedTimer) {
    clearInterval(elapsedTimer);
  }
  aiProgress.value.startTime = Date.now();
  elapsedTimer = setInterval(() => {
    const elapsed = Math.round((Date.now() - aiProgress.value.startTime) / 1000);
    // 更新耗时，触发响应式更新
    aiProgress.value = { ...aiProgress.value };
  }, 1000);
}

// 停止耗时计算
function stopElapsedTimer() {
  if (elapsedTimer) {
    clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

// 计算包含耗时的进度信息
const progressWithElapsedTime = computed(() => {
  const elapsed = Math.round((Date.now() - aiProgress.value.startTime) / 1000);
  return {
    ...aiProgress.value,
    elapsedTime: elapsed,
  };
});

// 获取当前角色卡（插件环境 - 使用 TavernHelper）
function getCurrentCharacter() {
  try {
    // 插件环境：优先使用 TavernHelper 接口
    if (typeof (window as any).TavernHelper !== 'undefined') {
      const char = (window as any).TavernHelper.getCharData('current');
      if (char) {
        console.log('找到角色卡 (TavernHelper):', char.name);
        return char;
      }
    }

    // 降级：尝试直接从 SillyTavern API 获取
    if (typeof SillyTavern !== 'undefined') {
      const charData = (SillyTavern as any).getContext?.()?.characters?.[0];
      if (charData) {
        console.log('找到角色卡 (SillyTavern):', charData.name);
        return charData;
      }
    }

    console.log('未找到角色卡');
    return null;
  } catch (error) {
    console.error('获取角色卡失败:', error);
    return null;
  }
}

// 加载配置
async function loadConfig() {
  try {
    const character = getCurrentCharacter();
    if (!character) {
      greetings.value = [];
      console.log('未找到角色卡');
      return;
    }

    console.log('当前角色卡:', character.name);

    // 获取角色卡的所有开场白
    const allGreetings = [character.first_mes, ...(character.data?.alternate_greetings || [])];
    console.log('找到', allGreetings.length, '个开场白');

    // 从 localStorage 加载配置（插件环境）
    const scriptId = getScriptIdSafe();
    const storageKey = `${scriptId}_greetings_${character.avatar}`;

    let configs = [];
    let savedUIConfig = null;

    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const savedConfig = JSON.parse(savedData);
        configs = savedConfig?.greetings_config || [];
        savedUIConfig = savedConfig?.ui_config;
        console.log('✅ 从 localStorage 加载开场白配置');
      } catch (e) {
        console.error('解析开场白配置失败:', e);
      }
    }

    // 初始化开场白配置
    greetings.value = allGreetings.map((_, index) => {
      const saved = configs[index];
      try {
        return GreetingConfig.parse(saved || {});
      } catch (error) {
        console.warn('解析开场白配置失败，使用默认值:', error);
        return GreetingConfig.parse({});
      }
    });

    // 初始化UI配置（容错处理）
    try {
      const uiConfigData = savedUIConfig || {};
      uiConfig.value = UIConfig.parse(uiConfigData);
    } catch (error) {
      console.warn('解析UI配置失败，使用默认值:', error);
      uiConfig.value = UIConfig.parse({});
    }

    console.log('开场白配置已加载:', greetings.value.length, '个');
    console.log('UI配置已加载, 自定义HTML长度:', uiConfig.value.customHtml.length);
    currentCharacter.value = character;
    updatePreview();
  } catch (error) {
    console.error('加载配置失败:', error);
    toastr.error('加载配置失败: ' + (error as Error).message);
  }
}

// 保存配置（插件环境 - 使用 localStorage）
function saveConfig() {
  try {
    const character = getCurrentCharacter();
    if (!character) {
      console.warn('无法保存：未找到角色卡');
      return;
    }

    const scriptId = getScriptIdSafe();
    const storageKey = `${scriptId}_greetings_${character.avatar}`;

    const configData = {
      greetings_config: klona(greetings.value),
      ui_config: klona(uiConfig.value),
    };

    localStorage.setItem(storageKey, JSON.stringify(configData));
    console.log('✅ 已保存开场白配置到 localStorage');
    updatePreview(); // 保存后更新预览
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

// 清空所有开场白配置（不影响角色卡原文）
function clearAllConfig() {
  if (
    !confirm(
      `确定要清空所有开场白的配置吗？\n\n当前共有 ${greetings.value.length} 个开场白，清空后所有图标、标题、描述都将恢复默认。\n\n⚠️ 此操作不会删除角色卡的开场白原文，只清空显示配置！`,
    )
  ) {
    return;
  }

  try {
    // 重置所有开场白配置为默认值
    greetings.value = greetings.value.map(() => {
      return GreetingConfig.parse({
        icon: '',
        title: '',
        description: '',
      });
    });

    // 清空UI配置
    uiConfig.value.customHtml = '';

    // 保存配置
    saveConfig();

    // 强制更新预览（切换到默认样式）
    updatePreview();

    toastr.success('已清空所有开场白配置，预览已恢复默认样式');
  } catch (error) {
    console.error('清空配置失败:', error);
    toastr.error('清空失败: ' + (error as Error).message);
  }
}

// 查看开场白原文
function viewOriginalGreeting(index: number) {
  try {
    const character = getCurrentCharacter();
    if (!character) {
      toastr.error('未找到角色卡');
      return;
    }

    const allGreetings = [character.first_mes, ...(character.data?.alternate_greetings || [])];
    const greetingContent = allGreetings[index] || '';

    if (!greetingContent.trim()) {
      toastr.warning('该开场白内容为空');
      return;
    }

    originalGreetingContent.value = greetingContent;
    showOriginalDialog.value = true;
  } catch (error) {
    console.error('查看开场白失败:', error);
    toastr.error('查看开场白失败: ' + (error as Error).message);
  }
}

// 关闭AI生成对话框
function closeAiGenerateDialog() {
  if (!isGeneratingAi.value) {
    showAiGenerateDialog.value = false;
  }
}

// AI生成描述
// AI自动配置参数
async function generateDescription(index: number) {
  currentEditingIndex.value = index;

  // 创建任务
  const taskId = taskStore.createTask('ui_generate', `生成开场白#${index}描述`);

  // 初始化进度
  aiProgress.value.startTime = Date.now();
  aiProgress.value.total = 4;
  updateProgress(0, '准备中', '正在初始化 AI 生成任务...');
  startElapsedTimer(); // 启动耗时计算

  // 显示进度对话框并开始生成
  showAiGenerateDialog.value = true;
  isGeneratingAi.value = true;

  const idx = index;
  if (idx < 0 || idx >= greetings.value.length) {
    isGeneratingAi.value = false;
    showAiGenerateDialog.value = false;
    taskStore.failTask(taskId, '无效的开场白索引');
    return;
  }

  try {
    updateProgress(1, '检查配置', '正在验证 API 配置和权限...');
    taskStore.updateTaskProgress(taskId, 10, '检查配置');

    // 检查 API 配置
    if (!settings.value.api_endpoint || !settings.value.api_key) {
      toastr.error('请先在设置页面配置 API 端点和 API Key');
      showAiGenerateDialog.value = false;
      isGeneratingAi.value = false;
      taskStore.failTask(taskId, 'API 未配置');
      return;
    }

    updateProgress(2, '读取数据', `正在读取开场白 #${idx} 的内容...`);
    taskStore.updateTaskProgress(taskId, 30, '读取开场白内容');

    // 获取开场白内容
    const character = getCurrentCharacter();
    if (!character) {
      toastr.error('未找到角色卡');
      showAiGenerateDialog.value = false;
      isGeneratingAi.value = false;
      taskStore.failTask(taskId, '未找到角色卡');
      return;
    }

    const allGreetings = [character.first_mes, ...(character.data?.alternate_greetings || [])];
    const greetingContent = allGreetings[idx] || '';

    if (!greetingContent.trim()) {
      toastr.warning('该开场白内容为空');
      showAiGenerateDialog.value = false;
      isGeneratingAi.value = false;
      taskStore.failTask(taskId, '开场白内容为空');
      return;
    }

    updateProgress(3, '调用 AI', `正在请求 ${settings.value.model} 生成描述...`);
    taskStore.updateTaskProgress(taskId, 50, `调用 AI (${settings.value.model})`);

    // 构建提示词
    const systemPrompt = `你是一个专业的文案编辑助手，擅长为小说、游戏等创作简洁吸引人的开场白描述。

要求：
1. 描述要简洁有力，控制在 20-50 字以内
2. 突出开场白的核心场景、情感或冲突点
3. 使用吸引人的语言，让读者产生阅读兴趣
4. 不要使用"这是一个..."、"在这个开场白中..."等冗余表述
5. 直接输出描述文本，不要添加引号或其他标记`;

    const userPrompt = `请为以下开场白内容生成一个简洁吸引人的描述：

${greetingContent}

直接输出描述文本：`;

    console.log('🚀 直接调用 AI API (插件环境)...');

    // 导入参数过滤函数
    const { filterApiParams } = await import('../settings');

    const requestParams = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: settings.value.temperature,
      max_tokens: settings.value.max_tokens,
      top_p: settings.value.top_p,
      presence_penalty: settings.value.presence_penalty,
      frequency_penalty: settings.value.frequency_penalty,
    };

    // 根据 API 提供商过滤参数
    const filteredParams = filterApiParams(requestParams, settings.value.api_endpoint);

    // 插件环境：直接调用 API
    const response = await fetch(normalizeApiEndpoint(settings.value.api_endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredParams),
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let aiDescription = data.choices?.[0]?.message?.content;

    console.log('📝 [生成] AI 原始返回:', aiDescription);

    if (!aiDescription || !aiDescription.trim()) {
      throw new Error('AI 未返回有效内容，请检查：\n1. API Key 是否有效\n2. 模型是否可用\n3. 账户余额');
    }

    updateProgress(4, '处理结果', '正在清理和应用生成的描述...');
    taskStore.updateTaskProgress(taskId, 80, '处理结果');

    // 清理AI返回的内容
    // 移除可能的引号包裹
    aiDescription = aiDescription.replace(/^["']|["']$/g, '');
    // 移除可能的markdown代码块标记
    aiDescription = aiDescription.replace(/^```.*?\n?|```$/g, '').trim();

    if (!aiDescription) {
      throw new Error('AI 返回内容清理后为空');
    }

    console.log('✨ [生成] AI 清理后的描述:', aiDescription);

    // 更新描述
    greetings.value[idx].description = aiDescription;
    saveConfig();

    // 计算总耗时
    const elapsed = ((Date.now() - aiProgress.value.startTime) / 1000).toFixed(1);
    toastr.success(`描述生成成功！耗时 ${elapsed} 秒`, '', { timeOut: 3000 });

    // 标记任务完成
    taskStore.completeTask(taskId, { description: aiDescription });

    // 延迟关闭对话框，让用户看到完成状态
    setTimeout(() => {
      showAiGenerateDialog.value = false;
    }, 500);
  } catch (error) {
    console.error('❌ [生成] AI 生成失败:', error);
    const errorMsg = '生成失败: ' + (error as Error).message;
    toastr.error(errorMsg);
    taskStore.failTask(taskId, errorMsg);
    // 延长显示时间
    setTimeout(() => {}, 5000);
  } finally {
    stopElapsedTimer(); // 停止耗时计算
    isGeneratingAi.value = false;
  }
}

// AI编辑描述
function editDescription(index: number) {
  currentEditingIndex.value = index;
  showAiEditDialog.value = true;
}

// 确认AI编辑描述
async function confirmEditDescription(requirement: string) {
  const index = currentEditingIndex.value;
  if (index < 0 || index >= greetings.value.length) return;

  // 创建任务
  const taskId = taskStore.createTask('ui_modify', `编辑开场白#${index}描述`);

  // 初始化进度
  aiProgress.value.startTime = Date.now();
  aiProgress.value.total = 4;
  updateProgress(0, '准备中', '正在初始化 AI 编辑任务...');
  startElapsedTimer(); // 启动耗时计算

  isEditingAi.value = true;

  try {
    updateProgress(1, '检查配置', '正在验证 API 配置和权限...');
    taskStore.updateTaskProgress(taskId, 10, '检查配置');

    // 检查 API 配置
    if (!settings.value.api_endpoint || !settings.value.api_key) {
      toastr.error('请先在设置页面配置 API 端点和 API Key');
      showAiEditDialog.value = false;
      isEditingAi.value = false;
      stopElapsedTimer();
      taskStore.failTask(taskId, 'API 未配置');
      return;
    }

    updateProgress(2, '读取数据', '正在读取当前描述内容...');
    taskStore.updateTaskProgress(taskId, 30, '读取当前描述');

    const currentDesc = greetings.value[index].description;

    if (!currentDesc.trim()) {
      toastr.warning('当前描述为空，请先使用 AI 生成');
      showAiEditDialog.value = false;
      isEditingAi.value = false;
      stopElapsedTimer();
      taskStore.failTask(taskId, '当前描述为空');
      return;
    }

    updateProgress(3, '调用 AI', `正在请求 ${settings.value.model} 编辑描述...`);
    taskStore.updateTaskProgress(taskId, 50, `调用 AI (${settings.value.model})`);

    // 构建提示词
    const systemPrompt = `你是一个专业的文案编辑助手，擅长根据用户需求修改文案。

要求：
1. 根据用户的修改需求调整描述
2. 保持描述简洁有力，控制在 20-50 字以内
3. 保留原描述的核心信息，只进行必要的调整
4. 直接输出修改后的描述文本，不要添加引号或其他标记`;

    const userPrompt = `当前描述：
${currentDesc}

修改需求：
${requirement}

请输出修改后的描述：`;

    console.log('🚀 直接调用 AI API (插件环境)...');

    // 导入参数过滤函数
    const { filterApiParams: filterApiParams2 } = await import('../settings');

    const requestParams2 = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: settings.value.temperature,
      max_tokens: settings.value.max_tokens,
      top_p: settings.value.top_p,
      presence_penalty: settings.value.presence_penalty,
      frequency_penalty: settings.value.frequency_penalty,
    };

    // 根据 API 提供商过滤参数
    const filteredParams2 = filterApiParams2(requestParams2, settings.value.api_endpoint);

    // 插件环境：直接调用 API (编辑描述)
    const response = await fetch(normalizeApiEndpoint(settings.value.api_endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredParams2),
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let aiDescription = data.choices?.[0]?.message?.content;

    console.log('📝 [编辑] AI 原始返回:', aiDescription);

    if (!aiDescription || !aiDescription.trim()) {
      throw new Error('AI 未返回有效内容，请检查：\n1. API Key 是否有效\n2. 模型是否可用\n3. 账户余额');
    }

    updateProgress(4, '处理结果', '正在清理和应用编辑后的描述...');
    taskStore.updateTaskProgress(taskId, 80, '处理结果');

    // 清理AI返回的内容
    // 移除可能的引号包裹
    aiDescription = aiDescription.replace(/^["']|["']$/g, '');
    // 移除可能的markdown代码块标记
    aiDescription = aiDescription.replace(/^```.*?\n?|```$/g, '').trim();

    if (!aiDescription) {
      throw new Error('AI 返回内容清理后为空');
    }

    console.log('✨ [编辑] AI 清理后的描述:', aiDescription);

    // 更新描述
    greetings.value[index].description = aiDescription;
    saveConfig();

    // 计算总耗时
    const elapsed = ((Date.now() - aiProgress.value.startTime) / 1000).toFixed(1);
    toastr.success(`描述修改成功！耗时 ${elapsed} 秒`, '', { timeOut: 3000 });

    // 标记任务完成
    taskStore.completeTask(taskId, { description: aiDescription });

    // 延迟关闭对话框，让用户看到完成状态
    setTimeout(() => {
      showAiEditDialog.value = false;
    }, 500);
  } catch (error) {
    console.error('❌ [编辑] AI 编辑失败:', error);
    const errorMsg = '编辑失败: ' + (error as Error).message;
    toastr.error(errorMsg);
    taskStore.failTask(taskId, errorMsg);
  } finally {
    stopElapsedTimer(); // 停止耗时计算
    isEditingAi.value = false;
  }
}

// AI生成界面样式
async function generateStyleWithAI(styleDescription: string) {
  if (!styleDescription.trim()) {
    toastr.warning('请输入界面风格描述');
    return;
  }

  // 创建任务
  const taskId = taskStore.createTask('ui_generate', '生成开场白界面样式');

  // 初始化进度
  aiProgress.value.startTime = Date.now();
  aiProgress.value.total = 5;
  updateProgress(0, '准备中', '正在初始化界面样式生成任务...');
  startElapsedTimer(); // 启动耗时计算

  // 检查 API 配置
  if (!settings.value.api_endpoint || !settings.value.api_key) {
    toastr.error('请先在设置页面配置 API 端点和 API Key');
    showAiStyleDialog.value = false;
    stopElapsedTimer();
    taskStore.failTask(taskId, 'API 未配置');
    return;
  }

  isGeneratingStyle.value = true;

  try {
    updateProgress(1, '准备数据', '正在收集开场白卡片信息...');
    taskStore.updateTaskProgress(taskId, 10, '准备数据');

    // 生成卡片列表HTML
    const cards = greetings.value
      .map((g, index) => {
        const icon = g.icon || '💬';
        const title = g.title || (index === 0 ? '默认开场白' : `开场白 ${index}`);
        const desc = g.description || '点击开始对话';
        const badge = index === 0 ? '默认' : String(index).padStart(2, '0');
        return (
          '      <' +
          'div class="scene-card" onclick="switchGreeting(' +
          index +
          ')">' +
          '<' +
          'div class="card-badge">' +
          badge +
          '<' +
          '/div>' +
          '<' +
          'div class="card-icon">' +
          icon +
          '<' +
          '/div>' +
          '<' +
          'div class="card-title">' +
          title +
          '<' +
          '/div>' +
          '<' +
          'div class="card-desc">' +
          desc +
          '<' +
          '/div>' +
          '<' +
          '/div>'
        );
      })
      .join('\n');

    const systemPrompt =
      `你是一个专业的前端开发专家，擅长创建美观的HTML/CSS界面。

任务：根据用户的风格描述，生成一个完整的HTML页面代码，用于展示开场白选择界面。

要求：
1. 包含完整的 HTML 结构（` +
      '<' +
      `html>、` +
      '<' +
      `head>、` +
      '<' +
      `body>）
2. 在 ` +
      '<' +
      `head> 中包含 Font Awesome 图标库：` +
      '<' +
      `link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
3. 所有样式写在 ` +
      '<' +
      `style> 标签内，不要使用外部 CSS 文件
4. 必须包含以下HTML结构（保持类名不变）：
   - body（页面背景）
   - .container（主容器）
   - .header（标题区域）
     - h1（主标题）
     - p（副标题）
   - .scene-grid（卡片网格容器）
   - .scene-card（单个卡片，需要 onclick 属性）
   - .card-badge（序号徽章）
   - .card-icon（图标）
   - .card-title（卡片标题）
   - .card-desc（卡片描述）
   - .loading（加载提示）
5. 必须包含 switchGreeting(id) 函数的完整 JavaScript 代码
6. 根据用户的风格描述设计颜色、字体、布局、动画等样式
7. 确保响应式设计，在不同屏幕尺寸下都好看
8. 直接输出完整的HTML代码，不要添加任何解释文字或markdown标记

【重要】样式要求：
- body 必须使用 "min-height: 100vh; height: auto;" 而不是固定高度
- body 必须使用 "display: flex; align-items: center; justify-content: center;" 来居中内容
- .container 不要设置固定高度，使用 "height: auto;" 让内容自适应
- .scene-card 卡片必须使用 "min-height" 而不是固定 "height"，让卡片自适应内容
- .card-desc 描述文字要完整显示，可以使用 line-clamp 限制行数但要显示省略号
- 不要在卡片上使用 "overflow: hidden" 除非配合 line-clamp 使用
- 确保所有内容都能完整显示，不会被截断

【重要】HTML结构必须严格遵守：
- 必须有一个 class="scene-grid" 的div作为卡片容器
- 所有卡片必须在 scene-grid 容器内
- 不要改变scene-grid这个类名，不要用grid-container、cards-grid等其他名字`;

    // 提供完整的 switchGreeting 函数代码
    const switchGreetingCode = `async function switchGreeting(id) {
      try {
        const loading = document.getElementById("loading");
        const mainContainer = document.getElementById("mainContainer");
        if (loading) loading.classList.add("active");
        if (mainContainer) mainContainer.style.display = "none";

        if (typeof window.getChatMessages !== "function") {
          alert("请在酒馆环境中使用此功能");
          if (loading) loading.classList.remove("active");
          if (mainContainer) mainContainer.style.display = "block";
          return;
        }

        // 使用 TavernHelper 获取消息
        let messages;
        if (typeof (window as any).TavernHelper !== 'undefined' && 
            typeof (window as any).TavernHelper.getChatMessages === 'function') {
          messages = (window as any).TavernHelper.getChatMessages('0');
        } else {
          alert("TavernHelper 不可用");
          if (loading) loading.classList.remove("active");
          if (mainContainer) mainContainer.style.display = "block";
          return;
        }
        
        if (!messages || messages.length === 0) {
          alert("未找到消息");
          if (loading) loading.classList.remove("active");
          if (mainContainer) mainContainer.style.display = "block";
          return;
        }

        const content = messages[0].swipes[id];
        if (!content) {
          alert("该开场白暂无内容");
          if (loading) loading.classList.remove("active");
          if (mainContainer) mainContainer.style.display = "block";
          return;
        }

        await window.setChatMessage(content, 0, { swipe_id: id, refresh: "display_and_render_current" });

        setTimeout(() => {
          if (loading) loading.classList.remove("active");
          if (mainContainer) mainContainer.style.display = "block";
        }, 500);
      } catch (err) {
        console.error("切换失败:", err);
        alert("切换失败: " + err.message);
        const loading = document.getElementById("loading");
        const mainContainer = document.getElementById("mainContainer");
        if (loading) loading.classList.remove("active");
        if (mainContainer) mainContainer.style.display = "block";
      }
    }`;

    const userPrompt =
      `风格描述：${styleDescription}

以下是需要展示的开场白卡片（每个卡片需要有 onclick="switchGreeting(序号)" 属性）：
${cards}

【重要】必须在 ` +
      '<' +
      `/body> 前添加以下 JavaScript 代码：
` +
      '<' +
      `script>
${switchGreetingCode}
` +
      '<' +
      `/script>

【重要】每个 .scene-card 必须添加 onclick="switchGreeting(序号)" 属性，例如：
` +
      '<' +
      `div class="scene-card" onclick="switchGreeting(0)">

【重要】必须包含一个 loading 提示元素：
` +
      '<' +
      `div class="loading" id="loading" style="display: none; text-align: center; padding: 40px;">
  ` +
      '<' +
      `p style="color: #888; font-size: 18px;">切换中...` +
      '<' +
      `/p>
` +
      '<' +
      `/div>

请生成完整的HTML代码，确保包含以上所有要求：`;

    updateProgress(2, '构建提示', '正在准备 AI 提示词和示例代码...');
    taskStore.updateTaskProgress(taskId, 30, '构建提示');

    console.log('🚀 直接调用 AI API (插件环境)...');

    updateProgress(3, '调用 AI', `正在请求 ${settings.value.model} 生成界面样式...`);
    taskStore.updateTaskProgress(taskId, 50, `调用 AI (${settings.value.model})`);

    // 导入参数过滤函数
    const { filterApiParams: filterApiParams3 } = await import('../settings');

    const requestParams3 = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: settings.value.temperature,
      max_tokens: settings.value.max_tokens,
      top_p: settings.value.top_p,
      presence_penalty: settings.value.presence_penalty,
      frequency_penalty: settings.value.frequency_penalty,
    };

    // 根据 API 提供商过滤参数
    const filteredParams3 = filterApiParams3(requestParams3, settings.value.api_endpoint);

    // 插件环境：直接调用 API (生成样式)
    const response = await fetch(normalizeApiEndpoint(settings.value.api_endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredParams3),
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let generatedHtml = data.choices?.[0]?.message?.content;

    console.log('📝 [样式生成] AI 原始返回:', generatedHtml ? generatedHtml.substring(0, 500) : '(空)');

    if (!generatedHtml || !generatedHtml.trim()) {
      throw new Error('AI 未返回有效内容，请检查 API 配置和模型是否支持该任务');
    }

    updateProgress(4, '处理结果', '正在清理和验证生成的代码...');
    taskStore.updateTaskProgress(taskId, 75, '处理结果');

    // 清理AI返回的内容
    // 移除可能的markdown代码块标记
    generatedHtml = generatedHtml.replace(/^```html\n?|^```\n?|```$/gm, '').trim();

    if (!generatedHtml) {
      throw new Error('AI 返回内容清理后为空');
    }

    console.log('✨ [样式生成] AI 清理后的HTML长度:', generatedHtml.length);

    updateProgress(5, '保存配置', '正在保存生成的界面样式...');
    taskStore.updateTaskProgress(taskId, 90, '保存配置');

    // 保存生成的HTML
    uiConfig.value.customHtml = generatedHtml;
    saveConfig();

    // 更新预览
    updatePreview();

    // 计算总耗时
    const elapsed = ((Date.now() - aiProgress.value.startTime) / 1000).toFixed(1);
    toastr.success(`界面样式生成成功！耗时 ${elapsed} 秒`, '', { timeOut: 3000 });

    // 标记任务完成
    taskStore.completeTask(taskId, { htmlLength: generatedHtml.length });

    // 延迟关闭对话框，让用户看到完成状态
    setTimeout(() => {
      showAiStyleDialog.value = false;
    }, 500);
  } catch (error) {
    console.error('❌ [样式生成] AI 生成失败:', error);
    toastr.error('生成失败: ' + (error as Error).message, '', { timeOut: 5000 });
    taskStore.failTask(taskId, (error as Error).message);
  } finally {
    stopElapsedTimer(); // 停止耗时计算
    isGeneratingStyle.value = false;
  }
}

// 生成前端代码
async function generateFrontendCode() {
  const character = getCurrentCharacter();
  if (!character) {
    toastr.warning('未找到角色卡');
    return;
  }

  // 如果有AI生成的自定义HTML，直接使用
  if (uiConfig.value.customHtml && uiConfig.value.customHtml.trim()) {
    generatedCode.value = uiConfig.value.customHtml;
    showCodeDialog.value = true;
    return;
  }

  // 如果没有自定义HTML，提示用户
  toastr.warning('请先使用"AI生成界面样式"功能生成自定义HTML');
}

// 复制代码
async function copyCode() {
  const success = await copyToClipboard(generatedCode.value, '✅ 代码已复制到剪贴板');
  if (success) {
    copyButtonText.value = '✓ 已复制';
    setTimeout(() => {
      copyButtonText.value = '复制代码';
    }, 2000);
  }
}

// 更新预览
function updatePreview() {
  if (greetings.value.length === 0) {
    previewHtml.value = '';
    return;
  }

  // 如果有AI生成的自定义HTML，使用它
  if (uiConfig.value.customHtml && uiConfig.value.customHtml.trim()) {
    console.log('🎨 使用AI生成的自定义HTML预览');

    try {
      // 生成卡片HTML
      const cardsHtml = greetings.value
        .map((g, index) => {
          const icon = g.icon || '💬';
          const title = g.title || (index === 0 ? '默认开场白' : `开场白 ${index}`);
          const desc = g.description || '点击开始对话';
          const badge = index === 0 ? '默认' : String(index).padStart(2, '0');

          return `
            <div class="scene-card" onclick="switchGreeting(${index})">
              <span class="card-badge">${badge}</span>
              <div class="card-icon">${icon}</div>
              <h3 class="card-title">${title}</h3>
              <p class="card-desc">${desc}</p>
            </div>
          `.trim();
        })
        .join('\n          ');

      // 将卡片插入到自定义HTML的.scenes-grid中
      let html = uiConfig.value.customHtml;
      html = html.replace(
        /<div class="scenes-grid">[\s\S]*?<\/div>/,
        `<div class="scenes-grid">\n          ${cardsHtml}\n        </div>`,
      );

      previewHtml.value = html;
      console.log('✅ 预览更新成功');
    } catch (error) {
      console.error('❌ 预览更新失败:', error);
      previewHtml.value = '';
    }
    return;
  }

  // 如果没有自定义HTML，不显示预览
  previewHtml.value = '';
}

// 关闭代码对话框
function closeCodeDialog() {
  showCodeDialog.value = false;
}

// 在新窗口打开预览
function openPreviewInNewWindow() {
  if (!previewHtml.value) {
    toastr.error('没有可预览的内容');
    return;
  }

  const character = getCurrentCharacter();
  const windowTitle = character ? `${character.name} - 开场白选择` : '开场白预览';

  // 打开新窗口
  const newWindow = window.open('', '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no');
  if (newWindow) {
    newWindow.document.write(previewHtml.value);
    newWindow.document.close();
    newWindow.document.title = windowTitle;
    toastr.success('已在新窗口打开预览');
  } else {
    toastr.error('无法打开新窗口，请检查浏览器弹窗设置');
  }
}

// 下载为STScript JSON
async function downloadAsJson() {
  try {
    await generateFrontendCode();

    if (!generatedCode.value) {
      toastr.error('请先生成代码');
      return;
    }

    const character = getCurrentCharacter();
    const characterName = character?.name || '角色';

    // 生成UUID
    const uuid = crypto.randomUUID();

    // 创建STScript JSON对象
    const stscriptJson = {
      id: uuid,
      scriptName: `${characterName}-开场白前端`,
      disabled: false,
      runOnEdit: true,
      findRegex: '/【开场白】/g',
      replaceString: '```html\n' + generatedCode.value + '\n```',
      trimStrings: [],
      placement: [1, 2],
      substituteRegex: 0,
      minDepth: null,
      maxDepth: null,
      markdownOnly: true,
      promptOnly: false,
    };

    // 转换为JSON字符串
    const jsonString = JSON.stringify(stscriptJson, null, 4);

    // 创建Blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${characterName}-开场白前端.json`;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toastr.success('已生成并下载JSON文件');
  } catch (error) {
    console.error('下载失败:', error);
    toastr.error('下载失败: ' + (error as Error).message);
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig();
});
</script>

<style scoped lang="scss">
/* 全局样式调整 */
.greetings-tab {
  background: #1a1a1a !important;
  color: #e0e0e0;
}

/* 滚动条样式 */
* {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a9eff;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5ab0ff;
  }
}

/* 按钮样式 */
.mini-button {
  &:hover {
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
}

/* 帮助信息样式优化 */
.help-info {
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  border: 1px solid #3a3a3a;

  h4 {
    color: #667eea;
  }

  p {
    color: #b0b0b0;
  }

  li {
    color: #d0d0d0;
  }
}

/* 预览区域样式 */
.preview-section {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.preview-container {
  background: white;
  border-radius: 4px;
  min-height: 200px;
}

/* 开场白卡片样式 */
.greeting-card {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

/* 对话框样式 */
.dialog-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.dialog-box {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
}
</style>
