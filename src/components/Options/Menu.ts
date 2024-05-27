import { h, Component } from 'vue';
import { RouterLink } from 'vue-router';
import { NIcon, MenuOption } from 'naive-ui';
import {
  StatsChartOutline as StatsChartIcon,
  DocumentTextOutline as DocumentTextIcon,
  CloudDownloadOutline as CloudDownloadIcon,
  GridOutline as GridIcon,
  ListOutline as ListIcon,
  HomeOutline as HomeIcon,
  PersonCircleOutline,
  DocumentsOutline,
  ExtensionPuzzleOutline,
  InformationCircleOutline,
  EllipsisHorizontalCircleOutline,
  LinkOutline,
  PawOutline,
  PrismOutline,
  PricetagOutline,
  PlanetOutline
} from '@vicons/ionicons5';

// 菜单图标渲染函数
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

// 菜单选项数组
export const menuOptions: MenuOption[] = [
  {
    label: () => h(
      RouterLink,
      {
        to: { name: '首页' }
      },
      { default: () => '首页' }
    ),
    key: '首页',
    icon: renderIcon(HomeIcon)
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
    icon: renderIcon(ListIcon),
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
        icon: renderIcon(GridIcon)
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
        icon: renderIcon(DocumentTextIcon)
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
        icon: renderIcon(StatsChartIcon)
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
        icon: renderIcon(CloudDownloadIcon)
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
      },
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '消费记录' }
          },
          { default: () => '消费记录' }
        ),
        key: '消费记录',
        icon: renderIcon(PawOutline)
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
          RouterLink,
          {
            to: { name: '帮助文档' }
          },
          { default: () => '帮助文档' }
        ),
        key: '帮助文档',
        icon: renderIcon(DocumentsOutline)
      },
    ]
  },
];
