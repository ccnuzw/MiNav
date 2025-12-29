<template>
  <div class="min-h-screen bg-secondary-bg dark:bg-dark-bg p-8 text-gray-900 dark:text-white">
    <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">Admin Dashboard</h1>
            <div class="flex items-center space-x-4">
                 <span class="text-sm text-gray-500">Welcome, Admin</span>
                 <button @click="logout" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition">Logout</button>
            </div>
        </div>
        
        <!-- Tabs -->
        <div class="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-6 w-fit">
            <button 
                @click="activeTab = 'items'"
                :class="activeTab === 'items' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
            >Items</button>
            <button 
                @click="activeTab = 'categories'"
                :class="activeTab === 'categories' ? 'bg-white dark:bg-dark-card shadow' : ''"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
            >Categories</button>
        </div>

        <div v-if="activeTab === 'items'">
            <AdminItems :categories="categories" />
        </div>
        <div v-if="activeTab === 'categories'">
            <AdminCategories />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useDataStore } from '../stores/data';
import { useRouter } from 'vue-router';
import AdminItems from '../components/AdminItems.vue';
import AdminCategories from '../components/AdminCategories.vue';

const authStore = useAuthStore();
const dataStore = useDataStore();
const router = useRouter();

const activeTab = ref('items');
const categories = ref([]);

onMounted(async () => {
    // Fetch categories for reference
    try {
        categories.value = await dataStore.fetchAdminCategories(authStore.token);
    } catch (e) {
        console.error("Error fetching categories", e);
    }
});

const logout = () => {
    authStore.logout();
    router.push('/login');
}
</script>
