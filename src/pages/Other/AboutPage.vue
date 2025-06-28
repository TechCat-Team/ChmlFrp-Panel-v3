<template>
    <n-back-top :right="100" />
    <n-card class="license-card" :bordered="true">
        <div class="license-header">
            <div class="icon-and-title">
                <n-icon size="40">
                    <balance-scale />
                </n-icon>
                <div class="title">
                    <div class="repo-name">
                        <n-button
                            class="repo-name"
                            text
                            tag="a"
                            href="https://github.com/TechCat-Team/ChmlFrp-Panel-v3"
                            target="_blank"
                        >
                            TechCat-Team/ChmlFrp-Panel-v3
                        </n-button>
                        基于
                    </div>
                    <div class="license-name">Apache License 2.0</div>
                </div>
            </div>
        </div>
        <div class="license-description">
            一种宽松的许可证，其主要条件要求保留版权和许可证声明。贡献者明确授予专利权。被许可人可以根据不同条款分发作品、修改后的作品以及较大的作品，且无需提供源代码。
        </div>
        <div class="license-details">
            <div class="column">
                <div class="column-title">权限</div>
                <ul class="items">
                    <li>
                        <n-icon class="check-icon"><check-circle /></n-icon> 商业使用
                    </li>
                    <li>
                        <n-icon class="check-icon"><check-circle /></n-icon> 修改
                    </li>
                    <li>
                        <n-icon class="check-icon"><check-circle /></n-icon> 分发
                    </li>
                    <li>
                        <n-icon class="check-icon"><check-circle /></n-icon> 专利使用
                    </li>
                    <li>
                        <n-icon class="check-icon"><check-circle /></n-icon> 私人使用
                    </li>
                </ul>
            </div>
            <div class="column">
                <div class="column-title">限制</div>
                <ul class="items">
                    <li>
                        <n-icon class="cross-icon"><times-circle /></n-icon> 商标使用
                    </li>
                    <li>
                        <n-icon class="cross-icon"><times-circle /></n-icon> 责任
                    </li>
                    <li>
                        <n-icon class="cross-icon"><times-circle /></n-icon> 保证
                    </li>
                </ul>
            </div>
            <div class="column">
                <div class="column-title">条件</div>
                <ul class="items">
                    <li>
                        <n-icon class="info-icon"><info-circle /></n-icon> 许可和版权声明
                    </li>
                    <li>
                        <n-icon class="info-icon"><info-circle /></n-icon> 状态更改
                    </li>
                </ul>
            </div>
        </div>
        <n-flex style="margin-top: 12px">
            <n-skeleton v-if="loading" :width="91" round :sharp="false" size="small" />
            <n-tag v-else round type="primary"> 版本：{{ version }} </n-tag>
            <n-skeleton v-if="loading" :width="247" round :sharp="false" size="small" />
            <n-tag round type="primary" v-else> 最后构建时间：{{ buildTime }} </n-tag>
        </n-flex>
        <n-p style="opacity: 0.6"> Copyright © 2021 - {{ currentYear }} TechCat All rights reserved. </n-p>
        <n-p style="opacity: 0.6"> 此网站由 PH_CDN 提供 CDN 加速与防御支持。 </n-p>
    </n-card>
    <n-card title="开发环境依赖" style="margin-top: 15px">
        <n-skeleton v-if="loading" text :repeat="8" :sharp="false" />
        <n-descriptions v-else label-placement="left" bordered :column="screenWidth >= 900 ? 3 : 1">
            <n-descriptions-item v-for="(version, name) in devDependencies" :key="name" :label="name">
                {{ version }}
            </n-descriptions-item>
        </n-descriptions>
    </n-card>
    <n-card title="生产环境依赖" style="margin-top: 15px">
        <n-skeleton v-if="loading" text :repeat="6" :sharp="false" />
        <n-descriptions v-else label-placement="left" bordered :column="screenWidth >= 900 ? 3 : 1">
            <n-descriptions-item v-for="(version, name) in dependencies" :key="name" :label="name">
                {{ version }}
            </n-descriptions-item>
        </n-descriptions>
    </n-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { BalanceScale, CheckCircle, TimesCircle, InfoCircle } from '@vicons/fa';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';

// 加载状态，默认true
const loading = ref(true);

// 基础的手机端适配
const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

// 获取当前年份
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

// 定义响应式状态
const buildTime = ref<string>('');
const version = ref<string>('');
const dependencies = ref<{ [key: string]: string }>({});
const devDependencies = ref<{ [key: string]: string }>({});

// 在组件挂载时加载 dependencies.json 文件
onMounted(async () => {
    try {
        const response = await fetch('/dependencies.json');
        const data = await response.json();
        buildTime.value = data.buildTime;
        version.value = data.version;
        dependencies.value = data.dependencies;
        devDependencies.value = data.devDependencies;
        loading.value = false;
    } catch (error) {
        console.error('"关于面板"页面 - 未能加载基础信息：', error);
    }
});
</script>

<style scoped>
.license-card {
    padding: 20px;
}

.license-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.icon-and-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.title {
    font-size: 14px;
    color: #333;
}

.repo-name {
    font-size: 16px;
    font-weight: bold;
    color: #666;
}

.license-name {
    font-size: 20px;
    font-weight: 600;
}

.license-description {
    font-size: 14px;
    color: #555;
    line-height: 1.8;
    margin-bottom: 16px;
}

.license-details {
    display: flex;
    gap: 20px;
}

.column {
    flex: 1;
}

.column-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
}

.items {
    list-style: none;
    padding: 0;
    margin: 0;
}

.items li {
    display: flex;
    align-items: center;
    font-size: 14px;
    margin-bottom: 8px;
}

.check-icon {
    color: #4caf50;
    margin-right: 8px;
}

.cross-icon {
    color: #f44336;
    margin-right: 8px;
}

.info-icon {
    color: #2196f3;
    margin-right: 8px;
}
</style>
