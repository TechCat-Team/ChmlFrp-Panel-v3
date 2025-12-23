<template>
    <n-card style="margin-top: 16px" title="常见问题">
        <n-collapse style="margin-top: 20px">
            <n-collapse-item v-for="item in faqData" :key="item.name" :title="item.title" :name="item.name">
                <div v-html="item.content"></div>
            </n-collapse-item>
        </n-collapse>
    </n-card>
</template>

<script lang="ts" setup>
import { FAQ_DATA } from '../faqData';

const faqData = FAQ_DATA;
</script>
