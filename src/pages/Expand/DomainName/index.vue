<template>
    <n-back-top :right="100" />
    <DomainListHeader :loading="loading" :create-loading="createDomainNameLoading" @refresh="fetchDomainData" @create="handleCreateDomain" />
    <n-grid v-if="loading" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="190.6px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="24" :y-gap="24" responsive="screen" class="domain-grid">
        <n-grid-item v-for="(domain, index) in domainData" :key="domain.id" class="grid-item">
            <DomainCard
                :domain="domain"
                :loading="domainLoading[index]"
                :index="index"
                @edit="handleEditDomain"
                @delete="handleDeleteDomain"
            />
        </n-grid-item>
    </n-grid>
    <DomainListEmpty v-if="!loading && domainData.length === 0" :loading="createDomainNameLoading" @create="handleCreateDomain" />
    <CreateDomainModal
        :show="createDomainNameModal"
        :model="model"
        :fast-model="fastModel"
        :domain-name-options="domainNameOptions"
        :record-type-options="recordTypeOptions"
        :fast-record-type-options="fastRecordTypeOptions"
        :ttl-options="TTLOptions"
        :tunnel-options="tunnelOptions"
        :target-placeholder="targetPlaceholder"
        :loading="createLoading"
        :loading-tunnel="loadingSelectedTunnel"
        :size="size"
        :cname-warning="INFO_MESSAGES.CNAME_WARNING"
        @update:show="createDomainNameModal = $event"
        @update:model="model = $event"
        @update:fast-model="fastModel = $event"
        @tab-change="handleTabChange"
        @submit="handleSubmit"
        @fast-submit="handleFastSubmit"
    />
    <EditDomainModal
        :show="editDomainNameModal"
        :model="model"
        :domain-name-options="domainNameOptions"
        :record-type-options="recordTypeOptions"
        :ttl-options="TTLOptions"
        :target-placeholder="targetPlaceholder"
        :loading="editLoading"
        :size="size"
        @update:show="editDomainNameModal = $event"
        @update:model="model = $event"
        @submit="handleEditSubmit"
    />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import { useDomainList } from './composables/useDomainList';
import { useDomainForm } from './composables/useDomainForm';
import { useDomainCreate } from './composables/useDomainCreate';
import { useDomainEdit } from './composables/useDomainEdit';
import { useDomainDelete } from './composables/useDomainDelete';
import { useDomainOptions } from './composables/useDomainOptions';
import { useTunnelList } from './composables/useTunnelList';
import DomainListHeader from './components/DomainListHeader.vue';
import DomainCard from './components/DomainCard.vue';
import DomainListEmpty from './components/DomainListEmpty.vue';
import CreateDomainModal from './components/CreateDomainModal.vue';
import EditDomainModal from './components/EditDomainModal.vue';
import type { FreeDomain, TTLValue } from './types';
import {
    RECORD_TYPE_OPTIONS,
    FAST_RECORD_TYPE_OPTIONS,
    TTL_OPTIONS,
    INFO_MESSAGES,
} from './constants';

const userStore = useUserStore();
const userInfo = userStore.userInfo;
const message = useMessage();
const dialog = useDialog();

// 域名列表
const { loading, domainData, fetchDomainData } = useDomainList(userInfo || undefined);

// 域名表单
const { model, fastModel, targetPlaceholder, resetForm, resetFastForm } = useDomainForm();

// 域名选项
const { domainNameOptions, loading: loadingDomainOptions, fetchDomainOptions } = useDomainOptions();

// 隧道列表
const {
    loading: loadingSelectedTunnel,
    tunnelOptions,
    selectedTunnelInfo,
    fetchTunnelList,
    handleTunnelChange: handleTunnelChangeComposable,
} = useTunnelList(userInfo || undefined);

// 创建域名
const { loading: createLoading, createDomain, createFastDomain } = useDomainCreate(
    userInfo || undefined,
    () => {
        createDomainNameModal.value = false;
        resetForm();
        resetFastForm();
        fetchDomainData();
    }
);

// 编辑域名
const { loading: editLoading, updateDomain } = useDomainEdit(userInfo || undefined, () => {
    editDomainNameModal.value = false;
    resetForm();
    fetchDomainData();
});

// 删除域名
const { deleteDomain } = useDomainDelete(userInfo || undefined, () => {
    fetchDomainData();
});

// 模态框状态
const createDomainNameModal = ref(false);
const createDomainNameLoading = ref(false);
const editDomainNameModal = ref(false);

// 无限滚动
const count = ref(16);
const handleLoad = () => {
    count.value += 1;
};

// 域名加载状态
const domainLoading = ref<boolean[]>([]);

watch(
    domainData,
    (newDomainData) => {
        domainLoading.value = newDomainData.map(() => false);
    },
    { immediate: true }
);

const size = ref('medium');

// 记录类型选项
const recordTypeOptions = RECORD_TYPE_OPTIONS;
const fastRecordTypeOptions = FAST_RECORD_TYPE_OPTIONS;
const TTLOptions = TTL_OPTIONS;

// 创建域名
const handleCreateDomain = async () => {
    createDomainNameLoading.value = true;
    await fetchDomainOptions();
    createDomainNameModal.value = true;
    createDomainNameLoading.value = false;
};

// 编辑域名
const handleEditDomain = (domain: FreeDomain) => {
    model.value.selectedDomain = domain.domain || '';
    model.value.selectedRecordType = domain.type;
    model.value.recordValue = domain.record;
    model.value.TTLValue = domain.ttl as TTLValue;
    model.value.target = domain.target;
    editDomainNameModal.value = true;
};

// 删除域名
const handleDeleteDomain = async (domain: FreeDomain, index: number) => {
    domainLoading.value[index] = true;
    await deleteDomain(domain, index);
    domainLoading.value[index] = false;
};

// 提交创建表单
const handleSubmit = async () => {
    await createDomain(model.value);
};

// 提交快速创建表单
const handleFastSubmit = async (isConfirmed = false) => {
    if (fastModel.value.selectedRecordType === 'CNAME' && !isConfirmed) {
        dialog.warning({
            title: '注意',
            content: INFO_MESSAGES.CNAME_WARNING,
            positiveText: '我真的明白了',
            onPositiveClick: () => handleFastSubmit(true),
        });
        return;
    }

    if (!selectedTunnelInfo.value) {
        message.error('请选择隧道');
        return;
    }

    await createFastDomain(fastModel.value, selectedTunnelInfo.value);
};

// 提交编辑表单
const handleEditSubmit = async () => {
    await updateDomain(model.value);
};

// 标签页切换
const handleTabChange = async (activeName: string) => {
    if (activeName === '快速解析') {
        await fetchTunnelList();
    }
};

// 同步隧道选择变化
watch(
    () => fastModel.value.selectedTunnel,
    (newValue) => {
        if (newValue) {
            handleTunnelChangeComposable(newValue);
        }
    }
);

onMounted(() => {
    fetchDomainData();
});
</script>

<style scoped>
.domain-grid {
    margin-top: 0;
}

.grid-item {
    transition: opacity 0.2s ease;
}

.grid-item:hover {
    opacity: 0.95;
}
</style>

