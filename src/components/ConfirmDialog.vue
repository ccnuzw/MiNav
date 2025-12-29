<template>
  <teleport to="body">
    <transition name="dialog">
      <div 
        v-if="confirmDialog.show" 
        class="fixed inset-0 z-[101] flex items-center justify-center"
      >
        <!-- 遮罩层 -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleCancel"
        ></div>
        
        <!-- 对话框 -->
        <div class="relative bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
          <!-- 头部 -->
          <div class="px-6 pt-6 pb-4">
            <div class="flex items-center gap-4">
              <!-- 图标 -->
              <div :class="['flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center', getIconBgClass]">
                <i :class="['text-xl', getIcon]"></i>
              </div>
              
              <!-- 标题和内容 -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ confirmDialog.title }}
                </h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ confirmDialog.message }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- 按钮区域 -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              @click="handleCancel"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              {{ confirmDialog.cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :class="['px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors', getConfirmButtonClass]"
            >
              {{ confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '../stores/notification';

const notificationStore = useNotificationStore();
const { confirmDialog } = storeToRefs(notificationStore);
const { resolveConfirm } = notificationStore;

const getIconBgClass = computed(() => {
  const classes = {
    warning: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
  };
  return classes[confirmDialog.value.type] || classes.warning;
});

const getIcon = computed(() => {
  const icons = {
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-trash-alt',
    info: 'fas fa-question-circle'
  };
  return icons[confirmDialog.value.type] || icons.warning;
});

const getConfirmButtonClass = computed(() => {
  const classes = {
    warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
    danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    info: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
  };
  return classes[confirmDialog.value.type] || classes.warning;
});

const handleConfirm = () => {
  resolveConfirm(true);
};

const handleCancel = () => {
  resolveConfirm(false);
};
</script>

<style scoped>
/* 对话框动画 */
.dialog-enter-active {
  animation: dialog-in 0.25s ease-out;
}

.dialog-leave-active {
  animation: dialog-out 0.2s ease-in;
}

@keyframes dialog-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes dialog-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.dialog-enter-active > div:last-child {
  animation: dialog-content-in 0.25s ease-out;
}

.dialog-leave-active > div:last-child {
  animation: dialog-content-out 0.2s ease-in;
}

@keyframes dialog-content-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dialog-content-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}
</style>
