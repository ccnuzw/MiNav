<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary-bg to-accent/10 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg relative overflow-hidden">
    <!-- 背景装饰元素 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative bg-white/80 dark:bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200/50 dark:border-dark-border/50 transform transition-all duration-300 hover:shadow-primary/10 dark:hover:shadow-accent/10">
      <!-- Logo和标题 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl shadow-lg mb-4 transform transition-transform hover:scale-105">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">管理员登录</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">请输入您的凭据以继续</p>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              用户名
            </span>
          </label>
          <input 
            v-model="username" 
            type="text" 
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border bg-white/50 dark:bg-dark-bg/50 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500" 
            placeholder="请输入用户名"
            required 
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              密码
            </span>
          </label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border bg-white/50 dark:bg-dark-bg/50 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500" 
            placeholder="请输入密码"
            required 
          />
        </div>
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登录中...
          </span>
          <span v-else>登录</span>
        </button>
      </form>

      <!-- 分隔线 -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200 dark:border-dark-border"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white/80 dark:bg-dark-card/90 text-gray-500 dark:text-gray-400">系统设置</span>
        </div>
      </div>

      <!-- 初始化用户按钮 -->
      <button 
        @click="handleInitUser"
        :disabled="initLoading"
        class="w-full py-3 px-4 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-accent/25 hover:shadow-accent/40 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        <svg v-if="initLoading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <span>{{ initLoading ? '初始化中...' : '初始化系统用户' }}</span>
      </button>

      <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
        首次使用时，点击上方按钮创建默认管理员账户
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const loading = ref(false);
const initLoading = ref(false);
const authStore = useAuthStore();
const notification = useNotificationStore();
const router = useRouter();

const handleLogin = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
        await authStore.login(username.value, password.value);
        notification.success('登录成功！');
        router.push('/admin');
    } catch (e) {
        notification.error('登录失败，请检查用户名和密码');
    } finally {
        loading.value = false;
    }
}

const handleInitUser = async () => {
    if (initLoading.value) return;
    initLoading.value = true;
    try {
        const response = await fetch('/api/setup');
        if (response.ok) {
            notification.success('初始化成功！默认账户：用户名 admin，密码 admin，请及时修改密码。', 6000);
        } else if (response.status === 400) {
            notification.warning('系统用户已存在，无需重复初始化');
        } else {
            notification.error('初始化失败，请稍后重试');
        }
    } catch (e) {
        notification.error('网络错误，请检查连接');
    } finally {
        initLoading.value = false;
    }
}
</script>
