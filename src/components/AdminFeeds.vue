<template>
  <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white">订阅源管理</h2>
      <div class="flex gap-2">
        <button 
          @click="syncFeeds"
          :disabled="syncing"
          class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm disabled:opacity-50"
        >
          <svg class="w-4 h-4" :class="{'animate-spin': syncing}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ syncing ? '同步中...' : '同步全部' }}
        </button>
        <button 
          @click="showAddModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition text-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          添加订阅
        </button>
      </div>
    </div>

    <!-- Feed List (Desktop Table) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-dark-border">
            <th class="py-3 font-medium">源名称</th>
            <th class="py-3 font-medium">地址 (URL)</th>
            <th class="py-3 font-medium">上次同步</th>
            <th class="py-3 font-medium">状态</th>
            <th class="py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-if="loading" class="animate-pulse">
             <td colspan="5" class="py-4 text-center text-gray-500">加载中...</td>
          </tr>
          <tr v-else-if="feeds.length === 0">
             <td colspan="5" class="py-4 text-center text-gray-500">暂无订阅源，请添加</td>
          </tr>
          <tr 
            v-else 
            v-for="feed in feeds" 
            :key="feed.id"
            class="border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition group"
          >
            <td class="py-3 pr-4 font-medium text-gray-800 dark:text-white">{{ feed.name }}</td>
            <td class="py-3 text-gray-400 text-xs max-w-xs truncate" :title="feed.url">{{ feed.url }}</td>
            <td class="py-3 text-gray-500">{{ formatTime(feed.last_sync) || '从未' }}</td>
            <td class="py-3">
              <span class="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                活跃
              </span>
            </td>
            <td class="py-3 flex items-center gap-2">
              <button 
                @click="openEditModal(feed)" 
                class="text-blue-500 hover:text-blue-700 transition"
                title="编辑"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                @click="deleteFeed(feed.id)" 
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

    <!-- Mobile Feed Cards -->
    <div class="grid grid-cols-1 gap-4 md:hidden">
        <div v-if="loading" class="text-center py-4 text-gray-500">加载中...</div>
        <div v-else-if="feeds.length === 0" class="text-center py-4 text-gray-500">暂无订阅源，请添加</div>
        <div 
            v-else
            v-for="feed in feeds" 
            :key="feed.id" 
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative"
        >
            <div class="flex justify-between items-start mb-2 gap-2">
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-900 dark:text-white break-all leading-tight mb-1">{{ feed.name }}</h4>
                    <div class="text-xs text-gray-500 break-all">{{ feed.url }}</div>
                </div>
                 <span class="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
                    活跃
                 </span>
            </div>
            
            <div class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                 <div class="text-xs text-gray-400">上次同步: {{ formatTime(feed.last_sync) || '从未' }}</div>
                 <div class="space-x-2">
                    <button @click="openEditModal(feed)" class="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition">
                        编辑
                    </button>
                    <button @click="deleteFeed(feed.id)" class="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                        删除
                    </button>
                 </div>
            </div>
        </div>
    </div>

    <!-- Add/Edit Feed Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
        <div class="relative bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md flex flex-col p-6 space-y-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ isEditing ? '编辑订阅源' : '添加订阅源' }}</h3>
            
            <div>
               <label class="block text-sm font-medium mb-1 dark:text-gray-300">名称</label>
               <input v-model="form.name" class="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border dark:text-white" placeholder="例如: 周润发的博客" />
            </div>
            
            <div>
               <label class="block text-sm font-medium mb-1 dark:text-gray-300">RSS 地址</label>
               <input v-model="form.url" class="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border dark:text-white" placeholder="https://..." />
            </div>

            <div class="flex justify-end gap-3 mt-4">
                <button @click="showAddModal = false" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg">取消</button>
                <button @click="saveFeed" :disabled="adding" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    {{ adding ? '保存中...' : '确定' }}
                </button>
            </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useNotificationStore } from '../stores/notification';
import { useAuthStore } from '../stores/auth';

const notification = useNotificationStore();
const authStore = useAuthStore();
const feeds = ref([]);
const loading = ref(false);
const syncing = ref(false);

const showAddModal = ref(false);
const adding = ref(false);
const isEditing = ref(false);
const form = reactive({
    id: null,
    name: '',
    url: ''
});

onMounted(() => {
    fetchFeeds();
});

const fetchFeeds = async () => {
    loading.value = true;
    try {
        const res = await fetch('/api/admin/feeds', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if(res.ok) {
            feeds.value = await res.json();
        }
    } catch(e) {
        notification.error('加载订阅源失败');
    } finally {
        loading.value = false;
    }
};

const formatTime = (ts) => {
    if(!ts) return '';
    return new Date(ts).toLocaleString();
}

const openEditModal = (feed) => {
    isEditing.value = true;
    form.id = feed.id;
    form.name = feed.name;
    form.url = feed.url;
    showAddModal.value = true;
};

const saveFeed = async () => {
    if(!form.name || !form.url) return notification.error('请填写完整信息');
    
    adding.value = true;
    try {
        const url = isEditing.value ? `/api/admin/feeds/${form.id}` : '/api/admin/feeds';
        const method = isEditing.value ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${authStore.token}` 
            },
            body: JSON.stringify({ name: form.name, url: form.url })
        });
        
        if(!res.ok) throw new Error('保存失败');
        
        notification.success(isEditing.value ? '已更新' : '已添加');
        showAddModal.value = false;
        
        // Reset
        form.id = null;
        form.name = '';
        form.url = '';
        isEditing.value = false;
        
        fetchFeeds();
    } catch(e) {
        notification.error(e.message);
    } finally {
        adding.value = false;
    }
};

const deleteFeed = async (id) => {
    const confirmed = await notification.confirm({
        title: '删除确认',
        message: '确定删除此订阅源吗？相关已缓存的文章也会被清理。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消'
    });
    if(!confirmed) return;

    try {
        const res = await fetch(`/api/admin/feeds/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if(res.ok) {
            notification.success('已删除');
            feeds.value = feeds.value.filter(f => f.id !== id);
        } else {
            throw new Error('删除失败');
        }
    } catch(e) {
        notification.error(e.message);
    }
};

const syncFeeds = async () => {
    syncing.value = true;
    try {
        const res = await fetch('/api/admin/feeds/sync', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        const data = await res.json();
        if(data.success) {
            notification.success(`同步完成，新增 ${data.new_items} 篇文章`);
            fetchFeeds(); // Update last sync time
        } else {
            notification.error('同步出现错误');
        }
    } catch(e) {
        notification.error('同步请求失败');
    } finally {
        syncing.value = false;
    }
};
</script>
