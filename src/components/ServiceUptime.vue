<template>
    <n-flex justify="space-between">
        <div>
            <n-tag style="margin-right: 8px" round :bordered="false" type="warning" size="small">
                VIP
                <template #icon>
                    <n-icon :component="DiamondOutline" />
                </template>
            </n-tag>
            <span style="font-size: 16px">月球CN2-1</span>
        </div>
        <div class="container">
            <span style="font-size: 16px; color: rgb(59, 214, 113); margin-right: 18px"
                v-if="screenWidth >= 700">99.973%</span>
            <n-popover trigger="hover" v-for="n in 90" :key="n">
                <template #trigger>
                    <div class="bar"></div>
                </template>
                <span>
                    <span style="color: gray; font-size: 12px">2024-6-28</span>
                    <br />
                    100%
                </span>
            </n-popover>
            <div class="upContainer" v-if="screenWidth >= 700">
                <div class="circle"></div>
                <span class="text">Up</span>
            </div>
        </div>
        <div v-if="screenWidth <= 700">
            <n-flex justify="space-between">
                <span style="font-size: 16px; color: rgb(59, 214, 113); margin-right: 18px">99.973%</span>
                <div class="upContainer">
                    <div class="circle"></div>
                    <span class="text">Up</span>
                </div>
            </n-flex>
        </div>
    </n-flex>
</template>

<script setup lang="ts">
import { DiamondOutline } from '@vicons/ionicons5'
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

</script>

<style scoped>
.upContainer {
    display: flex;
    align-items: center;
    margin-left: 36px;
}

.circle {
    width: 15px;
    height: 15px;
    background-color: rgb(59, 214, 113);
    border-radius: 50%;
    position: relative;
}

.circle::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 15px;
    height: 15px;
    background-color: rgba(59, 214, 113, 0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ripple 2s infinite;
    opacity: 0;
}

@keyframes ripple {
    0% {
        width: 15px;
        height: 15px;
        opacity: 1;
    }

    100% {
        width: 40px;
        height: 40px;
        opacity: 0;
    }
}

.text {
    margin-left: 10px;
    color: rgb(59, 214, 113);
}

.container {
    display: flex;
    flex-direction: row;
    gap: 3px;
}

.bar {
    background-color: rgb(59, 214, 113);
    width: 4px;
    height: 15px;
    border-radius: 2px;
    transition: transform 0.3s ease, background-color 0.3s ease;
}

.bar:hover {
    transform: scale(1.2);
    background-color: rgb(34, 139, 34);
}
</style>