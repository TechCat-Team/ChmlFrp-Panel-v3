<template>
    <n-back-top :right="100" />
    <n-modal v-model:show="nodeListModal">
        <n-card :style="widthStyle" title="选择节点" :bordered="false" role="dialog" aria-modal="true">
            <n-alert type="info" style="bottom: 12px"> 为确保您的体验，请尽量选择负载低，距离近的节点。 </n-alert>
            <n-flex justify="space-between" align="center">
                <n-flex>
                    <n-checkbox v-model:checked="filters.udp"> UDP </n-checkbox>
                    <n-checkbox v-model:checked="filters.noPermission"> VIP </n-checkbox>
                </n-flex>
                <n-flex>
                    <n-button-group>
                        <n-button
                            round
                            size="small"
                            :type="filters.web === 'all' ? 'primary' : 'default'"
                            @click="filterWeb('all')"
                        >
                            全部
                        </n-button>
                        <n-button
                            size="small"
                            :type="filters.web === 'yes' ? 'primary' : 'default'"
                            @click="filterWeb('yes')"
                        >
                            可建站
                        </n-button>
                        <n-button
                            round
                            size="small"
                            :type="filters.web === 'no' ? 'primary' : 'default'"
                            @click="filterWeb('no')"
                        >
                            不可建站
                        </n-button>
                    </n-button-group>
                    <n-button-group>
                        <n-button
                            round
                            size="small"
                            :type="filters.region === 'all' ? 'primary' : 'default'"
                            @click="filterRegion('all')"
                        >
                            全部
                        </n-button>
                        <n-button
                            size="small"
                            :type="filters.region === 'china' ? 'primary' : 'default'"
                            @click="filterRegion('china')"
                        >
                            境内
                        </n-button>
                        <n-button
                            round
                            size="small"
                            :type="filters.region === 'overseas' ? 'primary' : 'default'"
                            @click="filterRegion('overseas')"
                        >
                            境外
                        </n-button>
                    </n-button-group>
                </n-flex>
            </n-flex>
            <n-empty v-if="nodeCards.length === 0" description="当前没有节点在线" />
            <n-empty v-else-if="filteredNodeCards.length === 0" description="您选择的分类没有任何节点" />
            <n-grid v-else style="margin-top: 12px" cols="1 m:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
                <n-grid-item v-for="(nodeCard, index) in filteredNodeCards" :key="index">
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-card size="small" style="height: 90px" hoverable @click="handleNodeCardClick(nodeCard)">
                                <template #header>
                                    <span style="color: gray"> #{{ nodeCard.id }} </span>
                                    <n-divider vertical />
                                    {{ nodeCard.name }}
                                </template>
                                <template #header-extra v-if="nodeCard.nodegroup === 'vip'">
                                    <n-tag size="small" round type="warning"> VIP </n-tag>
                                </template>
                                <n-space>
                                    <n-tag
                                        :bordered="false"
                                        round
                                        size="small"
                                        type="success"
                                        v-if="nodeCard.web === 'yes'"
                                    >
                                        <template #icon>
                                            <n-icon :component="EarthOutline" />
                                        </template>
                                        建站
                                    </n-tag>
                                    <n-tag
                                        :bordered="false"
                                        round
                                        size="small"
                                        type="error"
                                        v-if="nodeCard.udp === 'false'"
                                    >
                                        <template #icon>
                                            <n-icon :component="BanOutline" />
                                        </template>
                                        UDP
                                    </n-tag>
                                    <n-tag
                                        :bordered="false"
                                        round
                                        size="small"
                                        type="info"
                                        v-if="nodeCard.fangyu === 'true'"
                                    >
                                        <template #icon>
                                            <n-icon :component="ShieldCheckmarkOutline" />
                                        </template>
                                        防御
                                    </n-tag>
                                </n-space>
                            </n-card>
                        </template>
                        {{ nodeCard.notes }}
                    </n-tooltip>
                </n-grid-item>
            </n-grid>
        </n-card>
    </n-modal>
    <n-modal v-model:show="nodeInfoModal">
        <n-card
            :style="widthStyle"
            size="small"
            :bordered="false"
            transform-origin="center"
            role="dialog"
            aria-modal="true"
        >
            <n-tabs type="line" size="large" :tabs-padding="20" @update:value="handleTabChange">
                <n-tab-pane name="节点详情">
                    <n-p>节点负载</n-p>
                    <n-progress
                        type="line"
                        :percentage="NodeInfo.bandwidth_usage_percent"
                        :indicator-placement="'inside'"
                    />
                    <n-p style="margin-top: 12px">节点详情</n-p>
                    <n-descriptions label-placement="left" size="medium" :column="screenWidth >= 600 ? 3 : 1" bordered>
                        <n-descriptions-item label="节点名">
                            {{ selectNode }}
                        </n-descriptions-item>
                        <n-descriptions-item label="地区">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.area }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="权限组">
                            <n-skeleton v-if="loadingTunnelInfo" width="37.09px" height="28px" round />
                            <n-tag v-else :type="NodeInfo.nodegroup === 'vip' ? 'warning' : 'info'" round>
                                {{ NodeInfo.nodegroup }}
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="防御">
                            <n-skeleton v-if="loadingTunnelInfo" width="60.65px" height="28px" round />
                            <n-tooltip v-else-if="NodeInfo.fangyu" trigger="hover">
                                <template #trigger>
                                    <n-tag round type="success"> 有防御 </n-tag>
                                </template>
                                此节点有≥5Gbps的DDOS防御
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger>
                                    <n-tag round type="error"> 没防御 </n-tag>
                                </template>
                                此节点没有防御或DDOS防御带宽小于5Gbps
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="建站">
                            <n-skeleton v-if="loadingTunnelInfo" width="46.65px" height="28px" round />
                            <n-tag v-else-if="NodeInfo.web === 'yes'" type="success" round> 允许 </n-tag>
                            <n-tag v-else type="error" round> 不允许 </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="UDP">
                            <n-skeleton v-if="loadingTunnelInfo" width="46.65px" height="28px" round />
                            <n-tag v-else-if="NodeInfo.udp" type="success" round> 允许 </n-tag>
                            <n-tag v-else type="error" round> 不允许 </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="域名过白">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-tooltip v-else-if="!NodeInfo.toowhite" trigger="hover">
                                <template #trigger> 域名无需备案过白 </template>
                                此节点为国外或中国特别行政区，也可能自动过白，域名无需手动申请过白
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger> 域名需过白 </template>
                                此节点为中国境内节点，并且无法自动过白，需要前往"扩展功能"-"域名过白"进行手动过白
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="端口限制">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.rport }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="域名">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.ip }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="IP">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.realIp }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="IPV6">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else-if="NodeInfo.ipv6 !== null">{{ NodeInfo.ipv6 }}</n-p>
                            <n-p v-else>此节点没有公网IPv6</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="带宽">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-tooltip v-else-if="NodeInfo.china === 'no'" trigger="hover">
                                <template #trigger> 国外带宽 </template>
                                此节点走ChmlFrp国外带宽，您的国外带宽上限为{{
                                    userInfo?.bandwidth ? userInfo.bandwidth * 4 : 32
                                }}m
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger> 国内带宽 </template>
                                此节点走ChmlFrp国内带宽，您的国内带宽上限为{{ userInfo?.bandwidth }}m
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="介绍">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.notes }}</n-p>
                        </n-descriptions-item>
                    </n-descriptions>
                </n-tab-pane>
                <n-tab-pane name="节点地图">
                    <n-alert type="info">
                        地图来自中国地理信息公共服务平台，"我的位置"信息通过IP获取，有较大误差。另外请不要使用代理软件，否则您可能会被定位到月球。
                    </n-alert>
                    <n-skeleton v-if="loadingNodeMap" text style="width: 100%; margin-top: 16px" height="500px" />
                    <MapComponent
                        v-else
                        style="margin-top: 16px"
                        :width="'100%'"
                        :height="'500px'"
                        :markers="markers"
                    />
                </n-tab-pane>
            </n-tabs>
            <template #footer>
                <n-flex justify="end">
                    <n-button @click="nodeInfoModal = false">取消</n-button>
                    <n-button @click="nodeDetails">上一步</n-button>
                    <n-button @click="goToTheTunnelDetails" type="primary">继续</n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
    <n-modal v-model:show="tunnelInfoModal">
        <n-card style="width: 800px" title="创建隧道" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-alert
                title="注意"
                type="info"
                style="margin-bottom: 8px"
                v-if="
                    formData.domainNameLabel === '免费域名' && (formData.type === 'HTTP' || formData.type === 'HTTPS')
                "
            >
                免费域名禁止用于中国境内节点(中国特别行政区除外)建站，如果您给国内节点解析免费域名并建站，会被备案拦截导致无法访问
            </n-alert>
            <n-alert
                title="注意"
                type="info"
                style="margin-bottom: 8px"
                v-if="
                    formData.domainNameLabel === '自定义' &&
                    (formData.type === 'HTTP' || formData.type === 'HTTPS') &&
                    NodeInfo.china !== 'no'
                "
            >
                自定义域名解析到中国境内节点(中国特别行政区除外)建站，您的域名必须在工信部备案，不备案将被拦截导致无法访问。
            </n-alert>
            <n-alert
                title="注意"
                style="margin-bottom: 32px"
                type="warning"
                v-if="formData.domainNameLabel === '自定义' && (formData.type === 'HTTP' || formData.type === 'HTTPS')"
            >
                请使用自定义域名需要将您的 {{ formData.domain }} 域名通过CNAME解析至 {{ NodeInfo.ip }} 才能正常访问。
            </n-alert>
            <n-row :gutter="15" style="margin-top: 15px">
                <n-form ref="tunnelForm" :model="formData" size="medium" label-width="100px">
                    <n-col :span="12">
                        <n-form-item label="隧道名称" path="name">
                            <n-input v-model:value="formData.name" placeholder="请输入隧道名称" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="本地IP" path="localip">
                            <n-input v-model:value="formData.localip" placeholder="请输入本地IP" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="节点选择" path="node" @click="nodeDetails">
                            <n-select v-model:value="formData.node" placeholder="请选择节点" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="端口类型" path="type">
                            <n-select
                                v-model:value="formData.type"
                                :options="typeOptions"
                                placeholder="请选择端口类型"
                                clearable
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="内网端口" path="nport">
                            <n-input v-model:value="formData.nport" clearable placeholder="请输入内网端口" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item
                            v-if="formData.type === 'HTTP' || formData.type === 'HTTPS'"
                            label="域名类型"
                            path="domainNameLabel"
                        >
                            <n-select
                                v-model:value="formData.domainNameLabel"
                                :options="domainTypeOptions"
                                placeholder="请选择域名类型"
                            />
                        </n-form-item>
                        <n-form-item v-else label="外网端口" path="dorp">
                            <n-input v-model:value="formData.dorp" clearable @update:value="updatePortTrig" />
                        </n-form-item>
                    </n-col>
                    <n-col
                        :span="24"
                        v-if="
                            formData.domainNameLabel === '自定义' &&
                            (formData.type === 'HTTP' || formData.type === 'HTTPS')
                        "
                    >
                        <n-form-item label="域名" path="dorp">
                            <n-input v-model:value="formData.domain" placeholder="请输入您的域名" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col
                        v-if="
                            formData.domainNameLabel === '免费域名' &&
                            (formData.type === 'HTTP' || formData.type === 'HTTPS')
                        "
                        :span="12"
                    >
                        <n-form-item label="请选择免费域名" path="choose">
                            <n-select v-model:value="formData.choose" :options="domainNameOptions" />
                        </n-form-item>
                    </n-col>
                    <n-col
                        v-if="
                            formData.domainNameLabel === '免费域名' &&
                            (formData.type === 'HTTP' || formData.type === 'HTTPS')
                        "
                        :span="12"
                    >
                        <n-form-item label="新建域名" path="dorp">
                            <n-input v-model:value="formData.recordValue" placeholder="请输入域名前缀">
                                <template #suffix> .{{ formData.choose }} </template>
                            </n-input>
                        </n-form-item>
                    </n-col>
                    <n-collapse style="margin-top: 10px">
                        <n-collapse-item title="高级设置">
                            <n-alert type="info" style="margin-bottom: 16px">
                                不懂请不要设置，否则可能会导致无法启动隧道
                            </n-alert>
                            <n-col :span="12">
                                <n-flex>
                                    <n-p>数据加密</n-p>
                                    <n-switch v-model:value="formData.encryption" />
                                </n-flex>
                            </n-col>
                            <n-col :span="12">
                                <n-flex>
                                    <n-p>数据压缩</n-p>
                                    <n-switch v-model:value="formData.compression" />
                                </n-flex>
                            </n-col>
                            <n-form-item label="额外参数" path="ap" style="margin-top: 8px">
                                <n-input v-model:value="formData.ap" type="textarea" />
                            </n-form-item>
                        </n-collapse-item>
                    </n-collapse>
                </n-form>
            </n-row>
            <template #footer>
                <n-flex justify="end">
                    <n-button @click="generateRandomPort">随机外网端口</n-button>
                    <n-button @click="generateRandomTunnelName">随机隧道名</n-button>
                    <n-button @click="tunnelInfoModal = false">取消</n-button>
                    <n-button @click="createATunnelUp">上一步</n-button>
                    <n-button type="primary" @click="createATunnel" :loading="loadingCreateTunnel">确定</n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
    <n-modal v-model:show="editTunnelModal">
        <n-card style="width: 800px" title="编辑隧道" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-alert
                title="注意"
                type="info"
                style="margin-bottom: 32px"
                v-if="
                    formData.domainNameLabel === '免费域名' && (formData.type === 'HTTP' || formData.type === 'HTTPS')
                "
            >
                免费域名禁止用于中国境内节点(中国特别行政区除外)建站，如果您给国内节点解析免费域名并建站，会被备案拦截导致无法访问。此外，更改节点后免费域名解析会自动更改。
            </n-alert>
            <n-alert
                title="注意"
                type="info"
                style="margin-bottom: 32px"
                v-if="formData.domainNameLabel === '自定义' && (formData.type === 'HTTP' || formData.type === 'HTTPS')"
            >
                自定义域名解析到中国境内节点(中国特别行政区除外)建站，您的域名必须在工信部备案，不备案将被拦截导致无法访问。
            </n-alert>
            <n-alert
                title="注意"
                style="margin-bottom: 32px"
                type="warning"
                v-if="formData.domainNameLabel === '自定义' && (formData.type === 'HTTP' || formData.type === 'HTTPS')"
            >
                请使用自定义域名需要将您的 {{ formData.domain }} 域名通过CNAME解析至 {{ NodeInfo.ip }} 才能正常访问。
            </n-alert>
            <n-row :gutter="15" style="margin-top: 15px">
                <n-form ref="tunnelForm" :model="formData" size="medium" label-width="100px">
                    <n-col :span="12">
                        <n-form-item label="隧道名称" path="name">
                            <n-input v-model:value="formData.name" placeholder="请输入隧道名称" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="本地IP" path="localip">
                            <n-input v-model:value="formData.localip" placeholder="请输入本地IP" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="节点选择" path="node">
                            <n-select
                                v-model:value="formData.node"
                                :options="updateNodeOptions"
                                placeholder="请选择节点"
                                @update:value="updateNodeTrig"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item
                            v-if="formData.type === 'TCP' || formData.type === 'UDP'"
                            label="端口类型"
                            path="type"
                        >
                            <n-select
                                v-model:value="formData.type"
                                :options="typeOptionsTCPUDP"
                                placeholder="请选择端口类型"
                                clearable
                                @update:value="updateTypeTrig"
                            />
                        </n-form-item>
                        <n-form-item v-else label="端口类型" path="type">
                            <n-select
                                v-model:value="formData.type"
                                :options="typeOptionsHTTPHTTPS"
                                placeholder="请选择端口类型"
                                clearable
                                @update:value="updateTypeTrig"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="内网端口" path="nport">
                            <n-input v-model:value="formData.nport" clearable placeholder="请输入内网端口" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item
                            v-if="formData.type === 'HTTP' || formData.type === 'HTTPS'"
                            label="域名类型"
                            path="domainNameLabel"
                        >
                            <n-select
                                disabled
                                v-model:value="formData.domainNameLabel"
                                :options="domainTypeOptions"
                                placeholder="请选择域名类型"
                            />
                        </n-form-item>
                        <n-form-item v-else label="外网端口" path="dorp">
                            <n-input v-model:value="formData.dorp" clearable @update:value="updatePortTrig" />
                        </n-form-item>
                    </n-col>
                    <n-col
                        :span="24"
                        v-if="
                            formData.domainNameLabel === '自定义' &&
                            (formData.type === 'HTTP' || formData.type === 'HTTPS')
                        "
                    >
                        <n-form-item label="域名" path="dorp">
                            <n-input v-model:value="formData.domain" placeholder="请输入您的域名" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col
                        v-if="
                            formData.domainNameLabel === '免费域名' &&
                            (formData.type === 'HTTP' || formData.type === 'HTTPS')
                        "
                        :span="12"
                    >
                        <n-form-item label="免费域名选择" path="choose">
                            <n-select v-model:value="formData.choose" :options="domainNameOptions" />
                        </n-form-item>
                    </n-col>
                    <n-col
                        v-if="
                            formData.domainNameLabel === '免费域名' &&
                            (formData.type === 'HTTP' || formData.type === 'HTTPS')
                        "
                        :span="12"
                    >
                        <n-form-item label="域名前缀" path="dorp">
                            <n-input v-model:value="formData.recordValue" placeholder="请输入域名前缀">
                                <template #suffix> .{{ formData.choose }} </template>
                            </n-input>
                        </n-form-item>
                    </n-col>
                    <n-collapse style="margin-top: 10px">
                        <n-collapse-item title="高级设置">
                            <n-alert type="info" style="margin-bottom: 16px">
                                不懂请不要设置，否则可能会导致无法启动隧道
                            </n-alert>
                            <n-col :span="12">
                                <n-flex>
                                    <n-p>数据加密</n-p>
                                    <n-switch v-model:value="formData.encryption" />
                                </n-flex>
                            </n-col>
                            <n-col :span="12">
                                <n-flex>
                                    <n-p>数据压缩</n-p>
                                    <n-switch v-model:value="formData.compression" />
                                </n-flex>
                            </n-col>
                            <n-form-item label="额外参数" path="ap" style="margin-top: 8px">
                                <n-input v-model:value="formData.ap" type="textarea" />
                            </n-form-item>
                        </n-collapse-item>
                    </n-collapse>
                </n-form>
            </n-row>
            <template #footer>
                <n-flex justify="end">
                    <n-button v-if="formData.type === 'TCP' || formData.type === 'UDP'" @click="generateRandomPort"
                        >随机外网端口</n-button
                    >
                    <n-button @click="generateRandomTunnelName">随机隧道名</n-button>
                    <n-button @click="editTunnelModal = false">取消</n-button>
                    <n-button type="primary" @click="determineTheChangeOfTheTunnel" :loading="loadingEditTunnel"
                        >确定</n-button
                    >
                </n-flex>
            </template>
        </n-card>
    </n-modal>
    <n-card style="margin-bottom: 20px" title="隧道列表">
        <template #header-extra>
            <n-button round quaternary :loading="loadingTunnel" @click="fetchTunnelCards">
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button
                @click="createNodes"
                :loading="addTheTunnelButtonShow"
                type="primary"
                round
                quaternary
                :disabled="addTheTunnelButtonShow"
            >
                <template #icon>
                    <n-icon v-if="!addTheTunnelButtonShow" :component="AddOutline" />
                </template>
                添加隧道
            </n-button>
        </template>
    </n-card>
    <n-grid v-if="!loadingTunnel" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="(card, index) in tunnelCards" :key="index">
            <n-card size="small">
                <template #header>
                    {{ card.name }}
                    <span style="color: gray; font-size: 14px">{{ card.id }}</span>
                </template>
                <template #header-extra>
                    <n-tag round :bordered="false" :type="card.status?.type">
                        {{ card.status?.label }}
                    </n-tag>
                </template>
                <n-thing content-style="margin-top: 10px;">
                    <template #description>
                        <n-space size="small" style="margin-top: 4px">
                            <n-tag
                                round
                                v-for="(tag, tagIndex) in card.tags"
                                :key="tagIndex"
                                :bordered="false"
                                type="primary"
                                size="small"
                            >
                                {{ tag }}
                            </n-tag>
                        </n-space>
                    </template>
                    <a
                        v-if="card.type === 'tcp' || card.type === 'udp'"
                        @click="copyToClipboard(card.ip + ':' + card.dorp)"
                        style="cursor: pointer; color: inherit"
                    >
                        连接地址：{{ card.ip }}:{{ card.dorp }}
                    </a>
                    <a v-else @click="copyToClipboard(card.dorp)" style="cursor: pointer; color: inherit">
                        连接地址：{{ card.dorp }}
                    </a>
                    <br />
                    <span v-if="card.uptime" style="color: gray; font-size: 10px">
                        {{ card.uptime }}
                    </span>
                    <span v-else style="color: gray; font-size: 10px"> 尚未启动过此隧道 </span>
                </n-thing>
                <!-- <template #footer>
                    <n-row class="center-content">
                        <n-col :span="8">
                            <div>
                                <n-icon :component="ArrowUpOutline" />
                                <n-number-animation show-separator :from="0"
                                    :to="formatBytes(card.today_traffic_in).value" />
                                {{ formatBytes(card.today_traffic_in).suffix }}
                            </div>
                        </n-col>
                        <n-col :span="8">
                            <div>
                                <n-icon :component="ArrowDownOutline" />
                                <n-number-animation show-separator :from="0"
                                    :to="formatBytes(card.today_traffic_out).value" />
                                {{ formatBytes(card.today_traffic_out).suffix }}
                            </div>
                        </n-col>
                        <n-col :span="8">
                            连接数
                            <n-number-animation show-separator :from="0" :to="card.cur_conns" />
                        </n-col>
                    </n-row>
                </template> -->
                <template #action>
                    <n-flex justify="end">
                        <n-button round quaternary type="primary" @click="editTunnel(card)">
                            <template #icon>
                                <n-icon :component="CreateOutline" />
                            </template>
                            编辑
                        </n-button>
                        <!-- <n-button @click="goToTunnelInfo" round quaternary type="primary">
                            <template #icon>
                                <n-icon :component="EyeOutline" />
                            </template>
                查看
            </n-button> -->
                        <n-button
                            :disabled="!deletetTunnelSuccess"
                            round
                            quaternary
                            type="error"
                            @click="handleConfirm(card.name, card.id, card.type, card.dorp)"
                        >
                            <template #icon>
                                <n-icon :component="TrashOutline" />
                            </template>
                            删除
                        </n-button>
                    </n-flex>
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="240.2px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-card v-if="tunnelCards === null">
        <n-empty description="您似乎还没创建隧道">
            <template #extra>
                <n-button
                    size="small"
                    :loading="addTheTunnelButtonShow"
                    @click="createNodes"
                    :disabled="addTheTunnelButtonShow"
                >
                    <template #icon>
                        <n-icon v-if="!addTheTunnelButtonShow" :component="AddOutline" />
                    </template>
                    创建隧道
                </n-button>
            </template>
        </n-empty>
    </n-card>
</template>

<script setup lang="ts">
import {
    RefreshOutline,
    AddOutline,
    TrashOutline,
    CreateOutline,
    BanOutline,
    EarthOutline,
    ShieldCheckmarkOutline,
} from '@vicons/ionicons5';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
// import { useRouter } from 'vue-router';
import axios from 'axios';
// 获取登录信息
import { useUserStore } from '@/stores/user';

import api from '@/api';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

// const router = useRouter();
// const goToTunnelInfo = () => {
//     const url = router.resolve({ path: '/tunnel/info' }).href;
//     window.open(url, '_blank');
// }

const message = useMessage();
const dialog = useDialog();

const nodeListModal = ref(false); // 节点列表模态框
const nodeInfoModal = ref(false); // 节点信息模态框
const tunnelInfoModal = ref(false); // 隧道信息模态框
const editTunnelModal = ref(false); // 编辑隧道模态框
const loadingTunnel = ref(true); // 用户隧道加载
const deletetButtonLoading = ref(false);
const loadingTunnelInfo = ref(false);
const loadingNodeMap = ref(false);
const loadingCreateTunnel = ref(false);
const loadingEditTunnel = ref(false);
const addTheTunnelButtonShow = ref(false);

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

const selectNode = ref(''); // 选中节点名

// 根据屏幕宽度决定对话框大小
const widthStyle = computed(() => ({
    width: screenWidth.value >= 600 ? '70%' : '100%',
}));

// 无限滚动
const count = ref(16);
const handleLoad = () => {
    count.value += 1;
};

// 编辑隧道操作
const editTunnel = (card: TunnelCard) => {
    formData.remarks = '';
    formData.ap = card.ap;
    formData.name = card.name;
    formData.localip = card.localip;
    formData.node = card.node;
    formData.nport = card.nport;
    formData.type = card.type.toUpperCase(); // 转换为大写
    formData.tunnelid = card.id;

    // 判断 card.dorp 是否为数字类型的字符串
    if (!isNaN(Number(card.dorp))) {
        // 如果是数字字符串，转换为数字并赋值给 formData.dorp
        formData.dorp = Number(card.dorp);
    } else {
        // 否则将其赋值给 formData.domainNameLabel
        formData.domain = card.dorp;
    }

    // 强行转换 card.encryption 和 card.compression 为布尔值
    formData.encryption = card.encryption === 'true';
    formData.compression = card.compression === 'true';

    if (card.type === 'http' || card.type === 'https') {
        // 调用API获取用户的免费二级域名
        api.v2.domain
            .getUserFreeSubdomains(userInfo?.usertoken as string)
            .then((data) => {
                const domainRecord = data.data.find(
                    (item: { record: string; domain: string }) => item.record + '.' + item.domain === card.dorp
                );

                if (domainRecord) {
                    // 检查remarks中是否包含"网站"
                    if (!domainRecord.remarks.includes('网站')) {
                        formData.domainNameLabel = '自定义';
                    } else {
                        formData.choose = domainRecord.domain;
                        formData.recordValue = domainRecord.record;
                        formData.remarks = domainRecord.remarks;

                        // 保留修改前记录以便比对删除
                        formData.chooseOld = domainRecord.domain;
                        formData.recordValueOld = domainRecord.record;
                        formData.nameOld = card.name;
                        formData.nodeOld = card.node;

                        formData.domainNameLabel = '免费域名';

                        // 获取可选的免费域名列表
                        subDomainData();
                    }
                } else {
                    // 如果没有找到匹配的记录
                    formData.domainNameLabel = '自定义';
                }
            })
            .catch((error) => {
                // 处理API调用错误
                message.error('获取域名信息失败: ' + (error as Error).message);
                formData.domainNameLabel = '自定义'; // 出现错误时设置为自定义
            });
    }

    // 获取可选节点信息
    updateFetchNodeOptions();

    // 获取选择的节点详情
    apiGetNodeInfo(formData.node)
        .then((res) => {
            if (res) {
                NodeInfo.value = {
                    ...res,
                    udp: res.udp === 'true',
                    fangyu: res.fangyu === 'true',
                    ipv6: res.ipv6 || '',
                };
                return res;
            } else {
                message.error('获取节点详情失败, 节点可能离线, 请稍后再试');
                return null;
            }
        })
        .catch((error) => {
            console.error('获取节点详情失败', error);
            message.error('获取节点详情失败', error);
            return null;
        });

    editTunnelModal.value = true;
};

// 修改隧道apiv1
const apiChangeTunnelV1 = async () => {
    try {
        const response = await axios.post(
            'https://cf-v1.uapis.cn/api/cztunnel.php',
            {
                usertoken: userInfo?.usertoken,
                userid: userInfo?.id,
                type: formData.type.toLowerCase(),
                node: formData.node,
                name: formData.name,
                ap: formData.ap,
                // TCP或UDP隧道提交dorp为外网端口，HTTP或HTTPS隧道dorp为域名
                dorp:
                    formData.type.toLowerCase() === 'tcp' || formData.type.toLowerCase() === 'udp'
                        ? formData.dorp
                        : formData.domain,
                localip: formData.localip,
                nport: formData.nport,
                tunnelid: formData.tunnelid,
                encryption: formData.encryption.toString(),
                compression: formData.compression.toString(),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const data = response.data;
        if (response.status === 200 && data.code === 200) {
            message.success('隧道编辑成功');
            return data;
        } else {
            message.error('隧道编辑失败: ' + data.error);
        }
    } catch (error) {
        message.error('隧道编辑API请求失败:' + error);
    }
    return null;
};

// 修改隧道apiv2
const apiChangeTunnelV2 = async () => {
    try {
        const data = await api.v2.tunnel.updateTunnel({
            tunnelid: formData.tunnelid,
            token: userInfo?.usertoken || '',
            tunnelname: formData.name,
            node: formData.node,
            localip: formData.localip,
            porttype: formData.type.toLowerCase(),
            localport: formData.nport,
            // 根据类型设置 banddomain 或 remoteport
            ...(formData.type.toUpperCase() === 'HTTP' || formData.type.toUpperCase() === 'HTTPS'
                ? { banddomain: formData.domain }
                : { remoteport: formData.dorp }),
            encryption: formData.encryption,
            compression: formData.compression,
            extraparams: formData.ap,
        });

        message.success('隧道编辑成功');
        return data;
    } catch (error) {
        message.error('隧道编辑失败: ' + (error as Error).message);
    }
    return null;
};

// 创建免费域名
const apiCreateFreeDomain = async (domain: string, record: string, target: string, remarks: string, flag = true) => {
    try {
        const data = await api.v2.domain.createFreeSubdomain({
            token: userInfo?.usertoken || '',
            domain: domain,
            record: record,
            type: 'CNAME',
            target: target,
            ttl: '10分钟',
            remarks: remarks,
        });

        flag && message.success('免费域名创建成功');
        return data;
    } catch (error) {
        message.error('免费域名创建失败: ' + (error as Error).message);
    }
    return null;
};

// 删除免费域名
const apiDeleteFreeDomain = async (domain: string, record: string, flag = true) => {
    try {
        const data = await api.v2.domain.deleteFreeSubdomain({
            token: userInfo?.usertoken || '',
            domain: domain,
            record: record,
        });

        flag && message.success('免费域名删除成功');
        return data;
    } catch (error) {
        message.error('免费域名删除失败: ' + (error as Error).message);
    }
    return null;
};

// 获取免费节点详情
const apiGetFreeNodeInfo = async () => {
    try {
        const data = await api.v2.domain.getUserFreeSubdomains(userInfo?.usertoken || '');
        return data.data;
    } catch (error) {
        message.error('节点详情获取失败: ' + (error as Error).message);
    }
    return null;
};

// 修改免费域名
const apiUpdateFreeDomain = async (
    domainOld: string,
    recordOld: string,
    domain: string,
    record: string,
    target: string,
    remarks: string,
    flag = true
) => {
    try {
        // 获取旧解析参数
        let freeDomainOld = await apiGetFreeNodeInfo();
        if (freeDomainOld === null) {
            return null;
        }

        const targetOld = freeDomainOld.find(
            (item: { record: string; domain: string }) => item.record === recordOld && item.domain === domainOld
        )?.target;
        if (!targetOld) {
            return null;
        }
        const remarksOld = freeDomainOld.find(
            (item: { record: string; domain: string }) => item.record === recordOld && item.domain === domainOld
        )?.remarks;
        if (!remarksOld) {
            return null;
        }

        // 删除原纪录
        const deleteResponse = await apiDeleteFreeDomain(domainOld, recordOld, false);
        if (deleteResponse === null) {
            return null;
        }

        // 创建新纪录
        const createResponse = await apiCreateFreeDomain(domain, record, target, remarks, false);
        if (createResponse === null) {
            // 回溯删除原纪录
            const rollbackResponse = await apiCreateFreeDomain(domainOld, recordOld, targetOld, remarksOld, false);
            if (rollbackResponse === null) {
                message.error('免费域名修改失败，回溯失败，请前往免费域名管理页面删除错误域名');
            } else {
                message.error('免费域名修改失败，回溯成功');
            }
            return null;
        }

        flag && message.success('免费域名修改成功');
        return createResponse;
    } catch (error) {
        message.error('免费域名修改API请求失败:' + error);
    }
    return null;
};

// 获取节点列表
const apiGetNodeList = async () => {
    try {
        const data = await api.v2.node.getNodeList();
        return data.data;
    } catch (error) {
        message.error('节点列表获取失败: ' + (error as Error).message);
    }
    return null;
};

// 获取节点详情
const apiGetNodeInfo = async (node: string) => {
    try {
        const data = await api.v2.node.getNodeInfo(userInfo?.usertoken || '', node);
        return data.data;
    } catch (error) {
        message.error('节点详情获取失败: ' + (error as Error).message);
    }
    return null;
};

const determineTheChangeOfTheTunnel = async () => {
    // loading提示
    loadingEditTunnel.value = true;

    // 检查合规性
    if (formData.nport < 1 || formData.nport > 65535) {
        message.error('内网端口必须在 1 到 65535 之间');
        loadingEditTunnel.value = false;
        return null;
    }

    // HTTP 或 HTTPS 隧道
    if (formData.type === 'HTTP' || formData.type === 'HTTPS') {
        // 免费域名
        if (formData.domainNameLabel === '免费域名') {
            const freeDomainChanged =
                formData.choose !== formData.chooseOld ||
                formData.recordValue !== formData.recordValueOld ||
                formData.node !== formData.nodeOld ||
                formData.name !== formData.nameOld;
            // 仅在发生变动时提交域名更改
            if (freeDomainChanged) {
                // 更新隧道绑定域名
                formData.domain = formData.recordValue + '.' + formData.choose;
                // 获取节点对应的域名 (target)
                let nodeInfo = await apiGetNodeInfo(formData.node);
                if (nodeInfo === null) {
                    loadingEditTunnel.value = false;
                    return null;
                }
                // 更新免费域名记录
                let err = await apiUpdateFreeDomain(
                    formData.chooseOld,
                    formData.recordValueOld,
                    formData.choose,
                    formData.recordValue,
                    nodeInfo.ip,
                    '解析 网站 到 ' + formData.name + ' - ' + formData.node,
                    true
                );
                if (err === null) {
                    message.error('免费域名修改失败');
                    loadingEditTunnel.value = false;
                    return null;
                }
            }
            // 修改隧道
            try {
                // apiv2似乎存在问题，返回“指定的端口不在允许的范围内”
                // let err = await apiChangeTunnelV2()
                let err = await apiChangeTunnelV1();

                if (err === null) {
                    // 回溯免费域名更改
                    // 获取旧节点对应的域名 (target)
                    let nodeInfoOld = await apiGetNodeInfo(formData.nodeOld);
                    if (nodeInfoOld === null) {
                        // 回溯失败，让用户自行处理
                        message.error('修改失败，回溯失败，请前往免费域名管理页面删除错误域名');
                        loadingEditTunnel.value = false;
                        return null;
                    }
                    let err = await apiUpdateFreeDomain(
                        formData.choose,
                        formData.recordValue,
                        formData.chooseOld,
                        formData.recordValueOld,
                        nodeInfoOld.ip,
                        '解析 网站 到 ' + formData.nameOld + ' - ' + formData.nodeOld,
                        false
                    );
                    if (err === null) {
                        // 回溯失败，让用户自行处理
                        message.error('修改失败，回溯失败，请前往免费域名管理页面删除错误域名');
                        loadingEditTunnel.value = false;
                        return null;
                    }
                    message.error('修改失败，回溯成功');
                    loadingEditTunnel.value = false;
                    return null;
                }

                editTunnelModal.value = false;

                // 如果免费域名被修改，需要提示用户生效存在延迟
                if (freeDomainChanged) {
                    dialog.success({
                        title: '成功',
                        content:
                            '隧道修改成功！此隧道使用的免费域名已同步更新解析，但是域名解析通常不会立即生效，需要等待DNS缓存更新，这个时间一般10分钟，慢的则需要48小时。请耐心等待，期间域名可能无法访问。',
                        positiveText: '我知道了',
                    });
                }

                fetchTunnelCards();
            } catch (error) {
                message.error('隧道编辑API调用失败:' + error);
            }
        }
        // 自定义域名
        else {
            try {
                // apiv2似乎存在问题，返回“指定的端口不在允许的范围内”
                // let err = await apiChangeTunnelV2()
                let err = await apiChangeTunnelV1();
                err === null ? null : ((editTunnelModal.value = false), fetchTunnelCards());
            } catch (error) {
                message.error('隧道编辑API调用失败:' + error);
            }
        }
    }
    // TCP 或 UDP 隧道
    else {
        try {
            let err = await apiChangeTunnelV2();
            err === null ? null : ((editTunnelModal.value = false), fetchTunnelCards());
        } catch (error) {
            message.error('隧道编辑API调用失败:' + error);
        }
    }
    loadingEditTunnel.value = false;
    return null;
};

interface Domain {
    id: number;
    domain: string;
    remarks: string | null;
    icpFiling: boolean;
}

// 存储修改时可被选择的节点列表
const updateNodeOptions = ref<{ label: string; value: string }[]>([]);

// 获取并对应充填修改时可选择的节点列表
const updateFetchNodeOptions = async () => {
    let nodeList = await apiGetNodeList();
    if (nodeList === null) {
        return null;
    }

    // 筛选节点
    const filteredNodeList = nodeList.filter((node: { web: string; udp: string; nodegroup: string }) => {
        const show =
            (formData.type === 'HTTP' || formData.type === 'HTTPS' ? node.web === 'yes' : true) &&
            (formData.type === 'UDP' ? node.udp === 'true' : true) &&
            (userInfo?.usergroup === '免费用户' ? node.nodegroup === 'user' : true);

        return show;
    });

    updateNodeOptions.value = filteredNodeList.map((node: { name: string }) => ({
        label: node.name,
        value: node.name,
    }));

    // 如果当前选中的节点不在可选列表中，则清空选中值
    if (!updateNodeOptions.value.some((option: { value: string }) => option.value === formData.node)) {
        formData.node = '';
    }
    return null;
};

// 在编辑隧道类型更新时，重新列出对应的可用节点列表
const updateTypeTrig = async () => {
    updateFetchNodeOptions();
};

// 在更改节点后，获取节点详情，确认端口等配置是否合适
const updateNodeTrig = async () => {
    const nodeDetails = await apiGetNodeInfo(formData.node);
    if (nodeDetails) {
        NodeInfo.value = {
            ...nodeDetails!,
            udp: nodeDetails!.udp === 'true',
            fangyu: nodeDetails!.fangyu === 'true',
            ipv6: nodeDetails!.ipv6 || '',
        };
    } else {
        message.error('获取节点详情失败, 节点可能离线, 请更换节点');
        return null;
    }

    // 检查现在的填写值是否合规
    updatePortTrig();

    return null;
};

// 填写端口检查
const updatePortTrig = () => {
    if (formData.type === 'TCP' || formData.type === 'UDP') {
        const minPort = parseInt(NodeInfo.value.rport.split('-')[0]) || 10000;
        const maxPort = parseInt(NodeInfo.value.rport.split('-')[1]) || 65535;
        if (formData.dorp < minPort || formData.dorp > maxPort) {
            message.destroyAll();
            message.error(`外网端口必须在 ${minPort} 到 ${maxPort} 之间`);
        } else {
            message.destroyAll();
            message.success(`外网端口合规`);
        }
    }
};

// 用于存储域名选项的数据
const domainNameOptions = ref<{ label: string; value: string }[]>([]);

// 从 API 获取域名数据并将其格式化为 n-select 的选项格式
const subDomainData = async () => {
    try {
        const domains = (await api.v2.domain.listAvailableDomains()).data;

        domainNameOptions.value = domains.map((domain: Domain) => ({
            label: domain.domain, // 显示的域名名称
            value: domain.domain, // 选项的值
        }));
    } catch (error) {
        message.error('获取域名数据失败: ' + (error as Error).message);
    }
};

const formData = reactive({
    name: '',
    localip: '127.0.0.1',
    node: '',
    type: 'TCP',
    nport: 0,
    domainNameLabel: '',
    dorp: 25565,
    choose: '',
    encryption: false,
    compression: false,
    ap: '',
    domain: '',
    recordValue: '',
    remarks: '',
    tunnelid: 0,
    chooseOld: '',
    recordValueOld: '',
    nodeOld: '',
    nameOld: '',
});

const typeOptions = ['TCP', 'UDP', 'HTTP', 'HTTPS'].map((v) => ({
    label: v,
    value: v,
}));

const typeOptionsTCPUDP = [
    {
        label: 'TCP',
        value: 'TCP',
    },
    {
        label: 'UDP',
        value: 'UDP',
    },
    {
        label: 'HTTP',
        value: 'HTTP',
        disabled: true,
    },
    {
        label: 'HTTPS',
        value: 'HTTPS',
        disabled: true,
    },
];

const typeOptionsHTTPHTTPS = [
    {
        label: 'TCP',
        value: 'TCP',
        disabled: true,
    },
    {
        label: 'UDP',
        value: 'UDP',
        disabled: true,
    },
    {
        label: 'HTTP',
        value: 'HTTP',
    },
    {
        label: 'HTTPS',
        value: 'HTTPS',
    },
];

const domainTypeOptions = ['自定义', '免费域名'].map((v) => ({
    label: v,
    value: v,
}));

// 随机生成外网端口
const generateRandomPort = () => {
    const minPort = parseInt(NodeInfo.value.rport.split('-')[0]) || 10000;
    const maxPort = parseInt(NodeInfo.value.rport.split('-')[1]) || 65535;
    formData.dorp = Math.floor(Math.random() * (maxPort - minPort + 1)) + Number(minPort);
};

// 随机生成一个8位的随机隧道名
const generateRandomTunnelName = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomName = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomName += chars[randomIndex];
    }
    formData.name = randomName;
};

const createATunnel = async () => {
    loadingCreateTunnel.value = true;

    try {
        // 检查合规性
        if (formData.nport < 1 || formData.nport > 65535) {
            message.error('内网端口必须在 1 到 65535 之间');
            return null;
        }

        // 生成 banddomain（仅当使用免费域名时用）
        const isHttp = formData.type === 'HTTP' || formData.type === 'HTTPS';
        const isFreeDomain = formData.domainNameLabel === '免费域名';
        const banddomain = isFreeDomain && isHttp ? `${formData.recordValue}.${formData.choose}` : formData.domain;

        // 构建隧道请求体
        const tunnelPayload = {
            token: userInfo?.usertoken || '',
            tunnelname: formData.name,
            node: formData.node,
            localip: formData.localip,
            porttype: formData.type,
            localport: formData.nport,
            encryption: formData.encryption,
            compression: formData.compression,
            extraparams: formData.ap,
            banddomain: isHttp ? banddomain : undefined,
            remoteport: isHttp ? undefined : formData.dorp,
        };

        // 创建隧道
        try {
            await api.v2.tunnel.createTunnel(tunnelPayload);
        } catch (error) {
            message.error('隧道创建失败: ' + (error as Error).message);
            return null;
        }

        // 成功后才创建免费域名（如果需要）
        if (isHttp && isFreeDomain) {
            try {
                await api.v2.domain.createFreeSubdomain({
                    token: userInfo?.usertoken || '',
                    domain: formData.choose,
                    record: formData.recordValue,
                    type: 'CNAME',
                    ttl: '10分钟',
                    target: NodeInfo.value.ip,
                    remarks: `解析 网站 到 ${formData.name} - ${formData.node}`,
                });
            } catch (error) {
                message.error('创建免费域名失败: ' + (error as Error).message);
                return null;
            }

            tunnelInfoModal.value = false;
            dialog.success({
                title: '成功',
                content:
                    '隧道创建成功！但是您使用了ChmlFrp提供的免费域名，域名解析通常不会立即生效，一般10分钟左右生效，最长需48小时。',
                positiveText: '我知道了',
                onPositiveClick: () => {
                    message.success('隧道创建成功！');
                    fetchTunnelCards();
                },
            });
        } else {
            tunnelInfoModal.value = false;
            message.success('隧道创建成功！');
            fetchTunnelCards();
        }
    } finally {
        loadingCreateTunnel.value = false;
    }
    return null;
};

const deletetTunnelSuccess = ref(true);
const handleConfirm = (title: string, id: number, ttype: string, dorp: string) => {
    dialog.warning({
        title: '警告',
        content: '您正在删除隧道：' + title + '(' + id + ')，请确认是否删除。',
        positiveText: '确定',
        negativeText: '取消',
        loading: deletetButtonLoading.value,
        onPositiveClick: async () => {
            deletetTunnelSuccess.value = false;
            deletetButtonLoading.value = true;
            deletetTunnel(title, id, ttype, dorp);
            deletetButtonLoading.value = false;
            if (tunnelCards.value !== null) {
                const index = tunnelCards.value.findIndex((tunnel) => tunnel.name === title);
                if (index !== -1) {
                    tunnelCards.value.splice(index, 1);
                } else {
                    console.warn('未找到 title 为 ' + title + ' 的数据');
                }
            }
        },
    });
};
const deletetTunnel = async (title: string, id: number, ttype: string, dorp: string) => {
    try {
        const response = await axios.get(
            `https://cf-v1.uapis.cn/api/deletetl.php?token=${userInfo?.usertoken}&nodeid=${id}&userid=${userInfo?.id}`
        );
        if (response.data.code === 200) {
            message.success('成功删除隧道：' + title);
            if (ttype === 'http' || ttype === 'https') {
                // 调用API获取用户的免费二级域名
                api.v2.domain
                    .getUserFreeSubdomains(userInfo?.usertoken || '')
                    .then((data) => {
                        const domainRecord = data.data.find(
                            (item: { record: string; domain: string }) => item.record + '.' + item.domain === dorp
                        );
                        if (domainRecord) {
                            // 检查remarks中是否包含"网站"
                            if (domainRecord.remarks.includes('网站')) {
                                dialog.warning({
                                    title: '警告',
                                    content:
                                        '隧道删除成功！但是此隧道绑定了免费域名，请问是否同步删除此隧道的域名解析。',
                                    positiveText: '删除',
                                    negativeText: '不删除',
                                    loading: deletetButtonLoading.value,
                                    onPositiveClick: async () => {
                                        try {
                                            await api.v2.domain.deleteFreeSubdomain({
                                                token: userInfo?.usertoken || '',
                                                domain: domainRecord.domain,
                                                record: domainRecord.record,
                                            });

                                            message.success('免费域名同步删除成功');
                                        } catch (error) {
                                            message.error('免费域名失败: ' + (error as Error).message);
                                        }
                                    },
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        // 处理API调用错误
                        console.error('获取域名信息失败', error);
                        message.error('获取域名信息失败: ' + (error as Error).message);
                        formData.domainNameLabel = '自定义'; // 出现错误时设置为自定义
                    });
            }
        } else {
            message.error(response.data.error);
            fetchTunnelCards();
        }
    } catch (error) {
        console.error('删除隧道API调用失败', error);
        message.error('删除隧道API调用失败' + error);
    }
    deletetTunnelSuccess.value = true;
};

onMounted(() => {
    fetchTunnelCards();
});

// 流量单位换算
// function formatBytes(bytes: string | number): { value: number; suffix: string } {
//     let num: number;
//     if (typeof bytes === 'string') {
//         num = parseFloat(bytes);
//     } else {
//         num = bytes;
//     }
//     const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
//     if (num === 0) return { value: 0, suffix: 'Bytes' };
//     let index = 0;
//     while (num >= 1024 && index < units.length - 1) {
//         num /= 1024;
//         index++;
//     }
//     return { value: parseFloat(num.toFixed(2)), suffix: units[index] };
// }

interface NodeCard {
    id: number;
    name: string;
    nodegroup: string;
    web: string;
    china: string;
    fangyu: string;
    udp: string;
    area: string;
    notes: string;
}

const nodeCards = ref<NodeCard[]>([]);

const createNodes = async () => {
    addTheTunnelButtonShow.value = true; // 新建隧道按钮加载
    // 加载节点列表
    try {
        const response = await api.v2.node.getNodeList();
        nodeCards.value = response.data.map((node: NodeCard) => ({
            id: node.id, // 节点ID
            name: node.name, // 节点名
            nodegroup: node.nodegroup, // 权限组
            web: node.web, // 是否允许建站
            china: node.china, // 是否为境内带宽
            fangyu: node.fangyu, // 防御
            udp: node.udp, // 是否允许UDP
            area: node.area, // 地区
            notes: node.notes,
        }));
        nodeListModal.value = true; // 显示节点列表模态框
    } catch (error) {
        console.error('[隧道列表]从api获取节点列表数据失败', error);
        message.error('获取节点列表数据失败: ' + (error as Error).message);
    }
    addTheTunnelButtonShow.value = false; // 新建隧道按钮取消加载
};

// 从本地存储中恢复过滤器状态
const storedFilters = localStorage.getItem('nodeFilters');
// 默认分类
const filters = ref(
    storedFilters
        ? JSON.parse(storedFilters)
        : {
              udp: false,
              noPermission: true,
              web: 'all',
              region: 'all',
          }
);

const filterWeb = (web: string) => {
    filters.value.web = web;
};

const filterRegion = (region: string) => {
    filters.value.region = region;
};

// 节点分类
const filteredNodeCards = computed(() => {
    const filteredNodes = nodeCards.value.filter((node) => {
        const matchUdp = filters.value.udp ? node.udp === 'true' : true;

        let matchNoPermission = true;
        if (userInfo?.usergroup) {
            matchNoPermission = filters.value.noPermission ? true : node.nodegroup === 'user';
        } else {
            matchNoPermission = filters.value.noPermission ? true : true;
        }

        const matchWeb = filters.value.web === 'all' || node.web === filters.value.web;
        const matchRegion =
            filters.value.region === 'all' ||
            (filters.value.region === 'china' && node.china === 'yes') ||
            (filters.value.region === 'overseas' &&
                (node.china === 'no' || node.area.includes('香港') || node.area.includes('台湾')));

        return matchUdp && matchNoPermission && matchWeb && matchRegion;
    });

    // 对节点进行排序，VIP 节点在前，免费节点在后
    return filteredNodes.sort((a, b) => {
        if (a.nodegroup === 'vip' && b.nodegroup !== 'vip') return -1;
        if (a.nodegroup !== 'vip' && b.nodegroup === 'vip') return 1;
        return 0;
    });
});

const NodeInfo = ref({
    id: 1, //节点ID
    area: '', //节点地区
    realIp: '', //节点IP
    udp: true, //是否允许UDP
    notes: '', //节点介绍
    ip: '', //节点域名
    coordinates: '', //节点经纬度
    fangyu: true, //节点是否有防御
    rport: '10000~65535', //节点端口范围
    nodegroup: 'user', //节点权限组
    china: 'yes', //节点是否走国内带宽
    web: 'no', //节点是否允许web
    ipv6: '', //节点IPV6
    toowhite: false, //节点建站是否需要过白
    name: '', //节点名
    state: '', //节点状态
    bandwidth_usage_percent: 0,
});

const handleNodeCardClick = async (card: NodeCard) => {
    if (card.nodegroup === 'vip' && userInfo?.usergroup === '免费用户') {
        message.warning('此节点为会员节点，您的权限不足');
        return;
    }
    selectNode.value = card.name;
    nodeListModal.value = false;
    nodeInfoModal.value = true;
    loadingTunnelInfo.value = true;
    try {
        const data = await api.v2.node.getNodeInfo(userInfo?.usertoken || '', card.name);
        Object.assign(NodeInfo.value, data.data);
    } catch (error) {
        message.error('节点详情获取失败: ' + (error as Error).message);
    } finally {
        loadingTunnelInfo.value = false;
    }
};

const markers = [
    { position: [102.22092, 31.90059], title: '我的位置' },
    { position: [116.407428, 39.91923], title: '节点位置' },
];

const handleTabChange = async (activeName: string) => {
    loadingNodeMap.value = true;
    if (activeName === '节点地图') {
        try {
            const response = await axios.get('https://api.uapis.cn/localaddr');
            const { latitude, longitude } = response.data;
            markers[0] = { position: [longitude, latitude], title: '我的位置' };
            const nodeCoordinates = NodeInfo.value.coordinates.split(',').map(Number);
            if (nodeCoordinates.length === 2 && !isNaN(nodeCoordinates[0]) && !isNaN(nodeCoordinates[1])) {
                markers[1] = { position: nodeCoordinates, title: '节点位置' };
            } else {
                console.error('节点位置无效');
            }
        } catch (error) {
            console.error('获取位置失败:', error);
        } finally {
            loadingNodeMap.value = false;
        }
    }
};

const nodeDetails = () => {
    nodeListModal.value = true; // 显示节点选择模态框
    tunnelInfoModal.value = false; // 取消显示创建隧道详情拟态框
    nodeInfoModal.value = false; // 取消显示节点详情模态框
};

const createATunnelUp = () => {
    tunnelInfoModal.value = false; // 取消显示创建隧道详情拟态框
    nodeInfoModal.value = true; // 显示节点详情模态框
};

const goToTheTunnelDetails = () => {
    nodeInfoModal.value = false; // 取消显示节点详情模态框
    tunnelInfoModal.value = true; // 显示创建隧道详情拟态框
    formData.node = NodeInfo.value.name;
    generateRandomPort();
    generateRandomTunnelName();
    subDomainData();
};

// 监听 filters 变化，并保存到本地存储
watch(
    filters,
    (newFilters) => {
        localStorage.setItem('nodeFilters', JSON.stringify(newFilters));
    },
    { deep: true }
);

// 定义接口
interface Status {
    type: string;
    label: string;
}

interface TunnelCard {
    id: number;
    name: string;
    localip: string;
    type: string;
    nport: number;
    node: string;
    state: string;
    uptime: string;
    today_traffic_in: number;
    today_traffic_out: number;
    cur_conns: number;
    ip: string;
    nodestate: string;
    status?: Status;
    tags?: string[];
    dorp: string;
    ap: string;
    encryption: string;
    compression: string;
}

// 创建响应式变量
const tunnelCards = ref<TunnelCard[] | null>(null);

// 异步函数获取数据
const fetchTunnelCards = async () => {
    loadingTunnel.value = true;
    try {
        const { data } = await api.v2.tunnel.getTunnelList(userInfo?.usertoken || '');

        // 判断 data 是否为空
        if (!data || data.length === 0) {
            loadingTunnel.value = false;
            tunnelCards.value = null;
        } else {
            // 映射数据并设置状态和标签
            tunnelCards.value = data.map((card) => {
                let status: Status = { type: 'error', label: '维护' };

                // 根据节点状态设置状态
                if (card.nodestate === 'online') {
                    status =
                        card.state === 'true' ? { type: 'success', label: '在线' } : { type: 'warning', label: '离线' };
                } else if (card.nodestate === 'offline') {
                    status = { type: 'error', label: '维护' };
                }

                // 设置 tags
                const tags = [card.node, `${card.localip}:${card.nport} - ${card.type}`];

                return { ...card, status, tags };
            });
        }
    } catch (error) {
        // 错误处理逻辑
        message.error('获取隧道列表失败: ' + (error as Error).message);
        loadingTunnel.value = false;
        tunnelCards.value = null;
        return;
    }
    loadingTunnel.value = false;
};

const copyToClipboard = (text: string) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            message.success('连接地址复制成功');
        })
        .catch((err) => {
            console.error('[隧道列表]复制连接地址失败:', err);
            message.error('连接地址复制失败');
        });
};
</script>

<style scoped>
.center-content {
    text-align: center;
}

.center-content > * {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.center-content n-row,
.center-content n-col {
    justify-content: center;
}

.mapDiv {
    width: 100%;
    height: 100%;
}
</style>
