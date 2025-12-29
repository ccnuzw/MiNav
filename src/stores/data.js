import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDataStore = defineStore('data', () => {
    const items = ref([])
    const categories = ref([])
    const loading = ref(false)
    const error = ref(null)

    const filters = ref({
        status: [],
        deploy: null // 'cloudflare', 'vercel', 'other' or null
    })

    const groupedItems = computed(() => {
        if (!categories.value.length) return {}

        // Filter items first
        let filteredItems = items.value.filter(item => {
            // Status Filter
            if (filters.value.status.length > 0) {
                if (!filters.value.status.includes(item.status)) return false;
            }
            // Deploy Filter (assuming description or tags contains deploy info for now, 
            // ideally we add a deploy_type column, but for gap filling we can infer or added later.
            // For now, let's assume 'deploy' is not strictly in schema yet, so we'll skip strict filtering 
            // or simple match if we add it to schema. 
            // Let's defer strict deploy filtering until schema update or just match description.)
            if (filters.value.deploy) {
                const desc = (item.description || '').toLowerCase();
                if (!desc.includes(filters.value.deploy)) return false;
            }
            return true;
        });

        // Group items by category_id
        const groups = {}
        categories.value.forEach(cat => {
            const catItems = filteredItems.filter(item => item.category_id === cat.id);
            groups[cat.id] = {
                ...cat,
                items: catItems,
                totalCount: items.value.filter(i => i.category_id === cat.id).length // Total count ignoring filters for display if needed, or sensitive to filters
            }
        })
        return groups
    })

    const categoryCounts = computed(() => {
        const counts = {};
        categories.value.forEach(cat => {
            counts[cat.id] = items.value.filter(i => i.category_id === cat.id).length;
        });
        return counts;
    })


    async function fetchPublicData() {
        loading.value = true
        try {
            const res = await fetch('/api/public/data')
            if (!res.ok) throw new Error('Failed to fetch data')
            const data = await res.json()
            items.value = data.items || []
            categories.value = data.categories || []
        } catch (e) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    // Admin Actions
    async function fetchAdminItems(token) {
        const res = await fetch('/api/admin/items', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch admin items')
        return await res.json()
    }

    async function createItem(token, item) {
        const res = await fetch('/api/admin/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(item)
        })
        if (!res.ok) throw new Error('Failed to create item')
        return await res.json()
    }

    async function updateItem(token, id, item) {
        const res = await fetch(`/api/admin/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(item)
        })
        if (!res.ok) throw new Error('Failed to update item')
        return await res.json()
    }

    async function deleteItem(token, id) {
        const res = await fetch(`/api/admin/items/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to delete item')
        return await res.json()
    }

    async function fetchAdminCategories(token) {
        const res = await fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch categories')
        return await res.json()
    }

    async function createCategory(token, category) {
        const res = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(category)
        })
        if (!res.ok) throw new Error('Failed to create category')
        return await res.json()
    }

    async function submitItem(item) {
        const res = await fetch('/api/public/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        })
        if (!res.ok) throw new Error('Submission failed')
        return await res.json()
    }

    return { items, categories, groupedItems, categoryCounts, filters, loading, error, fetchPublicData, fetchAdminItems, createItem, updateItem, deleteItem, fetchAdminCategories, createCategory, submitItem }
})
