<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold dark:text-white">友情链接管理</h2>
        <button @click="showAddModal = true" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition">
            添加友链
        </button>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead class="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                    <th scope="col" class="px-6 py-3">名称</th>
                    <th scope="col" class="px-6 py-3">链接</th>
                    <th scope="col" class="px-6 py-3">排序</th>
                    <th scope="col" class="px-6 py-3">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="link in links" :key="link.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ link.name }}</td>
                    <td class="px-6 py-4 truncate max-w-xs">{{ link.url }}</td>
                    <td class="px-6 py-4">{{ link.sort_order }}</td>
                    <td class="px-6 py-4 space-x-2">
                        <button @click="editLink(link)" class="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition">
                            <i class="fas fa-edit mr-1"></i>编辑
                        </button>
                        <button @click="deleteLink(link.id)" class="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                            <i class="fas fa-trash mr-1"></i>删除
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Modal -->
    <div v-if="showAddModal || editingLink" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-dark-card p-6 rounded-lg w-full max-w-md">
            <h3 class="text-lg font-bold mb-4 dark:text-white">{{ editingLink ? '编辑友链' : '添加友链' }}</h3>
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
import { ref, computed, onMounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';

const links = ref([]);
const dataStore = useDataStore();
const authStore = useAuthStore();

const showAddModal = ref(false);
const editingLink = ref(null);
const form = ref({ name: '', url: '', description: '', icon: '', sort_order: 0 });
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
        alert('请先输入友链链接');
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
    await loadLinks();
});

const loadLinks = async () => {
    try {
        links.value = await dataStore.fetchAdminFriendLinks(authStore.token);
    } catch (e) {
        console.error(e);
    }
}

const editLink = (link) => {
    editingLink.value = link;
    form.value = { ...link };
    showAddModal.value = true;
}

const deleteLink = async (id) => {
    if(!confirm('确定要删除这个友链吗?')) return;
    await dataStore.deleteFriendLink(authStore.token, id);
    await loadLinks();
}

const closeModal = () => {
    showAddModal.value = false;
    editingLink.value = null;
    form.value = { name: '', url: '', description: '', icon: '', sort_order: 0 };
}

const handleSubmit = async () => {
    if (editingLink.value) {
        await dataStore.updateFriendLink(authStore.token, editingLink.value.id, form.value);
    } else {
        await dataStore.createFriendLink(authStore.token, form.value);
    }
    closeModal();
    await loadLinks();
}
</script>
