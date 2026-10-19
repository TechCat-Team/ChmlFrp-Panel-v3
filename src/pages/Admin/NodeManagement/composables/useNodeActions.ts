/**
 * 节点管理 - 新增 / 编辑 / 删除 / 访问面板
 */
import { ref } from 'vue';
import { useDialog, useMessage } from 'naive-ui';
import api from '@/api';
import type { CreateNodePayload, Node, UpdateNodePayload } from '../types';

export function useNodeActions(fetchNodes: () => Promise<void>) {
    const message = useMessage();
    const dialog = useDialog();

    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const createLoading = ref(false);
    const editLoading = ref(false);
    const currentEditNode = ref<Node | null>(null);

    // 打开新增节点模态框（表单重置由模态框自身处理）
    const openCreateModal = () => {
        showCreateModal.value = true;
    };

    // 打开编辑节点模态框
    const openEditModal = (node: Node) => {
        currentEditNode.value = node;
        showEditModal.value = true;
    };

    // 创建节点
    const handleCreate = async (payload: CreateNodePayload) => {
        createLoading.value = true;
        try {
            await api.v2.admin.createNode(payload as unknown as Record<string, unknown>);
            message.success('节点创建成功');
            showCreateModal.value = false;
            await fetchNodes();
        } catch (error: any) {
            message.error(`节点创建失败: ${error?.message || '请检查网络或联系管理员'}`);
            console.error(error);
        } finally {
            createLoading.value = false;
        }
    };

    // 编辑节点
    const handleEdit = async (payload: UpdateNodePayload) => {
        if (!currentEditNode.value) return;

        editLoading.value = true;
        try {
            await api.v2.admin.updateNode(currentEditNode.value.id, payload as unknown as Record<string, unknown>);
            message.success('节点信息更新成功');
            showEditModal.value = false;
            await fetchNodes();
        } catch (error: any) {
            message.error(`节点信息更新失败: ${error?.message || '请检查网络或联系管理员'}`);
            console.error(error);
        } finally {
            editLoading.value = false;
        }
    };

    // 处理访问面板
    const handlePanelAccess = (node: Node) => {
        try {
            // 解码auth获取用户名和密码
            const decodedAuth = atob(node.auth);
            const [username, password] = decodedAuth.split(':');

            if (!username || !password) {
                message.error('节点认证信息不完整，无法访问面板');
                return;
            }

            // 创建Basic Auth URL
            const authUrl = `http://${username}:${password}@${node.realIp}:${node.adminPort}`;

            // 在新标签页打开面板
            window.open(authUrl, '_blank');

            message.success(`正在打开节点 "${node.name}" 的管理面板`);
        } catch (error) {
            console.error('访问面板失败:', error);
            message.error('访问面板失败，请检查节点认证信息');
        }
    };

    // 删除节点
    const handleDelete = async (node: Node) => {
        const loadingMessage = message.loading('正在删除节点...', { duration: 0 });

        try {
            const res = await api.v2.admin.deleteNode(node.id);
            loadingMessage.destroy();
            const data: any = (res as any).data;
            if (data && typeof data === 'object') {
                if (data.dnsDeleted) {
                    message.success(`节点 "${data.nodeName}" 删除成功，DNS记录已自动删除`);
                } else if (data.nodeName) {
                    message.warning(`节点 "${data.nodeName}" 删除成功，但DNS记录删除失败（可能不存在或已被删除）`);
                } else {
                    message.success('节点删除成功');
                }
            } else {
                message.success('节点删除成功');
            }
            await fetchNodes();
        } catch (error: any) {
            loadingMessage.destroy();
            const msg = error?.message || '删除节点失败，请检查网络连接';
            message.error(msg);
            console.error(error);
        }
    };

    // 处理删除节点（二次确认）
    const handleDeleteClick = (node: Node) => {
        dialog.warning({
            title: '确认删除',
            content: `确定要删除节点 "${node.name}" 吗？\n\n此操作将会：\n• 删除节点数据库记录\n• 自动删除对应的DNS记录（${node.ip}）\n\n此操作不可恢复！`,
            positiveText: '确认删除',
            negativeText: '取消',
            onPositiveClick: async () => {
                await handleDelete(node);
            },
        });
    };

    return {
        showCreateModal,
        showEditModal,
        createLoading,
        editLoading,
        currentEditNode,
        openCreateModal,
        openEditModal,
        handleCreate,
        handleEdit,
        handlePanelAccess,
        handleDeleteClick,
    };
}
