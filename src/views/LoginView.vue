<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary-bg dark:bg-dark-bg">
    <div class="bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-200 dark:border-dark-border">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Admin Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input v-model="username" type="text" class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary outline-none" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input v-model="password" type="password" class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary outline-none" required />
        </div>
        <button type="submit" class="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg transition font-medium">Login</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
    try {
        await authStore.login(username.value, password.value);
        router.push('/admin');
    } catch (e) {
        alert('Login failed');
    }
}
</script>
