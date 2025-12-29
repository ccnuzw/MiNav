<template>
  <MainLayout>
    <div class="max-w-3xl mx-auto">
       <button @click="$router.back()" class="flex items-center text-gray-500 hover:text-primary mb-6 transition">
         <i class="fas fa-arrow-left mr-2"></i> 返回列表
       </button>

       <div v-if="loading" class="text-center py-12">
          <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
       </div>
       
       <div v-else-if="error" class="text-center py-12 text-red-500">
          {{ error }}
       </div>

       <article v-else class="bg-white dark:bg-dark-card rounded-xl shadow-sm p-8 border border-gray-100 dark:border-dark-border">
          <header class="mb-8 border-b border-gray-100 dark:border-dark-border pb-8">
             <div class="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span v-if="article.source" class="font-medium text-primary">{{ article.source }}</span>
                <span>•</span>
                <time>{{ formatDate(article.published_at) }}</time>
                <span>•</span>
                <span v-if="article.views">{{ article.views }} 阅读</span>
             </div>
             <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
               {{ article.title }}
             </h1>
             <img v-if="article.cover_image" :src="article.cover_image" class="w-full h-auto rounded-lg shadow-sm max-h-[400px] object-cover" />
             <div class="flex gap-3 mt-4">
                 <a v-if="article.original_url" :href="article.original_url" target="_blank" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm transition flex items-center">
                    阅读原文 <i class="fas fa-external-link-alt ml-2"></i>
                 </a>
             </div>
          </header>
          
          <div class="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-a:text-primary hover:prose-a:underline" v-html="processedContent"></div>
          
          <div v-if="article.original_url" class="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border text-sm text-gray-500">
            <p>原文链接：<a :href="article.original_url" target="_blank" class="text-primary hover:underline">{{ article.original_url }}</a></p>
          </div>
       </article>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';

const route = useRoute();
const article = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await fetch(`/api/public/articles/${route.params.id}`);
    if (!res.ok) throw new Error('Article not found');
    article.value = await res.json();
  } catch (e) {
    error.value = '无法加载文章内容';
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const processedContent = computed(() => {
    if(!article.value || !article.value.content) return '';
    let content = article.value.content;
    // Remove the first H1 if it's very similar to the main title
    // Simple heuristic: Remove the first H1 tag entirely if it exists at the start
    content = content.replace(/^\s*<h1[^>]*>.*?<\/h1>/i, '');
    return content;
});

const formatDate = (dateStr) => {
  if(!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
</script>
