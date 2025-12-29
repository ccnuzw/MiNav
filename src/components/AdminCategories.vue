<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold dark:text-white">分类管理</h2>
        <button @click="openAddModal" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition">
            添加分类
        </button>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead class="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                    <th scope="col" class="px-6 py-3">名称</th>
                    <th scope="col" class="px-6 py-3">图标 (Material Icon)</th>
                    <th scope="col" class="px-6 py-3">排序</th>
                    <th scope="col" class="px-6 py-3">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="cat in categories" :key="cat.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ cat.name }}</td>
                    <td class="px-6 py-4"><span class="material-symbols-outlined">{{ cat.icon }}</span> ({{ cat.icon }})</td>
                    <td class="px-6 py-4">{{ cat.sort_order }}</td>
                    <td class="px-6 py-4 space-x-2">
                        <button @click="openEditModal(cat)" class="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                            <i class="fas fa-edit mr-1"></i>编辑
                        </button>
                        <button @click="deleteCategory(cat.id)" class="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                            <i class="fas fa-trash mr-1"></i>删除
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-dark-card p-6 rounded-lg w-full max-w-md">
            <h3 class="text-lg font-bold mb-4 dark:text-white">{{ isEditing ? '编辑分类' : '添加分类' }}</h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300">名称</label>
                    <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
                </div>
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300">描述</label>
                    <textarea v-model="form.description" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="分类描述..."></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300 mb-2">图标</label>
                    <div class="flex items-start gap-4 mb-3">
                        <!-- 图标预览 -->
                        <div class="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <span class="material-symbols-outlined text-3xl text-gray-600 dark:text-gray-300">{{ form.icon || 'help' }}</span>
                        </div>
                        <div class="flex-1">
                            <input v-model="iconSearch" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm" placeholder="搜索图标..." />
                            <input v-model="form.icon" type="text" class="w-full border rounded px-3 py-2 mt-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm" placeholder="图标代码 (如 home, folder, star)" />
                        </div>
                    </div>
                    <!-- 图标列表 -->
                    <div class="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto border p-2 rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                         <button type="button" v-for="icon in filteredIcons" :key="icon" @click="form.icon = icon" 
                            :class="form.icon === icon ? 'bg-primary text-white ring-2 ring-primary ring-offset-1' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'"
                            class="p-2 rounded flex items-center justify-center transition" :title="icon">
                            <span class="material-symbols-outlined text-xl">{{ icon }}</span>
                         </button>
                         <p v-if="filteredIcons.length === 0" class="col-span-8 text-center text-gray-400 text-sm py-4">未找到匹配的图标</p>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">
                        更多图标请访问 <a href="https://fonts.google.com/icons" target="_blank" class="text-primary dark:text-accent hover:underline">Google Material Icons</a>
                    </p>
                </div>
                 <div>
                    <label class="block text-sm font-medium dark:text-gray-300">排序</label>
                    <input v-model="form.sort_order" type="number" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                </div>
                <div class="flex justify-end space-x-2 mt-4">
                    <button type="button" @click="showAddModal = false" class="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">取消</button>
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
import { useNotificationStore } from '../stores/notification';

// 扩展的图标列表
const predefinedIcons = [
    // 常用
    'folder', 'home', 'star', 'favorite', 'bookmark', 'apps', 'category',
    // 文件媒体
    'image', 'photo_library', 'video_library', 'audio_file', 'description', 'article',
    // 通讯
    'mail', 'chat', 'forum', 'send', 'notifications', 'campaign',
    // 链接工具
    'link', 'attach_file', 'share', 'qr_code', 'short_text',
    // 开发
    'code', 'terminal', 'api', 'data_object', 'javascript', 'integration_instructions',
    // 云存储
    'cloud', 'cloud_upload', 'cloud_download', 'storage', 'database', 'backup',
    // 安全
    'security', 'lock', 'vpn_lock', 'shield', 'verified_user', 'key',
    // 设置工具
    'settings', 'build', 'tune', 'extension', 'widgets', 'handyman',
    // 商业
    'shopping_cart', 'store', 'payments', 'credit_card', 'receipt', 'analytics',
    // 社交
    'person', 'group', 'public', 'language', 'translate', 'travel_explore',
    // 时间
    'schedule', 'timer', 'history', 'update', 'event',
    // 视觉
    'visibility', 'palette', 'brush', 'design_services', 'auto_awesome',
    // 其他
    'search', 'help', 'info', 'support', 'lightbulb', 'emoji_objects', 'rocket_launch', 'bolt'
];

const iconSearch = ref('');
const filteredIcons = computed(() => {
    if (!iconSearch.value) return predefinedIcons;
    const query = iconSearch.value.toLowerCase();
    return predefinedIcons.filter(icon => icon.includes(query));
});

const categories = ref([]);
const dataStore = useDataStore();
const authStore = useAuthStore();
const notification = useNotificationStore();

const showAddModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const form = ref({ name: '', icon: '', sort_order: 0, description: '' });

onMounted(async () => {
    await loadCategories();
});

const loadCategories = async () => {
    try {
        categories.value = await dataStore.fetchAdminCategories(authStore.token);
    } catch(e) {
        console.error(e);
    }
}

const openAddModal = () => {
    isEditing.value = false;
    form.value = { name: '', icon: '', sort_order: 0, description: '' };
    showAddModal.value = true;
}

const openEditModal = (cat) => {
    isEditing.value = true;
    editingId.value = cat.id;
    form.value = {
        name: cat.name,
        icon: cat.icon,
        sort_order: cat.sort_order,
        description: cat.description || ''
    };
    showAddModal.value = true;
}

const deleteCategory = async (id) => {
    const confirmed = await notification.confirm({
        title: '删除确认',
        message: '确定要删除这个分类吗？此操作不可撤销。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消'
    });
    if (!confirmed) return;
    try {
        await dataStore.deleteCategory(authStore.token, id);
        notification.success('分类已删除');
        await loadCategories();
    } catch (e) {
        notification.error('删除失败: ' + e.message);
    }
}

const handleSubmit = async () => {
    try {
        if (isEditing.value) {
            await dataStore.updateCategory(authStore.token, editingId.value, form.value);
            notification.success('分类已更新');
        } else {
            await dataStore.createCategory(authStore.token, form.value);
            notification.success('分类已创建');
        }
        showAddModal.value = false;
        form.value = { name: '', icon: '', sort_order: 0, description: '' };
        isEditing.value = false;
        editingId.value = null;
        await loadCategories();
    } catch (e) {
        notification.error('操作失败: ' + e.message);
    }
}
</script>
