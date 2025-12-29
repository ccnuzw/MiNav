import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDataStore = defineStore('data', () => {
    const items = ref([])
    const categories = ref([])
    const friendLinks = ref([])
    const tags = ref([])  // 标签列表
    const settings = ref({})
    const loading = ref(false)
    const error = ref(null)

    const filters = ref({
        status: [],
        tags: []  // 选中的标签ID数组
    })

    const groupedItems = computed(() => {
        if (!categories.value.length) return {}

        // Filter items first
        let filteredItems = items.value.filter(item => {
            // Status Filter
            if (filters.value.status.length > 0) {
                if (!filters.value.status.includes(item.status)) return false;
            }
            // Tags Filter - 只要命中任意一个选中的标签就显示
            if (filters.value.tags.length > 0) {
                const itemTagIds = (item.tags || []).map(t => t.id);
                const hasMatchingTag = filters.value.tags.some(tagId => itemTagIds.includes(tagId));
                if (!hasMatchingTag) return false;
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
            // Friend links
            const flRes = await fetch('/api/public/friend_links')
            if (flRes.ok) {
                friendLinks.value = await flRes.json()
            }
            // Tags for filtering
            const tagsRes = await fetch('/api/public/tags')
            if (tagsRes.ok) {
                tags.value = await tagsRes.json()
            }
        } catch (e) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    // Admin Actions
    async function fetchAdminItems(token, page = 1, limit = 20, categoryId = null) {
        let url = `/api/admin/items?page=${page}&limit=${limit}`;
        if (categoryId && categoryId !== 'all') {
            url += `&category_id=${categoryId}`;
        }
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
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

    async function updateCategory(token, id, category) {
        const res = await fetch(`/api/admin/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(category)
        })
        if (!res.ok) throw new Error('Failed to update category')
        return await res.json()
    }

    async function deleteCategory(token, id) {
        const res = await fetch(`/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to delete category')
        return await res.json()
    }

    async function fetchSettings() {
        try {
            const res = await fetch('/api/public/settings')
            if (res.ok) {
                settings.value = await res.json()
            }
        } catch (e) {
            console.error('Failed to fetch settings', e)
        }
    }

    async function updateSettings(token, newSettings) {
        const res = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(newSettings)
        })
        if (!res.ok) throw new Error('Failed to update settings')
        // Optimistically update or re-fetch
        settings.value = { ...settings.value, ...newSettings }
        return await res.json()
    }

    // Friend Links Actions
    async function fetchAdminFriendLinks(token) {
        const res = await fetch('/api/admin/friend_links', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch friend links')
        return await res.json()
    }

    async function createFriendLink(token, link) {
        const res = await fetch('/api/admin/friend_links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(link)
        })
        if (!res.ok) throw new Error('Failed to create friend link')
        return await res.json()
    }

    async function updateFriendLink(token, id, link) {
        const res = await fetch(`/api/admin/friend_links/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(link)
        })
        if (!res.ok) throw new Error('Failed to update friend link')
        return await res.json()
    }

    async function deleteFriendLink(token, id) {
        const res = await fetch(`/api/admin/friend_links/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to delete friend link')
        return await res.json()
    }

    async function submitItem(item) {
        const res = await fetch('/api/public/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        })
        if (!res.ok) {
            let msg = 'Submission failed';
            try {
                const errData = await res.json();
                msg = errData.error || msg;
            } catch (e) { }
            throw new Error(msg);
        }
        return await res.json()
    }

    // Tags Actions
    async function fetchAdminTags(token) {
        const res = await fetch('/api/admin/tags', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch tags')
        return await res.json()
    }

    async function createTag(token, tag) {
        const res = await fetch('/api/admin/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(tag)
        })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to create tag')
        }
        return await res.json()
    }

    async function updateTag(token, id, tag) {
        const res = await fetch(`/api/admin/tags/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(tag)
        })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to update tag')
        }
        return await res.json()
    }

    async function deleteTag(token, id) {
        const res = await fetch(`/api/admin/tags/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to delete tag')
        return await res.json()
    }

    // Feedback Actions
    async function submitFeedback(data) {
        const res = await fetch('/api/public/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        const result = await res.json()
        if (!res.ok) {
            throw new Error(result.error || '提交失败')
        }
        return result
    }

    async function fetchFeedbacks(token, status = 'all', page = 1, limit = 20) {
        const res = await fetch(`/api/admin/feedbacks?status=${status}&page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch feedbacks')
        return await res.json()
    }

    async function updateFeedbackStatus(token, id, status) {
        const res = await fetch(`/api/admin/feedbacks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status })
        })
        if (!res.ok) throw new Error('Failed to update feedback')
        return await res.json()
    }

    async function deleteFeedback(token, id) {
        const res = await fetch(`/api/admin/feedbacks/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to delete feedback')
        return await res.json()
    }

    return { items, categories, tags, groupedItems, categoryCounts, filters, loading, error, settings, friendLinks, fetchPublicData, fetchAdminItems, createItem, updateItem, deleteItem, fetchAdminCategories, createCategory, updateCategory, deleteCategory, submitItem, fetchSettings, updateSettings, fetchAdminFriendLinks, createFriendLink, updateFriendLink, deleteFriendLink, fetchAdminTags, createTag, updateTag, deleteTag, submitFeedback, fetchFeedbacks, updateFeedbackStatus, deleteFeedback }
})
