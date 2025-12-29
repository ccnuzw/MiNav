<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-dark-card p-6 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
      <h3 class="text-lg font-bold mb-4 dark:text-white">匹配图标</h3>
      
      <div class="flex-1 overflow-y-auto space-y-4">
        <!-- Step 1: Scan / Settings -->
        <div v-if="!processing && !completed">
            
            <!-- Settings Panel -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded border dark:border-gray-700 space-y-3 mb-4">
                <h4 class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">设置</h4>
                
                <div class="flex items-center space-x-4">
                    <div class="flex-1">
                        <label class="block text-xs font-medium text-gray-500 mb-1">图标来源</label>
                        <select v-model="settings.source" class="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="google">Google Favicon API</option>
                            <option value="unavatar">Unavatar</option>
                            <option value="clearbit">Clearbit</option>
                            <option value="iconhorse">Icon Horse</option>
                        </select>
                    </div>
                </div>

                <div class="flex items-center space-x-6 pt-2">
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.overwrite" class="form-checkbox rounded text-primary border-gray-300 dark:border-gray-600 focus:ring-primary h-4 w-4">
                        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">覆盖已有图标</span>
                    </label>

                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.randomFallback" class="form-checkbox rounded text-primary border-gray-300 dark:border-gray-600 focus:ring-primary h-4 w-4">
                        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">智能随机图标 (当无链接或获取失败时)</span>
                    </label>
                </div>
                
                <!-- Rescan button needed if overwrite changed because target items change -->
                <div class="mt-2 text-right">
                    <button @click="scanItems" class="text-xs text-primary hover:underline">
                        <i class="fas fa-sync-alt mr-1"></i>重新扫描
                    </button>
                </div>
            </div>

            <div v-if="loading" class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
                <p class="mt-2 text-gray-500">正在扫描项目...</p>
            </div>

            <div v-else class="space-y-4">
                <div class="flex justify-between items-center p-4 border rounded dark:border-gray-700">
                    <span class="dark:text-gray-300">待处理项目数</span>
                    <span class="text-xl font-bold dark:text-white">{{ targetItems.length }} / {{ totalItems }}</span>
                </div>
                
                <div v-if="targetItems.length > 0" class="max-h-60 overflow-y-auto border rounded dark:border-gray-700 p-2">
                    <ul class="space-y-1 text-sm">
                        <li v-for="item in targetItems" :key="item.id" class="flex justify-between items-center text-gray-600 dark:text-gray-400 p-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span class="truncate max-w-[60%]">{{ item.name }}</span>
                            <div class="flex items-center space-x-2 text-xs">
                                <span v-if="item.icon && settings.overwrite" class="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">将覆盖</span>
                                <span v-if="!item.url" class="text-red-500 bg-red-50 dark:bg-red-900/20 px-1 rounded">无链接</span>
                                <span class="text-gray-400 max-w-[150px] truncate">{{ item.url || '-' }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div v-else class="text-center py-4 text-gray-500">
                    没有发现需要匹配图标的项目。
                </div>
            </div>
        </div>

        <!-- Step 2: Processing -->
        <div v-else class="space-y-4">
            <div class="mb-2 flex justify-between text-sm dark:text-gray-300">
                <span>进度</span>
                <span>{{ processedCount }} / {{ targetItems.length }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div class="bg-primary h-2.5 rounded-full transition-all duration-300" :style="{ width: progressPercent + '%' }"></div>
            </div>

            <div class="h-60 overflow-y-auto border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 font-mono text-xs">
                 <div v-for="(log, index) in logs" :key="index" :class="log.type === 'error' ? 'text-red-500' : (log.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-gray-500')">
                    [{{ log.time }}] <span v-html="log.message"></span>
                 </div>
                 <div ref="logEnd"></div>
            </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-4 pt-4 border-t dark:border-gray-700">
        <button v-if="!processing" @click="close" class="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
            {{ completed ? '关闭' : '取消' }}
        </button>
        <button 
            v-if="!processing && !completed && targetItems.length > 0 && !loading" 
            @click="startMatching" 
            class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
        >
            开始匹配
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'refresh']);

const dataStore = useDataStore();
const authStore = useAuthStore();

const loading = ref(false);
const processing = ref(false);
const completed = ref(false);

const totalItems = ref(0);
const targetItems = ref([]);
const logs = ref([]);
const processedCount = ref(0);
const successCount = ref(0);
const failCount = ref(0);
const logEnd = ref(null);

const settings = ref({
    source: 'google',
    overwrite: false,
    randomFallback: false
});

const randomIcons = ['fas fa-cloud', 'fas fa-link', 'fas fa-globe', 'fas fa-code', 'fas fa-star', 'fas fa-bookmark', 'fas fa-paper-plane', 'fas fa-server'];
const randomColors = ['text-blue-500', 'text-green-500', 'text-indigo-500', 'text-yellow-500', 'text-purple-500', 'text-red-500', 'text-pink-500'];

const progressPercent = computed(() => {
    if (targetItems.value.length === 0) return 0;
    return Math.round((processedCount.value / targetItems.value.length) * 100);
});

const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    logs.value.push({ time, message, type });
    nextTick(() => {
        if (logEnd.value) logEnd.value.scrollIntoView({ behavior: 'smooth' });
    });
};

const scanItems = async () => {
    loading.value = true;
    targetItems.value = [];
    logs.value = [];
    processedCount.value = 0;
    completed.value = false;
    successCount.value = 0;
    failCount.value = 0;
    
    try {
        let allItems = [];
        let page = 1;
        let hasMore = true;
        const limit = 100;

        while (hasMore) {
            const res = await dataStore.fetchAdminItems(authStore.token, page, limit, 'all');
            allItems = allItems.concat(res.results);
            if (allItems.length >= res.total) {
                hasMore = false;
            } else {
                page++;
            }
        }

        totalItems.value = allItems.length;
        
        // Filter based on overwrite setting
        if (settings.value.overwrite) {
            targetItems.value = allItems;
        } else {
            targetItems.value = allItems.filter(item => !item.icon || item.icon.trim() === '');
        }
        
    } catch (e) {
        addLog('扫描失败: ' + e.message, 'error');
    } finally {
        loading.value = false;
    }
};

const getRandomIcon = () => {
    const icon = randomIcons[Math.floor(Math.random() * randomIcons.length)];
    // const color = randomColors[Math.floor(Math.random() * randomColors.length)];
    return icon; // Simplified: just return class, styling handled by parent usually but 'text-color' might need to be in class string if we support it.
    // AdminItems uses :class="item.icon", so we can include color classes.
    // e.g. "fas fa-cloud text-blue-500"
};

const startMatching = async () => {
    processing.value = true;
    addLog('开始处理...');
    addLog(`使用源: ${settings.value.source}, 覆盖: ${settings.value.overwrite ? '是' : '否'}`);

    for (const item of targetItems.value) {
        processedCount.value++;
        
        try {
            let iconUrl = '';

            // Check if needs processing
            if (!item.url) {
                if (settings.value.randomFallback) {
                    iconUrl = getRandomIcon();
                    addLog(`项目 ${item.name} 无链接 -> 使用随机图标`, 'warning');
                } else {
                    addLog(`跳过项目 ${item.name}: 无链接`, 'warning');
                    continue;
                }
            } else {
                 const domain = new URL(item.url).hostname;
                 switch (settings.value.source) {
                    case 'google':
                        iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                        break;
                    case 'unavatar':
                        iconUrl = `https://unavatar.io/${domain}`;
                        break;
                    case 'clearbit':
                        iconUrl = `https://logo.clearbit.com/${domain}`;
                        break;
                    case 'iconhorse':
                        iconUrl = `https://icon.horse/icon/${domain}`;
                        break;
                 }
            }
            
            // If random fallback enabled, we might want to check if the icon is valid (hard for external URL).
            // But if we generated a specific URL, we use it.
            
            // Update item
            if (iconUrl) {
                await dataStore.updateItem(authStore.token, item.id, { ...item, icon: iconUrl });
                successCount.value++;
                addLog(`已更新 ${item.name}`, 'success');
            }
            
        } catch (e) {
            // Fallback on error if random enabled
             if (settings.value.randomFallback) {
                try {
                    const randomIcon = getRandomIcon();
                    await dataStore.updateItem(authStore.token, item.id, { ...item, icon: randomIcon });
                    successCount.value++;
                    addLog(`更新失败 (已转随机) ${item.name}`, 'warning');
                } catch (err2) {
                    failCount.value++;
                    addLog(`更新失败 ${item.name}: ${e.message}`, 'error');
                }
            } else {
                failCount.value++;
                addLog(`更新失败 ${item.name}: ${e.message}`, 'error');
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 50)); // Fast processing
    }

    addLog(`处理完成! 成功: ${successCount.value}, 失败: ${failCount.value}`, 'success');
    completed.value = true;
    processing.value = false;
    emit('refresh');
};

const close = () => {
    emit('close');
};

// Rescan when settings change that affect target selection (overwrite)
watch(() => settings.value.overwrite, () => {
    scanItems();
});

onMounted(() => {
    scanItems();
});
</script>
