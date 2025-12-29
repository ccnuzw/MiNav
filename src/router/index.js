import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'
import ArticleList from '../views/ArticleList.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/articles',
            name: 'articles',
            component: ArticleList,
            meta: { title: 'Latest Articles' }
        },
        {
            path: '/articles/:id',
            name: 'article-detail',
            component: ArticleDetail,
            meta: { title: 'Article Detail' }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { title: 'Admin Login' }
        },
        {
            path: '/admin',
            name: 'admin',
            component: AdminView,
            meta: { requiresAuth: true, title: 'Admin Dashboard' }
        }
    ]
})

router.beforeEach((to, from, next) => {

    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router
