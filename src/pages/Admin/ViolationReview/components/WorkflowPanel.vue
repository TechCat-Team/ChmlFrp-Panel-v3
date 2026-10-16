<template>
    <n-card title="检测与执行进度" :bordered="false" embedded>
        <template #header-extra
            ><n-button size="small" :loading="refreshing" @click="$emit('refresh')">刷新进度</n-button></template
        >
        <n-space vertical :size="14">
            <n-text
                >共接收 {{ workflow.event_count }} 条独立事件 · 最近命中 {{ time(workflow.last_occurred_at) }}</n-text
            >
            <n-alert type="info" :bordered="false"
                >管理决策保存后，节点会同步执行。离线或尚未同步的节点会保持待执行状态。</n-alert
            >
            <n-data-table
                :columns="columns"
                :data="workflow.execution"
                :bordered="false"
                size="small"
                :scroll-x="650"
            />
            <n-alert
                v-if="workflow.attachments?.some((item) => item.status !== 'ready')"
                type="warning"
                :bordered="false"
            >
                部分证据仍在上传或上传失败，节点可以重试；当前事件记录已保存。
            </n-alert>
            <n-alert
                v-if="
                    workflow.execution.some(
                        (node) =>
                            (node.dead_events ?? 0) > 0 ||
                            (node.oldest_event_at && Date.now() - node.oldest_event_at > 900000)
                    )
                "
                type="warning"
                :bordered="false"
            >
                有节点存在异常或滞留的上报事件，请检查节点日志与队列状态。
            </n-alert>
            <n-card v-if="workflow.entitlement_snapshot" title="封禁前权益快照" size="small">
                <n-text>
                    {{ workflow.entitlement_snapshot.prev_usergroup || '历史记录未保存' }} · 隧道数
                    {{ workflow.entitlement_snapshot.prev_tunnel ?? '—' }} · 带宽
                    {{ workflow.entitlement_snapshot.prev_bandwidth ?? '—' }} Mbps · 到期
                    {{ snapshotTerm(workflow.entitlement_snapshot.prev_term) }}
                </n-text>
                <n-p depth="3">新封禁保留原会员权益，解封只撤销对应限制；还有其他有效限制时不会全部放行。</n-p>
            </n-card>
            <n-card v-if="workflow.notifications?.length" title="账户封禁通知" size="small">
                <n-space vertical>
                    <n-space v-for="notice in workflow.notifications" :key="notice.id" align="center">
                        <n-text>{{ notice.channel === 'inbox' ? '站内信' : '邮件' }}</n-text>
                        <n-tag
                            size="small"
                            :type="
                                notice.status === 'delivered'
                                    ? 'success'
                                    : ['unknown', 'failed'].includes(notice.status)
                                      ? 'error'
                                      : 'default'
                            "
                        >
                            {{ noticeLabels[notice.status] || notice.status }}
                        </n-tag>
                        <n-text depth="3">{{ noticeError(notice.last_error) }} · {{ time(notice.updated_at) }}</n-text>
                    </n-space>
                    <n-alert
                        v-if="workflow.notifications.some((notice) => notice.status === 'unknown')"
                        type="warning"
                        :bordered="false"
                    >
                        邮件可能已被服务端接收，请核对邮件服务日志后处理，系统不会自动重复发送。
                    </n-alert>
                </n-space>
            </n-card>
            <n-collapse>
                <n-collapse-item title="最近检测事件" name="events">
                    <n-empty v-if="!workflow.events.length" description="该历史记录没有节点事件" />
                    <n-card
                        v-for="event in workflow.events"
                        :key="event.event_id"
                        size="small"
                        style="margin-bottom: 8px"
                    >
                        <n-text depth="3">{{ time(event.received_at) }} · {{ event.event_id }}</n-text>
                        <pre class="event-facts">{{ formatEvent(event.payload_json) }}</pre>
                    </n-card>
                </n-collapse-item>
                <n-collapse-item title="管理决策记录" name="decisions">
                    <n-empty v-if="!workflow.decisions.length" description="尚未作出管理决策" />
                    <n-p v-for="decision in workflow.decisions" :key="decision.id">
                        {{ time(decision.created_at) }} · {{ actions[decision.action] || decision.action }} ·
                        {{ decision.scope === 'user' ? '账号' : '隧道' }} ·
                        {{ decision.expires_at ? `至 ${time(decision.expires_at)}` : '无自动到期' }}<br />
                        {{ decision.reason || '未填写备注' }}
                    </n-p>
                </n-collapse-item>
            </n-collapse>
        </n-space>
    </n-card>
</template>

<script setup lang="ts">
import { h } from 'vue';
import dayjs from 'dayjs';
import { NTag, type DataTableColumns } from 'naive-ui';
import { isLifetimeTerm, formatApiDateTime } from '@/utils/formatApiDateTime';
import type { ViolationWorkflow, NodeExecution } from '@/api/v2/admin/violation';
defineProps<{ workflow: ViolationWorkflow; refreshing: boolean }>();
defineEmits<{ refresh: [] }>();
const snapshotTerm = (value: string | null) =>
    isLifetimeTerm(value) ? '永久' : formatApiDateTime(value, { omitMidnight: true, fallback: '—' });
const noticeLabels: Record<string, string> = {
    pending: '待发送',
    sending: '发送中',
    delivered: '已投递',
    skipped: '已跳过',
    failed: '发送失败',
    unknown: '结果待核对',
};
const noticeError = (value: string) =>
    ({
        placeholder_email: '占位邮箱不发送邮件',
        no_email: '未绑定邮箱',
        sender_interrupted: '发送进程中断',
        delivery_unconfirmed: '未能确认投递结果',
        mail_setup_failed: '邮件服务配置或认证失败',
        mail_connection_failed: '邮件服务连接失败',
    })[value] ||
    value ||
    '正常';
const actions: Record<string, string> = {
    pass: '误报放行',
    reject: '驳回上报',
    warn: '警告',
    ban: '封禁',
    release: '解除封禁',
};
const time = (value?: number | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—');
const columns: DataTableColumns<NodeExecution> = [
    { title: '节点', key: 'name' },
    {
        title: '执行状态',
        key: 'status',
        render(row) {
            const offline = !row.last_sync || Date.now() - row.last_sync > 60_000;
            const applied = row.desired_revision != null && (row.applied_revision ?? 0) >= row.desired_revision;
            const label = row.last_error ? '执行失败' : offline ? '离线 / 未同步' : applied ? '已执行' : '待执行';
            return h(
                NTag,
                {
                    size: 'small',
                    type: row.last_error ? 'error' : offline ? 'default' : applied ? 'success' : 'warning',
                },
                () => label
            );
        },
    },
    { title: '最近同步', key: 'last_sync', render: (row) => time(row.last_sync) },
    {
        title: '待上报 / 异常',
        key: 'queue_depth',
        render: (row) => `${row.queue_depth ?? 0} / ${row.dead_events ?? 0}`,
    },
    { title: '执行错误', key: 'last_error', ellipsis: { tooltip: true } },
];
const formatEvent = (payload: string) => {
    try {
        const event = JSON.parse(payload);
        return JSON.stringify(
            {
                协议: event.protocol,
                级别: event.severity === 'confirmed' ? '明确命中' : '可疑',
                检测时间: time(event.occurred_at),
                临时隔离到期: time(event.local_expires_at),
                依据: event.facts,
            },
            null,
            2
        );
    } catch {
        return '事件详情暂时无法解析';
    }
};
</script>

<style scoped>
.event-facts {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 12px;
    line-height: 1.7;
}
</style>
