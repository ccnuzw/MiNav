<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold dark:text-white">项目管理</h2>
        <div class="flex items-center space-x-2">
            <select v-model="filterCategoryId" class="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white">
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
                    <th scope="col" class="px-6 py-3">名称</th>
                    <th scope="col" class="px-6 py-3">链接</th>
                    <th scope="col" class="px-6 py-3">分类</th>
                    <th scope="col" class="px-6 py-3">状态</th>
                    <th scope="col" class="px-6 py-3">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredItems" :key="item.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ item.name }}</td>
                    <td class="px-6 py-4 truncate max-w-xs">{{ item.url }}</td>
                    <td class="px-6 py-4">{{ getCategoryName(item.category_id) }}</td>
                    <td class="px-6 py-4">
                        <span :class="item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-0.5 rounded text-xs">{{ item.status }}</span>
                    </td>
                    <td class="px-6 py-4 space-x-2">
                        <button @click="editItem(item)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">编辑</button>
                        <button @click="deleteItem(item.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">删除</button>
                    </td>
                </tr>
            </tbody>
        </table>
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
                     <label class="block text-sm font-medium dark:text-gray-300">图标 (FontAwesome Class)</label>
                    <input v-model="form.icon" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="fab fa-github" />
                </div>
                 <div>
                    <label class="block text-sm font-medium dark:text-gray-300">状态</label>
                    <select v-model="form.status" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                        <option value="active">启用</option>
                        <option value="inactive">禁用</option>
                    </select>
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
import { ref, onMounted, computed } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';

const props = defineProps(['categories']);
const items = ref([]);
const dataStore = useDataStore();
const authStore = useAuthStore();

const showAddModal = ref(false);
const editingItem = ref(null);
const form = ref({ name: '', url: '', category_id: null, description: '', icon: '', status: 'active' });
const filterCategoryId = ref('all');

const filteredItems = computed(() => {
    if (filterCategoryId.value === 'all') {
        return items.value;
    }
    return items.value.filter(item => item.category_id === filterCategoryId.value);
});

onMounted(async () => {
    await loadItems();
});

const loadItems = async () => {
    items.value = await dataStore.fetchAdminItems(authStore.token);
}

const getCategoryName = (id) => {
    const cat = props.categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
}

const editItem = (item) => {
    editingItem.value = item;
    form.value = { ...item };
    showAddModal.value = true; // Use same flag or split
}

const deleteItem = async (id) => {
    if(!confirm('确定要删除这个项目吗?')) return;
    await dataStore.deleteItem(authStore.token, id);
    await loadItems();
}

const closeModal = () => {
    showAddModal.value = false;
    editingItem.value = null;
    form.value = { name: '', url: '', category_id: null, description: '', icon: '', status: 'active' };
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
