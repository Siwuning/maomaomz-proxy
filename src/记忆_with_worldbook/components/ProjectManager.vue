<template>
  <div class="project-tab">
    <!-- 顶部操作栏 -->
    <div
      class="section-header"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 28px;
        background: #2a2a2a;
        backdrop-filter: blur(12px);
        border-radius: 14px;
        margin-bottom: 20px;
        border: 1px solid #333;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      "
    >
      <h3
        style="
          margin: 0;
          color: #fff;
          font-size: 16px !important;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        "
      >
        <i class="fa-solid fa-laptop-code" style="color: #4a9eff; font-size: 18px"></i>
        前端项目管理器
      </h3>
      <div class="project-action-buttons" style="display: flex; gap: 10px">
        <button
          v-if="currentId"
          style="
            padding: 8px 16px;
            background: #444;
            border: none;
            border-radius: 8px;
            color: #e0e0e0;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          @click="exportToRegex"
          @mouseenter="(e: any) => (e.currentTarget.style.background = '#555')"
          @mouseleave="(e: any) => (e.currentTarget.style.background = '#444')"
        >
          <i class="fa-solid fa-download" style="margin-right: 6px"></i>
          导出为正则
        </button>
        <button
          v-if="currentId"
          style="
            padding: 8px 16px;
            background: #444;
            border: none;
            border-radius: 8px;
            color: #e0e0e0;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          @click="showHistoryDialog"
          @mouseenter="(e: any) => (e.currentTarget.style.background = '#555')"
          @mouseleave="(e: any) => (e.currentTarget.style.background = '#444')"
        >
          <i class="fa-solid fa-history" style="margin-right: 6px"></i>
          历史记录
        </button>
        <button
          v-if="currentId"
          style="
            padding: 8px 16px;
            background: #8b5cf6;
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          @click="showAIDialog"
          @mouseenter="(e: any) => (e.currentTarget.style.background = '#7c3aed')"
          @mouseleave="(e: any) => (e.currentTarget.style.background = '#8b5cf6')"
        >
          <i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 6px"></i>
          AI 智能编写
        </button>
        <button
          v-if="currentId"
          style="
            padding: 8px 16px;
            background: #ef4444;
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          @click="showBugFixDialog"
          @mouseenter="(e: any) => (e.currentTarget.style.background = '#dc2626')"
          @mouseleave="(e: any) => (e.currentTarget.style.background = '#ef4444')"
        >
          <i class="fa-solid fa-bug" style="margin-right: 6px"></i>
          Bug 修复
        </button>
        <button
          style="
            padding: 8px 16px;
            background: #444;
            border: none;
            border-radius: 8px;
            color: #e0e0e0;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          @click="showProjectTemplateDialog"
          @mouseenter="(e: any) => (e.currentTarget.style.background = '#555')"
          @mouseleave="(e: any) => (e.currentTarget.style.background = '#444')"
        >
          <i class="fa-solid fa-file-lines" style="margin-right: 6px"></i>
          使用模板
        </button>
        <button
          style="
            padding: 8px 16px;
            background: #444;
            border: none;
            border-radius: 8px;
            color: #e0e0e0;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          @click="triggerFolderImport"
          @mouseenter="(e: any) => (e.currentTarget.style.background = '#555')"
          @mouseleave="(e: any) => (e.currentTarget.style.background = '#444')"
        >
          <i class="fa-solid fa-folder-open" style="margin-right: 6px"></i>
          导入文件夹
        </button>
        <button
          style="
            padding: 8px 16px;
            background: #10b981;
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          @click="createProject"
          @mouseenter="(e: any) => (e.currentTarget.style.background = '#059669')"
          @mouseleave="(e: any) => (e.currentTarget.style.background = '#10b981')"
        >
          <i class="fa-solid fa-plus" style="margin-right: 6px"></i>
          新建项目
        </button>
      </div>
    </div>

    <!-- 隐藏的文件夹输入框 -->
    <input
      ref="folderInputRef"
      type="file"
      webkitdirectory
      directory
      multiple
      style="display: none"
      @change="handleFolderImport"
    />

    <!-- 项目列表和编辑器区域 -->
    <div style="display: grid; grid-template-columns: 220px 1fr 650px; gap: 20px; min-height: 500px">
      <!-- 左侧：项目列表和文件列表 -->
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          padding: 15px;
          border: 1px solid #3a3a3a;
          display: flex;
          flex-direction: column;
        "
      >
        <h4 style="margin: 0 0 15px 0; color: #fff; font-size: 14px; font-weight: 600">项目列表</h4>
        <div v-if="projects.length === 0" style="text-align: center; color: #666; font-size: 12px; padding: 20px 10px">
          暂无项目<br />
          点击"新建项目"开始
        </div>
        <div
          v-for="proj in projects"
          :key="proj.id"
          :style="{
            padding: '10px 12px',
            marginBottom: '8px',
            background: currentId === proj.id ? '#4a9eff' : '#1e1e1e',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: currentId === proj.id ? '#fff' : '#e0e0e0',
          }"
          @click="selectProject(proj.id)"
          @mouseenter="(e: any) => currentId !== proj.id && (e.currentTarget.style.background = '#3a3a3a')"
          @mouseleave="(e: any) => currentId !== proj.id && (e.currentTarget.style.background = '#1e1e1e')"
        >
          <span style="font-size: 13px; flex: 1">{{ proj.name }}</span>
          <button
            style="
              width: 20px;
              height: 20px;
              background: rgba(239, 68, 68, 0.2);
              border: none;
              border-radius: 4px;
              color: #ff4444;
              font-size: 14px;
              line-height: 1;
              cursor: pointer;
              opacity: 0.6;
              transition: all 0.2s ease;
            "
            @click.stop="deleteProject(proj.id)"
            @mouseenter="
              (e: any) => (
                (e.currentTarget.style.opacity = '1'),
                (e.currentTarget.style.background = '#ef4444'),
                (e.currentTarget.style.color = '#fff')
              )
            "
            @mouseleave="
              (e: any) => (
                (e.currentTarget.style.opacity = '0.6'),
                (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'),
                (e.currentTarget.style.color = '#ff4444')
              )
            "
          >
            ×
          </button>
        </div>

        <!-- 文件列表 -->
        <div
          v-if="currentId && currentProject"
          style="margin-top: 20px; border-top: 1px solid #3a3a3a; padding-top: 15px"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px">
            <h4 style="margin: 0; color: #fff; font-size: 13px; font-weight: 600">文件</h4>
            <div style="display: flex; gap: 5px">
              <button
                style="
                  padding: 4px 8px;
                  background: #444;
                  border: none;
                  border-radius: 5px;
                  color: #e0e0e0;
                  font-size: 11px;
                  cursor: pointer;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                "
                title="新建文件夹"
                @click="createNewFolder"
                @mouseenter="(e: any) => (e.currentTarget.style.background = '#555')"
                @mouseleave="(e: any) => (e.currentTarget.style.background = '#444')"
              >
                <i class="fa-solid fa-folder-plus" style="font-size: 10px"></i>
              </button>
              <button
                style="
                  padding: 4px 8px;
                  background: #10b981;
                  border: none;
                  border-radius: 5px;
                  color: white;
                  font-size: 11px;
                  cursor: pointer;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                "
                title="新建文件"
                @click="showNewFileDialog"
                @mouseenter="(e: any) => (e.currentTarget.style.background = '#059669')"
                @mouseleave="(e: any) => (e.currentTarget.style.background = '#10b981')"
              >
                <i class="fa-solid fa-plus" style="font-size: 10px"></i>
              </button>
            </div>
          </div>
          <div
            v-for="file in currentProject.files"
            :key="file.path"
            :style="{
              padding: '8px 10px',
              marginBottom: '5px',
              background: currentFile === file.path ? '#10b981' : '#1e1e1e',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: currentFile === file.path ? '#fff' : '#e0e0e0',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }"
            @click="selectFile(file.path)"
            @mouseenter="(e: any) => currentFile !== file.path && (e.currentTarget.style.background = '#3a3a3a')"
            @mouseleave="(e: any) => currentFile !== file.path && (e.currentTarget.style.background = '#1e1e1e')"
          >
            <span>
              <i :class="getFileIcon(file.path)" style="margin-right: 6px"></i>
              {{ file.name }}
            </span>
            <button
              style="
                width: 18px;
                height: 18px;
                background: rgba(239, 68, 68, 0.2);
                border: none;
                border-radius: 3px;
                color: #ff4444;
                font-size: 12px;
                line-height: 1;
                cursor: pointer;
                opacity: 0;
                transition: all 0.2s ease;
              "
              title="删除文件"
              @click.stop="deleteFile(file.path)"
              @mouseenter="
                (e: any) => (
                  (e.currentTarget.style.opacity = '1'),
                  (e.currentTarget.style.background = '#ef4444'),
                  (e.currentTarget.style.color = '#fff')
                )
              "
              @mouseleave="
                (e: any) => (
                  (e.currentTarget.style.opacity = '0.6'),
                  (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'),
                  (e.currentTarget.style.color = '#ff4444')
                )
              "
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- 中间：代码编辑器 -->
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          padding: 15px;
          border: 1px solid #3a3a3a;
          display: flex;
          flex-direction: column;
        "
      >
        <div
          v-if="!currentId"
          style="flex: 1; display: flex; align-items: center; justify-content: center; color: #666; font-size: 14px"
        >
          ← 请选择一个项目
        </div>
        <div
          v-else-if="!currentFile"
          style="flex: 1; display: flex; align-items: center; justify-content: center; color: #666; font-size: 14px"
        >
          ← 请选择一个文件
        </div>
        <div v-else style="display: flex; flex-direction: column; height: 100%">
          <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center">
            <div style="display: flex; align-items: center; gap: 8px">
              <i :class="getFileIcon(currentFile)" style="color: #4a9eff"></i>
              <span style="color: #fff; font-size: 14px; font-weight: 500">{{ currentFile }}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px">
              <span style="color: #888; font-size: 11px">
                <i class="fa-solid fa-circle-check" style="color: #10b981; margin-right: 4px"></i>
                自动保存
              </span>
              <button
                style="
                  padding: 6px 12px;
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  border: none;
                  border-radius: 6px;
                  color: white;
                  font-size: 12px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s ease;
                "
                @click="saveCode"
                @mouseenter="(e: any) => (e.currentTarget.style.transform = 'translateY(-1px)')"
                @mouseleave="(e: any) => (e.currentTarget.style.transform = 'translateY(0)')"
              >
                <i class="fa-solid fa-floppy-disk" style="margin-right: 4px"></i>
                手动保存
              </button>
            </div>
          </div>
          <textarea
            v-model="code"
            :placeholder="`在这里编写 ${currentFile.split('.').pop()?.toUpperCase()} 代码...`"
            style="
              flex: 1;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              color: #e0e0e0;
              font-family: 'Consolas', 'Monaco', monospace;
              font-size: 13px;
              line-height: 1.6;
              padding: 15px;
              resize: none;
              outline: none;
              min-height: 400px;
            "
          ></textarea>
        </div>
      </div>

      <!-- 右侧：实时预览 -->
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          padding: 15px;
          border: 1px solid #3a3a3a;
          display: flex;
          flex-direction: column;
        "
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
          <h4 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-eye" style="margin-right: 8px; color: #4a9eff"></i>
            实时预览
          </h4>
          <div style="display: flex; gap: 8px">
            <button
              v-if="previewHtml"
              title="新窗口打开"
              style="
                width: 28px;
                height: 28px;
                padding: 0;
                background: #3a3a3a;
                border: none;
                border-radius: 6px;
                color: #e0e0e0;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
              "
              @click="openInNewWindow"
              @mouseenter="(e: any) => (e.currentTarget.style.background = '#4a9eff')"
              @mouseleave="(e: any) => (e.currentTarget.style.background = '#3a3a3a')"
            >
              <i class="fa-solid fa-external-link-alt" style="font-size: 12px"></i>
            </button>
          </div>
        </div>
        <div
          style="
            flex: 1;
            background: #1e1e1e;
            border-radius: 8px;
            overflow: auto;
            position: relative;
            min-height: 400px;
          "
        >
          <iframe
            v-if="previewHtml"
            :srcdoc="previewHtml"
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
            style="width: 100%; height: 100%; border: none; background: white"
          ></iframe>
          <div
            v-else
            style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: #666;
              font-size: 12px;
              text-align: center;
            "
          >
            保存代码后将显示预览
          </div>
        </div>
      </div>
    </div>

    <!-- AI 智能编写对话框 -->
    <div
      v-if="showAI"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      "
      @click.self="closeAIDialog"
    >
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          padding: 25px;
          width: 90%;
          max-width: 600px;
          border: 1px solid #3a3a3a;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        "
      >
        <h3
          style="
            margin: 0 0 20px 0;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >
          <i class="fa-solid fa-wand-magic-sparkles" style="color: #8b5cf6"></i>
          AI 智能编写
        </h3>

        <div style="margin-bottom: 15px">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px">
            <i class="fa-solid fa-pencil" style="color: #8b5cf6; margin-right: 6px"></i>
            详细描述你的需求（越详细效果越好）：
          </label>
          <div
            style="
              margin-bottom: 10px;
              padding: 10px 12px;
              background: rgba(139, 92, 246, 0.1);
              border-left: 3px solid #8b5cf6;
              border-radius: 4px;
              font-size: 12px;
              color: #ccc;
              line-height: 1.6;
            "
          >
            <strong style="color: #8b5cf6">💡 提示：</strong>
            不要只说"优化"、"完善"，要具体说明你想要什么效果、什么样式、什么功能！
          </div>
          <textarea
            v-model="aiPrompt"
            placeholder="请详细描述你的需求，例如：添加一个响应式导航栏，带汉堡菜单和平滑滚动效果..."
            style="
              width: 100%;
              height: 120px;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              padding: 12px;
              resize: none;
              outline: none;
            "
          ></textarea>

          <!-- 快捷建议 -->
          <div style="margin-top: 12px">
            <div style="color: #888; font-size: 12px; margin-bottom: 8px">
              <i class="fa-solid fa-lightbulb" style="color: #fbbf24; margin-right: 4px"></i>
              快捷建议（点击填入）：
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px">
              <button
                v-for="suggestion in quickSuggestions"
                :key="suggestion"
                style="
                  padding: 6px 12px;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #ccc;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.2s;
                "
                @click="aiPrompt = suggestion"
                @mouseenter="(e: any) => (e.currentTarget.style.background = '#3a3a3a')"
                @mouseleave="(e: any) => (e.currentTarget.style.background = '#2a2a2a')"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <!-- 流式传输开关 -->
        <div
          style="
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            padding: 10px;
            background: #252525;
            border-radius: 6px;
          "
        >
          <label
            style="
              display: flex;
              align-items: center;
              gap: 8px;
              cursor: pointer;
              color: #ccc;
              font-size: 13px;
              user-select: none;
            "
          >
            <input v-model="enableStream" type="checkbox" style="width: 16px; height: 16px; cursor: pointer" />
            <i class="fa-solid fa-water" style="color: #4a9eff"></i>
            启用流式传输
          </label>
          <span style="color: #888; font-size: 12px"> （实时查看生成过程，体验更流畅） </span>
        </div>

        <!-- 流式传输实时显示区域 -->
        <div
          v-if="aiGenerating && enableStream && streamingText"
          style="
            margin-bottom: 15px;
            padding: 15px;
            background: #1e1e1e;
            border: 1px solid #3a3a3a;
            border-radius: 6px;
            max-height: 200px;
            overflow-y: auto;
            font-family: 'Consolas', monospace;
            font-size: 12px;
            color: #e0e0e0;
            line-height: 1.5;
            white-space: pre-wrap;
          "
        >
          {{ streamingText }}
          <span style="animation: blink 1s infinite">▊</span>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end">
          <button
            style="
              padding: 8px 16px;
              background: #3a3a3a;
              border: none;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="closeAIDialog"
            @mouseenter="(e: any) => (e.currentTarget.style.background = '#4a4a4a')"
            @mouseleave="(e: any) => (e.currentTarget.style.background = '#3a3a3a')"
          >
            取消
          </button>
          <button
            :disabled="aiGenerating || !aiPrompt.trim()"
            style="
              padding: 8px 16px;
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              border: none;
              border-radius: 6px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            :style="{
              opacity: aiGenerating || !aiPrompt.trim() ? 0.5 : 1,
              cursor: aiGenerating || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
            }"
            @click="generateWithAI"
          >
            <i v-if="!aiGenerating" class="fa-solid fa-wand-magic-sparkles" style="margin-right: 6px"></i>
            <i v-else class="fa-solid fa-spinner fa-spin" style="margin-right: 6px"></i>
            {{ aiGenerating ? '生成中...' : '开始生成' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bug 修复对话框 -->
    <div
      v-if="showBugFix"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      "
      @click.self="closeBugFixDialog"
    >
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          padding: 25px;
          width: 90%;
          max-width: 650px;
          border: 1px solid #3a3a3a;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        "
      >
        <h3
          style="
            margin: 0 0 20px 0;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >
          <i class="fa-solid fa-bug" style="color: #ef4444"></i>
          Bug 修复助手
        </h3>

        <!-- 问题描述 -->
        <div style="margin-bottom: 15px">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 600">
            <i class="fa-solid fa-circle-exclamation" style="color: #f59e0b; margin-right: 6px"></i>
            哪里有问题？（必填）
          </label>
          <textarea
            v-model="bugDescription"
            placeholder="例如：点击发送按钮没有反应&#10;或者：消息列表不显示内容&#10;或者：输入框输入后数据没有保存"
            style="
              width: 100%;
              height: 90px;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              padding: 12px;
              resize: none;
              outline: none;
            "
          ></textarea>
        </div>

        <!-- Console 错误信息 -->
        <div style="margin-bottom: 15px">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 600">
            <i class="fa-solid fa-terminal" style="color: #ef4444; margin-right: 6px"></i>
            浏览器 Console 错误信息（按 F12 查看）
          </label>
          <textarea
            v-model="consoleError"
            placeholder="如果浏览器 Console 中有红色错误，请复制粘贴到这里&#10;例如：Uncaught TypeError: xxx is not a function&#10;&#10;如果没有错误，留空即可"
            style="
              width: 100%;
              height: 80px;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              color: #ff6b6b;
              font-size: 12px;
              font-family: 'Consolas', monospace;
              line-height: 1.5;
              padding: 12px;
              resize: none;
              outline: none;
            "
          ></textarea>
        </div>

        <!-- 问题文件 -->
        <div style="margin-bottom: 15px">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 600">
            <i class="fa-solid fa-file-code" style="color: #4a9eff; margin-right: 6px"></i>
            问题可能在哪个文件？
          </label>
          <select
            v-model="bugFile"
            style="
              width: 100%;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 8px;
              color: #e0e0e0;
              font-size: 13px;
              padding: 10px 12px;
              outline: none;
              cursor: pointer;
            "
          >
            <option value="">让 AI 自动判断</option>
            <option value="index.html">HTML 文件（index.html）</option>
            <option value="style.css">CSS 文件（style.css）</option>
            <option value="script.js">JavaScript 文件（script.js）</option>
          </select>
        </div>

        <!-- 提示信息 -->
        <div
          style="
            padding: 12px;
            background: rgba(74, 158, 255, 0.1);
            border: 1px solid rgba(74, 158, 255, 0.3);
            border-radius: 6px;
            margin-bottom: 15px;
          "
        >
          <p style="margin: 0; color: #4a9eff; font-size: 12px; line-height: 1.6">
            <i class="fa-solid fa-lightbulb" style="margin-right: 6px"></i>
            <strong>提示：</strong>AI 会专注于修复这个具体的 bug，不会改动其他功能。如果有 Console
            错误信息，修复成功率会更高！
          </p>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end">
          <button
            style="
              padding: 8px 16px;
              background: #3a3a3a;
              border: none;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="closeBugFixDialog"
            @mouseenter="(e: any) => (e.currentTarget.style.background = '#4a4a4a')"
            @mouseleave="(e: any) => (e.currentTarget.style.background = '#3a3a3a')"
          >
            取消
          </button>
          <button
            :disabled="aiGenerating || !bugDescription.trim()"
            style="
              padding: 8px 16px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              border: none;
              border-radius: 6px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            :style="{
              opacity: aiGenerating || !bugDescription.trim() ? 0.5 : 1,
              cursor: aiGenerating || !bugDescription.trim() ? 'not-allowed' : 'pointer',
            }"
            @click="fixBugWithAI"
          >
            <i v-if="!aiGenerating" class="fa-solid fa-wrench" style="margin-right: 6px"></i>
            <i v-else class="fa-solid fa-spinner fa-spin" style="margin-right: 6px"></i>
            {{ aiGenerating ? '修复中...' : '开始修复' }}
          </button>
        </div>
      </div>
    </div>

    <!-- AI 生成结果对比对话框 -->
    <div
      v-if="showComparison"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        padding: 20px;
      "
    >
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          width: 95%;
          height: 90%;
          border: 1px solid #3a3a3a;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        "
      >
        <!-- 标题栏 -->
        <div
          style="
            padding: 20px 25px;
            border-bottom: 1px solid #3a3a3a;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h3
            style="
              margin: 0;
              color: #fff;
              font-size: 18px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 10px;
            "
          >
            <i class="fa-solid fa-code-compare" style="color: #8b5cf6"></i>
            AI 生成结果对比
          </h3>
          <div style="display: flex; gap: 10px">
            <button
              style="
                padding: 8px 16px;
                background: #ef4444;
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
              "
              @click="rejectChanges"
              @mouseenter="(e: any) => (e.currentTarget.style.background = '#dc2626')"
              @mouseleave="(e: any) => (e.currentTarget.style.background = '#ef4444')"
            >
              <i class="fa-solid fa-xmark" style="margin-right: 6px"></i>
              拒绝
            </button>
            <button
              style="
                padding: 8px 16px;
                background: #10b981;
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
              "
              @click="acceptChanges"
              @mouseenter="(e: any) => (e.currentTarget.style.background = '#059669')"
              @mouseleave="(e: any) => (e.currentTarget.style.background = '#10b981')"
            >
              <i class="fa-solid fa-check" style="margin-right: 6px"></i>
              应用更改
            </button>
          </div>
        </div>

        <!-- 内容区 -->
        <div
          style="
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr 1.5fr;
            gap: 15px;
            padding: 20px;
            overflow: hidden;
          "
        >
          <!-- 修改前代码 -->
          <div style="display: flex; flex-direction: column; background: #1e1e1e; border-radius: 8px; overflow: hidden">
            <div style="padding: 12px 15px; background: #2a2a2a; border-bottom: 1px solid #3a3a3a">
              <h4 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600">
                <i class="fa-solid fa-file-code" style="margin-right: 8px; color: #ef4444"></i>
                修改前
              </h4>
            </div>
            <div style="flex: 1; overflow-y: auto; padding: 15px">
              <div v-for="change in aiChanges" :key="change.path" style="margin-bottom: 20px">
                <div
                  style="
                    color: #4a9eff;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                  "
                >
                  <i :class="getFileIcon(change.path)"></i>
                  {{ change.path }}
                </div>
                <pre
                  style="
                    margin: 0;
                    padding: 12px;
                    background: #1a1a1a;
                    border-radius: 6px;
                    color: #e0e0e0;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    overflow-x: auto;
                    border: 1px solid #3a3a3a;
                  "
                  >{{ change.oldContent }}</pre
                >
              </div>
            </div>
          </div>

          <!-- 修改后代码 -->
          <div style="display: flex; flex-direction: column; background: #1e1e1e; border-radius: 8px; overflow: hidden">
            <div style="padding: 12px 15px; background: #2a2a2a; border-bottom: 1px solid #3a3a3a">
              <h4 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600">
                <i class="fa-solid fa-file-code" style="margin-right: 8px; color: #10b981"></i>
                修改后
              </h4>
            </div>
            <div style="flex: 1; overflow-y: auto; padding: 15px">
              <div v-for="change in aiChanges" :key="change.path" style="margin-bottom: 20px">
                <div
                  style="
                    color: #4a9eff;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                  "
                >
                  <i :class="getFileIcon(change.path)"></i>
                  {{ change.path }}
                </div>
                <pre
                  style="
                    margin: 0;
                    padding: 12px;
                    background: #1a1a1a;
                    border-radius: 6px;
                    color: #e0e0e0;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    overflow-x: auto;
                    border: 1px solid #3a3a3a;
                  "
                  >{{ change.newContent }}</pre
                >
              </div>
            </div>
          </div>

          <!-- 预览效果 -->
          <div style="display: flex; flex-direction: column; background: #1e1e1e; border-radius: 8px; overflow: hidden">
            <div
              style="
                padding: 12px 15px;
                background: #2a2a2a;
                border-bottom: 1px solid #3a3a3a;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <h4 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600">
                <i class="fa-solid fa-eye" style="margin-right: 8px; color: #4a9eff"></i>
                预览效果
              </h4>
              <div style="display: flex; gap: 8px">
                <button
                  :style="{
                    padding: '4px 10px',
                    background: previewMode === 'before' ? '#ef4444' : '#3a3a3a',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }"
                  @click="previewMode = 'before'"
                >
                  修改前
                </button>
                <button
                  :style="{
                    padding: '4px 10px',
                    background: previewMode === 'after' ? '#10b981' : '#3a3a3a',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }"
                  @click="previewMode = 'after'"
                >
                  修改后
                </button>
              </div>
            </div>
            <div style="flex: 1; background: white; overflow: hidden">
              <iframe
                :srcdoc="comparisonPreviewHtml"
                sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
                style="width: 100%; height: 100%; border: none"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录对话框 -->
    <div
      v-if="showHistory"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
      "
      @click.self="closeHistoryDialog"
    >
      <div
        style="
          background: #2a2a2a;
          border-radius: 16px;
          width: 90%;
          max-width: 900px;
          max-height: 80%;
          border: 1px solid #3a3a3a;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        "
      >
        <div
          style="
            padding: 20px 25px;
            border-bottom: 1px solid #3a3a3a;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h3
            style="
              margin: 0;
              color: #fff;
              font-size: 18px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 10px;
            "
          >
            <i class="fa-solid fa-history" style="color: #f59e0b"></i>
            AI 编写历史
          </h3>
          <button
            style="
              width: 28px;
              height: 28px;
              background: #3a3a3a;
              border: none;
              border-radius: 6px;
              color: #e0e0e0;
              cursor: pointer;
              transition: all 0.2s ease;
            "
            @click="closeHistoryDialog"
            @mouseenter="(e: any) => (e.currentTarget.style.background = '#4a4a4a')"
            @mouseleave="(e: any) => (e.currentTarget.style.background = '#3a3a3a')"
          >
            ×
          </button>
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 20px">
          <div v-if="currentProjectHistory.length === 0" style="text-align: center; color: #666; padding: 40px 20px">
            <i class="fa-solid fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3"></i>
            <p>暂无历史记录</p>
          </div>
          <div
            v-for="(record, index) in currentProjectHistory"
            :key="index"
            style="
              background: #1e1e1e;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 15px;
              border: 1px solid #3a3a3a;
            "
          >
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px">
              <div>
                <div style="color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 5px">
                  {{ record.prompt }}
                </div>
                <div style="color: #888; font-size: 12px">
                  {{ new Date(record.timestamp).toLocaleString('zh-CN') }}
                </div>
              </div>
              <button
                style="
                  padding: 6px 12px;
                  background: #4a9eff;
                  border: none;
                  border-radius: 6px;
                  color: white;
                  font-size: 12px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s;
                "
                @click="restoreHistory(record)"
                @mouseenter="(e: any) => (e.currentTarget.style.background = '#3b82f6')"
                @mouseleave="(e: any) => (e.currentTarget.style.background = '#4a9eff')"
              >
                <i class="fa-solid fa-undo" style="margin-right: 4px"></i>
                恢复
              </button>
            </div>
            <div style="color: #ccc; font-size: 13px; margin-top: 10px">
              <strong>修改的文件：</strong>
              <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 8px">
                <span
                  v-for="change in record.changes"
                  :key="change.path"
                  style="
                    background: #2a2a2a;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                  "
                >
                  <i :class="getFileIcon(change.path)"></i>
                  {{ change.path }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目模板选择对话框 -->
    <div
      v-if="showProjectTemplate"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
      "
      @click.self="showProjectTemplate = false"
    >
      <div
        style="
          background: #1e1e1e;
          border-radius: 16px;
          max-width: 850px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          border: 1px solid #333;
        "
      >
        <!-- 对话框头部 -->
        <div
          style="
            padding: 24px 28px;
            border-bottom: 1px solid #2a2a2a;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h3
            style="
              margin: 0;
              color: #fff;
              font-size: 20px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 12px;
            "
          >
            <span
              style="
                width: 40px;
                height: 40px;
                background: #2a2a2a;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
              "
            >
              📁
            </span>
            选择项目模板
          </h3>
          <button
            style="
              width: 36px;
              height: 36px;
              background: #2a2a2a;
              border: none;
              border-radius: 8px;
              color: #888;
              font-size: 18px;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
            "
            @click="showProjectTemplate = false"
            @mouseenter="
              (e: any) => {
                e.currentTarget.style.background = '#333';
                e.currentTarget.style.color = '#fff';
              }
            "
            @mouseleave="
              (e: any) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.color = '#888';
              }
            "
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- 模板列表 -->
        <div style="padding: 28px">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px">
            <!-- 同层对话界面 -->
            <div
              style="
                background: #252525;
                border: 1px solid transparent;
                border-radius: 16px;
                padding: 24px;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              "
              @click="createProjectFromTemplate('同层对话界面')"
              @mouseenter="
                (e: any) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#555';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
                }
              "
              @mouseleave="
                (e: any) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                }
              "
            >
              <div
                style="
                  width: 56px;
                  height: 56px;
                  background: #2a2a2a;
                  border-radius: 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 28px;
                  margin-bottom: 16px;
                "
              >
                💬
              </div>
              <h4 style="margin: 0 0 8px 0; color: #fff; font-size: 17px; font-weight: 600">同层对话界面</h4>
              <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6">流式对话、消息历史、正则清理</p>
            </div>

            <!-- 状态栏面板 -->
            <div
              style="
                background: #252525;
                border: 1px solid transparent;
                border-radius: 16px;
                padding: 24px;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              "
              @click="createProjectFromTemplate('状态栏面板')"
              @mouseenter="
                (e: any) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#555';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
                }
              "
              @mouseleave="
                (e: any) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                }
              "
            >
              <div
                style="
                  width: 56px;
                  height: 56px;
                  background: #2a2a2a;
                  border-radius: 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 28px;
                  margin-bottom: 16px;
                "
              >
                📊
              </div>
              <h4 style="margin: 0 0 8px 0; color: #fff; font-size: 17px; font-weight: 600">状态栏面板</h4>
              <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6">HP/MP/经验值，进度条动画</p>
            </div>

            <!-- 好感度面板 -->
            <div
              style="
                background: #252525;
                border: 1px solid transparent;
                border-radius: 16px;
                padding: 24px;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              "
              @click="createProjectFromTemplate('好感度面板')"
              @mouseenter="
                (e: any) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#555';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
                }
              "
              @mouseleave="
                (e: any) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                }
              "
            >
              <div
                style="
                  width: 56px;
                  height: 56px;
                  background: #2a2a2a;
                  border-radius: 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 28px;
                  margin-bottom: 16px;
                "
              >
                💝
              </div>
              <h4 style="margin: 0 0 8px 0; color: #fff; font-size: 17px; font-weight: 600">好感度面板</h4>
              <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6">多角色卡片，爱心图标</p>
            </div>
          </div>

          <div
            style="
              margin-top: 24px;
              padding: 16px 18px;
              background: #252525;
              border: 1px solid #333;
              border-radius: 10px;
            "
          >
            <div
              style="
                color: #ccc;
                font-weight: 500;
                margin-bottom: 6px;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              <span style="color: #fbbf24; font-size: 16px">💡</span>
              使用提示
            </div>
            <p style="margin: 0; color: #888; font-size: 13px; line-height: 1.7">
              选择模板后，会自动创建包含完整代码的项目，你可以直接预览和编辑
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 进度对话框 -->
    <ProgressDialog ref="progressDialogRef" :show="showProgress" title="AI 正在处理" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { normalizeApiEndpoint } from '../settings';
import { getScriptIdSafe } from '../utils';
import ProgressDialog from './ProgressDialog.vue';

interface ProjectFile {
  path: string;
  name: string;
  content: string;
}

interface Project {
  id: string;
  name: string;
  files: ProjectFile[];
}

interface AIChange {
  path: string;
  oldContent: string;
  newContent: string;
}

interface AIHistoryRecord {
  timestamp: string;
  prompt: string;
  changes: AIChange[];
}

const projects = ref<Project[]>([]);
const currentId = ref('');
const currentFile = ref('');
const code = ref('');
const previewHtml = ref('');
const showAI = ref(false);
const aiPrompt = ref('');
const aiGenerating = ref(false);
const enableStream = ref(false); // 是否启用流式传输
const streamingText = ref(''); // 流式传输的实时文本
const showComparison = ref(false);
const aiChanges = ref<AIChange[]>([]);
const previewMode = ref<'before' | 'after'>('after');
const showHistory = ref(false);
const aiHistory = ref<Record<string, AIHistoryRecord[]>>({});

// AI 快捷建议
const quickSuggestions = [
  '添加响应式布局，支持移动端和桌面端',
  '添加深色/浅色主题切换功能',
  '优化代码结构，提取可复用组件',
  '添加加载动画和骨架屏',
  '添加表单验证和错误提示',
  '优化性能，减少不必要的渲染',
  '添加键盘快捷键支持',
  '改进无障碍访问（ARIA）',
];

// 进度对话框
const showProgress = ref(false);
const progressDialogRef = ref<InstanceType<typeof ProgressDialog> | null>(null);

// 项目模板相关
const showProjectTemplate = ref(false);

// Bug 修复相关
const showBugFix = ref(false);
const bugDescription = ref('');
const consoleError = ref('');
const bugFile = ref('');

// 文件夹导入
const folderInputRef = ref<HTMLInputElement | null>(null);

const currentProject = computed(() => {
  return projects.value.find(p => p.id === currentId.value);
});

const currentProjectHistory = computed(() => {
  return aiHistory.value[currentId.value] || [];
});

const comparisonPreviewHtml = computed(() => {
  if (aiChanges.value.length === 0) return '';

  const proj = currentProject.value;
  if (!proj) return '';

  // 创建临时项目用于预览
  const tempFiles: ProjectFile[] = proj.files.map(f => {
    const change = aiChanges.value.find(c => c.path === f.path);
    return {
      ...f,
      content: change ? (previewMode.value === 'after' ? change.newContent : change.oldContent) : f.content,
    };
  });

  return buildPreviewFromFiles(tempFiles);
});

// 项目模板定义
const projectTemplates = {
  同层对话界面: {
    name: '同层对话界面',
    description: '流式对话、消息历史、正则清理',
    icon: '💬',
    color: '#4a9eff',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>同层对话界面</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <div class="chat-container">
      <div class="message-list" id="messageList"></div>
      <div class="input-area">
        <textarea id="userInput" placeholder="输入消息..."></textarea>
        <button id="sendBtn">发送</button>
      </div>
    </div>
  </div>
  <${'script'} src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></${'script'}>
  <${'script'} src="script.js"></${'script'}>
</body>
</html>`,
      'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #1a1a1a;
  color: #e0e0e0;
}

.chat-container {
  max-width: 800px;
  margin: 20px auto;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 70%;
}

.message.user {
  background: #4a9eff;
  margin-left: auto;
  text-align: right;
}

.message.assistant {
  background: #3a3a3a;
}

.input-area {
  padding: 15px;
  background: #2a2a2a;
  border-top: 1px solid #3a3a3a;
  display: flex;
  gap: 10px;
}

#userInput {
  flex: 1;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  color: #e0e0e0;
  resize: none;
  height: 60px;
}

#sendBtn {
  padding: 10px 20px;
  background: #4a9eff;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

#sendBtn:hover {
  background: #357abd;
}`,
      'script.js': `// 聊天历史
let chatHistory = [];

// 从酒馆变量加载历史
function loadHistory() {
  const saved = getVariables({ type: 'chat' });
  chatHistory = saved.chatHistory || [];
  renderMessages();
}

// 保存到酒馆变量
function saveHistory() {
  insertOrAssignVariables({ chatHistory }, { type: 'chat' });
}

// 渲染消息
function renderMessages() {
  const list = document.getElementById('messageList');
  list.innerHTML = '';
  chatHistory.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message ' + msg.sender;
    div.textContent = msg.content;
    list.appendChild(div);
  });
  list.scrollTop = list.scrollHeight;
}

// 发送消息
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;

  // 添加用户消息
  chatHistory.push({
    id: Date.now(),
    sender: 'user',
    content: text,
    timestamp: new Date().toLocaleTimeString()
  });
  input.value = '';
  renderMessages();
  saveHistory();

  // 调用 AI（流式）
  const prompt = '【对话历史】\\n' + chatHistory.map(m => m.sender + ': ' + m.content).join('\\n');

  let aiText = '';
  await generate({
    should_stream: true,
    prompt: prompt,
    on_stream_chunk: (chunk) => {
      aiText += chunk;
      // 实时显示
      const tempMsg = { id: 'temp', sender: 'assistant', content: aiText };
      const tempIndex = chatHistory.findIndex(m => m.id === 'temp');
      if (tempIndex >= 0) {
        chatHistory[tempIndex] = tempMsg;
      } else {
        chatHistory.push(tempMsg);
      }
      renderMessages();
    },
    on_stream_end: () => {
      // 完成，替换为正式消息
      const tempIndex = chatHistory.findIndex(m => m.id === 'temp');
      if (tempIndex >= 0) {
        chatHistory[tempIndex] = {
          id: Date.now(),
          sender: 'assistant',
          content: aiText,
          timestamp: new Date().toLocaleTimeString()
        };
      }
      renderMessages();
      saveHistory();
    }
  });
}

// 初始化
$(() => {
  loadHistory();
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('userInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});`,
    },
  },
  状态栏面板: {
    name: '状态栏面板',
    description: 'HP/MP/经验值，进度条动画',
    icon: '📊',
    color: '#10b981',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>状态栏</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <div class="status-panel">
      <h2>角色状态</h2>
      <div class="stat-item">
        <label>生命值 (HP)</label>
        <div class="progress-bar">
          <div class="progress-fill hp" id="hpBar"></div>
        </div>
        <span id="hpText">0/0</span>
      </div>
      <div class="stat-item">
        <label>魔法值 (MP)</label>
        <div class="progress-bar">
          <div class="progress-fill mp" id="mpBar"></div>
        </div>
        <span id="mpText">0/0</span>
      </div>
      <div class="stat-item">
        <label>经验值 (EXP)</label>
        <div class="progress-bar">
          <div class="progress-fill exp" id="expBar"></div>
        </div>
        <span id="expText">0/0</span>
      </div>
    </div>
  </div>
  <${'script'} src="script.js"></${'script'}>
</body>
</html>`,
      'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #1a1a1a;
  color: #e0e0e0;
  padding: 20px;
}

.status-panel {
  max-width: 500px;
  margin: 0 auto;
  background: #2a2a2a;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #3a3a3a;
}

h2 {
  margin-bottom: 20px;
  color: #4a9eff;
}

.stat-item {
  margin-bottom: 20px;
}

.stat-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 24px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 12px;
}

.progress-fill.hp {
  background: linear-gradient(90deg, #ef4444, #10b981);
}

.progress-fill.mp {
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
}

.progress-fill.exp {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.stat-item span {
  font-size: 13px;
  color: #94a3b8;
}`,
      'script.js': `// 从酒馆变量加载数据
function loadStats() {
  const data = getVariables({ type: 'chat' });

  const hp = data.hp || 850;
  const maxHp = data.maxHp || 1000;
  const mp = data.mp || 340;
  const maxMp = data.maxMp || 500;
  const exp = data.exp || 1250;
  const maxExp = data.maxExp || 2000;

  // 更新进度条
  updateBar('hp', hp, maxHp);
  updateBar('mp', mp, maxMp);
  updateBar('exp', exp, maxExp);
}

function updateBar(type, current, max) {
  const percent = (current / max) * 100;
  document.getElementById(type + 'Bar').style.width = percent + '%';
  document.getElementById(type + 'Text').textContent = current + '/' + max;
}

// 初始化
document.addEventListener('DOMContentLoaded', loadStats);`,
    },
  },
  好感度面板: {
    name: '好感度面板',
    description: '多角色卡片，爱心图标，好感度展示',
    icon: '💝',
    color: '#ec4899',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>好感度面板</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <div class="affection-container">
      <h2>角色好感度</h2>
      <div class="character-grid" id="characterGrid"></div>
    </div>
  </div>
  <${'script'} src="script.js"></${'script'}>
</body>
</html>`,
      'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #1a1a1a;
  color: #e0e0e0;
  padding: 20px;
}

.affection-container {
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 25px;
  color: #ec4899;
  text-align: center;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.character-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #3a3a3a;
  transition: all 0.3s ease;
}

.character-card:hover {
  transform: translateY(-5px);
  border-color: #ec4899;
  box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
}

.character-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #e0e0e0;
}

.affection-bar {
  width: 100%;
  height: 20px;
  background: #1a1a1a;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.affection-fill {
  height: 100%;
  background: linear-gradient(90deg, #ec4899, #f472b6);
  transition: width 0.5s ease;
  border-radius: 10px;
}

.affection-text {
  font-size: 13px;
  color: #94a3b8;
}`,
      'script.js': `// 从酒馆变量加载角色数据
function loadCharacters() {
  const data = getVariables({ type: 'chat' });
  const characters = data.characters || [
    { name: '角色 A', affection: 75 },
    { name: '角色 B', affection: 50 },
    { name: '角色 C', affection: 90 }
  ];

  const grid = document.getElementById('characterGrid');
  grid.innerHTML = '';

  characters.forEach(char => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = \`
      <div class="character-name">\${char.name}</div>
      <div class="affection-bar">
        <div class="affection-fill" style="width: \${char.affection}%"></div>
      </div>
      <div class="affection-text">好感度: \${char.affection}/100</div>
    \`;
    grid.appendChild(card);
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', loadCharacters);`,
    },
  },
};

// 显示项目模板对话框
function showProjectTemplateDialog() {
  showProjectTemplate.value = true;
}

// 使用模板创建项目
function createProjectFromTemplate(templateKey: string) {
  const template = projectTemplates[templateKey as keyof typeof projectTemplates];
  if (!template) return;

  const name = prompt('项目名称:', template.name);
  if (!name || !name.trim()) return;

  const newProj: Project = {
    id: Date.now().toString(),
    name: name.trim(),
    files: Object.entries(template.files).map(([filename, content]) => ({
      path: filename,
      name: filename,
      content: content,
    })),
  };

  projects.value.push(newProj);
  currentId.value = newProj.id;
  currentFile.value = newProj.files[0]?.name || '';
  code.value = newProj.files[0]?.content || '';
  saveToChatVar();

  showProjectTemplate.value = false;
  window.toastr.success('✅ 项目"' + name.trim() + '"创建成功！');
}

// 文件夹导入功能
function triggerFolderImport() {
  if (folderInputRef.value) {
    folderInputRef.value.value = ''; // 清空之前的选择
    folderInputRef.value.click();
  }
}

async function handleFolderImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) {
    return;
  }

  try {
    // 获取文件夹名称（从第一个文件的路径中提取）
    const firstFile = files[0];
    const pathParts = firstFile.webkitRelativePath.split('/');
    const folderName = pathParts[0] || '导入的项目';

    // 让用户确认项目名称
    const projectName = prompt('项目名称:', folderName);
    if (!projectName || !projectName.trim()) {
      return;
    }

    // 支持的文件扩展名
    const supportedExtensions = ['.html', '.css', '.js', '.ts', '.scss', '.sass', '.json', '.txt', '.md'];

    // 读取所有文件
    const projectFiles: ProjectFile[] = [];
    const fileReadPromises: Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath.split('/').slice(1).join('/'); // 移除文件夹名称

      // 跳过空路径或隐藏文件/文件夹
      if (!relativePath || relativePath.startsWith('.') || relativePath.includes('/.')) {
        continue;
      }

      // 跳过 node_modules、dist 等常见不需要的文件夹
      if (
        relativePath.includes('node_modules/') ||
        relativePath.includes('dist/') ||
        relativePath.includes('.git/') ||
        relativePath.includes('build/')
      ) {
        continue;
      }

      // 检查文件扩展名
      const extension = '.' + relativePath.split('.').pop()?.toLowerCase();
      if (!supportedExtensions.includes(extension)) {
        continue;
      }

      // 读取文件内容
      const readPromise = new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          const content = e.target?.result as string;
          const fileName = relativePath.split('/').pop() || relativePath;
          projectFiles.push({
            path: relativePath,
            name: fileName,
            content: content || '',
          });
          resolve();
        };
        reader.onerror = () => reject(new Error(`读取文件失败: ${relativePath}`));
        reader.readAsText(file);
      });

      fileReadPromises.push(readPromise);
    }

    // 等待所有文件读取完成
    await Promise.all(fileReadPromises);

    if (projectFiles.length === 0) {
      window.toastr.warning('未找到可导入的文件（支持的格式：HTML、CSS、JS、TS、SCSS 等）');
      return;
    }

    // 创建新项目
    const newProj: Project = {
      id: Date.now().toString(),
      name: projectName.trim(),
      files: projectFiles,
    };

    projects.value.push(newProj);
    currentId.value = newProj.id;
    currentFile.value = newProj.files[0]?.path || '';
    code.value = newProj.files[0]?.content || '';

    saveToChatVar();
    updatePreview();

    window.toastr.success(`成功导入项目"${projectName}"，共 ${projectFiles.length} 个文件`);
  } catch (error) {
    console.error('导入文件夹失败:', error);
    window.toastr.error('导入文件夹失败: ' + (error as Error).message);
  }
}

function createProject() {
  const name = prompt('项目名称:');
  if (!name || !name.trim()) return;

  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name.trim()}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>欢迎来到 ${name.trim()}!</h1>
    <p>开始你的创作之旅</p>
  </div>
  <${'script'} src="script.js"></${'script'}>
</body>
</html>`;

  const cssContent = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 600px;
}

h1 {
  font-size: 2.5em;
  color: #667eea;
  margin-bottom: 20px;
}

p {
  font-size: 1.2em;
  color: #666;
  line-height: 1.6;
}`;

  const jsContent = `console.log('项目已启动！');

// 使用 jQuery 确保 DOM 加载完成
$(function() {
  console.log('页面加载完成');

  // ========== 检测是否在酒馆环境中 ==========
  const isInTavern = typeof SillyTavern !== 'undefined' && typeof getVariables !== 'undefined';

  if (!isInTavern) {
    console.log('预览模式：当前在预览窗口中，酒馆 API 不可用');
    // 预览模式下的逻辑（使用 localStorage 或不保存数据）
  }

  // ========== 数据持久化示例（仅在酒馆环境中可用）==========
  const storageKey = 'my_project_data'; // 自定义存储键名

  // 加载数据
  function loadData() {
    if (isInTavern) {
      const data = getVariables({ type: 'chat' });
      return data[storageKey] || { count: 0 };
    } else {
      // 预览模式：使用 localStorage
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : { count: 0 };
    }
  }

  // 保存数据
  function saveData(data) {
    if (isInTavern) {
      insertOrAssignVariables({ [storageKey]: data }, { type: 'chat' });
      console.log('数据已保存到酒馆变量:', data);
    } else {
      // 预览模式：使用 localStorage
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log('数据已保存到 localStorage（预览模式）:', data);
    }
  }

  // 初始化
  let myData = loadData();
  console.log('加载的数据:', myData);

  // ========== 示例：点击计数器 ==========
  const container = $('.container');
  if (container.length) {
    container.on('click', function() {
      myData.count++;
      saveData(myData);
      if (typeof toastr !== 'undefined') {
        toastr.success(\`点击次数: \${myData.count}\`);
      } else {
        alert(\`点击次数: \${myData.count}\`);
      }
    });
  }

  // 页面卸载时保存（可选）
  $(window).on('pagehide', function() {
    saveData(myData);
  });
});`;

  const newProj: Project = {
    id: Date.now().toString(),
    name: name.trim(),
    files: [
      { path: 'index.html', name: 'index.html', content: htmlContent },
      { path: 'style.css', name: 'style.css', content: cssContent },
      { path: 'script.js', name: 'script.js', content: jsContent },
    ],
  };

  projects.value.push(newProj);
  console.log('新建项目:', newProj.name, '项目总数:', projects.value.length);

  // 立即保存
  saveToChatVar();

  currentId.value = newProj.id;
  currentFile.value = 'index.html';
  code.value = htmlContent;
  updatePreview();
  toastr.success(`项目 "${newProj.name}" 已创建并保存`);
}

function selectProject(id: string) {
  currentId.value = id;
  const proj = currentProject.value;
  if (proj && proj.files.length > 0) {
    currentFile.value = proj.files[0].path;
    code.value = proj.files[0].content;
    updatePreview();
  } else {
    currentFile.value = '';
    code.value = '';
    previewHtml.value = '';
  }
}

function selectFile(path: string) {
  currentFile.value = path;
  const proj = currentProject.value;
  if (proj) {
    const file = proj.files.find(f => f.path === path);
    if (file) {
      code.value = file.content;
    }
  }
}

function saveCode() {
  const proj = currentProject.value;
  if (!proj || !currentFile.value) {
    toastr.error('请先选择一个文件');
    return;
  }

  const file = proj.files.find(f => f.path === currentFile.value);
  if (file) {
    file.content = code.value;

    // 清除自动保存定时器，立即保存
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }

    saveToChatVar();
    updatePreview();
    toastr.success('已保存');
  }
}

function deleteProject(id: string) {
  const proj = projects.value.find(p => p.id === id);
  if (!proj) return;

  if (!confirm(`确定删除项目 "${proj.name}" 吗？`)) return;

  projects.value = projects.value.filter(p => p.id !== id);
  console.log('删除项目后，剩余项目数:', projects.value.length);

  if (currentId.value === id) {
    currentId.value = '';
    currentFile.value = '';
    code.value = '';
    previewHtml.value = '';
  }

  // 立即保存
  saveToChatVar();
  toastr.success(`项目 "${proj.name}" 已删除`);
}

// 新建文件夹
function createNewFolder() {
  const proj = currentProject.value;
  if (!proj) return;

  const folderPath = prompt('请输入文件夹路径：\n例如：css 或 js/utils', '');
  if (!folderPath || !folderPath.trim()) return;

  const trimmedPath = folderPath.trim().replace(/\/$/, ''); // 移除末尾的斜杠

  // 在文件夹中创建一个 .gitkeep 占位文件
  const gitkeepPath = `${trimmedPath}/.gitkeep`;

  // 检查是否已存在
  if (proj.files.some(f => f.path.startsWith(`${trimmedPath}/`))) {
    window.toastr.warning(`文件夹 "${trimmedPath}" 已存在（包含文件）`);
    return;
  }

  // 创建占位文件
  const newFile: ProjectFile = {
    path: gitkeepPath,
    name: '.gitkeep',
    content: '# 此文件用于保持文件夹结构\n',
  };

  proj.files.push(newFile);
  saveToChatVar();

  window.toastr.success(`文件夹 "${trimmedPath}" 已创建`);
}

// 新建文件
function showNewFileDialog() {
  const proj = currentProject.value;
  if (!proj) return;

  // 获取项目中已有的文件夹列表
  const folders = new Set<string>();
  folders.add(''); // 根目录

  proj.files.forEach(file => {
    const parts = file.path.split('/');
    if (parts.length > 1) {
      // 提取所有文件夹路径
      for (let i = 1; i < parts.length; i++) {
        const folderPath = parts.slice(0, i).join('/');
        if (folderPath) folders.add(folderPath);
      }
    }
  });

  const folderList = Array.from(folders).sort();

  // 1. 选择文件类型
  const fileTypes = [
    { name: 'HTML 文件', ext: '.html', icon: '🌐' },
    { name: 'CSS 文件', ext: '.css', icon: '🎨' },
    { name: 'JavaScript 文件', ext: '.js', icon: '⚡' },
    { name: 'TypeScript 文件', ext: '.ts', icon: '📘' },
    { name: 'JSON 文件', ext: '.json', icon: '📄' },
    { name: 'Markdown 文件', ext: '.md', icon: '📝' },
    { name: '其他文件', ext: '', icon: '📋' },
  ];

  const typeOptions = fileTypes.map((t, i) => `${i + 1}. ${t.icon} ${t.name} (${t.ext || '自定义'})`).join('\n');
  const typeChoice = prompt(`请选择文件类型（输入序号 1-${fileTypes.length}）：\n\n${typeOptions}`, '1');

  if (!typeChoice) return;

  const typeIndex = parseInt(typeChoice) - 1;
  if (typeIndex < 0 || typeIndex >= fileTypes.length) {
    window.toastr.error('无效的选项');
    return;
  }

  const selectedType = fileTypes[typeIndex];

  // 2. 选择目标文件夹
  let targetFolder = '';
  if (folderList.length > 1) {
    const folderOptions =
      folderList.length > 5
        ? '输入文件夹路径（留空为根目录）：'
        : `请选择目标文件夹（输入序号）：\n\n${folderList.map((f, i) => `${i + 1}. ${f || '根目录'}`).join('\n')}\n\n或直接输入文件夹路径：`;

    const folderChoice = prompt(folderOptions, '1');
    if (!folderChoice) return;

    // 尝试解析为序号
    const folderIndex = parseInt(folderChoice) - 1;
    if (folderIndex >= 0 && folderIndex < folderList.length) {
      targetFolder = folderList[folderIndex];
    } else {
      // 当作路径处理
      targetFolder = folderChoice.trim().replace(/\/$/, '');
    }
  }

  // 3. 输入文件名
  const fileName = prompt(
    `请输入文件名${selectedType.ext ? `（将自动添加 ${selectedType.ext}）` : '（需包含扩展名）'}：`,
    selectedType.ext ? `new-file` : 'newfile.txt',
  );

  if (!fileName || !fileName.trim()) return;

  let trimmedName = fileName.trim();

  // 如果选择了文件类型，自动添加扩展名
  if (selectedType.ext && !trimmedName.endsWith(selectedType.ext)) {
    trimmedName += selectedType.ext;
  }

  // 构建完整路径
  const fullPath = targetFolder ? `${targetFolder}/${trimmedName}` : trimmedName;

  // 检查文件是否已存在
  if (proj.files.some(f => f.path === fullPath)) {
    window.toastr.error(`文件 "${fullPath}" 已存在！`);
    return;
  }

  // 生成默认内容
  const extension = trimmedName.split('.').pop()?.toLowerCase();
  let defaultContent = '';

  switch (extension) {
    case 'html':
      defaultContent =
        '<!DOCTYPE html>\n' +
        '<html lang="zh-CN">\n' +
        '<head>\n' +
        '  <meta charset="UTF-8">\n' +
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        '  <title>' +
        trimmedName.replace('.html', '') +
        '</title>\n' +
        '  <link rel="stylesheet" href="style.css">\n' +
        '</head>\n' +
        '<body>\n' +
        '  <div class="container">\n' +
        '    <h1>欢迎</h1>\n' +
        '  </div>\n' +
        '  <' +
        'script src="script.js"></' +
        'script>\n' +
        '</body>\n' +
        '</html>';
      break;
    case 'css':
    case 'scss':
    case 'sass':
      defaultContent = `/* ${trimmedName} */\n\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n`;
      break;
    case 'js':
    case 'ts':
      defaultContent =
        `// ${trimmedName}\n\nconsole.log('${trimmedName} 已加载');\n\n$` + `(function() {\n  // 在这里编写代码\n});\n`;
      break;
    case 'json':
      defaultContent = `{\n  "name": "${trimmedName.replace('.json', '')}",\n  "version": "1.0.0"\n}`;
      break;
    case 'md':
      defaultContent = `# ${trimmedName.replace(/\.md$/, '')}\n\n`;
      break;
    default:
      defaultContent = '';
  }

  // 创建新文件
  const newFile: ProjectFile = {
    path: fullPath,
    name: trimmedName,
    content: defaultContent,
  };

  proj.files.push(newFile);
  currentFile.value = fullPath;
  code.value = defaultContent;

  saveToChatVar();
  updatePreview();

  window.toastr.success(`文件 "${fullPath}" 已创建`);
}

// 删除文件
function deleteFile(filePath: string) {
  const proj = currentProject.value;
  if (!proj) return;

  const file = proj.files.find(f => f.path === filePath);
  if (!file) return;

  if (!confirm(`确定删除文件 "${file.path}" 吗？`)) return;

  proj.files = proj.files.filter(f => f.path !== filePath);

  // 如果删除的是当前打开的文件，切换到第一个文件
  if (currentFile.value === filePath) {
    if (proj.files.length > 0) {
      currentFile.value = proj.files[0].path;
      code.value = proj.files[0].content;
    } else {
      currentFile.value = '';
      code.value = '';
    }
  }

  saveToChatVar();
  updatePreview();

  window.toastr.success(`文件 "${file.path}" 已删除`);
}

function getFileIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'html') return 'fa-brands fa-html5';
  if (ext === 'css') return 'fa-brands fa-css3-alt';
  if (ext === 'js') return 'fa-brands fa-js';
  return 'fa-solid fa-file-code';
}

function buildPreviewFromFiles(files: ProjectFile[]): string {
  const htmlFile = files.find(f => f.path.endsWith('.html'));
  const cssFile = files.find(f => f.path.endsWith('.css'));
  const jsFile = files.find(f => f.path.endsWith('.js'));

  if (!htmlFile) return '';

  const html = htmlFile.content;
  const headTag = 'head';
  const bodyTag = 'body';
  const headMatch = html.match(new RegExp(`<${headTag}[^>]*>([\\s\\S]*?)</${headTag}>`, 'i'));
  const bodyMatch = html.match(new RegExp(`<${bodyTag}[^>]*>([\\s\\S]*?)</${bodyTag}>`, 'i'));

  let headContent = headMatch ? headMatch[1] : '';
  let bodyContent = bodyMatch ? bodyMatch[1] : html;

  const linkTagRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
  const scriptTagRegex = new RegExp('<' + 'script[^>]*></' + 'script>', 'gi');
  headContent = headContent.replace(linkTagRegex, '');
  bodyContent = bodyContent.replace(scriptTagRegex, '');

  const scriptTag = 'script';
  const styleTag = 'style';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headContent}
  <${styleTag}>
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: auto !important;
      min-height: 800px !important;
      overflow: visible !important;
    }
    ${cssFile?.content || ''}
  </${styleTag}>
  <${scriptTag} src="https://code.jquery.com/jquery-3.7.1.min.js"></${scriptTag}>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
  <${scriptTag} src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></${scriptTag}>
  <${scriptTag} src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></${scriptTag}>
  <${scriptTag} src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></${scriptTag}>
</head>
<body>
  ${bodyContent}
  <${scriptTag}>${jsFile?.content || ''}</${scriptTag}>
</body>
</html>`;
}

function updatePreview() {
  const proj = currentProject.value;
  if (!proj) {
    previewHtml.value = '';
    return;
  }
  previewHtml.value = buildPreviewFromFiles(proj.files);
}

function saveToChatVar() {
  try {
    // 插件环境：使用 SillyTavern.chatId 属性而不是 getCurrentChatId() 函数
    const chatId = SillyTavern.chatId;
    console.log('保存数据到 localStorage，聊天 ID:', chatId);

    const dataToSave = {
      frontend_projects_files: projects.value,
      frontend_ai_history: aiHistory.value,
    };

    // 插件环境：保存到 localStorage
    const scriptId = getScriptIdSafe();
    const storageKey = chatId ? `${scriptId}_frontend_projects_${chatId}` : `${scriptId}_frontend_projects_global`;

    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    console.log('保存成功到 localStorage！', dataToSave.frontend_projects_files.length, '个项目');
  } catch (e) {
    console.error('保存失败:', e);
  }
}

function loadFromChatVar() {
  try {
    // 插件环境：使用 SillyTavern.chatId 属性而不是 getCurrentChatId() 函数
    const chatId = SillyTavern.chatId;
    console.log('正在从 localStorage 加载数据，聊天 ID:', chatId);

    // 插件环境：从 localStorage 加载
    const scriptId = getScriptIdSafe();
    const storageKey = chatId ? `${scriptId}_frontend_projects_${chatId}` : `${scriptId}_frontend_projects_global`;

    const savedData = localStorage.getItem(storageKey);
    let data = null;

    if (savedData) {
      try {
        data = JSON.parse(savedData);
        console.log('从 localStorage 读取到的数据:', data);
      } catch (parseError) {
        console.error('解析 localStorage 数据失败:', parseError);
      }
    }

    if (data?.frontend_projects_files && Array.isArray(data.frontend_projects_files)) {
      projects.value = data.frontend_projects_files;
      console.log('成功加载项目:', projects.value.length, '个');
    } else {
      console.log('没有找到已保存的项目数据');
      projects.value = [];
    }

    if (data?.frontend_ai_history) {
      aiHistory.value = data.frontend_ai_history;
      console.log('成功加载历史记录');
    } else {
      aiHistory.value = {};
    }
  } catch (e) {
    console.error('加载失败:', e);
  }
}

// 立即加载数据
loadFromChatVar();

// 插件环境：监听 SillyTavern.chatId 属性变化
watch(
  () => SillyTavern.chatId,
  () => {
    loadFromChatVar();
    currentId.value = '';
    currentFile.value = '';
    code.value = '';
    previewHtml.value = '';
  },
);

// 实时自动保存（防抖）
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
watchEffect(() => {
  // 监听代码编辑器的内容变化
  if (currentFile.value && code.value !== undefined) {
    const proj = currentProject.value;
    if (proj) {
      const file = proj.files.find(f => f.path === currentFile.value);
      if (file && file.content !== code.value) {
        // 更新内存中的文件内容
        file.content = code.value;

        // 清除之前的定时器
        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer);
        }

        // 延迟保存到存储（防抖 1 秒）
        autoSaveTimer = setTimeout(() => {
          saveToChatVar();
          console.log('自动保存:', currentFile.value);
        }, 1000);
      }
    }
  }
});

// 预览更新（防抖）
let previewTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => [currentFile.value, code.value],
  () => {
    if (previewTimer) {
      clearTimeout(previewTimer);
    }
    previewTimer = setTimeout(updatePreview, 500);
  },
  { deep: true },
);

// 组件卸载前保存（切换标签页时）
onBeforeUnmount(() => {
  console.log('组件卸载，保存数据...');

  // 清理定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  if (previewTimer) {
    clearTimeout(previewTimer);
  }

  // 立即保存当前编辑的内容
  if (currentFile.value && code.value !== undefined) {
    const proj = currentProject.value;
    if (proj) {
      const file = proj.files.find(f => f.path === currentFile.value);
      if (file) {
        file.content = code.value;
      }
    }
  }

  // 最终保存
  saveToChatVar();
  console.log('数据已保存');
});

function showAIDialog() {
  showAI.value = true;
  aiPrompt.value = '';
}

function closeAIDialog() {
  showAI.value = false;
  aiPrompt.value = '';
}

// Bug 修复对话框
function showBugFixDialog() {
  showBugFix.value = true;
  bugDescription.value = '';
  consoleError.value = '';
  bugFile.value = '';
}

function closeBugFixDialog() {
  showBugFix.value = false;
  bugDescription.value = '';
  consoleError.value = '';
  bugFile.value = '';
}

async function fixBugWithAI() {
  const proj = currentProject.value;
  if (!proj) {
    window.toastr.error('请先选择项目');
    return;
  }

  if (!bugDescription.value.trim()) {
    window.toastr.error('请描述问题');
    return;
  }

  aiGenerating.value = true;
  showProgress.value = true;
  let normalizedEndpoint = '';

  try {
    // 阶段 1: 准备请求
    progressDialogRef.value?.setProgress(5);
    progressDialogRef.value?.setMessage('正在准备 Bug 修复请求...');
    await new Promise(r => setTimeout(r, 100));

    // 获取 API 配置
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      throw new Error('无法获取脚本 ID');
    }

    const vars = getVariables({ type: 'script', script_id: scriptId });
    const apiEndpoint = vars?.api_endpoint;
    const apiKey = vars?.api_key;
    const model = vars?.model || 'gpt-4o-mini';

    if (!apiEndpoint || !apiKey) {
      throw new Error('请先在"设置"标签中配置 API');
    }

    normalizedEndpoint = normalizeApiEndpoint(apiEndpoint);

    progressDialogRef.value?.setProgress(15);
    progressDialogRef.value?.setMessage('正在构建 Bug 修复提示词...');
    await new Promise(r => setTimeout(r, 100));

    // 构建专门的 Bug 修复提示词
    const systemPrompt = `你是专业的前端 Bug 修复专家。

# 修复要求

1. **专注性**：只修复用户描述的具体问题，不要改动其他功能
2. **最小化改动**：只修改必要的代码，保持其他部分不变
3. **精准定位**：优先根据 Console 错误信息定位问题
4. **保持风格**：修复后的代码要保持原有的命名、格式、缩进风格

# 常见 Bug 类型和修复策略

**点击无响应：**
- 检查事件绑定是否正确（ID 是否匹配）
- 检查函数是否在 \`$(function() {})\` 内正确定义
- 检查是否有 JavaScript 错误阻止了执行

**显示异常：**
- 检查 CSS 样式（display、visibility、z-index）
- 检查 DOM 结构是否正确
- 检查数据绑定是否正常

**数据保存失败：**
- 检查 insertOrAssignVariables 调用
- 检查数据格式是否正确
- 检查变量作用域

**逻辑错误：**
- 检查条件判断
- 检查异步处理
- 检查变量作用域

# 输出格式

只输出需要修改的文件，使用以下格式：

\`\`\`
FILE_START: 文件名
[修改后的完整文件内容，并在关键修复位置添加注释]
FILE_END
\`\`\`

不要输出任何其他文字或解释！`;

    const currentFiles = proj.files.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');

    const userPrompt = `# 当前项目文件：
${currentFiles}

# Bug 描述：
${bugDescription.value}

${
  consoleError.value.trim()
    ? `# Console 错误信息：
\`\`\`
${consoleError.value}
\`\`\`
`
    : ''
}

${
  bugFile.value
    ? `# 问题可能在文件：
${bugFile.value}
`
    : ''
}

# 修复要求：
1. 专注修复上述 bug，不要改其他地方
2. 只输出需要修改的文件
3. 在修复的关键位置添加注释说明修复内容
4. 保持代码风格一致

请严格按 system 中的格式输出，不要添加解释！`;

    progressDialogRef.value?.setProgress(25);
    progressDialogRef.value?.setMessage('正在发送请求到 AI 服务器...');
    await new Promise(r => setTimeout(r, 100));

    // 发送请求
    progressDialogRef.value?.setProgress(30);
    progressDialogRef.value?.setMessage('等待 AI 分析 bug...');
    await new Promise(r => setTimeout(r, 100));

    const response = await fetch(normalizedEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // 降低温度，让修复更稳定
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
    }

    progressDialogRef.value?.setProgress(60);
    progressDialogRef.value?.setMessage('正在接收 AI 修复方案...');
    await new Promise(r => setTimeout(r, 100));

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || '';

    if (!resultText) {
      throw new Error('AI 未返回修复方案');
    }

    progressDialogRef.value?.setProgress(75);
    progressDialogRef.value?.setMessage('正在解析修复方案...');
    await new Promise(r => setTimeout(r, 100));

    // 解析 AI 返回的文件
    const fileRegex = /FILE_START:\s*(.+?)\s*\n([\s\S]*?)\nFILE_END/g;
    const changes: AIChange[] = [];
    let match;

    while ((match = fileRegex.exec(resultText)) !== null) {
      const path = match[1].trim();
      const newContent = match[2].trim();
      const existingFile = proj.files.find(f => f.path === path);

      if (existingFile) {
        changes.push({
          path,
          oldContent: existingFile.content,
          newContent,
        });
      }
    }

    if (changes.length === 0) {
      throw new Error('AI 未返回有效的修复方案');
    }

    progressDialogRef.value?.setProgress(85);
    progressDialogRef.value?.setMessage('正在准备对比预览...');
    await new Promise(r => setTimeout(r, 100));

    // 保存到历史记录（会在用户接受更改时自动保存）
    if (!aiHistory.value[proj.id]) {
      aiHistory.value[proj.id] = [];
    }
    aiHistory.value[proj.id].unshift({
      timestamp: new Date().toISOString(),
      prompt: `Bug 修复: ${bugDescription.value}`,
      changes: klona(changes),
    });

    // 显示对比
    aiChanges.value = changes;
    showComparison.value = true;
    previewMode.value = 'after';

    progressDialogRef.value?.setProgress(95);
    progressDialogRef.value?.setMessage(`Bug 修复方案已生成 (${changes.length} 个文件)`);
    await new Promise(r => setTimeout(r, 100));

    // 完成
    progressDialogRef.value?.setProgress(100);
    progressDialogRef.value?.setMessage('Bug 修复方案已生成！');
    setTimeout(() => {
      showProgress.value = false;
      showBugFix.value = false;
      window.toastr.success(`AI 已生成修复方案，请在对比窗口中查看`);
    }, 800);
  } catch (error: any) {
    console.error('Bug 修复失败:', error);
    window.toastr.error(`Bug 修复失败: ${error?.message || String(error)}`);
    showProgress.value = false;
  } finally {
    aiGenerating.value = false;
  }
}

async function generateWithAI() {
  if (!aiPrompt.value.trim() || aiGenerating.value) return;

  const proj = currentProject.value;
  if (!proj) {
    toastr.error('请先选择一个项目');
    return;
  }

  // 检查用户输入是否过于模糊
  const vaguePhrases = ['完善', '优化', '改进', '美化', '修改', '调整', '更新'];
  const prompt = aiPrompt.value.trim();
  const isVague = vaguePhrases.some(phrase => {
    const regex = new RegExp(`^${phrase}[一下了吧呗啊吗。！？\\s]*$`, 'i');
    return regex.test(prompt);
  });

  if (isVague) {
    toastr.warning(
      '请详细描述你的需求！\n\n例如：\n' +
        '❌ "优化一下"\n' +
        '✅ "优化按钮样式，添加悬停动画和圆角效果"\n\n' +
        '❌ "完善"\n' +
        '✅ "添加响应式布局，支持移动端显示"',
      '需求太模糊了',
      { timeOut: 6000 },
    );
    return;
  }

  aiGenerating.value = true;
  showProgress.value = true;
  let normalizedEndpoint = ''; // 提到外层作用域

  try {
    // 阶段1: 准备请求
    progressDialogRef.value?.setProgress(5);
    progressDialogRef.value?.setMessage('正在准备 AI 请求...');
    await new Promise(r => setTimeout(r, 100)); // 等待 DOM 更新

    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      toastr.error('无法获取脚本 ID');
      aiGenerating.value = false;
      showProgress.value = false;
      return;
    }

    const vars = getVariables({ type: 'script', script_id: scriptId });
    const apiEndpoint = vars?.api_endpoint;
    const apiKey = vars?.api_key;
    const model = vars?.model || 'gpt-4o-mini';
    const temperature = vars?.temperature || 0.7;
    const maxTokens = vars?.max_tokens || 4000;

    if (!apiEndpoint || !apiKey) {
      toastr.error('请先在"设置"标签页配置 API');
      aiGenerating.value = false;
      showProgress.value = false;
      return;
    }

    // 规范化 API 端点
    try {
      normalizedEndpoint = normalizeApiEndpoint(apiEndpoint);
      console.log('📍 原始端点:', apiEndpoint);
      console.log('🔗 规范化后的端点:', normalizedEndpoint);
    } catch (e) {
      toastr.error('API 端点格式不正确：' + (e as Error).message);
      aiGenerating.value = false;
      showProgress.value = false;
      return;
    }

    // 检查 max_tokens 是否足够
    if (maxTokens < 2000) {
      toastr.warning(`当前 max_tokens 设置为 ${maxTokens}，可能导致 AI 返回内容被截断。建议设置为 4000 以上。`);
    }

    progressDialogRef.value?.setProgress(15);
    progressDialogRef.value?.setMessage('正在构建提示词...');
    await new Promise(r => setTimeout(r, 100)); // 等待 DOM 更新

    const systemPrompt = `你是专业的前端开发助手。这是一个在 SillyTavern（酒馆）中运行的前端界面项目。

# 当前项目文件：
${proj.files.map(f => `- ${f.path}`).join('\n')}

# 可用的 API 和库（可直接使用，无需导入）：
## 第三方库：
- jQuery ($): DOM 操作、事件处理
- toastr: 消息提示
- gsap: 动画效果
- lodash (_): 工具函数
- zod (z): 数据校验

## 酒馆助手 API（全局可用）：
**数据持久化（重要！）：**
- \`getVariables({ type: 'chat' })\`: 获取聊天变量（对象形式）
- \`insertOrAssignVariables(data, { type: 'chat' })\`: 保存数据到聊天变量（推荐用这个）
- \`replaceVariables(data, { type: 'chat' })\`: 完全替换聊天变量

**数据持久化示例代码：**
\`\`\`javascript
// ⚠️ 重要：需要检测是否在酒馆环境中（预览模式下酒馆 API 不可用）
const isInTavern = typeof SillyTavern !== 'undefined' && typeof getVariables !== 'undefined';

// 加载数据
function loadData() {
  if (isInTavern) {
    const data = getVariables({ type: 'chat' });
    return data.my_key || { count: 0 };
  } else {
    // 预览模式：使用 localStorage
    const stored = localStorage.getItem('my_key');
    return stored ? JSON.parse(stored) : { count: 0 };
  }
}

// 保存数据
function saveData(data) {
  if (isInTavern) {
    insertOrAssignVariables({ my_key: data }, { type: 'chat' });
  } else {
    localStorage.setItem('my_key', JSON.stringify(data));
  }
}

// 使用
let myData = loadData();
myData.count++;
saveData(myData);
\`\`\`

**其他 API：**
- getChatMessages(): 获取当前聊天的所有消息
- getCurrentCharacter(): 获取当前角色卡信息
- getWorldbook(): 获取世界书
- replaceWorldbook(data): 替换世界书
- eventOn(event, callback): 监听酒馆事件
- getIframeName(): 获取当前 iframe 名称
- triggerSlash(command): 执行 STScript 命令
- SillyTavern.getCurrentChatId(): 获取当前聊天 ID

## 从消息中读取数据并更新界面

**场景：** 创建状态栏界面，需要从最新的 AI 消息中提取角色状态并实时显示。

**核心代码示例：**

\`\`\`javascript
// 1. 读取最新消息内容
async function updateStatusFromMessages() {
  if (typeof getChatMessages !== 'function') return; // 预览模式跳过

  const messages = await getChatMessages();
  if (!messages || messages.length === 0) return;

  // 获取最新的 AI 消息（从后往前找第一条 is_user: false）
  const latestAIMessage = messages.slice().reverse().find(m => !m.is_user);
  if (!latestAIMessage) return;

  const content = latestAIMessage.mes; // 消息文本内容

  // 2. 使用正则提取状态数据（示例：提取代码块中的状态）
  const statusMatch = content.match(/\`\`\`json([\\s\\S]*?)\`\`\`/);
  if (statusMatch) {
    try {
      const status = JSON.parse(statusMatch[1]);
      // 3. 更新界面显示
      $('#health').text(status.health || 100);
      $('#level').text(status.level || 1);
    } catch (e) {
      console.error('解析状态失败:', e);
    }
  }

  // 或者用正则直接提取特定格式（例如：【生命值：80】）
  const healthMatch = content.match(/【生命值[：:](\\d+)】/);
  if (healthMatch) {
    $('#health').text(healthMatch[1]);
  }
}

// 4. 页面加载时更新
$(function() {
  updateStatusFromMessages();
});

// 5. 监听新消息事件，自动更新（可选）
if (typeof eventOn === 'function') {
  eventOn('MESSAGE_RECEIVED', () => {
    updateStatusFromMessages();
  });
}
\`\`\`

---

## 🎯 状态栏 XML 美化（重要！）

**场景：** AI 回复中包含 XML 格式的状态栏（如 \`<state_bar><i>【内容】</i></state_bar>\`），需要将其美化显示。

**核心功能：**
1. 提取 \`<state_bar>\` 标签内容
2. 将 XML 标签转换为美化的 HTML
3. 实时显示在界面上

**完整实现示例：**

\`\`\`typescript
// ===== 1. 提取状态栏内容 =====
function extractStateBar(text: string): string | null {
  const match = text.match(/<state_bar>([\\s\\S]*?)<\\/state_bar>/i);
  return match ? match[1].trim() : null;
}

// ===== 2. XML 转 HTML（支持多种标签格式）=====
function convertXmlToHtml(xml: string): string {
  let html = xml;

  // 处理缩进标签：<i>、<2i>、<3i> 等
  html = html.replace(/<i>([\\s\\S]*?)<\\/i>/g, '<div class="state-item indent-1">$1</div>');
  html = html.replace(/<2i>([\\s\\S]*?)<\\/2i>/g, '<div class="state-item indent-2">$1</div>');
  html = html.replace(/<3i>([\\s\\S]*?)<\\/3i>/g, '<div class="state-item indent-3">$1</div>');

  // 处理语义化标签（常见的状态栏标签）
  html = html.replace(/<日期>([\\s\\S]*?)<\\/日期>/g, '<div class="state-date">📅 $1</div>');
  html = html.replace(/<时间>([\\s\\S]*?)<\\/时间>/g, '<div class="state-time">🕐 $1</div>');
  html = html.replace(/<地点>([\\s\\S]*?)<\\/地点>/g, '<div class="state-location">📍 $1</div>');
  html = html.replace(/<角色生理状态>([\\s\\S]*?)<\\/角色生理状态>/g, '<div class="state-physical">💓 $1</div>');
  html = html.replace(/<角色心理状态>([\\s\\S]*?)<\\/角色心理状态>/g, '<div class="state-mental">🧠 $1</div>');
  html = html.replace(/<当前状态>([\\s\\S]*?)<\\/当前状态>/g, '<div class="state-current">✨ $1</div>');

  // 处理颜色标签（如 <角色生理状态>【描述角色当前生理状态】</角色生理状态>）
  html = html.replace(/<角色生理状态>([\\s\\S]*?)<\\/角色生理状态>/g,
    '<div class="state-colored" style="border-left: 3px solid #ff6b6b; background: rgba(255,107,107,0.1);">$1</div>');

  // 通用标签处理（兜底方案）
  html = html.replace(/<([^>\\/\\s]+)>([\\s\\S]*?)<\\/\\1>/g, '<div class="state-generic">$2</div>');

  return html;
}

// ===== 3. 监听消息并更新 =====
async function updateStateBar() {
  if (typeof getChatMessages !== 'function') return;

  const messages = await getChatMessages();
  if (!messages || messages.length === 0) return;

  // 获取最新的 AI 消息
  const latestAI = messages.slice().reverse().find(m => !m.is_user);
  if (!latestAI) return;

  // 提取状态栏
  const stateBarXml = extractStateBar(latestAI.mes);
  if (stateBarXml) {
    const stateBarHtml = convertXmlToHtml(stateBarXml);

    // 更新界面（带动画）
    const container = $('#state-bar-container');
    container.fadeOut(200, () => {
      container.html(stateBarHtml);
      container.fadeIn(200);
    });
  }
}

// ===== 4. 初始化和监听 =====
$(function() {
  updateStateBar(); // 页面加载时更新

  // 监听消息接收事件
  if (typeof eventOn === 'function') {
    eventOn('MESSAGE_RECEIVED', updateStateBar);
  }
});
\`\`\`

**配套 CSS 样式：**

\`\`\`scss
#state-bar-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
}

.state-item {
  padding: 8px 12px;
  margin: 6px 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
  }
}

// 缩进样式
.indent-1 { margin-left: 20px; }
.indent-2 { margin-left: 40px; }
.indent-3 { margin-left: 60px; }

// 语义化标签样式
.state-date, .state-time, .state-location {
  font-weight: 600;
  font-size: 14px;
  padding: 8px 12px;
  margin: 8px 0;
  border-radius: 6px;
}

.state-date { background: rgba(100, 181, 246, 0.2); }
.state-time { background: rgba(129, 199, 132, 0.2); }
.state-location { background: rgba(255, 167, 38, 0.2); }

.state-physical {
  padding: 10px 14px;
  margin: 8px 0;
  background: rgba(255, 107, 107, 0.15);
  border-left: 4px solid #ff6b6b;
  border-radius: 4px;
}

.state-mental {
  padding: 10px 14px;
  margin: 8px 0;
  background: rgba(149, 117, 205, 0.15);
  border-left: 4px solid #9575cd;
  border-radius: 4px;
}

.state-colored {
  padding: 10px 14px;
  margin: 8px 0;
  border-radius: 4px;
  backdrop-filter: blur(5px);
}

.state-generic {
  padding: 6px 10px;
  margin: 4px 0;
  opacity: 0.9;
}
\`\`\`

**使用 GSAP 制作高级动画（可选）：**

\`\`\`typescript
// 使用 GSAP 制作更流畅的动画
function updateStateBarWithAnimation(stateBarHtml: string) {
  const container = $('#state-bar-container');

  // 淡出
  gsap.to(container, {
    opacity: 0,
    y: -10,
    duration: 0.2,
    onComplete: () => {
      container.html(stateBarHtml);

      // 淡入
      gsap.to(container, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });

      // 子元素依次出现
      gsap.from('.state-item', {
        opacity: 0,
        x: -20,
        duration: 0.4,
        stagger: 0.05,
        ease: 'back.out(1.2)'
      });
    }
  });
}
\`\`\`
\`\`\`

**关键点：**
- 使用 \`getChatMessages()\` 获取所有消息
- 通过正则表达式从消息文本中提取数据
- 用 jQuery 更新 DOM 元素显示
- 监听 MESSAGE_RECEIVED 事件实现自动更新

## 实现同层对话（流式传输前端界面）

**核心概念：**
同层对话是一个**独立的前端界面**（有自己的 index.html），玩家只在界面内游玩，不看酒馆主聊天。

**🚨🚨🚨 绝对禁止（否则功能完全不工作！）🚨🚨🚨**

\`\`\`javascript
// ❌❌❌ 绝对禁止！绝对禁止！绝对禁止！
$(function() {
  let chatHistory = [];           // ❌ 外部访问不到！
  function renderMessages() {}    // ❌ 外部访问不到！
  function handleSend() {}        // ❌ 外部访问不到！

  // 所有代码都在这里 ❌❌❌
});

// ✅✅✅ 必须这样写！必须这样写！必须这样写！
let chatHistory = [];              // ✅ 全局变量
function renderMessages() {}       // ✅ 全局函数
function handleSend() {}           // ✅ 全局函数

$(function() {
  // 只在这里调用函数，不定义！
  loadChatHistory();
  setupStreamListeners();
});
\`\`\`

**代码结构必须严格按以下顺序（不能改！）：**
1. 全局变量定义（let/const）
2. 全局函数定义（function）
3. \`$(function() {})\` - 只用于调用上面定义的函数
4. \`$(window).on('pagehide', ...)\` - 卸载事件

**⚠️⚠️⚠️ 第二重要的注意事项：generation_id 过滤**
同层对话的流式监听器会监听到**所有**酒馆的生成事件（包括主界面的生成）。因此**必须使用 generation_id 过滤**，否则会出现：
- 同层对话接收到主界面的 AI 回复
- 状态管理混乱，生成状态对不上
- 按钮状态异常

**实现要点：**
1. 创建**前端界面项目**（index.html + index.ts）
2. 界面内设计输入框和发送按钮
3. 点击发送时，调用 \`generate(text)\`，并**保存返回的 generation_id**
4. **监听流式传输事件**时，必须检查 \`id === currentGenerationId\`：
   - \`iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY\`: 每个 token 的增量更新
   - \`iframe_events.STREAM_TOKEN_RECEIVED_FULLY\`: 流式传输完成，获取完整文本
   - \`iframe_events.GENERATION_ENDED\`: 生成结束（备用方案）
5. 后台操作消息楼层（可选）：使用 \`setChatMessages\`、\`createChatMessages\` 配合 \`{ refresh: 'none' }\` 参数

**⚠️⚠️⚠️ 关键 API（必须使用此方法！禁止使用 generate()！）：**
- **\`triggerSlashWithResult(command)\`**: 执行 STScript 命令并获取返回值
  - 返回值：\`Promise<string>\`（AI 生成的完整文本）
  - 示例：\`const result = await triggerSlashWithResult('/gen lock=on "对话内容"');\`
  - **重要**：使用 \`/gen\` 命令会自动使用角色卡、预设、世界书
  - **关键优势**：不需要流式监听，不需要 generation_id，直接返回完整结果
- **\`getRegexScripts()\`**: 获取当前启用的正则脚本列表
  - 用于过滤思维链、调试信息等
  - **必须在显示 AI 回复前应用正则过滤**
- **构建对话历史为提示词**：将对话历史拼接成文本，而不是用 API 参数
- **\`triggerSlash(command)\`**: 执行 STScript 命令但不等待返回值

**⚠️⚠️⚠️ AI 回复的标签清理（非常重要！）：**
AI 可能会在回复中生成思维链标签，如：\`<guide>\`、\`<dream>\`、\`<plot>\`、\`<status>\`、\`<think>\` 等。
这些标签**必须在显示前移除**，否则会破坏界面效果！

**清理策略（参考梦星大佬的方案）：**
1. **优先提取正文标签**：如果 AI 用特定标签包裹正文（如 \`<gametxt>\`），优先提取
2. **备用方案**：移除所有思维链标签
3. **可选增强**：应用酒馆的全局正则和预设正则

**完整的清理函数模板（梦星方案）：**
\`\`\`typescript
// 辅助函数：提取标签内容（从后往前查找最后一个）
function extractLastTagContent(tagName: string, text: string, ignoreCase = false): string | null {
  if (!text || typeof text !== 'string') return null;

  const endTag = \`</\${tagName}>\`;
  let searchPool = text;
  let endTagPattern = endTag;

  if (ignoreCase) {
    searchPool = text.toLowerCase();
    endTagPattern = endTag.toLowerCase();
  }

  const lastEndIndex = searchPool.lastIndexOf(endTagPattern);
  if (lastEndIndex !== -1) {
    const startTag = \`<\${tagName}>\`;
    let startTagPattern = startTag;
    if (ignoreCase) startTagPattern = startTag.toLowerCase();

    const lastStartIndex = searchPool.lastIndexOf(startTagPattern, lastEndIndex);
    if (lastStartIndex !== -1) {
      const startIndex = lastStartIndex + startTag.length;
      return text.substring(startIndex, lastEndIndex).trim();
    }
  }
  return null;
}

// 主清理函数
function applyRegexFilters(text: string): string {
  console.log('🔍 开始清理，原始长度:', text.length);

  if (!text || typeof text !== 'string') return '';

  // ===== 步骤 0: 修复未闭合的标签（容错处理）=====
  // 哈基米流口水时经常不闭合标签，导致"前端失踪"、"代码暴露"等问题
  // 检测常见的未闭合标签并自动闭合
  // ⚠️ dream 和 gametxt 是正文标签，需要补齐以便提取内容
  const criticalTags = ['thinking', 'UpdateVariable', 'guide', 'plot', 'status', 'dream', 'gametxt'];
  criticalTags.forEach(tag => {
    const openTagRegex = new RegExp(\`<\${tag}([^>]*)>\`, 'gi');
    const closeTagRegex = new RegExp(\`</\${tag}>\`, 'gi');

    const openMatches = text.match(openTagRegex);
    const closeMatches = text.match(closeTagRegex);

    const openCount = openMatches ? openMatches.length : 0;
    const closeCount = closeMatches ? closeMatches.length : 0;

    if (openCount > closeCount) {
      // 有未闭合的标签，自动补齐闭合标签
      const missing = openCount - closeCount;
      console.log(\`⚠️ 发现 \${missing} 个未闭合的 <\${tag}> 标签，自动补齐\`);
      text = text + \`</\${tag}>\`.repeat(missing);
    }
  });

  // ===== 步骤 1: 优先提取正文标签（梦星方案）=====
  // 如果 AI 用特定标签包裹正文，优先提取该标签的内容
  // ⚠️⚠️⚠️ dream 是常见的正文标签！必须优先提取！
  const gameTextTags = ['dream', 'gametxt', 'output', 'display', 'text', 'content'];
  for (const tag of gameTextTags) {
    const extracted = extractLastTagContent(tag, text);
    if (extracted !== null) {
      console.log(\`✅ 提取了 <\${tag}> 标签的内容，长度:\`, extracted.length);
      return extracted; // 直接返回正文，不需要进一步清理
    }
  }

  // ===== 步骤 2: 备用方案 - 移除所有思维链标签 =====
  let cleanedText = text;

  // 常见的固定标签（注意：dream/gametxt 是正文标签，不应移除！）
  const tagsToRemove = [
    'guide', 'plot', 'status',
    'UpdateVariable', '角色提取', '本世历程', '往世涟漪'
  ];

  tagsToRemove.forEach(tag => {
    // 移除 <tag>...</tag> 结构
    const regexWithContent = new RegExp(\`<\${tag}[^>]*>[\\\\s\\\\S]*?</\${tag}>\`, 'gi');
    const before = cleanedText;
    cleanedText = cleanedText.replace(regexWithContent, '');

    // 移除自闭合的 <tag/> 结构
    const regexSelfClosing = new RegExp(\`<\${tag}\\\\s*\\\\/>\`, 'gi');
    cleanedText = cleanedText.replace(regexSelfClosing, '');

    if (before !== cleanedText) {
      console.log(\`  🧹 移除了 <\${tag}> 标签\`);
    }
  });

  // ⚠️⚠️⚠️ 特殊处理：移除所有包含 think/thinking 的标签（思维链）
  // 匹配 <xxx_think>、<thinking_xxx>、<think>、<thinking> 等所有变体
  const thinkingRegex = /<[^>]*think[^>]*>[\\\\s\\\\S]*?<\\/[^>]*think[^>]*>/gi;
  const beforeThinking = cleanedText;
  cleanedText = cleanedText.replace(thinkingRegex, '');
  if (beforeThinking !== cleanedText) {
    console.log('  🧹 移除了包含 think/thinking 的思维链标签');
  }

  // 移除自闭合的 think 标签
  const thinkingSelfClosing = /<[^>]*think[^>]*\\\\/>/gi;
  cleanedText = cleanedText.replace(thinkingSelfClosing, '');

  // 清理 HTML 注释
  cleanedText = cleanedText.replace(/<!--[\\s\\S]*?-->/g, '');

  if (cleanedText !== text) {
    console.log('✅ 标签清理完成，清理后长度:', cleanedText.length);
    text = cleanedText;
  }

  // ===== 步骤 2-3: 尝试应用酒馆正则（可选）=====
  let allRegexScripts: any[] = [];

  // 方式 1: 全局正则
  if (typeof getRegexScripts === 'function') {
    try {
      const globalRegexes = getRegexScripts();
      if (globalRegexes && globalRegexes.length > 0) {
        console.log('📋 从全局正则获取到', globalRegexes.length, '个脚本');
        allRegexScripts = allRegexScripts.concat(globalRegexes);
      }
    } catch (e) {
      console.warn('⚠️ 获取全局正则失败:', e);
    }
  }

  // 方式 2: 预设内置正则（支持 SoliUmbra 等脚本）
  try {
    const parentST = (window as any).parent?.SillyTavern || (window as any).SillyTavern;
    if (parentST && typeof parentST.getContext === 'function') {
      const context = parentST.getContext();
      const prompts = context?.chatCompletionSettings?.prompts;

      if (prompts && Array.isArray(prompts)) {
        const possibleIdentifiers = ['regexes-bindings', 'SPresetSettings', 'regex-bindings'];

        for (const identifier of possibleIdentifiers) {
          const regexPrompt = prompts.find((p: any) => p.identifier === identifier);
          if (regexPrompt?.content) {
            try {
              const data = JSON.parse(regexPrompt.content);
              let presetRegexes: any = null;

              if (Array.isArray(data)) {
                presetRegexes = data;
              } else if (data && typeof data === 'object') {
                if (data.RegexBinding?.regexes && Array.isArray(data.RegexBinding.regexes)) {
                  presetRegexes = data.RegexBinding.regexes;
                } else if (data.regexes && Array.isArray(data.regexes)) {
                  presetRegexes = data.regexes;
                }
              }

              if (presetRegexes && presetRegexes.length > 0) {
                console.log('📋 从预设内置正则获取到', presetRegexes.length, '个脚本 (identifier:', identifier + ')');
                allRegexScripts = allRegexScripts.concat(presetRegexes);
                break;
              }
            } catch (parseError) {
              console.warn('⚠️ 解析 identifier', identifier, '失败:', parseError);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ 获取预设内置正则失败:', e);
  }

  if (allRegexScripts.length > 0) {
    console.log('📋 总共获取到', allRegexScripts.length, '个正则脚本');

    // 过滤出适用于 AI 输出后处理的正则（placement 包含 2）
    // ⚠️ 只检查 disabled 和 placement，不检查 promptOnly
    // 因为有些预设正则可能没有 promptOnly 字段，或者设置不规范
    const activeScripts = allRegexScripts.filter((script: any) => {
      if (script.disabled) return false;
      if (!script.placement || !Array.isArray(script.placement)) return false;
      if (!script.placement.includes(2)) return false;
      return true;
    });

    console.log('✅ 找到', activeScripts.length, '个适用的正则脚本');

    let result = text;
    activeScripts.forEach((script: any, index: number) => {
      try {
        const regex = new RegExp(script.findRegex, 'gim');
        const beforeLength = result.length;
        result = result.replace(regex, script.replaceString || '');

        if (beforeLength !== result.length) {
          console.log('🧹 正则', index + 1, '(', script.scriptName, ') 生效');
        }
      } catch (e) {
        console.error('❌ 正则', index + 1, '应用失败:', e);
      }
    });

    text = result;
  }

  console.log('📊 最终长度:', text.length);
  return text;
}
\`\`\`

**使用方式（完整示例）：**
\`\`\`typescript
// 全局变量
let chatHistory: Array<{ role: string; content: string }> = [];
let isGenerating = false;

// 发送消息
async function handleSend() {
  const input = $('#user-input');
  const userInput = input.val().trim();
  if (!userInput || isGenerating) return;

  // 1. 添加用户消息到历史
  chatHistory.push({ role: 'user', content: userInput });
  input.val('');
  renderMessages();

  // 2. 设置生成状态
  isGenerating = true;
  $('#send-btn').prop('disabled', true).text('生成中...');

  try {
    // 3. 构建对话历史提示词
    let prompt = '';
    chatHistory.slice(-10).forEach(msg => {
      prompt += (msg.role === 'user' ? '玩家' : 'AI') + ': ' + msg.content + '\\n';
    });

    // 4. 调用 AI（不需要流式！）
    const rawResult = await triggerSlashWithResult('/gen lock=on "' + prompt.replace(/"/g, '\\\\"') + '"');

    // 5. ⭐ 关键：必须先清理标签再显示
    const cleanedResult = applyRegexFilters(rawResult);

    // 6. 添加到聊天历史并渲染
    chatHistory.push({ role: 'assistant', content: cleanedResult });
    renderMessages();
    saveChatHistory(); // 保存到酒馆变量

  } catch (error) {
    console.error('生成失败:', error);
    toastr.error('生成失败: ' + (error?.message || String(error)));
  } finally {
    isGenerating = false;
    $('#send-btn').prop('disabled', false).text('发送');
  }
}

// 渲染消息
function renderMessages() {
  const container = $('#messages');
  container.empty();

  chatHistory.forEach(msg => {
    const div = $('<div>')
      .addClass('message')
      .addClass(msg.role === 'user' ? 'user-message' : 'ai-message')
      .text(msg.content); // 使用 text() 防止 XSS
    container.append(div);
  });

  container.scrollTop(container[0].scrollHeight);
}

// 保存聊天历史
function saveChatHistory() {
  if (typeof insertOrAssignVariables === 'function') {
    insertOrAssignVariables({ chat_history: chatHistory }, { type: 'chat' });
  } else {
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }
}
\`\`\`

**⚠️ 重要说明：流式传输的正确实现方式！**

**🚨 同层对话必须使用真流式传输！🚨**

### ⭐ 真流式模式（唯一正确的实现方式）
- 使用 \`generate({ should_stream: true, generation_id })\` 启用流式
- 监听 \`iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY\` 实时接收文本
- 边接收边清理标签边显示
- ✅ 实时显示 AI 生成，无需等待，体验最佳
- ✅ 用户可以立即看到 AI 的回复，体验流畅

### ❌ 禁止使用以下方案：
- ❌ \`triggerSlashWithResult\`（需要等待全部生成，体验差）
- ❌ 打字机效果（假流式，仍需等待，不是真正的流式）
- ❌ \`generateRaw\`（不使用角色卡和预设）

**🎯 真流式模式的正确实现（强烈推荐）：**

\`\`\`typescript
// ===== 全局变量 =====
let chatHistory: Array<{ role: string; content: string }> = [];
let isGenerating = false;
let currentGenerationId: string | null = null;

// ===== 真流式监听（核心！）=====
function setupStreamListeners() {
  // ⚠️ 监听增量文本（每次接收一小段）
  eventOn(iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY, (text: string, id: string) => {
    if (!isGenerating || id !== currentGenerationId) return;

    // ⚠️⚠️⚠️ 核心！必须实时清理标签！
    const cleanedText = applyRegexFilters(text);

    // 更新 DOM（找到最后一条消息并更新）
    const container = $('#inner-messages');  // 根据实际容器 ID 修改
    const charName = SillyTavern?.name2 || 'AI';
    const lastMsg = container.find('.message:last-child');

    if (lastMsg.length && !lastMsg.hasClass('user-message')) {
      // 更新已有的 AI 消息
      lastMsg.html('<strong>' + charName + ':</strong> ' + cleanedText);
    } else {
      // 创建新的 AI 消息
      const msgDiv = $('<div>')
        .addClass('message ai-message')
        .html('<strong>' + charName + ':</strong> ' + cleanedText);
      container.append(msgDiv);
    }

    // 自动滚动到底部
    container.scrollTop(container[0].scrollHeight);
  });

  // ⚠️ 监听生成完成
  eventOn(iframe_events.GENERATION_ENDED, (text: string, id: string) => {
    if (id === currentGenerationId) {
      console.log('✅ 流式生成完成');

      // ⚠️⚠️⚠️ 核心！最后清理一次再保存到历史！
      const cleanedText = applyRegexFilters(text);

      // 保存到聊天历史
      chatHistory.push({ role: 'assistant', content: cleanedText });
      saveChatHistory();

      // 重新渲染（确保显示的是清理后的内容）
      renderMessages();

      // 重置状态
      isGenerating = false;
      currentGenerationId = null;
      $('#inner-send-btn').prop('disabled', false).text('发送');  // 根据实际按钮 ID 修改
    }
  });
}

// ===== 发送消息（真流式版本）=====
async function handleSend() {
  const input = $('#inner-input');  // 根据实际输入框 ID 修改
  const userInput = input.val().trim();
  if (!userInput || isGenerating) return;

  // 1. 添加用户消息
  chatHistory.push({ role: 'user', content: userInput });
  input.val('');
  saveChatHistory();
  renderMessages();

  // 2. 生成唯一 ID
  currentGenerationId = 'chat-' + Date.now() + '-' + Math.random().toString(36).slice(2);

  // 3. 设置生成状态
  isGenerating = true;
  $('#inner-send-btn').prop('disabled', true).text('生成中...');  // 根据实际按钮 ID 修改

  try {
    // 4. ⚠️⚠️⚠️ 核心：调用 generate 并启用流式
    await generate({
      user_input: userInput,
      should_stream: true,           // ⚠️ 必须启用流式
      generation_id: currentGenerationId,  // ⚠️ 必须传入 ID 用于事件过滤
      overrides: {
        chat_history: {
          prompts: chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        }
      }
    });

    // 注意：由于是流式，实际的文本更新是通过事件监听器实时更新的
    // GENERATION_ENDED 事件会自动保存 AI 回复到历史

  } catch (error) {
    console.error('❌ 生成失败:', error);
    toastr.error('生成失败: ' + error.message);

    // 重置状态
    isGenerating = false;
    currentGenerationId = null;
    $('#inner-send-btn').prop('disabled', false).text('发送');
  }
}

// ===== 渲染消息 =====
function renderMessages() {
  const container = $('#messages');
  container.empty();

  chatHistory.forEach((msg, index) => {
    const div = $('<div>')
      .attr('id', \\\`message-\\\${index}\\\`)  // ⚠️ 必须有 id
      .addClass('message')
      .addClass(msg.role === 'user' ? 'user-message' : 'ai-message')
      .text(msg.content);
    container.append(div);
  });

  container.scrollTop(container[0].scrollHeight);
}

// ===== 初始化 =====
$(() => {
  loadChatHistory();
  setupStreamListeners();  // ⚠️ 必须在加载时就设置监听

  $('#send-btn').on('click', handleSend);
  $('#user-input').on('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
});
\\\`\\\`\\\`

**🎨 CSS 样式（可选，添加光标效果）：**
\\\`\\\`\\\`css
.streaming {
  border-right: 2px solid #165DFF;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { border-right-color: transparent; }
  51%, 100% { border-right-color: #165DFF; }
}
\\\`\\\`\\\`

**💡 模式选择建议（重要！）：**
- **同层对话（前端界面）**：必须使用真流式模式（模式 3）⭐⭐⭐
- **脚本后台任务**：可以使用 triggerSlashWithResult（不需要流式）
- **原因**：同层对话需要实时显示 AI 生成，给用户最佳体验
- **不要用假流式！** 假流式需要等待完整生成，体验差

**🔑 真流式的关键要点：**
1. ✅ 必须调用 \`generate({ should_stream: true, generation_id: uniqueId })\`
2. ✅ 必须在加载时就设置监听：\`setupStreamListeners()\`
3. ✅ 监听事件：\`eventOn(iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY, (text, id) => ...)\`
4. ✅ 过滤 ID：确保只处理自己的 \`generation_id\`
5. ✅ 使用 \`overrides.chat_history.prompts\` 传递聊天历史

**🚨🚨🚨 最关键！必须在这些地方调用 \`applyRegexFilters\`：**
1. ⚠️ **STREAM_TOKEN_RECEIVED_INCREMENTALLY 事件中**：
   \`\`\`typescript
   const cleanedText = applyRegexFilters(text);  // 清理后再显示！
   lastMsg.html('<strong>' + charName + ':</strong> ' + cleanedText);
   \`\`\`

2. ⚠️ **GENERATION_ENDED 事件中**：
   \`\`\`typescript
   const cleanedText = applyRegexFilters(text);  // 清理后再保存！
   chatHistory.push({ role: 'assistant', content: cleanedText });
   \`\`\`

**💡 \`applyRegexFilters\` 的容错机制（四层保护）：**
1. ✅ **自动补齐未闭合的标签**（防止"前端失踪"、"代码暴露"）
2. ✅ **优先提取正文标签**（如 \`<dream>\`、\`<gametxt>\`）⭐⭐⭐ 最重要！
3. ✅ **移除思维链标签**（通配符匹配所有包含 \`think\` 的标签）
4. ✅ **应用预设正则**（支持全局正则和预设内置正则）

**🚨🚨🚨 正文标签提取（核心原理）：**
- **不同预设使用不同的正文标签**：\`<dream>\`、\`<gametxt>\`、\`<output>\` 等
- **优先提取顺序**：\`['dream', 'gametxt', 'output', 'display', 'text', 'content']\`
- **提取逻辑**：找到第一个匹配的标签，提取其内容并直接返回
- **示例**：
  \`\`\`
  原始：<guide>思维</guide><dream>正文内容</dream><plot>元数据</plot>
  提取：正文内容  ← 只保留 <dream> 里的内容！
  \`\`\`

**🎯 思维链标签处理（重点！）：**
- 思维链标签名通常包含 \`think\` 或 \`thinking\`
- 使用通配符正则：\`/<[^>]*think[^>]*>[\\s\\S]*?<\\/[^>]*think[^>]*>/gi\`
- 自动匹配所有变体：\`<think>\`、\`<thinking>\`、\`<xxx_think>\`、\`<thinking_xxx>\` 等
- 即使标签名变化，也能正确清理

**常见问题及解决方案：**
- ❌ 思考内容暴露 → \`<thinking>\` 未闭合 → 自动补齐 + 清理
- ❌ 前端失踪 → \`<UpdateVariable>\` 未闭合 → 自动补齐 + 清理
- ❌ 代码暴露 → 多余的 \`<UpdateVariable>\` → 清理所有 \`<UpdateVariable>\` 标签

**❌ 致命错误（绝对不能犯）：**
- ❌ 直接显示/保存原始 text，没有调用 \`applyRegexFilters\`
- ❌ 只在显示时清理，但保存时用原始 text
- ❌ 只在保存时清理，但显示时用原始 text
- ❌ 不设置 \`should_stream: true\`
- ❌ 不设置 \`generation_id\`（会收到所有事件）
- ❌ 不过滤 ID（会处理其他同层对话的事件）
- ❌ 不在加载时设置监听（会丢失事件）

**⚠️⚠️⚠️ 作用域问题（最常见错误！）：**
变量和函数**必须在全局作用域**定义，不能在 \`$(function() {})\` 内部！

\`\`\`javascript
// ❌ 错误示例：变量在局部作用域
$(function() {
  let chatHistory = [];  // ❌ 外部访问不到！
  function renderMessages() {}  // ❌ 外部访问不到！
});

// ✅ 正确示例：变量在全局作用域
let chatHistory = [];  // ✅ 全局可访问
function renderMessages() {}  // ✅ 全局可访问

$(function() {
  // 在这里调用上面定义的函数
  loadChatHistory();
});
\`\`\`

**📋 代码结构大纲（必须严格按此顺序！）：**

\`\`\`javascript
// index.ts 文件结构：
//
// 1️⃣ 全局变量定义区（第 1-10 行左右）
//    let chatHistory = [];
//    let isGenerating = false;
//    ...
//
// 2️⃣ 全局函数定义区（第 10-250 行左右）
//    function loadChatHistory() { ... }
//    function saveChatHistory() { ... }
//    function renderMessages() { ... }
//    function applyRegexFilters(text) { ... }  // ⚠️ 必须！用于过滤思维链
//    function handleSend() { ... }
//
// 3️⃣ jQuery 初始化区（第 250-270 行左右）
//    $(function() {
//      // 只调用函数，不定义！
//      loadChatHistory();
//      $('#btn').on('click', handleSend);
//    });
//
// 4️⃣ 卸载事件（第 270-275 行左右）
//    $(window).on('pagehide', () => { ... });
\`\`\`

**完整实现示例（必须 100% 按此结构！）：**

\`\`\`javascript
// =====================================================
// ⚠️⚠️⚠️ 以下所有代码都在全局作用域，不要放在 $(function() {}) 内！
// =====================================================

// ===== 1. 状态管理（必须在全局作用域！）=====
let chatHistory = []; // { role: 'user'|'assistant', content: string }
let isGenerating = false;

// ===== 2. 数据持久化（使用聊天变量） =====
function loadChatHistory() {
  const isInTavern = typeof getVariables === 'function';
  if (!isInTavern) {
    // 预览模式
    const saved = localStorage.getItem('inner_chat_history');
    chatHistory = saved ? JSON.parse(saved) : [];
  } else {
    // 酒馆模式：从聊天变量读取
    const data = getVariables({ type: 'chat' });
    chatHistory = data?.inner_chat_history || [];
  }
  renderMessages();
}

function saveChatHistory() {
  const isInTavern = typeof insertOrAssignVariables === 'function';
  if (!isInTavern) {
    localStorage.setItem('inner_chat_history', JSON.stringify(chatHistory));
  } else {
    insertOrAssignVariables({ inner_chat_history: chatHistory }, { type: 'chat' });
  }
}

// ===== 3. 界面渲染 =====
function renderMessages() {
  console.log('🎨 renderMessages 开始，聊天历史:', chatHistory.length, '条');

  const container = $('#inner-messages');
  console.log('📦 消息容器:', container.length > 0 ? '✅ 存在' : '❌ 不存在');

  container.empty();

  chatHistory.forEach((msg, index) => {
    // 获取显示名称
    const name = msg.role === 'user'
      ? (typeof getCurrentUser === 'function' ? getCurrentUser()?.name : null) || '{{user}}'
      : (typeof getCurrentCharacter === 'function' ? getCurrentCharacter()?.name : null) || '{{char}}';

    console.log('💬 渲染消息', index + 1, ':', msg.role, '-', name, '- 长度:', msg.content.length);

    const msgDiv = $('<div>')
      .addClass('message')
      .addClass(msg.role === 'user' ? 'user-message' : 'ai-message')
      .html('<strong>' + name + ':</strong> ' + msg.content);
    container.append(msgDiv);
  });

  console.log('✅ renderMessages 完成，容器内消息数:', container.find('.message').length);

  // 滚动到底部
  container.scrollTop(container[0].scrollHeight);
}

// ===== 4. 正则过滤（隐藏思维链等） =====
/**
 * 应用正则脚本来清理 AI 回复
 * 支持三种清理方式：
 * 1. 酒馆原生全局正则（通过 getRegexScripts）
 * 2. 预设内置正则（通过 SoliUmbra 的预设绑定脚本）
 * 3. 内置的简单标签清理（作为备用方案）
 */
function applyRegexFilters(text) {
  console.log('🔍 开始应用正则过滤，原始文本长度:', text.length);

  // ===== 步骤 0: 内置的简单标签清理（备用方案）=====
  // 清理常见的思维链标签：<guide>、<dream>、<plot>、<status>、<think> 等
  let cleanedText = text;
  const commonTags = [
    'guide', 'dream', 'plot', 'status', 'think', 'thinking',
    'thought', 'reasoning', 'analysis', 'plan', 'reflection',
    'meta', 'ooc', 'system', 'debug'
  ];

  commonTags.forEach(tag => {
    // 匹配 <tag>...</tag> 格式（包括换行）
    const regex = new RegExp(\`<\${tag}[^>]*>[\\\\s\\\\S]*?</\${tag}>\`, 'gi');
    const before = cleanedText;
    cleanedText = cleanedText.replace(regex, '');
    if (before !== cleanedText) {
      console.log(\`  🧹 内置清理: 移除了 <\${tag}> 标签\`);
    }
  });

  // 清理 HTML 注释中的调试信息
  cleanedText = cleanedText.replace(/<!--[\\s\\S]*?-->/g, '');

  // 如果内置清理生效了，先显示结果
  if (cleanedText !== text) {
    console.log('✅ 内置标签清理完成，清理后长度:', cleanedText.length);
    text = cleanedText;
  }

  // ===== 步骤 1-2: 尝试使用酒馆的正则脚本 =====
  let allRegexScripts = [];

  // 方式 1: 尝试从酒馆原生全局正则获取
  if (typeof getRegexScripts === 'function') {
    try {
      const globalRegex = getRegexScripts();
      console.log('📋 从全局正则获取到', globalRegex.length, '个脚本');
      allRegexScripts = allRegexScripts.concat(globalRegex);
    } catch (e) {
      console.warn('⚠️ 获取全局正则失败:', e);
    }
  }

  // 方式 2: 尝试从预设内置正则获取（SoliUmbra 的方案）
  // ⚠️ 同层对话在 iframe 中，需要通过 window.parent.SillyTavern.getContext() 访问
  try {
    const parentST = window.parent?.SillyTavern || window.SillyTavern;
    if (parentST && typeof parentST.getContext === 'function') {
      const context = parentST.getContext();
      const prompts = context?.chatCompletionSettings?.prompts;

      if (prompts && Array.isArray(prompts)) {
        // 尝试多个可能的 identifier（不同预设使用不同的命名）
        const possibleIdentifiers = ['regexes-bindings', 'SPresetSettings', 'regex-bindings'];

        for (const identifier of possibleIdentifiers) {
          const regexPrompt = prompts.find(p => p.identifier === identifier);
          if (regexPrompt?.content) {
            try {
              const data = JSON.parse(regexPrompt.content);
              let presetRegexes = null;

              // 处理不同的数据格式
              if (Array.isArray(data)) {
                // 直接是数组（如 regexes-bindings）
                presetRegexes = data;
              } else if (data && typeof data === 'object') {
                // 嵌套对象（如 SPresetSettings.RegexBinding.regexes）
                if (data.RegexBinding?.regexes && Array.isArray(data.RegexBinding.regexes)) {
                  presetRegexes = data.RegexBinding.regexes;
                } else if (data.regexes && Array.isArray(data.regexes)) {
                  presetRegexes = data.regexes;
                }
              }

              if (presetRegexes && presetRegexes.length > 0) {
                console.log('📋 从预设内置正则获取到', presetRegexes.length, '个脚本 (identifier:', identifier + ')');
                allRegexScripts = allRegexScripts.concat(presetRegexes);
                break; // 找到就退出循环
              }
            } catch (parseError) {
              console.warn('⚠️ 解析 identifier', identifier, '失败:', parseError);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ 获取预设内置正则失败:', e);
  }

  if (allRegexScripts.length === 0) {
    console.log('⚠️ 未找到任何正则脚本，跳过过滤');
    return text;
  }

  console.log('📋 总共获取到', allRegexScripts.length, '个正则脚本');

  // 过滤出启用的、适用于 AI 输出后处理的正则
  // placement 数组:
  //   0 = 提示词之前
  //   1 = 提示词之后（发送给 AI 之前）
  //   2 = AI 输出之后（显示给用户之前）⭐ 这是我们需要的！
  // promptOnly: true = 仅用于提示词处理
  // promptOnly: false = 用于输出后处理 ⭐ 这是我们需要的！
  const activeScripts = allRegexScripts.filter(script => {
    return !script.disabled &&
           !script.promptOnly &&  // 只要 promptOnly 为 false 的
           script.placement &&
           script.placement.includes(2);  // 只要 placement 包含 2 的（AI 输出后）
  });

  console.log('✅ 找到', activeScripts.length, '个适用的正则脚本');

  let result = text;

  // 依次应用每个正则
  activeScripts.forEach((script, index) => {
    try {
      const regex = new RegExp(script.findRegex, 'gim');
      const beforeLength = result.length;
      result = result.replace(regex, script.replaceString || '');

      if (beforeLength !== result.length) {
        console.log('🧹 正则', index + 1, '(', script.scriptName, ') 生效，移除了', beforeLength - result.length, '个字符');
      }
    } catch (e) {
      console.error('❌ 正则', index + 1, '(', script.scriptName, ') 应用失败:', e);
    }
  });

  console.log('🎯 正则过滤完成，原始长度:', text.length, '过滤后长度:', result.length);

  return result;
}

// ===== 5. 发送消息 =====
// ⚠️ 函数名必须避免与酒馆冲突（不要用 sendChatMessage）
// ⚠️ 这个函数必须在全局作用域定义！
async function handleSend() {
  const input = $('#inner-user-input');
  const text = input.val().trim();

  if (!text || isGenerating) return;

  // 添加用户消息
  chatHistory.push({ role: 'user', content: text });
  input.val('');
  renderMessages();
  saveChatHistory();

  // 设置生成状态
  isGenerating = true;
  $('#inner-send-btn').prop('disabled', true).text('生成中...');

  try {
    // ⚠️ 检查 STScript API 可用性
    if (typeof triggerSlashWithResult !== 'function') {
      throw new Error('请在酒馆中使用此功能');
    }

    // 获取用户名和角色名
    const userName = SillyTavern?.name1 || 'You';
    const charName = SillyTavern?.name2 || 'AI';

    // 构建完整的对话上下文（包含历史记录）
    let fullPrompt = '';
    if (chatHistory.length > 0) {
      fullPrompt += '【对话历史】\\n';
      chatHistory.forEach((msg) => {
        const name = msg.role === 'user' ? userName : charName;
        fullPrompt += name + ': ' + msg.content + '\\n';
      });
      fullPrompt += '\\n';
    }
    fullPrompt += userName + ': ' + text;

    console.log('🚀 开始生成，提示词长度:', fullPrompt.length);

    // ⚠️⚠️⚠️ 使用 /gen 命令（会自动使用角色卡、预设、世界书）
    const command = '/gen lock=on "' + fullPrompt.replace(/"/g, '\\\\"') + '"';
    const result = await triggerSlashWithResult(command);

    console.log('📥 AI 返回值长度:', result ? result.length : 0);

    if (result && result.length > 0) {
      // ⚠️⚠️⚠️ 应用正则过滤（隐藏思维链等调试信息）
      const cleanedResult = applyRegexFilters(result);
      console.log('🧹 正则过滤后长度:', cleanedResult.length);

      // 添加 AI 回复到历史
      chatHistory.push({ role: 'assistant', content: cleanedResult });
      saveChatHistory();
      renderMessages();
      toastr.success('回复成功');
    } else {
      toastr.warning('AI 未返回内容');
    }

  } catch (error) {
    console.error('生成失败:', error);
    toastr.error('生成失败: ' + (error?.message || String(error)));
  } finally {
    // 重置状态
    isGenerating = false;
    $('#inner-send-btn').prop('disabled', false).text('发送');
  }
}

// =====================================================
// ⚠️⚠️⚠️ 从这里开始才能用 $(function() {})，上面的代码都是全局的！
// =====================================================

// ===== 6. 初始化 =====
// ⚠️⚠️⚠️ 关键：只在这里调用函数，不要在这里定义变量和函数！
$(function() {
  // 调试输出，确保代码加载成功
  console.log('✅ 同层对话初始化开始');
  console.log('📋 chatHistory 可访问:', typeof chatHistory !== 'undefined');
  console.log('🔧 renderMessages 可访问:', typeof renderMessages === 'function');
  console.log('🔧 handleSend 可访问:', typeof handleSend === 'function');

  // ⚠️ 如果上面任何一个是 false，说明函数定义在 $(function() {}) 内部了！
  if (typeof chatHistory === 'undefined' || typeof renderMessages !== 'function') {
    console.error('❌❌❌ 严重错误：变量/函数定义在了局部作用域！');
    console.error('请检查代码，确保所有变量和函数都在 $(function() {}) 外部定义！');
    toastr.error('代码结构错误：变量作用域问题');
    return;
  }

  loadChatHistory();

  // 绑定事件
  $('#inner-send-btn').on('click', handleSend);
  $('#inner-user-input').on('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // 清空按钮
  $('#inner-clear-btn').on('click', () => {
    if (confirm('确定清空对话历史？')) {
      chatHistory = [];
      renderMessages();
      saveChatHistory();
    }
  });

  console.log('✅ 同层对话初始化完成');
  console.log('📊 消息容器:', $('#inner-messages').length > 0 ? '✅ 存在' : '❌ 不存在');
});

// ===== 7. 卸载时保存 =====
$(window).on('pagehide', () => {
  saveChatHistory();
});
\`\`\`

**HTML 结构示例（必须包含以下所有元素）：**
\`\`\`html
<div class="inner-chat-container">
  <div class="inner-chat-header">
    <h3>同层对话</h3>
    <button id="inner-clear-btn">清空</button>
  </div>

  <!-- ⚠️ 必需：消息容器，ID 必须是 inner-messages -->
  <div id="inner-messages" class="inner-messages"></div>

  <div class="inner-input-area">
    <!-- ⚠️ 必需：输入框，ID 必须是 inner-user-input -->
    <textarea id="inner-user-input" placeholder="输入消息..."></textarea>
    <!-- ⚠️ 必需：发送按钮，ID 必须是 inner-send-btn -->
    <button id="inner-send-btn">发送</button>
  </div>
</div>
\`\`\`

**⚠️ HTML 检查清单：**
- [ ] 是否有 \`id="inner-messages"\` 的消息容器？
- [ ] 是否有 \`id="inner-user-input"\` 的输入框？
- [ ] 是否有 \`id="inner-send-btn"\` 的发送按钮？
- [ ] 是否有 \`id="inner-clear-btn"\` 的清空按钮？
- [ ] ID 是否与 JS 代码中使用的完全一致？

**CSS 样式示例（必须严格遵守，确保消息正确左右对齐）：**
\`\`\`css
/* 消息容器 */
.inner-messages {
  height: 400px;
  overflow-y: auto;
  padding: 15px;
  display: flex;  /* ⚠️ 必须用 flex */
  flex-direction: column;
  gap: 10px;
}

/* 消息基础样式 */
.message {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 12px;
  word-wrap: break-word;
}

/* ⚠️ 用户消息：右对齐，蓝色 */
.user-message {
  align-self: flex-end;  /* ✅ 右对齐关键！*/
  background: #4a9eff;
  color: white;
}

/* ⚠️ AI 消息：左对齐，灰色 */
.ai-message {
  align-self: flex-start;  /* ✅ 左对齐关键！*/
  background: #2a2a2a;
  color: #e0e0e0;
}
\`\`\`

**⚠️ 关键点：**
- ID 必须用唯一前缀（\`inner-\`）
- 容器必须 \`display: flex; flex-direction: column\`
- 用户消息用 \`align-self: flex-end\` 右对齐
- AI 消息用 \`align-self: flex-start\` 左对齐

**关键 API：**
- **\`generate(prompt)\`**: **调用 AI 生成（使用当前预设、角色卡、世界书）**
- \`generateRaw(prompt)\`: 调用 AI 生成（不使用预设，纯文本生成）
- \`getVariables({ type: 'message', message_id })\`: 读取消息楼层变量
- \`insertOrAssignVariables(data, { type: 'message', message_id })\`: 保存到消息楼层变量
- \`getChatMessages()\`: 获取所有消息

**重要区别：**
- **\`generate\`**: 使用完整的角色预设，适合同层对话（推荐！）
- **\`generateRaw\`**: 不使用预设，适合纯文本生成任务

**⚠️ 关键注意事项（必读）：**
1. **作用域问题（最常见错误！80% 的问题都是这个！）**：
   - ❌ **禁止**：在 \`$(function() {})\` 内部用 \`let\`/\`const\`/\`function\` 定义变量和函数
   - ✅ **正确**：所有变量和函数都在**全局作用域**定义，\`$(function() {})\` 只用于调用
   - **验证方法**：在初始化时打印 \`console.log(typeof chatHistory)\`，应该是 \`'object'\` 而非 \`'undefined'\`

1.5. **禁止写模拟/假回复（常见多余代码！）**：
   - ❌ **禁止**：\`chatHistory.push({ role: 'assistant', content: '这是模拟回复' });\`
   - ❌ **禁止**：\`chatHistory.push({ role: 'assistant', content: '这是 AI 的回复' });\`
   - ❌ **禁止**：任何硬编码的假 AI 回复
   - ✅ **正确**：只调用 \`generate()\`，AI 回复通过 \`STREAM_TOKEN_RECEIVED_FULLY\` 事件自动接收
   - **原因**：\`generate()\` 会真正调用 AI API，不需要写假回复来测试

2. **generation_id 的正确用法（非常重要！）**：
   - ❌ 错误：\`const result = await generate(...); const id = result.generation_id;\`
   - ✅ 正确：
     \`\`\`javascript
     const myId = 'chat-' + Date.now() + '-' + Math.random().toString(36).slice(2);
     await generate({ user_input: text, generation_id: myId });
     // 监听器中的 id 参数就是 myId
     \`\`\`
   - \`generate()\` 返回 \`Promise<string>\`，不返回对象！
   - 必须自己生成唯一 ID 并传入，不是从返回值获取！

3. **这是前端界面项目，不是消息楼层嵌入！**
   - 需要创建 \`index.html\` + \`index.ts\`（前端界面项目）
   - 玩家在界面内游玩，不看酒馆主聊天
   - 后台可用 \`setChatMessages(..., { refresh: 'none' })\` 操作消息但不刷新

4. **函数命名必须避免冲突**：
   - ❌ 禁止使用 \`sendChatMessage\`（与酒馆原生函数重名！）
   - ❌ 禁止使用 \`generate\`、\`getChatMessages\` 等酒馆 API 名作为函数名
   - ✅ 使用带前缀的名称：\`handleSend\`、\`innerSendMessage\`、\`sendInnerMessage\`
   - **原因**：重名会导致调用酒馆内部函数 \`sk()\` 等，引发错误

5. **元素 ID 必须唯一**：
   - 使用 \`inner-\` 等前缀避免与酒馆冲突
   - 不要用 \`send-button\`、\`user-input\` 等常见名称
   - **验证方法**：检查 \`$('#inner-messages').length\` 应该是 1，不是 0

6. **流式传输监听（核心！最容易出错！）**：
   - ⚠️ **事件名：使用常量 \`iframe_events.XXX\`，不要用字符串 \`'iframe_events.XXX'\`**
   - ⚠️ **回调参数：是 \`(text, id)\`，不是 \`(data)\`！直接用 \`text\` 不要用 \`data.text\`**
   - ⚠️ **必须启用流式：\`generate({ user_input: text, should_stream: true, generation_id: myId })\`**
   - 使用 \`eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, (text, id) => ...)\` 获取完整回复
   - 使用 \`eventOn(iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY, (text, id) => ...)\` 获取增量更新

7. **API 使用规范**：
   - ✅ \`generate(prompt)\`：包含角色卡、预设、世界书（推荐！）
   - ✅ \`generateRaw(prompt)\`：纯文本生成，不使用预设
   - 两者都会触发流式传输事件

8. **数据持久化**：
   - 推荐使用 \`getVariables({ type: 'chat' })\` 和 \`insertOrAssignVariables(data, { type: 'chat' })\`
   - 或使用消息楼层变量：\`{ type: 'message', message_id }\`
   - 页面卸载时必须保存数据

**核心示例（必须严格遵守！）：**
\`\`\`javascript
// ========== ⚠️ 关键：流式事件监听（最容易出错！）==========

// ❌❌❌ 错误写法（禁止！）：
// eventOn('iframe_events.STREAM_TOKEN_RECEIVED_FULLY', (data) => { ... })
// ❌ 不要用字符串 'iframe_events.XXX'
// ❌ 不要用参数 (data)

// ✅✅✅ 正确写法（必须这样写！）：
eventOn(iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY, (text, id) => {
  // text 是累积的完整文本
  $('#ai-reply').text(text); // ✅ 直接用 text，不是 text.text 或 data.text
  console.log('增量更新:', text);
});

eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, (text, id) => {
  // text 是最终完整文本
  console.log('✅ 生成完成:', text); // ✅ 直接用 text
  chatHistory.push({ role: 'assistant', content: text });
  saveChatHistory();
  isGenerating = false;
  $('#send-btn').prop('disabled', false).text('发送');
});

// 备选方案：如果流式不工作，用 GENERATION_ENDED
eventOn(iframe_events.GENERATION_ENDED, (text, id) => {
  console.log('✅ 生成结束:', text);
  chatHistory.push({ role: 'assistant', content: text });
  saveChatHistory();
  isGenerating = false;
  $('#send-btn').prop('disabled', false).text('发送');
});

// ========== 发送消息 ==========
async function handleSend() {
  const userInput = $('#user-input').val();
  chatHistory.push({ role: 'user', content: userInput });

  isGenerating = true;
  $('#send-btn').prop('disabled', true).text('生成中...');

  // ✅✅✅ 必须这样调用（使用 STScript 命令）：
  const command = '/gen lock=on "' + userInput.replace(/"/g, '\\\\"') + '"';
  const result = await triggerSlashWithResult(command);

  if (result) {
    chatHistory.push({ role: 'assistant', content: result });
    renderMessages();
  }

  // ❌❌❌ 禁止使用 generate API：
  // await generate({ user_input: userInput });  // ❌ 不推荐
}
\`\`\`

**为什么用 triggerSlashWithResult？**
- 使用 \`/gen\` 命令会自动应用角色卡、预设、世界书
- 返回值直接是生成的文本，简单直接
- 不需要复杂的流式监听和 generation_id 管理

**\`/gen\` 命令说明：**
- \`/gen lock=on "提示词"\`：生成时锁定输入框（推荐！）
- 会自动使用当前角色卡、预设、世界书
- 返回值是 AI 生成的完整文本

---

# 🌊 同层对话的两种实现方式（AI 自动选择）

当用户需求中提到**"实时显示"、"打字效果"、"流式"、"边生成边显示"**时，使用**真流式方案**（方案B）。
否则，使用**简单方案**（方案A）。

## ⚠️⚠️⚠️ 必须包含的核心功能（两种方案都要有！）

### 1. 数据持久化（最重要！）
- ✅ **保存到聊天变量**：使用 \`insertOrAssignVariables({ inner_chat_history: chatHistory }, { type: 'chat' })\`
- ✅ **页面加载时恢复**：在 \`$(function() {})\` 中调用 \`loadChatHistory()\`
- ✅ **切换聊天时重新加载**：监听 \`SillyTavern.getCurrentChatId()\` 变化
- ✅ **页面卸载时保存**：在 \`$(window).on('pagehide', ...)\` 中保存
- ✅ **实时保存**：每次发送/接收消息后立即调用 \`saveChatHistory()\`

### 2. 不打断生成（关键！）
- ✅ **最小化面板不打断**：面板只是隐藏（\`display: none\`），iframe 不卸载
- ✅ **切换标签页不打断**：数据已保存到变量，切换回来自动恢复
- ✅ **刷新页面后恢复**：从聊天变量读取 \`chatHistory\`，完整恢复对话

### 3. 跨聊天隔离
- ✅ **每个聊天独立**：数据存储在 \`{ type: 'chat' }\`，不同聊天文件数据互不影响
- ✅ **切换聊天自动切换数据**：监听 \`getCurrentChatId()\` 变化，自动加载对应聊天的历史

## 📚 简单方案（triggerSlashWithResult）

**特点：** 代码简单，等待完整生成后一次性显示。

**完整实现（包含数据持久化！）：**

\`\`\`typescript
// ===== 1. 全局变量（必须在全局作用域！）=====
let chatHistory: Array<{ role: string; content: string }> = [];
let isGenerating = false;

// ===== 2. 数据持久化 =====
function loadChatHistory() {
  const isInTavern = typeof getVariables === 'function';
  if (!isInTavern) {
    const saved = localStorage.getItem('inner_chat_history');
    chatHistory = saved ? JSON.parse(saved) : [];
  } else {
    const data = getVariables({ type: 'chat' });
    chatHistory = data?.inner_chat_history || [];
  }
  renderMessages();
}

function saveChatHistory() {
  const isInTavern = typeof insertOrAssignVariables === 'function';
  if (!isInTavern) {
    localStorage.setItem('inner_chat_history', JSON.stringify(chatHistory));
  } else {
    insertOrAssignVariables({ inner_chat_history: chatHistory }, { type: 'chat' });
  }
}

// ===== 3. 正则过滤（核心！）=====
function applyRegexFilters(text: string): string {
  console.log('🔍 开始清理，原始长度:', text.length);

  if (!text || typeof text !== 'string') return '';

  // ===== 步骤 0: 修复未闭合的标签 =====
  const criticalTags = ['thinking', 'UpdateVariable', 'guide', 'plot', 'status', 'dream', 'gametxt'];
  criticalTags.forEach(tag => {
    const openTagRegex = new RegExp(\\\`<\\\${tag}([^>]*)>\\\`, 'gi');
    const closeTagRegex = new RegExp(\\\`</\\\${tag}>\\\`, 'gi');

    const openMatches = text.match(openTagRegex);
    const closeMatches = text.match(closeTagRegex);

    const openCount = openMatches ? openMatches.length : 0;
    const closeCount = closeMatches ? closeMatches.length : 0;

    if (openCount > closeCount) {
      const missing = openCount - closeCount;
      console.log(\\\`⚠️ 发现 \\\${missing} 个未闭合的 <\\\${tag}> 标签，自动补齐\\\`);
      text = text + \\\`</\\\${tag}>\\\`.repeat(missing);
    }
  });

  // ===== 步骤 1: 优先提取正文标签（梦星方案）=====
  function extractLastTagContent(tagName: string, text: string): string | null {
    if (!text || typeof text !== 'string') return null;

    const endTag = \\\`</\\\${tagName}>\\\`;
    const searchPool = text.toLowerCase();
    const endTagPattern = endTag.toLowerCase();

    const lastEndIndex = searchPool.lastIndexOf(endTagPattern);
    if (lastEndIndex !== -1) {
      const startTag = \\\`<\\\${tagName}>\\\`;
      const startTagPattern = startTag.toLowerCase();

      const lastStartIndex = searchPool.lastIndexOf(startTagPattern, lastEndIndex);
      if (lastStartIndex !== -1) {
        const startIndex = lastStartIndex + startTag.length;
        return text.substring(startIndex, lastEndIndex).trim();
      }
    }
    return null;
  }

  const gameTextTags = ['dream', 'gametxt', 'output', 'display', 'text', 'content'];
  for (const tag of gameTextTags) {
    const extracted = extractLastTagContent(tag, text);
    if (extracted !== null) {
      console.log(\\\`✅ 提取了 <\\\${tag}> 标签的内容，长度:\\\`, extracted.length);
      return extracted;
    }
  }

  // ===== 步骤 2: 移除所有思维链标签 =====
  let cleanedText = text;

  const tagsToRemove = [
    'guide', 'plot', 'status',
    'UpdateVariable', '角色提取', '本世历程', '往世涟漪'
  ];

  tagsToRemove.forEach(tag => {
    const regexWithContent = new RegExp(\\\`<\\\${tag}[^>]*>[\\\\\\\\s\\\\\\\\S]*?</\\\${tag}>\\\`, 'gi');
    const before = cleanedText;
    cleanedText = cleanedText.replace(regexWithContent, '');

    const regexSelfClosing = new RegExp(\\\`<\\\${tag}\\\\\\\\s*\\\\\\\\/>\\\`, 'gi');
    cleanedText = cleanedText.replace(regexSelfClosing, '');

    if (before !== cleanedText) {
      console.log(\\\`  🧹 移除了 <\\\${tag}> 标签\\\`);
    }
  });

  // 特殊处理：移除所有包含 think/thinking 的标签
  const thinkingRegex = /<[^>]*think[^>]*>[\\\\s\\\\S]*?<\\\\/[^>]*think[^>]*>/gi;
  const beforeThinking = cleanedText;
  cleanedText = cleanedText.replace(thinkingRegex, '');
  if (beforeThinking !== cleanedText) {
    console.log('  🧹 移除了包含 think/thinking 的思维链标签');
  }

  const thinkingSelfClosing = /<[^>]*think[^>]*\\\\/>/gi;
  cleanedText = cleanedText.replace(thinkingSelfClosing, '');

  cleanedText = cleanedText.replace(/<!--[\\s\\S]*?-->/g, '');

  if (cleanedText !== text) {
    console.log('✅ 标签清理完成，清理后长度:', cleanedText.length);
    text = cleanedText;
  }

  // ===== 步骤 3: 尝试应用酒馆正则（可选）=====
  let allRegexScripts: any[] = [];

  if (typeof getRegexScripts === 'function') {
    try {
      const globalRegexes = getRegexScripts();
      if (globalRegexes && globalRegexes.length > 0) {
        console.log('📋 从全局正则获取到', globalRegexes.length, '个脚本');
        allRegexScripts = allRegexScripts.concat(globalRegexes);
      }
    } catch (e) {
      console.warn('⚠️ 获取全局正则失败:', e);
    }
  }

  try {
    const parentST = (window as any).parent?.SillyTavern || (window as any).SillyTavern;
    if (parentST && typeof parentST.getContext === 'function') {
      const context = parentST.getContext();
      const prompts = context?.chatCompletionSettings?.prompts;

      if (prompts && Array.isArray(prompts)) {
        const possibleIdentifiers = ['regexes-bindings', 'SPresetSettings', 'regex-bindings'];

        for (const identifier of possibleIdentifiers) {
          const regexPrompt = prompts.find((p: any) => p.identifier === identifier);
          if (regexPrompt?.content) {
            try {
              const data = JSON.parse(regexPrompt.content);
              let presetRegexes: any = null;

              if (Array.isArray(data)) {
                presetRegexes = data;
              } else if (data && typeof data === 'object') {
                if (data.RegexBinding?.regexes && Array.isArray(data.RegexBinding.regexes)) {
                  presetRegexes = data.RegexBinding.regexes;
                } else if (data.regexes && Array.isArray(data.regexes)) {
                  presetRegexes = data.regexes;
                }
              }

              if (presetRegexes && presetRegexes.length > 0) {
                console.log('📋 从预设内置正则获取到', presetRegexes.length, '个脚本 (identifier:', identifier + ')');
                allRegexScripts = allRegexScripts.concat(presetRegexes);
                break;
              }
            } catch (parseError) {
              console.warn('⚠️ 解析 identifier', identifier, '失败:', parseError);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ 获取预设内置正则失败:', e);
  }

  if (allRegexScripts.length > 0) {
    console.log('📋 总共获取到', allRegexScripts.length, '个正则脚本');

    const activeScripts = allRegexScripts.filter((script: any) => {
      if (script.disabled) return false;
      if (!script.placement || !Array.isArray(script.placement)) return false;
      if (!script.placement.includes(2)) return false;
      return true;
    });

    console.log('✅ 找到', activeScripts.length, '个适用的正则脚本');

    let result = text;
    activeScripts.forEach((script: any, index: number) => {
      try {
        const regex = new RegExp(script.findRegex, 'gim');
        const beforeLength = result.length;
        result = result.replace(regex, script.replaceString || '');

        if (beforeLength !== result.length) {
          console.log('🧹 正则', index + 1, '(', script.scriptName, ') 生效');
        }
      } catch (e) {
        console.error('❌ 正则', index + 1, '应用失败:', e);
      }
    });

    text = result;
  }

  console.log('📊 最终长度:', text.length);
  return text;
}

// ===== 4. 发送消息 =====
async function handleSend() {
  const input = $('#inner-input');
  const userInput = input.val().trim();
  if (!userInput || isGenerating) return;

  chatHistory.push({ role: 'user', content: userInput });
  input.val('');
  saveChatHistory();
  renderMessages();

  isGenerating = true;
  $('#inner-send-btn').prop('disabled', true).text('生成中...');

  try {
    if (typeof triggerSlashWithResult !== 'function') {
      throw new Error('请在酒馆中使用此功能');
    }

    const userName = SillyTavern?.name1 || 'You';
    const charName = SillyTavern?.name2 || 'AI';

    let fullPrompt = '';
    if (chatHistory.length > 1) {
      fullPrompt += '【对话历史】\\n';
      chatHistory.slice(0, -1).forEach((msg) => {
        const name = msg.role === 'user' ? userName : charName;
        fullPrompt += name + ': ' + msg.content + '\\n';
      });
      fullPrompt += '\\n';
    }
    fullPrompt += userName + ': ' + userInput;

    console.log('🚀 开始生成，提示词长度:', fullPrompt.length);

    const command = '/gen lock=on "' + fullPrompt.replace(/"/g, '\\\\"') + '"';
    const result = await triggerSlashWithResult(command);

    console.log('📥 AI 返回值长度:', result ? result.length : 0);

    if (result && result.length > 0) {
      const cleanedResult = applyRegexFilters(result);
      console.log('🧹 正则过滤后长度:', cleanedResult.length);

      chatHistory.push({ role: 'assistant', content: cleanedResult });
      saveChatHistory();
      renderMessages();
      toastr.success('回复成功');
    } else {
      toastr.warning('AI 未返回内容');
    }

  } catch (error) {
    console.error('生成失败:', error);
    toastr.error('生成失败: ' + (error?.message || String(error)));
  } finally {
    isGenerating = false;
    $('#inner-send-btn').prop('disabled', false).text('发送');
  }
}

// ===== 5. 渲染消息 =====
function renderMessages() {
  const container = $('#inner-messages');
  container.empty();

  chatHistory.forEach((msg, index) => {
    const name = msg.role === 'user'
      ? (typeof getCurrentUser === 'function' ? getCurrentUser()?.name : null) || '{{user}}'
      : (typeof getCurrentCharacter === 'function' ? getCurrentCharacter()?.name : null) || '{{char}}';

    const msgDiv = $('<div>')
      .addClass('message')
      .addClass(msg.role === 'user' ? 'user-message' : 'ai-message')
      .html('<strong>' + name + ':</strong> ' + msg.content);
    container.append(msgDiv);
  });

  container.scrollTop(container[0].scrollHeight);
}

// ===== 6. 监听聊天切换（重要！）=====
let currentChatId = SillyTavern.getCurrentChatId();
if (typeof eventOn === 'function') {
  eventOn('CHAT_CHANGED', (newChatId: string) => {
    if (currentChatId !== newChatId) {
      console.log('🔄 检测到聊天切换:', currentChatId, '->', newChatId);
      currentChatId = newChatId;

      // 重新加载新聊天的历史
      loadChatHistory();

      // 重置生成状态（如果正在生成，会被打断）
      if (isGenerating) {
        isGenerating = false;
        $('#inner-send-btn').prop('disabled', false).text('发送');
        console.log('⚠️ 切换聊天，已中断生成');
      }
    }
  });
}

// ===== 7. 初始化 =====
$(function() {
  console.log('✅ 同层对话初始化开始（方案A）');
  console.log('📊 当前聊天 ID:', currentChatId);

  // 加载聊天历史（从聊天变量恢复）
  loadChatHistory();

  $('#inner-send-btn').on('click', handleSend);
  $('#inner-input').on('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  $('#inner-clear-btn').on('click', () => {
    if (confirm('确定清空对话历史？')) {
      chatHistory = [];
      renderMessages();
      saveChatHistory();
    }
  });

  console.log('✅ 同层对话初始化完成（方案A）');
  console.log('💾 已加载', chatHistory.length, '条历史消息');
});

// ===== 8. 卸载时保存 =====
$(window).on('pagehide', () => {
  console.log('💾 页面卸载，保存数据');
  saveChatHistory();
});
\`\`\`

---

## 🌊 真流式方案（generate + 事件监听）

**特点：** 实时显示 AI 打字效果，体验最佳。

**完整实现：**

\`\`\`typescript
// ===== 1. 全局变量（必须在全局作用域！）=====
let chatHistory: Array<{ role: string; content: string }> = [];
let isGenerating = false;
let currentGenerationId: string | null = null;

// ===== 2. 数据持久化（与方案A相同）=====
function loadChatHistory() {
  const isInTavern = typeof getVariables === 'function';
  if (!isInTavern) {
    const saved = localStorage.getItem('inner_chat_history');
    chatHistory = saved ? JSON.parse(saved) : [];
  } else {
    const data = getVariables({ type: 'chat' });
    chatHistory = data?.inner_chat_history || [];
  }
  renderMessages();
}

function saveChatHistory() {
  const isInTavern = typeof insertOrAssignVariables === 'function';
  if (!isInTavern) {
    localStorage.setItem('inner_chat_history', JSON.stringify(chatHistory));
  } else {
    insertOrAssignVariables({ inner_chat_history: chatHistory }, { type: 'chat' });
  }
}

// ===== 3. 正则过滤（与方案A相同）=====
function applyRegexFilters(text: string): string {
  // ... 与方案A完全相同，此处省略 ...
  // （请复制方案A中的 applyRegexFilters 完整实现）
  return text;
}

// ===== 4. 真流式监听（核心！）=====
function setupStreamListeners() {
  // ⚠️ 监听增量文本（实时更新）
  eventOn(iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY, (text: string, id: string) => {
    if (!isGenerating || id !== currentGenerationId) return;

    console.log('📥 收到增量文本，长度:', text.length);

    // ⚠️ 实时清理标签
    const cleanedText = applyRegexFilters(text);

    // 更新 DOM
    const container = $('#inner-messages');
    const charName = (typeof getCurrentCharacter === 'function' ? getCurrentCharacter()?.name : null) || '{{char}}';
    const lastMsg = container.find('.message:last-child');

    if (lastMsg.length && lastMsg.hasClass('ai-message')) {
      // 更新已有的 AI 消息
      lastMsg.html('<strong>' + charName + ':</strong> <span class="streaming">' + cleanedText + '</span>');
    } else {
      // 创建新的 AI 消息
      const msgDiv = $('<div>')
        .addClass('message ai-message')
        .html('<strong>' + charName + ':</strong> <span class="streaming">' + cleanedText + '</span>');
      container.append(msgDiv);
    }

    // 自动滚动到底部
    container.scrollTop(container[0].scrollHeight);
  });

  // ⚠️ 监听生成完成
  eventOn(iframe_events.GENERATION_ENDED, (text: string, id: string) => {
    if (id === currentGenerationId) {
      console.log('✅ 流式生成完成，长度:', text.length);

      // ⚠️ 最后清理一次再保存
      const cleanedText = applyRegexFilters(text);

      // 保存到聊天历史
      chatHistory.push({ role: 'assistant', content: cleanedText });
      saveChatHistory();

      // 重新渲染（移除光标效果）
      renderMessages();

      // 重置状态
      isGenerating = false;
      currentGenerationId = null;
      $('#inner-send-btn').prop('disabled', false).text('发送');

      toastr.success('回复完成');
    }
  });
}

// ===== 5. 发送消息（真流式版本）=====
async function handleSend() {
  const input = $('#inner-input');
  const userInput = input.val().trim();
  if (!userInput || isGenerating) return;

  // 添加用户消息
  chatHistory.push({ role: 'user', content: userInput });
  input.val('');
  saveChatHistory();
  renderMessages();

  // 生成唯一 ID
  currentGenerationId = 'chat-' + Date.now() + '-' + Math.random().toString(36).slice(2);

  // 设置生成状态
  isGenerating = true;
  $('#inner-send-btn').prop('disabled', true).text('生成中...');

  try {
    if (typeof generate !== 'function') {
      throw new Error('请在酒馆中使用此功能');
    }

    console.log('🚀 开始生成（真流式），generation_id:', currentGenerationId);

    // ⚠️ 核心：调用 generate 并启用流式
    await generate({
      user_input: userInput,
      should_stream: true,           // ⚠️ 必须启用流式
      generation_id: currentGenerationId,  // ⚠️ 必须传入 ID
      overrides: {
        chat_history: {
          prompts: chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        }
      }
    });

    // 注意：实际的文本更新是通过事件监听器实时更新的
    // GENERATION_ENDED 事件会自动保存 AI 回复到历史

  } catch (error) {
    console.error('❌ 生成失败:', error);
    toastr.error('生成失败: ' + (error?.message || String(error)));

    // 重置状态
    isGenerating = false;
    currentGenerationId = null;
    $('#inner-send-btn').prop('disabled', false).text('发送');
  }
}

// ===== 6. 渲染消息（与方案A相同）=====
function renderMessages() {
  const container = $('#inner-messages');
  container.empty();

  chatHistory.forEach((msg, index) => {
    const name = msg.role === 'user'
      ? (typeof getCurrentUser === 'function' ? getCurrentUser()?.name : null) || '{{user}}'
      : (typeof getCurrentCharacter === 'function' ? getCurrentCharacter()?.name : null) || '{{char}}';

    const msgDiv = $('<div>')
      .addClass('message')
      .addClass(msg.role === 'user' ? 'user-message' : 'ai-message')
      .html('<strong>' + name + ':</strong> ' + msg.content);
    container.append(msgDiv);
  });

  container.scrollTop(container[0].scrollHeight);
}

// ===== 7. 监听聊天切换（重要！）=====
let currentChatId = SillyTavern.getCurrentChatId();
if (typeof eventOn === 'function') {
  eventOn('CHAT_CHANGED', (newChatId: string) => {
    if (currentChatId !== newChatId) {
      console.log('🔄 检测到聊天切换:', currentChatId, '->', newChatId);
      currentChatId = newChatId;

      // 重新加载新聊天的历史
      loadChatHistory();

      // 重置生成状态（如果正在生成，会被打断）
      if (isGenerating) {
        isGenerating = false;
        currentGenerationId = null;
        $('#inner-send-btn').prop('disabled', false).text('发送');
        console.log('⚠️ 切换聊天，已中断生成');
      }
    }
  });
}

// ===== 8. 初始化 =====
$(function() {
  console.log('✅ 同层对话初始化开始（方案B - 真流式）');
  console.log('📊 当前聊天 ID:', currentChatId);

  // 加载聊天历史（从聊天变量恢复）
  loadChatHistory();

  // 设置流式监听（⚠️ 必须在加载时就设置）
  setupStreamListeners();

  $('#inner-send-btn').on('click', handleSend);
  $('#inner-input').on('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  $('#inner-clear-btn').on('click', () => {
    if (confirm('确定清空对话历史？')) {
      chatHistory = [];
      renderMessages();
      saveChatHistory();
    }
  });

  console.log('✅ 同层对话初始化完成（方案B）');
  console.log('💾 已加载', chatHistory.length, '条历史消息');
});

// ===== 9. 卸载时保存 =====
$(window).on('pagehide', () => {
  console.log('💾 页面卸载，保存数据');
  saveChatHistory();
});
\`\`\`

**CSS 样式（为方案B添加光标效果）：**

\`\`\`css
.streaming {
  border-right: 2px solid #165DFF;
  padding-right: 4px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { border-right-color: #165DFF; }
  51%, 100% { border-right-color: transparent; }
}
\`\`\`

---

## 🤖 AI 选择策略

**分析用户需求描述，自动选择合适方案：**

1. **使用真流式方案（第二种）**，如果用户提到：
   - "实时显示"、"边生成边显示"
   - "打字效果"、"流式"
   - "不想等待"、"即时反馈"
   - 或明确要求同层对话

2. **使用简单方案（第一种）**，如果：
   - 用户没有明确要求流式显示
   - 或用户说"简单的对话界面"

**⚠️ 默认推荐：** 当用户提到"同层对话"时，默认使用**真流式方案**（体验更好）。

## 需求收集与界面设计引导（重要！）

**当用户需求不够详细时，必须先引导用户补充信息，不要立即生成代码！**

### AI 交互流程（必须遵守）

**步骤1：检查用户需求是否完整**

检查用户是否明确了以下内容：
- 界面布局（对话框、输入区域、功能区的排布）
- 配色方案（深色/浅色模式、主色调）
- 特殊效果（动画、过渡效果）
- 额外功能（文件上传、语音输入、消息编辑等）

**步骤2：根据需求完整度决定输出**

### 情况A：需求不完整（用户只说了"同层对话"、"流式对话"等核心功能）

**不要立即生成代码！应该先引导用户补充需求！**

输出格式：
\`\`\`
FILE_START: NEED_MORE_INFO

你好！我看到你想要创建一个对话前端界面，核心功能包括：
- 真流式传输（实时显示 AI 生成）
- 消息历史自动管理（保存到聊天变量）
- 正文标签实时清理（过滤思维链等）

但是，为了给你生成最符合需求的界面，我需要了解更多细节：

**1. 界面布局**
- 对话框的位置和大小？
- 输入区域放在底部还是其他位置？
- 是否需要侧边栏、顶部栏或底部功能区？
- 消息列表如何滚动（自动滚动到底部？）

**2. 配色方案**
- 偏好深色模式还是浅色模式？
- 主色调偏好（蓝色、绿色、紫色等）？
- 用户消息和 AI 消息如何区分颜色？

**3. 特殊效果**
- 是否需要动画效果（淡入淡出、滑动等）？
- 消息出现时的过渡效果？
- 按钮点击、输入框聚焦的交互反馈？

**4. 额外功能**
- 是否需要文件上传功能？
- 是否需要语音输入？
- 是否需要消息编辑/删除功能？
- 是否需要清空历史按钮？
- 是否需要正则预设切换（下拉菜单或按钮组）？

---

**在你提供这些详细信息之前，我先说明一下核心功能的实现原理：**

### 核心组件结构

一个基本的对话界面包含：

1. **消息显示区**：用于渲染所有历史消息和正在进行的流式消息，支持滚动显示
2. **消息输入区**：用户输入文本的区域，通常包含发送按钮
3. **功能控制区**（可选）：切换正则预设、清除历史等功能按钮

### 真流式对话的实现机制

**流程：**
1. 用户发送消息 → 调用 \`generate({ should_stream: true, generation_id })\`
2. 监听 \`iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY\` 事件实时接收文本片段
3. 每接收一个片段 → 清理标签 → 附加到显示区（形成打字机效果）
4. 流式结束 → 保存完整的清理后消息到 \`chatHistory\` → 持久化到聊天变量

**关键点：**
- 使用 \`generation_id\` 过滤事件（避免接收其他对话的消息）
- 实时清理标签（\`applyRegexFilters\`）防止思维链暴露
- 禁用发送按钮防止用户重复发送

### 消息历史自动保存

**数据结构：**
\`\`\`javascript
let chatHistory = [
  { role: 'user', content: '用户消息', timestamp: '...' },
  { role: 'assistant', content: 'AI回复（已清理标签）', timestamp: '...' }
];
\`\`\`

**保存时机：**
- 用户消息：点击发送后立即保存
- AI 消息：流式传输完成后，清理标签再保存

**持久化：**
使用 \`insertOrAssignVariables({ inner_chat_history: chatHistory }, { type: 'chat' })\` 保存到聊天变量

### 正文标签实时清理

**\`applyRegexFilters\` 函数的核心逻辑：**
1. 自动补齐未闭合的标签（防止"前端失踪"）
2. 优先提取正文标签（\`<dream>\`、\`<gametxt>\` 等）
3. 移除思维链标签（\`<think>\`、\`<guide>\`、\`<plot>\` 等）
4. 应用酒馆全局正则和预设正则

**调用时机：**
- 流式接收时：每个片段都清理后再显示
- 保存时：完整消息清理后再保存到历史

---

**请补充上述细节，我会为你生成完整的代码！**

如果你现在不想纠结这些细节，也可以直接说"用默认设计"，我会使用以下默认配置：
- 深色模式（背景 #1a1a1a）
- 用户消息：右对齐蓝色（#4a9eff）
- AI 消息：左对齐灰色（#3a3a3a）
- 圆角设计 + 基础动画
- 自动滚动到底部

FILE_END
\`\`\`

### 情况B：需求完整（用户提供了详细的界面设计需求）

**直接生成代码！**

输出格式：
\`\`\`
FILE_START: index.html
[完整的 HTML 代码]
FILE_END

FILE_START: style.css
[完整的 CSS 代码]
FILE_END

FILE_START: script.js
[完整的 JavaScript 代码]
FILE_END
\`\`\`

### 情况C：用户明确说"用默认设计"或"简单的对话界面就行"

**使用默认设计规范生成代码**

**默认界面设计规范：**
- 深色模式（背景 #1a1a1a，消息区 #2a2a2a）
- 用户消息：右对齐，蓝色背景（#4a9eff）
- AI 消息：左对齐，灰色背景（#3a3a3a）
- 圆角设计（border-radius: 12px）
- 基础过渡动画（fadeIn/fadeOut）
- 自动滚动到底部
- 清空历史按钮
- 基础的消息列表和输入框

---

### 正则预设切换功能（可选）

如果用户明确需要支持不同的正则清理预设：

\`\`\`typescript
// 定义正则预设
const regexPresets = {
  "默认清理": [
    { pattern: /<tag1>/g, replacement: "" },
    { pattern: /\\[tag2\\]/g, replacement: "" },
  ],
  "特殊格式清理": [
    { pattern: /\\{\\{some_meta_data\\}\\}/g, replacement: "" },
  ]
};

let currentPreset = "默认清理";

function applyRegexFilters(text: string, presetName?: string): string {
  const preset = presetName || currentPreset;
  const rules = regexPresets[preset] || regexPresets["默认清理"];

  let cleanedText = text;
  rules.forEach(rule => {
    cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
  });

  // 仍然应用酒馆的全局正则
  // ... 原有逻辑 ...

  return cleanedText;
}

function switchPreset(presetName: string) {
  currentPreset = presetName;
  renderMessages(); // 重新渲染应用新预设
}
\`\`\`

**界面实现：**在顶部添加下拉菜单或按钮组切换预设

---

# 输出格式（必须严格遵守）：
只在 FILE_START 和 FILE_END 之间输出代码，不要添加任何其他文字。

**示例（创建界面时必须输出三个文件）：**

FILE_START: index.html
[完整的 HTML 代码，包含 head、body、引用 CSS 和 JS]
FILE_END

FILE_START: style.css
[完整的 CSS 样式代码]
FILE_END

FILE_START: script.js
[完整的 JavaScript 代码，使用 jQuery]
FILE_END

**⚠️ 代码规范（必须遵守）：**
1. **函数命名**：必须使用唯一前缀（如 \`inner\`、\`my\`），避免与酒馆函数重名
   - ❌ 禁止：\`sendChatMessage\`、\`generate\`、\`getChatMessages\`
   - ✅ 正确：\`innerSendMessage\`、\`handleSendMessage\`、\`sendInnerMessage\`
2. **元素 ID**：必须使用唯一前缀（如 \`inner-\`、\`my-\`）
   - ❌ 禁止：\`#send-button\`、\`#user-input\`
   - ✅ 正确：\`#inner-send-btn\`、\`#inner-user-input\`
3. **每个文件都要输出完整内容，不能省略！**

# 🔑 核心原则：优先增量修改，避免重写！
**除非用户明确要求"重写"、"从头开始"、"重新创建"，否则必须基于现有代码进行最小化修改！**

- ✅ 用户说"把按钮改成绿色" → **只输出 style.css**（只改颜色）
- ✅ 用户说"添加一个重置功能" → **只输出 script.js**（只加函数）
- ✅ 用户说"修复点击无响应" → **只输出 script.js**（只改事件）
- ❌ 禁止：因为小改动就重写整个文件！

# 输出文件策略：
## 小改动（只输出必要的文件）：
- 只修改颜色/字体/边距/动画 → **只输出 style.css**
- 只修改一个函数逻辑/修复 bug → **只输出 script.js**
- 只添加一个按钮/输入框 → **只输出 index.html**
- 只修改文案/标签内容 → **只输出 index.html**

## 大改动（输出所有相关文件）：
- 创建新界面/新功能 → **输出 index.html、style.css、script.js**
- 重构整体布局/完全重设计 → **输出所有文件**
- 添加需要新样式和新逻辑的复杂功能 → **输出相关的所有文件**

# 其他规则：
1. **⚠️ 数据持久化：涉及用户数据必须使用 getVariables/insertOrAssignVariables！**
2. **⚠️ 预览兼容：必须检测 \`typeof SillyTavern !== 'undefined'\`，预览模式下用 localStorage 替代酒馆 API**
3. 必须输出完整内容，即使文件很长也不能省略（但优先只输出需要修改的文件）
4. 不要在代码外添加任何解释文字
5. CSS 要美观且符合现代设计
6. JavaScript 使用 \`$(function() { ... })\` 确保 DOM 加载
7. 数据存储：\`{ type: 'chat' }\` 绑定聊天，\`{ type: 'global' }\` 为全局
8. 保持现有代码的命名风格、缩进、格式，不要随意重构`;

    const currentFiles = proj.files.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');
    const userPrompt = `# 当前项目文件：
${currentFiles}

# 用户需求：
${aiPrompt.value}

# ⚠️ 核心提醒：
1. **优先增量修改**：除非用户明确要求重写，否则基于现有代码最小化修改
2. **只输出需要改的文件**：小改动只输出 1 个文件，大改动才输出多个
3. **保持代码风格一致**：不要随意重构现有代码
4. **数据持久化**：使用 getVariables/insertOrAssignVariables

请严格按 system 中的格式输出，不要添加解释！`;

    // 流式传输或普通请求
    streamingText.value = ''; // 重置流式文本
    let resultText = '';

    progressDialogRef.value?.setProgress(25);
    progressDialogRef.value?.setMessage('正在发送请求到 AI 服务器...');
    await new Promise(r => setTimeout(r, 100)); // 等待 DOM 更新

    if (enableStream.value) {
      // 流式传输
      progressDialogRef.value?.setProgress(30);
      progressDialogRef.value?.setMessage('等待 AI 流式响应...');
      await new Promise(r => setTimeout(r, 100)); // 等待 DOM 更新

      const response = await fetch(normalizedEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          stream: true, // 启用流式传输
        }),
      });

      if (!response.ok) {
        let errorMsg = `API 请求失败: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('API 错误详情:', errorData);
          errorMsg += `\n${JSON.stringify(errorData, null, 2)}`;
        } catch (e) {
          console.error('无法解析错误响应');
        }
        throw new Error(errorMsg);
      }

      // 读取流式数据
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content || '';
              if (content) {
                resultText += content;
                streamingText.value += content;
                chunkCount++;

                // 动态更新进度（30% → 60%）
                const progress = Math.min(60, 30 + chunkCount / 10);
                progressDialogRef.value?.setProgress(progress);

                // 每10个chunk更新一次消息
                if (chunkCount % 10 === 0) {
                  progressDialogRef.value?.setMessage(`正在接收 AI 响应... (${resultText.length} 字符)`);
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } else {
      // 普通请求（非流式）
      progressDialogRef.value?.setProgress(30);
      progressDialogRef.value?.setMessage('等待 AI 响应...');
      await new Promise(r => setTimeout(r, 100)); // 等待 DOM 更新

      const response = await fetch(normalizedEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        let errorMsg = `API 请求失败: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('API 错误详情:', errorData);
          errorMsg += `\n${JSON.stringify(errorData, null, 2)}`;
        } catch (e) {
          console.error('无法解析错误响应');
        }
        throw new Error(errorMsg);
      }

      progressDialogRef.value?.setProgress(60);
      progressDialogRef.value?.setMessage('正在接收 AI 响应...');

      const data = await response.json();
      resultText = data.choices?.[0]?.message?.content || '';
    }

    progressDialogRef.value?.setProgress(75);
    progressDialogRef.value?.setMessage('正在解析 AI 生成的代码...');

    console.log('AI 原始回复:', resultText);
    console.log('AI 回复长度:', resultText.length);

    if (!resultText || resultText.trim().length === 0) {
      throw new Error('AI 返回内容为空，请检查 API 配置或重试');
    }

    // 解析特殊格式（支持多种格式）
    const changes: AIChange[] = [];
    // 支持：FILE_START: filename\n...FILE_END 或 FILE_START:filename\n...FILE_END
    const fileRegex = /FILE_START:\s*(.+?)[\r\n]+([\s\S]*?)FILE_END/gi;
    let match;

    console.log('开始解析 AI 返回内容...');

    // 检查是否是需求收集引导（特殊情况）
    const needMoreInfoMatch = resultText.match(/FILE_START:\s*NEED_MORE_INFO\s*[\r\n]+([\s\S]*?)FILE_END/i);
    if (needMoreInfoMatch) {
      const guideContent = needMoreInfoMatch[1].trim();
      console.log('🤖 AI 需要更多信息，显示引导内容');

      // 关闭 AI 对话框
      closeAIDialog();

      // 显示引导内容
      toastr.info('AI 需要更多信息', '', { timeOut: 3000 });

      // 使用alert显示引导内容
      alert(guideContent);

      // 不抛出错误，正常结束
      aiGenerating.value = false;
      return;
    }

    while ((match = fileRegex.exec(resultText)) !== null) {
      const path = match[1].trim();
      const content = match[2].trim();

      console.log(`找到文件: ${path}, 内容长度: ${content.length}`);

      const file = proj.files.find(f => f.path === path);
      if (file) {
        changes.push({
          path: path,
          oldContent: file.content,
          newContent: content,
        });
      } else {
        console.warn(`文件 ${path} 不存在于项目中，已忽略`);
      }
    }

    if (changes.length === 0) {
      console.error('未能从 AI 回复中解析出文件修改');
      console.error('AI 返回内容预览:', resultText.substring(0, 500));

      // 检查是否因为内容被截断
      if (resultText.length < 500 || !resultText.includes('FILE_END')) {
        throw new Error(
          `AI 返回内容被截断（仅 ${resultText.length} 字符）。请在"设置"中增加 max_tokens（建议 4000 以上），然后重试。`,
        );
      }

      throw new Error('AI 未返回有效的文件修改格式。请确保 AI 返回的内容包含 FILE_START 和 FILE_END 标记。');
    }

    console.log('解析到的修改:', changes.length, '个文件');

    progressDialogRef.value?.setProgress(85);
    progressDialogRef.value?.setMessage('正在准备对比预览...');

    // 检测是否可能被截断
    if (changes.length === 1 && changes[0].path === 'index.html') {
      toastr.warning('AI 可能只生成了 HTML，建议重新生成或手动补充 CSS/JS');
    }

    // 检测回复是否完整（最后一个文件应该有 FILE_END）
    const lastFile = resultText.trim().split('FILE_START').pop() || '';
    if (!lastFile.includes('FILE_END')) {
      toastr.error('AI 回复可能被截断，建议简化需求或重试');
    }

    const result = { changes };

    if (!result.changes || !Array.isArray(result.changes)) {
      throw new Error('AI 返回格式错误');
    }

    // 构建对比数据
    aiChanges.value = result.changes;

    progressDialogRef.value?.setProgress(95);
    progressDialogRef.value?.setMessage(`正在生成预览... (${changes.length} 个文件)`);

    closeAIDialog();
    showComparison.value = true;
    previewMode.value = 'after';

    // 完成
    progressDialogRef.value?.setProgress(100);
    progressDialogRef.value?.setMessage('✅ AI 生成完成！');

    setTimeout(() => {
      showProgress.value = false;
      toastr.success(`✅ AI 生成完成！已更新 ${changes.length} 个文件`);
    }, 800);
  } catch (error: any) {
    console.error('AI 生成失败:', error);
    showProgress.value = false;

    // 检测 CORS 错误
    const errorMessage = error.message || String(error);
    if (
      errorMessage.includes('CORS') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('Access-Control-Allow-Origin')
    ) {
      toastr.error(
        `⚠️ CORS 错误：无法访问 API\n\n` +
          `原因：API 服务器（${new URL(normalizedEndpoint).origin}）未配置 CORS 头\n\n` +
          `解决方案：\n` +
          `1. 在 API 服务器配置 CORS\n` +
          `2. 或使用支持 CORS 的 API 端点\n` +
          `3. 或通过酒馆的 API 代理功能调用`,
      );
    } else if (errorMessage.includes('307') || errorMessage.includes('Temporary Redirect')) {
      toastr.error(
        `⚠️ URL 重定向错误\n\n` +
          `端点：${normalizedEndpoint}\n\n` +
          `可能原因：URL 格式不正确\n` +
          `请检查端点设置，确保格式为：https://服务器/v1`,
      );
    } else {
      toastr.error(`AI 生成失败: ${errorMessage}`);
    }
  } finally {
    aiGenerating.value = false;
  }
}

function acceptChanges() {
  const proj = currentProject.value;
  if (!proj) return;

  // 保存到历史
  const historyRecord: AIHistoryRecord = {
    timestamp: new Date().toISOString(),
    prompt: aiPrompt.value,
    changes: aiChanges.value,
  };

  if (!aiHistory.value[currentId.value]) {
    aiHistory.value[currentId.value] = [];
  }
  aiHistory.value[currentId.value].unshift(historyRecord);
  console.log('添加 AI 历史记录，当前项目历史数:', aiHistory.value[currentId.value].length);

  // 应用更改
  aiChanges.value.forEach(change => {
    const file = proj.files.find(f => f.path === change.path);
    if (file) {
      file.content = change.newContent;
    }
  });

  // 立即保存
  saveToChatVar();
  updatePreview();

  // 更新当前编辑器
  if (currentFile.value) {
    const file = proj.files.find(f => f.path === currentFile.value);
    if (file) {
      code.value = file.content;
    }
  }

  showComparison.value = false;
  aiChanges.value = [];
  toastr.success('更改已应用');
}

function rejectChanges() {
  showComparison.value = false;
  aiChanges.value = [];
  toastr.info('已拒绝更改');
}

function showHistoryDialog() {
  showHistory.value = true;
}

function closeHistoryDialog() {
  showHistory.value = false;
}

function restoreHistory(record: AIHistoryRecord) {
  if (!confirm(`确定要恢复到这个历史版本吗？\n\n"${record.prompt}"\n\n当前的修改将被覆盖。`)) {
    return;
  }

  const proj = currentProject.value;
  if (!proj) return;

  // 恢复文件内容
  record.changes.forEach(change => {
    const file = proj.files.find(f => f.path === change.path);
    if (file) {
      file.content = change.newContent;
    }
  });

  console.log('恢复历史版本:', record.prompt);

  // 立即保存
  saveToChatVar();
  updatePreview();

  // 更新当前编辑器
  if (currentFile.value) {
    const file = proj.files.find(f => f.path === currentFile.value);
    if (file) {
      code.value = file.content;
    }
  }

  closeHistoryDialog();
  toastr.success('已恢复到历史版本');
}

function exportToRegex() {
  const proj = currentProject.value;
  if (!proj) {
    toastr.error('请先选择一个项目');
    return;
  }

  // 提醒用户先手动保存
  const fileObj = proj.files.find(f => f.name === currentFile.value);
  if (fileObj && code.value !== fileObj.content) {
    const shouldContinue = confirm('检测到有未保存的修改，建议先手动保存。\n\n是否继续导出（将使用上次保存的版本）？');
    if (!shouldContinue) {
      return;
    }
  }

  // 弹出对话框让用户输入触发词
  const triggerWord = prompt(
    `正在导出项目：${proj.name}\n\n请输入触发词（正则表达式）：\n例如：【开场白】 或 /开场白/g`,
    `【${proj.name}】`,
  );
  if (!triggerWord) {
    toastr.info('已取消导出');
    return;
  }

  try {
    // 构建完整的 HTML（此时 proj.files 已经是最新的了，因为上面自动保存了）
    const fullHtml = buildPreviewFromFiles(proj.files);

    // 生成 UUID
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    // 构建正则 JSON
    // 1. 去除 Windows 的 \r
    // 2. 去掉 <!DOCTYPE html>\n，直接从 <html> 开始
    // 3. 格式：```html\n\n<html>...</html>\n```
    let cleanHtml = fullHtml.replace(/\r/g, '');
    cleanHtml = cleanHtml.replace(/^<!DOCTYPE html>\n/, '');

    const regexJson = {
      id: uuid,
      scriptName: proj.name,
      findRegex: triggerWord.startsWith('/') ? triggerWord : `/${triggerWord}/g`,
      replaceString: '```html\n\n' + cleanHtml + '\n```',
      trimStrings: [],
      placement: [1, 2],
      disabled: false,
      markdownOnly: true,
      promptOnly: false,
      runOnEdit: true,
      substituteRegex: 0,
      minDepth: null,
      maxDepth: null,
    };

    // 创建下载链接
    const dataStr = JSON.stringify(regexJson, null, 4);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${proj.name}_regex.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('导出的正则 JSON:', regexJson);
    toastr.success(`项目 "${proj.name}" 已导出为正则 JSON`);
  } catch (error: any) {
    console.error('导出失败:', error);
    toastr.error(`导出失败: ${error.message}`);
  }
}

function openInNewWindow() {
  if (!previewHtml.value) {
    toastr.error('没有可预览的内容');
    return;
  }

  const proj = currentProject.value;
  const windowTitle = proj ? proj.name : '预览';

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
</script>

<style scoped>
/* 光标闪烁动画 */
@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.project-tab {
  padding: 25px !important;
  background: #1a1a1a !important;
}

/* 滚动条样式 */
.project-tab ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.project-tab ::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.project-tab ::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.project-tab ::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}
</style>
