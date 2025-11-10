<template>
  <div
    v-if="isVisible"
    :style="{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: isCollapsed ? 'auto' : '420px',
      maxHeight: isCollapsed ? 'none' : '600px',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
      border: '2px solid #4a9eff',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(74, 158, 255, 0.3)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      animation: 'slideIn 0.3s ease',
    }"
  >
    <!-- 头部 -->
    <div
      :style="{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        borderBottom: '1px solid rgba(74, 158, 255, 0.3)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s',
      }"
      @click="toggleCollapse"
      @mouseenter="
        e =>
          (e.currentTarget.style.background =
            'linear-gradient(135deg, rgba(74, 158, 255, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)')
      "
      @mouseleave="
        e =>
          (e.currentTarget.style.background =
            'linear-gradient(135deg, rgba(74, 158, 255, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)')
      "
    >
      <div :style="{ display: 'flex', alignItems: 'center', gap: '10px' }">
        <i class="fa-solid fa-tasks" style="color: #4a9eff"></i>
        <span :style="{ color: '#fff', fontSize: '15px', fontWeight: 600 }">任务中心</span>
        <span
          :style="{
            background: '#4a9eff',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
          }"
        >
          {{ taskStore.tasks.length }}
        </span>
        <span
          v-if="runningCount > 0"
          :style="{
            background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 600,
            animation: 'pulse 2s infinite',
          }"
        >
          {{ runningCount }} 运行中
        </span>
      </div>
      <div :style="{ display: 'flex', gap: '8px' }">
        <button
          v-if="!isCollapsed"
          title="清除已完成"
          :style="{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ccc',
            padding: '6px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '13px',
          }"
          @click.stop="clearCompleted"
          @mouseenter="
            e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = '#4a9eff';
              e.currentTarget.style.color = '#4a9eff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          "
          @mouseleave="
            e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ccc';
              e.currentTarget.style.transform = 'scale(1)';
            }
          "
        >
          <i class="fa-solid fa-broom"></i>
        </button>
        <button
          :title="isCollapsed ? '展开' : '折叠'"
          :style="{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ccc',
            padding: '6px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '13px',
          }"
          @mouseenter="
            e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = '#4a9eff';
              e.currentTarget.style.color = '#4a9eff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          "
          @mouseleave="
            e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ccc';
              e.currentTarget.style.transform = 'scale(1)';
            }
          "
        >
          <i :class="isCollapsed ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
        </button>
        <button
          title="关闭任务中心"
          :style="{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ccc',
            padding: '6px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '13px',
          }"
          @click.stop="hideTaskManager"
          @mouseenter="
            e => {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
              e.currentTarget.style.borderColor = '#ff6b6b';
              e.currentTarget.style.color = '#ff6b6b';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          "
          @mouseleave="
            e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ccc';
              e.currentTarget.style.transform = 'scale(1)';
            }
          "
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    </div>

    <!-- 任务列表 -->
    <div
      v-if="!isCollapsed"
      :style="{
        overflowY: 'auto',
        maxHeight: '500px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#4a9eff #1a1a1a',
      }"
    >
      <!-- 空状态提示 -->
      <div
        v-if="taskStore.tasks.length === 0"
        :style="{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
        }"
      >
        <i class="fa-solid fa-inbox" style="font-size: 48px; margin-bottom: 16px; color: #444"></i>
        <div>暂无任务</div>
        <div style="font-size: 12px; margin-top: 8px">发起生成任务后会在这里显示</div>
      </div>

      <!-- 任务项 -->
      <div
        v-for="task in taskStore.tasks"
        :key="task.id"
        :style="{
          background: 'rgba(42, 42, 42, 0.8)',
          border: `1px solid ${
            task.status === 'completed'
              ? 'rgba(81, 207, 102, 0.3)'
              : task.status === 'failed'
                ? 'rgba(255, 107, 107, 0.3)'
                : 'rgba(255, 255, 255, 0.1)'
          }`,
          borderRadius: '8px',
          padding: '12px',
          transition: 'all 0.2s',
        }"
        @mouseenter="
          e => {
            e.currentTarget.style.background = 'rgba(42, 42, 42, 1)';
            e.currentTarget.style.borderColor = 'rgba(74, 158, 255, 0.3)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }
        "
        @mouseleave="
          e => {
            e.currentTarget.style.background = 'rgba(42, 42, 42, 0.8)';
            e.currentTarget.style.borderColor =
              task.status === 'completed'
                ? 'rgba(81, 207, 102, 0.3)'
                : task.status === 'failed'
                  ? 'rgba(255, 107, 107, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }
        "
      >
        <!-- 任务头部 -->
        <div :style="{ display: 'flex', alignItems: 'flex-start', gap: '10px' }">
          <div
            :style="{
              flexShrink: 0,
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }"
          >
            <i v-if="task.status === 'running'" class="fa-solid fa-spinner fa-spin" style="color: #4a9eff"></i>
            <i v-else-if="task.status === 'completed'" class="fa-solid fa-check-circle" style="color: #51cf66"></i>
            <i v-else-if="task.status === 'failed'" class="fa-solid fa-times-circle" style="color: #ff6b6b"></i>
            <i v-else-if="task.status === 'cancelled'" class="fa-solid fa-ban" style="color: #ffa500"></i>
            <i v-else class="fa-solid fa-clock" style="color: #888"></i>
          </div>
          <div :style="{ flex: 1, minWidth: 0 }">
            <div
              :style="{
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }"
            >
              {{ task.title }}
            </div>
            <div :style="{ color: '#888', fontSize: '12px' }">{{ task.message }}</div>
          </div>
          <button
            title="删除任务"
            :style="{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ccc',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '13px',
              flexShrink: 0,
            }"
            @click="removeTask(task.id)"
            @mouseenter="
              e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = '#4a9eff';
                e.currentTarget.style.color = '#4a9eff';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            "
            @mouseleave="
              e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ccc';
                e.currentTarget.style.transform = 'scale(1)';
              }
            "
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- 进度条 -->
        <div
          v-if="task.status === 'running'"
          :style="{
            width: '100%',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '8px',
          }"
        >
          <div
            :style="{
              width: task.progress + '%',
              height: '100%',
              background: 'linear-gradient(90deg, #4a9eff 0%, #667eea 50%, #4a9eff 100%)',
              backgroundSize: '200% 100%',
              animation: 'progressSlide 2s linear infinite',
              transition: 'width 0.3s ease',
            }"
          ></div>
        </div>

        <!-- 详情 -->
        <div
          v-if="task.details.length > 0"
          :style="{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }"
        >
          <div
            v-for="(detail, idx) in task.details"
            :key="idx"
            :style="{ color: '#999', fontSize: '11px', padding: '2px 0' }"
          >
            {{ detail }}
          </div>
        </div>

        <!-- 错误信息 -->
        <div
          v-if="task.error"
          :style="{
            marginTop: '8px',
            padding: '8px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '4px',
            color: '#ff6b6b',
            fontSize: '12px',
            wordBreak: 'break-word',
          }"
        >
          {{ task.error }}
        </div>

        <!-- 耗时 -->
        <div :style="{ marginTop: '8px', color: '#666', fontSize: '11px', textAlign: 'right' }">
          {{ formatTaskTime(task) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTaskStore } from '../taskStore';

const taskStore = useTaskStore();
const isCollapsed = ref(false); // 默认展开
// 初始时就显示任务中心（如果有任务或等待任务加载）
const isVisible = ref(true);

const runningCount = computed(() => taskStore.runningTaskCount());

// 当有任务时自动显示
watch(
  () => taskStore.tasks.length,
  (newLen, oldLen) => {
    if (newLen > oldLen && newLen > 0) {
      isVisible.value = true;
    }
  },
);

console.log('📊 [TaskManager] 组件已挂载，当前任务数:', taskStore.tasks.length);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const hideTaskManager = () => {
  isVisible.value = false;
};

const clearCompleted = () => {
  taskStore.clearCompletedTasks();
};

const removeTask = (id: string) => {
  taskStore.removeTask(id);
};

const formatTaskTime = (task: any) => {
  if (task.endTime) {
    const duration = ((task.endTime - task.startTime) / 1000).toFixed(1);
    return `耗时 ${duration}s`;
  } else {
    const duration = ((Date.now() - task.startTime) / 1000).toFixed(0);
    return `进行中 ${duration}s`;
  }
};
</script>

<style>
@keyframes slideIn {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes progressSlide {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 滚动条样式 */
div[style*='overflowY']::-webkit-scrollbar {
  width: 6px;
}

div[style*='overflowY']::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

div[style*='overflowY']::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

div[style*='overflowY']::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}

@media (max-width: 768px) {
  div[style*='position: fixed'] {
    width: calc(100% - 40px) !important;
    left: 20px !important;
    right: 20px !important;
    bottom: 10px !important;
  }
}
</style>
