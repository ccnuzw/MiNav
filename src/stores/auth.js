import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '')
    const requirePasswordChange = ref(localStorage.getItem('requirePasswordChange') === 'true')

    const isAuthenticated = computed(() => !!token.value)

    function setToken(newToken) {
        token.value = newToken
        localStorage.setItem('token', newToken)
    }

    function setRequirePasswordChange(value) {
        requirePasswordChange.value = value
        localStorage.setItem('requirePasswordChange', value ? 'true' : 'false')
    }

    function logout() {
        token.value = ''
        requirePasswordChange.value = false
        localStorage.removeItem('token')
        localStorage.removeItem('requirePasswordChange')
    }

    async function login(username, password) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || '登录失败')
        }

        const data = await res.json()
        setToken(data.token)
        setRequirePasswordChange(data.requirePasswordChange || false)

        return data
    }

    async function changePassword(oldPassword, newPassword) {
        const res = await fetch('/api/admin/password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.value}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        })

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to change password')
        }

        // 密码更改成功后，清除提示标志
        setRequirePasswordChange(false)

        return await res.json()
    }

    return {
        token,
        isAuthenticated,
        requirePasswordChange,
        login,
        logout,
        changePassword,
        setRequirePasswordChange
    }
})
