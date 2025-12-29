<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
      <transition-group name="toast">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="pointer-events-auto min-w-[300px] max-w-md"
        >
          <div 
            :class="[
              'flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300',
              getTypeClasses(notification.type)
            ]"
          >
            <!-- 图标 -->
            <div :class="['flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center', getIconBgClass(notification.type)]">
              <i :class="['text-sm', getIcon(notification.type)]"></i>
            </div>
            
            <!-- 内容 -->
            <div class="flex-1 pt-0.5">
              <p class="text-sm font-medium" :class="getTextClass(notification.type)">
                {{ notification.message }}
              </p>
            </div>
            
            <!-- 关闭按钮 -->
            <button 
              @click="removeNotification(notification.id)"
              class="flex-shrink-0 p-1 rounded-md transition-colors"
              :class="getCloseButtonClass(notification.type)"
            >
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '../stores/notification';

const notificationStore = useNotificationStore();
const { notifications } = storeToRefs(notificationStore);
const { removeNotification } = notificationStore;

const getTypeClasses = (type) => {
  const classes = {
    success: 'bg-green-50/95 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    error: 'bg-red-50/95 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50/95 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50/95 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
  };
  return classes[type] || classes.info;
};

const getIconBgClass = (type) => {
  const classes = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  return classes[type] || classes.info;
};

const getIcon = (type) => {
  const icons = {
    success: 'fas fa-check',
    error: 'fas fa-times',
    warning: 'fas fa-exclamation',
    info: 'fas fa-info'
  };
  return icons[type] || icons.info;
};

const getTextClass = (type) => {
  const classes = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-amber-800 dark:text-amber-200',
    info: 'text-blue-800 dark:text-blue-200'
  };
  return classes[type] || classes.info;
};

const getCloseButtonClass = (type) => {
  const classes = {
    success: 'text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50',
    error: 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/50',
    warning: 'text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50',
    info: 'text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50'
  };
  return classes[type] || classes.info;
};
</script>

<style scoped>
/* Toast 进入/离开动画 */
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.25s ease-in;
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
