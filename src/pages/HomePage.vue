<template>
    <n-flex vertical>
        <n-card>
            <n-space justify="space-between">
                <div style="display: flex; align-items: center;">
                    <n-avatar :size="72" round :style="{ display: isHidden ? 'none' : 'flex' }"
                        src="https://q.qlogo.cn/headimg_dl?dst_uin=242247494&spec=640&img_type=jpg" />
                    <div :style="textStyle">
                        <h3 style="margin: 0;">少熬夜，chaoji，愿你有一个宁静而甜美的梦境。</h3>
                        <p style="margin: 0; margin-top: 4px;">我们只能走在幻夜的路上，即使四周明亮如白昼，那也仅是假象。</p>
                    </div>
                </div>
                <n-space justify="end" style="margin-top: 15px;">
                    <n-button type="primary" strong secondary>签到</n-button>
                    <n-button strong secondary>签到信息</n-button>
                </n-space>
            </n-space>
        </n-card>
        <n-grid style="margin-top: 15px" cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <n-card>
                </n-card>
            </n-gi>
            <n-gi :span="2">
                <n-card>
                </n-card>
            </n-gi>
        </n-grid>
    </n-flex>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';

const screenStore = useScreenStore();
const { isHidden, screenWidth } = storeToRefs(screenStore);

const textStyle = computed(() => ({
    marginLeft: screenWidth.value >= 600 ? '16px' : '0',
    textAlign: 'left' as const
}));
</script>