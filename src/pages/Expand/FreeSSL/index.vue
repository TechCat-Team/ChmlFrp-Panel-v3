<template>
    <n-back-top :right="100" />
    <n-card style="margin-bottom: 20px" title="免费SSL">
        <template #header-extra>
            <n-space>
                <n-select
                    v-model:value="statusFilter"
                    :options="statusOptions"
                    style="width: 150px"
                    placeholder="筛选状态"
                    clearable
                    @update:value="handleStatusFilterChange"
                />
                <n-button round quaternary @click="fetchCertificateData" :loading="loading">
                    <template #icon>
                        <n-icon :component="RefreshOutline" />
                    </template>
                    刷新
                </n-button>
                <n-button @click="handleCreateCertificate" type="primary" round quaternary>
                    <template #icon>
                        <n-icon :component="AddOutline" />
                    </template>
                    新增证书
                </n-button>
            </n-space>
        </template>
    </n-card>
    <n-grid v-if="loading" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="190.6px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="24" :y-gap="24" responsive="screen" class="certificate-grid">
        <n-grid-item v-for="(certificate, index) in certificateData" :key="certificate.id" class="grid-item">
            <CertificateCard
                :certificate="certificate"
                :loading="certificateLoading[index]"
                :index="index"
                :verifying="verifying"
                :downloading="downloading"
                @view="handleViewCertificate"
                @verify="handleVerifyCertificate"
                @download="handleDownloadCertificate"
                @delete="handleDeleteCertificate"
            />
        </n-grid-item>
    </n-grid>
    <n-empty v-if="!loading && certificateData.length === 0" description="暂无证书" style="margin-top: 40px">
        <template #extra>
            <n-button type="primary" @click="handleCreateCertificate">申请证书</n-button>
        </template>
    </n-empty>
    <CreateCertificateModal
        :show="createCertificateModal"
        :model="certificateFormModel"
        :loading="createLoading"
        @update:show="createCertificateModal = $event"
        @update:model="certificateFormModel = $event as CertificateFormModel"
        @submit="handleSubmitCertificate"
    />
    <CertificateDetailModal
        :show="detailModal"
        :detail="certificateDetail"
        :downloading="downloading === selectedCertificateId"
        @update:show="detailModal = $event"
        @download="handleDownloadFromDetail"
    />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { RefreshOutline, AddOutline } from '@vicons/ionicons5';
import { useUserStore } from '@/stores/user';
import { useCertificateList } from './composables/useCertificateList';
import { useCertificateRequest } from './composables/useCertificateRequest';
import { useCertificateOperations } from './composables/useCertificateOperations';
import CreateCertificateModal from './components/CreateCertificateModal.vue';
import CertificateCard from './components/CertificateCard.vue';
import CertificateDetailModal from './components/CertificateDetailModal.vue';
import type { CertificateFormModel } from './types';
import { STATUS_OPTIONS } from './constants';
import type { PendingCertificateDetail, IssuedCertificateDetail } from '@/api/v2/ssl/ssl';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

// 证书列表
const { loading, certificateData, statusFilter, fetchCertificateData } = useCertificateList(userInfo || undefined);

// 证书表单
const certificateFormModel = ref<CertificateFormModel>({
    provider: null,
    domains: [''],
    challengeType: 'http01',
});

// 申请证书
const { loading: createLoading, requestCertificate } = useCertificateRequest(userInfo || undefined, () => {
    createCertificateModal.value = false;
    certificateFormModel.value = {
        provider: null,
        domains: [''],
        challengeType: 'http01',
    };
    fetchCertificateData();
});

// 证书操作
const { verifying, downloading, verifyCertificate, deleteCertificate, downloadCertificate, viewCertificateDetail } =
    useCertificateOperations(userInfo || undefined, () => {
        fetchCertificateData();
    });

// 模态框状态
const createCertificateModal = ref(false);
const detailModal = ref(false);
const certificateDetail = ref<PendingCertificateDetail | IssuedCertificateDetail | null>(null);
const selectedCertificateId = ref<number | null>(null);

// 状态筛选选项
const statusOptions = STATUS_OPTIONS;

// 无限滚动
const count = ref(16);
const handleLoad = () => {
    count.value += 1;
};

// 证书加载状态
const certificateLoading = ref<boolean[]>([]);

watch(
    certificateData,
    (newCertificateData) => {
        certificateLoading.value = newCertificateData.map(() => false);
    },
    { immediate: true }
);

// 状态筛选变化
const handleStatusFilterChange = () => {
    fetchCertificateData();
};

// 创建证书
const handleCreateCertificate = () => {
    createCertificateModal.value = true;
};

// 提交申请证书表单
const handleSubmitCertificate = async () => {
    await requestCertificate(certificateFormModel.value);
};

// 查看证书详情
const handleViewCertificate = async (certificate: any) => {
    selectedCertificateId.value = certificate.id;
    const detail = await viewCertificateDetail(certificate);
    if (detail) {
        certificateDetail.value = detail;
        detailModal.value = true;
    }
};

// 验证证书
const handleVerifyCertificate = async (certificate: any) => {
    await verifyCertificate(certificate);
};

// 下载证书
const handleDownloadCertificate = async (certificate: any) => {
    await downloadCertificate(certificate);
};

// 从详情模态框下载
const handleDownloadFromDetail = async (type: 'certificate' | 'privatekey' | 'chain' | 'full') => {
    if (selectedCertificateId.value && certificateDetail.value) {
        const certificate = certificateData.value.find((c) => c.id === selectedCertificateId.value);
        if (certificate) {
            await downloadCertificate(certificate, type);
        }
    }
};

// 删除证书
const handleDeleteCertificate = async (certificate: any, index: number) => {
    certificateLoading.value[index] = true;
    await deleteCertificate(certificate);
    certificateLoading.value[index] = false;
};

onMounted(() => {
    fetchCertificateData();
});
</script>

<style scoped>
.certificate-grid {
    margin-top: 0;
}

.grid-item {
    transition: opacity 0.2s ease;
}

.grid-item:hover {
    opacity: 0.95;
}
</style>
