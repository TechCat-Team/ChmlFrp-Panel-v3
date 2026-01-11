<div align="center">

# ChmlFrp Panel v3

**ChmlFrp官方面板前端项目**

![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite)
![Naive UI](https://img.shields.io/badge/Naive%20UI-2.43-18A058?style=flat-square)
![License](https://img.shields.io/badge/License-Apache%20License%202.0-blue?style=flat-square)

[快速开始](#快速开始) • [技术栈](#技术栈) • [代码规范](#代码规范)

---

</div>

## 项目简介

ChmlFrp-Panel-v3 是一个基于 Vue 3 + TypeScript 构建的现代化内网穿透管理面板前端项目

> 本项目前端完全开源，为确保安全，后端代码不开源。

---

## 目录

- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [脚本说明](#脚本说明)
- [代码规范](#代码规范)
- [自定义配置](#自定义配置)

---

## 技术栈

<div align="center">

| 类别 | 技术 |
|:---:|:---|
| **框架** | Vue 3 + TypeScript |
| **构建工具** | Vite 6 |
| **UI 组件库** | Naive UI |
| **状态管理** | Pinia |
| **路由** | Vue Router 4 |
| **HTTP 客户端** | Axios |
| **图表库** | ECharts |
| **样式预处理** | SCSS |
| **代码格式化** | Prettier |
| **包管理器** | pnpm |

</div>

---

## 环境要求

<div align="center">

| 环境 | 版本要求 |
|:---:|:---|
| **Node.js** | >= 18.0.0 |
| **pnpm** | >= 10.11.0 |

</div>

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

> 开发服务器将在 `http://localhost:5174` 启动，并自动在浏览器打开

### 构建生产版本

```bash
pnpm build
```

> 构建产物将输出到 `dist` 目录

### 预览生产构建

```bash
pnpm preview
```

---

## 脚本说明

<div align="center">

| 命令 | 说明 | 使用场景 |
|:---:|:---|:---|
| `pnpm dev` | 启动开发服务器 | 日常开发 |
| `pnpm build` | 构建生产版本 | 部署前构建 |
| `pnpm preview` | 预览生产构建 | 构建后预览 |
| `pnpm format` | 格式化代码 | 代码提交前 |

</div>

---

## 代码规范

### Prettier 配置

本项目使用 [Prettier](https://prettier.io/) 进行代码格式化，配置规则如下：

<div align="center">

| 规则 | 配置值 |
|:---:|:---|
| **行宽** | 120 字符 |
| **分号** | 始终添加 |
| **缩进** | 4 个空格 |
| **引号** | 单引号 |
| **尾随逗号** | ES5 有效处添加 |

</div>

### VS Code 配置

推荐安装以下扩展：

- **Prettier**: `esbenp.prettier-vscode`
- **Volar**: `Vue.volar` (Vue 3 官方扩展)
- **ESLint**: `dbaeumer.vscode-eslint`

> 在 VS Code 设置中启用 `editor.formatOnSave` 以自动格式化代码

### 格式化代码

```bash
# 格式化所有代码
pnpm format
```

### ESLint

项目使用 ESLint 进行代码检查，配置了：

- Vue 3 推荐规则
- TypeScript 推荐规则
- 自定义规则覆盖

---

## 自定义配置

更多配置选项请参考：

- [Vite 配置文档](https://vitejs.dev/config/)
- [Vue CLI 配置参考](https://cli.vuejs.org/config/)

---

## 许可证

本项目采用 [Apache License 2.0](./LICENSE) 许可证。

---

<div align="center">

**如果这个项目对你有帮助，麻烦给一个 Star！**


</div>