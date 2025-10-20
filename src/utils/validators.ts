/**
 * 验证端口号是否在有效范围内
 */
export function validatePort(port: number, min: number = 1, max: number = 65535): boolean {
    return port >= min && port <= max;
}

/**
 * 验证域名格式
 */
export function validateDomain(domain: string): { valid: boolean; error?: string } {
    const trimmedDomain = domain.trim();
    
    if (!trimmedDomain) {
        return { valid: false, error: '请输入域名' };
    }
    
    const isIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(trimmedDomain);
    if (isIp) {
        return { valid: false, error: '域名不能是IP地址' };
    }
    
    const isFrpOne = trimmedDomain.endsWith('.frp.one');
    if (isFrpOne) {
        return { valid: false, error: '域名不能使用.frp.one后缀' };
    }
    
    const isValidDomain = /^(?:\*\.)?(?!-)(?:[a-z0-9-]{1,63}\.)+(?:xn--)?[a-z0-9]{2,63}$/.test(trimmedDomain);
    if (!isValidDomain) {
        return { valid: false, error: '域名格式不正确' };
    }
    
    return { valid: true };
}

/**
 * 验证隧道表单数据
 */
export interface TunnelFormData {
    name: string;
    localip: string;
    node: string;
    type: string;
    nport: string;
    dorp: number | string;
    domainNameLabel?: string;
    domain?: string;
    choose?: string;
    recordValue?: string;
}

export interface NodeInfo {
    rport: string;
    china: string;
    ip: string;
}

export function validateTunnelForm(
    formData: TunnelFormData,
    nodeInfo: NodeInfo
): { valid: boolean; error?: string } {
    // 验证内网端口
    const nport = Number(formData.nport);
    if (nport < 1 || nport > 65535) {
        return { valid: false, error: '内网端口必须在 1 到 65535 之间' };
    }
    
    // TCP/UDP 隧道验证
    if (formData.type === 'TCP' || formData.type === 'UDP') {
        const minPort = parseInt(nodeInfo.rport.split('-')[0]) || 10000;
        const maxPort = parseInt(nodeInfo.rport.split('-')[1]) || 65535;
        const dorp = Number(formData.dorp);
        
        if (dorp < minPort || dorp > maxPort) {
            return { valid: false, error: `外网端口必须在 ${minPort} 到 ${maxPort} 之间` };
        }
    } 
    // HTTP/HTTPS 隧道验证
    else {
        if (!formData.domainNameLabel) {
            return { valid: false, error: '请选择域名类型' };
        }
        
        if (formData.domainNameLabel === '免费域名') {
            if (!formData.choose || !formData.recordValue) {
                return { valid: false, error: '请选择并填写免费域名' };
            }
        } else if (formData.domainNameLabel === '自定义') {
            if (!formData.domain) {
                return { valid: false, error: '请输入自定义域名' };
            }
            const domainValidation = validateDomain(formData.domain);
            if (!domainValidation.valid) {
                return domainValidation;
            }
        }
    }
    
    return { valid: true };
}

