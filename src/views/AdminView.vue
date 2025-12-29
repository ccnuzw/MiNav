<template>
  <div class="min-h-screen bg-secondary-bg dark:bg-dark-bg p-8 text-gray-900 dark:text-white">
    <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">后台管理</h1>
            <div class="flex items-center space-x-4">
                 <span class="text-sm text-gray-500">欢迎, 管理员</span>
                 <button @click="logout" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition">退出登录</button>
            </div>
        </div>
        
        <!-- Tabs -->
        <div class="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-6 w-fit">
            <button 
                @click="activeTab = 'items'"
                :class="activeTab === 'items' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
            >项目管理</button>
            <button 
                @click="activeTab = 'categories'"
                :class="activeTab === 'categories' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
            >分类管理</button>
            <button 
                @click="activeTab = 'settings'"
                :class="activeTab === 'settings' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
            >网站设置</button>
            <button 
                @click="activeTab = 'friendlinks'"
                :class="activeTab === 'friendlinks' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
            >友情链接</button>
            <button 
                @click="activeTab = 'account'"
                :class="activeTab === 'account' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
            >账户安全</button>
            <button 
                @click="activeTab = 'tags'"
                :class="activeTab === 'tags' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
            >标签管理</button>
        </div>

        <div v-if="activeTab === 'items'">
            <AdminItems :categories="categories" />
        </div>
        <div v-if="activeTab === 'categories'">
            <AdminCategories />
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
        <div v-if="activeTab === 'tags'">
            <AdminTags />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useDataStore } from '../stores/data';
import { useRouter } from 'vue-router';
import AdminItems from '../components/AdminItems.vue';
import AdminCategories from '../components/AdminCategories.vue';
import AdminSettings from '../components/AdminSettings.vue';
import AdminFriendLinks from '../components/AdminFriendLinks.vue';
import AdminAccount from '../components/AdminAccount.vue';
import AdminTags from '../components/AdminTags.vue';

const authStore = useAuthStore();
const dataStore = useDataStore();
const router = useRouter();

const activeTab = ref('items');
const categories = ref([]);

onMounted(async () => {
    // Fetch categories for reference
    try {
        categories.value = await dataStore.fetchAdminCategories(authStore.token);
    } catch (e) {
        console.error("Error fetching categories", e);
    }
});

const logout = () => {
    authStore.logout();
    router.push('/login');
}
</script>
