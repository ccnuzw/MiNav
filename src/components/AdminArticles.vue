<template>
  <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white">文章管理</h2>
      <div class="flex gap-2">
        <button 
          @click="openEditModal()"
          class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition text-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建文章
        </button>
      </div>
    </div>

    <!-- Batch Actions -->
    <div v-if="selectedArticles.length > 0" class="mb-4 flex items-center gap-4 bg-gray-50 dark:bg-dark-bg/50 p-2 rounded-lg">
        <span class="text-sm text-gray-600 dark:text-gray-400">已选择 {{ selectedArticles.length }} 项</span>
        <button 
            @click="batchDelete"
            class="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition"
        >
            批量删除
        </button>
    </div>

    <!-- Article List (Desktop Table) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-dark-border">
            <th class="py-3 px-4 w-10">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-primary text-primary" />
            </th>
            <th class="py-3 font-medium">标题</th>
            <th class="py-3 font-medium">来源</th>
            <th class="py-3 font-medium">状态</th>
            <th class="py-3 font-medium">发布时间</th>
            <th class="py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-if="loading" class="animate-pulse">
             <td colspan="6" class="py-4 text-center text-gray-500">加载中...</td>
          </tr>
          <tr v-else-if="articles.length === 0">
             <td colspan="6" class="py-4 text-center text-gray-500">暂无文章</td>
          </tr>
          <tr 
            v-else 
            v-for="article in articles" 
            :key="article.id"
            class="border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition group"
          >
            <td class="py-3 px-4">
                <input type="checkbox" :value="article.id" v-model="selectedArticles" class="rounded border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-primary text-primary" />
            </td>
            <td class="py-3 pr-4 max-w-xs truncate" :title="article.title">{{ article.title }}</td>
            <td class="py-3 text-gray-500">{{ article.source }}</td>
            <td class="py-3">
              <span 
                class="px-2 py-0.5 rounded text-xs"
                :class="article.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'"
              >
                {{ article.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="py-3 text-gray-500">{{ formatDate(article.published_at) }}</td>
            <td class="py-3 flex items-center gap-2">
              <button 
                @click="openEditModal(article)" 
                class="text-blue-500 hover:text-blue-700 transition"
                title="编辑"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                @click="deleteArticle(article.id)" 
                class="text-red-500 hover:text-red-700 transition"
                title="删除"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Article Cards -->
    <div class="grid grid-cols-1 gap-4 md:hidden">
        <div v-if="loading" class="text-center py-4 text-gray-500">加载中...</div>
        <div v-else-if="articles.length === 0" class="text-center py-4 text-gray-500">暂无文章</div>
        <div 
            v-else
            v-for="article in articles" 
            :key="article.id" 
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative"
        >
            <div class="flex justify-between items-start mb-2 gap-2">
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-900 dark:text-white break-all leading-tight mb-1 line-clamp-2">{{ article.title }}</h4>
                    <div class="text-xs text-gray-500 flex items-center gap-2">
                        <span>{{ article.source }}</span>
                        <span>•</span>
                        <span>{{ formatDate(article.published_at) }}</span>
                    </div>
                </div>
                 <span 
                    class="px-2 py-0.5 rounded text-xs whitespace-nowrap"
                    :class="article.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'"
                 >
                    {{ article.status === 'published' ? '已发布' : '草稿' }}
                 </span>
            </div>
            
            <div class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                 <div class="flex items-center">
                    <input type="checkbox" :value="article.id" v-model="selectedArticles" class="rounded border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-primary text-primary" />
                 </div>
                 <div class="space-x-2">
                    <button @click="openEditModal(article)" class="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition">
                        编辑
                    </button>
                    <button @click="deleteArticle(article.id)" class="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                        删除
                    </button>
                 </div>
            </div>
        </div>
    </div>
    
    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center" v-if="articles.length > 0 || currentPage > 1">
        <span class="text-sm text-gray-500">共 {{ total }} 篇文章</span>
        <div class="flex gap-2">
            <button 
                @click="currentPage--; fetchArticles()"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 dark:border-dark-border dark:text-gray-300"
            >上一页</button>
            <button 
                @click="currentPage++; fetchArticles()"
                :disabled="currentPage >= totalPages"
                class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 dark:border-dark-border dark:text-gray-300"
            >下一页</button>
        </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showEditModal = false"></div>
        <div class="relative bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div class="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ isEditing ? '编辑文章' : '新建文章' }}</h3>
                <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-500">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1 space-y-4">
                <div>
                   <label class="block text-sm font-medium mb-1 dark:text-gray-300">标题</label>
                   <input v-model="form.title" class="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label class="block text-sm font-medium mb-1 dark:text-gray-300">封面图 URL</label>
                      <input v-model="form.cover_image" class="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                   </div>
                   <div>
                       <label class="block text-sm font-medium mb-1 dark:text-gray-300">状态</label>
                       <select v-model="form.status" class="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border dark:text-white">
                           <option value="published">已发布</option>
                           <option value="draft">草稿</option>
                       </select>
                   </div>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 dark:text-gray-300">摘要</label>
                    <textarea v-model="form.summary" rows="3" class="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border dark:text-white" />
                </div>
                <div>
                <div class="flex flex-col h-[600px] border rounded-lg dark:border-dark-border overflow-hidden">
                    <!-- Toolbar (Simple) -->
                    <div class="flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-dark-bg dark:border-dark-border">
                        <span class="text-xs text-gray-500 font-medium px-2">HTML 编辑器</span>
                        <div class="h-4 w-px bg-gray-300 dark:bg-dark-border mx-2"></div>
                        <button class="px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-dark-border rounded" title="预览" @click="togglePreview">
                             {{ showPreview ? '关闭预览' : '开启预览' }}
                        </button>
                    </div>

                    <!-- Split View -->
                    <div class="flex flex-1 overflow-hidden">
                        <!-- Left: Editor -->
                        <div class="flex-1 flex flex-col min-w-0" :class="{'border-r dark:border-dark-border': showPreview}">
                            <textarea 
                                v-model="form.content" 
                                class="flex-1 w-full p-4 font-mono text-sm resize-none outline-none dark:bg-dark-bg dark:text-gray-200"
                                placeholder="输入 HTML 内容..."
                            ></textarea>
                        </div>
                        
                        <!-- Right: Preview -->
                        <div v-show="showPreview" class="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-dark-bg/50 overflow-y-auto">
                             <div class="p-4 prose dark:prose-invert max-w-none">
                                <h1 class="text-2xl font-bold mb-4 border-b pb-2">{{ form.title || '标题预览' }}</h1>
                                <div v-html="form.content"></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            </div>

            <div class="p-6 border-t border-gray-100 dark:border-dark-border flex justify-end gap-3">
                <button @click="showEditModal = false" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg">取消</button>
                <button @click="saveArticle" :disabled="saving" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    {{ saving ? '保存中...' : '保存' }}
                </button>
            </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useNotificationStore } from '../stores/notification';
import { useAuthStore } from '../stores/auth';

const notification = useNotificationStore();
const authStore = useAuthStore();
const articles = ref([]);
const loading = ref(false);

const currentPage = ref(1);
const total = ref(0);
const pageSize = 20;

const totalPages = computed(() => Math.ceil(total.value / pageSize));

const selectedArticles = ref([]);
const isAllSelected = computed(() => {
    return articles.value.length > 0 && selectedArticles.value.length === articles.value.length;
});

const showEditModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const showPreview = ref(false); // Default to split view (false)
const form = reactive({
    id: null,
    title: '',
    content: '',
    summary: '',
    cover_image: '',
    status: 'published',
    source: 'manual',
    original_url: ''
});

onMounted(() => {
    fetchArticles();
});

const fetchArticles = async () => {
    loading.value = true;
    try {
        const res = await fetch(`/api/admin/articles?page=${currentPage.value}&limit=${pageSize}`, {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if(res.ok) {
            const data = await res.json();
            articles.value = data.items || [];
            total.value = data.total || 0;
            // Handle case where we delete last item of a page
            if (currentPage.value > 1 && articles.value.length === 0) {
                currentPage.value--;
                fetchArticles();
            }
        }
    } catch(e) {
        notification.error('加载文章失败');
    } finally {
        loading.value = false;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
};


const openEditModal = (article = null) => {
    resetForm();
    if (article) {
        isEditing.value = true;
        Object.assign(form, article);
    } else {
        isEditing.value = false;
    }
    showEditModal.value = true;
};

const resetForm = () => {
    form.id = null;
    form.title = '';
    form.content = '';
    form.summary = '';
    form.cover_image = '';
    form.status = 'published';
    form.source = 'manual';
    form.original_url = '';
};

const saveArticle = async () => {
    if(!form.title) return notification.error('标题不能为空');
    
    saving.value = true;
    try {
        const url = isEditing.value ? `/api/admin/articles/${form.id}` : '/api/admin/articles';
        const method = isEditing.value ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: { 
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${authStore.token}` 
            },
            body: JSON.stringify(form)
        });
        
        if(!res.ok) throw new Error('保存失败');
        
        notification.success(isEditing.value ? '已更新' : '已发布');
        showEditModal.value = false;
        fetchArticles();
    } catch(e) {
        notification.error(e.message);
    } finally {
        saving.value = false;
    }
};

const deleteArticle = async (id) => {
    const confirmed = await notification.confirm({
        title: '删除确认',
        message: '确定删除这篇文章吗？此操作不可撤销。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消'
    });
    if(!confirmed) return;

    try {
        const res = await fetch(`/api/admin/articles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if(res.ok) {
            notification.success('已删除');
            articles.value = articles.value.filter(a => a.id !== id);
        } else {
            throw new Error('删除失败');
        }
    } catch(e) {
        notification.error(e.message);
    }
};

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedArticles.value = [];
    } else {
        selectedArticles.value = articles.value.map(a => a.id);
    }
};

const batchDelete = async () => {
    if(!selectedArticles.value.length) return;
    
    const confirmed = await notification.confirm({
        title: '批量删除确认',
        message: `确定删除选中的 ${selectedArticles.value.length} 篇文章吗？此操作不可撤销。`,
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消'
    });
    if(!confirmed) return;
    
    try {
        const res = await fetch('/api/admin/articles', {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}` 
            },
            body: JSON.stringify({ ids: selectedArticles.value })
        });
        
        if(res.ok) {
            notification.success('批量删除成功');
            // Refresh to ensure correct state
            fetchArticles(); 
            selectedArticles.value = [];
        } else {
            throw new Error('批量删除失败');
        }
    } catch(e) {
        notification.error(e.message);
    }
};
const togglePreview = () => {
    showPreview.value = !showPreview.value;
};
</script>
