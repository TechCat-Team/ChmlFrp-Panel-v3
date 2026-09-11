import { ref, reactive, computed, onUnmounted } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import api from '@/api';
import type { TunnelCard } from '../types';

/**
 * 隧道操作 composable
 */
export function useTunnelOperations(onRefresh: () => void) {
    const message = useMessage();
    const dialog = useDialog();

    const loadingRefresh = ref(false);
    const loadingOffline = ref(false);
    const deletetTunnelSuccess = ref(true);

    // 批量删除相关状态
    const selectionMode = ref(false);
    const selectedIds = ref<number[]>([]);
    const loadingBatchDelete = ref(false);

    // 切换批量选择模式（退出时清空已选）
    const toggleSelectionMode = () => {
        selectionMode.value = !selectionMode.value;
        if (!selectionMode.value) {
            selectedIds.value = [];
        }
    };

    // 选中/取消选中单个隧道
    const toggleSelect = (id: number) => {
        const index = selectedIds.value.indexOf(id);
        if (index === -1) {
            selectedIds.value.push(id);
        } else {
            selectedIds.value.splice(index, 1);
        }
    };

    // ========== 拖拽框选（类似相册多选） ==========
    const DRAG_THRESHOLD = 5; // 判定为拖拽的最小位移
    // 拖拽结束后抑制紧随其后的 click，避免误切换单个卡片
    const suppressNextClick = ref(false);

    const marquee = reactive({
        startX: 0, // 视口横坐标起点
        startY: 0, // 视口纵坐标起点（仅用于判断是否达到拖拽阈值）
        currentX: 0, // 视口横坐标终点
        lastClientY: 0, // 最近一次鼠标视口纵坐标
        startContentY: 0, // 内容坐标起点（随滚动固定，用于命中判断）
        currentContentY: 0, // 内容坐标终点
        visible: false,
    });

    // 实际滚动的目标：页面用 n-layout 自定义滚动条时不是 window
    let scrollTarget: HTMLElement | Window = window;

    const getScrollOffset = () =>
        scrollTarget === window ? window.scrollY : (scrollTarget as HTMLElement).scrollTop;

    // 选择框以"内容坐标"记录：自动滚动时已扫过的上方卡片不会因滚出视口而脱离选区
    const marqueeStyle = computed(() => {
        const offset = getScrollOffset();
        return {
            left: `${Math.min(marquee.startX, marquee.currentX)}px`,
            top: `${Math.min(marquee.startContentY, marquee.currentContentY) - offset}px`,
            width: `${Math.abs(marquee.currentX - marquee.startX)}px`,
            height: `${Math.abs(marquee.currentContentY - marquee.startContentY)}px`,
        };
    });

    const marqueeVisible = computed(() => marquee.visible);

    // 拖拽开始时的选中快照，用于实时预览：离开框选区域即可还原
    let baselineIds = new Set<number>();

    // 实时预览：最终选中 = 拖拽前选中集合 与 当前框内卡片 的对称差集
    // 框内的：未选中→选中，已选中→反选；离开框选区域的自动还原为拖拽前状态
    const selectByMarquee = () => {
        const offset = getScrollOffset();
        const left = Math.min(marquee.startX, marquee.currentX);
        const right = Math.max(marquee.startX, marquee.currentX);
        const topContent = Math.min(marquee.startContentY, marquee.currentContentY);
        const bottomContent = Math.max(marquee.startContentY, marquee.currentContentY);

        const inside = new Set<number>();
        document.querySelectorAll<HTMLElement>('[data-tunnel-id]').forEach((el) => {
            const id = Number(el.dataset.tunnelId);
            if (Number.isNaN(id)) return;
            const rect = el.getBoundingClientRect();
            // 卡片位置换算到同一套内容坐标后与选择框比较
            const cardTop = rect.top + offset;
            const cardBottom = rect.bottom + offset;
            const hit =
                rect.left < right && rect.right > left && cardTop < bottomContent && cardBottom > topContent;
            if (hit) {
                inside.add(id);
            }
        });

        const next: number[] = [];
        const seen = new Set<number>();
        // 拖拽前已选中、且未被框住的：保持不变
        baselineIds.forEach((id) => {
            if (!inside.has(id) && !seen.has(id)) {
                next.push(id);
                seen.add(id);
            }
        });
        // 框住但拖拽前未选中的：预览为选中
        inside.forEach((id) => {
            if (!baselineIds.has(id) && !seen.has(id)) {
                next.push(id);
                seen.add(id);
            }
        });
        selectedIds.value = next;
    };

    const onDragMove = (e: MouseEvent) => {
        marquee.currentX = e.clientX;
        marquee.lastClientY = e.clientY;
        marquee.currentContentY = e.clientY + getScrollOffset();
        if (!marquee.visible) {
            const moved =
                Math.abs(e.clientX - marquee.startX) > DRAG_THRESHOLD ||
                Math.abs(e.clientY - marquee.startY) > DRAG_THRESHOLD;
            if (!moved) return;
            marquee.visible = true;
        }
        selectByMarquee();
        updateAutoScroll(e.clientY);
    };

    // ========== 拖到窗口边缘时自动滚动 ==========
    const AUTO_SCROLL_ZONE = 60; // 距窗口上下边缘的触发范围
    const AUTO_SCROLL_MAX_SPEED = 20; // 每帧最大滚动像素
    let autoScrollSpeed = 0;
    let autoScrollFrame: number | null = null;

    // 从当前元素向上寻找可滚动的祖先容器
    const findScrollContainer = (el: HTMLElement | null): HTMLElement | Window => {
        let node = el?.parentElement ?? null;
        while (node) {
            const style = window.getComputedStyle(node);
            if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
                return node;
            }
            node = node.parentElement;
        }
        return window;
    };

    const scrollByStep = (speed: number) => {
        if (scrollTarget === window) {
            window.scrollBy(0, speed);
        } else {
            (scrollTarget as HTMLElement).scrollTop += speed;
        }
    };

    const stopAutoScroll = () => {
        autoScrollSpeed = 0;
        if (autoScrollFrame !== null) {
            cancelAnimationFrame(autoScrollFrame);
            autoScrollFrame = null;
        }
    };

    const autoScrollStep = () => {
        if (!marquee.visible || autoScrollSpeed === 0) {
            autoScrollFrame = null;
            return;
        }
        const isWindow = scrollTarget === window;
        const before = isWindow ? window.scrollY : (scrollTarget as HTMLElement).scrollTop;
        scrollByStep(autoScrollSpeed);
        const after = isWindow ? window.scrollY : (scrollTarget as HTMLElement).scrollTop;
        // 滚动后按新的滚动量更新选区终点（内容坐标），再重新计算命中
        marquee.currentContentY = marquee.lastClientY + getScrollOffset();
        selectByMarquee();
        if (after === before) {
            // 已滚动到边界，暂停循环，等待下一次鼠标移动再判断
            autoScrollFrame = null;
            return;
        }
        autoScrollFrame = requestAnimationFrame(autoScrollStep);
    };

    // 根据光标距离滚动容器上下边缘的远近决定滚动速度与方向
    const updateAutoScroll = (clientY: number) => {
        let edgeTop = 0;
        let edgeBottom = window.innerHeight;
        if (scrollTarget !== window) {
            const rect = (scrollTarget as HTMLElement).getBoundingClientRect();
            edgeTop = rect.top;
            edgeBottom = rect.bottom;
        }
        if (clientY < edgeTop + AUTO_SCROLL_ZONE) {
            const ratio = Math.min((edgeTop + AUTO_SCROLL_ZONE - clientY) / AUTO_SCROLL_ZONE, 1);
            autoScrollSpeed = -Math.ceil(ratio * AUTO_SCROLL_MAX_SPEED);
        } else if (clientY > edgeBottom - AUTO_SCROLL_ZONE) {
            const ratio = Math.min((clientY - (edgeBottom - AUTO_SCROLL_ZONE)) / AUTO_SCROLL_ZONE, 1);
            autoScrollSpeed = Math.ceil(ratio * AUTO_SCROLL_MAX_SPEED);
        } else {
            autoScrollSpeed = 0;
        }
        if (autoScrollSpeed === 0) {
            stopAutoScroll();
        } else if (autoScrollFrame === null) {
            autoScrollFrame = requestAnimationFrame(autoScrollStep);
        }
    };

    const onDragEnd = () => {
        stopAutoScroll();
        window.removeEventListener('mousemove', onDragMove);
        window.removeEventListener('mouseup', onDragEnd);
        if (marquee.visible) {
            // 抑制拖拽结束时浏览器补发的 click，避免误切换单个卡片
            suppressNextClick.value = true;
        }
        marquee.visible = false;
        baselineIds.clear();
    };

    // 在列表容器上按下鼠标开始框选
    const startDragSelect = (e: MouseEvent) => {
        if (!selectionMode.value || e.button !== 0) return;
        // 忽略按钮、链接、下拉等交互元素上的按下
        if ((e.target as HTMLElement).closest('button, a, input, .n-dropdown, .n-base-selection')) return;
        // 新一次交互开始，清除上一次拖拽残留的抑制标记，并记录当前选中作为预览基准
        suppressNextClick.value = false;
        baselineIds = new Set(selectedIds.value);
        scrollTarget = findScrollContainer(e.currentTarget as HTMLElement);
        const offset = getScrollOffset();
        marquee.startX = e.clientX;
        marquee.startY = e.clientY;
        marquee.currentX = e.clientX;
        marquee.lastClientY = e.clientY;
        marquee.startContentY = e.clientY + offset;
        marquee.currentContentY = e.clientY + offset;
        marquee.visible = false;
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
    };

    // 点击卡片切换选中（拖拽结束后的 click 会被抑制）
    const handleCardSelect = (id: number) => {
        if (suppressNextClick.value) {
            suppressNextClick.value = false;
            return;
        }
        if (!selectionMode.value) return;
        toggleSelect(id);
    };

    onUnmounted(() => {
        stopAutoScroll();
        window.removeEventListener('mousemove', onDragMove);
        window.removeEventListener('mouseup', onDragEnd);
    });

    // 刷新隧道数据
    const refreshTunnelData = async (card: TunnelCard) => {
        loadingRefresh.value = true;
        try {
            const response = await api.v2.tunnel.refreshTunnel(card.name);
            if (response.code === 200) {
                message.success('隧道数据刷新成功');
                onRefresh();
            } else {
                message.error(response.msg || '隧道数据刷新失败');
            }
        } catch (error) {
            message.error('隧道数据刷新失败: ' + (error as Error).message);
        } finally {
            loadingRefresh.value = false;
        }
    };

    // 强制下线隧道
    const handleOfflineTunnel = (card: TunnelCard) => {
        const d = dialog.warning({
            title: '警告',
            content: `您正在强制下线隧道：${card.name}(${card.id})，此操作将立即断开隧道连接，请确认是否继续。(只有frp核心版本为0.51.2_251023版本才支持此功能)`,
            positiveText: '确定下线',
            negativeText: '取消',
            onPositiveClick: async () => {
                try {
                    d.loading = true;
                    loadingOffline.value = true;
                    const response = await api.v2.tunnel.offlineTunnel(card.name);
                    if (response.code === 200) {
                        message.success('隧道强制下线成功');
                        onRefresh();
                    } else {
                        message.error(response.msg || '隧道下线失败');
                    }
                } catch (error) {
                    message.error('隧道下线失败: ' + (error as Error).message);
                } finally {
                    d.loading = false;
                    loadingOffline.value = false;
                }
            },
        });
    };

    // 删除隧道
    const handleDeleteTunnel = async (card: TunnelCard) => {
        deletetTunnelSuccess.value = false;
        try {
            const response = await api.v2.tunnel.deleteTunnel(card.id);

            if (response.code === 200) {
                message.success('成功删除隧道：' + card.name);
                onRefresh();

                // 如果是 HTTP/HTTPS 隧道，检查是否需要删除免费域名
                if (card.type === 'http' || card.type === 'https') {
                    try {
                        const domainData = await api.v2.domain.getUserFreeSubdomains();
                        const domainRecord = domainData.data.find(
                            (item: { record: string; domain: string }) => item.record + '.' + item.domain === card.dorp
                        );

                        if (domainRecord && domainRecord.remarks.includes('网站')) {
                            const domainDialog = dialog.warning({
                                title: '警告',
                                content: '隧道删除成功！但是此隧道绑定了免费域名，请问是否同步删除此隧道的域名解析。',
                                positiveText: '删除',
                                negativeText: '不删除',
                                onPositiveClick: async () => {
                                    domainDialog.loading = true;
                                    try {
                                        await api.v2.domain.deleteFreeSubdomain({
                                            domain: domainRecord.domain,
                                            record: domainRecord.record,
                                        });
                                        message.success('免费域名同步删除成功');
                                    } catch (error) {
                                        message.error('免费域名失败: ' + (error as Error).message);
                                    } finally {
                                        domainDialog.loading = false;
                                    }
                                },
                            });
                        }
                    } catch (error) {
                        console.error('获取域名信息失败', error);
                        message.error('获取域名信息失败: ' + (error as Error).message);
                    }
                }
            } else {
                message.error(response.msg || '删除隧道失败');
                onRefresh();
                throw new Error(response.msg || '删除隧道失败');
            }
        } catch (error) {
            console.error('删除隧道API调用失败', error);
            message.error('删除隧道失败: ' + (error as Error).message);
            onRefresh();
            throw error;
        } finally {
            deletetTunnelSuccess.value = true;
        }
    };

    const handleConfirmDelete = (card: TunnelCard) => {
        const d = dialog.warning({
            title: '警告',
            content: `您正在删除隧道：${card.name}(${card.id})，请确认是否删除。`,
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: async () => {
                d.loading = true;
                try {
                    await handleDeleteTunnel(card);
                } catch (error) {
                    console.error('删除隧道失败', error);
                } finally {
                    d.loading = false;
                }
            },
        });
    };

    // 批量删除选中的隧道
    const handleBatchDelete = () => {
        const count = selectedIds.value.length;
        if (count === 0) {
            message.warning('请先选择要删除的隧道');
            return;
        }
        const d = dialog.warning({
            title: '警告',
            content: `您正在批量删除 ${count} 个隧道，删除后不可恢复，请确认是否继续。`,
            positiveText: '确定删除',
            negativeText: '取消',
            onPositiveClick: async () => {
                d.loading = true;
                loadingBatchDelete.value = true;
                try {
                    const response = await api.v2.tunnel.batchDeleteTunnels([...selectedIds.value]);
                    if (response.code === 200) {
                        message.success(response.msg || `成功删除 ${count} 个隧道`);
                        selectedIds.value = [];
                        selectionMode.value = false;
                        onRefresh();
                    } else {
                        message.error(response.msg || '批量删除隧道失败');
                    }
                } catch (error) {
                    message.error('批量删除隧道失败: ' + (error as Error).message);
                } finally {
                    d.loading = false;
                    loadingBatchDelete.value = false;
                }
            },
        });
    };

    return {
        loadingRefresh,
        loadingOffline,
        deletetTunnelSuccess,
        selectionMode,
        selectedIds,
        loadingBatchDelete,
        toggleSelectionMode,
        toggleSelect,
        handleBatchDelete,
        marqueeStyle,
        marqueeVisible,
        startDragSelect,
        handleCardSelect,
        refreshTunnelData,
        handleOfflineTunnel,
        handleConfirmDelete,
    };
}
