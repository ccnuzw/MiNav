<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
    <h2 class="text-xl font-bold mb-6 dark:text-white">网站设置 (Home Page)</h2>
    <form @submit.prevent="handleSubmit" class="space-y-6 max-w-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium mb-1 dark:text-gray-300">站点名称 (Site Name)</label>
                <input v-model="form.site_name" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="MiNav" />
            </div>
             <div>
                <label class="block text-sm font-medium mb-1 dark:text-gray-300">站点标语 (Tagline)</label>
                <input v-model="form.site_tagline" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Cloudflare Tools" />
            </div>
        </div>
        <hr class="border-gray-200 dark:border-gray-700" />
        <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">主标题 (Hero Title)</label>
            <input v-model="form.hero_title" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">副标题 (Subtitle)</label>
            <input v-model="form.hero_subtitle" type="text" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
            <label class="block text-sm font-medium mb-1 dark:text-gray-300">描述 (Description)</label>
            <textarea v-model="form.hero_description" rows="4" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"></textarea>
        </div>
        
        <div class="flex justify-end">
            <button type="submit" :disabled="loading" class="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50">
                {{ loading ? 'Saving...' : '保存设置' }}
            </button>
        </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';

const dataStore = useDataStore();
const authStore = useAuthStore();
const form = ref({ hero_title: '', hero_subtitle: '', hero_description: '', site_name: '', site_tagline: '' });
const loading = ref(false);

onMounted(async () => {
    // Ensure settings are loaded
    if (Object.keys(dataStore.settings).length === 0) {
        await dataStore.fetchSettings();
    }
    // Populate form
    form.value = { ...dataStore.settings };
});

const handleSubmit = async () => {
    loading.value = true;
    try {
        await dataStore.updateSettings(authStore.token, form.value);
        alert('设置已保存');
    } catch (e) {
        alert('保存失败: ' + e.message);
    } finally {
        loading.value = false;
    }
}
</script>
