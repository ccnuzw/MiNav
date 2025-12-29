<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
    <h2 class="text-xl font-bold mb-6 dark:text-white">网站设置 (Home Page)</h2>
    <form @submit.prevent="handleSubmit" class="space-y-6 max-w-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium mb-1 dark:text-gray-300">站点名称 (Site Name)</label>
                <input v-model="form.site_name" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="MiNav" />
            </div>
             <div>
                <label class="block text-sm font-medium mb-1 dark:text-gray-300">站点标语 (Tagline)</label>
                <input v-model="form.site_tagline" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Cloudflare Tools" />
            </div>
        </div>

        <!-- 站点LOGO設置 -->
        <div>
            <label class="block text-sm font-medium mb-2 dark:text-gray-300">站点 LOGO</label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">设置显示在左上角的网站 LOGO，支持图片 URL 或 FontAwesome 图标</p>
            <div class="flex items-start gap-4">
                <!-- LOGO 预览 -->
                <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <img v-if="siteLogoPreviewUrl" :src="siteLogoPreviewUrl" alt="Logo" class="w-full h-full object-contain" />
                    <i v-else-if="form.site_logo && !form.site_logo.startsWith('http')" :class="form.site_logo" class="text-xl text-gray-700 dark:text-gray-200"></i>
                    <span v-else class="text-xs text-gray-400">无</span>
                </div>
                <div class="flex-1 space-y-2">
                    <input v-model="form.site_logo" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm" placeholder="图标URL 或 FontAwesome类名" />
                    <div class="flex flex-wrap gap-2">
                         <button type="button" @click="form.site_logo = 'fas fa-rocket'" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <i class="fas fa-rocket mr-1"></i>火箭
                        </button>
                        <button type="button" @click="form.site_logo = 'fas fa-globe'" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <i class="fas fa-globe mr-1"></i>地球
                        </button>
                         <button type="button" @click="form.site_logo = ''" class="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                            <i class="fas fa-undo mr-1"></i>清空
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <hr class="border-gray-200 dark:border-gray-700" />
        <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">主标题 (Hero Title)</label>
            <input v-model="form.hero_title" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">副标题 (Subtitle)</label>
            <input v-model="form.hero_subtitle" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">描述 (Description)</label>
            <textarea v-model="form.hero_description" rows="4" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"></textarea>
        </div>
        
        <hr class="border-gray-200 dark:border-gray-700" />
        
        <!-- 默认项目图标设置 -->
        <div>
            <label class="block text-sm font-medium mb-2 dark:text-gray-300">默认项目图标</label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">当项目没有设置图标时，将显示此默认图标</p>
            <div class="flex items-start gap-4">
                <!-- 图标预览 -->
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex-shrink-0">
                    <img v-if="defaultIconPreviewUrl" :src="defaultIconPreviewUrl" alt="图标预览" class="w-full h-full object-cover" />
                    <i v-else-if="form.default_icon && !form.default_icon.startsWith('http')" :class="form.default_icon" class="text-2xl text-gray-500"></i>
                    <i v-else class="fab fa-github text-2xl text-gray-400"></i>
                </div>
                <div class="flex-1 space-y-2">
                    <input v-model="form.default_icon" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm" placeholder="图标URL 或 FontAwesome类名，如 fab fa-github" />
                    <!-- 快捷选择 -->
                    <div class="flex flex-wrap gap-2">
                        <button type="button" @click="form.default_icon = 'fab fa-github'" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <i class="fab fa-github mr-1"></i>GitHub
                        </button>
                        <button type="button" @click="form.default_icon = 'fas fa-link'" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <i class="fas fa-link mr-1"></i>链接
                        </button>
                        <button type="button" @click="form.default_icon = 'fas fa-globe'" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <i class="fas fa-globe mr-1"></i>地球
                        </button>
                        <button type="button" @click="form.default_icon = 'fas fa-code'" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <i class="fas fa-code mr-1"></i>代码
                        </button>
                        <button type="button" @click="form.default_icon = 'fas fa-cube'" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <i class="fas fa-cube mr-1"></i>方块
                        </button>
                        <button type="button" @click="form.default_icon = 'fas fa-rocket'" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            <i class="fas fa-rocket mr-1"></i>火箭
                        </button>
                        <button type="button" @click="form.default_icon = ''" class="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                            <i class="fas fa-undo mr-1"></i>清空
                        </button>
                    </div>
                    <p class="text-xs text-gray-400">支持 FontAwesome 类名（如 <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">fab fa-github</code>）或图片 URL</p>
                </div>
            </div>
        </div>
        
        <hr class="border-gray-200 dark:border-gray-700" />
        
        <!-- 提交工具功能开关 -->
        <div>
            <label class="block text-sm font-medium mb-2 dark:text-gray-300">提交工具功能</label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">开启后，首页将显示"提交工具"链接，用户可以提交新工具</p>
            <div class="flex items-center gap-4">
                <button 
                    type="button"
                    @click="form.submit_enabled = 'true'"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition"
                    :class="form.submit_enabled !== 'false' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
                    <i class="fas fa-check mr-1"></i>开启
                </button>
                <button 
                    type="button"
                    @click="form.submit_enabled = 'false'"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition"
                    :class="form.submit_enabled === 'false' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
                    <i class="fas fa-times mr-1"></i>关闭
                </button>
            </div>
        </div>

        <hr class="border-gray-200 dark:border-gray-700" />
        
        <!-- 反馈功能开关 -->
        <div>
            <label class="block text-sm font-medium mb-2 dark:text-gray-300">意见反馈功能</label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">开启后，首页将显示"意见反馈"链接，用户可以提交反馈建议</p>
            <div class="flex items-center gap-4">
                <button 
                    type="button"
                    @click="form.feedback_enabled = 'true'"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition"
                    :class="form.feedback_enabled !== 'false' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
                    <i class="fas fa-check mr-1"></i>开启
                </button>
                <button 
                    type="button"
                    @click="form.feedback_enabled = 'false'"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition"
                    :class="form.feedback_enabled === 'false' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
                    <i class="fas fa-times mr-1"></i>关闭
                </button>
            </div>
        </div>
        
        <div class="flex justify-end">
            <button type="submit" :disabled="loading" class="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50">
                {{ loading ? 'Saving...' : '保存设置' }}
            </button>
        </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';

const dataStore = useDataStore();
const authStore = useAuthStore();
const notification = useNotificationStore();
const form = ref({ hero_title: '', hero_subtitle: '', hero_description: '', site_name: '', site_tagline: '', site_logo: '', default_icon: '', feedback_enabled: 'true', submit_enabled: 'true' });
const loading = ref(false);

// 默认图标预览URL计算
const defaultIconPreviewUrl = computed(() => {
    if (!form.value.default_icon) return '';
    if (form.value.default_icon.startsWith('http') || form.value.default_icon.startsWith('/')) {
        return form.value.default_icon;
    }
    return ''; // FontAwesome类名，不返回URL
});

// 站点图标预览URL计算
const siteLogoPreviewUrl = computed(() => {
    if (!form.value.site_logo) return '';
    if (form.value.site_logo.startsWith('http') || form.value.site_logo.startsWith('/')) {
        return form.value.site_logo;
    }
    return ''; // FontAwesome类名
});

onMounted(async () => {
    // Ensure settings are loaded
    if (Object.keys(dataStore.settings).length === 0) {
        await dataStore.fetchSettings();
    }
    // Populate form
    form.value = { ...dataStore.settings };
});

const handleSubmit = async () => {
    loading.value = true;
    try {
        await dataStore.updateSettings(authStore.token, form.value);
        notification.success('设置已保存');
    } catch (e) {
        notification.error('保存失败: ' + e.message);
    } finally {
        loading.value = false;
    }
}
</script>

