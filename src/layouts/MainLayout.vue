<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="w-full px-6 py-4 flex justify-between items-center max-w-full mx-auto border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card sticky top-0 z-40">
        <div class="flex items-center space-x-2">
            <div class="text-2xl font-bold flex flex-col leading-tight">
                <span class="text-gray-800 dark:text-white">{{ settings.site_name || 'MiNav' }}</span>
                <span class="flex items-center text-primary dark:text-accent text-sm">
                    {{ settings.site_tagline || 'Cloudflare Tools' }}
                    <i class="fas fa-cloud text-primary dark:text-accent ml-1"></i>
                </span>
            </div>
        </div>
        <div class="flex items-center space-x-6 text-xl">
            <a class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-accent transition" href="#"><i class="fab fa-github"></i></a>
            <a class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-accent transition" href="#"><i class="fab fa-twitter"></i></a>
            <button class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-accent transition" @click="toggleDarkMode">
                <i class="fas fa-moon dark:hidden"></i>
                <i class="fas fa-sun hidden dark:inline"></i>
            </button>
            <router-link to="/login" class="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-accent transition">
               登录
            </router-link>
        </div>
    </header>

    <div class="flex flex-1">
        <!-- Sidebar -->
        <aside class="hidden lg:block w-72 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border p-6 pt-8 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto scrollbar-hide transition-all duration-300 z-30">
            <!-- Sidebar Content -->
            <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-6">高级筛选</h3>
            <!-- Search -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" for="sidebar-search">快速搜索</label>
                <input class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent outline-none text-sm transition shadow-sm" id="sidebar-search" placeholder="搜索项目..." type="text" />
            </div>
            <!-- Categories (Example) -->
            <!-- Categories -->
            <nav class="space-y-2 mb-8">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">分类</h4>
                <a href="#" @click.prevent="scrollToTop" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-primary bg-primary/10 dark:text-accent dark:bg-accent/10 hover:bg-primary/20 dark:hover:bg-accent/20 transition">
                    <span class="material-symbols-outlined text-lg mr-2">apps</span>
                    全部项目
                    <span class="ml-auto text-xs font-semibold px-2 py-0.5 bg-primary/20 dark:bg-accent/20 rounded-full text-primary dark:text-accent">{{ totalItemsCount }}</span>
                </a>
                <a v-for="cat in categories.filter(c => c.name !== '全部项目')" :key="cat.id" :href="'#cat-' + cat.id" @click.prevent="scrollToCategory(cat.id)" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <span class="material-symbols-outlined text-lg mr-2 text-gray-500 dark:text-gray-400">{{ cat.icon || 'folder' }}</span>
                    {{ cat.name }}
                    <span class="ml-auto text-xs font-semibold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">{{ categoryCounts[cat.id] || 0 }}</span>
                </a>
            </nav>
            
            <!-- Filters -->
             <div class="space-y-4 mb-8">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">状态</h4>
                <div>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="active" v-model="filters.status" class="form-checkbox h-4 w-4 text-primary dark:text-accent rounded focus:ring-primary dark:focus:ring-accent border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
                        <span class="ml-2 text-gray-700 dark:text-gray-300 text-sm">Active</span>
                    </label>
                </div>
                 <div>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="inactive" v-model="filters.status" class="form-checkbox h-4 w-4 text-primary dark:text-accent rounded focus:ring-primary dark:focus:ring-accent border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
                        <span class="ml-2 text-gray-700 dark:text-gray-300 text-sm">Inactive</span>
                    </label>
                </div>
            </div>

            <div class="space-y-4">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">标签筛选</h4>
                <div class="flex flex-wrap gap-2">
                    <button 
                        v-for="tag in tags" 
                        :key="tag.id"
                        @click="toggleTagFilter(tag.id)"
                        class="px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 transform hover:scale-105"
                        :class="filters.tags.includes(tag.id) 
                            ? 'text-white shadow-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-dark-card' 
                            : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'"
                        :style="filters.tags.includes(tag.id) ? { backgroundColor: tag.color, ringColor: tag.color } : {}"
                    >
                        <i v-if="filters.tags.includes(tag.id)" class="fas fa-check mr-1 text-xs"></i>
                        {{ tag.name }}
                    </button>
                </div>
                <p v-if="tags.length === 0" class="text-gray-400 text-sm">暂无标签</p>
                <button 
                    v-if="filters.tags.length > 0" 
                    @click="filters.tags = []" 
                    class="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent flex items-center gap-1 mt-2"
                >
                    <i class="fas fa-times"></i> 清除全部
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-h-screen max-w-full lg:max-w-[calc(100%-18rem)] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
            <slot />
        </main>
    </div>

    <!-- Footer -->
    <footer class="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border mt-16 pt-16 pb-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <!-- Friend Links Section -->
            <div v-if="friendLinks && friendLinks.length > 0" class="mb-12 border-b border-gray-200 dark:border-dark-border pb-12">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center">
                    <i class="fas fa-link mr-2 text-primary dark:text-accent"></i> 友情链接
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4 max-w-5xl mx-auto">
                    <a v-for="link in friendLinks" :key="link.id" :href="link.url" target="_blank" class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                         <!-- 图标显示 -->
                         <div class="w-10 h-10 mb-2 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                            <img v-if="getLinkIconType(link) === 'image'" :src="getLinkIconSrc(link)" alt="" class="w-full h-full object-cover" />
                            <i v-else :class="getLinkIconSrc(link)" class="text-lg text-gray-500 dark:text-gray-300"></i>
                         </div>
                         <div class="font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-accent transition truncate w-full text-center">{{ link.name }}</div>
                         <div v-if="link.description" class="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate w-full text-center opacity-0 group-hover:opacity-100 transition duration-300">{{ link.description }}</div>
                    </a>
                </div>
            </div>
            <p>© 2023 Awesome Cloudflare. All rights reserved.</p>
        </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useDataStore } from '../stores/data';
import { storeToRefs } from 'pinia';

const dataStore = useDataStore();
const { categories, categoryCounts, items, tags, filters, settings, friendLinks } = storeToRefs(dataStore);

const totalItemsCount = computed(() => items.value.length);

onMounted(() => {
    // Ensure settings are fetched if not already valid
    if (Object.keys(settings.value).length === 0) {
        dataStore.fetchSettings();
    }
});

const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
        localStorage.theme = 'dark';
    } else {
        localStorage.theme = 'light';
    }
}

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const scrollToCategory = (id) => {
    const el = document.getElementById('cat-' + id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

const toggleTagFilter = (tagId) => {
    const index = filters.value.tags.indexOf(tagId);
    if (index > -1) {
        filters.value.tags.splice(index, 1);
    } else {
        filters.value.tags.push(tagId);
    }
}

// 获取友链图标类型
const getLinkIconType = (link) => {
    if (!link.icon) return 'image'; // 默认使用自动获取图片
    if (link.icon.startsWith('http') || link.icon.startsWith('/')) return 'image';
    return 'class'; // FontAwesome 类名
}

// 获取友链图标源
const getLinkIconSrc = (link) => {
    if (!link.icon) {
        // 从 URL 提取域名，使用 Unavatar 获取图标
        try {
            const domain = new URL(link.url).hostname;
            return `https://unavatar.io/${domain}?fallback=https://icon.horse/icon/${domain}`;
        } catch {
            return `https://unavatar.io/${link.url}`;
        }
    }
    return link.icon; // 返回 URL 或 FontAwesome 类名
}
</script>
