# 节点违规闭环：实施与部署

当前实现包含跨境 VPN/代理协议检测，以及可选的 HTTP 响应图片内容检测。图片副本压缩后提交模型服务，连续风险分达到 0.75 进入色情内容待审核案件，并按本节点持久化 URL 记录阻断后续同 URL 访问（403）；图片保持流式转发，hash 仅用于识别去重；主动爬站、截图和端到端 HTTPS 解密不在当前范围内。

## 实现结构

| 仓库 | 模块 | 职责 |
| --- | --- | --- |
| API | `service/violation/workflow/WorkflowProtocol` | 版本化事件、决策、同步与回执协议 |
| API | `WorkflowRepository` | SQL、生成主键及事务锁顺序 |
| API | `ViolationWorkflowService` | 事件幂等、案件归并、审核版本、持久执行目标与回执 |
| API | `BanNotificationService` / `BanNotificationWorker` | 事务内私人站内信、权益快照、事务外邮件投递与状态核对 |
| API | `RestrictionService` | 用户/隧道限制叠加、统一准入及历史身份保留 |
| API | `ViolationEvidenceUploadService` | 证据预留、对象上传、幂等确认，网络调用与数据库事务分开 |
| frp | `server/contentcheck` | 有界 HTTP 图片采样、JPEG 压缩、持久分类缓存、URL 拦截和模型 API 适配 |
| frp | `server/violation` | 本地事务队列、隔离恢复、后台投递、限制同步与注册互斥 |
| frp | `server/proxy/active_connections` | 关闭现有转发连接，防止仅关监听端口仍可继续传输 |
| 面板 | `utils/idempotentRequest` | 超时及刷新后复用原请求 ID 和绝对到期时间 |
| 面板 | `WorkflowPanel` / 审核表单 | 检测事实、决策范围/期限/原因、节点进度与异常队列 |

通过数据库中的限制与节点目标版本保存待执行状态，节点定期拉取并确认，承担持久 outbox 的职责。无需消息队列；节点离线、API 重启或回执丢失后仍可继续收敛。

## 部署顺序

本轮数据库升级 SQL 已按要求从仓库移除。代码不自动建表或迁移；部署到其他数据库前，需单独准备并审核对应环境的增量变更。测试目录中的 `WorkflowTestSchema` 仅用于隔离 H2 测试，不是正式库迁移脚本。

新版服务依赖以下工作流表：`violation_case`、`violation_event`、`violation_decision`、`violation_restriction`、`violation_clock`、`violation_node_state`、`violation_request`、`violation_event_evidence`、`violation_tunnel_identity`、`violation_notification`。现有违规、证据、封禁、申诉、站内信表也需保留，封禁表须包含 `prev_usergroup`、`prev_tunnel`、`prev_bandwidth`、`prev_term` 权益快照字段及来源案件唯一索引。事务涉及的表须使用 InnoDB。

1. 确认目标数据库已完成本轮结构更新，保留数据库备份。不要重置已有执行版本、删除幂等记录或补发历史通知。
2. 部署 API。先确认已有账号、隧道配置接口工作正常。新准入逻辑依赖上述表，不能先部署 API 再补表。
3. 部署面板。审核接口现在要求 `request_id`、`expected_version`、`scope`，旧面板无法进行新审核。节点旧 multipart 上报要求 `meta.event_id`，无图片不再要求启用 S3。
4. 更新少量 frps 并开启以下配置，验证检测、临时隔离、审核和回执后逐批扩展。

```toml
apiEnable = true
apiBaseurl = "https://your-api.example/v2"
apiToken = "<该节点已有的 API token>"
vpnDetectEnable = true

[violationReport]
enable = true
statePath = "/var/lib/frps/violation.db"
isolationSeconds = 1800
syncIntervalSeconds = 15
maxPendingEvents = 10000
```

`statePath` 必须持久化、归运行用户所有，单节点独占；容器部署时挂载数据卷。禁止多实例共享同一文件，禁止把一个节点的状态文件与另一个节点的身份混用。Bolt 文件有进程锁，正常打开超时会使启动失败。

默认处置：明确命中并满足现有跨境规则时隔离当前隧道 30 分钟；启发式可疑命中只上报。正式账号封禁由管理侧决定。临时隔离到期可恢复注册，待审案件继续保留；正式限制按其自身期限执行。

## 幂等与一致性约定

- 同一检测事件的 `event_id` 与内容先落本地事务，再发送。API 以 `(node_id,event_id)` 唯一约束和规范化内容摘要去重；重复请求返回原案件，不重复计数，内容冲突返回 409。
- 一个用户的案件创建和审核通过数据库用户行锁串行，多个 API 实例共享同一数据库时同样有效。重复连接命中会归入同一活动案件；节点同级重复通知按一分钟抑制，`event_count` 表示接收的独立事件数，不是网络包数。
- 管理决策以 `(admin_id,request_id)` 唯一，案件版本决定并发胜者。审核完成后不能直接覆盖；解除封禁是新的有审计的决策。
- 决策、封禁记录、限制、版本和必要审计在同一事务提交。前端收到成功意味着决策已持久化，节点执行进度仍独立展示。
- 限制是账号权益的叠加层，不改会员等级、带宽或到期日。解除其中一条不影响其他限制；历史封禁组仍受兼容检查约束。
- 节点仅接受更新版本或同版本同摘要的完整限制快照。先持久保存，再完成连接关闭，最后回执。旧快照与旧回执不能覆盖新决定。
- 注册提交与限制更新共用节点内的准入互斥，避免“刚检查可用就被封禁，却漏关刚注册隧道”的竞态。
- 临时隔离按事件周期解除，管理侧不会清空一个用户的全部本地隔离；旧周期延迟上报不会重新打开已处理案件。
- API 在隧道校验成功时保留 ID、节点与用户身份，不保存 token；隧道删除或迁移后，原节点排队中的事件仍可归属。

## 证据与申诉

普通协议检测事件是 JSON，不需要图片、不依赖对象存储。图片可在事件被接受后独立上传：

```text
POST /v2/node/violation/events/{event_id}/evidence/{evidence_id}
Authorization: Bearer <node-api-token>
multipart: file=<原加密密文>, key_id=<SPKI DER SHA-256>, content_type=image/png
```

支持 PNG、JPEG、WebP 元数据，默认每文件 10 MiB、每事件 20 张。上传前加密一次，重试保持相同证据 ID、密文、密钥 ID 和类型。预留记录与对象键固定；上传失败可重试，成功重放不重复生成证据。事件与证据状态分别展示。

公钥接口返回 `key_id`，浏览器可保存多版本私钥并自动匹配历史证据。API 和对象存储不持有私钥。VPN 检测发送结构化依据；启用 imageDetection 后，HTTP 图片检测会上传实际送检 JPEG 的加密证据。详细配置和覆盖范围见 frp 仓库的 `doc/content-image-detection.md`。

申诉仍支持可选图片。提交和审核都使用幂等请求 ID，同一封禁同时只允许一条待审申诉。申诉通过只解除对应限制；面板会提示仍有其他限制。历史申诉 multipart 图片保留兼容事务路径，S3 调用有超时并在明确回滚时清理对象。

## 账号封禁通知与权益

管理员在违规审查中选择“账号”并封禁后，会拒绝该账号的配置生成、隧道创建/修改和节点准入；已运行的连接由已升级节点同步限制后关闭。用户仍可登录查看通知和提交申诉。选择“隧道”只限制对应隧道，不发送“同步封禁账户”的通知。管理侧普通用户资料编辑中直接修改历史“封禁”权限组，不属于本工作流的带案件审核，仍走既有兼容逻辑。

每次新封禁保存 `prev_usergroup`、`prev_tunnel`、`prev_bandwidth`、`prev_term` 作为不可变审计快照，并在管理详情展示。新封禁为独立限制，不改原会员组；解封撤销对应限制，保留期间自然到期或正常调整后的权益，不用旧快照覆盖当前数据。历史直接改组的封禁才使用原有快照恢复逻辑；缺少历史快照时不猜测权益。

账号封禁的站内信与封禁记录、限制、审核审计在同一事务写入；失败时全部回滚。消息仅发给该账户，详情和搜索均检查收件人，个人消息列表直接读库，避免多个 API 实例的本地缓存掩盖新消息。邮件正文与站内信沿用同一份模板和当时的权限组，永久会员显示“永久超级会员”等完整名称；用户输入只作为正文文本显示。默认申诉渠道为“控制台 → 用户中心 → 封禁记录 → 申诉”，可通过以下配置替换：

```properties
violation.notification.appeal-channel=控制台 → 用户中心 → 封禁记录 → 申诉
violation.notification.mail-from=chmlfrp@mail.chcat.cn
violation.notification.worker-enabled=true
violation.notification.poll-ms=10000
```

邮件发送至封禁时绑定邮箱，空邮箱和以 `@local.invalid` 结尾的占位邮箱记录为 `skipped`，仍发站内信。不回补历史封禁，避免部署时突然群发。邮件服务沿用 Spring Mail 配置，连接/读/写超时默认 10/30/30 秒，任务使用独立调度线程。邮件地址、正文和违规 URL 不写入投递日志。

`violation_notification` 对 `(decision_id,channel)` 唯一。重复审核只返回原回执，不再生成消息；邮件发送前通过条件更新领取任务，多进程不会同时发送同一任务。管理详情显示站内信/邮件状态。邮件 `delivered` 表示 SMTP 接受提交，不保证最终进入收件箱。

SMTP 不提供跨数据库的严格“恰好一次”投递。明确的认证、准备或连接建立失败会退避重试，最多 8 次；发送途中断线/超时、进程中断等无法确认服务端是否接收的情况标为 `unknown`，不自动重发。五分钟过期领取记录同样转为待核对，固定 `Message-ID: <chmlfrp-ban-{通知ID}@mail.chcat.cn>` 可用于查邮件服务日志。不要把所有 `unknown` 批量重置为待发送；确认服务端未接收且原发送进程已停止后，才由运维对指定 ID 执行并保存操作审计：

```sql
-- 替换 123 为已核对的通知 ID；affected rows 必须为 1。
UPDATE violation_notification
SET status='pending', claim_token=NULL, lease_until=NULL,
    next_attempt_at=UNIX_TIMESTAMP(NOW(3))*1000, updated_at=UNIX_TIMESTAMP(NOW(3))*1000,
    attempts=0, last_error=''
WHERE id=123 AND channel='email' AND status IN ('unknown','failed');
```

出现 `failed` 或 `unknown` 应处理邮件配置/服务日志后再按上述单条恢复。不能承诺通过自动重试同时消除所有丢信和重复信；接入支持幂等键的邮件供应商时，可替换 `BanMailSender` 传输边界来增强这一保证。

## 运行维护与边界

- 默认每 15 秒同步限制；面板打开详情后每 10 秒刷新进度。离线或未升级的节点显示未同步，不能视为已执行。
- API 不可达时，节点继续执行本地有效限制；新注册仍依赖现有中央校验，校验失败会拒绝。已建立的正常连接无法立即获知离线期间的新管理决策，恢复后自动同步。
- 节点时钟与 API 相差超过五分钟时，拒绝确认新快照并显示执行错误，应配置时间同步。
- 网络/5xx 退避重试，429 遵守 `Retry-After`；401/403 保留并重试，同时告警。其他不可重试 4xx 保留为异常事件，不静默删除。
- 队列达到上限时拒绝新增持久事件并明确记录错误；明确命中仍在内存临时隔离并关闭隧道。此时处于降级状态，不能保证重启后保存该次新事件，应立即处理磁盘或队列问题。
- 面板逐节点显示待发数量、异常数量、同步时间和执行错误；超过 15 分钟仍未上报的事件给出提示。节点日志包含 event_id 与重试次数，便于定位。
- 不要删除未确认队列、事件唯一键、决策回执或幂等记录。当前保留幂等历史，不自动清理；后续归档必须保留去重墓碑并覆盖最长重试周期。
- 当前限制同步使用全量快照，写决定和同步使用短暂版本锁，事件投递不占用该锁。快照响应上限 32 MiB；上线前按实际节点数、限制数和事件速率压测。超大规模可沿协议边界扩展为分片快照，不能直接截断后当作完整状态应用。
- 回滚检测或面板时保留本地状态与中央限制。存在新限制时，不能回滚中央准入检查到会绕过限制的旧版本；数据库表也不能直接删除。

## 验证命令

```sh
# API 仓库：SQL/事务/并发、HTTP 协议、证据重试、申诉和隔离组装测试
mvn -q test

# frp 仓库：磁盘恢复、响应丢失、乱序与并发准入
go test -race ./server/violation ./server/proxy ./server ./pkg/config/v1/...

# 面板仓库（Node 24+ 原生 TypeScript 测试）
node --test tests/*.test.mjs
node node_modules/typescript/bin/tsc --noEmit --ignoreDeprecations 6.0
node node_modules/vite/bin/vite.js build
```

API 工作流测试使用独立 H2 MySQL 模式数据库，并不连接 `.env` 中的数据库。原有根启动测试已改为隔离的工作流装配测试，避免启动自动发现、定时任务及支付服务。MySQL 生产迁移、真实节点和真实对象存储仍需在部署环境完成灰度验证。
