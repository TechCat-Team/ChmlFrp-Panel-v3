import { h, Component } from 'vue';
import { RouterLink } from 'vue-router';
import { NIcon } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import {
  StatsChartOutline,
  DocumentTextOutline,
  CloudDownloadOutline,
  GridOutline,
  ListOutline,
  HomeOutline,
  PersonCircleOutline,
  DocumentsOutline,
  ExtensionPuzzleOutline,
  InformationCircleOutline,
  EllipsisHorizontalCircleOutline,
  LinkOutline,
  PrismOutline,
  PricetagOutline,
  PlanetOutline,
  KeyOutline,
  PieChartOutline,
  BrowsersOutline,
  GiftOutline,
  PeopleOutline,
  ConstructOutline,
  ListCircleOutline,
  ServerOutline,
  BagHandleOutline
} from '@vicons/ionicons5';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

// 菜单图标渲染函数
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

// 基本菜单选项
export const computedMenuOptionsUser = computed(() => [{
  label: () => h(
    RouterLink,
    {
      to: { name: '首页' }
    },
    { default: () => '首页' }
  ),
  key: '首页',
  icon: renderIcon(HomeOutline)
},
{
  type: 'divider',
  props: {
    style: { marginLeft: '32px' }
  }
},
{
  label: () => h(
    RouterLink,
    {
      to: { name: '个人资料' }
    },
    { default: () => '个人资料' }
  ),
  key: '个人资料',
  icon: renderIcon(PersonCircleOutline)
},
{
  label: '隧道管理',
  key: '隧道管理',
  icon: renderIcon(ListOutline),
  children: [
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '隧道列表' }
        },
        { default: () => '隧道列表' }
      ),
      key: '隧道列表',
      icon: renderIcon(GridOutline)
    },
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '配置文件' }
        },
        { default: () => '配置文件' }
      ),
      key: '配置文件',
      icon: renderIcon(DocumentTextOutline)
    },
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '节点状态' }
        },
        { default: () => '节点状态' }
      ),
      key: '节点状态',
      icon: renderIcon(StatsChartOutline)
    },
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '软件下载' }
        },
        { default: () => '软件下载' }
      ),
      key: '软件下载',
      icon: renderIcon(CloudDownloadOutline)
    }
  ]
},
{
  label: '扩展功能',
  key: '扩展功能',
  icon: renderIcon(ExtensionPuzzleOutline),
  children: [
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '免费域名' }
        },
        { default: () => '免费域名' }
      ),
      key: '免费域名',
      icon: renderIcon(LinkOutline)
    },
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '免费SSL' }
        },
        { default: () => '免费SSL' }
      ),
      key: '免费SSL',
      icon: renderIcon(KeyOutline)
    },
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '应用市场' }
        },
        { default: () => '应用市场' }
      ),
      key: '应用市场',
      icon: renderIcon(BagHandleOutline)
    }
  ]
},
{
  label: '增值中心',
  key: '增值中心',
  icon: renderIcon(PrismOutline),
  children: [
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '积分充值' }
        },
        { default: () => '积分充值' }
      ),
      key: '积分充值',
      icon: renderIcon(PlanetOutline)
    },
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '积分商城' }
        },
        { default: () => '积分商城' }
      ),
      key: '积分商城',
      icon: renderIcon(PricetagOutline)
    }
  ]
},
{
  label: '其他信息',
  key: '其他信息',
  icon: renderIcon(EllipsisHorizontalCircleOutline),
  children: [
    {
      label: () => h(
        RouterLink,
        {
          to: { name: '关于面板' }
        },
        { default: () => '关于面板' }
      ),
      key: '关于面板',
      icon: renderIcon(InformationCircleOutline)
    },
    {
      label: () => h(
        'a',
        {
          href: 'https://docs.chcat.cn',
          target: '_blank',
          rel: 'noopenner noreferrer'
        },
        { default: () => '帮助文档' }
      ),
      key: '帮助文档',
      icon: renderIcon(DocumentsOutline)
    },
  ]
}
]);

// 管理员菜单选项
export const computedMenuOptionsAdmin = computed(() => [
  {
    type: 'divider',
    props: {
      style: { marginLeft: '32px' }
    }
  },
  {
    label: '管理面板',
    key: '管理面板',
    icon: renderIcon(BrowsersOutline),
    children: [
      {
        type: 'group',
        label: '面板',
        key: 'people',
        children: [
          {
            label: () => h(
              RouterLink,
              {
                to: { name: '系统总览' }
              },
              { default: () => '系统总览' }
            ),
            key: '系统总览',
            icon: renderIcon(PieChartOutline)
          },
          {
            label: () => h(
              RouterLink,
              {
                to: { name: '面板管理' }
              },
              { default: () => '面板管理' }
            ),
            key: '面板管理',
            icon: renderIcon(ConstructOutline)
          },
        ]
      },
      {
        type: 'group',
        label: '映射',
        key: 'people',
        children: [
          {
            label: () => h(
              RouterLink,
              {
                to: { name: '节点管理' }
              },
              { default: () => '节点管理' }
            ),
            key: '节点管理',
            icon: renderIcon(ServerOutline)
          },
          {
            label: () => h(
              RouterLink,
              {
                to: { name: '用户管理' }
              },
              { default: () => '用户管理' }
            ),
            key: '用户管理',
            icon: renderIcon(PeopleOutline)
          },
          {
            label: () => h(
              RouterLink,
              {
                to: { name: '管理隧道' }
              },
              { default: () => '管理隧道' }
            ),
            key: '管理隧道',
            icon: renderIcon(ListCircleOutline)
          },
          {
            label: () => h(
              RouterLink,
              {
                to: { name: '兑换码管理' }
              },
              { default: () => '兑换码管理' }
            ),
            key: '兑换码管理',
            icon: renderIcon(GiftOutline)
          }
        ]
      },
      {
        type: 'group',
        label: '扩展',
        key: 'people',
        children: [
          {
            label: () => h(
              RouterLink,
              {
                to: { name: '免费域名管理' }
              },
              { default: () => '免费域名管理' }
            ),
            key: '免费域名管理',
            icon: renderIcon(LinkOutline)
          },
          {
            label: () => h(
              RouterLink,
              {
                to: { name: '免费SSL管理' }
              },
              { default: () => '免费SSL管理' }
            ),
            key: '免费SSL管理',
            icon: renderIcon(KeyOutline)
          }
        ]
      }
    ]
  }
]);

// 访客菜单选项
export const computedMenuOptionsGuest = computed(() => [
  {
    label: '隧道管理',
    key: '隧道管理',
    icon: renderIcon(ListOutline),
    children: [
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '节点状态' }
          },
          { default: () => '节点状态' }
        ),
        key: '节点状态',
        icon: renderIcon(StatsChartOutline)
      },
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '软件下载' }
          },
          { default: () => '软件下载' }
        ),
        key: '软件下载',
        icon: renderIcon(CloudDownloadOutline)
      }
    ]
  },
  {
    label: '扩展功能',
    key: '扩展功能',
    icon: renderIcon(ExtensionPuzzleOutline),
    children: [
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '应用市场' }
          },
          { default: () => '应用市场' }
        ),
        key: '应用市场',
        icon: renderIcon(BagHandleOutline)
      }
    ]
  },
  {
    label: '其他信息',
    key: '其他信息',
    icon: renderIcon(EllipsisHorizontalCircleOutline),
    children: [
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '关于面板' }
          },
          { default: () => '关于面板' }
        ),
        key: '关于面板',
        icon: renderIcon(InformationCircleOutline)
      },
      {
        label: () => h(
          'a',
          {
            href: 'https://docs.chcat.cn',
            target: '_blank',
            rel: 'noopenner noreferrer'
          },
          { default: () => '帮助文档' }
        ),
        key: '帮助文档',
        icon: renderIcon(DocumentsOutline)
      },
    ]
  }
]);

export const computedMenuOptions = computed(() => {
  if (userInfo.value?.usergroup === '管理员') {
    return [...computedMenuOptionsUser.value, ...computedMenuOptionsAdmin.value];
  } else if (!userInfo.value) {
    return computedMenuOptionsGuest.value;
  } else {
    return computedMenuOptionsUser.value;
  }
});