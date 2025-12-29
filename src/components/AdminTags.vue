<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold dark:text-white">标签管理</h2>
        <button @click="showAddModal = true" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition">
            添加标签
        </button>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead class="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                    <th scope="col" class="px-6 py-3">标签名称</th>
                    <th scope="col" class="px-6 py-3">颜色</th>
                    <th scope="col" class="px-6 py-3">预览</th>
                    <th scope="col" class="px-6 py-3">排序</th>
                    <th scope="col" class="px-6 py-3">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="tag in tags" :key="tag.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ tag.name }}</td>
                    <td class="px-6 py-4">
                        <code class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ tag.color }}</code>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs font-medium rounded-full text-white" :style="{ backgroundColor: tag.color }">
                            {{ tag.name }}
                        </span>
                    </td>
                    <td class="px-6 py-4">{{ tag.sort_order }}</td>
                    <td class="px-6 py-4 space-x-2">
                        <button @click="editTag(tag)" class="px-3 py-1 text-xs bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent rounded hover:bg-primary/20 dark:hover:bg-accent/30 transition">
                            <i class="fas fa-edit mr-1"></i>编辑
                        </button>
                        <button @click="deleteTag(tag.id)" class="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                            <i class="fas fa-trash mr-1"></i>删除
                        </button>
                    </td>
                </tr>
                <tr v-if="tags.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-gray-400">暂无标签，点击右上角添加</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Modal -->
    <div v-if="showAddModal || editingTag" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-dark-card p-6 rounded-lg w-full max-w-md">
            <h3 class="text-lg font-bold mb-4 dark:text-white">{{ editingTag ? '编辑标签' : '添加标签' }}</h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300">标签名称</label>
                    <input v-model="form.name" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required placeholder="例如：开源、推荐" />
                </div>
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300 mb-2">标签颜色</label>
                    <div class="flex items-center space-x-3">
                        <input type="color" v-model="form.color" class="w-12 h-10 rounded cursor-pointer border-0" />
                        <input v-model="form.color" class="flex-1 border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm" placeholder="#3B82F6" />
                    </div>
                    <!-- 预设颜色 -->
                    <div class="flex flex-wrap gap-2 mt-3">
                        <button 
                            v-for="color in presetColors" 
                            :key="color" 
                            type="button"
                            @click="form.color = color"
                            class="w-8 h-8 rounded-full border-2 transition hover:scale-110"
                            :style="{ backgroundColor: color }"
                            :class="form.color === color ? 'border-gray-800 dark:border-white' : 'border-transparent'"
                        ></button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium dark:text-gray-300">排序 (数字越小越靠前)</label>
                    <input v-model.number="form.sort_order" type="number" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="0" />
                </div>
                <div class="flex justify-end space-x-2 mt-6">
                    <button type="button" @click="closeModal" class="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">取消</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover">保存</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';

const dataStore = useDataStore();
const authStore = useAuthStore();
const notification = useNotificationStore();

const tags = ref([]);
const showAddModal = ref(false);
const editingTag = ref(null);
const form = ref({ name: '', color: '#3B82F6', sort_order: 0 });

const presetColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
    '#6366F1', // indigo
    '#84CC16', // lime
];

onMounted(async () => {
    await loadTags();
});

const loadTags = async () => {
    try {
        tags.value = await dataStore.fetchAdminTags(authStore.token);
    } catch (e) {
        notification.error('加载标签失败: ' + e.message);
    }
};

const editTag = (tag) => {
    editingTag.value = tag;
    form.value = { name: tag.name, color: tag.color, sort_order: tag.sort_order };
};

const deleteTag = async (id) => {
    const confirmed = await notification.confirm({
        title: '删除确认',
        message: '确定要删除这个标签吗？关联到此标签的项目会解除关联。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消'
    });
    if (!confirmed) return;
    try {
        await dataStore.deleteTag(authStore.token, id);
        notification.success('标签已删除');
        await loadTags();
    } catch (e) {
        notification.error('删除失败: ' + e.message);
    }
};

const closeModal = () => {
    showAddModal.value = false;
    editingTag.value = null;
    form.value = { name: '', color: '#3B82F6', sort_order: 0 };
};

const handleSubmit = async () => {
    try {
        if (editingTag.value) {
            await dataStore.updateTag(authStore.token, editingTag.value.id, form.value);
            notification.success('标签已更新');
        } else {
            await dataStore.createTag(authStore.token, form.value);
            notification.success('标签已创建');
        }
        await loadTags();
        closeModal();
    } catch (e) {
        notification.error('保存失败: ' + e.message);
    }
};
</script>
