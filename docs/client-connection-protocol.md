# TCP / QUIC 连接配置

用户可在“配置文件”页和隧道列表的“配置代码”弹窗选择 TCP 或 QUIC。默认 TCP。选择的是 frpc 到节点的传输协议，不改变隧道本身的 TCP/UDP/HTTP/HTTPS 类型。

下载 TOML 与 Windows/Linux 快捷启动命令使用相同的协议。切换节点、隧道或协议后会清除旧配置；过期请求不能覆盖当前选择，生成失败也不会提供旧配置下载。

## 数据库与部署顺序

API 新增读取和保存 `node.quic_port`，必须先升级数据库，再部署 API 和 Panel。应用不自动执行 DDL，本次未向正式数据库写入。

按当前旧版 API 的读写方式，新增可空字段兼容旧版：现有写入指定了列名，原 TCP 配置不会改变。增量 SQL 保留为手动操作，不随构建、启动或部署自动执行。可以先更新仓库和构建代码，完成手动 DDL 后再将运行中的 API 切换至新版。

在目标数据库先检查字段是否存在：

```sql
SHOW COLUMNS FROM node LIKE 'quic_port';
```

仅当字段不存在时执行一次：

```sql
ALTER TABLE node
    ADD COLUMN quic_port SMALLINT UNSIGNED NULL DEFAULT NULL
    COMMENT 'QUIC UDP连接端口，NULL表示未启用'
    AFTER port;
```

这是新增可空字段，不回填或修改现有 TCP 端口及隧道。DDL 的锁与执行时间取决于数据库版本、引擎和表规模，应按正式库的变更流程执行，不能将新增字段理解为所有环境都完全无锁。

已有节点默认 `NULL`，继续只使用 TCP。对现有在线节点，先在 frps 配置中启用 QUIC 监听、放行该 UDP 端口并部署生效，再在节点新增/编辑表单填写相同 QUIC 端口向用户开放。新节点可在离线状态填入端口并按生成配置部署。保存数据库端口不会自动改变节点监听。

## 端口规则

- TCP 和 QUIC 可以用同一个数字端口，分别监听 TCP / UDP，例如 `7000/TCP` 与 `7000/UDP`。
- KCP 和 QUIC 都使用 UDP，不能占用同一地址的同一 UDP 端口；也应避开节点上其他 UDP 服务。
- 示例：TCP 7000、KCP 7000/UDP、QUIC 7002/UDP。管理员可以按实际部署使用其他端口。
- 节点管理生成的 frps INI 会写入已配置的 `quic_bind_port`；QUIC 与 TCP 使用同一数字端口时省略 KCP 监听，避免两者争用 UDP 端口。
- 现有远程一键部署脚本不支持 QUIC 配置。已配置 QUIC 的节点仅提供配置文件部署入口，不生成会遗漏 QUIC 的一键命令。

如使用现代 frps TOML，按实际端口配置：

```toml
bindPort = 7000
kcpBindPort = 7000
quicBindPort = 7002
```

若选择 TCP 与 QUIC 同号，保留 `bindPort` 与 `quicBindPort`，不要同时将 `kcpBindPort` 设为该端口。元数据的 `quic_port` 应与 `quicBindPort` 一致。

## API 契约

- `GET /v2/tunnel_config?node=...&protocol=tcp|quic&tunnel_names=...`：`protocol` 可省略，默认 TCP，返回 TOML 字符串格式不变。
- `POST /v2/cfg`，`action=getcfg`：原有 `protocol` 参数与下载入口共用协议和端口解析；既有 kcp/websocket/wss 调用保持兼容。
- QUIC 使用 `node.quic_port`，其他原有协议继续使用 `node.port`。QUIC 未配置/非法时返回错误，不回退到 TCP 端口。
- 管理员新增/编辑请求字段为 `quic_port`，允许 1～65535 的整数；显式 `null`/空字符串清空禁用，更新时省略字段保留旧值。
- 节点对象响应字段为 `quicPort`；公共节点列表增加布尔 `quic` 能力标记，前端据此禁用未启用节点的 QUIC 选项。此标记代表管理员声明的配置，不是实时 UDP 连通性探测。

快捷启动示例（需要支持 `--protocol` 的 ChmlFrp 客户端）：

```sh
frpc.exe -u <token> -p 1,2 --protocol quic
chmod +x frpc && ./frpc -u <token> -p 1,2 --protocol quic
```
