import { h, Component } from 'vue';
import { RouterLink } from 'vue-router';
import { NIcon, MenuOption } from 'naive-ui';
import {
  StatsChartOutline,
  CloudDownloadOutline,
  ListOutline,
  DocumentsOutline,
  InformationCircleOutline,
  EllipsisHorizontalCircleOutline,
  BanOutline
} from '@vicons/ionicons5';

// 菜单图标渲染函数
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

// 菜单选项数组
export const menuOptions: MenuOption[] = [
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
    label: '其他信息',
    key: '其他信息',
    icon: renderIcon(EllipsisHorizontalCircleOutline),
    children: [
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '封禁列表' }
          },
          { default: () => '封禁列表' }
        ),
        key: '封禁列表',
        icon: renderIcon(BanOutline)
      },
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
];