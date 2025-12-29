<template>
  <div class="h-full flex flex-col">
    <!-- Search -->
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" for="sidebar-search">快速搜索</label>
        <input class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary dark:focus:ring-accent dark:focus:border-accent outline-none text-sm transition shadow-sm" id="sidebar-search" placeholder="搜索项目..." type="text" />
    </div>

    <!-- Categories -->
    <nav class="space-y-2 mb-8 flex-shrink-0">
        <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">分类</h4>
        <a href="#" @click.prevent="handleScrollToTop" 
           class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition"
           :class="activeCategoryId === null 
               ? 'text-primary bg-primary/10 dark:text-accent dark:bg-accent/10' 
               : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'">
            <span class="material-symbols-outlined text-lg mr-2">apps</span>
            全部项目
            <span class="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="activeCategoryId === null 
                      ? 'bg-primary/20 dark:bg-accent/20 text-primary dark:text-accent' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">{{ totalItemsCount }}</span>
        </a>
        <a v-for="cat in categories.filter(c => c.name !== '全部项目')" :key="cat.id" :href="'#cat-' + cat.id" @click.prevent="handleScrollToCategory(cat.id)" 
           class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition"
           :class="activeCategoryId === cat.id 
               ? 'text-primary bg-primary/10 dark:text-accent dark:bg-accent/10' 
               : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'">
            <span class="material-symbols-outlined text-lg mr-2" 
                  :class="activeCategoryId === cat.id ? 'text-primary dark:text-accent' : 'text-gray-500 dark:text-gray-400'">{{ cat.icon || 'folder' }}</span>
            {{ cat.name }}
            <span class="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="activeCategoryId === cat.id 
                      ? 'bg-primary/20 dark:bg-accent/20 text-primary dark:text-accent' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">{{ categoryCounts[cat.id] || 0 }}</span>
        </a>
    </nav>
    
    <!-- Filters -->
     <div class="space-y-4 mb-8 flex-shrink-0">
        <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">状态筛选</h4>
        <div class="flex flex-wrap gap-2">
            <button 
                @click="toggleStatusFilter('active')"
                class="px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 transform hover:scale-105"
                :class="filters.status.includes('active') 
                    ? 'text-white shadow-md bg-green-500 ring-2 ring-offset-2 ring-green-500 ring-offset-white dark:ring-offset-dark-card' 
                    : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'">
                <i v-if="filters.status.includes('active')" class="fas fa-check mr-1 text-xs"></i>
                正常
            </button>
            <button 
                @click="toggleStatusFilter('inactive')"
                class="px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 transform hover:scale-105"
                :class="filters.status.includes('inactive') 
                    ? 'text-white shadow-md bg-gray-500 ring-2 ring-offset-2 ring-gray-500 ring-offset-white dark:ring-offset-dark-card' 
                    : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'">
                <i v-if="filters.status.includes('inactive')" class="fas fa-check mr-1 text-xs"></i>
                停用
            </button>
        </div>
        <button 
            v-if="filters.status.length > 0" 
            @click="filters.status = []" 
            class="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent flex items-center gap-1 mt-2">
            <i class="fas fa-times"></i> 清除状态筛选
        </button>
    </div>

    <div class="space-y-4 flex-shrink-0">
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
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDataStore } from '../stores/data';
import { storeToRefs } from 'pinia';

const props = defineProps({
  activeCategoryId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['close', 'scrollToTop', 'scrollToCategory']);

const dataStore = useDataStore();
const { categories, categoryCounts, items, tags, filters } = storeToRefs(dataStore);

const totalItemsCount = computed(() => items.value.length);

const handleScrollToTop = () => {
    emit('scrollToTop');
    emit('close');
}

const handleScrollToCategory = (id) => {
    emit('scrollToCategory', id);
    emit('close');
}

const toggleTagFilter = (tagId) => {
    const index = filters.value.tags.indexOf(tagId);
    if (index > -1) {
        filters.value.tags.splice(index, 1);
    } else {
        filters.value.tags.push(tagId);
    }
}

const toggleStatusFilter = (status) => {
    const index = filters.value.status.indexOf(status);
    if (index > -1) {
        filters.value.status.splice(index, 1);
    } else {
        filters.value.status.push(status);
    }
}
</script>
