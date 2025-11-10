<template>
  <div class="settings-tab" style="padding: 25px !important; background: #1a1a1a !important">
    <!-- API 配置 -->
    <div
      class="config-section"
      style="padding: 20px 25px !important; border-bottom: 1px solid #3a3a3a; margin-bottom: 5px"
    >
      <div
        style="
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 18px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        "
        @click="toggleSection('api')"
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(42, 42, 42, 0.98) 0%, rgba(50, 50, 50, 0.95) 50%, rgba(42, 42, 42, 0.98) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'translateX(4px) scale(1.005)';
          ($event.currentTarget as HTMLElement).style.borderLeft = '3px solid rgba(255, 193, 7, 0.6)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(38, 38, 38, 0.9) 50%, rgba(30, 30, 30, 0.95) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.borderLeft = '1px solid rgba(255, 255, 255, 0.06)';
        "
      >
        <h3
          style="
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          "
        >
          <i class="fa-solid fa-cog" style="color: #17a2b8; font-size: 18px"></i>
          API 配置
        </h3>
        <i
          :class="expandedSections['api'] ? 'fa-chevron-up' : 'fa-chevron-down'"
          class="fa-solid"
          style="color: rgba(255, 255, 255, 0.6); font-size: 14px; transition: transform 0.3s"
        ></i>
      </div>

      <div v-show="expandedSections['api']">
        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">API 提供商</label>
          <select
            v-model="settings.api_provider"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
              cursor: pointer;
            "
            @change="handleProviderChange"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini AI Studio</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">
            API 端点
            <span style="color: #888; font-size: 11px; margin-left: 8px"> (兼容酒馆格式，填写 base URL 即可) </span>
          </label>
          <input
            v-model="settings.api_endpoint"
            type="text"
            placeholder="https://你的服务器/v1"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
          <div
            style="
              margin-top: 8px;
              padding: 8px 12px;
              background: rgba(74, 158, 255, 0.1);
              border-radius: 4px;
              border-left: 3px solid #4a9eff;
            "
          >
            <div style="color: #4a9eff; font-size: 12px; font-weight: bold; margin-bottom: 4px">
              📌 常见端点示例（与酒馆格式一致）：
            </div>
            <div style="color: #999; font-size: 11px; line-height: 1.6">
              • <strong>OpenAI 官方:</strong> https://api.openai.com/v1<br />
              • <strong>Gemini AI Studio:</strong> https://generativelanguage.googleapis.com/v1beta/openai/<br />
              • <strong>NewAPI / One API:</strong> https://你的服务器/v1<br />
              • <strong>本地模型 (Ollama):</strong> http://localhost:11434/v1<br />
              💡 <strong>提示：</strong>会自动补全 /chat/completions，也可以直接填完整路径
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">API Key</label>
          <input
            v-model="settings.api_key"
            type="password"
            placeholder="sk-..."
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
        </div>

        <div class="form-group">
          <div class="model-controls" style="display: flex; flex-direction: column; gap: 10px">
            <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">
              模型名称
              <span v-if="available_models.length === 0" style="color: #888; font-size: 11px; margin-left: 8px">
                (手动输入模型名称，如 gpt-4o-mini)
              </span>
            </label>
            <div class="button-group" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 5px">
              <button
                :disabled="loading_models"
                class="fetch-button"
                style="
                  flex: 1;
                  min-width: 120px;
                  padding: 12px 16px;
                  border: none;
                  border-radius: 12px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 13px;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                  background: #4a9eff;
                  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
                  color: white;
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(74, 158, 255, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(74, 158, 255, 0.3)'"
                @click="handle_fetch_models"
              >
                {{ loading_models ? '拉取中...' : '🔍 拉取模型列表' }}
              </button>
              <button
                class="save-button"
                style="
                  flex: 1;
                  min-width: 120px;
                  padding: 12px 16px;
                  border: none;
                  border-radius: 12px;
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 13px;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                  background: #51cf66;
                  box-shadow: 0 2px 8px rgba(81, 207, 102, 0.3);
                  color: white;
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(81, 207, 102, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(81, 207, 102, 0.3)'"
                @click="handleSaveApiConfig"
              >
                💾 保存配置
              </button>
            </div>
          </div>
          <input
            v-if="available_models.length === 0"
            v-model="settings.model"
            type="text"
            placeholder="gpt-4o-mini 或 deepseek-chat 等"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
          <select
            v-else
            v-model="settings.model"
            class="model-select"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          >
            <option v-for="model in available_models" :key="model" :value="model">{{ model }}</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px"
            >最大 Token 数（建议4000以上获得更详细的总结）</label
          >
          <input
            v-model.number="settings.max_tokens"
            type="number"
            min="100"
            max="16000"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
        </div>

        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">
            Temperature (温度) <span style="color: #888; font-size: 11px">(0-2，推荐 0.7)</span>
          </label>
          <input
            v-model.number="settings.temperature"
            type="number"
            min="0"
            max="2"
            step="0.1"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
          <div style="margin-top: 4px; color: #888; font-size: 11px">
            较高值（如 0.8）使输出更随机，较低值（如 0.2）使其更确定
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">
            Top P (核采样) <span style="color: #888; font-size: 11px">(0-1，推荐 1.0)</span>
          </label>
          <input
            v-model.number="settings.top_p"
            type="number"
            min="0"
            max="1"
            step="0.01"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
          <div style="margin-top: 4px; color: #888; font-size: 11px">
            ⚠️ 一般建议只改 Temperature 或 Top P，不要同时修改
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">
            Presence Penalty (存在惩罚) <span style="color: #888; font-size: 11px">(-2.0 to 2.0，推荐 0)</span>
          </label>
          <input
            v-model.number="settings.presence_penalty"
            type="number"
            min="-2"
            max="2"
            step="0.1"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
          <div style="margin-top: 4px; color: #888; font-size: 11px">
            正值根据标记是否出现过来惩罚，增加讨论新主题的可能性
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">
            Frequency Penalty (频率惩罚) <span style="color: #888; font-size: 11px">(-2.0 to 2.0，推荐 0)</span>
          </label>
          <input
            v-model.number="settings.frequency_penalty"
            type="number"
            min="-2"
            max="2"
            step="0.1"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
          <div style="margin-top: 4px; color: #888; font-size: 11px">
            正值根据标记频率来惩罚，降低逐字重复同一行的可能性
          </div>
        </div>
      </div>
    </div>

    <!-- 自动总结 -->
    <div
      class="config-section"
      style="padding: 20px 25px !important; border-bottom: 1px solid #3a3a3a; margin-bottom: 5px"
    >
      <div
        style="
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 18px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        "
        @click="toggleSection('autoSummary')"
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(42, 42, 42, 0.98) 0%, rgba(50, 50, 50, 0.95) 50%, rgba(42, 42, 42, 0.98) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'translateX(4px) scale(1.005)';
          ($event.currentTarget as HTMLElement).style.borderLeft = '3px solid rgba(255, 193, 7, 0.6)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(38, 38, 38, 0.9) 50%, rgba(30, 30, 30, 0.95) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.borderLeft = '1px solid rgba(255, 255, 255, 0.06)';
        "
      >
        <h3
          style="
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          "
        >
          <i class="fa-solid fa-bolt" style="color: #ffc107; font-size: 18px"></i>
          自动总结
        </h3>
        <i
          :class="expandedSections['autoSummary'] ? 'fa-chevron-up' : 'fa-chevron-down'"
          class="fa-solid"
          style="color: rgba(255, 255, 255, 0.6); font-size: 14px; transition: transform 0.3s"
        ></i>
      </div>

      <div v-show="expandedSections['autoSummary']">
        <div class="form-group" style="margin-bottom: 18px !important">
          <label
            class="checkbox-label"
            style="display: flex; align-items: center; gap: 10px; color: #ccc; font-size: 13px; cursor: pointer"
          >
            <input
              v-model="settings.auto_summarize_enabled"
              type="checkbox"
              style="width: 18px; height: 18px; cursor: pointer; accent-color: #4a9eff; border-radius: 4px"
            />
            启用自动总结
          </label>
        </div>
        <div v-if="settings.auto_summarize_enabled" class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">每多少楼层总结一次</label>
          <input
            v-model.number="settings.summarize_interval"
            type="number"
            min="1"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
          <div style="margin-top: 10px; display: flex; gap: 10px">
            <button
              style="
                padding: 8px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              "
              onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'"
              @click="handleSaveSettings"
            >
              💾 保存设置
            </button>
            <button
              style="
                padding: 8px 16px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              "
              onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'"
              @click="handleReloadSettings"
            >
              🔄 重新加载
            </button>
            <button
              style="
                padding: 8px 16px;
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              "
              onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'"
              @click="handleResetAutoSummaryStart"
            >
              🔄 重置起始楼层
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 手动总结 -->
    <div
      class="config-section"
      style="padding: 20px 25px !important; border-bottom: 1px solid #3a3a3a; margin-bottom: 5px"
    >
      <div
        style="
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 18px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        "
        @click="toggleSection('manualSummary')"
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(42, 42, 42, 0.98) 0%, rgba(50, 50, 50, 0.95) 50%, rgba(42, 42, 42, 0.98) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'translateX(4px) scale(1.005)';
          ($event.currentTarget as HTMLElement).style.borderLeft = '3px solid rgba(255, 193, 7, 0.6)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(38, 38, 38, 0.9) 50%, rgba(30, 30, 30, 0.95) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.borderLeft = '1px solid rgba(255, 255, 255, 0.06)';
        "
      >
        <h3
          style="
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          "
        >
          <i class="fa-solid fa-pen-to-square" style="color: #28a745; font-size: 18px"></i>
          手动总结
        </h3>
        <i
          :class="expandedSections['manualSummary'] ? 'fa-chevron-up' : 'fa-chevron-down'"
          class="fa-solid"
          style="color: rgba(255, 255, 255, 0.6); font-size: 14px; transition: transform 0.3s"
        ></i>
      </div>

      <div v-show="expandedSections['manualSummary']">
        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">开始楼层</label>
          <input
            v-model.number="settings.start_message_id"
            type="number"
            min="0"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
        </div>
        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">结束楼层</label>
          <input
            v-model.number="settings.end_message_id"
            type="number"
            min="0"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
        </div>
        <div class="button-group" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 5px">
          <button
            class="action-button test-button"
            :disabled="is_summarizing"
            style="
              flex: 1;
              min-width: 120px;
              padding: 12px 16px;
              border: 1px solid #4a4a4a;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              font-size: 13px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #3a3a3a;
              color: #e0e0e0;
            "
            @click="handle_test_connection"
          >
            <i class="fa-solid fa-plug"></i> 测试连接
          </button>
          <button
            class="action-button summarize-button"
            :disabled="is_summarizing || !settings.api_key"
            style="
              flex: 1;
              min-width: 120px;
              padding: 12px 16px;
              border: 1px solid #5aaeff;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              font-size: 13px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: linear-gradient(135deg, #4a9eff 0%, #3a8edf 100%);
              box-shadow:
                0 2px 8px rgba(74, 158, 255, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
              color: white;
            "
            @click="handle_summarize"
          >
            <i v-if="!is_summarizing" class="fa-solid fa-magic"></i>
            <i v-else class="fa-solid fa-spinner fa-spin"></i>
            {{ is_summarizing ? '正在总结...' : '手动总结' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 表格生成 -->
    <div
      class="config-section"
      style="padding: 20px 25px !important; border-bottom: 1px solid #3a3a3a; margin-bottom: 5px"
    >
      <div
        style="
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 18px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        "
        @click="toggleSection('tableGeneration')"
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(42, 42, 42, 0.98) 0%, rgba(50, 50, 50, 0.95) 50%, rgba(42, 42, 42, 0.98) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'translateX(4px) scale(1.005)';
          ($event.currentTarget as HTMLElement).style.borderLeft = '3px solid rgba(255, 193, 7, 0.6)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(38, 38, 38, 0.9) 50%, rgba(30, 30, 30, 0.95) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.borderLeft = '1px solid rgba(255, 255, 255, 0.06)';
        "
      >
        <h3
          style="
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          "
        >
          <i class="fa-solid fa-table" style="color: #6f42c1; font-size: 18px"></i>
          表格生成
        </h3>
        <i
          :class="expandedSections['tableGeneration'] ? 'fa-chevron-up' : 'fa-chevron-down'"
          class="fa-solid"
          style="color: rgba(255, 255, 255, 0.6); font-size: 14px; transition: transform 0.3s"
        ></i>
      </div>

      <div v-show="expandedSections['tableGeneration']">
        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">开始楼层</label>
          <input
            v-model.number="settings.table_start_message_id"
            type="number"
            min="0"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
        </div>
        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">结束楼层</label>
          <input
            v-model.number="settings.table_end_message_id"
            type="number"
            min="0"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
        </div>
        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">表格列头模板</label>
          <div style="display: flex; gap: 8px; margin-bottom: 8px">
            <select
              v-model="selectedTemplate"
              style="
                flex: 1;
                padding: 8px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
              "
              @change="loadTemplate"
            >
              <option value="">选择模板...</option>
              <option v-for="(template, index) in headerTemplates" :key="index" :value="index">
                {{ template.name }}
              </option>
            </select>
            <button
              style="
                padding: 8px 12px;
                background: #4a9eff;
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 12px;
                white-space: nowrap;
              "
              @click="showAddTemplateDialog"
            >
              <i class="fa-solid fa-plus"></i> 添加
            </button>
          </div>
          <div v-if="selectedTemplate !== ''" style="display: flex; gap: 8px">
            <input
              v-model="currentTemplate.name"
              type="text"
              placeholder="模板名称"
              style="
                flex: 1;
                padding: 8px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
              "
            />
            <input
              v-model="currentTemplate.headers"
              type="text"
              placeholder="列头（用逗号分隔）"
              style="
                flex: 2;
                padding: 8px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #e0e0e0;
                font-size: 13px;
              "
            />
            <button
              style="
                padding: 8px 12px;
                background: #28a745;
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 12px;
                white-space: nowrap;
              "
              @click="saveTemplate"
            >
              <i class="fa-solid fa-save"></i> 保存
            </button>
            <button
              style="
                padding: 8px 12px;
                background: #dc3545;
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 12px;
                white-space: nowrap;
              "
              @click="deleteTemplate"
            >
              <i class="fa-solid fa-trash"></i> 删除
            </button>
          </div>
        </div>

        <!-- 生成状态显示 -->
        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px">生成状态</label>
          <div style="display: flex; gap: 12px; align-items: center">
            <div style="display: flex; align-items: center; gap: 6px">
              <div
                :style="{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: is_summarizing ? '#ff6b6b' : '#4caf50',
                  transition: 'background-color 0.3s',
                }"
              ></div>
              <span style="color: #ccc; font-size: 12px">总结生成</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px">
              <div
                :style="{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: is_generating_table ? '#ff6b6b' : '#4caf50',
                  transition: 'background-color 0.3s',
                }"
              ></div>
              <span style="color: #ccc; font-size: 12px">表格生成</span>
            </div>
            <div v-if="is_summarizing || is_generating_table" style="margin-left: auto">
              <button
                style="
                  padding: 4px 8px;
                  background: #dc3545;
                  border: none;
                  border-radius: 4px;
                  color: white;
                  cursor: pointer;
                  font-size: 11px;
                "
                @click="stopGeneration"
              >
                <i class="fa-solid fa-stop"></i> 停止生成
              </button>
            </div>
          </div>
        </div>

        <div class="button-group" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 5px">
          <button
            class="action-button summarize-button"
            :disabled="is_generating_table || !settings.api_key"
            style="
              flex: 1;
              min-width: 120px;
              padding: 12px 16px;
              border: none;
              border-radius: 12px;
              cursor: pointer;
              font-weight: 500;
              font-size: 13px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #4a9eff;
              box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
              color: white;
            "
            @click="handle_generate_table"
          >
            <i v-if="!is_generating_table" class="fa-solid fa-robot"></i>
            <i v-else class="fa-solid fa-spinner fa-spin"></i>
            {{ is_generating_table ? 'AI填充中...' : 'AI填充表格' }}
          </button>
          <button
            class="action-button create-button"
            style="
              flex: 1;
              min-width: 120px;
              padding: 12px 16px;
              border: none;
              border-radius: 12px;
              cursor: pointer;
              font-weight: 500;
              font-size: 13px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #51cf66;
              box-shadow: 0 2px 8px rgba(81, 207, 102, 0.3);
              color: white;
            "
            @click="handle_create_table"
          >
            <i class="fa-solid fa-plus"></i> 创建空表格
          </button>
        </div>
      </div>
    </div>

    <!-- 楼层管理 -->
    <div
      class="config-section"
      style="padding: 20px 25px !important; border-bottom: 1px solid #3a3a3a; margin-bottom: 5px"
    >
      <div
        style="
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          background: linear-gradient(
            135deg,
            rgba(30, 30, 30, 0.95) 0%,
            rgba(38, 38, 38, 0.9) 50%,
            rgba(30, 30, 30, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 18px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 3px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        "
        @click="toggleSection('messageManagement')"
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(42, 42, 42, 0.98) 0%, rgba(50, 50, 50, 0.95) 50%, rgba(42, 42, 42, 0.98) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'translateX(4px) scale(1.005)';
          ($event.currentTarget as HTMLElement).style.borderLeft = '3px solid rgba(255, 193, 7, 0.6)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.background =
            'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(38, 38, 38, 0.9) 50%, rgba(30, 30, 30, 0.95) 100%)';
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.borderLeft = '1px solid rgba(255, 255, 255, 0.06)';
        "
      >
        <h3
          style="
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          "
        >
          <i class="fa-solid fa-layer-group" style="color: #dc3545; font-size: 18px"></i>
          楼层管理
        </h3>
        <i
          :class="expandedSections['messageManagement'] ? 'fa-chevron-up' : 'fa-chevron-down'"
          class="fa-solid"
          style="color: rgba(255, 255, 255, 0.6); font-size: 14px; transition: transform 0.3s"
        ></i>
      </div>

      <div v-show="expandedSections['messageManagement']">
        <div class="form-group" style="margin-bottom: 18px !important">
          <label style="display: block; margin-bottom: 6px; color: #ccc; font-size: 13px"
            >隐藏楼层范围（如：1-10 或单个楼层如：5）</label
          >
          <input
            v-model="hide_range"
            type="text"
            placeholder="1-10"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              transition: border-color 0.2s;
            "
          />
        </div>
        <div class="button-group" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 5px">
          <button
            class="action-button"
            style="
              flex: 1;
              min-width: 120px;
              padding: 12px 16px;
              border: none;
              border-radius: 12px;
              cursor: pointer;
              font-weight: 500;
              font-size: 13px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #ff6b6b;
              box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
              color: white;
            "
            @click="handle_hide_messages"
          >
            <i class="fa-solid fa-eye-slash"></i> 隐藏楼层
          </button>
          <button
            class="action-button"
            style="
              flex: 1;
              min-width: 120px;
              padding: 12px 16px;
              border: none;
              border-radius: 12px;
              cursor: pointer;
              font-weight: 500;
              font-size: 13px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #51cf66;
              box-shadow: 0 2px 8px rgba(81, 207, 102, 0.3);
              color: white;
            "
            :disabled="!hide_range.trim()"
            @click="handle_show_messages"
          >
            <i class="fa-solid fa-eye"></i> 显示楼层
          </button>
          <button
            class="action-button"
            style="
              flex: 1;
              min-width: 120px;
              padding: 12px 16px;
              border: none;
              border-radius: 12px;
              cursor: pointer;
              font-weight: 500;
              font-size: 13px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #ffd43b;
              box-shadow: 0 2px 8px rgba(255, 212, 59, 0.3);
              color: #333;
            "
            @click="() => handle_refresh_hidden(true)"
          >
            <i class="fa-solid fa-refresh"></i> 刷新
          </button>
        </div>

        <!-- 显示隐藏的楼层列表 -->
        <div v-if="hidden_messages.length > 0" class="hidden-messages-section">
          <div class="form-group">
            <label class="flex-label">
              <span>已隐藏的楼层 ({{ hidden_messages.length }} 个)</span>
              <button
                class="mini-button"
                style="
                  padding: 6px 14px;
                  background: #4a9eff;
                  color: white;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  font-size: 12px;
                  font-weight: 500;
                  transition: all 0.2s;
                  box-shadow: 0 2px 6px rgba(74, 158, 255, 0.3);
                "
                @click="hidden_display_expanded = !hidden_display_expanded"
              >
                {{ hidden_display_expanded ? '收起' : '展开' }}
              </button>
            </label>
          </div>
          <div v-if="hidden_display_expanded" class="hidden-messages-list">
            <div v-for="msg in hidden_messages" :key="msg.message_id" class="hidden-message-item">
              <div class="message-info">
                <span class="message-id">#{{ msg.message_id }}</span>
                <span class="message-role" :class="'role-' + msg.role">
                  {{ msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚙️' }}
                  {{ msg.name }}
                </span>
                <span class="message-preview">
                  {{ msg.message.substring(0, 50) }}{{ msg.message.length > 50 ? '...' : '' }}
                </span>
              </div>
              <button
                class="show-button"
                style="
                  padding: 6px 14px;
                  background: #51cf66;
                  color: white;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  font-size: 12px;
                  font-weight: 500;
                  transition: all 0.2s;
                  box-shadow: 0 2px 6px rgba(81, 207, 102, 0.3);
                "
                @click="() => handle_unhide_single(msg.message_id)"
              >
                显示
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">暂无隐藏的楼层</div>
      </div>
    </div>

    <!-- 进度对话框 -->
    <ProgressDialog ref="progressDialogRef" :show="showProgress" title="AI 正在处理" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useSettingsStore, useSummaryHistoryStore } from '../settings';
import { getChatIdSafe, getScriptIdSafe } from '../utils';
import { useTaskStore } from '../taskStore';
import ProgressDialog from './ProgressDialog.vue';

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const summaryHistoryStore = useSummaryHistoryStore();
const taskStore = useTaskStore();

// 折叠展开状态
const expandedSections = ref<Record<string, boolean>>({
  api: true,
  autoSummary: true,
  manualSummary: true,
  tableGeneration: true,
  messageManagement: true,
});

// 切换分类展开/折叠
const toggleSection = (section: string) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

// 导入酒馆API函数
// setChatMessages 是全局函数，不需要导入

// 解析楼层范围的辅助函数
const parseMessageRange = (range: string): number[] => {
  if (!range.trim()) return [];

  const messageIds: number[] = [];
  const parts = range.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      // 处理范围，如 "1-10"
      const [start, end] = trimmed.split('-').map(s => parseInt(s.trim()));
      if (!isNaN(start) && !isNaN(end) && start >= 0 && end >= 0) {
        for (let i = start; i <= end; i++) {
          messageIds.push(i);
        }
      }
    } else {
      // 处理单个楼层，如 "5" 或 "0"
      const id = parseInt(trimmed);
      if (!isNaN(id) && id >= 0) {
        messageIds.push(id);
      }
    }
  }

  return messageIds;
};

// 响应式数据
const available_models = ref<string[]>([]);
const loading_models = ref(false);
const hide_range = ref<string>('');
const hidden_messages = ref<Array<{ message_id: number; name: string; role: string; message: string }>>([]);
const hidden_display_expanded = ref(false);

// 持久化生成状态
const is_summarizing = ref(false);
const is_generating_table = ref(false);

// 进度对话框
const showProgress = ref(false);
const progressDialogRef = ref<InstanceType<typeof ProgressDialog> | null>(null);

// 表格列头模板相关
const headerTemplates = ref<Array<{ name: string; headers: string }>>([]);
const selectedTemplate = ref<string>('');
const currentTemplate = ref<{ name: string; headers: string }>({ name: '', headers: '' });

// 生成状态管理（插件环境 - 使用 localStorage）
const loadGenerationStatus = () => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      console.warn('script_id 为空，无法加载生成状态');
      return;
    }

    // 插件环境：从 localStorage 读取
    const storageKey = `${scriptId}_generation_status`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const status = JSON.parse(savedData);
        is_summarizing.value = status.is_summarizing || false;
        is_generating_table.value = status.is_generating_table || false;
        console.log('✅ 从 localStorage 加载生成状态:', {
          summarizing: is_summarizing.value,
          generating_table: is_generating_table.value,
        });
      } catch (parseError) {
        console.error('解析生成状态失败:', parseError);
        is_summarizing.value = false;
        is_generating_table.value = false;
      }
    } else {
      is_summarizing.value = false;
      is_generating_table.value = false;
    }
  } catch (error) {
    console.error('加载生成状态失败:', error);
    is_summarizing.value = false;
    is_generating_table.value = false;
  }
};

const saveGenerationStatus = () => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      console.warn('script_id 为空，无法保存生成状态');
      return;
    }

    // 插件环境：保存到 localStorage
    const storageKey = `${scriptId}_generation_status`;
    const status = {
      is_summarizing: is_summarizing.value,
      is_generating_table: is_generating_table.value,
    };
    localStorage.setItem(storageKey, JSON.stringify(status));
    console.log('✅ 已保存生成状态到 localStorage');
  } catch (error) {
    console.error('保存生成状态失败:', error);
  }
};

const stopGeneration = () => {
  if (is_summarizing.value || is_generating_table.value) {
    is_summarizing.value = false;
    is_generating_table.value = false;
    saveGenerationStatus();
    window.toastr.info('已停止所有生成任务');
  }
};

// 表格列头模板管理（插件环境 - 使用 localStorage）
const loadHeaderTemplates = () => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      console.warn('script_id 为空，无法加载列头模板');
      return;
    }

    // 插件环境：从 localStorage 读取
    const storageKey = `${scriptId}_header_templates`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        let templates = JSON.parse(savedData);
        // 将 null、undefined 或不为数组的情况都归为 []
        if (!Array.isArray(templates)) {
          templates = [];
        }
        headerTemplates.value = templates;
        console.log('✅ 从 localStorage 加载列头模板:', headerTemplates.value.length, '个');
      } catch (parseError) {
        console.error('解析列头模板失败:', parseError);
        headerTemplates.value = [];
      }
    } else {
      headerTemplates.value = [];
    }
  } catch (error) {
    console.error('加载列头模板失败:', error);
    headerTemplates.value = [];
  }
};

const saveHeaderTemplates = () => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      console.warn('script_id 为空，无法保存列头模板');
      return;
    }

    // 插件环境：保存到 localStorage
    const storageKey = `${scriptId}_header_templates`;
    localStorage.setItem(storageKey, JSON.stringify(headerTemplates.value));
    console.log('✅ 已保存列头模板到 localStorage');
  } catch (error) {
    console.error('保存列头模板失败:', error);
  }
};

const loadTemplate = () => {
  if (selectedTemplate.value !== '') {
    const index = parseInt(selectedTemplate.value);
    if (index >= 0 && index < headerTemplates.value.length) {
      currentTemplate.value = { ...headerTemplates.value[index] };
    }
  }
};

const showAddTemplateDialog = () => {
  const name = window.prompt('请输入模板名称：');
  if (name && name.trim()) {
    const headers = window.prompt('请输入列头（用逗号分隔）：');
    if (headers && headers.trim()) {
      headerTemplates.value.push({ name: name.trim(), headers: headers.trim() });
      saveHeaderTemplates();
      selectedTemplate.value = (headerTemplates.value.length - 1).toString();
      loadTemplate();
      window.toastr.success('模板添加成功');
    }
  }
};

const saveTemplate = () => {
  if (selectedTemplate.value !== '' && currentTemplate.value.name.trim() && currentTemplate.value.headers.trim()) {
    const index = parseInt(selectedTemplate.value);
    if (index >= 0 && index < headerTemplates.value.length) {
      headerTemplates.value[index] = { ...currentTemplate.value };
      saveHeaderTemplates();
      window.toastr.success('模板保存成功');
    }
  } else {
    window.toastr.warning('请填写模板名称和列头');
  }
};

const deleteTemplate = () => {
  if (selectedTemplate.value !== '') {
    if (confirm('确定要删除这个模板吗？')) {
      const index = parseInt(selectedTemplate.value);
      if (index >= 0 && index < headerTemplates.value.length) {
        headerTemplates.value.splice(index, 1);
        saveHeaderTemplates();
        selectedTemplate.value = '';
        currentTemplate.value = { name: '', headers: '' };
        window.toastr.success('模板删除成功');
      }
    }
  }
};

// 从 localStorage 加载隐藏楼层数据（插件环境）
const loadHiddenMessages = () => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      console.warn('script_id 为空，无法加载隐藏楼层数据');
      return;
    }
    console.log('脚本ID:', scriptId);

    // 插件环境：从 localStorage 加载
    const storageKey = `${scriptId}_hidden_messages`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        hidden_messages.value = JSON.parse(savedData);
        console.log('✅ 从 localStorage 加载隐藏楼层数据:', hidden_messages.value.length, '个');
      } catch (parseError) {
        console.error('解析隐藏楼层数据失败:', parseError);
        hidden_messages.value = [];
      }
    } else {
      console.log('📝 localStorage 中没有隐藏楼层数据');
      hidden_messages.value = [];
    }
  } catch (error) {
    console.error('加载隐藏楼层数据失败:', error);
  }
};

// 保存隐藏楼层数据到 localStorage（插件环境）
const saveHiddenMessages = () => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) {
      console.warn('script_id 为空，无法保存隐藏楼层数据');
      return;
    }
    console.log('保存到脚本ID:', scriptId);
    console.log('要保存的数据:', klona(hidden_messages.value));

    // 插件环境：保存到 localStorage
    const storageKey = `${scriptId}_hidden_messages`;
    localStorage.setItem(storageKey, JSON.stringify(hidden_messages.value));

    console.log('✅ 成功保存隐藏楼层数据到 localStorage:', hidden_messages.value.length, '个');
  } catch (error) {
    console.error('保存隐藏楼层数据失败:', error);
  }
};

// 初始化 API 提供商（根据当前端点自动判断）
const initApiProvider = () => {
  if (!settings.value.api_provider || settings.value.api_provider === '') {
    const endpoint = settings.value.api_endpoint || '';
    if (endpoint.includes('generativelanguage.googleapis.com')) {
      settings.value.api_provider = 'gemini';
    } else if (endpoint.includes('open.bigmodel.cn')) {
      settings.value.api_provider = 'zhipu';
    } else {
      settings.value.api_provider = 'openai';
    }
  }
};

// 组件挂载时加载数据
onMounted(() => {
  console.log('SettingsTab 组件已挂载，开始加载数据');
  initApiProvider(); // 初始化 API 提供商
  loadHiddenMessages();
  loadHeaderTemplates();
  loadGenerationStatus();
});

// 测试按钮处理函数
const handleTestButton = () => {
  console.log('原生点击 - Vue事件绑定工作正常');
  window.toastr.success('Vue事件绑定工作正常！');
};

// 设置管理函数
const handleSaveSettings = () => {
  console.log('💾 手动保存设置...');
  const success = settingsStore.saveSettings();
  if (success) {
    console.log('✅ 设置保存成功');
  } else {
    console.error('❌ 设置保存失败');
  }
};

const handleReloadSettings = () => {
  console.log('🔄 重新加载设置...');
  const success = settingsStore.reloadSettings();
  if (success) {
    console.log('✅ 设置重新加载成功');
  } else {
    console.error('❌ 设置重新加载失败');
  }
};

const handleResetAutoSummaryStart = () => {
  console.log('🔄 重置自动总结起始楼层...');
  try {
    // 调用全局函数（修正函数名为 smartResetChat）
    if (typeof (window as any).smartResetChat === 'function') {
      (window as any).smartResetChat();
    } else {
      window.toastr.error('重置函数不可用，请刷新页面后重试');
    }
  } catch (error) {
    console.error('❌ 重置起始楼层失败:', error);
    window.toastr.error('重置失败: ' + (error as Error).message);
  }
};

// API 提供商切换处理
const handleProviderChange = () => {
  const provider = settings.value.api_provider;
  const providerEndpoints: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  };

  if (providerEndpoints[provider]) {
    settings.value.api_endpoint = providerEndpoints[provider];
    window.toastr.success(`已切换到 ${provider === 'openai' ? 'OpenAI' : 'Gemini AI Studio'}`);
  }
};

// 其他处理函数（这里需要从原组件中复制相应的逻辑）
// 保存API配置
const handleSaveApiConfig = () => {
  try {
    // 验证必填项
    if (!settings.value.api_endpoint || !settings.value.api_key) {
      window.toastr.warning('请先填写 API 端点和 API Key');
      return;
    }

    // 立即保存配置
    const success = settingsStore.saveSettings();
    if (success) {
      console.log('API 配置已保存:', {
        endpoint: settings.value.api_endpoint,
        model: settings.value.model,
        provider: settings.value.api_provider,
        // 不打印完整的 API Key
        api_key: settings.value.api_key ? '***' + settings.value.api_key.slice(-4) : '',
      });
    }
  } catch (error) {
    console.error('保存 API 配置失败:', error);
    window.toastr.error('保存失败：' + (error as Error).message);
  }
};

// 从酒馆导入配置（已废弃，仅保留用于参考）
const handleImportFromTavern = async () => {
  try {
    console.log('📥 开始从酒馆导入配置...');

    // 检查必要的函数是否可用
    if (typeof triggerSlash === 'undefined') {
      window.toastr.error('无法访问酒馆命令，请确保在酒馆环境中运行');
      return;
    }

    console.log('🔍 使用斜杠命令读取连接配置文件...');

    // 步骤 1: 获取当前配置文件名称
    console.log('1️⃣ 执行 /profile 获取当前配置文件...');
    const currentProfileResult = await triggerSlash('/profile');
    console.log('当前配置文件返回:', currentProfileResult);

    // 如果没有配置文件，尝试直接读取全局配置
    if (
      !currentProfileResult ||
      currentProfileResult === 'No connection profile selected.' ||
      currentProfileResult.includes('未选择')
    ) {
      console.log('⚠️ 未选择连接配置文件，尝试读取全局配置...');

      // 回退到读取父窗口的全局变量
      const parentWin = window.parent || window.top || window;
      const powerUser = (parentWin as any).power_user;
      const secretState = (parentWin as any).secret_state;

      let endpoint = '';
      let apiKey = '';
      let model = '';

      if (powerUser) {
        endpoint = powerUser.custom_chat_url || powerUser.reverse_proxy || '';
        model = powerUser.custom_model || powerUser.openai_model || '';
      }

      if (secretState) {
        apiKey = secretState.api_key_custom || secretState.custom || secretState.openai || '';
      }

      if (!endpoint && !apiKey && !model) {
        window.toastr.warning(
          '未能读取到 API 配置。\n\n' +
            '💡 建议：在酒馆主界面创建一个连接配置文件\n' +
            '（API 连接菜单 → 连接配置文件 → 创建）',
        );
        return;
      }

      // 使用全局配置
      if (endpoint) settings.value.api_endpoint = endpoint;
      if (apiKey) settings.value.api_key = apiKey;
      if (model) settings.value.model = model;

      await settingsStore.saveSettings();

      window.toastr.success(
        `✅ 从全局配置导入成功！\n\n` +
          (endpoint ? `• 端点: ${endpoint}\n` : '') +
          (apiKey ? `• Key: ***${apiKey.slice(-4)}\n` : '') +
          (model ? `• 模型: ${model}` : ''),
      );

      return;
    }

    // 步骤 2: 获取配置文件详情
    const profileName = currentProfileResult.trim();
    console.log(`2️⃣ 获取配置文件详情: ${profileName}`);

    const profileDetailsResult = await triggerSlash(`/profile-get ${profileName}`);
    console.log('配置文件详情返回:', profileDetailsResult);

    // 解析 JSON
    let profileData: any;
    try {
      profileData = JSON.parse(profileDetailsResult);
      console.log('✅ 解析配置文件数据:', profileData);
    } catch (parseError) {
      console.error('❌ 解析配置文件 JSON 失败:', parseError);
      window.toastr.error('无法解析配置文件数据');
      return;
    }

    // 提取配置
    let endpoint = '';
    let apiKey = '';
    let model = '';

    // API 端点（可能是 api-url 或 server_url）
    if (profileData['api-url']) {
      endpoint = profileData['api-url'];
      console.log('✅ 找到 API 端点 (api-url):', endpoint);
    } else if (profileData.server_url) {
      endpoint = profileData.server_url;
      console.log('✅ 找到 API 端点 (server_url):', endpoint);
    }

    // API Key - 尝试读取（通常不可用，存储在服务器端）
    if (profileData['secret-id']) {
      const secretId = profileData['secret-id'];
      console.log('ℹ️ 配置文件包含 secret-id:', secretId);
      console.log('ℹ️ API Key 存储在服务器端，无法从前端读取（这是正常的安全措施）');
    } else if (profileData.key) {
      apiKey = profileData.key;
      console.log('✅ 找到 API Key (key)');
    }

    // 模型（model）
    if (profileData.model) {
      model = profileData.model;
      console.log('✅ 找到模型:', model);
    }

    // 检查是否成功读取（至少要有端点或模型）
    if (!endpoint && !model) {
      window.toastr.warning(
        '配置文件中未找到 API 配置信息。\n\n' +
          '可能的原因：\n' +
          '• 配置文件格式不符合预期\n' +
          '• 配置文件未保存完整信息\n\n' +
          '💡 查看控制台了解详细数据',
      );
      console.warn('📋 配置文件完整数据:', profileData);
      return;
    }

    // 如果没有读取到 API Key（通常情况）
    if (!apiKey) {
      console.log('ℹ️ API Key 存储在服务器端，需要手动输入');
    }

    // 导入配置
    let importedCount = 0;
    const importDetails: string[] = [];

    if (endpoint) {
      settings.value.api_endpoint = endpoint;
      importedCount++;
      importDetails.push(`• API 端点: ${endpoint}`);
    }

    if (apiKey) {
      settings.value.api_key = apiKey;
      importedCount++;
      importDetails.push(`• API Key: ***${apiKey.slice(-4)}`);
    }

    if (model) {
      settings.value.model = model;
      importedCount++;
      importDetails.push(`• 模型: ${model}`);
    }

    // 自动保存配置
    await settingsStore.saveSettings();

    // 构建成功消息
    let successMessage =
      `🎉 成功从酒馆导入 ${importedCount} 项配置！\n\n` +
      `📋 配置文件: ${profileName}\n\n` +
      `${importDetails.join('\n')}`;

    // 如果没有导入 API Key，添加提示
    if (!apiKey) {
      successMessage += `\n\n⚠️ API Key 需要手动输入\n（出于安全考虑，酒馆不在前端存储 API Key）`;
    }

    window.toastr.success(successMessage);

    console.log('✅ 导入配置成功:', {
      profileName,
      endpoint,
      apiKey: apiKey ? '***' + apiKey.slice(-4) : '',
      model,
    });
  } catch (error) {
    console.error('❌ 从酒馆导入配置失败:', error);
    window.toastr.error('导入失败：' + (error as Error).message);
  }
};

const handle_fetch_models = async () => {
  if (loading_models.value) return;

  try {
    loading_models.value = true;
    console.log('🚀 开始拉取模型列表...');
    console.log('📍 API 端点:', settings.value.api_endpoint);
    console.log('🔑 API Key:', settings.value.api_key ? '***' + settings.value.api_key.slice(-4) : '未设置');

    // 验证 API 配置
    if (!settings.value.api_endpoint || !settings.value.api_key) {
      window.toastr.warning('请先配置 API 端点和 API Key');
      return;
    }

    window.toastr.info('正在拉取模型列表，请查看控制台了解详细过程...');

    // 调用拉取模型函数
    const { fetchAvailableModels } = await import('../总结功能');
    const models = await fetchAvailableModels();

    console.log('✅ 最终获取到的模型列表:', models);

    if (models.length > 0) {
      // 更新模型列表
      available_models.value = models;
      window.toastr.success(
        `🎉 成功获取 ${models.length} 个模型！\n` +
          `模型列表: ${models.slice(0, 3).join(', ')}${models.length > 3 ? '...' : ''}`,
      );

      // 如果有模型，自动选择第一个
      if (!settings.value.model && models[0]) {
        settings.value.model = models[0];
        console.log('✅ 自动选择模型:', models[0]);
      }
    } else {
      window.toastr.warning('未找到可用模型，请手动输入');
    }
  } catch (error) {
    console.error('❌ 拉取模型失败:', error);

    // 显示详细的错误信息
    const errorMessage = (error as Error).message;

    // 如果错误信息很长，显示简短版本
    if (errorMessage.length > 200) {
      window.toastr.error(
        '❌ 拉取模型失败\n\n' +
          '请打开浏览器控制台（F12）查看详细的调试信息\n\n' +
          '可能的原因：\n' +
          '• API 不支持 /v1/models 接口\n' +
          '• API Key 权限不足\n' +
          '• 网络连接问题或 CORS 限制',
      );
    } else {
      window.toastr.error(`❌ 拉取模型失败\n\n${errorMessage}`);
    }

    console.error('📋 完整错误信息:', errorMessage);
  } finally {
    loading_models.value = false;
  }
};

const handle_test_connection = async () => {
  try {
    console.log('测试连接...');

    // 验证 API 配置
    if (!settings.value.api_endpoint || !settings.value.api_key) {
      window.toastr.warning('请先配置 API 端点和 API Key');
      return;
    }

    window.toastr.info('正在测试连接，请稍候...');

    // 导入规范化函数
    const { normalizeApiEndpoint } = await import('../settings');
    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);
    console.log('📍 规范化的端点:', apiUrl);

    // 使用 OpenAI 标准格式的连接测试
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify({
        model: settings.value.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
        temperature: settings.value.temperature,
        top_p: settings.value.top_p,
        presence_penalty: settings.value.presence_penalty,
        frequency_penalty: settings.value.frequency_penalty,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('API 测试响应:', data);

      // 提取响应内容和模型信息
      const reply = data.choices?.[0]?.message?.content || '(无内容)';
      const modelUsed = data.model || settings.value.model;

      window.toastr.success(`✅ 连接成功！\n` + `📦 模型: ${modelUsed}\n` + `💬 回复: ${reply.substring(0, 50)}...`);
    } else {
      const errorText = await response.text();
      console.error('API 错误响应:', errorText);
      window.toastr.error(`❌ 连接失败 (${response.status})\n` + `详情: ${errorText.substring(0, 100)}`);
    }
  } catch (error) {
    console.error('连接测试失败:', error);
    window.toastr.error('连接测试失败: ' + (error as Error).message);
  }
};

const handle_summarize = async () => {
  let taskId: string | null = null;
  try {
    if (is_summarizing.value) return;

    console.log('开始手动总结...');
    is_summarizing.value = true;
    saveGenerationStatus();

    // 创建任务
    taskId = taskStore.addTask({
      title: '生成总结',
      description: `正在总结楼层 ${settings.value.start_message_id} - ${settings.value.end_message_id}`,
      category: '总结',
    });

    // 验证 API 配置
    if (!settings.value.api_endpoint || !settings.value.api_key) {
      window.toastr.warning('请先配置 API 端点和 API Key');
      return;
    }

    // 验证楼层范围
    if (settings.value.start_message_id === undefined || settings.value.end_message_id === undefined) {
      window.toastr.warning('请设置开始楼层和结束楼层');
      return;
    }

    // 验证楼层范围的有效性
    if (settings.value.start_message_id < 0 || settings.value.end_message_id < settings.value.start_message_id) {
      window.toastr.warning('楼层范围无效，请确保结束楼层大于等于开始楼层');
      return;
    }

    console.log(`总结范围: ${settings.value.start_message_id} - ${settings.value.end_message_id}`);

    // 显示进度对话框
    showProgress.value = true;
    progressDialogRef.value?.setProgress(10);
    progressDialogRef.value?.setMessage('正在准备生成总结...');
    progressDialogRef.value?.addDetail(
      `楼层范围: ${settings.value.start_message_id} - ${settings.value.end_message_id}`,
    );

    progressDialogRef.value?.setProgress(30);
    progressDialogRef.value?.setMessage('正在调用 AI 生成总结...');
    progressDialogRef.value?.addDetail('这可能需要 10-30 秒，请耐心等待');

    // 调用总结功能
    const { summarizeMessages } = await import('../总结功能');
    const summary = await summarizeMessages(settings.value.start_message_id, settings.value.end_message_id);

    progressDialogRef.value?.setProgress(90);
    progressDialogRef.value?.setMessage('正在保存总结结果...');

    console.log('总结完成:', summary);

    // 保存总结结果（插件环境 - 使用 localStorage）
    const scriptId = getScriptIdSafe();
    if (scriptId) {
      const storageKey = `${scriptId}_last_summary`;
      localStorage.setItem(storageKey, JSON.stringify({ last_summary: summary }));
      console.log('✅ 总结已保存到 localStorage');
    }

    // 保存到当前聊天的总结历史
    summaryHistoryStore.addSummary(
      settings.value.start_message_id ?? 0,
      settings.value.end_message_id ?? settings.value.start_message_id ?? 0,
      summary,
    );

    // 通知其他组件更新
    window.dispatchEvent(new CustomEvent('summary-history-updated'));

    progressDialogRef.value?.setProgress(100);
    progressDialogRef.value?.setMessage('✅ 总结完成！');
    progressDialogRef.value?.addDetail('总结已保存到历史记录');

    setTimeout(() => {
      showProgress.value = false;
      window.toastr.success('总结完成并已保存到历史！');
      // 标记任务完成
      if (taskId) {
        taskStore.completeTask(taskId);
      }
    }, 800);
  } catch (error) {
    console.error('总结失败:', error);
    showProgress.value = false;
    window.toastr.error('总结失败: ' + (error as Error).message);
    // 标记任务失败
    if (taskId) {
      taskStore.failTask(taskId, (error as Error).message);
    }
  } finally {
    is_summarizing.value = false;
    saveGenerationStatus();
  }
};

const handle_generate_table = async () => {
  let taskId: string | null = null;
  try {
    if (is_generating_table.value) return;

    console.log('开始生成表格...');
    is_generating_table.value = true;
    saveGenerationStatus();

    // 创建任务
    taskId = taskStore.addTask({
      title: '生成表格',
      description: `正在生成楼层 ${settings.value.table_start_message_id} - ${settings.value.table_end_message_id} 的表格`,
      category: '表格',
    });

    // 验证 API 配置
    if (!settings.value.api_endpoint || !settings.value.api_key) {
      window.toastr.warning('请先配置 API 端点和 API Key');
      return;
    }

    // 显示进度对话框
    showProgress.value = true;
    progressDialogRef.value?.setProgress(5);
    progressDialogRef.value?.setMessage('正在准备生成表格...');

    // 验证表格参数
    if (!settings.value.table_start_message_id || !settings.value.table_end_message_id) {
      window.toastr.warning('请设置开始楼层和结束楼层');
      return;
    }

    // 让用户输入表格列头（优先使用模板）
    let headersInput: string | null = null;

    if (currentTemplate.value.headers.trim()) {
      // 如果当前有选中的模板，询问是否使用
      const useTemplate = confirm(
        `是否使用模板"${currentTemplate.value.name}"的列头？\n列头：${currentTemplate.value.headers}`,
      );
      if (useTemplate) {
        headersInput = currentTemplate.value.headers;
      }
    }

    if (!headersInput) {
      // 如果没有使用模板，让用户手动输入
      headersInput = window.prompt('请输入表格列头（用逗号分隔，如：时间,事件,地点,人物）：');
    }

    if (!headersInput || !headersInput.trim()) {
      window.toastr.warning('请设置表格列头');
      return;
    }

    const headers: string[] = headersInput
      .split(',')
      .map((h: string) => h.trim())
      .filter((h: string) => h);

    if (headers.length === 0) {
      window.toastr.warning('请设置有效的表格列头');
      return;
    }

    progressDialogRef.value?.setProgress(15);
    progressDialogRef.value?.setMessage('正在获取聊天消息...');
    progressDialogRef.value?.addDetail(
      `楼层范围: ${settings.value.table_start_message_id} - ${settings.value.table_end_message_id}`,
    );

    // 获取指定范围的消息
    let chatMessages;
    try {
      const messageRange = `${settings.value.table_start_message_id}-${settings.value.table_end_message_id}`;
      console.log('获取消息范围:', messageRange);

      // 使用 TavernHelper.getChatMessages()
      if (
        typeof (window as any).TavernHelper !== 'undefined' &&
        typeof (window as any).TavernHelper.getChatMessages === 'function'
      ) {
        chatMessages = (window as any).TavernHelper.getChatMessages(messageRange);
        console.log('✅ 通过 TavernHelper.getChatMessages() 获取到的消息数量:', chatMessages.length);
      } else {
        throw new Error('TavernHelper.getChatMessages 不可用');
      }

      progressDialogRef.value?.addDetail(`获取到 ${chatMessages.length} 条消息`);
    } catch (error) {
      console.error('获取聊天消息失败:', error);
      showProgress.value = false;
      window.toastr.error('获取聊天消息失败: ' + (error as Error).message);
      return;
    }

    if (!chatMessages || chatMessages.length === 0) {
      window.toastr.warning('指定范围内没有消息');
      return;
    }

    // 准备AI请求数据
    const messagesText = chatMessages
      .map((msg, idx) => {
        const role = msg.role === 'user' ? '用户' : 'AI';
        return `[消息${idx + 1}] ${role}: ${msg.message}`;
      })
      .join('\n\n');

    const systemPrompt = `你是专业的数据提取助手，负责从聊天记录中提取结构化数据并生成表格。

# 核心任务
从用户提供的聊天记录中，提取与列头相关的信息，生成JSON格式的表格数据。

# 关键原则
1. **只提取有效信息**：忽略错误消息、系统提示、无关对话
2. **精准匹配列头**：每一列都要对应列头的含义
3. **保持结构化**：每行数据必须是数组，长度等于列头数量
4. **避免空表**：如果聊天内容中确实没有相关信息，生成示例说明"无相关数据"

# 输出格式（严格遵守）
只输出纯JSON，格式如下：
{
  "data": [
    ["值1", "值2", "值3"],
    ["值4", "值5", "值6"]
  ]
}

# 禁止事项
❌ 不要输出任何解释、说明、注释
❌ 不要使用markdown代码块（\`\`\`json）
❌ 不要复制错误消息作为数据
❌ 不要改变列头顺序或数量

现在开始提取数据。`;

    const userPrompt = `请从以下聊天记录中提取信息，生成表格数据。

**表格列头**：${headers.join(', ')}
（共${headers.length}列，每行数据必须包含${headers.length}个值）

**聊天记录**：
${messagesText}

---

**重要提醒**：
- 每行数据格式：[${headers.map(h => `"${h}对应的值"`).join(', ')}]
- 如果某列没有信息，填写"无"或"-"
- 忽略错误消息、系统提示等无关内容
- 只返回JSON，不要任何其他文字

立即生成表格JSON：`;

    console.log('发送AI请求...');
    console.log('📋 System Prompt:', systemPrompt);
    console.log('📝 User Prompt:', userPrompt.slice(0, 500) + '...');

    progressDialogRef.value?.setProgress(30);
    progressDialogRef.value?.setMessage('正在发送请求到 AI 服务器...');
    progressDialogRef.value?.addDetail(`表格列头: ${headers.join(', ')}`);

    // 导入规范化函数
    const { normalizeApiEndpoint } = await import('../settings');
    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    progressDialogRef.value?.setProgress(40);
    progressDialogRef.value?.setMessage('等待 AI 分析并生成表格...');
    progressDialogRef.value?.addDetail('这可能需要 10-30 秒，请耐心等待');

    // 调用AI生成表格
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify({
        model: settings.value.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: settings.value.max_tokens,
        temperature: 0.3, // 降低温度，提高稳定性
        top_p: settings.value.top_p,
        presence_penalty: settings.value.presence_penalty,
        frequency_penalty: settings.value.frequency_penalty,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      showProgress.value = false;
      console.error('❌ API请求失败:', response.status, response.statusText);
      console.error('错误详情:', errorText);
      window.toastr.error(
        `API请求失败！\n\n状态码: ${response.status}\n错误: ${response.statusText}\n\n请检查：\n1. API端点是否正确\n2. API Key是否有效\n3. 网络连接是否正常`,
        '',
        { timeOut: 10000 },
      );
      return;
    }

    progressDialogRef.value?.setProgress(70);
    progressDialogRef.value?.setMessage('正在接收 AI 响应...');

    const result = await response.json();
    console.log('AI响应:', result);

    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      showProgress.value = false;
      console.error('❌ AI响应格式错误:', result);
      window.toastr.error('AI响应格式错误，请检查API是否为OpenAI兼容格式', '', { timeOut: 8000 });
      return;
    }

    const aiResponse = result.choices[0].message.content;
    console.log('AI返回内容:', aiResponse);

    progressDialogRef.value?.setProgress(85);
    progressDialogRef.value?.setMessage('正在解析表格数据...');

    // 解析AI返回的JSON
    let aiTableData;
    try {
      // 检查是否是API错误信息（不是JSON）
      if (
        aiResponse.includes('API密钥') ||
        aiResponse.includes('请求失败') ||
        aiResponse.includes('轮询日志') ||
        aiResponse.includes('error') ||
        (!aiResponse.includes('{') && !aiResponse.includes('['))
      ) {
        // 这是错误信息，不是JSON数据
        showProgress.value = false;
        window.toastr.error(`API调用失败，请检查API配置！\n\n错误信息：\n${aiResponse.slice(0, 200)}`, '', {
          timeOut: 10000,
        });
        console.error('❌ API返回错误信息:', aiResponse);
        return;
      }

      // 尝试提取JSON部分（移除可能的markdown代码块标记）
      let jsonText = aiResponse.trim();

      // 移除markdown代码块
      jsonText = jsonText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '');

      // 提取JSON对象
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiTableData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法找到JSON格式的表格数据');
      }
    } catch (parseError) {
      console.error('解析AI响应失败:', parseError);
      console.log('AI原始响应:', aiResponse);
      showProgress.value = false;
      window.toastr.error(`AI返回的数据格式不正确！\n\n原始响应：\n${aiResponse.slice(0, 200)}`, '', { timeOut: 8000 });
      return;
    }

    // 验证表格数据
    if (!aiTableData.data || !Array.isArray(aiTableData.data)) {
      window.toastr.error('AI返回的表格数据格式不正确：缺少data数组');
      return;
    }

    // 验证每行数据的列数是否正确
    for (let i = 0; i < aiTableData.data.length; i++) {
      if (!Array.isArray(aiTableData.data[i])) {
        window.toastr.error(`第${i + 1}行数据格式错误：不是数组`);
        return;
      }
      if (aiTableData.data[i].length !== headers.length) {
        window.toastr.error(`第${i + 1}行数据列数不匹配：期望${headers.length}列，实际${aiTableData.data[i].length}列`);
        console.log(`期望列头:`, headers);
        console.log(`实际数据:`, aiTableData.data[i]);
        return;
      }
    }

    // 组装完整的表格数据（使用用户提供的headers）
    const tableData = {
      headers: headers,
      data: aiTableData.data,
    };

    // 保存表格（插件环境 - 使用 localStorage，按聊天ID分别存储）
    const chat_id = getChatIdSafe();
    if (chat_id) {
      const scriptId = getScriptIdSafe();
      const storageKey = `${scriptId}_table_history_${chat_id}`;

      // 从 localStorage 读取当前聊天的表格历史
      let table_history = [];
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          table_history = JSON.parse(savedData);
        } catch (e) {
          console.error('解析表格历史失败:', e);
          table_history = [];
        }
      }

      // 添加新表格
      table_history.push({
        start_id: settings.value.table_start_message_id,
        end_id: settings.value.table_end_message_id,
        headers: tableData.headers,
        data: tableData.data,
      });

      // 保存回 localStorage
      localStorage.setItem(storageKey, JSON.stringify(table_history));
      console.log('✅ 表格已保存到 localStorage，chat_id:', chat_id);

      progressDialogRef.value?.setProgress(100);
      progressDialogRef.value?.setMessage('✅ 表格生成完成！');
      progressDialogRef.value?.addDetail(`共生成 ${tableData.data.length} 行数据`);

      setTimeout(() => {
        showProgress.value = false;
        window.toastr.success(`表格生成成功！共${tableData.data.length}行数据`);
        // 标记任务完成
        if (taskId) {
          taskStore.completeTask(taskId);
        }
      }, 800);

      console.log('表格已保存到聊天变量:', table_history);
    } else {
      showProgress.value = false;
      window.toastr.warning('无法获取聊天ID，表格生成失败');
    }
  } catch (error) {
    console.error('生成表格失败:', error);
    showProgress.value = false;
    window.toastr.error('生成表格失败: ' + (error as Error).message);
    // 标记任务失败
    if (taskId) {
      taskStore.failTask(taskId, (error as Error).message);
    }
  } finally {
    is_generating_table.value = false;
    saveGenerationStatus();
  }
};

const handle_create_table = () => {
  try {
    // 验证表格参数
    if (!settings.value.table_start_message_id || !settings.value.table_end_message_id) {
      window.toastr.warning('请设置开始楼层和结束楼层');
      return;
    }

    // 让用户输入表格列头
    const headersInput: string | null = window.prompt('请输入表格列头（用逗号分隔，如：时间,事件,地点,人物）：');
    if (!headersInput || !headersInput.trim()) {
      window.toastr.warning('请设置表格列头');
      return;
    }

    // 解析列头
    const headers: string[] = headersInput
      .split(',')
      .map((h: string) => h.trim())
      .filter((h: string) => h);

    if (headers.length === 0) {
      window.toastr.warning('请设置有效的表格列头');
      return;
    }

    // 创建空表格数据
    const emptyTableData = {
      start_id: settings.value.table_start_message_id,
      end_id: settings.value.table_end_message_id,
      headers: headers,
      data: [], // 空数据，用户可以手动填充
    };

    // 保存表格（插件环境 - 使用 localStorage，按聊天ID分别存储）
    const chat_id = getChatIdSafe();
    if (chat_id) {
      const scriptId = getScriptIdSafe();
      const storageKey = `${scriptId}_table_history_${chat_id}`;

      // 从 localStorage 读取当前聊天的表格历史
      let table_history = [];
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          table_history = JSON.parse(savedData);
        } catch (e) {
          console.error('解析表格历史失败:', e);
          table_history = [];
        }
      }

      // 添加新表格
      table_history.push(emptyTableData);

      // 保存回 localStorage
      localStorage.setItem(storageKey, JSON.stringify(table_history));
      console.log('✅ 空表格已保存到 localStorage，chat_id:', chat_id);

      window.toastr.success(`空表格创建成功！列头：${headers.join(', ')}`);
      console.log('空表格已保存到聊天变量:', emptyTableData);
    } else {
      window.toastr.warning('无法获取聊天ID，表格创建失败');
    }
  } catch (error) {
    console.error('创建表格失败:', error);
    window.toastr.error('创建表格失败: ' + (error as Error).message);
  }
};

const handle_hide_messages = async () => {
  try {
    console.log('隐藏楼层...');

    if (!hide_range.value.trim()) {
      window.toastr.warning('请输入要隐藏的楼层范围');
      return;
    }

    // 解析楼层范围
    const ranges = hide_range.value.split(',').map(range => range.trim());
    const messageIds: number[] = [];

    for (const range of ranges) {
      if (range.includes('-')) {
        // 范围格式：1-10
        const [start, end] = range.split('-').map(Number);
        if (start && end && start <= end) {
          for (let i = start; i <= end; i++) {
            messageIds.push(i);
          }
        }
      } else {
        // 单个楼层：5
        const id = Number(range);
        if (id) {
          messageIds.push(id);
        }
      }
    }

    if (messageIds.length === 0) {
      window.toastr.warning('请输入有效的楼层范围');
      return;
    }

    // 获取当前聊天的消息
    let chatMessages;
    try {
      // 使用 TavernHelper 获取消息
      if (typeof (window as any).TavernHelper !== 'undefined') {
        const lastMessageId = (window as any).TavernHelper.getLastMessageId?.() ?? 0;
        console.log('最新消息ID:', lastMessageId);

        if (typeof (window as any).TavernHelper.getChatMessages === 'function') {
          chatMessages = (window as any).TavernHelper.getChatMessages(`0-${lastMessageId}`);
          console.log('✅ 通过 TavernHelper 获取到的消息数量:', chatMessages.length);
        } else {
          throw new Error('TavernHelper.getChatMessages 不可用');
        }
      } else {
        throw new Error('TavernHelper 不可用');
      }
    } catch (error) {
      console.error('获取聊天消息失败:', error);
      window.toastr.error('获取聊天消息失败: ' + (error as Error).message);
      return;
    }

    if (!chatMessages || chatMessages.length === 0) {
      window.toastr.warning('当前聊天没有消息');
      return;
    }

    // 隐藏指定的楼层
    let hiddenCount = 0;
    const messagesToHide = [];

    for (const messageId of messageIds) {
      // 检查是否已经在隐藏列表中
      const alreadyHidden = hidden_messages.value.some(msg => msg.message_id === messageId);
      if (alreadyHidden) {
        console.log(`楼层 ${messageId} 已经被隐藏，跳过`);
        continue;
      }

      const message = chatMessages.find(msg => msg.message_id === messageId);
      if (message) {
        // 准备要隐藏的消息数据
        messagesToHide.push({
          message_id: messageId,
          is_hidden: true,
        });

        // 添加到隐藏列表
        hidden_messages.value.push({
          message_id: messageId,
          name: message.name || 'Unknown',
          role: message.role || 'user',
          message: message.message || '',
        });
        hiddenCount++;
      }
    }

    // 调用酒馆API真正隐藏楼层
    if (messagesToHide.length > 0) {
      try {
        console.log('准备调用 slash 命令隐藏楼层:', messageIds);

        // 使用 slash 命令隐藏楼层
        for (const messageId of messageIds) {
          try {
            await triggerSlash(`/hide ${messageId}`);
            console.log(`成功隐藏楼层 ${messageId}`);
          } catch (error) {
            console.error(`隐藏楼层 ${messageId} 失败:`, error);
          }
        }

        window.toastr.success('楼层已真正隐藏');
      } catch (error) {
        console.error('调用隐藏API失败:', error);
        window.toastr.error('隐藏楼层API调用失败: ' + (error as Error).message);
      }
    }

    if (hiddenCount > 0) {
      // 保存到酒馆变量
      saveHiddenMessages();
      window.toastr.success(`成功隐藏 ${hiddenCount} 个楼层`);
      hide_range.value = ''; // 清空输入框
    } else {
      window.toastr.warning('未找到要隐藏的楼层');
    }
  } catch (error) {
    console.error('隐藏楼层失败:', error);
    window.toastr.error('隐藏楼层失败: ' + (error as Error).message);
  }
};

const handle_show_messages = async () => {
  try {
    console.log('显示指定楼层...');

    if (!hide_range.value.trim()) {
      window.toastr.warning('请输入要显示的楼层范围');
      return;
    }

    // 解析楼层范围
    const messageIds = parseMessageRange(hide_range.value.trim());
    if (messageIds.length === 0) {
      window.toastr.warning('请输入有效的楼层范围');
      return;
    }

    // 获取当前聊天的消息
    let chatMessages;
    try {
      // 使用 TavernHelper 获取消息
      if (typeof (window as any).TavernHelper !== 'undefined') {
        const lastMessageId = (window as any).TavernHelper.getLastMessageId?.() ?? 0;
        console.log('最新消息ID:', lastMessageId);

        if (typeof (window as any).TavernHelper.getChatMessages === 'function') {
          chatMessages = (window as any).TavernHelper.getChatMessages(`0-${lastMessageId}`);
          console.log('✅ 通过 TavernHelper 获取到的消息数量:', chatMessages.length);
        } else {
          throw new Error('TavernHelper.getChatMessages 不可用');
        }
      } else {
        throw new Error('TavernHelper 不可用');
      }
    } catch (error) {
      console.error('获取聊天消息失败:', error);
      window.toastr.error('获取聊天消息失败: ' + (error as Error).message);
      return;
    }

    if (!chatMessages || chatMessages.length === 0) {
      window.toastr.warning('当前聊天没有消息');
      return;
    }

    // 准备要显示的消息数据
    const messagesToShow = [];
    let shownCount = 0;

    for (const messageId of messageIds) {
      const message = chatMessages.find(msg => msg.message_id === messageId);
      if (message) {
        messagesToShow.push({
          message_id: messageId,
          is_hidden: false,
        });
        shownCount++;
      }
    }

    if (messagesToShow.length === 0) {
      window.toastr.warning('未找到要显示的楼层');
      return;
    }

    // 调用酒馆API真正显示楼层
    try {
      // 使用 slash 命令显示楼层
      for (const messageId of messageIds) {
        try {
          await triggerSlash(`/unhide ${messageId}`);
          console.log(`成功显示楼层 ${messageId}`);
        } catch (error) {
          console.error(`显示楼层 ${messageId} 失败:`, error);
        }
      }
    } catch (error) {
      console.error('调用显示API失败:', error);
      window.toastr.error('显示楼层API调用失败: ' + (error as Error).message);
      return;
    }

    // 从隐藏列表中移除已显示的楼层
    hidden_messages.value = hidden_messages.value.filter(hiddenMsg => !messageIds.includes(hiddenMsg.message_id));

    // 保存到酒馆变量
    saveHiddenMessages();

    window.toastr.success(`成功显示 ${shownCount} 个楼层`);
    hide_range.value = ''; // 清空输入框
  } catch (error) {
    console.error('显示楼层失败:', error);
    window.toastr.error('显示楼层失败: ' + (error as Error).message);
  }
};

const handle_refresh_hidden = async (showToast: boolean = false) => {
  try {
    console.log('刷新隐藏楼层', showToast);

    // 先加载隐藏楼层数据（如果还没有加载的话）
    if (hidden_messages.value.length === 0) {
      console.log('隐藏楼层列表为空，先加载数据...');
      loadHiddenMessages();
    }

    // 获取当前聊天的消息
    let chatMessages;
    try {
      // 使用 TavernHelper 获取消息
      if (typeof (window as any).TavernHelper !== 'undefined') {
        const lastMessageId = (window as any).TavernHelper.getLastMessageId?.() ?? 0;
        console.log('最新消息ID:', lastMessageId);

        if (typeof (window as any).TavernHelper.getChatMessages === 'function') {
          chatMessages = (window as any).TavernHelper.getChatMessages(`0-${lastMessageId}`);
          console.log('✅ 通过 TavernHelper 获取到的消息数量:', chatMessages.length);
        } else {
          throw new Error('TavernHelper.getChatMessages 不可用');
        }
      } else {
        throw new Error('TavernHelper 不可用');
      }
    } catch (error) {
      console.error('获取聊天消息失败:', error);
      if (showToast) {
        window.toastr.error('获取聊天消息失败: ' + (error as Error).message);
      }
      return;
    }

    if (!chatMessages || chatMessages.length === 0) {
      if (showToast) {
        window.toastr.warning('当前聊天没有消息');
      }
      return;
    }

    // 重新验证隐藏列表中的楼层是否仍然存在
    const validHiddenMessages = [];
    let removedCount = 0;

    for (const hiddenMsg of hidden_messages.value) {
      const message = chatMessages.find(msg => msg.message_id === hiddenMsg.message_id);
      if (message) {
        // 更新消息内容（可能已经改变）
        validHiddenMessages.push({
          message_id: hiddenMsg.message_id,
          name: message.name || hiddenMsg.name,
          role: message.role || hiddenMsg.role,
          message: message.message || hiddenMsg.message,
        });
      } else {
        // 楼层不存在了，从隐藏列表中移除
        removedCount++;
      }
    }

    // 更新隐藏列表
    hidden_messages.value = validHiddenMessages;

    // 保存更新后的数据到酒馆变量
    saveHiddenMessages();

    if (showToast) {
      if (removedCount > 0) {
        window.toastr.success(`刷新完成，移除了 ${removedCount} 个不存在的楼层`);
      } else {
        window.toastr.success('刷新完成，所有隐藏楼层仍然有效');
      }
    }

    console.log(`刷新完成：${validHiddenMessages.length} 个有效隐藏楼层，${removedCount} 个已移除`);
  } catch (error) {
    console.error('刷新隐藏楼层失败:', error);
    if (showToast) {
      window.toastr.error('刷新隐藏楼层失败: ' + (error as Error).message);
    }
  }
};

const handle_unhide_single = async (messageId: number) => {
  try {
    console.log('显示单个楼层', messageId);

    // 检查楼层是否在隐藏列表中
    const index = hidden_messages.value.findIndex(msg => msg.message_id === messageId);
    if (index === -1) {
      window.toastr.warning(`楼层 #${messageId} 不在隐藏列表中`);
      return;
    }

    // 调用酒馆API真正显示楼层
    try {
      // 使用 slash 命令显示楼层
      await triggerSlash(`/unhide ${messageId}`);
      console.log('成功显示楼层:', messageId);
    } catch (error) {
      console.error('调用显示API失败:', error);
      window.toastr.warning('显示楼层API调用失败');
      return;
    }

    // 从隐藏列表中移除指定的楼层
    hidden_messages.value.splice(index, 1);

    // 保存到酒馆变量
    saveHiddenMessages();

    window.toastr.success(`已显示楼层 #${messageId}`);
  } catch (error) {
    console.error('显示单个楼层失败:', error);
    window.toastr.error('显示单个楼层失败: ' + (error as Error).message);
  }
};
</script>

<style>
.settings-tab {
  height: 100%;
  overflow-y: auto;
  padding: 25px !important;
  background: #1a1a1a !important;
}

/* 滚动条样式 */
.settings-tab::-webkit-scrollbar {
  width: 6px;
}

.settings-tab::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.settings-tab::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.settings-tab::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}

.hidden-messages-list::-webkit-scrollbar {
  width: 6px;
}

.hidden-messages-list::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.hidden-messages-list::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

.hidden-messages-list::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}

.config-section {
  padding: 20px 25px !important;
  border-bottom: 1px solid #3a3a3a;
  margin-bottom: 5px;
}

.config-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.config-section h3 {
  margin: 0 0 20px 0 !important;
  color: #fff;
  font-size: 15px !important;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 18px !important;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #ccc;
  font-size: 13px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flex-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-group input[type='text'],
.form-group input[type='password'],
.form-group input[type='number'],
.form-group select {
  width: 100%;
  padding: 10px 12px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 13px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a9eff;
}

.model-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 5px;
}

.action-button {
  flex: 1;
  min-width: 120px;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #3a3a3a;
  color: #e0e0e0;
  border: 1px solid #4a4a4a;
}

.action-button:hover {
  background: #4a4a4a;
  border-color: #5a5a5a;
}

.test-button {
  background: #3a3a3a;
  color: #e0e0e0;
  border: 1px solid #4a4a4a;
}

.test-button:hover {
  background: #4a4a4a;
  border-color: #5a5a5a;
}

.fetch-button {
  background: #4a9eff;
  color: white;
  border: 1px solid #5aaeff;
}

.fetch-button:hover {
  background: #5aaeff;
  border-color: #6abeff;
}

.summarize-button {
  background: #4a9eff;
  color: white;
  border: 1px solid #5aaeff;
}

.summarize-button:hover {
  background: #5aaeff;
  border-color: #6abeff;
}

.create-button {
  background: #51cf66;
  color: white;
  border: 1px solid #40c057;
}

.create-button:hover {
  background: #40c057;
  border-color: #37b24d;
}

.table-button {
  background: #4a9eff;
  color: white;
  border: 1px solid #5aaeff;
}

.table-button:hover {
  background: #5aaeff;
  border-color: #6abeff;
}

.hide-button {
  background: #ff6b6b;
  color: white;
  border: 1px solid #ff5252;
}

.hide-button:hover {
  background: #ff5252;
  border-color: #ff4444;
}

.unhide-button {
  background: #51cf66;
  color: white;
  border: 1px solid #40c057;
}

.unhide-button:hover {
  background: #40c057;
  border-color: #37b24d;
}

.refresh-button {
  background: #ffd43b;
  color: #333;
  border: 1px solid #ffcc02;
}

.refresh-button:hover {
  background: #ffcc02;
  border-color: #ffb700;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.model-select {
  margin-top: 8px;
}

.hidden-messages-section {
  margin-top: 20px;
}

.hidden-messages-list {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 6px;
  border: 1px solid #3a3a3a;
  background: #1a1a1a;
}

.hidden-message-item {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #2a2a2a;
  transition: background 0.2s;
}

.hidden-message-item:last-child {
  border-bottom: none;
}

.hidden-message-item:hover {
  background: #2a2a2a;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.message-id {
  font-weight: bold;
  color: #4a9eff;
  font-size: 13px;
  min-width: 50px;
}

.message-role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.message-role.role-user {
  background: #3a5a3a;
  color: #90ee90;
}

.message-role.role-assistant {
  background: #3a3a5a;
  color: #90a0ee;
}

.message-role.role-system {
  background: #5a5a3a;
  color: #eea090;
}

.message-preview {
  flex: 1;
  color: #888;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.show-button {
  background: #4a9eff !important;
  color: white !important;
  padding: 6px 12px;
  border: 1px solid #5aaeff !important;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  min-width: 60px;
  text-align: center;
}

.show-button:hover {
  background: #5aaeff !important;
  border-color: #6abeff !important;
}

.mini-button {
  background: #666;
  color: white;
  border: 1px solid #777;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.mini-button:hover {
  background: #777;
  border-color: #888;
}

.empty-state {
  margin-top: 20px;
  padding: 20px;
  background: #2a2a2a;
  border-radius: 6px;
  text-align: center;
  color: #888;
  border: 1px solid #3a3a3a;
}
</style>
