<template>
  <div class="min-h-screen bg-secondary-bg dark:bg-dark-bg p-8 text-gray-900 dark:text-white">
    <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 class="text-3xl font-bold">后台管理</h1>
            <div class="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                 <span class="text-sm text-gray-500">欢迎, 管理员</span>
                 <button @click="logout" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm">退出登录</button>
            </div>
        </div>
        
        <!-- Tabs -->
        <!-- Tabs -->
        <!-- Tabs (Desktop) -->
        <div class="hidden md:flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-6 w-full overflow-x-auto">
            <button 
                @click="activeTab = 'items'"
                :class="activeTab === 'items' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >项目管理</button>
            <button 
                @click="activeTab = 'categories'"
                :class="activeTab === 'categories' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >分类管理</button>
            <button 
                @click="activeTab = 'tags'"
                :class="activeTab === 'tags' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >标签管理</button>
            <button 
                @click="activeTab = 'feeds'"
                :class="activeTab === 'feeds' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >订阅管理</button>
            <button 
                @click="activeTab = 'articles'"
                :class="activeTab === 'articles' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >文章管理</button>
            <button 
                @click="activeTab = 'settings'"
                :class="activeTab === 'settings' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >网站设置</button>
            <button 
                @click="activeTab = 'friendlinks'"
                :class="activeTab === 'friendlinks' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >友情链接</button>
            <button 
                @click="activeTab = 'account'"
                :class="activeTab === 'account' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >账户安全</button>
            <button 
                @click="activeTab = 'feedbacks'"
                :class="activeTab === 'feedbacks' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-shrink-0"
            >反馈管理</button>
        </div>

        <!-- Mobile Navigation (Dropdown) -->
        <div class="md:hidden mb-6">
            <select v-model="activeTab" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary outline-none">
                <option value="items">项目管理</option>
                <option value="categories">分类管理</option>
                <option value="tags">标签管理</option>
                <option value="feeds">订阅管理</option>
                <option value="articles">文章管理</option>
                <option value="settings">网站设置</option>
                <option value="friendlinks">友情链接</option>
                <option value="account">账户安全</option>
                <option value="feedbacks">反馈管理</option>
            </select>
        </div>

        <div v-if="activeTab === 'items'">
            <AdminItems :categories="categories" />
        </div>
        <div v-if="activeTab === 'categories'">
            <AdminCategories />
        </div>
        <div v-if="activeTab === 'tags'">
            <AdminTags />
        </div>
        <div v-if="activeTab === 'settings'">
            <AdminSettings />
        </div>
        <div v-if="activeTab === 'friendlinks'">
            <AdminFriendLinks />
        </div>
        <div v-if="activeTab === 'account'">
            <AdminAccount />
        </div>
        <div v-if="activeTab === 'feedbacks'">
            <AdminFeedbacks />
        </div>
        <div v-if="activeTab === 'articles'">
            <AdminArticles />
        </div>
        <div v-if="activeTab === 'feeds'">
            <AdminFeeds />
        </div>
    </div>

    <!-- 密码更改提示模态框 -->
    <Teleport to="body">
      <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <!-- 模态框内容 -->
        <div class="relative bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
          <!-- 警告图标 -->
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          <!-- 标题 -->
          <h3 class="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            安全提示
          </h3>
          
          <!-- 说明文字 -->
          <p class="text-center text-gray-600 dark:text-gray-400 mb-6">
            您当前使用的是默认密码，为了账户安全，请立即修改密码。
          </p>
          
          <!-- 密码表单 -->
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新密码</label>
              <input 
                v-model="newPassword" 
                type="password" 
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                placeholder="请输入新密码（至少6位）"
                required
                minlength="6"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">确认新密码</label>
              <input 
                v-model="confirmPassword" 
                type="password" 
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                placeholder="请再次输入新密码"
                required
                minlength="6"
              />
            </div>
            
            <!-- 按钮组 -->
            <div class="flex gap-3 pt-2">
              <button 
                type="button"
                @click="dismissModal"
                class="flex-1 py-2.5 px-4 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition font-medium"
              >
                稍后再说
              </button>
              <button 
                type="submit"
                :disabled="passwordLoading"
                class="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="passwordLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ passwordLoading ? '修改中...' : '立即修改' }}
              </button>
            </div>
          </form>
          
          <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            如果选择稍后再说，下次登录时将再次提示
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useDataStore } from '../stores/data';
import { useNotificationStore } from '../stores/notification';
import { useRouter } from 'vue-router';
import AdminItems from '../components/AdminItems.vue';
import AdminCategories from '../components/AdminCategories.vue';
import AdminSettings from '../components/AdminSettings.vue';
import AdminFriendLinks from '../components/AdminFriendLinks.vue';
import AdminAccount from '../components/AdminAccount.vue';
import AdminTags from '../components/AdminTags.vue';
import AdminFeedbacks from '../components/AdminFeedbacks.vue';
import AdminArticles from '../components/AdminArticles.vue';
import AdminFeeds from '../components/AdminFeeds.vue'; // New

const authStore = useAuthStore();
const dataStore = useDataStore();
const notification = useNotificationStore();
const router = useRouter();

const activeTab = ref('items');
const categories = ref([]);

// 密码更改相关状态
const showPasswordModal = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');
const passwordLoading = ref(false);

onMounted(async () => {
    // Fetch categories for reference
    try {
        categories.value = await dataStore.fetchAdminCategories(authStore.token);
    } catch (e) {
        console.error("Error fetching categories", e);
    }
    
    // 检查是否需要提示更改密码
    if (authStore.requirePasswordChange) {
        showPasswordModal.value = true;
    }
});

const logout = () => {
    authStore.logout();
    router.push('/login');
}

const dismissModal = () => {
    showPasswordModal.value = false;
    notification.warning('为了账户安全，请尽快修改默认密码');
}

const handleChangePassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        notification.error('两次输入的密码不一致');
        return;
    }
    
    if (newPassword.value.length < 6) {
        notification.error('密码长度至少为6位');
        return;
    }
    
    if (newPassword.value === 'admin') {
        notification.error('新密码不能与默认密码相同');
        return;
    }
    
    passwordLoading.value = true;
    try {
        // 使用默认密码 'admin' 作为旧密码
        await authStore.changePassword('admin', newPassword.value);
        notification.success('密码修改成功！');
        showPasswordModal.value = false;
        newPassword.value = '';
        confirmPassword.value = '';
    } catch (e) {
        notification.error('密码修改失败：' + (e.message || '请稍后重试'));
    } finally {
        passwordLoading.value = false;
    }
}
</script>
