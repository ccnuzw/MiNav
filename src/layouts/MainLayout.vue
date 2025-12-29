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
                    全部项目
                    <span class="ml-auto text-xs font-semibold px-2 py-0.5 bg-primary/20 dark:bg-accent/20 rounded-full text-primary dark:text-accent">{{ totalItemsCount }}</span>
                </a>
                <a v-for="cat in categories.filter(c => c.name !== '全部项目')" :key="cat.id" :href="'#cat-' + cat.id" @click.prevent="scrollToCategory(cat.id)" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
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
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">部署方式 (Desc match)</h4>
                <div>
                     <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" value="cloudflare" v-model="filters.deploy" class="form-radio h-4 w-4 text-primary dark:text-accent focus:ring-primary dark:focus:ring-accent border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
                        <span class="ml-2 text-gray-700 dark:text-gray-300 text-sm">Cloudflare</span>
                    </label>
                </div>
                 <div>
                     <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" value="vercel" v-model="filters.deploy" class="form-radio h-4 w-4 text-primary dark:text-accent focus:ring-primary dark:focus:ring-accent border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
                        <span class="ml-2 text-gray-700 dark:text-gray-300 text-sm">Vercel</span>
                    </label>
                </div>
                 <div>
                     <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" :value="null" v-model="filters.deploy" class="form-radio h-4 w-4 text-primary dark:text-accent focus:ring-primary dark:focus:ring-accent border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
                        <span class="ml-2 text-gray-700 dark:text-gray-300 text-sm">All</span>
                    </label>
                </div>
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
const { categories, categoryCounts, items, filters, settings } = storeToRefs(dataStore);

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
</script>
