/** 节点管理 - 类型定义 */

/** 节点列表项 */
export interface Node {
    id: number;
    name: string;
    ip: string;
    realIp: string;
    port: number;
    quicPort?: number | null;
    adminPort: string;
    speed: string;
    area: string;
    state: string;
    nodegroup: string;
    china: string;
    web: string;
    udp: string;
    fangyu: string;
    notes: string;
    rport: string;
    auth: string;
    nodetoken: string;
    apitoken: string;
    coordinates: string;
    ipv6: string;
    toowhite: boolean;
}

/** 新增节点表单 */
export interface CreateForm {
    name: string;
    domain_prefix: string;
    real_IP: string;
    port: number | null;
    quic_port: number | null;
    adminport: number | null;
    speed: string;
    area: string;
    nodegroup: string;
    china: string;
    web: string;
    udp: string;
    fangyu: string;
    notes: string;
    rport: string;
    auth_username: string;
    auth_password: string;
    ipv6: string;
}

/** 编辑节点表单 */
export interface EditForm {
    name: string;
    ip: string;
    real_IP: string;
    port: number | null;
    quic_port: number | null;
    adminport: number | null;
    speed: string;
    area: string;
    nodegroup: string;
    china: string;
    web: string;
    udp: string;
    fangyu: string;
    notes: string;
    rport: string;
    auth: string;
    auth_username: string;
    auth_password: string;
    nodetoken: string;
    apitoken: string;
    coordinates: string;
    ipv6: string;
}

/** 节点请求体公共字段 */
interface NodePayloadBase {
    name: string;
    real_IP: string;
    port: number | null;
    quic_port: number | null;
    adminport: number | null;
    speed: string;
    area: string;
    nodegroup: string;
    china: string;
    web: string;
    udp: string;
    fangyu: string;
    notes: string;
    rport: string;
    auth: string;
    ipv6: string;
}

/** 新增节点请求体 */
export interface CreateNodePayload extends NodePayloadBase {
    domain_prefix: string;
}

/** 更新节点请求体 */
export interface UpdateNodePayload extends NodePayloadBase {
    ip: string;
    nodetoken: string;
    apitoken: string;
    coordinates: string;
}
