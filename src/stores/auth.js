import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '')

    const isAuthenticated = computed(() => !!token.value)

    function setToken(newToken) {
        token.value = newToken
        localStorage.setItem('token', newToken)
    }

    function logout() {
        token.value = ''
        localStorage.removeItem('token')
    }

    async function login(username, password) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            if (!res.ok) {
                throw new Error('Login failed')
            }

            const data = await res.json()
            setToken(data.token)
        } catch (e) {
            throw e
        }
    }

    return { token, isAuthenticated, login, logout }
})
