import axiosInstance from '../axios/axiosInstance';
import { BaseResponse } from '../axios/axiosInstance';

interface AvailableDomain {
    id: number; // 编号
    domain: string; // 域名
    remarks: string | null; // 介绍
    icpFiling: boolean; // 是否有备案
}

interface AvailableDomainsResponse extends BaseResponse {
    data: AvailableDomain[]; // 可用域名列表
}

/**
 * 获取可用域名列表
 * @returns {Promise<AvailableDomainsResponse>} 包含可用域名列表的响应数据
 */
export const listAvailableDomains = async (): Promise<AvailableDomainsResponse> => {
    return axiosInstance.get('/list_available_domains');
};

/**
 * 创建免费二级域名
 * @param {Object} param 请求参数
 * @param {string} param.token 用户Token
 * @param {string} param.domain 主域名
 * @param {string} param.record 记录
 * @param {string} param.type 类型，仅允许A' | 'AAAA' | 'CNAME' | 'SRV
 * @param {string} param.target 解析的最终目标
 * @param {string} param.ttl TTL
 * @param {string} param.remarks 介绍
 * @returns {Promise<BaseResponse>} 包含创建结果的响应数据
 */
export const createFreeSubdomain = async (param: {
    token: string; // 用户Token
    domain: string; // 主域名
    record: string; // 记录
    type: string; // 类型，仅允许A' | 'AAAA' | 'CNAME' | 'SRV
    target: string; // 解析的最终目标
    ttl: '1分钟' | '2分钟' | '5分钟' | '10分钟' | '15分钟' | '30分钟' | '1小时' | '2小时' | '5小时' | '12小时' | '1天'; //TTL
    remarks: string; // 介绍
}): Promise<BaseResponse> => {
    return axiosInstance.post('/create_free_subdomain', param);
};

/**
 * 删除免费二级域名
 * @param {Object} param 请求参数
 * @param {string} param.token 用户Token
 * @param {string} param.domain 主域名
 * @param {string} param.record 记录
 * @returns {Promise<BaseResponse>} 包含删除结果的响应数据
 */
export const deleteFreeSubdomain = async (param: {
    token: string; // 用户Token
    domain: string; // 主域名
    record: string; // 记录
}): Promise<BaseResponse> => {
    return axiosInstance.post('/delete_free_subdomain', param);
};

/**
 * 修改免费二级域名
 * @param {Object} param 请求参数
 * @param {string} param.token 用户Token
 * @param {string} param.domain 主域名
 * @param {string} param.record 记录
 * @param {string} param.target 目标
 * @param {string} param.ttl TTL
 * @returns {Promise<BaseResponse>} 包含修改结果的响应数据
 */
export const updateFreeSubdomain = async (param: {
    token: string; // 用户Token
    domain: string; // 主域名
    record: string; // 记录
    target: string; // 目标
    ttl: '1分钟' | '2分钟' | '5分钟' | '10分钟' | '15分钟' | '30分钟' | '1小时' | '2小时' | '5小时' | '12小时' | '1天'; // TTL
    remarks: string; // 介绍
}): Promise<BaseResponse> => {
    return axiosInstance.post('/update_free_subdomain', param);
};

interface UserFreeSubdomain {
    id: number; // 编号
    userid: number; // 用户编号
    domain: string; // 主域名
    record: string; // 记录
    type: string; // 类型
    target: string; // 目标
    ttl: '1分钟' | '2分钟' | '5分钟' | '10分钟' | '15分钟' | '30分钟' | '1小时' | '2小时' | '5小时' | '12小时' | '1天'; // TTL
    remarks: string; // 介绍
}

interface GetUserFreeSubdomainsResponse extends BaseResponse {
    data: UserFreeSubdomain[]; // 用户免费二级域名列表
}

/**
 * 获取用户免费二级域名
 * @param {string} token 用户Token
 * @returns {Promise<GetUserFreeSubdomainsResponse>} 包含用户免费二级域名列表的响应数据
 */
export const getUserFreeSubdomains = async (token: string): Promise<GetUserFreeSubdomainsResponse> => {
    return axiosInstance.get('/get_user_free_subdomains', {
        params: { token },
    });
};
