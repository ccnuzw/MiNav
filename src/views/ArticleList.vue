<template>
  <MainLayout>
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">最新文章</h1>
      
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
      
      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error }}
      </div>
      
      <div v-else-if="articles.length === 0" class="text-center py-12 text-gray-500">
        暂无文章
      </div>
      
      <div v-else class="grid gap-6">
        <article v-for="article in articles" :key="article.id" class="bg-white dark:bg-dark-card rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 dark:border-dark-border flex flex-col md:flex-row h-full md:h-48">
          <div v-if="article.cover_image" class="w-full md:w-48 h-48 md:h-full flex-shrink-0 bg-gray-100 dark:bg-gray-800">
            <img :src="article.cover_image" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="p-6 flex flex-col justify-between flex-1 min-w-0">
            <div>
              <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span class="bg-primary/10 text-primary px-2 py-0.5 rounded">{{ formatDate(article.published_at) }}</span>
                <span v-if="article.source" class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded ml-2">{{ article.source }}</span>
                <span v-if="article.views" class="flex items-center gap-1 ml-auto"><i class="fas fa-eye"></i> {{ article.views }}</span>
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary transition">
                <router-link :to="'/articles/' + article.id">{{ article.title }}</router-link>
              </h2>
              <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                {{ article.summary }}
              </p>
            </div>
            <div class="flex justify-between items-center mt-auto">
               <router-link :to="'/articles/' + article.id" class="text-primary hover:text-primary-hover font-medium text-sm flex items-center">
                 阅读全文 <i class="fas fa-arrow-right ml-1 text-xs"></i>
               </router-link>
            </div>
          </div>
        </article>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../layouts/MainLayout.vue';

const articles = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await fetch('/api/public/articles');
    if (!res.ok) throw new Error('Failed to fetch articles');
    articles.value = await res.json();
  } catch (e) {
    error.value = '加载文章失败，请稍后重试';
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateStr) => {
  if(!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
</script>
