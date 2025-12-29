<template>
  <router-view />
  <ToastContainer />
  <ConfirmDialog />
</template>

<script setup>
import ToastContainer from './components/ToastContainer.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import { useDataStore } from './stores/data';
import { useRoute } from 'vue-router';
import { watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

const dataStore = useDataStore();
const route = useRoute();
const { settings } = storeToRefs(dataStore);

const updateTitle = () => {
    const siteName = settings.value.site_name || 'MiNav';
    const tagline = settings.value.site_tagline || 'Cloudflare Tools';
    
    if (route.meta.title) {
        document.title = `${route.meta.title} - ${siteName}`;
    } else {
        document.title = `${siteName} - ${tagline}`;
    }
};

onMounted(() => {
    // Ensure settings are fetched (if not already handled in main views)
    if (Object.keys(settings.value).length === 0) {
        dataStore.fetchSettings();
    }
});

// Watch for route changes and settings changes to update title
watch([() => route.path, settings], () => {
    updateTitle();
}, { deep: true });
</script>
