import axiosInstance from '../axios/axiosInstance';
import { BaseResponse } from '../axios/axiosInstance';

// 登录
interface LoginResponse extends BaseResponse {
    data: {
        id: number;
        username: string;
        password: string | null;
        userimg: string;
        qq: string;
        email: string;
        usertoken: string;
        usergroup: string;
        bandwidth: number;
        tunnel: number;
        realname: string;
        login_attempts: number;
        integral: number;
        term: string;
        scgm: string;
        regtime: string;
        t_token: string | null;
        realname_count: number;
        total_download: number;
        total_upload: number;
        tunnelCount: number;
        totalCurConns: number;
    };
}

/**
 * 登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<LoginResponse>} 登录响应
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    return axiosInstance.post('/login', {
        username,
        password,
    });
};

/**
 * 实名认证
 * @param {string} name - 姓名
 * @param {string} idcard - 身份证号码
 * @returns {Promise<BaseResponse>} 实名认证结果
 */
export const realnameVerify = async (name: string, idcard: string): Promise<BaseResponse> => {
    return axiosInstance.post('/realname_verify', {
        name,
        idcard,
    });
};

/**
 * 发送邮箱验证码
 * @param {string} type - 验证码类型
 * @param {string} mail - 邮箱地址
 * @param {string} lot_number - 验证码批次号
 * @param {string} captcha_output - 验证码输出
 * @param {string} pass_token - 验证通过的令牌
 * @param {string} gen_time - 验证码生成时间
 * @returns {Promise<BaseResponse>} 邮箱验证码响应
 */
export const sendMailCode = async (
    type: string,
    mail: string,
    lot_number: string,
    captcha_output: string,
    pass_token: string,
    gen_time: string
): Promise<BaseResponse> => {
    return axiosInstance.post('/sendmailcode', {
        type,
        mail,
        lot_number,
        captcha_output,
        pass_token,
        gen_time,
    });
};

/**
 * 邮箱验证码登录
 * @param {string} mail - 邮箱地址
 * @param {number} code - 6位数字验证码
 * @returns {Promise<LoginResponse>} 登录响应
 */
export const loginByEmailCode = async (mail: string, code: number): Promise<LoginResponse> => {
    return axiosInstance.get('/login_by_email_code', {
        params: { mail, code },
    });
};

/**
 * 注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} mail - 邮箱地址
 * @param {string} qq - QQ号
 * @param {string} code - 验证码
 * @returns {Promise<BaseResponse>} 注册响应
 */
export const register = async (
    username: string,
    password: string,
    mail: string,
    qq: string,
    code: string
): Promise<BaseResponse> => {
    return axiosInstance.get('/register', {
        params: { username, password, mail, qq, code },
    });
};

// 获取用户信息
interface UserInfoResponse extends BaseResponse {
    data: {
        id: number;
        username: string;
        password: string | null;
        userimg: string;
        qq: string;
        email: string;
        usertoken: string;
        usergroup: string;
        bandwidth: number;
        tunnel: number;
        realname: string;
        login_attempts: number;
        integral: number;
        term: string;
        scgm: string | null;
        regtime: string;
        t_token: string | null;
        realname_count: number;
        total_download: number;
        total_upload: number;
        tunnelCount: number;
        totalCurConns: number;
    };
}

/**
 * 获取用户信息
 * @returns {Promise<UserInfoResponse>} 用户信息响应
 */
export const getUserInfo = async (): Promise<UserInfoResponse> => {
    return axiosInstance.get('/userinfo');
};

/**
 * 重置令牌
 * @returns {Promise<BaseResponse>} 重置令牌响应
 */
export const resetToken = async (): Promise<BaseResponse> => {
    return axiosInstance.get('/retoken');
};

/**
 * 用户签到
 * @param {string} lot_number - 验证码批次号
 * @param {string} captcha_output - 验证码输出
 * @param {string} pass_token - 验证通过的令牌
 * @param {string} gen_time - 验证码生成时间
 * @returns {Promise<BaseResponse>} 签到响应
 */
export const signIn = async (
    lot_number: string,
    captcha_output: string,
    pass_token: string,
    gen_time: string
): Promise<BaseResponse> => {
    return axiosInstance.post('/qiandao', {
        lot_number,
        captcha_output,
        pass_token,
        gen_time,
    });
};

// 会员升级响应数据
export interface UpgradePackageData {
    success?: boolean;
    message?: string;
    xhjf: number;
    package: string;
    tunnel: number;
    bandwidth: number;
}

interface UpgradePackageResponse extends BaseResponse {
    data: UpgradePackageData;
}

/**
 * 升级会员套餐
 * @param {string} packageName - 目标会员类型
 * @returns {Promise<UpgradePackageResponse>} 升级响应
 */
export const upgradePackage = (packageName: string): Promise<UpgradePackageResponse> => {
    return axiosInstance.post('/upgrade_package', {
        package: packageName,
    });
};

// 会员购买响应数据
export interface PurchasePackageData {
    package: string;
    term_months: number;
    cost: number;
    bandwidth: number;
    tunnel: number;
    daoqi: string;
    remaining_integral?: number;
}

interface PurchasePackageResponse extends BaseResponse {
    data: PurchasePackageData;
}

/**
 * 会员购买
 * @param {string} packageName - 目标套餐
 * @param {number} termMonths - 购买周期（月数）
 * @returns {Promise<PurchasePackageResponse>} 购买响应
 */
export const buyPackage = (packageName: string, termMonths: number): Promise<PurchasePackageResponse> => {
    return axiosInstance.post('/buy_package', {
        package: packageName,
        term: termMonths,
    });
};

// 签到信息数据接口
export interface QiandaoInfoData {
    last_sign_in_time: string;
    total_points: number;
    total_sign_ins: number;
    count_of_matching_records: number;
    is_signed_in_today: boolean;
}

// 获取签到信息响应接口
interface GetQiandaoInfoResponse extends BaseResponse {
    data: QiandaoInfoData;
}

/**
 * 获取签到信息
 * @returns {Promise<GetQiandaoInfoResponse>} 签到信息响应
 */
export const getQiandaoInfo = async (): Promise<GetQiandaoInfoResponse> => {
    return axiosInstance.get('/qiandao_info');
};

/**
 * 重置密码
 * @param {string} original_password - 原密码
 * @param {string} new_password - 新密码
 * @returns {Promise<BaseResponse>} 重置密码响应
 */
export const resetPassword = async (
    original_password: string,
    new_password: string
): Promise<BaseResponse> => {
    return axiosInstance.get('/reset_password', {
        params: { original_password, new_password },
    });
};

/**
 * 修改用户名
 * @param {string} new_username - 新用户名
 * @returns {Promise<BaseResponse>} 修改用户名响应
 */
export const updateUserName = async (new_username: string): Promise<BaseResponse> => {
    return axiosInstance.get('/update_username', {
        params: { new_username },
    });
};

/**
 * 修改QQ
 * @param {string} new_qq - 新QQ号
 * @returns {Promise<BaseResponse>} 修改QQ响应
 */
export const updateQQ = async (new_qq: string): Promise<BaseResponse> => {
    return axiosInstance.get('/update_qq', {
        params: { new_qq },
    });
};

/**
 * 重置头像
 * @param {string} new_userimg - 新头像URL
 * @returns {Promise<BaseResponse>} 重置头像响应
 */
export const updateUserImage = async (new_userimg: string): Promise<BaseResponse> => {
    return axiosInstance.get('/update_userimg', {
        params: { new_userimg },
    });
};

// 获取消息
interface GetMessageResponse extends BaseResponse {
    data: Array<{
        id: number;
        userid: number;
        content: string;
        quanti: string;
        time: string;
    }> | null;
}

/**
 * 获取消息
 * @returns {Promise<GetMessageResponse>} 消息响应
 */
export const getMessages = async (): Promise<GetMessageResponse> => {
    return axiosInstance.get('/messages');
};

/**
 * 重置邮箱
 * @param {string} new_email - 新邮箱地址
 * @param {string} email_code - 邮箱验证码
 * @param {string} new_email_code - 新邮箱验证码
 * @returns {Promise<BaseResponse>} 重置邮箱响应
 */
export const resetEmail = async (
    new_email: string,
    email_code: string,
    new_email_code: string
): Promise<BaseResponse> => {
    return axiosInstance.get('/reset_email', {
        params: { new_email, email_code, new_email_code },
    });
};

/**
 *
 * @param email_code 邮箱验证码
 * @returns {Promise<BaseResponse>} 删除账户响应
 */
export const deleteAccount = async (email_code: string): Promise<BaseResponse> => {
    return axiosInstance.get('/delete_account', {
        params: { email_code },
    });
};

/**
 * 重置密码通过邮箱
 * @param {string} email - 用户邮箱
 * @param {string} new_password - 新密码
 * @param {string} code - 验证码
 * @returns {Promise<BaseResponse>} 重置密码响应
 */
export const resetPasswordByEmail = async (
    email: string,
    new_password: string,
    code: string
): Promise<BaseResponse> => {
    return axiosInstance.post('/email_reset_password', {
        email,
        new_password,
        code,
    });
};

// 下线用户所有节点响应接口
interface OfflineUserNodesResponse extends BaseResponse {
    data: {
        totalNodes: number;
        successCount: number;
        failCount: number;
        results: Record<string, string>;
    };
}

/**
 * 下线用户所有节点
 * @returns {Promise<OfflineUserNodesResponse>} 下线用户所有节点响应
 */
export const offlineUserNodes = async (): Promise<OfflineUserNodesResponse> => {
    return axiosInstance.get('/offline_user_nodes');
};

// 日志查询参数接口
export interface GetUserLogsParams {
    page?: number;
    size?: number;
    action?: string;
    category?: string;
    start_time?: string;
    end_time?: string;
}

// 日志项接口
export interface LogItem {
    id: number;
    user_id: number;
    action: string;
    category: string;
    ip_address: string;
    address?: string;
    user_agent: string;
    status: string;
    resource_name: string | null;
    extra_data: any | null;
    timestamp: string;
}

// 日志查询响应接口
interface GetUserLogsResponse extends BaseResponse {
    data: {
        logs: LogItem[];
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}

/**
 * 查询用户日志
 * @param {GetUserLogsParams} params - 查询参数
 * @returns {Promise<GetUserLogsResponse>} 日志查询响应
 */
export const getUserLogs = async (params: GetUserLogsParams): Promise<GetUserLogsResponse> => {
    return axiosInstance.get('/log/query', {
        params,
    });
};

// 系统消息接口
export interface SystemMessage {
    id: number;
    title: string;
    contentMd: string;
    priority: number; // 1-普通，2-重要，3-紧急
    targetUsers: string | null; // JSON字符串或null
    publishTime: string;
    createdAt: string;
}

// 获取系统消息列表参数
export interface GetSystemMessagesParams {
    page?: number;
    size?: number;
    priority?: number; // 1-普通，2-重要，3-紧急
}

// 获取系统消息列表响应
interface GetSystemMessagesResponse extends BaseResponse {
    data: {
        messages: SystemMessage[];
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}

/**
 * 获取系统消息列表
 * @param {GetSystemMessagesParams} params - 查询参数
 * @returns {Promise<GetSystemMessagesResponse>} 系统消息列表响应
 */
export const getSystemMessages = async (params: GetSystemMessagesParams = {}): Promise<GetSystemMessagesResponse> => {
    return axiosInstance.get('/message/list', {
        params,
    });
};

// 获取系统消息详情响应
interface GetSystemMessageDetailResponse extends BaseResponse {
    data: SystemMessage;
}

/**
 * 获取系统消息详情
 * @param {number} id - 消息ID
 * @returns {Promise<GetSystemMessageDetailResponse>} 系统消息详情响应
 */
export const getSystemMessageDetail = async (id: number): Promise<GetSystemMessageDetailResponse> => {
    return axiosInstance.get('/message/detail', {
        params: { id },
    });
};

// 搜索系统消息参数
export interface SearchSystemMessagesParams {
    keyword: string;
    page?: number;
    size?: number;
}

// 搜索系统消息响应
interface SearchSystemMessagesResponse extends BaseResponse {
    data: {
        messages: SystemMessage[];
        total: number;
        page: number;
        size: number;
        totalPages: number;
        keyword: string;
    };
}

/**
 * 搜索系统消息
 * @param {SearchSystemMessagesParams} params - 搜索参数
 * @returns {Promise<SearchSystemMessagesResponse>} 搜索响应
 */
export const searchSystemMessages = async (
    params: SearchSystemMessagesParams
): Promise<SearchSystemMessagesResponse> => {
    return axiosInstance.get('/message/search', {
        params,
    });
};

// 流量数据项接口
export interface FlowDataItem {
    time: string;
    traffic_in: number | string;
    traffic_out: number | string;
}

// 获取近七日流量数据响应接口
interface GetFlowLast7daysResponse extends BaseResponse {
    data: FlowDataItem[];
}

/**
 * 获取近七日流量数据
 * @returns {Promise<GetFlowLast7daysResponse>} 近七日流量数据响应
 */
export const getFlowLast7days = async (): Promise<GetFlowLast7daysResponse> => {
    return axiosInstance.get('/flow_last_7_days');
};
