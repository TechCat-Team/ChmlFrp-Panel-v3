<template>
    <div class="domain-whitelist-page">
        <n-back-top :right="100" />
        <n-card
            :title="admin ? '备案过白管理' : undefined"
            class="list-header"
            :class="{ 'user-list-header': !admin }"
            :content-style="!admin && !hasUserNotice ? 'padding: 0;' : undefined"
        >
            <template v-if="!admin" #header>
                <div class="user-header-summary">
                    <span class="user-header-title">过白域名列表</span>
                    <template v-if="userSummary">
                        <n-tag round :bordered="false" type="primary" size="small">
                            已用域名 {{ userSummary.activeCount }} / {{ policy?.domainLimit }}
                        </n-tag>
                        <n-tag round :bordered="false" size="small">
                            今日提交 {{ userSummary.usedToday }} / {{ policy?.dailyLimit }}
                        </n-tag>
                        <n-text depth="3" class="overview-hint">每日 00:00 重置次数</n-text>
                    </template>
                </div>
            </template>
            <template #header-extra>
                <n-space :size="4" :wrap="false">
                    <n-button v-if="admin" round quaternary :loading="loading" @click="refresh">
                        <template #icon><n-icon :component="RefreshOutline" /></template>
                        刷新
                    </n-button>
                    <n-button v-if="!admin" round quaternary @click="showRules = true">
                        <template #icon><n-icon :component="InformationCircleOutline" /></template>
                        过白规则
                    </n-button>
                    <n-button type="primary" round quaternary :disabled="!canSubmit" @click="openCreate">
                        <template #icon><n-icon :component="AddOutline" /></template>
                        {{ admin ? '添加域名' : '提交域名' }}
                    </n-button>
                </n-space>
            </template>

            <n-alert v-if="pageError" type="error" class="page-notice">{{ pageError }}</n-alert>
            <n-alert v-if="policy && !policy.verificationConfigured" type="warning" class="page-notice">
                备案验证服务尚未配置，请联系管理员。
            </n-alert>
            <n-alert
                v-if="!admin && userSummary && userSummary.usedToday >= userSummary.policy.dailyLimit"
                type="warning"
                class="page-notice"
            >
                今日提交次数已用完，请明天再试或联系管理员。次数按北京时间每日 00:00 重置。
            </n-alert>

            <div v-if="admin" class="list-overview">
                <n-text depth="3" class="overview-hint">管理用户的过白域名、备案验证与提交额度</n-text>
                <n-space :size="4" class="help-actions">
                    <n-button v-if="admin" size="small" quaternary round @click="showQuota = true">
                        <template #icon><n-icon :component="PeopleOutline" /></template>
                        用户额度
                    </n-button>
                    <n-button size="small" quaternary round @click="showRules = true">
                        <template #icon><n-icon :component="InformationCircleOutline" /></template>
                        过白规则
                    </n-button>
                </n-space>
            </div>

            <div v-if="admin" class="filters">
                <n-input
                    v-model:value="keyword"
                    clearable
                    placeholder="搜索域名、备案号或用户名"
                    class="keyword-filter"
                    @keyup.enter="search"
                >
                    <template #prefix><n-icon :component="SearchOutline" /></template>
                </n-input>
                <n-select
                    v-model:value="status"
                    :options="statusOptions"
                    clearable
                    placeholder="全部状态"
                    class="status-filter"
                />
                <n-input-number
                    v-if="admin"
                    v-model:value="filterUserId"
                    :min="1"
                    :precision="0"
                    placeholder="用户 ID"
                    :show-button="false"
                    class="user-filter"
                />
                <n-space :size="8" :wrap="false">
                    <n-button secondary type="primary" :loading="loading" @click="search">查询</n-button>
                    <n-button quaternary @click="clearFilters">重置</n-button>
                </n-space>
            </div>
        </n-card>

        <n-card v-if="admin" title="全部过白记录">
            <n-data-table
                remote
                :columns="columns"
                :data="rows"
                :row-key="(row: WhitelistRecord) => row.id"
                :loading="loading"
                :scroll-x="1350"
                :pagination="false"
            />
        </n-card>
        <template v-else>
            <n-grid v-if="loading" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="24" :y-gap="24" responsive="screen">
                <n-grid-item v-for="index in 6" :key="index">
                    <n-skeleton height="238px" width="100%" class="domain-skeleton" />
                </n-grid-item>
            </n-grid>
            <n-grid
                v-else-if="rows.length"
                cols="1 m:2 l:3 xl:4 2xl:5"
                :x-gap="24"
                :y-gap="24"
                responsive="screen"
                class="domain-grid"
            >
                <n-grid-item v-for="row in rows" :key="row.id" class="grid-item">
                    <DomainWhitelistCard
                        :record="row"
                        :status-label="statusLabel(row.status)"
                        @view="viewDetail"
                        @remove="confirmDelete"
                    />
                </n-grid-item>
            </n-grid>
            <n-card v-else class="empty-card">
                <n-empty description="您还没有提交过白域名">
                    <template #icon><n-icon :component="GlobeOutline" /></template>
                    <template #extra>
                        <n-button size="small" :disabled="!canSubmit" @click="openCreate">
                            <template #icon><n-icon :component="AddOutline" /></template>
                            提交过白域名
                        </n-button>
                    </template>
                </n-empty>
            </n-card>
        </template>
        <div v-if="admin && total > 0" class="list-pagination">
            <n-text depth="3">共 {{ total }} 条记录</n-text>
            <n-pagination
                v-model:page="page"
                v-model:page-size="size"
                :item-count="total"
                show-size-picker
                :page-sizes="[10, 20, 50]"
                @update:page="fetchList"
                @update:page-size="search"
            />
        </div>

        <n-modal
            v-model:show="showIntroduction"
            preset="dialog"
            type="info"
            title="备案过白使用说明"
            positive-text="我已了解"
            :mask-closable="false"
            :close-on-esc="false"
            :closable="false"
            @positive-click="acknowledgeIntroduction"
        >
            <n-space vertical :size="12">
                <n-text>本页面用于已备案域名的节点过白，不提供 ICP 备案申请或办理服务。</n-text>
                <n-text>
                    域名完成 ICP
                    备案后，还需在这里提交过白。验证通过后，才可用于支持建站的节点；具体可用范围和使用要求以对应节点的规则为准。
                </n-text>
            </n-space>
        </n-modal>

        <n-modal v-model:show="showRules" preset="card" title="过白规则" class="whitelist-modal">
            <n-space vertical :size="16">
                <n-text
                    >提交子域名会自动提取可注册主域名，例如 www.example.com.cn →
                    example.com.cn。仅支持工信部公布的域名后缀。</n-text
                >
                <n-descriptions bordered :column="1" label-placement="left">
                    <n-descriptions-item label="每日提交"
                        >每人最多 {{ policy?.dailyLimit ?? 5 }} 次，北京时间每日 00:00 重置</n-descriptions-item
                    >
                    <n-descriptions-item label="域名数量"
                        >每人最多保留 {{ policy?.domainLimit ?? 30 }} 个，验证中的域名也占名额</n-descriptions-item
                    >
                    <n-descriptions-item label="删除费用"
                        >过白未满三个月删除扣除 {{ policy?.deleteFee ?? 500 }} 积分，满三个月免费</n-descriptions-item
                    >
                </n-descriptions>
                <n-text depth="3"
                    >提交进入验证后计入当日次数，未备案或验证异常也计入；格式错误和重复提交不计入。</n-text
                >
                <n-button
                    text
                    type="primary"
                    tag="a"
                    href="https://domain.miit.gov.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    >查看工信部域名支持范围</n-button
                >
            </n-space>
        </n-modal>

        <n-modal
            v-model:show="showCreate"
            preset="card"
            :title="admin ? '为用户添加过白域名' : '提交备案过白'"
            class="whitelist-modal"
            :mask-closable="!submitting"
            :closable="!submitting"
        >
            <n-form label-placement="top" @submit.prevent="prepareSubmit">
                <n-form-item v-if="admin" label="所属用户 ID" required>
                    <n-input-number
                        v-model:value="createUserId"
                        :min="1"
                        :precision="0"
                        :show-button="false"
                        style="width: 100%"
                        :disabled="submitting"
                    />
                </n-form-item>
                <n-form-item label="域名" required>
                    <n-input
                        v-model:value="domain"
                        placeholder="例如 www.example.com.cn，仅输入域名"
                        :maxlength="253"
                        :disabled="submitting"
                        @update:value="normalized = ''"
                        @blur="previewDomain"
                    />
                </n-form-item>
                <n-alert v-if="normalized" type="success" style="margin-bottom: 16px"
                    >实际提交：{{ normalized }}</n-alert
                >
                <n-form-item :label="admin ? '添加原因' : '备注（可选）'" :required="admin">
                    <n-input
                        v-model:value="remarks"
                        type="textarea"
                        :maxlength="400"
                        show-count
                        :disabled="submitting"
                    />
                </n-form-item>
                <n-alert type="warning">
                    {{
                        admin
                            ? '管理员添加不消耗用户每日次数，仍须通过备案验证且受30个域名上限限制。'
                            : '提交进入验证后消耗1次当日额度，验证未通过或接口异常也计入。格式错误和重复提交不计入。'
                    }}
                    验证通过后自动过白。
                </n-alert>
                <n-space justify="end" style="margin-top: 20px">
                    <n-button round :disabled="submitting" @click="showCreate = false">取消</n-button>
                    <n-button round type="primary" attr-type="submit" :loading="submitting">验证并提交</n-button>
                </n-space>
            </n-form>
        </n-modal>

        <n-modal v-model:show="showDetail" preset="card" title="过白记录详情" class="whitelist-modal wide">
            <n-spin :show="detailLoading">
                <template v-if="selected">
                    <n-descriptions bordered :column="1" label-placement="left">
                        <n-descriptions-item label="域名">{{ selected.record.domain }}</n-descriptions-item>
                        <n-descriptions-item label="用户">{{ selected.record.user_id }}</n-descriptions-item>
                        <n-descriptions-item label="状态">{{
                            statusLabel(selected.record.status)
                        }}</n-descriptions-item>
                        <n-descriptions-item label="验证结果">{{ selected.record.message || '—' }}</n-descriptions-item>
                        <n-descriptions-item label="备案号">{{ selected.record.licence || '—' }}</n-descriptions-item>
                        <n-descriptions-item label="备案主体 / 性质"
                            >{{ selected.record.company || '—' }} /
                            {{ selected.record.nature || '—' }}</n-descriptions-item
                        >
                        <n-descriptions-item label="备案审核日期">{{
                            selected.record.checked_date || '—'
                        }}</n-descriptions-item>
                        <n-descriptions-item label="提交时间">{{
                            date(selected.record.created_at)
                        }}</n-descriptions-item>
                        <n-descriptions-item label="过白时间">{{
                            date(selected.record.approved_at)
                        }}</n-descriptions-item>
                        <n-descriptions-item label="最近验证">{{
                            date(selected.record.verified_at)
                        }}</n-descriptions-item>
                        <n-descriptions-item label="免费删除时间"
                            >{{ date(selected.record.free_delete_at) }}（北京时间）</n-descriptions-item
                        >
                        <n-descriptions-item label="备注">{{ selected.record.remarks || '—' }}</n-descriptions-item>
                        <n-descriptions-item v-if="admin" label="接口任务号">{{
                            selected.record.task_no || '—'
                        }}</n-descriptions-item>
                    </n-descriptions>
                    <n-divider>操作记录</n-divider>
                    <n-timeline>
                        <n-timeline-item
                            v-for="log in selected.logs"
                            :key="log.id"
                            :title="actionLabel(log.action)"
                            :content="`${log.detail} · 操作者 ${log.actor_name || (log.actor_id === 0 ? '系统' : log.actor_id)}`"
                            :time="date(log.created_at)"
                        />
                    </n-timeline>
                </template>
            </n-spin>
        </n-modal>

        <n-modal
            v-model:show="showManage"
            preset="card"
            :title="manageTitle"
            class="whitelist-modal"
            :mask-closable="!managing"
            :closable="!managing"
        >
            <n-alert :type="manageAction === 'revoke' ? 'warning' : 'info'">
                {{ managedRecord?.domain }} ·
                {{
                    manageAction === 'revoke'
                        ? '移除后停止过白，释放名额，不扣用户积分。'
                        : manageAction === 'recheck'
                          ? '将再次调用备案接口。备案失效会自动移除；接口异常保留原状态。'
                          : '修改此记录的备注。'
                }}
            </n-alert>
            <n-input
                v-model:value="manageReason"
                type="textarea"
                placeholder="请填写操作原因或备注（必填）"
                :maxlength="400"
                show-count
                style="margin: 16px 0"
                :disabled="managing"
            />
            <n-space justify="end">
                <n-button :disabled="managing" @click="showManage = false">取消</n-button>
                <n-button type="primary" :loading="managing" @click="performManage">确认{{ manageTitle }}</n-button>
            </n-space>
        </n-modal>

        <n-modal v-model:show="showQuota" preset="card" title="用户额度管理" class="whitelist-modal">
            <n-space>
                <n-input-number
                    v-model:value="quotaUserId"
                    :min="1"
                    :precision="0"
                    placeholder="用户 ID"
                    :show-button="false"
                    @update:value="quotaData = null"
                />
                <n-button :loading="quotaLoading" @click="loadQuota">查询额度</n-button>
            </n-space>
            <template v-if="quotaData">
                <p>
                    当前占用 {{ quotaData.summary.activeCount }} / 30 个名额，今日已提交
                    {{ quotaData.summary.usedToday }} / 5 次。
                </p>
                <n-alert type="warning">重置后用户今天可以再提交5次，历史提交和操作记录仍保留。</n-alert>
                <n-input
                    v-model:value="quotaReason"
                    type="textarea"
                    placeholder="重置原因（必填）"
                    :maxlength="400"
                    style="margin: 16px 0"
                />
                <n-button type="warning" :loading="quotaLoading" @click="confirmResetQuota">重置今日次数</n-button>
                <n-divider>最近重置记录</n-divider>
                <n-empty v-if="!quotaData.logs.length" description="暂无重置记录" />
                <n-timeline v-else>
                    <n-timeline-item
                        v-for="(log, index) in quotaData.logs"
                        :key="index"
                        :content="`${log.detail} · 操作者 ${log.actor_id}`"
                        :time="date(log.created_at)"
                    />
                </n-timeline>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import {
    NAlert,
    NBackTop,
    NButton,
    NCard,
    NDataTable,
    NDescriptions,
    NDescriptionsItem,
    NDivider,
    NEmpty,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NGrid,
    NGridItem,
    NIcon,
    NModal,
    NPagination,
    NSelect,
    NSpace,
    NSpin,
    NSkeleton,
    NText,
    NTag,
    NTimeline,
    NTimelineItem,
    useDialog,
    useMessage,
    type DataTableColumns,
} from 'naive-ui';
import {
    AddOutline,
    RefreshOutline,
    SearchOutline,
    InformationCircleOutline,
    GlobeOutline,
    PeopleOutline,
} from '@vicons/ionicons5';
import DomainWhitelistCard from './whitelist/DomainWhitelistCard.vue';
import api from '@/api';
import { useUserStore } from '@/stores/user';
import type {
    WhitelistDetail,
    WhitelistPolicy,
    WhitelistRecord,
    WhitelistSummary,
    QuotaDetail,
} from '@/api/v2/whitelist/whitelist';

const props = defineProps<{ admin?: boolean }>();
const service = api.v2.whitelist;
const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();
const loading = ref(false),
    submitting = ref(false),
    detailLoading = ref(false),
    managing = ref(false),
    quotaLoading = ref(false);
const pageError = ref('');
const rows = ref<WhitelistRecord[]>([]),
    total = ref(0),
    page = ref(1),
    size = ref(10);
const keyword = ref(''),
    status = ref<string | null>(null),
    filterUserId = ref<number | null>(null);
const policy = ref<WhitelistPolicy | null>(null),
    userSummary = ref<WhitelistSummary | null>(null);
const showCreate = ref(false),
    showDetail = ref(false),
    showManage = ref(false),
    showQuota = ref(false),
    showRules = ref(false),
    showIntroduction = ref(false);
const domain = ref(''),
    normalized = ref(''),
    remarks = ref(''),
    createUserId = ref<number | null>(null);
const selected = ref<WhitelistDetail | null>(null),
    managedRecord = ref<WhitelistRecord | null>(null);
const manageAction = ref(''),
    manageReason = ref(''),
    quotaReason = ref(''),
    quotaUserId = ref<number | null>(null),
    quotaData = ref<QuotaDetail | null>(null);
const introductionStorageKey = computed(() => {
    const userId = userStore.userInfo?.id;
    return userId ? `chmlfrp:domain-whitelist:introduction:v1:${userId}` : null;
});
watch(
    () => [props.admin, introductionStorageKey.value] as const,
    ([admin, key]) => {
        showIntroduction.value = false;
        if (admin || !key) return;
        try {
            showIntroduction.value = localStorage.getItem(key) !== 'acknowledged';
        } catch {
            // The explanation remains available even when browser storage is disabled.
            showIntroduction.value = true;
        }
    },
    { immediate: true }
);
function acknowledgeIntroduction() {
    const key = introductionStorageKey.value;
    if (key) {
        try {
            localStorage.setItem(key, 'acknowledged');
        } catch {
            // A storage failure must not prevent the user from continuing.
        }
    }
    showIntroduction.value = false;
}

const hasUserNotice = computed(
    () =>
        !!pageError.value ||
        (!!policy.value && !policy.value.verificationConfigured) ||
        (!!userSummary.value && userSummary.value.usedToday >= userSummary.value.policy.dailyLimit)
);
const canSubmit = computed(
    () =>
        !!policy.value?.verificationConfigured &&
        (props.admin ||
            (!!userSummary.value &&
                userSummary.value.activeCount < policy.value.domainLimit &&
                userSummary.value.usedToday < policy.value.dailyLimit))
);
const labels: Record<string, string> = {
    verifying: '验证中',
    approved: '已过白',
    rejected: '未通过',
    error: '验证异常',
    removed: '用户删除',
    revoked: '已移除',
};
const statusOptions = Object.entries(labels).map(([value, label]) => ({ value, label }));
const statusLabel = (value: string) => labels[value] || value;
const actionLabel = (value: string) =>
    ({
        submit: '用户提交',
        admin_submit: '管理员添加',
        verify_approved: '验证通过',
        verify_rejected: '验证未通过',
        verify_error: '验证异常',
        delete: '用户删除',
        admin_revoke: '管理员移除',
        admin_remarks: '修改备注',
        admin_recheck: '重新验证',
        admin_recheck_error: '重新验证异常',
    })[value] || value;
const date = (value: string | null) => (value ? value.replace('T', ' ').replace(/\.\d+$/, '') : '—');
const errorText = (error: unknown) => (error instanceof Error ? error.message : '操作失败，请稍后重试');
const manageTitle = computed(
    () => ({ revoke: '移除过白', recheck: '重新验证', remarks: '修改备注' })[manageAction.value] || '管理域名'
);
const columns = computed<DataTableColumns<WhitelistRecord>>(() => [
    { title: '域名', key: 'domain', width: 210, ellipsis: { tooltip: true } },
    ...(props.admin
        ? [
              {
                  title: '所属用户',
                  key: 'username',
                  width: 160,
                  render: (row: WhitelistRecord) => `${row.username || '用户已删除'} (#${row.user_id})`,
              },
          ]
        : []),
    {
        title: '状态',
        key: 'status',
        width: 110,
        render: (row) =>
            h(
                NTag,
                {
                    type:
                        row.status === 'approved'
                            ? 'success'
                            : row.status === 'verifying'
                              ? 'info'
                              : row.status === 'error'
                                ? 'warning'
                                : 'default',
                    bordered: false,
                },
                { default: () => statusLabel(row.status) }
            ),
    },
    { title: '备案号', key: 'licence', width: 180, ellipsis: { tooltip: true }, render: (row) => row.licence || '—' },
    { title: '提交时间（北京）', key: 'created_at', width: 180, render: (row) => date(row.created_at) },
    {
        title: '删除费用',
        key: 'delete_fee',
        width: 130,
        render: (row) => (row.status === 'approved' ? `${row.delete_fee} 积分` : '—'),
    },
    {
        title: '操作',
        key: 'actions',
        width: props.admin ? 320 : 180,
        fixed: 'right',
        render: (row) =>
            h(
                NSpace,
                { size: 'small' },
                {
                    default: () => [
                        h(NButton, { size: 'small', onClick: () => viewDetail(row.id) }, { default: () => '详情' }),
                        ...(props.admin
                            ? [
                                  h(
                                      NButton,
                                      { size: 'small', onClick: () => openManage(row, 'remarks') },
                                      { default: () => '备注' }
                                  ),
                                  ...(row.status === 'approved'
                                      ? [
                                            h(
                                                NButton,
                                                { size: 'small', onClick: () => openManage(row, 'recheck') },
                                                { default: () => '复验' }
                                            ),
                                        ]
                                      : []),
                                  ...(['approved', 'verifying'].includes(row.status)
                                      ? [
                                            h(
                                                NButton,
                                                {
                                                    size: 'small',
                                                    type: 'error',
                                                    onClick: () => openManage(row, 'revoke'),
                                                },
                                                { default: () => '移除' }
                                            ),
                                        ]
                                      : []),
                              ]
                            : row.status === 'approved'
                              ? [
                                    h(
                                        NButton,
                                        { size: 'small', type: 'error', onClick: () => confirmDelete(row) },
                                        { default: () => '删除' }
                                    ),
                                ]
                              : []),
                    ],
                }
            ),
    },
]);
let listRequest = 0;
async function fetchList() {
    const request = ++listRequest;
    loading.value = true;
    try {
        if (props.admin) {
            const response = await service.list(true, {
                keyword: keyword.value,
                status: status.value || undefined,
                userId: filterUserId.value ?? undefined,
                page: page.value,
                size: size.value,
            });
            if (request === listRequest) {
                rows.value = response.data.items;
                total.value = response.data.total;
            }
        } else {
            const response = await service.listAll();
            if (request === listRequest) {
                rows.value = response.data;
                total.value = response.data.length;
            }
        }
    } catch (error) {
        if (request === listRequest) message.error(errorText(error));
    } finally {
        if (request === listRequest) loading.value = false;
    }
}
async function refresh() {
    pageError.value = '';
    try {
        if (props.admin) policy.value = (await service.policy()).data;
        else {
            userSummary.value = (await service.summary()).data;
            policy.value = userSummary.value.policy;
        }
    } catch (error) {
        pageError.value = errorText(error);
    }
    await fetchList();
}
function search() {
    page.value = 1;
    void fetchList();
}
function clearFilters() {
    keyword.value = '';
    status.value = null;
    filterUserId.value = null;
    search();
}
function openCreate() {
    domain.value = '';
    normalized.value = '';
    remarks.value = '';
    createUserId.value = filterUserId.value;
    showCreate.value = true;
}
async function previewDomain() {
    const input = domain.value;
    if (!input.trim() || submitting.value) return;
    try {
        const response = await service.preview(input);
        if (domain.value === input) normalized.value = response.data.domain;
    } catch (error) {
        if (domain.value === input) {
            normalized.value = '';
            message.warning(errorText(error));
        }
    }
}
async function prepareSubmit() {
    if (submitting.value) return;
    if (props.admin && (!createUserId.value || !remarks.value.trim())) {
        message.warning('请填写用户ID和添加原因');
        return;
    }
    submitting.value = true;
    try {
        const response = await service.preview(domain.value);
        normalized.value = response.data.domain;
        const body = {
            domain: normalized.value,
            remarks: remarks.value,
            userId: props.admin ? createUserId.value! : undefined,
        };
        dialog.warning({
            title: '确认提交备案验证',
            content: `将提交 ${body.domain}。${props.admin ? '此次添加不消耗用户每日次数。' : '进入验证后消耗今日1次提交额度。'}`,
            positiveText: '确认并验证',
            negativeText: '取消',
            onPositiveClick: async () => {
                submitting.value = true;
                try {
                    const result = await service.submit(body, !!props.admin);
                    showCreate.value = false;
                    if (result.data.record.status === 'approved') message.success(`${body.domain} 已过白`);
                    else message.warning(result.data.record.message);
                    selected.value = result.data;
                    showDetail.value = true;
                } catch (error) {
                    message.error(errorText(error));
                } finally {
                    submitting.value = false;
                    await refresh();
                }
            },
        });
    } catch (error) {
        message.warning(errorText(error));
    } finally {
        submitting.value = false;
    }
}
async function viewDetail(id: number) {
    selected.value = null;
    showDetail.value = true;
    detailLoading.value = true;
    try {
        selected.value = (await service.detail(id, !!props.admin)).data;
    } catch (error) {
        message.error(errorText(error));
        showDetail.value = false;
    } finally {
        detailLoading.value = false;
    }
}
async function confirmDelete(row: WhitelistRecord) {
    // Fetch the authoritative current fee immediately before asking for confirmation.
    try {
        const latest = (await service.detail(row.id)).data.record;
        if (latest.status !== 'approved') {
            message.warning('该记录状态已变化，请刷新');
            await refresh();
            return;
        }
        dialog.warning({
            title: '删除过白域名',
            content:
                latest.delete_fee > 0
                    ? `${row.domain} 过白未满三个月，删除将扣除500积分。免费删除时间：${date(latest.free_delete_at)}（北京时间）。确认删除？`
                    : `确认删除 ${row.domain}？该域名已满三个月，本次删除免费。`,
            positiveText: latest.delete_fee > 0 ? '扣除500积分并删除' : '确认免费删除',
            negativeText: '取消',
            onPositiveClick: async () => {
                try {
                    const result = await service.remove(row.id, latest.delete_fee > 0);
                    userStore.setUser({ integral: result.data.balance });
                    message.success(`已删除，扣除${result.data.charged}积分`);
                    await refresh();
                } catch (error) {
                    message.error(errorText(error));
                }
            },
        });
    } catch (error) {
        message.error(errorText(error));
    }
}
function openManage(row: WhitelistRecord, action: string) {
    managedRecord.value = row;
    manageAction.value = action;
    manageReason.value = action === 'remarks' ? row.remarks : '';
    showManage.value = true;
}
async function performManage() {
    if (!managedRecord.value || managing.value) return;
    if (!manageReason.value.trim()) {
        message.warning('请填写操作原因');
        return;
    }
    managing.value = true;
    try {
        const result = await service.manage(managedRecord.value.id, manageAction.value, manageReason.value);
        showManage.value = false;
        selected.value = result.data;
        message.success(result.data.record.message || '操作成功');
        await refresh();
    } catch (error) {
        message.error(errorText(error));
    } finally {
        managing.value = false;
    }
}
async function loadQuota() {
    if (!quotaUserId.value || quotaLoading.value) return;
    quotaData.value = null;
    quotaLoading.value = true;
    try {
        quotaData.value = (await service.quota(quotaUserId.value)).data;
    } catch (error) {
        message.error(errorText(error));
    } finally {
        quotaLoading.value = false;
    }
}
function confirmResetQuota() {
    if (!quotaUserId.value || !quotaReason.value.trim()) {
        message.warning('请填写用户ID和重置原因');
        return;
    }
    const userId = quotaUserId.value,
        reason = quotaReason.value;
    dialog.warning({
        title: '重置当日提交次数',
        content: `确认重置用户 #${userId} 的今日次数？该操作会记录管理员和原因。`,
        positiveText: '确认重置',
        negativeText: '取消',
        onPositiveClick: async () => {
            quotaLoading.value = true;
            try {
                quotaData.value = (await service.resetQuota(userId, reason)).data;
                quotaReason.value = '';
                message.success('今日次数已重置');
            } catch (error) {
                message.error(errorText(error));
            } finally {
                quotaLoading.value = false;
            }
        },
    });
}
onMounted(refresh);
</script>

<style scoped>
.list-header {
    margin-bottom: 20px;
}
.user-header-summary {
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
    overflow-x: auto;
    scrollbar-width: thin;
}
.user-header-summary > * {
    flex-shrink: 0;
}
.user-header-title {
    font-size: 18px;
    font-weight: 500;
}
.user-list-header :deep(.n-card-header__main) {
    min-width: 0;
}
.user-list-header :deep(.n-card-header__extra) {
    flex-shrink: 0;
}
.page-notice {
    margin-bottom: 16px;
}
.list-overview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}
.overview-hint {
    font-size: 13px;
}
.filters {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 16px;
}
.keyword-filter {
    width: 280px;
    max-width: 100%;
}
.status-filter,
.user-filter {
    width: 150px;
}
.domain-skeleton {
    border-radius: 10px;
}
.grid-item {
    min-width: 0;
    transition: opacity 0.2s ease;
}
.grid-item:hover {
    opacity: 0.95;
}
.empty-card {
    padding: 24px 0;
}
.list-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 20px;
}
:global(.whitelist-modal) {
    width: min(560px, calc(100vw - 32px));
    max-height: 85vh;
    overflow-y: auto;
}
:global(.whitelist-modal.wide) {
    width: min(800px, calc(100vw - 32px));
}
@media (max-width: 600px) {
    .list-header :deep(.n-card-header) {
        flex-wrap: wrap;
        gap: 12px;
        padding: 16px;
    }
    .list-header :deep(.n-card__content) {
        padding: 0 16px 16px;
    }
    .list-header :deep(.n-card-header__extra) {
        margin-left: 0;
    }
    .user-list-header :deep(.n-card-header) {
        flex-wrap: nowrap;
    }
    .user-header-summary .overview-hint {
        display: none;
    }
    .keyword-filter {
        width: 100%;
    }
    .status-filter,
    .user-filter {
        flex: 1;
        min-width: 120px;
    }
    .list-pagination {
        justify-content: center;
    }
    .list-pagination > .n-text {
        width: 100%;
        text-align: center;
    }
}
</style>
