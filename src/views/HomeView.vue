<template>
  <MainLayout>
    <div class="text-center mb-16 relative z-10">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
            {{ settings.hero_title || '发现最好的' }}
        </h1>
        <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span class="text-primary dark:text-accent">{{ settings.hero_subtitle || 'Cloudflare 开源工具 & 文档' }}</span>
        </h2>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg mb-10 leading-relaxed whitespace-pre-line">
            {{ settings.hero_description || '出海第一站，搞定工具栈，一系列基于CloudFlare的开源工具 & 技术栈，旨在帮助独立开发者快速构建和发布SaaS产品。' }}
        </p>
        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto relative mb-6">
            <input v-model="searchQuery" class="w-full pl-6 pr-12 py-3.5 rounded-lg border-2 border-primary dark:border-accent focus:ring-4 focus:ring-primary/20 dark:focus:ring-accent/20 focus:border-primary dark:focus:border-accent outline-none text-gray-700 dark:bg-dark-card dark:text-gray-200 transition shadow-sm" placeholder="快来搜一搜你感兴趣的工具或文档吧" type="text" />
            <button class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary dark:hover:text-accent transition">
                <i class="fas fa-level-down-alt transform rotate-90"></i>
            </button>
        </div>
        
        <div class="flex justify-center items-center space-x-6 text-sm">
            <a class="flex items-center text-primary dark:text-accent hover:underline cursor-pointer" @click="showSubmitModal = true">
                提交工具 <span class="ml-1">👉</span>
            </a>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <a class="flex items-center text-primary dark:text-accent hover:underline" href="#">
                意见反馈 <span class="ml-1">👉</span>
            </a>
        </div>
    </div>

    <!-- Control Bar -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-10 space-y-4 md:space-y-0">
        <div class="w-full md:w-auto relative group">
            <button class="w-full md:w-48 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg flex justify-between items-center text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition">
                <span>{{ sortBy === 'default' ? '默认排序' : (sortBy === 'newest' ? '最新添加' : '热门排行') }}</span>
                <i class="fas fa-chevron-down text-xs text-gray-400"></i>
            </button>
            <!-- Dropdown -->
            <div class="absolute top-full left-0 w-full mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg hidden group-hover:block z-20">
                <button @click="sortBy = 'default'" class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm dark:text-gray-200">默认排序</button>
                <button @click="sortBy = 'newest'" class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm dark:text-gray-200">最新添加</button>
                <!-- <button @click="sortBy = 'hot'" class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm dark:text-gray-200">热门排行</button> -->
            </div>
        </div>
        
        <!-- Quick Categories -->
        <div class="flex bg-gray-100 dark:bg-dark-card p-1 rounded-lg overflow-x-auto max-w-full">
             <button @click="quickFilter = 'all'" :class="quickFilter === 'all' ? 'bg-primary dark:bg-accent text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'" class="px-6 py-1.5 rounded shadow-sm text-sm font-medium transition whitespace-nowrap">
                全部
            </button>
            <button v-for="cat in topCategories" :key="cat.id" @click="quickFilter = cat.id" 
                :class="quickFilter === cat.id ? 'bg-primary dark:bg-accent text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                class="px-6 py-1.5 rounded text-sm font-medium transition whitespace-nowrap">
                {{ cat.name }}
            </button>
        </div>

        <div class="w-full md:w-auto relative">
             <!-- Placeholder for 'Selection Tools' or other actions -->
            <button class="w-full md:w-48 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg flex justify-between items-center text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition">
                <span>甄选工具</span>
                <i class="fas fa-chevron-down text-xs text-gray-400"></i>
            </button>
        </div>
    </div>

    <div v-if="loading" class="text-center text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

    <div v-else class="space-y-8">
        <div v-for="category in filteredGroups" :key="category.id" :id="'cat-' + category.id" class="space-y-4">
            <h3 v-if="category.items.length > 0" class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <span class="material-symbols-outlined text-2xl mr-2 text-primary dark:text-accent">{{ category.icon || 'folder' }}</span>
                {{ category.name }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div v-for="item in category.items" :key="item.id" class="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4 hover:shadow-lg transition duration-300 flex items-start space-x-4">
                    <div class="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img v-if="getIconType(item) === 'image'" :src="getIconSrc(item)" alt="Icon" class="w-full h-full object-cover" />
                        <i v-else :class="getIconSrc(item)" class="text-xl text-gray-600 dark:text-gray-300"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-gray-900 dark:text-white text-lg">
                                <a :href="item.url" target="_blank" class="hover:text-primary dark:hover:text-accent transition">{{ item.name }}</a>
                            </h3>
                        </div>
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                            {{ item.description }}
                        </p>
                        <!-- Tags -->
                        <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1.5">
                            <span 
                                v-for="tag in item.tags" 
                                :key="tag.id" 
                                class="px-2 py-0.5 text-xs font-medium rounded-full text-white shadow-sm"
                                :style="{ backgroundColor: tag.color }"
                            >{{ tag.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Friend Links Section -->

  </MainLayout>




<teleport to="body">
    <div class="fixed bottom-8 right-8 flex flex-col space-y-3 z-50">
        <button @click="scrollToTop" class="w-12 h-12 bg-primary dark:bg-accent rounded-lg shadow-lg flex items-center justify-center text-white hover:bg-primary-hover dark:hover:bg-accent-dark transition transform hover:scale-105">
            <i class="fas fa-chevron-up"></i>
        </button>
        <!-- Mock Ghost Button -->
        <button class="w-12 h-12 bg-indigo-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-600 transition transform hover:scale-105">
            <i class="fas fa-ghost"></i>
        </button>
    </div>
</teleport>

<!-- Submission Modal -->
<teleport to="body">
    <div v-if="showSubmitModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-dark-card p-6 rounded-lg w-full max-w-md shadow-xl">
            <h3 class="text-xl font-bold mb-4 dark:text-white">提交新工具</h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300">名称</label>
                    <input v-model="submitForm.name" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required placeholder="Project Name" />
                </div>
                <div>
                     <label class="block text-sm font-medium dark:text-gray-300">链接 (URL)</label>
                    <input v-model="submitForm.url" type="url" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required placeholder="https://..." />
                </div>
                 <div>
                    <label class="block text-sm font-medium dark:text-gray-300">分类</label>
                    <select v-model="submitForm.category_id" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                </div>
                 <div>
                    <label class="block text-sm font-medium dark:text-gray-300">描述</label>
                    <textarea v-model="submitForm.description" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="简短描述..."></textarea>
                </div>
                <div class="flex justify-end space-x-2 mt-6">
                    <button type="button" @click="showSubmitModal = false" class="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">取消</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover">提交</button>
                </div>
            </form>
        </div>
    </div>
</teleport>



</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import MainLayout from '../layouts/MainLayout.vue';
import { useDataStore } from '../stores/data';
import { storeToRefs } from 'pinia';

const dataStore = useDataStore();
const { groupedItems, loading, error, categories, settings, friendLinks } = storeToRefs(dataStore);
const searchQuery = ref('');
const sortBy = ref('default');
const quickFilter = ref('all');
const showSubmitModal = ref(false);
const submitForm = ref({ name: '', url: '', category_id: null, description: '' });

onMounted(() => {
    dataStore.fetchPublicData();
    dataStore.fetchSettings();
});

// 获取权重最高（sort_order 最小）的3个分类
const topCategories = computed(() => {
    return categories.value
        .filter(c => c.name !== '全部项目')
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .slice(0, 3);
});

const handleSubmit = async () => {
    try {
        await dataStore.submitItem(submitForm.value);
        alert('提交成功！等待管理员审核。');
        showSubmitModal.value = false;
        submitForm.value = { name: '', url: '', category_id: null, description: '' };
    } catch (e) {
        alert('提交失败: ' + e.message);


    }
}

const getIconType = (item) => {
    if (!item.icon) {
        // 检查默认图标类型
        const defaultIcon = settings.value.default_icon || 'fab fa-github';
        if (defaultIcon.startsWith('http') || defaultIcon.startsWith('/')) return 'image';
        return 'class';
    }
    if (item.icon.startsWith('http') || item.icon.startsWith('/')) return 'image';
    return 'class';
}

const getIconSrc = (item) => {
    if (!item.icon) {
        // 使用站点设置的默认图标，如果没有设置则使用 GitHub 图标
        return settings.value.default_icon || 'fab fa-github';
    }
    if (item.icon.startsWith('http') || item.icon.startsWith('/')) {
        return item.icon;
    }
    return item.icon; // e.g., 'fab fa-github'
}

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const filteredGroups = computed(() => {
    // 1. Get Base Groups from Store (already filtered by sidebar filters)
    let groups = Object.values(groupedItems.value);
    
    // 2. Apply Quick Filter (if set)
    if (quickFilter.value !== 'all') {
        groups = groups.filter(g => g.id === quickFilter.value);
    }
    
    // 3. Apply Search Query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        groups = groups.map(group => {
            const matchingItems = group.items.filter(item => 
                item.name.toLowerCase().includes(query) || 
                (item.description && item.description.toLowerCase().includes(query))
            );
            return { ...group, items: matchingItems };
        }).filter(g => g.items.length > 0);
    }

    // 4. Apply Sorting
    if (sortBy.value === 'newest') {
        // Flatten, sort, then maybe re-group or just show as one list?
        // Retaining group structure for now, but sorting items within groups
        groups = groups.map(group => {
            return {
                ...group,
                items: [...group.items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            }
        });
    }

    return groups;
});
</script>
