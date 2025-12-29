<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold dark:text-white">项目管理</h2>
        <div class="flex items-center space-x-2">
            <select v-model="filterCategoryId" @change="resetAndLoad" class="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                <option value="all">所有分类</option>
                <option v-for="cat in categories.filter(c => c.name !== '全部项目')" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <button @click="showAddModal = true" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition">
                添加项目
            </button>
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead class="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                    <th scope="col" class="px-4 py-3 w-16">图标</th>
                    <th scope="col" class="px-6 py-3">名称</th>
                    <th scope="col" class="px-6 py-3">链接</th>
                    <th scope="col" class="px-6 py-3">分类</th>
                    <th scope="col" class="px-6 py-3">标签</th>
                    <th scope="col" class="px-6 py-3">排序</th>
                    <th scope="col" class="px-6 py-3">状态</th>
                    <th scope="col" class="px-6 py-3">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in items" :key="item.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="px-4 py-4">
                        <div class="w-8 h-8 rounded flex items-center justify-center overflow-hidden">
                            <img v-if="getItemIconType(item) === 'image'" :src="getItemIconSrc(item)" alt="" class="w-full h-full object-cover" />
                            <i v-else :class="getItemIconSrc(item)" class="text-lg text-gray-600 dark:text-gray-300"></i>
                        </div>
                    </td>
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ item.name }}</td>
                    <td class="px-6 py-4 truncate max-w-xs">{{ item.url }}</td>
                    <td class="px-6 py-4">{{ getCategoryName(item.category_id) }}</td>
                    <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-1">
                            <span v-for="tag in (item.tags || [])" :key="tag.id" class="px-2 py-0.5 text-xs font-medium rounded-full text-white" :style="{ backgroundColor: tag.color }">{{ tag.name }}</span>
                            <span v-if="!item.tags || item.tags.length === 0" class="text-gray-400 text-xs">无</span>
                        </div>
                    </td>
                    <td class="px-6 py-4">{{ item.sort_order }}</td>
                    <td class="px-6 py-4">
                        <span :class="item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-0.5 rounded text-xs">{{ item.status }}</span>
                    </td>
                    <td class="px-6 py-4 space-x-2">
                        <button @click="editItem(item)" class="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition">
                            <i class="fas fa-edit mr-1"></i>编辑
                        </button>
                        <button @click="deleteItem(item.id)" class="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                            <i class="fas fa-trash mr-1"></i>删除
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Pagination Controls -->
    <div class="flex justify-between items-center mt-4 px-2">
        <span class="text-sm text-gray-700 dark:text-gray-400">
            显示 {{ (page - 1) * limit + 1 }} 到 {{ Math.min(page * limit, total) }} 条，共 {{ total }} 条
        </span>
        <div class="flex space-x-2">
            <button 
                @click="changePage(page - 1)" 
                :disabled="page === 1"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
                上一页
            </button>
            <span class="px-3 py-1 text-sm dark:text-white">第 {{ page }} 页</span>
            <button 
                @click="changePage(page + 1)" 
                :disabled="page * limit >= total"
                class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
                下一页
            </button>
        </div>
    </div>

    <!-- Modal (Simplified) -->
    <div v-if="showAddModal || editingItem" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-dark-card p-6 rounded-lg w-full max-w-md">
            <h3 class="text-lg font-bold mb-4 dark:text-white">{{ editingItem ? '编辑项目' : '添加项目' }}</h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300">名称</label>
                    <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
                </div>
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300">链接</label>
                    <input v-model="form.url" type="url" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
                </div>
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300">分类</label>
                    <select v-model="form.category_id" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                </div>
                 <div>
                    <label class="block text-sm font-medium dark:text-gray-300">描述</label>
                    <textarea v-model="form.description" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300 mb-2">图标</label>
                    <div class="flex items-start gap-4">
                        <!-- 图标预览 -->
                        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex-shrink-0">
                            <img v-if="iconPreviewUrl" :src="iconPreviewUrl" alt="图标预览" class="w-full h-full object-cover" @error="iconPreviewError = true" />
                            <i v-else-if="form.icon && !form.icon.startsWith('http')" :class="form.icon" class="text-2xl text-gray-500"></i>
                            <span v-else class="text-gray-400 text-xs text-center">预览</span>
                        </div>
                        <div class="flex-1 space-y-2">
                            <input v-model="form.icon" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm" placeholder="图标URL、FontAwesome类名 或 留空自动获取" />
                            <!-- 快捷操作 -->
                            <div class="flex flex-wrap gap-2">
                                <button type="button" @click="autoFetchIcon('unavatar')" class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                                    <i class="fas fa-magic mr-1"></i>Unavatar
                                </button>
                                <button type="button" @click="autoFetchIcon('clearbit')" class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition">
                                    <i class="fas fa-building mr-1"></i>Clearbit
                                </button>
                                <button type="button" @click="autoFetchIcon('iconhorse')" class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition">
                                    <i class="fas fa-horse mr-1"></i>Icon Horse
                                </button>
                                <button type="button" @click="form.icon = ''" class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                    <i class="fas fa-undo mr-1"></i>使用默认
                                </button>
                            </div>
                            <p class="text-xs text-gray-400">留空将自动从网站获取图标 | 支持 FontAwesome 类名如 <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">fab fa-github</code></p>
                        </div>
                    </div>
                </div>
                 <div>
                    <label class="block text-sm font-medium dark:text-gray-300">排序 (Sort Order)</label>
                    <input v-model="form.sort_order" type="number" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                </div>
                 <div>
                    <label class="block text-sm font-medium dark:text-gray-300">状态</label>
                    <select v-model="form.status" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                        <option value="active">启用</option>
                        <option value="inactive">禁用</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300 mb-2">标签</label>
                    <div class="flex flex-wrap gap-2 p-3 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-800 max-h-32 overflow-y-auto">
                        <label v-for="tag in allTags" :key="tag.id" class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" :value="tag.id" v-model="form.tag_ids" class="form-checkbox h-4 w-4 rounded border-gray-300 dark:border-gray-600" :style="{ accentColor: tag.color }" />
                            <span class="ml-1.5 text-sm px-2 py-0.5 rounded-full text-white" :style="{ backgroundColor: tag.color }">{{ tag.name }}</span>
                        </label>
                        <span v-if="allTags.length === 0" class="text-gray-400 text-sm">暂无标签，请先在标签管理中创建</span>
                    </div>
                </div>
                <div class="flex justify-end space-x-2 mt-4">
                    <button type="button" @click="closeModal" class="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">取消</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded">保存</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';

const props = defineProps(['categories']);
const items = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(20);

const dataStore = useDataStore();
const authStore = useAuthStore();

// 获取项目图标类型
const getItemIconType = (item) => {
    const icon = item.icon || dataStore.settings.default_icon || 'fab fa-github';
    if (icon.startsWith('http') || icon.startsWith('/')) return 'image';
    return 'class';
};

// 获取项目图标源
const getItemIconSrc = (item) => {
    return item.icon || dataStore.settings.default_icon || 'fab fa-github';
};

const showAddModal = ref(false);
const editingItem = ref(null);
const form = ref({ name: '', url: '', category_id: null, description: '', icon: '', status: 'active', sort_order: 0, tag_ids: [] });
const filterCategoryId = ref('all');
const allTags = ref([]);
const iconPreviewError = ref(false);

// 图标预览URL计算
const iconPreviewUrl = computed(() => {
    if (!form.value.icon) return '';
    if (form.value.icon.startsWith('http') || form.value.icon.startsWith('/')) {
        return form.value.icon;
    }
    return ''; // FontAwesome类名，不返回URL
});

// 自动获取图标
const autoFetchIcon = (service) => {
    if (!form.value.url) {
        alert('请先输入项目链接');
        return;
    }
    try {
        const domain = new URL(form.value.url).hostname;
        switch (service) {
            case 'unavatar':
                form.value.icon = `https://unavatar.io/${domain}`;
                break;
            case 'clearbit':
                form.value.icon = `https://logo.clearbit.com/${domain}`;
                break;
            case 'iconhorse':
                form.value.icon = `https://icon.horse/icon/${domain}`;
                break;
        }
        iconPreviewError.value = false;
    } catch {
        alert('链接格式不正确');
    }
};

onMounted(async () => {
    await loadItems();
    await loadTags();
});

const loadTags = async () => {
    try {
        allTags.value = await dataStore.fetchAdminTags(authStore.token);
    } catch (e) {
        console.error('Failed to load tags', e);
    }
};

const loadItems = async () => {
    try {
        const res = await dataStore.fetchAdminItems(authStore.token, page.value, limit.value, filterCategoryId.value);
        items.value = res.results;
        total.value = res.total;
    } catch (e) {
        console.error(e);
    }
}

const changePage = (newPage) => {
    page.value = newPage;
    loadItems();
}

const resetAndLoad = () => {
    page.value = 1;
    loadItems();
}

const getCategoryName = (id) => {
    const cat = props.categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
}

const editItem = (item) => {
    editingItem.value = item;
    form.value = { 
        ...item, 
        tag_ids: (item.tags || []).map(t => t.id) 
    };
    showAddModal.value = true;
}

const deleteItem = async (id) => {
    if(!confirm('确定要删除这个项目吗?')) return;
    await dataStore.deleteItem(authStore.token, id);
    await loadItems();
}

const closeModal = () => {
    showAddModal.value = false;
    editingItem.value = null;
    form.value = { name: '', url: '', category_id: null, description: '', icon: '', status: 'active', sort_order: 0, tag_ids: [] };
}

const handleSubmit = async () => {
    if (editingItem.value) {
        await dataStore.updateItem(authStore.token, editingItem.value.id, form.value);
    } else {
        await dataStore.createItem(authStore.token, form.value);
    }
    closeModal();
    await loadItems();
}
</script>
