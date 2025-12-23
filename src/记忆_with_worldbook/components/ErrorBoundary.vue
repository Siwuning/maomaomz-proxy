<template>
  <div v-if="error" class="error-boundary">
    <div
      style="
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        padding: 20px;
        margin: 20px;
        text-align: center;
      "
    >
      <div style="font-size: 32px; margin-bottom: 12px">❌</div>
      <div style="color: #ef4444; font-size: 16px; font-weight: 600; margin-bottom: 8px">组件加载失败</div>
      <div style="color: #94a3b8; font-size: 13px; margin-bottom: 16px; word-break: break-all">
        {{ errorMessage }}
      </div>
      <button
        style="
          background: #4a9eff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        "
        @click="retry"
      >
        重试
      </button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';

const error = ref<Error | null>(null);
const errorMessage = ref('');

onErrorCaptured(err => {
  error.value = err;
  errorMessage.value = err?.message || String(err);
  console.error('🔴 组件渲染错误:', err);
  return false; // 阻止错误继续传播
});

const retry = () => {
  error.value = null;
  errorMessage.value = '';
};
</script>
