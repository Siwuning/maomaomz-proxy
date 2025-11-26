<template>
  <div class="token-stats-tab" style="padding: 20px 24px; background: #1a1a1a">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px">
      <div>
        <h2 style="margin: 0; font-size: 16px; color: #fff; display: flex; align-items: center; gap: 8px">
          <i class="fa-solid fa-chart-pie" style="color: #4a9eff"></i>
          Token 统计
        </h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #aaa">
          粗略了解当前角色卡、世界书和聊天内容大概消耗了多少上下文 Tokens。
        </p>
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
            角色卡 + 世界书 + 聊天内容（世界书仅统计启用条目）
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
          <div style="font-size: 11px; color: #777; margin-top: 4px">描述 / 性格 / 场景 / 首条消息</div>
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
          <div style="font-size: 11px; color: #777; margin-top: 4px">启用的常驻/关键词/向量条目</div>
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
          <div style="font-size: 11px; color: #777; margin-top: 4px">最近若干条对话消息（粗略估算）</div>
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
  totalTokens: number;
  chatTokens: number;
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
    .map(([name, s]) => ({ name, ...s }))
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
          const fields = [charData.description, charData.personality, charData.scenario, charData.first_mes]
            .filter(Boolean)
            .join('\n');
          local.characterCardTokens = getTokenCount(fields);
          characterTokensComputed = local.characterCardTokens > 0;
        } else {
          console.log('[TokenStats] TavernHelper.getCharData("current") 返回空');
        }
      } catch (e) {
        console.warn('TavernHelper.getCharData("current") 调用失败:', e);
      }
    }

    // 1.2 降级：直接使用 SillyTavern.characters / groups
    if (
      !characterTokensComputed &&
      st &&
      typeof (st as any).characterId !== 'undefined' &&
      Array.isArray(st.characters)
    ) {
      const idx = (st as any).characterId as any;
      const ch = (st.characters as any[])[idx];
      if (ch) {
        console.log('[TokenStats] 使用 SillyTavern.characters 和 characterId 获取角色:', ch.name, 'id=', idx);
        local.characterName = ch.name || '(未命名角色)';
        const fields = [ch.description, ch.personality, ch.scenario, ch.first_mes].filter(Boolean).join('\n');
        local.characterCardTokens = getTokenCount(fields);
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
            const fields = [member.description, member.personality, member.scenario, member.first_mes]
              .filter(Boolean)
              .join('\n');
            total += getTokenCount(fields);
          }
        }
        local.characterCardTokens = total;
        characterTokensComputed = local.characterCardTokens > 0;
      }
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

    if (tav && typeof tav.getOrCreateChatLorebook === 'function') {
      try {
        const chatBook = await tav.getOrCreateChatLorebook();
        if (chatBook && !lorebooksToProcess.has(chatBook)) {
          lorebooksToProcess.set(chatBook, 'chat');
        }
      } catch (e) {
        console.warn('getOrCreateChatLorebook 调用失败:', e);
      }
    }

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
        if (!entry || entry.enabled === false) continue;

        const entryTokens =
          typeof entry.tk === 'number' && !Number.isNaN(entry.tk) ? entry.tk : getTokenCount(entry.content);

        let kind: 'c' | 's' | 'v';
        if (entry.type === 'constant') kind = 'c';
        else if (entry.type === 'vectorized') kind = 'v';
        else kind = 's';

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

    // 4. 聊天内容（最近若干条消息，粗略估算）
    try {
      let messages: any[] = [];

      if (st && Array.isArray(st.chat)) {
        console.log('[TokenStats] 使用 SillyTavern.chat 统计聊天内容，条数:', st.chat.length);
        messages = st.chat;
      } else if (
        typeof (w as any).TavernHelper !== 'undefined' &&
        typeof (w as any).TavernHelper.getChatMessages === 'function'
      ) {
        try {
          messages = (w as any).TavernHelper.getChatMessages('0-{{lastMessageId}}') || [];
          console.log('[TokenStats] 使用 TavernHelper.getChatMessages 统计聊天内容，条数:', messages.length);
        } catch (e) {
          console.warn('TavernHelper.getChatMessages 调用失败:', e);
        }
      }

      if (Array.isArray(messages) && messages.length > 0) {
        const maxMessages = 50;
        const start = Math.max(0, messages.length - maxMessages);
        const recent = messages.slice(start);
        const text = recent
          .map((m: any) => (typeof m.mes === 'string' ? m.mes : ((m.message as string) ?? '')))
          .filter(Boolean)
          .join('\n');
        local.chatTokens = getTokenCount(text);
      } else {
        local.chatTokens = 0;
      }
    } catch (e) {
      console.warn('计算聊天内容 Token 失败:', e);
      local.chatTokens = 0;
    }

    local.totalTokens = local.characterCardTokens + local.lorebookTokens + local.chatTokens;

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
