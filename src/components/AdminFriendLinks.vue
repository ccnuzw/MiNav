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
                        <button @click="editLink(link)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">编辑</button>
                        <button @click="deleteLink(link.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">删除</button>
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
                    <label class="block text-sm font-medium dark:text-gray-300">图标 URL (可选)</label>
                    <input v-model="form.icon" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="https://..." />
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
import { ref, onMounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';

const links = ref([]);
const dataStore = useDataStore();
const authStore = useAuthStore();

const showAddModal = ref(false);
const editingLink = ref(null);
const form = ref({ name: '', url: '', description: '', icon: '', sort_order: 0 });

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
