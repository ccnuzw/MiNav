<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-6 dark:text-white">修改密码</h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
            <label class="block text-sm font-medium dark:text-gray-300">当前密码</label>
            <input v-model="form.oldPassword" type="password" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
        </div>
        <div>
            <label class="block text-sm font-medium dark:text-gray-300">新密码</label>
            <input v-model="form.newPassword" type="password" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
        </div>
        <div>
            <label class="block text-sm font-medium dark:text-gray-300">确认新密码</label>
            <input v-model="form.confirmPassword" type="password" class="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" required />
        </div>
        
        <div class="flex justify-end pt-4">
            <button type="submit" :disabled="loading" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition disabled:opacity-50">
                {{ loading ? '更新中...' : '修改密码' }}
            </button>
        </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';

const authStore = useAuthStore();
const notification = useNotificationStore();
const form = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });
const loading = ref(false);

const handleSubmit = async () => {
    if (form.value.newPassword !== form.value.confirmPassword) {
        notification.warning('两次输入的新密码不一致');
        return;
    }

    if (form.value.newPassword.length < 6) {
        notification.warning('密码长度至少为 6 位');
        return;
    }

    loading.value = true;
    try {
        await authStore.changePassword(form.value.oldPassword, form.value.newPassword);
        notification.success('密码修改成功');
        form.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
    } catch (e) {
        notification.error('修改失败: ' + e.message);
    } finally {
        loading.value = false;
    }
}
</script>
