<template>
  <div class="token-stats-tab" style="padding: 20px 24px; background: #1a1a1a">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px">
      <div>
        <h2 style="margin: 0; font-size: 16px; color: #fff; display: flex; align-items: center; gap: 8px">
          <i class="fa-solid fa-chart-pie" style="color: #4a9eff"></i>
          Token 统计
        </h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #aaa">该角色卡与绑定的世界书条目的总 Tokens</p>
      </div>
      <div style="display: flex; align-items: center; gap: 8px">
        <span v-if="stats" style="font-size: 11px; color: #888"> 上次计算: {{ lastUpdatedText }} </span>
        <button
          :disabled="loading"
          style="
            padding: 8px 14px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            background: #4a9eff;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 6px;
          "
          @click="handleRefresh"
        >
          <i :class="loading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-rotate'"></i>
          {{ loading ? '重新计算中...' : '重新计算' }}
        </button>
      </div>
    </div>

    <div
      v-if="error"
      style="
        margin-bottom: 16px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(239, 68, 68, 0.1);
        color: #fecaca;
        font-size: 12px;
      "
    >
      {{ error }}
    </div>

    <div v-if="!envReady" style="padding: 16px; border-radius: 8px; background: #252525; color: #ccc; font-size: 13px">
      检测不到 SillyTavern / TavernHelper 环境，无法计算 Token。
      <br />
      请在 SillyTavern 中打开插件后再使用本功能。
    </div>

    <div
      v-else-if="!stats && !loading"
      style="padding: 16px; border-radius: 8px; background: #252525; color: #ccc; font-size: 13px"
    >
      点击右上角的“重新计算”按钮开始统计当前会话的 Token 使用情况。
    </div>

    <div v-else-if="stats" style="display: flex; flex-direction: column; gap: 16px">
      <!-- 顶部统计卡片 -->
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div
          class="stat-card"
          style="
            flex: 1;
            min-width: 180px;
            padding: 14px 16px;
            border-radius: 10px;
            background: #252525;
            border: 1px solid #333;
          "
        >
          <div style="font-size: 12px; color: #aaa; margin-bottom: 4px">总 Tokens</div>
          <div style="font-size: 22px; font-weight: 700; color: #f97316">
            {{ formatNumber(stats.totalTokens) }}
          </div>
          <div style="font-size: 11px; color: #777; margin-top: 4px">
            角色卡 + 世界书 + 聊天 + 预设 的大致 Token 总量
          </div>
        </div>

        <div
          class="stat-card"
          style="
            flex: 1;
            min-width: 180px;
            padding: 14px 16px;
            border-radius: 10px;
            background: #252525;
            border: 1px solid #333;
          "
        >
          <div style="font-size: 12px; color: #aaa; margin-bottom: 4px">角色卡</div>
          <div style="font-size: 20px; font-weight: 700; color: #38bdf8">
            {{ formatNumber(stats.characterCardTokens) }}
            <span style="font-size: 11px; color: #888; margin-left: 4px">
              ({{ percent(stats.characterCardTokens, stats.totalTokens) }}%)
            </span>
          </div>
          <div style="font-size: 11px; color: #777; margin-top: 4px">角色卡全部字段（描述 / 性格 / 场景 / 示例等）</div>
        </div>

        <div
          class="stat-card"
          style="
            flex: 1;
            min-width: 180px;
            padding: 14px 16px;
            border-radius: 10px;
            background: #252525;
            border: 1px solid #333;
          "
        >
          <div style="font-size: 12px; color: #aaa; margin-bottom: 4px">世界书合计</div>
          <div style="font-size: 20px; font-weight: 700; color: #facc15">
            {{ formatNumber(stats.lorebookTokens) }}
            <span style="font-size: 11px; color: #888; margin-left: 4px">
              ({{ percent(stats.lorebookTokens, stats.totalTokens) }}%)
            </span>
          </div>
          <div style="font-size: 11px; color: #777; margin-top: 4px">所有启用的世界书条目的 Token 总数</div>
        </div>

        <div
          class="stat-card"
          style="
            flex: 1;
            min-width: 180px;
            padding: 14px 16px;
            border-radius: 10px;
            background: #252525;
            border: 1px solid #333;
          "
        >
          <div style="font-size: 12px; color: #aaa; margin-bottom: 4px">聊天内容</div>
          <div style="font-size: 20px; font-weight: 700; color: #a855f7">
            {{ formatNumber(stats.chatTokens) }}
            <span style="font-size: 11px; color: #888; margin-left: 4px">
              ({{ percent(stats.chatTokens, stats.totalTokens) }}%)
            </span>
          </div>
          <div style="font-size: 11px; color: #777; margin-top: 4px">当前会话全部对话消息的 Tokens（粗略估算）</div>
        </div>

        <div
          class="stat-card"
          style="
            flex: 1;
            min-width: 180px;
            padding: 14px 16px;
            border-radius: 10px;
            background: #252525;
            border: 1px solid #333;
          "
        >
          <div style="font-size: 12px; color: #aaa; margin-bottom: 4px">预设/系统</div>
          <div style="font-size: 20px; font-weight: 700; color: #22c55e">
            {{ formatNumber(stats.systemPromptTokens + stats.personaTokens + stats.extensionTokens) }}
            <span style="font-size: 11px; color: #888; margin-left: 4px">
              ({{
                percent(stats.systemPromptTokens + stats.personaTokens + stats.extensionTokens, stats.totalTokens)
              }}%)
            </span>
          </div>
          <div style="font-size: 11px; color: #777; margin-top: 4px">
            系统提示 {{ formatNumber(stats.systemPromptTokens) }} + 人设 {{ formatNumber(stats.personaTokens) }} + 扩展
            {{ formatNumber(stats.extensionTokens) }}
          </div>
        </div>
      </div>

      <!-- 类型分布 -->
      <div style="padding: 14px 16px; border-radius: 10px; background: #252525; border: 1px solid #333">
        <div style="font-size: 13px; color: #ddd; margin-bottom: 8px; display: flex; align-items: center; gap: 8px">
          <i class="fa-solid fa-chart-pie" style="color: #4ade80"></i>
          类型分布（世界书内部）
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px">
          <div
            style="
              flex: 1;
              min-width: 140px;
              padding: 8px 10px;
              border-radius: 8px;
              background: rgba(56, 189, 248, 0.1);
              border: 1px solid rgba(56, 189, 248, 0.4);
            "
          >
            <div style="font-size: 11px; color: #7dd3fc">蓝灯（constant）</div>
            <div style="font-size: 16px; font-weight: 600; color: #e0f2fe">
              {{ formatNumber(stats.totalConstantTokens) }}
              <span style="font-size: 11px; color: #93c5fd">
                ({{ percent(stats.totalConstantTokens, stats.lorebookTokens) }}%)
              </span>
            </div>
          </div>
          <div
            style="
              flex: 1;
              min-width: 140px;
              padding: 8px 10px;
              border-radius: 8px;
              background: rgba(74, 222, 128, 0.08);
              border: 1px solid rgba(74, 222, 128, 0.4);
            "
          >
            <div style="font-size: 11px; color: #bbf7d0">绿灯（selective）</div>
            <div style="font-size: 16px; font-weight: 600; color: #dcfce7">
              {{ formatNumber(stats.totalSelectiveTokens) }}
              <span style="font-size: 11px; color: #bbf7d0">
                ({{ percent(stats.totalSelectiveTokens, stats.lorebookTokens) }}%)
              </span>
            </div>
          </div>
          <div
            style="
              flex: 1;
              min-width: 140px;
              padding: 8px 10px;
              border-radius: 8px;
              background: rgba(250, 204, 21, 0.06);
              border: 1px solid rgba(250, 204, 21, 0.4);
            "
          >
            <div style="font-size: 11px; color: #facc15">向量（vectorized）</div>
            <div style="font-size: 16px; font-weight: 600; color: #fef9c3">
              {{ formatNumber(stats.totalVectorizedTokens) }}
              <span style="font-size: 11px; color: #facc15">
                ({{ percent(stats.totalVectorizedTokens, stats.lorebookTokens) }}%)
              </span>
            </div>
          </div>
        </div>
        <p style="font-size: 11px; color: #777; margin-top: 8px">
          绿灯 / 向量条目只有在被触发时才会真正进入上下文，这里是“最多可能”占用的 Token。
        </p>
      </div>

      <!-- 按来源统计 -->
      <div style="padding: 14px 16px; border-radius: 10px; background: #252525; border: 1px solid #333">
        <div style="font-size: 13px; color: #ddd; margin-bottom: 8px; display: flex; align-items: center; gap: 8px">
          <i class="fa-solid fa-layer-group" style="color: #f97316"></i>
          按来源统计
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px">
          <div
            v-for="source of sourceOrder"
            :key="source"
            style="
              flex: 1;
              min-width: 160px;
              padding: 8px 10px;
              border-radius: 8px;
              background: #1f2933;
              border: 1px solid #374151;
            "
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px">
              <span style="color: #e5e7eb">{{ sourceLabels[source] }}</span>
              <span style="color: #fbbf24; font-weight: 600">
                {{ formatNumber(sourceTotal(stats.bySource[source])) }}
              </span>
            </div>
            <div v-if="stats.bySource[source].books.length" style="color: #9ca3af; font-size: 11px; margin-bottom: 4px">
              关联世界书：{{ stats.bySource[source].books.join('、') }}
            </div>
            <div style="display: flex; gap: 4px; font-size: 11px; color: #9ca3af">
              <span>蓝: {{ short(stats.bySource[source].c) }}</span>
              <span>绿: {{ short(stats.bySource[source].s) }}</span>
              <span>向: {{ short(stats.bySource[source].v) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 世界书明细 -->
      <div style="padding: 14px 16px; border-radius: 10px; background: #252525; border: 1px solid #333">
        <div style="font-size: 13px; color: #ddd; margin-bottom: 8px; display: flex; align-items: center; gap: 8px">
          <i class="fa-solid fa-book" style="color: #4ade80"></i>
          世界书明细（启用条目）
        </div>
        <div v-if="lorebookList.length === 0" style="font-size: 12px; color: #777; padding: 4px 0">
          没有检测到启用的世界书条目。
        </div>
        <div v-else style="max-height: 260px; overflow: auto; border-radius: 6px; border: 1px solid #374151">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px">
            <thead style="background: #111827">
              <tr>
                <th style="text-align: left; padding: 8px 10px; color: #9ca3af; font-weight: 500">世界书</th>
                <th style="text-align: left; padding: 8px 10px; color: #9ca3af; font-weight: 500">来源</th>
                <th style="text-align: right; padding: 8px 10px; color: #9ca3af; font-weight: 500">蓝灯</th>
                <th style="text-align: right; padding: 8px 10px; color: #9ca3af; font-weight: 500">绿灯</th>
                <th style="text-align: right; padding: 8px 10px; color: #9ca3af; font-weight: 500">向量</th>
                <th style="text-align: right; padding: 8px 10px; color: #9ca3af; font-weight: 500">合计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in lorebookList" :key="row.name" style="border-top: 1px solid #111827">
                <td style="padding: 6px 10px; color: #e5e7eb">{{ row.name }}</td>
                <td style="padding: 6px 10px; color: #9ca3af">{{ sourceLabels[row.source] }}</td>
                <td style="padding: 6px 10px; text-align: right; color: #bfdbfe">{{ short(row.c) }}</td>
                <td style="padding: 6px 10px; text-align: right; color: #bbf7d0">{{ short(row.s) }}</td>
                <td style="padding: 6px 10px; text-align: right; color: #facc15">{{ short(row.v) }}</td>
                <td style="padding: 6px 10px; text-align: right; color: #fde68a; font-weight: 600">
                  {{ short(row.t) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style="font-size: 11px; color: #6b7280; margin-top: 8px">
          这里只统计已启用的条目，用来粗略估算世界书对上下文长度的影响。
        </p>
      </div>
    </div>

    <div
      v-if="loading && !stats"
      style="margin-top: 16px; font-size: 12px; color: #999; display: flex; align-items: center; gap: 6px"
    >
      <i class="fa-solid fa-spinner fa-spin"></i>
      正在扫描角色卡和世界书，请稍候…
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type SourceKey = 'primary' | 'additional' | 'global' | 'chat';

interface SourceStats {
  c: number;
  s: number;
  v: number;
  books: string[];
}

interface LorebookStats {
  c: number;
  s: number;
  v: number;
  t: number;
  source: SourceKey;
}

interface TokenStats {
  characterName: string;
  characterCardTokens: number;
  totalConstantTokens: number;
  totalSelectiveTokens: number;
  totalVectorizedTokens: number;
  lorebookTokens: number;
  chatTokens: number;
  // 新增：预设相关
  systemPromptTokens: number;
  personaTokens: number;
  extensionTokens: number;
  totalTokens: number;
  bySource: Record<SourceKey, SourceStats>;
  byLorebook: Record<string, LorebookStats>;
}

const loading = ref(false);
const error = ref<string | null>(null);
const stats = ref<TokenStats | null>(null);
const lastUpdated = ref<number | null>(null);

const envReady = computed(() => {
  const w = window as any;
  return !!(w.SillyTavern && w.TavernHelper);
});

const sourceOrder: SourceKey[] = ['primary', 'additional', 'global', 'chat'];

const sourceLabels: Record<SourceKey, string> = {
  primary: '主书',
  additional: '附加',
  global: '全局',
  chat: '聊天',
};

const lorebookList = computed(() => {
  if (!stats.value) return [] as Array<LorebookStats & { name: string }>;
  return Object.entries(stats.value.byLorebook)
    .map(([name, s]: [string, LorebookStats]) => ({ name, ...s }))
    .sort((a, b) => b.t - a.t);
});

const lastUpdatedText = computed(() => {
  if (!lastUpdated.value) return '尚未计算';
  const date = new Date(lastUpdated.value);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
});

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function short(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function percent(part: number, total: number): string {
  if (!total || total <= 0) return '0.0';
  return ((part / total) * 100).toFixed(1);
}

function sourceTotal(s: SourceStats): number {
  return s.c + s.s + s.v;
}

function getTokenCount(text: string | null | undefined): number {
  if (!text) return 0;
  try {
    const w = window as any;
    if (w.SillyTavern && typeof w.SillyTavern.getTokenCount === 'function') {
      return w.SillyTavern.getTokenCount(text);
    }
  } catch (e) {
    console.warn('getTokenCount 调用失败，使用近似值:', e);
  }
  // 粗略估算：英文 4 字符一个 token，中文大约 1-2 字符
  return Math.ceil(text.length / 4);
}

function collectPresetPromptTexts(st: any, tav: any): { texts: string[]; details: string } {
  const texts: string[] = [];
  const seen = new Set<string>(); // 避免重复统计
  let presetCount = 0;
  let oaiCount = 0;
  let extCount = 0;

  const pushText = (value: unknown, source: string) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      texts.push(value);
      return true;
    }
    return false;
  };

  // 1) 当前预设的 prompts（tavern helper）- 最重要！
  if (tav && typeof tav.getPreset === 'function') {
    try {
      const preset = tav.getPreset('in_use');
      console.log('[TokenStats] 预设对象:', preset);
      if (preset && Array.isArray(preset.prompts)) {
        console.log('[TokenStats] 预设 prompts 数量:', preset.prompts.length);
        for (const prompt of preset.prompts) {
          // 只统计有 content 的提示词（普通提示词和系统提示词）
          // 占位符提示词（charDescription等）没有 content
          if (prompt?.content) {
            // 检查是否启用（enabled 可能是 undefined，默认视为启用）
            const isEnabled = prompt.enabled !== false;
            if (isEnabled && pushText(prompt.content, 'preset')) {
              presetCount++;
              console.log('[TokenStats] 添加预设提示词:', prompt.id || prompt.name, '长度:', prompt.content.length);
            }
          }
        }
      }
      // 也检查 prompts_unused（未添加到列表的提示词）
      if (preset && Array.isArray(preset.prompts_unused)) {
        for (const prompt of preset.prompts_unused) {
          if (prompt?.content && prompt.enabled !== false) {
            if (pushText(prompt.content, 'preset_unused')) {
              presetCount++;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[TokenStats] tav.getPreset("in_use") 失败:', e);
    }
  }

  // 2) chatCompletionSettings / oai_settings - 备用来源
  const oai = st?.chatCompletionSettings;
  if (oai && typeof oai === 'object') {
    const promptFields = [
      'main_prompt',
      'nsfw_prompt',
      'jailbreak_prompt',
      'jailbreak_system',
      'new_chat_prompt',
      'new_group_chat_prompt',
      'new_example_chat_prompt',
      'continue_nudge_prompt',
      'group_nudge_prompt',
      'impersonation_prompt',
      'system_prompt',
      'wi_format',
      'scenario_format',
      'personality_format',
      'char_description_format',
      'enhance_definitions',
    ];
    for (const field of promptFields) {
      if (oai[field] && pushText(oai[field], `oai.${field}`)) {
        oaiCount++;
      }
    }
    // prompts 数组
    if (Array.isArray(oai.prompts)) {
      for (const item of oai.prompts) {
        if (item?.content && pushText(item.content, 'oai.prompts')) {
          oaiCount++;
        }
      }
    }
  }

  // 3) 作者注释 (Author's Note)
  const context = (st as any)?.context;
  if (context?.note_prompt && pushText(context.note_prompt, 'author_note')) {
    extCount++;
  }

  // 4) 扩展注入的提示词
  if (st?.extensionPrompts && typeof st.extensionPrompts === 'object') {
    for (const [key, ext] of Object.entries(st.extensionPrompts)) {
      if (ext && typeof ext === 'object') {
        const extObj = ext as any;
        if (extObj.value && pushText(extObj.value, `ext.${key}`)) {
          extCount++;
        }
      }
    }
  }

  const details = `预设:${presetCount} OAI:${oaiCount} 扩展:${extCount}`;
  return { texts, details };
}

async function calculateTokenStats(): Promise<void> {
  if (!envReady.value) {
    error.value = '未检测到 SillyTavern / TavernHelper 环境，无法计算 Token。';
    return;
  }

  loading.value = true;
  error.value = null;

  const w = window as any;
  const st = w.SillyTavern;
  const tav = w.TavernHelper;

  const emptySource = (): SourceStats => ({ c: 0, s: 0, v: 0, books: [] });

  const local: TokenStats = {
    characterName: '(未检测到角色)',
    characterCardTokens: 0,
    totalConstantTokens: 0,
    totalSelectiveTokens: 0,
    totalVectorizedTokens: 0,
    lorebookTokens: 0,
    chatTokens: 0,
    // 新增：预设相关
    systemPromptTokens: 0,
    personaTokens: 0,
    extensionTokens: 0,
    totalTokens: 0,
    bySource: {
      primary: emptySource(),
      additional: emptySource(),
      global: emptySource(),
      chat: emptySource(),
    },
    byLorebook: {},
  };

  try {
    // 1. 角色卡
    let characterTokensComputed = false;

    // 1.1 优先使用 TavernHelper.getCharData('current')
    if (tav && typeof tav.getCharData === 'function') {
      try {
        const charData = tav.getCharData('current');
        if (charData) {
          console.log('[TokenStats] 使用 TavernHelper.getCharData("current") 获取到角色:', charData.name);
          local.characterName = charData.name || '(未命名角色)';
          // 统计所有角色卡字段
          const fields: string[] = [];
          // V1 字段
          if (charData.description) fields.push(charData.description);
          if (charData.personality) fields.push(charData.personality);
          if (charData.scenario) fields.push(charData.scenario);
          if (charData.first_mes) fields.push(charData.first_mes);
          if (charData.mes_example) fields.push(charData.mes_example);
          if (charData.creatorcomment) fields.push(charData.creatorcomment);
          // V2 字段 (data 对象)
          const v2 = charData.data;
          if (v2) {
            if (v2.system_prompt) fields.push(v2.system_prompt);
            if (v2.post_history_instructions) fields.push(v2.post_history_instructions);
            if (v2.creator_notes) fields.push(v2.creator_notes);
            if (Array.isArray(v2.alternate_greetings)) {
              fields.push(...v2.alternate_greetings.filter(Boolean));
            }
            // 深度提示词
            if (v2.extensions?.depth_prompt?.prompt) {
              fields.push(v2.extensions.depth_prompt.prompt);
            }
          }
          local.characterCardTokens = getTokenCount(fields.join('\n'));
          characterTokensComputed = local.characterCardTokens > 0;
        } else {
          console.log('[TokenStats] TavernHelper.getCharData("current") 返回空');
        }
      } catch (e) {
        console.warn('TavernHelper.getCharData("current") 调用失败:', e);
      }
    }

    // 1.2 降级：直接使用 SillyTavern.characters / groups
    if (!characterTokensComputed && st && Array.isArray(st.characters) && st.characters.length > 0) {
      const charId = (st as any).characterId;
      let ch: any = null;

      // characterId 可能是数字索引，也可能是字符串
      if (typeof charId === 'number' && st.characters[charId]) {
        ch = st.characters[charId];
      } else if (typeof charId === 'string') {
        // 尝试作为数字索引
        const numId = parseInt(charId, 10);
        if (!isNaN(numId) && st.characters[numId]) {
          ch = st.characters[numId];
        }
      }

      // 如果还没找到，取第一个角色（当前聊天的角色）
      if (!ch && st.characters.length > 0) {
        // 尝试用 name2（当前角色名）来匹配
        const name2 = (st as any).name2;
        if (name2) {
          ch = st.characters.find((c: any) => c.name === name2);
        }
        // 最后兜底：取第一个
        if (!ch) {
          ch = st.characters[0];
        }
      }

      if (ch) {
        console.log('[TokenStats] 使用 SillyTavern.characters 获取角色:', ch.name);
        local.characterName = ch.name || '(未命名角色)';
        // 统计所有角色卡字段
        const fields: string[] = [];
        // V1 字段
        if (ch.description) fields.push(ch.description);
        if (ch.personality) fields.push(ch.personality);
        if (ch.scenario) fields.push(ch.scenario);
        if (ch.first_mes) fields.push(ch.first_mes);
        if (ch.mes_example) fields.push(ch.mes_example);
        if (ch.creatorcomment) fields.push(ch.creatorcomment);
        // V2 字段 (data 对象)
        const v2 = ch.data;
        if (v2) {
          if (v2.system_prompt) fields.push(v2.system_prompt);
          if (v2.post_history_instructions) fields.push(v2.post_history_instructions);
          if (v2.creator_notes) fields.push(v2.creator_notes);
          if (Array.isArray(v2.alternate_greetings)) {
            fields.push(...v2.alternate_greetings.filter(Boolean));
          }
          // 深度提示词
          if (v2.extensions?.depth_prompt?.prompt) {
            fields.push(v2.extensions.depth_prompt.prompt);
          }
        }
        local.characterCardTokens = getTokenCount(fields.join('\n'));
        characterTokensComputed = local.characterCardTokens > 0;
      }
    }

    if (!characterTokensComputed && st && (st as any).groupId && Array.isArray((st as any).groups)) {
      const groupId = (st as any).groupId;
      const groups = (st as any).groups as any[];
      const group = groups.find((g: any) => String(g.id) === String(groupId));
      if (group && Array.isArray(group.members) && Array.isArray(st.characters)) {
        console.log('[TokenStats] 使用 SillyTavern.groups 获取群组:', group.name, 'id=', groupId);
        local.characterName = group.name || `群组 ${groupId}`;
        let total = 0;
        for (const avatar of group.members) {
          const member = (st.characters as any[]).find((c: any) => c.avatar === avatar);
          if (member) {
            // 统计所有角色卡字段
            const fields: string[] = [];
            // V1 字段
            if (member.description) fields.push(member.description);
            if (member.personality) fields.push(member.personality);
            if (member.scenario) fields.push(member.scenario);
            if (member.first_mes) fields.push(member.first_mes);
            if (member.mes_example) fields.push(member.mes_example);
            if (member.creatorcomment) fields.push(member.creatorcomment);
            // V2 字段 (data 对象)
            const v2 = member.data;
            if (v2) {
              if (v2.system_prompt) fields.push(v2.system_prompt);
              if (v2.post_history_instructions) fields.push(v2.post_history_instructions);
              if (v2.creator_notes) fields.push(v2.creator_notes);
              if (Array.isArray(v2.alternate_greetings)) {
                fields.push(...v2.alternate_greetings.filter(Boolean));
              }
              if (v2.extensions?.depth_prompt?.prompt) {
                fields.push(v2.extensions.depth_prompt.prompt);
              }
            }
            total += getTokenCount(fields.join('\n'));
          }
        }
        local.characterCardTokens = total;
        characterTokensComputed = local.characterCardTokens > 0;
      }
    }

    // 1.5 预设提示词统计（收集所有系统提示词文本）
    try {
      const { texts: presetTexts, details } = collectPresetPromptTexts(st, tav);
      for (const text of presetTexts) {
        local.systemPromptTokens += getTokenCount(text);
      }
      console.log(
        '[TokenStats] 预设/系统提示词 Tokens:',
        local.systemPromptTokens,
        `(${details}, 共${presetTexts.length}条)`,
      );

      // 用户人设（单独统计）
      if (st?.powerUserSettings?.persona_description) {
        local.personaTokens = getTokenCount(st.powerUserSettings.persona_description);
        console.log('[TokenStats] 用户人设 Tokens:', local.personaTokens);
      }

      // 扩展注入（已在 collectPresetPromptTexts 中处理，这里只记录日志）
      // extensionTokens 保持为 0，因为已经算入 systemPromptTokens
    } catch (e) {
      console.warn('[TokenStats] 获取预设相关 Token 失败:', e);
    }

    // 2. 收集世界书
    const lorebooksToProcess = new Map<string, SourceKey>();

    let settings: any = null;
    if (tav && typeof tav.getLorebookSettings === 'function') {
      try {
        settings = await tav.getLorebookSettings();
      } catch (e) {
        console.warn('getLorebookSettings 调用失败:', e);
      }
    }

    let charLorebooks: { primary: string | null; additional: string[] } = {
      primary: null,
      additional: [],
    };

    if (tav && typeof tav.getCharLorebooks === 'function') {
      try {
        charLorebooks = await tav.getCharLorebooks();
      } catch (e) {
        console.warn('getCharLorebooks 调用失败:', e);
      }
    }

    if (charLorebooks.primary) {
      lorebooksToProcess.set(charLorebooks.primary, 'primary');
    }
    if (Array.isArray(charLorebooks.additional)) {
      for (const name of charLorebooks.additional) {
        if (!lorebooksToProcess.has(name)) {
          lorebooksToProcess.set(name, 'additional');
        }
      }
    }

    if (settings && Array.isArray(settings.selected_global_lorebooks)) {
      for (const name of settings.selected_global_lorebooks as string[]) {
        if (!lorebooksToProcess.has(name)) {
          lorebooksToProcess.set(name, 'global');
        }
      }
    }

    // 注意：不再调用 getOrCreateChatLorebook()，因为它会自动创建聊天世界书
    // "聊天" Token 统计的是对话消息内容，不是聊天世界书

    // 3. 遍历世界书条目
    for (const [bookName, source] of lorebooksToProcess.entries()) {
      local.byLorebook[bookName] = {
        c: 0,
        s: 0,
        v: 0,
        t: 0,
        source,
      };

      let entries: any[] = [];
      if (tav && typeof tav.getLorebookEntries === 'function') {
        try {
          entries = await tav.getLorebookEntries(bookName);
        } catch (e) {
          console.warn(`getLorebookEntries('${bookName}') 失败:`, e);
          continue;
        }
      }

      for (const entry of entries) {
        // 跳过禁用的条目
        if (!entry || !entry.enabled) continue;

        // 计算 Token 数量：优先使用预计算的 tk 字段，与参考脚本保持一致
        const entryTokens =
          typeof (entry as any).tk === 'number' && !Number.isNaN((entry as any).tk)
            ? (entry as any).tk
            : getTokenCount(entry.content);

        // 判断条目类型：使用 entry.type 字符串字段
        let kind: 'c' | 's' | 'v';
        if (entry.type === 'constant') {
          kind = 'c'; // 蓝灯 - constant
        } else if (entry.type === 'vectorized') {
          kind = 'v'; // 向量 - vectorized
        } else {
          kind = 's'; // 绿灯 - selective（默认）
        }

        const bySource = local.bySource[source];
        const byBook = local.byLorebook[bookName];

        if (kind === 'c') {
          local.totalConstantTokens += entryTokens;
          bySource.c += entryTokens;
          byBook.c += entryTokens;
        } else if (kind === 's') {
          local.totalSelectiveTokens += entryTokens;
          bySource.s += entryTokens;
          byBook.s += entryTokens;
        } else {
          local.totalVectorizedTokens += entryTokens;
          bySource.v += entryTokens;
          byBook.v += entryTokens;
        }

        byBook.t += entryTokens;

        if (!bySource.books.includes(bookName)) {
          bySource.books.push(bookName);
        }
      }
    }

    local.lorebookTokens = local.totalConstantTokens + local.totalSelectiveTokens + local.totalVectorizedTokens;

    // 4. 聊天内容（直接统计消息文本）
    try {
      let messages: any[] = [];

      if (st && Array.isArray(st.chat)) {
        messages = st.chat;
      } else if (w.TavernHelper && typeof w.TavernHelper.getChatMessages === 'function') {
        try {
          messages = w.TavernHelper.getChatMessages('0-{{lastMessageId}}') || [];
        } catch (e) {
          console.warn('TavernHelper.getChatMessages 调用失败:', e);
        }
      }

      if (Array.isArray(messages) && messages.length > 0) {
        // 过滤掉隐藏的消息（API不会发送隐藏的消息）
        const visibleMessages = messages.filter((m: any) => !m.is_hidden);
        console.log('[TokenStats] 总消息数:', messages.length, '可见消息数:', visibleMessages.length);

        // 直接统计消息内容，不加额外格式化
        const text = visibleMessages
          .map((m: any) => (typeof m.mes === 'string' ? m.mes : typeof m.message === 'string' ? m.message : ''))
          .filter(Boolean)
          .join('\n');
        local.chatTokens = getTokenCount(text);
        console.log('[TokenStats] 聊天内容 Tokens:', local.chatTokens, '(共', visibleMessages.length, '条可见消息)');
      } else {
        local.chatTokens = 0;
      }
    } catch (e) {
      console.warn('计算聊天内容 Token 失败:', e);
      local.chatTokens = 0;
    }

    // 总 Token = 角色卡 + 世界书 + 聊天内容 + 预设相关
    local.totalTokens =
      local.characterCardTokens +
      local.lorebookTokens +
      local.chatTokens +
      local.systemPromptTokens +
      local.personaTokens +
      local.extensionTokens;

    stats.value = local;
    lastUpdated.value = Date.now();
  } catch (e) {
    console.error('计算 Token 统计时出错:', e);
    error.value = (e as Error).message || '计算 Token 统计时发生未知错误';
  } finally {
    loading.value = false;
  }
}

function handleRefresh() {
  void calculateTokenStats();
}

onMounted(() => {
  // 默认不自动计算，避免每次打开面板都扫一次。用户手动点击按钮即可。
});
</script>
