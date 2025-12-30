<template>
  <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">订阅源管理</h2>
          
          <!-- Global Mode Toggle -->
          <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-500">全局模式:</span>
              <button 
                @click="toggleGlobalMode"
                class="px-2 py-0.5 rounded-full text-xs font-medium border transition flex items-center gap-1"
                :class="globalMode === 'live' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'"
              >
                <i class="fas" :class="globalMode === 'live' ? 'fa-bolt' : 'fa-database'"></i>
                {{ globalMode === 'live' ? '实时 (Live)' : '本地 (Local)' }}
              </button>
          </div>
      </div>

      <div class="flex gap-2">
        <button 
          @click="initiateSync"
          :disabled="syncing || globalMode === 'live'"
          class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          :title="globalMode === 'live' ? '实时模式下无需手动同步' : '同步文章到本地数据库'"
        >
          <svg class="w-4 h-4" :class="{'animate-spin': syncing}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ syncing ? '同步中...' : (selectedFeeds.length > 0 ? `同步选中 (${selectedFeeds.length})` : '同步全部') }}
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
            <th class="py-3 px-4 w-10">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-primary text-primary" />
            </th>
            <th class="py-3 font-medium">源名称</th>
            <th class="py-3 font-medium">地址 (URL)</th>
            <th class="py-3 font-medium">上次同步</th>
            <th class="py-3 font-medium">状态</th>
            <th class="py-3 font-medium">前台显示</th> <!-- Renamed from Mode -->
            <th class="py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-if="loading" class="animate-pulse">
             <td colspan="7" class="py-4 text-center text-gray-500">加载中...</td>
          </tr>
          <tr v-else-if="feeds.length === 0">
             <td colspan="7" class="py-4 text-center text-gray-500">暂无订阅源，请添加</td>
          </tr>
          <tr 
            v-else 
            v-for="feed in feeds" 
            :key="feed.id"
            class="border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition group"
          >
            <td class="py-3 px-4">
                <input type="checkbox" :value="feed.id" v-model="selectedFeeds" class="rounded border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-primary text-primary" />
            </td>
            <td class="py-3 pr-4 font-medium text-gray-800 dark:text-white">{{ feed.name }}</td>
            <td class="py-3 text-gray-400 text-xs max-w-xs truncate" :title="feed.url">{{ feed.url }}</td>
            <td class="py-3 text-gray-500">{{ formatTime(feed.last_sync) || '从未' }}</td>
            <td class="py-3">
              <span class="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                活跃
              </span>
            </td>
            <td class="py-3">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" :checked="feed.show_in_list === 1" @change="toggleShowInList(feed)" class="sr-only peer">
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
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
            class="bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative space-y-3"
        >
            <div class="flex items-start gap-3">
                <!-- Checkbox -->
                <div class="flex items-center pt-1">
                    <input type="checkbox" :value="feed.id" v-model="selectedFeeds" class="w-5 h-5 rounded border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-primary text-primary" />
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0 space-y-1">
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between items-start gap-2">
                             <h4 class="text-base font-bold text-gray-900 dark:text-white break-all leading-tight">{{ feed.name }}</h4>
                             <div class="flex items-center gap-2 shrink-0">
                                 <!-- Show Toggle Mobile -->
                                 <div class="flex items-center gap-1 bg-gray-50 dark:bg-dark-bg/50 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                                      <span class="text-[10px] text-gray-500">前台:</span>
                                      <label class="relative inline-flex items-center cursor-pointer scale-75 origin-left">
                                         <input type="checkbox" :checked="feed.show_in_list === 1" @change="toggleShowInList(feed)" class="sr-only peer">
                                         <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                      </label>
                                 </div>
                                 <span class="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
                                    活跃
                                 </span>
                             </div>
                        </div>
                        <div class="text-xs text-gray-500 break-all font-mono bg-gray-50 dark:bg-dark-bg/50 px-2 py-1 rounded select-all">{{ feed.url }}</div>
                    </div>
                </div>
            </div>
            
            <!-- Footer Info & Actions -->
            <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-dark-border">
                 <div class="text-xs text-gray-400 flex items-center gap-1">
                    <i class="fas fa-clock"></i>
                    {{ formatTime(feed.last_sync) || '从未' }}
                 </div>
                 <div class="flex items-center gap-3">
                    <button @click="openEditModal(feed)" class="text-gray-500 hover:text-primary transition p-1">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteFeed(feed.id)" class="text-gray-500 hover:text-red-500 transition p-1">
                        <i class="fas fa-trash-alt"></i>
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

    <!-- Sync Preview Modal -->
    <Teleport to="body">
      <div v-if="showSyncModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showSyncModal = false"></div>
        <div class="relative bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div class="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">同步预览</h3>
                <button @click="showSyncModal = false" class="text-gray-400 hover:text-gray-500">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div v-if="itemLoading" class="text-center py-8">
                    <svg class="animate-spin h-8 w-8 text-primary mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="text-gray-500">正在获取 RSS 内容...</p>
                </div>
                <div v-else>
                    <div v-if="previewItems.length === 0" class="text-center py-8 text-gray-500">
                        未在订阅源中发现文章
                    </div>
                    <div v-else>
                        <!-- Desktop Table -->
                        <div class="hidden md:block">
                            <table class="w-full text-left text-sm">
                                <thead>
                                    <tr class="text-gray-500 dark:text-gray-400 border-b dark:border-dark-border">
                                        <th class="py-2 font-medium">标题</th>
                                        <th class="py-2 font-medium w-48">来源</th>
                                        <th class="py-2 font-medium w-40">发布时间</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, idx) in paginatedPreviewItems" :key="idx" class="border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition">
                                        <td class="py-3 pr-4 font-medium dark:text-white truncate max-w-lg" :title="item.title">{{ item.title }}</td>
                                        <td class="py-3 text-gray-500 truncate" :title="item.feedName">{{ item.feedName }}</td>
                                        <td class="py-3 text-gray-500 whitespace-nowrap text-xs">{{ new Date(item.pubDate).toLocaleString() }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Mobile Cards -->
                        <div class="grid grid-cols-1 gap-3 md:hidden">
                            <div v-for="(item, idx) in paginatedPreviewItems" :key="idx" class="bg-gray-50 dark:bg-dark-bg/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                                <h4 class="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 text-sm">{{ item.title }}</h4>
                                <div class="flex justify-between items-center text-xs text-gray-500">
                                    <span class="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{{ item.feedName }}</span>
                                    <span>{{ new Date(item.pubDate).toLocaleDateString() }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                             <span class="text-xs text-gray-500">共 {{ previewItems.length }} 条记录</span>
                             <div class="flex gap-2 w-full sm:w-auto justify-center">
                                <button class="px-3 py-1.5 border rounded-lg text-xs disabled:opacity-50 dark:border-dark-border dark:text-white hover:bg-gray-50 dark:hover:bg-dark-bg transition" :disabled="previewPage === 1" @click="previewPage--">上一页</button>
                                <span class="text-xs py-1.5 px-2 dark:text-white font-medium">{{ previewPage }} / {{ Math.ceil(previewItems.length / previewLimit) }}</span>
                                <button class="px-3 py-1.5 border rounded-lg text-xs disabled:opacity-50 dark:border-dark-border dark:text-white hover:bg-gray-50 dark:hover:bg-dark-bg transition" :disabled="previewPage * previewLimit >= previewItems.length" @click="previewPage++">下一页</button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-6 border-t border-gray-100 dark:border-dark-border flex justify-end gap-3">
                <button @click="showSyncModal = false" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg">取消</button>
                <button @click="confirmSync" :disabled="itemLoading || previewItems.length === 0 || syncing" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    {{ syncing ? '同步中...' : '确定同步' }}
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
const feeds = ref([]);
const loading = ref(false);
const syncing = ref(false);

const selectedFeeds = ref([]);
const isAllSelected = computed(() => feeds.value.length > 0 && selectedFeeds.value.length === feeds.value.length);

const showAddModal = ref(false);
const adding = ref(false);
const isEditing = ref(false);
const form = reactive({
    id: null,
    name: '',
    url: ''
});

// Sync Preview State
const showSyncModal = ref(false);
const itemLoading = ref(false);
const previewItems = ref([]);
const previewPage = ref(1);
const previewLimit = 20;

const paginatedPreviewItems = computed(() => {
    const start = (previewPage.value - 1) * previewLimit;
    return previewItems.value.slice(start, start + previewLimit);
});

onMounted(() => {
    fetchFeeds();
});

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedFeeds.value = [];
    } else {
        selectedFeeds.value = feeds.value.map(f => f.id);
    }
};

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
             // Remove from selection if exists
             selectedFeeds.value = selectedFeeds.value.filter(fid => fid !== id);
        } else {
            throw new Error('删除失败');
        }
    } catch(e) {
        notification.error(e.message);
    }
};

const initiateSync = async () => {
    showSyncModal.value = true;
    itemLoading.value = true;
    previewItems.value = [];
    previewPage.value = 1;

    const ids = selectedFeeds.value.length > 0 ? selectedFeeds.value : []; // Empty means all in our API logic, or we can pass all IDs. 
    // Logic: If user selects nothing -> Sync All. If selects some -> Sync Some.
    // However, for Preview of "All" it might be slow.
    // Let's assume selection empty = sync all.

    try {
        const res = await fetch('/api/admin/feeds/preview', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}` 
            },
            body: JSON.stringify({ ids })
        });
        const data = await res.json();
        if (data.items) {
            previewItems.value = data.items;
        }
    } catch (e) {
        notification.error('获取预览失败');
    } finally {
        itemLoading.value = false;
    }
};

const confirmSync = async () => {
    syncing.value = true;
    // We sync what was selected regardless of preview, assuming preview was consistent.
    const ids = selectedFeeds.value.length > 0 ? selectedFeeds.value : []; 
    try {
        const res = await fetch('/api/admin/feeds/sync', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}` 
            },
            body: JSON.stringify({ ids })
        });
        const data = await res.json();
        if(data.success) {
            notification.success(`同步完成，新增 ${data.new_items} 篇文章`);
            showSyncModal.value = false;
            fetchFeeds();
            selectedFeeds.value = [];
        } else {
            notification.error('同步出现错误');
        }
    } catch(e) {
        notification.error('同步请求失败');
    } finally {
        syncing.value = false;
    }
};

const globalMode = ref('local');

const fetchGlobalMode = async () => {
    try {
        const res = await fetch('/api/public/settings'); // Use public settings which now may contain it, or admin endpoint
        // Wait, public settings fetches all.
        const data = await res.json();
        if (data.rss_global_mode) {
            globalMode.value = data.rss_global_mode;
        }
    } catch (e) {
        console.error("Error fetching global mode", e);
    }
}

const toggleGlobalMode = async () => {
    const newMode = globalMode.value === 'live' ? 'local' : 'live';
    try {
        const res = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${authStore.token}` 
            },
            body: JSON.stringify({ rss_global_mode: newMode })
        });
        
        if(!res.ok) throw new Error('更新失败');
        
        globalMode.value = newMode;
        notification.success(`全局RSS模式已切换为${newMode === 'live' ? '实时' : '本地'}`);
        // If switching to local, maybe prompt sync?
    } catch(e) {
        notification.error(e.message);
    }
};

const toggleShowInList = async (feed) => {
    const newVal = feed.show_in_list === 1 ? 0 : 1;
    try {
        const res = await fetch(`/api/admin/feeds/${feed.id}`, {
            method: 'PUT',
            headers: { 
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${authStore.token}` 
            },
            body: JSON.stringify({ show_in_list: newVal })
        });
        
        if(!res.ok) throw new Error('更新失败');
        
        feed.show_in_list = newVal;
        notification.success(`已${newVal ? '显示' : '隐藏'}该订阅源`);
    } catch(e) {
        notification.error(e.message);
        // revert logic if needed
    }
};

onMounted(() => {
    fetchFeeds();
    fetchGlobalMode();
});
</script>
