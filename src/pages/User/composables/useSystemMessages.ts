import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { SystemMessage, GetSystemMessagesParams, SearchSystemMessagesParams } from '@/api/v2/user/user';

/**
 * 系统消息 composable
 */
export function useSystemMessages(userInfo?: { usertoken?: string; username?: string }) {
    const message = useMessage();
    
    const loading = ref(false);
    const loadingMore = ref(false);
    const messages = ref<SystemMessage[]>([]);
    const total = ref(0);
    const page = ref(1);
    const pageSize = ref(20); // 增加每页数量
    const hasMore = ref(true);
    
    const selectedPriority = ref<number | undefined>(undefined);
    const searchKeyword = ref('');
    const isSearchMode = ref(false);
    
    // 当前查看的消息详情
    const currentMessage = ref<SystemMessage | null>(null);
    const showDetailModal = ref(false);
    const loadingDetail = ref(false);

    /**
     * 获取消息列表（重置）
     */
    const fetchMessages = async () => {
        loading.value = true;
        page.value = 1;
        hasMore.value = true;
        try {
            const params: GetSystemMessagesParams = {
                page: page.value,
                size: pageSize.value,
            };
            
            // 添加优先级筛选
            if (selectedPriority.value !== undefined) {
                params.priority = selectedPriority.value;
            }
            
            // 如果提供了用户token，则添加usertoken参数
            if (userInfo?.usertoken) {
                params.usertoken = userInfo.usertoken;
            }
            
            const response = await api.v2.user.getSystemMessages(params);
            
            if (response.data) {
                messages.value = response.data.messages;
                total.value = response.data.total;
                page.value = response.data.page;
                
                // 判断是否还有更多
                hasMore.value = messages.value.length < total.value;
            }
        } catch (error) {
            console.error('获取消息列表失败', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error('获取消息列表失败: ' + errorMessage);
        } finally {
            loading.value = false;
        }
    };

    /**
     * 加载更多消息
     */
    const loadMoreMessages = async () => {
        if (loadingMore.value || !hasMore.value) return;
        
        loadingMore.value = true;
        page.value += 1;
        
        try {
            const params: GetSystemMessagesParams = {
                page: page.value,
                size: pageSize.value,
            };
            
            // 添加优先级筛选
            if (selectedPriority.value !== undefined) {
                params.priority = selectedPriority.value;
            }
            
            // 如果提供了用户token，则添加usertoken参数
            if (userInfo?.usertoken) {
                params.usertoken = userInfo.usertoken;
            }
            
            const response = await api.v2.user.getSystemMessages(params);
            
            if (response.data && response.data.messages.length > 0) {
                // 追加新消息
                messages.value = [...messages.value, ...response.data.messages];
                
                // 判断是否还有更多
                hasMore.value = messages.value.length < response.data.total;
            } else {
                hasMore.value = false;
            }
        } catch (error) {
            console.error('加载更多消息失败', error);
            // 加载失败时回退页码
            page.value -= 1;
        } finally {
            loadingMore.value = false;
        }
    };

    /**
     * 搜索消息
     */
    const searchMessages = async () => {
        if (!searchKeyword.value.trim()) {
            message.warning('请输入搜索关键词');
            return;
        }
        
        loading.value = true;
        isSearchMode.value = true;
        page.value = 1;
        hasMore.value = true;
        
        try {
            const params: SearchSystemMessagesParams = {
                keyword: searchKeyword.value.trim(),
                page: page.value,
                size: pageSize.value,
            };
            
            const response = await api.v2.user.searchSystemMessages(params);
            
            if (response.data) {
                messages.value = response.data.messages;
                total.value = response.data.total;
                page.value = response.data.page;
                
                // 判断是否还有更多
                hasMore.value = messages.value.length < total.value;
            }
        } catch (error) {
            console.error('搜索消息失败', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error('搜索消息失败: ' + errorMessage);
        } finally {
            loading.value = false;
        }
    };

    /**
     * 重置搜索
     */
    const resetSearch = () => {
        searchKeyword.value = '';
        isSearchMode.value = false;
        page.value = 1;
        fetchMessages();
    };

    /**
     * 获取消息详情
     */
    const fetchMessageDetail = async (id: number) => {
        loadingDetail.value = true;
        try {
            const response = await api.v2.user.getSystemMessageDetail(id);
            
            if (response.data) {
                currentMessage.value = response.data;
                showDetailModal.value = true;
            }
        } catch (error) {
            console.error('获取消息详情失败', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error('获取消息详情失败: ' + errorMessage);
        } finally {
            loadingDetail.value = false;
        }
    };

    /**
     * 处理优先级筛选变化
     */
    const handlePriorityChange = (priority: number | undefined) => {
        selectedPriority.value = priority;
        fetchMessages();
    };

    /**
     * 获取优先级标签
     */
    const getPriorityLabel = (priority: number): string => {
        switch (priority) {
            case 1:
                return '普通';
            case 2:
                return '重要';
            case 3:
                return '紧急';
            default:
                return '未知';
        }
    };

    /**
     * 获取优先级类型（用于UI显示）
     */
    const getPriorityType = (priority: number): 'default' | 'warning' | 'error' => {
        switch (priority) {
            case 1:
                return 'default';
            case 2:
                return 'warning';
            case 3:
                return 'error';
            default:
                return 'default';
        }
    };

    return {
        loading,
        loadingMore,
        messages,
        total,
        hasMore,
        selectedPriority,
        searchKeyword,
        isSearchMode,
        currentMessage,
        showDetailModal,
        loadingDetail,
        fetchMessages,
        searchMessages,
        resetSearch,
        fetchMessageDetail,
        loadMoreMessages,
        handlePriorityChange,
        getPriorityLabel,
        getPriorityType,
    };
}

