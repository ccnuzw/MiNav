<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="w-full px-6 py-4 flex justify-between items-center max-w-full mx-auto border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card sticky top-0 z-40">
        <div class="flex items-center space-x-2">
            <!-- Mobile Menu Button -->
            <button @click="isMobileMenuOpen = true" class="lg:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:text-accent dark:hover:bg-gray-800 transition">
                <i class="fas fa-bars text-xl"></i>
            </button>
            <div class="flex items-center gap-3">
                <!-- Custom Logo -->
                <div v-if="settings.site_logo" class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 dark:bg-accent/10 overflow-hidden shrink-0">
                    <img v-if="settings.site_logo.startsWith('http') || settings.site_logo.startsWith('/')" :src="settings.site_logo" alt="Logo" class="w-full h-full object-contain" />
                    <i v-else :class="settings.site_logo" class="text-xl text-primary dark:text-accent"></i>
                </div>
                
                <div class="text-2xl font-bold flex flex-col leading-tight">
                    <span class="text-gray-800 dark:text-white">{{ settings.site_name || 'MiNav' }}</span>
                    <span class="flex items-center text-primary dark:text-accent text-sm">
                        {{ settings.site_tagline || 'Cloudflare Tools' }}
                        <i v-if="!settings.site_logo" class="fas fa-cloud text-primary dark:text-accent ml-1"></i>
                    </span>
                </div>
            </div>
        </div>
        <div class="flex items-center space-x-6 text-xl">
            <router-link to="/articles" class="text-base font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-accent transition">
                <i class="fas fa-newspaper mr-1"></i> 文章
            </router-link>
            <a class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-accent transition" href="https://github.com/ccnuzw/MiNav" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i></a>
            <button class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-accent transition" @click="toggleDarkMode">
                <i class="fas fa-moon dark:hidden"></i>
                <i class="fas fa-sun hidden dark:inline"></i>
            </button>
        </div>
    </header>

    <div class="flex flex-1">
        <!-- Sidebar -->
        <!-- Sidebar (Desktop) -->
        <aside class="hidden lg:block w-72 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border p-6 pt-8 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto scrollbar-hide transition-all duration-300 z-30">
            <SidebarContent 
                :activeCategoryId="activeCategoryId"
                @scrollToTop="scrollToTop"
                @scrollToCategory="scrollToCategory"
            />
        </aside>

        <!-- Mobile Drawer -->
        <div v-if="isMobileMenuOpen" class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="isMobileMenuOpen = false"></div>
            
            <!-- Drawer Panel -->
            <div class="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-dark-card shadow-xl transform transition-transform duration-300 flex flex-col pl-6 pr-6 py-6">
                <div class="flex items-center justify-between mb-8">
                     <div class="text-xl font-bold text-gray-900 dark:text-white">
                        导航菜单
                    </div>
                    <button @click="isMobileMenuOpen = false" class="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto scrollbar-hide">
                    <SidebarContent 
                        :activeCategoryId="activeCategoryId"
                        @close="isMobileMenuOpen = false"
                        @scrollToTop="scrollToTop"
                        @scrollToCategory="scrollToCategory"
                    />
                </div>
            </div>
        </div>

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
            <p>© 2026 MiNav. All rights reserved.</p>
        </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useDataStore } from '../stores/data';
import { storeToRefs } from 'pinia';
import SidebarContent from '../components/SidebarContent.vue';

const dataStore = useDataStore();
const { categories, categoryCounts, items, tags, filters, settings, friendLinks } = storeToRefs(dataStore);

const isMobileMenuOpen = ref(false);

const totalItemsCount = computed(() => items.value.length);

// 当前活动分类的ID（滚动监听）
const activeCategoryId = ref(null);

// 滚动监听：检测当前视口中可见的分类区块
const handleScroll = () => {
    const scrollTop = window.scrollY;
    const headerHeight = 65; // header 高度
    const offset = headerHeight + 50; // 偏移量，提前一点触发
    
    // 如果滚动到顶部，高亮"全部项目"
    if (scrollTop < 200) {
        activeCategoryId.value = null;
        return;
    }
    
    // 获取所有分类区块
    const categoryElements = categories.value
        .filter(c => c.name !== '全部项目')
        .map(cat => {
            const el = document.getElementById('cat-' + cat.id);
            return { id: cat.id, el };
        })
        .filter(item => item.el);
    
    // 找到当前视口中可见的分类
    let currentCategory = null;
    
    for (const { id, el } of categoryElements) {
        const rect = el.getBoundingClientRect();
        // 如果区块的顶部在视口上半部分内
        if (rect.top <= offset && rect.bottom > offset) {
            currentCategory = id;
            break;
        }
        // 如果区块完全在视口上方，记录它（可能是最后一个可见的）
        if (rect.top < offset) {
            currentCategory = id;
        }
    }
    
    if (currentCategory !== null) {
        activeCategoryId.value = currentCategory;
    }
};

onMounted(() => {
    // 设置滚动监听
    window.addEventListener('scroll', handleScroll, { passive: true });
    // 初始检测
    handleScroll();
    
    // Ensure settings are fetched if not already valid
    if (Object.keys(settings.value).length === 0) {
        dataStore.fetchSettings();
    }
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
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

const emit = defineEmits(['navigate-category']);

const scrollToCategory = (id) => {
    emit('navigate-category', id);
    const el = document.getElementById('cat-' + id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
