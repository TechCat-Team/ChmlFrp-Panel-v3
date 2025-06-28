<template>
    <n-back-top :right="100" />
    <n-grid cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item>
            <n-card size="small" title="用户">
                <template #header-extra>
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-tag round :bordered="false" type="primary"> 用户 </n-tag>
                        </template>
                    </n-tooltip>
                </template>
                <n-tag round :bordered="false" type="primary" size="small"> QwQ </n-tag>
                <template #footer>
                    总 用 户:114514
                    <br />
                    在线用户:9191
                    <br />
                    免费用户:12306
                    <br />
                    VIP 用户:-1
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card size="small" title="统计信息">
                <template #header-extra>
                    <n-tag round :bordered="false" type="primary"> 变化量 </n-tag>
                </template>
                <n-tag round :bordered="false" type="primary" size="small"> 万物皆可变化量 </n-tag>
                <template #footer>
                    昨日用户增长量:-114514
                    <br />
                    上月用户增长量:0
                    <br />
                    昨日隧道掉线数:all
                    <br />
                    上月隧道掉线量:all
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
    <div></div>
</template>

<script lang="ts" setup></script>
