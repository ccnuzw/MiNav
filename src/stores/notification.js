import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
    // Toast 通知列表
    const notifications = ref([])

    // 确认对话框状态
    const confirmDialog = ref({
        show: false,
        title: '',
        message: '',
        type: 'warning', // 'warning' | 'danger' | 'info'
        confirmText: '确定',
        cancelText: '取消',
        resolve: null
    })

    let notificationId = 0

    /**
     * 添加通知
     * @param {string} type - 通知类型: 'success' | 'error' | 'warning' | 'info'
     * @param {string} message - 通知消息
     * @param {number} duration - 持续时间(毫秒), 0 表示不自动关闭
     */
    function addNotification(type, message, duration = 3000) {
        const id = ++notificationId
        notifications.value.push({ id, type, message })

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, duration)
        }

        return id
    }

    /**
     * 移除通知
     * @param {number} id - 通知 ID
     */
    function removeNotification(id) {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
            notifications.value.splice(index, 1)
        }
    }

    // 便捷方法
    function success(message, duration = 3000) {
        return addNotification('success', message, duration)
    }

    function error(message, duration = 4000) {
        return addNotification('error', message, duration)
    }

    function warning(message, duration = 3500) {
        return addNotification('warning', message, duration)
    }

    function info(message, duration = 3000) {
        return addNotification('info', message, duration)
    }

    /**
     * 显示确认对话框
     * @param {Object} options - 配置选项
     * @returns {Promise<boolean>} - 用户选择结果
     */
    function confirm(options = {}) {
        return new Promise((resolve) => {
            confirmDialog.value = {
                show: true,
                title: options.title || '确认操作',
                message: options.message || '确定要执行此操作吗？',
                type: options.type || 'warning',
                confirmText: options.confirmText || '确定',
                cancelText: options.cancelText || '取消',
                resolve
            }
        })
    }

    /**
     * 处理确认对话框结果
     * @param {boolean} result - 用户选择
     */
    function resolveConfirm(result) {
        if (confirmDialog.value.resolve) {
            confirmDialog.value.resolve(result)
        }
        confirmDialog.value.show = false
    }

    return {
        notifications,
        confirmDialog,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
        confirm,
        resolveConfirm
    }
})
