<template>
  <div class="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <h2 class="text-xl font-bold dark:text-white">反馈管理</h2>
        <span v-if="unreadCount > 0" class="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
          {{ unreadCount }} 条未读
        </span>
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        <!-- 批量操作区 -->
        <div class="flex items-center gap-4 border-r-0 sm:border-r pr-0 sm:pr-4 mr-0 sm:mr-2 border-gray-200 dark:border-gray-700 w-full sm:w-auto justify-between sm:justify-start">
            <label v-if="feedbacks.length > 0" class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                全选
            </label>
            <button 
            v-if="selectedFeedbacks.length > 0"
            @click="handleBulkDelete"
            class="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition flex items-center gap-1 shadow-sm">
            <i class="fas fa-trash-alt"></i> 删除 ({{ selectedFeedbacks.length }})
            </button>
        </div>
        <!-- 状态筛选 -->
        <div class="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button 
            @click="statusFilter = 'all'" 
            :class="statusFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
            class="px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap">
            全部
            </button>
            <button 
            @click="statusFilter = 'pending'" 
            :class="statusFilter === 'pending' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
            class="px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap">
            未读
            </button>
            <button 
            @click="statusFilter = 'read'" 
            :class="statusFilter === 'read' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
            class="px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap">
            已读
            </button>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>

    <!-- 空状态 -->
    <div v-else-if="feedbacks.length === 0" class="text-center py-12 text-gray-400">
      <i class="fas fa-inbox text-4xl mb-4"></i>
      <p>暂无反馈信息</p>
    </div>

    <!-- 反馈列表 -->
    <div v-else class="space-y-4">
      <div 
        v-for="feedback in feedbacks" 
        :key="feedback.id" 
        class="border dark:border-dark-border rounded-lg p-4 transition hover:shadow-md"
        :class="[
            feedback.status === 'pending' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-dark-card',
            selectedFeedbacks.includes(feedback.id) ? 'ring-2 ring-primary border-primary' : ''
        ]">
        <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
             <input type="checkbox" :value="feedback.id" v-model="selectedFeedbacks" class="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 shrink-0" @click.stop />
            <span 
              class="px-2 py-0.5 text-xs font-medium rounded shrink-0"
              :class="feedback.status === 'pending' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'">
              {{ feedback.status === 'pending' ? '未读' : '已读' }}
            </span>
            <span v-if="feedback.email" class="text-sm text-gray-600 dark:text-gray-400 break-all">
              <i class="fas fa-envelope mr-1"></i>{{ feedback.email }}
            </span>
            <span v-else class="text-sm text-gray-400 dark:text-gray-500 italic shrink-0">未提供邮箱</span>
          </div>
          <span class="text-xs text-gray-400 shrink-0 self-end sm:self-auto">{{ formatDate(feedback.created_at) }}</span>
        </div>
        <p class="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{{ feedback.content }}</p>
        <div class="flex gap-2">
          <button 
            v-if="feedback.status === 'pending'"
            @click="markAsRead(feedback.id)" 
            class="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition">
            <i class="fas fa-check mr-1"></i>标记已读
          </button>
          <button 
            v-else
            @click="markAsPending(feedback.id)" 
            class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded transition">
            <i class="fas fa-undo mr-1"></i>标为未读
          </button>
          <button 
            @click="handleDelete(feedback.id)" 
            class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition">
            <i class="fas fa-trash mr-1"></i>删除
          </button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
      <button 
        @click="currentPage--" 
        :disabled="currentPage <= 1"
        class="px-3 py-1 rounded border dark:border-dark-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        上一页
      </button>
      <span class="text-sm text-gray-500">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage >= totalPages"
        class="px-3 py-1 rounded border dark:border-dark-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useDataStore } from '../stores/data'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

const dataStore = useDataStore()
const authStore = useAuthStore()
const notification = useNotificationStore()

const feedbacks = ref([])
const loading = ref(false)
const statusFilter = ref('all')
const currentPage = ref(1)
const totalCount = ref(0)
const unreadCount = ref(0)
const selectedFeedbacks = ref([])
const limit = 10

const totalPages = computed(() => Math.ceil(totalCount.value / limit))

const isAllSelected = computed(() => {
    return feedbacks.value.length > 0 && feedbacks.value.every(f => selectedFeedbacks.value.includes(f.id))
})

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        // 取消全选（只取消当前页）
        selectedFeedbacks.value = selectedFeedbacks.value.filter(id => !feedbacks.value.find(f => f.id === id))
    } else {
        // 全选当前页
        const currentIds = feedbacks.value.map(f => f.id)
        // 合并并去重
        selectedFeedbacks.value = [...new Set([...selectedFeedbacks.value, ...currentIds])]
    }
}

const fetchData = async () => {
  loading.value = true
  try {
    const result = await dataStore.fetchFeedbacks(authStore.token, statusFilter.value, currentPage.value, limit)
    feedbacks.value = result.feedbacks || []
    totalCount.value = result.total || 0
    unreadCount.value = result.unread || 0
  } catch (e) {
    console.error('获取反馈失败', e)
    notification.error('获取反馈失败: ' + e.message)
  } finally {
    loading.value = false
    // 翻页或刷新数据后，清理不在当前列表中的选中项（可选，根据需求决定是否保留跨页选择。这里为了简单起见保留选中状态，不做特殊清理）
  }
}

const handleBulkDelete = async () => {
    if (selectedFeedbacks.value.length === 0) return

    const confirmed = await notification.confirm({
        title: '批量删除确认',
        message: `确定要删除选中的 ${selectedFeedbacks.value.length} 条反馈吗？此操作不可恢复。`,
        type: 'danger',
        confirmText: '确认删除',
        cancelText: '取消'
    })

    if (!confirmed) return

    try {
        // 并发删除
        const deletePromises = selectedFeedbacks.value.map(id => dataStore.deleteFeedback(authStore.token, id))
        await Promise.all(deletePromises)
        
        notification.success('批量删除成功')
        selectedFeedbacks.value = [] // 清空选择
        fetchData() // 刷新列表
    } catch (e) {
        notification.error('批量删除过程中发生错误: ' + e.message)
        fetchData() // 刷新列表以显示最新状态
    }
}

const markAsRead = async (id) => {
  try {
    await dataStore.updateFeedbackStatus(authStore.token, id, 'read')
    notification.success('已标记为已读')
    fetchData()
  } catch (e) {
    notification.error('操作失败: ' + e.message)
  }
}

const markAsPending = async (id) => {
  try {
    await dataStore.updateFeedbackStatus(authStore.token, id, 'pending')
    notification.success('已标记为未读')
    fetchData()
  } catch (e) {
    notification.error('操作失败: ' + e.message)
  }
}

const handleDelete = async (id) => {
  const confirmed = await notification.confirm({
    title: '删除确认',
    message: '确定要删除这条反馈吗？',
    type: 'danger',
    confirmText: '删除',
    cancelText: '取消'
  })
  if (!confirmed) return
  try {
    await dataStore.deleteFeedback(authStore.token, id)
    notification.success('反馈已删除')
    fetchData()
  } catch (e) {
    notification.error('删除失败: ' + e.message)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch([statusFilter, currentPage], () => {
  fetchData()
})

// 当筛选条件变化时，重置页码
watch(statusFilter, () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchData()
})
</script>
