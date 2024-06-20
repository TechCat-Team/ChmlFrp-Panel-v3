<template>
    <n-back-top :right="100" />
    <n-card title="ChmlFrp Panel v3">
        <template #header-extra>
            <n-button quaternary circle tag="a" href="https://github.com/TechCat-Team/ChmlFrp-Panel-v3" target="_blank">
                <template #icon>
                    <n-icon>
                        <LogoGithub />
                    </n-icon>
                </template>
            </n-button>
        </template>
        <n-p>
            ChmlFrp面板是由TechCat开发的映射管理面板，此项目采用Apache-2.0开源。
        </n-p>
        <n-flex>
            <n-tag round type="primary">
                版本：Preview
            </n-tag>
            <n-skeleton v-if="loading" :width="247" round :sharp="false" size="small" />
            <n-tag round type="primary" v-else>
                最后构建时间：{{ buildTime }}
            </n-tag>
        </n-flex>
        <n-p style="opacity: 0.6;">
            Copyright © 2021 - {{ currentYear }} TechCat All rights reserved.
        </n-p>
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
import { LogoGithub } from '@vicons/ionicons5';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';

// 加载状态，默认true
const loading = ref(true)

// 基础的手机端适配
const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

// 获取当前年份
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

// 定义响应式状态
const buildTime = ref<string>('');
const dependencies = ref<{ [key: string]: string }>({});
const devDependencies = ref<{ [key: string]: string }>({});

// 在组件挂载时加载 dependencies.json 文件
onMounted(async () => {
  try {
    const response = await fetch('/dependencies.json');
    const data = await response.json();
    buildTime.value = data.buildTime;
    dependencies.value = data.dependencies;
    devDependencies.value = data.devDependencies;
    loading.value = false;
  } catch (error) {
    console.error('"关于面板"页面 - 未能加载依赖项：', error);
  }
});
</script>
