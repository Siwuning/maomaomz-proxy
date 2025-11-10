import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { getScriptIdSafe } from './utils';

// 任务类型
export type TaskType = 'ui_generate' | 'ui_modify' | 'character_generate' | 'worldbook_generate' | 'anti_cliche';

// 任务状态
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// 任务接口
export interface Task {
  id: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
  progress: number;
  message: string;
  details: string[];
  startTime: number;
  endTime?: number;
  result?: any;
  error?: string;
}

// 从 localStorage 加载任务（插件环境）
const loadTasksFromVariables = (): Task[] => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) return [];

    const storageKey = `${scriptId}_tasks`;
    const savedDataString = localStorage.getItem(storageKey);

    if (savedDataString) {
      try {
        const savedTasks = JSON.parse(savedDataString);
    if (Array.isArray(savedTasks)) {
          console.log('📥 [任务管理] 从 localStorage 加载任务:', savedTasks.length);
      return savedTasks;
        }
      } catch (parseError) {
        console.error('❌ [任务管理] 解析任务数据失败:', parseError);
      }
    }
  } catch (error) {
    console.error('❌ [任务管理] 加载任务失败:', error);
  }
  return [];
};

// 保存任务到 localStorage（插件环境）
const saveTasksToVariables = (tasks: Task[]) => {
  try {
    const scriptId = getScriptIdSafe();
    if (!scriptId) return;

    // 只保存最近50个任务，避免数据过大
    const tasksToSave = tasks.slice(0, 50);

    const storageKey = `${scriptId}_tasks`;
    localStorage.setItem(storageKey, JSON.stringify(tasksToSave));
    console.log('💾 [任务管理] 任务已保存到 localStorage:', tasksToSave.length);
  } catch (error) {
    console.error('❌ [任务管理] 保存任务失败:', error);
  }
};

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>(loadTasksFromVariables());

  // 监听任务变化，自动保存
  watch(
    tasks,
    newTasks => {
      saveTasksToVariables(newTasks);
    },
    { deep: true },
  );

  // 创建任务
  const createTask = (type: TaskType, title: string): string => {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const task: Task = {
      id,
      type,
      title,
      status: 'pending',
      progress: 0,
      message: '准备中...',
      details: [],
      startTime: Date.now(),
    };
    tasks.value.unshift(task); // 新任务放在最前面
    console.log('✅ [任务管理] 创建任务:', task.id, task.title);
    return id;
  };

  // 获取任务
  const getTask = (id: string): Task | undefined => {
    return tasks.value.find(t => t.id === id);
  };

  // 更新任务进度
  const updateTaskProgress = (id: string, progress: number, message: string) => {
    const task = getTask(id);
    if (task) {
      task.progress = progress;
      task.message = message;
      if (task.status === 'pending') {
        task.status = 'running';
      }
    }
  };

  // 添加任务详情
  const addTaskDetail = (id: string, detail: string) => {
    const task = getTask(id);
    if (task) {
      task.details.push(detail);
    }
  };

  // 完成任务
  const completeTask = (id: string, result?: any) => {
    const task = getTask(id);
    if (task) {
      task.status = 'completed';
      task.progress = 100;
      task.message = '完成！';
      task.endTime = Date.now();
      task.result = result;
      console.log('✅ [任务管理] 任务完成:', task.id, `耗时: ${((task.endTime - task.startTime) / 1000).toFixed(1)}s`);
    }
  };

  // 任务失败
  const failTask = (id: string, error: string) => {
    const task = getTask(id);
    if (task) {
      task.status = 'failed';
      task.message = '失败';
      task.endTime = Date.now();
      task.error = error;
      console.error('❌ [任务管理] 任务失败:', task.id, error);
    }
  };

  // 取消任务
  const cancelTask = (id: string) => {
    const task = getTask(id);
    if (task) {
      task.status = 'cancelled';
      task.message = '已取消';
      task.endTime = Date.now();
      console.log('⚠️ [任务管理] 任务取消:', task.id);
    }
  };

  // 删除任务
  const removeTask = (id: string) => {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value.splice(index, 1);
      console.log('🗑️ [任务管理] 删除任务:', id);
    }
  };

  // 清除已完成的任务
  const clearCompletedTasks = () => {
    const beforeCount = tasks.value.length;
    tasks.value = tasks.value.filter(t => t.status === 'running' || t.status === 'pending');
    console.log(`🧹 [任务管理] 清除已完成任务: ${beforeCount} -> ${tasks.value.length}`);
  };

  // 清除所有任务
  const clearAllTasks = () => {
    tasks.value = [];
    console.log('🧹 [任务管理] 清除所有任务');
  };

  // 获取运行中的任务数量
  const runningTaskCount = () => {
    return tasks.value.filter(t => t.status === 'running').length;
  };

  return {
    tasks,
    createTask,
    getTask,
    updateTaskProgress,
    addTaskDetail,
    completeTask,
    failTask,
    cancelTask,
    removeTask,
    clearCompletedTasks,
    clearAllTasks,
    runningTaskCount,
  };
});
